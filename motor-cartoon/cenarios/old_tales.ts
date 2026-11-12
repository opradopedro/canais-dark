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
export function buildMontanhaNuvens(hasEgg = false): ScenarioResult {
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
      wholeEgg.visible = hasEgg && cenaIdx < 4;
      shellGroup.visible = hasEgg && cenaIdx >= 4;
      ped.visible = hasEgg;
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

  // Stone feast table piled with peaches (from world.ts)
  const feast = new THREE.Group();
  feast.position.set(0, 0, -3.4);
  Cv.add(feast);
  const slab = mesh(rough(new THREE.BoxGeometry(4.2, 0.5, 1.6, 8, 2, 4), 0.06, 1.5, 33, false), rockM);
  slab.position.y = 0.55;
  feast.add(slab);
  for (const [x, z] of [[-1.6, 0], [1.6, 0]] as const) {
    const l = mesh(new THREE.BoxGeometry(0.5, 0.35, 1.2), rockM);
    l.position.set(x, 0.17, z);
    feast.add(l);
  }
  for (let i = 0; i < 16; i++) {
    const p = mesh(new THREE.SphereGeometry(0.16, 12, 10), peachM, false);
    p.position.set(-1.7 + (i % 8) * 0.48 + 0.1 * Math.sin(i), 0.92 + (i > 7 ? 0.0 : 0.02), i > 7 ? 0.35 : -0.3);
    feast.add(p);
  }

  return {
    group: Cv,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      entre_arvores: { x: 0, z: -2.8 },
      clareira: { x: 0, z: -2.8 },
      trono: { x: 0, y: 1.2, z: -6.8 },
      festa: { x: 0, z: -2.2 },
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

// ---------------- 9. MAR_JANGADA (Wukong Crossing the Sea on a Log Raft) ----------------
export function buildMarJangada(): ScenarioResult {
  const group = new THREE.Group();
  const seaTex = ctex("seaWaves", 512, 512, (g, r) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#1c6b8c");
    gr.addColorStop(0.5, "#2380a4");
    gr.addColorStop(1, "#185b7a");
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 65; i++) {
      const x = r() * 512, y = r() * 512, w = 45 + r() * 110;
      g.strokeStyle = i % 3 === 0 ? "rgba(225,248,255,0.55)" : "rgba(120,210,235,0.35)";
      g.lineWidth = 3 + r() * 4;
      g.beginPath();
      g.moveTo(x - w / 2, y);
      g.quadraticCurveTo(x, y - 8, x + w / 2, y);
      g.stroke();
    }
  });
  const seaRep = rep(seaTex, 14, 14);
  const seaM = lam("mj_sea", () => ({ map: seaRep }));
  const sea = mesh(new THREE.PlaneGeometry(240, 240), seaM, false);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.15;
  group.add(sea);

  // Wooden log raft with bamboo mast in the center
  const raft = new THREE.Group();
  const logM = lam("mj_log", () => ({ map: rep(planksHD(), 2, 1), color: "#9c7048" }));
  const ropeM = lam("mj_rope", () => ({ color: "#d6b87c" }));
  const sailM = lam("mj_sail", () => ({ color: "#efe4ce", side: THREE.DoubleSide }));
  for (let i = -4; i <= 4; i++) {
    const log = mesh(new THREE.CylinderGeometry(0.22, 0.22, 4.8, 12), logM);
    log.rotation.x = Math.PI / 2;
    log.position.set(i * 0.42, 0.02, 0);
    raft.add(log);
  }
  for (const z of [-1.7, 1.7]) {
    const cross = mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 10), ropeM);
    cross.rotation.z = Math.PI / 2;
    cross.position.set(0, 0.18, z);
    raft.add(cross);
  }
  // Bamboo mast & battered cloth sail at the back of the raft
  const mast = mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.8, 10), logM);
  mast.position.set(0, 1.9, -1.2);
  raft.add(mast);
  const boom = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), logM);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(0, 3.4, -1.2);
  raft.add(boom);
  const sail = mesh(rough(new THREE.PlaneGeometry(2.4, 2.2, 8, 8), 0.18, 0.8, 7, false), sailM);
  sail.position.set(0, 2.3, -1.1);
  raft.add(sail);
  group.add(raft);

  // Foam crests & distant jagged sea rocks
  const rockM = lam("mj_rock", () => ({ map: rep(ROCK(), 3, 3) }));
  for (const [rx, rz, rr, rh] of [[-14, -22, 4.5, 9], [18, -28, 5.5, 12], [-22, -8, 3.2, 6], [15, 10, 2.8, 5]] as const) {
    const crag = mesh(rough(new THREE.ConeGeometry(rr, rh, 12, 6), 0.9, 0.25, rx, false), rockM);
    crag.position.set(rx, rh * 0.35 - 1, rz);
    group.add(crag);
  }

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      jangada: { x: 0, y: 0.18, z: 0.4 },
      proa: { x: 0, y: 0.18, z: 1.6 },
      popa: { x: 0, y: 0.18, z: -0.9 },
      mar: { x: 2.8, y: 0, z: -2.5 },
      horizonte: { x: 0, y: 0.18, z: -4.0 },
    },
    update: (t: number) => {
      seaRep.offset.y = t * 0.18;
      raft.position.y = Math.sin(t * 2.2) * 0.06;
      raft.rotation.z = Math.sin(t * 1.7) * 0.025;
    },
  };
}

