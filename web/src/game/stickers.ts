export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  phrase: string;
  color: string;
}

export const STICKERS: Sticker[] = [
  { id: 'star', name: '闪亮星星', emoji: '⭐', phrase: '你一闪一闪的！', color: '#ffe258' },
  { id: 'rainbow', name: '彩虹', emoji: '🌈', phrase: '小岛下雨后就会出现。', color: '#b3d9ff' },
  { id: 'palm', name: '椰子树', emoji: '🌴', phrase: '树荫下最适合做题。', color: '#8cd973' },
  { id: 'gift', name: '小礼物', emoji: '🎁', phrase: '宝箱里的惊喜。', color: '#ff9e8c' },
  { id: 'dino', name: '小恐龙', emoji: '🦕', phrase: '和你一起闯关的伙伴。', color: '#8ce08c' },
  { id: 'flower', name: '小花花', emoji: '🌸', phrase: '岛边上的花。', color: '#ffbfd6' },
  { id: 'panda', name: '小熊猫', emoji: '🐼', phrase: '它从宝箱里跳出来。', color: '#ebebf0' },
  { id: 'heart', name: '爱心', emoji: '💖', phrase: '送给认真做题的你。', color: '#ff9ebd' },
  { id: 'trophy', name: '奖杯', emoji: '🏆', phrase: '闯关完成的纪念。', color: '#ffd666' },
  { id: 'sun', name: '太阳', emoji: '☀️', phrase: '小岛今天天气真好。', color: '#ffe673' },
  { id: 'moon', name: '月亮', emoji: '🌙', phrase: '晚霞里的小月亮。', color: '#c7b8fa' },
  { id: 'mushroom', name: '蘑菇', emoji: '🍄', phrase: '草地上的小房子。', color: '#ff9e80' },
  { id: 'butterfly', name: '蝴蝶', emoji: '🦋', phrase: '它跟着小恐龙飞。', color: '#b3d1ff' },
  { id: 'melon', name: '西瓜', emoji: '🍉', phrase: '闯关后的甜甜奖励。', color: '#8ce08c' },
  { id: 'rocket', name: '小火箭', emoji: '🚀', phrase: '下一关冲呀！', color: '#f2b3d9' },
];

export function stickerById(id: string): Sticker | undefined {
  return STICKERS.find((sticker) => sticker.id === id);
}
