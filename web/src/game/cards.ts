import { CARD_COPY } from './cardsCopy';
import type { PlayerProgress } from './progress';

export type Rarity = 'common' | 'rare' | 'epic' | 'legend';
export type SeriesId = 'partners' | 'streak' | 'islands' | 'daily' | 'friends';

export interface CardDef {
  id: string;
  name: string;
  rarity: Rarity;
  series: SeriesId;
  condition: string;
  story: string;
  line: string;
  locked: string;
}

export interface EarnedCard {
  id: string;
  earnedAt: string;
  achievement: string;
  correctCount: number;
}

export interface CardGrant {
  id: string;
  achievement: string;
  correctCount: number;
}

export interface AwardSnapshot {
  stage: number;
  stageFirstTry: number;
  bestStreak: number;
  hadRetry: boolean;
  roundFirstTry: number;
  stars: number;
  perfect: boolean;
  finishedRound: boolean;
  difficulty: number;
  todayFirstTry: number;
  cumulativeFirstTry: number;
  roundsCompleted: number;
  stagesCompleted: number;
  roundsByDifficulty: number[];
  bestStarsByDifficulty: number[];
  threeStarStreak: number;
  consecutiveDays: number;
  roundsToday: number;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legend: '传说',
};

export const SERIES: { id: SeriesId; name: string }[] = [
  { id: 'partners', name: '闯关伙伴' },
  { id: 'streak', name: '连击星光' },
  { id: 'islands', name: '四座岛屿' },
  { id: 'daily', name: '每日与累计' },
  { id: 'friends', name: '陪伴岛' },
];

const RARITY_RANK: Record<Rarity, number> = { legend: 0, epic: 1, rare: 2, common: 3 };

export const LEGACY_STICKERS: Record<string, { name: string }> = {
  star: { name: '闪亮星星' },
  rainbow: { name: '彩虹' },
  palm: { name: '椰子树' },
  gift: { name: '小礼物' },
  dino: { name: '小恐龙' },
  flower: { name: '小花花' },
  panda: { name: '小熊猫' },
  heart: { name: '爱心' },
  trophy: { name: '奖杯' },
  sun: { name: '太阳' },
  moon: { name: '月亮' },
  mushroom: { name: '蘑菇' },
  butterfly: { name: '蝴蝶' },
  melon: { name: '西瓜' },
  rocket: { name: '小火箭' },
};

/** Old catalog ids that still live in saves. Unmapped ids stay as legacy stickers. */
export const OLD_CARD_MAP: Record<string, string> = {
  sprout: 'sprout-dragon',
  'perfect-stage': 'medal-bear',
  'streak-5': 'spark-fox',
  'streak-10': 'cloud-sprite',
  'streak-15': 'lightning-deer',
  'retry-heart': 'brave-lion',
  'one-breath': 'rocket-pup',
  flawless: 'crown-dragon',
  'two-stars': 'star-duck',
  'three-stars': 'star-penguin',
  'cheer-up': 'cheer-lamb',
  'easy-clear': 'grass-bunny',
  'carry-clear': 'bridge-otter',
  'advanced-clear': 'hill-alpaca',
  'challenge-clear': 'castle-knight-dragon',
  'challenge-3': 'dino-king',
  'melon-sweet': 'melon-piglet',
  'today-30': 'sun-chick',
  'today-60': 'golden-leopard',
  'correct-50': 'flower-fairy',
  'correct-100': 'rainbow-unicorn',
  'correct-300': 'magic-dragon',
  'panda-3': 'panda-friend',
  'panda-5': 'treasure-panda',
  'guardian-10': 'island-guardian',
  'all-diff': 'island-squirrel',
  'night-sky': 'astronaut-rabbit',
};

function define(
  id: string,
  name: string,
  rarity: Rarity,
  series: SeriesId,
  condition: string,
): CardDef {
  const copy = CARD_COPY[id];
  if (!copy) throw new Error(`missing copy for ${id}`);
  return { id, name, rarity, series, condition, story: copy.story, line: copy.line, locked: copy.locked };
}

