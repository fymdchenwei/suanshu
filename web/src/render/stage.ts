import {
  ACESFilmicToneMapping,
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { createDino, updateDino, type DinoAnim } from './dino';
import { makeSkyTexture, mat, softCircleTexture } from './materials';
import {
  createBird,
  createButterfly,
  createChest,
  createCloud,
  createFlower,
  createHouse,
  createMushroom,
  createPalm,
  createPanda,
  createPodiumBlock,
  createQuizStone,
  createRainbow,
  createRoundTree,
  createShadow,
  createStarMesh,
  type BirdRig,
  type ChestRig,
  type FlipStone,
  type Flutter,
} from './props';

export type StageMode = 'home' | 'quiz' | 'results';

interface Spark {
  mesh: Mesh;
  velocity: Vector3;
  life: number;
  max: number;
}

interface Burst {
  points: Points;
  velocities: Float32Array;
  age: number;
  life: number;
  parent: Group;
}

interface Theme {
  sky: ReturnType<typeof makeSkyTexture>;
  clear: number;
  grass: number;
  sun: number;
  sunLevel: number;
  hemi: number;
  night: boolean;
}

const RAINBOW = [0xff5d6e, 0xffb703, 0xffe14a, 0x7ad957, 0x5ec8ff, 0xb07bff];

export class Stage {
  readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(32, 1, 0.1, 80);
  private readonly home = new Group();
  private readonly quiz = new Group();
  private readonly results = new Group();
  private readonly sky: Mesh;
  private readonly homeSky = makeSkyTexture([
    { at: 0, color: '#5eb6ff' },
    { at: 0.45, color: '#b7e6ff' },
    { at: 1, color: '#fff6d8' },
  ]);
  private readonly partySky = makeSkyTexture([
    { at: 0, color: '#3a1878' },
    { at: 0.5, color: '#b15cff' },
    { at: 1, color: '#ffb07a' },
  ]);
  private readonly gentleSky = makeSkyTexture([
    { at: 0, color: '#6a4a98' },
    { at: 0.55, color: '#e7a0d0' },
    { at: 1, color: '#ffd0a8' },
  ]);
  private readonly themes: Record<number, Theme>;
  private readonly homeAnim: DinoAnim;
  private readonly quizAnim: DinoAnim;
  private readonly resultsAnim: DinoAnim;
  private readonly quizShadow: Mesh;
  private readonly quizChest: ChestRig;
  private readonly resultsChest: ChestRig;
  private readonly quizSlots: Vector3[] = [];
  private readonly quizStones: FlipStone[] = [];
  private readonly stars: Mesh[] = [];
  private readonly flutters: Flutter[] = [];
  private readonly birds: BirdRig[] = [];
  private readonly drifting: { group: Group; speed: number; minX: number; maxX: number }[] = [];
  private readonly sparks: Spark[] = [];
  private readonly sparkPool: Mesh[] = [];
  private readonly sparkGeo = new SphereGeometry(0.045, 8, 6);
  private readonly sparkMats = new Map<number, MeshStandardMaterial>();
  private readonly sparkleMap = softCircleTexture();
  private readonly fireworks: Burst[] = [];
  private readonly quizGrass: MeshStandardMaterial;
  private readonly nightBits: Group;
  private readonly dayBits: Group;
  private readonly sun: DirectionalLight;
  private readonly hemi: HemisphereLight;
  private readonly homeBaseY = 0.32;
  private mode: StageMode = 'home';
  private themeId = 1;
  private hop = { from: new Vector3(), to: new Vector3(), t: 1, target: 0 };
  private quizStone = 0;
  private lidWant = 0;
  private gentleResults = false;
  private fireworkTimer = 0.2;
  private trail = 0;
  private frameCount = 0;
  private readonly frameSamples: number[] = [];
  private lastStamp = 0;
  private sampleIn = 0;
  private running = true;

  constructor(canvas: HTMLCanvasElement) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: ratio < 1.5,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(0x8fd4ff, 1);

    this.themes = {
      1: this.makeTheme('#5eb6ff', '#b7e6ff', '#fff6d8', 0x8fd4ff, 0x7dce4e, 0xfff4d2, 1.55, 0xfff6ea, false),
      2: this.makeTheme('#ff9a4a', '#ffd27a', '#fff1c2', 0xffc48a, 0x8ed15a, 0xffc27a, 1.45, 0xffe0b0, false),
      3: this.makeTheme('#49c8ff', '#b6f3d4', '#e9ffe8', 0x8fe7c8, 0x3ec06a, 0xfff6e4, 1.5, 0xe7fff2, false),
      4: this.makeTheme('#2a3d86', '#7f92e4', '#d5dcff', 0x4d62b4, 0x5cbf72, 0xe7eeff, 1.2, 0xd5e4ff, true),
    };

    this.sky = new Mesh(new SphereGeometry(40, 24, 16), new MeshBasicMaterial({ map: this.homeSky, side: BackSide, depthWrite: false }));
    this.scene.add(this.sky);

    this.hemi = new HemisphereLight(0xfff6ea, 0x7dce4e, 0.85);
    this.scene.add(this.hemi);
    this.scene.add(new AmbientLight(0xffffff, 0.28));
    this.sun = new DirectionalLight(0xfff4d2, 1.55);
    this.sun.position.set(4.4, 7.4, 3.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 22;
    this.sun.shadow.camera.left = -8;
    this.sun.shadow.camera.right = 8;
    this.sun.shadow.camera.top = 8;
    this.sun.shadow.camera.bottom = -8;
    this.sun.shadow.bias = -0.0008;
    this.scene.add(this.sun);

    this.quizGrass = new MeshStandardMaterial({ color: 0x7dce4e, roughness: 0.78 });
    this.nightBits = new Group();
    this.dayBits = new Group();
    this.homeAnim = this.buildHome();
    this.quizAnim = this.buildQuiz();
    this.quizShadow = createShadow();
    this.quizAnim.rig.group.add(this.quizShadow);
    const built = this.buildResults();
    this.resultsAnim = built.dino;
    this.resultsChest = built.chest;
    this.quizChest = this.placeQuizChest();
    this.results.position.y = 0.42;
    this.results.scale.setScalar(1.22);
    this.scene.add(this.home, this.quiz, this.results);
    this.quiz.visible = false;
    this.results.visible = false;

    const gl = this.renderer.getContext();
    canvas.dataset.renderer = String(gl.getParameter(gl.RENDERER) ?? '');
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
    this.lastStamp = performance.now();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  setMode(mode: StageMode): void {
    if (this.mode !== mode) {
      this.mode = mode;
      this.home.visible = mode === 'home';
      this.quiz.visible = mode === 'quiz';
      this.results.visible = mode === 'results';
      this.sampleIn = 0;
      if (mode === 'quiz') this.moveDino(this.quizStone, true);
    }
    this.applySky();
    this.resize();
  }

  setTheme(difficulty: number): void {
    const next = difficulty === 2 || difficulty === 3 || difficulty === 4 ? difficulty : 1;
    if (this.themeId === next) return;
    this.themeId = next;
    const theme = this.themes[next] ?? this.themes[1]!;
    this.quizGrass.color.set(theme.grass);
    this.sun.color.set(theme.sun);
    this.sun.intensity = theme.sunLevel;
    this.hemi.color.set(theme.hemi);
    this.nightBits.visible = theme.night;
    this.dayBits.visible = !theme.night;
    if (this.mode === 'quiz') this.applySky();
  }

  setQuizStone(index: number, snap = false): void {
    const next = Math.max(0, Math.min(10, index));
    this.quizStone = next;
    for (let i = 0; i < this.quizStones.length; i += 1) {
      const stone = this.quizStones[i]!;
      const done = i < next;
      stone.top.map = done ? stone.gold : stone.plain;
      stone.top.needsUpdate = true;
      stone.side.color.set(done ? 0xf0b429 : 0xd5dde8);
      stone.side.emissive.set(done ? 0xffc24a : 0x000000);
      stone.side.emissiveIntensity = done ? 0.18 : 0;
    }
    if (next >= 10) this.lidWant = -1.4;
    this.moveDino(next, snap || this.mode !== 'quiz');
  }

  setStars(count: number): void {
    this.stars.forEach((star, index) => {
      const earned = index < count;
      const material = star.material as MeshStandardMaterial;
      material.color.set(earned ? 0xffd34a : 0xd9d3c8);
      material.emissive.set(earned ? 0xffb703 : 0x000000);
      material.emissiveIntensity = earned ? 0.4 : 0;
      star.scale.setScalar(earned ? 1 : 0.86);
    });
  }

  setChestOpen(open: boolean): void {
    this.lidWant = open ? -1.4 : 0;
  }

  setQuizMood(mood: 'idle' | 'happy' | 'sad'): void {
    this.quizAnim.mood = mood;
    this.quizAnim.moodUntil = performance.now() / 1000 + (mood === 'sad' ? 0.9 : 0.8);
  }

  setResultMood(mood: 'cheer' | 'gentle'): void {
    this.resultsAnim.mood = mood;
    this.resultsAnim.rig.cape.visible = mood === 'cheer';
    this.gentleResults = mood === 'gentle';
    if (this.mode === 'results') this.applySky();
  }

  petHome(): void {
    this.homeAnim.mood = 'happy';
    this.homeAnim.moodUntil = performance.now() / 1000 + 0.9;
    this.homeAnim.hop = 0;
    const origin = this.homeAnim.rig.group.position.clone();
    origin.y += 1.15;
    const colors = [0xff8eb8, 0xffe14a, 0xffffff, 0x7ddea0, 0xffb3d0];
    for (let i = 0; i < 14; i += 1) {
      this.launchSpark(origin, colors[i % colors.length]!, 0.55, 2.2, 1.7);
    }
  }

  burst(level: 0 | 1 | 2 = 0): void {
    const origin = this.quizAnim.rig.group.position.clone();
    origin.y += 0.95;
    const colors = level >= 1 ? RAINBOW : [0xffe27a, 0xffffff, 0xffb0d0, 0xb7f08a];
    const count = level === 2 ? 26 : level === 1 ? 18 : 12;
    for (let i = 0; i < count; i += 1) {
      this.launchSpark(origin, colors[i % colors.length]!, 0.7, 2.6, 2.1);
    }
    if (level >= 1) this.trail = level === 2 ? 0.85 : 0.5;
    if (level >= 2) {
      this.spawnFirework(origin.clone().setY(origin.y + 0.2), new Color(0xffd15c), this.quiz);
      this.spawnFirework(origin.clone().add(new Vector3(0.6, 0.4, -0.2)), new Color(0xff7eb3), this.quiz);
    }
  }

  resize(): void {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = Math.max(1, canvas.clientHeight || window.innerHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.fov = this.mode === 'quiz' ? 36 : this.mode === 'results' ? 30 : 42;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private frame(): void {
    if (!this.running) return;
    const now = performance.now();
    const frameMs = now - this.lastStamp;
    const dt = Math.min(0.05, frameMs / 1000 || 1 / 60);
    this.lastStamp = now;
    const time = now / 1000;

    updateDino(this.homeAnim, time, dt);
    updateDino(this.quizAnim, time, dt);
    updateDino(this.resultsAnim, time, dt);
    if (this.homeAnim.hop < 1) this.homeAnim.hop = Math.min(1, this.homeAnim.hop + dt / 0.48);
    const hopLift = this.homeAnim.hop < 1 ? Math.sin(this.homeAnim.hop * Math.PI) * 0.55 : 0;
    this.homeAnim.rig.group.position.y = this.homeBaseY + Math.sin(time * 2.1) * 0.035 + hopLift;
    this.homeAnim.rig.group.rotation.y = 0.08 + Math.sin(time * 0.7) * 0.06;

    let arc = 0;
    if (this.hop.t < 1) {
      this.hop.t = Math.min(1, this.hop.t + dt / 0.42);
      const eased = 1 - (1 - this.hop.t) ** 3;
      this.quizAnim.rig.group.position.lerpVectors(this.hop.from, this.hop.to, eased);
      arc = Math.sin(this.hop.t * Math.PI) * 0.58;
      this.quizAnim.rig.group.position.y += arc;
      this.quizAnim.hop = this.hop.t;
    } else if (this.mode === 'quiz') {
      const base = this.quizSlots[this.hop.target];
      if (base) this.quizAnim.rig.group.position.y = base.y + Math.sin(time * 2.4) * 0.03;
      this.quizAnim.hop = 1;
    }
    this.quizShadow.position.y = 0.02 - arc - (this.hop.t >= 1 ? Math.sin(time * 2.4) * 0.03 : 0);

    this.quizChest.lid.rotation.x = damp(this.quizChest.lid.rotation.x, this.quizStone >= 10 ? -1.4 : this.lidWant, dt);
    this.resultsChest.lid.rotation.x = damp(this.resultsChest.lid.rotation.x, -1.28, dt);
    this.stars.forEach((star, index) => {
      star.rotation.y = time * 0.9 + index;
      star.position.y = 1.92 + Math.sin(time * 2 + index) * 0.07;
    });

    for (const flutter of this.flutters) {
      const flap = Math.sin(time * 14 + flutter.phase) * 0.7;
      flutter.wingL.rotation.z = 0.4 + flap;
      flutter.wingR.rotation.z = -0.4 - flap;
      flutter.group.position.y = flutter.hover + Math.sin(time * 2 + flutter.phase) * 0.08;
    }
    for (const bird of this.birds) {
      bird.phase += dt * bird.speed;
      bird.group.position.set(Math.cos(bird.phase) * bird.radius, bird.height + Math.sin(bird.phase * 2) * 0.1, Math.sin(bird.phase) * bird.radius * 0.55);
      bird.group.rotation.y = -bird.phase + Math.PI / 2;
      const flap = Math.sin(time * 14) * 0.7;
      bird.wingL.rotation.z = flap;
      bird.wingR.rotation.z = -flap;
    }
    for (const cloud of this.drifting) {
      cloud.group.position.x += cloud.speed * dt;
      if (cloud.group.position.x > cloud.maxX) cloud.group.position.x = cloud.minX;
    }
    this.quizStones.forEach((stone, index) => {
      const current = index + 1 === this.quizStone;
      const pulse = current ? 1 + Math.sin(time * 5) * 0.05 : 1;
      const base = Number(stone.mesh.userData.base ?? 1);
      stone.mesh.scale.setScalar(base * pulse);
    });

    if (this.trail > 0 && this.mode === 'quiz') {
      this.trail -= dt;
      this.launchSpark(this.quizAnim.rig.group.position.clone().setY(this.quizAnim.rig.group.position.y + 0.45), RAINBOW[Math.floor(Math.random() * RAINBOW.length)]!, 0.4, 0.5, 0.6);
    }

    this.updateSparks(dt);
    if (this.mode === 'results' || this.trail > 0) this.updateFireworks(dt);
    this.applyCamera(time);
    this.renderer.render(this.scene, this.camera);
    this.noteFrame(frameMs);
    if (this.sampleIn <= 2) {
      this.sampleFrame();
      this.sampleIn += 1;
    }
  }

  private applyCamera(time: number): void {
    if (this.mode === 'quiz') {
      const dino = this.quizAnim.rig.group.position;
      const sway = Math.sin(time * 0.4) * 0.04;
      this.camera.position.set(dino.x + 0.06 + sway, dino.y + 1.02, dino.z + 2.2);
      this.camera.lookAt(dino.x, dino.y + 0.46, dino.z);
      return;
    }
    if (this.mode === 'results') {
      const sway = Math.sin(time * 0.35) * 0.07;
      this.camera.position.set(0.15 + sway, 1.55, 5.35);
      this.camera.lookAt(0.02, 0.62, 0.02);
      return;
    }
    const sway = Math.sin(time * 0.28) * 0.06;
    this.camera.position.set(0.05 + sway, 2.05, 5.35);
    this.camera.lookAt(0.02, 0.55, 0.05);
  }

  private applySky(): void {
    const material = this.sky.material as MeshBasicMaterial;
    if (this.mode === 'results') {
      material.map = this.gentleResults ? this.gentleSky : this.partySky;
      this.renderer.setClearColor(this.gentleResults ? 0xc46bd4 : 0x5a2a86, 1);
    } else if (this.mode === 'quiz') {
      const theme = this.themes[this.themeId] ?? this.themes[1]!;
      material.map = theme.sky;
      this.renderer.setClearColor(theme.clear, 1);
    } else {
      material.map = this.homeSky;
      this.renderer.setClearColor(0x8fd4ff, 1);
    }
    material.needsUpdate = true;
  }

  private makeTheme(
    top: string,
    mid: string,
    bottom: string,
    clear: number,
    grass: number,
    sun: number,
    sunLevel: number,
    hemi: number,
    night: boolean,
  ): Theme {
    return {
      sky: makeSkyTexture([
        { at: 0, color: top },
        { at: 0.5, color: mid },
        { at: 1, color: bottom },
      ]),
      clear,
      grass,
      sun,
      sunLevel,
      hemi,
      night,
    };
  }

  private buildHome(): DinoAnim {
    const ground = this.homeBaseY;
    const dirt = new Mesh(new CylinderGeometry(2.15, 1.65, 1.15, 36), mat(0xc48958, 0.86));
    dirt.position.y = -0.32;
    dirt.castShadow = true;
    dirt.receiveShadow = true;
    this.home.add(dirt);
    const dirtBottom = new Mesh(new CylinderGeometry(1.5, 1.05, 0.38, 28), mat(0x8d5a32, 0.9));
    dirtBottom.position.y = -0.95;
    this.home.add(dirtBottom);
    const grassMat = new MeshStandardMaterial({ color: 0x7dce4e, roughness: 0.76 });
    const grass = new Mesh(new CylinderGeometry(2.18, 2.22, 0.28, 36), grassMat);
    grass.position.y = 0.18;
    grass.receiveShadow = true;
    this.home.add(grass);
    const hill = new Mesh(new SphereGeometry(1.15, 22, 14), grassMat);
    hill.scale.set(1.15, 0.28, 0.95);
    hill.position.set(-0.15, 0.28, -0.25);
    this.home.add(hill);
    this.addTufts(this.home, 0.3, 2.05, 18);

    const dino = createDino();
    dino.rig.group.position.set(-0.05, ground, 0.35);
    dino.rig.group.scale.setScalar(0.92);
    dino.rig.group.add(createShadow());
    this.home.add(dino.rig.group);

    const chest = createChest();
    chest.group.position.set(0.95, ground - 0.02, 0.15);
    chest.group.scale.setScalar(0.82);
    this.home.add(chest.group);

    const house = createHouse();
    house.position.set(-0.15, ground - 0.02, -1.15);
    house.rotation.y = 0.4;
    this.home.add(house);

    for (const [x, z, scale] of [
      [-1.55, 0.15, 1],
      [0.35, -1.45, 0.92],
      [1.55, -0.35, 0.85],
    ] as const) {
      const palm = createPalm();
      palm.position.set(x, ground - 0.02, z);
      palm.scale.setScalar(scale);
      this.home.add(palm);
    }
    const tree = createRoundTree();
    tree.position.set(-1.15, ground - 0.02, -0.85);
    tree.scale.setScalar(0.9);
    this.home.add(tree);

    for (const [x, z, scale] of [
      [-0.82, 0.55, 0.85],
      [0.72, 0.72, 0.62],
      [-0.55, -0.85, 0.7],
    ] as const) {
      const mushroom = createMushroom(scale);
      mushroom.position.set(x, ground - 0.02, z);
      this.home.add(mushroom);
    }

    const flowerColors = [0xff8fb8, 0xffd15c, 0xffffff, 0xff9a62, 0xc9a6ff];
    for (let i = 0; i < 9; i += 1) {
      const flower = createFlower(flowerColors[i % flowerColors.length]!);
      const angle = (i / 9) * Math.PI * 2 + 0.4;
      const radius = 1.25 + (i % 3) * 0.22;
      flower.position.set(Math.cos(angle) * radius, ground - 0.02, Math.sin(angle) * radius * 0.92);
      this.home.add(flower);
    }

    const rainbow = createRainbow();
    rainbow.position.set(-0.15, 2.55, -1.7);
    rainbow.scale.setScalar(1.35);
    rainbow.rotation.y = 0.2;
    this.home.add(rainbow);

    this.addCloud(this.home, -2.6, 2.35, -1.1, 0.9, 0.12);
    this.addCloud(this.home, 2.3, 2.05, -0.4, 0.75, 0.08);
    this.addCloud(this.home, -0.2, 2.7, -2.3, 0.6, 0.05);
    this.addCloud(this.home, 1.5, 1.35, 1.8, 0.5, 0.1);

    const sun = new Mesh(new SphereGeometry(0.28, 16, 12), new MeshBasicMaterial({ color: 0xfff3a0 }));
    sun.position.set(2.3, 2.55, -1.6);
    this.home.add(sun);

    for (const [x, y, z, a, b] of [
      [-1.1, 1.15, 0.4, 0xff8fb8, 0xffd15c],
      [0.9, 1.35, -0.2, 0x7eb6ff, 0xc9a6ff],
      [0.2, 1.05, 1.1, 0xffd15c, 0xff8fb8],
    ] as const) {
      const flutter = createButterfly(a, b);
      flutter.group.position.set(x, y, z);
      flutter.hover = y;
      this.home.add(flutter.group);
      this.flutters.push(flutter);
    }

    for (let i = 0; i < 2; i += 1) {
      const bird = createBird();
      bird.phase = i * 2.2;
      bird.radius = 2.5 + i * 0.4;
      bird.height = 2.15 + i * 0.25;
      bird.speed = 0.28 + i * 0.08;
      this.home.add(bird.group);
      this.birds.push(bird);
    }

    this.addSparkleField(this.home, 18, 2.2);
    return dino;
  }

  private buildQuiz(): DinoAnim {
    const dirt = new Mesh(new CylinderGeometry(3.05, 2.25, 0.62, 32), mat(0xc48958, 0.88));
    dirt.scale.set(1.42, 1, 0.78);
    dirt.position.y = -0.22;
    this.quiz.add(dirt);
    const ground = new Mesh(new CylinderGeometry(3.1, 3.1, 0.2, 36), this.quizGrass);
    ground.scale.set(1.42, 1, 0.78);
    ground.position.y = 0.04;
    ground.receiveShadow = true;
    this.quiz.add(ground);
    const hill = new Mesh(new SphereGeometry(2.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), this.quizGrass);
    hill.scale.set(1.55, 0.2, 0.72);
    hill.position.set(0, 0.1, -0.42);
    hill.receiveShadow = true;
    this.quiz.add(hill);
    this.addTufts(this.quiz, 0.14, 2.15, 14);

    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      const x = -2.85 + t * 5.7;
      const z = 0.28 + Math.sin(t * Math.PI) * 0.16;
      this.quizSlots.push(new Vector3(x, 0.3, z));
      if (i === 0) continue;
      const stone = createQuizStone(String(i));
      stone.mesh.position.set(x, 0.16, z);
      stone.mesh.rotation.x = -0.42;
      stone.mesh.userData.base = 1.32;
      stone.mesh.scale.setScalar(1.32);
      this.quiz.add(stone.mesh);
      this.quizStones.push(stone);
    }

    const dino = createDino();
    dino.rig.group.scale.setScalar(0.72);
    dino.rig.group.position.copy(this.quizSlots[0]!);
    dino.rig.group.rotation.y = 0.35;
    this.quiz.add(dino.rig.group);

    const flowerColors = [0xff8fb8, 0xffd15c, 0xffffff, 0xc9a6ff, 0xff9a62];
    for (let i = 0; i < 8; i += 1) {
      const flower = createFlower(flowerColors[i % flowerColors.length]!);
      const side = i < 4 ? -1 : 1;
      flower.position.set(-2.2 + (i % 4) * 1.45, 0.08, side * 0.72);
      this.quiz.add(flower);
    }
    const leftPalm = createPalm();
    leftPalm.position.set(-3.15, 0.02, -0.15);
    leftPalm.scale.setScalar(0.62);
    const rightTree = createRoundTree();
    rightTree.position.set(3.05, 0.02, -0.05);
    rightTree.scale.setScalar(0.58);
    this.quiz.add(leftPalm, rightTree);
    const mushroom = createMushroom(0.8);
    mushroom.position.set(2.35, 0.06, 0.62);
    this.quiz.add(mushroom);

    this.addCloud(this.quiz, -2.2, 2.05, -1.6, 0.7, 0.08);
    this.addCloud(this.quiz, 1.8, 1.85, -1.35, 0.55, 0.06);

    const sun = new Mesh(new SphereGeometry(0.22, 14, 10), new MeshBasicMaterial({ color: 0xfff3a0 }));
    sun.position.set(1.8, 1.9, -1.8);
    this.dayBits.add(sun);
    const moon = new Mesh(new SphereGeometry(0.2, 14, 10), new MeshBasicMaterial({ color: 0xfff1c2 }));
    moon.position.set(1.5, 1.85, -1.7);
    this.nightBits.add(moon);
    this.addSparkleField(this.nightBits, 24, 2.4);
    this.nightBits.visible = false;
    this.quiz.add(this.dayBits, this.nightBits);

    const flutter = createButterfly(0xff8fb8, 0xffd15c);
    flutter.group.position.set(-1.4, 0.85, 0.4);
    flutter.hover = 0.85;
    this.quiz.add(flutter.group);
    this.flutters.push(flutter);
    return dino;
  }

  private placeQuizChest(): ChestRig {
    const chest = createChest();
    const end = this.quizSlots[10]!;
    chest.group.position.set(end.x + 0.55, 0, end.z + 0.05);
    chest.group.scale.setScalar(0.72);
    this.quiz.add(chest.group);
    return chest;
  }

  private buildResults(): { dino: DinoAnim; chest: ChestRig } {
    const hill = new Mesh(new SphereGeometry(3.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x7a4aa8, 0.86));
    hill.scale.set(1.5, 0.22, 1.1);
    hill.position.y = -0.15;
    hill.receiveShadow = true;
    this.results.add(hill);
    const cloud = createCloud();
    cloud.position.set(0, -0.05, 0.4);
    cloud.scale.set(2.4, 0.55, 1.3);
    this.results.add(cloud);

    const places = [
      { label: '2', x: -0.78, h: 0.55, color: 0xf0c14d },
      { label: '1', x: 0, h: 0.86, color: 0xffd866 },
      { label: '3', x: 0.78, h: 0.42, color: 0xe6a63a },
    ];
    for (const place of places) {
      const block = createPodiumBlock(place.label, 0.7, place.h, place.color);
      block.position.set(place.x, place.h / 2, 0);
      this.results.add(block);
    }

    const dino = createDino({ cape: true });
    dino.mood = 'cheer';
    dino.rig.group.position.set(0, 0.9, 0.05);
    dino.rig.group.scale.setScalar(0.78);
    this.results.add(dino.rig.group);

    const chest = createChest();
    chest.group.position.set(1.65, 0, 0.2);
    chest.lid.rotation.x = -1.25;
    this.results.add(chest.group);
    const panda = createPanda();
    panda.position.set(1.62, 0.78, 0.22);
    panda.scale.setScalar(0.9);
    this.results.add(panda);

    for (let i = 0; i < 3; i += 1) {
      const star = createStarMesh();
      star.position.set(-0.62 + i * 0.62, 1.92, 0.2);
      this.results.add(star);
      this.stars.push(star);
    }
    this.setStars(0);
    this.addSparkleField(this.results, 16, 2.6);
    return { dino, chest };
  }

  private addTufts(parent: Group, y: number, radius: number, count: number): void {
    const mesh = new InstancedMesh(new ConeGeometry(0.055, 0.18, 4), mat(0x62c844, 0.7), count);
    const dummy = new Object3D();
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dummy.rotation.y = angle;
      dummy.scale.setScalar(0.75 + (i % 4) * 0.12);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    parent.add(mesh);
  }

  private addCloud(parent: Group, x: number, y: number, z: number, scale: number, speed: number): void {
    const cloud = createCloud();
    cloud.position.set(x, y, z);
    cloud.scale.setScalar(scale);
    parent.add(cloud);
    this.drifting.push({ group: cloud, speed, minX: -4.2, maxX: 4.2 });
  }

  private addSparkleField(parent: Group, count: number, spread: number): void {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = 0.6 + Math.random() * 1.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const points = new Points(
      geometry,
      new PointsMaterial({
        map: this.sparkleMap,
        color: 0xffffff,
        size: 0.09,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    parent.add(points);
  }

  private moveDino(index: number, snap: boolean): void {
    const dest = this.quizSlots[index];
    if (!dest) return;
    if (snap || this.hop.target === index) {
      if (snap) {
        this.quizAnim.rig.group.position.copy(dest);
        this.hop.t = 1;
        this.hop.target = index;
        this.quizAnim.hop = 1;
      }
      return;
    }
    this.hop.from.copy(this.quizAnim.rig.group.position);
    this.hop.to.copy(dest);
    this.hop.t = 0;
    this.hop.target = index;
  }

  private launchSpark(origin: Vector3, color: number, life: number, spread: number, lift: number): void {
    let mesh = this.sparkPool.find((item) => !item.visible);
    if (!mesh) {
      mesh = new Mesh(this.sparkGeo, this.sparkMaterial(color));
      this.quiz.add(mesh);
      this.sparkPool.push(mesh);
    }
    const previous = mesh.material as MeshStandardMaterial;
    if (mesh.userData.cloned === true) previous.dispose();
    const material = this.sparkMaterial(color).clone();
    material.opacity = 1;
    mesh.material = material;
    mesh.userData.cloned = true;
    mesh.visible = true;
    mesh.position.copy(origin);
    this.sparks.push({
      mesh,
      velocity: new Vector3((Math.random() - 0.5) * spread, lift * (0.45 + Math.random()), (Math.random() - 0.5) * spread),
      life,
      max: life,
    });
  }

  private sparkMaterial(color: number): MeshStandardMaterial {
    const existing = this.sparkMats.get(color);
    if (existing) return existing;
    const material = new MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      transparent: true,
    });
    this.sparkMats.set(color, material);
    return material;
  }

  private updateSparks(dt: number): void {
    for (let i = this.sparks.length - 1; i >= 0; i -= 1) {
      const spark = this.sparks[i]!;
      spark.life -= dt;
      spark.velocity.y -= dt * 2.4;
      spark.mesh.position.addScaledVector(spark.velocity, dt);
      const material = spark.mesh.material as MeshStandardMaterial;
      material.opacity = Math.max(0, spark.life / spark.max);
      if (spark.life <= 0) {
        spark.mesh.visible = false;
        (spark.mesh.material as MeshStandardMaterial).dispose();
        spark.mesh.userData.cloned = false;
        this.sparks.splice(i, 1);
      }
    }
  }

  private updateFireworks(dt: number): void {
    if (this.mode === 'results') {
      this.fireworkTimer -= dt;
      const gap = this.gentleResults ? 1.35 : 0.62;
      if (this.fireworkTimer <= 0) {
        this.fireworkTimer = gap;
        this.spawnFirework(
          new Vector3((Math.random() - 0.5) * 3.4, 1.7 + Math.random() * 0.9, -0.8),
          new Color().setHSL(Math.random(), 0.75, 0.62),
          this.results,
        );
      }
    }
    for (let i = this.fireworks.length - 1; i >= 0; i -= 1) {
      const burst = this.fireworks[i]!;
      burst.age += dt;
      const position = burst.points.geometry.getAttribute('position') as BufferAttribute;
      for (let p = 0; p < position.count; p += 1) {
        position.setXYZ(
          p,
          position.getX(p) + burst.velocities[p * 3]! * dt,
          position.getY(p) + burst.velocities[p * 3 + 1]! * dt - dt * 0.4,
          position.getZ(p) + burst.velocities[p * 3 + 2]! * dt,
        );
      }
      position.needsUpdate = true;
      const material = burst.points.material as PointsMaterial;
      material.opacity = Math.max(0, 1 - burst.age / burst.life);
      if (burst.age >= burst.life) {
        burst.points.removeFromParent();
        burst.points.geometry.dispose();
        material.dispose();
        this.fireworks.splice(i, 1);
      }
    }
  }

  private spawnFirework(origin: Vector3, color: Color, parent: Group): void {
    const count = 22;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.8 + Math.random() * 1.2;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed * 0.8;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const material = new PointsMaterial({ color, size: 0.1, transparent: true, depthWrite: false, sizeAttenuation: true, map: this.sparkleMap });
    const points = new Points(geometry, material);
    parent.add(points);
    this.fireworks.push({ points, velocities, age: 0, life: 1.15, parent });
  }

  private noteFrame(frameMs: number): void {
    this.frameCount += 1;
    if (this.frameCount > 12 && frameMs > 0 && frameMs < 250) {
      this.frameSamples.push(frameMs);
      if (this.frameSamples.length > 30) this.frameSamples.shift();
      if (this.frameSamples.length >= 20) {
        const sorted = [...this.frameSamples].sort((a, b) => a - b);
        const mid = sorted[Math.floor(sorted.length / 2)] ?? frameMs;
        this.renderer.domElement.dataset.frameMs = String(Math.round(mid));
      }
    }
    this.renderer.domElement.dataset.draws = String(this.renderer.info.render.calls);
  }

  private sampleFrame(): void {
    const source = this.renderer.domElement;
    const sample = document.createElement('canvas');
    sample.width = 64;
    sample.height = 32;
    const context = sample.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    context.drawImage(source, 0, 0, 64, 32);
    const data = context.getImageData(0, 0, 64, 32).data;
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 16) {
      const luma = (data[i]! + data[i + 1]! + data[i + 2]!) / 3;
      min = Math.min(min, luma);
      max = Math.max(max, luma);
    }
    source.dataset.variance = String(Math.round(max - min));
  }
}

function damp(current: number, target: number, dt: number): number {
  return current + (target - current) * Math.min(1, dt * 8);
}
