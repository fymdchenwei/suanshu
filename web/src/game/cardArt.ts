import type { CardDef } from './cards';

/** Illustrated card face. Filled shapes only, no external images. */
export function cardSvg(def: CardDef): string {
  const uid = def.id.replace(/[^a-z0-9-]/gi, '');
  return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${def.sky[0]}"/>
        <stop offset="1" stop-color="${def.sky[1]}"/>
      </linearGradient>
      <radialGradient id="${uid}-sun" cx="50%" cy="40%" r="50%">
        <stop offset="0" stop-color="#fff" stop-opacity="0.95"/>
        <stop offset="0.45" stop-color="${def.accent2}"/>
        <stop offset="1" stop-color="${def.accent2}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${uid}-shine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.65"/>
        <stop offset="0.4" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="200" height="250" rx="18" fill="url(#${uid}-sky)"/>
    ${clouds()}
    ${hero(def)}
    <ellipse cx="46" cy="28" rx="18" ry="10" fill="#fff" opacity="0.85"/>
    <ellipse cx="62" cy="30" rx="12" ry="8" fill="#fff" opacity="0.8"/>
    <rect width="200" height="250" rx="18" fill="url(#${uid}-shine)"/>
  </svg>`;
}

function clouds(): string {
  return `
    <ellipse cx="156" cy="46" rx="22" ry="12" fill="#fff" opacity="0.9"/>
    <ellipse cx="172" cy="50" rx="14" ry="9" fill="#fff" opacity="0.85"/>
    <ellipse cx="30" cy="78" rx="16" ry="8" fill="#fff" opacity="0.55"/>
  `;
}

function ground(color: string, y = 196): string {
  return `
    <ellipse cx="100" cy="${y + 28}" rx="120" ry="36" fill="${shade(color, -18)}"/>
    <ellipse cx="100" cy="${y}" rx="108" ry="34" fill="${color}"/>
    <ellipse cx="70" cy="${y - 6}" rx="28" ry="10" fill="${shade(color, 18)}" opacity="0.8"/>
    <ellipse cx="132" cy="${y + 2}" rx="22" ry="8" fill="${shade(color, 10)}" opacity="0.7"/>
  `;
}

function hero(def: CardDef): string {
  switch (def.art) {
    case 'dino':
      return `${ground(def.ground)}${flowers('#ff8fb8', '#ffd15c')}${dino(100, 168, def.accent)}`;
    case 'dino-cape':
      return `${ground(def.ground, 200)}${starsBg()}${dino(100, 172, '#6ed84a', { cape: def.accent2 })}`;
    case 'dino-crown':
      return `${ground(def.ground)}${sparkles()}${dino(100, 168, def.accent, { crown: true })}`;
    case 'dino-wizard':
      return `${ground('#3e6e58', 206)}${nightStars()}${dino(100, 176, '#7dce4e', { hat: def.accent })}`;
    case 'dino-astro':
      return `${nightSky()}${dino(100, 176, '#7dce4e', { helmet: true })}`;
    case 'dino-heart':
      return `${ground(def.ground)}${hearts()}${dino(100, 170, def.accent, { heart: true })}`;
    case 'panda':
      return `${ground(def.ground)}${flowers('#ffd0e0', '#fff')}${panda(104, 176)}`;
    case 'rocket':
      return `${ground(def.ground, 214)}${sparkles()}${rocket(108, 150, def.accent, def.accent2)}`;
    case 'rainbow':
      return `${ground(def.ground, 208)}${rainbow(100, 168)}${dino(78, 186, '#6ed84a')}`;
    case 'chest':
      return `${ground(def.ground, 210)}${sparkles()}${chest(100, 168)}${panda(148, 150, 0.62)}`;
    case 'trophy':
      return `${ground(def.ground)}${sparkles()}${trophy(100, 150, def.accent)}`;
    case 'flower':
      return `${ground(def.ground, 210)}${bigFlower(70, 168, def.accent)}${bigFlower(124, 156, def.accent2)}${bigFlower(104, 196, '#fff')}${dino(150, 196, '#6ed84a', { mini: true })}`;
    case 'moon':
      return `${nightSky()}${moon(108, 108)}${dino(78, 196, '#6ed84a', { mini: true })}`;
    case 'sun':
      return `${sun(108, 96, def.accent)}${ground(def.ground, 214)}${dino(100, 190, '#6ed84a', { mini: true })}`;
    case 'heart':
      return `${ground(def.ground)}${bigHeart(100, 132, def.accent)}${dino(100, 198, '#6ed84a', { mini: true })}`;
    case 'mushroom':
      return `${ground(def.ground, 214)}${mushroom(78, 168, 1)}${mushroom(124, 186, 0.72)}${dino(150, 196, '#6ed84a', { mini: true })}`;
    case 'butterfly':
      return `${ground(def.ground, 216)}${flowers('#ffd15c', '#fff')}${butterfly(100, 120, def.accent, def.accent2, 1.15)}`;
    case 'melon':
      return `${ground(def.ground)}${melon(100, 150)}`;
    case 'island':
      return `${island(def.ground, def.accent)}${rainbow(120, 92, 0.55)}`;
    case 'star':
      return `${ground(def.ground, 216)}${bigStar(100, 118, def.accent)}${dino(100, 198, '#6ed84a', { mini: true })}`;
    case 'fireworks':
      return `${ground(def.ground, 214)}${burst(60, 90, def.accent)}${burst(140, 70, def.accent2)}${burst(100, 120, '#fff')}${dino(100, 192, '#6ed84a', { mini: true })}`;
    case 'bridge':
      return `${ground(def.ground, 216)}${bridge(100, 176, def.accent)}${dino(64, 168, '#6ed84a', { mini: true })}`;
    case 'castle':
      return `${ground(def.ground, 216)}${castle(104, 168, def.accent, def.accent2)}`;
    case 'medal':
      return `${ground(def.ground)}${medal(100, 132, def.accent, def.accent2)}${sparkles()}`;
    default:
      return `${ground(def.ground)}${dino(100, 168, def.accent)}`;
  }
}

function dino(
  x: number,
  y: number,
  body: string,
  extra: { cape?: string; crown?: boolean; hat?: string; helmet?: boolean; heart?: boolean; mini?: boolean } = {},
): string {
  const s = extra.mini ? 0.62 : 1;
  const belly = '#ffe3b0';
  const dark = shade(body, -28);
  const spike = '#ff9a2a';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${extra.cape ? `<path d="M-28 -20 L-46 48 L0 28 L46 48 L28 -20 Z" fill="${extra.cape}"/>` : ''}
    <ellipse cx="0" cy="8" rx="34" ry="30" fill="${body}"/>
    <ellipse cx="0" cy="14" rx="20" ry="18" fill="${belly}"/>
    <ellipse cx="-18" cy="30" rx="12" ry="8" fill="${dark}"/>
    <ellipse cx="18" cy="30" rx="12" ry="8" fill="${dark}"/>
    <ellipse cx="-16" cy="34" rx="8" ry="5" fill="${body}"/>
    <ellipse cx="16" cy="34" rx="8" ry="5" fill="${body}"/>
    <ellipse cx="-34" cy="6" rx="10" ry="8" fill="${body}" transform="rotate(-18 -34 6)"/>
    <ellipse cx="36" cy="-8" rx="10" ry="8" fill="${body}" transform="rotate(24 36 -8)"/>
    <circle cx="32" cy="-16" r="6" fill="${body}"/>
    <ellipse cx="-8" cy="-48" rx="10" ry="16" fill="${body}"/>
    <ellipse cx="0" cy="-36" rx="36" ry="32" fill="${body}"/>
    <ellipse cx="0" cy="-18" rx="16" ry="10" fill="${body}"/>
    <ellipse cx="-14" cy="-40" rx="12" ry="14" fill="#fff"/>
    <ellipse cx="14" cy="-40" rx="12" ry="14" fill="#fff"/>
    <circle cx="-12" cy="-38" r="6.5" fill="#2b241c"/>
    <circle cx="16" cy="-38" r="6.5" fill="#2b241c"/>
    <circle cx="-10" cy="-41" r="2.6" fill="#fff"/>
    <circle cx="18" cy="-41" r="2.6" fill="#fff"/>
    <ellipse cx="-24" cy="-26" rx="7" ry="4.5" fill="#ff8fab"/>
    <ellipse cx="24" cy="-26" rx="7" ry="4.5" fill="#ff8fab"/>
    <path d="M-10 -16 Q0 -4 10 -16" fill="#e85b6c"/>
    <path d="M-12 -18 Q0 -6 12 -18" stroke="#2b241c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <polygon points="0,-78 8,-58 -8,-58" fill="${spike}"/>
    <polygon points="-6,-62 2,-78 -14,-66" fill="${spike}"/>
    <polygon points="8,-60 16,-76 0,-64" fill="${spike}"/>
    <polygon points="-4,-8 -1,6 -10,2" fill="${spike}"/>
    ${extra.crown ? `<polygon points="-16,-66 0,-86 16,-66 10,-60 -10,-60" fill="#ffd15c"/><circle cx="0" cy="-84" r="3" fill="#ff6f9a"/>` : ''}
    ${extra.hat ? `<polygon points="-18,-62 0,-102 18,-62" fill="${extra.hat}"/><rect x="-20" y="-66" width="40" height="8" rx="3" fill="${shade(extra.hat, -20)}"/>` : ''}
    ${extra.helmet ? `<ellipse cx="0" cy="-34" rx="42" ry="38" fill="#d7f4ff" opacity="0.35" stroke="#fff" stroke-width="3"/><rect x="-16" y="-78" width="32" height="8" rx="3" fill="#c9b0ff"/>` : ''}
    ${extra.heart ? `<path d="M22 -52 C22 -60 34 -60 34 -50 C34 -42 22 -34 22 -34 C22 -34 10 -42 10 -50 C10 -60 22 -60 22 -52 Z" fill="#ff6f9a"/>` : ''}
  </g>`;
}

