import { emailConfigured } from '@/lib/email';
import { getSession, isMember } from '@/lib/session';
import { PageShell } from './PageShell';

/** Shown to visitors without an account; demo progress is kept only until they leave or register. */
export async function DemoBanner() {
  const session = await getSession();
  if (session && isMember(session)) {
    if (session.user.emailVerified || !emailConfigured()) return null;
    return (
      <div className="ui-banner" role="note">
        <span><strong>CONFIRM YOUR EMAIL</strong>We sent a link to {session.user.email}.</span>
        <a href="/account">Send it again</a>
      </div>
    );
  }
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