export const CARDS: CardDef[] = [
  define('sprout-dragon', '萌芽小龙', 'common', 'partners', '完成第1关'),
  define('brave-lion', '勇气小狮', 'common', 'partners', '答错后仍完成一关'),
  define('cheer-lamb', '加油小羊', 'common', 'partners', '一轮得1颗星'),
  define('hello-duckling', '问候小鸭', 'common', 'partners', '累计完成3关'),
  define('medal-bear', '奖章小熊', 'rare', 'partners', '一关10题全对'),
  define('rocket-pup', '火箭小狗', 'rare', 'partners', '一口气完成30题'),
  define('pirate-seal', '海盗小海豹', 'rare', 'partners', '累计完成10关'),
  define('detective-raccoon', '侦探小浣熊', 'rare', 'partners', '累计完成20关'),
  define('wizard-owl', '魔法猫头鹰', 'epic', 'partners', '累计完成30关'),
  define('explorer-elephant', '探险小象', 'epic', 'partners', '累计完成50关'),
  define('crown-dragon', '皇冠龙王', 'legend', 'partners', '一轮30题全部一次答对'),
  define('champion-tiger', '冠军小虎', 'legend', 'partners', '累计完成100关'),
  define('firefly-mouse', '萤火小鼠', 'common', 'streak', '连对3题'),
  define('star-duck', '双星小鸭', 'common', 'streak', '一轮得2颗星'),
  define('melon-piglet', '西瓜小猪', 'common', 'streak', '轻松难度得3颗星'),
  define('spark-fox', '火花小狐', 'rare', 'streak', '连对5题'),
  define('cloud-sprite', '云朵精灵', 'rare', 'streak', '连对8题'),
  define('star-penguin', '三星企鹅', 'rare', 'streak', '一轮得3颗星'),
  define('star-fairy', '星星仙子', 'rare', 'streak', '连对12题'),
  define('rainbow-parrot', '彩虹鹦鹉', 'epic', 'streak', '连对10题'),
  define('lightning-deer', '闪电小鹿', 'epic', 'streak', '连对15题'),
  define('star-koala', '星光考拉', 'epic', 'streak', '连续3轮得3颗星'),
  define('comet-wolf', '彗星小狼', 'legend', 'streak', '连对20题'),
  define('galaxy-whale', '银河鲸鱼', 'legend', 'streak', '连续5轮得3颗星'),
  define('grass-bunny', '青草兔', 'common', 'islands', '完成轻松难度一轮'),
  define('bridge-otter', '小桥水獭', 'common', 'islands', '完成进位难度一轮'),
  define('easy-hedgehog', '轻松小刺猬', 'common', 'islands', '轻松难度完成3轮'),
  define('carry-turtle', '进位小乌龟', 'common', 'islands', '进位难度完成3轮'),
  define('hill-alpaca', '山丘羊驼', 'rare', 'islands', '完成进阶难度一轮'),
  define('night-dolphin', '星空小海豚', 'rare', 'islands', '挑战难度得2颗星'),
  define('advanced-eagle', '进阶小鹰', 'rare', 'islands', '进阶难度完成3轮'),
  define('math-robot', '数学小机器人', 'rare', 'islands', '进阶难度得3颗星'),
  define('castle-knight-dragon', '城堡骑士龙', 'epic', 'islands', '完成挑战难度一轮'),
  define('challenge-phoenix', '挑战小凤凰', 'epic', 'islands', '挑战难度完成3轮'),
  define('dino-king', '挑战恐龙王', 'legend', 'islands', '挑战难度得3颗星'),
  define('island-squirrel', '四季岛主松鼠', 'legend', 'islands', '四个难度都完成过'),
  define('sun-chick', '太阳小鸡', 'common', 'daily', '今天答对30题'),
  define('strawberry-cat', '草莓猫咪', 'common', 'daily', '累计答对20题'),
  define('honey-bee', '勤劳小蜜蜂', 'common', 'daily', '今天完成2轮'),
  define('early-rooster', '打卡小公鸡', 'common', 'daily', '连续2天玩'),
  define('flower-fairy', '花仙子', 'rare', 'daily', '累计答对50题'),
  define('calendar-beaver', '打卡海狸', 'rare', 'daily', '连续3天玩'),
  define('moon-rabbit', '月亮玉兔', 'rare', 'daily', '连续5天玩'),
  define('rainbow-unicorn', '彩虹独角兽', 'epic', 'daily', '累计答对100题'),
  define('treasure-monkey', '寻宝小猴', 'epic', 'daily', '累计答对200题'),
  define('diamond-lemur', '钻石狐猴', 'epic', 'daily', '连续7天玩'),
  define('golden-leopard', '金色小豹', 'legend', 'daily', '今天答对60题'),
  define('magic-dragon', '魔法龙', 'legend', 'daily', '累计答对300题'),
  define('panda-friend', '熊猫伙伴', 'common', 'friends', '完成3轮'),
  define('hamster-collector', '收藏仓鼠', 'common', 'friends', '收集5张卡'),
  define('giraffe-friend', '长颈鹿朋友', 'common', 'friends', '收集10张卡'),
  define('treasure-panda', '宝箱熊猫', 'rare', 'friends', '完成5轮'),
  define('zebra-collector', '斑马收藏家', 'rare', 'friends', '收集20张卡'),
  define('flamingo-friend', '火烈鸟', 'rare', 'friends', '收集30张卡'),
  define('astronaut-rabbit', '星际小兔', 'rare', 'friends', '集齐任意一个系列'),
  define('island-guardian', '小岛守护者', 'epic', 'friends', '完成10轮'),
  define('knight-panda', '骑士熊猫', 'epic', 'friends', '完成20轮'),
  define('polar-bear', '北极熊', 'epic', 'friends', '收集45张卡'),
  define('tortoise-elder', '岛屿长老龟', 'legend', 'friends', '完成30轮'),
  define('gem-dragon', '宝石龙', 'legend', 'friends', '集齐全部60张'),
];

