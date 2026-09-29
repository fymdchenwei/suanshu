import { ALL_DIFFICULTIES, ROUND_SIZE, type Difficulty, type Problem } from '../engine/questionEngine';
import {
  Copy,
  chipNote,
  clock,
  collectedCount,
  detail,
  progress,
  roundSummary,
  roundsPlayed,
  shareText,
  shortTitle,
  stageTitle,
} from '../game/copy';
import type { GameSession } from '../game/session';
import { STICKERS } from '../game/stickers';
import type { Stage } from '../render/stage';

const DIGIT_COLORS = ['#b9a3f5', '#f7a8c4', '#f6c445', '#c9b0f7', '#7ddeaf', '#7eb6f6', '#f7b27a', '#e7b0f5', '#f7a0b4', '#f0c84a'];

const KEYS: { label: string; name: string; value: number | 'del' | 'ok'; color: string; lip: string }[] = [
  { label: '1', name: '1', value: 1, color: '#ff9fbe', lip: '#e06b90' },
  { label: '2', name: '2', value: 2, color: '#ffd45a', lip: '#e0a020' },
  { label: '3', name: '3', value: 3, color: '#c9b0ff', lip: '#9070d8' },
  { label: '4', name: '4', value: 4, color: '#8ee8c0', lip: '#4cba8a' },
  { label: '5', name: '5', value: 5, color: '#8ec4ff', lip: '#4d8ed6' },
  { label: '6', name: '6', value: 6, color: '#ffc08a', lip: '#e08848' },
  { label: '7', name: '7', value: 7, color: '#d8c4ff', lip: '#9a78d8' },
  { label: '8', name: '8', value: 8, color: '#ffb3cc', lip: '#e07898' },
  { label: '9', name: '9', value: 9, color: '#ffe07a', lip: '#e0b040' },
  { label: '⌫', name: Copy.delete, value: 'del', color: '#8ecbff', lip: '#4d94d4' },
  { label: '0', name: '0', value: 0, color: '#d2c0f7', lip: '#9078cc' },
  { label: '✓', name: Copy.submit, value: 'ok', color: '#9eeb86', lip: '#4cba55' },
];

export function mountApp(session: GameSession, stage: Stage): void {
  const root = document.querySelector('#app');
  if (!root) return;
  root.innerHTML = template();
  const ui = bind(root);
  buildDifficulty(ui.diffRow, session);
  buildKeypad(ui.keypad, session);
  buildStickers(ui.stickerGrid);

  ui.start.addEventListener('click', () => session.startRound());
  ui.openStickers.addEventListener('click', () => session.openStickers());
  ui.exit.addEventListener('click', () => session.requestExit());
  ui.resultsHome.addEventListener('click', () => session.goHome());
  ui.again.addEventListener('click', () => session.playAgain());
  ui.backIsland.addEventListener('click', () => session.goHome());
  ui.closeStickers.addEventListener('click', () => session.closeStickers());
  ui.dismissChest.addEventListener('click', () => session.dismissChest());
  ui.keepPlaying.addEventListener('click', () => session.cancelExit());
  ui.confirmExit.addEventListener('click', () => session.goHome());
  ui.share.addEventListener('click', () => void share(session));
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-mute]')) {
    button.addEventListener('click', () => session.toggleMute());
  }

  window.addEventListener('keydown', (event) => {
    if (event.key >= '0' && event.key <= '9') session.tapDigit(Number(event.key));
    else if (event.key === 'Backspace') session.deleteDigit();
    else if (event.key === 'Enter') session.submit();
  });

  let lastCorrect = session.correctToken;
  let lastWrong = session.wrongToken;

  const render = () => {
    document.body.dataset.screen = session.screen;
    if (session.screen === 'home' || session.screen === 'quiz' || session.screen === 'results') {
      stage.setMode(session.screen);
    }
    const snap = session.screen !== 'quiz' || (session.index === 0 && session.correctToken === lastCorrect);
    stage.setQuizStone(session.stonesLanded, snap);
    stage.setStars(session.screen === 'results' ? session.stars : 0);
    stage.setChestOpen(session.screen === 'results' || session.chest !== null);
    if (session.correctToken !== lastCorrect) {
      stage.burst();
      spawnBits(10);
      lastCorrect = session.correctToken;
      if (session.streak === 5 || session.streak === 10) flashStreak();
    }
    if (session.wrongToken !== lastWrong) {
      shake(ui.equation);
      lastWrong = session.wrongToken;
    }
    sync(ui, session);
    void document.body.offsetHeight;
    stage.resize();
  };

  session.subscribe(render);
  render();
}

