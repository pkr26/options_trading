import { identity, json, failure, ApiError, readJsonBody } from "@/lib/api";
import { progress, attempts } from "@/db/schema";
import { and,eq } from "drizzle-orm";
import { z } from "zod";
import { reviewDate } from "@/lib/learning";
const input=z.discriminatedUnion("action",[
  z.object({lessonId:z.number().int().min(1).max(64),action:z.literal("complete")}),
  z.object({lessonId:z.number().int().min(1).max(64),action:z.literal("review"),recalled:z.boolean(),reviewRevision:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)}),
]);
export async function POST(request:Request) {
  try {
    const {user,db}=await identity(request);
    const body=input.parse(await readJsonBody(request));
    const where=and(eq(progress.userId,user.userId),eq(progress.lessonId,body.lessonId));
    const old=(await db.select().from(progress).where(where))[0];
    if(body.action==="review") {
      if(!old) throw new ApiError("Complete this lesson before reviewing it.");
      if(body.reviewRevision!==old.reviewRevision) throw new ApiError("This review has already changed. Refresh your learning record before trying again.",409);
      const count=body.recalled?old.reviewCount+1:0;
      const updated=await db.update(progress).set({reviewCount:count,nextReviewAt:reviewDate(count,body.recalled),reviewRevision:old.reviewRevision+1})
        .where(and(where,eq(progress.reviewRevision,body.reviewRevision))).returning({lessonId:progress.lessonId});
      if(!updated.length) throw new ApiError("This review has already changed. Refresh your learning record before trying again.",409);
    } else if(!old) {
      if(body.lessonId>1) {
        const previous=await db.select().from(progress).where(and(eq(progress.userId,user.userId),eq(progress.lessonId,body.lessonId-1)));
        if(!previous.length) throw new ApiError("Finish the previous lesson first. You can still preview this one.",409);
      }
      if(body.lessonId>8 && (body.lessonId-1)%8===0) {
        const passed=await db.select().from(attempts).where(and(eq(attempts.userId,user.userId),eq(attempts.moduleId,Math.floor((body.lessonId-1)/8)),eq(attempts.passed,true)));
        if(!passed.length) throw new ApiError("Pass the previous module checkpoint before starting this module.",409);
      }
      const now=new Date();
      await db.insert(progress).values({userId:user.userId,lessonId:body.lessonId,completedAt:now.toISOString(),nextReviewAt:reviewDate(0,true,now),reviewCount:0}).onConflictDoNothing();
    }
    return json({ok:true});
  } catch(e) {return failure(e);}
}
