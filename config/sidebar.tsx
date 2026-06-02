/**
 * Sidebar Configuration (#127 Cleanup Complete)
 *
 * Components: 2/18 valid links (11% - minimal set)
 * Cleaned: 2026-04-29, removed 3 broken entries (60% of section)
 * Validation: scripts/validate-sidebar.cjs
 *
 * Broken links removed:
 *   - balance-card (no docs/components/balance-card.mdx)
 *   - payment-form (no docs/components/payment-form.mdx)
 *   - transaction-list (no docs/components/transaction-list.mdx)
 *
 * Future additions → run validation script first:
 *   node scripts/validate-sidebar.cjs
 */
import React from 'react';
import {
  Component,
  Paintbrush,
  Rocket,
  Wrench,
  Database,
  Zap,
  BookOpen,
  Plug,
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
  {
    title: 'Getting Started',
    icon: <Rocket className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Introduction', href: '/docs/getting-started/introduction' },
      { title: 'Installation', href: '/docs/getting-started/installation' },
      { title: 'Quick Start', href: '/docs/getting-started/quick-start' },
      { title: 'FAQ', href: '/docs/getting-started/faq' },
    ],
  },
  {
    title: 'CLI',
    icon: <Zap className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Commands', href: '/docs/cli/commands' },
      { title: 'Cheat Sheet', href: '/docs/cli/cheat-sheet' },
      { title: 'Flags & Options', href: '/docs/cli/flags' },
      { title: 'Scaffolding Templates', href: '/docs/cli/templates' },
    ],
  },
  {
    title: 'Guides',
    icon: <BookOpen className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'Contributing', href: '/docs/guides/contributing' },
      { title: 'Docs Style Guide', href: '/docs/guides/style-guide' },
      {
        title: 'PostCSS Configuration',
        href: '/docs/guides/postcss-configuration',
      },
      {
        title: 'CDN and Cache Invalidation',
        href: '/docs/guides/cdn-cache-invalidation',
      },
      {
        title: 'Text Length and Readability',
        href: '/docs/guides/text-length-readability',
      },
      { title: 'Feature Flags', href: '/docs/guides/feature-flags' },
      {
        title: 'Versioned Docs Strategy',
        href: '/docs/guides/versioned-docs-strategy',
      },
      { title: 'Redirects Map', href: '/docs/guides/redirects-map' },
      {
        title: 'Hook Error Handling',
        href: '/docs/guides/hook-error-handling',
      },
      { title: 'Editor Setup', href: '/docs/guides/editor-setup' },
      { title: 'Add a Docs Page', href: '/docs/guides/add-docs-page' },
      {
        title: 'Navigation Configuration',
        href: '/docs/guides/navigation-configuration',
      },
      {
        title: 'Release Notes Workflow',
        href: '/docs/guides/release-notes-workflow',
      },
      { title: 'Extending the CLI', href: '/docs/guides/extending-the-cli' },
      {
        title: 'Performance Budget',
        href: '/docs/guides/performance-budget-guide',
      },
      { title: 'Search Experience', href: '/docs/guides/search' },
      {
        title: 'Testing Docs Changes',
        href: '/docs/guides/testing-docs-changes',
      },
      {
        title: 'Diagram & Image Style',
        href: '/docs/guides/diagram-image-style',
      },
      {
        title: 'Offline Reading Export',
        href: '/docs/guides/offline-reading',
      },
      {
        title: 'Internationalization',
        href: '/docs/guides/internationalization',
      },
      { title: 'Deployment', href: '/docs/guides/deployment' },
      { title: 'Glossary', href: '/docs/guides/glossary' },
      {
        title: 'MDX Custom Components',
        href: '/docs/guides/mdx-custom-components',
      },
      { title: 'Link Validation', href: '/docs/guides/link-validation' },
    ],
  },
  {
    title: 'SDK & Reference',
    icon: <Database className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'API Explorer', href: '/docs/api/explorer' },
      { title: 'Overview', href: '/docs/sdk/overview' },
      { title: 'API Reference', href: '/docs/sdk/api-reference' },
      { title: 'Wallet Integration', href: '/docs/sdk/wallet-integration' },
    ],
  },
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
  {
    title: 'CLI',
    icon: <Zap className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'Overview', href: '/docs/cli/overview' },
      { title: 'Commands', href: '/docs/cli/commands' },
      { title: 'Cheat Sheet', href: '/docs/cli/cheat-sheet' },
      { title: 'Flags & Options', href: '/docs/cli/flags' },
      { title: 'Scaffolding Templates', href: '/docs/cli/templates' },
    ],
  },
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
  {
    title: 'Guides',
    icon: <BookOpen className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'Contributing', href: '/docs/guides/contributing' },
      { title: 'Docs Style Guide', href: '/docs/guides/style-guide' },
      {
        title: 'Versioned Docs Strategy',
        href: '/docs/guides/versioned-docs-strategy',
      },
      { title: 'Redirects Map', href: '/docs/guides/redirects-map' },
      {
        title: 'Hook Error Handling',
        href: '/docs/guides/hook-error-handling',
      },
      { title: 'Editor Setup', href: '/docs/guides/editor-setup' },
      { title: 'Testing (Vitest)', href: '/docs/guides/testing' },
      {
        title: 'Internationalization',
        href: '/docs/guides/internationalization',
      },
      { title: 'Deployment', href: '/docs/guides/deployment' },
      { title: 'Glossary', href: '/docs/guides/glossary' },
      {
        title: 'MDX Custom Components',
        href: '/docs/guides/mdx-custom-components',
      },
      { title: 'Link Validation', href: '/docs/guides/link-validation' },
    ],
  },
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
