import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type Material,
} from 'three';

export function clay(
  color: number,
  options: { roughness?: number; metalness?: number; emissive?: number; intensity?: number } = {},
): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.52,
    metalness: options.metalness ?? 0.03,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.intensity ?? (options.emissive ? 0.22 : 0),
  });
}

export interface DinoRig {
  group: Group;
  waveArm: Group;
}

export function createDino(options: { cape?: boolean; cheer?: boolean } = {}): DinoRig {
  const group = new Group();
  const green = clay(0x6ed84a, { roughness: 0.4 });
  const greenDeep = clay(0x49b836, { roughness: 0.48 });
  const belly = clay(0xffe3a1, { roughness: 0.58 });
  const spike = clay(0xff9628, { roughness: 0.38 });
  const white = clay(0xffffff, { roughness: 0.28 });
  const ink = clay(0x243044, { roughness: 0.35 });
  const mouth = clay(0xe85b6c, { roughness: 0.42 });
  const blush = clay(0xff8eaa, { roughness: 0.6 });

  const body = new Mesh(new SphereGeometry(0.4, 28, 20), green);
  body.scale.set(1.08, 0.92, 0.9);
  body.position.y = 0.5;
  body.castShadow = true;
  group.add(body);

  const tummy = new Mesh(new SphereGeometry(0.28, 22, 16), belly);
  tummy.scale.set(0.86, 0.95, 0.48);
  tummy.position.set(0, 0.44, 0.24);
  group.add(tummy);

  const head = new Mesh(new SphereGeometry(0.4, 28, 20), green);
  head.position.set(0, 1.02, 0.06);
  head.castShadow = true;
  group.add(head);

  const snout = new Mesh(new SphereGeometry(0.18, 18, 14), green);
  snout.scale.set(1.15, 0.72, 1.2);
  snout.position.set(0, 0.9, 0.36);
  group.add(snout);

  const smile = new Mesh(new TorusGeometry(0.09, 0.022, 8, 18, Math.PI), ink);
  smile.position.set(0, 0.84, 0.48);
  smile.rotation.x = Math.PI / 2.15;
  smile.rotation.z = Math.PI;
  group.add(smile);

  const mouthBall = new Mesh(new SphereGeometry(0.055, 12, 10), mouth);
  mouthBall.scale.set(1.4, 0.55, 0.45);
  mouthBall.position.set(0, 0.835, 0.46);
  group.add(mouthBall);

  const tooth = new Mesh(new BoxGeometry(0.03, 0.035, 0.02), white);
  tooth.position.set(0.03, 0.855, 0.5);
  group.add(tooth);

  for (const side of [-1, 1]) {
    const eye = new Mesh(new SphereGeometry(0.085, 16, 12), white);
    eye.position.set(side * 0.15, 1.08, 0.3);
    group.add(eye);
    const pupil = new Mesh(new SphereGeometry(0.042, 12, 10), ink);
    pupil.position.set(side * 0.155, 1.065, 0.37);
    group.add(pupil);
    const glint = new Mesh(new SphereGeometry(0.016, 8, 8), white);
    glint.position.set(side * 0.17, 1.09, 0.4);
    group.add(glint);
    const cheek = new Mesh(new SphereGeometry(0.045, 10, 8), blush);
    cheek.position.set(side * 0.24, 0.96, 0.28);
    cheek.scale.z = 0.55;
    group.add(cheek);
    const nostril = new Mesh(new SphereGeometry(0.018, 8, 6), greenDeep);
    nostril.position.set(side * 0.06, 0.92, 0.52);
    group.add(nostril);
  }

  const spikeGeo = new ConeGeometry(0.085, 0.2, 8);
  const spikeSpots: [number, number, number, number][] = [
    [0, 1.38, 0.02, 1],
    [0, 1.16, -0.26, 0.85],
    [0, 0.86, -0.3, 0.75],
    [0, 0.58, -0.28, 0.65],
  ];
  for (const [x, y, z, scale] of spikeSpots) {
    const horn = new Mesh(spikeGeo, spike);
    horn.position.set(x, y, z);
    horn.scale.setScalar(scale);
    horn.castShadow = true;
    group.add(horn);
  }

  const waveArm = makeArm(green, -1);
  const otherArm = makeArm(green, 1);
  group.add(waveArm, otherArm);
  if (options.cheer) {
    waveArm.rotation.z = 1.15;
    waveArm.rotation.x = -0.15;
    otherArm.rotation.z = -1.15;
    otherArm.rotation.x = -0.15;
  } else {
    waveArm.rotation.z = 0.35;
    otherArm.rotation.z = -0.25;
  }

  for (const side of [-1, 1]) {
    const leg = new Mesh(new CylinderGeometry(0.075, 0.09, 0.22, 10), greenDeep);
    leg.position.set(side * 0.16, 0.16, 0.04);
    leg.castShadow = true;
    group.add(leg);
    const foot = new Mesh(new SphereGeometry(0.09, 12, 10), green);
    foot.scale.set(1.15, 0.55, 1.35);
    foot.position.set(side * 0.16, 0.05, 0.1);
    group.add(foot);
  }

  const tail = new Mesh(new SphereGeometry(0.14, 14, 12), green);
  tail.scale.set(0.9, 0.75, 1.45);
  tail.position.set(0, 0.42, -0.46);
  tail.castShadow = true;
  group.add(tail);
  const tailTip = new Mesh(new SphereGeometry(0.08, 12, 10), green);
  tailTip.position.set(0, 0.4, -0.66);
  group.add(tailTip);

  if (options.cape) {
    const cape = new Mesh(new BoxGeometry(0.62, 0.62, 0.04), clay(0xe23d3d, { roughness: 0.45 }));
    cape.position.set(0, 0.72, -0.28);
    cape.rotation.x = 0.18;
    cape.castShadow = true;
    group.add(cape);
    const collar = new Mesh(new TorusGeometry(0.16, 0.035, 8, 16), clay(0xffd15c, { metalness: 0.3, roughness: 0.35 }));
    collar.position.set(0, 0.95, -0.08);
    collar.rotation.x = Math.PI / 2;
    group.add(collar);
  }

  return { group, waveArm };
}

