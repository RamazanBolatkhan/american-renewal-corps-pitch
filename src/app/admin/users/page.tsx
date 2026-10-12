import { desc } from 'drizzle-orm';
import { setUserRole } from '@/app/actions/admin';
import { Eyebrow, SkeletonNote } from '@/components/ui';
import { db } from '@/db';
import { user } from '@/db/schema';
import { roleNames } from '@/lib/permissions';
import { requireStaff } from '@/lib/session';

const columns = ['DEMO', 'STUDENT', 'EDITOR', 'PUBLISHER', 'ADMIN'] as const;
const permissions: [string, boolean[]][] = [
  ['Learn, answer, own progress', [true, true, true, true, true]],
  ['Progress saved across devices', [false, true, true, true, true]],
  ['Open the admin area', [false, false, true, true, true]],
  ['Upload plans, edit and regenerate lessons', [false, false, true, true, true]],
  ['Approve briefs and publish', [false, false, false, true, true]],
  ['Manage users and roles', [false, false, false, false, true]],
];

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export default async function UsersPage() {
  const session = await requireStaff('/admin/users');
  const isAdmin = session.user.role === 'admin';
  const users = isAdmin ? await db.select().from(user).orderBy(desc(user.createdAt)).limit(200) : [];
  const accounts = users.filter(u => !u.isAnonymous);
  const demoCount = users.length - accounts.length;

  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>ACCESS</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>USERS &amp; ROLES</h1>
        </div>
        {isAdmin && <span className="ui-pill">{accounts.length} ACCOUNTS · {demoCount} DEMO VISITORS</span>}
      </div>

      <section aria-labelledby="users-title">
        <h2 id="users-title" className="ui-h3" style={{ marginBottom: 16 }}>USERS</h2>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>JOINED</th></tr></thead>
            <tbody>
              {!isAdmin && <tr><td colSpan={4} className="ui-empty">Only admins can see and manage accounts.</td></tr>}
              {isAdmin && accounts.length === 0 && <tr><td colSpan={4} className="ui-empty">No accounts yet.</td></tr>}
              {accounts.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.id === session.user.id ? (
                      <span className="ui-pill ui-pill--warn">{u.role?.toUpperCase()} · YOU</span>
                    ) : (
                      <form className="ui-role-form" action={setUserRole}>
                        <input type="hidden" name="userId" value={u.id} />
                        <label className="ui-sr" htmlFor={`role-${u.id}`}>Role for {u.email}</label>
                        <select id={`role-${u.id}`} name="role" defaultValue={u.role ?? 'student'}>
                          {roleNames.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button type="submit">SAVE</button>
                      </form>
                    )}
                  </td>
                  <td>{dateFormat.format(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ui-section" aria-labelledby="roles-title">
        <h2 id="roles-title" className="ui-h3">WHAT EACH ROLE CAN DO</h2>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead><tr><th>PERMISSION</th>{columns.map(role => <th key={role}>{role}</th>)}</tr></thead>
            <tbody>
              {permissions.map(([label, allowed]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {allowed.map((yes, i) => (
                    <td key={columns[i]} className={yes ? 'ui-yes' : 'ui-no'}>
                      <span aria-hidden="true">{yes ? '✓' : '—'}</span><span className="ui-sr">{yes ? 'Allowed' : 'Not allowed'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <SkeletonNote>New accounts start as students. Only an admin can change roles, and admins can’t remove their own admin role.</SkeletonNote>
    </>
  );
}
