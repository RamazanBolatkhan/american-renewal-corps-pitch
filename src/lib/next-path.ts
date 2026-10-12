/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(value: unknown, fallback = '/learn') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : fallback;
}
