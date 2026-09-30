import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import { addOutline, discTexture, mat, podiumFace } from './materials';

export interface Flutter {
  group: Group;
  wingL: Mesh;
  wingR: Mesh;
  phase: number;
  hover: number;
}

export interface BirdRig {
  group: Group;
  wingL: Mesh;
  wingR: Mesh;
  radius: number;
  speed: number;
  phase: number;
  height: number;
}

export interface FlipStone {
  mesh: Mesh;
  top: MeshStandardMaterial;
  side: MeshStandardMaterial;
  plain: ReturnType<typeof discTexture>;
  gold: ReturnType<typeof discTexture>;
}

export function createPalm(): Group {
  const group = new Group();
  const trunk = new Mesh(new CylinderGeometry(0.07, 0.11, 0.95, 8), mat(0xc68642, 0.72));
  trunk.position.y = 0.48;
  trunk.rotation.z = 0.08;
  trunk.castShadow = true;
  group.add(trunk);
  const leafMat = mat(0x37b14a, 0.48);
  for (let i = 0; i < 6; i += 1) {
    const leaf = new Mesh(new SphereGeometry(0.28, 10, 8), leafMat);
    leaf.scale.set(0.26, 0.08, 1);
    const angle = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.3, 1.02, Math.sin(angle) * 0.3);
    leaf.rotation.y = -angle;
    leaf.rotation.z = 0.7;
    leaf.castShadow = true;
    group.add(leaf);
  }
  const coconut = new Mesh(new SphereGeometry(0.06, 8, 8), mat(0x8d5a32, 0.6));
  coconut.position.set(0.08, 0.86, 0.06);
  group.add(coconut);
  return group;
}

export function createRoundTree(): Group {
  const group = new Group();
  const trunk = new Mesh(new CylinderGeometry(0.08, 0.1, 0.62, 8), mat(0xb87a45, 0.7));
  trunk.position.y = 0.32;
  trunk.castShadow = true;
  group.add(trunk);
  const canopy = mat(0x4ec05a, 0.5);
  const canopyDeep = mat(0x2f9a44, 0.55);
  for (const [x, y, z, r, deep] of [
    [0, 0.85, 0, 0.32, false],
    [-0.22, 0.72, 0.08, 0.24, true],
    [0.24, 0.74, -0.04, 0.26, false],
    [0.02, 1.02, -0.02, 0.22, true],
  ] as const) {
    const puff = new Mesh(new SphereGeometry(r, 14, 12), deep ? canopyDeep : canopy);
    puff.position.set(x, y, z);
    puff.castShadow = true;
    group.add(puff);
  }
  return group;
}

export function createHouse(): Group {
  const group = new Group();
  const wall = new Mesh(new BoxGeometry(0.7, 0.5, 0.56), mat(0xfff1d6, 0.55));
  wall.position.y = 0.36;
  wall.castShadow = true;
  group.add(wall);
  const roof = new Mesh(new ConeGeometry(0.55, 0.38, 4), mat(0xff6b57, 0.42));
  roof.position.y = 0.76;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);
  const door = new Mesh(new BoxGeometry(0.16, 0.28, 0.04), mat(0xc68642, 0.6));
  door.position.set(0, 0.2, 0.29);
  group.add(door);
  const knob = new Mesh(new SphereGeometry(0.018, 8, 8), mat(0xffd15c, 0.28, 0.4));
  knob.position.set(0.05, 0.2, 0.32);
  group.add(knob);
  const windowMesh = new Mesh(new BoxGeometry(0.16, 0.16, 0.04), new MeshBasicMaterial({ color: 0xffe08a }));
  windowMesh.position.set(0.2, 0.42, 0.29);
  group.add(windowMesh);
  const chimney = new Mesh(new BoxGeometry(0.1, 0.2, 0.1), mat(0xd07a5a, 0.6));
  chimney.position.set(-0.18, 0.82, -0.06);
  chimney.castShadow = true;
  group.add(chimney);
  return group;
}

export function createMushroom(scale = 1): Group {
  const group = new Group();
  const stem = new Mesh(new CapsuleGeometry(0.055, 0.1, 3, 8), mat(0xfff3dd, 0.48));
  stem.position.y = 0.12;
  group.add(stem);
  const cap = new Mesh(new SphereGeometry(0.16, 16, 12), mat(0xff5d6e, 0.38));
  cap.scale.y = 0.55;
  cap.position.y = 0.22;
  cap.castShadow = true;
  group.add(cap);
  const spotMat = mat(0xffffff, 0.35);
  for (const [x, z] of [
    [0.06, 0.04],
    [-0.05, 0.05],
    [0.01, -0.07],
  ]) {
    const spot = new Mesh(new SphereGeometry(0.028, 8, 6), spotMat);
    spot.position.set(x, 0.27, z);
    group.add(spot);
  }
  group.scale.setScalar(scale);
  return group;
}

