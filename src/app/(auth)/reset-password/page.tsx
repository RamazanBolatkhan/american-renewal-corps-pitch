import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/account/forms';
import { Eyebrow, PageShell } from '@/components/PageShell';

export const metadata: Metadata = { title: 'Choose a new password — American Renewal Corps' };

/** Better Auth's emailed link validates the token and redirects here with ?token=… (or ?error=INVALID_TOKEN). */
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  return (
    <PageShell>
      <div className="ui-split">
        <section>
          <Eyebrow>RESET PASSWORD</Eyebrow>
          <h1 className="ui-title">CHOOSE A<br /><span>NEW PASSWORD.</span></h1>
          <p className="ui-lede">Pick something you don’t use anywhere else. You’ll be signed out on your other devices.</p>
        </section>
        <section className="ui-paper" aria-labelledby="reset-title">
          <h2 id="reset-title" className="ui-h2">NEW<br /><span>PASSWORD.</span></h2>
          {token && !error ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="ui-status ui-status--error" role="alert">This reset link has expired or isn’t valid. <Link href="/forgot-password">Ask for a new one</Link>.</p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
