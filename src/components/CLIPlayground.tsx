'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CLIPlayground() {
  const [projectName, setProjectName] = useState('my-stellar-app');
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm'>(
    'npm'
  );
  const [skipInstall, setSkipInstall] = useState(false);
  const [horizonUrl, setHorizonUrl] = useState('');
  const [sorobanUrl, setSorobanUrl] = useState('');
  const [wallets, setWallets] = useState<string[]>([
    'freighter',
    'albedo',
    'lobstr',
  ]);
  const [customTimeout, setCustomTimeout] = useState(false);
  const [timeout, setTimeoutValue] = useState('1200000');
  const [copied, setCopied] = useState(false);

  const availableWallets = [
    { id: 'freighter', name: 'Freighter' },
    { id: 'albedo', name: 'Albedo' },
    { id: 'lobstr', name: 'Lobstr' },
    { id: 'xbull', name: 'xBull' },
    { id: 'ledger', name: 'Ledger' },
  ];

  const generateCommand = () => {
    let cmd = `npx nextellar ${projectName}`;

    if (packageManager !== 'npm') {
      cmd += ` --package-manager ${packageManager}`;
    }

    if (skipInstall) {
      cmd += ' --skip-install';
    }

    if (horizonUrl) {
      cmd += ` --horizon-url ${horizonUrl}`;
    }

    if (sorobanUrl) {
      cmd += ` --soroban-url ${sorobanUrl}`;
    }

    const defaultWallets = ['freighter', 'albedo', 'lobstr'];
    const walletsChanged =
      JSON.stringify(wallets.sort()) !== JSON.stringify(defaultWallets.sort());

    if (walletsChanged && wallets.length > 0) {
      cmd += ` --wallets ${wallets.join(',')}`;
    }

    if (customTimeout) {
      cmd += ` --install-timeout ${timeout}`;
    }

    return cmd;
  };

  const copyCommand = async () => {
    await navigator.clipboard.writeText(generateCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleWallet = (walletId: string) => {
    setWallets((prev) =>
      prev.includes(walletId)
        ? prev.filter((w) => w !== walletId)
        : [...prev, walletId]
    );
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
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
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
                onClick={() => setPackageManager(pm)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  packageManager === pm
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
              value={horizonUrl}
              onChange={(e) => setHorizonUrl(e.target.value)}
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
              value={sorobanUrl}
              onChange={(e) => setSorobanUrl(e.target.value)}
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
                className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                  wallets.includes(wallet.id)
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
              checked={skipInstall}
              onChange={(e) => setSkipInstall(e.target.checked)}
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
              checked={customTimeout}
              onChange={(e) => setCustomTimeout(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="custom-timeout" className="text-sm">
              Custom installation timeout
            </label>
          </div>

          {customTimeout && (
            <div className="ml-7">
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeoutValue(e.target.value)}
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
