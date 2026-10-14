import type { Metadata } from 'next';
import '@/components/presentation/deck.css';
import { Deck } from '@/components/presentation/Deck';
import { Wordmark } from '@/components/PageShell';

export const metadata: Metadata = { title: 'Presentation — American Renewal Corps' };

export default function PresentationPage() {
  return <Deck brand={<Wordmark />} />;
}
