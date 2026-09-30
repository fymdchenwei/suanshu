import { ALL_DIFFICULTIES, ROUND_SIZE, type Difficulty, type Problem } from '../engine/questionEngine';
import { cardFaceUrl, lockedCardUrl, sceneArt } from '../game/cardFaces';
import {
  CARDS,
  RARITY_LABEL,
  SERIES,
  cardsInSeries,
  formatCardDate,
  lockedCheer,
  resolveCard,
  seriesName,
  unlockStatusWithOwned,
  type CardDef,
  type EarnedCard,
  type SeriesId,
} from '../game/cards';
import { consecutivePlayDays, progressFromSave } from '../game/progress';
import {
  Copy,
  clock,
  collectedCount,
  comboText,
  detail,
  progress,
  resultBody,
  resultTitle,
  shareText,
  shortTitle,
  stageTitle,
} from '../game/copy';
import type { GameSession } from '../game/session';
import type { Stage } from '../render/stage';

const DIGIT_COLORS = ['#b9a3f5', '#f7a8c4', '#f6c445', '#c9b0f7', '#7ddeaf', '#7eb6f6', '#f7b27a', '#e7b0f5', '#f7a0b4', '#f0c84a'];

const KEYS: { label: string; name: string; value: number | 'del' | 'ok'; color: string; lip: string }[] = [
  { label: '1', name: '1', value: 1, color: '#ff8eb8', lip: '#d45b86' },
  { label: '2', name: '2', value: 2, color: '#ff9a3c', lip: '#e06a14' },
  { label: '3', name: '3', value: 3, color: '#ffe14a', lip: '#e0a818' },
  { label: '⌫', name: Copy.delete, value: 'del', color: '#5eb0ff', lip: '#2d78c8' },
  { label: '4', name: '4', value: 4, color: '#b48cff', lip: '#7a58c8' },
  { label: '5', name: '5', value: 5, color: '#7ddea0', lip: '#3aaa62' },
  { label: '6', name: '6', value: 6, color: '#ff8eb8', lip: '#d45b86' },
  { label: '✓', name: Copy.submit, value: 'ok', color: '#3dce6a', lip: '#1f9a42' },
  { label: '7', name: '7', value: 7, color: '#5aa8ff', lip: '#2d74d0' },
  { label: '8', name: '8', value: 8, color: '#c9a6ff', lip: '#8870c8' },
  { label: '9', name: '9', value: 9, color: '#ffe14a', lip: '#e0a818' },
  { label: '0', name: '0', value: 0, color: '#8fd4ff', lip: '#4aa0d8' },
];

export function mountApp(session: GameSession, stage: Stage): void {
  const scenes = sceneArt();
  document.documentElement.style.setProperty('--art-home', `url("${scenes.home}")`);
  document.documentElement.style.setProperty('--art-reveal', `url("${scenes.reveal}")`);
  const root = document.querySelector('#app');
  if (!root) return;
  root.innerHTML = template();
  const ui = bind(root);
  buildDifficulty(ui.diffRow, session);
  buildPathNodes(ui.pathNodes);
  buildKeypad(ui.keypad, session);
  buildTrack(ui.track);
  buildSeriesTabs(ui, session);
  buildAlbum(ui);

  bindTap(ui.start, () => session.startRound());
  bindTap(ui.openCards, () => session.openCards());
  bindTap(ui.cardPocket, () => session.openCards());
  bindTap(ui.resultsCards, () => session.openCards());
  bindTap(ui.exit, () => session.requestExit());
  bindTap(ui.resultsHome, () => session.goHome());
  bindTap(ui.again, () => session.playAgain());
  bindTap(ui.closeCards, () => session.closeCards());
  bindTap(ui.dismissChest, () => {
    if (!ui.revealCard.hidden) flyClone(ui.revealCard, ui.cardPocket);
    session.dismissChest();
  });
  bindTap(ui.keepPlaying, () => session.cancelExit());
  bindTap(ui.confirmExit, () => session.goHome());
  bindTap(ui.share, () => void share(session));
  bindTap(ui.closeInspect, () => {
    ui.inspect.hidden = true;
    ui.inspectTilt?.();
    ui.inspectTilt = undefined;
  });
  bindTap(ui.inspectPrev, () => stepInspect(ui, session, -1));
  bindTap(ui.inspectNext, () => stepInspect(ui, session, 1));
  bindTap(ui.chestCards, () => session.openCards());
  bindTap(ui.pet, () => {
    session.cheerPet();
    floatHearts(ui.pet);
    const sprite = ui.pet.querySelector('.island-sprite');
    if (sprite instanceof HTMLElement) {
      sprite.classList.remove('is-hop');
      void sprite.offsetWidth;
      sprite.classList.add('is-hop');
    }
  });
  ui.pet.querySelector('.island-sprite')?.addEventListener('animationend', (event) => {
    if (!(event instanceof AnimationEvent) || event.animationName !== 'island-hop') return;
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.classList.remove('is-hop');
  });
  bindCardTap(ui.cards, (id) => openInspect(ui, id, session));
  ui.album.addEventListener('pointermove', (event) => tiltCard(event));
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-mute]')) {
    bindTap(button, () => session.toggleMute());
  }

  window.addEventListener('keydown', (event) => {
    if (session.screen !== 'quiz' || session.chest || session.exitPrompt) return;
    if (event.key >= '0' && event.key <= '9') {
      event.preventDefault();
      buzz();
      session.tapDigit(Number(event.key));
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      buzz();
      session.deleteDigit();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      buzz();
      session.submit();
    }
  });
  window.addEventListener('resize', () => {
    placeQuizStage(session);
    stage.resize();
  });

  let lastCorrect = session.correctToken;
  let lastWrong = session.wrongToken;
  let lastEmpty = session.emptySubmitToken;
  let lastLanded = 0;

  const render = () => {
    document.body.dataset.screen = session.screen;
    if (session.screen === 'home' || session.screen === 'quiz' || session.screen === 'results') {
      stage.setMode(session.screen);
    }
    if (session.screen === 'quiz') stage.setTheme(session.difficulty);
    const landed = session.stonesLanded;
    const snap = session.screen !== 'quiz' || (session.index === 0 && session.correctToken === lastCorrect);
    stage.setQuizStone(landed, snap || landed < lastLanded);
    lastLanded = landed;
    stage.setStars(session.screen === 'results' ? session.stars : 0);
    stage.setChestOpen(session.screen === 'results' || session.chest !== null);
    if (session.screen === 'results') stage.setResultMood(session.stars <= 1 ? 'gentle' : 'cheer');
    if (session.correctToken !== lastCorrect) {
      const level = session.streak >= 10 ? 2 : session.streak >= 5 ? 1 : 0;
      stage.burst(level);
      stage.setQuizMood('happy');
      spawnCandy(level);
      glow(level === 2 ? 'max' : level === 1 ? 'hot' : 'ok');
      lastCorrect = session.correctToken;
    }
    if (session.wrongToken !== lastWrong) {
      stage.setQuizMood('sad');
      shake(ui.equation);
      glow('soft');
      lastWrong = session.wrongToken;
    }
    if (session.emptySubmitToken !== lastEmpty) {
      shake(ui.equation);
      lastEmpty = session.emptySubmitToken;
    }
    sync(ui, session);
    placeQuizStage(session);
    stage.resize();
  };

  session.subscribe(render);
  render();
}

