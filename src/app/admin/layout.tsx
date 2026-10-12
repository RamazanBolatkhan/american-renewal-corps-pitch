import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { AdminNav } from '@/components/AdminNav';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Admin — American Renewal Corps' };

// Skeleton: no session or role check yet. Better Auth's admin plugin will guard this layout and every admin action.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell
      footerNote="ADMIN PREVIEW · ACCESS CONTROL NOT CONNECTED YET"
      actions={<span className="ui-role"><Icon name="lock" /> ADMIN PREVIEW</span>}
    >
      <div className="ui-admin">
        <AdminNav />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </PageShell>
  );
}
