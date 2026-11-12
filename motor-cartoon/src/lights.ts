// Light presets per time of day / atmosphere.
// Preserves the exact Wukong day & golden presets and adds the 16 vocabulary light presets
// from motor-3d/vocabulario.py (legible blue nights, fog, rain, firelight, full moon, snow, storm).
type C3 = [number, number, number];

export type LightName =
  | "day" | "golden"
  | "dia" | "entardecer" | "noite" | "noite_neblina" | "madrugada"
  | "interior_noite" | "chuva" | "fogueira" | "lua_cheia" | "lua_minguante"
  | "neblina_baixa" | "neve" | "tempestade" | "nascer_sol" | "por_sol" | "nublado";

export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cardshade.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string;
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights
  bias: number; normalBias: number;
};

const DAY_BASE: LightPreset = {
  az: 75, el: 48,
  lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
  charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
  blob: [0.62, 0.58, 0.58], actorShadow: false,
  top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 25, fogFar: 300, sunDisc: "#000000",
  sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
  bias: -0.00025, normalBias: 0.015,
};

const GOLDEN_BASE: LightPreset = {
  az: 6, el: 7,
  lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
  charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
  blob: [0.75, 0.74, 0.9], actorShadow: true,
  top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
  sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
  bias: -0.0006, normalBias: 0.03,
};

// Legible blue-toned night base (faces, expressions, and creatures are always clearly visible)
const NIGHT_BASE: LightPreset = {
  az: 58, el: 38,
  lit: [0.92, 1.06, 1.38], shade: [0.24, 0.28, 0.44], lift: [0.05, 0.07, 0.16], lambert: 0.32, sideK: 0.85, term: 0.18,
  charTint: [0.88, 0.93, 1.05], charShade: 0.86, charGrad: 0.08, bodyGrad: 0.22, sideTint: [0.82, 0.88, 1.0],
  blob: [0.45, 0.48, 0.65], actorShadow: true,
  top: "#162442", hor: "#324a74", skyCurve: [0.05, 0.5, 0.85], fog: "#2b3f66", fogNear: 20, fogFar: 220, sunDisc: "#dce8ff",
  sunCol: "#b8d2ff", sunI: 2.6, sky: "#5a7ab8", ground: "#2a3048", hemiI: 0.65,
  bias: -0.0003, normalBias: 0.02,
};

