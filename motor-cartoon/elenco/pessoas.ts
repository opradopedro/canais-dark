// Procedural 2D cartoon cast generator (in the exact style of toon.ts & monkey.ts)
// Reads any actor definition from the script's "elenco" and draws deterministic 2D character cards.
import {
  Pen, INK, bodyFront, bodySide, Outfit, FrontOpts, SideOpts, Expr, shade, mul,
} from "../src/toon";
import { drawMonkey, EMPEROR, GENERAL, furTones } from "../src/monkey";
import { mapAction, mapExpression } from "../src/acoes";

export interface ElencoSpec {
  semente?: number;
  altura?: number;
  corpo?: string;       // magro, medio, forte, crianca, idoso, macaco
  pele?: string;
  camisa?: string;
  calca?: string;
  sapato?: string;
  cabelo?: string;      // curto, longo, rabo, careca, grisalho
  cabelo_cor?: string;
  roupa?: string;       // casual, jaqueta, guarda, enfermeira, terno, vestido, camiseta, monge, soldado_esparta, soldado_china, rei
  chapeu?: string;      // bone, capuz, capacete_esparta, coroa
  acessorio?: string;   // bone, oculos, mochila, barba
  rosto_estilo?: string;
}

export interface ActorPoseSpec {
  id: string;
  acao?: string;
  rosto?: string;
  segura?: string;      // lanterna, tocha, radio, celular, cajado, espada, lanca, escudo
  de?: string;
  para?: string;
  marca?: string;
  roupa?: string;       // so nesta cena ("nenhuma" = sem roupa)
}

const SKIN_TONES = ["#ffe2c2", "#f6d0ad", "#eab88f", "#d69c72", "#b87b52", "#8d5838"];
const JACKET_TONES = ["#3b5f8a", "#8a4236", "#3d7050", "#6e4e7c", "#b86b35", "#485468", "#9c3d44", "#5c6b46"];
const PANTS_TONES = ["#2c3545", "#3a322d", "#263a38", "#3d3546", "#443a2e", "#252b36"];
const HAIR_TONES = ["#261b22", "#4a3022", "#6e472b", "#1c161c", "#8c5c32", "#382824"];

function seededPick<T>(seed: number, k: number, arr: T[]): T {
  const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453;
  const u = x - Math.floor(x);
  return arr[Math.floor(u * arr.length) % arr.length];
}

export function isMonkeyActor(id: string, spec?: ElencoSpec): boolean {
  const low = (id || "").toLowerCase();
  if (low.includes("wukong") || low.includes("macaco") || low.includes("monkey")) return true;
  if (spec?.corpo === "macaco") return true;
  return false;
}

