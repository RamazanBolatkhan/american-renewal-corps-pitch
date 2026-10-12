import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageShell } from '@/components/PageShell';
import { Icon } from '@/components/Icon';

export const metadata: Metadata = { title: 'Start learning — American Renewal Corps' };

export default function StartPage() {
  return (
    <PageShell>
      <div className="ui-split">
        <section>
          <Eyebrow>YOUR NEXT CHAPTER / ARC</Eyebrow>
          <h1 className="ui-title">START WHERE<br /><span>YOU ARE.</span></h1>
          <p className="ui-lede">
            Try a real module first: Cooling &amp; airflow, from the Data Center Technician sample program.
            Pick how you like to learn, and every lesson starts in that format. Create an account when you want to keep your progress.
          </p>
        </section>
        <nav className="ui-stack" aria-label="How to start">
          <Link className="ui-choice ui-choice--primary" href="/learn/style">
            <span className="ui-choice-num">01</span>
            <div><h2>TRY THE DEMO</h2><p>No sign-up. Choose a learning style and start the first lesson.</p></div>
            <Icon name="arrow" />
          </Link>
          <Link className="ui-choice" href="/register">
            <span className="ui-choice-num">02</span>
            <div><h2>CREATE AN ACCOUNT</h2><p>Save your progress and pick up on any device.</p></div>
            <Icon name="arrow" />
          </Link>
          <Link className="ui-choice" href="/login">
            <span className="ui-choice-num">03</span>
            <div><h2>LOG IN</h2><p>Already learning with ARC? Continue where you left off.</p></div>
            <Icon name="arrow" />
          </Link>
        </nav>
      </div>
    </PageShell>
  );
}
