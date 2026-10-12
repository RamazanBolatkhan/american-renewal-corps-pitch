import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Log in — American Renewal Corps' };

export default function LoginPage() {
  return (
    <PageShell actions={<Link className="ui-button ui-button--outline" href="/register">CREATE ACCOUNT</Link>}>
      <div className="ui-split">
        <section>
          <Eyebrow>WELCOME BACK</Eyebrow>
          <h1 className="ui-title">PICK UP<br /><span>WHERE YOU LEFT OFF.</span></h1>
          <p className="ui-lede">Your lessons, progress and review schedule are waiting. New here? You can try the demo without an account.</p>
        </section>
        <section className="ui-paper" aria-labelledby="login-title">
          <h2 id="login-title" className="ui-h2">LOG IN<br /><span>TO ARC.</span></h2>
          <AuthForm mode="login" />
          <p className="ui-form-foot">New to ARC? <Link href="/register">Create an account</Link> or <Link href="/learn/style">try the demo</Link></p>
        </section>
      </div>
    </PageShell>
  );
}
