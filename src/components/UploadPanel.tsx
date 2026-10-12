'use client';

import { useState } from 'react';
import { Icon } from './Icon';

/** Picks a file locally only. Uploading to Blob storage and AI extraction come next. */
export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="ui-stack">
      <label className="ui-drop" htmlFor="plan-file">
        <Icon name="upload" />
        <strong>{file ? file.name : 'CHOOSE A LEARNING PLAN'}</strong>
        <span className="ui-small">{file ? `${(file.size / 1024).toFixed(0)} KB · ready to import` : 'PDF, Word, Markdown or JSON · one module per file'}</span>
        <input id="plan-file" type="file" accept=".pdf,.docx,.md,.json,application/pdf,application/json,text/markdown" onChange={event => setFile(event.target.files?.[0] ?? null)} />
      </label>
      <button className="ui-button ui-button--paper" type="button" disabled style={{ justifySelf: 'start' }}>
        START IMPORT <Icon name="arrow" />
      </button>
    </div>
  );
}
