// Shared procedural 3D scenery builders in the exact Wukong / Bridge house style:
// twoTone Lambert materials, noise-deformed natural rock (rough), hand-painted canvas textures (paint.ts),
// gabled houses with 3D relief, rounded storybook vegetation. Zero external .glb dependencies.
import * as THREE from "three";
import {
  ctex, rep, rng, grassHD, cobbleHD, stoneHD, roofHD, facadeHD, planksHD, brick, CLOUD_DAY, CLOUD_GOLD, cloudHD,
} from "../src/paint";
import { twoTone } from "../src/shade";
import { NOINK } from "../src/ink";

export interface MarkDef {
  x: number;
  y?: number;
  z: number;
  cam?: { x: number; y: number; z: number };
}

export interface ScenarioResult {
  group: THREE.Group;
  marcas: Record<string, MarkDef>;
  limites?: { x: number; z: number; h: number };
  update?: (t: number, isNight: boolean, cenaIdx: number) => void;
}

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const TAU = Math.PI * 2;

// ---------------- 3D value noise & rock deformation (from world.ts) ----------------
export const h3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

export const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const s = (t: number) => t * t * (3 - 2 * t), u = s(xf), v = s(yf), w = s(zf);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => h3(xi + dx, yi + dy, zi + dz);
  return (
    L(
      L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v),
      L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v),
      w
    ) * 2 - 1
  );
};

export const fbm = (x: number, y: number, z: number) =>
  vnoise(x, y, z) * 0.6 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.12;

export const rough = (g: THREE.BufferGeometry, amp: number, freq: number, seed: number, radial = true) => {
  const p = g.attributes.position as THREE.BufferAttribute, n = new THREE.Vector3();
  g.computeVertexNormals();
  const nn = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (radial) n.set(x, 0, z).normalize();
    else n.set(nn.getX(i), nn.getY(i), nn.getZ(i));
    const d = amp * fbm(x * freq + seed, y * freq, z * freq - seed);
    p.setXYZ(i, x + n.x * d, y + n.y * d, z + n.z * d);
  }
  g.computeVertexNormals();
  return g;
};

// ---------------- shared materials & textures ----------------
const mats = new Map<string, THREE.MeshLambertMaterial>();
export const lam = (key: string, p: () => THREE.MeshLambertMaterialParameters) => {
  let m = mats.get(key);
  if (!m) {
    m = twoTone(new THREE.MeshLambertMaterial(p()));
    mats.set(key, m);
  }
  return m;
};

export const mesh = (g: THREE.BufferGeometry, m: THREE.Material, shadow = true) => {
  const o = new THREE.Mesh(g, m);
  o.castShadow = shadow;
  o.receiveShadow = true;
  return o;
};

const blot = (g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col);
  gr.addColorStop(1, col.replace(/[\d.]+\)$/, "0)"));
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, 2 * r, 2 * r);
};

export const rockTex = (key: string, base: string, light: string, dark: string) =>
  ctex(key, 1024, 1024, (g, r) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 70; i++) {
      const x = r() * 1024, y = r() * 1024, rad = 60 + r() * 200;
      for (const [dx, dy] of [[0, 0], [1024, 0], [-1024, 0], [0, 1024], [0, -1024]]) {
        blot(g, x + dx, y + dy, rad, r() > 0.5 ? light : dark);
      }
    }
    g.lineCap = "round";
    for (let i = 0; i < 14; i++) {
      const y0 = r() * 1024;
      g.strokeStyle = "rgba(60,50,60,0.10)";
      g.lineWidth = 3 + r() * 5;
      g.beginPath();
      for (let x = -20; x <= 1044; x += 40) g.lineTo(x, y0 + 12 * Math.sin(x * 0.01 + i) + 6 * Math.sin(x * 0.037));
      g.stroke();
    }
    for (let i = 0; i < 26; i++) {
      let x = r() * 1024, y = r() * 1024;
      g.strokeStyle = "rgba(40,30,45,0.35)";
      g.lineWidth = 2 + r() * 2;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (r() - 0.5) * 50;
        y += 10 + r() * 30;
        g.lineTo(x, y);
      }
      g.stroke();
    }
  });

export const ROCK = () => rockTex("rockA", "#a59a8c", "rgba(206,196,178,0.35)", "rgba(110,98,104,0.28)");
export const EGGTEX = () => rockTex("eggS", "#c9c3b8", "rgba(236,230,218,0.45)", "rgba(150,140,140,0.25)");