export const LIGHTS: Record<LightName, LightPreset> = {
  day: DAY_BASE,
  golden: GOLDEN_BASE,
  dia: DAY_BASE,
  entardecer: GOLDEN_BASE,
  nascer_sol: {
    ...GOLDEN_BASE,
    az: 35, el: 14,
    lit: [1.52, 0.95, 0.55], shade: [0.22, 0.22, 0.36], lift: [0.05, 0.06, 0.15],
    charTint: [1.0, 0.86, 0.72],
    top: "#5568a2", hor: "#ffcea0", fog: "#f2c29b",
  },
  por_sol: {
    ...GOLDEN_BASE,
    az: -25, el: 9,
    lit: [1.55, 0.64, 0.22], shade: [0.18, 0.16, 0.32],
    charTint: [1.0, 0.76, 0.54],
    top: "#5a3d7a", hor: "#ffb478", fog: "#e89e74",
  },
  nublado: {
    ...DAY_BASE,
    az: 80, el: 55,
    lit: [1.18, 1.22, 1.28], shade: [0.38, 0.40, 0.48], lift: [0.06, 0.07, 0.12],
    charTint: [0.95, 0.96, 1.0], charShade: 0.88,
    top: "#6b7d94", hor: "#a8b6c6", fog: "#9eadbe", fogNear: 18, fogFar: 180,
    sunCol: "#dce4ee", sunI: 2.1,
  },
  noite: NIGHT_BASE,
  noite_neblina: {
    ...NIGHT_BASE,
    lit: [0.88, 1.02, 1.32], shade: [0.26, 0.31, 0.46], lift: [0.06, 0.08, 0.17],
    fog: "#384e72", fogNear: 10, fogFar: 95,
  },
  madrugada: {
    ...NIGHT_BASE,
    az: 45, el: 30,
    lit: [0.84, 0.96, 1.28], shade: [0.22, 0.25, 0.42], lift: [0.04, 0.06, 0.15],
    top: "#121d38", hor: "#283c64", fog: "#24365a", fogNear: 18, fogFar: 190,
  },
  interior_noite: {
    ...NIGHT_BASE,
    az: 65, el: 45,
    lit: [1.18, 1.08, 0.96], shade: [0.28, 0.28, 0.42], lift: [0.06, 0.06, 0.14],
    charTint: [0.96, 0.94, 0.96], charShade: 0.88,
    top: "#1e263c", hor: "#34405e", fog: "#2c3650", fogNear: 14, fogFar: 120,
    sunCol: "#ffe2b8", sunI: 2.5,
  },
  chuva: {
    ...NIGHT_BASE,
    az: 70, el: 48,
    lit: [0.86, 1.0, 1.28], shade: [0.25, 0.29, 0.44], lift: [0.05, 0.07, 0.16],
    top: "#1c283e", hor: "#384a68", fog: "#324462", fogNear: 14, fogFar: 130,
  },
  fogueira: {
    ...NIGHT_BASE,
    az: 30, el: 22,
    lit: [1.45, 0.94, 0.48], shade: [0.24, 0.24, 0.38], lift: [0.06, 0.05, 0.12],
    charTint: [1.02, 0.88, 0.72], charShade: 0.87,
    top: "#181a30", hor: "#3a2c44", fog: "#2e263c", fogNear: 16, fogFar: 160,
    sunCol: "#ffad58", sunI: 3.2,
  },
  lua_cheia: {
    ...NIGHT_BASE,
    az: 40, el: 42,
    lit: [1.05, 1.18, 1.48], shade: [0.28, 0.33, 0.50], lift: [0.06, 0.08, 0.18],
    charTint: [0.92, 0.96, 1.06], charShade: 0.88,
    top: "#1c2e54", hor: "#3e5c8e", fog: "#344e7c", fogNear: 24, fogFar: 250,
  },
  lua_minguante: {
    ...NIGHT_BASE,
    az: 55, el: 36,
    lit: [0.88, 1.0, 1.32], shade: [0.23, 0.27, 0.43],
    top: "#14203c", hor: "#2c426a", fog: "#263a60",
  },
  neblina_baixa: {
    ...NIGHT_BASE,
    lit: [0.92, 1.04, 1.34], shade: [0.28, 0.33, 0.48], lift: [0.06, 0.08, 0.17],
    top: "#22324e", hor: "#445c80", fog: "#3c5476", fogNear: 12, fogFar: 105,
  },
  neve: {
    ...DAY_BASE,
    az: 65, el: 44,
    lit: [1.38, 1.44, 1.54], shade: [0.42, 0.46, 0.58], lift: [0.08, 0.10, 0.16],
    charTint: [0.96, 0.98, 1.02], charShade: 0.90,
    top: "#7494bc", hor: "#cfe0f2", fog: "#c4d6ea", fogNear: 20, fogFar: 190,
  },
  tempestade: {
    ...NIGHT_BASE,
    az: 65, el: 42,
    lit: [0.90, 1.02, 1.34], shade: [0.24, 0.28, 0.44], lift: [0.05, 0.07, 0.16],
    top: "#182236", hor: "#30405c", fog: "#2a3852", fogNear: 14, fogFar: 135,
  },
};

export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg)
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;
  sat: number;
  cloud: { lit: string; mid: string; shade: string };
};

const LOOK_DAY: WorldLook = {
  sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
  water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
  cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
  bounce: [0, 0, 0],
  sat: 1.08,
};

const LOOK_GOLDEN: WorldLook = {
  sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
  water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
  cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
  bounce: [0.04, 0.02, 0.0],
  sat: 1.1,
};

const LOOK_NIGHT: WorldLook = {
  sky: { c: ["#344c78", "#2b4068", "#223458", "#1a2848", "#131e38"], e: [0, 4, 10, 20, 40] },
  water: { near: "#182c4e", mid: "#142442", far: "#101c36", crest: "#6892c8", trough: "#0c162c", glint: "#c8e0ff", shade: [0.38, 0.44, 0.68] },
  cloud: { lit: "#6882b2", mid: "#4c6492", shade: "#344872" },
  bounce: [0.02, 0.03, 0.06],
  sat: 1.02,
};

