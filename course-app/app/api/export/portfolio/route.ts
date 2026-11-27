import { failure, identity } from "@/lib/api";
import { portfolioStream } from "@/lib/portfolio-export";

export async function GET(request: Request) {
  try {
    const { user, db } = await identity();
    const stream = await portfolioStream(db.$client, user.userId, request.signal);
    return new Response(stream, { headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="options-academy-portfolio.json"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) { return failure(error); }
}
