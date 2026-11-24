import curriculum from "../content/graduate.json" with { type: "json" };
import { gradeGraduatePractice, makeGraduatePractice } from "./graduate-practice.ts";
import type { CompetencyId, GraduateModule, GraduatePracticeFeedback } from "./graduate-types.ts";
import type { TeachingContext, TutorPlan, TutorRecommendation, TutorSession, TutorTransitionInput } from "./teaching-types.ts";

const modules = curriculum as GraduateModule[];
const day = 86_400_000;
const critical: Record<CompetencyId, number> = { contracts: 100, risk: 95, execution: 85, valuation: 75, research: 75, communication: 65 };
const teaching: Record<CompetencyId, { principle: string; question: string }> = {
  contracts: { principle: "Write a position ledger: contracts, premium multiplier, exercise deliverable, strike cash and surviving positions are separate quantities.", question: "Which quantity belongs per share, per contract, or to the whole account?" },
  valuation: { principle: "Name the valuation date, units and model assumptions. An expiration payoff, a local value-change estimate and a market fill answer different questions.", question: "What is being valued, at what time, and under which inputs held fixed?" },
  execution: { principle: "Only supplied or confirmed fills create positions and cash flows. Include the correct quote side, filled quantity and stated fees; preserve the nonfill.", question: "Which contracts actually filled, and which order quantity remains or was cancelled?" },
  risk: { principle: "Separate signed P&L, worst-case loss, marked equity and cash available by a deadline. A percentage needs the correct denominator and a count must respect whole contracts.", question: "What is the loss or funding constraint, and which amount belongs in the denominator?" },
  research: { principle: "Preserve the population, information time and units. A descriptive statistic is not independent evidence of a market edge; dependence and selection affect uncertainty.", question: "Which observations were available, which denominator is justified, and what conclusion do they permit?" },
  communication: { principle: "Connect the objective, evidence, alternative and condition that would reverse the decision. State what is known and what remains uncertain.", question: "Could another reader reconstruct why you chose this action?" },
};

function timestamp(now?: string): string {
  const value = now ?? new Date().toISOString();
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) throw new RangeError("Use a valid teaching date.");
  return new Date(value).toISOString();
}
function moduleFor(id: number) {
  const selected = modules.find(item => item.id === id);
  if (!selected) throw new RangeError("Choose an advanced module from 1 to 26.");
  return selected;
}

