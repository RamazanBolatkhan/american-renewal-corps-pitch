import './styles.css';
import { inject } from '@vercel/analytics';
import { screens, stories, trades, type Screen, type Trade } from './demo-data';

inject();

const iconPaths: Record<string, string> = {
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6z"/>',
  book: '<path d="M12 5v16M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2z"/>',
  bolt: '<path d="m14 2-10 12h7l-1 8 10-12h-7z"/>',
  chart: '<path d="M4 20V12h4v8m2 0V8h4v12m2 0V3h4v17M2 21h20"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M11 10C4 1 19 1 14 10m0 2c11-3 6 11-1 3m-3-2c-4 10-12-2 0-2"/><circle cx="12" cy="12" r="10"/>',
  gear: '<path d="m9 3 1-2h4l1 2 3 2 2 1v4l-2 2 1 3-1 3-3 1-2 3H9l-1-3-3-1-2-3 1-3-2-2V6l3-1z"/><circle cx="11" cy="11" r="4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  fire: '<path d="M13 2c1 6-6 5-4 11 2 0 4-2 4-4 9 7 5 13-1 13S1 15 6 9c0 4 2 4 2 4-2-6 3-7 5-11Z"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
};
function icon(name: string, className = '') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.bolt}</svg>`; }
function illustration(name: string) {
 const paths: Record<string, string> = {
  circuit: '<path d="M65 110V56h170v108H65v-35M52 110h26m-20 19h14"/><circle cx="235" cy="110" r="24"/><path d="m219 94 32 32m0-32-32 32M116 56h70"/><circle cx="119" cy="56" r="4" fill="currentColor"/><circle cx="186" cy="56" r="4" fill="currentColor"/><path d="m123 56 49-22"/><path d="M80 196h140" stroke-dasharray="3 6"/>',
  wire: '<path d="M45 87h118c38 0 38 60 0 60H45z"/><ellipse cx="163" cy="117" rx="24" ry="30"/><ellipse cx="163" cy="117" rx="13" ry="18"/><path d="M163 99h96m-96 6h96m-96 6h96m-96 6h96m-96 6h96m-96 6h96m-96 6h96M90 87V53h35m70 64 20 56h40"/>',
  bulb: '<path d="M113 151c0-22-27-26-27-63a64 64 0 0 1 128 0c0 37-27 41-27 63zM113 164h74m-70 12h66m-56 13h46M136 149l-10-60 24 12 24-12-10 60M150 4v-16M63 32 47 17m190 15 16-15M53 90H30m217 0h23"/>',
  fan: '<circle cx="150" cy="111" r="75"/><circle cx="150" cy="111" r="15"/><path d="M140 96c-64-79 73-80 25 0m0 15c100-27 53 101-15 18m-17-7c-38 91-109-18 0-25"/>',
  sensor: '<path d="M137 121V42a13 13 0 0 1 26 0v79a30 30 0 1 1-26 0z"/><path d="M150 66v86m25-95h18m-18 24h12m-12 24h18"/><circle cx="150" cy="151" r="12" fill="currentColor"/>',
  controls: '<rect x="57" y="45" width="186" height="132" rx="12"/><rect x="80" y="65" width="100" height="70" rx="4"/><path d="M196 87h25m-13-12v25m-12 22h25M83 154h96"/><text x="97" y="112" font-size="32" fill="currentColor" stroke="none" font-family="monospace">21°</text>',
  gear: '<circle cx="150" cy="111" r="69" stroke-dasharray="18 9" stroke-width="13"/><circle cx="150" cy="111" r="46"/><circle cx="150" cy="111" r="21"/><path d="M150 90V66m0 66v24m21-45h24m-66 0h-24"/>',
  calendar: '<rect x="66" y="43" width="168" height="140" rx="5"/><path d="M66 80h168M108 30v28m84-28v28m-100 27h19m22 0h19m22 0h19m-100 27h19m22 0h19m22 0h19m-100 27h19m22 0h19"/><path d="m167 151 12 12 26-28" stroke-width="5"/>',
  clipboard: '<rect x="89" y="36" width="122" height="156" rx="5"/><rect x="126" y="25" width="48" height="23" rx="4" fill="var(--paper)"/><path d="m108 81 6 6 10-13m-16 40 6 6 10-13m-16 40 6 6 10-13m10-53h55m-55 33h55m-55 33h55"/>',
 };
 return `<svg class="technical-art" viewBox="0 0 300 220" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 17h16m-8-8v16m232-8h16m-8-8v16M22 203h16m-8-8v16m232-8h16m-8-8v16" stroke-width="1" opacity=".4"/>${paths[name] || paths.circuit}</svg>`;
}