export const asphaltTex = () =>
  ctex("asphaltHD", 512, 512, (g, r) => {
    g.fillStyle = "#3a3e48";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      blot(g, r() * 512, r() * 512, 30 + r() * 70, r() > 0.5 ? "rgba(85,92,108,0.22)" : "rgba(28,30,38,0.24)");
    }
    for (let i = 0; i < 400; i++) {
      g.fillStyle = r() > 0.5 ? "rgba(120,128,142,0.25)" : "rgba(25,28,34,0.3)";
      g.fillRect(r() * 512, r() * 512, 2, 2);
    }
  });

export const hospitalTileTex = () =>
  ctex("hospTileHD", 512, 512, (g, r) => {
    const N = 8, S = 512 / N;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const odd = (x + y) % 2 === 1;
        g.fillStyle = odd ? "#b8c6ce" : "#d8e2e6";
        g.fillRect(x * S, y * S, S, S);
        g.strokeStyle = "rgba(75,90,100,0.35)";
        g.lineWidth = 2;
        g.strokeRect(x * S + 1, y * S + 1, S - 2, S - 2);
        if (r() < 0.3) {
          g.fillStyle = "rgba(255,255,255,0.18)";
          g.fillRect(x * S + 6, y * S + 6, S - 12, 4);
        }
      }
    }
  });

// ---------------- Storybook trees & pines ----------------
const LEAF_COLS = ["#5aa83c", "#4c9a37", "#69b545", "#3f8f3c"];
export function addTree(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  h: number,
  seed = 1,
  kind: "round" | "pine" | "dead" | "cherry" = "round"
) {
  const r = rng(Math.abs(Math.floor(seed * 97 + x * 31 + z * 17)) + 5);
  const barkM = lam("barkTree", () => ({ color: kind === "dead" ? "#4a3b32" : "#784d33" }));

  if (kind === "pine") {
    const pineM = lam("pineTree", () => ({ color: "#3b7646" }));
    const t = mesh(new THREE.CylinderGeometry(0.06 * h, 0.11 * h, h * 0.55, 8), barkM);
    t.position.set(x, y + h * 0.27, z);
    parent.add(t);
    for (let i = 0; i < 3; i++) {
      const w = h * (0.42 - i * 0.09);
      const cone = mesh(new THREE.ConeGeometry(w, h * 0.34, 10), pineM);
      cone.position.set(x + (r() - 0.5) * 0.04 * h, y + h * (0.42 + i * 0.22), z);
      parent.add(cone);
    }
    return;
  }

  if (kind === "dead") {
    const trunk = mesh(new THREE.CylinderGeometry(0.07 * h, 0.14 * h, h * 0.65, 8), barkM);
    trunk.position.set(x, y + h * 0.32, z);
    parent.add(trunk);
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2 + 0.4;
      const br = mesh(new THREE.CylinderGeometry(0.025 * h, 0.055 * h, h * 0.42, 6), barkM);
      br.position.set(x + Math.cos(ang) * h * 0.14, y + h * (0.58 + (i % 2) * 0.08), z + Math.sin(ang) * h * 0.14);
      br.rotation.z = -Math.cos(ang) * 0.65;
      br.rotation.x = Math.sin(ang) * 0.65;
      parent.add(br);
    }
    return;
  }

  const col = kind === "cherry" ? "#f29cb4" : LEAF_COLS[Math.abs(Math.floor(seed)) % LEAF_COLS.length];
  const leafM = lam("leaf_" + col, () => ({ color: col }));
  const trunk = mesh(new THREE.CylinderGeometry(0.065 * h, 0.11 * h, h * 0.48, 8), barkM);
  trunk.position.set(x, y + h * 0.24, z);
  parent.add(trunk);

  const lobeGeo = new THREE.SphereGeometry(1, 16, 12);
  const putLobe = (dx: number, dy: number, dz: number, rad: number) => {
    const m = mesh(lobeGeo, leafM);
    m.position.set(x + dx, y + dy, z + dz);
    m.scale.set(rad, rad * 0.88, rad);
    parent.add(m);
  };
  const cy = h * 0.64;
  putLobe(0, cy, 0, h * 0.27);
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4 + r() * 0.4;
    putLobe(Math.cos(a) * h * 0.18, cy - h * 0.04, Math.sin(a) * h * 0.18, h * 0.2);
  }
  putLobe(0, cy + h * 0.16, 0, h * 0.19);
}

