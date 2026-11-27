import { z } from "zod";
import { getPracticalForm, gradePractical } from "./practical-cases.ts";
import type { PracticalCaseId, PracticalStage } from "./practical-cases.ts";

const caseIds = ["A", "B", "C", "D"] as const;
const transferDelay = 7 * 24 * 60 * 60 * 1000;
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export const practicalInput = z.object({
  id: z.enum(caseIds),
  stage: z.enum(["initial", "transfer"]),
  action: z.enum(["draft", "submit"]),
  expectedOwnerId: z.string().min(1).optional(),
  expectedRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1),
  answers: z.record(z.string().min(1).max(80), z.string().max(80)),
  reasoning: z.string().max(4000),
  assistance: z.enum(["none", "help"]),
}).strict();

type PracticalInput = z.infer<typeof practicalInput>;
type PracticalForm = ReturnType<typeof getPracticalForm>;
type Checks = ReturnType<typeof gradePractical>;

export type PracticalDraft = Pick<PracticalInput, "stage" | "answers" | "reasoning" | "assistance">;
export type PracticalAttempt = Omit<PracticalDraft, "answers"> & {
  answers: Record<string, number>;
  form: PracticalForm;
  checks: Checks;
  attemptType: "first" | "correction";
  independent: boolean;
  allCorrect: boolean;
  createdAt: string;
};
export type PracticalCaseState = {
  id: PracticalCaseId;
  revision: number;
  forms: { initial: PracticalForm; transfer: PracticalForm | null };
  draft: PracticalDraft | null;
  drafts: Partial<Record<PracticalStage, PracticalDraft>>;
  attempts: PracticalAttempt[];
  dueAt: string | null;
};
export type PracticalState = { signedIn: boolean; ownerId?: string; initialSolutionsSeen: boolean; cases: PracticalCaseState[] };

type PracticalEvent =
  | (PracticalDraft & { action: "draft"; form: PracticalForm })
  | (Omit<PracticalAttempt, "createdAt"> & { action: "submit" });
export type PracticalRow = {
  entityId: string; revision: number; createdAt: string; payload: PracticalEvent;
};
export class PracticalError extends Error {
  status: 400 | 409;
  constructor(message: string, status: 400 | 409 = 400) {
    super(message);
    this.status = status;
  }
}

/** Rows include all submissions and the latest event per case/stage, in ascending revision order. */
export function projectPracticalState(rows: PracticalRow[], signedIn: boolean, now = Date.now(), initialSolutionsSeen = false): PracticalState {
  const cases = caseIds.map((id): PracticalCaseState => {
    const state: PracticalCaseState = {
      id, revision: 0, forms: { initial: getPracticalForm(id, "initial"), transfer: null },
      draft: null, drafts: {}, attempts: [], dueAt: null,
    };
    if (!signedIn) return state;

    const pending = new Map<PracticalStage, PracticalDraft>();
    for (const row of rows) {
      if (row.entityId !== id) continue;
      state.revision = row.revision;
      if (row.payload.action === "draft") {
        const { stage, answers, reasoning, assistance } = row.payload;
        // Reinsert to keep the last edited, still-pending stage at the end.
        pending.delete(stage);
        pending.set(stage, {
          stage, answers, reasoning,
          assistance: stage === "initial" && initialSolutionsSeen ? "help" : assistance,
        });
      } else {
        const { action, ...saved } = row.payload;
        void action;
        const attempt = { ...saved, createdAt: row.createdAt };
        state.attempts.push(attempt);
        pending.delete(attempt.stage);
        if (attempt.stage === "initial" && !state.dueAt) {
          state.dueAt = new Date(Date.parse(row.createdAt) + transferDelay).toISOString();
        }
      }
    }
    state.drafts = Object.fromEntries(pending);
    state.draft = [...pending.values()].at(-1) ?? null;
    if (state.dueAt && Date.parse(state.dueAt) <= now) state.forms.transfer = getPracticalForm(id, "transfer");
    return state;
  });
  return { signedIn, initialSolutionsSeen: signedIn && initialSolutionsSeen, cases };
}

export function practicalEvent(input: PracticalInput, state: PracticalCaseState): PracticalEvent {
  if (input.id !== state.id || input.expectedRevision !== state.revision) {
    throw new PracticalError("A newer version is saved. Reload the case and compare it with your work.", 409);
  }
  const form = state.forms[input.stage];
  if (!form) throw new PracticalError("The transfer case opens seven days after the first initial submission.", 409);
  const keys = new Set(form.fields.map(field => field.key));
  if (Object.keys(input.answers).some(key => !keys.has(key))) {
    throw new PracticalError("Use only the ledger fields on this case.");
  }
  // Once help is recorded in a draft, it remains attached to that attempt.
  const assistance = state.drafts[input.stage]?.assistance === "help" ? "help" : input.assistance;
  const common = { stage: input.stage, form, reasoning: input.reasoning, assistance };
  if (input.action === "draft") return { ...common, action: "draft", answers: input.answers };
  if (!input.reasoning.trim()) throw new PracticalError("Add your explanation before submitting the ledger.");
  const answers: Record<string, number> = {};
  for (const key of keys) {
    const raw = input.answers[key]?.trim() ?? "";
    if (!decimal.test(raw) || !Number.isFinite(Number(raw))) {
      throw new PracticalError("Enter a finite number in every ledger field before submitting.");
    }
    answers[key] = Number(raw);
  }
  const first = !state.attempts.some(attempt => attempt.stage === input.stage);
  const checks = gradePractical(input.id, input.stage, answers);
  return {
    ...common, action: "submit", answers, checks, allCorrect: checks.every(check => check.correct),
    attemptType: first ? "first" : "correction", independent: first && input.stage === "transfer" && assistance === "none",
  };
}
