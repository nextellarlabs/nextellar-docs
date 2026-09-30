import { expect, test, type Page } from '@playwright/test';

async function preparePage(
  page: Page,
  path: string,
  viewport: { width: number; height: number },
) {
  await page.setViewportSize(viewport);
  await page.goto(path);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}

test('homepage matches its desktop baseline', async ({ page }) => {
  await preparePage(page, '/', { width: 1440, height: 1000 });

  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});

test('homepage matches its mobile baseline', async ({ page }) => {
  await preparePage(page, '/', { width: 390, height: 844 });

  await expect(page).toHaveScreenshot('homepage-mobile.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});

test('CTA page matches its desktop baseline', async ({ page }) => {
  await preparePage(page, '/cta', { width: 1440, height: 1000 });

  await expect(page).toHaveScreenshot('cta-desktop.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixelRatio: 0.001,
  });
});
