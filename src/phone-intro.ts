/** An original SVG illustration, drawn and enlarged into the real interactive phone. */
export function mountPhoneIntro() {
  const stage = document.querySelector<HTMLElement>('.demo-stage')!;
  const phone = stage.querySelector<HTMLElement>('.phone-wrap')!;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const replay = document.createElement('button');
  replay.className = 'intro-replay';
  replay.textContent = 'REPLAY INTRO ↗';
  replay.setAttribute('aria-label', 'Replay worker and phone introduction');
  stage.querySelector('.stage-edition')!.replaceWith(replay);
  let overlay: HTMLDivElement | undefined;
  let animations: Animation[] = [];
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  function finish() {
    running = false;
    clearTimeout(cleanupTimer);
    animations.forEach(animation => animation.cancel());
    animations = [];
    overlay?.remove();
    overlay = undefined;
    stage.classList.remove('intro-playing');
  }
  function play() {
    finish();
    if (motion.matches) return;
    running = true;
    overlay = document.createElement('div');
    overlay.className = 'worker-intro';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `<div class="worker-scene"><svg viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="work-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0v9" stroke="currentColor" stroke-width=".6" opacity=".22"/></pattern></defs>
      <g class="worker-guides" stroke="currentColor" stroke-width=".7" opacity=".28"><circle cx="270" cy="350" r="215"/><circle cx="270" cy="350" r="228" stroke-dasharray="2 10"/><path d="M45 570h440M80 130v495M455 130v495M65 155h405M346 360v245M280 481h140"/><path d="M72 155h16m-8-8v16M447 570h16m-8-8v16"/></g>
      <g class="worker-lines" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <!-- Hard hat, fitted band, and a face in three-quarter profile. -->
        <path fill="var(--green)" d="M168 213c0-54 30-87 76-88 47-1 79 34 81 84l12 9-2 13-177 1-3-12z"/>
        <path d="M173 210c39-8 103-8 148 0M227 129l-6 66m34-69 6 69M180 180l10 14m116-18-9 17M161 221h173"/>
        <path fill="var(--green)" d="M182 232l3 49c1 13 9 22 20 24l10 28 43 24 41-38-1-24c13-6 18-18 19-30l11-10-13-14-3-13"/>
        <path d="M184 249c-17-11-21 10-11 21l13 7m7-25-5 11 9 5M283 241l20 1m-14 10h3m8 24-16 1m13 17-25 6-16-11M204 293l19 13m-8 27 20 34 23-10 19 19 22-57"/>
        <!-- Work jacket, shoulder seams, rolled sleeves and vest tape. -->
        <path fill="var(--green)" d="m215 326-66 28c-22 10-31 31-40 65l-29 111c-7 28 4 49 28 55l44 8-9 121h233l-5-148 37-18c20-12 29-30 22-53l-28-98c-6-25-21-43-45-52l-58-24-22 55-19-19-23 10z"/>
        <path fill="url(#work-hatch)" d="m152 359 21-9-12 164-48-11 26-112zm175-12 22 9 20 88-24 7z"/>
        <path d="m173 350-9 130m-39-75-15 63m90-128-15 169m14 82-9 123m92-354 5 55m-29-58-1 115m47-129 17 80M151 611h223M151 625h223M186 398l44 6-5 53-44-5zM194 411l26 3m-72 250 220 1M233 634v71m-24-67h47v15h-47z"/>
        <!-- Forearm leads into a hand supporting the phone. -->
        <path fill="var(--green)" d="m101 490 63 13-6 28 79 3 59-28 17 36-62 43c-12 8-26 10-40 8l-103-19c-21-4-27-22-21-42z"/>
        <path d="m102 504 52 11m-44 43 98 18m-67-58-6 32m84 27 22-6"/>
        <path fill="var(--green)" d="m375 436 25 58-30 32-21-16 16-30-17-32z"/>
        <!-- The illustrated device has the same proportions as the live phone. -->
        <rect x="300" y="390" width="92" height="183" rx="14" fill="var(--green)" stroke="var(--orange)" stroke-width="2.6"/>
        <rect x="306" y="397" width="80" height="169" rx="10" stroke-width="1"/>
        <path d="M335 402h22m-25 156h28" stroke-width="2"/>
        <path fill="var(--green)" d="m296 503 15-25c4-7 11-4 11 2l-5 26 8 17-7 27-18 10-23-14m104-76 12-2c9-2 13 9 5 13l-12 5m-3 2 14-3c9-1 12 10 4 13l-15 4m-2 2 13-2c9 0 10 10 3 13l-17 4m-1 3 11-1c8 0 9 9 2 12l-17 5"/>
      </g>
      <g class="worker-screen" stroke="var(--orange)" stroke-width="1.5"><path d="m350 434-13 20h11l-6 17 17-22h-12z"/><path d="M319 485h39m-39 8h27M322 536h46" opacity=".6"/></g>
      <g fill="currentColor" font-family="DM,Arial,sans-serif" font-size="9" letter-spacing="2"><text x="95" y="91">BUILT BY PEOPLE.</text><text x="95" y="109" fill="var(--orange)">POWERED BY POSSIBILITY.</text><text x="399" y="593" font-size="7">FIG. 001</text></g>
    </svg></div>`;
    overlay.querySelectorAll('.worker-lines path, .worker-lines rect').forEach(line => line.setAttribute('pathLength', '1'));
    stage.append(overlay);
    const scene = overlay.querySelector<HTMLElement>('.worker-scene')!;
    const stageBox = stage.getBoundingClientRect();
    const phoneBox = phone.getBoundingClientRect();
    const finalScale = phoneBox.width / 92;
    const centerX = phoneBox.left - stageBox.left + phoneBox.width / 2;
    const centerY = phoneBox.top - stageBox.top + phoneBox.height / 2;
    const initialScale = Math.max(.15, Math.min(stageBox.width / 600, (centerY - 45) / 390.5, (stageBox.height - centerY - 25) / 233, .8));
    scene.style.left = `${centerX - 346}px`;
    scene.style.top = `${centerY - 481.5}px`;
    stage.classList.add('intro-playing');
    const timing = { duration: 2400, fill: 'both' as FillMode };
    animations.push(scene.animate([
      { transform: `scale(${initialScale * .96})`, opacity: 0, offset: 0 },
      { transform: `scale(${initialScale})`, opacity: 1, offset: .18 },
      { transform: `scale(${initialScale})`, opacity: 1, offset: .44, easing: 'cubic-bezier(.65,0,.2,1)' },
      { transform: `scale(${finalScale})`, opacity: 1, offset: .87 },
      { transform: `scale(${finalScale})`, opacity: 0, offset: 1 },
    ], timing));
    animations.push(phone.animate([
      { opacity: 0, transform: 'scale(.97)', offset: 0 },
      { opacity: 0, transform: 'scale(.97)', offset: .79 },
      { opacity: 1, transform: 'scale(1)', offset: 1 },
    ], timing));
    cleanupTimer = setTimeout(finish, 2450);
  }
  replay.addEventListener('click', play);
  // Any intent to interact skips the decorative intro immediately.
  document.addEventListener('pointerdown', () => { if (running) finish(); });
  document.addEventListener('keydown', () => { if (running) finish(); });
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  window.addEventListener('resize', () => {
    // Browsers can emit resize during navigation without a size change.
    if (window.innerWidth === viewportWidth && window.innerHeight === viewportHeight) return;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    if (running) play();
  });
  motion.addEventListener('change', finish);
  // Start after fonts and the first layout settle, on every page load.
  let startCancelled = false;
  const cancelPendingStart = () => { startCancelled = true; };
  document.addEventListener('pointerdown', cancelPendingStart, { once: true });
  document.addEventListener('keydown', cancelPendingStart, { once: true });
  void document.fonts.ready.then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!startCancelled) play();
    }));
  });
}
