import { identity,json,failure } from "@/lib/api";
import {notes} from "@/db/schema";
import {z} from "zod";
const input=z.object({lessonId:z.number().int().min(1).max(64),content:z.string().max(10000)});
export async function PUT(request:Request) {
  try {
    const {user,db}=await identity(request);
    const body=input.parse(await request.json());
    const updatedAt=new Date().toISOString();
    await db.insert(notes).values({userId:user.userId,...body,updatedAt}).onConflictDoUpdate({target:[notes.userId,notes.lessonId],set:{content:body.content,updatedAt}});
    return json({ok:true,updatedAt});
  } catch(e) {return failure(e);}
}
