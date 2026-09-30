import type { ArtKind, CardDef } from './cards';

/** One Q-version character per card. Filled shapes only, no external images. */
export function cardSvg(def: CardDef): string {
  const uid = def.id.replace(/[^a-z0-9-]/gi, '');
  return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${def.sky[0]}"/>
        <stop offset="1" stop-color="${def.sky[1]}"/>
      </linearGradient>
    </defs>
    <rect width="200" height="250" rx="22" fill="url(#${uid}-sky)"/>
    <circle cx="28" cy="26" r="2.2" fill="#fff6b0"/>
    <circle cx="168" cy="34" r="1.8" fill="#fff"/>
    <circle cx="150" cy="58" r="1.4" fill="#fff6b0"/>
    ${portrait(def)}
  </svg>`;
}

function portrait(def: CardDef): string {
  return CAST[def.id]?.() ?? ART_CAST[def.art]?.() ?? sproutDragon();
}

const CAST: Record<string, () => string> = {
  sprout: sproutDragon,
  'perfect-stage': medalBear,
  'streak-5': fireFox,
  'streak-10': cloudSpirit,
  'streak-15': lightningDeer,
  'retry-heart': heartCat,
  'one-breath': mathRobot,
  flawless: crownDragon,
  'two-stars': starPenguin,
  'three-stars': prizeBird,
  'cheer-up': cheerPanda,
  'easy-clear': grassBunny,
  'carry-clear': bridgeTanuki,
  'advanced-clear': berryCat,
  'challenge-clear': castleDog,
  'challenge-3': kingDragon,
  'melon-sweet': melonKid,
  'today-30': sunChick,
  'today-60': champLion,
  'correct-50': flowerButterfly,
  'correct-100': rainbowParrot,
  'correct-300': starFairy,
  'panda-3': roundPanda,
  'panda-5': chestRaccoon,
  'guardian-10': islandTurtle,
  'all-diff': seasonSpirit,
  'night-sky': astroBunny,
};

const ART_CAST: Partial<Record<ArtKind, () => string>> = {
  dino: sproutDragon,
  'dino-crown': crownDragon,
  'dino-cape': kingDragon,
  'dino-astro': astroBunny,
  'dino-heart': heartCat,
  'dino-wizard': starFairy,
  panda: roundPanda,
  rocket: mathRobot,
  rainbow: cloudSpirit,
  chest: chestRaccoon,
  trophy: prizeBird,
  flower: flowerButterfly,
  moon: astroBunny,
  sun: sunChick,
  heart: heartCat,
  mushroom: melonKid,
  butterfly: flowerButterfly,
  melon: melonKid,
  island: islandTurtle,
  star: starFairy,
  fireworks: fireFox,
  bridge: bridgeTanuki,
  castle: castleDog,
  medal: medalBear,
};

function ground(color = '#7dce4e'): string {
  return `<ellipse cx="100" cy="226" rx="72" ry="14" fill="${shade(color, -24)}"/><ellipse cx="100" cy="218" rx="66" ry="11" fill="${color}"/>`;
}

function eye(x: number, y: number, s = 1): string {
  return `
    <ellipse cx="${x}" cy="${y}" rx="${13 * s}" ry="${15 * s}" fill="#fff"/>
    <ellipse cx="${x + s}" cy="${y + 1.5 * s}" rx="${6.2 * s}" ry="${7.4 * s}" fill="#6b4226"/>
    <circle cx="${x + 4 * s}" cy="${y - 4 * s}" r="${3.1 * s}" fill="#fff"/>
    <circle cx="${x - 2.2 * s}" cy="${y + 4 * s}" r="${1.5 * s}" fill="#fff"/>
  `;
}

function blush(x: number, y: number): string {
  return `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#ff8eb5" opacity="0.95"/>`;
}

function smile(x: number, y: number, ink = '#5a3a28'): string {
  return `<path d="M${x - 11} ${y} Q${x} ${y + 12} ${x + 11} ${y}" fill="none" stroke="${ink}" stroke-width="3.2" stroke-linecap="round"/>`;
}

function face(x: number, y: number, gap = 18): string {
  return `${eye(x - gap, y)}${eye(x + gap, y)}${blush(x - gap - 16, y + 16)}${blush(x + gap + 16, y + 16)}${smile(x, y + 22)}`;
}

