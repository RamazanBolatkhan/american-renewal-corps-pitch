'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { createImportJob } from '@/app/actions/imports';
import { Icon } from './Icon';

const accept = '.pdf,.md,.markdown,.txt,.json,application/pdf,text/markdown,text/plain,application/json';

/** Uploads straight from the browser to private Blob storage, then starts AI extraction. */
export function UploadPanel({ canUpload }: { canUpload: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function start() {
    if (!file) return;
    setError('');
    setProgress(0);
    try {
      const blob = await upload(`plans/${file.name}`, file, {
        access: 'private',
        handleUploadUrl: '/api/admin/uploads',
        onUploadProgress: event => setProgress(Math.round(event.percentage)),
      });
      const id = await createImportJob({ pathname: blob.pathname, fileName: file.name });
      router.push(`/admin/imports/${id}`);
    } catch (err) {
      setProgress(null);
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.');
    }
  }

  const busy = progress !== null;
  return (
    <div className="ui-stack">
      <label className="ui-drop" htmlFor="plan-file">
        <Icon name="upload" />
        <strong>{file ? file.name : 'CHOOSE A LEARNING PLAN'}</strong>
        <span className="ui-small">
          {busy ? `Uploading… ${progress}%` : file ? `${Math.max(1, Math.round(file.size / 1024))} KB · ready to import` : 'PDF, Markdown, text or JSON · one module per file · up to 10 MB'}
        </span>
        <input id="plan-file" type="file" accept={accept} disabled={!canUpload || busy} onChange={event => { setFile(event.target.files?.[0] ?? null); setError(''); }} />
      </label>
      {error && <p className="ui-status ui-status--dark" role="alert">{error}</p>}
      <button className="ui-button ui-button--paper" type="button" disabled={!file || busy || !canUpload} onClick={start} style={{ justifySelf: 'start' }}>
        {busy ? 'UPLOADING…' : 'START IMPORT'} <Icon name="arrow" />
      </button>
      {!canUpload && <p className="ui-small">Your role can view imports but not upload plans.</p>}
    </div>
  );
}
