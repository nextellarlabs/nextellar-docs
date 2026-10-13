import { Inter } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';
import { meta } from '../../../config/meta';
import { Locale, LOCALES, isValidLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';

const interSans = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = meta;

export const generateStaticParams = () => {
  return LOCALES.map((locale) => ({ locale }));
};

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Validate locale - this will be caught by middleware in dev/preview,
  // but we validate here for static generation safety
  const { locale } = params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`
          ${interSans.className}
          text-sm
          font-regular tracking-wide antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
