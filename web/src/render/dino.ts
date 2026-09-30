import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import { addOutline, mat } from './materials';

export type DinoMood = 'idle' | 'happy' | 'sad' | 'cheer' | 'gentle';

export interface DinoRig {
  group: Group;
  squash: Group;
  body: Group;
  head: Group;
  look: Group;
  eyes: Mesh[];
  smile: Group;
  frown: Group;
  armL: Group;
  armR: Group;
  legL: Group;
  legR: Group;
  tail: Group;
  cape: Group;
}

export interface DinoAnim {
  rig: DinoRig;
  mood: DinoMood;
  moodUntil: number;
  blinkIn: number;
  closing: number;
  hop: number;
  blinks: number;
  waves: number;
  waving: boolean;
  waveLatched: boolean;
}

const eyeWhite = new MeshBasicMaterial({ color: 0xffffff });
const eyeInk = new MeshBasicMaterial({ color: 0x6b4226 });
const glintMat = new MeshBasicMaterial({ color: 0xffffff });
const mouthMat = new MeshBasicMaterial({ color: 0x2a241c });

export function createDino(options: { cape?: boolean } = {}): DinoAnim {
  const group = new Group();
  const squash = new Group();
  const body = new Group();
  group.add(squash);
  squash.add(body);

  const green = mat(0x7ed9c0, 0.9, 0);
  const greenDeep = mat(0x49c4a8, 0.92, 0);
  const bellyMat = mat(0xfff6ea, 0.92, 0);
  const finMat = mat(0xffb3d0, 0.9, 0);
  const blushMat = mat(0xff8eaa, 0.9, 0);
  const tongueMat = mat(0xe85b6c, 0.88, 0);

  const torso = new Mesh(new SphereGeometry(0.4, 28, 22), green);
  torso.scale.set(1.2, 0.86, 1.05);
  torso.position.y = 0.5;
  addOutline(torso, 0.045);
  body.add(torso);

  const tummy = new Mesh(new SphereGeometry(0.28, 20, 16), bellyMat);
  tummy.scale.set(0.9, 1.05, 0.42);
  tummy.position.set(0, 0.46, 0.28);
  body.add(tummy);

  const head = new Group();
  head.position.set(0, 0.98, 0.08);
  body.add(head);

  const skull = new Mesh(new SphereGeometry(0.56, 32, 24), green);
  skull.scale.set(1.08, 1, 0.96);
  addOutline(skull, 0.04);
  head.add(skull);

  const shine = new Mesh(new SphereGeometry(0.12, 12, 10), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 }));
  shine.position.set(-0.16, 0.22, 0.28);
  head.add(shine);

  const snout = new Mesh(new SphereGeometry(0.2, 18, 14), green);
  snout.scale.set(1.25, 0.7, 1.2);
  snout.position.set(0, -0.1, 0.4);
  addOutline(snout, 0.07);
  head.add(snout);

  const look = new Group();
  head.add(look);
  const eyes: Mesh[] = [];
  for (const side of [-1, 1]) {
    const white = new Mesh(new SphereGeometry(0.2, 18, 14), eyeWhite);
    white.scale.set(1, 1.16, 0.55);
    white.position.set(side * 0.2, 0.06, 0.4);
    look.add(white);
    eyes.push(white);

    const pupil = new Mesh(new SphereGeometry(0.096, 14, 12), eyeInk);
    pupil.position.set(side * 0.21, 0.04, 0.5);
    look.add(pupil);

    const catchLight = new Mesh(new SphereGeometry(0.034, 8, 8), glintMat);
    catchLight.position.set(side * 0.24 + 0.02, 0.1, 0.55);
    look.add(catchLight);
    const catchSmall = new Mesh(new SphereGeometry(0.016, 8, 8), glintMat);
    catchSmall.position.set(side * 0.16, 0.0, 0.54);
    look.add(catchSmall);

    const cheek = new Mesh(new SphereGeometry(0.08, 12, 10), blushMat);
    cheek.scale.set(1.25, 0.62, 0.35);
    cheek.position.set(side * 0.34, -0.1, 0.36);
    head.add(cheek);

    const nostril = new Mesh(new SphereGeometry(0.02, 8, 6), greenDeep);
    nostril.position.set(side * 0.06, -0.08, 0.58);
    head.add(nostril);
  }

  const smile = new Group();
  smile.position.set(0, -0.2, 0.52);
  const grin = new Mesh(new TorusGeometry(0.1, 0.02, 8, 18, Math.PI), mouthMat);
  grin.rotation.x = Math.PI / 2.2;
  grin.rotation.z = Math.PI;
  smile.add(grin);
  const tongue = new Mesh(new SphereGeometry(0.05, 10, 8), tongueMat);
  tongue.scale.set(1.35, 0.5, 0.45);
  tongue.position.set(0, -0.02, 0.02);
  smile.add(tongue);
  const tooth = new Mesh(new BoxGeometry(0.03, 0.035, 0.02), eyeWhite);
  tooth.position.set(0.045, 0.02, 0.04);
  smile.add(tooth);
  head.add(smile);

  const frown = new Group();
  frown.position.set(0, -0.16, 0.52);
  frown.visible = false;
  const frownArc = new Mesh(new TorusGeometry(0.09, 0.018, 8, 16, Math.PI), mouthMat);
  frownArc.rotation.x = Math.PI / 2.2;
  frown.add(frownArc);
  head.add(frown);

  const finGeo = new SphereGeometry(0.11, 12, 10);
  const finSpots: [number, number, number, number][] = [
    [0, 0.42, -0.08, 1],
    [0, 0.22, -0.32, 0.82],
    [0, 0.02, -0.4, 0.68],
  ];
  for (const [x, y, z, scale] of finSpots) {
    const fin = new Mesh(finGeo, finMat);
    fin.scale.set(0.7 * scale, 1.15 * scale, 0.35);
    fin.position.set(x, y, z);
    fin.castShadow = true;
    head.add(fin);
  }
  const backFins: [number, number, number][] = [
    [0, 0.82, -0.22],
    [0, 0.62, -0.32],
    [0, 0.44, -0.3],
  ];
  for (const [x, y, z] of backFins) {
    const fin = new Mesh(finGeo, finMat);
    fin.scale.set(0.55, 0.95, 0.28);
    fin.position.set(x, y, z);
    fin.castShadow = true;
    body.add(fin);
  }

  const armL = makeArm(green, -1);
  const armR = makeArm(green, 1);
  body.add(armL, armR);

  const legL = makeLeg(green, greenDeep, -1);
  const legR = makeLeg(green, greenDeep, 1);
  body.add(legL, legR);

  const tail = new Group();
  tail.position.set(0, 0.5, -0.42);
  const segments: [number, number][] = [
    [0.16, -0.08],
    [0.11, -0.28],
    [0.07, -0.46],
  ];
  for (const [radius, z] of segments) {
    const part = new Mesh(new SphereGeometry(radius, 14, 12), green);
    part.position.z = z;
    part.castShadow = true;
    addOutline(part, 0.06);
    tail.add(part);
  }
  const tailFin = new Mesh(finGeo, finMat);
  tailFin.position.set(0, 0.1, -0.2);
  tailFin.scale.set(0.45, 0.7, 0.22);
  tail.add(tailFin);
  body.add(tail);

  const cape = new Group();
  cape.position.set(0, 0.98, -0.12);
  cape.visible = options.cape === true;
  const cloth = new Mesh(new BoxGeometry(0.78, 0.78, 0.035), mat(0xe23d3d, 0.42));
  cloth.position.set(0, -0.32, -0.06);
  cloth.rotation.x = 0.22;
  cloth.castShadow = true;
  cape.add(cloth);
  const collar = new Mesh(new TorusGeometry(0.2, 0.045, 8, 18), mat(0xffd15c, 0.28, 0.42));
  collar.rotation.x = Math.PI / 2;
  cape.add(collar);
  body.add(cape);

  return {
    rig: { group, squash, body, head, look, eyes, smile, frown, armL, armR, legL, legR, tail, cape },
    mood: 'idle',
    moodUntil: 0,
    blinkIn: 0.7,
    closing: 0,
    hop: 1,
    blinks: 0,
    waves: 0,
    waving: false,
    waveLatched: false,
  };
}