export function buildOutfit(id: string, spec: ElencoSpec = {}): { outfit: Outfit; seed: number; scale: number; extras: {
  ponytail?: boolean;
  longHair?: boolean;
  beard?: boolean;
  glasses?: boolean;
  spartan?: boolean;
  crown?: boolean;
  nurse?: boolean;
  monk?: boolean;
  hairCol: string;
} } {
  const lowId = (id || "").toLowerCase();
  const seed = spec.semente ?? (lowId.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 10000);
  const skin = spec.pele || seededPick(seed, 1, SKIN_TONES);
  const isOld = spec.corpo === "idoso" || spec.cabelo === "grisalho" || lowId.includes("subhuti") || lowId.includes("subodhi") || lowId.includes("velho") || lowId.includes("ancora") || lowId.includes("juiz");
  const hairCol = isOld ? "#d8d4ce" : (spec.cabelo_cor || seededPick(seed, 2, HAIR_TONES));

  // Scale by body type
  let scale = spec.altura ? spec.altura / 1.75 : 1.0;
  let build: "adult" | "stout" | "kid" = "adult";
  if (spec.corpo === "crianca") { build = "kid"; scale = 0.76; }
  else if (spec.corpo === "forte" || lowId.includes("imperador") || lowId.includes("rei") || lowId.includes("buda")) { build = "stout"; scale = 1.06; }

  let jacket = spec.camisa || seededPick(seed, 3, JACKET_TONES);
  let pants = spec.calca || seededPick(seed, 4, PANTS_TONES);
  let boots = spec.sapato || "#261e26";
  let hat: string | null = "hair";
  let cap: string | undefined;
  let belt: string | null = null;
  let sash: string | undefined;
  let dress: string | undefined;
  let buttons: string | undefined;
  let moustache: string | undefined;
  let sword = false;

  const roupa = (spec.roupa || "").toLowerCase();
  const chapeu = (spec.chapeu || spec.acessorio || "").toLowerCase();

  if (lowId.includes("imperador") || lowId.includes("dragao") || lowId.includes("buda") || roupa === "rei") {
    const robe = lowId.includes("dragao") ? "#1e6b7b" : lowId.includes("buda") ? "#e8a828" : EMPEROR.jacket;
    return {
      outfit: { ...EMPEROR, jacket: robe, skin, beard: lowId.includes("buda") ? undefined : "#f4f1ea" },
      seed,
      scale: lowId.includes("buda") ? 1.22 : 1.08,
      extras: { crown: !lowId.includes("buda"), beard: !lowId.includes("buda"), hairCol: lowId.includes("buda") ? "#222028" : "#f4f1ea" },
    };
  }
  if (roupa === "soldado_china" || lowId.includes("erlang") || lowId.includes("general") || (lowId.includes("soldado") && !roupa.includes("esparta"))) {
    return {
      outfit: { ...GENERAL, skin, sword: true },
      seed,
      scale: 1.05,
      extras: { hairCol },
    };
  }

  if (roupa === "enfermeira" || lowId.includes("maya") || lowId.includes("nurse")) {
    jacket = "#3aa6b8";
    pants = "#2d7f90";
    boots = "#e8eef2";
    buttons = "#e8eef2";
  } else if (roupa === "guarda" || roupa === "policial") {
    jacket = "#283852";
    pants = "#1d283a";
    belt = "#1a1820";
    buttons = "#e8c45a";
    hat = "cap";
    cap = "#283852";
  } else if (roupa === "jaqueta") {
    jacket = spec.camisa || "#8a4b2e";
    pants = spec.calca || "#2c384a";
    belt = "#3a2618";
  } else if (roupa === "terno") {
    jacket = "#262834";
    pants = "#1c1e28";
    buttons = "#dcd8d0";
  } else if (roupa === "vestido") {
    jacket = spec.camisa || "#9c3d4c";
    dress = spec.calca || "#b84a5a";
  } else if (roupa === "monge" || lowId.includes("subhuti") || lowId.includes("subodhi") || lowId.includes("juiz") || lowId.includes("tang") || lowId.includes("monk") || lowId.includes("monge")) {
    jacket = spec.camisa || "#d4883a";
    pants = spec.calca || "#7a4422";
    sash = lowId.includes("juiz") ? "#8e2230" : "#d8a838";
  } else if (roupa === "soldado_esparta" || lowId.includes("leonidas") || lowId.includes("esparta")) {
    jacket = "#b8322a";
    pants = "#6e4228";
    belt = "#d4a83c";
    sash = "#d4a83c";
    boots = "#5c3620";
    sword = true;
  }

  if (spec.cabelo === "careca") hat = null;
  if (chapeu.includes("bone") || spec.chapeu === "bone") {
    hat = "cap";
    cap = "#c83e32";
  } else if (chapeu.includes("cartola")) {
    hat = "tophat";
  }

  if (isOld || chapeu.includes("barba")) {
    moustache = hairCol;
  }

  const spartan = roupa === "soldado_esparta" || chapeu.includes("capacete_esparta") || lowId.includes("esparta");
  const crown = roupa === "rei" || chapeu.includes("coroa");

  const outfit: Outfit = {
    jacket,
    pants,
    boots,
    hat,
    cap,
    hair: hairCol,
    belt,
    sash,
    dress,
    buttons,
    moustache,
    sword,
    skin,
    build,
    beard: isOld || chapeu.includes("barba") || lowId.includes("subhuti") || lowId.includes("subodhi") ? hairCol : undefined,
    glasses: chapeu.includes("oculos"),
  };

  return {
    outfit,
    seed: (seed % 7) + 1,
    scale,
    extras: {
      ponytail: false, // rabo de cavalo parecia solto da cabeca (Pedro, 12/11): desligado
      longHair: spec.cabelo === "longo",
      beard: isOld || chapeu.includes("barba") || lowId.includes("subhuti") || lowId.includes("subodhi"),
      glasses: chapeu.includes("oculos"),
      spartan,
      crown,
      nurse: roupa === "enfermeira" || lowId.includes("maya"),
      monk: roupa === "monge" || lowId.includes("subhuti") || lowId.includes("subodhi") || lowId.includes("tang"),
      hairCol,
    },
  };
}

