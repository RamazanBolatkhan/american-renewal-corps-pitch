import { describe, expect, it } from 'vitest';
import { DEFAULT_GUIDE, draftPrompt, GUIDE_LIMIT, judgePrompt, judgeSystem, percent, scoreOf, verdictOf, type FeedbackCase } from './judging';

describe('judge verdict', () => {
  it('passes content with no findings or only warnings', () => {
    expect(verdictOf([])).toBe('pass');
    expect(verdictOf([{ severity: 'warning' }])).toBe('pass');
  });
  it('flags content with any error', () => {
    expect(verdictOf([{ severity: 'warning' }, { severity: 'error' }])).toBe('flag');
  });
});

describe('judge prompt', () => {
  it('puts the guide in the system prompt and the content in the prompt', () => {
    expect(judgeSystem('1. Custom rule.')).toContain('1. Custom rule.');
    const prompt = judgePrompt('<brief>x</brief>', 'game', { items: [{ id: 'a' }] });
    expect(prompt).toContain('<brief>x</brief>');
    expect(prompt).toContain('<content kind="game">');
    expect(prompt).toContain('"id": "a"');
  });
  it('ships a default guide inside the size limit', () => {
    expect(DEFAULT_GUIDE.length).toBeLessThan(GUIDE_LIMIT);
    expect(DEFAULT_GUIDE).toMatch(/^1\. /);
  });
});

describe('learning the guide', () => {
  const cases: FeedbackCase[] = [
    { id: 'aaa', kind: 'game', judgeVerdict: 'flag', editorVerdict: 'pass', note: 'The scene can show other normal parts.', findings: [{ where: 'item 2', problem: 'Scene shows more', rule: 'Rule 5', severity: 'error' }] },
    { id: 'bbb', kind: 'sim', judgeVerdict: 'pass', editorVerdict: 'pass', note: '', findings: [] },
    { id: 'ccc', kind: 'read', judgeVerdict: 'pass', editorVerdict: 'flag', note: 'Says 20 °C, which is not in the brief.', findings: [] },
  ];
  it('shows the drafter every disagreement with the editor note and leaves silent agreements out', () => {
    const prompt = draftPrompt('1. Old rule.', cases);
    expect(prompt).toContain('1. Old rule.');
    expect(prompt).toContain('case aaa (game): judge said flag, editor said pass');
    expect(prompt).toContain('Says 20 °C, which is not in the brief.');
    expect(prompt).not.toContain('case bbb');
  });
  it('scores a guide by agreement with editors', () => {
    const score = scoreOf([
      { feedbackId: 'a', editor: 'pass', judge: 'pass' },
      { feedbackId: 'b', editor: 'flag', judge: 'pass' },
      { feedbackId: 'c', editor: 'flag', judge: 'flag' },
      { feedbackId: 'd', editor: 'pass', judge: 'pass' },
    ]);
    expect(score.agree).toBe(3);
    expect(score.total).toBe(4);
    expect(score.misses).toEqual([{ feedbackId: 'b', editor: 'flag', judge: 'pass' }]);
    expect(percent(score)).toBe(75);
    expect(percent(null)).toBeNull();
  });
});
