import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './system.css';

export const metadata: Metadata = {
  title: 'American Renewal Corps — Build What’s Next',
  description: 'Small lessons. Real skills. Big futures. Explore an interactive mobile learning concept for the next generation of skilled trades.',
  robots: { index: false, follow: false },
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
