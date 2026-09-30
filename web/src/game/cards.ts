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
  sprout: '第一关完成啦，萌芽小龙为你鼓掌！',
  'perfect-stage': '这一关十题全对，奖章亮晶晶！',
  'streak-5': '你连对了5题，太棒啦！',
  'streak-10': '连对十题，彩虹都为你亮起来！',
  'streak-15': '连对十五题，你是闪电小冠军！',
  'one-breath': '三十题一口气做完，火箭也起飞啦！',
  flawless: '三十题全部一次答对，皇冠属于你！',
  'two-stars': '两颗星到手，奖杯为你闪亮！',
  'three-stars': '三颗星！小恐龙为你欢呼！',
  'cheer-up': '小恐龙抱一抱，下一轮会更顺！',
  'easy-clear': '轻松难度通关，草地都变绿啦！',
  'carry-clear': '进位也难不倒你，小桥为你搭好啦！',
  'advanced-clear': '进阶难度完成，你又爬上了一座小山！',
  'challenge-clear': '挑战难度通关，城堡大门为你打开！',
  'challenge-3': '挑战难度三颗星，你是小岛上的小国王！',
  'melon-sweet': '轻松难度三颗星，来一口甜甜西瓜！',
  'today-30': '今天答对三十题，你是今日之星！',
  'today-60': '今天答对六十题，冠军就是你！',
  'correct-50': '累计答对五十题，花田为你开花！',
  'correct-100': '一百题都答对啦，彩虹围着你转！',
  'correct-300': '三百题！这是传说级的努力！',
  'panda-3': '完成三轮，熊猫来当你的伙伴！',
  'panda-5': '完成五轮，熊猫把宝箱推给你！',
  'guardian-10': '十轮都完成啦，小岛有你守护！',
  'all-diff': '四个难度都闯过，四季小岛为你换新装！',
  'night-sky': '挑战难度的夜空里，星星陪你航行！',
  'retry-heart': '答错也没关系，你又试了一次，真勇敢！',
};