/** A recommendation is tied to observed questions, never a certification inferred from an average. */
export function buildTutorPlan(context: TeachingContext, now?: string): TutorPlan {
  const generatedAt = timestamp(now), current = Date.parse(generatedAt);
  const recommendations: TutorRecommendation[] = [];
  const add = (item: TutorRecommendation) => {
    const previous = recommendations.findIndex(row => row.moduleId === item.moduleId);
    if (previous < 0) recommendations.push(item);
    else if (recommendations[previous].priority < item.priority) recommendations[previous] = item;
  };
  if (!Array.isArray(context.practice) || !Array.isArray(context.submissions)) throw new TypeError("Supply the learner's saved teaching evidence.");
  const attempts = context.practice.filter(item => Number.isFinite(Date.parse(item.createdAt)) && Date.parse(item.createdAt) <= current && modules.some(candidate => candidate.id === item.moduleId));
  const byModule = new Map<number, typeof attempts>();
  for (const attempt of attempts) byModule.set(attempt.moduleId, [...(byModule.get(attempt.moduleId) ?? []), attempt]);
  for (const rows of byModule.values()) rows.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.sequence - b.sequence);
  for (const [moduleId, rows] of byModule) {
    const first = rows[0], latest = rows.at(-1)!;
    const misses = latest.feedback.filter(item => !item.correct);
    if (misses.length) {
      const hardest = [...misses].sort((a, b) => critical[b.skill] - critical[a.skill])[0];
      add({ moduleId, skill: hardest.skill, priority: critical[hardest.skill] + Math.min(misses.length, 3), action: "remediate", reason: `The latest saved set has ${misses.length} unresolved calculation${misses.length === 1 ? "" : "s"}. Start with ${hardest.unit}: “${hardest.prompt.slice(0, 155)}…” Correct this reasoning before advancing.` });
      for (const prerequisite of moduleFor(moduleId).prerequisites) {
        const evidence = byModule.get(prerequisite)?.at(-1);
        if (!evidence || evidence.feedback.some(item => !item.correct)) add({ moduleId: prerequisite, skill: moduleFor(prerequisite).competencies[0], priority: 60, action: "prepare", reason: `Module ${moduleId} names this prerequisite. A recent fully correct numerical check is not recorded here; rehearse the foundation before extending the current model. Written competence needs separate review.` });
      }
    }
    for (const interval of [30, 7]) {
      const due = Date.parse(first.createdAt) + interval * day;
      if (current >= due && !rows.some(item => Date.parse(item.createdAt) >= due)) {
        add({ moduleId, skill: moduleFor(moduleId).competencies[0], priority: 70 + (moduleFor(moduleId).competencies.includes("contracts") ? 8 : 0), action: "retain", reason: `A ${interval}-day check is due from the first saved numerical set (${first.createdAt.slice(0, 10)}). Try a changed case without the original solution, and keep the new result separately.` });
        break;
      }
    }
  }
  if (!attempts.length) add({ moduleId: 1, skill: "risk", priority: 100, action: "prepare", reason: "Begin with a short diagnostic on objectives, drawdowns and resources. There is no saved numerical evidence yet; this establishes a starting point rather than assuming experience." });
  for(const feedback of context.feedback??[]){
    const authored=modules.find(item=>item.id===feedback.moduleId);
    const submission=context.submissions.find(item=>item.id===feedback.submissionId);
    if(!authored||!submission||context.submissions.some(item=>item.moduleId===submission.moduleId&&item.kind==="submission"&&item.revision>submission.revision))continue;
    const gap=feedback.criteria.find(item=>item.status==="needs_work");
    if(!gap&&!feedback.alerts.length)continue;
    const skill=authored.competencies.includes("contracts")?"contracts":authored.competencies.includes("risk")?"risk":authored.competencies[0];
    add({moduleId:authored.id,skill,priority:critical[skill]+(feedback.alerts.length?6:2),action:"remediate",reason:`The latest submitted memo needs attention in ${gap?.dimension??"a quoted claim"}. ${gap?.nextQuestion??feedback.alerts[0].explanation} Open its saved feedback and revise the argument; numerical success alone does not resolve this writing evidence.`});
  }
  for (const candidate of modules) {
    if (byModule.has(candidate.id)) continue;
    const ready = candidate.prerequisites.every(id => {
      const latest = byModule.get(id)?.at(-1);
      return !!latest && latest.feedback.length > 0 && latest.feedback.every(item => item.correct);
    });
    if (ready) add({ moduleId: candidate.id, skill: candidate.competencies[0], priority: 20, action: "extend", reason: `Study “${candidate.title}”, then submit its decision case. Its listed prerequisite numerical checks are recorded; their scores do not establish written reasoning quality.` });
  }
  if (!recommendations.length) add({ moduleId: 26, skill: "research", priority: 20, action: "extend", reason: "Return to the capstone defense. Ask an independent reviewer to challenge a model assumption, operational event, data issue and claimed result; retain the review and your response." });
  recommendations.sort((a, b) => b.priority - a.priority || a.moduleId - b.moduleId);
  return { generatedAt, recommendations: recommendations.slice(0, 8), summary: "This rules-based study plan prioritizes observed errors and due checks. Numerical practice, assisted tutoring, written recommendations and independent review are different evidence." };
}

