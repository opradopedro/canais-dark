// Camera planning & smooth glide interpolation for motor-cartoon.
// Implements all 9 vocabulary plans (auto, aereo, aberto, medio, close, baixo, ombro, pov, nuca),
// respects interior room limits (limites), and has ZERO handheld camera tremor.
import * as THREE from "three";

export interface Limites {
  x: number;
  z: number;
  h: number;
}

export interface CenaTimeline {
  idx: number;
  t0: number;
  t1: number;
  cenario: string;
  marca?: string;
  plano?: string;
  luz?: string;
  efeito?: string;
  atores?: {
    id: string;
    acao?: string;
    rosto?: string;
    de?: string;
    para?: string;
    segura?: string;
    marca?: string;
  }[];
  criatura?: {
    tipo: string;
    marca?: string;
  } | null;
  objetos?: (string | { tipo: string; n?: number })[] | null;
  eventos?: {
    t_abs: number;
    tipo: string;
    ator?: string;
    acao?: string;
    rosto?: string;
  }[];
}

export interface Corte {
  cenaIdx: number;
  plano: string;
  t0: number;
  t1: number;
  subIdx: number;
}

const CICLO_AUTO = ["aberto", "medio", "close", "baixo", "medio", "aereo"];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smoother = (x: number) => {
  const u = clamp01(x);
  return u * u * u * (u * (u * 6 - 15) + 10);
};

export function planejarCortes(cenas: CenaTimeline[], hasLimitesFor: (cenario: string) => boolean): Corte[] {
  const cortes: Corte[] = [];
  let ultPlano = "";
  let autoCursor = 0;

  for (const c of cenas) {
    const dur = Math.max(0.1, c.t1 - c.t0);
    const indoor = hasLimitesFor(c.cenario);
    const rawPlano = c.plano || "auto";

    if (rawPlano !== "auto") {
      const p = indoor && rawPlano === "aereo" ? "aberto" : rawPlano;
      cortes.push({ cenaIdx: c.idx, plano: p, t0: c.t0, t1: c.t1, subIdx: 0 });
      ultPlano = p;
      continue;
    }

    const nCortes = Math.max(1, Math.round(dur / 2.5));
    const dt = dur / nCortes;
    for (let k = 0; k < nCortes; k++) {
      let p = CICLO_AUTO[(autoCursor + k) % CICLO_AUTO.length];
      if (indoor && p === "aereo") p = "aberto";
      if (p === ultPlano) {
        p = p === "medio" ? "close" : "medio";
      }
      ultPlano = p;
      cortes.push({
        cenaIdx: c.idx,
        plano: p,
        t0: c.t0 + k * dt,
        t1: k === nCortes - 1 ? c.t1 : c.t0 + (k + 1) * dt,
        subIdx: k,
      });
    }
    autoCursor += nCortes;
  }

  return cortes;
}

export interface CamPose {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  roll: number;
  cInf: number;
}

