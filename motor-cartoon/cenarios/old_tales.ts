// Cenarios for Old Tales (CL036..CL050 and future series):
// - montanha_nuvens, cachoeira, caverna_reino, palacio_ceu (ported directly from templates/wukong/world.ts)
// - aldeia_china (Mulan), esparta_cidade & campo_batalha (Leonidas), mosteiro (Robin Hood)
import * as THREE from "three";
import {
  ScenarioResult, MarkDef, TAU, h3, rough, lam, mesh, rep, ctex, rng,
  ROCK, EGGTEX, grassHD, cobbleHD, stoneHD, roofHD, planksHD,
  CLOUD_DAY, CLOUD_GOLD, cloudHD, addTree, addGabledHouse,
} from "./comum";
import { NOINK } from "../src/ink";

const marbleTex = () =>
  ctex("marbleW", 512, 512, (g, r) => {
    g.fillStyle = "#efe8dc";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 30; i++) {
      const x = r() * 512, y = r() * 512, rad = 40 + r() * 90;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, r() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(200,190,180,0.25)");
      gr.addColorStop(1, "rgba(200,190,180,0)");
      g.fillStyle = gr;
      g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
    }
    g.strokeStyle = "rgba(120,100,100,0.35)";
    g.lineWidth = 3;
    for (let y = 0; y <= 512; y += 128) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke();
    }
    for (let y = 0; y < 512; y += 128) {
      for (let x = (y / 128) % 2 ? 0 : 128; x < 512; x += 256) {
        g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 128); g.stroke();
      }
    }
  });

const jadeTilesTex = (col: string, dark: string) =>
  ctex("tiles" + col, 512, 512, (g) => {
    g.fillStyle = col;
    g.fillRect(0, 0, 512, 512);
    g.strokeStyle = dark;
    g.lineWidth = 10;
    for (let x = 16; x < 512; x += 42) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke();
    }
  });

