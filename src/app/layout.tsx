import { ReactNode } from 'react';

/**
 * Root layout - minimal wrapper for locale routing
 * The actual layout with styles is in [locale]/layout.tsx
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