function sproutDragon(): string {
  return `${ground()}
    <ellipse cx="62" cy="78" rx="11" ry="16" fill="#ffb7d2"/>
    <ellipse cx="138" cy="78" rx="11" ry="16" fill="#ffb7d2"/>
    <path d="M100 58 Q112 36 100 24 Q88 36 100 58" fill="#3aaa4a"/>
    <ellipse cx="100" cy="168" rx="42" ry="34" fill="#7ddea0" stroke="#3f9a48" stroke-width="3"/>
    <ellipse cx="100" cy="176" rx="24" ry="18" fill="#fff6ea"/>
    <ellipse cx="72" cy="196" rx="14" ry="8" fill="#5cbf4a"/>
    <ellipse cx="128" cy="196" rx="14" ry="8" fill="#5cbf4a"/>
    <ellipse cx="52" cy="150" rx="12" ry="10" fill="#7ddea0"/>
    <ellipse cx="154" cy="132" rx="12" ry="10" fill="#7ddea0" transform="rotate(-24 154 132)"/>
    <ellipse cx="100" cy="108" rx="48" ry="42" fill="#7ddea0" stroke="#3f9a48" stroke-width="3"/>
    ${face(100, 104)}
    <ellipse cx="100" cy="126" rx="8" ry="5" fill="#ffd0a8"/>`;
}

function crownDragon(): string {
  return `${ground('#8ed15a')}
    <path d="M58 150 L40 210 L100 188 L160 210 L142 150 Z" fill="#e23d4a"/>
    <polygon points="62,92 76,62 90,88 100,48 110,88 124,62 138,92" fill="#ffd15c" stroke="#e09600" stroke-width="2"/>
    <ellipse cx="100" cy="172" rx="40" ry="32" fill="#ffe08a" stroke="#e0a020" stroke-width="3"/>
    <ellipse cx="100" cy="180" rx="22" ry="16" fill="#fff6ea"/>
    <ellipse cx="74" cy="198" rx="13" ry="8" fill="#e6b84a"/>
    <ellipse cx="126" cy="198" rx="13" ry="8" fill="#e6b84a"/>
    <ellipse cx="100" cy="112" rx="46" ry="40" fill="#ffe08a" stroke="#e0a020" stroke-width="3"/>
    ${face(100, 108)}`;
}

function kingDragon(): string {
  return `${ground('#6a4a98')}
    <path d="M48 146 L28 214 L100 190 L172 214 L152 146 Z" fill="#7a4ad0"/>
    <polygon points="70,86 82,60 94,82 100,46 106,82 118,60 130,86" fill="#ffd15c"/>
    <ellipse cx="100" cy="170" rx="40" ry="32" fill="#c9a6ff" stroke="#7a58c8" stroke-width="3"/>
    <ellipse cx="100" cy="178" rx="22" ry="16" fill="#fff"/>
    <ellipse cx="100" cy="114" rx="44" ry="38" fill="#c9a6ff" stroke="#7a58c8" stroke-width="3"/>
    ${face(100, 110)}
    <ellipse cx="74" cy="198" rx="12" ry="7" fill="#9b78e0"/>
    <ellipse cx="126" cy="198" rx="12" ry="7" fill="#9b78e0"/>`;
}

function medalBear(): string {
  return `${ground()}
    <circle cx="62" cy="92" r="18" fill="#c68642"/>
    <circle cx="138" cy="92" r="18" fill="#c68642"/>
    <circle cx="62" cy="92" r="9" fill="#f0c48a"/>
    <circle cx="138" cy="92" r="9" fill="#f0c48a"/>
    <ellipse cx="100" cy="176" rx="46" ry="34" fill="#e0a15a" stroke="#a86b32" stroke-width="3"/>
    <ellipse cx="100" cy="184" rx="26" ry="18" fill="#fff1dc"/>
    <circle cx="100" cy="168" r="16" fill="#ffd15c" stroke="#e09600" stroke-width="3"/>
    <path d="M100 160 l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#fff6c8"/>
    <ellipse cx="100" cy="112" rx="44" ry="38" fill="#e0a15a" stroke="#a86b32" stroke-width="3"/>
    ${face(100, 108, 16)}
    <ellipse cx="78" cy="202" rx="14" ry="8" fill="#c68642"/>
    <ellipse cx="122" cy="202" rx="14" ry="8" fill="#c68642"/>`;
}