// ---------------- 10. PALACIO_DRAGAO (Dragon King Ao Guang's Underwater Crystal Palace + Ruyi Jingu Bang Pillar) ----------------
export function buildPalacioDragao(): ScenarioResult {
  const group = new THREE.Group();
  const sandM = lam("pd_sand", () => ({ map: rep(ROCK(), 8, 8), color: "#5498a8" }));
  const jadeM = lam("pd_jade", () => ({ map: rep(jadeTilesTex("#1e8a7a", "#12584e"), 6, 2) }));
  const coralRed = lam("pd_coralR", () => ({ color: "#e0524a" }));
  const coralGold = lam("pd_coralG", () => ({ color: "#e8a838" }));
  const pearlM = lam("pd_pearl", () => ({ color: "#fff6dc", emissive: new THREE.Color("#90e8ff"), emissiveIntensity: 0.45 }));
  const pillarGold = lam("pd_ironGold", () => ({
    color: "#f5c238",
    emissive: new THREE.Color("#ffae24"),
    emissiveIntensity: 0.55,
  }));
  const ironCore = lam("pd_ironCore", () => ({
    color: "#b82824",
    emissive: new THREE.Color("#ff5518"),
    emissiveIntensity: 0.28,
  }));

  const floor = mesh(new THREE.PlaneGeometry(160, 160), sandM);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // Crystal Palace Dragon Hall at z = -8.5
  const podium = mesh(new THREE.BoxGeometry(20, 1.0, 12), jadeM);
  podium.position.set(0, 0.5, -5.5);
  group.add(podium);

  for (const x of [-7.5, -4.5, 4.5, 7.5]) {
    const col = mesh(new THREE.CylinderGeometry(0.42, 0.48, 6.2, 16), coralRed);
    col.position.set(x, 4.1, -3.5);
    group.add(col);
    const ring = mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.35, 16), coralGold);
    ring.position.set(x, 1.2, -3.5);
    group.add(ring);
  }
  const roofG = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  roofG.rotateY(Math.PI / 4);
  const roof = mesh(roofG, jadeM);
  roof.scale.set(22, 3.2, 11);
  roof.position.set(0, 8.6, -5.5);
  group.add(roof);

  // THE GOLDEN-HOOPED IRON PILLAR (Ruyi Jingu Bang - 13,500 jin) glowing in the treasury center (x = 0, z = -2.2)
  const ironPillar = new THREE.Group();
  ironPillar.position.set(0, 1.0, -2.2);
  const ped = mesh(new THREE.CylinderGeometry(1.5, 1.9, 0.7, 20), jadeM);
  ped.position.y = 0.35;
  ironPillar.add(ped);
  const shaft = mesh(new THREE.CylinderGeometry(0.62, 0.68, 7.5, 24), ironCore);
  shaft.position.y = 4.2;
  ironPillar.add(shaft);
  for (const y of [1.2, 3.8, 6.8]) {
    const band = mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.9, 24), pillarGold);
    band.position.y = y;
    ironPillar.add(band);
  }
  group.add(ironPillar);

  // Coral formations & glowing sea pearls around the court
  for (const [cx, cz, s] of [[-5.8, 2.2, 1.3], [5.8, 2.0, 1.2], [-8.2, -1.2, 1.5], [8.2, -1.5, 1.4]] as const) {
    for (let b = 0; b < 4; b++) {
      const br = mesh(rough(new THREE.CylinderGeometry(0.12 * s, 0.22 * s, (1.6 + b * 0.4) * s, 8), 0.1, 1.5, b + cx, false), b % 2 ? coralRed : coralGold);
      br.position.set(cx + (b - 1.5) * 0.45, 0.8 * s, cz + (b % 2) * 0.3);
      br.rotation.z = (b - 1.5) * 0.22;
      group.add(br);
    }
    const pearl = mesh(new THREE.SphereGeometry(0.32 * s, 14, 12), pearlM);
    pearl.position.set(cx, 0.35 * s, cz + 0.6);
    group.add(pearl);
  }

  return {
    group,
    marcas: {
      pilar: { x: 0, y: 1.0, z: 0.4 },
      trono: { x: 0, y: 1.0, z: -4.2 },
      entrada: { x: 0, y: 0, z: 4.5 },
      escada: { x: 0, y: 0.5, z: 1.8 },
      armas: { x: -2.4, y: 1.0, z: 0.6 },
      templo: { x: 0, y: 1.0, z: 0.4 },
      ponte: { x: 2.2, y: 1.0, z: 0.6 },
      torii: { x: 0, y: 0, z: 4.2 },
      lanterna: { x: -1.8, y: 1.0, z: 0.4 },
    },
  };
}

