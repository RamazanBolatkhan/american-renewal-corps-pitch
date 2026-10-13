import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './system.css';

// Inter is the copy face of the shadcn preset; next/font self-hosts it at build time.
const inter = Inter({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'American Renewal Corps — Build What’s Next',
  description: 'Small lessons. Real skills. Big futures. Explore an interactive mobile learning concept for the next generation of skilled trades.',
  robots: { index: false, follow: false },
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
