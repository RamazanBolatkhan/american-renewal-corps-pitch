'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Icon } from '../Icon';

/** Sign in with Google, or link Google to the signed-in account. Only rendered when Google is configured. */
export function GoogleButton({ mode = 'sign-in', next = '/learn' }: { mode?: 'sign-in' | 'link'; next?: string }) {
  const [error, setError] = useState('');
  const go = async () => {
    setError('');
    const result = mode === 'link'
      ? await authClient.linkSocial({ provider: 'google', callbackURL: '/account' })
      : await authClient.signIn.social({ provider: 'google', callbackURL: next });
    if (result?.error) setError(result.error.message || 'Google sign-in didn’t work. Try again.');
  };
  return (
    <>
      <button className="ui-button ui-button--quiet" type="button" onClick={go}>
        <Icon name="google" /> {mode === 'link' ? 'CONNECT GOOGLE' : 'CONTINUE WITH GOOGLE'}
      </button>
      {error && <p className="ui-status ui-status--error" role="alert">{error}</p>}
    </>
  );
}
