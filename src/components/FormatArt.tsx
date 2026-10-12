import type { Format } from '@/lib/module';

/** Small technical line drawings, one per lesson format, in the landing page's style. */
const art: Record<Format, React.ReactNode> = {
  read: (
    <>
      <rect x="22" y="12" width="56" height="76" />
      <path d="M32 28h36M32 38h36M32 48h28M32 58h36M32 68h20" />
    </>
  ),
  diagram: (
    <>
      <rect x="14" y="30" width="18" height="44" />
      <rect x="68" y="30" width="18" height="44" />
      <path d="M36 44h26m-6-5 6 5-6 5M64 60H38m6-5-6 5 6 5" />
      <path d="M10 82h80" strokeDasharray="3 5" />
    </>
  ),
  game: (
    <>
      <rect x="14" y="16" width="28" height="22" />
      <rect x="58" y="16" width="28" height="22" />
      <rect x="14" y="62" width="28" height="22" />
      <rect x="58" y="62" width="28" height="22" />
      <path d="M42 27 58 73M42 73l16-46" strokeDasharray="3 4" />
    </>
  ),
  sim: (
    <>
      <path d="M14 50h18l18-18 18 18-18 18-18-18" />
      <path d="M68 50h18M50 32V14m0 54v18" />
      <circle cx="14" cy="50" r="4" />
      <path d="m82 45 5 5-5 5" />
    </>
  ),
};

export function FormatArt({ format, className = '' }: { format: Format; className?: string }) {
  return (
    <svg className={`format-art ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h8M8 4v8M88 92h8M92 88v8" strokeWidth="1" opacity=".45" />
      {art[format]}
    </svg>
  );
}
