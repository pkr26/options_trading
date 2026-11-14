import curriculum from "../content/graduate.json";
import type { GraduateModule } from "./graduate-types";

export const GRADUATE_VERSION = "2026-11-14.1";
export const GRADUATE_QUESTION_VERSION = "2026-11-14.1";
export const graduateModules = curriculum as GraduateModule[];
export function graduateModule(id: number) {
  return graduateModules.find(module => module.id === id);
}