const DIFF_INDEX: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3 };

export function cardById(id: string): CardDef | undefined {
  return CARDS.find((entry) => entry.id === id);
}

export function cardsInSeries(series: SeriesId): CardDef[] {
  return CARDS.filter((entry) => entry.series === series);
}

export function seriesName(series: SeriesId): string {
  return SERIES.find((entry) => entry.id === series)?.name ?? '';
}

export function resolveCard(id: string): CardDef | undefined {
  const direct = cardById(id);
  if (direct) return direct;
  if (!id.startsWith('legacy:')) return undefined;
  const legacy = LEGACY_STICKERS[id.slice('legacy:'.length)];
  return {
    id,
    name: legacy?.name ?? '旧贴纸',
    rarity: 'common',
    series: 'partners',
    condition: '以前收集的贴纸',
    story: '这是以前留在小岛上的贴纸。它还记得你来过。',
    line: '旧贴纸也在为你加油！',
    locked: '它已经在你身边啦！',
  };
}

export function legacyCardId(stickerId: string): string {
  return `legacy:${stickerId}`;
}

export function mapSavedCardId(id: string): string {
  if (id.startsWith('legacy:')) return id;
  if (cardById(id)) return id;
  return OLD_CARD_MAP[id] ?? legacyCardId(id);
}

function at(values: number[] | undefined, index: number): number {
  return values?.[index] ?? 0;
}

function maxStars(snapshot: AwardSnapshot): number {
  return Math.max(snapshot.finishedRound ? snapshot.stars : 0, ...snapshot.bestStarsByDifficulty, 0);
}

function catalogOwned(owned: ReadonlySet<string>): number {
  return CARDS.reduce((sum, card) => sum + (owned.has(card.id) ? 1 : 0), 0);
}

function completeSeriesCount(owned: ReadonlySet<string>): number {
  return SERIES.filter((series) => series.id !== 'friends').filter((series) =>
    cardsInSeries(series.id).every((card) => owned.has(card.id)),
  ).length;
}

