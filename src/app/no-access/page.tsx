import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'No access — American Renewal Corps' };

export default function NoAccessPage() {
  return (
    <PageShell>
      <Eyebrow>ADMIN AREA</Eyebrow>
      <h1 className="ui-title">THIS AREA IS<br /><span>FOR STAFF.</span></h1>
      <p className="ui-lede">Your account doesn’t have access to this page. If you think it should, ask an ARC admin to change your role.</p>
      <div className="ui-pager" style={{ justifyContent: 'flex-start' }}>
        <Link className="ui-button ui-button--paper" href="/learn">BACK TO LEARNING <Icon name="arrow" /></Link>
      </div>
    </PageShell>
  );
}