/** Draw hand-held prop + character extras on the 600x1000 character canvas */
function drawExtrasAndProp(
  p: Pen,
  extras: ReturnType<typeof buildOutfit>["extras"],
  segura: string | undefined,
  side: boolean,
  t: number
) {
  // Ponytail / Long hair behind or beside head (head center ~ y=300, x=300)
  if (extras.ponytail) {
    const px = side ? 185 : 205;
    p.shadedFill(
      [[px, 265], [px - 42, 290], [px - 55, 355], [px - 22, 360], [px + 5, 305]],
      extras.hairCol,
      shade(extras.hairCol, 0.75),
      -1.2,
      40
    );
    p.poly([[px, 265], [px - 42, 290], [px - 55, 355], [px - 22, 360], [px + 5, 305]], null, 7);
  }
  if (extras.longHair && !side) {
    for (const s of [-1, 1]) {
      const lx = 300 + s * 108;
      p.poly([[lx - s * 14, 260], [lx + s * 18, 280], [lx + s * 22, 420], [lx - s * 10, 415]], extras.hairCol, 7);
    }
  }

  // barba, oculos e cruz de enfermeira sairam daqui (12/11): eram desenhados em posicao fixa e nao acompanhavam o
  // rosto. Barba e oculos agora vao no rosto (toon.ts faceFront); a cruz no peito o Pedro achou estranha.

  // Spartan helmet crest & bronze shield
  if (extras.spartan) {
    // Red horsehair crest on top of helmet
    const crest: [number, number][] = [
      [235, 195], [220, 130], [265, 105], [335, 105], [380, 130], [365, 195],
    ];
    p.shadedFill(crest, "#c82e28", "#881c1c", -1.2, 65);
    p.poly(crest, null, 7.5);
    // Bronze helmet band
    p.band([[212, 212], [388, 212]], "#d8a83c", 22, 6);
    // Round bronze shield on left arm
    const sx = side ? 335 : 195, sy = 565;
    p.ell(sx, sy, 74, 88, "#d8a438", 8);
    p.ell(sx, sy, 54, 66, "#b8322a", 5);
  }

  // Royal crown
  if (extras.crown) {
    const y0 = 198;
    const pts: [number, number][] = [
      [236, y0], [226, y0 - 66], [266, y0 - 32], [300, y0 - 82], [334, y0 - 32], [374, y0 - 66], [364, y0],
    ];
    p.shadedFill(pts, "#f2c23a", "#c8902a", -1.2, 70);
    p.poly(pts, null, 7);
    p.ell(300, y0 - 22, 11, 11, "#d8343a", 3);
  }

  // Hand-held prop (right hand is around x=415, y=625 in front view, x=355, y=615 in side view)
  if (!segura) return;
  const hx = side ? 355 : 412;
  const hy = side ? 610 : 625;
  const prop = segura.toLowerCase();

  if (prop === "lanterna") {
    // Lanterna: so o corpo e a lente acesa; o facho de luz e 3D (StoryWorld, feixe + luz no chao)
    p.band([[hx - 18, hy - 4], [hx + 24, hy + 4]], "#323640", 22, 6, "round");
    p.ell(hx + 24, hy + 4, 11, 14, "#fff6b8", 5);
  } else if (prop === "tocha") {
    // Wooden torch + flickering cartoon flame
    p.band([[hx - 6, hy + 40], [hx + 14, hy - 68]], "#6e472b", 18, 6, "round");
    const fl = 8 * Math.sin(t * 14);
    const flame: [number, number][] = [
      [hx - 14, hy - 68],
      [hx - 24, hy - 115],
      [hx + 14 + fl, hy - 168],
      [hx + 42, hy - 110],
      [hx + 30, hy - 68],
    ];
    p.poly(flame, "#ff7a24", 6);
    p.ell(hx + 12, hy - 95, 14, 24, "#ffe85c", 0);
  } else if (prop === "radio") {
    // Walkie-talkie with antenna
    p.line([[hx + 8, hy - 28], [hx + 12, hy - 74]], INK, 6);
    p.poly([[hx - 16, hy - 32], [hx + 18, hy - 32], [hx + 18, hy + 24], [hx - 16, hy + 24]], "#2b303a", 6);
    p.ell(hx + 2, hy - 14, 6, 6, "#58f268", 3);
  } else if (prop === "celular") {
    // Smartphone with glowing screen
    p.poly([[hx - 16, hy - 28], [hx + 18, hy - 28], [hx + 18, hy + 26], [hx - 16, hy + 26]], "#1e2430", 6);
    p.poly([[hx - 11, hy - 21], [hx + 13, hy - 21], [hx + 13, hy + 19], [hx - 11, hy + 19]], "#a8dcff", 0);
  } else if (prop === "cajado") {
    // Golden-banded staff (Ruyi Jingu Bang)
    p.band([[hx + 12, hy + 220], [hx - 18, hy - 360]], "#b82924", 18, 6, "round");
    p.band([[hx - 10, hy - 210], [hx - 18, hy - 360]], "#f2c23a", 21, 6, "round");
    p.band([[hx + 6, hy + 90], [hx + 12, hy + 220]], "#f2c23a", 21, 6, "round");
  } else if (prop === "espada" || prop === "lanca") {
    const long = prop === "lanca";
    p.band([[hx - 8, hy + (long ? 180 : 25)], [hx + 28, hy - (long ? 340 : 190)]], long ? "#6e472b" : "#d4dae2", long ? 14 : 16, 6, "round");
    if (!long) p.band([[hx - 24, hy - 8], [hx + 22, hy + 4]], "#d8a83c", 12, 5, "round");
  }
}

