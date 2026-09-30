import {
  ACESFilmicToneMapping,
  AmbientLight,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  clay,
  createChest,
  createCloud,
  createDino,
  createFlower,
  createLabeledStone,
  createPalm,
  createPanda,
  createPodiumBlock,
  createQuizStone,
  createStarMesh,
  makeSkyTexture,
  type ChestRig,
  type DinoRig,
} from './actors';

export type StageMode = 'home' | 'quiz' | 'results';

interface Spark {
  mesh: Mesh;
  velocity: Vector3;
  life: number;
}

interface Burst {
  points: Points;
  velocities: Float32Array;
  age: number;
  life: number;
}

export class Stage {
  readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(30, 1, 0.1, 80);
  private readonly home = new Group();
  private readonly quiz = new Group();
  private readonly results = new Group();
  private readonly sky: Mesh;
  private readonly skies = {
    home: makeSkyTexture('#6ec8ff', '#b7e6ff', '#e7f7ff'),
    quiz: makeSkyTexture('#79d0ff', '#c6ecff', '#e5f8cf'),
    results: makeSkyTexture('#4c1d78', '#b15cff', '#ffb07a'),
  };
  private readonly homeDino: DinoRig;
  private readonly quizDino: DinoRig;
  private readonly resultsDino: DinoRig;
  private readonly quizChest: ChestRig;
  private readonly resultsChest: ChestRig;
  private readonly quizSlots: Vector3[] = [];
  private readonly quizStoneMats: ReturnType<typeof clay>[] = [];
  private readonly stars: Mesh[] = [];
  private readonly sparks: Spark[] = [];
  private readonly fireworks: Burst[] = [];
  private readonly sparkGeo = new SphereGeometry(0.045, 8, 6);
  private mode: StageMode = 'home';
  private hop = { from: new Vector3(), to: new Vector3(), t: 1, target: 0 };
  private quizStone = 0;
  private chestOpen = false;
  private fireworkTimer = 0;
  private sampleIn = 0;
  private running = true;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(0x8fd4ff, 1);

    const skyGeo = new SphereGeometry(36, 28, 18);
    this.sky = new Mesh(
      skyGeo,
      new MeshBasicMaterial({ map: this.skies.home, side: BackSide, depthWrite: false }),
    );
    this.scene.add(this.sky);

    this.addLights();
    this.homeDino = this.buildHome();
    this.quizDino = this.buildQuiz();
    const built = this.buildResults();
    this.resultsDino = built.dino;
    this.resultsChest = built.chest;
    this.quizChest = this.placeQuizChest();
    this.scene.add(this.home, this.quiz, this.results);
    this.quiz.visible = false;
    this.results.visible = false;

    const gl = this.renderer.getContext();
    canvas.dataset.renderer = String(gl.getParameter(gl.RENDERER) ?? '');
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.resize();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  setMode(mode: StageMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.home.visible = mode === 'home';
    this.quiz.visible = mode === 'quiz';
    this.results.visible = mode === 'results';
    const material = this.sky.material as MeshBasicMaterial;
    material.map = this.skies[mode];
    material.needsUpdate = true;
    this.renderer.setClearColor(mode === 'results' ? 0x5a2a86 : 0x8fd4ff, 1);
    if (mode === 'quiz') this.moveDino(this.quizStone, true);
    this.sampleIn = 0;
    this.resize();
  }

  setQuizStone(index: number, snap = false): void {
    const next = Math.max(0, Math.min(10, index));
    this.quizStone = next;
    for (let i = 0; i < this.quizStoneMats.length; i += 1) {
      const done = i < next;
      const material = this.quizStoneMats[i]!;
      material.color.set(done ? 0xffd34a : 0xf4f7fb);
      material.emissive.set(done ? 0xffc24a : 0x000000);
      material.emissiveIntensity = done ? 0.2 : 0;
    }
    this.quizChest.lid.rotation.x = next >= 10 ? -1.35 : 0;
    this.moveDino(next, snap || this.mode !== 'quiz');
  }

  setStars(count: number): void {
    this.stars.forEach((star, index) => {
      const earned = index < count;
      const material = star.material as ReturnType<typeof clay>;
      material.color.set(earned ? 0xffd34a : 0xd9d3c8);
      material.emissive.set(earned ? 0xffb703 : 0x000000);
      material.emissiveIntensity = earned ? 0.35 : 0;
      star.scale.setScalar(earned ? 1 : 0.92);
    });
  }

  setChestOpen(open: boolean): void {
    this.chestOpen = open;
  }

