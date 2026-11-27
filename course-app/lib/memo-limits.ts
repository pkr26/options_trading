import type { GraduateAnswer } from "./graduate-types.ts";

export const MEMO_FIELD_LIMIT = 6000;
export const MEMO_REQUIRED_MIN = 20;
// JSON may use two six-byte surrogate escapes per astral code point in all five fields.
export const MEMO_BODY_BYTES = 384 * 1024;
const requiredFields = ["recommendation", "analysis", "risks"] as const;
type InitialMemo = Pick<GraduateAnswer, (typeof requiredFields)[number]>;

export function memoLength(text: string): number {
  return Array.from(text).length;
}

export function incompleteMemoFields(answers: InitialMemo) {
  return requiredFields.filter(field => memoLength(answers[field].trim()) < MEMO_REQUIRED_MIN);
}

export function memoReady(answers: InitialMemo): boolean {
  return incompleteMemoFields(answers).length === 0;
}