export type ElencoDef = ElencoSpec;

const BLINK_LID = [0.5, 1, 1, 0.5];
function blinkAt(f: number, seed: number): number {
  let s = Math.round(12 + 35 * Math.abs(Math.sin(seed * 91.7)));
  for (let n = 0; s <= f && n < 500; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return BLINK_LID[k];
    s += Math.round(24 + 45 * Math.abs(Math.sin(seed * 31.3 + n * 17.9)));
  }
  return 0;
}

export function drawPersonCard(
  p: Pen,
  id: string,
  elencoSpec: ElencoSpec | undefined,
  acao: string | undefined,
  rosto: string | undefined,
  segura: string | undefined,
  t: number,
  f = 0
) {
  const seed = elencoSpec?.semente ?? (id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 100);
  const lid = blinkAt(f, seed);
  drawActorCard(
    p,
    id,
    elencoSpec,
    { id, acao, rosto, segura },
    t,
    (-125 * Math.PI) / 180,
    false,
    lid
  );
}

export function drawActorCard(
  p: Pen,
  id: string,
  elencoSpec: ElencoSpec | undefined,
  poseSpec: ActorPoseSpec,
  t: number,
  lightAngle: number,
  sideView: boolean,
  blinkLid: number
) {
  const act = mapAction(poseSpec.acao, t, elencoSpec?.semente ?? 1);
  const { expr, lid: exprLid } = mapExpression(poseSpec.rosto);
  const lid = exprLid ?? blinkLid;

  if (isMonkeyActor(id, elencoSpec)) {
    const lowId = id.toLowerCase();
    const isOldMonkey = lowId.includes("velho") || elencoSpec?.corpo === "idoso";
    const isKing = Boolean(
      lowId.includes("wukong") ||
      elencoSpec?.chapeu?.includes("coroa") ||
      elencoSpec?.roupa === "rei" ||
      poseSpec.segura === "cajado"
    );
    const fur = isOldMonkey
      ? "#9c8e80"
      : lowId.includes("wukong")
      ? "#b87632"
      : elencoSpec?.pele || furTones[(elencoSpec?.semente ?? 0) % furTones.length];
    const tears = poseSpec.rosto === "triste";
    drawMonkey(p, {
      pose: act.monkeyPose,
      expr,
      lid,
      fur,
      crown: isKing,
      cape: false,
      // REGRA (Pedro, 12/11): quando a historia fala de roupa, ele aparece vestido. Rei com roupa no elenco veste
      // armadura de guerreiro; "roupa": "nenhuma" na cena (ou no elenco) deixa so o pelo
      armor: isKing && !!(poseSpec.roupa ?? elencoSpec?.roupa) && (poseSpec.roupa ?? elencoSpec?.roupa) !== "nenhuma",
      bob: act.bob,
      seed: elencoSpec?.semente ?? 3,
      tears,
    });
    if (poseSpec.segura) {
      drawExtrasAndProp(p, { hairCol: fur }, poseSpec.segura, false, t);
    }
    return;
  }

  const { outfit, seed, extras } = buildOutfit(id, elencoSpec);
  // Quantize phase to 1/16 steps so texture cache hits frequently
  const qPhase = Math.round(act.phase * 16) / 16;

  if (sideView && (act.mode === "march" || act.mode === "stroll" || act.mode === "stand")) {
    const so: SideOpts = {
      phase: qPhase,
      expr,
      mode: act.mode === "stand" ? "stand" : "march",
      blink: lid,
      stomp: act.lift / 60,
      stride: 0.85,
      light: lightAngle,
      seed,
    };
    bodySide(p, outfit, so);
    drawExtrasAndProp(p, extras, poseSpec.segura, true, t);
  } else {
    const fo: FrontOpts = {
      phase: qPhase,
      expr,
      mode: act.mode,
      look: 0,
      blink: lid,
      lift: act.lift,
      prop: act.prop,
      tilt: Math.round(act.tilt),
      headTilt: Math.round(act.headTilt),
      wave: act.wave !== undefined ? Math.round(act.wave * 6) / 6 : undefined,
      light: lightAngle,
      facing: 0,
      seed,
    };
    bodyFront(p, outfit, fo);
    drawExtrasAndProp(p, extras, poseSpec.segura, false, t);
  }
}
