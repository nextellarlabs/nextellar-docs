import { describe, it, expect } from 'vitest';
import {
  isValidLocale,
  parseLocaleFromPathname,
  formatLocaleForPath,
  getFallbackLocale,
  LOCALES,
  DEFAULT_LOCALE,
} from './i18n';

describe('i18n utilities', () => {
  describe('isValidLocale', () => {
    it('should validate locale strings correctly', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('es')).toBe(true);
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('invalid')).toBe(false);
      expect(isValidLocale(null)).toBe(false);
      expect(isValidLocale(undefined)).toBe(false);
      expect(isValidLocale(123)).toBe(false);
    });
  });

  describe('parseLocaleFromPathname', () => {
    it('should parse valid locale from pathname start', () => {
      expect(parseLocaleFromPathname('/en/docs')).toBe('en');
      expect(parseLocaleFromPathname('/es/docs')).toBe('es');
      expect(parseLocaleFromPathname('/en')).toBe('en');
      expect(parseLocaleFromPathname('/es')).toBe('es');
    });

    it('should return default locale for invalid or missing locale', () => {
      expect(parseLocaleFromPathname('/docs')).toBe(DEFAULT_LOCALE);
      expect(parseLocaleFromPathname('/fr/docs')).toBe(DEFAULT_LOCALE);
      expect(parseLocaleFromPathname('/invalid/path')).toBe(DEFAULT_LOCALE);
      expect(parseLocaleFromPathname('/')).toBe(DEFAULT_LOCALE);
      expect(parseLocaleFromPathname('')).toBe(DEFAULT_LOCALE);
    });

    it('should ignore path segments after locale', () => {
      expect(parseLocaleFromPathname('/en/docs/getting-started')).toBe('en');
      expect(parseLocaleFromPathname('/es/docs/v1.0.0/cli/commands')).toBe('es');
    });
  });

  describe('formatLocaleForPath', () => {
    it('should format locale as-is for URL paths', () => {
      expect(formatLocaleForPath('en')).toBe('en');
      expect(formatLocaleForPath('es')).toBe('es');
    });
  });

  describe('getFallbackLocale', () => {
    it('should return default locale as fallback', () => {
      expect(getFallbackLocale('en')).toBe(DEFAULT_LOCALE);
      expect(getFallbackLocale('es')).toBe(DEFAULT_LOCALE);
    });
  });

  describe('LOCALES constant', () => {
    it('should include both English and Spanish', () => {
      expect(LOCALES).toContain('en');
      expect(LOCALES).toContain('es');
      expect(LOCALES.length).toBe(2);
    });
  });

  describe('DEFAULT_LOCALE constant', () => {
    it('should be English', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });
  });
});