function template(): string {
  return `
    <section id="home" class="screen screen-home">
      <header class="topbar">
        <div class="pill pill-star" id="stat-correct">${starSvg()}<span id="correct-count">0</span></div>
        <button class="pill pill-book" id="open-stickers" type="button">${bookSvg()}<span>${Copy.stickerBook}</span><span class="pill-count" id="sticker-count">0</span></button>
        <div class="spacer"></div>
        <div class="pill pill-flame" id="stat-streak">${flameSvg()}<span id="streak-count">0</span></div>
        <button class="mute" data-mute type="button" aria-label="${Copy.mute}">${speakerSvg(false)}</button>
      </header>
      <div class="grow"></div>
      <footer class="home-dock">
        <div class="diff-row" id="diff-row"></div>
        <button class="start" id="start" type="button">✦ ${Copy.start} ✦</button>
        <p class="home-note" id="home-note"></p>
      </footer>
    </section>
    <section id="quiz" class="screen screen-quiz" hidden>
      <div class="quiz-top">
        <button class="icon-btn wide" id="exit" type="button">${Copy.backToIslandShort}</button>
        <div class="progress-pill"><span id="stage-label">${stageTitle(1)}</span><strong id="progress">1 / 30</strong></div>
        <button class="mute" data-mute type="button" aria-label="${Copy.mute}">${speakerSvg(false)}</button>
      </div>
      <div class="quiz-card">
        <div id="streak-banner" class="streak-banner" hidden></div>
        <div id="equation" class="equation"></div>
        <p id="message" class="message" aria-live="polite"></p>
        <div class="keypad" id="keypad"></div>
      </div>
    </section>
    <section id="results" class="screen screen-results" hidden>
      <header class="topbar">
        <button class="icon-btn wide" id="results-home" type="button">${Copy.backToIslandShort}</button>
        <div class="spacer"></div>
        <button class="icon-btn wide" id="share" type="button">${Copy.share}</button>
      </header>
      <div class="grow"></div>
      <div class="score-wrap">
        <div class="score-card">
          <div class="trophy" aria-hidden="true">${trophySvg()}</div>
          <div>
            <div class="score-main" id="score-text"></div>
            <div class="earned-row" id="earned-row"></div>
          </div>
          <div class="score-meta"><span class="time" id="time-text">0:00</span><span id="stars-text"></span></div>
        </div>
      </div>
      <footer class="results-actions">
        <button class="btn btn-green" id="again" type="button">${Copy.again}</button>
        <button class="btn btn-blue" id="back-island" type="button">${Copy.backToIsland}</button>
      </footer>
    </section>
    <section id="stickers" class="screen screen-stickers" hidden>
      <div class="sheet can-scroll">
        <div class="sheet-head">
          <button class="icon-btn wide" id="close-stickers" type="button">${Copy.back}</button>
          <h1>${Copy.stickerBook}</h1>
          <p id="collected-label"></p>
        </div>
        <div class="sticker-grid" id="sticker-grid"></div>
      </div>
    </section>
    <div id="chest" class="modal" hidden role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="sticker-hero" id="chest-badge">🎁</div>
        <h2 id="chest-title">${Copy.chestTitle}</h2>
        <p id="chest-copy"></p>
        <div class="modal-actions"><button class="btn btn-green" id="dismiss-chest" type="button">${Copy.continuePlaying}</button></div>
      </div>
    </div>
    <div id="exit-modal" class="modal" hidden role="dialog" aria-modal="true">
      <div class="modal-card">
        <h2>${Copy.exitTitle}</h2>
        <p>${Copy.exitMessage}</p>
        <div class="modal-actions">
          <button class="btn btn-green" id="keep-playing" type="button">${Copy.keepPlaying}</button>
          <button class="btn btn-blue" id="confirm-exit" type="button">${Copy.backToIsland}</button>
        </div>
      </div>
    </div>
    <div id="confetti"></div>
  `;
}

