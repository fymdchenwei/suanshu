import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const shots = '/opt/cursor/artifacts';

test.beforeAll(() => {
  mkdirSync(shots, { recursive: true });
});

test('plays a colourful round and collects cards', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/suanshu/');
  await page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('data-ready') === '1');
  await page.waitForFunction(() => Number(document.querySelector('#stage')?.getAttribute('data-variance') || 0) > 12);
  await page.waitForFunction(() => Number(document.querySelector('#stage')?.getAttribute('data-frame-ms') || 0) > 0);
  const renderer = await page.locator('#stage').getAttribute('data-renderer');
  const frameMs = Number(await page.locator('#stage').getAttribute('data-frame-ms'));
  const draws = Number(await page.locator('#stage').getAttribute('data-draws'));
  console.log(`WebGL renderer: ${renderer}; median frame ${frameMs}ms; draws ${draws}`);
  expect(frameMs).toBeLessThan(80);
  expect(draws).toBeGreaterThan(10);
  expect(draws).toBeLessThan(280);

  await expect(page.getByRole('button', { name: '开始闯关' })).toBeVisible();
  await expect(page.locator('#rotate')).toBeHidden();
  await page.screenshot({ path: `${shots}/home_island.png` });

  await page.getByRole('button', { name: '挑战' }).click();
  await page.getByRole('button', { name: '开始闯关' }).click();
  await expect(page.locator('#quiz')).toBeVisible();
  await blur(page);

  for (let step = 0; step < 30; step += 1) {
    await answerCurrent(page);
    if (step === 0) await page.screenshot({ path: `${shots}/quiz_correct.png` });
    if (step === 4) {
      await expect(page.locator('#streak-banner')).toContainText('连对 5 题');
      await page.screenshot({ path: `${shots}/quiz_streak.png` });
    }
    if (step === 9) {
      await expect(page.locator('#chest')).toBeVisible();
      await expect(page.locator('#reveal-card')).toBeVisible();
      await page.screenshot({ path: `${shots}/chest_card.png` });
    }
    await clearChest(page);
  }

  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#result-title')).toHaveText('太棒啦！');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/results_success.png` });

  await page.locator('#results-cards').click();
  await expect(page.locator('#cards')).toBeVisible();
  await expect(page.locator('#album .tc').first()).toBeVisible();
  await page.screenshot({ path: `${shots}/card_book.png` });

  const saved = await page.evaluate(() => localStorage.getItem('suanshu.web.v1'));
  expect(saved).toBeTruthy();
  const data = JSON.parse(saved ?? '{}') as { rounds: unknown[]; cards: { id: string; achievement: string }[] };
  expect(data.rounds.length).toBe(1);
  expect(data.cards.length).toBeGreaterThan(0);
  expect(data.cards.some((card) => card.achievement.includes('连对 10 题'))).toBeTruthy();
  expect(data.cards.some((card) => card.id === 'flawless')).toBeTruthy();

  const manifest = await page.request.get('/suanshu/manifest.webmanifest');
  expect(manifest.ok()).toBeTruthy();
  const body = await manifest.json();
  expect(body.start_url).toBe('/suanshu/');
  expect(body.scope).toBe('/suanshu/');
  expect(body.display).toBe('fullscreen');
  expect(body.orientation).toBe('landscape');
  expect(body.icons.length).toBeGreaterThan(0);

  const html = await page.request.get('/suanshu/');
  const text = await html.text();
  expect(text).toContain('apple-mobile-web-app-capable');
  expect(text).toContain('viewport-fit=cover');

  expect(errors, errors.join('\n')).toEqual([]);
});

test('a low score stays encouraging', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/suanshu/');
  await page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('data-ready') === '1');
  await page.getByRole('button', { name: '开始闯关' }).click();
  await blur(page);
  for (let step = 0; step < 30; step += 1) {
    await answerCurrent(page, step < 12);
    await clearChest(page);
  }
  await expect(page.locator('#result-title')).toHaveText('再加油！');
  await expect(page.getByText('小恐龙一直陪着你')).toBeVisible();
  await page.screenshot({ path: `${shots}/results_gentle.png` });
  expect(errors, errors.join('\n')).toEqual([]);
});

test('works offline after the first load', async ({ page }) => {
  await page.goto('/suanshu/');
  await page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('data-ready') === '1');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker?.getRegistration();
    return Boolean(registration?.active);
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: '开始闯关' })).toBeVisible();
  await page.context().setOffline(false);
});

test('asks for landscape in portrait', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/suanshu/');
  await expect(page.locator('#rotate')).toBeVisible();
  await expect(page.getByText('请把手机转成横屏')).toBeVisible();
});

async function blur(page: Page) {
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
}

async function clearChest(page: Page) {
  for (let i = 0; i < 6; i += 1) {
    if (!(await page.locator('#chest').isVisible())) return;
    await page.locator('#dismiss-chest').click();
  }
}

async function readProblem(page: Page) {
  const equation = page.locator('#equation');
  const lhs = Number(await equation.getAttribute('data-lhs'));
  const rhs = Number(await equation.getAttribute('data-rhs'));
  const op = await equation.getAttribute('data-op');
  return { lhs, rhs, op, answer: op === '+' ? lhs + rhs : lhs - rhs };
}

async function answerCurrent(page: Page, wrongFirst = false) {
  const { answer } = await readProblem(page);
  if (wrongFirst) {
    const wrong = answer === 0 ? '1' : '0';
    await page.keyboard.press(wrong);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Backspace');
  }
  for (const digit of String(answer)) await page.keyboard.press(digit);
  await page.keyboard.press('Enter');
}