let screen: Screen = 'home';
let trade: Trade = 'electrical';
let lessonIndex = 0;
let questionIndex = 0;
let answer: number | null = null;
let checked = false;
let finished = false;
const completedLessons = new Set<Trade>();
const completedPractice = new Set<Trade>();
const xp = () => completedLessons.size * 30 + completedPractice.size * 60;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<a class="skip-link" href="#demo">Skip to interactive demo</a>
<div class="site-shell">
<header class="site-header"><a class="brand" href="#home" aria-label="American Renewal Corps home"><span class="wordmark">arc<span>✳</span></span><span class="brand-name">AMERICAN<br>RENEWAL CORPS</span></a><span class="header-note"><i></i> A NEW GENERATION OF BUILDERS.</span><button class="outline-button" data-screen="trades">EXPLORE THE APP ${icon('arrow')}</button></header>
<main class="experience"><section class="story-column" aria-label="About this app"><div id="story" aria-live="polite" aria-atomic="true"></div><nav class="chapter-nav" aria-label="Explore the app concept">${screens.map((s,i)=>`<button data-screen="${s.id}" aria-current="${i===0?'page':'false'}"><span class="chapter-number">0${i+1}</span><span class="chapter-name">${s.label}</span><span class="chapter-dot"></span></button>`).join('')}</nav></section>
<section class="demo-stage" id="demo" aria-label="Interactive mobile app demonstration" tabindex="-1"><div class="stage-top"><span><i></i> INTERACTIVE APP CONCEPT</span><span class="stage-edition">ARC / 001</span><button class="mobile-focus" id="focus-app" aria-expanded="false">ENLARGE APP ↗</button></div><div class="stage-orbit orbit-a"></div><div class="stage-orbit orbit-b"></div><span class="stage-cross cross-a">+</span><span class="stage-cross cross-b">+</span><div class="margin-note">BUILT AROUND HUMAN POTENTIAL.</div><div class="phone-wrap"><div class="phone"><div class="phone-edge edge-one"></div><div class="phone-edge edge-two"></div><div class="phone-screen"><div class="phone-status"><span>9:41</span><span class="island"></span><span class="status-icons">▮▮▮ <svg viewBox="0 0 20 12" aria-hidden="true"><rect x="1" y="2" width="15" height="8" rx="2"/><path d="M18 4v4"/><rect x="3" y="4" width="11" height="4" fill="currentColor" stroke="none"/></svg></span></div><div class="phone-app-header"><span class="app-logo">arc<span>✳</span></span><span class="demo-badge">TRY IT OUT</span><div class="xp-pill" id="xp-count" aria-label="Experience points">${icon('bolt')}<span>0 XP</span></div></div><div id="phone-content" class="phone-content"></div><nav class="phone-nav" aria-label="Mobile app screens">${screens.map(s=>`<button data-screen="${s.id}" aria-label="${s.short}" aria-current="${s.id==='home'?'page':'false'}">${icon(s.icon)}<span>${s.short}</span></button>`).join('')}</nav><div class="home-indicator"></div></div></div></div><div class="stage-bottom"><span class="touch-indicator">${icon('compass')}</span><span>THIS ISN’T A SCREENSHOT.<br><strong>GO AHEAD. TAP SOMETHING.</strong></span><span class="curved-arrow">↗</span></div></section></main>
<footer class="site-footer"><span>REAL SKILLS. REAL PURPOSE. A NEW DIRECTION.</span><span class="footer-concept">INDEPENDENT CONCEPT · SAMPLE LEARNING ONLY</span><button id="reset-demo">RESET DEMO <span>↺</span></button></footer>
</div><div class="sr-only" id="announcement" role="status" aria-live="polite"></div>`;

const phoneContent = document.querySelector<HTMLDivElement>('#phone-content')!;
const story = document.querySelector<HTMLDivElement>('#story')!;
function renderStory() {
 const content = stories[screen];
 story.innerHTML = `<div class="story-eyebrow"><span class="tiny-square"></span>${content.eyebrow}</div><h1>${content.title.map((line,index)=>`<span class="headline-line"><span style="--line:${index}" class="${index===content.accent?'accent-line':''}">${line}</span></span>`).join('')}</h1><p class="story-description">${content.description}</p><div class="story-feature"><span class="feature-icon">${icon(screen==='home'?'star':screens.find(s=>s.id===screen)!.icon)}</span><div><h2>${content.feature}</h2><p>${content.detail}</p></div><span class="feature-corner">↗</span></div><div class="story-note">${content.note}<span>↗</span></div>`;
}
function homeView() {
 const current = trades[trade];
 return `<div class="phone-page home-page"><div class="app-eyebrow">YOUR NEXT CHAPTER</div><h2>BIG FUTURES.<br>SMALL STEPS<span>.</span></h2><p class="app-intro">A little progress, every day.</p><div class="daily-card"><div class="daily-top"><span>YOUR DAILY SPARK</span>${icon('fire')}</div><h3>LET’S BUILD<br>SOMETHING.</h3><p>Start with one idea.<br>See where it takes you.</p><div class="daily-art">${icon(current.icon)}</div><button class="app-button orange" data-screen="learn">${completedLessons.has(trade)?'REVISIT YOUR LESSON':'TRY YOUR FIRST LESSON'} ${icon('arrow')}</button></div><div class="app-section-heading"><h3>YOUR LEARNING PATH</h3><button data-screen="trades">Change ↗</button></div><button class="home-path" data-screen="learn"><span class="path-symbol">${icon(current.icon)}</span><span><strong>${current.name}</strong><small>${current.lesson}</small></span><span class="path-chevron">›</span></button><div class="daily-goal"><div><span>Today’s demo progress</span><strong>${completedLessons.has(trade)?1:0}/1 lesson</strong></div><div class="progress-bar"><span style="width:${completedLessons.has(trade)?100:0}%"></span></div><p>${completedLessons.has(trade)?'You showed up. That’s how it starts.':'Your first small win is waiting.'}</p></div></div>`;
}
function tradesView() {
 return `<div class="phone-page trades-page"><div class="app-eyebrow">FIND YOUR STARTING POINT</div><h2>WHAT’S<br>YOUR SPARK<span>?</span></h2><p class="app-intro">Choose a trade to try its sample lesson.</p><div class="trade-options">${(Object.keys(trades) as Trade[]).map((key,i)=>`<button class="trade-option ${key===trade?'selected':''}" data-trade="${key}" aria-pressed="${key===trade}"><span class="trade-icon">${icon(trades[key].icon)}</span><span class="trade-copy"><small>PATH 0${i+1}</small><strong>${trades[key].name}</strong><span>${trades[key].subtitle}</span></span><span class="radio-dot">${key===trade?icon('check'):''}</span></button>`).join('')}</div><p class="phone-disclaimer">Explore a direction. These are proposed learning paths, not open enrollment.</p><button class="app-button green" data-screen="learn">EXPLORE ${trade==='electrical'?'ELECTRICAL':trade==='systems'?'BUILDING SYSTEMS':'INDUSTRIAL'} ${icon('arrow')}</button></div>`;
}
function learnView() {
 const current=trades[trade], card=current.cards[lessonIndex];
 return `<div class="phone-page lesson-page"><div class="lesson-meta"><button class="back-button" data-action="lesson-back" aria-label="${lessonIndex===0?'Back to home':'Previous lesson card'}">←</button><span>${current.name.toUpperCase()} / FOUNDATIONS</span><strong>${lessonIndex+1}/3</strong></div><div class="lesson-steps">${current.cards.map((_,i)=>`<span class="${i<=lessonIndex?'filled':''}"></span>`).join('')}</div><span class="app-eyebrow">${current.lesson.toUpperCase()}</span><h2 class="lesson-title">${card.title}</h2><div class="lesson-illustration">${illustration(card.visual)}<span>${card.caption}</span></div><p class="lesson-body">${card.body}</p><div class="lesson-bottom"><p class="phone-disclaimer">Concept learning · not instructions for working on equipment.</p><button class="app-button green" data-action="lesson-next">${lessonIndex===2?(completedLessons.has(trade)?'FINISH REVIEW · PRACTICE':'FINISH LESSON · +30 XP'):'GOT IT. KEEP GOING.'} ${icon(lessonIndex===2?'check':'arrow')}</button></div></div>`;
}
function practiceView() {
 if(finished) return `<div class="phone-page complete-page"><span class="app-eyebrow">ONE MORE STEP FORWARD</span><div class="success-medal">${icon('star')}<span>✳</span><i>✦</i></div><h2>THAT’S HOW<br>IT CLICKS<span>.</span></h2><p>Three ideas, put into practice.<br>You’re building your foundation.</p><div class="result-stats"><div><strong>3 / 3</strong><span>CONCEPTS PRACTICED</span></div><div><strong>60 XP</strong><span>PRACTICE MILESTONE</span></div></div><button class="app-button green" data-screen="progress">SEE YOUR PROGRESS ${icon('arrow')}</button><button class="app-text-button" data-action="retry-practice">Practice again</button></div>`;
 const current=trades[trade], question=current.questions[questionIndex], correct=answer===question.correct;
 return `<div class="phone-page quiz-page"><div class="lesson-meta"><span>PRACTICE / ${current.name.toUpperCase()}</span><strong>${questionIndex+1}/3</strong></div><div class="lesson-steps">${current.questions.map((_,i)=>`<span class="${i<questionIndex || i===questionIndex&&checked&&correct?'filled':''}"></span>`).join('')}</div><div class="app-eyebrow">LET’S MAKE IT STICK</div><h2>${question.title}</h2><div class="answer-options" role="group" aria-label="Answer choices">${question.choices.map((choice,i)=>`<button class="answer-option ${answer===i?'chosen':''} ${checked&&answer===i?(correct?'correct':'incorrect'):''}" data-answer="${i}" aria-pressed="${answer===i}" ${checked?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${choice}${checked&&answer===i&&correct?icon('check'):''}</button>`).join('')}</div><div class="quiz-feedback ${checked?(correct?'positive':'negative'):''}" role="status">${checked?`<strong>${correct?'YOU’VE GOT IT.':'NOT QUITE. YOU’VE GOT THIS.'}</strong><p>${correct?question.explanation:'Take another look and try again. '+(questionIndex===0?'Revisit the key idea in your lesson.':'You can revisit the lesson from the Learn tab.')}</p>`:'<p>Take your time. Learning is the point.</p>'}</div><button class="app-button ${checked&&!correct?'cream':'green'}" data-action="${checked?(correct?'next-question':'try-again'):'check-answer'}" ${answer===null?'disabled':''}>${checked?(correct?(questionIndex===2?'FINISH PRACTICE':'NEXT QUESTION'):'TRY AGAIN'):'CHECK ANSWER'} ${icon('arrow')}</button></div>`;
}
function progressView() {
 const lessonDone=completedLessons.has(trade), practiceDone=completedPractice.has(trade), progress=(Number(lessonDone)+Number(practiceDone))*50;
 return `<div class="phone-page progress-page"><div class="app-eyebrow">EVERY SMALL STEP COUNTS</div><h2>LOOK AT<br>YOU GO<span>.</span></h2><div class="progress-overview"><div class="progress-ring" style="--progress:${progress}%"><span>${progress}<small>%</small></span></div><div><strong>${trades[trade].name}</strong><span>Sample foundation</span><small>${Number(lessonDone)+Number(practiceDone)} of 2 milestones</small></div></div><div class="xp-banner">${icon('bolt')}<strong>${xp()} XP</strong><span>EARNED IN THIS DEMO</span></div><div class="app-section-heading"><h3>YOUR SMALL WINS</h3><span>${icon('star')}</span></div><div class="milestone ${lessonDone?'earned':''}"><span>${icon(lessonDone?'check':'book')}</span><div><strong>First foundation</strong><small>${lessonDone?'Sample lesson completed · 30 XP':'Complete your three-card lesson'}</small></div></div><div class="milestone ${practiceDone?'earned':''}"><span>${icon(practiceDone?'check':'bolt')}</span><div><strong>Put it into practice</strong><small>${practiceDone?'Three concepts practiced · 60 XP':'Complete a practice round'}</small></div></div><div class="milestone future"><span>${icon('compass')}</span><div><strong>The hands-on chapter</strong><small>Supervised training · future pathway</small></div></div><button class="app-button green" data-screen="${!lessonDone?'learn':!practiceDone?'practice':'trades'}">${!lessonDone?'START YOUR FIRST LESSON':!practiceDone?'TRY A PRACTICE ROUND':'EXPLORE ANOTHER TRADE'} ${icon('arrow')}</button><p class="phone-disclaimer">Demo progress resets on refresh. XP is not a certification.</p></div>`;
}
function renderPhone(focusTarget?: string) {
 phoneContent.innerHTML = screen==='home'?homeView():screen==='trades'?tradesView():screen==='learn'?learnView():screen==='practice'?practiceView():progressView();
 phoneContent.scrollTop=0;
 document.querySelector('#xp-count')!.innerHTML = `${icon('bolt')}<span>${xp()} XP</span>`;
 document.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach(button=> { if(button.closest('nav')) button.setAttribute('aria-current',String(button.dataset.screen===screen?'page':'false')); });
 if(focusTarget) phoneContent.querySelector<HTMLElement>(focusTarget)?.focus({preventScroll:true});
}
function navigate(next: Screen) {
 if(!screens.some(s=>s.id===next)) return;
 const previous=screen; screen=next;
 if(next==='learn' && previous!=='learn' && completedLessons.has(trade) && lessonIndex===2) lessonIndex=0;
 if(previous!==next) renderStory();
 renderPhone();
 document.querySelector('#announcement')!.textContent = `${screens.find(s=>s.id===next)!.short} screen. ${next==='learn'?trades[trade].lesson:''}`;
}
function announce(text: string) { document.querySelector('#announcement')!.textContent=text; }
app.addEventListener('click', event=> {
 const button=(event.target as HTMLElement).closest<HTMLButtonElement>('button');
 if(!button || button.disabled) return;
 if(button.dataset.screen) { const needsFocus = phoneContent.contains(button); navigate(button.dataset.screen as Screen); if(needsFocus) { const heading=phoneContent.querySelector<HTMLElement>('h2'); heading?.setAttribute('tabindex','-1'); heading?.focus({preventScroll:true}); } return; }
 if(button.id==='focus-app') { const expanded=button.getAttribute('aria-expanded')!=='true'; button.setAttribute('aria-expanded',String(expanded)); button.textContent=expanded?'SHOW THE STORY ↙':'ENLARGE APP ↗'; document.querySelector('.experience')!.classList.toggle('app-focused',expanded); return; }
 if(button.dataset.trade) { trade=button.dataset.trade as Trade; lessonIndex=0; questionIndex=0; answer=null; checked=false; finished=false; renderPhone(`[data-trade="${trade}"]`); announce(`${trades[trade].name} selected. Its sample lesson is ready.`); return; }
 if(button.dataset.answer!==undefined) { answer=Number(button.dataset.answer); renderPhone(`[data-answer="${answer}"]`); return; }
 switch(button.dataset.action) {
  case 'lesson-back': if(lessonIndex===0) navigate('home'); else {lessonIndex--;renderPhone('[data-action="lesson-back"]');} break;
  case 'lesson-next': if(lessonIndex<2) {lessonIndex++;renderPhone('[data-action="lesson-next"]');announce(`Lesson card ${lessonIndex+1} of 3. ${trades[trade].cards[lessonIndex].title}`);} else {const alreadyComplete=completedLessons.has(trade);completedLessons.add(trade);navigate('practice');announce(alreadyComplete?'Lesson reviewed. Your progress is saved for this demo session.':'Lesson complete. 30 experience points earned for this trade. Try the practice questions.');} break;
  case 'check-answer': if(answer!==null) {checked=true;renderPhone('.quiz-page>.app-button');} break;
  case 'try-again': answer=null;checked=false;renderPhone('[data-answer="0"]');break;
  case 'next-question': if(!checked || answer!==trades[trade].questions[questionIndex].correct) break; if(questionIndex<2) {questionIndex++;answer=null;checked=false;renderPhone('[data-answer="0"]');announce(`Question ${questionIndex+1} of 3.`);} else {const alreadyComplete=completedPractice.has(trade);finished=true;completedPractice.add(trade);renderPhone('.complete-page .app-button');announce(alreadyComplete?'Practice reviewed. Your progress is saved for this demo session.':'Practice complete. 60 experience points earned for this trade.');} break;
  case 'retry-practice': questionIndex=0;answer=null;checked=false;finished=false;renderPhone('[data-answer="0"]');break;
 }
 if(button.id==='reset-demo') {trade='electrical';lessonIndex=0;questionIndex=0;answer=null;checked=false;finished=false;completedLessons.clear();completedPractice.clear();navigate('home');announce('Demo reset. All sample progress cleared.');}
});
document.querySelector('.brand')!.addEventListener('click', event=> {event.preventDefault();navigate('home');});
function resizePhone() {
 const stage=document.querySelector<HTMLElement>('.demo-stage')!;
 const scale=Math.min(1.1,Math.max(.25,(stage.clientHeight-96)/636),Math.max(.25,(stage.clientWidth-52)/320));
 stage.style.setProperty('--phone-scale',String(scale));
}
renderStory();renderPhone();
new ResizeObserver(resizePhone).observe(document.querySelector('.demo-stage')!);
resizePhone();