function fireFox(): string {
  return `${ground()}
    <path d="M58 108 L40 52 L78 92 Z" fill="#ff8a2a"/>
    <path d="M142 108 L160 52 L122 92 Z" fill="#ff8a2a"/>
    <path d="M64 100 L52 64 L78 92 Z" fill="#ffd0a8"/>
    <path d="M136 100 L148 64 L122 92 Z" fill="#ffd0a8"/>
    <path d="M150 150 C186 120 188 188 150 196 C132 176 140 160 150 150" fill="#ff8a2a"/>
    <path d="M168 132 C184 112 196 128 180 146" fill="#ffe14a"/>
    <ellipse cx="100" cy="172" rx="40" ry="32" fill="#ff9a3c" stroke="#e06a14" stroke-width="3"/>
    <ellipse cx="100" cy="180" rx="22" ry="16" fill="#fff6ea"/>
    <ellipse cx="100" cy="114" rx="42" ry="36" fill="#ff9a3c" stroke="#e06a14" stroke-width="3"/>
    <ellipse cx="100" cy="128" rx="16" ry="10" fill="#fff"/>
    ${face(100, 108)}
    <ellipse cx="76" cy="198" rx="12" ry="7" fill="#e06a14"/>
    <ellipse cx="124" cy="198" rx="12" ry="7" fill="#e06a14"/>`;
}

function cloudSpirit(): string {
  return `${ground('#b7e6ff')}
    <ellipse cx="58" cy="150" rx="36" ry="28" fill="#fff"/>
    <ellipse cx="142" cy="146" rx="34" ry="26" fill="#fff"/>
    <ellipse cx="100" cy="168" rx="48" ry="34" fill="#fff" stroke="#d5e8f8" stroke-width="3"/>
    <ellipse cx="78" cy="118" rx="28" ry="22" fill="#fff"/>
    <ellipse cx="124" cy="116" rx="26" ry="20" fill="#fff"/>
    <ellipse cx="100" cy="108" rx="40" ry="34" fill="#f7fbff" stroke="#d5e8f8" stroke-width="3"/>
    ${face(100, 106, 15)}
    <ellipse cx="70" cy="198" rx="10" ry="8" fill="#ffd0e4"/>
    <ellipse cx="130" cy="198" rx="10" ry="8" fill="#ffd0e4"/>
    <circle cx="46" cy="132" r="8" fill="#9ad7ff"/>
    <circle cx="156" cy="128" r="7" fill="#ffb7d5"/>`;
}

function lightningDeer(): string {
  return `${ground()}
    <path d="M70 92 L62 48 L78 70 L86 40 L90 78" fill="none" stroke="#f0d2a0" stroke-width="5" stroke-linecap="round"/>
    <path d="M130 92 L138 48 L122 70 L114 40 L110 78" fill="none" stroke="#f0d2a0" stroke-width="5" stroke-linecap="round"/>
    <polygon points="150,70 162,98 146,96 156,124 132,90 148,92" fill="#ffe14a"/>
    <ellipse cx="100" cy="176" rx="36" ry="30" fill="#e7c39a" stroke="#c49a62" stroke-width="3"/>
    <ellipse cx="100" cy="118" rx="40" ry="34" fill="#f0d2a8" stroke="#c49a62" stroke-width="3"/>
    ${face(100, 114)}
    <ellipse cx="78" cy="202" rx="10" ry="6" fill="#c49a62"/>
    <ellipse cx="122" cy="202" rx="10" ry="6" fill="#c49a62"/>`;
}

function heartCat(): string {
  return `${ground()}
    <path d="M62 112 L74 70 L98 104 Z" fill="#ff8eb8"/>
    <path d="M138 112 L126 70 L102 104 Z" fill="#ff8eb8"/>
    <path d="M70 104 L78 80 L90 100 Z" fill="#ffd0e0"/>
    <path d="M130 104 L122 80 L110 100 Z" fill="#ffd0e0"/>
    <ellipse cx="100" cy="174" rx="40" ry="32" fill="#ffb7d0" stroke="#e07098" stroke-width="3"/>
    <path d="M100 156 l10 8 10-8 a12 12 0 0 1 0 18 l-20 16-20-16 a12 12 0 0 1 0-18z" fill="#ff5d8a"/>
    <ellipse cx="100" cy="116" rx="42" ry="36" fill="#ffc2d8" stroke="#e07098" stroke-width="3"/>
    ${face(100, 112)}
    <path d="M70 124 h-14 M130 124 h14 M72 132 h-10 M128 132 h10" stroke="#c45b78" stroke-width="2"/>
    <ellipse cx="76" cy="200" rx="12" ry="7" fill="#e07098"/>
    <ellipse cx="124" cy="200" rx="12" ry="7" fill="#e07098"/>`;
}

