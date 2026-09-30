import { Difficulty, type Difficulty as DifficultyId } from '../engine/questionEngine';

export const Copy = {
  appName: '算数小恐龙',
  islandName: '小恐龙闯关岛',
  start: '开始闯关',
  cardBook: '奖励卡片',
  again: '再来一轮',
  backToIsland: '回到小岛',
  backToIslandShort: '小岛',
  collectCard: '收下卡片',
  seeScore: '看看成绩',
  continuePlaying: '继续闯关',
  cardsBanked: '还有几张已经放进卡片本啦',
  chestEmptyTitle: '宝箱打开啦',
  chestEmptyDetail: '新卡片都在你的册子里啦，继续加油～',
  firstTryCaption: '一次答对',
  exitTitle: '要回到小岛吗？',
  exitMessage: '这次闯关还没完成，进度不会保存。已经拿到的卡片会留下来。',
  keepPlaying: '继续答题',
  mute: '静音',
  unmute: '打开声音',
  share: '分享',
  lockedCard: '还没收集到',
  noRoundsYet: '选一个难度，开始第一轮吧',
  streak5: '太棒啦！连对 5 题！',
  streak10: '太棒啦！连对 10 题！',
  correctCheer: '答对啦！',
  correctAfterRetry: '这次对啦，前进吧！',
  wrongHint: '再试一次～',
  chestTitle: '宝箱打开啦',
  delete: '退格',
  submit: '确定',
  rotateTitle: '请把手机转成横屏',
  back: '返回',
  gentleTitle: '再加油！',
  gentleBody: '小恐龙一直陪着你，下一轮会更顺的～',
  goodTitle: '做得好！',
  goodBody: '稳稳的一步，小岛为你开心！',
  greatTitle: '太棒啦！',
  greatBody: '星星都亮起来啦，你真厉害！',
  bestStreakLabel: '最佳连对',
  encouragements: [
    '再试一次～',
    '差一点点，再想想～',
    '没关系，慢慢算！',
    '小恐龙给你加油！',
    '仔细看一看，再试一次～',
    '不着急，算对了再前进！',
  ],
};

export function stageTitle(stage: number): string {
  return `第 ${stage} 关`;
}

export function progress(current: number, total: number): string {
  return `${current} / ${total}`;
}

export function clock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${mins}:${rest.toString().padStart(2, '0')}`;
}

export function shareText(correct: number, total: number, stars: number): string {
  return `我在算数小恐龙闯关，一次答对 ${correct}/${total}，得到 ${stars} 颗星！`;
}

export function roundSummary(correct: number, total: number, stars: number): string {
  return `上一轮 ${correct}/${total} · ${stars} 颗星`;
}

export function collectedCount(count: number, total: number): string {
  return `已收集 ${count} / ${total}`;
}

export function roundsPlayed(count: number): string {
  return count === 0 ? Copy.noRoundsYet : `已经闯了 ${count} 轮`;
}

export function resultTitle(stars: number): string {
  if (stars >= 3) return Copy.greatTitle;
  if (stars === 2) return Copy.goodTitle;
  return Copy.gentleTitle;
}

export function resultBody(stars: number): string {
  if (stars >= 3) return Copy.greatBody;
  if (stars === 2) return Copy.goodBody;
  return Copy.gentleBody;
}

export function comboText(streak: number): string {
  return `连对 ${streak}`;
}

export function shortTitle(difficulty: DifficultyId): string {
  switch (difficulty) {
    case Difficulty.within20NoCarry:
      return '轻松';
    case Difficulty.within20WithCarry:
      return '进位';
    case Difficulty.twoDigitOnesNoCarry:
      return '进阶';
    case Difficulty.twoDigitWithCarry:
      return '挑战';
  }
}

export function chipNote(difficulty: DifficultyId): string {
  switch (difficulty) {
    case Difficulty.within20NoCarry:
    case Difficulty.twoDigitOnesNoCarry:
      return '不进位';
    case Difficulty.within20WithCarry:
    case Difficulty.twoDigitWithCarry:
      return '有进位';
  }
}

export function detail(difficulty: DifficultyId): string {
  switch (difficulty) {
    case Difficulty.within20NoCarry:
      return '二十以内，不进位、不退位';
    case Difficulty.within20WithCarry:
      return '二十以内，有进位、有退位';
    case Difficulty.twoDigitOnesNoCarry:
      return '两位数加减一位数，不进位不退位';
    case Difficulty.twoDigitWithCarry:
      return '一百以内，有进位、有退位';
  }
}
