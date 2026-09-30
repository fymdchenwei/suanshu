import type { ArtKind, CardDef } from './cards';

/** Illustrated Q-version card face. Filled shapes only, no external images. */
export function cardSvg(def: CardDef): string {
  const uid = def.id.replace(/[^a-z0-9-]/gi, '');
  const look = lookFor(def);
  return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${def.sky[0]}"/>
        <stop offset="1" stop-color="${def.sky[1]}"/>
      </linearGradient>
    </defs>
    <rect width="200" height="250" rx="22" fill="url(#${uid}-sky)"/>
    ${clouds()}
    ${character(look)}
  </svg>`;
}

type Ear = 'dino' | 'bunny' | 'cat' | 'cloud' | 'robot' | 'star' | 'leaf' | 'round';
type Hat = 'sprout' | 'crown' | 'astro' | 'wizard' | 'berry' | 'bow' | 'none';

interface Look {
  skin: string;
  belly: string;
  ear: Ear;
  hat: Hat;
  blush: string;
  mark: string;
}

const LOOKS: Record<string, Look> = {
  sprout: { skin: '#7ddea0', belly: '#fff6ea', ear: 'dino', hat: 'sprout', blush: '#ffb3c7', mark: '萌芽' },
  'perfect-stage': { skin: '#ffd56a', belly: '#fff6ea', ear: 'star', hat: 'crown', blush: '#ffb3c7', mark: '奖' },
  'streak-5': { skin: '#ffb067', belly: '#fff1dc', ear: 'bunny', hat: 'bow', blush: '#ff8eb8', mark: '火' },
  'streak-10': { skin: '#f7fbff', belly: '#e7f4ff', ear: 'cloud', hat: 'none', blush: '#ffc2d8', mark: '云' },
  'streak-15': { skin: '#ffe9a8', belly: '#fff', ear: 'bunny', hat: 'astro', blush: '#ffb3c7', mark: '闪' },
  'retry-heart': { skin: '#ffd0e0', belly: '#fff', ear: 'cat', hat: 'bow', blush: '#ff8eb8', mark: '心' },
  'one-breath': { skin: '#d7e4ff', belly: '#fff', ear: 'robot', hat: 'none', blush: '#ffc2d8', mark: '算' },
  flawless: { skin: '#ffe08a', belly: '#fff6ea', ear: 'dino', hat: 'crown', blush: '#ffb3c7', mark: '冠' },
  'two-stars': { skin: '#c9e4ff', belly: '#fff', ear: 'round', hat: 'bow', blush: '#ffc2d8', mark: '杯' },
  'three-stars': { skin: '#d7b0ff', belly: '#fff', ear: 'dino', hat: 'crown', blush: '#ffb3c7', mark: '星' },
  'cheer-up': { skin: '#ffc2a8', belly: '#fff6ea', ear: 'dino', hat: 'bow', blush: '#ff8eb8', mark: '加油' },
  'easy-clear': { skin: '#9be07a', belly: '#fff6ea', ear: 'leaf', hat: 'sprout', blush: '#ffb3c7', mark: '草' },
  'carry-clear': { skin: '#ffc48a', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '桥' },
  'advanced-clear': { skin: '#ffb7d5', belly: '#fff', ear: 'cat', hat: 'berry', blush: '#ff8eb8', mark: '莓' },
  'challenge-clear': { skin: '#c9b6ff', belly: '#fff', ear: 'cat', hat: 'crown', blush: '#ffc2d8', mark: '城' },
  'challenge-3': { skin: '#ffe08a', belly: '#fff6ea', ear: 'dino', hat: 'crown', blush: '#ffb3c7', mark: '王' },
  'melon-sweet': { skin: '#ff8fa3', belly: '#d8ffb0', ear: 'round', hat: 'none', blush: '#ffd0dc', mark: '瓜' },
  'today-30': { skin: '#ffe14a', belly: '#fff6ea', ear: 'star', hat: 'none', blush: '#ffb3c7', mark: '日' },
  'today-60': { skin: '#ffd15c', belly: '#fff', ear: 'star', hat: 'crown', blush: '#ffb3c7', mark: '冠' },
  'correct-50': { skin: '#ffb7d5', belly: '#fff', ear: 'leaf', hat: 'bow', blush: '#ff8eb8', mark: '花' },
  'correct-100': { skin: '#c9f0ff', belly: '#fff', ear: 'cloud', hat: 'bow', blush: '#ffc2d8', mark: '彩' },
  'correct-300': { skin: '#d9d4ff', belly: '#fff', ear: 'robot', hat: 'wizard', blush: '#ffc2d8', mark: '数' },
  'panda-3': { skin: '#f4f4f4', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '熊' },
  'panda-5': { skin: '#f7e2b8', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '箱' },
  'guardian-10': { skin: '#8fd48a', belly: '#fff6ea', ear: 'dino', hat: 'sprout', blush: '#ffb3c7', mark: '岛' },
  'all-diff': { skin: '#ffc2e0', belly: '#fff', ear: 'cloud', hat: 'bow', blush: '#ff8eb8', mark: '季' },
  'night-sky': { skin: '#efe6ff', belly: '#fff', ear: 'star', hat: 'astro', blush: '#ffc2d8', mark: '仙' },
};

const ART_LOOK: Partial<Record<ArtKind, Look>> = {
  panda: { skin: '#f4f4f4', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '熊' },
  star: { skin: '#ffe14a', belly: '#fff6ea', ear: 'star', hat: 'none', blush: '#ffb3c7', mark: '星' },
  heart: { skin: '#ffd0e0', belly: '#fff', ear: 'cat', hat: 'bow', blush: '#ff8eb8', mark: '心' },
  moon: { skin: '#efe6ff', belly: '#fff', ear: 'star', hat: 'none', blush: '#ffc2d8', mark: '月' },
  sun: { skin: '#ffe14a', belly: '#fff6ea', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '日' },
  rocket: { skin: '#d7e4ff', belly: '#fff', ear: 'robot', hat: 'astro', blush: '#ffc2d8', mark: '箭' },
  flower: { skin: '#ffb7d5', belly: '#fff', ear: 'leaf', hat: 'bow', blush: '#ff8eb8', mark: '花' },
  mushroom: { skin: '#ff8fa3', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffd0dc', mark: '菇' },
  melon: { skin: '#ff8fa3', belly: '#d8ffb0', ear: 'round', hat: 'none', blush: '#ffd0dc', mark: '瓜' },
  trophy: { skin: '#ffd56a', belly: '#fff6ea', ear: 'star', hat: 'crown', blush: '#ffb3c7', mark: '杯' },
  castle: { skin: '#c9b6ff', belly: '#fff', ear: 'cat', hat: 'crown', blush: '#ffc2d8', mark: '城' },
  rainbow: { skin: '#f7fbff', belly: '#e7f4ff', ear: 'cloud', hat: 'none', blush: '#ffc2d8', mark: '虹' },
  chest: { skin: '#f7e2b8', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '箱' },
  medal: { skin: '#ffd56a', belly: '#fff6ea', ear: 'star', hat: 'crown', blush: '#ffb3c7', mark: '章' },
  butterfly: { skin: '#e7d4ff', belly: '#fff', ear: 'leaf', hat: 'bow', blush: '#ffc2d8', mark: '蝶' },
  island: { skin: '#8fd48a', belly: '#fff6ea', ear: 'dino', hat: 'sprout', blush: '#ffb3c7', mark: '岛' },
  bridge: { skin: '#ffc48a', belly: '#fff', ear: 'round', hat: 'none', blush: '#ffb3c7', mark: '桥' },
  fireworks: { skin: '#ffb067', belly: '#fff1dc', ear: 'bunny', hat: 'bow', blush: '#ff8eb8', mark: '火' },
  dino: { skin: '#7ddea0', belly: '#fff6ea', ear: 'dino', hat: 'none', blush: '#ffb3c7', mark: '龙' },
};

function lookFor(def: CardDef): Look {
  return (
    LOOKS[def.id] ??
    ART_LOOK[def.art] ?? {
      skin: '#7ddea0',
      belly: '#fff6ea',
      ear: 'dino',
      hat: 'none',
      blush: '#ffb3c7',
      mark: '龙',
    }
  );
}

function clouds(): string {
  return `
    <ellipse cx="164" cy="36" rx="20" ry="11" fill="#fff" opacity="0.92"/>
    <ellipse cx="180" cy="40" rx="12" ry="8" fill="#fff" opacity="0.88"/>
    <circle cx="28" cy="28" r="2.2" fill="#fff6b0"/>
    <circle cx="46" cy="48" r="1.6" fill="#fff"/>
    <circle cx="168" cy="72" r="1.6" fill="#fff6b0"/>
  `;
}

function character(look: Look): string {
  const ink = '#5a3a28';
  return `
    <ellipse cx="100" cy="214" rx="78" ry="22" fill="#7dce4e"/>
    <ellipse cx="100" cy="208" rx="70" ry="16" fill="#9be07a"/>
    <g>
      ${ears(look)}
      <ellipse cx="100" cy="168" rx="40" ry="32" fill="${look.skin}" stroke="${shade(look.skin, -36)}" stroke-width="3"/>
      <ellipse cx="100" cy="176" rx="24" ry="18" fill="${look.belly}"/>
      <ellipse cx="74" cy="188" rx="12" ry="8" fill="${shade(look.skin, -18)}"/>
      <ellipse cx="126" cy="188" rx="12" ry="8" fill="${shade(look.skin, -18)}"/>
      <ellipse cx="58" cy="156" rx="12" ry="10" fill="${look.skin}"/>
      <ellipse cx="142" cy="146" rx="12" ry="10" fill="${look.skin}" transform="rotate(-28 142 146)"/>
      <ellipse cx="100" cy="112" rx="46" ry="42" fill="${look.skin}" stroke="${shade(look.skin, -36)}" stroke-width="3"/>
      ${face(look, ink)}
      ${hat(look)}
      <g transform="translate(156 92)">
        <circle r="16" fill="#fff" stroke="${look.blush}" stroke-width="3"/>
        <text y="5" text-anchor="middle" font-size="13" font-family="ui-rounded, sans-serif" fill="${ink}" font-weight="700">${look.mark}</text>
      </g>
    </g>
  `;
}

function face(look: Look, ink: string): string {
  const pupil = look.mark === '熊' ? '#2a2a2a' : '#6b4226';
  const patches =
    look.mark === '熊'
      ? '<ellipse cx="82" cy="108" rx="18" ry="16" fill="#2a2a2a"/><ellipse cx="118" cy="108" rx="18" ry="16" fill="#2a2a2a"/>'
      : '';
  return `
    ${patches}
    <ellipse cx="82" cy="108" rx="14" ry="16" fill="#fff"/>
    <ellipse cx="118" cy="108" rx="14" ry="16" fill="#fff"/>
    <ellipse cx="84" cy="110" rx="7" ry="8" fill="${pupil}"/>
    <ellipse cx="120" cy="110" rx="7" ry="8" fill="${pupil}"/>
    <circle cx="88" cy="104" r="3.2" fill="#fff"/>
    <circle cx="124" cy="104" r="3.2" fill="#fff"/>
    <circle cx="80" cy="114" r="1.6" fill="#fff"/>
    <circle cx="116" cy="114" r="1.6" fill="#fff"/>
    <ellipse cx="64" cy="122" rx="8" ry="4.5" fill="${look.blush}" opacity="0.9"/>
    <ellipse cx="136" cy="122" rx="8" ry="4.5" fill="${look.blush}" opacity="0.9"/>
    <path d="M90 128 Q100 140 110 128" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
    ${look.ear === 'dino' ? '<ellipse cx="100" cy="124" rx="7" ry="4" fill="#ffd0a8"/>' : ''}
  `;
}

function ears(look: Look): string {
  const skin = look.skin;
  if (look.ear === 'bunny') {
    return `
      <ellipse cx="70" cy="62" rx="12" ry="28" fill="${skin}"/>
      <ellipse cx="130" cy="62" rx="12" ry="28" fill="${skin}"/>
      <ellipse cx="70" cy="66" rx="6" ry="18" fill="#ffd0e0"/>
      <ellipse cx="130" cy="66" rx="6" ry="18" fill="#ffd0e0"/>
    `;
  }
  if (look.ear === 'cat') {
    return `
      <path d="M62 96 L74 58 L96 88 Z" fill="${skin}"/>
      <path d="M138 96 L126 58 L104 88 Z" fill="${skin}"/>
      <path d="M70 88 L78 68 L90 86 Z" fill="#ffd0e0"/>
      <path d="M130 88 L122 68 L110 86 Z" fill="#ffd0e0"/>
    `;
  }
  if (look.ear === 'cloud') {
    return `
      <ellipse cx="62" cy="78" rx="22" ry="16" fill="#fff"/>
      <ellipse cx="138" cy="78" rx="22" ry="16" fill="#fff"/>
      <ellipse cx="78" cy="68" rx="14" ry="12" fill="#fff"/>
      <ellipse cx="122" cy="68" rx="14" ry="12" fill="#fff"/>
    `;
  }
  if (look.ear === 'robot') {
    return `
      <rect x="78" y="58" width="6" height="16" rx="3" fill="#8aa0c8"/>
      <circle cx="81" cy="54" r="6" fill="#7ec8ff"/>
      <rect x="54" y="96" width="18" height="14" rx="4" fill="#c5d4ee"/>
      <rect x="128" y="96" width="18" height="14" rx="4" fill="#c5d4ee"/>
    `;
  }
  if (look.ear === 'star') {
    return `
      <polygon points="70,78 74,66 78,78 90,80 78,86 80,98 70,90 60,98 62,86 50,80" fill="#ffe14a"/>
      <polygon points="130,78 134,66 138,78 150,80 138,86 140,98 130,90 120,98 122,86 110,80" fill="#ffe14a"/>
    `;
  }
  if (look.ear === 'leaf') {
    return `
      <ellipse cx="72" cy="78" rx="16" ry="10" fill="#7dce4e" transform="rotate(-30 72 78)"/>
      <ellipse cx="128" cy="78" rx="16" ry="10" fill="#7dce4e" transform="rotate(30 128 78)"/>
    `;
  }
  if (look.ear === 'dino') {
    return `
      <ellipse cx="68" cy="84" rx="10" ry="14" fill="#ffb7d2"/>
      <ellipse cx="132" cy="84" rx="10" ry="14" fill="#ffb7d2"/>
    `;
  }
  const earFill = look.mark === '熊' ? '#2a2a2a' : skin;
  return `
    <circle cx="62" cy="96" r="14" fill="${earFill}"/>
    <circle cx="138" cy="96" r="14" fill="${earFill}"/>
  `;
}

function hat(look: Look): string {
  if (look.hat === 'sprout') {
    return `
      <path d="M100 70 Q108 52 100 40 Q92 52 100 70" fill="#5cbf4a"/>
      <ellipse cx="100" cy="72" rx="8" ry="4" fill="#7dce4e"/>
    `;
  }
  if (look.hat === 'crown') {
    return `<polygon points="68,78 78,58 88,74 100,50 112,74 122,58 132,78" fill="#ffd15c" stroke="#f0a020" stroke-width="2"/>`;
  }
  if (look.hat === 'astro') {
    return `
      <path d="M70 96 Q100 48 130 96 Z" fill="#eef6ff" stroke="#9ecbff" stroke-width="3"/>
      <ellipse cx="100" cy="96" rx="34" ry="10" fill="#d7ecff"/>
    `;
  }
  if (look.hat === 'wizard') {
    return `
      <path d="M100 36 L132 100 L68 100 Z" fill="#7a6cff"/>
      <ellipse cx="100" cy="100" rx="36" ry="8" fill="#ffd15c"/>
      <circle cx="108" cy="70" r="3" fill="#ffe14a"/>
    `;
  }
  if (look.hat === 'berry') {
    return `
      <ellipse cx="100" cy="74" rx="16" ry="14" fill="#ff5d73"/>
      <circle cx="94" cy="70" r="1.4" fill="#fff"/>
      <circle cx="102" cy="66" r="1.4" fill="#fff"/>
      <circle cx="108" cy="74" r="1.4" fill="#fff"/>
      <path d="M100 62 Q108 50 96 52" fill="#5cbf4a"/>
    `;
  }
  if (look.hat === 'bow') {
    return `
      <ellipse cx="86" cy="76" rx="12" ry="8" fill="#ff8eb8"/>
      <ellipse cx="114" cy="76" rx="12" ry="8" fill="#ff8eb8"/>
      <circle cx="100" cy="76" r="5" fill="#ff5d8a"/>
    `;
  }
  return '';
}

function shade(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  const num = Number.parseInt(raw, 16);
  const channel = (shift: number) => {
    const value = (num >> shift) & 255;
    return Math.max(0, Math.min(255, value + amount));
  };
  const mixed = (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return `#${mixed.toString(16).padStart(6, '0')}`;
}
