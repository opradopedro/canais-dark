// Maps motor-3d vocabulary actions (KayKit animation names) and expressions (8 rostos)
// to 2D cartoon poses, walk cycles, and facial expressions from toon.ts & monkey.ts.
import type { Expr, Prop } from "./toon";
import type { MPose } from "./monkey";

export interface ActionPose {
  mode: "stand" | "stroll" | "march" | "sit" | "fall";
  monkeyPose: MPose;
  phase: number;
  lift: number;
  tilt: number;
  headTilt: number;
  wave?: number;
  prop: Prop;
  yOffset: number;
  isMoving: boolean;
  bob: number;
}

const EXPR_MAP: Record<string, { expr: Expr; lid?: number }> = {
  neutro: { expr: "neutral" },
  sorriso: { expr: "smile" },
  medo: { expr: "nervous" },
  susto: { expr: "shock" },
  desconfiado: { expr: "stern" },
  triste: { expr: "pained" },
  bravo: { expr: "stern" },
  olhos_fechados: { expr: "neutral", lid: 1 },
  // Direct toon.ts names
  neutral: { expr: "neutral" },
  smile: { expr: "smile" },
  smile_closed: { expr: "smile_closed" },
  grin: { expr: "grin" },
  laugh: { expr: "laugh" },
  whistle: { expr: "whistle" },
  stern: { expr: "stern" },
  worried: { expr: "nervous" },
  pained: { expr: "pained" },
  shock: { expr: "shock" },
  dazed: { expr: "dazed" },
  nervous: { expr: "nervous" },
};

export function mapExpression(rosto?: string | null): { expr: Expr; lid?: number } {
  if (!rosto) return { expr: "neutral" };
  return EXPR_MAP[rosto.toLowerCase()] ?? { expr: "neutral" };
}

export function mapAction(acao: string | undefined | null, t: number, seed = 1): ActionPose {
  const a = (acao || "Idle_A").trim();
  const ph = (t * 0.8 + (seed % 7) * 0.13) % 1;

  // Running / Sprinting / Dodging
  if (/^Running|Dodge|Roll/i.test(a)) {
    const runPh = (t * 2.1 + (seed % 5) * 0.17) % 1;
    return {
      mode: "march",
      monkeyPose: "leap",
      phase: runPh,
      lift: 92,
      tilt: 11,
      headTilt: -4,
      prop: null,
      yOffset: Math.abs(Math.sin(runPh * Math.PI * 2)) * 0.08,
      isMoving: true,
      bob: Math.round(Math.abs(Math.sin(runPh * Math.PI * 2)) * 18),
    };
  }

  // Walking / Sneaking
  if (/^Walking|Sneaking/i.test(a)) {
    const sneak = /Sneaking/i.test(a);
    const back = /Backwards/i.test(a);
    const walkPh = (t * (sneak ? 0.95 : 1.35) + (seed % 5) * 0.19) % 1;
    return {
      mode: sneak ? "stroll" : "march",
      monkeyPose: sneak ? "crouch" : "stand",
      phase: back ? 1 - walkPh : walkPh,
      lift: sneak ? 38 : 56,
      tilt: sneak ? 9 : back ? -5 : 3,
      headTilt: sneak ? -5 : 0,
      prop: null,
      yOffset: sneak ? -0.14 : 0,
      isMoving: true,
      bob: Math.round(Math.abs(Math.sin(walkPh * Math.PI * 2)) * 10),
    };
  }

  // Crouching / Crawling
  if (/^Crouch|^Crawl/i.test(a)) {
    return {
      mode: "sit",
      monkeyPose: "crouch",
      phase: 0,
      lift: 0,
      tilt: 14,
      headTilt: -8,
      prop: null,
      yOffset: -0.22,
      isMoving: false,
      bob: 0,
    };
  }

  // Sitting / Meditating
  if (/^Sit|meditate/i.test(a)) {
    return {
      mode: "sit",
      monkeyPose: "sit",
      phase: 0,
      lift: 0,
      tilt: 0,
      headTilt: 0,
      prop: null,
      yOffset: -0.18,
      isMoving: false,
      bob: 0,
    };
  }

  // Lying down / Death / Knocked down
  if (/^Lie|^Death/i.test(a)) {
    return {
      mode: "fall",
      monkeyPose: "crouch",
      phase: 0,
      lift: 0,
      tilt: 68,
      headTilt: 12,
      prop: null,
      yOffset: -0.45,
      isMoving: false,
      bob: 0,
    };
  }

  // Jumping / Leaping
  if (/^Jump|leap/i.test(a)) {
    const jp = Math.abs(Math.sin(t * 3.2));
    return {
      mode: "march",
      monkeyPose: "leap",
      phase: 0.25,
      lift: 95,
      tilt: 8,
      headTilt: -6,
      wave: 0.8,
      prop: null,
      yOffset: jp * 0.45,
      isMoving: true,
      bob: Math.round(jp * 28),
    };
  }

  // Cheering / Waving / Laughing / Taunting
  if (/^Cheer|^Wav|Taunt|laugh/i.test(a)) {
    const wv = Math.sin(t * 6.5);
    return {
      mode: "stand",
      monkeyPose: /laugh/i.test(a) ? "laugh" : "cheer",
      phase: 0,
      lift: 0,
      tilt: wv * 2.5,
      headTilt: wv * 3,
      wave: wv,
      prop: null,
      yOffset: 0,
      isMoving: false,
      bob: Math.round(Math.abs(wv) * 14),
    };
  }

  // Interacting / Pointing / Picking up / Using item / Throwing
  if (/^Interact|^PickUp|^Use_Item|^Throw|^Lockpick|^Fishing/i.test(a)) {
    const wv = 0.35 + 0.25 * Math.sin(t * 3.0);
    return {
      mode: "stand",
      monkeyPose: "stand",
      phase: 0,
      lift: 0,
      tilt: 5,
      headTilt: 3,
      wave: wv,
      prop: null,
      yOffset: 0,
      isMoving: false,
      bob: 0,
    };
  }

  // Melee / Attack / Chop / Work / Hammer / Dig / Saw
  if (/^Melee|^Ranged|^Chop|^Hammer|^Dig|^Saw|^Work|^Attack/i.test(a)) {
    const strike = 0.5 + 0.5 * Math.sin(t * 5.5);
    return {
      mode: "stand",
      monkeyPose: "cheer",
      phase: 0,
      lift: 0,
      tilt: 8 * strike,
      headTilt: -3,
      prop: ["hammer", strike],
      yOffset: 0,
      isMoving: false,
      bob: Math.round(strike * 10),
    };
  }

  // Hit / Recoil / Susto
  if (/^Hit|^Block/i.test(a)) {
    return {
      mode: "stand",
      monkeyPose: "crouch",
      phase: 0,
      lift: 0,
      tilt: -9,
      headTilt: -6,
      wave: 0.6,
      prop: null,
      yOffset: 0,
      isMoving: false,
      bob: 0,
    };
  }

  // Default: Idle_A / Idle_B / stand (subtle breathing sway)
  const breath = Math.sin(t * 1.8 + seed);
  return {
    mode: "stand",
    monkeyPose: "stand",
    phase: ph,
    lift: 0,
    tilt: breath * 0.8,
    headTilt: /Idle_B/i.test(a) ? 3 + breath * 1.5 : breath * 1.0,
    prop: null,
    yOffset: 0,
    isMoving: false,
    bob: 0,
  };
}
