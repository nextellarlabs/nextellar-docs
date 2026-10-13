import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, isValidLocale } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname starts with a locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // If no locale found, redirect to default locale
  return NextResponse.redirect(
    new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    // Match all routes except:
    // - static files (starting with /.)
    // - static assets (_next/static, _next/image, favicon, etc.)
    // - api routes
    '/((?!_next|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