function mathRobot(): string {
  return `${ground('#9ecbff')}
    <rect x="92" y="42" width="6" height="18" rx="3" fill="#7aa0d0"/>
    <circle cx="95" cy="38" r="8" fill="#ffe14a"/>
    <rect x="58" y="62" width="84" height="72" rx="16" fill="#7eb6ff" stroke="#3d7ec8" stroke-width="4"/>
    <rect x="70" y="74" width="60" height="48" rx="8" fill="#eaf6ff"/>
    ${eye(86, 90, 0.62)}${eye(114, 90, 0.62)}
    <text x="100" y="116" text-anchor="middle" font-size="16" font-family="ui-rounded, sans-serif" fill="#2a6cb0" font-weight="700">1+1</text>
    <rect x="46" y="150" width="108" height="58" rx="16" fill="#5aa0f0" stroke="#2d74c8" stroke-width="4"/>
    <rect x="62" y="162" width="28" height="22" rx="6" fill="#ffe14a"/>
    <rect x="110" y="162" width="28" height="22" rx="6" fill="#ff8eb8"/>
    <text x="76" y="178" text-anchor="middle" font-size="14" fill="#6a4a10" font-weight="700">+</text>
    <text x="124" y="178" text-anchor="middle" font-size="14" fill="#6a2040" font-weight="700">=</text>
    <rect x="36" y="156" width="18" height="28" rx="8" fill="#7eb6ff"/>
    <rect x="146" y="156" width="18" height="28" rx="8" fill="#7eb6ff"/>
    <circle cx="45" cy="190" r="8" fill="#fff"/>
    <circle cx="155" cy="190" r="8" fill="#fff"/>
    <rect x="70" y="206" width="22" height="12" rx="4" fill="#3d7ec8"/>
    <rect x="108" y="206" width="22" height="12" rx="4" fill="#3d7ec8"/>
    ${blush(78, 128)}${blush(122, 128)}`;
}

function starPenguin(): string {
  return `${ground('#d7ecff')}
    <polygon points="148,70 156,90 178,92 160,106 166,128 148,114 130,128 136,106 118,92 140,90" fill="#ffe14a"/>
    <ellipse cx="100" cy="168" rx="40" ry="46" fill="#2a3348"/>
    <ellipse cx="100" cy="176" rx="26" ry="34" fill="#fff"/>
    <ellipse cx="100" cy="108" rx="36" ry="32" fill="#2a3348"/>
    ${face(100, 104, 14)}
    <polygon points="100,128 88,140 112,140" fill="#ff9a3c"/>
    <ellipse cx="62" cy="168" rx="12" ry="22" fill="#2a3348" transform="rotate(18 62 168)"/>
    <ellipse cx="138" cy="168" rx="12" ry="22" fill="#2a3348" transform="rotate(-18 138 168)"/>
    <ellipse cx="82" cy="210" rx="14" ry="8" fill="#ff9a3c"/>
    <ellipse cx="118" cy="210" rx="14" ry="8" fill="#ff9a3c"/>`;
}

function prizeBird(): string {
  return `${ground()}
    <rect x="70" y="196" width="60" height="16" rx="4" fill="#e0a24a"/>
    <rect x="82" y="184" width="36" height="16" rx="4" fill="#ffd15c"/>
    <ellipse cx="148" cy="150" rx="22" ry="14" fill="#7ad0ff"/>
    <ellipse cx="52" cy="150" rx="22" ry="14" fill="#ffb7d5"/>
    <ellipse cx="100" cy="156" rx="32" ry="28" fill="#ffe14a" stroke="#e0a818" stroke-width="3"/>
    <ellipse cx="100" cy="108" rx="30" ry="26" fill="#ffe56a" stroke="#e0a818" stroke-width="3"/>
    <polygon points="128,112 156,104 128,124" fill="#ff9a3c"/>
    ${face(96, 104, 12)}
    <ellipse cx="86" cy="186" rx="8" ry="5" fill="#e09600"/>
    <ellipse cx="114" cy="186" rx="8" ry="5" fill="#e09600"/>`;
}

function cheerPanda(): string {
  return `${ground()}
    <circle cx="62" cy="84" r="16" fill="#2a2a2a"/>
    <circle cx="138" cy="84" r="16" fill="#2a2a2a"/>
    <ellipse cx="100" cy="176" rx="44" ry="32" fill="#fff" stroke="#2a2a2a" stroke-width="3"/>
    <ellipse cx="70" cy="168" rx="14" ry="16" fill="#2a2a2a"/>
    <ellipse cx="130" cy="168" rx="14" ry="16" fill="#2a2a2a"/>
    <path d="M78 150 l8 10 8-10 a10 10 0 0 1 0 14 l-16 12-16-12 a10 10 0 0 1 0-14z" fill="#ff5d8a"/>
    <ellipse cx="100" cy="112" rx="42" ry="36" fill="#fff" stroke="#2a2a2a" stroke-width="3"/>
    <ellipse cx="82" cy="112" rx="14" ry="16" fill="#2a2a2a"/>
    <ellipse cx="118" cy="112" rx="14" ry="16" fill="#2a2a2a"/>
    ${eye(82, 112, 0.72)}${eye(118, 112, 0.72)}
    ${blush(64, 126)}${blush(136, 126)}${smile(100, 128)}
    <ellipse cx="78" cy="202" rx="14" ry="8" fill="#2a2a2a"/>
    <ellipse cx="122" cy="202" rx="14" ry="8" fill="#2a2a2a"/>`;
}

