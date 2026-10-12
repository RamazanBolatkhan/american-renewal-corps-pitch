import type { ImportStatus } from '@/db/schema';

const labels: Record<ImportStatus, string> = {
  extracting: 'READING PLAN',
  needs_review: 'NEEDS REVIEW',
  approved: 'APPROVED',
  generating: 'GENERATING LESSONS',
  published: 'PUBLISHED',
  partial: 'PARTLY GENERATED',
  failed: 'FAILED',
};

export function ImportStatusPill({ status }: { status: ImportStatus }) {
  return <span className={`ui-pill ui-pill--${status}`}>{labels[status]}</span>;
}
