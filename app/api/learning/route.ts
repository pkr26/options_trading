import { identity, json, failure } from "@/lib/api";
import { profiles, progress, notes, attempts } from "@/db/schema";
import { eq } from "drizzle-orm";
export async function GET() {
  try {
    const {user,db}=await identity();
    const [p,done,n,a] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId,user.userId)),
      db.select().from(progress).where(eq(progress.userId,user.userId)),
      db.select().from(notes).where(eq(notes.userId,user.userId)),
      db.select().from(attempts).where(eq(attempts.userId,user.userId)),
    ]);
    return json({user:{name:user.fullName ?? user.displayName.split('@')[0],email:user.email},profile:p[0]?{dailyMinutes:p[0].dailyMinutes,timezone:p[0].timezone}:{dailyMinutes:15,timezone:"America/Phoenix"},progress:done.map(({userId,...r})=>r),notes:n.map(({userId,...r})=>r),attempts:a.map(({userId,...r})=>r)});
  } catch(e) { return failure(e); }
}
