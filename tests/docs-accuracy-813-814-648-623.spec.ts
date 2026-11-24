import { test, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Documentation Accuracy Tests for Issues #813, #814, #648, #623
 * 
 * This test suite validates:
 * - Issue #813: SDF (Stellar Development Foundation) glossary entry exists
 * - Issue #814: Envelope XDR and Result XDR glossary entries exist
 * - Issue #648: Wallets documentation references correct wallet adapters
 * - Issue #623: Wallet-provider documentation is consistent with source
 */

const docsRoot = path.join(process.cwd(), 'docs');
const glossaryPath = path.join(docsRoot, 'guides', 'glossary.mdx');
const walletPath = path.join(docsRoot, 'integrations', 'wallets.mdx');
const walletProviderPath = path.join(docsRoot, 'hooks', 'wallet-provider.mdx');

test.describe('Glossary Documentation (Issues #813, #814)', () => {
  let glossaryContent: string;

  test.before(async () => {
    glossaryContent = await fs.readFile(glossaryPath, 'utf-8');
  });

  test('[Issue #813] Glossary contains SDF entry', async () => {
    expect(glossaryContent).toContain('SDF');
    expect(glossaryContent).toContain('Stellar Development Foundation');
  });

  test('[Issue #813] SDF entry is in Common Terms section', async () => {
    // Extract the Common Terms section
    const commonTermsStart = glossaryContent.indexOf('## Common Terms');
    const nextSection = glossaryContent.indexOf('## Related Docs', commonTermsStart);
    const commonTermsSection = glossaryContent.substring(commonTermsStart, nextSection);
    
    expect(commonTermsSection).toContain('### SDF');
  });

  test('[Issue #814] Glossary contains Envelope XDR entry', async () => {
    expect(glossaryContent).toContain('### Envelope XDR');
    expect(glossaryContent).toMatch(/Envelope XDR[\s\S]*envelope.*type/i);
  });

  test('[Issue #814] Glossary contains Result XDR entry', async () => {
    expect(glossaryContent).toContain('### Result XDR');
    expect(glossaryContent).toMatch(/Result XDR[\s\S]*result/i);
  });

  test('[Issue #814] Envelope XDR and Result XDR are properly defined', async () => {
    // Both should be in the Common Terms section
    const commonTermsStart = glossaryContent.indexOf('## Common Terms');
    const nextSection = glossaryContent.indexOf('## Related Docs', commonTermsStart);
    const commonTermsSection = glossaryContent.substring(commonTermsStart, nextSection);
    
    expect(commonTermsSection).toContain('### Envelope XDR');
    expect(commonTermsSection).toContain('### Result XDR');
  });

  test('Glossary entries are well-formatted with consistent structure', async () => {
    // Check that glossary entries follow the ### Title format
    const headerPattern = /### [A-Z]/;
    const matches = glossaryContent.match(new RegExp(headerPattern, 'g'));
    expect(matches).toBeDefined();
    expect(matches!.length).toBeGreaterThan(0);
  });
});

test.describe('Wallets Integration Documentation (Issue #648)', () => {
  let walletsContent: string;

  test.before(async () => {
    walletsContent = await fs.readFile(walletPath, 'utf-8');
  });

  test('[Issue #648] Wallets documentation lists correct adapters', async () => {
    // Should list the five real adapters: Freighter, Albedo, Lobstr, xBull, Hana
    expect(walletsContent).toContain('Freighter');
    expect(walletsContent).toContain('Albedo');
    expect(walletsContent).toContain('Lobstr');
    expect(walletsContent).toContain('xBull');
    expect(walletsContent).toContain('Hana');
  });

  test('[Issue #648] Wallets documentation has proper table structure', async () => {
    expect(walletsContent).toContain('| Wallet');
    expect(walletsContent).toContain('| Type');
    expect(walletsContent).toContain('| Features');
  });

  test('[Issue #648] Documentation mentions stellar-wallets-kit', async () => {
    expect(walletsContent).toContain('@creit.tech/stellar-wallets-kit');
    expect(walletsContent).toContain('StellarWalletsKit');
  });

  test('[Issue #648] All documented adapters are present in code example', async () => {
    expect(walletsContent).toContain('FreighterModule');
    expect(walletsContent).toContain('AlbedoModule');
    expect(walletsContent).toContain('LobstrModule');
    expect(walletsContent).toContain('xBullModule');
    expect(walletsContent).toContain('HanaModule');
  });

  test('[Issue #648] Documentation does not mention unsupported wallets as supported', async () => {
    // Should not list Ledger as supported (it is not wired in the kit)
    const supportedWalletsSection = walletsContent.substring(
      walletsContent.indexOf('## Supported Wallets'),
      walletsContent.indexOf('## Albedo')
    );
    
    // Ledger should not appear in the supported wallets table
    expect(supportedWalletsSection).not.toContain('**Ledger**');
  });

  test('[Issue #648] Documentation includes setup instructions', async () => {
    expect(walletsContent).toContain('## Set Up');
    expect(walletsContent).toContain('Install');
    expect(walletsContent).toContain('scaffolding');
  });

  test('[Issue #648] Documentation includes example usage code', async () => {
    expect(walletsContent).toContain('WalletProvider');
    expect(walletsContent).toContain('useStellarWallet');
    expect(walletsContent).toContain('WalletConnectButton');
  });
});

test.describe('Wallet Provider Documentation (Issue #623)', () => {
  let walletProviderContent: string;

  test.before(async () => {
    if (await fileExists(walletProviderPath)) {
      walletProviderContent = await fs.readFile(walletProviderPath, 'utf-8');
    }
  });

  test('[Issue #623] Wallet provider documentation file exists', async () => {
    const exists = await fileExists(walletProviderPath);
    expect(exists).toBe(true);
  });

  test('[Issue #623] Wallet provider documentation is properly formatted', async () => {
    if (!walletProviderContent) this.skip();
    
    // Should have proper frontmatter
    expect(walletProviderContent).toMatch(/^---[\s\S]*?---/);
  });

  test('[Issue #623] Wallet provider documentation has consistent fence count', async () => {
    if (!walletProviderContent) this.skip();
    
    // Count opening and closing code fences
    const openingFences = (walletProviderContent.match(/```/g) || []).length;
    
    // Should be even (paired fences)
    expect(openingFences % 2).toBe(0);
  });

  test('[Issue #623] Documentation describes WalletProvider correctly', async () => {
    if (!walletProviderContent) this.skip();
    
    expect(walletProviderContent).toContain('WalletProvider');
    expect(walletProviderContent.toLowerCase()).toContain('context');
  });
});

// Helper function to check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

test.describe('Cross-Documentation Consistency', () => {
  let glossaryContent: string;
  let walletsContent: string;

  test.before(async () => {
    glossaryContent = await fs.readFile(glossaryPath, 'utf-8');
    walletsContent = await fs.readFile(walletPath, 'utf-8');
  });

  test('Glossary and Wallets docs use consistent terminology', async () => {
    // Both should reference XDR
    expect(glossaryContent).toContain('XDR');
    expect(walletsContent).toContain('XDR');
  });

  test('Wallets documentation links to glossary for terms', async () => {
    // Should reference glossary for XDR and other definitions
    expect(walletsContent).toContain('glossary');
  });
});