function meets(id: string, snapshot: AwardSnapshot, owned: ReadonlySet<string>): boolean {
  const diff = DIFF_INDEX[snapshot.difficulty] ?? 0;
  const rounds = snapshot.roundsByDifficulty;
  const stars = snapshot.bestStarsByDifficulty;
  switch (id) {
    case 'sprout-dragon':
      return snapshot.stagesCompleted >= 1;
    case 'brave-lion':
      return snapshot.hadRetry;
    case 'cheer-lamb':
      return snapshot.finishedRound && snapshot.stars === 1;
    case 'hello-duckling':
      return snapshot.stagesCompleted >= 3;
    case 'medal-bear':
      return snapshot.stageFirstTry >= 10;
    case 'rocket-pup':
      return snapshot.finishedRound;
    case 'pirate-seal':
      return snapshot.stagesCompleted >= 10;
    case 'detective-raccoon':
      return snapshot.stagesCompleted >= 20;
    case 'wizard-owl':
      return snapshot.stagesCompleted >= 30;
    case 'explorer-elephant':
      return snapshot.stagesCompleted >= 50;
    case 'crown-dragon':
      return snapshot.perfect;
    case 'champion-tiger':
      return snapshot.stagesCompleted >= 100;
    case 'firefly-mouse':
      return snapshot.bestStreak >= 3;
    case 'star-duck':
      return snapshot.finishedRound && snapshot.stars === 2;
    case 'melon-piglet':
      return at(stars, 0) >= 3 || (snapshot.finishedRound && snapshot.difficulty === 1 && snapshot.stars >= 3);
    case 'spark-fox':
      return snapshot.bestStreak >= 5;
    case 'cloud-sprite':
      return snapshot.bestStreak >= 8;
    case 'star-penguin':
      return maxStars(snapshot) >= 3;
    case 'star-fairy':
      return snapshot.bestStreak >= 12;
    case 'rainbow-parrot':
      return snapshot.bestStreak >= 10;
    case 'lightning-deer':
      return snapshot.bestStreak >= 15;
    case 'star-koala':
      return snapshot.threeStarStreak >= 3;
    case 'comet-wolf':
      return snapshot.bestStreak >= 20;
    case 'galaxy-whale':
      return snapshot.threeStarStreak >= 5;
    case 'grass-bunny':
      return at(rounds, 0) >= 1 || (snapshot.finishedRound && snapshot.difficulty === 1);
    case 'bridge-otter':
      return at(rounds, 1) >= 1 || (snapshot.finishedRound && snapshot.difficulty === 2);
    case 'easy-hedgehog':
      return at(rounds, 0) >= 3;
    case 'carry-turtle':
      return at(rounds, 1) >= 3;
    case 'hill-alpaca':
      return at(rounds, 2) >= 1 || (snapshot.finishedRound && snapshot.difficulty === 3);
    case 'night-dolphin':
      return at(stars, 3) >= 2 || (snapshot.finishedRound && snapshot.difficulty === 4 && snapshot.stars >= 2);
    case 'advanced-eagle':
      return at(rounds, 2) >= 3;
    case 'math-robot':
      return at(stars, 2) >= 3 || (snapshot.finishedRound && snapshot.difficulty === 3 && snapshot.stars >= 3);
    case 'castle-knight-dragon':
      return at(rounds, 3) >= 1 || (snapshot.finishedRound && snapshot.difficulty === 4);
    case 'challenge-phoenix':
      return at(rounds, 3) >= 3;
    case 'dino-king':
      return at(stars, 3) >= 3 || (snapshot.finishedRound && snapshot.difficulty === 4 && snapshot.stars >= 3);
    case 'island-squirrel':
      return [0, 1, 2, 3].every((index) => at(rounds, index) >= 1 || (snapshot.finishedRound && diff === index));
    case 'sun-chick':
      return snapshot.todayFirstTry >= 30;
    case 'strawberry-cat':
      return snapshot.cumulativeFirstTry >= 20;
    case 'honey-bee':
      return snapshot.roundsToday >= 2;
    case 'early-rooster':
      return snapshot.consecutiveDays >= 2;
    case 'flower-fairy':
      return snapshot.cumulativeFirstTry >= 50;
    case 'calendar-beaver':
      return snapshot.consecutiveDays >= 3;
    case 'moon-rabbit':
      return snapshot.consecutiveDays >= 5;
    case 'rainbow-unicorn':
      return snapshot.cumulativeFirstTry >= 100;
    case 'treasure-monkey':
      return snapshot.cumulativeFirstTry >= 200;
    case 'diamond-lemur':
      return snapshot.consecutiveDays >= 7;
    case 'golden-leopard':
      return snapshot.todayFirstTry >= 60;
    case 'magic-dragon':
      return snapshot.cumulativeFirstTry >= 300;
    case 'panda-friend':
      return snapshot.roundsCompleted >= 3;
    case 'hamster-collector':
      return catalogOwned(owned) >= 5;
    case 'giraffe-friend':
      return catalogOwned(owned) >= 10;
    case 'treasure-panda':
      return snapshot.roundsCompleted >= 5;
    case 'zebra-collector':
      return catalogOwned(owned) >= 20;
    case 'flamingo-friend':
      return catalogOwned(owned) >= 30;
    case 'astronaut-rabbit':
      return completeSeriesCount(owned) >= 1;
    case 'island-guardian':
      return snapshot.roundsCompleted >= 10;
    case 'knight-panda':
      return snapshot.roundsCompleted >= 20;
    case 'polar-bear':
      return catalogOwned(owned) >= 45;
    case 'tortoise-elder':
      return snapshot.roundsCompleted >= 30;
    case 'gem-dragon':
      return CARDS.every((card) => card.id === 'gem-dragon' || owned.has(card.id));
    default:
      return false;
  }
}

