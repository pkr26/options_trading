import { identity, json, failure, withoutUserId } from "@/lib/api";
import { profiles, progress, notes, attempts } from "@/db/schema";
import { practicalSummary } from "@/lib/practical-summary";
import { eq } from "drizzle-orm";
export async function GET() {
  try {
    const {user,db}=await identity();
    const [p,done,n,a,practical] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId,user.userId)),
      db.select().from(progress).where(eq(progress.userId,user.userId)),
      db.select().from(notes).where(eq(notes.userId,user.userId)),
      db.select().from(attempts).where(eq(attempts.userId,user.userId)),
      practicalSummary(db,user.userId),
    ]);
    return json({practical,user:{id:user.userId,name:user.fullName ?? user.displayName.split('@')[0],email:user.email},profile:p[0]?{dailyMinutes:p[0].dailyMinutes,timezone:p[0].timezone}:{dailyMinutes:15,timezone:"America/Phoenix"},progress:done.map(withoutUserId),notes:n.map(withoutUserId),attempts:a.map(withoutUserId)});
  } catch(e) { return failure(e); }
}
