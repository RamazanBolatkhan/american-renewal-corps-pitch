'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';
import { AppLinks, slides } from './slides';

const last = slides.length - 1;
const pad = (n: number) => String(n).padStart(2, '0');

/** Slide number from the URL hash (#3), so the browser's Back button returns to the same slide after visiting the app. */
function fromHash() {
  const n = Number(window.location.hash.slice(1));
  return Number.isInteger(n) && n >= 1 && n <= slides.length ? n - 1 : 0;
}

export function Deck({ brand }: { brand: React.ReactNode }) {
  const [index, setIndex] = useState(0);

  const go = useCallback((next: number) => {
    const i = Math.min(Math.max(next, 0), last);
    setIndex(i);
    window.history.replaceState(null, '', `#${i + 1}`);
    document.getElementById('slide')?.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setIndex(fromHash());
    const onHash = () => setIndex(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const onControl = (e.target as HTMLElement).closest('a, button, input, textarea, select');
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !onControl)) go(index + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(index - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(last);
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (/^[1-9]$/.test(e.key)) go(Number(e.key) - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go]);

  const slide = slides[index];

  return (
    <div className="ui deck">
      <a className="ui-skip" href="#slide">Skip to slide</a>
      <header className="deck-bar">
        {brand}
        <span className="deck-count" aria-live="polite">
          <span className="ui-sr">Slide </span>{pad(index + 1)} <span aria-hidden="true">/</span><span className="ui-sr"> of </span> {pad(slides.length)}
          <span className="ui-sr">: {slide.kicker}</span>
        </span>
        <nav className="deck-bar-actions" aria-label="Presentation">
          <button className="ui-link deck-fullscreen" type="button" onClick={toggleFullscreen}>FULL SCREEN</button>
          <a className="ui-button ui-button--outline" href="/">EXIT <Icon name="arrow" /></a>
        </nav>
      </header>

      <main id="slide" className="deck-stage" tabIndex={-1}>
        <section key={slide.id} className="deck-slide" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${slide.kicker}`}>
          <div className="deck-head">
            <p className="ui-eyebrow"><span className="ui-square" />{pad(index + 1)} / {slide.kicker}</p>
            <h1 className="deck-title">{slide.title}</h1>
            <p className="deck-lede">{slide.lede}</p>
          </div>
          <div className="deck-content">
            <div className="deck-body">{slide.body}</div>
            <aside className="deck-app" aria-label="Show in the app">
              <p className="ui-label">SHOW IN THE APP</p>
              <AppLinks links={slide.app} />
            </aside>
          </div>
        </section>
      </main>

      <footer className="deck-controls">
        <button className="ui-button ui-button--outline" type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide">
          <span className="deck-back"><Icon name="arrow" /></span> PREV
        </button>
        <ol className="deck-dots">
          {slides.map((s, i) => (
            <li key={s.id}>
              <button type="button" onClick={() => go(i)} aria-current={i === index ? 'step' : undefined} aria-label={`Slide ${i + 1}: ${s.kicker}`}>
                <span>{pad(i + 1)}</span>
              </button>
            </li>
          ))}
        </ol>
        <button className="ui-button ui-button--paper" type="button" onClick={() => go(index + 1)} disabled={index === last} aria-label="Next slide">
          NEXT <Icon name="arrow" />
        </button>
      </footer>
    </div>
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.().catch(() => {});
}