interface Ui {
  home: HTMLElement;
  quiz: HTMLElement;
  results: HTMLElement;
  stickers: HTMLElement;
  correctCount: HTMLElement;
  stickerCount: HTMLElement;
  streakCount: HTMLElement;
  openStickers: HTMLButtonElement;
  diffRow: HTMLElement;
  start: HTMLButtonElement;
  homeNote: HTMLElement;
  exit: HTMLButtonElement;
  stageLabel: HTMLElement;
  progress: HTMLElement;
  equation: HTMLElement;
  message: HTMLElement;
  keypad: HTMLElement;
  streakBanner: HTMLElement;
  resultsHome: HTMLButtonElement;
  share: HTMLButtonElement;
  scoreText: HTMLElement;
  timeText: HTMLElement;
  starsText: HTMLElement;
  earnedRow: HTMLElement;
  again: HTMLButtonElement;
  backIsland: HTMLButtonElement;
  closeStickers: HTMLButtonElement;
  collectedLabel: HTMLElement;
  stickerGrid: HTMLElement;
  chest: HTMLElement;
  chestBadge: HTMLElement;
  chestTitle: HTMLElement;
  chestCopy: HTMLElement;
  dismissChest: HTMLButtonElement;
  exitModal: HTMLElement;
  keepPlaying: HTMLButtonElement;
  confirmExit: HTMLButtonElement;
  mutes: NodeListOf<HTMLButtonElement>;
}

function bind(root: ParentNode): Ui {
  const q = <T extends Element>(id: string) => {
    const node = root.querySelector(`#${id}`);
    if (!node) throw new Error(`missing #${id}`);
    return node as unknown as T;
  };
  return {
    home: q('home'),
    quiz: q('quiz'),
    results: q('results'),
    stickers: q('stickers'),
    correctCount: q('correct-count'),
    stickerCount: q('sticker-count'),
    streakCount: q('streak-count'),
    openStickers: q('open-stickers'),
    diffRow: q('diff-row'),
    start: q('start'),
    homeNote: q('home-note'),
    exit: q('exit'),
    stageLabel: q('stage-label'),
    progress: q('progress'),
    equation: q('equation'),
    message: q('message'),
    keypad: q('keypad'),
    streakBanner: q('streak-banner'),
    resultsHome: q('results-home'),
    share: q('share'),
    scoreText: q('score-text'),
    timeText: q('time-text'),
    starsText: q('stars-text'),
    earnedRow: q('earned-row'),
    again: q('again'),
    backIsland: q('back-island'),
    closeStickers: q('close-stickers'),
    collectedLabel: q('collected-label'),
    stickerGrid: q('sticker-grid'),
    chest: q('chest'),
    chestBadge: q('chest-badge'),
    chestTitle: q('chest-title'),
    chestCopy: q('chest-copy'),
    dismissChest: q('dismiss-chest'),
    exitModal: q('exit-modal'),
    keepPlaying: q('keep-playing'),
    confirmExit: q('confirm-exit'),
    mutes: root.querySelectorAll('[data-mute]'),
  };
}

function buildDifficulty(row: HTMLElement, session: GameSession): void {
  for (const difficulty of ALL_DIFFICULTIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'diff';
    button.dataset.difficulty = String(difficulty);
    button.addEventListener('click', () => session.setDifficulty(difficulty));
    row.append(button);
  }
}

function buildKeypad(pad: HTMLElement, session: GameSession): void {
  for (const key of KEYS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key';
    button.textContent = key.label;
    button.setAttribute('aria-label', key.name);
    button.style.setProperty('--key', key.color);
    button.style.setProperty('--lip', key.lip);
    button.addEventListener('click', () => {
      if (key.value === 'del') session.deleteDigit();
      else if (key.value === 'ok') session.submit();
      else session.tapDigit(key.value);
    });
    pad.append(button);
  }
}

function buildStickers(grid: HTMLElement): void {
  for (const sticker of STICKERS) {
    const cell = document.createElement('div');
    cell.className = 'sticker locked';
    cell.dataset.sticker = sticker.id;
    cell.innerHTML = `<b>${sticker.emoji}</b><span>${sticker.name}</span>`;
    grid.append(cell);
  }
}

