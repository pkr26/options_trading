import { z } from "zod";

export const graduateModuleId = z.coerce.number().int().min(1).max(26);
export const graduateAnswers = z.object({
  recommendation: z.string().max(6000), analysis: z.string().max(6000),
  risks: z.string().max(6000), revision: z.string().max(6000), reflection: z.string().max(6000),
}).strict();
export const graduateSubmissionInput = z.object({
  moduleId: z.number().int().min(1).max(26),
  expectedRevision: z.number().int().min(0).max(1_000_000),
  kind: z.enum(["draft", "submission"]), answers: graduateAnswers,
}).strict().superRefine((value, context) => {
  if (value.kind !== "submission") return;
  for (const field of ["recommendation", "analysis", "risks"] as const) {
    if (value.answers[field].trim().length < 20) context.addIssue({code: "custom", path: ["answers", field], message: "Explain your initial decision, analysis, and risks before submitting."});
  }
});
export const graduatePracticeInput = z.object({
  moduleId: z.number().int().min(1).max(26),
  sequence: z.number().int().min(0).max(1_000_000),
  answers: z.record(z.string().max(100), z.number().finite()).refine(value => Object.keys(value).length === 3),
}).strict();
