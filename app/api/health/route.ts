import {env} from "cloudflare:workers";
import {COURSE_VERSION} from "@/lib/learning";
export async function GET() {
  try {
    if(!env.DB) throw new Error("No DB");
    await env.DB.prepare("SELECT 1 FROM progress LIMIT 1").all();
    return Response.json({status:"ok",database:"ready",courseVersion:COURSE_VERSION},{headers:{"Cache-Control":"no-store"}});
  } catch {return Response.json({status:"unavailable"},{status:503});}
}
