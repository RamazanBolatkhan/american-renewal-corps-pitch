import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { AdminNav } from '@/components/AdminNav';
import { requireStaff } from '@/lib/session';

export const metadata: Metadata = { title: 'Admin — American Renewal Corps' };

// Every admin page and admin action also checks on its own; this layout check is not the only lock.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  return (
    <PageShell footerNote={`SIGNED IN AS ${session.user.role?.toUpperCase()} · ${session.user.email.toUpperCase()}`}>
      <div className="ui-admin">
        <AdminNav />
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </PageShell>
  );
}
