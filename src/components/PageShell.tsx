import { Icon } from './Icon';

type Props = {
  children: React.ReactNode;
  /** Right side of the header. Defaults to account links. */
  actions?: React.ReactNode;
  footerNote?: string;
  className?: string;
};

export function Wordmark() {
  // Plain <a>: the landing page mounts outside React, so it needs a full page load.
  return (
    <a className="ui-brand" href="/" aria-label="American Renewal Corps home">
      <span className="ui-wordmark">arc<span>✳</span></span>
      <span className="ui-brand-name">AMERICAN<br />RENEWAL CORPS</span>
    </a>
  );
}

export function PageShell({ children, actions, footerNote = 'INDEPENDENT CONCEPT · SAMPLE LEARNING ONLY', className = '' }: Props) {
  return (
    <div className={`ui ui-shell ${className}`}>
      <a className="ui-skip" href="#main">Skip to content</a>
      <header className="ui-header">
        <Wordmark />
        <nav className="ui-header-actions" aria-label="Account">
          {actions ?? (
            <>
              <a className="ui-link" href="/login">LOG IN</a>
              <a className="ui-button ui-button--outline" href="/register">CREATE ACCOUNT <Icon name="arrow" /></a>
            </>
          )}
        </nav>
      </header>
      <main id="main" className="ui-main">{children}</main>
      <footer className="ui-footer">
        <span>REAL SKILLS. REAL PURPOSE. A NEW DIRECTION.</span>
        <span>{footerNote}</span>
      </footer>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="ui-eyebrow"><span className="ui-square" aria-hidden="true" />{children}</p>;
}

export function SkeletonNote({ children }: { children: React.ReactNode }) {
  return <p className="ui-skeleton-note"><Icon name="lock" />{children}</p>;
}