function achievementFor(def: CardDef, snapshot: AwardSnapshot): string {
  switch (def.id) {
    case 'medal-bear':
      return '本关答对 10/10 题';
    case 'spark-fox':
      return '连对 5 题';
    case 'rainbow-parrot':
      return '连对 10 题';
    case 'cheer-lamb':
      return `再加油！这次答对 ${snapshot.roundFirstTry}/30 题`;
    case 'crown-dragon':
      return '一轮 30 题全部一次答对';
    case 'rocket-pup':
      return '一口气完成 30 题';
    default:
      return def.condition;
  }
}

function correctCountFor(def: CardDef, snapshot: AwardSnapshot): number {
  if (def.id === 'cheer-lamb' || def.id === 'rocket-pup' || def.id === 'crown-dragon') return snapshot.roundFirstTry;
  if (def.id === 'medal-bear') return snapshot.stageFirstTry;
  if (def.series === 'streak' && def.condition.startsWith('连对')) return snapshot.bestStreak;
  if (def.condition.includes('累计答对') || def.condition.includes('今天答对')) {
    return def.condition.includes('今天') ? snapshot.todayFirstTry : snapshot.cumulativeFirstTry;
  }
  return snapshot.stageFirstTry || snapshot.roundFirstTry;
}

export function grantsFor(snapshot: AwardSnapshot, owned: Iterable<string> = []): CardGrant[] {
  const have = new Set(owned);
  const grants: CardGrant[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const def of CARDS) {
      if (have.has(def.id) || !meets(def.id, snapshot, have)) continue;
      have.add(def.id);
      grants.push({
        id: def.id,
        achievement: achievementFor(def, snapshot),
        correctCount: correctCountFor(def, snapshot),
      });
      added = true;
    }
  }
  return grants;
}

export function newGrants(snapshot: AwardSnapshot, owned: Iterable<string>): CardGrant[] {
  return grantsFor(snapshot, owned).sort((a, b) => {
    const aRank = RARITY_RANK[cardById(a.id)?.rarity ?? 'common'];
    const bRank = RARITY_RANK[cardById(b.id)?.rarity ?? 'common'];
    return aRank - bRank;
  });
}

export interface UnlockStatus {
  have: number;
  need: number;
  label: string;
  text: string;
}

function pair(label: string, have: number, need: number): UnlockStatus {
  const safeHave = Math.max(0, Math.min(have, need));
  return { have: safeHave, need, label, text: `${label}解锁 (${safeHave}/${need})` };
}