export function computeCamPose(
  corte: Corte,
  t: number,
  focusPos: THREE.Vector3,
  charHeight: number,
  limites?: Limites,
  sustoKick = 0
): CamPose {
  const u = smoother((t - corte.t0) / Math.max(0.15, corte.t1 - corte.t0));
  const fx = focusPos.x;
  const fy = focusPos.y;
  const fz = focusPos.z;
  const eyeY = fy + charHeight * 0.78;
  const chestY = fy + charHeight * 0.62;
  const sideSign = corte.subIdx % 2 === 0 ? 1 : -1;

  let posA: [number, number, number];
  let posB: [number, number, number];
  let lookA: [number, number, number];
  let lookB: [number, number, number];
  let fov = 36;
  let roll = 0;
  let cInf = 0.008;

  switch (corte.plano) {
    case "aereo": {
      posA = [fx - 2.6 * sideSign, fy + 6.2, fz + 8.8];
      posB = [fx + 1.4 * sideSign, fy + 4.8, fz + 6.8];
      lookA = [fx, fy + 0.9, fz];
      lookB = [fx, fy + 1.0, fz];
      fov = 42;
      cInf = 0.005;
      break;
    }
    case "aberto": {
      posA = [fx + 1.3 * sideSign, fy + 1.85, fz + 6.0];
      posB = [fx + 0.5 * sideSign, fy + 1.65, fz + 5.1];
      lookA = [fx, chestY, fz];
      lookB = [fx, chestY + 0.08, fz];
      fov = 40;
      cInf = 0.007;
      break;
    }
    case "close": {
      posA = [fx + 0.28 * sideSign, eyeY + 0.05, fz + 2.05];
      posB = [fx + 0.12 * sideSign, eyeY + 0.02, fz + 1.72];
      lookA = [fx, eyeY - 0.04, fz];
      lookB = [fx, eyeY - 0.02, fz];
      fov = 28;
      cInf = 0.015;
      break;
    }
    case "baixo": {
      posA = [fx - 0.5 * sideSign, fy + 0.85, fz + 3.0];
      posB = [fx - 0.22 * sideSign, fy + 0.78, fz + 2.55];
      lookA = [fx, chestY - 0.05, fz];
      lookB = [fx, chestY, fz];
      fov = 38;
      roll = 0.015 * sideSign;
      cInf = 0.011;
      break;
    }
    case "ombro": {
      posA = [fx + 0.75 * sideSign, eyeY + 0.12, fz + 2.55];
      posB = [fx + 0.58 * sideSign, eyeY + 0.08, fz + 2.15];
      lookA = [fx - 0.15 * sideSign, chestY + 0.08, fz - 0.8];
      lookB = [fx - 0.1 * sideSign, chestY + 0.1, fz - 0.8];
      fov = 35;
      cInf = 0.012;
      break;
    }
    case "pov": {
      posA = [fx + 0.15 * sideSign, eyeY, fz + 1.85];
      posB = [fx, eyeY, fz + 1.45];
      lookA = [fx, chestY + 0.08, fz - 1.2];
      lookB = [fx, chestY + 0.1, fz - 1.5];
      fov = 44;
      cInf = 0.009;
      break;
    }
    case "nuca": {
      posA = [fx + 0.2 * sideSign, eyeY + 0.18, fz + 3.1];
      posB = [fx, eyeY + 0.14, fz + 2.55];
      lookA = [fx, chestY + 0.05, fz - 0.5];
      lookB = [fx, chestY + 0.08, fz - 0.8];
      fov = 36;
      cInf = 0.011;
      break;
    }
    case "medio":
    default: {
      posA = [fx - 0.65 * sideSign, chestY + 0.22, fz + 3.45];
      posB = [fx - 0.25 * sideSign, chestY + 0.18, fz + 2.95];
      lookA = [fx, chestY + 0.06, fz];
      lookB = [fx, chestY + 0.1, fz];
      fov = 34;
      cInf = 0.012;
      break;
    }
  }

  let px = posA[0] + (posB[0] - posA[0]) * u;
  let py = posA[1] + (posB[1] - posA[1]) * u;
  let pz = posA[2] + (posB[2] - posA[2]) * u + sustoKick * 0.22;

  const lx = lookA[0] + (lookB[0] - lookA[0]) * u;
  const ly = lookA[1] + (lookB[1] - lookA[1]) * u;
  const lz = lookA[2] + (lookB[2] - lookA[2]) * u;

  if (limites) {
    px = Math.max(-limites.x + 0.35, Math.min(limites.x - 0.35, px));
    pz = Math.max(-limites.z + 0.35, Math.min(limites.z - 0.35, pz));
    py = Math.max(0.45, Math.min(limites.h - 0.25, py));
  }

  return {
    pos: [px, py, pz],
    look: [lx, ly, lz],
    fov: fov - sustoKick * 3,
    roll,
    cInf,
  };
}