function roundPanda(): string {
  return `${ground()}
    <circle cx="64" cy="78" r="18" fill="#2a2a2a"/>
    <circle cx="136" cy="78" r="18" fill="#2a2a2a"/>
    <ellipse cx="100" cy="160" rx="52" ry="48" fill="#fff" stroke="#2a2a2a" stroke-width="3"/>
    <ellipse cx="100" cy="176" rx="28" ry="22" fill="#f4f4f4"/>
    <ellipse cx="72" cy="168" rx="12" ry="14" fill="#2a2a2a"/>
    <ellipse cx="128" cy="168" rx="12" ry="14" fill="#2a2a2a"/>
    <ellipse cx="82" cy="132" rx="16" ry="18" fill="#2a2a2a"/>
    <ellipse cx="118" cy="132" rx="16" ry="18" fill="#2a2a2a"/>
    ${eye(82, 132, 0.78)}${eye(118, 132, 0.78)}
    ${blush(62, 150)}${blush(138, 150)}${smile(100, 152)}
    <ellipse cx="78" cy="204" rx="16" ry="9" fill="#2a2a2a"/>
    <ellipse cx="122" cy="204" rx="16" ry="9" fill="#2a2a2a"/>`;
}

function grassBunny(): string {
  return `${ground('#63c84a')}
    <ellipse cx="72" cy="62" rx="14" ry="36" fill="#fff" stroke="#d5e4ea" stroke-width="2"/>
    <ellipse cx="128" cy="62" rx="14" ry="36" fill="#fff" stroke="#d5e4ea" stroke-width="2"/>
    <ellipse cx="72" cy="66" rx="6" ry="22" fill="#ffd0e0"/>
    <ellipse cx="128" cy="66" rx="6" ry="22" fill="#ffd0e0"/>
    <path d="M100 78 Q108 62 100 52 Q92 62 100 78" fill="#3aaa4a"/>
    <ellipse cx="100" cy="174" rx="40" ry="32" fill="#fff" stroke="#d0e0ea" stroke-width="3"/>
    <ellipse cx="100" cy="116" rx="42" ry="36" fill="#fff" stroke="#d0e0ea" stroke-width="3"/>
    ${face(100, 112)}
    <ellipse cx="78" cy="200" rx="12" ry="7" fill="#ffd0e0"/>
    <ellipse cx="122" cy="200" rx="12" ry="7" fill="#ffd0e0"/>`;
}

function bridgeTanuki(): string {
  return `${ground('#e0b06a')}
    <path d="M40 200 Q70 176 100 188 Q130 176 160 200" fill="none" stroke="#c48958" stroke-width="8"/>
    <ellipse cx="150" cy="150" rx="22" ry="16" fill="#d89a4a"/>
    <path d="M156 146 h16 M156 154 h14 M156 162 h10" stroke="#8a5a28" stroke-width="2"/>
    <ellipse cx="100" cy="168" rx="40" ry="30" fill="#e0a85a" stroke="#b07830" stroke-width="3"/>
    <ellipse cx="100" cy="176" rx="22" ry="16" fill="#fff1dc"/>
    <ellipse cx="100" cy="114" rx="40" ry="34" fill="#f0c07a" stroke="#b07830" stroke-width="3"/>
    <ellipse cx="70" cy="96" rx="10" ry="8" fill="#8a5a28"/>
    <ellipse cx="130" cy="96" rx="10" ry="8" fill="#8a5a28"/>
    ${face(100, 110)}
    <ellipse cx="78" cy="196" rx="12" ry="7" fill="#b07830"/>
    <ellipse cx="122" cy="196" rx="12" ry="7" fill="#b07830"/>`;
}