// ---------------- Storybook Gabled House ----------------
const HOUSE_STYLES = [
  { wall: "#ecdab2", shutter: "#3f6fb5", roof: "#d27a62", timber: true },
  { wall: "#d8a95f", shutter: "#2f6a43", roof: "#b8644f" },
  { wall: "#c47a5c", shutter: "#2f5f6a", roof: "#8f97a8" },
  { wall: "#ddbd78", shutter: "#5a3b2a", roof: "#d27a62", timber: true },
  { wall: "#e2c49a", shutter: "#8c3b4a", roof: "#c9775a" },
  { wall: "#e3d2b8", shutter: "#2f6a43", roof: "#8f97a8", brick: true },
];

export function addGabledHouse(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  yaw: number,
  w: number,
  d: number,
  h: number,
  styleIdx = 0
) {
  const st = HOUSE_STYLES[Math.abs(styleIdx) % HOUSE_STYLES.length];
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const frontM = lam(`hfront_${styleIdx}_${w}_${h}`, () => ({
    map: facadeHD(`hf_${styleIdx}_${w}_${h}`, w, h, { ...st, door: true }),
  }));
  const sideM = lam(`hside_${styleIdx}_${d}_${h}`, () => ({
    map: facadeHD(`hs_${styleIdx}_${d}_${h}`, d, h, st),
  }));
  const roofM = lam(`hroof_${st.roof}`, () => ({
    map: rep(roofHD(st.roof, st.roof === "#8f97a8"), Math.max(1, Math.round(w / 4)), 2),
    side: THREE.DoubleSide,
  }));
  const plinthM = lam("hplinth", () => ({ map: rep(stoneHD("copeHD"), 2, 1) }));

  // Main body box with front/back/side materials
  const body = mesh(new THREE.BoxGeometry(w, h, d), [sideM, sideM, plinthM, plinthM, frontM, sideM]);
  body.position.set(0, h / 2, 0);
  g.add(body);

  // Stone plinth
  const plinth = mesh(new THREE.BoxGeometry(w + 0.16, 0.45, d + 0.16), plinthM);
  plinth.position.set(0, 0.225, 0);
  g.add(plinth);

  // Pitched roof
  const rh = d * 0.42;
  const roofGeo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  roofGeo.rotateY(Math.PI / 4);
  const roofMesh = mesh(roofGeo, roofM);
  roofMesh.scale.set(w + 0.6, rh, d + 0.6);
  roofMesh.position.set(0, h + rh / 2 - 0.1, 0);
  g.add(roofMesh);

  // Brick chimney
  const chimM = lam("hchim", () => ({ map: rep(brick(), 1, 1) }));
  const chim = mesh(new THREE.BoxGeometry(0.75, rh + 0.9, 0.75), chimM);
  chim.position.set(w * 0.25, h + rh * 0.55, -d * 0.2);
  g.add(chim);

  parent.add(g);
  return g;
}

// ---------------- Street Lamp with warm night glow ----------------
export function addStreetLamp(parent: THREE.Object3D, x: number, y: number, z: number, height = 4.6) {
  const ironM = lam("ironLamp", () => ({ color: "#2d323c" }));
  const g = new THREE.Group();
  g.position.set(x, y, z);

  const post = mesh(new THREE.CylinderGeometry(0.07, 0.12, height, 10), ironM);
  post.position.y = height / 2;
  g.add(post);

  const arm = mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), ironM);
  arm.position.set(-0.38, height - 0.1, 0);
  g.add(arm);

  const cap = mesh(new THREE.ConeGeometry(0.28, 0.22, 8), ironM);
  cap.position.set(-0.75, height - 0.15, 0);
  g.add(cap);

  // Glowing HDR bulb (triggers bloom in ink/post chain)
  const bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.0, 1.2), fog: false });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), bulbMat);
  bulb.position.set(-0.75, height - 0.3, 0);
  bulb.layers.set(NOINK);
  g.add(bulb);

  parent.add(g);
  return g;
}

export { ctex, rep, rng, grassHD, cobbleHD, stoneHD, roofHD, facadeHD, planksHD, brick, CLOUD_DAY, CLOUD_GOLD, cloudHD };
