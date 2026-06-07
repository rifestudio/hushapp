'use client';
import { useEffect } from 'react';

export function UtmCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    if (source && !localStorage.getItem('hush_utm')) {
      localStorage.setItem('hush_utm', JSON.stringify({
        utm_source: source,
        utm_medium: params.get('utm_medium'),
        referrer: document.referrer || null,
      }));
    }
  }, []);
  return null;
}