import type { CompetencyId, GraduateAnswer, GraduatePracticeAttempt, GraduatePracticeQuestion, GraduateSubmission } from "./graduate-types";

export type TeachingEvidence = { id: string; kind: "tutor" | "feedback" | "review" | "pilot" | "artifact"; entityId: string; revision: number; payload: unknown; createdAt: string };
export type TutorRecommendation = { moduleId: number; skill: CompetencyId; reason: string; priority: number; action: "remediate" | "retain" | "prepare" | "extend" };
export type TutorPlan = { generatedAt: string; recommendations: TutorRecommendation[]; summary: string };
export type TutorTurn = { prompt: string; answer: number; correct: boolean; assisted: boolean; explanation: string; expected: number; at: string };
export type TutorSession = {
  id: string; moduleId: number; sequence: number; questionIndex: number; revision: number;
  phase: "question" | "retry" | "transfer" | "complete";
  hintLevel: number; question: GraduatePracticeQuestion | null; turns: TutorTurn[];
  teaching: string; nextStep: string; createdAt: string;
};
export type WritingCriterion = { dimension: string; status: "evidence_found" | "needs_work" | "review_needed"; evidence: string; feedback: string; nextQuestion: string };
export type WritingFeedback = { submissionId: string; moduleId: number; version: string; summary: string; criteria: WritingCriterion[]; alerts: { claim: string; explanation: string }[]; numericalChecks: { label: string; status: "consistent" | "contradiction" | "not_supplied"; explanation: string }[]; nextActions: string[]; createdAt: string };
export type RecordedReview = { submissionId: string; reviewerName: string; reviewerRole: "self" | "reported_external"; decision: "revise" | "accepted"; criteria: { dimension: string; score: number; evidence: string; feedback: string }[]; challenge: string; response: string; reviewedAt: string };
export type PilotStage = "baseline" | "day7" | "day30";
export type PilotResult = { stage: PilotStage; completedAt: string; score: number; total: number; minutes: number; clarity: number; feedback: GraduatePracticeAttempt["feedback"]; confidence?: number; assistance?: "none" | "notes" | "tutor" | "other" | "prefer_not_to_say" };
export type PilotEnrollment = { id: string; moduleIds: number[]; version: string; enrolledAt: string; baselineAt: string | null; seed: number; results: PilotResult[]; questionVersion?: string; blueprintSignature?: string; consentAt?: string; priorExperience?: "new" | "basic" | "experienced" | "prefer_not_to_say"; priorExposure?: { practiceSets: number; submittedMemos: number; tutorSessions: number } };
export type PilotView = { enrollment: PilotEnrollment | null; revision: number; schedule: { stage: PilotStage; dueAt: string | null; status: "available" | "scheduled" | "completed" | "awaiting_baseline" | "missed" }[]; questions?: GraduatePracticeQuestion[]; stage?: PilotStage };
export type TeachingState = { events: TeachingEvidence[]; plan: TutorPlan; pilot: PilotView };
export type TeachingContext = { submissions: GraduateSubmission[]; practice: GraduatePracticeAttempt[]; feedback?: WritingFeedback[] };
export type TutorTransitionInput = { action: "answer" | "hint" | "explain"; answer?: number };
export type EvaluateWriting = (moduleId: number, answers: GraduateAnswer, submissionId?: string, now?: string) => WritingFeedback;