export function createFlower(color: number): Group {
  const group = new Group();
  const stem = new Mesh(new CylinderGeometry(0.012, 0.015, 0.18, 6), mat(0x3d9a40, 0.55));
  stem.position.y = 0.09;
  group.add(stem);
  const petalMat = mat(color, 0.42);
  for (let i = 0; i < 5; i += 1) {
    const petal = new Mesh(new SphereGeometry(0.04, 8, 6), petalMat);
    const angle = (i / 5) * Math.PI * 2;
    petal.position.set(Math.cos(angle) * 0.045, 0.2, Math.sin(angle) * 0.045);
    petal.scale.set(1, 0.65, 0.7);
    group.add(petal);
  }
  const center = new Mesh(new SphereGeometry(0.025, 8, 6), mat(0xffe08a, 0.35));
  center.position.set(0, 0.21, 0.02);
  group.add(center);
  return group;
}

export function createCloud(): Group {
  const group = new Group();
  const material = mat(0xffffff, 0.92, 0);
  const puffs: [number, number, number, number][] = [
    [0, 0, 0, 0.38],
    [0.34, -0.04, 0.02, 0.28],
    [-0.32, -0.05, 0, 0.26],
    [0.1, 0.14, -0.02, 0.22],
  ];
  for (const [x, y, z, radius] of puffs) {
    const puff = new Mesh(new SphereGeometry(radius, 12, 10), material);
    puff.position.set(x, y, z);
    group.add(puff);
  }
  return group;
}

export function createRainbow(): Group {
  const group = new Group();
  const colors = [0xff5d6e, 0xffa23a, 0xffe14a, 0x7ad957, 0x5ec8ff, 0xb07bff];
  colors.forEach((color, index) => {
    const arc = new Mesh(
      new TorusGeometry(1.85 - index * 0.08, 0.04, 8, 48, Math.PI),
      new MeshBasicMaterial({ color }),
    );
    arc.rotation.x = Math.PI / 2.35;
    arc.rotation.z = Math.PI;
    group.add(arc);
  });
  return group;
}

export function createButterfly(colorA: number, colorB: number): Flutter {
  const group = new Group();
  const body = new Mesh(new CapsuleGeometry(0.02, 0.08, 2, 6), mat(0x3a332c, 0.4));
  body.position.y = 0.02;
  group.add(body);
  const wingL = new Mesh(new SphereGeometry(0.09, 10, 8), mat(colorA, 0.35));
  wingL.scale.set(1.4, 0.18, 0.9);
  wingL.position.set(-0.1, 0.04, 0);
  group.add(wingL);
  const wingR = new Mesh(new SphereGeometry(0.09, 10, 8), mat(colorB, 0.35));
  wingR.scale.set(1.4, 0.18, 0.9);
  wingR.position.set(0.1, 0.04, 0);
  group.add(wingR);
  return { group, wingL, wingR, phase: Math.random() * Math.PI * 2, hover: 0.8 + Math.random() * 0.6 };
}

export function createBird(): BirdRig {
  const group = new Group();
  const body = new Mesh(new SphereGeometry(0.08, 10, 8), mat(0xfffaf0, 0.45));
  body.scale.set(1.4, 0.8, 0.8);
  group.add(body);
  const head = new Mesh(new SphereGeometry(0.045, 8, 8), mat(0xfffaf0, 0.45));
  head.position.set(0.1, 0.03, 0);
  group.add(head);
  const beak = new Mesh(new ConeGeometry(0.02, 0.06, 6), mat(0xff9a3d, 0.4));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.16, 0.02, 0);
  group.add(beak);
  const wingMat = mat(0x7eb6f6, 0.45);
  const wingL = new Mesh(new SphereGeometry(0.07, 8, 6), wingMat);
  wingL.scale.set(0.3, 0.12, 1.3);
  wingL.position.set(0, 0.02, 0.06);
  group.add(wingL);
  const wingR = new Mesh(new SphereGeometry(0.07, 8, 6), wingMat);
  wingR.scale.set(0.3, 0.12, 1.3);
  wingR.position.set(0, 0.02, -0.06);
  group.add(wingR);
  return { group, wingL, wingR, radius: 2.4, speed: 0.35, phase: Math.random() * Math.PI * 2, height: 2.1 };
}

export interface ChestRig {
  group: Group;
  lid: Group;
}