const waterfallTex = (bright: number) =>
  ctex("waterfall" + bright, 256, 1024, (g, r) => {
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, "#7fc6d9");
    gr.addColorStop(0.5, "#a9e0ec");
    gr.addColorStop(1, "#7fc6d9");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 90; i++) {
      const x = r() * 256, y = r() * 1024, l = 80 + r() * 260, w = 2 + r() * 7;
      g.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * r() * bright})`;
      for (const dy of [0, -1024, 1024]) g.fillRect(x, y + dy, w, l);
    }
    for (let i = 0; i < 30; i++) {
      const x = r() * 256, y = r() * 1024;
      g.fillStyle = "rgba(60,130,160,0.25)";
      for (const dy of [0, -1024, 1024]) g.fillRect(x, y + dy, 3, 120 + r() * 200);
    }
  });

const UNIVERSAL_FOREST_MARKS: Record<string, MarkDef> = {
  clareira: { x: 1.2, z: 3.4 },
  trilha: { x: -1.5, z: 5.5 },
  entre_arvores: { x: -4.2, z: -3.2 },
  pe_torre: { x: 3.0, z: -1.6 },
  fundo: { x: 0, z: -5.5 },
  toco: { x: 1.8, z: -0.6 },
};

// ---------------- 1. MONTANHA_NUVENS (Wukong Summit + Karst Pillars + Sea of Clouds + Stone Egg) ----------------
export function buildMontanhaNuvens(): ScenarioResult {
  const P = new THREE.Group();
  const rockM = lam("wk_rock", () => ({ map: rep(ROCK(), 3, 3) }));
  const rockBig = lam("wk_rockBig", () => ({ map: rep(ROCK(), 6, 10) }));
  const grassM = lam("wk_grass", () => ({ map: rep(grassHD(), 4, 4) }));
  const pineM = lam("wk_pine", () => ({ color: "#3f7a4a" }));
  const barkM = lam("wk_bark", () => ({ color: "#6b4a36" }));
  const cloudMaps = [0, 1, 2, 3].map((k) => cloudHD(k, CLOUD_GOLD));

  // Summit pillar (top at y = 0, radius ~9), grass cap
  const sg = rough(new THREE.CylinderGeometry(8.6, 6.2, 70, 48, 24, true), 1.0, 0.18, 3);
  const summit = mesh(sg, rockBig);
  summit.position.y = -35.2;
  P.add(summit);
  const cap = mesh(rough(new THREE.CylinderGeometry(9.0, 8.7, 0.6, 48, 2), 0.35, 0.3, 9), grassM);
  cap.position.y = -0.3;
  P.add(cap);
  const ped = mesh(rough(new THREE.CylinderGeometry(1.25, 1.6, 0.35, 24, 2), 0.12, 1.2, 4), rockM);
  ped.position.set(0, 0.05, 0);
  P.add(ped);

  // Stone Egg on pedestal (whole egg before cracking, cracked shell after)
  const eggMat = lam("wk_eggWhole", () => ({
    map: rep(EGGTEX(), 2, 1),
    emissive: new THREE.Color("#ffb23c"),
    emissiveIntensity: 0.45,
  }));
  const wholeEgg = mesh(new THREE.SphereGeometry(0.95, 48, 32), eggMat);
  wholeEgg.scale.set(0.8, 1.05, 0.8);
  wholeEgg.position.set(0, 1.1, 0);
  P.add(wholeEgg);

  const shellGroup = new THREE.Group();
  shellGroup.position.set(0, 0, 0);
  const halfShell = mesh(new THREE.SphereGeometry(0.95, 32, 20, 0, TAU, Math.PI * 0.55, Math.PI * 0.45), rockM);
  halfShell.scale.set(0.8, 1.0, 0.8);
  halfShell.position.y = 0.95;
  shellGroup.add(halfShell);
  P.add(shellGroup);

  // Boulders on summit
  for (const [x, z, r] of [[-4.5, -3.5, 0.8], [5.8, -2.0, 0.55], [-6.4, 3.0, 0.65], [6.0, -5.5, 0.9]] as const) {
    const b = mesh(rough(new THREE.IcosahedronGeometry(r, 2), r * 0.3, 1.5, x, false), rockM);
    b.position.set(x, r * 0.35, z);
    b.scale.y = 0.7;
    P.add(b);
  }

  // Mountain pines
  const pine = (parent: THREE.Object3D, x: number, y: number, z: number, h: number) => {
    const t = mesh(new THREE.CylinderGeometry(0.06 * h, 0.1 * h, h * 0.8, 7), barkM);
    t.position.set(x, y + h * 0.4, z);
    parent.add(t);
    for (let i = 0; i < 3; i++) {
      const w = h * (0.55 - i * 0.13);
      const c = mesh(new THREE.ConeGeometry(w, h * 0.22, 9), pineM);
      c.position.set(x + (i - 1) * 0.08 * h, y + h * (0.45 + i * 0.2), z);
      parent.add(c);
    }
  };
  pine(P, -6.0, 0, -6.5, 3.6);
  pine(P, -3.5, 0, -7.6, 3.0);
  pine(P, -7.2, 0, 1.0, 2.6);

  // Karst pillars around summit
  const r = rng(5);
  let placed = 0;
  for (let i = 0; i < 90 && placed < 26; i++) {
    const a = r() * TAU, d = 28 + r() ** 0.7 * 200, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x, z) < 42 && z > -5) continue;
    const top = -14 + r() * 24, rad = 5 + r() * 8, h = top + 60;
    const g = rough(new THREE.CylinderGeometry(rad * 0.85, rad * 1.1, h, 24, 10, true), rad * 0.18, 0.12, i);
    const m = mesh(g, rockBig, d < 80);
    m.position.set(x, top - h / 2, z);
    P.add(m);
    const c = mesh(
      rough(new THREE.SphereGeometry(rad * 0.9, 16, 8, 0, TAU, 0, Math.PI / 2), rad * 0.12, 0.25, i + 3, false),
      lam("wk_moss", () => ({ color: "#5f9c4a" })),
      false
    );
    c.scale.y = 0.35;
    c.position.set(x, top - 0.4, z);
    P.add(c);
    placed++;
  }

  // Sea of clouds
  const sea = new THREE.Mesh(new THREE.CircleGeometry(900, 40), new THREE.MeshBasicMaterial({ color: "#f2d8bc" }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -16;
  sea.layers.set(NOINK);
  P.add(sea);

  for (let i = 0; i < 32; i++) {
    const a = r() * TAU, d = 16 + r() ** 0.8 * 240, w = 28 + r() * 60;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w / 2),
      new THREE.MeshBasicMaterial({ map: cloudMaps[i % 4], transparent: true, depthWrite: false })
    );
    m.position.set(Math.cos(a) * d, -14 + r() * 4, Math.sin(a) * d);
    m.layers.set(NOINK);
    m.renderOrder = 2;
    P.add(m);
  }

  // Waterfall cliff in the distance (at x = 14)
  const falls: THREE.Texture[] = [];
  const cliff = new THREE.Group();
  cliff.position.set(14.6, 0, -2.0);
  cliff.rotation.y = -Math.PI / 3;
  P.add(cliff);
  const cm = mesh(rough(new THREE.BoxGeometry(28, 70, 14, 16, 24, 6), 1.1, 0.2, 11, false), rockBig);
  cm.position.set(0, -18, -7.5);
  cliff.add(cm);
  for (let k = 0; k < 2; k++) {
    const t = waterfallTex(1 + k).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 3);
    t.needsUpdate = true;
    falls.push(t);
    const wm = new THREE.MeshBasicMaterial({ map: t, transparent: k === 1, opacity: k ? 0.55 : 1, side: THREE.DoubleSide, depthWrite: k === 0 });
    const wf = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 54), wm);
    wf.position.set(0, -8, 0.1 + k * 0.2);
    wf.layers.set(NOINK);
    cliff.add(wf);
  }

  return {
    group: P,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      pe_torre: { x: 0, z: 0 },
      clareira: { x: 0, z: 0 },
      toco: { x: 0, z: 0 },
      trilha: { x: -1.8, z: 2.2 },
      fundo: { x: 0, z: -2.0 },
      topo: { x: 0, z: 0 },
      ovo: { x: 0, z: 0 },
      beira: { x: 4.8, z: 0.5 },
      salto: { x: 5.5, z: -1.0 },
    },
    update: (t: number, _isNight: boolean, cenaIdx: number) => {
      wholeEgg.visible = cenaIdx < 4;
      shellGroup.visible = cenaIdx >= 4;
      for (const tx of falls) tx.offset.y = t * 1.6;
    },
  };
}

// ---------------- 2. CACHOEIRA (Waterfall Cliff Close-up) ----------------
export function buildCachoeira(): ScenarioResult {
  const group = new THREE.Group();
  const rockBig = lam("wk_rockBig", () => ({ map: rep(ROCK(), 6, 10) }));
  const grassM = lam("wk_grass", () => ({ map: rep(grassHD(), 4, 4) }));
  const rockM = lam("wk_rock", () => ({ map: rep(ROCK(), 3, 3) }));

  // Ledge where the monkeys stand before jumping
  const ledge = mesh(rough(new THREE.CylinderGeometry(9.5, 8.5, 1.2, 36, 2), 0.3, 0.3, 5), grassM);
  ledge.position.set(0, -0.6, 1.5);
  group.add(ledge);

  // Towering cliff wall & cascading waterfall right behind fundo (z = -5.5)
  const cliff = new THREE.Group();
  cliff.position.set(0, 0, -5.5);
  group.add(cliff);

  const cm = mesh(rough(new THREE.BoxGeometry(32, 70, 12, 16, 24, 6), 1.1, 0.2, 11, false), rockBig);
  cm.position.set(0, -10, -6.5);
  cliff.add(cm);

  const falls: THREE.Texture[] = [];
  for (let k = 0; k < 2; k++) {
    const t = waterfallTex(1 + k).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 3);
    t.needsUpdate = true;
    falls.push(t);
    const wm = new THREE.MeshBasicMaterial({
      map: t,
      transparent: k === 1,
      opacity: k ? 0.6 : 1,
      side: THREE.DoubleSide,
      depthWrite: k === 0,
    });
    const wf = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 54), wm);
    wf.position.set(0, 2, 0.15 + k * 0.2);
    wf.layers.set(NOINK);
    cliff.add(wf);
  }

  for (const [bx, bz, br] of [[-4.2, -1.8, 0.85], [4.4, -1.5, 0.9], [-5.5, 1.5, 0.75]] as const) {
    const b = mesh(rough(new THREE.IcosahedronGeometry(br, 2), br * 0.3, 1.4, bx, false), rockM);
    b.position.set(bx, br * 0.35, bz);
    b.scale.y = 0.7;
    group.add(b);
  }

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      fundo: { x: 0, z: -1.5 },
      clareira: { x: 0, z: 0 },
      pe_torre: { x: 0, z: -1.5 },
    },
    update: (t: number) => {
      for (const tx of falls) tx.offset.y = t * 1.6;
    },
  };
}

// ---------------- 3. CAVERNA_REINO (Hidden Kingdom behind the Waterfall from world.ts) ----------------
export function buildCavernaReino(): ScenarioResult {
  const Cv = new THREE.Group();
  const rockM = lam("cv_rock", () => ({ map: rep(ROCK(), 3, 3) }));
  const grassM = lam("cv_grass", () => ({ map: rep(grassHD(), 4, 4) }));
  const barkM = lam("cv_bark", () => ({ color: "#6b4a36" }));
  const leafM = lam("cv_leaf", () => ({ color: "#5aa34a" }));
  const peachM = lam("cv_peach", () => ({ color: "#f39a86" }));

  const floor = mesh(
    rough(new THREE.CircleGeometry(21, 64), 0.0, 0.2, 1),
    lam("cv_floor", () => ({ map: rep(ROCK(), 5, 5), color: "#d6c9b0" }))
  );
  floor.rotation.x = -Math.PI / 2;
  Cv.add(floor);

  const grassPatch = mesh(new THREE.CircleGeometry(7.5, 40), grassM);
  grassPatch.rotation.x = -Math.PI / 2;
  grassPatch.position.set(0, 0.02, -1);
  Cv.add(grassPatch);

  const gap = 0.75;
  const dome = mesh(
    rough(new THREE.SphereGeometry(20, 48, 24, Math.PI / 2 + gap, TAU - 2 * gap, Math.PI * 0.2, Math.PI * 0.3), 1.6, 0.18, 21, false),
    lam("cv_wall", () => ({ map: rep(ROCK(), 8, 4), side: THREE.DoubleSide }))
  );
  Cv.add(dome);

  // Curtain of water
  const ct = waterfallTex(2).clone();
  ct.wrapS = ct.wrapT = THREE.RepeatWrapping;
  ct.repeat.set(5, 1.2);
  ct.needsUpdate = true;
  const curtain = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 22),
    new THREE.MeshBasicMaterial({ map: ct, side: THREE.DoubleSide, color: new THREE.Color(1.15, 1.15, 1.15) })
  );
  curtain.position.set(0, 10, 16.4);
  curtain.layers.set(NOINK);
  Cv.add(curtain);

  // Stone throne near clareira / trono
  const thr = new THREE.Group();
  thr.position.set(0, 0, -6.8);
  Cv.add(thr);
  const blk = (w: number, h: number, d: number, x: number, y: number, z: number, s: number) => {
    const m = mesh(rough(new THREE.BoxGeometry(w, h, d, 6, 6, 6), 0.08, 1.4, s, false), rockM);
    m.position.set(x, y, z);
    thr.add(m);
  };
  blk(4.4, 0.6, 3.2, 0, 0.3, 0, 1);
  blk(3.4, 0.6, 2.6, 0, 0.9, -0.2, 2);
  blk(3.0, 2.6, 0.7, 0, 2.2, -1.2, 3);
  blk(0.7, 1.0, 2.2, -1.5, 1.6, -0.2, 4);
  blk(0.7, 1.0, 2.2, 1.5, 1.6, -0.2, 5);

  // Peach trees inside cave kingdom
  for (const [x, z, s] of [[-7.5, -5.5, 1.2], [8.0, -4.8, 1.1], [-9.5, 3.5, 1.0], [9.5, 4.2, 1.2]] as const) {
    const t = mesh(new THREE.CylinderGeometry(0.18 * s, 0.3 * s, 3 * s, 8), barkM);
    t.position.set(x, 1.5 * s, z);
    Cv.add(t);
    const c = mesh(rough(new THREE.IcosahedronGeometry(2.2 * s, 2), 0.35 * s, 0.8, x, false), leafM);
    c.position.set(x, 3.6 * s, z);
    c.scale.y = 0.8;
    Cv.add(c);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, e = 0.4 + 0.5 * h3(i, x, z);
      const p = mesh(new THREE.SphereGeometry(0.2 * s, 10, 8), peachM, false);
      p.position.set(x + Math.cos(a) * 2.1 * s * Math.cos(e), 3.6 * s + 1.7 * s * Math.sin(e) - 0.4, z + Math.sin(a) * 2.1 * s * Math.cos(e));
      Cv.add(p);
    }
  }

  return {
    group: Cv,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      entre_arvores: { x: 0, z: -2.8 },
      clareira: { x: 0, z: -2.8 },
      trono: { x: 0, y: 1.2, z: -6.8 },
      entrada: { x: 0, z: 5.5 },
    },
    update: (t: number) => {
      ct.offset.y = t * 1.6;
    },
  };
}

// ---------------- 4. PALACIO_CEU (Jade Palace in Heaven on Cloud Floor from world.ts) ----------------
export function buildPalacioCeu(): ScenarioResult {
  const Hv = new THREE.Group();
  const r = rng(19);
  const cloudMaps = [0, 1, 2, 3].map((k) => cloudHD(k, CLOUD_GOLD));

  const cloudFloor = new THREE.Mesh(new THREE.CircleGeometry(600, 48), new THREE.MeshBasicMaterial({ color: "#fbf6f0" }));
  cloudFloor.rotation.x = -Math.PI / 2;
  cloudFloor.layers.set(NOINK);
  Hv.add(cloudFloor);

  for (let i = 0; i < 36; i++) {
    const a = r() * TAU, d = 14 + r() ** 0.7 * 220, w = 18 + r() * 48;
    if (Math.abs(Math.cos(a) * d) < 12 && Math.sin(a) * d > -10 && Math.sin(a) * d < 40) continue;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w / 2),
      new THREE.MeshBasicMaterial({ map: cloudMaps[i % 4], transparent: true, depthWrite: false })
    );
    m.position.set(Math.cos(a) * d, w * 0.08 - 1.2, Math.sin(a) * d);
    m.layers.set(NOINK);
    m.renderOrder = 2;
    Hv.add(m);
  }

  const mar = lam("hv_marble", () => ({ map: rep(marbleTex(), 4, 1) }));
  const red = lam("hv_red", () => ({ color: "#c2392f" }));
  const gold = lam("hv_gold", () => ({ color: "#e6b43a" }));
  const jade = lam("hv_jade", () => ({ map: rep(jadeTilesTex("#2f9a74", "#1f6e52"), 8, 2) }));
  const wallM = lam("hv_wall", () => ({ color: "#e9d9b8" }));

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => {
    const o = mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    Hv.add(o);
    return o;
  };
  box(20, 1.2, 14, 0, 0.6, -2, mar);
  for (let i = 0; i < 4; i++) box(8 - i * 0.6, 0.3, 1.0, 0, 0.15 + i * 0.3, 5.5 - i * 0.5 + 1.5, mar);
  box(14, 4.8, 6, 0, 3.6, -3.5, wallM);
  box(2.4, 3.2, 0.2, 0, 2.8, -0.45, lam("hv_door", () => ({ color: "#8e2a2a" })));
  for (const x of [-6.5, -4, -1.6, 1.6, 4, 6.5]) {
    const c = mesh(new THREE.CylinderGeometry(0.32, 0.36, 5.0, 16), red);
    c.position.set(x, 3.7, 0.9);
    Hv.add(c);
    const cb = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.25, 16), gold);
    cb.position.set(x, 1.32, 0.9);
    Hv.add(cb);
  }
  box(15.6, 0.5, 0.6, 0, 6.3, 0.9, red);
  box(15.6, 0.25, 0.65, 0, 6.0, 0.9, gold);

  const roof = (w: number, d: number, h: number, y: number, z: number) => {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    const m = mesh(g, jade);
    m.scale.set(w, h, d);
    m.position.set(0, y + h / 2, z);
    Hv.add(m);
    const ridge = mesh(new THREE.BoxGeometry(w * 0.3, 0.22, 0.22), gold);
    ridge.position.set(0, y + h - 0.05, z);
    Hv.add(ridge);
  };
  roof(19, 10, 2.6, 6.5, -1.5);
  box(10, 1.8, 5, 0, 9.6, -2, wallM);
  roof(13, 7, 2.2, 10.4, -2);
  for (const x of [-2.8, 2.8]) {
    const p = mesh(new THREE.SphereGeometry(0.35, 16, 10), gold);
    p.position.set(x, 12.7, -2);
    Hv.add(p);
  }

  return {
    group: Hv,
    marcas: {
      templo: { x: 0, y: 1.2, z: 4.6 },
      torii: { x: 0, y: 1.2, z: 4.8 },
      ponte: { x: 2.2, y: 1.2, z: 4.4 },
      escada: { x: 0, y: 1.2, z: 4.6 },
      jardim: { x: -2.4, y: 1.2, z: 4.4 },
      lanterna: { x: 1.8, y: 1.2, z: 4.4 },
      salao: { x: 0, y: 1.2, z: 4.6 },
      colunas: { x: -2.0, y: 1.2, z: 3.2 },
      nuvens: { x: 0, y: 0, z: 8.5 },
    },
  };
}

// ---------------- 5. ALDEIA_CHINA (Mulan Village) ----------------
export function buildAldeiaChina(): ScenarioResult {
  const group = new THREE.Group();
  const grassM = lam("chn_grass", () => ({ map: rep(grassHD(), 16, 16) }));
  const cobbleM = lam("chn_cobble", () => ({ map: rep(cobbleHD(), 10, 10) }));
  const wallM = lam("chn_wall", () => ({ color: "#ece3cf" }));
  const redM = lam("chn_red", () => ({ color: "#b8362c" }));
  const roofM = lam("chn_roof", () => ({ map: rep(roofHD("#3e4a56", true), 4, 2) }));

  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  const plaza = mesh(new THREE.CircleGeometry(14, 48), cobbleM);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.02, 1.5);
  group.add(plaza);

  const addChineseHouse = (x: number, z: number, yaw: number, w: number, d: number, h: number) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    const body = mesh(new THREE.BoxGeometry(w, h, d), wallM);
    body.position.y = h / 2;
    g.add(body);
    const door = mesh(new THREE.BoxGeometry(1.4, 2.2, 0.14), redM);
    door.position.set(0, 1.1, d / 2 + 0.04);
    g.add(door);
    const rg = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    rg.rotateY(Math.PI / 4);
    const rm = mesh(rg, roofM);
    rm.scale.set(w + 1.4, d * 0.45, d + 1.4);
    rm.position.y = h + d * 0.22;
    g.add(rm);
    group.add(g);
  };

  addChineseHouse(9.2, -3.2, -Math.PI / 2, 6.4, 4.8, 3.8);
  addChineseHouse(-9.2, -2.5, Math.PI / 2, 6.0, 4.6, 3.6);
  addChineseHouse(0, -10.5, 0, 7.5, 5.2, 4.2);

  addTree(group, -5.5, 0, 4.5, 4.8, 61, "cherry");
  addTree(group, 6.2, 0, 4.2, 5.0, 62, "cherry");
  addTree(group, -6.8, 0, -8.5, 5.6, 63, "pine");

  return {
    group,
    marcas: {
      praca: { x: 0, z: 3.2 },
      poco: { x: 1.8, z: 1.4 },
      moinho: { x: -9, z: 12 },
      taverna: { x: 7.6, z: 11.2 },
      mercado: { x: 0, z: 2.6 },
      casa: { x: 6.2, z: -3.2 },
      alto: { x: 0, y: 1.5, z: 0 },
      templo: { x: 0, z: -1.2 },
      jardim: { x: -5.4, z: 4.4 },
    },
  };
}

// ---------------- 6. ESPARTA_CIDADE (Sparta Stone Plaza & Doric Columns) ----------------
export function buildEspartaCidade(): ScenarioResult {
  const group = new THREE.Group();
  const stoneM = lam("sp_stone", () => ({ map: rep(stoneHD("spStone"), 10, 10), color: "#d6c5a8" }));
  const colM = lam("sp_col", () => ({ map: rep(marbleTex(), 2, 4) }));
  const redM = lam("sp_red", () => ({ color: "#a82420" }));
  const bronzeM = lam("sp_bronze", () => ({ color: "#b5893d" }));

  const ground = mesh(new THREE.PlaneGeometry(160, 160), stoneM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Colonnade & temple steps
  const podium = mesh(new THREE.BoxGeometry(18, 1.2, 8), colM);
  podium.position.set(0, 0.6, -8.5);
  group.add(podium);

  for (const x of [-7.2, -4.4, -1.8, 1.8, 4.4, 7.2]) {
    const col = mesh(new THREE.CylinderGeometry(0.45, 0.54, 5.8, 16), colM);
    col.position.set(x, 4.1, -5.2);
    group.add(col);
    const cap = mesh(new THREE.BoxGeometry(1.25, 0.35, 1.25), colM);
    cap.position.set(x, 7.1, -5.2);
    group.add(cap);
  }
  const entablature = mesh(new THREE.BoxGeometry(17.5, 1.1, 2.2), colM);
  entablature.position.set(0, 7.8, -5.2);
  group.add(entablature);

  // Crimson Spartan banners & bronze braziers
  for (const sx of [-4.5, 4.5]) {
    const banner = mesh(new THREE.BoxGeometry(1.1, 3.6, 0.08), redM);
    banner.position.set(sx, 4.2, -4.5);
    group.add(banner);
    const brazier = mesh(new THREE.CylinderGeometry(0.55, 0.3, 1.2, 12), bronzeM);
    brazier.position.set(sx * 0.8, 0.6, 1.2);
    group.add(brazier);
  }

  return {
    group,
    marcas: {
      praca: { x: 0, z: 3.2 },
      poco: { x: 1.8, z: 1.4 },
      moinho: { x: -9, z: 12 },
      taverna: { x: 7.6, z: 11.2 },
      mercado: { x: 0, z: 2.6 },
      casa: { x: 6.2, z: -3.2 },
      alto: { x: 0, y: 1.5, z: 0 },
      templo: { x: 0, z: -1.2 },
      escada: { x: -1.5, z: -1.3 },
    },
  };
}

// ---------------- 7. CAMPO_BATALHA (Thermopylae Rocky Pass / Battlefield) ----------------
export function buildCampoBatalha(): ScenarioResult {
  const group = new THREE.Group();
  const dirtM = lam("cb_dirt", () => ({ map: rep(ROCK(), 8, 8), color: "#9c856b" }));
  const cliffM = lam("cb_cliff", () => ({ map: rep(ROCK(), 4, 6), color: "#807264" }));

  const ground = mesh(new THREE.PlaneGeometry(160, 160), dirtM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Towering rocky canyon walls on left and right (Thermopylae pass)
  for (const side of [-1, 1]) {
    for (let z = -28; z <= 18; z += 9) {
      const w = 7 + (Math.abs(z) % 4);
      const h = 14 + (Math.abs(z * 3) % 8);
      const crag = mesh(rough(new THREE.BoxGeometry(w, h, 10, 8, 12, 8), 1.1, 0.22, z * side, false), cliffM);
      crag.position.set(side * (9.5 + w * 0.35), h / 2 - 0.5, z);
      group.add(crag);
    }
  }

  // Scattered boulders & fallen spears
  for (const [bx, bz, br] of [[-4.8, -5.5, 1.1], [5.2, -3.2, 0.95], [-5.4, 4.2, 0.85], [4.6, -11.0, 1.3]] as const) {
    const b = mesh(rough(new THREE.IcosahedronGeometry(br, 2), br * 0.3, 1.4, bx, false), cliffM);
    b.position.set(bx, br * 0.35, bz);
    b.scale.y = 0.7;
    group.add(b);
  }

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      meio: { x: 0, z: 0 },
      vindo: { x: 0.8, z: 10 },
      indo: { x: -0.8, z: -10 },
      acostamento: { x: -3.6, z: 2 },
      ponto: { x: 3.6, z: -4 },
      curva: { x: 0, z: -18 },
      beira_mato: { x: -5.5, z: -6 },
    },
  };
}

// ---------------- 8. MOSTEIRO (Robin Hood Stone Monastery & Courtyard) ----------------
export function buildMosteiro(): ScenarioResult {
  const group = new THREE.Group();
  const grassM = lam("mos_grass", () => ({ map: rep(grassHD(), 16, 16) }));
  const stoneM = lam("mos_stone", () => ({ map: rep(stoneHD("mosSt"), 4, 4) }));
  const roofM = lam("mos_roof", () => ({ map: rep(roofHD("#6d7787", true), 4, 2) }));

  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Abbey church & bell tower at z = -8.5
  const abbey = new THREE.Group();
  abbey.position.set(0, 0, -8.5);
  const nave = mesh(new THREE.BoxGeometry(10.5, 5.6, 6.8), stoneM);
  nave.position.y = 2.8;
  abbey.add(nave);
  const roofGeo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  roofGeo.rotateY(Math.PI / 4);
  const roof = mesh(roofGeo, roofM);
  roof.scale.set(11.4, 2.8, 7.6);
  roof.position.y = 6.9;
  abbey.add(roof);
  const bellTower = mesh(new THREE.BoxGeometry(3.4, 9.5, 3.4), stoneM);
  bellTower.position.set(-4.2, 4.75, 1.2);
  abbey.add(bellTower);
  const spire = mesh(new THREE.ConeGeometry(2.6, 3.2, 4), roofM);
  spire.rotation.y = Math.PI / 4;
  spire.position.set(-4.2, 11.1, 1.2);
  abbey.add(spire);
  group.add(abbey);

  addTree(group, -6.8, 0, 2.5, 5.8, 71, "round");
  addTree(group, 6.5, 0, 1.8, 5.6, 72, "round");
  addTree(group, 7.2, 0, -5.5, 6.0, 73, "round");

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      praca: { x: 0, z: 3.2 },
      poco: { x: 1.8, z: 1.4 },
      casa: { x: 5.2, z: -2.5 },
      entrada: { x: 0, z: 8.5 },
    },
  };
}
