// src/config/tocData.ts
export type TocPage = {
  title: string;
  href: string;
};

export type TocSection = {
  title: string;
  href: string;
  pages?: TocPage[];
};

export type TocData = {
  [key: string]: TocSection[];
};

export const TocData: TocData = {
  'getting-started': [
    { title: 'Welcome to Nextellar', href: '/docs/getting-started' },
  ],
  'getting-started/introduction': [
    {
      title: 'Overview',
      href: '/docs/getting-started/introduction#overview',
      pages: [
        { title: 'What is Nextellar', href: '/docs/getting-started/introduction#what-is-nextellar' },
        { title: 'Why Nextellar', href: '/docs/getting-started/introduction#why-nextellar' },
      ],
    },
  ],
  'getting-started/installation': [
    {
      title: 'Installation',
      href: '/docs/getting-started/installation#installation',
      pages: [
        { title: 'Prerequisites', href: '/docs/getting-started/installation#prerequisites' },
        { title: 'Scaffold Command', href: '/docs/getting-started/installation#scaffold-command' },
        { title: 'Post-install', href: '/docs/getting-started/installation#post-install' },
      ],
    },
  ],
  'getting-started/quick-start': [
    {
      title: 'Quick Start',
      href: '/docs/getting-started/quick-start#quick-start',
      pages: [
        { title: 'Create App', href: '/docs/getting-started/quick-start#create-app' },
        { title: 'Run Dev', href: '/docs/getting-started/quick-start#run-dev' },
      ],
    },
  ],
  'hooks/useStellarAccount': [
    {
      title: 'Overview',
      href: '/docs/hooks/useStellarAccount#overview',
      pages: [
        { title: 'Usage', href: '/docs/hooks/useStellarAccount#usage' },
        { title: 'Return Value', href: '/docs/hooks/useStellarAccount#return-value' },
      ],
    },
  ],
  'hooks/useStellarBalances': [
    {
      title: 'Overview',
      href: '/docs/hooks/useStellarBalances#overview',
      pages: [
        { title: 'Usage', href: '/docs/hooks/useStellarBalances#usage' },
        { title: 'Examples', href: '/docs/hooks/useStellarBalances#examples' },
      ],
    },
  ],
  'hooks/useStellarPayment': [
    {
      title: 'Send Payment',
      href: '/docs/hooks/useStellarPayment#send-payment',
      pages: [
        { title: 'Usage', href: '/docs/hooks/useStellarPayment#usage' },
        { title: 'Error Handling', href: '/docs/hooks/useStellarPayment#error-handling' },
      ],
    },
  ],
  'hooks/useTransactionHistory': [
    {
      title: 'Transaction History',
      href: '/docs/hooks/useTransactionHistory#transaction-history',
      pages: [
        { title: 'Pagination', href: '/docs/hooks/useTransactionHistory#pagination' },
        { title: 'Filtering', href: '/docs/hooks/useTransactionHistory#filtering' },
      ],
    },
  ],
  'integrations/horizon': [
    {
      title: 'Horizon API',
      href: '/docs/integrations/horizon#horizon-api',
      pages: [
        { title: 'Endpoints', href: '/docs/integrations/horizon#endpoints' },
        { title: 'Rate Limits', href: '/docs/integrations/horizon#rate-limits' },
      ],
    },
  ],
  'integrations/soroban': [
    {
      title: 'Soroban Overview',
      href: '/docs/integrations/soroban#soroban-overview',
      pages: [
        { title: 'Contracts', href: '/docs/integrations/soroban#contracts' },
        { title: 'Events', href: '/docs/integrations/soroban#events' },
      ],
    },
  ],
  'components/connect-wallet-button': [
    {
      title: 'Preview & Usage',
      href: '/docs/components/connect-wallet-button#preview-and-usage',
    },
    {
      title: 'Props',
      href: '/docs/components/connect-wallet-button#props',
    },
  ],
  'components/balance-card': [
    {
      title: 'Preview & Usage',
      href: '/docs/components/balance-card#preview-and-usage',
    },
    {
      title: 'Props',
      href: '/docs/components/balance-card#props',
    },
  ],
  theme: [
    { title: 'Overview', href: '/docs/theme#overview' },
    { title: 'Colors', href: '/docs/theme#colors' },
    { title: 'Typography', href: '/docs/theme#typography' },
  ],
  search: [
    { title: 'Search', href: '/docs/search#overview' },
  ],
};
