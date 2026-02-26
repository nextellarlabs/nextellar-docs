import React from 'react';
import {
  Component,
  Paintbrush,
  Rocket,
  Wrench,
  Database,
  Zap,
  Route,
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
    ],
  },
  {
    title: 'CLI',
    icon: <Zap className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Commands', href: '/docs/cli/commands' },
      { title: 'Flags & Options', href: '/docs/cli/flags' },
      { title: 'Scaffolding Templates', href: '/docs/cli/templates' },
    ],
  },
  {
    title: 'SDK & Reference',
    icon: <Database className="h-5 w-5" />,
    defaultOpen: false,
    pages: [
      { title: 'Overview', href: '/docs/sdk/overview' },
      { title: 'Hooks', href: '/docs/hooks' },
      { title: 'API Reference', href: '/docs/sdk/api-reference' },
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
    title: 'Integrations',
    icon: <Wrench className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      { title: 'Stellar Horizon', href: '/docs/integrations/horizon' },
      {
        title: 'Soroban (Smart Contracts)',
        href: '/docs/integrations/soroban',
      },
      {
        title: 'Wallets (Freighter, Albedo, Lobstr, xBull, Hana)',
        href: '/docs/integrations/wallets',
      },
      { title: 'WalletConnect', href: '/docs/integrations/walletconnect' },
      { title: 'Testing (MSW)', href: '/docs/integrations/testing' },
    ],
  },
  {
    title: 'API Routes',
    icon: <Route className="h-5 w-5" />,
    defaultOpen: true,
    pages: [
      {
        title: 'POST /api/wallet/connect',
        href: '/docs/routes-d/wallet-connect',
      },
      {
        title: 'POST /api/batch',
        href: '/docs/routes-d/batch',
      },
      {
        title: 'GET /api/assets/search',
        href: '/docs/routes-d/assets-search',
      },
      {
        title: 'GET /api/federation/resolve',
        href: '/docs/routes-d/federation-resolve',
      },
      {
        title: 'POST /api/offers/create',
        href: '/docs/routes-d/offers-create',
      },
      {
        title: '/api/liquidity-pools',
        href: '/docs/routes-d/liquidity-pools',
      },
      {
        title: 'POST /api/path-payment/find',
        href: '/docs/routes-d/path-payment-find',
      },
      {
        title: 'GET /api/claimable-balances',
        href: '/docs/routes-d/claimable-balances',
      },
      {
        title: 'GET /api/stream/payments',
        href: '/docs/routes-d/stream-payments',
      },
      {
        title: 'POST /api/soroban/invoke',
        href: '/docs/routes-d/soroban-invoke',
      },
      {
        title: 'GET /api/soroban/events',
        href: '/docs/routes-d/soroban-events',
      },
      {
        title: 'POST /api/transactions/submit',
        href: '/docs/routes-d/transaction-submit',
      },
      {
        title: 'GET /api/account/[address]',
        href: '/docs/routes-d/account-lookup',
      },
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
      { title: 'BalanceCard', href: '/docs/components/balance-card' },
      { title: 'TransactionList', href: '/docs/components/transaction-list' },
      { title: 'PaymentForm', href: '/docs/components/payment-form' },
      { title: 'useWindowSize', href: '/docs/components/use-window-size' },
    ],
  },
];