function questionKey(session: Pick<TutorSession, "moduleId" | "sequence" | "questionIndex">, answer: number): GraduatePracticeFeedback {
  const questions = makeGraduatePractice(session.moduleId, session.sequence);
  const answers = Object.fromEntries(questions.map((question, index) => [question.id, index === session.questionIndex ? answer : 0]));
  return gradeGraduatePractice(session.moduleId, session.sequence, answers)[session.questionIndex];
}
function currentQuestion(session: Pick<TutorSession, "moduleId" | "sequence" | "questionIndex">) {
  return makeGraduatePractice(session.moduleId, session.sequence)[session.questionIndex];
}
function validateSession(session: TutorSession) {
  moduleFor(session.moduleId);
  if (typeof session.id !== "string" || !session.id || session.id.length > 200 || !Number.isSafeInteger(session.sequence) || session.sequence < 0 || session.sequence > 1_000_000 || !Number.isSafeInteger(session.revision) || session.revision < 1 || !Number.isInteger(session.questionIndex) || session.questionIndex < 0 || session.questionIndex > 3 || !Number.isInteger(session.hintLevel) || session.hintLevel < 0 || session.hintLevel > 3 || !Array.isArray(session.turns) || session.turns.length > 200 || session.turns.some(turn => typeof turn.prompt !== "string" || !Number.isFinite(turn.answer) || !Number.isFinite(turn.expected) || typeof turn.correct !== "boolean" || typeof turn.assisted !== "boolean" || !Number.isFinite(Date.parse(turn.at)))) throw new TypeError("The saved tutor session is invalid.");
  timestamp(session.createdAt);
  if (session.phase === "complete") {
    if (session.question !== null || session.questionIndex !== 3) throw new TypeError("A completed tutor session cannot have an active question.");
    return;
  }
  if (!["question", "retry", "transfer"].includes(session.phase) || session.questionIndex > 2 || !session.question || JSON.stringify(session.question) !== JSON.stringify(currentQuestion(session))) throw new TypeError("Use the saved issued tutor question.");
}

export function startTutorSession(moduleId: number, sequence: number, id: string, now?: string): TutorSession {
  const createdAt = timestamp(now);
  moduleFor(moduleId);
  if (typeof id !== "string" || !id.trim() || id.length > 200) throw new TypeError("Supply a tutor session identifier.");
  const question = makeGraduatePractice(moduleId, sequence)[0];
  return { id, moduleId, sequence, questionIndex: 0, revision: 1, phase: "question", hintLevel: 0, question, turns: [], teaching: teaching[question.skill].principle, nextStep: "Answer this one question before revealing help. Explain the units in your notes; your first numeric answer will be preserved.", createdAt };
}

function diagnosis(feedback: GraduatePracticeFeedback) {
  const { answer, expected, unit, skill, prompt } = feedback;
  if (expected !== 0 && Math.abs(answer - expected / 100) < Math.max(0.01, Math.abs(expected) * 0.0001) && /USD|shares|count/.test(unit)) return "Your answer is close to one hundredth of the required quantity. Check whether the prompt asks for the per-share value or the standard contract/account amount. Apply the multiplier exactly once.";
  if (expected !== 0 && Math.abs(answer - expected * 100) < Math.max(0.01, Math.abs(expected) * 0.001)) return "Your answer is close to one hundred times the required quantity. Recheck the requested unit before multiplying; a per-contract number must not be multiplied a second time.";
  if (expected !== 0 && Math.abs(answer + expected) < 0.00501) return "The magnitude agrees but the sign is reversed. Decide whose account or position the question describes, and whether cash or P&L is entering or leaving it.";
  if (unit === "count" && !Number.isInteger(answer)) return "This answer asks for a whole count. For a position limit, include the stated per-position costs and round down; do not buy a fractional contract.";
  if (/drawdown|restores|recover/i.test(prompt)) return "Recheck the denominator. A recovery return starts from the smaller remaining balance; a drawdown is measured from the earlier peak.";
  if (/assignment|assigned|exercise cash/i.test(prompt)) return "Assignment is an account event. Rebuild cash, shares and each remaining option separately; the earlier premium does not replace the gross exercise obligation.";
  if (/variance|standard error|sample size|interval/i.test(prompt)) return "Distinguish dispersion from uncertainty of the mean. Use the specified sample-variance denominator or effective independent sample size, and keep the stated units.";
  return `${teaching[skill].principle} ${teaching[skill].question}`;
}
function transfer(session: TutorSession, teachingText: string): TutorSession {
  const sequence = (session.sequence + 1) % 1_000_001;
  const next = { ...session, sequence, phase: "transfer" as const, hintLevel: 0 };
  return { ...next, question: currentQuestion(next), teaching: teachingText, nextStep: "Apply the correction to this changed case without a hint. This transfer attempt is recorded separately from the assisted correction." };
}

