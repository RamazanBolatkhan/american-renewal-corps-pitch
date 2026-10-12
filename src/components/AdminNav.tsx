'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from './Icon';

const links: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'OVERVIEW', icon: 'grid' },
  { href: '/admin/imports', label: 'PLAN IMPORTS', icon: 'upload' },
  { href: '/admin/content', label: 'CONTENT', icon: 'layers' },
  { href: '/admin/users', label: 'USERS & ROLES', icon: 'user' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="ui-sidenav" aria-label="Admin">
      <span className="ui-label">ADMIN</span>
      {links.map(link => (
        <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
          <Icon name={link.icon} /> {link.label}
        </Link>
      ))}
    </nav>
  );
}
