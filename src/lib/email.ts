import 'server-only';

/**
 * Transactional email through Resend's HTTP API. Email features switch on once RESEND_API_KEY and
 * EMAIL_FROM (an address on a domain verified in Resend) are set; until then nothing is sent and
 * the pages offer the admin password reset instead.
 */
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  if (!emailConfigured()) {
    console.warn(`Email not configured; skipped "${subject}" to ${to}`);
    return { sent: false };
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text, html }),
  });
  if (!response.ok) console.error(`Email "${subject}" failed: ${response.status} ${await response.text()}`);
  return { sent: response.ok };
}

const escape = (value: string) => value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** A plain, branded email with one button. */
export function actionEmail({ name, intro, action, url, outro }: { name: string; intro: string; action: string; url: string; outro: string }) {
  const text = `Hi ${name},\n\n${intro}\n\n${action}: ${url}\n\n${outro}\n\nAmerican Renewal Corps (independent concept)`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#06402B">
<p style="font-size:22px;font-weight:bold;margin:0 0 16px">arc<span style="color:#FF6B35">✳</span></p>
<p>Hi ${escape(name)},</p><p>${escape(intro)}</p>
<p><a href="${escape(url)}" style="display:inline-block;background:#06402B;color:#F3F2E9;padding:12px 18px;text-decoration:none">${escape(action)}</a></p>
<p style="color:#536b5b;font-size:13px">${escape(outro)}</p></div>`;
  return { text, html };
}
