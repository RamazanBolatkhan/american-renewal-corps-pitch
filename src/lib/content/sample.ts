import { lessons, questions } from '@/content/cooling-airflow';
import type { Format } from '@/lib/module';
import { Lesson, Question } from './lessons';

/** The hand-written sample lessons, parsed once through the same schemas the generator must satisfy. */
const parsedLessons = lessons.map(l => Lesson.parse(l));
const parsedQuestions = questions.map(q => Question.parse(q));

export function getSampleLesson(topicId: string, format: Format) {
  return parsedLessons.find(l => l.topicId === topicId && l.format === format) ?? null;
}

export function getSampleQuestions(topicId: string) {
  return parsedQuestions.filter(q => q.topicId === topicId);
}
