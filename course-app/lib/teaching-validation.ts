import { z } from "zod";

const uuid=z.string().uuid();
const revision=z.number().int().min(0).max(1_000_000);
const id=z.number().int().min(1).max(26);
const numericAnswers=z.record(z.string().max(100),z.number().finite());
export const tutorInput=z.discriminatedUnion("action",[
  z.object({action:z.literal("start"),moduleId:id.optional()}).strict(),
  z.object({action:z.literal("answer"),sessionId:uuid,questionPrompt:z.string().max(2000).optional(),expectedRevision:revision,answer:z.number().finite().min(-1e12).max(1e12)}).strict(),
  z.object({action:z.literal("hint"),sessionId:uuid,questionPrompt:z.string().max(2000).optional(),expectedRevision:revision}).strict(),
  z.object({action:z.literal("explain"),sessionId:uuid,questionPrompt:z.string().max(2000).optional(),expectedRevision:revision}).strict(),
]);
export const feedbackInput=z.object({submissionId:uuid}).strict();
export const reviewInput=z.object({
  submissionId:uuid,reviewerName:z.string().trim().min(2).max(120),
  reviewerRole:z.enum(["self","reported_external"]),decision:z.enum(["revise","accepted"]),
  criteria:z.array(z.object({dimension:z.string().trim().min(1).max(160),score:z.number().int().min(0).max(3),evidence:z.string().trim().min(5).max(1200),feedback:z.string().trim().min(15).max(2000)}).strict()).min(3).max(8),
  challenge:z.string().trim().min(20).max(3000),response:z.string().trim().min(20).max(3000),reviewedAt:z.string().datetime(),
}).strict();
export const pilotInput=z.discriminatedUnion("action",[
  z.object({action:z.literal("enroll"),moduleIds:z.array(id).length(3).refine(ids=>new Set(ids).size===3),consent:z.literal(true),priorExperience:z.enum(["new","basic","experienced","prefer_not_to_say"])}).strict(),
  z.object({action:z.literal("submit"),stage:z.enum(["baseline","day7","day30"]),expectedRevision:revision,answers:numericAnswers,minutes:z.number().positive().max(1000),clarity:z.number().int().min(1).max(5),confidence:z.number().finite().min(0).max(100),assistance:z.enum(["none","notes","tutor","other","prefer_not_to_say"])}).strict(),
]);
export const artifactInput=z.object({artifactId:uuid.optional(),expectedRevision:revision,kind:z.enum(["protocol","data_audit","model","execution","stress","defense"]),title:z.string().trim().min(4).max(180),body:z.string().trim().min(20).max(12000),sourceUrl:z.union([z.literal(""),z.string().url().max(2000).refine(url=>new URL(url).protocol==="https:")]).optional()}).strict();
