// Main Remotion + Three.js Cartoon Engine component (CartoonShort.tsx).
// Preserves the exact visual pipeline of templates/wukong/Wukong.tsx:
// InkPass -> LensBlur -> BloomEffect -> ToneMappingEffect(NEUTRAL) -> GradeEffect,
// twoTone Lambert world materials, cardShade 2D character/creature billboards with LRU(40) texture cache,
// and word-synced captions compatible with motor-en/sincronia.py.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback, NOINK } from "./ink";
import { LensBlur } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { LIGHTS, LOOK, resolveLightKey, isNightLight, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { cardShade, CARD_K } from "./cardshade";
import { Pen, fxBurst } from "./toon";
import { ctex, h3 } from "../cenarios/comum";
import { buildScenario, ScenarioResult, MarkDef } from "../cenarios";
import { drawPersonCard, ElencoDef } from "../elenco/pessoas";
import { drawCreatureCard } from "../elenco/criaturas";
import { drawMonkey, drawGod, EMPEROR, GENERAL, furTones } from "./monkey";
import { CenaTimeline, Corte, planejarCortes, computeCamPose, clamp01, smoother } from "./camera";

export const FPS = 30;
const SU = 0.00216; // 1000 design units = 2.16 m

export interface Segmento {
  idx: number;
  start: number;
  end: number;
  dur: number;
  text: string;
  w?: number[];
}

export interface EstadoRender {
  fps?: number;
  dur: number;
  legenda?: string;
  serie?: string;
  destaque?: string[];
  elenco?: Record<string, ElencoDef>;
  cenas: CenaTimeline[];
  segs: Segmento[];
}

// ---------------- LRU(40) CanvasTexture Cache ----------------
const BODY_GEO = (() => {
  const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU);
  g.translate(0, (975 - 500) * SU, 0);
  return g;
})();

const texCache = new Map<string, THREE.CanvasTexture>();
const cardTex = (key: string, k: number, draw: (p: Pen) => void, w = 600, h = 1000) => {
  const kk = `${k}|${key}`;
  let t = texCache.get(kk);
  if (t) {
    texCache.delete(kk);
    texCache.set(kk, t); // LRU refresh
  } else {
    while (texCache.size >= 40) {
      const [k0, t0] = texCache.entries().next().value!;
      texCache.delete(k0);
      t0.dispose();
    }
    const cv = document.createElement("canvas");
    cv.width = Math.round(w * k);
    cv.height = Math.round(h * k);
    const g = cv.getContext("2d")!;
    g.setTransform(k, 0, 0, k, 0, 0);
    draw(new Pen(g));
    t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(kk, t);
  }
  return t;
};

const blankTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 2;
  return new THREE.CanvasTexture(c);
})();

class Card {
  mesh: THREE.Mesh;
  mat: THREE.MeshLambertMaterial;
  dmat: THREE.MeshDepthMaterial;
  constructor(parent: THREE.Object3D) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blankTex, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.dmat = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: blankTex,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(BODY_GEO, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => {
      const rt = r.getRenderTarget();
      CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920;
    };
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ";
    this.mesh.renderOrder = 1;
    this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  show(t: THREE.Texture, x: number, y: number, z: number, s: number, cam: THREE.Vector3, roll = 0, mirror = false) {
    this.mat.map = t;
    this.dmat.map = t;
    this.mesh.position.set(x, y, z);
    this.mesh.scale.set(mirror ? -s : s, s, s);
    this.mesh.rotation.set(0, Math.atan2(cam.x - x, cam.z - z), roll);
    this.mesh.visible = true;
  }
}

const discTex = () =>
  ctex("sunMoonDisc", 128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 54, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
  });

// ---------------- Story World Controller ----------------
class StoryWorld {
  root = new THREE.Group();
  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  private pointLight: THREE.PointLight;
  private sky: THREE.Mesh;
  private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private cards: Card[] = [];
  private scenarios = new Map<string, ScenarioResult>();
  private cortes: Corte[] = [];
  private isWukong: boolean;
  private estado: EstadoRender;
  private rainGroup = new THREE.Group();
  private snowGroup = new THREE.Group();
  private beams: THREE.Mesh[] = [];
  private beamGlow: THREE.Mesh[] = [];

