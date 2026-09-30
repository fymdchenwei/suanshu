export type Rarity = 'common' | 'rare' | 'epic' | 'legend';

export type ArtKind =
  | 'dino'
  | 'dino-cape'
  | 'dino-crown'
  | 'dino-wizard'
  | 'dino-astro'
  | 'dino-heart'
  | 'panda'
  | 'rocket'
  | 'rainbow'
  | 'chest'
  | 'trophy'
  | 'flower'
  | 'moon'
  | 'sun'
  | 'heart'
  | 'mushroom'
  | 'butterfly'
  | 'melon'
  | 'island'
  | 'star'
  | 'fireworks'
  | 'bridge'
  | 'castle'
  | 'medal';

export interface CardDef {
  id: string;
  name: string;
  rarity: Rarity;
  condition: string;
  /** A short cheer shown when this card is opened. */
  line: string;
  art: ArtKind;
  sky: [string, string];
  ground: string;
  accent: string;
  accent2: string;
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
  streakHit5: boolean;
  streakHit10: boolean;
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
  difficultiesCleared: number[];
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legend: '传说',
};

const RARITY_RANK: Record<Rarity, number> = {
  legend: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

const CHEER: Record<string, string> = {
  sprout: '第一关完成啦，太棒啦！',
  'perfect-stage': '这一关十题全对，太棒啦！',
  'streak-5': '你连对了5题，太棒啦！',
  'streak-10': '你连对了10题，太棒啦！',
  'streak-15': '你连对了15题，太棒啦！',
  'one-breath': '三十题一口气做完，太棒啦！',
  flawless: '三十题全部一次答对，太棒啦！',
  'two-stars': '两颗星到手啦，太棒啦！',
  'three-stars': '三颗星都亮啦，太棒啦！',
  'cheer-up': '下一轮会更顺，继续加油！',
  'easy-clear': '轻松难度通关啦，太棒啦！',
  'carry-clear': '进位也难不倒你，太棒啦！',
  'advanced-clear': '进阶难度完成啦，太棒啦！',
  'challenge-clear': '挑战难度通关啦，太棒啦！',
  'challenge-3': '挑战难度三颗星，太棒啦！',
  'melon-sweet': '轻松难度三颗星，太棒啦！',
  'today-30': '今天答对三十题，太棒啦！',
  'today-60': '今天答对六十题，太棒啦！',
  'correct-50': '累计答对五十题，太棒啦！',
  'correct-100': '一百题都答对啦，太棒啦！',
  'correct-300': '三百题太厉害啦，太棒啦！',
  'panda-3': '三轮完成啦，太棒啦！',
  'panda-5': '五轮完成啦，太棒啦！',
  'guardian-10': '十轮都完成啦，太棒啦！',
  'all-diff': '四个难度都闯过啦，太棒啦！',
  'night-sky': '宇航兔带你飞过夜空，太棒啦！',
  'retry-heart': '再试一次也对啦，继续加油！',
};

export const CARDS: CardDef[] = [
  card('sprout', '萌芽小龙', 'common', '完成任意一关', 'dino', ['#8fd4ff', '#fff1b8'], '#7dce4e', '#6ed84a', '#ffb703'),
  card('perfect-stage', '奖章小熊', 'rare', '某一关 10 题都一次答对', 'medal', ['#ffe38a', '#fff7d6'], '#8ed15a', '#ffd15c', '#ff8a3d'),
  card('streak-5', '火花小狐', 'rare', '连对 5 题', 'fireworks', ['#ffd0a8', '#fff0c8'], '#7dce4e', '#ff8a3d', '#ffd15c'),
  card('streak-10', '云朵精灵', 'epic', '连对 10 题', 'rainbow', ['#9ad7ff', '#ffe1f2'], '#6dce7a', '#ff7eb3', '#7ad0ff'),
  card('streak-15', '闪电小鹿', 'legend', '最高连对达到 15 题', 'dino-astro', ['#2a3d88', '#8ec5ff'], '#3f8f62', '#ffe14a', '#7ad0ff'),
  card('retry-heart', '爱心小猫', 'common', '答错过，但还是完成了一关', 'heart', ['#ffd0e0', '#fff0f6'], '#7dce4e', '#ff6f9a', '#ffd0e0'),
  card('one-breath', '数学小机器人', 'rare', '一口气完成一轮 30 题', 'rocket', ['#b7dcff', '#fff6d0'], '#7dce4e', '#ff8a65', '#7eb6ff'),
  card('flawless', '皇冠小龙', 'legend', '一轮 30 题全部一次答对', 'dino-crown', ['#fff1b0', '#ffe08a'], '#8ed15a', '#ffd15c', '#fff7d2'),
  card('two-stars', '星星企鹅', 'rare', '一轮得到 2 颗星', 'trophy', ['#d7ecff', '#fff4c8'], '#7dce4e', '#ffd15c', '#7eb6ff'),
  card('three-stars', '领奖小鸟', 'epic', '一轮得到 3 颗星', 'dino-cape', ['#6a3d9a', '#ffb07a'], '#c9894a', '#ffd15c', '#e23d4a'),
  card('cheer-up', '加油熊猫', 'common', '完成一轮，小恐龙给你打气', 'dino-heart', ['#ffe0c2', '#fff6ea'], '#8ed15a', '#ff8fab', '#ffd08a'),
  card('easy-clear', '青草小兔', 'common', '完成轻松难度一轮', 'island', ['#8fd4ff', '#e7ffe8'], '#63c84a', '#7dce4e', '#ffd15c'),
  card('carry-clear', '木桥小狸', 'common', '完成进位难度一轮', 'bridge', ['#ffd39a', '#fff1c9'], '#8ed15a', '#e0893a', '#fff1c2'),
  card('advanced-clear', '草莓猫咪', 'rare', '完成进阶难度一轮', 'flower', ['#b6f0ff', '#e7ffe8'], '#3ec06a', '#ff8fb8', '#ffd15c'),
  card('challenge-clear', '城堡小狗', 'epic', '完成挑战难度一轮', 'castle', ['#3a4a90', '#b7c0ff'], '#3e8f62', '#c9b0ff', '#ffd15c'),
  card('challenge-3', '国王小龙', 'legend', '挑战难度得到 3 颗星', 'castle', ['#241848', '#ffb703'], '#2f6e52', '#ffd15c', '#ff7eb3'),
  card('melon-sweet', '西瓜娃娃', 'rare', '轻松难度得到 3 颗星', 'melon', ['#c8f5ff', '#fff6d8'], '#7dce4e', '#ff5d6e', '#7dce4e'),
  card('today-30', '太阳小鸡', 'epic', '今天一次答对累计 30 题', 'sun', ['#8fd4ff', '#fff3bf'], '#7dce4e', '#ffd15c', '#ff9a1f'),
  card('today-60', '冠军小狮', 'legend', '今天一次答对累计 60 题', 'sun', ['#ffb347', '#fff1a8'], '#e6a63a', '#ffcf3d', '#fff7d2'),
  card('correct-50', '花朵蝴蝶', 'rare', '累计一次答对 50 题', 'flower', ['#ffe1f0', '#fff6ea'], '#7dce4e', '#ff8fb8', '#ffd15c'),
  card('correct-100', '彩虹鹦鹉', 'epic', '累计一次答对 100 题', 'rainbow', ['#c6e6ff', '#ffe8f6'], '#6dce7a', '#b07bff', '#ff8fb8'),
  card('correct-300', '星星仙子', 'legend', '累计一次答对 300 题', 'dino-wizard', ['#1b2458', '#9b8cff'], '#3e6e58', '#c9b0ff', '#ffd15c'),
  card('panda-3', '圆圆熊猫', 'common', '完成 3 轮', 'panda', ['#d9f3ff', '#fff'], '#7dce4e', '#2a2a2a', '#fff'),
  card('panda-5', '宝箱浣熊', 'rare', '完成 5 轮', 'chest', ['#ffe7b8', '#fff6ea'], '#c9894a', '#f0b429', '#ff8a3d'),
  card('guardian-10', '小岛海龟', 'epic', '完成 10 轮', 'island', ['#7ecbff', '#d9f8c8'], '#5cba3c', '#37b14a', '#ffd15c'),
  card('all-diff', '四季精灵', 'legend', '四个难度都完成过一轮', 'island', ['#ffb6d5', '#c6e6ff'], '#7dce4e', '#ff7eb3', '#7ad0ff'),
  card('night-sky', '宇航兔', 'rare', '在挑战难度完成一轮', 'moon', ['#140c30', '#3a2070'], '#2a1860', '#ffe9a2', '#f4f7ff'),
];

export const LEGACY_STICKERS: Record<string, { name: string; art: ArtKind; sky: [string, string]; ground: string; accent: string; accent2: string }> = {
  star: { name: '闪亮星星', art: 'star', sky: ['#8fd4ff', '#fff1b8'], ground: '#7dce4e', accent: '#ffd15c', accent2: '#fff7d2' },
  rainbow: { name: '彩虹', art: 'rainbow', sky: ['#9ad7ff', '#ffe1f2'], ground: '#6dce7a', accent: '#ff7eb3', accent2: '#7ad0ff' },
  palm: { name: '椰子树', art: 'island', sky: ['#8fd4ff', '#e7ffe8'], ground: '#63c84a', accent: '#37b14a', accent2: '#c68642' },
  gift: { name: '小礼物', art: 'chest', sky: ['#ffe7b8', '#fff6ea'], ground: '#c9894a', accent: '#ff8a65', accent2: '#ffd15c' },
  dino: { name: '小恐龙', art: 'dino', sky: ['#8fd4ff', '#fff1b8'], ground: '#7dce4e', accent: '#6ed84a', accent2: '#ffb703' },
  flower: { name: '小花花', art: 'flower', sky: ['#ffe1f0', '#fff6ea'], ground: '#7dce4e', accent: '#ff8fb8', accent2: '#ffd15c' },
  panda: { name: '小熊猫', art: 'panda', sky: ['#d9f3ff', '#fff'], ground: '#7dce4e', accent: '#2a2a2a', accent2: '#fff' },
  heart: { name: '爱心', art: 'heart', sky: ['#ffd0e0', '#fff0f6'], ground: '#7dce4e', accent: '#ff6f9a', accent2: '#ffd0e0' },
  trophy: { name: '奖杯', art: 'trophy', sky: ['#d7ecff', '#fff4c8'], ground: '#7dce4e', accent: '#ffd15c', accent2: '#7eb6ff' },
  sun: { name: '太阳', art: 'sun', sky: ['#8fd4ff', '#fff3bf'], ground: '#7dce4e', accent: '#ffd15c', accent2: '#ff9a1f' },
  moon: { name: '月亮', art: 'moon', sky: ['#1b2458', '#6b6bb5'], ground: '#2f6a52', accent: '#ffe9a2', accent2: '#c7b8fa' },
  mushroom: { name: '蘑菇', art: 'mushroom', sky: ['#d9f3ff', '#fff6ea'], ground: '#7dce4e', accent: '#ff5d6e', accent2: '#fff' },
  butterfly: { name: '蝴蝶', art: 'butterfly', sky: ['#e7f0ff', '#fff0f8'], ground: '#7dce4e', accent: '#7eb6ff', accent2: '#ff8fb8' },
  melon: { name: '西瓜', art: 'melon', sky: ['#c8f5ff', '#fff6d8'], ground: '#7dce4e', accent: '#ff5d6e', accent2: '#7dce4e' },
  rocket: { name: '小火箭', art: 'rocket', sky: ['#b7dcff', '#fff6d0'], ground: '#7dce4e', accent: '#ff8a65', accent2: '#7eb6ff' },
};

function card(
  id: string,
  name: string,
  rarity: Rarity,
  condition: string,
  art: ArtKind,
  sky: [string, string],
  ground: string,
  accent: string,
  accent2: string,
): CardDef {
  return {
    id,
    name,
    rarity,
    condition,
    line: CHEER[id] ?? '你真棒，继续加油！',
    art,
    sky,
    ground,
    accent,
    accent2,
  };
}

export function cardById(id: string): CardDef | undefined {
  return CARDS.find((entry) => entry.id === id);
}

export function resolveCard(id: string): CardDef | undefined {
  const direct = cardById(id);
  if (direct) return direct;
  if (!id.startsWith('legacy:')) return undefined;
  const legacy = LEGACY_STICKERS[id.slice('legacy:'.length)];
  if (!legacy) return undefined;
  return {
    id,
    name: legacy.name,
    rarity: 'rare',
    condition: '以前收集的贴纸',
    line: '这张以前的贴纸也在为你加油！',
    art: legacy.art,
    sky: legacy.sky,
    ground: legacy.ground,
    accent: legacy.accent,
    accent2: legacy.accent2,
  };
}

/** Every card the snapshot qualifies for, including ones already owned. */
export function grantsFor(snapshot: AwardSnapshot): CardGrant[] {
  const grants: CardGrant[] = [];
  const add = (id: string, achievement: string, correctCount: number) => {
    grants.push({ id, achievement, correctCount });
  };

  add('sprout', `第 ${snapshot.stage} 关答对 ${snapshot.stageFirstTry}/10 题`, snapshot.stageFirstTry);
  if (snapshot.stageFirstTry >= 10) add('perfect-stage', '本关答对 10/10 题', 10);
  if (snapshot.streakHit5) add('streak-5', '连对 5 题', Math.max(5, snapshot.stageFirstTry));
  if (snapshot.streakHit10) add('streak-10', '连对 10 题', Math.max(10, snapshot.stageFirstTry));
  if (snapshot.bestStreak >= 15) add('streak-15', '连对 15 题', snapshot.bestStreak);
  if (snapshot.hadRetry) add('retry-heart', '再试一次也对啦', snapshot.stageFirstTry);

  if (snapshot.finishedRound) {
    add('one-breath', '一口气完成 30 题', snapshot.roundFirstTry);
    if (snapshot.perfect) add('flawless', '全程零错误', snapshot.roundFirstTry);
    if (snapshot.stars <= 1) add('cheer-up', `再加油！这次答对 ${snapshot.roundFirstTry}/30 题`, snapshot.roundFirstTry);
    if (snapshot.stars === 2) add('two-stars', '一轮得到 2 颗星', snapshot.roundFirstTry);
    if (snapshot.stars >= 3) add('three-stars', '一轮得到 3 颗星', snapshot.roundFirstTry);
    if (snapshot.difficulty === 1) add('easy-clear', '轻松难度通关', snapshot.roundFirstTry);
    if (snapshot.difficulty === 2) add('carry-clear', '进位难度通关', snapshot.roundFirstTry);
    if (snapshot.difficulty === 3) add('advanced-clear', '进阶难度通关', snapshot.roundFirstTry);
    if (snapshot.difficulty === 4) {
      add('challenge-clear', '挑战难度通关', snapshot.roundFirstTry);
      add('night-sky', '挑战难度夜岛通关', snapshot.roundFirstTry);
    }
    if (snapshot.difficulty === 4 && snapshot.stars >= 3) add('challenge-3', '挑战难度 3 通关', snapshot.roundFirstTry);
    if (snapshot.difficulty === 1 && snapshot.stars >= 3) add('melon-sweet', '轻松难度 3 星通关', snapshot.roundFirstTry);
    if (snapshot.todayFirstTry >= 30) add('today-30', '今天答对 30 题', snapshot.todayFirstTry);
    if (snapshot.todayFirstTry >= 60) add('today-60', '今天答对 60 题', snapshot.todayFirstTry);
    if (snapshot.cumulativeFirstTry >= 50) add('correct-50', '累计答对 50 题', snapshot.cumulativeFirstTry);
    if (snapshot.cumulativeFirstTry >= 100) add('correct-100', '累计答对 100 题', snapshot.cumulativeFirstTry);
    if (snapshot.cumulativeFirstTry >= 300) add('correct-300', '累计答对 300 题', snapshot.cumulativeFirstTry);
    if (snapshot.roundsCompleted >= 3) add('panda-3', '完成 3 轮', snapshot.roundFirstTry);
    if (snapshot.roundsCompleted >= 5) add('panda-5', '完成 5 轮', snapshot.roundFirstTry);
    if (snapshot.roundsCompleted >= 10) add('guardian-10', '完成 10 轮', snapshot.roundFirstTry);
    if (snapshot.difficultiesCleared.length >= 4) add('all-diff', '四个难度都通关啦', snapshot.roundFirstTry);
  }

  return grants;
}

/** Newly earned cards, rarest first, with the first-ever card kept at the front. */
export function newGrants(snapshot: AwardSnapshot, owned: Iterable<string>): CardGrant[] {
  const have = new Set(owned);
  const fresh = grantsFor(snapshot).filter((grant) => !have.has(grant.id) && cardById(grant.id));
  fresh.sort((a, b) => {
    if (a.id === 'sprout') return -1;
    if (b.id === 'sprout') return 1;
    const aRank = RARITY_RANK[cardById(a.id)?.rarity ?? 'common'];
    const bRank = RARITY_RANK[cardById(b.id)?.rarity ?? 'common'];
    return aRank - bRank;
  });
  return fresh;
}

export function legacyCardId(stickerId: string): string {
  return `legacy:${stickerId}`;
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
