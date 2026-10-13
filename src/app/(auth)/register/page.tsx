import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { AuthForm } from '@/components/AuthForm';
import { Icon } from '@/components/Icon';
import { googleConfigured } from '@/lib/auth';
import { safeNext } from '@/lib/next-path';
import { getSession, isMember } from '@/lib/session';

export const metadata: Metadata = { title: 'Create account — American Renewal Corps' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const session = await getSession();
  if (isMember(session)) redirect(next);
  const fromDemo = Boolean(session?.user.isAnonymous);

  return (
    <PageShell actions={<Link className="ui-link" href={`/login?next=${encodeURIComponent(next)}`}>ALREADY LEARNING? LOG IN</Link>}>
      <div className="ui-split">
        <section>
          <Eyebrow>CREATE ACCOUNT</Eyebrow>
          <h1 className="ui-title">KEEP WHAT<br /><span>YOU LEARN.</span></h1>
          <p className="ui-lede">An account keeps your progress, your learning style and your review schedule in one place.</p>
          <ul className="ui-checklist">
            <li><Icon name="check" />{fromDemo ? 'Your demo choices carry over to this account.' : 'Progress from the demo carries over when you sign up.'}</li>
            <li><Icon name="check" />Continue on your phone or a computer.</li>
            <li><Icon name="check" />Change your learning style at any time.</li>
          </ul>
        </section>
        <section className="ui-paper" aria-labelledby="register-title">
          <h2 id="register-title" className="ui-h2">CREATE YOUR<br /><span>ACCOUNT.</span></h2>
          <AuthForm mode="register" next={next} google={googleConfigured()} />
          <p className="ui-form-foot">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></p>
        </section>
      </div>
    </PageShell>
  );
}
