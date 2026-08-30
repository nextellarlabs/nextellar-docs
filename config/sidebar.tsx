/**
 * Sidebar Configuration
 *
 * Guides reorganised per issue #634 into three groups:
 *   (a) Product Guides     — Nextellar-specific how-to content
 *   (c) Docs Contributing  — docs-site infrastructure and process
 *
 * Off-topic files removed (category d):
 *   - cdn-cache-invalidation.mdx  (generic CDN/infra)
 *   - postcss-configuration.mdx   (generic PostCSS/Tailwind)
 *
 * Validation: scripts/validate-sidebar.cjs
 * Future additions → run validation script first:
 *   node scripts/validate-sidebar.cjs
 */
import React from 'react';
import {
  Component,
  Paintbrush,
  Rocket,
  Database,
  Zap,
  BookOpen,
  Plug,
  FileText,
} from 'lucide-react';

export type SidebarPage = {
  title: string;
  href?: string;
};

export type SidebarSection = {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  href?: string;
  pages?: SidebarPage[];
};

export const sidebarNav: SidebarSection[] = [
  // -------------------------------------------------------------------------
  // Getting Started
  // -------------------------------------------------------------------------
  {
    title: 'Getting Started',
    icon: <Rocket className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Introduction', href: '/docs/getting-started/introduction' },
      { title: 'Installation', href: '/docs/getting-started/installation' },
      { title: 'Quick Start', href: '/docs/getting-started/quick-start' },
      {
        title: 'Contracts Quick Start',
        href: '/docs/getting-started/contracts-quick-start',
      },
      { title: 'Using JavaScript', href: '/docs/getting-started/javascript' },
      { title: 'FAQ', href: '/docs/getting-started/faq' },
    ],
  },

  // -------------------------------------------------------------------------
  // CLI
  // -------------------------------------------------------------------------
  {
    title: 'CLI',
    icon: <Zap className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Overview', href: '/docs/cli/overview' },
      { title: 'Commands', href: '/docs/cli/commands' },
      { title: 'Cheat Sheet', href: '/docs/cli/cheat-sheet' },
      { title: 'Flags & Options', href: '/docs/cli/flags' },
      { title: 'Scaffolding Templates', href: '/docs/cli/templates' },
      { title: 'Template Comparison', href: '/docs/cli/template-comparison' },
    ],
  },

  // -------------------------------------------------------------------------
  // (a) Product Guides — Nextellar-specific how-to content
  // -------------------------------------------------------------------------
  {
    title: 'Product Guides',
    icon: <BookOpen className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Contributing', href: '/docs/guides/contributing' },
      {
        title: 'Pull Request Template',
        href: '/docs/guides/pull-request-template',
      },
      { title: 'Docs Style Guide', href: '/docs/guides/style-guide' },
      {
        title: 'PostCSS Configuration',
        href: '/docs/guides/postcss-configuration',
      },
      {
        title: 'CDN and Cache Invalidation',
        href: '/docs/guides/cdn-cache-invalidation',
      },
      { title: 'Deployment', href: '/docs/guides/deployment' },
      { title: 'Migration', href: '/docs/guides/migration' },
      {
        title: 'Transaction Lifecycle',
        href: '/docs/guides/transaction-lifecycle',
      },
      { title: 'Extending the CLI', href: '/docs/guides/extending-the-cli' },
      { title: 'Feature Flags', href: '/docs/guides/feature-flags' },
      { title: 'Testing', href: '/docs/guides/testing' },
      {
        title: 'Testing Horizon & Soroban',
        href: '/docs/guides/testing-horizon-soroban',
      },
      {
        title: 'Testing Transactions on Testnet',
        href: '/docs/guides/testing-transactions-testnet',
      },
      {
        title: 'Cross-Contract Calls',
        href: '/docs/guides/cross-contract-calls',
      },
      {
        title: 'Hook Error Handling',
        href: '/docs/guides/hook-error-handling',
      },
      {
        title: 'Wallet UX Patterns',
        href: '/docs/guides/wallet-ux-patterns',
      },
      {
        title: 'Custom Hook Authoring',
        href: '/docs/guides/custom-hook-authoring-playbook',
      },
      {
        title: 'Optimizing Transaction Sizes',
        href: '/docs/guides/optimizing-transaction-sizes',
      },
      {
        title: 'Transaction Batching',
        href: '/docs/guides/transaction-batching',
      },
      {
        title: 'Rate Limiting Horizon Requests',
        href: '/docs/guides/rate-limiting-horizon-requests',
      },
      {
        title: 'Streaming Payments from Horizon',
        href: '/docs/guides/streaming-payments-horizon',
      },
      { title: 'Claimable Balances', href: '/docs/guides/claimable-balances' },
      {
        title: 'Time Locked Transactions',
        href: '/docs/guides/time-locked-transactions',
      },
      {
        title: 'Horizon vs Soroban RPC',
        href: '/docs/guides/horizon-vs-soroban-rpc',
      },
      {
        title: 'Asset Authorization Flags',
        href: '/docs/guides/asset-auth-flags',
      },
      {
        title: 'Creating and Managing DEX Offers',
        href: '/docs/guides/offer-creation-management',
      },
      {
        title: 'Documentation Roadmap',
        href: '/docs/guides/roadmap',
        title: 'Security Policy',
        href: '/docs/guides/security-policy',
      },
      { title: 'Security Policy', href: '/docs/guides/security-policy' },
      { title: 'Glossary', href: '/docs/guides/glossary' },
    ],
  },

  // -------------------------------------------------------------------------
  // SDK & Reference
  // -------------------------------------------------------------------------
  {
    title: 'SDK & Reference',
    icon: <Database className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Hosted API (Roadmap)', href: '/docs/api' },
      { title: 'Overview', href: '/docs/sdk/overview' },
      { title: 'API Reference', href: '/docs/sdk/api-reference' },
      { title: 'Wallet Integration', href: '/docs/sdk/wallet-integration' },
    ],
  },

  // -------------------------------------------------------------------------
  // Hooks
  // -------------------------------------------------------------------------
  {
    title: 'Hooks',
    icon: <Component className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'useStellarWallet', href: '/docs/hooks/use-stellar-wallet' },
      { title: 'useStellarBalances', href: '/docs/hooks/use-stellar-balances' },
      { title: 'useStellarPayment', href: '/docs/hooks/use-stellar-payment' },
      {
        title: 'useTransactionHistory',
        href: '/docs/hooks/use-transaction-history',
      },
      { title: 'useTrustlines', href: '/docs/hooks/use-trustlines' },
      { title: 'useOfferBook', href: '/docs/hooks/use-offer-book' },
      { title: 'useSorobanContract', href: '/docs/hooks/use-soroban-contract' },
      { title: 'useSorobanEvents', href: '/docs/hooks/use-soroban-events' },
    ],
  },

  // -------------------------------------------------------------------------
  // Integrations
  // -------------------------------------------------------------------------
  {
    title: 'Integrations',
    icon: <Plug className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'Overview', href: '/docs/integrations' },
      {
        title: 'Wallets (Freighter, Albedo, Lobstr, xBull, Hana)',
        href: '/docs/integrations/wallets',
      },
      { title: 'WalletConnect', href: '/docs/integrations/walletconnect' },
      { title: 'Stellar Horizon', href: '/docs/integrations/horizon' },
      {
        title: 'Soroban (Smart Contracts)',
        href: '/docs/integrations/soroban',
      },
      { title: 'Testing (MSW)', href: '/docs/integrations/testing' },
    ],
  },

  // -------------------------------------------------------------------------
  // (c) Docs Contributing — docs-site infrastructure and process
  // -------------------------------------------------------------------------
  {
    title: 'Docs Contributing',
    icon: <FileText className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'Contributing', href: '/docs/guides/contributing' },
      {
        title: 'Pull Request Template',
        href: '/docs/guides/pull-request-template',
      },
      { title: 'Docs Style Guide', href: '/docs/guides/style-guide' },
      {
        title: 'Contributing Checklist',
        href: '/docs/guides/contributing-checklist',
      },
      {
        title: 'Pull Request Template',
        href: '/docs/guides/pull-request-template',
      },
      { title: 'Style Guide', href: '/docs/guides/style-guide' },
      {
        title: 'Formatting Conventions',
        href: '/docs/guides/formatting-conventions',
      },
      {
        title: 'Text Length & Readability',
        href: '/docs/guides/text-length-readability',
      },
      { title: 'Add a Docs Page', href: '/docs/guides/add-docs-page' },
      {
        title: 'Configure the Sidebar',
        href: '/docs/guides/configure-sidebar',
      },
      {
        title: 'Navigation Configuration',
        href: '/docs/guides/navigation-configuration',
      },
      {
        title: 'MDX Custom Components',
        href: '/docs/guides/mdx-custom-components',
      },
      { title: 'Link Validation', href: '/docs/guides/link-validation' },
      {
        title: 'Testing Docs Changes',
        href: '/docs/guides/testing-docs-changes',
      },
      { title: 'Editor Setup', href: '/docs/guides/editor-setup' },
      {
        title: 'Diagram & Image Style',
        href: '/docs/guides/diagram-image-style',
      },
      {
        title: 'Screenshot Workflow',
        href: '/docs/guides/screenshot-workflow',
      },
      {
        title: 'Docs Build Performance',
        href: '/docs/guides/docs-build-performance-tips',
      },
      {
        title: 'Performance Budget',
        href: '/docs/guides/performance-budget-guide',
      },
      {
        title: 'Release Notes Workflow',
        href: '/docs/guides/release-notes-workflow',
      },
      {
        title: 'Versioned Docs Strategy',
        href: '/docs/guides/versioned-docs-strategy',
      },
      { title: 'Redirects Map', href: '/docs/guides/redirects-map' },
      { title: 'Search Experience', href: '/docs/guides/search' },
      {
        title: 'Offline Reading Export',
        href: '/docs/guides/offline-reading',
      },
      {
        title: 'Streaming Payments from Horizon',
        href: '/docs/guides/streaming-payments-horizon',
      },
      { title: 'Claimable Balances', href: '/docs/guides/claimable-balances' },
      {
        title: 'Time Locked Transactions',
        href: '/docs/guides/time-locked-transactions',
      },
      {
        title: 'Horizon vs Soroban RPC',
        href: '/docs/guides/horizon-vs-soroban-rpc',
      },
      {
        title: 'Security Policy',
        href: '/docs/guides/security-policy',
        title: 'Internationalization',
        href: '/docs/guides/internationalization',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Components
  // -------------------------------------------------------------------------
  {
    title: 'Components',
    icon: <Paintbrush className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      {
        title: 'ConnectWalletButton',
        href: '/docs/components/connect-wallet-button',
      },
      { title: 'useWindowSize', href: '/docs/components/use-window-size' },
    ],
  },
];