  burst(): void {
    const origin = this.quizDino.group.position.clone();
    origin.y += 0.85;
    for (let i = 0; i < 16; i += 1) {
      const mesh = new Mesh(
        this.sparkGeo,
        clay(i % 2 === 0 ? 0xffe27a : 0xffffff, { emissive: 0xffe27a, intensity: 0.8, roughness: 0.3 }),
      );
      mesh.position.copy(origin);
      const material = mesh.material as ReturnType<typeof clay>;
      material.transparent = true;
      this.quiz.add(mesh);
      this.sparks.push({
        mesh,
        velocity: new Vector3((Math.random() - 0.5) * 2.4, 0.9 + Math.random() * 1.8, (Math.random() - 0.5) * 2.4),
        life: 0.6,
      });
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
    this.camera.fov = this.mode === 'quiz' ? 28 : 30;
    this.applyCamera();
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private frame(): void {
    if (!this.running) return;
    const time = performance.now() / 1000;
    const dt = 1 / 60;
    this.homeDino.group.position.y = 0.32 + Math.sin(time * 2.1) * 0.035;
    this.homeDino.waveArm.rotation.z = 0.45 + Math.sin(time * 4.2) * 0.45;
    this.homeDino.group.rotation.y = 0.18 + Math.sin(time * 0.8) * 0.06;

    if (this.hop.t < 1) {
      this.hop.t = Math.min(1, this.hop.t + dt / 0.36);
      const eased = 1 - (1 - this.hop.t) ** 3;
      this.quizDino.group.position.lerpVectors(this.hop.from, this.hop.to, eased);
      this.quizDino.group.position.y += Math.sin(this.hop.t * Math.PI) * 0.48;
      this.quizDino.waveArm.rotation.z = 0.2 + Math.sin(this.hop.t * Math.PI) * 0.8;
    } else if (this.mode === 'quiz') {
      const base = this.quizSlots[this.hop.target];
      if (base) this.quizDino.group.position.y = base.y + Math.sin(time * 2.4) * 0.03;
      this.quizDino.waveArm.rotation.z = 0.25 + Math.sin(time * 3) * 0.18;
    }

    this.resultsDino.group.position.y = 0.84 + Math.sin(time * 2.6) * 0.03;
    this.resultsChest.lid.rotation.x = this.chestOpen || this.mode === 'results' ? -1.25 : -0.15;
    this.stars.forEach((star, index) => {
      star.rotation.y = time * 0.8 + index;
      star.position.y = 2.15 + Math.sin(time * 2 + index) * 0.06;
    });

    this.updateSparks(dt);
    if (this.mode === 'results') this.updateFireworks(dt);
    this.renderer.render(this.scene, this.camera);
    if (this.sampleIn <= 2) {
      this.sampleFrame();
      this.sampleIn += 1;
    }
  }

  private applyCamera(): void {
    if (this.mode === 'quiz') {
      this.camera.position.set(0.05, 2.05, 4.15);
      this.camera.lookAt(0.15, 0.42, -0.35);
    } else if (this.mode === 'results') {
      this.camera.position.set(0.15, 1.85, 4.7);
      this.camera.lookAt(0.05, 0.72, 0.05);
    } else {
      this.camera.position.set(0.15, 2.55, 5.55);
      this.camera.lookAt(0.05, 0.42, 0.15);
    }
  }

  private moveDino(index: number, snap: boolean): void {
    const dest = this.quizSlots[index];
    if (!dest) return;
    if (snap) {
      this.quizDino.group.position.copy(dest);
      this.hop.t = 1;
      this.hop.target = index;
      return;
    }
    if (this.hop.target === index) return;
    this.hop.from.copy(this.quizDino.group.position);
    this.hop.to.copy(dest);
    this.hop.t = 0;
    this.hop.target = index;
  }

  private addLights(): void {
    this.scene.add(new HemisphereLight(0xd9f3ff, 0x8dc56a, 0.78));
    this.scene.add(new AmbientLight(0xffffff, 0.28));
    const sun = new DirectionalLight(0xfff6e4, 1.55);
    sun.position.set(4.2, 7.2, 3.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 20;
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    sun.shadow.bias = -0.0006;
    this.scene.add(sun);
    const fill = new DirectionalLight(0xe7f4ff, 0.4);
    fill.position.set(-3.5, 2.4, 5);
    this.scene.add(fill);
  }

  private buildHome(): DinoRig {
    const groundY = 0.32;
    const dirt = new Mesh(new CylinderGeometry(2.05, 2.55, 1.05, 40), clay(0xc48958, { roughness: 0.86 }));
    dirt.position.y = -0.28;
    dirt.castShadow = true;
    dirt.receiveShadow = true;
    this.home.add(dirt);
    const dirtDark = new Mesh(new CylinderGeometry(2.28, 2.7, 0.28, 32), clay(0xa86b3c, { roughness: 0.9 }));
    dirtDark.position.y = -0.78;
    this.home.add(dirtDark);
    const grass = new Mesh(new CylinderGeometry(2.02, 2.12, 0.28, 40), clay(0x7ed14f, { roughness: 0.78 }));
    grass.position.y = 0.18;
    grass.receiveShadow = true;
    this.home.add(grass);
    for (let i = 0; i < 20; i += 1) {
      const angle = (i / 20) * Math.PI * 2;
      const tuft = new Mesh(new SphereGeometry(0.16, 10, 8), clay(i % 2 ? 0x93e25f : 0x62be3e));
      tuft.position.set(Math.cos(angle) * 1.95, 0.28, Math.sin(angle) * 1.95);
      tuft.scale.y = 0.65;
      this.home.add(tuft);
    }

    const spots: { label: string; kind: 'gold' | 'stone'; x: number; z: number }[] = [
      { label: '★', kind: 'gold', x: -1.15, z: 0.55 },
      { label: '2', kind: 'gold', x: -0.55, z: -0.05 },
      { label: '3', kind: 'stone', x: 0.12, z: 0.62 },
      { label: '4', kind: 'stone', x: 0.62, z: 0.02 },
      { label: '5', kind: 'stone', x: 0.32, z: -0.62 },
      { label: '6', kind: 'stone', x: 0.95, z: -1.05 },
    ];
    for (const spot of spots) {
      const stone = createLabeledStone(spot.label, spot.kind);
      stone.position.set(spot.x, groundY + 0.02, spot.z);
      this.home.add(stone);
    }

    const dino = createDino();
    dino.group.position.set(0.05, groundY, 1.12);
    dino.group.scale.setScalar(0.92);
    this.home.add(dino.group);

    const chest = createChest();
    chest.group.position.set(1.38, groundY, 0.48);
    chest.group.scale.setScalar(0.95);
    this.home.add(chest.group);

    const palms = [
      [-1.55, 0.15],
      [0.15, -1.4],
      [1.55, -0.45],
    ];
    for (const [x, z] of palms) {
      const palm = createPalm();
      palm.position.set(x!, groundY, z!);
      palm.scale.setScalar(0.95);
      this.home.add(palm);
    }

    const flowerColors = [0xff8fb8, 0xffd15c, 0xffffff, 0xff9a62, 0xffb3d9];
    for (let i = 0; i < 10; i += 1) {
      const flower = createFlower(flowerColors[i % flowerColors.length]!);
      const angle = (i / 10) * Math.PI * 2 + 0.3;
      const radius = 1.35 + (i % 3) * 0.18;
      flower.position.set(Math.cos(angle) * radius, groundY, Math.sin(angle) * radius);
      this.home.add(flower);
    }

    this.home.add(this.rainbow());

    const clouds = [
      [-2.4, 2.5, -1.2, 0.85],
      [2.2, 2.15, -0.4, 0.7],
      [-0.4, 2.8, -2.2, 0.6],
      [1.4, 1.7, 1.6, 0.45],
    ];
    for (const [x, y, z, scale] of clouds) {
      const cloud = createCloud();
      cloud.position.set(x!, y!, z!);
      cloud.scale.setScalar(scale!);
      this.home.add(cloud);
    }
    return dino;
  }

  private rainbow(): Group {
    const group = new Group();
    const colors = [0xff5d6e, 0xffa23a, 0xffe14a, 0x7ad957, 0x5ec8ff, 0xb07bff];
    colors.forEach((color, index) => {
      const arc = new Mesh(
        new TorusGeometry(1.7 - index * 0.07, 0.035, 8, 48, Math.PI),
        new MeshBasicMaterial({ color }),
      );
      arc.rotation.x = Math.PI / 2.4;
      arc.rotation.z = Math.PI;
      group.add(arc);
    });
    group.position.set(-1.35, 1.85, -1.15);
    group.rotation.y = 0.5;
    return group;
  }

  private buildQuiz(): DinoRig {
    const ground = new Mesh(new CylinderGeometry(7.5, 7.5, 0.4, 48), clay(0x7dce4e, { roughness: 0.86 }));
    ground.position.y = -0.22;
    ground.receiveShadow = true;
    this.quiz.add(ground);
    const hill = new Mesh(new SphereGeometry(3.2, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), clay(0x8ed85d, { roughness: 0.8 }));
    hill.scale.set(1.35, 0.22, 1);
    hill.position.set(0.2, -0.05, -0.4);
    hill.receiveShadow = true;
    this.quiz.add(hill);

    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      const slot = new Vector3(-2.35 + t * 4.7, i === 0 ? 0.02 : 0.14, 0.55 - t * 1.7);
      this.quizSlots.push(slot);
      if (i === 0) continue;
      const { mesh, material } = createQuizStone();
      mesh.position.copy(slot);
      mesh.position.y = 0.06;
      this.quiz.add(mesh);
      this.quizStoneMats.push(material);
    }

    const dino = createDino();
    dino.group.scale.setScalar(0.78);
    dino.group.position.copy(this.quizSlots[0]!);
    this.quiz.add(dino.group);

    const flowerColors = [0xff8fb8, 0xffd15c, 0xffffff, 0xc9a6ff];
    for (let i = 0; i < 8; i += 1) {
      const flower = createFlower(flowerColors[i % flowerColors.length]!);
      flower.position.set(-2.6 + i * 0.75, 0, 1.05 - (i % 2) * 0.25);
      this.quiz.add(flower);
    }
    const leftPalm = createPalm();
    leftPalm.position.set(-2.8, 0, -0.2);
    leftPalm.scale.setScalar(0.8);
    const rightPalm = createPalm();
    rightPalm.position.set(2.7, 0, 0.2);
    rightPalm.scale.setScalar(0.7);
    this.quiz.add(leftPalm, rightPalm);

    const cloud = createCloud();
    cloud.position.set(-1.8, 2.1, -1.4);
    cloud.scale.setScalar(0.7);
    this.quiz.add(cloud);
    return dino;
  }

  private placeQuizChest(): ChestRig {
    const chest = createChest();
    const end = this.quizSlots[10]!;
    chest.group.position.set(end.x + 0.55, 0, end.z - 0.05);
    chest.group.scale.setScalar(0.7);
    this.quiz.add(chest.group);
    return chest;
  }

  private buildResults(): { dino: DinoRig; chest: ChestRig } {
    const ground = new Mesh(new CylinderGeometry(6, 6, 0.3, 32), clay(0x7a4aa8, { roughness: 0.9 }));
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.results.add(ground);

    const places = [
      { label: '2', x: -0.72, h: 0.52, color: 0xf0c14d },
      { label: '1', x: 0, h: 0.82, color: 0xffd866 },
      { label: '3', x: 0.72, h: 0.4, color: 0xe6a63a },
    ];
    for (const place of places) {
      const block = createPodiumBlock(place.label, 0.64, place.h, place.color);
      block.position.set(place.x, place.h / 2, 0);
      this.results.add(block);
    }

    const dino = createDino({ cape: true, cheer: true });
    dino.group.position.set(0, 0.84, 0.02);
    dino.group.scale.setScalar(0.72);
    this.results.add(dino.group);

    const chest = createChest();
    chest.group.position.set(1.55, 0, 0.15);
    chest.lid.rotation.x = -1.25;
    this.results.add(chest.group);
    const panda = createPanda();
    panda.position.set(1.55, 0.72, 0.18);
    panda.scale.setScalar(0.85);
    this.results.add(panda);

    for (let i = 0; i < 3; i += 1) {
      const star = createStarMesh();
      star.position.set(-0.48 + i * 0.48, 2.15, 0.2);
      this.results.add(star);
      this.stars.push(star);
    }
    this.setStars(0);
    return { dino, chest };
  }

  private updateSparks(dt: number): void {
    for (let i = this.sparks.length - 1; i >= 0; i -= 1) {
      const spark = this.sparks[i]!;
      spark.life -= dt;
      spark.velocity.y -= dt * 2.2;
      spark.mesh.position.addScaledVector(spark.velocity, dt);
      const material = spark.mesh.material as ReturnType<typeof clay>;
      material.opacity = Math.max(0, spark.life / 0.6);
      if (spark.life <= 0) {
        spark.mesh.removeFromParent();
        material.dispose();
        this.sparks.splice(i, 1);
      }
    }
  }

  private updateFireworks(dt: number): void {
    this.fireworkTimer -= dt;
    if (this.fireworkTimer <= 0) {
      this.fireworkTimer = 0.75;
      this.spawnFirework(
        new Vector3((Math.random() - 0.5) * 3.2, 1.8 + Math.random() * 0.8, -0.6 - Math.random()),
        new Color().setHSL(Math.random(), 0.75, 0.62),
      );
    }
    for (let i = this.fireworks.length - 1; i >= 0; i -= 1) {
      const burst = this.fireworks[i]!;
      burst.age += dt;
      const position = burst.points.geometry.getAttribute('position') as BufferAttribute;
      for (let p = 0; p < position.count; p += 1) {
        position.setXYZ(
          p,
          position.getX(p) + burst.velocities[p * 3]! * dt,
          position.getY(p) + burst.velocities[p * 3 + 1]! * dt - dt * 0.35,
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

  private spawnFirework(origin: Vector3, color: Color): void {
    const count = 26;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.9 + Math.random() * 1.3;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed;
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const material = new PointsMaterial({
      color,
      size: 0.09,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new Points(geometry, material);
    this.results.add(points);
    this.fireworks.push({ points, velocities, age: 0, life: 1.25 });
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
