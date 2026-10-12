import { createAuthClient } from 'better-auth/react';
import { adminClient, anonymousClient } from 'better-auth/client/plugins';
import { ac, roles } from './permissions';

export const authClient = createAuthClient({
  plugins: [anonymousClient(), adminClient({ ac, roles })],
});
