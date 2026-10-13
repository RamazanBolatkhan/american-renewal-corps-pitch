import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { AuthForm } from '@/components/AuthForm';
import { googleConfigured } from '@/lib/auth';
import { safeNext } from '@/lib/next-path';
import { getSession, isMember } from '@/lib/session';

export const metadata: Metadata = { title: 'Log in — American Renewal Corps' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (isMember(await getSession())) redirect(next);

  return (
    <PageShell actions={<Link className="ui-button ui-button--outline" href={`/register?next=${encodeURIComponent(next)}`}>CREATE ACCOUNT</Link>}>
      <div className="ui-split">
        <section>
          <Eyebrow>WELCOME BACK</Eyebrow>
          <h1 className="ui-title">PICK UP<br /><span>WHERE YOU LEFT OFF.</span></h1>
          <p className="ui-lede">Your lessons, progress and review schedule are waiting. New here? You can try the demo without an account.</p>
        </section>
        <section className="ui-paper" aria-labelledby="login-title">
          <h2 id="login-title" className="ui-h2">LOG IN<br /><span>TO ARC.</span></h2>
          {params.reset === '1' && <p className="ui-status ui-status--ok" role="status" style={{ marginTop: 16 }}>Password changed. Log in with your new password.</p>}
          <AuthForm mode="login" next={next} google={googleConfigured()} />
          <p className="ui-form-foot"><Link href="/forgot-password">Forgot password?</Link></p>
          <p className="ui-form-foot">New to ARC? <Link href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link> or <Link href="/learn/style">try the demo</Link></p>
        </section>
      </div>
    </PageShell>
  );
}