function makeArm(material: MeshStandardMaterial, side: number): Group {
  const pivot = new Group();
  pivot.position.set(side * 0.38, 0.62, 0.06);
  const arm = new Mesh(new SphereGeometry(0.1, 14, 12), material);
  arm.scale.set(0.78, 1.35, 0.78);
  arm.position.y = -0.12;
  arm.castShadow = true;
  pivot.add(arm);
  const hand = new Mesh(new SphereGeometry(0.07, 10, 8), material);
  hand.position.y = -0.26;
  pivot.add(hand);
  return pivot;
}

export interface ChestRig {
  group: Group;
  lid: Group;
}

export function createChest(): ChestRig {
  const group = new Group();
  const wood = clay(0xd0893a, { roughness: 0.55 });
  const woodDark = clay(0xa86528, { roughness: 0.6 });
  const gold = clay(0xf2c84b, { metalness: 0.45, roughness: 0.28, emissive: 0xffc94a, intensity: 0.12 });

  const body = new Mesh(new BoxGeometry(0.62, 0.36, 0.42), wood);
  body.position.y = 0.18;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const band = new Mesh(new BoxGeometry(0.64, 0.08, 0.44), gold);
  band.position.y = 0.2;
  group.add(band);
  const lock = new Mesh(new BoxGeometry(0.1, 0.12, 0.04), gold);
  lock.position.set(0, 0.22, 0.22);
  group.add(lock);

  const lid = new Group();
  lid.position.set(0, 0.36, -0.2);
  const lidBox = new Mesh(new BoxGeometry(0.64, 0.14, 0.44), woodDark);
  lidBox.position.set(0, 0.05, 0.2);
  lidBox.castShadow = true;
  lid.add(lidBox);
  const lidBand = new Mesh(new BoxGeometry(0.66, 0.05, 0.1), gold);
  lidBand.position.set(0, 0.1, 0.2);
  lid.add(lidBand);
  group.add(lid);

  return { group, lid };
}

export function createPalm(): Group {
  const group = new Group();
  const trunkMat = clay(0xc68642, { roughness: 0.72 });
  const leafMat = clay(0x37b14a, { roughness: 0.5 });
  const trunk = new Mesh(new CylinderGeometry(0.055, 0.09, 0.85, 8), trunkMat);
  trunk.position.y = 0.42;
  trunk.rotation.z = 0.08;
  trunk.castShadow = true;
  group.add(trunk);
  for (let i = 0; i < 6; i += 1) {
    const leaf = new Mesh(new SphereGeometry(0.26, 10, 8), leafMat);
    leaf.scale.set(0.28, 0.1, 1);
    const angle = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.28, 0.9, Math.sin(angle) * 0.28);
    leaf.rotation.y = -angle;
    leaf.rotation.z = 0.55;
    leaf.castShadow = true;
    group.add(leaf);
  }
  const coconut = new Mesh(new SphereGeometry(0.055, 8, 8), clay(0x8d5a32));
  coconut.position.set(0.06, 0.78, 0.05);
  group.add(coconut);
  return group;
}

export function createFlower(color: number): Group {
  const group = new Group();
  const stem = new Mesh(new CylinderGeometry(0.012, 0.014, 0.16, 6), clay(0x3d9a40));
  stem.position.y = 0.08;
  group.add(stem);
  for (let i = 0; i < 5; i += 1) {
    const petal = new Mesh(new SphereGeometry(0.035, 8, 6), clay(color));
    const angle = (i / 5) * Math.PI * 2;
    petal.position.set(Math.cos(angle) * 0.04, 0.17, Math.sin(angle) * 0.04);
    petal.scale.set(1, 0.7, 0.7);
    group.add(petal);
  }
  const center = new Mesh(new SphereGeometry(0.022, 8, 6), clay(0xffe08a));
  center.position.set(0, 0.18, 0.02);
  group.add(center);
  return group;
}