function berryCat(): string {
  return `${ground()}
    <ellipse cx="100" cy="62" rx="28" ry="24" fill="#ff4d6a"/>
    <circle cx="90" cy="54" r="2" fill="#fff"/>
    <circle cx="102" cy="48" r="2" fill="#fff"/>
    <circle cx="112" cy="58" r="2" fill="#fff"/>
    <circle cx="96" cy="66" r="2" fill="#fff"/>
    <path d="M92 42 Q100 28 108 40 Q100 36 92 42" fill="#3aaa4a"/>
    <path d="M64 118 L76 78 L100 110 Z" fill="#fff"/>
    <path d="M136 118 L124 78 L100 110 Z" fill="#fff"/>
    <path d="M72 108 L80 86 L92 106 Z" fill="#ffd0e0"/>
    <path d="M128 108 L120 86 L108 106 Z" fill="#ffd0e0"/>
    <ellipse cx="100" cy="176" rx="40" ry="30" fill="#fff" stroke="#f0c2d0" stroke-width="3"/>
    <ellipse cx="100" cy="122" rx="40" ry="32" fill="#fff7fb" stroke="#f0c2d0" stroke-width="3"/>
    ${face(100, 118)}
    <path d="M68 130 h-12 M132 130 h12" stroke="#e07098" stroke-width="2"/>
    <ellipse cx="78" cy="200" rx="12" ry="7" fill="#ffb7d0"/>
    <ellipse cx="122" cy="200" rx="12" ry="7" fill="#ffb7d0"/>`;
}

function castleDog(): string {
  return `${ground()}
    <path d="M78 70 h8 v-16 h8 v16 h12 v-16 h8 v16 h8 v18 H78 Z" fill="#c9b6ff" stroke="#7a68c0" stroke-width="2"/>
    <ellipse cx="58" cy="130" rx="16" ry="22" fill="#f0d2a8" transform="rotate(16 58 130)"/>
    <ellipse cx="142" cy="130" rx="16" ry="22" fill="#f0d2a8" transform="rotate(-16 142 130)"/>
    <ellipse cx="100" cy="174" rx="42" ry="32" fill="#f4d7b0" stroke="#d0a878" stroke-width="3"/>
    <ellipse cx="100" cy="118" rx="40" ry="34" fill="#ffe4c4" stroke="#d0a878" stroke-width="3"/>
    <ellipse cx="100" cy="132" rx="14" ry="9" fill="#e08a6a"/>
    ${face(100, 112)}
    <ellipse cx="78" cy="200" rx="13" ry="7" fill="#e0b888"/>
    <ellipse cx="122" cy="200" rx="13" ry="7" fill="#e0b888"/>`;
}

function melonKid(): string {
  return `${ground()}
    <circle cx="100" cy="132" r="62" fill="#ff5d6e" stroke="#3aaa4a" stroke-width="8"/>
    <path d="M48 110 Q100 96 152 110" fill="#3aaa4a"/>
    <path d="M70 78 Q100 48 130 78 Q100 64 70 78" fill="#5cbf4a"/>
    <path d="M100 70 v-22" stroke="#2f8a3a" stroke-width="4"/>
    ${eye(78, 128, 0.9)}${eye(122, 128, 0.9)}
    ${blush(62, 146)}${blush(138, 146)}${smile(100, 150)}
    <ellipse cx="46" cy="150" rx="12" ry="8" fill="#ff8fa0"/>
    <ellipse cx="154" cy="150" rx="12" ry="8" fill="#ff8fa0"/>
    <ellipse cx="78" cy="196" rx="12" ry="8" fill="#3aaa4a"/>
    <ellipse cx="122" cy="196" rx="12" ry="8" fill="#3aaa4a"/>`;
}

function sunChick(): string {
  return `${ground()}
    <g stroke="#ffe14a" stroke-width="6" stroke-linecap="round">
      <path d="M100 28 v16 M62 48 l12 12 M138 48 l-12 12 M48 88 h16 M152 88 h-16"/>
    </g>
    <circle cx="100" cy="78" r="18" fill="#ffe56a"/>
    <ellipse cx="100" cy="170" rx="40" ry="34" fill="#ffe14a" stroke="#e0a818" stroke-width="3"/>
    <ellipse cx="100" cy="118" rx="36" ry="30" fill="#fff1a0" stroke="#e0a818" stroke-width="3"/>
    <polygon points="118,124 146,118 118,136" fill="#ff9a3c"/>
    ${face(96, 112, 13)}
    <ellipse cx="84" cy="200" rx="12" ry="7" fill="#ff9a3c"/>
    <ellipse cx="116" cy="200" rx="12" ry="7" fill="#ff9a3c"/>`;
}

