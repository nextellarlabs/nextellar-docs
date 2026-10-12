import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/docs/getting-started/introduction',
  '/docs/getting-started/quick-start',
  '/docs/hooks',
  '/docs/guides/custom-hook-authoring-playbook',
];

test.describe('Accessibility Tests', () => {
  pages.forEach((pagePath) => {
    test(`should have no accessibility violations on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      
      // Inject axe-core
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
      });

      // Run axe
      const results = await page.evaluate(async () => {
        // @ts-ignore
        return await axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
        });
      });

      // Assert no violations
      if (results.violations.length > 0) {
        console.log(`\nAccessibility violations on ${pagePath}:`);
        results.violations.forEach((violation: any) => {
          console.log(`\n❌ ${violation.id}: ${violation.description}`);
          console.log(`   Impact: ${violation.impact}`);
          console.log(`   Help: ${violation.help}`);
          console.log(`   Help URL: ${violation.helpUrl}`);
          console.log(`   Affected nodes: ${violation.nodes.length}`);
          violation.nodes.forEach((node: any) => {
            console.log(`     - ${node.html}`);
          });
        });
      }

      expect(results.violations).toHaveLength(0);
    });
  });

  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');
    
    const headings = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim(),
      }));
    });

    // First heading should be h1
    expect(headings[0].tag).toBe('H1');
    
    // Headings should not skip levels
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = parseInt(headings[i].tag[1]);
      const previousLevel = parseInt(headings[i - 1].tag[1]);
      
      // Allow skipping up (e.g., h2 to h4 is ok), but not down more than 1 level
      if (currentLevel > previousLevel) {
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    }
  });

  test('should have alt text for all images', async ({ page }) => {
    await page.goto('/');
    
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => !img.alt).length;
    });

    expect(imagesWithoutAlt).toBe(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
    });

    const results = await page.evaluate(async () => {
      // @ts-ignore
      return await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['color-contrast'],
        },
      });
    });

    if (results.violations.length > 0) {
      console.log('\nColor contrast violations:');
      results.violations.forEach((violation: any) => {
        console.log(`  ${violation.description}`);
      });
    }

    expect(results.violations).toHaveLength(0);
  });

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');
    
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
    });

    const results = await page.evaluate(async () => {
      // @ts-ignore
      return await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['label', 'button-name', 'link-name'],
        },
      });
    });

    if (results.violations.length > 0) {
      console.log('\nARIA label violations:');
      results.violations.forEach((violation: any) => {
        console.log(`  ${violation.description}`);
      });
    }

    expect(results.violations).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test Tab navigation
    const focusableElements = await page.evaluate(() => {
      const focusable = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return focusable.length;
    });

    expect(focusableElements).toBeGreaterThan(0);

    // Test that elements can receive focus
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
  });
});