// ---------------- 11. SUBMUNDO (Diyu / Hall of the Ten Kings & Book of Life and Death) ----------------
export function buildSubmundo(): ScenarioResult {
  const group = new THREE.Group();
  const darkStone = lam("sb_stone", () => ({ map: rep(stoneHD("sbSt"), 10, 10), color: "#3d3848" }));
  const pillarM = lam("sb_pil", () => ({ map: rep(ROCK(), 2, 4), color: "#2c2636" }));
  const crimsonM = lam("sb_crim", () => ({ color: "#7a1c24" }));
  const scrollM = lam("sb_book", () => ({
    color: "#f5ead2",
    emissive: new THREE.Color("#ffd88a"),
    emissiveIntensity: 0.35,
  }));
  const ghostGlow = lam("sb_glow", () => ({
    color: "#68f0b8",
    emissive: new THREE.Color("#38d896"),
    emissiveIntensity: 0.75,
  }));

  const floor = mesh(new THREE.PlaneGeometry(160, 160), darkStone);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // High Judgment Altar & Desk of the Ten Kings at z = -3.8
  const dais = mesh(new THREE.BoxGeometry(12, 1.1, 6.5), pillarM);
  dais.position.set(0, 0.55, -4.5);
  group.add(dais);

  const desk = mesh(new THREE.BoxGeometry(4.6, 1.3, 1.8), crimsonM);
  desk.position.set(0, 1.7, -3.2);
  group.add(desk);

  // Open Book of Life and Death on the judgment desk
  const bookL = mesh(new THREE.BoxGeometry(1.1, 0.12, 1.3), scrollM);
  bookL.position.set(-0.56, 2.42, -3.1);
  bookL.rotation.z = -0.12;
  group.add(bookL);
  const bookR = mesh(new THREE.BoxGeometry(1.1, 0.12, 1.3), scrollM);
  bookR.position.set(0.56, 2.42, -3.1);
  bookR.rotation.z = 0.12;
  group.add(bookR);

  // Towering obsidian pillars & ghostly green soul lanterns along the hall
  for (const x of [-5.2, 5.2]) {
    for (const z of [-6.0, -1.5, 3.0]) {
      const col = mesh(rough(new THREE.CylinderGeometry(0.55, 0.65, 7.5, 12, 6), 0.12, 0.8, x + z, false), pillarM);
      col.position.set(x, 3.75, z);
      group.add(col);
      const lantern = mesh(new THREE.SphereGeometry(0.32, 12, 10), ghostGlow);
      lantern.scale.y = 1.35;
      lantern.position.set(x * 0.82, 2.8, z);
      group.add(lantern);
    }
  }

  // Dark portal archway behind the altar
  const archL = mesh(new THREE.BoxGeometry(1.4, 7.5, 1.4), pillarM);
  archL.position.set(-3.8, 4.2, -7.2);
  group.add(archL);
  const archR = mesh(new THREE.BoxGeometry(1.4, 7.5, 1.4), pillarM);
  archR.position.set(3.8, 4.2, -7.2);
  group.add(archR);
  const archTop = mesh(new THREE.BoxGeometry(9.8, 1.2, 1.6), crimsonM);
  archTop.position.set(0, 8.2, -7.2);
  group.add(archTop);

  return {
    group,
    marcas: {
      mesa: { x: 0, y: 0, z: -1.2 },
      livro: { x: 0, y: 0, z: -1.4 },
      juiz: { x: 0, y: 1.1, z: -4.4 },
      entrada: { x: 0, y: 0, z: 4.5 },
      corredor: { x: 0, y: 0, z: 1.8 },
      pilares: { x: -2.4, y: 0, z: 0.2 },
      fundo: { x: 0, y: 1.1, z: -5.2 },
      mausoleu: { x: 0, y: 0, z: -1.2 },
      cruz_grande: { x: 0, y: 0, z: -1.4 },
      entre_cruzes: { x: 0, y: 0, z: 1.6 },
    },
  };
}

