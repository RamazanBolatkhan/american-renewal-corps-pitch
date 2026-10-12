import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { AuthForm } from '@/components/AuthForm';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Create account — American Renewal Corps' };

export default function RegisterPage() {
  return (
    <PageShell actions={<a className="ui-link" href="/login">ALREADY LEARNING? LOG IN</a>}>
      <div className="ui-split">
        <section>
          <Eyebrow>CREATE ACCOUNT</Eyebrow>
          <h1 className="ui-title">KEEP WHAT<br /><span>YOU LEARN.</span></h1>
          <p className="ui-lede">An account keeps your progress, your learning style and your review schedule in one place.</p>
          <ul className="ui-checklist">
            <li><Icon name="check" />Progress from the demo carries over when you sign up.</li>
            <li><Icon name="check" />Continue on your phone or a computer.</li>
            <li><Icon name="check" />Change your learning style at any time.</li>
          </ul>
        </section>
        <section className="ui-paper" aria-labelledby="register-title">
          <h2 id="register-title" className="ui-h2">CREATE YOUR<br /><span>ACCOUNT.</span></h2>
          <AuthForm mode="register" />
          <p className="ui-form-foot">Already have an account? <Link href="/login">Log in</Link></p>
        </section>
      </div>
    </PageShell>
  );
}
