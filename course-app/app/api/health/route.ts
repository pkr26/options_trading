import { env } from "cloudflare:workers";
import { databaseReady } from "@/db/readiness";
import { COURSE_VERSION } from "@/lib/learning";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    if (env.DB && await databaseReady(env.DB)) {
      return Response.json({ status: "ok", database: "ready", courseVersion: COURSE_VERSION }, { headers });
    }
  } catch {
    // The public readiness response never includes database details.
  }
  return Response.json({ status: "unavailable" }, { status: 503, headers });
}
