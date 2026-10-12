'use client';

import * as React from 'react';

/**
 * Marks facts in the lesson's "Key facts" panel: `broken` facts are contradicted by what the
 * scene shows right now, `related` facts belong to what the student is pointing at.
 */
export function useFactMarks(broken: string[], related: string[]) {
  const key = `${broken.join()}|${related.join()}`;
  React.useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('.ui-facts [data-fact]');
    items.forEach(li => {
      const fact = li.dataset.fact!;
      const state = broken.includes(fact) ? 'broken' : related.includes(fact) ? 'related' : '';
      if (state) li.dataset.factState = state;
      else delete li.dataset.factState;
    });
    return () => items.forEach(li => delete li.dataset.factState);
  }, [key]);
}