function template(): string {
  const scenes = sceneArt();
  return `
    <section id="home" class="screen screen-home">
      <header class="topbar">
        <div class="pill pill-star" id="stat-correct">${starSvg()}<span id="correct-count">0</span></div>
        <button class="pill pill-book" id="open-cards" type="button">${bookSvg()}<span class="pill-count" id="card-count">0/60</span></button>
        <div class="spacer"></div>
        <div class="pill pill-days" id="stat-streak">${flameSvg()}<span id="streak-count">0天</span></div>
        <button class="mute" data-mute type="button" aria-label="${Copy.mute}">${speakerSvg(false)}</button>
      </header>
      <div class="home-stage">
        <div id="home-hero" class="home-hero">
          <button id="pet-dino" type="button" aria-label="摸摸小恐龙"><img class="island-sprite" src="${scenes.island}" alt="" draggable="false"></button>
        </div>
        <div class="home-path">
          <div class="path-play">
            <div class="path-board" id="path-nodes">
              <svg class="trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <pattern id="checks" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill="#ffb07a"/>
                    <rect width="4" height="4" fill="#ff8eb8"/>
                    <rect x="4" y="4" width="4" height="4" fill="#ff8eb8"/>
                  </pattern>
                </defs>
                <path class="trail-edge" d="M16 86 C 42 84, 58 62, 48 48 S 70 28, 62 16 S 88 8, 90 14" />
                <path class="trail-core" stroke="url(#checks)" d="M16 86 C 42 84, 58 62, 48 48 S 70 28, 62 16 S 88 8, 90 14" />
              </svg>
            </div>
            <div class="diff-rail" id="diff-row"></div>
          </div>
          <button class="start" id="start" type="button"><span class="start-star" aria-hidden="true">★</span>${Copy.start}<span class="start-spark" aria-hidden="true">✦</span></button>
        </div>
      </div>
    </section>
    <section id="quiz" class="screen screen-quiz" hidden>
      <div class="answer-panel">
        <div class="answer-meta">
          <div id="streak-banner" class="streak-banner" hidden></div>
          <div id="combo" class="combo" hidden></div>
        </div>
        <div id="equation" class="equation"></div>
        <p id="message" class="message" aria-live="polite"></p>
      </div>
      <div class="quiz-strip">
        <button class="icon-btn wide" id="exit" type="button">${Copy.backToIslandShort}</button>
        <div id="quiz-island" class="quiz-island"></div>
        <div class="stage-badge">
          <span id="stage-label">${stageTitle(1)}</span>
          <strong id="progress">1 / 30</strong>
        </div>
        <div class="vtrack" id="track"></div>
        <button class="icon-btn pocket" id="card-pocket" type="button" aria-label="${Copy.cardBook}">${bookSvg()}</button>
        <button class="mute" data-mute type="button" aria-label="${Copy.mute}">${speakerSvg(false)}</button>
      </div>
      <div class="keypad" id="keypad"></div>
    </section>
    <section id="results" class="screen screen-results" hidden>
      <header class="topbar">
        <button class="icon-btn wide" id="results-home" type="button">${Copy.backToIslandShort}</button>
        <div class="spacer"></div>
        <button class="icon-btn wide" id="share" type="button">${Copy.share}</button>
      </header>
      <div class="grow"></div>
      <article class="award-card" id="award-card">
        <h2 id="result-title"></h2>
        <p id="result-body"></p>
        <div class="award-main">
          <div class="award-stars" id="award-stars"></div>
          <div class="award-score" id="score-text"></div>
        </div>
        <p class="award-meta"><span id="time-text"></span><span id="streak-text"></span></p>
        <div id="consolation"></div>
        <div class="earned-row" id="earned-row"></div>
      </article>
      <footer class="results-actions">
        <button class="btn btn-green" id="again" type="button">${Copy.again}</button>
        <button class="btn btn-blue" id="results-cards" type="button">${Copy.cardBook}</button>
      </footer>
    </section>
    <section id="cards" class="screen screen-cards" hidden>
      <div class="sheet can-scroll">
        <div class="sheet-head">
          <button class="back-round" id="close-cards" type="button" aria-label="${Copy.back}">←</button>
          <h1 class="album-title">我的卡片</h1>
          <p class="heart-progress" id="collected-label"></p>
        </div>
        <div class="series-tabs" id="series-tabs"></div>
        <p class="series-count" id="series-count">本系列 0/12</p>
        <div class="album" id="album"></div>
        <div class="legacy" id="legacy" hidden></div>
      </div>
    </section>
    <div id="chest" class="modal" hidden role="dialog" aria-modal="true">
      <div class="modal-card chest-modal">
        <div class="chest-rays" aria-hidden="true"></div>
        <div class="chest-pop" aria-hidden="true">${confettiBits()}</div>
        <h2 id="chest-title" class="ribbon-title"><span>${Copy.newCard}</span></h2>
        <div class="chest-stage">
          <div class="chest-dino" aria-hidden="true"><img src="${scenes.cheer}" alt="" draggable="false"></div>
          <div id="reveal-card" class="reveal-card"></div>
          <div class="chest-bubble" id="chest-bubble">
            <p class="line-pink">太棒啦</p>
            <p class="line-blue" id="chest-copy">继续加油！</p>
          </div>
          <p id="chest-meta" hidden></p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-green" id="dismiss-chest" type="button">${Copy.takeCard}</button>
          <button class="btn btn-blue" id="chest-cards" type="button">${Copy.viewCards}</button>
        </div>
      </div>
    </div>
    <div id="inspect" class="modal" hidden role="dialog" aria-modal="true">
      <div class="inspect-wrap">
        <div class="inspect-body">
          <div id="inspect-card" class="inspect-card"></div>
          <div class="inspect-copy can-scroll">
            <p id="inspect-say"></p>
            <div id="inspect-meta"></div>
          </div>
        </div>
        <div class="inspect-nav">
          <button class="btn btn-blue" id="inspect-prev" type="button">上一张</button>
          <button class="btn btn-green" id="close-inspect" type="button">${Copy.back}</button>
          <button class="btn btn-blue" id="inspect-next" type="button">下一张</button>
        </div>
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
  cards: HTMLElement;
  correctCount: HTMLElement;
  cardCount: HTMLElement;
  streakCount: HTMLElement;
  openCards: HTMLButtonElement;
  cardPocket: HTMLButtonElement;
  diffRow: HTMLElement;
  start: HTMLButtonElement;
  pet: HTMLButtonElement;
  pathNodes: HTMLElement;
  seriesTabs: HTMLElement;
  seriesCount: HTMLElement;
  seriesId: SeriesId;
  exit: HTMLButtonElement;
  stageLabel: HTMLElement;
  progress: HTMLElement;
  track: HTMLElement;
  equation: HTMLElement;
  message: HTMLElement;
  keypad: HTMLElement;
  combo: HTMLElement;
  streakBanner: HTMLElement;
  resultsHome: HTMLButtonElement;
  share: HTMLButtonElement;
  awardCard: HTMLElement;
  resultTitle: HTMLElement;
  resultBody: HTMLElement;
  awardStars: HTMLElement;
  scoreText: HTMLElement;
  timeText: HTMLElement;
  streakText: HTMLElement;
  consolation: HTMLElement;
  earnedRow: HTMLElement;
  again: HTMLButtonElement;
  resultsCards: HTMLButtonElement;
  closeCards: HTMLButtonElement;
  collectedLabel: HTMLElement;
  album: HTMLElement;
  legacy: HTMLElement;
  chest: HTMLElement;
  revealCard: HTMLElement;
  chestTitle: HTMLElement;
  chestCopy: HTMLElement;
  chestBubble: HTMLElement;
  chestMeta: HTMLElement;
  dismissChest: HTMLButtonElement;
  chestCards: HTMLButtonElement;
  inspect: HTMLElement;
  inspectCard: HTMLElement;
  inspectSay: HTMLElement;
  inspectMeta: HTMLElement;
  inspectPrev: HTMLButtonElement;
  inspectNext: HTMLButtonElement;
  closeInspect: HTMLButtonElement;
  inspectTilt?: () => void;
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
    cards: q('cards'),
    correctCount: q('correct-count'),
    cardCount: q('card-count'),
    streakCount: q('streak-count'),
    openCards: q('open-cards'),
    cardPocket: q('card-pocket'),
    diffRow: q('diff-row'),
    start: q('start'),
    pet: q('pet-dino'),
    pathNodes: q('path-nodes'),
    seriesTabs: q('series-tabs'),
    seriesCount: q('series-count'),
    seriesId: 'partners',
    exit: q('exit'),
    stageLabel: q('stage-label'),
    progress: q('progress'),
    track: q('track'),
    equation: q('equation'),
    message: q('message'),
    keypad: q('keypad'),
    combo: q('combo'),
    streakBanner: q('streak-banner'),
    resultsHome: q('results-home'),
    share: q('share'),
    awardCard: q('award-card'),
    resultTitle: q('result-title'),
    resultBody: q('result-body'),
    awardStars: q('award-stars'),
    scoreText: q('score-text'),
    timeText: q('time-text'),
    streakText: q('streak-text'),
    consolation: q('consolation'),
    earnedRow: q('earned-row'),
    again: q('again'),
    resultsCards: q('results-cards'),
    closeCards: q('close-cards'),
    collectedLabel: q('collected-label'),
    album: q('album'),
    legacy: q('legacy'),
    chest: q('chest'),
    revealCard: q('reveal-card'),
    chestTitle: q('chest-title'),
    chestCopy: q('chest-copy'),
    chestBubble: q('chest-bubble'),
    chestMeta: q('chest-meta'),
    dismissChest: q('dismiss-chest'),
    chestCards: q('chest-cards'),
    inspect: q('inspect'),
    inspectCard: q('inspect-card'),
    inspectSay: q('inspect-say'),
    inspectMeta: q('inspect-meta'),
    inspectPrev: q('inspect-prev'),
    inspectNext: q('inspect-next'),
    closeInspect: q('close-inspect'),
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
    bindTap(button, () => {
      if (!difficultyOpen(session, difficulty)) {
        button.classList.remove('is-shaking');
        void button.offsetWidth;
        button.classList.add('is-shaking');
        return;
      }
      session.setDifficulty(difficulty);
    });
    row.append(button);
  }
}

function buildKeypad(pad: HTMLElement, session: GameSession): void {
  for (const key of KEYS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = key.value === 'ok' ? 'key key-ok' : key.value === 'del' ? 'key key-del' : 'key';
    button.setAttribute('aria-label', key.name);
    button.style.setProperty('--key', key.color);
    button.style.setProperty('--lip', key.lip);
    if (key.value === 'ok') button.innerHTML = '<span class="key-mark">✓</span><span>确定</span>';
    else if (key.value === 'del') button.innerHTML = '<span class="key-mark">⌫</span><span>退格</span>';
    else button.textContent = key.label;
    button.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      button.classList.add('is-down');
      window.setTimeout(() => button.classList.remove('is-down'), 120);
      buzz();
      if (key.value === 'del') session.deleteDigit();
      else if (key.value === 'ok') session.submit();
      else session.tapDigit(key.value);
    });
    const release = () => button.classList.remove('is-down');
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
    pad.append(button);
  }
}

/** One finger-up inside the control runs the action. Pointer capture keeps the tap
 * if the button shifts, and the extra click from mouse/touch is ignored. */
function bindTap(element: HTMLElement, action: () => void): void {
  let armed = false;
  let originX = 0;
  let originY = 0;
  element.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    armed = true;
    originX = event.clientX;
    originY = event.clientY;
    element.classList.add('is-pressed');
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // The control can be detached before capture is available.
    }
    event.preventDefault();
  });
  const finish = (event: PointerEvent, fire: boolean) => {
    if (!armed) return;
    armed = false;
    element.classList.remove('is-pressed');
    if (!fire) return;
    const rect = element.getBoundingClientRect();
    const near =
      event.clientX >= rect.left - 16 &&
      event.clientX <= rect.right + 16 &&
      event.clientY >= rect.top - 16 &&
      event.clientY <= rect.bottom + 16;
    const slipped = Math.hypot(event.clientX - originX, event.clientY - originY) > 28;
    if (near && !slipped) action();
  };
  element.addEventListener('pointerup', (event) => finish(event, true));
  element.addEventListener('pointercancel', (event) => finish(event, false));
  element.addEventListener('click', (event) => {
    if (event.detail !== 0) return;
    action();
  });
}

function bindCardTap(host: HTMLElement, action: (id: string) => void): void {
  let armed: { id: number; x: number; y: number; moved: boolean } | null = null;
  host.addEventListener('pointerdown', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('.tc');
    if (!button || !host.contains(button)) return;
    armed = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    button.classList.add('is-pressed');
  });
  host.addEventListener('pointermove', (event) => {
    if (!armed || armed.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - armed.x, event.clientY - armed.y) > 12) armed.moved = true;
  });
  const clearPressed = () => host.querySelectorAll('.is-pressed').forEach((node) => node.classList.remove('is-pressed'));
  host.addEventListener('pointerup', (event) => {
    const gesture = armed;
    armed = null;
    clearPressed();
    if (!gesture || gesture.moved || gesture.id !== event.pointerId) return;
    const button = (event.target as Element).closest<HTMLButtonElement>('.tc');
    if (!button || !host.contains(button)) return;
    action(button.dataset.card ?? '');
  });
  host.addEventListener('pointercancel', () => {
    armed = null;
    clearPressed();
  });
  host.addEventListener('click', (event) => {
    if (event.detail !== 0) return;
    const button = (event.target as Element).closest<HTMLButtonElement>('.tc');
    if (!button || !host.contains(button)) return;
    action(button.dataset.card ?? '');
  });
}

function buzz(): void {
  const vibrate = navigator.vibrate?.bind(navigator);
  if (!vibrate) return;
  try {
    vibrate(12);
  } catch {
    // Some browsers expose vibrate but reject the call.
  }
}

function placeQuizStage(session: GameSession): void {
  const canvas = document.querySelector<HTMLCanvasElement>('#stage');
  if (!canvas) return;
  const pin = (host: HTMLElement | null, radius: string, zIndex: string) => {
    if (!host) return false;
    const rect = host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    canvas.style.left = `${rect.left}px`;
    canvas.style.top = `${rect.top}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.zIndex = zIndex;
    canvas.style.borderRadius = radius;
    canvas.style.pointerEvents = 'none';
    return true;
  };
  canvas.style.visibility = session.screen === 'home' ? 'hidden' : '';
  if (session.screen === 'quiz' && pin(document.querySelector('#quiz-island'), '10px', '2')) return;
  if (session.screen === 'home') return;
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
  canvas.style.borderRadius = '0';
  canvas.style.pointerEvents = 'none';
}