export const CARDS: CardDef[] = [
  card('sprout', '萌芽小恐龙', 'common', '完成任意一关', 'dino', ['#8fd4ff', '#fff1b8'], '#7dce4e', '#6ed84a', '#ffb703'),
  card('perfect-stage', '满分奖章', 'rare', '某一关 10 题都一次答对', 'medal', ['#ffe38a', '#fff7d6'], '#8ed15a', '#ffd15c', '#ff8a3d'),
  card('streak-5', '火花连击', 'rare', '连对 5 题', 'fireworks', ['#ffd0a8', '#fff0c8'], '#7dce4e', '#ff8a3d', '#ffd15c'),
  card('streak-10', '彩虹连击', 'epic', '连对 10 题', 'rainbow', ['#9ad7ff', '#ffe1f2'], '#6dce7a', '#ff7eb3', '#7ad0ff'),
  card('streak-15', '闪电传说', 'legend', '最高连对达到 15 题', 'dino-astro', ['#2a3d88', '#8ec5ff'], '#3f8f62', '#ffe14a', '#7ad0ff'),
  card('retry-heart', '勇气爱心', 'common', '答错过，但还是完成了一关', 'heart', ['#ffd0e0', '#fff0f6'], '#7dce4e', '#ff6f9a', '#ffd0e0'),
  card('one-breath', '冲刺火箭', 'rare', '一口气完成一轮 30 题', 'rocket', ['#b7dcff', '#fff6d0'], '#7dce4e', '#ff8a65', '#7eb6ff'),
  card('flawless', '零失误皇冠', 'legend', '一轮 30 题全部一次答对', 'dino-crown', ['#fff1b0', '#ffe08a'], '#8ed15a', '#ffd15c', '#fff7d2'),
  card('two-stars', '双星奖杯', 'rare', '一轮得到 2 颗星', 'trophy', ['#d7ecff', '#fff4c8'], '#7dce4e', '#ffd15c', '#7eb6ff'),
  card('three-stars', '三星领奖台', 'epic', '一轮得到 3 颗星', 'dino-cape', ['#6a3d9a', '#ffb07a'], '#c9894a', '#ffd15c', '#e23d4a'),
  card('cheer-up', '加油伙伴', 'common', '完成一轮，小恐龙给你打气', 'dino-heart', ['#ffe0c2', '#fff6ea'], '#8ed15a', '#ff8fab', '#ffd08a'),
  card('easy-clear', '青草地', 'common', '完成轻松难度一轮', 'island', ['#8fd4ff', '#e7ffe8'], '#63c84a', '#7dce4e', '#ffd15c'),
  card('carry-clear', '进位小桥', 'common', '完成进位难度一轮', 'bridge', ['#ffd39a', '#fff1c9'], '#8ed15a', '#e0893a', '#fff1c2'),
  card('advanced-clear', '进阶山丘', 'rare', '完成进阶难度一轮', 'flower', ['#b6f0ff', '#e7ffe8'], '#3ec06a', '#ff8fb8', '#ffd15c'),
  card('challenge-clear', '挑战城堡', 'epic', '完成挑战难度一轮', 'castle', ['#3a4a90', '#b7c0ff'], '#3e8f62', '#c9b0ff', '#ffd15c'),
  card('challenge-3', '挑战之王', 'legend', '挑战难度得到 3 颗星', 'castle', ['#241848', '#ffb703'], '#2f6e52', '#ffd15c', '#ff7eb3'),
  card('melon-sweet', '甜甜西瓜', 'rare', '轻松难度得到 3 颗星', 'melon', ['#c8f5ff', '#fff6d8'], '#7dce4e', '#ff5d6e', '#7dce4e'),
  card('today-30', '今日之星', 'epic', '今天一次答对累计 30 题', 'sun', ['#8fd4ff', '#fff3bf'], '#7dce4e', '#ffd15c', '#ff9a1f'),
  card('today-60', '今日冠军', 'legend', '今天一次答对累计 60 题', 'sun', ['#ffb347', '#fff1a8'], '#e6a63a', '#ffcf3d', '#fff7d2'),
  card('correct-50', '花田五十', 'rare', '累计一次答对 50 题', 'flower', ['#ffe1f0', '#fff6ea'], '#7dce4e', '#ff8fb8', '#ffd15c'),
  card('correct-100', '彩虹百题', 'epic', '累计一次答对 100 题', 'rainbow', ['#c6e6ff', '#ffe8f6'], '#6dce7a', '#b07bff', '#ff8fb8'),
  card('correct-300', '传说三百', 'legend', '累计一次答对 300 题', 'dino-wizard', ['#1b2458', '#9b8cff'], '#3e6e58', '#c9b0ff', '#ffd15c'),
  card('panda-3', '熊猫伙伴', 'common', '完成 3 轮', 'panda', ['#d9f3ff', '#fff'], '#7dce4e', '#2a2a2a', '#fff'),
  card('panda-5', '宝箱熊猫', 'rare', '完成 5 轮', 'chest', ['#ffe7b8', '#fff6ea'], '#c9894a', '#f0b429', '#ff8a3d'),
  card('guardian-10', '小岛守护', 'epic', '完成 10 轮', 'island', ['#7ecbff', '#d9f8c8'], '#5cba3c', '#37b14a', '#ffd15c'),
  card('all-diff', '四季小岛', 'legend', '四个难度都完成过一轮', 'island', ['#ffb6d5', '#c6e6ff'], '#7dce4e', '#ff7eb3', '#7ad0ff'),
  card('night-sky', '星空夜航', 'rare', '在挑战难度完成一轮', 'moon', ['#1b2458', '#6b6bb5'], '#2f6a52', '#ffe9a2', '#c7b8fa'),
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