export function unlockStatus(id: string, progress: PlayerProgress): UnlockStatus {
  const def = cardById(id);
  const label = def?.condition ?? '继续加油';
  const rounds = progress.roundsByDifficulty;
  const stars = progress.bestStarsByDifficulty;
  const max = Math.max(...stars, 0);
  const diffs = rounds.filter((count) => count > 0).length;
  const oneStar = progress.rounds.some((round) => round.stars === 1);
  const twoStar = progress.rounds.some((round) => round.stars === 2);
  const perfect = progress.rounds.some((round) => round.firstTryCorrect >= 30);
  switch (id) {
    case 'sprout-dragon':
      return pair(label, progress.stagesCompleted, 1);
    case 'brave-lion':
      return pair(label, 0, 1);
    case 'cheer-lamb':
      return pair(label, oneStar ? 1 : 0, 1);
    case 'hello-duckling':
      return pair(label, progress.stagesCompleted, 3);
    case 'medal-bear':
      return pair(label, perfect ? 1 : 0, 1);
    case 'rocket-pup':
      return pair(label, progress.roundsCompleted, 1);
    case 'pirate-seal':
      return pair(label, progress.stagesCompleted, 10);
    case 'detective-raccoon':
      return pair(label, progress.stagesCompleted, 20);
    case 'wizard-owl':
      return pair(label, progress.stagesCompleted, 30);
    case 'explorer-elephant':
      return pair(label, progress.stagesCompleted, 50);
    case 'crown-dragon':
      return pair(label, perfect ? 1 : 0, 1);
    case 'champion-tiger':
      return pair(label, progress.stagesCompleted, 100);
    case 'firefly-mouse':
      return pair(label, progress.bestStreak, 3);
    case 'star-duck':
      return pair(label, twoStar ? 1 : 0, 1);
    case 'melon-piglet':
      return pair(label, stars[0] ?? 0, 3);
    case 'spark-fox':
      return pair(label, progress.bestStreak, 5);
    case 'cloud-sprite':
      return pair(label, progress.bestStreak, 8);
    case 'star-penguin':
      return pair(label, max, 3);
    case 'star-fairy':
      return pair(label, progress.bestStreak, 12);
    case 'rainbow-parrot':
      return pair(label, progress.bestStreak, 10);
    case 'lightning-deer':
      return pair(label, progress.bestStreak, 15);
    case 'star-koala':
      return pair(label, progress.threeStarStreak, 3);
    case 'comet-wolf':
      return pair(label, progress.bestStreak, 20);
    case 'galaxy-whale':
      return pair(label, progress.threeStarStreak, 5);
    case 'grass-bunny':
      return pair(label, rounds[0] ?? 0, 1);
    case 'bridge-otter':
      return pair(label, rounds[1] ?? 0, 1);
    case 'easy-hedgehog':
      return pair(label, rounds[0] ?? 0, 3);
    case 'carry-turtle':
      return pair(label, rounds[1] ?? 0, 3);
    case 'hill-alpaca':
      return pair(label, rounds[2] ?? 0, 1);
    case 'night-dolphin':
      return pair(label, stars[3] ?? 0, 2);
    case 'advanced-eagle':
      return pair(label, rounds[2] ?? 0, 3);
    case 'math-robot':
      return pair(label, stars[2] ?? 0, 3);
    case 'castle-knight-dragon':
      return pair(label, rounds[3] ?? 0, 1);
    case 'challenge-phoenix':
      return pair(label, rounds[3] ?? 0, 3);
    case 'dino-king':
      return pair(label, stars[3] ?? 0, 3);
    case 'island-squirrel':
      return pair(label, diffs, 4);
    case 'sun-chick':
      return pair(label, progress.todayFirstTry, 30);
    case 'strawberry-cat':
      return pair(label, progress.cumulativeFirstTry, 20);
    case 'honey-bee':
      return pair(label, progress.roundsToday, 2);
    case 'early-rooster':
      return pair(label, progress.consecutiveDays, 2);
    case 'flower-fairy':
      return pair(label, progress.cumulativeFirstTry, 50);
    case 'calendar-beaver':
      return pair(label, progress.consecutiveDays, 3);
    case 'moon-rabbit':
      return pair(label, progress.consecutiveDays, 5);
    case 'rainbow-unicorn':
      return pair(label, progress.cumulativeFirstTry, 100);
    case 'treasure-monkey':
      return pair(label, progress.cumulativeFirstTry, 200);
    case 'diamond-lemur':
      return pair(label, progress.consecutiveDays, 7);
    case 'golden-leopard':
      return pair(label, progress.todayFirstTry, 60);
    case 'magic-dragon':
      return pair(label, progress.cumulativeFirstTry, 300);
    case 'panda-friend':
      return pair(label, progress.roundsCompleted, 3);
    case 'hamster-collector':
      return pair(label, 0, 5);
    case 'giraffe-friend':
      return pair(label, 0, 10);
    case 'treasure-panda':
      return pair(label, progress.roundsCompleted, 5);
    case 'zebra-collector':
      return pair(label, 0, 20);
    case 'flamingo-friend':
      return pair(label, 0, 30);
    case 'astronaut-rabbit':
      return pair(label, 0, 1);
    case 'island-guardian':
      return pair(label, progress.roundsCompleted, 10);
    case 'knight-panda':
      return pair(label, progress.roundsCompleted, 20);
    case 'polar-bear':
      return pair(label, 0, 45);
    case 'tortoise-elder':
      return pair(label, progress.roundsCompleted, 30);
    case 'gem-dragon':
      return pair(label, 0, 59);
    default:
      return pair(label, 0, 1);
  }
}