function panda(x: number, y: number, s = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="10" rx="32" ry="26" fill="#fff"/>
    <circle cx="-14" cy="-28" r="10" fill="#2a2a2a"/>
    <circle cx="14" cy="-28" r="10" fill="#2a2a2a"/>
    <circle cx="0" cy="-8" r="26" fill="#fff"/>
    <ellipse cx="-10" cy="-6" rx="8" ry="9" fill="#2a2a2a"/>
    <ellipse cx="10" cy="-6" rx="8" ry="9" fill="#2a2a2a"/>
    <circle cx="-8" cy="-6" r="3" fill="#fff"/>
    <circle cx="12" cy="-6" r="3" fill="#fff"/>
    <ellipse cx="0" cy="4" rx="5" ry="4" fill="#2a2a2a"/>
    <path d="M-6 8 Q0 14 6 8" stroke="#2a2a2a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="-30" cy="4" rx="8" ry="14" fill="#2a2a2a" transform="rotate(20 -30 4)"/>
    <ellipse cx="30" cy="-6" rx="8" ry="14" fill="#2a2a2a" transform="rotate(-40 30 -6)"/>
    <ellipse cx="-14" cy="32" rx="10" ry="7" fill="#2a2a2a"/>
    <ellipse cx="14" cy="32" rx="10" ry="7" fill="#2a2a2a"/>
  </g>`;
}

function rocket(x: number, y: number, body: string, fin: string): string {
  return `<g transform="translate(${x} ${y})">
    <polygon points="-18,20 0,48 18,20" fill="${fin}"/>
    <polygon points="-28,8 -8,18 -16,36" fill="${fin}"/>
    <polygon points="28,8 8,18 16,36" fill="${fin}"/>
    <rect x="-16" y="-40" width="32" height="70" rx="16" fill="${body}"/>
    <ellipse cx="0" cy="-40" rx="16" ry="18" fill="${shade(body, 20)}"/>
    <circle cx="0" cy="-10" r="9" fill="#d7f4ff" stroke="#fff" stroke-width="3"/>
    <circle cx="-2" cy="-12" r="3" fill="#fff"/>
    <polygon points="-6,28 0,48 6,28" fill="#ffd15c"/>
    <polygon points="-3,34 0,52 3,34" fill="#fff"/>
  </g>`;
}

function rainbow(x: number, y: number, s = 1): string {
  const bands = ['#ff5d6e', '#ffb703', '#ffe14a', '#7ad957', '#5ec8ff', '#b07bff'];
  return `<g transform="translate(${x} ${y}) scale(${s})">${bands
    .map((color, index) => `<path d="M-${70 - index * 8} 10 A ${70 - index * 8} ${70 - index * 8} 0 0 1 ${70 - index * 8} 10" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`)
    .join('')}</g>`;
}

function chest(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <rect x="-40" y="-10" width="80" height="52" rx="8" fill="#e0893a"/>
    <rect x="-40" y="8" width="80" height="12" fill="#ffd15c"/>
    <rect x="-10" y="4" width="20" height="18" rx="3" fill="#ffd15c"/>
    <path d="M-40 -10 Q0 -62 40 -10" fill="#c96a22"/>
    <path d="M-34 -8 Q0 -48 34 -8" fill="#ffb703" opacity="0.35"/>
    <circle cx="0" cy="-28" r="8" fill="#fff6c2"/>
  </g>`;
}

