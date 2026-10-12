import { getSession, isMember } from '@/lib/session';
import { PageShell } from './PageShell';

/** Shown to visitors without an account; demo progress is kept only until they leave or register. */
export async function DemoBanner() {
  if (isMember(await getSession())) return null;
  return (
    <div className="ui-banner" role="note">
      <span><strong>DEMO MODE</strong>Your choices are kept on this device only.</span>
      <a href="/register">Create an account to keep them</a>
    </div>
  );
}

export function LearnShell({ children }: { children: React.ReactNode }) {
  return <PageShell footerNote="SAMPLE MODULE FROM THE ARC ASSIGNMENT · INDEPENDENT CONCEPT">{children}</PageShell>;
}