// ---------------- 12. JARDIM_PESSEGOS (Heavenly Immortal Peach Orchard & Banquet Table) ----------------
export function buildJardimPessegos(): ScenarioResult {
  const group = new THREE.Group();
  const r = rng(41);
  const cloudMaps = [0, 1, 2, 3].map((k) => cloudHD(k, CLOUD_GOLD));

  const cloudFloor = new THREE.Mesh(new THREE.CircleGeometry(500, 48), new THREE.MeshBasicMaterial({ color: "#fbf4ea" }));
  cloudFloor.rotation.x = -Math.PI / 2;
  cloudFloor.layers.set(NOINK);
  group.add(cloudFloor);

  for (let i = 0; i < 28; i++) {
    const a = r() * TAU, d = 14 + r() ** 0.7 * 180, w = 18 + r() * 42;
    if (Math.hypot(Math.cos(a) * d, Math.sin(a) * d) < 11) continue;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w / 2),
      new THREE.MeshBasicMaterial({ map: cloudMaps[i % 4], transparent: true, depthWrite: false })
    );
    m.position.set(Math.cos(a) * d, w * 0.08 - 1.0, Math.sin(a) * d);
    m.layers.set(NOINK);
    m.renderOrder = 2;
    group.add(m);
  }

  const mar = lam("jp_marble", () => ({ map: rep(marbleTex(), 4, 4) }));
  const barkM = lam("jp_bark", () => ({ color: "#5e3c2c" }));
  const blossomM = lam("jp_blossom", () => ({ color: "#e87a98" }));
  const leafM = lam("jp_leaf", () => ({ color: "#4e9a48" }));
  const peachImmortal = lam("jp_peach", () => ({
    color: "#ff8578",
    emissive: new THREE.Color("#ffae52"),
    emissiveIntensity: 0.38,
  }));
  const goldM = lam("jp_gold", () => ({ color: "#e8b638" }));
  const redM = lam("jp_red", () => ({ color: "#c4322a" }));

  const terrace = mesh(new THREE.CylinderGeometry(11, 11.5, 0.5, 48), mar);
  terrace.position.y = -0.25;
  group.add(terrace);

  // Ancient 9,000-year Immortal Peach Trees heavy with glowing peaches
  for (const [tx, tz, sc] of [[-4.2, -3.5, 1.35], [4.4, -3.2, 1.3], [0, -6.2, 1.5], [-6.5, 1.8, 1.15], [6.5, 2.0, 1.2]] as const) {
    const trunk = mesh(new THREE.CylinderGeometry(0.24 * sc, 0.38 * sc, 3.2 * sc, 10), barkM);
    trunk.position.set(tx, 1.5 * sc, tz);
    group.add(trunk);
    const canopy = mesh(rough(new THREE.IcosahedronGeometry(2.3 * sc, 2), 0.35 * sc, 0.8, tx, false), tx === 0 ? blossomM : leafM);
    canopy.position.set(tx, 3.8 * sc, tz);
    canopy.scale.y = 0.78;
    group.add(canopy);
    for (let i = 0; i < 12; i++) {
      const a = i * 2.1, e = 0.3 + 0.5 * h3(i, tx, tz);
      const p = mesh(new THREE.SphereGeometry(0.26 * sc, 12, 10), peachImmortal);
      p.position.set(
        tx + Math.cos(a) * 2.1 * sc * Math.cos(e),
        3.7 * sc + 1.6 * sc * Math.sin(e) - 0.35,
        tz + Math.sin(a) * 2.1 * sc * Math.cos(e)
      );
      group.add(p);
    }
  }

  // Royal Banquet Table & Laozi's Golden Pill Gourds at x = 0, z = 0.8
  const table = mesh(new THREE.BoxGeometry(3.8, 0.85, 1.6), redM);
  table.position.set(0, 0.42, -0.8);
  group.add(table);
  for (const gx of [-1.1, -0.35, 0.4, 1.15]) {
    const gourd = mesh(new THREE.SphereGeometry(0.24, 12, 10), goldM);
    gourd.scale.y = 1.45;
    gourd.position.set(gx, 1.05, -0.8);
    group.add(gourd);
  }

  return {
    group,
    marcas: {
      jardim: { x: 0, z: 1.2 },
      arvore: { x: -2.2, z: -1.6 },
      banquete: { x: 0, z: 0.6 },
      mesa: { x: 0, z: 0.6 },
      entrada: { x: 0, z: 4.5 },
      templo: { x: 0, z: 0.6 },
    },
  };
}

