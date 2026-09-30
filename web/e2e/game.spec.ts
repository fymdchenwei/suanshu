import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const shots = '/opt/cursor/artifacts';

test.beforeAll(() => {
  mkdirSync(shots, { recursive: true });
});

test('plays a landscape round with webgl scenes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/suanshu/');
  await page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('data-ready') === '1');
  await page.waitForFunction(() => Number(document.querySelector('#stage')?.getAttribute('data-variance') || 0) > 12);
  const renderer = await page.locator('#stage').getAttribute('data-renderer');
  console.log('WebGL renderer:', renderer);

  await expect(page.getByRole('button', { name: '开始闯关' })).toBeVisible();
  await expect(page.locator('#rotate')).toBeHidden();
  await page.screenshot({ path: `${shots}/home_island.png` });

  await page.getByRole('button', { name: '挑战' }).click();
  await page.getByRole('button', { name: '开始闯关' }).click();
  await expect(page.locator('#quiz')).toBeVisible();
  await expect(page.locator('#equation')).toHaveAttribute('data-lhs', /.+/);

  const opening = await readProblem(page);
  const wrong = opening.answer === 1 ? '2' : '1';
  await page.getByRole('button', { name: wrong, exact: true }).click();
  await page.getByRole('button', { name: '确定' }).click();
  await expect(page.locator('#equation')).toHaveClass(/is-shaking/);
  await expect(page.locator('#message')).not.toBeEmpty();

  for (let step = 0; step < 30; step += 1) {
    if (await page.locator('#chest').isVisible()) {
      await page.locator('#dismiss-chest').click();
    }
    if (step === 4) {
      await page.screenshot({ path: `${shots}/quiz_keypad.png` });
    }
    await answerCurrent(page);
  }
  if (await page.locator('#chest').isVisible()) {
    await page.locator('#dismiss-chest').click();
  }

  await expect(page.locator('#results')).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${shots}/results_podium.png` });

  const saved = await page.evaluate(() => localStorage.getItem('suanshu.web.v1'));
  expect(saved).toBeTruthy();
  const data = JSON.parse(saved ?? '{}') as { rounds: unknown[]; stickers: unknown[] };
  expect(data.rounds.length).toBe(1);
  expect(data.stickers.length).toBeGreaterThan(0);

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

async function readProblem(page: import('@playwright/test').Page) {
  const equation = page.locator('#equation');
  const lhs = Number(await equation.getAttribute('data-lhs'));
  const rhs = Number(await equation.getAttribute('data-rhs'));
  const op = await equation.getAttribute('data-op');
  return { lhs, rhs, op, answer: op === '+' ? lhs + rhs : lhs - rhs };
}

async function answerCurrent(page: import('@playwright/test').Page) {
  const { answer } = await readProblem(page);
  const current = (await page.locator('#equation .answer-bubble').textContent()) ?? '';
  if (current !== '?' && current !== String(answer)) {
    for (let i = 0; i < current.length; i += 1) {
      await page.getByRole('button', { name: '删除' }).click();
    }
  }
  if (current !== String(answer)) {
    for (const digit of String(answer)) {
      await page.getByRole('button', { name: digit, exact: true }).click();
    }
  }
  await page.getByRole('button', { name: '确定' }).click();
}