export function unlockStatusWithOwned(id: string, progress: PlayerProgress, owned: Iterable<string>): UnlockStatus {
  const status = unlockStatus(id, progress);
  const have = new Set(owned);
  if (id === 'hamster-collector' || id === 'giraffe-friend' || id === 'zebra-collector' || id === 'flamingo-friend' || id === 'polar-bear') {
    return pair(status.label, catalogOwned(have), status.need);
  }
  if (id === 'astronaut-rabbit') return pair(status.label, completeSeriesCount(have), 1);
  if (id === 'gem-dragon') return pair(status.label, CARDS.filter((card) => card.id !== 'gem-dragon' && have.has(card.id)).length, 59);
  return status;
}

export function lockedCheer(def: CardDef, status: UnlockStatus): string {
  const left = Math.max(status.need - status.have, status.have >= status.need ? 0 : 1);
  return def.locked.replaceAll('{n}', String(left));
}

export function emptySnapshot(partial: Partial<AwardSnapshot> = {}): AwardSnapshot {
  return {
    stage: 1,
    stageFirstTry: 0,
    bestStreak: 0,
    hadRetry: false,
    roundFirstTry: 0,
    stars: 0,
    perfect: false,
    finishedRound: false,
    difficulty: 1,
    todayFirstTry: 0,
    cumulativeFirstTry: 0,
    roundsCompleted: 0,
    stagesCompleted: 0,
    roundsByDifficulty: [0, 0, 0, 0],
    bestStarsByDifficulty: [0, 0, 0, 0],
    threeStarStreak: 0,
    consecutiveDays: 0,
    roundsToday: 0,
    ...partial,
  };
}

export function historySnapshot(progress: PlayerProgress, partial: Partial<AwardSnapshot> = {}): AwardSnapshot {
  return emptySnapshot({
    bestStreak: progress.bestStreak,
    cumulativeFirstTry: progress.cumulativeFirstTry,
    todayFirstTry: progress.todayFirstTry,
    roundsCompleted: progress.roundsCompleted,
    stagesCompleted: progress.stagesCompleted,
    roundsByDifficulty: progress.roundsByDifficulty,
    bestStarsByDifficulty: progress.bestStarsByDifficulty,
    threeStarStreak: progress.threeStarStreak,
    consecutiveDays: progress.consecutiveDays,
    roundsToday: progress.roundsToday,
    ...partial,
  });
}

export function formatCardDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function correctLabel(count: number, legacy = false): string {
  if (legacy || count <= 0) return '贴纸回忆';
  return `答对 ${count} 题`;
}
