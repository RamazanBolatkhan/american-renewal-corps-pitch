import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChangePasswordForm, DeleteAccountForm, ResendVerificationButton } from '@/components/account/forms';
import { GoogleButton } from '@/components/account/GoogleButton';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { auth, googleConfigured } from '@/lib/auth';
import { emailConfigured } from '@/lib/email';
import { getSession, isMember } from '@/lib/session';

export const metadata: Metadata = { title: 'Your account — American Renewal Corps' };

const joined = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ verified?: string }> }) {
  const session = await getSession();
  if (!session || !isMember(session)) redirect('/login?next=/account');
  if (session.user.mustChangePassword) redirect('/account/password?next=/account');
  const accounts = await auth.api.listUserAccounts({ headers: await headers() });
  const providers = accounts.map(a => a.providerId);
  const hasPassword = providers.includes('credential');
  const verifiedNow = (await searchParams).verified === '1';
  const u = session.user;

  return (
    <PageShell>
      <Eyebrow>YOUR ACCOUNT</Eyebrow>
      <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>{u.name.toUpperCase()}</h1>
      <div className="account-grid">
        <section className="ui-frame" aria-labelledby="details-title">
          <h2 id="details-title" className="ui-label" style={{ marginBottom: 14 }}>DETAILS</h2>
          <dl className="account-details">
            <div><dt>Email</dt><dd>{u.email}</dd></div>
            <div><dt>Email confirmed</dt><dd>{u.emailVerified ? 'Yes' : 'Not yet'}</dd></div>
            <div><dt>Role</dt><dd>{u.role ?? 'student'}</dd></div>
            <div><dt>Sign-in methods</dt><dd>{[hasPassword && 'Email and password', providers.includes('google') && 'Google'].filter(Boolean).join(' · ') || '—'}</dd></div>
            <div><dt>Joined</dt><dd>{joined.format(u.createdAt)}</dd></div>
          </dl>
          {verifiedNow && <p className="ui-status ui-status--ok" role="status">Thanks, your email is confirmed.</p>}
          {!u.emailVerified && (emailConfigured()
            ? <ResendVerificationButton />
            : <p className="ui-small" style={{ marginTop: 12 }}>Email confirmation turns on once ARC connects an email service.</p>)}
          {googleConfigured() && !providers.includes('google') && <div style={{ marginTop: 14 }}><GoogleButton mode="link" /></div>}
        </section>

        {hasPassword && (
          <section className="ui-paper" aria-labelledby="password-title">
            <h2 id="password-title" className="ui-h2">CHANGE<br /><span>PASSWORD.</span></h2>
            <p className="ui-small" style={{ marginTop: 10 }}>Changing it signs you out on your other devices.</p>
            <ChangePasswordForm />
          </section>
        )}

        <section className="ui-frame account-danger" aria-labelledby="delete-title">
          <h2 id="delete-title" className="ui-label" style={{ marginBottom: 10 }}>DELETE ACCOUNT</h2>
          <p className="ui-small">This removes your account, learning style and progress for good. It can’t be undone.</p>
          {u.role === 'admin'
            ? <p className="ui-small" style={{ marginTop: 10 }}>Admins can’t delete their own account. Ask another admin to change your role first.</p>
            : hasPassword ? <DeleteAccountForm email={u.email} /> : <p className="ui-small">Set a password first, or ask an admin to remove the account.</p>}
        </section>
      </div>
    </PageShell>
  );
}
