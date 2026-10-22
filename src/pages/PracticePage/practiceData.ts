import {
  getLessons,
  getPracticeById,
  getPracticeFiles,
  getPracticeSaves,
  getSaveFiles,
} from "../../api/generated";
import { getInitialContents } from "./practiceFiles";

export async function loadPractice(
  practiceId: number,
  studentId: string | undefined,
  lessonId: number | undefined,
  signal: AbortSignal,
) {
  const [practice, lessons, saves] = await Promise.all([
    getPracticeById(practiceId, undefined, signal),
    getLessons(undefined, undefined, signal),
    studentId
      ? getPracticeSaves({ studentId, practiceId }, undefined, signal)
      : Promise.resolve([]),
  ]);
  const files = (
    practice.Practice_files ?? (await getPracticeFiles({ practiceId }, undefined, signal))
  )
    .slice()
    .sort((left, right) => left.id - right.id);
  const save = saves
    .filter((item) => item.id_student === studentId && item.id_practice === practiceId)
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0];
  const savedFiles = save ? await getSaveFiles({ practiceSaveId: save.id }, undefined, signal) : [];
  const matchingLessons = lessons.filter((lesson) => lesson.id_practice === practiceId);
  const lesson =
    lessonId === undefined
      ? matchingLessons[0]
      : matchingLessons.find((item) => item.id === lessonId);

  return { practice, files, lesson, contents: getInitialContents(files, savedFiles) };
}

export type PracticeData = Awaited<ReturnType<typeof loadPractice>>;