function trophy(x: number, y: number, gold: string): string {
  return `<g transform="translate(${x} ${y})">
    <rect x="-16" y="48" width="32" height="10" rx="3" fill="${shade(gold, -30)}"/>
    <rect x="-8" y="28" width="16" height="22" fill="${gold}"/>
    <path d="M-28 0 H28 V16 Q28 40 0 44 Q-28 40 -28 16 Z" fill="${gold}"/>
    <path d="M-28 6 H-44 Q-36 28 -22 24" fill="none" stroke="${gold}" stroke-width="8"/>
    <path d="M28 6 H44 Q36 28 22 24" fill="none" stroke="${gold}" stroke-width="8"/>
    <ellipse cx="-6" cy="12" rx="8" ry="12" fill="#fff" opacity="0.35"/>
    <polygon points="0,-16 4,-6 14,-6 6,2 8,12 0,6 -8,12 -6,2 -14,-6 -4,-6" fill="#fff6c2"/>
  </g>`;
}

function bigFlower(x: number, y: number, color: string): string {
  const petals = [0, 60, 120, 180, 240, 300]
    .map((deg) => `<ellipse cx="0" cy="-16" rx="10" ry="16" fill="${color}" transform="rotate(${deg})"/>`)
    .join('');
  return `<g transform="translate(${x} ${y})">${petals}<circle r="8" fill="#ffd15c"/><rect x="-2" y="6" width="4" height="28" rx="2" fill="#3d9a40"/></g>`;
}

