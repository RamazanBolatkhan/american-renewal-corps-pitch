import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow } from '@/components/PageShell';
import { DemoBanner, LearnShell } from '@/components/LearnShell';
import { FormatArt } from '@/components/FormatArt';
import { Icon } from '@/components/Icon';
import { formatInfo, formats, isFormat } from '@/lib/module';

export const metadata: Metadata = { title: 'Choose your learning style — American Renewal Corps' };

export default async function StylePage({ searchParams }: { searchParams: Promise<{ current?: string }> }) {
  const { current } = await searchParams;
  const selected = isFormat(current) ? current : undefined;
  return (
    <LearnShell>
      <DemoBanner />
      <Eyebrow>STEP 01 / LEARNING STYLE</Eyebrow>
      <h1 className="ui-title">HOW DO YOU<br /><span>LIKE TO LEARN?</span></h1>
      <p className="ui-lede">
        Your choice decides how each lesson starts. You’ll still learn the same facts as everyone else and see every format along the way.
        You can switch at any time.
      </p>
      <nav className="ui-style-grid" aria-label="Learning styles">
        {formats.map(format => (
          <Link key={format} className="ui-style-card" href={`/learn?style=${format}`} aria-current={selected === format ? 'true' : undefined}>
            <FormatArt format={format} />
            <h2>{formatInfo[format].label.toUpperCase()}</h2>
            <p>{formatInfo[format].description}</p>
            <span className="ui-label">{selected === format ? 'CURRENT STYLE' : 'START HERE'} <Icon name="arrow" /></span>
          </Link>
        ))}
      </nav>
    </LearnShell>
  );
}
