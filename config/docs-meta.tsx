import { Metadata } from 'next';

export function generateDocumentMetadata(
  title: string,
  description: string,
  pathname: string
): Metadata {
  const baseUrl = 'https://docs.nextellar.dev';
  const canonicalUrl = `${baseUrl}${pathname}`;

  return {
    title: `${title} | Nextellar Docs`,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Nextellar Docs`,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Nextellar Documentation',
      images: [
        {
          url: '/logos/logo-with-text-light.png',
          width: 1200,
          height: 630,
          alt: 'Nextellar Documentation',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Nextellar Docs`,
      description,
      images: ['/logos/logo-with-text-light.png'],
      creator: '@nextellar',
    },
  };
}

export const docsRootMetadata: Metadata = {
  metadataBase: new URL('https://docs.nextellar.dev'),
  title: 'Nextellar Documentation',
  description:
    'Complete documentation for Nextellar — CLI toolkit for building production-ready dApps with Next.js and Stellar.',
  authors: [{ name: 'Nextellar Team' }],
  keywords: [
    'Nextellar',
    'Next.js',
    'Stellar',
    'TypeScript',
    'CLI',
    'dApp',
    'Web3',
    'Documentation',
    'Guides',
  ],
  publisher: 'Nextellar',
  creator: 'Nextellar Team',
  alternates: {
    canonical: 'https://docs.nextellar.dev',
  },
  openGraph: {
    type: 'website',
    url: 'https://docs.nextellar.dev',
    title: 'Nextellar Documentation',
    description:
      'Complete documentation for Nextellar — CLI toolkit for building production-ready dApps with Next.js and Stellar.',
    siteName: 'Nextellar Documentation',
    images: [
      {
        url: '/logos/logo-with-text-light.png',
        width: 1200,
        height: 630,
        alt: 'Nextellar Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nextellar Documentation',
    description:
      'Complete documentation for Nextellar — CLI toolkit for building production-ready dApps with Next.js and Stellar.',
    images: ['/logos/logo-with-text-light.png'],
    creator: '@nextellar',
  },
  robots: 'index, follow',
};
