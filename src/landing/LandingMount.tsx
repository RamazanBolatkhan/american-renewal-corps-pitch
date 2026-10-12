'use client';

import { useEffect } from 'react';

/**
 * The landing page is the original framework-free experience. Its module renders into
 * #app once, so links into and out of it are plain <a> elements (full page loads).
 */
export default function LandingMount() {
  useEffect(() => {
    void import('./main');
  }, []);
  return <div id="app" />;
}