function sync(ui: Ui, session: GameSession): void {
  show(ui.home, session.screen === 'home');
  show(ui.quiz, session.screen === 'quiz');
  show(ui.results, session.screen === 'results');
  show(ui.stickers, session.screen === 'stickers');

  ui.correctCount.textContent = String(session.save.cumulativeFirstTry);
  ui.stickerCount.textContent = String(session.save.stickers.length);
  ui.streakCount.textContent = String(session.save.bestStreak);
  statLabel(ui, session);
  ui.homeNote.textContent = `${detail(session.difficulty)} · ${roundsPlayed(session.roundsPlayed)}${lastRoundNote(session)}`;
  ui.openStickers.setAttribute('aria-label', `${Copy.stickerBook}，${collectedCount(session.save.stickers.length, STICKERS.length)}`);

  for (const button of ui.diffRow.querySelectorAll<HTMLButtonElement>('.diff')) {
    const difficulty = Number(button.dataset.difficulty) as Difficulty;
    const best = session.bestFor(difficulty)?.bestStars ?? 0;
    const selected = session.difficulty === difficulty;
    button.classList.toggle('selected', selected);
    button.innerHTML = `<strong>${shortTitle(difficulty)}</strong><small>${chipNote(difficulty)}</small><div class="stars">${'★'.repeat(best)}${'☆'.repeat(3 - best)}</div>`;
    button.setAttribute('aria-label', `${shortTitle(difficulty)}，${detail(difficulty)}，最佳 ${best} 颗星`);
    if (selected) button.setAttribute('aria-selected', 'true');
    else button.removeAttribute('aria-selected');
  }

  for (const button of ui.mutes) {
    button.innerHTML = speakerSvg(session.isMuted);
    button.setAttribute('aria-label', session.isMuted ? Copy.unmute : Copy.mute);
  }

  const problem = session.chest ? session.problems[session.index - 1] : session.currentProblem;
  if (problem) paintEquation(ui.equation, problem, session.chest ? '' : session.input);
  ui.stageLabel.textContent = stageTitle(session.stageNumber);
  ui.progress.textContent = progress(session.displayNumber, ROUND_SIZE);
  ui.message.textContent = session.encouragement ?? '';
  ui.message.className = `message ${session.encouragementIsCheer ? 'cheer' : session.encouragement ? 'try' : ''}`;
  ui.streakBanner.hidden = !session.streakBanner;
  ui.streakBanner.textContent = session.streakBanner ?? '';

  ui.scoreText.innerHTML = `<span class="got">${session.firstTryCorrect}</span><span class="slash">/</span><span class="total">${ROUND_SIZE}</span>`;
  ui.timeText.textContent = clock(session.duration);
  ui.starsText.textContent = `${'★'.repeat(session.stars)}${'☆'.repeat(3 - session.stars)}`;
  ui.earnedRow.innerHTML = session.earnedThisRound
    .map((sticker) => `<span title="${sticker.name}" style="background:${sticker.color}">${sticker.emoji}</span>`)
    .join('');

  const owned = new Set(session.save.stickers.map((sticker) => sticker.id));
  for (const cell of ui.stickerGrid.querySelectorAll<HTMLButtonElement>('.sticker')) {
    const id = cell.dataset.sticker ?? '';
    const got = owned.has(id);
    cell.classList.toggle('locked', !got);
    cell.setAttribute('aria-label', got ? (STICKERS.find((item) => item.id === id)?.name ?? '') : Copy.lockedSticker);
  }
  ui.collectedLabel.textContent = collectedCount(owned.size, STICKERS.length);

  show(ui.chest, session.chest !== null && session.screen === 'quiz');
  if (session.chest) {
    if (session.chest.sticker) {
      ui.chestBadge.textContent = session.chest.sticker.emoji;
      ui.chestBadge.style.background = session.chest.sticker.color;
      ui.chestTitle.textContent = session.chest.sticker.name;
      ui.chestCopy.textContent = session.chest.sticker.phrase;
    } else {
      ui.chestBadge.textContent = '✨';
      ui.chestBadge.style.background = '#fff1b8';
      ui.chestTitle.textContent = Copy.stickersComplete;
      ui.chestCopy.textContent = Copy.stickersCompleteDetail;
    }
    ui.dismissChest.textContent = session.chest.isFinal ? Copy.seeScore : Copy.continuePlaying;
  }
  show(ui.exitModal, session.exitPrompt);

  const confetti = document.querySelector('#confetti');
  if (confetti) {
    if (session.screen === 'results') fillConfetti(confetti, 28);
    else if (session.screen !== 'quiz') confetti.replaceChildren();
  }
}

