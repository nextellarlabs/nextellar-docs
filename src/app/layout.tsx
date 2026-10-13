import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';
import { meta } from '../../config/meta';
import { Analytics } from '@/components/analytics';
import { ErrorBoundary } from '@/components/error-boundary';
import { SkipToContent } from '@/components/skip-to-content';

const interSans = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = meta;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${interSans.className}
          text-sm
          font-regular tracking-wide antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SkipToContent />
            {children}
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
