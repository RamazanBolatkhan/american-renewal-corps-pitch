'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { changePassword, deleteAccount, requestPasswordReset, resendVerification, resetPassword, type FormResult } from '@/app/actions/account';
import { createStaffUser, resetUserPassword, type AdminResult } from '@/app/actions/admin';
import { roleNames } from '@/lib/permissions';
import { Icon } from '../Icon';

function Message({ result }: { result: FormResult | AdminResult }) {
  if (!result) return null;
  if (result.error) return <p className="ui-status ui-status--error" role="alert">{result.error}</p>;
  return <p className="ui-status ui-status--ok" role="status">{result.ok}</p>;
}

function PasswordField({ id, label, autoComplete, minLength }: { id: string; label: string; autoComplete: string; minLength?: number }) {
  return (
    <label className="ui-field" htmlFor={id}>{label}
      <input id={id} name={id} type="password" autoComplete={autoComplete} minLength={minLength} maxLength={128} required />
    </label>
  );
}

export function ChangePasswordForm({ forced = false, next }: { forced?: boolean; next?: string }) {
  const [result, action, pending] = useActionState(changePassword, null);
  return (
    <form className="ui-form" action={action}>
      {next && <input type="hidden" name="returnTo" value={next} />}
      <PasswordField id="current" label={forced ? 'TEMPORARY PASSWORD' : 'CURRENT PASSWORD'} autoComplete="current-password" />
      <PasswordField id="next" label="NEW PASSWORD" autoComplete="new-password" minLength={8} />
      <PasswordField id="confirm" label="NEW PASSWORD AGAIN" autoComplete="new-password" minLength={8} />
      <Message result={result} />
      <button className="ui-button ui-button--green" type="submit" disabled={pending}>{pending ? 'SAVING…' : 'CHANGE PASSWORD'} <Icon name="arrow" /></button>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [result, action, pending] = useActionState(deleteAccount, null);
  return (
    <form className="ui-form" action={action}>
      <label className="ui-field" htmlFor="confirm-email">TYPE YOUR EMAIL TO CONFIRM
        <input id="confirm-email" name="email" type="email" autoComplete="off" placeholder={email} required />
      </label>
      <PasswordField id="password" label="PASSWORD" autoComplete="current-password" />
      <Message result={result} />
      <button className="ui-button ui-button--danger" type="submit" disabled={pending}>{pending ? 'DELETING…' : 'DELETE MY ACCOUNT'}</button>
    </form>
  );
}

export function ResendVerificationButton() {
  const [result, action, pending] = useActionState(resendVerification, null);
  return (
    <form action={action} className="ui-inline-form">
      <button className="ui-button ui-button--quiet" type="submit" disabled={pending}>{pending ? 'SENDING…' : 'SEND A NEW CONFIRMATION LINK'}</button>
      <Message result={result} />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [result, action, pending] = useActionState(requestPasswordReset, null);
  return (
    <form className="ui-form" action={action}>
      <label className="ui-field" htmlFor="email">EMAIL ADDRESS
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <Message result={result} />
      <button className="ui-button ui-button--green" type="submit" disabled={pending}>{pending ? 'SENDING…' : 'SEND RESET LINK'} <Icon name="arrow" /></button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [result, action, pending] = useActionState(resetPassword, null);
  return (
    <form className="ui-form" action={action}>
      <input type="hidden" name="token" value={token} />
      <PasswordField id="next" label="NEW PASSWORD" autoComplete="new-password" minLength={8} />
      <PasswordField id="confirm" label="NEW PASSWORD AGAIN" autoComplete="new-password" minLength={8} />
      <Message result={result} />
      <button className="ui-button ui-button--green" type="submit" disabled={pending}>{pending ? 'SAVING…' : 'SET NEW PASSWORD'} <Icon name="arrow" /></button>
    </form>
  );
}

/** Shows a temporary password once, with a copy button. */
function TemporaryPassword({ result }: { result: AdminResult }) {
  const [copied, setCopied] = React.useState(false);
  if (!result?.password) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.password!);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="temp-password" role="status">
      <p>Give {result.email} this temporary password. It’s shown only once; they’ll choose their own at first log-in.</p>
      <div className="temp-password-row">
        <code>{result.password}</code>
        <button type="button" className="game-chip" onClick={copy}>{copied ? 'COPIED' : 'COPY'}</button>
      </div>
    </div>
  );
}

export function CreateStaffForm() {
  const [result, action, pending] = useActionState(createStaffUser, null);
  return (
    <form className="ui-review" action={action}>
      <fieldset>
        <legend>CREATE AN ACCOUNT</legend>
        <div className="staff-grid">
          <label className="ui-dfield">NAME<input name="name" required maxLength={100} autoComplete="off" /></label>
          <label className="ui-dfield">EMAIL<input name="email" type="email" required maxLength={254} autoComplete="off" /></label>
          <label className="ui-dfield">ROLE
            <select name="role" defaultValue="editor" className="ui-dselect">
              {roleNames.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        {result?.error && <p className="ui-status ui-status--dark" role="alert">{result.error}</p>}
        {result?.ok && <p className="ui-small" role="status">{result.ok}</p>}
        <TemporaryPassword result={result} />
        <button className="ui-button ui-button--paper" type="submit" disabled={pending} style={{ justifySelf: 'start' }}>{pending ? 'CREATING…' : 'CREATE ACCOUNT'} <Icon name="arrow" /></button>
      </fieldset>
    </form>
  );
}

export function ResetUserPasswordButton({ userId, name }: { userId: string; name: string }) {
  const [result, action, pending] = useActionState(resetUserPassword, null);
  return (
    <form action={action} className="ui-inline-form">
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" className="game-chip" disabled={pending} aria-label={`Reset password for ${name}`}>{pending ? '…' : 'RESET PASSWORD'}</button>
      {result?.error && <span className="ui-small">{result.error}</span>}
      <TemporaryPassword result={result} />
    </form>
  );
}