function paintEquation(host: HTMLElement, problem: Problem, input: string): void {
  const symbol = problem.operation === 'addition' ? '+' : '−';
  const opColor = problem.operation === 'addition' ? '#63d36d' : '#ff8b7a';
  host.dataset.lhs = String(problem.lhs);
  host.dataset.rhs = String(problem.rhs);
  host.dataset.op = problem.operation === 'addition' ? '+' : '-';
  host.setAttribute('aria-label', `${problem.lhs} ${problem.operation === 'addition' ? '加' : '减'} ${problem.rhs}`);
  const tokens = [...String(problem.lhs), symbol, ...String(problem.rhs), '='];
  host.replaceChildren();
  for (const token of tokens) {
    const block = document.createElement('span');
    block.className = 'block';
    block.textContent = token;
    if (token === '+') block.style.background = opColor;
    else if (token === '−') block.style.background = opColor;
    else if (token === '=') block.style.background = '#b08cff';
    else block.style.background = DIGIT_COLORS[Number(token)] ?? '#f7a8c4';
    host.append(block);
  }
  const bubble = document.createElement('span');
  bubble.className = 'answer-bubble';
  bubble.textContent = input.length > 0 ? input : '?';
  host.append(bubble);
}

function show(element: HTMLElement, visible: boolean): void {
  element.hidden = !visible;
}

function shake(equation: HTMLElement): void {
  equation.classList.remove('is-shaking');
  void equation.offsetWidth;
  equation.classList.add('is-shaking');
}

function flashStreak(): void {
  document.body.classList.remove('streak-flash');
  void document.body.offsetWidth;
  document.body.classList.add('streak-flash');
}

function spawnBits(count: number): void {
  const layer = document.querySelector('#confetti');
  if (!layer) return;
  const colors = ['#ff8fb8', '#ffd15c', '#7ad0ff', '#b7f08a', '#d7b3ff', '#ffb07a'];
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement('i');
    bit.className = 'bit';
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length]!;
    bit.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
    layer.append(bit);
    window.setTimeout(() => bit.remove(), 1500);
  }
}

function fillConfetti(layer: Element, count: number): void {
  if (layer.childElementCount >= count) return;
  const colors = ['#ff8fb8', '#ffd15c', '#7ad0ff', '#b7f08a', '#d7b3ff', '#ffb07a'];
  layer.replaceChildren();
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement('i');
    bit.className = 'bit';
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length]!;
    bit.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
    bit.style.animationDelay = `${-Math.random() * 2.5}s`;
    layer.append(bit);
  }
}

async function share(session: GameSession): Promise<void> {
  const text = shareText(session.firstTryCorrect, ROUND_SIZE, session.stars);
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
  } catch {
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

function lastRoundNote(session: GameSession): string {
  const last = session.save.rounds[0];
  if (!last) return '';
  return ` · ${roundSummary(last.firstTryCorrect, last.total, last.stars)}`;
}

function statLabel(ui: Ui, session: GameSession): void {
  ui.correctCount.parentElement?.setAttribute('aria-label', `累计一次答对 ${session.save.cumulativeFirstTry} 题`);
  ui.streakCount.parentElement?.setAttribute('aria-label', `最高连对 ${session.save.bestStreak} 题`);
}

function starSvg(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f5a524" d="M12 2.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 15.8 6.8 18.5l1.2-5.8-4.4-4 5.9-.7z"/></svg>';
}

function flameSvg(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff6b57" d="M12 2s2 3.2 2 5.2c0 1.2-.6 1.8-1.2 1.2.8 2.4 3.2 3.2 3.2 6.2A4.8 4.8 0 0 1 7 15.4C7 12 10 11 10 8.2 10 5.6 12 2 12 2z"/></svg>';
}

function bookSvg(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#5aa2e6" d="M5 4.5h6.2c.8 0 1.6.3 2.2.8.6-.5 1.4-.8 2.2-.8H20V18h-4.2c-.7 0-1.4.2-2 .7-.6-.5-1.3-.7-2-.7H5z"/><path fill="#ffe08a" d="M8 8h2.2v2H8zm6.2 0H16v2h-1.8z"/></svg>';
}

function speakerSvg(muted: boolean): string {
  const body = '<path fill="#3a332c" d="M4 9h3.2L12 5.5v13L7.2 15H4z"/>';
  const waves = muted
    ? '<path stroke="#e05a4f" stroke-width="2" d="M15 9l5 6M20 9l-5 6"/>'
    : '<path fill="none" stroke="#3a332c" stroke-width="2" d="M15 9.2a3.2 3.2 0 0 1 0 5.6M17.2 7a6 6 0 0 1 0 10"/>';
  return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${body}${waves}</svg>`;
}

function trophySvg(): string {
  return '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M7 4h10v2a5 5 0 0 1-10 0zm-2 1h2v1a6 6 0 0 0 1.2 3.6A5 5 0 0 1 5 6zm14 0v1a5 5 0 0 1-3.2 3.6A6 6 0 0 0 17 6V5zM9 13h6v2H9zm-1 3h8v2H8z"/></svg>';
}
