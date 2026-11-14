import data from "@/content/course.json";
import libraryData from "@/content/library.json";
import type { CourseModule } from "./types";
export const modules: CourseModule[] = data;
export const lessons = modules.flatMap(m => m.lessons);
export const library = libraryData;
export const getLesson = (id: number) => lessons.find(l => l.id === id);
