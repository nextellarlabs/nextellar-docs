'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, Locale } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLocale = (params.locale as string) || 'en';
  const currentLabel = `${LOCALE_FLAGS[currentLocale as Locale]} ${LOCALE_LABELS[currentLocale as Locale]}`;

  const switchLocale = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${currentLocale}`, `/${locale}`);
    setIsOpen(false);
    router.push(newPathname);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[140px] justify-between"
        title="Switch language"
      >
        <span className="truncate text-sm font-medium">{currentLabel}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', {
            'rotate-180': isOpen,
          })}
        />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-defaultBase shadow-lg z-50">
          <div className="py-1">
            {LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted',
                  {
                    'bg-muted font-medium': currentLocale === locale,
                  }
                )}
              >
                <div className="flex items-center justify-between">
                  <span>
                    <span className="mr-2">{LOCALE_FLAGS[locale]}</span>
                    {LOCALE_LABELS[locale]}
                  </span>
                  {currentLocale === locale && (
                    <span className="text-xs font-semibold">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