function makeArm(material: ReturnType<typeof mat>, side: number): Group {
  const pivot = new Group();
  pivot.position.set(side * 0.42, 0.58, 0.12);
  const arm = new Mesh(new SphereGeometry(0.1, 12, 10), material);
  arm.scale.set(0.85, 1.15, 0.85);
  arm.position.y = -0.12;
  addOutline(arm, 0.06);
  pivot.add(arm);
  const hand = new Mesh(new SphereGeometry(0.09, 12, 10), material);
  hand.position.y = -0.24;
  addOutline(hand, 0.05);
  pivot.add(hand);
  return pivot;
}

function makeLeg(material: ReturnType<typeof mat>, deep: ReturnType<typeof mat>, side: number): Group {
  const pivot = new Group();
  pivot.position.set(side * 0.16, 0.22, 0.08);
  const leg = new Mesh(new SphereGeometry(0.09, 12, 10), deep);
  leg.scale.set(1, 0.85, 1);
  leg.position.y = -0.04;
  pivot.add(leg);
  const foot = new Mesh(new SphereGeometry(0.11, 14, 12), material);
  foot.scale.set(1.2, 0.48, 1.35);
  foot.position.set(side * 0.02, -0.14, 0.08);
  addOutline(foot, 0.05);
  pivot.add(foot);
  for (const x of [-0.05, 0.02, 0.07]) {
    const toe = new Mesh(new SphereGeometry(0.028, 8, 6), material);
    toe.position.set(x, -0.2, 0.18);
    pivot.add(toe);
  }
  return pivot;
}

