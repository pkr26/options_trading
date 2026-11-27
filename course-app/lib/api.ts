import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { ZodError } from "zod";
export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
// A 10,000-code-unit note fits even when every character is JSON-escaped.
// This is a wire-byte budget; the individual schemas also limit their fields.
export const MAX_JSON_BYTES = 64 * 1024;

function bodyLimitError(maxBytes: number) {
  return new ApiError(`This entry is too large. The request limit is ${maxBytes / 1024} KiB.`, 413);
}
function checkDeclaredSize(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) throw bodyLimitError(maxBytes);
}

export async function readJsonBody(request: Request, maxBytes = MAX_JSON_BYTES): Promise<unknown> {
  checkDeclaredSize(request, maxBytes);
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("Send a JSON request body.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw bodyLimitError(maxBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(body); }
  catch { throw new ApiError("Send valid UTF-8 JSON."); }
  return JSON.parse(text);
}

/** Strip the trusted internal owner field without leaking it to exports. */
export function withoutUserId<T extends { userId: string }>(row: T): Omit<T, "userId"> {
  const { userId: owner, ...publicRow } = row;
  void owner;
  return publicRow;
}
export async function identity(request?: Request, maxBytes = MAX_JSON_BYTES) {
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) throw new ApiError("This request must come from your learning app.", 403);
    if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new ApiError("Send a JSON request.", 415);
    checkDeclaredSize(request, maxBytes);
  }
  const user = await getChatGPTUser();
  if (!user) throw new ApiError("Sign in to save your learning.", 401);
  return { user, db: getDb() };
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({error:error.message}, error.status);
  if (error instanceof ZodError || error instanceof SyntaxError) return json({error:"Check the fields and try again."},400);
  console.error("Learning API failed", error instanceof Error ? error.message : "Unknown error");
  return json({error:"Your changes could not be saved. Please try again."},500);
}
