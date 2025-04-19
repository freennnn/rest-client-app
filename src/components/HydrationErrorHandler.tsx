'use client';

import { useEffect } from 'react';

export default function HydrationErrorHandler() {
  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      if (body.hasAttribute('data-new-gr-c-s-check-loaded')) {
        body.removeAttribute('data-new-gr-c-s-check-loaded');
      }
      if (body.hasAttribute('data-gr-ext-installed')) {
        body.removeAttribute('data-gr-ext-installed');
      }
    }
  }, []);

  return null;
}
