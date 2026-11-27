import { z } from "zod";
import { incompleteMemoFields, MEMO_FIELD_LIMIT } from "./memo-limits.ts";

export const graduateModuleId = z.coerce.number().int().min(1).max(26);
const memoField = z.string().max(MEMO_FIELD_LIMIT);
export const graduateAnswers = z.object({
  recommendation: memoField, analysis: memoField, risks: memoField, revision: memoField, reflection: memoField,
}).strict();
export const graduateSubmissionInput = z.object({
  moduleId: z.number().int().min(1).max(26),
  expectedRevision: z.number().int().min(0).max(1_000_000),
  kind: z.enum(["draft", "submission"]), answers: graduateAnswers,
}).strict().superRefine((value, context) => {
  if (value.kind !== "submission") return;
  for (const field of incompleteMemoFields(value.answers)) {
    context.addIssue({code: "custom", path: ["answers", field], message: "Explain your initial decision, analysis, and risks before submitting."});
  }
});
export const graduatePracticeInput = z.object({
  moduleId: z.number().int().min(1).max(26),
  sequence: z.number().int().min(0).max(1_000_000),
  answers: z.record(z.string().max(100), z.number().finite()).refine(value => Object.keys(value).length === 3),
}).strict();
