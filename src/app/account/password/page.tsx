import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '@/components/account/forms';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { safeNext } from '@/lib/next-path';
import { getSession, isMember } from '@/lib/session';

export const metadata: Metadata = { title: 'Choose your password — American Renewal Corps' };

export default async function ChoosePasswordPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const session = await getSession();
  if (!session || !isMember(session)) redirect(`/login?next=${encodeURIComponent('/account/password')}`);
  if (!session.user.mustChangePassword) redirect(next);
  return (
    <PageShell>
      <div className="ui-split">
        <section>
          <Eyebrow>ONE MORE STEP</Eyebrow>
          <h1 className="ui-title">CHOOSE YOUR<br /><span>OWN PASSWORD.</span></h1>
          <p className="ui-lede">An ARC admin set a temporary password for you. Replace it with one only you know before you continue.</p>
        </section>
        <section className="ui-paper" aria-labelledby="choose-title">
          <h2 id="choose-title" className="ui-h2">NEW<br /><span>PASSWORD.</span></h2>
          <ChangePasswordForm forced next={next} />
        </section>
      </div>
    </PageShell>
  );
}