function buildTrack(track: HTMLElement): void {
  const trophy = document.createElement('i');
  trophy.className = 'bead trophy done';
  trophy.textContent = '🏆';
  track.append(trophy);
  for (let i = 0; i < 10; i += 1) {
    const bead = document.createElement('i');
    bead.className = 'bead';
    track.append(bead);
  }
}

function buildSeriesTabs(ui: Ui, session: GameSession): void {
  for (const series of SERIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'series-tab';
    button.dataset.series = series.id;
    button.textContent = series.name;
    bindTap(button, () => {
      ui.seriesId = series.id;
      buildAlbum(ui);
      sync(ui, session);
    });
    ui.seriesTabs.append(button);
  }
}

function buildAlbum(ui: Ui): void {
  ui.album.replaceChildren();
  ui.album.dataset.series = ui.seriesId;
  for (const def of cardsInSeries(ui.seriesId)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tc locked rarity-${def.rarity}`;
    button.dataset.card = def.id;
    button.innerHTML = `
      <div class="tc-tilt">
        <div class="tc-art">${cardPicture(def, true, true)}</div>
        <div class="foil"></div>
        <b class="tc-rarity">${RARITY_LABEL[def.rarity]}</b>
        <strong class="tc-name">神秘卡片</strong>
        <em class="tc-detail"></em>
        <small class="tc-foot"></small>
      </div>`;
    ui.album.append(button);
  }
}

function sync(ui: Ui, session: GameSession): void {
  show(ui.home, session.screen === 'home');
  show(ui.quiz, session.screen === 'quiz');
  show(ui.results, session.screen === 'results');
  show(ui.cards, session.screen === 'cards');

  const catalogOwned = session.save.cards.filter((card) => !card.id.startsWith('legacy:')).length;
  const starTotal = session.save.rounds.reduce((sum, round) => sum + round.stars, 0);
  ui.correctCount.textContent = String(starTotal);
  ui.cardCount.textContent = `${catalogOwned}/${CARDS.length}`;
  const days = consecutivePlayDays(session.save.playDates, Date.now());
  ui.streakCount.textContent = `${days}天`;
  ui.correctCount.parentElement?.setAttribute('aria-label', `星星 ${starTotal}`);
  ui.streakCount.parentElement?.setAttribute('aria-label', `连续 ${days} 天`);
  ui.openCards.setAttribute('aria-label', `${Copy.cardBook}，${collectedCount(catalogOwned, CARDS.length)}`);

  for (const button of ui.diffRow.querySelectorAll<HTMLButtonElement>('.diff')) {
    const difficulty = Number(button.dataset.difficulty) as Difficulty;
    const best = session.bestFor(difficulty)?.bestStars ?? 0;
    const open = difficultyOpen(session, difficulty);
    const selected = open && session.difficulty === difficulty;
    button.classList.toggle('selected', selected);
    button.classList.toggle('locked', !open);
    const icons = ['★', '+1', '↑', '🔥'];
    const lock = open ? '' : '<span class="node-lock" aria-hidden="true">🔒</span>';
    const markup = `<span class="diff-icon" aria-hidden="true">${icons[difficulty - 1] ?? '★'}</span><span class="diff-name">${shortTitle(difficulty)}</span>${lock}`;
    const view = `${markup}|${selected}|${open}`;
    if (button.dataset.view !== view) {
      button.dataset.view = view;
      button.innerHTML = markup;
    }
    button.setAttribute(
      'aria-label',
      open
        ? `${shortTitle(difficulty)}，${detail(difficulty)}，最佳 ${best} 颗星`
        : `${shortTitle(difficulty)}，${detail(difficulty)}，未解锁`,
    );
    if (selected) button.setAttribute('aria-selected', 'true');
    else button.removeAttribute('aria-selected');
  }

  for (const node of ui.pathNodes.querySelectorAll<HTMLElement>('.level-node')) {
    const difficulty = Number(node.dataset.difficulty) as Difficulty;
    const best = session.bestFor(difficulty)?.bestStars ?? 0;
    const cleared = (session.bestFor(difficulty)?.roundsPlayed ?? 0) > 0;
    const open = difficultyOpen(session, difficulty);
    const selected = open && session.difficulty === difficulty;
    node.classList.toggle('cleared', cleared);
    node.classList.toggle('current', selected && !cleared);
    node.classList.toggle('locked', !open);
    const stars = cleared
      ? `<span class="node-stars">${Array.from({ length: 3 }, (_, index) => `<i class="${index < best ? 'on' : ''}">★</i>`).join('')}</span>`
      : '';
    const lock = open ? '' : '<span class="node-lock" aria-hidden="true">🔒</span>';
    const arrow = selected ? '<span class="node-arrow" aria-hidden="true">▼</span>' : '';
    const markup = `<span class="node-num">${difficulty}</span>${lock}${arrow}${stars}`;
    if (node.dataset.view !== markup) {
      node.dataset.view = markup;
      node.innerHTML = markup;
    }
  }
  for (const button of ui.mutes) {
    const label = session.isMuted ? Copy.unmute : Copy.mute;
    if (button.dataset.view !== label) {
      button.dataset.view = label;
      button.innerHTML = speakerSvg(session.isMuted);
    }
    button.setAttribute('aria-label', label);
  }

  const problem = session.chest ? session.problems[session.index - 1] : session.currentProblem;
  if (problem) paintEquation(ui.equation, problem, session.chest ? '' : session.input);
  ui.stageLabel.textContent = stageTitle(session.stageNumber);
  ui.progress.textContent = progress(session.displayNumber, ROUND_SIZE);
  const beads = ui.track.querySelectorAll('.bead');
  const stageBase = session.index >= ROUND_SIZE ? 20 : Math.floor(session.index / 10) * 10;
  beads.forEach((bead, index) => {
    if (bead.classList.contains('trophy')) return;
    const absolute = stageBase + index - 1;
    bead.classList.toggle('done', absolute < session.index);
    bead.classList.toggle('now', absolute === session.index && session.screen === 'quiz' && !session.chest);
  });
  ui.message.textContent = session.encouragement ?? '';
  ui.message.className = `message ${session.encouragementIsCheer ? 'cheer' : session.encouragement ? 'try' : ''}`;
  ui.streakBanner.hidden = !session.streakBanner;
  ui.streakBanner.textContent = session.streakBanner ?? '';
  const showCombo = session.screen === 'quiz' && !session.chest && session.streak >= 2;
  ui.combo.hidden = !showCombo;
  ui.combo.textContent = showCombo ? comboText(session.streak) : '';
  ui.combo.classList.toggle('hot', session.streak >= 5);

  const gentle = session.stars <= 1;
  ui.awardCard.classList.toggle('gentle', gentle);
  ui.awardCard.classList.toggle('party', !gentle);
  ui.resultTitle.textContent = resultTitle(session.stars);
  ui.resultBody.textContent = resultBody(session.stars);
  ui.awardStars.innerHTML = Array.from({ length: 3 }, (_, index) => `<i class="${index < session.stars ? 'on' : ''}">★</i>`).join('');
  ui.scoreText.innerHTML = `<span class="got">${session.firstTryCorrect}</span><span class="slash">/</span><span class="total">${ROUND_SIZE}</span>`;
  ui.timeText.textContent = clock(session.duration);
  ui.streakText.textContent = `${Copy.bestStreakLabel} ${session.bestStreakThisRound}`;
  const cheer = session.save.cards.find((card) => card.id === 'cheer-lamb');
  ui.consolation.innerHTML = gentle && cheer ? miniCard(cheer) : '';
  ui.earnedRow.innerHTML = session.earnedThisRound
    .filter((card) => card.id !== 'cheer-lamb' || !gentle)
    .slice(0, 4)
    .map((card) => {
      const def = resolveCard(card.id);
      return def ? `<span title="${def.name}">${def.name}</span>` : '';
    })
    .join('');

  const owned = new Map(session.save.cards.map((card) => [card.id, card]));
  const catalogIds = session.save.cards.map((card) => card.id);
  for (const tab of ui.seriesTabs.querySelectorAll<HTMLButtonElement>('.series-tab')) {
    tab.classList.toggle('on', tab.dataset.series === ui.seriesId);
  }
  const seriesCards = cardsInSeries(ui.seriesId);
  const seriesOwned = seriesCards.filter((card) => owned.has(card.id)).length;
  ui.seriesCount.textContent = `本系列 ${seriesOwned}/12`;
  for (const button of ui.album.querySelectorAll<HTMLButtonElement>('.tc')) {
    const id = button.dataset.card ?? '';
    const def = resolveCard(id);
    if (!def) continue;
    paintOwned(button, def, owned.get(id), session, catalogIds);
  }
  const legacy = session.save.cards.filter((card) => card.id.startsWith('legacy:'));
  ui.legacy.hidden = legacy.length === 0;
  ui.legacy.innerHTML = legacy.length
    ? `<h2>以前的贴纸</h2><div class="album">${legacy
        .map((card) => {
          const def = resolveCard(card.id);
          if (!def) return '';
          return `<button type="button" class="tc rarity-${def.rarity}" data-card="${def.id}"><div class="tc-tilt"><div class="tc-art">${cardPicture(def)}</div><div class="foil"></div><b class="tc-rarity">${RARITY_LABEL[def.rarity]}</b><strong class="tc-name">${def.name}</strong><em class="tc-detail">${card.achievement}</em><small class="tc-foot">${formatCardDate(card.earnedAt)}</small></div></button>`;
        })
        .join('')}</div>`
    : '';
  ui.collectedLabel.textContent = `${catalogOwned}/${CARDS.length}`;

  show(ui.chest, session.chest !== null && session.screen === 'quiz');
  if (session.chest) paintChest(ui, session);
  show(ui.exitModal, session.exitPrompt);

  const confetti = document.querySelector('#confetti');
  if (confetti) {
    if (session.screen === 'results') fillConfetti(confetti, session.stars <= 1 ? 14 : 32);
    else if (session.screen !== 'quiz') confetti.replaceChildren();
  }
}

function paintOwned(
  button: HTMLButtonElement,
  def: CardDef,
  earned: EarnedCard | undefined,
  session: GameSession,
  ownedIds: string[],
): void {
  button.classList.toggle('locked', !earned);
  const hint = unlockHint(def, session, ownedIds);
  button.setAttribute('aria-label', earned ? `${def.name}，${def.line}` : `神秘卡片，${Copy.lockedCard}，${hint}`);
  const name = button.querySelector('.tc-name');
  const detail = button.querySelector('.tc-detail');
  const foot = button.querySelector('.tc-foot');
  if (name) name.textContent = earned ? def.name : '神秘卡片';
  if (detail) detail.textContent = earned ? '' : hint;
  if (foot) foot.textContent = '';
  const face = button.querySelector<HTMLImageElement>('.tc-art img');
  if (face) face.src = earned ? cardFaceUrl(def.id) : lockedCardUrl();
}

function paintChest(ui: Ui, session: GameSession): void {
  const chest = session.chest;
  if (!chest) return;
  const grant = chest.cards[chest.cursor];
  const def = grant ? resolveCard(grant.id) : undefined;
  const earned = grant ? session.earnedThisRound.find((card) => card.id === grant.id) : undefined;
  const showing = Boolean(grant && def && earned);
  ui.revealCard.hidden = !showing;
  ui.chestCards.hidden = !showing;
  if (grant && def && earned) {
    ui.revealCard.className = `reveal-card rarity-${def.rarity}`;
    ui.revealCard.innerHTML = chestCardShell(def);
    const title = ui.chestTitle.querySelector('span');
    if (title) title.textContent = Copy.newCard;
    const pink = ui.chestBubble.querySelector('.line-pink');
    if (pink) pink.textContent = '太棒啦';
    ui.chestCopy.textContent = '继续加油！';
    ui.chestMeta.textContent = '';
  } else {
    ui.revealCard.innerHTML = '';
    ui.chestTitle.textContent = Copy.chestEmptyTitle;
    const pink = ui.chestBubble.querySelector('.line-pink');
    if (pink) pink.textContent = '';
    ui.chestCopy.textContent = Copy.chestEmptyDetail;
    ui.chestMeta.textContent = '';
  }
  ui.dismissChest.textContent = Copy.takeCard;
}

function chestCardShell(def: CardDef): string {
  return `<div class="tc-tilt"><div class="tc-art">${cardPicture(def)}</div><strong class="tc-name">${def.name}</strong><b class="tc-rarity">${RARITY_LABEL[def.rarity]}</b></div>`;
}

function cardPicture(def: CardDef, locked = false, lazy = false): string {
  const src = locked ? lockedCardUrl() : cardFaceUrl(def.id);
  const loading = lazy ? ' loading="lazy"' : '';
  return `<img src="${src}" alt="" draggable="false" decoding="async"${loading}>`;
}

function miniCard(earned: EarnedCard): string {
  const def = resolveCard(earned.id);
  if (!def) return '';
  return `<div class="mini-card rarity-${def.rarity}">${cardPicture(def)}<div><strong>${def.name}</strong><em>${earned.achievement}</em></div></div>`;
}

function openInspect(ui: Ui, id: string, session: GameSession): void {
  const def = resolveCard(id);
  if (!def) return;
  ui.inspect.dataset.card = id;
  const earned = session.save.cards.find((card) => card.id === id);
  const ownedIds = session.save.cards.map((card) => card.id);
  const hint = unlockHint(def, session, ownedIds);
  const status = unlockStatusWithOwned(def.id, progressFromSave(session.save, Date.now()), ownedIds);
  ui.inspectCard.className = `inspect-card rarity-${def.rarity}${earned ? '' : ' locked'}`;
  ui.inspectSay.textContent = earned ? def.line : lockedCheer(def, status);
  ui.inspectMeta.innerHTML = earned
    ? `<p>${def.story}</p><p>${seriesName(def.series)} · ${RARITY_LABEL[def.rarity]} · ${formatCardDate(earned.earnedAt)}</p><p>获得条件：${def.condition}</p>`
    : `<p>神秘卡片</p><p>${hint}</p><p>获得条件：${def.condition}</p>`;
  ui.inspectCard.innerHTML = earned
    ? chestCardShell(def)
    : `<div class="tc-tilt"><div class="tc-art">${cardPicture(def, true)}</div><strong class="tc-name">神秘卡片</strong><em class="tc-detail">${hint}</em></div>`;
  ui.inspect.hidden = false;
  ui.inspectTilt?.();
  ui.inspectTilt = bindInspectTilt(ui.inspectCard);
  const orientation = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof orientation.requestPermission === 'function') {
    void orientation.requestPermission().catch(() => undefined);
  }
}

function bindInspectTilt(card: HTMLElement): () => void {
  const tilt = card.querySelector<HTMLElement>('.tc-tilt') ?? card;
  const apply = (px: number, py: number) => {
    tilt.style.setProperty('--rx', `${(-py * 14).toFixed(2)}deg`);
    tilt.style.setProperty('--ry', `${(px * 16).toFixed(2)}deg`);
    tilt.style.setProperty('--mx', px.toFixed(3));
    tilt.style.setProperty('--my', py.toFixed(3));
  };
  const onPointer = (event: PointerEvent) => {
    const rect = card.getBoundingClientRect();
    apply((event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1);
  };
  const onOrient = (event: DeviceOrientationEvent) => {
    if (event.gamma == null || event.beta == null) return;
    apply(Math.max(-1, Math.min(1, event.gamma / 28)), Math.max(-1, Math.min(1, (event.beta - 40) / 32)));
  };
  card.addEventListener('pointermove', onPointer);
  window.addEventListener('deviceorientation', onOrient);
  return () => {
    card.removeEventListener('pointermove', onPointer);
    window.removeEventListener('deviceorientation', onOrient);
  };
}

function tiltCard(event: PointerEvent): void {
  const card = (event.target as Element).closest<HTMLElement>('.tc');
  if (!card || card.classList.contains('locked')) return;
  const tilt = card.querySelector<HTMLElement>('.tc-tilt');
  if (!tilt) return;
  const rect = card.getBoundingClientRect();
  const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  tilt.style.setProperty('--rx', `${(-py * 10).toFixed(2)}deg`);
  tilt.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
  tilt.style.setProperty('--mx', px.toFixed(3));
  tilt.style.setProperty('--my', py.toFixed(3));
}

function paintEquation(host: HTMLElement, problem: Problem, input: string): void {
  const symbol = problem.operation === 'addition' ? '+' : '−';
  const opColor = problem.operation === 'addition' ? '#5dce68' : '#ff7d78';
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
  const empty = input.length === 0;
  bubble.className = empty ? 'answer-bubble is-empty' : 'answer-bubble';
  bubble.textContent = input;
  bubble.setAttribute('aria-label', empty ? '答案还没填写' : `答案 ${input}`);
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

function glow(kind: 'ok' | 'hot' | 'max' | 'soft'): void {
  document.body.classList.remove('glow-ok', 'glow-hot', 'glow-max', 'glow-soft');
  void document.body.offsetWidth;
  document.body.classList.add(`glow-${kind}`);
}

function spawnCandy(level: 0 | 1 | 2): void {
  const layer = document.querySelector('#confetti');
  const equation = document.querySelector('#equation');
  if (!layer || !equation) return;
  const rect = equation.getBoundingClientRect();
  const colors = ['#ff8fb8', '#ffd15c', '#7ad0ff', '#b7f08a', '#d7b3ff', '#ffb07a'];
  const count = level === 2 ? 22 : level === 1 ? 16 : 10;
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement('i');
    bit.className = i % 3 === 0 ? 'coin' : 'bit';
    bit.textContent = i % 3 === 0 ? '★' : '';
    bit.style.left = `${rect.left + rect.width * (0.2 + Math.random() * 0.6)}px`;
    bit.style.top = `${rect.top}px`;
    bit.style.background = bit.className === 'coin' ? 'transparent' : colors[i % colors.length]!;
    bit.style.setProperty('--dx', `${(Math.random() - 0.5) * 180}px`);
    bit.style.animationDuration = `${0.7 + Math.random() * 0.5}s`;
    layer.append(bit);
    window.setTimeout(() => bit.remove(), 1400);
  }
}

function fillConfetti(layer: Element, count: number): void {
  if (layer.childElementCount >= count) return;
  const colors = ['#ff8fb8', '#ffd15c', '#7ad0ff', '#b7f08a', '#d7b3ff', '#ffb07a'];
  layer.replaceChildren();
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement('i');
    bit.className = 'bit fall';
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length]!;
    bit.style.animationDuration = `${2.2 + Math.random() * 1.8}s`;
    bit.style.animationDelay = `${-Math.random() * 2.4}s`;
    layer.append(bit);
  }
}

function flyClone(source: HTMLElement, target: HTMLElement): void {
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return;
  const flyer = source.cloneNode(true) as HTMLElement;
  flyer.removeAttribute('id');
  for (const node of flyer.querySelectorAll('.tc-name, .tc-detail, .tc-foot, .tc-rarity')) node.remove();
  flyer.classList.add('flyer');
  flyer.style.left = `${from.left}px`;
  flyer.style.top = `${from.top}px`;
  flyer.style.width = `${from.width}px`;
  flyer.style.height = `${from.height}px`;
  document.body.append(flyer);
  requestAnimationFrame(() => {
    flyer.style.transform = `translate(${to.left - from.left + to.width / 2 - from.width / 2}px, ${to.top - from.top}px) scale(0.12)`;
    flyer.style.opacity = '0.15';
  });
  window.setTimeout(() => flyer.remove(), 560);
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

function buildPathNodes(board: HTMLElement): void {
  for (const difficulty of ALL_DIFFICULTIES) {
    const node = document.createElement('div');
    node.className = 'level-node';
    node.dataset.difficulty = String(difficulty);
    node.setAttribute('aria-hidden', 'true');
    board.append(node);
  }
}

function stepInspect(ui: Ui, session: GameSession, delta: number): void {
  const row = cardsInSeries(ui.seriesId);
  const current = ui.inspect.dataset.card ?? row[0]?.id ?? '';
  const index = Math.max(0, row.findIndex((card) => card.id === current));
  const next = row[(index + delta + row.length) % row.length];
  if (next) openInspect(ui, next.id, session);
}

function difficultyOpen(session: GameSession, difficulty: Difficulty): boolean {
  if (difficulty <= 1) return true;
  const previous = (difficulty - 1) as Difficulty;
  return (session.bestFor(previous)?.roundsPlayed ?? 0) > 0;
}

function unlockHint(def: CardDef, session: GameSession, ownedIds: string[]): string {
  if (def.id.startsWith('legacy:')) return '以前的贴纸';
  return unlockStatusWithOwned(def.id, progressFromSave(session.save, Date.now()), ownedIds).text;
}

function floatHearts(anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  for (let i = 0; i < 6; i += 1) {
    const bit = document.createElement('i');
    bit.className = 'heart-pop';
    bit.textContent = i % 2 === 0 ? '♥' : '★';
    bit.style.left = `${rect.left + rect.width * (0.32 + Math.random() * 0.36)}px`;
    bit.style.top = `${rect.top + rect.height * 0.42}px`;
    bit.style.animationDelay = `${i * 0.04}s`;
    document.body.append(bit);
    window.setTimeout(() => bit.remove(), 900);
  }
}

function confettiBits(): string {
  return Array.from({ length: 22 }, (_, index) => {
    const dx = (index % 2 === 0 ? -1 : 1) * (18 + ((index * 13) % 48));
    return `<i style="--i:${index};--dx:${dx}px"></i>`;
  }).join('');
}

function starSvg(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f5a524" d="M12 2.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L12 15.8 6.8 18.5l1.2-5.8-4.4-4 5.9-.7z"/></svg>';
}

function flameSvg(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff8a2a" d="M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-5 1 1 2 1 3-3z"/><path fill="#ffe14a" d="M12 10c.6 1.4 2 2 2 3.6a2 2 0 0 1-4 0c0-1 .6-1.6.8-2.6.4.6.8.6 1.2-1z"/></svg>';
}

function bookSvg(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#5aa2e6" d="M4 4.2h6.4c.9 0 1.7.3 2.3.9.6-.6 1.4-.9 2.3-.9H20v13.2h-4.4c-.8 0-1.5.3-2.1.8-.6-.5-1.3-.8-2.1-.8H4z"/><path fill="#ffe08a" d="M7.2 8h2.4v1.8H7.2zm6.6 0h2.2v1.8h-2.2z"/></svg>';
}

function speakerSvg(muted: boolean): string {
  const body = '<path fill="#3a332c" d="M4 9h3.2L12 5.5v13L7.2 15H4z"/>';
  const waves = muted
    ? '<path stroke="#e05a4f" stroke-width="2" d="M15 9l5 6M20 9l-5 6"/>'
    : '<path fill="none" stroke="#3a332c" stroke-width="2" d="M15 9.2a3.2 3.2 0 0 1 0 5.6M17.2 7a6 6 0 0 1 0 10"/>';
  return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${body}${waves}</svg>`;
}