  constructor(estado: EstadoRender) {
    this.estado = estado;
    const elencoKeys = Object.keys(estado.elenco || {});
    this.isWukong =
      estado.serie === "wukong" ||
      elencoKeys.some((k) => /wukong|macaco/i.test(k));

    const R = this.root;

    // Sky shader (exact match to templates/wukong/world.ts)
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: {
        c0: { value: new THREE.Color() },
        c1: { value: new THREE.Color() },
        c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() },
        c4: { value: new THREE.Color() },
        e: { value: new THREE.Vector4() },
      },
      vertexShader:
        "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1;
    this.sky.frustumCulled = false;
    this.sky.layers.set(NOINK);
    R.add(this.sky);

    this.sunDisc = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: discTex(),
        color: new THREE.Color(5.0, 3.8, 2.2),
        fog: false,
        depthWrite: false,
      })
    );
    this.sunDisc.renderOrder = -0.5;
    this.sunDisc.layers.set(NOINK);
    this.sunDisc.frustumCulled = false;
    R.add(this.sunDisc);

    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.0);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.pointLight = new THREE.PointLight("#ffaa44", 0, 14, 1.5);
    R.add(this.hemi, this.sun, this.sun.target, this.pointLight);

    // Pre-build scenarios needed by this story
    for (const c of estado.cenas) {
      const key = this.scenKey(c);
      if (!this.scenarios.has(key)) {
        const sc = buildScenario(c.cenario, this.isWukong, c.idx);
        sc.group.visible = false;
        R.add(sc.group);
        this.scenarios.set(key, sc);
      }
    }

    // Plan camera cuts across all scenes
    this.cortes = planejarCortes(estado.cenas, (cenario) => {
      for (const [k, sc] of this.scenarios.entries()) {
        if (k.startsWith(cenario + "|") && sc.limites) return true;
      }
      return cenario === "casa_interior" || cenario === "hospital";
    });

    // Weather particles: Rain & Snow (on NOINK layer)
    const rainMat = new THREE.MeshBasicMaterial({ color: "#b8d4f0", transparent: true, opacity: 0.48, fog: false });
    const rainGeo = new THREE.PlaneGeometry(0.025, 0.75);
    for (let i = 0; i < 90; i++) {
      const drop = new THREE.Mesh(rainGeo, rainMat);
      drop.layers.set(NOINK);
      this.rainGroup.add(drop);
    }
    this.rainGroup.visible = false;
    R.add(this.rainGroup);

    const snowMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.8, fog: false });
    const snowGeo = new THREE.CircleGeometry(0.045, 6);
    for (let i = 0; i < 80; i++) {
      const flake = new THREE.Mesh(snowGeo, snowMat);
      flake.layers.set(NOINK);
      this.snowGroup.add(flake);
    }
    this.snowGroup.visible = false;
    R.add(this.snowGroup);

    // Golden eye beams for Wukong
    for (let k = 0; k < 2; k++) {
      const b = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 12, 1, true).translate(0, 0.5, 0),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.6, 1.2), fog: false })
      );
      b.layers.set(NOINK);
      b.visible = false;
      R.add(b);
      this.beams.push(b);

      const gl = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 1, 16, 1, true).translate(0, 0.5, 0),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(1.2, 0.8, 0.25),
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
        })
      );
      gl.layers.set(NOINK);
      gl.visible = false;
      R.add(gl);
      this.beamGlow.push(gl);
    }
  }

  private scenKey(c: CenaTimeline) {
    return `${c.cenario}|${this.isWukong ? c.idx : 0}`;
  }

  private card(i: number) {
    while (this.cards.length <= i) this.cards.push(new Card(this.root));
    return this.cards[i];
  }

  private resolveMark(sc: ScenarioResult, name?: string): MarkDef {
    if (name && sc.marcas[name]) return sc.marcas[name];
    const first = Object.values(sc.marcas)[0];
    return first || { x: 0, z: 0 };
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS;
    const cenas = this.estado.cenas;
    let cena = cenas[0];
    for (const c of cenas) {
      if (t >= c.t0 && t < c.t1) {
        cena = c;
        break;
      }
      if (t >= c.t1) cena = c;
    }

    let corte = this.cortes[0];
    for (const ct of this.cortes) {
      if (t >= ct.t0 && t < ct.t1) {
        corte = ct;
        break;
      }
      if (t >= ct.t1) corte = ct;
    }

    // Activate current scenario
    const activeKey = this.scenKey(cena);
    for (const [k, sc] of this.scenarios.entries()) {
      sc.group.visible = k === activeKey;
    }
    const sc = this.scenarios.get(activeKey)!;

    // Evaluate active scene events
    let lightOverride: string | null = null;
    let lightMultiplier = 1.0;
    let sustoKick = 0;
    let flashOverlay = 0;

    for (const ev of cena.eventos || []) {
      const dt = t - ev.t_abs;
      if (dt >= 0) {
        if (ev.tipo === "apagar_luz") lightOverride = "madrugada";
        if (ev.tipo === "piscar_luz" && dt < 1.2) {
          lightMultiplier = Math.sin(dt * 38) > 0 ? 1.15 : 0.25;
        }
        if (ev.tipo === "relampago" && dt < 0.28) {
          flashOverlay = Math.max(flashOverlay, 1 - dt / 0.28);
          lightMultiplier = 2.4;
        }
        if (ev.tipo === "susto" && dt < 0.25) {
          sustoKick = Math.sin((dt / 0.25) * Math.PI);
        }
      }
    }

    const rawLuz = lightOverride || cena.luz || (this.isWukong ? "golden" : "noite");
    const lightKey = resolveLightKey(rawLuz);
    const L: LightPreset = LIGHTS[lightKey];
    const K = LOOK[lightKey];
    const night = isNightLight(lightKey);

    sc.update?.(t, night, cena.idx);

    // Resolve actor positions to determine camera focus
    const atores = cena.atores || [];
    const actorPositions: {
      id: string;
      x: number;
      y: number;
      z: number;
      acao: string;
      rosto: string;
      segura?: string;
      scale: number;
    }[] = [];

    const durCena = Math.max(0.2, cena.t1 - cena.t0);
    const uCena = smoother((t - cena.t0) / durCena);

    atores.forEach((a, idx) => {
      const def = (this.estado.elenco || {})[a.id] || {};
      const scale = def.altura || (/wukong|macaco/i.test(a.id) ? 0.65 : 1.0);

      let x = 0, y = 0, z = 0;
      if (a.de && a.para) {
        const mA = this.resolveMark(sc, a.de);
        const mB = this.resolveMark(sc, a.para);
        x = mA.x + (mB.x - mA.x) * uCena;
        y = (mA.y || 0) + ((mB.y || 0) - (mA.y || 0)) * uCena;
        z = mA.z + (mB.z - mA.z) * uCena;
      } else {
        const m = this.resolveMark(sc, a.marca || cena.marca);
        x = m.x;
        y = m.y || 0;
        z = m.z;
        // Spread multiple actors sharing the same mark
        if (atores.length > 1) {
          const spread = (idx - (atores.length - 1) / 2) * 1.15;
          x += spread;
        }
      }

      let acao = a.acao || (a.de && a.para ? "Walking_A" : "Idle_A");
      let rosto = a.rosto || "neutro";

      // Apply actor-specific events
      for (const ev of cena.eventos || []) {
        if (t >= ev.t_abs && (!ev.ator || ev.ator === a.id)) {
          if (ev.tipo === "acao" && ev.acao) acao = ev.acao;
          if (ev.tipo === "rosto" && ev.rosto) rosto = ev.rosto;
          if (ev.tipo === "susto" && t - ev.t_abs < 1.2) rosto = "susto";
        }
      }

      actorPositions.push({ id: a.id, x, y, z, acao, rosto, segura: a.segura, scale });
    });

    // Resolve creature position if present
    let creaturePos: { tipo: string; x: number; y: number; z: number; visible: boolean } | null = null;
    if (cena.criatura && cena.criatura.tipo) {
      const cm = this.resolveMark(sc, cena.criatura.marca || cena.marca);
      let vis = true;
      for (const ev of cena.eventos || []) {
        if (ev.tipo === "aparecer" && t < ev.t_abs) vis = false;
      }
      // Offset creature slightly if an actor is on the exact same mark
      let cx = cm.x;
      let cz = cm.z;
      if (actorPositions.some((ap) => Math.hypot(ap.x - cx, ap.z - cz) < 0.6)) {
        cx += 1.1;
        cz -= 1.2;
      }
      creaturePos = { tipo: cena.criatura.tipo, x: cx, y: cm.y || 0, z: cz, visible: vis };
    }

    // Choose focus point for camera
    const baseMark = this.resolveMark(sc, cena.marca);
    const focus = new THREE.Vector3(baseMark.x, baseMark.y || 0, baseMark.z);
    let charHeight = 1.65;
    if (actorPositions.length > 0) {
      const mainActor = actorPositions[0];
      focus.set(mainActor.x, mainActor.y, mainActor.z);
      charHeight = 1.68 * mainActor.scale;
    } else if (creaturePos && creaturePos.visible) {
      focus.set(creaturePos.x, creaturePos.y, creaturePos.z);
    } else if (cena.cenario === "hospital" && cena.marca === "porta") {
      // Frame Room 418 door and its glowing red call light
      focus.set(-2.6, 0.2, -4.0);
    } else if (this.isWukong && cena.cenario === "templo_oriental") {
      focus.set(-0.25, 1.2, 4.8);
    }

    const camPose = computeCamPose(corte, t, focus, charHeight, sc.limites, sustoKick);
    cam.position.set(...camPose.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(...camPose.look);
    cam.rotateZ(camPose.roll);
    cam.fov = camPose.fov;
    cam.near = 0.1;
    cam.far = 1500;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    cam.layers.enable(NOINK);

    // ---- Light rig & twoTone / cardShade uniforms ----
    const fx = camPose.look[0] - camPose.pos[0];
    const fz = camPose.look[2] - camPose.pos[2];
    const fn = Math.hypot(fx, fz) || 1;
    const nx = fx / fn, nz = fz / fn;
    const az = THREE.MathUtils.degToRad(L.az);
    const el = THREE.MathUtils.degToRad(L.el);
    const hx = nx * Math.cos(az) - nz * Math.sin(az);
    const hz = nz * Math.cos(az) + nx * Math.sin(az);
    const sunDir = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();

    this.hemi.color.set(L.sky);
    this.hemi.groundColor.set(L.ground);
    this.hemi.intensity = L.hemiI * lightMultiplier;
    this.sun.color.set(L.sunCol);
    this.sun.intensity = L.sunI * lightMultiplier;

    const dist = cam.position.distanceTo(focus);
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 6, 10, 45);
    this.sun.position.copy(focus).addScaledVector(sunDir, 180);
    this.sun.target.position.copy(focus);
    const shCam = this.sun.shadow.camera;
    shCam.left = -Rr;
    shCam.right = Rr;
    shCam.top = Rr;
    shCam.bottom = -Rr;
    shCam.near = 20;
    shCam.far = 380;
    shCam.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias;
    this.sun.shadow.normalBias = L.normalBias * (Rr / 12);

    // Point light for flashlight / torch / campfire
    const hasWarmProp = actorPositions.some((a) => a.segura === "lanterna" || a.segura === "tocha");
    if (lightKey === "fogueira" || hasWarmProp) {
      this.pointLight.intensity = (lightKey === "fogueira" ? 2.4 : 1.4) * (0.92 + 0.08 * Math.sin(t * 17));
      this.pointLight.position.set(focus.x + 0.4, focus.y + 1.3, focus.z + 0.6);
    } else {
      this.pointLight.intensity = 0;
    }

    TONE.uLitCol.value.set(...L.lit);
    TONE.uShadeCol.value.set(...L.shade);
    TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert;
    TONE.uSideK.value = L.sideK;
    TONE.uTerm.value = L.term;
    TONE.uBounce.value.set(...K.bounce);
    TONE.uSat.value = K.sat;

    CHAR.uCharTint.value.set(...L.charTint);
    CHAR.uCharShade.value = L.charShade;
    CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad;
    CHAR.uSideTint.value.set(...L.sideTint);

    // ---- Sky & Fog ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((hxCol, i) => untone(hxCol, su["c" + i].value));
    const eRad = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(eRad[1], eRad[2], eRad[3], eRad[4]);
    this.sky.position.copy(cam.position);

    untone(L.fog, this.fog.color);
    const foggy = cena.efeito === "neblina_baixa" || lightKey === "neblina_baixa" || lightKey === "noite_neblina";
    this.fog.near = foggy ? 10 : sc.limites ? 16 : 38;
    this.fog.far = foggy ? 85 : sc.limites ? 95 : 380;
    scene.fog = this.fog;
    scene.background = null;

    // Sun / Moon disc in sky (outdoors only)
    const showDisc = !sc.limites && (lightKey === "golden" || lightKey === "por_sol" || lightKey === "nascer_sol" || lightKey === "lua_cheia" || night);
    this.sunDisc.visible = showDisc;
    if (showDisc) {
      const isMoon = night || lightKey === "lua_cheia";
      (this.sunDisc.material as THREE.SpriteMaterial).color.setRGB(
        isMoon ? 2.2 : 5.5,
        isMoon ? 2.6 : 4.0,
        isMoon ? 3.8 : 2.2
      );
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(isMoon ? 1.8 : 2.2)));
    }

    // ---- Weather Effects (Rain / Snow) ----
    const isRain = cena.efeito === "chuva" || lightKey === "chuva" || lightKey === "tempestade";
    this.rainGroup.visible = isRain && !sc.limites;
    if (this.rainGroup.visible) {
      this.rainGroup.children.forEach((c, i) => {
        const rx = cam.position.x + ((h3(i, 1, 2) - 0.5) * 12);
        const rz = cam.position.z - 2 - h3(i, 3, 4) * 10;
        const ry = cam.position.y + 4 - (((t * 14 + h3(i, 5, 6) * 8) % 8));
        c.position.set(rx, ry, rz);
        c.quaternion.copy(cam.quaternion);
      });
    }

    const isSnow = cena.efeito === "neve" || lightKey === "neve";
    this.snowGroup.visible = isSnow && !sc.limites;
    if (this.snowGroup.visible) {
      this.snowGroup.children.forEach((c, i) => {
        const sx = cam.position.x + ((h3(i, 2, 3) - 0.5) * 12) + Math.sin(t * 1.5 + i) * 0.3;
        const sz = cam.position.z - 1.5 - h3(i, 4, 5) * 9;
        const sy = cam.position.y + 4 - (((t * 2.2 + h3(i, 6, 7) * 7) % 7));
        c.position.set(sx, sy, sz);
        c.quaternion.copy(cam.quaternion);
      });
    }

    // ---- Character & Creature Cards ----
    for (const cd of this.cards) cd.mesh.visible = false;
    for (const b of [...this.beams, ...this.beamGlow]) b.visible = false;

    let ci = 0;
    const camP = cam.position;
    const tierK = (x: number, y: number, z: number) => {
      const d = Math.hypot(camP.x - x, camP.y - (y + 0.9), camP.z - z);
      return d < 2.6 ? 3.5 : d < 5.5 ? 2.2 : d < 12 ? 1.2 : 0.7;
    };

    // Quantize animation time to 12 fps so LRU(40) texture cache hits frequently while staying fluid
    const animStep = Math.floor(t * 12) / 12;

    for (const ap of actorPositions) {
      // In Wukong Episode 1 (CL036) Scene 0, the stone egg has not cracked yet, so Wukong is inside the egg
      if (this.isWukong && cena.idx === 0 && /wukong/i.test(ap.id)) {
        continue;
      }

      const def = (this.estado.elenco || {})[ap.id] || {};
      const k = tierK(ap.x, ap.y, ap.z);
      const texKey = `p|${ap.id}|${ap.acao}|${ap.rosto}|${ap.segura || ""}|${animStep}`;
      const tex = cardTex(texKey, k, (p) =>
        drawPersonCard(p, ap.id, def, ap.acao, ap.rosto, ap.segura, animStep, f)
      );
      this.card(ci++).show(tex, ap.x, ap.y, ap.z, ap.scale, camP);

      // Wukong Golden Eye Beams when eyes shoot golden light to Heaven (scene 5 in CL036)
      if (this.isWukong && /wukong/i.test(ap.id) && cena.idx === 5) {
        const eyeY = ap.y + (975 - 473) * SU * ap.scale;
        const eyeDX = 29 * SU * ap.scale;
        const dir = new THREE.Vector3(0, 1, -0.12).normalize();
        for (let bIdx = 0; bIdx < 2; bIdx++) {
          const ex = ap.x + (bIdx ? 1 : -1) * eyeDX;
          for (const [m, rad] of [[this.beams[bIdx], 0.025], [this.beamGlow[bIdx], 0.08]] as const) {
            m.visible = true;
            m.position.set(ex, eyeY, ap.z + 0.04);
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
            m.scale.set(rad, 120, rad);
          }
        }
      }
    }

    // Wukong Jade Palace scenes: Jade Emperor & General + Golden beams piercing through the cloud floor
    if (this.isWukong && cena.cenario === "templo_oriental") {
      for (let bIdx = 0; bIdx < 2; bIdx++) {
        const bx = -4.2 + bIdx * 0.85, bz = 8.2;
        for (const [m, rad] of [[this.beams[bIdx], 0.28], [this.beamGlow[bIdx], 0.85]] as const) {
          m.visible = true;
          m.position.set(bx, -20, bz);
          m.quaternion.identity();
          m.scale.set(rad, 160, rad);
        }
      }
      if (actorPositions.length === 0) {
        const k = tierK(-0.25, 1.2, 4.8);
        const empExpr = cena.idx === 6 ? "shock" : "smile";
        const genExpr = cena.idx === 6 ? "shock" : "grin";
        const empTex = cardTex(`wkEmp|${empExpr}`, k, (p) => drawGod(p, EMPEROR, empExpr, 0, 2));
        const genTex = cardTex(`wkGen|${genExpr}`, k, (p) => drawGod(p, GENERAL, genExpr, 0, 5));
        this.card(ci++).show(empTex, -0.45, 1.2, 4.8, 1.0, camP);
        this.card(ci++).show(genTex, 0.55, 1.2, 4.6, 1.0, camP);
      }
    }

    // Wukong Cave Kingdom scenes: Cheering monkey subjects around the Stone Throne
    if (this.isWukong && cena.idx >= 14 && cena.cenario === "floresta") {
      const monkeySpots: [number, number, number][] = [
        [-2.2, -4.2, 0.54],
        [2.2, -4.2, 0.54],
        [-3.4, -2.2, 0.56],
        [3.4, -2.2, 0.56],
      ];
      monkeySpots.forEach(([mx, mz, msc], mi) => {
        const bob = 8 * Math.round(3 * Math.abs(Math.sin(animStep * 6 + mi)));
        const mOpts = {
          pose: "cheer" as const,
          expr: (mi % 2 ? "laugh" : "grin") as "laugh" | "grin",
          lid: 0,
          fur: furTones[mi % 5],
          seed: 10 + mi,
          bob,
        };
        const k = tierK(mx, 0, mz);
        const tex = cardTex(`mSub|${mi}|${bob}`, k, (p) => drawMonkey(p, mOpts));
        this.card(ci++).show(tex, mx, 0, mz, msc, camP, 0, mi % 2 === 1);
      });
    }

    // Creature card
    if (creaturePos && creaturePos.visible) {
      const cTipo = creaturePos.tipo;
      const cScale =
        cTipo === "gigante_mitologico"
          ? 1.55
          : cTipo === "alta" || cTipo === "coisa_com_chifres" || cTipo === "lobisomem"
          ? 1.22
          : cTipo === "cao_negro" || cTipo === "rastejante" || cTipo === "animal"
          ? 0.78
          : 1.05;
      const k = tierK(creaturePos.x, creaturePos.y, creaturePos.z);
      const cKey = `c|${cTipo}|${animStep}`;
      const tex = cardTex(cKey, k, (p) => drawCreatureCard(p, cTipo, animStep, cena.idx + 7));
      this.card(ci++).show(tex, creaturePos.x, creaturePos.y, creaturePos.z, cScale, camP);
    }

    return { focus, cInf: camPose.cInf, lightKey, flashOverlay };
  }
}