// ---------------- 13. FORNALHA_CEU (Laozi's Eight-Trigram Furnace / Bagua Brazier) ----------------
export function buildFornalhaCeu(): ScenarioResult {
  const group = new THREE.Group();
  const mar = lam("fc_marble", () => ({ map: rep(marbleTex(), 6, 6), color: "#d8cec0" }));
  const bronzeM = lam("fc_bronze", () => ({ color: "#8c6232" }));
  const darkBronze = lam("fc_dbronze", () => ({ color: "#4a331c" }));
  const fireM = lam("fc_fire", () => ({
    color: "#ff6a18",
    emissive: new THREE.Color("#ff9224"),
    emissiveIntensity: 0.95,
  }));
  const coreFireM = lam("fc_core", () => ({
    color: "#fff090",
    emissive: new THREE.Color("#ffe055"),
    emissiveIntensity: 1.1,
  }));

  const floor = mesh(new THREE.CircleGeometry(80, 48), mar);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // Octagonal Bagua Platform & Colossal Bronze Cauldron Furnace at (0, 0, -2.5)
  const furnace = new THREE.Group();
  furnace.position.set(0, 0, -2.5);
  const base1 = mesh(new THREE.CylinderGeometry(4.2, 4.8, 0.6, 8), mar);
  base1.position.y = 0.3;
  furnace.add(base1);
  const base2 = mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.6, 8), darkBronze);
  base2.position.y = 0.9;
  furnace.add(base2);

  // Cauldron belly & rim
  const belly = mesh(rough(new THREE.CylinderGeometry(2.6, 2.0, 3.2, 16, 6), 0.08, 1.2, 9, false), bronzeM);
  belly.position.y = 2.6;
  furnace.add(belly);
  const rim = mesh(new THREE.CylinderGeometry(2.85, 2.7, 0.45, 16), darkBronze);
  rim.position.y = 4.25;
  furnace.add(rim);

  // Raging Samadhi Fire tongues erupting from the cauldron
  const flames: THREE.Mesh[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    const r = i === 0 ? 0 : 1.1;
    const h = i === 0 ? 3.2 : 2.2 + (i % 3) * 0.4;
    const fl = mesh(rough(new THREE.ConeGeometry(i === 0 ? 1.4 : 0.85, h, 10, 4), 0.22, 1.4, i + 1, false), i === 0 ? coreFireM : fireM, false);
    fl.position.set(Math.cos(a) * r, 4.3 + h * 0.35, Math.sin(a) * r);
    furnace.add(fl);
    flames.push(fl);
  }
  group.add(furnace);

  return {
    group,
    marcas: {
      fornalha: { x: 0, y: 1.2, z: 0.4 },
      topo_fornalha: { x: 0, y: 4.1, z: -2.2 },
      degraus: { x: 0, y: 0.6, z: 1.2 },
      patio: { x: 0, y: 0, z: 2.8 },
      entrada: { x: 0, y: 0, z: 5.0 },
      templo: { x: 0, y: 0.6, z: 0.8 },
      escada: { x: 0, y: 0.6, z: 1.5 },
    },
    update: (t: number) => {
      flames.forEach((fl, i) => {
        fl.scale.y = 0.88 + 0.24 * Math.sin(t * 11 + i * 1.7);
        fl.rotation.y = t * (i % 2 ? 1.5 : -1.5);
      });
    },
  };
}