export const LOOK: Record<LightName, WorldLook> = {
  day: LOOK_DAY,
  golden: LOOK_GOLDEN,
  dia: LOOK_DAY,
  entardecer: LOOK_GOLDEN,
  nascer_sol: {
    ...LOOK_GOLDEN,
    sky: { c: ["#ffd29c", "#f6bc8c", "#df9e8c", "#9c88a8", "#686e9c"], e: [0, 4, 10, 20, 40] },
  },
  por_sol: {
    ...LOOK_GOLDEN,
    sky: { c: ["#ffb068", "#f09064", "#d67872", "#a46884", "#6c547c"], e: [0, 4, 10, 20, 40] },
  },
  nublado: {
    ...LOOK_DAY,
    sky: { c: ["#b0bece", "#9eadbe", "#8c9cae", "#7c8ca0", "#6c7c90"], e: [0, 4, 10, 20, 40] },
    cloud: { lit: "#dce2ea", mid: "#c2ccd8", shade: "#9eaac0" },
    sat: 0.96,
  },
  noite: LOOK_NIGHT,
  noite_neblina: {
    ...LOOK_NIGHT,
    sky: { c: ["#3e567e", "#344a70", "#283c60", "#1e3050", "#162440"], e: [0, 4, 10, 20, 40] },
    sat: 0.96,
  },
  madrugada: {
    ...LOOK_NIGHT,
    sky: { c: ["#2c4068", "#24365a", "#1c2c4c", "#15223e", "#0f1830"], e: [0, 4, 10, 20, 40] },
  },
  interior_noite: {
    ...LOOK_NIGHT,
    sky: { c: ["#2e3852", "#263048", "#1e283e", "#182034", "#121828"], e: [0, 4, 10, 20, 40] },
    bounce: [0.05, 0.04, 0.02],
  },
  chuva: {
    ...LOOK_NIGHT,
    sky: { c: ["#364866", "#2e3e5a", "#24344e", "#1c2a40", "#142034"], e: [0, 4, 10, 20, 40] },
    sat: 0.95,
  },
  fogueira: {
    ...LOOK_NIGHT,
    sky: { c: ["#3c2e48", "#302640", "#241e36", "#1a182e", "#121224"], e: [0, 4, 10, 20, 40] },
    bounce: [0.08, 0.04, 0.01],
    sat: 1.08,
  },
  lua_cheia: {
    ...LOOK_NIGHT,
    sky: { c: ["#426094", "#365284", "#2a4472", "#203660", "#18284c"], e: [0, 4, 10, 20, 40] },
    cloud: { lit: "#84a2d4", mid: "#6280b4", shade: "#445e90" },
    sat: 1.04,
  },
  lua_minguante: LOOK_NIGHT,
  neblina_baixa: {
    ...LOOK_NIGHT,
    sky: { c: ["#425a80", "#384e72", "#2c4062", "#223452", "#182842"], e: [0, 4, 10, 20, 40] },
    sat: 0.96,
  },
  neve: {
    ...LOOK_DAY,
    sky: { c: ["#d4e2f2", "#c2d4ea", "#acc2de", "#96b0d2", "#7e9cc4"], e: [0, 4, 10, 20, 40] },
    cloud: { lit: "#ffffff", mid: "#e6eef8", shade: "#c8d6ea" },
    sat: 0.98,
  },
  tempestade: {
    ...LOOK_NIGHT,
    sky: { c: ["#30405c", "#283650", "#202c44", "#182238", "#10182c"], e: [0, 4, 10, 20, 40] },
    sat: 0.94,
  },
};

export function resolveLightName(name?: string | null): LightName {
  if (name && name in LIGHTS) return name as LightName;
  return "noite";
}

export const resolveLightKey = resolveLightName;

export function isNightLight(name?: string | null): boolean {
  const k = resolveLightName(name);
  return !["day", "golden", "dia", "entardecer", "nascer_sol", "por_sol", "nublado", "neve"].includes(k);
}
