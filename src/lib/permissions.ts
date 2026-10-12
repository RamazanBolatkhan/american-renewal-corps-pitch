import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

/** Who can do what. Server code checks these; hiding a button is never the lock. */
export const statement = {
  ...defaultStatements,
  content: ['upload', 'edit', 'regenerate', 'publish'],
  analytics: ['view'],
} as const;

export const ac = createAccessControl(statement);

export const student = ac.newRole({ content: [], analytics: [] });
export const editor = ac.newRole({ content: ['upload', 'edit', 'regenerate'] });
export const publisher = ac.newRole({ content: ['upload', 'edit', 'regenerate', 'publish'], analytics: ['view'] });
export const admin = ac.newRole({
  ...adminAc.statements,
  content: ['upload', 'edit', 'regenerate', 'publish'],
  analytics: ['view'],
});

export const roles = { student, editor, publisher, admin };
export type Role = keyof typeof roles;
export const roleNames = Object.keys(roles) as Role[];

/** Roles allowed into /admin. */
export const staffRoles: readonly Role[] = ['editor', 'publisher', 'admin'];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && value in roles;
}

export function isStaff(role: string | null | undefined) {
  return staffRoles.includes(role as Role);
}

/** Checks a role against the access-control rules above. */
export function can(role: string | null | undefined, action: 'upload' | 'edit' | 'regenerate' | 'publish') {
  if (!isRole(role)) return false;
  return roles[role].authorize({ content: [action] }).success;
}
