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
  const covered = await page.evaluate(() => {
    const hero = document.querySelector('#home-hero')?.getBoundingClientRect();
    if (!hero) return ['missing-hero'];
    return [...document.querySelectorAll('.diff')].flatMap((node) => {
      const box = node.getBoundingClientRect();
      const overlaps = box.left < hero.right - 8 && box.right > hero.left + 8 && box.top < hero.bottom && box.bottom > hero.top;
      return overlaps ? [node.getAttribute('aria-label') ?? 'difficulty'] : [];
    });
  });
  expect(covered, '难度按钮挡住了小恐龙').toEqual([]);
  await page.screenshot({ path: `${shots}/home_island.png` });
  await page.locator('#pet-dino').click();
  await page.waitForTimeout(160);
  await expect(page.locator('.heart-pop').first()).toBeVisible();
  await page.screenshot({ path: `${shots}/home_tap.png` });

  await page.getByRole('button', { name: '轻松' }).click();
  await page.getByRole('button', { name: '开始闯关' }).click();
  await expect(page.locator('#quiz')).toBeVisible();
  await blur(page);

  for (let step = 0; step < 30; step += 1) {
    await answerCurrent(page);
    if (step === 4) {
      await expect(page.locator('#streak-banner')).toContainText('连对 5 题');
      await page.waitForTimeout(280);
      await page.screenshot({ path: `${shots}/quiz_streak.png` });
    }
    if (step === 9) {
      await expect(page.locator('#chest')).toBeVisible();
      await expect(page.locator('#reveal-card')).toBeVisible();
      const rarity = page.locator('#chest #reveal-card .tc-rarity');
      for (let reveal = 0; reveal < 4; reveal += 1) {
        if ((await rarity.innerText()) === '稀有') break;
        await page.locator('#dismiss-chest').tap();
        await expect(page.locator('#chest')).toBeVisible();
      }
      await expect(rarity).toHaveText('稀有');
      await expect(page.locator('#chest-copy')).not.toHaveText('');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${shots}/chest_card.png` });
    }
    await clearChest(page);
  }

  await expect(page.locator('#results')).toBeVisible();
  await expect(page.locator('#result-title')).toHaveText('太棒啦！');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${shots}/results_success.png` });

  await page.locator('#results-cards').tap();
  await expect(page.locator('#cards')).toBeVisible();
  await expect(page.locator('#album .tc').first()).toBeVisible();
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${shots}/card_book.png` });
  await page.locator('#album .tc').first().tap();
  await expect(page.locator('#inspect-say')).toBeVisible();
  await page.screenshot({ path: `${shots}/card_inspect.png` });
  await page.locator('#close-inspect').tap();

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

test('quiz keys are large and answers stay visible', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/suanshu/');
  await page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('data-ready') === '1');
  await page.getByRole('button', { name: '开始闯关' }).click();
  await expect(page.locator('#quiz')).toBeVisible();
  await blur(page);
  await expect(page.locator('.answer-bubble')).toHaveText('');
  await expect(page.locator('.answer-bubble')).toHaveClass(/is-empty/);
  const fit = await page.locator('#equation').evaluate((el) => {
    const kids = [...el.children].map((node) => {
      const rect = node.getBoundingClientRect();
      return { text: node.textContent ?? '', left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    const panel = el.parentElement?.getBoundingClientRect();
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      kids,
      panelTop: panel?.top ?? 0,
      panelBottom: panel?.bottom ?? 0,
      vw: window.innerWidth,
      vh: window.innerHeight,
    };
  });
  expect(fit.kids.length).toBeGreaterThanOrEqual(4);
  expect(fit.scrollWidth).toBeLessThanOrEqual(fit.clientWidth + 2);
  for (const kid of fit.kids) {
    expect(kid.width, kid.text).toBeGreaterThan(12);
    expect(kid.height, kid.text).toBeGreaterThan(48);
    expect(kid.left, kid.text).toBeGreaterThanOrEqual(0);
    expect(kid.right, kid.text).toBeLessThanOrEqual(fit.vw + 1);
    expect(kid.top, kid.text).toBeGreaterThanOrEqual(0);
    expect(kid.bottom, kid.text).toBeLessThanOrEqual(fit.panelBottom + 1);
  }
  expect(fit.panelBottom).toBeLessThanOrEqual(fit.vh * 0.58);
  await page.screenshot({ path: `${shots}/quiz_idle.png` });

  const boxes = await page.locator('#keypad .key').evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { label: el.getAttribute('aria-label'), width: rect.width, height: rect.height };
    }),
  );
  expect(boxes.map((box) => box.label)).toEqual(['1', '2', '3', '退格', '4', '5', '6', '确定', '7', '8', '9', '0']);
  for (const box of boxes) {
    expect(box.width, box.label ?? '').toBeGreaterThanOrEqual(150);
    expect(box.height, box.label ?? '').toBeGreaterThanOrEqual(60);
  }

  await page.locator('#keypad').getByRole('button', { name: '确定' }).click();
  await expect(page.locator('#equation')).toHaveClass(/is-shaking/);
  await expect(page.locator('#message')).toHaveText('');
  await expect(page.locator('.answer-bubble')).toHaveText('');

  const problem = await readProblem(page);
  const typed = problem.answer === 0 ? '2' : '0';
  await page.locator('#keypad').getByRole('button', { name: typed, exact: true }).click();
  await expect(page.locator('.answer-bubble')).toHaveText(typed);
  const bubble = await page.locator('.answer-bubble').boundingBox();
  const pad = await page.locator('#keypad').boundingBox();
  expect(bubble).toBeTruthy();
  expect(pad).toBeTruthy();
  expect(bubble!.y + bubble!.height).toBeLessThanOrEqual((pad?.y ?? 0) + 1);
  await page.screenshot({ path: `${shots}/quiz_typing.png` });

  await page.locator('#keypad').getByRole('button', { name: '确定' }).click();
  await expect(page.locator('#message')).toContainText('再试一次');
  await page.screenshot({ path: `${shots}/quiz_wrong.png` });

  await page.keyboard.press('Backspace');
  await answerCurrent(page);
  await expect(page.locator('#message')).toContainText('这次对啦');
  await answerCurrent(page);
  await expect(page.locator('#message')).toContainText('答对啦');
  await page.screenshot({ path: `${shots}/quiz_correct.png` });
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

test('one tap reaches each control on an iPhone', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/suanshu/');
  await page.waitForFunction(() => document.querySelector('#stage')?.getAttribute('data-ready') === '1');

  const targets = ['#start', '#home .diff', '#home [data-mute]', '#open-cards'];
  for (const selector of targets) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box, selector).toBeTruthy();
    expect(box!.height, selector).toBeGreaterThanOrEqual(44);
    expect(box!.width, selector).toBeGreaterThanOrEqual(44);
  }

  const mute = page.locator('#home [data-mute]');
  await expect(mute).toHaveAttribute('aria-label', '静音');
  await mute.tap();
  await expect(mute).toHaveAttribute('aria-label', '打开声音');

  const easy = page.locator('#diff-row .diff').nth(0);
  await expect(easy).toHaveAttribute('aria-selected', 'true');
  const carry = page.locator('#diff-row .diff').nth(1);
  await carry.tap();
  await expect(carry).not.toHaveAttribute('aria-selected', 'true');
  await expect(easy).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('button', { name: '开始闯关' }).tap();
  await expect(page.locator('#quiz')).toBeVisible();
  const quizTargets = ['#exit', '#card-pocket', '#quiz [data-mute]', '#keypad .key'];
  for (const selector of quizTargets) {
    const box = await page.locator(selector).first().boundingBox();
    expect(box, selector).toBeTruthy();
    expect(box!.height, selector).toBeGreaterThanOrEqual(44);
    expect(box!.width, selector).toBeGreaterThanOrEqual(44);
  }

  await page.locator('#keypad').getByRole('button', { name: '确定' }).tap();
  await expect(page.locator('#equation')).toHaveClass(/is-shaking/);

  await page.getByRole('button', { name: '小岛' }).tap();
  await expect(page.locator('#exit-modal')).toBeVisible();
  const keep = page.getByRole('button', { name: '继续答题' });
  const keepBox = await keep.boundingBox();
  expect(keepBox!.height).toBeGreaterThanOrEqual(44);
  await keep.tap();
  await expect(page.locator('#exit-modal')).toBeHidden();

  await page.locator('#card-pocket').tap();
  await expect(page.locator('#cards')).toBeVisible();
  const card = page.locator('#album .tc').first();
  const cardBox = await card.boundingBox();
  expect(cardBox!.height).toBeGreaterThanOrEqual(44);
  await card.tap();
  await expect(page.locator('#inspect')).toBeVisible();
  await page.locator('#close-inspect').tap();
  await expect(page.locator('#inspect')).toBeHidden();
  await page.locator('#close-cards').tap();
  await expect(page.locator('#quiz')).toBeVisible();

  await blur(page);
  for (let step = 0; step < 10; step += 1) await answerCurrent(page);
  await expect(page.locator('#chest')).toBeVisible();
  const dismiss = page.locator('#dismiss-chest');
  const dismissBox = await dismiss.boundingBox();
  expect(dismissBox!.height).toBeGreaterThanOrEqual(44);
  const shown = page.locator('#chest #reveal-card .tc-name');
  const title = await shown.innerText();
  await dismiss.tap();
  if (await page.locator('#chest').isVisible()) {
    await expect(shown).not.toHaveText(title);
  }
  expect(errors, errors.join('\n')).toEqual([]);
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
    await page.locator('#dismiss-chest').tap();
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
