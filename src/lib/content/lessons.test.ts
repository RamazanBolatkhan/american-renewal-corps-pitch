import { describe, expect, it } from 'vitest';
import { lessons, questions } from '@/content/cooling-airflow';
import { coolingModule, formats } from '@/lib/module';
import { checkLesson, checkQuestion, Lesson, readWordCount } from './lessons';

const factKeys = (topicId: string) => coolingModule.topics.find(t => t.id === topicId)!.facts.map(f => f.key);

describe('hand-written Cooling & airflow content', () => {
  it('has one lesson per topic and format', () => {
    for (const topic of coolingModule.topics)
      for (const format of formats) expect(lessons.filter(l => l.topicId === topic.id && l.format === format), `${topic.id}.${format}`).toHaveLength(1);
  });

  it.each(lessons.map(l => [l.id, l] as const))('%s passes every check', (_, lesson) => {
    expect(checkLesson(lesson, factKeys(lesson.topicId))).toEqual([]);
  });

  it.each(questions.map(q => [q.id, q] as const))('%s passes every check', (_, question) => {
    expect(checkQuestion(question, factKeys(question.topicId))).toEqual([]);
  });

  it('tests every fact with at least one question', () => {
    for (const topic of coolingModule.topics)
      for (const fact of topic.facts) expect(questions.some(q => q.topicId === topic.id && q.fact === fact.key), `${topic.id} ${fact.key}`).toBe(true);
  });
});

describe('checks catch broken lessons', () => {
  const parsedRead = Lesson.parse(lessons.find(l => l.id === 'topic-aisles.read'));
  if (parsedRead.format !== 'read') throw new Error('expected a Read lesson');
  const read = parsedRead;
  const sort = lessons.find(l => l.id === 'topic-aisles.game')!;
  const order = lessons.find(l => l.id === 'topic-inlet.game')!;
  const sim = lessons.find(l => l.id === 'topic-aisles.sim')!;
  const keys = factKeys('topic-aisles');

  it('flags a fact that is not in the brief', () => {
    const broken = structuredClone(read);
    broken.content.paragraphs[0].facts = ['f9'];
    expect(checkLesson(broken, keys).join(' ')).toContain('not in the brief: f9');
  });

  it('flags a brief fact the lesson never teaches', () => {
    const broken = structuredClone(read);
    broken.content.paragraphs = broken.content.paragraphs.filter(p => !p.facts.includes('f4'));
    broken.content.commonMistake.facts = ['f3'];
    expect(checkLesson(broken, keys).join(' ')).toContain('Does not teach: f4');
  });

  it('flags a Read lesson outside 150–250 words', () => {
    const broken = structuredClone(read);
    broken.content.paragraphs = broken.content.paragraphs.map(p => ({ ...p, text: 'Short.' }));
    expect(readWordCount(broken.content)).toBeLessThan(150);
    expect(checkLesson(broken, keys).join(' ')).toContain('150–250 words');
  });

  it('flags a sort game with an item left unsorted', () => {
    const broken = structuredClone(sort) as Extract<typeof sort, { format: 'game' }>;
    if (broken.content.kind !== 'sort') throw new Error('expected sort');
    broken.content.answer = broken.content.answer.slice(1);
    expect(checkLesson(broken, keys).join(' ')).toContain('exactly one group');
  });

  it('flags an order game that repeats a step', () => {
    const broken = structuredClone(order) as Extract<typeof order, { format: 'game' }>;
    if (broken.content.kind !== 'order') throw new Error('expected order');
    broken.content.answer = [...broken.content.answer.slice(0, -1), broken.content.answer[0]];
    expect(checkLesson(broken, factKeys('topic-inlet')).join(' ')).toContain('every item exactly once');
  });

  it('flags a sim decision with two correct choices', () => {
    const broken = structuredClone(sim) as Extract<typeof sim, { format: 'sim' }>;
    broken.content.decisions[0].choices.forEach(c => (c.correct = true));
    expect(checkLesson(broken, keys).join(' ')).toContain('exactly one correct choice');
  });

  it('flags a diagram element outside the canvas', () => {
    const diagram = structuredClone(lessons.find(l => l.id === 'topic-aisles.diagram')!) as Extract<(typeof lessons)[number], { format: 'diagram' }>;
    diagram.content.elements[0].x = 900;
    expect(checkLesson(diagram, keys).join(' ')).toContain('outside the canvas');
  });

  it('flags colliding labels and an unconnected arrow in a diagram', () => {
    // The containment diagram (720 wide) has open floor at its bottom right for a stray arrow.
    const diagram = structuredClone(lessons.find(l => l.id === 'topic-containment.diagram')!) as Extract<(typeof lessons)[number], { format: 'diagram' }>;
    diagram.content.elements.push(
      { id: 'note-a', type: 'label', x: 200, y: 20, label: 'A note that collides', facts: ['f1'] },
      { id: 'note-b', type: 'label', x: 210, y: 22, label: 'Another note', facts: ['f1'] },
      { id: 'stray', type: 'arrow', x: 640, y: 335, x2: 700, y2: 335, facts: ['f1'] },
    );
    const problems = checkLesson(diagram, factKeys('topic-containment')).join(' ');
    expect(problems).toContain('collide');
    expect(problems).toContain("doesn't start or end on any part");
  });

  it('flags a question with no correct option', () => {
    const q = structuredClone(questions[0]);
    q.options.forEach(o => (o.correct = false));
    expect(checkQuestion(q, keys).join(' ')).toContain('exactly one correct option');
  });
});
