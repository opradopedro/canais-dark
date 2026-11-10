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

// cada preset: ceu (base), ceuTopo/ceuBaixo (degrade do domo), hemi [ceu, chao, forca], sol [cor, forca, pos],
// nevoa [cor, perto, longe], ambiente (AmbientLight extra p/ garantir leitura), e flags.
// Regra: o SOL fica quase branco (nao tinge os objetos de laranja); a COR do ceu/nevoa e que da o clima.
const COR = {
  dia: { ceuTopo: 0x6fa8df, ceuBaixo: 0xcfe6f5, hemi: [0xcfe8ff, 0x6a7a4a, 1.1], sol: [0xfff4e0, 1.6, [-8, 18, 10]], nevoa: [0xcfe6f5, 55, 150], ambiente: [0xbfd6e8, 0.35] },
  entardecer: { ceuTopo: 0x7a6a9a, ceuBaixo: 0xf6b074, hemi: [0xffe0c0, 0x8a7a60, 1.5], sol: [0xfff2e0, 1.5, [-12, 10, 6]], nevoa: [0xecc098, 55, 150], ambiente: [0xe8d0bc, 0.7] },
  noite: { ceuTopo: 0x1e3068, ceuBaixo: 0x465ea0, hemi: [0xbccdf6, 0x66748a, 2.7], sol: [0xdce6ff, 1.6, [-10, 20, 8]], nevoa: [0x30447e, 48, 140], ambiente: [0x7a8ab8, 1.3], estrelas: true },
  noite_neblina: { ceuTopo: 0x3e4c6a, ceuBaixo: 0x6e86a2, hemi: [0xd6e0ec, 0x7a8470, 3.0], sol: [0xe2ecf6, 1.4, [-8, 16, 6]], nevoa: [0x5a6e86, 24, 78], ambiente: [0x95a4b8, 1.6], estrelas: true },
  madrugada: { ceuTopo: 0x1a2c5a, ceuBaixo: 0x5e70a0, hemi: [0xc0d0f0, 0x5e6a52, 2.3], sol: [0xe6eeff, 1.5, [-6, 14, 10]], nevoa: [0x32447a, 46, 140], ambiente: [0x7888ae, 1.0], estrelas: true },
  interior_noite: { ceuTopo: 0x0a0906, ceuBaixo: 0x14100a, hemi: [0x4a4030, 0x14100a, 0.7], nevoa: [0x0f0c08, 12, 44], ambiente: [0x3a3222, 0.5], lampada: true },
  chuva: { ceuTopo: 0x4a5464, ceuBaixo: 0x74808e, hemi: [0xc8d2de, 0x6a7062, 2.6], sol: [0xe0e6ee, 1.1, [-6, 16, 8]], nevoa: [0x5e6a76, 30, 92], ambiente: [0x95a0ac, 1.5], chuva: true },
  fogueira: { ceuTopo: 0x14203e, ceuBaixo: 0x32406a, hemi: [0x6a78a0, 0x2a2418, 1.5], sol: [0xbccaf0, 0.6, [-8, 18, 8]], nevoa: [0x1e2a4a, 22, 74], ambiente: [0x56608a, 0.9], estrelas: true, fogo: true },
};

// domo de ceu com degrade vertical (topo escuro -> horizonte claro). Fica atras de tudo, sem sombra nem nevoa.
function fazerCeu(scene, topo, baixo) {
  const geo = new THREE.SphereGeometry(180, 24, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { topo: { value: new THREE.Color(topo) }, baixo: { value: new THREE.Color(baixo) } },
    vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying float h; uniform vec3 topo; uniform vec3 baixo; void main(){ float f = clamp(h*0.9+0.25,0.0,1.0); gl_FragColor = vec4(mix(baixo, topo, f), 1.0); }',
  });
  const dome = new THREE.Mesh(geo, mat); dome.name = 'ceu_domo'; scene.add(dome); return dome;
}

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
  // ceu em degrade (domo) em vez de cor chapada; o fundo fica da cor do horizonte (caso o domo nao cubra tudo)
  scene.background = new THREE.Color(c.ceuBaixo);
  const domo = fazerCeu(scene, c.ceuTopo, c.ceuBaixo);
  if (c.nevoa) scene.fog = new THREE.Fog(c.nevoa[0], c.nevoa[1], c.nevoa[2]);

  const luzes = [domo];
  const hemi = new THREE.HemisphereLight(c.hemi[0], c.hemi[1], c.hemi[2]);
  scene.add(hemi); luzes.push(hemi);
  // luz ambiente extra: garante que nada fique abaixo do piso de brilho (noite legivel)
  if (c.ambiente) { const amb = new THREE.AmbientLight(c.ambiente[0], c.ambiente[1]); scene.add(amb); luzes.push(amb); }

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