// ---------------- 14. MAO_BUDA (Buddha's Palm & Five Flesh-Pink Finger Pillars at the Edge of the World) ----------------
export function buildMaoBuda(): ScenarioResult {
  const group = new THREE.Group();
  const r = rng(53);
  const cloudMaps = [0, 1, 2, 3].map((k) => cloudHD(k, CLOUD_GOLD));

  const cloudFloor = new THREE.Mesh(new THREE.CircleGeometry(600, 48), new THREE.MeshBasicMaterial({ color: "#f9e8d8" }));
  cloudFloor.rotation.x = -Math.PI / 2;
  cloudFloor.layers.set(NOINK);
  group.add(cloudFloor);

  for (let i = 0; i < 32; i++) {
    const a = r() * TAU, d = 14 + r() ** 0.7 * 220, w = 22 + r() * 48;
    if (Math.abs(Math.cos(a) * d) < 10 && Math.sin(a) * d > -12 && Math.sin(a) * d < 20) continue;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, w / 2),
      new THREE.MeshBasicMaterial({ map: cloudMaps[i % 4], transparent: true, depthWrite: false })
    );
    m.position.set(Math.cos(a) * d, w * 0.08 - 1.0, Math.sin(a) * d);
    m.layers.set(NOINK);
    m.renderOrder = 2;
    group.add(m);
  }

  // Flesh-pink / golden-warm stone material for the 5 Finger-Pillars of Buddha's hand
  const fingerM = lam("mb_finger", () => ({ map: rep(ROCK(), 2, 6), color: "#f0b8a8" }));
  const palmM = lam("mb_palm", () => ({ map: rep(ROCK(), 4, 4), color: "#e8ae9c" }));

  // Palm platform
  const palm = mesh(rough(new THREE.CylinderGeometry(9.5, 11.0, 1.6, 36, 3), 0.25, 0.35, 12), palmM);
  palm.position.set(0, -0.7, -1.5);
  group.add(palm);

  // Five colossal Finger-Pillars rising into the clouds at the back of the palm
  const fingers: [number, number, number, number][] = [
    [-6.2, -4.2, 1.35, 11.5], // Thumb
    [-3.1, -6.2, 1.25, 15.5], // Index
    [0.0, -6.8, 1.38, 17.5],  // Middle finger (where Wukong writes "The Great Sage Equal to Heaven Was Here")
    [3.1, -6.2, 1.25, 15.0],  // Ring
    [5.8, -4.6, 1.12, 12.0],  // Pinky
  ];
  for (const [fx, fz, rad, fh] of fingers) {
    const col = mesh(rough(new THREE.CylinderGeometry(rad * 0.92, rad * 1.08, fh, 24, 12), 0.14, 0.4, fx, false), fingerM);
    col.position.set(fx, fh / 2 - 0.5, fz);
    group.add(col);
    const tip = mesh(rough(new THREE.SphereGeometry(rad * 0.92, 20, 12), 0.08, 0.6, fx + 5, false), fingerM);
    tip.position.set(fx, fh - 0.5, fz);
    group.add(tip);
  }

  // Brush-written calligraphy strip on the middle finger-pillar
  const inkTex = ctex("wukongInscr", 256, 1024, (g) => {
    g.fillStyle = "#f0b8a8";
    g.fillRect(0, 0, 256, 1024);
    g.fillStyle = "#1a1218";
    for (let i = 0; i < 8; i++) {
      const y = 120 + i * 95;
      g.fillRect(88, y, 80, 18);
      g.fillRect(118, y - 22, 20, 64);
      g.fillRect(96, y + 26, 64, 14);
    }
  });
  const inscr = mesh(new THREE.PlaneGeometry(1.1, 5.2), lam("mb_inscr", () => ({ map: inkTex })));
  inscr.position.set(0, 3.2, -5.35);
  group.add(inscr);

  return {
    group,
    marcas: {
      palma: { x: 0, y: 0.1, z: 0.8 },
      pilar_central: { x: 0, y: 0.1, z: -3.6 },
      pilares: { x: -1.8, y: 0.1, z: -2.8 },
      beira: { x: 0, y: 0.1, z: 3.5 },
      templo: { x: 0, y: 0.1, z: 0.8 },
      pe_torre: { x: 0, y: 0.1, z: -3.6 },
    },
  };
}

