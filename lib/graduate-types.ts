export const competencyIds = ["contracts", "valuation", "execution", "risk", "research", "communication"] as const;
export type CompetencyId = typeof competencyIds[number];
export type GraduateModule = {
  id: number;
  title: string;
  stage: string;
  prerequisites: number[];
  competencies: CompetencyId[];
  duration: string;
  objective: string;
  sourceFile: string;
  sections: { id: string; title: string; body: string }[];
  caseStudy: {
    title: string; brief: string; exhibits: string; decisionPrompt: string;
    update: string; defense: string[]; debrief: string;
    rubric: { dimension: string; excellent: string }[];
    samples: { level: string; body: string }[];
  };
  assignment: { prompt: string; deliverables: string[] };
  reviewQuestions: string[];
  sources: { title: string; url: string }[];
};
export type GraduateAnswer = { recommendation: string; analysis: string; risks: string; revision: string; reflection: string };
export type GraduateSubmission = {
  id: string; moduleId: number; revision: number; kind: "draft" | "submission";
  answers: GraduateAnswer; createdAt: string; contentVersion: string;
};
export type GraduatePracticeQuestion = { id: string; skill: CompetencyId; prompt: string; unit: string; hint: string };
export type GraduatePracticeFeedback = GraduatePracticeQuestion & { answer: number; expected: number; correct: boolean; explanation: string };
export type GraduatePracticeAttempt = {
  id: string; moduleId: number; sequence: number; score: number; total: number;
  createdAt: string; feedback: GraduatePracticeFeedback[];
};
export type GraduateState = { submissions: GraduateSubmission[]; practice: GraduatePracticeAttempt[] };