// ---------------- Post-processing & ThreeCanvas Wrapper ----------------
const makeBloom = () => {
  const b = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    intensity: 0.5,
    luminanceThreshold: 1.0,
    luminanceSmoothing: 0.2,
    mipmapBlur: true,
    levels: 6,
    radius: 0.6,
  });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3();

const InnerScene: React.FC<{ estado: EstadoRender }> = ({ estado }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new StoryWorld(estado), [estado]);
  const fx = useMemo(
    () => ({
      ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
      lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
      bloom: makeBloom(),
      tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    }),
    [camera, scene]
  );

  const post = useMemo(
    () => (
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.lens.pre} dispose={null} />
        <primitive object={fx.lens.main} dispose={null} />
        <primitive object={fx.bloom} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
        <primitive object={fx.grade} dispose={null} />
      </EffectComposer>
    ),
    [fx]
  );

  const cam = camera as THREE.PerspectiveCamera;
  const { focus, cInf, lightKey } = world.update(f, cam, scene);
  noInkFallback(world.root);
  cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, focus.clone().sub(cam.position).dot(fwd));
  fx.lens.cInf = cInf;
  gradeFor(fx.grade, lightKey);

  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

// ---------------- Word-Synced Captions (compatible with sincronia.py conferir) ----------------
interface WordItem {
  clean: string;
  s: number;
  e: number;
  hi: boolean;
}