// ---------------- 15. MONTANHA_CINCO_DEDOS (Five-Finger Mountain Trapping Wukong for 500 Years) ----------------
export function buildMontanhaCincoDedos(): ScenarioResult {
  const group = new THREE.Group();
  const grassM = lam("mcd_grass", () => ({ map: rep(grassHD(), 14, 14) }));
  const rockM = lam("mcd_rock", () => ({ map: rep(ROCK(), 5, 6), color: "#8e8276" }));
  const sealM = lam("mcd_seal", () => ({
    color: "#f5c838",
    emissive: new THREE.Color("#ffae24"),
    emissiveIntensity: 0.65,
  }));

  const ground = mesh(new THREE.PlaneGeometry(160, 160), grassM);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  // Massive Five-Peaked Mountain rising directly at z = -4.5 (crushing Wukong at its base z = -1.6)
  const mtn = new THREE.Group();
  mtn.position.set(0, 0, -4.8);
  const mainMass = mesh(rough(new THREE.ConeGeometry(7.8, 13.5, 24, 12), 1.2, 0.25, 31, false), rockM);
  mainMass.position.y = 5.8;
  mtn.add(mainMass);

  // Five finger-like rocky crags at the crest
  for (const [px, py, pr, ph] of [[-4.5, 8.5, 1.8, 5.5], [-2.2, 10.2, 1.7, 6.5], [0, 11.2, 1.9, 7.2], [2.2, 10.0, 1.7, 6.2], [4.4, 8.2, 1.6, 5.0]] as const) {
    const peak = mesh(rough(new THREE.CylinderGeometry(pr * 0.7, pr * 1.1, ph, 14, 6), 0.35, 0.5, px * 7, false), rockM);
    peak.position.set(px, py, 0.4);
    mtn.add(peak);
  }

  // Heavy rock arch pinning Wukong at the mountain base (x = 0, z = 3.0 -> world z = -1.8)
  const archL = mesh(rough(new THREE.BoxGeometry(3.2, 2.4, 3.0, 6, 6, 6), 0.35, 0.8, 41, false), rockM);
  archL.position.set(-2.0, 1.0, 3.0);
  mtn.add(archL);
  const archR = mesh(rough(new THREE.BoxGeometry(3.2, 2.4, 3.0, 6, 6, 6), 0.35, 0.8, 42, false), rockM);
  archR.position.set(2.0, 1.0, 3.0);
  mtn.add(archR);
  const slabTop = mesh(rough(new THREE.BoxGeometry(6.8, 2.2, 3.4, 8, 6, 6), 0.4, 0.6, 43, false), rockM);
  slabTop.position.set(0, 2.5, 3.0);
  mtn.add(slabTop);

  // Golden Buddhist Talisman Seal glowing above the crevice & on the peak
  const sealLow = mesh(new THREE.BoxGeometry(0.85, 1.8, 0.08), sealM);
  sealLow.position.set(0, 3.2, 4.72);
  mtn.add(sealLow);
  group.add(mtn);

  addTree(group, -6.5, 0, 1.5, 5.2, 81, "pine");
  addTree(group, 6.8, 0, 2.2, 5.5, 82, "pine");

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      base: { x: 0, y: -0.35, z: -1.5 },
      pedra: { x: 0, y: -0.35, z: -1.5 },
      toco: { x: 0, y: -0.35, z: -1.5 },
      selo: { x: 0, y: 0, z: 0.8 },
      trilha: { x: -1.6, y: 0, z: 4.2 },
      clareira: { x: 0, y: 0, z: 1.6 },
    },
  };
}

