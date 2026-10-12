import { PageShell } from './PageShell';

export function DemoBanner() {
  return (
    <div className="ui-banner" role="note">
      <span><strong>DEMO MODE</strong>Progress isn’t saved in this preview.</span>
      <a href="/register">Create an account to keep it</a>
    </div>
  );
}

export function LearnShell({ children }: { children: React.ReactNode }) {
  return <PageShell footerNote="SAMPLE MODULE FROM THE ARC ASSIGNMENT · INDEPENDENT CONCEPT">{children}</PageShell>;
}