const AUTO_HI =
  /^(stone|monkey|golden|heaven|gods|froze|waterfall|kingdom|king|jade|palace|cracked|laughed|beams|blood|dead|death|shadow|dark|scream|eyes|night|monster|fire|ghost|muerto|muerte|sangre|sombra|noche|grito|ojos|fuego|fantasma|miedo|nadie|puerta|espejo|cama|pasos)$/i;

function buildCaptionChunks(estado: EstadoRender): WordItem[][] {
  const aligned = estado.legenda === "alinhamento";
  const lead = aligned ? 0 : 1 / FPS;
  const topHi = new Set((estado.destaque || []).map((w) => w.toLowerCase().replace(/[^a-záéíóúñü0-9]/gi, "")));
  const chunks: WordItem[][] = [];

  for (const seg of estado.segs || []) {
    const rawStr =
      typeof seg.text === "string"
        ? seg.text
        : String((seg.text as { texto?: string; text?: string })?.texto || (seg.text as { text?: string })?.text || "");
    const rawTokens = rawStr.trim().split(/\s+/).filter(Boolean);
    if (!rawTokens.length) continue;

    const segWords: WordItem[] = [];
    const totalChars = rawTokens.reduce((acc, tk) => acc + tk.length, 0) || 1;
    let charCum = 0;

    rawTokens.forEach((raw, i) => {
      const starred = raw.includes("*");
      const stripped = raw.replace(/\*/g, "");
      const clean = stripped.replace(/[.,!?¡¿"—;:'"()]/g, "");
      const norm = clean.toLowerCase();
      const hi = starred || topHi.has(norm) || AUTO_HI.test(clean);

      let s: number;
      let e: number;
      if (seg.w && seg.w.length === rawTokens.length) {
        s = seg.w[i] - lead;
        e = i + 1 < rawTokens.length ? seg.w[i + 1] - lead : seg.end;
      } else {
        const frac0 = charCum / totalChars;
        charCum += raw.length;
        const frac1 = charCum / totalChars;
        s = seg.start + frac0 * seg.dur - lead;
        e = seg.start + frac1 * seg.dur;
      }
      if (clean.length > 0) {
        segWords.push({ clean, s, e, hi });
      }
    });

    // Group into chunks of up to 3 words (or break on punctuation)
    let cur: WordItem[] = [];
    segWords.forEach((w, i) => {
      cur.push(w);
      const rawTk = rawTokens[i] || "";
      if (cur.length === 3 || /[.,!?—]$/.test(rawTk)) {
        chunks.push(cur);
        cur = [];
      }
    });
    if (cur.length) chunks.push(cur);
  }

  return chunks;
}