export function createChest(): ChestRig {
  const group = new Group();
  const wood = mat(0xe0943a, 0.48);
  const woodDark = mat(0xc56a22, 0.5);
  const gold = mat(0xffd15c, 0.28, 0.45, 0xffc94a);
  const body = new Mesh(new BoxGeometry(0.72, 0.4, 0.48), wood);
  body.position.y = 0.22;
  body.castShadow = true;
  group.add(body);
  const band = new Mesh(new BoxGeometry(0.74, 0.08, 0.5), gold);
  band.position.y = 0.24;
  group.add(band);
  const lock = new Mesh(new BoxGeometry(0.12, 0.14, 0.04), gold);
  lock.position.set(0, 0.26, 0.25);
  group.add(lock);
  const lid = new Group();
  lid.position.set(0, 0.42, -0.22);
  const lidBox = new Mesh(new BoxGeometry(0.74, 0.16, 0.5), woodDark);
  lidBox.position.set(0, 0.06, 0.22);
  lidBox.castShadow = true;
  lid.add(lidBox);
  const lidBand = new Mesh(new BoxGeometry(0.76, 0.05, 0.12), gold);
  lidBand.position.set(0, 0.12, 0.22);
  lid.add(lidBand);
  group.add(lid);
  return { group, lid };
}

export function createPanda(): Group {
  const group = new Group();
  const white = mat(0xfffdf8, 0.45);
  const black = mat(0x2a2a2a, 0.4);
  const body = new Mesh(new SphereGeometry(0.28, 18, 14), white);
  body.scale.set(1, 0.86, 0.82);
  body.position.y = 0.22;
  body.castShadow = true;
  addOutline(body, 0.04);
  group.add(body);
  const head = new Mesh(new SphereGeometry(0.2, 18, 14), white);
  head.position.y = 0.52;
  addOutline(head, 0.045);
  group.add(head);
  for (const side of [-1, 1]) {
    const ear = new Mesh(new SphereGeometry(0.07, 10, 8), black);
    ear.position.set(side * 0.14, 0.7, 0);
    group.add(ear);
    const patch = new Mesh(new SphereGeometry(0.07, 10, 8), black);
    patch.scale.set(1.05, 1.25, 0.35);
    patch.position.set(side * 0.08, 0.54, 0.15);
    group.add(patch);
    const eye = new Mesh(new SphereGeometry(0.02, 8, 8), white);
    eye.position.set(side * 0.08, 0.55, 0.19);
    group.add(eye);
    const arm = new Mesh(new SphereGeometry(0.055, 10, 8), black);
    arm.scale.set(0.7, 1.6, 0.7);
    arm.position.set(side * 0.22, 0.42, 0.04);
    arm.rotation.z = side * -1.1;
    group.add(arm);
  }
  const nose = new Mesh(new SphereGeometry(0.028, 8, 8), black);
  nose.position.set(0, 0.46, 0.18);
  group.add(nose);
  return group;
}

export function createStarMesh(): Mesh {
  const shape = new Shape();
  const spikes = 5;
  const outer = 0.28;
  const inner = 0.12;
  for (let i = 0; i < spikes * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.018, bevelSegments: 1 });
  geometry.center();
  const mesh = new Mesh(geometry, mat(0xffd34a, 0.28, 0.35, 0xffc107));
  mesh.castShadow = true;
  return mesh;
}

export function createLabeledStone(label: string, kind: 'gold' | 'stone'): Mesh {
  const top = discTexture(label, kind === 'gold' && label === '★' ? 'gold-star' : kind);
  const side = kind === 'gold' ? 0xf0b429 : 0xd5dde8;
  const mesh = new Mesh(new CylinderGeometry(0.34, 0.38, 0.16, 28), [
    mat(side, kind === 'gold' ? 0.32 : 0.55, kind === 'gold' ? 0.35 : 0.04),
    new MeshStandardMaterial({ map: top, roughness: 0.38, metalness: kind === 'gold' ? 0.22 : 0.02, color: 0xffffff }),
    mat(kind === 'gold' ? 0xc4922a : 0xb7c0cc, 0.5),
  ]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createQuizStone(label: string): FlipStone {
  const plain = discTexture(label, 'stone');
  const gold = discTexture(label, 'gold');
  const top = new MeshStandardMaterial({ map: plain, roughness: 0.38, metalness: 0.08, color: 0xffffff });
  const side = new MeshStandardMaterial({ color: 0xd5dde8, roughness: 0.48, metalness: 0.08 });
  const mesh = new Mesh(new CylinderGeometry(0.3, 0.34, 0.14, 24), [side, top, side]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return { mesh, top, side, plain, gold };
}

export function createPodiumBlock(label: string, width: number, height: number, color: number): Mesh {
  const front = podiumFace(label, color);
  const body = mat(color, 0.32, 0.24);
  const top = mat(0xfff1c2, 0.3, 0.16);
  const mesh = new Mesh(new BoxGeometry(width, height, 0.68), [body, body, top, body, front, body]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createShadow(): Mesh {
  const mesh = new Mesh(
    new CircleGeometry(0.38, 20),
    new MeshBasicMaterial({ color: 0x1c2418, transparent: true, opacity: 0.18, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  return mesh;
}
