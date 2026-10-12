import { Eyebrow, SkeletonNote } from '@/components/PageShell';

const roles = ['DEMO', 'STUDENT', 'EDITOR', 'PUBLISHER', 'ADMIN'] as const;
const permissions: [string, boolean[]][] = [
  ['Learn, answer, own progress', [true, true, true, true, true]],
  ['Progress saved across devices', [false, true, true, true, true]],
  ['Open the admin area', [false, false, true, true, true]],
  ['Upload plans, edit and regenerate lessons', [false, false, true, true, true]],
  ['Approve briefs and publish', [false, false, false, true, true]],
  ['Manage users and roles', [false, false, false, false, true]],
];

export default function UsersPage() {
  return (
    <>
      <div className="ui-admin-head">
        <div>
          <Eyebrow>ACCESS</Eyebrow>
          <h1 className="ui-title" style={{ fontSize: 'clamp(40px,5vw,76px)' }}>USERS &amp; ROLES</h1>
        </div>
      </div>

      <section aria-labelledby="users-title">
        <h2 id="users-title" className="ui-h3" style={{ marginBottom: 16 }}>USERS</h2>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>SIGN-IN</th><th>JOINED</th></tr></thead>
            <tbody><tr><td colSpan={5} className="ui-empty">No accounts yet. Users appear here after sign-up is connected.</td></tr></tbody>
          </table>
        </div>
      </section>

      <section className="ui-section" aria-labelledby="roles-title">
        <h2 id="roles-title" className="ui-h3">WHAT EACH ROLE CAN DO</h2>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead><tr><th>PERMISSION</th>{roles.map(role => <th key={role}>{role}</th>)}</tr></thead>
            <tbody>
              {permissions.map(([label, allowed]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {allowed.map((yes, i) => (
                    <td key={roles[i]} className={yes ? 'ui-yes' : 'ui-no'}>
                      <span aria-hidden="true">{yes ? '✓' : '—'}</span><span className="ui-sr">{yes ? 'Allowed' : 'Not allowed'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <SkeletonNote>New accounts start as students. Only an admin can change roles; the first admin is set by configuration.</SkeletonNote>
    </>
  );
}
