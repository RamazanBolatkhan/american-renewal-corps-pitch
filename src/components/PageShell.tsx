import Link from 'next/link';
import { signOut } from '@/app/actions/account';
import { isStaff } from '@/lib/permissions';
import { getSession, isMember } from '@/lib/session';
import { Icon } from './Icon';

export { Eyebrow, SkeletonNote } from './ui';

type Props = {
  children: React.ReactNode;
  /** Right side of the header for logged-out visitors. Defaults to account links. */
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

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button className="ui-button ui-button--outline" type="submit">LOG OUT</button>
    </form>
  );
}

async function AccountActions({ fallback }: { fallback?: React.ReactNode }) {
  const session = await getSession();
  if (session && isMember(session)) {
    return (
      <>
        {isStaff(session.user.role) && <Link className="ui-link" href="/admin">ADMIN</Link>}
        <Link className="ui-link ui-account-name" href="/account" title={`Your account (${session.user.email})`}>{session.user.name.toUpperCase()}</Link>
        <SignOutButton />
      </>
    );
  }
  return fallback ?? (
    <>
      <Link className="ui-link" href="/login">LOG IN</Link>
      <Link className="ui-button ui-button--outline" href="/register">CREATE ACCOUNT <Icon name="arrow" /></Link>
    </>
  );
}

export function PageShell({ children, actions, footerNote = 'INDEPENDENT CONCEPT · SAMPLE LEARNING ONLY', className = '' }: Props) {
  return (
    <div className={`ui ui-shell ${className}`}>
      <a className="ui-skip" href="#main">Skip to content</a>
      <header className="ui-header">
        <Wordmark />
        <nav className="ui-header-actions" aria-label="Account">
          <AccountActions fallback={actions} />
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
