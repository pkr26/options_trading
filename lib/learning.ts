export function reviewDate(reviewCount: number, recalled: boolean, now = new Date()): string {
  if (!Number.isInteger(reviewCount) || reviewCount < 0 || typeof recalled !== "boolean" || !Number.isFinite(now.getTime())) throw new Error("Invalid review schedule inputs.");
  const days = recalled ? [1,3,7,14,30][Math.min(reviewCount,4)] : 1;
  return new Date(now.getTime() + days * 86400000).toISOString();
}
export function gradeQuestions<T extends {id:string;correctIndex:number;explanation:string}>(questions:T[], answers:Record<string,number>) {
  if(!answers || typeof answers !== "object" || Array.isArray(answers) || Object.keys(answers).length !== questions.length || questions.some(q => !Object.hasOwn(answers,q.id) || !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] > 3)) throw new Error("Answer every question once.");
  const feedback = questions.map(q => ({...q, selected:answers[q.id], correct:answers[q.id]===q.correctIndex}));
  const score=feedback.filter(q=>q.correct).length;
  return {score,total:questions.length,passed:score===questions.length,feedback};
}
export const COURSE_VERSION = "2026-11-14.2";
export const QUESTION_VERSION = "beginner-checkpoints-2026-11-14-v1";
