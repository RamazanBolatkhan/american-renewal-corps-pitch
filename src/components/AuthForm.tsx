'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import { SkeletonNote } from './PageShell';

/** Presentation-only until Better Auth is connected: nothing is sent or stored. */
export function AuthForm({ mode }: { mode: 'register' | 'login' }) {
  const [message, setMessage] = useState('');
  const isRegister = mode === 'register';

  function notConnected(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    event?.currentTarget.reset();
    setMessage(isRegister
      ? 'Accounts aren’t connected yet, so no account was created. The demo still works without one.'
      : 'Sign-in isn’t connected yet. You can use the demo without an account.');
  }

  return (
    <>
      <form className="ui-form" onSubmit={notConnected}>
        <button className="ui-button ui-button--quiet" type="button" onClick={() => notConnected()}>
          <Icon name="google" /> CONTINUE WITH GOOGLE
        </button>
        <p className="ui-or">OR WITH EMAIL</p>
        {isRegister && (
          <label className="ui-field" htmlFor="name">YOUR NAME
            <input id="name" name="name" autoComplete="name" maxLength={100} required placeholder="Full name" />
          </label>
        )}
        <label className="ui-field" htmlFor="email">EMAIL ADDRESS
          <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" />
        </label>
        <label className="ui-field" htmlFor="password">PASSWORD
          <input id="password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} required placeholder={isRegister ? 'At least 8 characters' : 'Your password'} />
        </label>
        <button className="ui-button ui-button--green" type="submit">
          {isRegister ? 'CREATE ACCOUNT' : 'LOG IN'} <Icon name="arrow" />
        </button>
        {message && <p className="ui-status" role="status">{message}</p>}
      </form>
      <SkeletonNote>Skeleton page. Sign-up and log-in will connect to Better Auth and the database in the next step. Nothing entered here is sent or saved.</SkeletonNote>
    </>
  );
}