function moon(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <circle r="42" fill="#ffe9a2"/>
    <circle cx="16" cy="-8" r="34" fill="#2a3d88"/>
    <circle cx="-8" cy="-6" r="6" fill="#fff" opacity="0.35"/>
    <circle cx="-16" cy="12" r="4" fill="#fff" opacity="0.28"/>
  </g>`;
}

function sun(x: number, y: number, color: string): string {
  const rays = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    const x1 = Math.cos(angle) * 34;
    const y1 = Math.sin(angle) * 34;
    const x2 = Math.cos(angle) * 52;
    const y2 = Math.sin(angle) * 52;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
  }).join('');
  return `<g transform="translate(${x} ${y})">${rays}<circle r="30" fill="${color}"/><circle cx="-8" cy="-8" r="12" fill="#fff" opacity="0.45"/></g>`;
}

function bigHeart(x: number, y: number, color: string): string {
  return `<g transform="translate(${x} ${y})">
    <path d="M0 36 C-48 4 -40 -36 0 -12 C40 -36 48 4 0 36 Z" fill="${color}"/>
    <ellipse cx="-12" cy="-8" rx="10" ry="8" fill="#fff" opacity="0.45"/>
  </g>`;
}

function mushroom(x: number, y: number, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-10" y="0" width="20" height="36" rx="8" fill="#ffe3b0"/>
    <ellipse cx="0" cy="0" rx="32" ry="20" fill="#ff5d6e"/>
    <circle cx="-12" cy="-2" r="5" fill="#fff"/>
    <circle cx="8" cy="2" r="4" fill="#fff"/>
    <circle cx="16" cy="-6" r="3" fill="#fff"/>
  </g>`;
}