// ---------------- 16. GRECIA_TEMPLO (Ancient Greek Marble Temple for Perseus & Medusa) ----------------
export function buildGreciaTemplo(): ScenarioResult {
  return buildEspartaCidade();
}

// ---------------- 17. ILHA_MAR (Rocky Aegean Island & Shore) ----------------
export function buildIlhaMar(): ScenarioResult {
  const group = new THREE.Group();
  const seaM = lam("im_sea", () => ({ color: "#1c7294" }));
  const sandM = lam("im_sand", () => ({ map: rep(ROCK(), 8, 8), color: "#d8c6a4" }));
  const rockM = lam("im_rock", () => ({ map: rep(ROCK(), 4, 4), color: "#9c8e7e" }));
  const colM = lam("im_col", () => ({ map: rep(marbleTex(), 2, 4) }));

  const sea = mesh(new THREE.PlaneGeometry(220, 220), seaM, false);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.25;
  group.add(sea);

  const island = mesh(rough(new THREE.CylinderGeometry(14, 18, 1.2, 40, 3), 0.45, 0.25, 19), sandM);
  island.position.set(0, -0.4, -2.0);
  group.add(island);

  for (const [rx, rz, rr, rh] of [[-7.5, -8.5, 3.8, 8.5], [8.2, -7.8, 4.2, 9.5], [0, -12.5, 5.5, 11.0]] as const) {
    const crag = mesh(rough(new THREE.ConeGeometry(rr, rh, 14, 6), 0.8, 0.3, rx, false), rockM);
    crag.position.set(rx, rh * 0.4, rz);
    group.add(crag);
  }
  for (const x of [-3.2, 3.2]) {
    const col = mesh(new THREE.CylinderGeometry(0.42, 0.48, 4.2, 16), colM);
    col.position.set(x, 2.1, -4.5);
    group.add(col);
  }

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      praia: { x: 0, z: 3.2 },
      rochas: { x: -2.5, z: -1.5 },
      ruinas: { x: 0, z: -2.2 },
      topo: { x: 0, z: -4.0 },
    },
  };
}

// ---------------- 18. CAVERNA_GORGONAS (Medusa's Gorgon Lair with Petrified Stone Statues) ----------------
export function buildCavernaGorgonas(): ScenarioResult {
  const group = new THREE.Group();
  const darkRock = lam("cg_rock", () => ({ map: rep(ROCK(), 6, 6), color: "#4a4652" }));
  const statueM = lam("cg_statue", () => ({ map: rep(ROCK(), 2, 2), color: "#98949c" }));

  const floor = mesh(new THREE.PlaneGeometry(120, 120), darkRock);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  // Jagged cavern walls & broken Greek columns
  for (const side of [-1, 1]) {
    for (let z = -16; z <= 8; z += 6) {
      const crag = mesh(rough(new THREE.BoxGeometry(5, 11, 6, 6, 8, 6), 0.9, 0.3, z * side, false), darkRock);
      crag.position.set(side * 8.5, 5.0, z);
      group.add(crag);
    }
  }
  // Petrified warrior statues frozen in the cavern
  for (const [sx, sz] of [[-3.4, -2.5], [3.6, -1.8], [-2.8, 2.4], [3.2, -5.8]] as const) {
    const ped = mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.4, 12), statueM);
    ped.position.set(sx, 0.2, sz);
    group.add(ped);
    const torso = mesh(rough(new THREE.CylinderGeometry(0.32, 0.28, 1.25, 10, 4), 0.05, 2.0, sx, false), statueM);
    torso.position.set(sx, 1.0, sz);
    group.add(torso);
    const head = mesh(new THREE.SphereGeometry(0.24, 12, 10), statueM);
    head.position.set(sx, 1.82, sz);
    group.add(head);
  }

  return {
    group,
    marcas: {
      ...UNIVERSAL_FOREST_MARKS,
      centro: { x: 0, z: 0 },
      estatuas: { x: -1.8, z: -1.2 },
      pilares: { x: 2.0, z: -2.0 },
      entrada: { x: 0, z: 4.8 },
      altar: { x: 0, z: -4.2 },
    },
  };
}