function champLion(): string {
  return `${ground()}
    <circle cx="100" cy="118" r="58" fill="#ffb703"/>
    <circle cx="100" cy="118" r="40" fill="#ffe08a" stroke="#e09600" stroke-width="3"/>
    <polygon points="78,62 88,40 98,64 100,36 108,64 118,40 128,62" fill="#ffd15c"/>
    <ellipse cx="100" cy="186" rx="36" ry="26" fill="#ffe08a" stroke="#e09600" stroke-width="3"/>
    ${face(100, 112, 14)}
    <ellipse cx="82" cy="208" rx="12" ry="7" fill="#e09600"/>
    <ellipse cx="118" cy="208" rx="12" ry="7" fill="#e09600"/>`;
}

function flowerButterfly(): string {
  return `${ground()}
    <ellipse cx="62" cy="120" rx="36" ry="28" fill="#ff8eb8" transform="rotate(-20 62 120)"/>
    <ellipse cx="138" cy="120" rx="36" ry="28" fill="#7ad0ff" transform="rotate(20 138 120)"/>
    <ellipse cx="70" cy="156" rx="26" ry="20" fill="#ffe14a" transform="rotate(16 70 156)"/>
    <ellipse cx="130" cy="156" rx="26" ry="20" fill="#b48cff" transform="rotate(-16 130 156)"/>
    <ellipse cx="100" cy="140" rx="16" ry="28" fill="#7d6a4a"/>
    <path d="M92 108 Q80 78 96 96 M108 108 Q120 78 104 96" fill="none" stroke="#5a3a28" stroke-width="2"/>
    <circle cx="80" cy="72" r="4" fill="#ff8eb8"/>
    <circle cx="120" cy="72" r="4" fill="#7ad0ff"/>
    ${eye(92, 132, 0.62)}${eye(108, 132, 0.62)}
    ${smile(100, 146)}
    <circle cx="46" cy="96" r="8" fill="#ffb7d5"/>
    <circle cx="154" cy="100" r="7" fill="#fff"/>`;
}

function rainbowParrot(): string {
  return `${ground()}
    <path d="M48 150 Q20 110 48 100 Q36 130 48 150" fill="#ff5d6e"/>
    <path d="M52 160 Q18 150 40 128" fill="#ffe14a"/>
    <path d="M54 170 Q28 176 46 150" fill="#7ddea0"/>
    <path d="M56 178 Q40 196 60 168" fill="#7ec8ff"/>
    <ellipse cx="108" cy="156" rx="36" ry="30" fill="#7ddea0" stroke="#3aaa4a" stroke-width="3"/>
    <ellipse cx="112" cy="108" rx="32" ry="28" fill="#9be07a" stroke="#3aaa4a" stroke-width="3"/>
    <path d="M136 112 Q172 104 168 128 Q150 122 136 124 Z" fill="#ff9a3c"/>
    ${face(108, 104, 12)}
    <ellipse cx="96" cy="196" rx="10" ry="6" fill="#e09600"/>
    <ellipse cx="120" cy="196" rx="10" ry="6" fill="#e09600"/>`;
}

function starFairy(): string {
  return `${ground('#c9b6ff')}
    <ellipse cx="52" cy="130" rx="28" ry="16" fill="#ffe9a8" opacity="0.95" transform="rotate(-28 52 130)"/>
    <ellipse cx="148" cy="130" rx="28" ry="16" fill="#ffe9a8" opacity="0.95" transform="rotate(28 148 130)"/>
    <ellipse cx="46" cy="142" rx="16" ry="8" fill="#fff" transform="rotate(-28 46 142)"/>
    <ellipse cx="154" cy="142" rx="16" ry="8" fill="#fff" transform="rotate(28 154 142)"/>
    <path d="M78 150 L100 210 L122 150 Z" fill="#ffb7e0"/>
    <path d="M86 156 L100 200 L114 156 Z" fill="#fff"/>
    <ellipse cx="100" cy="118" rx="28" ry="26" fill="#ffe0b8" stroke="#f0c090" stroke-width="2"/>
    <path d="M74 100 Q86 70 100 92 Q114 68 126 100 Q100 84 74 100" fill="#ffe14a"/>
    ${face(100, 116, 12)}
    <path d="M132 168 l28 -8" stroke="#e0a818" stroke-width="3"/>
    <polygon points="164,150 170,164 184,166 172,176 176,190 164,182 152,190 156,176 144,166 158,164" fill="#ffe14a"/>`;
}

