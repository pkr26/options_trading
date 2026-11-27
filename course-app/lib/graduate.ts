import curriculum from "../content/graduate.json";
import type { GraduateModule } from "./graduate-types";

export const GRADUATE_VERSION = "2026-11-27.1";
export { PRACTICE_RELEASE as GRADUATE_QUESTION_VERSION } from "./graduate-practice";
export const graduateModules = curriculum as GraduateModule[];
export function graduateModule(id: number) {
  return graduateModules.find(module => module.id === id);
}