export function createCloud(): Group {
  const group = new Group();
  const material = clay(0xffffff, { roughness: 0.92, metalness: 0 });
  const puffs: [number, number, number, number][] = [
    [0, 0, 0, 0.36],
    [0.32, -0.05, 0.02, 0.26],
    [-0.3, -0.04, 0, 0.24],
    [0.08, 0.12, -0.02, 0.22],
  ];
  for (const [x, y, z, radius] of puffs) {
    const puff = new Mesh(new SphereGeometry(radius, 14, 10), material);
    puff.position.set(x, y, z);
    group.add(puff);
  }
  return group;
}

export function createPanda(): Group {
  const group = new Group();
  const white = clay(0xfbfbfb, { roughness: 0.5 });
  const black = clay(0x2a2a2a, { roughness: 0.42 });
  const body = new Mesh(new SphereGeometry(0.26, 18, 14), white);
  body.scale.set(1, 0.86, 0.82);
  body.position.y = 0.2;
  body.castShadow = true;
  group.add(body);
  const head = new Mesh(new SphereGeometry(0.2, 18, 14), white);
  head.position.y = 0.48;
  group.add(head);
  for (const side of [-1, 1]) {
    const ear = new Mesh(new SphereGeometry(0.07, 10, 8), black);
    ear.position.set(side * 0.15, 0.66, 0);
    group.add(ear);
    const patch = new Mesh(new SphereGeometry(0.065, 10, 8), black);
    patch.scale.set(1.05, 1.2, 0.35);
    patch.position.set(side * 0.08, 0.5, 0.15);
    group.add(patch);
    const eye = new Mesh(new SphereGeometry(0.02, 8, 8), white);
    eye.position.set(side * 0.08, 0.51, 0.185);
    group.add(eye);
    const arm = new Mesh(armGeometry(), black);
    arm.position.set(side * 0.22, 0.38, 0.06);
    arm.rotation.z = side * -0.9;
    group.add(arm);
  }
  const nose = new Mesh(new SphereGeometry(0.03, 8, 8), black);
  nose.scale.set(1.1, 0.8, 0.8);
  nose.position.set(0, 0.44, 0.18);
  group.add(nose);
  return group;
}

function armGeometry(): BufferGeometry {
  return new SphereGeometry(0.055, 10, 8).scale(0.7, 1.5, 0.7);
}

export function createStarMesh(): Mesh {
  const shape = new Shape();
  const spikes = 5;
  const outer = 0.26;
  const inner = 0.11;
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.016,
    bevelSegments: 1,
  });
  geometry.center();
  const mesh = new Mesh(geometry, clay(0xffd34a, { metalness: 0.4, roughness: 0.28, emissive: 0xffc107, intensity: 0.25 }));
  mesh.castShadow = true;
  return mesh;
}

export function createLabeledStone(label: string, kind: 'gold' | 'stone'): Mesh {
  const top = discTexture(label, kind);
  const side = kind === 'gold' ? 0xf0b429 : 0xd5dde8;
  const mesh = new Mesh(new CylinderGeometry(0.32, 0.36, 0.14, 28), [
    clay(side, { roughness: kind === 'gold' ? 0.32 : 0.55, metalness: kind === 'gold' ? 0.38 : 0.04 }),
    new MeshStandardMaterial({ map: top, roughness: 0.42, metalness: kind === 'gold' ? 0.2 : 0.02, color: 0xffffff }),
    clay(kind === 'gold' ? 0xc4922a : 0xb7c0cc),
  ]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createQuizStone(): { mesh: Mesh; material: MeshStandardMaterial } {
  const material = clay(0xf7f8fb, { roughness: 0.48, metalness: 0.04 });
  const mesh = new Mesh(new CylinderGeometry(0.28, 0.32, 0.12, 24), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, material };
}

export function createPodiumBlock(label: string, width: number, height: number, color: number): Mesh {
  const front = podiumFace(label, color);
  const body = clay(color, { roughness: 0.4, metalness: 0.18 });
  const top = clay(0xfff1c2, { roughness: 0.35, metalness: 0.12 });
  const mesh = new Mesh(new BoxGeometry(width, height, 0.62), [body, body, top, body, front, body]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function discTexture(label: string, kind: 'gold' | 'stone'): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return new CanvasTexture(canvas);
  context.clearRect(0, 0, 256, 256);
  context.fillStyle = kind === 'gold' ? '#ffcf3d' : '#e7edf4';
  context.beginPath();
  context.arc(128, 128, 120, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = kind === 'gold' ? '#fffaf0' : '#66788c';
  context.font = '800 132px "Trebuchet MS", "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 128, 138);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function podiumFace(label: string, color: number): Material {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const material = new MeshStandardMaterial({ roughness: 0.4, metalness: 0.12 });
  if (!context) return material;
  context.fillStyle = `#${new Color(color).getHexString()}`;
  context.fillRect(0, 0, 256, 256);
  context.fillStyle = '#fffaf0';
  context.font = '800 150px "Trebuchet MS", "Segoe UI", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, 128, 136);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  material.map = texture;
  material.color.set(0xffffff);
  return material;
}

export function makeSkyTexture(top: string, mid: string, bottom: string): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, top);
    gradient.addColorStop(0.55, mid);
    gradient.addColorStop(1, bottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 8, 512);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
