import {env} from "cloudflare:workers";
export async function GET() {
  try {
    if(!env.DB) throw new Error("No DB");
    await env.DB.prepare("SELECT 1 FROM progress LIMIT 1").all();
    return Response.json({status:"ok",database:"ready",courseVersion:"2026-11-14"},{headers:{"Cache-Control":"no-store"}});
  } catch {return Response.json({status:"unavailable"},{status:503});}
}
