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
  // Getting started
  'getting-started': [
    { title: 'Welcome to Nextellar', href: '/docs/getting-started' },
  ],
  'getting-started/introduction': [
    {
      title: 'Overview',
      href: '/docs/getting-started/introduction#overview',
      pages: [
        {
          title: 'What is Nextellar',
          href: '/docs/getting-started/introduction#what-is-nextellar',
        },
        {
          title: 'Why Nextellar',
          href: '/docs/getting-started/introduction#why-nextellar',
        },
      ],
    },
  ],
  'getting-started/installation': [
    {
      title: 'Installation',
      href: '/docs/getting-started/installation#installation',
      pages: [
        {
          title: 'Prerequisites',
          href: '/docs/getting-started/installation#prerequisites',
        },
        {
          title: 'Scaffold Command',
          href: '/docs/getting-started/installation#scaffold-command',
        },
        {
          title: 'Post-install',
          href: '/docs/getting-started/installation#post-install',
        },
      ],
    },
  ],
  'getting-started/quick-start': [
    {
      title: 'Quick Start',
      href: '/docs/getting-started/quick-start#quick-start',
      pages: [
        {
          title: 'Create App',
          href: '/docs/getting-started/quick-start#create-app',
        },
        { title: 'Run Dev', href: '/docs/getting-started/quick-start#run-dev' },
      ],
    },
  ],

  // CLI
  'cli/commands': [
    {
      title: 'Commands',
      href: '/docs/cli/commands#commands',
      pages: [
        { title: 'Core Commands', href: '/docs/cli/commands#core-commands' },
        {
          title: 'Informational Commands',
          href: '/docs/cli/commands#informational-commands',
        },
        {
          title: 'Planned Commands',
          href: '/docs/cli/commands#upcoming-commands',
        },
      ],
    },
  ],
  'cli/flags': [
    {
      title: 'Flags & Options',
      href: '/docs/cli/flags#flags-and-options',
      pages: [
        { title: 'Language Options', href: '/docs/cli/flags#language-options' },
        {
          title: 'Network Configuration',
          href: '/docs/cli/flags#network-configuration-flags',
        },
        {
          title: 'Wallet Configuration',
          href: '/docs/cli/flags#wallet-configuration-flags',
        },
        {
          title: 'Automation & Defaults',
          href: '/docs/cli/flags#automation--defaults',
        },
        { title: 'Global Flags', href: '/docs/cli/flags#global-flags' },
      ],
    },
  ],
  'cli/templates': [
    {
      title: 'Scaffolding Templates',
      href: '/docs/cli/templates#scaffolding-templates',
      pages: [
        { title: 'Current Status', href: '/docs/cli/templates#current-status' },
        {
          title: 'Planned Templates',
          href: '/docs/cli/templates#planned-templates',
        },
      ],
    },
  ],

  // SDK & Hooks
  'sdk/overview': [
    {
      title: 'SDK Overview',
      href: '/docs/sdk/overview#overview',
      pages: [
        { title: 'Goals', href: '/docs/sdk/overview#goals' },
        { title: 'What’s included', href: '/docs/sdk/overview#whats-included' },
        {
          title: 'Stability & Security',
          href: '/docs/sdk/overview#stability--security',
        },
      ],
    },
  ],

  // API Reference (new)
  'sdk/api-reference': [
    {
      title: 'API Reference',
      href: '/docs/sdk/api-reference#api-reference',
      pages: [
        {
          title: 'Stellar Clients',
          href: '/docs/sdk/api-reference#stellar-clients',
        },
        { title: 'Wallet API', href: '/docs/sdk/api-reference#wallet-api' },
        {
          title: 'Transaction Utilities',
          href: '/docs/sdk/api-reference#transaction-utilities',
        },
        {
          title: 'Network Configuration',
          href: '/docs/sdk/api-reference#network-configuration',
        },
        {
          title: 'Asset Utilities',
          href: '/docs/sdk/api-reference#asset-utilities',
        },
        {
          title: 'Key & Account Utilities',
          href: '/docs/sdk/api-reference#key--account-utilities',
        },
        { title: 'Error Types', href: '/docs/sdk/api-reference#error-types' },
        {
          title: 'Types & Interfaces',
          href: '/docs/sdk/api-reference#types--interfaces',
        },
      ],
    },
  ],

  // Hooks index (canonical hooks index and per-hook anchors/pages)
  hooks: [
    {
      title: 'Hooks Overview',
      href: '/docs/hooks#overview',
      pages: [
        { title: 'Account Hooks', href: '/docs/hooks#account-hooks' },
        { title: 'Transaction Hooks', href: '/docs/hooks#transaction-hooks' },
        { title: 'Wallet Hooks', href: '/docs/hooks#wallet-hooks' },
        {
          title: 'Soroban Hooks',
          href: '/docs/hooks#soroban--smart-contract-hooks',
        },
        { title: 'Network Hooks', href: '/docs/hooks#network-hooks' },
      ],
    },
  ],

  // Individual hook pages (kebab-case filenames)
  'hooks/use-stellar-account': [
    {
      title: 'Overview',
      href: '/docs/hooks/use-stellar-account#overview',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-stellar-account#usage' },
        {
          title: 'Return Value',
          href: '/docs/hooks/use-stellar-account#return-value',
        },
      ],
    },
  ],
  'hooks/use-stellar-balances': [
    {
      title: 'Overview',
      href: '/docs/hooks/use-stellar-balances#overview',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-stellar-balances#usage' },
        {
          title: 'Examples',
          href: '/docs/hooks/use-stellar-balances#examples',
        },
      ],
    },
  ],
  'hooks/use-stellar-payment': [
    {
      title: 'Send Payment',
      href: '/docs/hooks/use-stellar-payment#send-payment',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-stellar-payment#usage' },
        {
          title: 'Error Handling',
          href: '/docs/hooks/use-stellar-payment#error-handling',
        },
      ],
    },
  ],
  'hooks/use-transaction-history': [
    {
      title: 'Transaction History',
      href: '/docs/hooks/use-transaction-history#transaction-history',
      pages: [
        {
          title: 'Pagination',
          href: '/docs/hooks/use-transaction-history#pagination',
        },
        {
          title: 'Filtering',
          href: '/docs/hooks/use-transaction-history#filtering',
        },
      ],
    },
  ],
  'hooks/use-trustlines': [
    {
      title: 'Trustlines',
      href: '/docs/hooks/use-trustlines#trustlines',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-trustlines#usage' },
        { title: 'Events', href: '/docs/hooks/use-trustlines#events' },
      ],
    },
  ],
  'hooks/use-offer-book': [
    {
      title: 'Orderbook / Offer Book',
      href: '/docs/hooks/use-offer-book#offer-book',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-offer-book#usage' },
        { title: 'Streams', href: '/docs/hooks/use-offer-book#streams' },
      ],
    },
  ],
  'hooks/use-soroban-contract': [
    {
      title: 'Soroban Contract',
      href: '/docs/hooks/use-soroban-contract#soroban-contract',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-soroban-contract#usage' },
        {
          title: 'Invoke & Read',
          href: '/docs/hooks/use-soroban-contract#invoke--read',
        },
      ],
    },
  ],
  'hooks/use-soroban-events': [
    {
      title: 'Soroban Events',
      href: '/docs/hooks/use-soroban-events#soroban-events',
      pages: [
        {
          title: 'Subscription',
          href: '/docs/hooks/use-soroban-events#subscription',
        },
        {
          title: 'Filtering',
          href: '/docs/hooks/use-soroban-events#filtering',
        },
      ],
    },
  ],
  'hooks/use-wallet': [
    {
      title: 'Wallet',
      href: '/docs/hooks/use-wallet#wallet',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-wallet#usage' },
        { title: 'Adapters', href: '/docs/hooks/use-wallet#adapters' },
      ],
    },
  ],
  'hooks/use-wallets': [
    {
      title: 'Wallets',
      href: '/docs/hooks/use-wallets#wallets',
      pages: [
        { title: 'Listing', href: '/docs/hooks/use-wallets#listing' },
        { title: 'Detection', href: '/docs/hooks/use-wallets#detection' },
      ],
    },
  ],
  'hooks/use-connect-wallet': [
    {
      title: 'Connect Wallet',
      href: '/docs/hooks/use-connect-wallet#connect-wallet',
      pages: [{ title: 'Usage', href: '/docs/hooks/use-connect-wallet#usage' }],
    },
  ],
  'hooks/use-disconnect-wallet': [
    {
      title: 'Disconnect Wallet',
      href: '/docs/hooks/use-disconnect-wallet#disconnect-wallet',
      pages: [
        { title: 'Usage', href: '/docs/hooks/use-disconnect-wallet#usage' },
      ],
    },
  ],

  // Integrations
  'integrations/horizon': [
    {
      title: 'Horizon API',
      href: '/docs/integrations/horizon#horizon-api',
      pages: [
        { title: 'Endpoints', href: '/docs/integrations/horizon#endpoints' },
        {
          title: 'Rate Limits',
          href: '/docs/integrations/horizon#rate-limits',
        },
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

  // Components
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

  // Theme & Search
  theme: [
    { title: 'Overview', href: '/docs/theme#overview' },
    { title: 'Colors', href: '/docs/theme#colors' },
    { title: 'Typography', href: '/docs/theme#typography' },
  ],
  search: [{ title: 'Search', href: '/docs/search#overview' }],
};