function butterfly(x: number, y: number, a: string, b: string, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="-22" cy="-8" rx="22" ry="16" fill="${a}"/>
    <ellipse cx="-18" cy="14" rx="14" ry="12" fill="${b}"/>
    <ellipse cx="22" cy="-8" rx="22" ry="16" fill="${a}"/>
    <ellipse cx="18" cy="14" rx="14" ry="12" fill="${b}"/>
    <ellipse cx="0" cy="2" rx="5" ry="20" fill="#3a332c"/>
    <circle cx="0" cy="-16" r="5" fill="#3a332c"/>
    <circle cx="-2" cy="-17" r="1.4" fill="#fff"/>
  </g>`;
}

function melon(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <path d="M-48 10 A50 50 0 0 1 48 10 Z" fill="#ff5d6e"/>
    <path d="M-40 10 A42 42 0 0 1 40 10 Z" fill="#fff"/>
    <path d="M-34 10 A36 36 0 0 1 34 10 Z" fill="#7dce4e"/>
    <circle cx="-16" cy="2" r="2.2" fill="#2b241c"/>
    <circle cx="0" cy="-2" r="2.2" fill="#2b241c"/>
    <circle cx="14" cy="4" r="2.2" fill="#2b241c"/>
    <path d="M-52 10 H52" stroke="#3d9a40" stroke-width="6" stroke-linecap="round"/>
  </g>`;
}

function island(groundColor: string, leaf: string): string {
  return `<g>
    <ellipse cx="100" cy="176" rx="70" ry="28" fill="${shade(groundColor, -30)}"/>
    <ellipse cx="100" cy="164" rx="74" ry="30" fill="${groundColor}"/>
    <rect x="70" y="96" width="8" height="52" rx="3" fill="#c68642"/>
    <ellipse cx="60" cy="96" rx="22" ry="8" fill="${leaf}" transform="rotate(-20 60 96)"/>
    <ellipse cx="88" cy="90" rx="22" ry="8" fill="${shade(leaf, -10)}" transform="rotate(24 88 90)"/>
    <ellipse cx="74" cy="84" rx="18" ry="8" fill="${shade(leaf, 12)}"/>
    <circle cx="128" cy="150" r="10" fill="#ffd15c"/>
    <polygon points="128,142 130,148 126,148" fill="#fff"/>
  </g>`;
}

function bigStar(x: number, y: number, color: string): string {
  return `<g transform="translate(${x} ${y})">
    <polygon points="0,-46 12,-14 46,-10 20,12 28,46 0,28 -28,46 -20,12 -46,-10 -12,-14" fill="${color}"/>
    <polygon points="0,-28 6,-10 20,-8 8,4 12,20 0,12 -12,20 -8,4 -20,-8 -6,-10" fill="#fff6c2"/>
  </g>`;
}

