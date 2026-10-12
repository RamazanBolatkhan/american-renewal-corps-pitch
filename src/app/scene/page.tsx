import type { Metadata } from 'next';
import '@/components/iso/iso.css';
import '@/components/figures/hall/hall.css';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { HallArt } from '@/components/figures/hall/art';
import { allFaults, HallDemo } from '@/components/figures/hall/HallDemo';

export const metadata: Metadata = { title: 'Data hall scene — American Renewal Corps' };

export default async function ScenePage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const { preset } = await searchParams;
  return (
    <PageShell>
      <Eyebrow>SCENE PREVIEW</Eyebrow>
      <h1 className="ui-title" style={{ fontSize: 'clamp(36px,4.5vw,64px)' }}>THE DATA HALL</h1>
      <p className="ui-lede">The illustrated scene the Game and Sim lessons play on. Switch each state to see how containment breaks.</p>
      <div style={{ marginTop: 28 }}>
        <HallDemo art={<HallArt key="art" />} initial={preset === 'faults' ? allFaults : undefined} />
      </div>
    </PageShell>
  );
}