function chestRaccoon(): string {
  return `${ground()}
    <rect x="132" y="150" width="36" height="28" rx="4" fill="#e08a3a" stroke="#c56a22" stroke-width="2"/>
    <rect x="132" y="146" width="36" height="10" rx="3" fill="#ffd15c"/>
    <path d="M150 146 v-8" stroke="#c56a22" stroke-width="2"/>
    <ellipse cx="96" cy="172" rx="40" ry="30" fill="#d8d2cc" stroke="#8a8680" stroke-width="3"/>
    <ellipse cx="96" cy="116" rx="40" ry="34" fill="#eee" stroke="#8a8680" stroke-width="3"/>
    <ellipse cx="78" cy="118" rx="14" ry="10" fill="#5a534c"/>
    <ellipse cx="114" cy="118" rx="14" ry="10" fill="#5a534c"/>
    <ellipse cx="70" cy="96" rx="12" ry="10" fill="#c8c2bc"/>
    <ellipse cx="122" cy="96" rx="12" ry="10" fill="#c8c2bc"/>
    ${face(96, 112)}
    <ellipse cx="150" cy="168" rx="16" ry="12" fill="#b0aaa4"/>
    <path d="M156 164 h12 M156 172 h10" stroke="#5a534c" stroke-width="2"/>
    <ellipse cx="78" cy="200" rx="12" ry="7" fill="#8a8680"/>
    <ellipse cx="114" cy="200" rx="12" ry="7" fill="#8a8680"/>`;
}

function islandTurtle(): string {
  return `${ground('#5cba3c')}
    <ellipse cx="100" cy="156" rx="62" ry="40" fill="#3e9a4a" stroke="#2a6e34" stroke-width="3"/>
    <path d="M70 140 h60 M70 156 h60 M70 172 h60 M88 124 v64 M112 124 v64" stroke="#2a6e34" stroke-width="3"/>
    <ellipse cx="100" cy="108" rx="28" ry="24" fill="#8fd48a" stroke="#2a6e34" stroke-width="3"/>
    ${face(100, 106, 11)}
    <ellipse cx="40" cy="168" rx="16" ry="10" fill="#6dce70"/>
    <ellipse cx="160" cy="168" rx="16" ry="10" fill="#6dce70"/>
    <ellipse cx="70" cy="198" rx="16" ry="10" fill="#6dce70"/>
    <ellipse cx="130" cy="198" rx="16" ry="10" fill="#6dce70"/>`;
}

function seasonSpirit(): string {
  return `${ground()}
    <ellipse cx="48" cy="140" rx="22" ry="14" fill="#ffb7d5" transform="rotate(-30 48 140)"/>
    <ellipse cx="152" cy="140" rx="22" ry="14" fill="#7ec8ff" transform="rotate(30 152 140)"/>
    <path d="M72 148 L100 214 L128 148 Z" fill="#ffe14a"/>
    <path d="M80 154 L100 200 L120 154 Z" fill="#7ddea0"/>
    <path d="M88 160 L100 188 L112 160 Z" fill="#ff8eb8"/>
    <ellipse cx="100" cy="116" rx="30" ry="26" fill="#fff6ea" stroke="#f0d0b0" stroke-width="2"/>
    <path d="M74 104 Q100 72 126 104 Q100 90 74 104" fill="#c9a6ff"/>
    ${face(100, 114, 12)}
    <circle cx="36" cy="118" r="6" fill="#ff8eb8"/>
    <circle cx="164" cy="120" r="6" fill="#ffe14a"/>`;
}

function astroBunny(): string {
  return `${ground('#6b6bb5')}
    <ellipse cx="78" cy="48" rx="12" ry="28" fill="#fff"/>
    <ellipse cx="122" cy="48" rx="12" ry="28" fill="#fff"/>
    <ellipse cx="78" cy="52" rx="5" ry="16" fill="#ffd0e0"/>
    <ellipse cx="122" cy="52" rx="5" ry="16" fill="#ffd0e0"/>
    <circle cx="100" cy="108" r="46" fill="#e8f4ff" stroke="#9ecbff" stroke-width="5"/>
    <path d="M58 108 Q100 70 142 108" fill="#d7ecff" opacity="0.65"/>
    ${face(100, 112, 15)}
    <rect x="62" y="156" width="76" height="52" rx="18" fill="#5aa0f0" stroke="#2d74c8" stroke-width="3"/>
    <circle cx="100" cy="180" r="10" fill="#ffe14a"/>
    <rect x="40" y="164" width="22" height="16" rx="8" fill="#7eb6ff"/>
    <rect x="138" y="164" width="22" height="16" rx="8" fill="#7eb6ff"/>
    <ellipse cx="82" cy="210" rx="12" ry="7" fill="#2d74c8"/>
    <ellipse cx="118" cy="210" rx="12" ry="7" fill="#2d74c8"/>`;
}

function shade(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  const num = Number.parseInt(raw, 16);
  const channel = (shift: number) => Math.max(0, Math.min(255, ((num >> shift) & 255) + amount));
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`;
}
