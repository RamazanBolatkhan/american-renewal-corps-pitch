/** Presentation-only contact flow: no personal information leaves the browser. */
export function mountContactDemo() {
  const dialog = document.createElement('dialog');
  dialog.className = 'contact-dialog';
  dialog.setAttribute('aria-labelledby', 'contact-title');
  dialog.innerHTML = `
    <button class="contact-close" type="button" aria-label="Close contact form">×</button>
    <span class="contact-eyebrow">YOUR NEXT CHAPTER / ARC</span>
    <h2 id="contact-title">FOUND YOUR SPARK?<br><span>LET’S TALK.</span></h2>
    <p class="contact-intro">A little curiosity can lead to something bigger. Tell us what caught your interest.</p>
    <form class="contact-form">
      <div class="contact-fields">
        <label>YOUR NAME<input name="name" autocomplete="name" maxlength="100" required placeholder="Full name"></label>
        <label>EMAIL ADDRESS<input name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></label>
        <label>PHONE <span>(OPTIONAL)</span><input name="phone" type="tel" autocomplete="tel" maxlength="40" placeholder="Your phone number"></label>
        <label>I’M INTERESTED IN<select name="interest"><option>Electrical</option><option>Building systems</option><option>Industrial</option><option>Partnering with ARC</option><option>Just exploring</option></select></label>
      </div>
      <p class="contact-demo-note">INTERACTIVE DEMO · Details entered here aren’t sent or saved.</p>
      <button class="contact-submit" type="submit">TRY THE CONTACT FORM <span>↗</span></button>
    </form>
    <div class="contact-success" hidden role="status"><span class="contact-success-mark">✳</span><h3>THAT’S THE FIRST STEP.</h3><p>This is how the confirmation will look. In this demo, your details haven’t been sent or saved.</p><button class="contact-submit contact-return" type="button">BACK TO EXPLORING <span>↗</span></button></div>`;
  document.body.append(dialog);
  const form = dialog.querySelector<HTMLFormElement>('form')!;
  const success = dialog.querySelector<HTMLElement>('.contact-success')!;
  const visited = new Set<string>(['home']);
  let prompted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let opener: HTMLElement | null = null;
  const open = () => {
    if (dialog.open) return;
    clearTimeout(timer);
    prompted = true;
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    form.hidden = false;
    success.hidden = true;
    dialog.showModal();
  };
  const close = () => dialog.close();
  dialog.querySelector('.contact-close')!.addEventListener('click', close);
  dialog.querySelector('.contact-return')!.addEventListener('click', close);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
  });
  dialog.addEventListener('close', () => { form.reset(); opener?.focus({ preventScroll: true }); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.reset();
    form.hidden = true;
    success.hidden = false;
    dialog.querySelector<HTMLButtonElement>('.contact-return')!.focus();
  });
  document.querySelector('#open-contact')!.addEventListener('click', open);
  return (screen: string) => {
    visited.add(screen);
    clearTimeout(timer);
    // Let visitors read their progress before inviting them to get in touch.
    if (!prompted && screen === 'progress' && visited.size === 5) timer = setTimeout(open, 1800);
  };
}
