'use client';

import { useEffect } from 'react';

/**
 * Analytics Component
 * Integrates privacy-friendly analytics (Plausible) and error monitoring (Sentry)
 */
export function Analytics() {
  useEffect(() => {
    // Initialize Plausible Analytics
    initPlausible();

    // Initialize Sentry Error Monitoring
    initSentry();
  }, []);

  return null;
}

/**
 * Initialize Plausible Analytics
 * Privacy-friendly analytics without cookies or tracking consent requirements
 */
function initPlausible() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  if (!domain) {
    console.warn('[Analytics] Plausible domain not configured');
    return;
  }

  // Dynamically load Plausible script
  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', domain);
  script.src = 'https://plausible.io/js/script.js';
  script.onload = () => {
    console.log('[Analytics] Plausible initialized');
  };
  script.onerror = () => {
    console.error('[Analytics] Failed to load Plausible');
  };
  document.head.appendChild(script);
}

/**
 * Initialize Sentry Error Monitoring
 * Captures and reports runtime errors and exceptions
 */
function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NODE_ENV;

  if (!dsn) {
    console.warn('[ErrorMonitoring] Sentry DSN not configured');
    return;
  }

  // Dynamically load Sentry script
  const script = document.createElement('script');
  script.src = 'https://browser.sentry-cdn.com/7.100.0/bundle.min.js';
  script.integrity =
    'sha384-wY/bMsqKHTyVYkb3q9YfmXsQiI6DBVaE7HKvYiFl+b/7PGVwR2C1/+3dPxL3p0+2j';
  script.crossOrigin = 'anonymous';

  script.onload = () => {
    if (window.Sentry) {
      window.Sentry.init({
        dsn,
        environment,
        tracesSampleRate: 1.0,
        integrations: [
          new window.Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event: any) {
          // Filter out certain errors if needed
          return event;
        },
      });
      console.log('[ErrorMonitoring] Sentry initialized');
    }
  };

  script.onerror = () => {
    console.error('[ErrorMonitoring] Failed to load Sentry');
  };

  document.head.appendChild(script);
}

// Type augmentation for global Sentry object
declare global {
  interface Window {
    Sentry?: {
      init: (options: Record<string, unknown>) => void;
      Replay: new (options: Record<string, unknown>) => unknown;
      captureException: (error: any, context?: any) => void;
    };
  }
}
