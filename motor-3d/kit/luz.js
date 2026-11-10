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
  // --- céu e clima (rodada 3) ---
  lua_cheia: { ceuTopo: 0x1a2c5a, ceuBaixo: 0x48609a, hemi: [0xc2d2f4, 0x66748a, 2.4], sol: [0xe6eeff, 1.7, [8, 20, 6]], nevoa: [0x2a3c72, 46, 140], ambiente: [0x7888b4, 1.1], estrelas: true, lua: 'cheia' },
  lua_minguante: { ceuTopo: 0x16285a, ceuBaixo: 0x3a5290, hemi: [0xaec2f2, 0x5a6a52, 1.9], sol: [0xcdd8ff, 1.2, [10, 18, 6]], nevoa: [0x26386e, 40, 120], ambiente: [0x6a7aa8, 0.95], estrelas: true, lua: 'minguante' },
  neblina_baixa: { ceuTopo: 0x3a4656, ceuBaixo: 0x7a8694, hemi: [0xc8d2dc, 0x707868, 2.2], sol: [0xdce2ea, 1.0, [-8, 16, 6]], nevoa: [0x8a94a0, 6, 30], ambiente: [0x9aa4b0, 1.2], estrelas: false },
  neve: { ceuTopo: 0x9aa8ba, ceuBaixo: 0xd0dae4, hemi: [0xe6eef4, 0x9aa0a8, 1.6], sol: [0xf0f4f8, 1.2, [-6, 18, 10]], nevoa: [0xcdd8e2, 30, 90], ambiente: [0xbcc6d0, 0.7], neve: true },
  tempestade: { ceuTopo: 0x1e2430, ceuBaixo: 0x3a4450, hemi: [0x8a95a2, 0x45504a, 1.3], sol: [0xaab4c0, 0.6, [-6, 16, 8]], nevoa: [0x343c48, 20, 66], ambiente: [0x6a747e, 0.8], chuva: true, raio: true },
  nascer_sol: { ceuTopo: 0x5a6aa0, ceuBaixo: 0xf2c070, hemi: [0xffe0b8, 0x7a7a5a, 1.5], sol: [0xfff0d8, 1.5, [10, 6, 6]], nevoa: [0xf0cc90, 50, 150], ambiente: [0xe8d4b0, 0.7] },
  por_sol: { ceuTopo: 0x6a4a7a, ceuBaixo: 0xf29060, hemi: [0xffd0a8, 0x7a6048, 1.4], sol: [0xfff0dc, 1.4, [-12, 7, 6]], nevoa: [0xe8a878, 45, 130], ambiente: [0xe4c0a4, 0.7] },
  nublado: { ceuTopo: 0x8a94a0, ceuBaixo: 0xb8c0c8, hemi: [0xd8dee4, 0x8a8e80, 1.7], sol: [0xd0d6dc, 0.8, [-6, 18, 8]], nevoa: [0xb0b8c0, 45, 130], ambiente: [0xa8b0b8, 0.9] },
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

  // lua (cheia ou minguante): disco claro no ceu, brilha um pouco (bloom)
  if (c.lua) {
    const lua = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.4, 1.3), fog: false }));
    lua.position.set(26, 34, -60); lua.lookAt(0, 20, 0); lua.name = 'lua'; scene.add(lua); luzes.push(lua);
    if (c.lua === 'minguante') { const sombra = new THREE.Mesh(new THREE.CircleGeometry(4.05, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(c.ceuTopo), fog: false })); sombra.position.set(23.5, 34, -59.8); sombra.lookAt(0, 20, 0); scene.add(sombra); luzes.push(sombra); }
  }

  const tickChuva = c.chuva ? fazerChuva(scene, opts.chuvaN || 500) : null;
  const tickNeve = c.neve ? fazerNeve(scene, opts.neveN || 400) : null;

  // raio (tempestade): luz branca forte que pisca em instantes determinados pelo t
  let raio = null;
  if (c.raio) { raio = new THREE.DirectionalLight(0xdfe8ff, 0); raio.position.set(6, 30, 10); scene.add(raio); luzes.push(raio); }

  return {
    luzes, sol, lamp, fogo, raio,
    atualizar(t) {
      if (tickChuva) tickChuva(t);
      if (tickNeve) tickNeve(t);
      if (fogo) {
        const f = 0.82 + 0.18 * Math.sin(t * 17.3) * Math.sin(t * 7.1) + 0.06 * Math.sin(t * 31.0);
        fogo.intensity = 14 * Math.max(0.4, f);
        fogo.position.x = (opts.fogoX || 0) + 0.05 * Math.sin(t * 9);
      }
      if (raio) {
        // relampago deterministico: flashes curtos em t a cada ~6 s (com um eco)
        const ciclo = t % 6.0;
        let i = 0;
        if (ciclo < 0.08) i = 1 - ciclo / 0.08;
        else if (ciclo > 0.18 && ciclo < 0.24) i = 1 - (ciclo - 0.18) / 0.06;
        raio.intensity = 6 * Math.max(0, i);
      }
    },
  };
}

// neve: flocos caindo devagar e balançando (deterministico por t)
function fazerNeve(scene, n = 400) {
  const r = semente(55); const base = [];
  for (let i = 0; i < n; i++) base.push({ x: (r() - 0.5) * 70, z: (r() - 0.5) * 70, fase: r(), v: 1.2 + r() * 0.8, bal: r() * 6.28 });
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.9, fog: true, sizeAttenuation: true }));
  pts.name = 'neve'; scene.add(pts);
  return function atualizar(t) {
    const H = 16;
    for (let i = 0; i < n; i++) { const b = base[i]; const y = H - ((t * b.v + b.fase * H) % H); const k = i * 3; pos[k] = b.x + Math.sin(t * 0.6 + b.bal) * 0.6; pos[k + 1] = y; pos[k + 2] = b.z; }
    geo.attributes.position.needsUpdate = true;
  };
}

export const PRESETS = Object.keys(COR);
