import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/account/forms';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { emailConfigured } from '@/lib/email';

export const metadata: Metadata = { title: 'Forgot password — American Renewal Corps' };

export default function ForgotPasswordPage() {
  const email = emailConfigured();
  return (
    <PageShell>
      <div className="ui-split">
        <section>
          <Eyebrow>FORGOT PASSWORD</Eyebrow>
          <h1 className="ui-title">LET’S GET YOU<br /><span>BACK IN.</span></h1>
          <p className="ui-lede">
            {email
              ? 'Enter the email you registered with and we’ll send a link to choose a new password.'
              : 'Password emails aren’t connected yet. An ARC admin can set a temporary password for you from the admin area.'}
          </p>
        </section>
        <section className="ui-paper" aria-labelledby="forgot-title">
          <h2 id="forgot-title" className="ui-h2">RESET<br /><span>PASSWORD.</span></h2>
          {email ? <ForgotPasswordForm /> : <p className="ui-form-foot">Contact your ARC admin, then log in with the temporary password they give you.</p>}
          <p className="ui-form-foot"><Link href="/login">Back to log in</Link></p>
        </section>
      </div>
    </PageShell>
  );
}
