'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useForm } from '@/hooks-d/use-form';

export function CLIPlayground() {
  const { values, register, setFieldValue } = useForm({
    initialValues: {
      projectName: 'my-stellar-app',
      packageManager: 'npm' as 'npm' | 'yarn' | 'pnpm',
      skipInstall: false,
      horizonUrl: '',
      sorobanUrl: '',
      wallets: ['freighter', 'albedo', 'lobstr'],
      customTimeout: false,
      timeout: '1200000',
    }
  });

  const [copied, setCopied] = useState(false);

  const availableWallets = [
    { id: 'freighter', name: 'Freighter' },
    { id: 'albedo', name: 'Albedo' },
    { id: 'lobstr', name: 'Lobstr' },
    { id: 'xbull', name: 'xBull' },
    { id: 'ledger', name: 'Ledger' },
  ];

  const generateCommand = () => {
    let cmd = `npx nextellar ${values.projectName}`;

    if (values.packageManager !== 'npm') {
      cmd += ` --package-manager ${values.packageManager}`;
    }

    if (values.skipInstall) {
      cmd += ' --skip-install';
    }

    if (values.horizonUrl) {
      cmd += ` --horizon-url ${values.horizonUrl}`;
    }

    if (values.sorobanUrl) {
      cmd += ` --soroban-url ${values.sorobanUrl}`;
    }

    const defaultWallets = ['freighter', 'albedo', 'lobstr'];
    const walletsChanged =
      JSON.stringify([...values.wallets].sort()) !== JSON.stringify(defaultWallets.sort());

    if (walletsChanged && values.wallets.length > 0) {
      cmd += ` --wallets ${values.wallets.join(',')}`;
    }

    if (values.customTimeout) {
      cmd += ` --install-timeout ${values.timeout}`;
    }

    return cmd;
  };

  const copyCommand = async () => {
    await navigator.clipboard.writeText(generateCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleWallet = (walletId: string) => {
    const newWallets = values.wallets.includes(walletId)
      ? values.wallets.filter((w) => w !== walletId)
      : [...values.wallets, walletId];
    setFieldValue('wallets', newWallets);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card my-8">
      <div className="bg-muted px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">CLI Command Builder</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your Nextellar project configuration
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...(register('projectName') as any)}
            placeholder="my-stellar-app"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Directory name for your project
          </p>
        </div>

        {/* Package Manager */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Package Manager
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['npm', 'yarn', 'pnpm'] as const).map((pm) => (
              <button
                key={pm}
                onClick={() => setFieldValue('packageManager', pm)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${values.packageManager === pm
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
                  }`}
              >
                {pm}
              </button>
            ))}
          </div>
        </div>

        {/* Network Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Network Configuration</h4>

          <div>
            <label className="block text-sm font-medium mb-2">
              Horizon URL (optional)
            </label>
            <input
              type="text"
              {...(register('horizonUrl') as any)}
              placeholder="https://horizon-testnet.stellar.org"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for testnet default
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Soroban RPC URL (optional)
            </label>
            <input
              type="text"
              {...(register('sorobanUrl') as any)}
              placeholder="https://soroban-testnet.stellar.org"
              className="w-full px-3 py-2 border rounded-md bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for testnet default
            </p>
          </div>
        </div>

        {/* Wallet Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Wallet Adapters
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => toggleWallet(wallet.id)}
                className={`px-3 py-2 border rounded-md text-sm transition-colors ${values.wallets.includes(wallet.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
                  }`}
              >
                {wallet.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Select wallets to include in your project
          </p>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Advanced Options</h4>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="skip-install"
              checked={values.skipInstall}
              onChange={(e) => setFieldValue('skipInstall', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="skip-install" className="text-sm">
              Skip dependency installation
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="custom-timeout"
              checked={values.customTimeout}
              onChange={(e) => setFieldValue('customTimeout', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="custom-timeout" className="text-sm">
              Custom installation timeout
            </label>
          </div>

          {values.customTimeout && (
            <div className="ml-7">
              <input
                type="number"
                {...(register('timeout') as any)}
                placeholder="1200000"
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Timeout in milliseconds (default: 1200000 = 20 minutes)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Command */}
      <div className="border-t bg-muted/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">Generated Command</label>
            <button
              onClick={copyCommand}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-background transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <pre className="bg-background p-4 rounded-md overflow-x-auto text-sm border">
              <code className="font-mono">{generateCommand()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
