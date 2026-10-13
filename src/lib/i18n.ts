/**
 * i18n Configuration
 * Centralized locale configuration for the documentation site
 */

export type Locale = 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
};

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: unknown): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Get the fallback locale
 */
export function getFallbackLocale(locale: Locale): Locale {
  return DEFAULT_LOCALE;
}

/**
 * Format locale for use in paths
 */
export function formatLocaleForPath(locale: Locale): string {
  return locale;
}

/**
 * Parse locale from pathname
 */
export function parseLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];

  if (isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  return DEFAULT_LOCALE;
}
