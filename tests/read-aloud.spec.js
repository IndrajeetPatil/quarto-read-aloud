import { test, expect } from '@playwright/test';

async function open(page, unsupported = false) {
  await page.addInitScript(({ unsupported }) => {
    window.speechLog = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    if (unsupported) {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined });
      return;
    }
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => [{ name: 'Test voice' }],
      speak: utterance => { window.lastUtterance = utterance; window.speechLog.push(utterance.text); },
      cancel: () => window.speechLog.push('CANCEL'),
    }});
  }, { unsupported });
  await page.goto('');
  await page.waitForFunction(() => window.Reveal?.isReady());
}

test('reads only current notes, supports stop, completion, errors and keyboard', async ({ page }) => {
  await open(page);
  const button = page.locator('.read-aloud-button');
  await expect(button).toHaveAttribute('aria-label', 'Read aloud');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-label', 'Stop reading');
  expect(await page.evaluate(() => window.speechLog[0])).toBe(await page.evaluate(() => {
    const copy = Reveal.getCurrentSlide().querySelector('aside.notes').cloneNode(true);
    copy.querySelectorAll('script, style, [aria-hidden="true"]').forEach(node => node.remove());
    copy.querySelectorAll('p, li, br, h1, h2, h3, h4, h5, h6').forEach(node => node.append(' '));
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }));
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-label', 'Read aloud');
  expect(await page.evaluate(() => window.speechLog.at(-1))).toBe('CANCEL');
  await button.click();
  await page.evaluate(() => window.lastUtterance.onend());
  await expect(button).toHaveAttribute('aria-label', 'Read aloud');
  await button.click();
  await page.evaluate(() => window.lastUtterance.onerror());
  await expect(page.getByRole('status').filter({ hasText: 'Unable to read notes' })).toBeAttached();
  await expect(button).toHaveAttribute('aria-label', 'Read aloud');
});

test('navigation cancels, never autoplays, and every slide has the right state', async ({ page }) => {
  await open(page);
  await page.locator('.read-aloud-button').click();
  await page.evaluate(() => Reveal.next());
  expect(await page.evaluate(() => window.speechLog.at(-1))).toBe('CANCEL');
  await page.evaluate(() => {
    for (const slide of Reveal.getSlides()) {
      Reveal.slide(...Object.values(Reveal.getIndices(slide)).slice(0, 2));
      const text = slide.querySelector('aside.notes')?.textContent.trim() || slide.dataset.notes?.trim();
      const button = document.querySelector('.read-aloud-button');
      if (button.disabled === !!text) throw new Error(`Wrong button state: ${slide.id}`);
    }
  });
  expect(await page.evaluate(() => window.speechLog.length)).toBe(2);
});

test('unsupported browser disables the control without breaking slides', async ({ page }) => {
  await open(page, true);
  await expect(page.locator('.read-aloud-button')).toBeDisabled();
  await expect(page.locator('.read-aloud-button')).toHaveAttribute('aria-label', 'Speech synthesis unavailable');
  await page.evaluate(() => Reveal.next());
});

test('configuration, stale events and scroll view work', async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    Reveal.getPlugin('RevealReadAloud').destroy();
    Reveal.configure({ readAloud: { rate: 1.2, lang: 'en-GB', voice: 'Test voice', labels: { read: 'Listen' } } });
    window.testPlugin = RevealReadAloud();
    window.testPlugin.init(Reveal);
  });
  const button = page.locator('.read-aloud-button');
  await expect(button).toHaveAttribute('aria-label', 'Listen');
  await button.click();
  expect(await page.evaluate(() => [window.lastUtterance.lang, window.lastUtterance.rate, window.lastUtterance.voice.name])).toEqual(['en-GB', 1.2, 'Test voice']);
  await page.evaluate(() => { window.oldEnd = window.lastUtterance.onend; Reveal.next(); Reveal.prev(); });
  await button.click();
  await page.evaluate(() => window.oldEnd());
  await expect(button).toHaveAttribute('aria-label', 'Stop reading');
  await page.evaluate(() => window.testPlugin.destroy());
  await expect(button).toHaveCount(0);
  await page.goto('?view=scroll');
  await page.waitForFunction(() => window.Reveal?.isReady());
  await expect(button).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await button.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeGreaterThanOrEqual(44);
});
