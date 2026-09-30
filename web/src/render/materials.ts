import {
  BackSide,
  CanvasTexture,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';

const cache = new Map<string, MeshStandardMaterial>();

export function mat(color: number, roughness = 0.46, metalness = 0.04, emissive = 0): MeshStandardMaterial {
  const key = `${color.toString(16)}-${roughness}-${metalness}-${emissive.toString(16)}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const material = new MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity: emissive ? 0.28 : 0,
  });
  cache.set(key, material);
  return material;
}

export const outlineMaterial = new MeshBasicMaterial({ color: 0x2c241c, side: BackSide });

export function addOutline(mesh: Mesh, amount = 0.065): void {
  const shell = new Mesh(mesh.geometry, outlineMaterial);
  shell.scale.setScalar(1 + amount);
  shell.castShadow = false;
  shell.receiveShadow = false;
  shell.raycast = () => undefined;
  mesh.add(shell);
  mesh.castShadow = true;
}

export function makeSkyTexture(stops: { at: number; color: string }[]): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    for (const stop of stops) gradient.addColorStop(stop.at, stop.color);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 512);
    const glow = context.createRadialGradient(8, 80, 2, 8, 90, 70);
    glow.addColorStop(0, 'rgba(255,255,255,0.55)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, 16, 220);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function softCircleTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const glow = context.createRadialGradient(32, 32, 2, 32, 32, 30);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.35, 'rgba(255,244,190,0.9)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, 64, 64);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function discTexture(label: string, kind: 'gold' | 'stone' | 'gold-star'): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    const gold = kind !== 'stone';
    const gradient = context.createRadialGradient(96, 84, 20, 128, 128, 120);
    gradient.addColorStop(0, gold ? '#fff6c4' : '#ffffff');
    gradient.addColorStop(0.55, gold ? '#ffd34a' : '#e7eef6');
    gradient.addColorStop(1, gold ? '#f0a020' : '#c5d0dc');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(128, 128, 120, 0, Math.PI * 2);
    context.fill();
    context.lineWidth = 10;
    context.strokeStyle = gold ? '#fffaf0' : '#ffffff';
    context.stroke();
    context.fillStyle = gold ? '#fffaf0' : '#5d6e82';
    context.font = '800 128px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, 128, kind === 'gold-star' ? 136 : 138);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function podiumFace(label: string, color: number): MeshStandardMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const material = new MeshStandardMaterial({ roughness: 0.32, metalness: 0.22 });
  if (!context) return material;
  const hex = `#${new Color(color).getHexString()}`;
  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#fff6d2');
  gradient.addColorStop(0.45, hex);
  gradient.addColorStop(1, hex);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  context.fillStyle = '#fffaf0';
  context.font = '800 150px "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 128, 142);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  material.map = texture;
  material.color.set(0xffffff);
  return material;
}
