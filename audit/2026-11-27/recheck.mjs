// Run with Node 22.13+ from any directory. These checks only read course data.
import { readFileSync } from "node:fs";
import { buildQuiz } from "../../course-app/lib/quiz-bank.ts";
import { makeGraduatePractice, gradeGraduatePractice } from "../../course-app/lib/graduate-practice.ts";
import { startTutorSession, advanceTutorSession } from "../../course-app/lib/adaptive-teaching.ts";
import { europeanSensitivities } from "../../course-app/lib/graduate-models.ts";

const graduate = JSON.parse(readFileSync(new URL("../../course-app/content/graduate.json", import.meta.url), "utf8"));
const prompts = new Set();
let repeatedPrompts = 0;
let repeatedKeys = 0;
for (let moduleId = 1; moduleId <= 8; moduleId++) {
  const first = buildQuiz(moduleId, 0);
  const second = buildQuiz(moduleId, 1);
  for (const [index, a] of first.entries()) {
    const b = second[index];
    prompts.add(a.prompt);
    prompts.add(b.prompt);
    if (a.prompt === b.prompt) repeatedPrompts++;
    if (a.options[a.correctIndex] === b.options[b.correctIndex]) repeatedKeys++;
  }
}

const constantAnswers = [];
const sequencesTested = 1200;
for (const module of graduate) {
  const keysByQuestion = [new Set(), new Set(), new Set()];
  for (let sequence = 0; sequence < sequencesTested; sequence++) {
    const questions = makeGraduatePractice(module.id, sequence);
    const answers = Object.fromEntries(questions.map(q => [q.id, 0]));
    const feedback = gradeGraduatePractice(module.id, sequence, answers);
    feedback.forEach((q, index) => keysByQuestion[index].add(q.expected.toFixed(2)));
  }
  keysByQuestion.forEach((keys, index) => {
    if (keys.size === 1) constantAnswers.push({module: module.id, question: index + 1, value: [...keys][0]});
  });
}

const contract = {spot: 1, strike: 1, years: 1 / 365, volatility: 0.01, rate: 0, dividendYield: 0, right: "call"};
const scale = contract.volatility * Math.sqrt(contract.years);
// At the money with zero rate and dividend yield, d1 simplifies to half of sigma sqrt(T).
const d1 = scale / 2;
const analyticGamma = Math.exp(-d1 * d1 / 2) / (Math.sqrt(2 * Math.PI) * contract.spot * scale);
const displayedGamma = europeanSensitivities(contract).gamma;

const timestamp = "2026-11-27T12:00:00Z";
let session = startTutorSession(11, 0, "audit-execution", timestamp);
const firstFillPrompt = session.question.prompt;
for (const input of [{action: "answer", answer: 2.10}, {action: "explain"}, {action: "answer", answer: 422}]) {
  session = advanceTutorSession(session, input, timestamp);
}
const transferPrompt = session.question.prompt;
session = advanceTutorSession(session, {action: "answer", answer: 424}, timestamp);
const result = session.turns.at(-1);

console.log(JSON.stringify({
  beginner: {slots: 80, distinctPrompts: prompts.size, repeatedPrompts, repeatedKeys},
  advanced: {
    modules: graduate.length,
    sections: graduate.reduce((count, m) => count + m.sections.length, 0),
    distinctAssignmentDeliverableLists: new Set(graduate.map(m => JSON.stringify(m.assignment.deliverables))).size,
    sequencesTested, constantAnswers,
  },
  pricing: {contract, displayedGamma, analyticGamma, relativeErrorPercent: 100 * (displayedGamma / analyticGamma - 1)},
  tutor: {firstFillPrompt, transferPrompt, submitted: result.answer, gradedAsCorrect: result.correct, key: result.expected},
}, null, 2));
