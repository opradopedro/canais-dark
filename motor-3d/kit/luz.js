// kit/luz.js — presets de luz, ceu e efeitos (chuva, neblina, fogueira). Tudo deterministico por t.
//
// aplicar(scene, preset, opts) -> { atualizar(t), luzes:[...] }
//   presets: dia, entardecer, noite, noite_neblina, madrugada, interior_noite, chuva, fogueira
//   .atualizar(t) move so o que depende do tempo (gotas de chuva, tremor da fogueira). SEM relogio/random livre.
import * as THREE from 'three';

// gerador pseudoaleatorio COM semente (deterministico): mesma semente -> mesma sequencia
function semente(s) {
  let a = s >>> 0;
  return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
}

const COR = {
  dia: { ceu: 0x9fc6e8, hemi: [0xbfe0ff, 0x5a6a3a, 1.0], sol: [0xfff2d8, 1.5, [-8, 18, 10]], nevoa: [0x9fc6e8, 40, 120] },
  entardecer: { ceu: 0xe8a35a, hemi: [0xffcf9a, 0x6a4a30, 0.8], sol: [0xff9d4a, 1.3, [-12, 8, 6]], nevoa: [0xe8a35a, 30, 90] },
  noite: { ceu: 0x11204a, hemi: [0x7a96d8, 0x2a3a24, 0.95], sol: [0xaec2ff, 1.0, [-10, 20, 8]], nevoa: [0x11204a, 26, 80], estrelas: true },
  noite_neblina: { ceu: 0x1c2c3a, hemi: [0x90a0b4, 0x2a342c, 0.9], sol: [0xaab8d4, 0.7, [-8, 16, 6]], nevoa: [0x1c2c3a, 10, 42], estrelas: true },
  madrugada: { ceu: 0x24305a, hemi: [0x8aa0d8, 0x2e3a26, 1.05], sol: [0xcdd8ff, 1.1, [-6, 14, 10]], nevoa: [0x24305a, 30, 88], estrelas: true },
  interior_noite: { ceu: 0x0a0906, hemi: [0x3a3020, 0x100c08, 0.4], nevoa: [0x0a0906, 10, 40], lampada: true },
  chuva: { ceu: 0x33383f, hemi: [0x8a94a0, 0x2a2e26, 0.7], sol: [0xaab0bc, 0.5, [-6, 16, 8]], nevoa: [0x33383f, 16, 54], chuva: true },
  fogueira: { ceu: 0x0b1020, hemi: [0x30364a, 0x16120c, 0.4], nevoa: [0x0b1020, 14, 50], estrelas: true, fogo: true },
};

function fazerEstrelas(scene) {
  const g = new THREE.BufferGeometry(); const p = []; const r = semente(7);
  for (let i = 0; i < 700; i++) {
    const a = r() * 6.283, e = r() * 1.2 + 0.08, R = 120;
    p.push(R * Math.cos(a) * Math.cos(e), R * Math.sin(e) + 8, R * Math.sin(a) * Math.cos(e));
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.45, fog: false, sizeAttenuation: true }));
  pts.name = 'estrelas'; scene.add(pts); return pts;
}

// chuva: gotas verticais (linhas) + aneis no chao; deterministico pelo t
function fazerChuva(scene, n = 500) {
  const r = semente(42);
  const base = [];
  for (let i = 0; i < n; i++) base.push({ x: (r() - 0.5) * 70, z: (r() - 0.5) * 70, fase: r(), v: 8 + r() * 4 });
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 2 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const linhas = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xafc0d0, transparent: true, opacity: 0.5, fog: true }));
  linhas.name = 'chuva'; scene.add(linhas);
  // aneis no chao: planos circulares que crescem e somem (poucos, reaproveitados)
  const aneisMat = new THREE.MeshBasicMaterial({ color: 0xcfe0ee, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const aneis = [];
  for (let i = 0; i < 40; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 16), aneisMat.clone());
    m.rotation.x = -Math.PI / 2; m.position.set((r() - 0.5) * 40, 0.02, (r() - 0.5) * 40);
    m.userData.fase = r(); scene.add(m); aneis.push(m);
  }
  return function atualizar(t) {
    const H = 14;
    for (let i = 0; i < n; i++) {
      const b = base[i];
      const y = H - ((t * b.v + b.fase * H) % H);
      const k = i * 6;
      pos[k] = b.x; pos[k + 1] = y + 0.6; pos[k + 2] = b.z;
      pos[k + 3] = b.x; pos[k + 4] = y; pos[k + 5] = b.z;
    }
    geo.attributes.position.needsUpdate = true;
    for (const m of aneis) {
      const ph = (t * 1.4 + m.userData.fase * 3) % 1;
      m.scale.setScalar(0.3 + ph * 3.2);
      m.material.opacity = 0.5 * (1 - ph);
    }
  };
}

export function aplicar(scene, preset = 'noite', opts = {}) {
  const c = COR[preset] || COR.noite;
  scene.background = new THREE.Color(c.ceu);
  if (c.nevoa) scene.fog = new THREE.Fog(c.nevoa[0], c.nevoa[1], c.nevoa[2]);

  const luzes = [];
  const hemi = new THREE.HemisphereLight(c.hemi[0], c.hemi[1], c.hemi[2]);
  scene.add(hemi); luzes.push(hemi);

  let sol = null;
  if (c.sol) {
    sol = new THREE.DirectionalLight(c.sol[0], c.sol[1]);
    sol.position.set(...c.sol[2]);
    sol.castShadow = true;
    const ms = opts.sombraMapa || 1024;  // 1024 e o padrao (render no Actions < 25 min); suba p/ 2048 so em close
    sol.shadow.mapSize.set(ms, ms);
    const d = 26;
    Object.assign(sol.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 0.5, far: 80 });
    sol.shadow.bias = -0.0004;
    scene.add(sol, sol.target); luzes.push(sol);
  }

  if (c.estrelas) fazerEstrelas(scene);

  // lampada amarela de interior
  let lamp = null;
  if (c.lampada) {
    lamp = new THREE.PointLight(0xffd98a, 18, 16, 1.6);
    lamp.position.set(0, 2.6, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024);
    scene.add(lamp); luzes.push(lamp);
  }

  // fogueira: luz quente que treme (deterministica pelo t)
  let fogo = null;
  if (c.fogo) {
    fogo = new THREE.PointLight(0xff8a3a, 14, 14, 1.8);
    fogo.position.set(opts.fogoX || 0, 1, opts.fogoZ || 0); fogo.castShadow = true;
    scene.add(fogo); luzes.push(fogo);
  }

  const tickChuva = c.chuva ? fazerChuva(scene, opts.chuvaN || 500) : null;

  return {
    luzes, sol, lamp, fogo,
    atualizar(t) {
      if (tickChuva) tickChuva(t);
      if (fogo) {
        // tremor deterministico: soma de senos
        const f = 0.82 + 0.18 * Math.sin(t * 17.3) * Math.sin(t * 7.1) + 0.06 * Math.sin(t * 31.0);
        fogo.intensity = 14 * Math.max(0.4, f);
        fogo.position.x = (opts.fogoX || 0) + 0.05 * Math.sin(t * 9);
      }
    },
  };
}

export const PRESETS = Object.keys(COR);