export function advanceTutorSession(session: TutorSession, input: TutorTransitionInput, now?: string): TutorSession {
  validateSession(session);
  const at = timestamp(now);
  if (session.phase === "complete") throw new RangeError("This tutor session is complete. Start a new session for another check.");
  if (!input || !["answer", "hint", "explain"].includes(input.action) || (input.action !== "answer" && input.answer !== undefined)) throw new TypeError("Choose an answer, hint, or worked explanation.");
  const next: TutorSession = { ...session, turns: [...session.turns], revision: session.revision + 1 };
  if (input.action === "hint") {
    next.hintLevel = Math.min(2, session.hintLevel + 1);
    next.teaching = next.hintLevel === 1 ? `${teaching[session.question!.skill].question} ${session.question!.hint}` : `${teaching[session.question!.skill].principle} Set out the input, operation and required unit on separate lines. ${session.question!.hint}`;
    next.nextStep = "Try the issued question again. Because help was opened, a correct answer here will lead to a changed transfer case.";
    return next;
  }
  if (input.action === "explain") {
    const worked = questionKey(session, 0);
    next.hintLevel = 3; next.phase = "retry";
    next.teaching = `Worked solution: ${worked.expected.toFixed(2)} ${worked.unit}. ${worked.explanation}`;
    next.nextStep = "Reconstruct the solution, then answer. The following changed case will check whether you can transfer the method.";
    return next;
  }
  if (typeof input.answer !== "number" || !Number.isFinite(input.answer) || Math.abs(input.answer) > 1e12) throw new TypeError("Enter a finite numeric answer within the teaching range.");
  const feedback = questionKey(session, input.answer);
  next.turns.push({ prompt: feedback.prompt, answer: input.answer, correct: feedback.correct, assisted: session.hintLevel > 0 || session.phase === "retry", explanation: feedback.explanation, expected: feedback.expected, at });
  if (!feedback.correct) {
    const explanation = `${diagnosis(feedback)} The checked result is ${feedback.expected.toFixed(2)} ${feedback.unit}. ${feedback.explanation}`;
    if (session.phase === "retry" || session.hintLevel >= 2) return transfer(next, explanation);
    return { ...next, phase: "retry", hintLevel: Math.max(session.hintLevel, 1), teaching: explanation, nextStep: "Correct the issued question using the explanation. A correct assisted retry will open a changed transfer case; it does not erase your first answer." };
  }
  if (session.phase === "retry" || session.hintLevel > 0) return transfer(next, `The correction is arithmetically consistent. ${feedback.explanation}`);
  if (session.questionIndex === 2) return { ...next, phase: "complete", questionIndex: 3, question: null, hintLevel: 0, teaching: "The three calculation families were completed, including any required changed transfer cases. The original answers, help and corrections remain in this session.", nextStep: "Explain the reasoning in the decision case and arrange the later retention check. This tutoring result is practice evidence, not an independent academic or trading-readiness judgment." };
  next.questionIndex += 1; next.phase = "question"; next.hintLevel = 0; next.question = currentQuestion(next);
  next.teaching = `Calculation consistent. ${feedback.explanation} Next focus: ${teaching[next.question.skill].principle}`;
  next.nextStep = "Try the next calculation without notes, then explain one assumption that limits its interpretation.";
  return next;
}
