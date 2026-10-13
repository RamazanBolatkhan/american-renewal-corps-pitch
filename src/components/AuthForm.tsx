'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Icon } from './Icon';
import { GoogleButton } from './account/GoogleButton';

/** Email and password sign-up / log-in. A demo (anonymous) session is linked to the new account automatically. */
export function AuthForm({ mode, next, google = false }: { mode: 'register' | 'login'; next: string; google?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const result = isRegister
      ? await authClient.signUp.email({ name: String(form.get('name') ?? '').trim(), email, password })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      setError(result.error.message || (isRegister ? 'Couldn’t create the account. Try again.' : 'Couldn’t log in. Check your email and password.'));
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form className="ui-form" onSubmit={submit}>
      {google && (
        <>
          <GoogleButton next={next} />
          <p className="ui-or">OR WITH EMAIL</p>
        </>
      )}
      {isRegister && (
        <label className="ui-field" htmlFor="name">YOUR NAME
          <input id="name" name="name" autoComplete="name" maxLength={100} required placeholder="Full name" />
        </label>
      )}
      <label className="ui-field" htmlFor="email">EMAIL ADDRESS
        <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" />
      </label>
      <label className="ui-field" htmlFor="password">PASSWORD
        <input id="password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} maxLength={128} required placeholder={isRegister ? 'At least 8 characters' : 'Your password'} />
      </label>
      {error && <p className="ui-status ui-status--error" role="alert">{error}</p>}
      <button className="ui-button ui-button--green" type="submit" disabled={pending}>
        {pending ? (isRegister ? 'CREATING ACCOUNT…' : 'LOGGING IN…') : isRegister ? 'CREATE ACCOUNT' : 'LOG IN'} <Icon name="arrow" />
      </button>
    </form>
  );
}