function burst(x: number, y: number, color: string): string {
  const rays = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    const x2 = Math.cos(angle) * 22;
    const y2 = Math.sin(angle) * 22;
    return `<line x1="0" y1="0" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
  }).join('');
  return `<g transform="translate(${x} ${y})">${rays}<circle r="5" fill="${color}"/></g>`;
}

function bridge(x: number, y: number, wood: string): string {
  return `<g transform="translate(${x} ${y})">
    <path d="M-70 20 Q0 -30 70 20" fill="none" stroke="${wood}" stroke-width="14" stroke-linecap="round"/>
    <path d="M-70 28 Q0 -10 70 28" fill="none" stroke="${shade(wood, -25)}" stroke-width="6"/>
    <rect x="-74" y="10" width="12" height="28" rx="3" fill="${shade(wood, -15)}"/>
    <rect x="62" y="10" width="12" height="28" rx="3" fill="${shade(wood, -15)}"/>
  </g>`;
}

function castle(x: number, y: number, wall: string, roof: string): string {
  return `<g transform="translate(${x} ${y})">
    <rect x="-46" y="-10" width="28" height="70" fill="${wall}"/>
    <rect x="18" y="-10" width="28" height="70" fill="${wall}"/>
    <rect x="-28" y="10" width="56" height="50" fill="${shade(wall, 12)}"/>
    <polygon points="-50,-10 -32,-46 -14,-10" fill="${roof}"/>
    <polygon points="14,-10 32,-46 50,-10" fill="${roof}"/>
    <polygon points="-20,-4 0,-36 20,-4" fill="${roof}"/>
    <rect x="-8" y="28" width="16" height="32" fill="#8a5a32"/>
    <circle cx="-32" cy="16" r="5" fill="#ffe9a2"/>
    <circle cx="32" cy="16" r="5" fill="#ffe9a2"/>
    <polygon points="0,-52 3,-42 -3,-42" fill="#ffd15c"/>
  </g>`;
}

function medal(x: number, y: number, gold: string, ribbon: string): string {
  return `<g transform="translate(${x} ${y})">
    <path d="M-18 -20 L-8 8 L0 -8 L8 8 L18 -20" fill="${ribbon}"/>
    <circle r="32" cy="24" fill="${gold}"/>
    <circle r="24" cy="24" fill="${shade(gold, 18)}"/>
    <polygon points="0,4 6,18 20,18 9,28 13,42 0,34 -13,42 -9,28 -20,18 -6,18" fill="#fff"/>
  </g>`;
}

function flowers(a: string, b: string): string {
  return `${miniFlower(36, 186, a)}${miniFlower(164, 190, b)}${miniFlower(48, 204, b)}`;
}

function miniFlower(x: number, y: number, color: string): string {
  return `<g transform="translate(${x} ${y})"><circle cx="-5" cy="0" r="4" fill="${color}"/><circle cx="5" cy="0" r="4" fill="${color}"/><circle cx="0" cy="-5" r="4" fill="${color}"/><circle cx="0" cy="5" r="4" fill="${color}"/><circle r="3" fill="#ffd15c"/></g>`;
}

function hearts(): string {
  return `<g fill="#ff8fab">${heartPath(36, 150, 0.35)}${heartPath(168, 156, 0.28)}${heartPath(150, 120, 0.22)}</g>`;
}

function heartPath(x: number, y: number, s: number): string {
  return `<path transform="translate(${x} ${y}) scale(${s})" d="M0 16 C-22 2 -18 -16 0 -6 C18 -16 22 2 0 16 Z"/>`;
}

function sparkles(): string {
  return `<g fill="#fff">${starPath(36, 70, 0.28)}${starPath(168, 88, 0.22)}${starPath(150, 48, 0.18)}${starPath(48, 108, 0.16)}</g>`;
}

function starsBg(): string {
  return `<g fill="#fff6c2">${starPath(30, 40, 0.22)}${starPath(170, 56, 0.18)}${starPath(48, 78, 0.14)}${starPath(160, 100, 0.16)}</g>`;
}

function nightStars(): string {
  return `<g fill="#fff">${starPath(28, 36, 0.16)}${starPath(60, 58, 0.1)}${starPath(150, 40, 0.18)}${starPath(176, 78, 0.12)}${starPath(120, 28, 0.1)}</g>`;
}

function nightSky(): string {
  return `<rect width="200" height="250" rx="18" fill="#1b2458"/>
    <circle cx="150" cy="64" r="22" fill="#ffe9a2"/>
    <circle cx="162" cy="58" r="18" fill="#1b2458"/>
    ${nightStars()}
    <ellipse cx="100" cy="214" rx="90" ry="28" fill="#2f6a52"/>`;
}

function starPath(x: number, y: number, s: number): string {
  return `<polygon transform="translate(${x} ${y}) scale(${s})" points="0,-18 4,-6 16,-6 6,2 10,14 0,7 -10,14 -6,2 -16,-6 -4,-6"/>`;
}

function shade(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const channel = (index: number) => {
    const value = Number.parseInt(raw.slice(index, index + 2), 16);
    return Math.max(0, Math.min(255, value + amount)).toString(16).padStart(2, '0');
  };
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}
