import {identity,json,failure} from "@/lib/api";
import {profiles} from "@/db/schema";
import {z} from "zod";
const input=z.object({dailyMinutes:z.number().int().min(5).max(60),timezone:z.string().max(80).refine(v=>{try{Intl.DateTimeFormat("en-US",{timeZone:v});return true;}catch{return false;}})});
export async function PUT(request:Request) {
 try {
  const {user,db}=await identity(request); const body=input.parse(await request.json());
  await db.insert(profiles).values({userId:user.userId,...body}).onConflictDoUpdate({target:profiles.userId,set:body});
  return json({ok:true});
 } catch(e) {return failure(e);}
}