const Captions: React.FC<{ estado: EstadoRender }> = ({ estado }) => {
  const f = useCurrentFrame();
  // Small +1e-4 epsilon so frame ceil(w.s * 30) always satisfies t >= w.s
  const t = (f + 1e-4) / FPS;
  const chunks = useMemo(() => buildCaptionChunks(estado), [estado]);

  let activeChunk: WordItem[] | null = null;
  for (let i = 0; i < chunks.length; i++) {
    const ch = chunks[i];
    const a = ch[0].s;
    const nxt = i + 1 < chunks.length ? chunks[i + 1][0].s : Infinity;
    const end = Math.min(nxt, ch[ch.length - 1].e + 0.55);
    if (t >= a && t < end) {
      activeChunk = ch;
      break;
    }
  }

  if (!activeChunk) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1180 }}>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", maxWidth: 940 }}>
        {activeChunk.map((w, i) => {
          const on = t >= w.s;
          const k = Math.min(1, Math.max(0, ((t - w.s) * FPS) / 3));
          return (
            <span
              key={i}
              style={{
                visibility: on ? "visible" : "hidden",
                fontFamily: "Inter, 'Inter Display', Arial, sans-serif",
                fontWeight: 900,
                fontSize: 90,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: w.hi ? "#ffd23a" : "#ffffff",
                WebkitTextStroke: "14px #120c16",
                paintOrder: "stroke fill",
                transform: `scale(${0.85 + 0.15 * k})`,
                display: "inline-block",
                textShadow: "0 8px 0 rgba(18,12,22,0.55)",
              }}
            >
              {w.clean}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Root CartoonShort Component ----------------
export const CartoonShort: React.FC<{ estado?: EstadoRender; dpr?: number; noCaps?: boolean }> = (props) => {
  const input = getInputProps() as { estado?: EstadoRender; dpr?: number; noCaps?: boolean };
  const estado = props.estado || input.estado;
  const dprVal = props.dpr ?? input.dpr;
  const noCaps = props.noCaps ?? input.noCaps;

  if (!estado || !estado.cenas || estado.cenas.length === 0) {
    return <AbsoluteFill style={{ background: "#12131a" }} />;
  }

  return (
    <AbsoluteFill style={{ background: "#12131a" }}>
      <ThreeCanvas
        width={1080}
        height={1920}
        {...(dprVal ? { dpr: dprVal } : {})}
        shadows
        gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
        camera={{ fov: 38, near: 0.1, far: 1500 }}
      >
        <InnerScene estado={estado} />
      </ThreeCanvas>
      {!noCaps && <Captions estado={estado} />}
    </AbsoluteFill>
  );
};