export function updateDino(anim: DinoAnim, time: number, dt: number): void {
  const { rig } = anim;
  if ((anim.mood === 'happy' || anim.mood === 'sad') && time > anim.moodUntil) anim.mood = 'idle';

  const breathe = 1 + Math.sin(time * 2.3) * (anim.mood === 'sad' ? 0.012 : 0.03);
  rig.body.scale.set(1 / Math.sqrt(breathe), breathe, 1 / Math.sqrt(breathe));

  anim.blinkIn -= dt;
  if (anim.blinkIn <= 0) {
    anim.closing = 0.36;
    anim.blinkIn = 1.35 + Math.random() * 0.7;
    anim.blinks += 1;
  }
  let open = 1;
  if (anim.closing > 0) {
    anim.closing -= dt;
    const phase = 1 - Math.max(0, anim.closing) / 0.36;
    open = Math.max(0.05, Math.abs(phase - 0.5) * 2);
  }
  for (const eye of rig.eyes) eye.scale.y = 1.12 * open;

  const excited = anim.mood === 'happy' || anim.mood === 'cheer';
  rig.tail.rotation.y = Math.sin(time * (excited ? 7.5 : 3.2)) * (excited ? 0.55 : 0.34);
  rig.tail.rotation.z = Math.sin(time * 2.1) * 0.08;

  if (anim.mood === 'sad') {
    rig.head.rotation.x = 0.46;
    rig.head.rotation.y = 0;
    rig.head.rotation.z = Math.sin(time * 20) * 0.07;
  } else if (anim.mood === 'cheer') {
    rig.head.rotation.x = -0.12 + Math.sin(time * 4) * 0.05;
    rig.head.rotation.y = Math.sin(time * 1.6) * 0.15;
    rig.head.rotation.z = Math.sin(time * 3) * 0.04;
  } else if (anim.mood === 'happy') {
    rig.head.rotation.x = -0.08;
    rig.head.rotation.y = Math.sin(time * 6) * 0.12;
    rig.head.rotation.z = 0;
  } else {
    rig.head.rotation.x = Math.sin(time * 0.45) * 0.05;
    rig.head.rotation.y = Math.sin(time * 0.62) * 0.22;
    rig.head.rotation.z = 0;
  }

  rig.smile.visible = anim.mood !== 'sad';
  rig.frown.visible = anim.mood === 'sad';
  rig.look.position.x = anim.mood === 'sad' ? 0 : Math.sin(time * 0.62) * 0.025;
  rig.look.position.y = anim.mood === 'sad' ? -0.01 : Math.sin(time * 0.45) * 0.01;

  anim.waving = false;
  if (anim.mood === 'cheer' || anim.mood === 'happy') {
    const flap = Math.sin(time * (anim.mood === 'happy' ? 12 : 6.2)) * 0.16;
    rig.armL.rotation.z = -1.3 - flap;
    rig.armR.rotation.z = 1.3 + flap;
    rig.armL.rotation.x = -0.25;
    rig.armR.rotation.x = -0.25;
  } else if (anim.mood === 'sad') {
    rig.armL.rotation.set(0.35, 0, -0.12);
    rig.armR.rotation.set(0.35, 0, 0.12);
  } else if (anim.mood === 'gentle') {
    rig.armL.rotation.set(0, 0, -0.65 + Math.sin(time * 2) * 0.1);
    rig.armR.rotation.set(-0.1, 0, 0.95 + Math.sin(time * 2.5) * 0.16);
  } else {
    const cycle = time % 3.2;
    const waving = cycle < 1.15;
    if (waving && !anim.waveLatched) {
      anim.waves += 1;
      anim.waveLatched = true;
    }
    if (!waving) anim.waveLatched = false;
    rig.armL.rotation.set(0.05, 0, -0.4 + Math.sin(time * 2) * 0.08);
    if (waving) {
      const lift = Math.sin((cycle / 1.15) * Math.PI);
      anim.waving = lift > 0.72;
      rig.armR.rotation.set(-0.2, 0, 0.45 + lift * 2.05);
    } else {
      rig.armR.rotation.set(-0.12, 0, 0.72 + Math.sin(time * 3) * 0.16);
    }
  }

  if (anim.hop < 1) {
    const swing = Math.sin(anim.hop * Math.PI);
    rig.legL.rotation.x = swing * 0.45;
    rig.legR.rotation.x = -swing * 0.25;
    const squash = hopSquash(anim.hop);
    rig.squash.scale.set(squash.x, squash.y, squash.x);
    rig.squash.position.y = 0;
  } else if (anim.mood === 'cheer') {
    const bounce = Math.abs(Math.sin(time * 4.2));
    rig.squash.scale.set(1 - bounce * 0.04, 1 + bounce * 0.06, 1 - bounce * 0.04);
    rig.squash.position.y = bounce * 0.07;
    rig.legL.rotation.x = Math.sin(time * 6) * 0.12;
    rig.legR.rotation.x = Math.sin(time * 6 + 0.8) * 0.12;
  } else {
    rig.squash.scale.set(1, 1, 1);
    rig.squash.position.y = 0;
    rig.legL.rotation.x = 0;
    rig.legR.rotation.x = 0;
  }

  rig.cape.rotation.x = 0.12 + Math.sin(time * 3.1) * (excited ? 0.14 : 0.06);
  rig.cape.rotation.z = Math.sin(time * 2.2) * 0.05;
}

function hopSquash(t: number): { x: number; y: number } {
  if (t < 0.14) {
    const k = t / 0.14;
    return { x: 1 + 0.18 * k, y: 1 - 0.2 * k };
  }
  if (t < 0.78) {
    const stretch = Math.sin(((t - 0.14) / 0.64) * Math.PI);
    return { x: 1 - 0.08 * stretch, y: 1 + 0.2 * stretch };
  }
  const land = Math.sin(Math.min(1, (t - 0.78) / 0.22) * Math.PI);
  return { x: 1 + 0.18 * land, y: 1 - 0.2 * land };
}
