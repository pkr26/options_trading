import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
import { ZodError } from "zod";
export class ApiError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function identity(request?: Request) {
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) throw new ApiError("This request must come from your learning app.", 403);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError("Send a JSON request.", 415);
    if (Number(request.headers.get("content-length") ?? 0) > 25000) throw new ApiError("This entry is too large.", 413);
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
