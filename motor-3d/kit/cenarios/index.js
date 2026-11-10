// kit/cenarios/index.js — monta os cenarios 3D a partir dos modelos de assets/ + primitivas em codigo.
//
// montar(nome, scene, opts) -> { grupo, marcas, piso }
//   marcas: { nome: {x,z, cam?} } — posicao de ator e, quando util, uma dica de posicao/plano de camera.
//   Cada cenario tem 6+ marcas nomeadas. Tudo DETERMINISTICO (layout fixo com semente propria).
//
// Faltam em assets/ (feitos aqui com primitivas): carro, cerca de madeira, cruz/tumba, poste de bairro simples.
import * as THREE from 'three';
import { instanciar, ALTURAS } from '../modelos.js';

function semente(s) { let a = s >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }

// chao plano grande; cor conforme o cenario
function piso(scene, cor, tam = 200) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam),
    new THREE.MeshStandardMaterial({ color: cor, roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); return g;
}

async function por(grupo, rel, x, z, altura, { ry = 0, escalaXZ = 1, y = 0 } = {}) {
  const { obj } = await instanciar(rel, { altura });
  obj.position.set(x, y, z); obj.rotation.y = ry;
  if (escalaXZ !== 1) { obj.scale.x *= escalaXZ; obj.scale.z *= escalaXZ; }
  grupo.add(obj); return obj;
}

// ---- primitivas que faltam ----
function faixaAsfalto(grupo, len = 60, larg = 7) {
  const asf = new THREE.Mesh(new THREE.PlaneGeometry(larg, len),
    new THREE.MeshStandardMaterial({ color: 0x2b2d31, roughness: 1 }));
  asf.rotation.x = -Math.PI / 2; asf.position.y = 0.02; asf.receiveShadow = true; grupo.add(asf);
  // faixa amarela tracejada
  const mat = new THREE.MeshStandardMaterial({ color: 0xe8c23a, emissive: 0x3a2e00, roughness: 0.8 });
  for (let z = -len / 2; z < len / 2; z += 2.4) {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.1), mat);
    t.rotation.x = -Math.PI / 2; t.position.set(0, 0.03, z); grupo.add(t);
  }
  return asf;
}

function calcada(grupo, x, len = 60) {
  const c = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, len),
    new THREE.MeshStandardMaterial({ color: 0x8a8d92, roughness: 1 }));
  c.position.set(x, 0.09, 0); c.castShadow = true; c.receiveShadow = true; grupo.add(c); return c;
}

function posteBairro(grupo, x, z) {
  const g = new THREE.Group();
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a2d30, roughness: 0.7 }));
  mastro.position.y = 2.5; mastro.castShadow = true; g.add(mastro);
  const braco = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.1), mastro.material);
  braco.position.set(0.45, 5, 0); g.add(braco);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffd884, emissiveIntensity: 2.2 }));
  lamp.position.set(0.95, 4.94, 0); g.add(lamp);
  const luz = new THREE.SpotLight(0xffd79a, 26, 14, 0.7, 0.55, 1.4);
  luz.position.set(0.95, 4.9, 0); luz.target.position.set(0.95, 0, 0); luz.castShadow = true;
  luz.shadow.mapSize.set(1024, 1024); g.add(luz, luz.target);
  g.position.set(x, 0, z); grupo.add(g); return g;
}

function carro(grupo, x, z, ry = 0, cor = 0x7a2b22) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 4.2),
    new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5 }));
  corpo.position.y = 0.6; corpo.castShadow = true; g.add(corpo);
  const cabine = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.55, 2.0),
    new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5 }));
  cabine.position.set(0, 1.08, -0.1); g.add(cabine);
  const vidro = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.45, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x1a2630, roughness: 0.3 }));
  vidro.position.set(0, 1.12, -0.1); g.add(vidro);
  const rodaG = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 14);
  const rodaM = new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.9 });
  for (const [rx, rz] of [[0.95, 1.3], [-0.95, 1.3], [0.95, -1.3], [-0.95, -1.3]]) {
    const r = new THREE.Mesh(rodaG, rodaM); r.rotation.z = Math.PI / 2; r.position.set(rx, 0.34, rz); g.add(r);
  }
  for (const fx of [-0.6, 0.6]) {
    const far = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff4d0, emissive: 0xffe9a0, emissiveIntensity: 1.6 }));
    far.position.set(fx, 0.62, 2.1); g.add(far);
  }
  g.position.set(x, 0, z); g.rotation.y = ry; grupo.add(g); return g;
}

function cerca(grupo, x0, z0, x1, z1, cor = 0x6a4a2e) {
  const g = new THREE.Group();
  const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), n = Math.max(2, Math.round(L / 1.5));
  const mat = new THREE.MeshStandardMaterial({ color: cor, roughness: 1 });
  for (let i = 0; i <= n; i++) {
    const t = i / n, px = x0 + dx * t, pz = z0 + dz * t;
    const poste = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1), mat);
    poste.position.set(px, 0.55, pz); poste.castShadow = true; g.add(poste);
  }
  for (const yy of [0.4, 0.85]) {
    const trave = new THREE.Mesh(new THREE.BoxGeometry(L, 0.08, 0.06), mat);
    trave.position.set((x0 + x1) / 2, yy, (z0 + z1) / 2);
    trave.rotation.y = Math.atan2(dx, dz) - Math.PI / 2; g.add(trave);
  }
  grupo.add(g); return g;
}

function cruz(grupo, x, z, ry = 0) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a8577, roughness: 1 });
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.14), mat); v.position.y = 0.55; g.add(v);
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.14, 0.12), mat); h.position.y = 0.78; g.add(h);
  const tumulo = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x3a4a34, roughness: 1 }));
  tumulo.position.set(0, 0.09, 0.5); g.add(tumulo);
  g.position.set(x, 0, z); g.rotation.y = ry; g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  grupo.add(g); return g;
}

// floresta de pinheiros/arvores em volta (deterministica). raioInt..raioExt, evitando o centro.
async function florestaEmVolta(grupo, { r0 = 14, r1 = 34, n = 36, mortas = false, sem = 11 } = {}) {
  const r = semente(sem);
  const tipos = mortas
    ? ['CommonTree_Dead_1', 'CommonTree_Dead_3', 'BirchTree_Dead_1', 'Willow_Dead_1', 'PineTree_4']
    : ['PineTree_1', 'PineTree_2', 'PineTree_3', 'CommonTree_1', 'CommonTree_3', 'PineTree_5'];
  for (let i = 0; i < n; i++) {
    const a = r() * 6.283, rad = r0 + r() * (r1 - r0);
    const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
    const alt = (mortas ? ALTURAS.arvore_morta : ALTURAS.pinheiro) * (0.8 + r() * 0.5);
    await por(grupo, 'natureza/' + tipos[Math.floor(r() * tipos.length)], x, z, alt, { ry: r() * 6.283 });
  }
}

// =================================================================== CENARIOS
// cada um recebe (scene, opts) e devolve { grupo, marcas, piso }

async function bairro(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x2f6a2a);
  faixaAsfalto(grupo, 60, 7);
  calcada(grupo, 4.6, 60); calcada(grupo, -4.6, 60);
  // casas dos dois lados (telhado colorido)
  const casas = ['casas/1Story_GableRoof_Mat', 'casas/2Story_GableRoof_Mat', 'casas/1Story_RoundRoof_Mat', 'casas/2Story_Slim_Mat'];
  let k = 0;
  for (let z = -18; z <= 18; z += 9) {
    await por(grupo, casas[k % casas.length], 8.5, z, ALTURAS.casa, { ry: -Math.PI / 2 }); k++;
    await por(grupo, casas[(k + 1) % casas.length], -8.5, z, ALTURAS.casa, { ry: Math.PI / 2 }); k++;
  }
  // postes acesos ao longo da rua
  for (let z = -16; z <= 16; z += 8) { posteBairro(grupo, 4.9, z); posteBairro(grupo, -4.9, z); }
  await florestaEmVolta(grupo, { r0: 16, r1: 32, n: 30, sem: 3 });
  carro(grupo, 2.2, 6, Math.PI, 0x6a2b22);
  const marcas = {
    rua: { x: 0, z: 0, cam: 'medio' },
    faixa: { x: 0, z: -2, cam: 'aereo' },
    calcada: { x: -4, z: 4, cam: 'medio' },
    frente_casa: { x: -6.5, z: -9, cam: 'medio' },
    poste: { x: 4, z: 8, cam: 'baixo' },
    fim_rua: { x: 0, z: -24, cam: 'aberto' },
    arvores: { x: 12, z: -14, cam: 'baixo' },
  };
  return { grupo, marcas, piso: p };
}

async function floresta(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x24401e);
  await florestaEmVolta(grupo, { r0: 4, r1: 34, n: 70, sem: 5 });
  // clareira no centro + tocos e pedras
  for (const [x, z, rel] of [[2, -3, 'natureza/TreeStump'], [-2.5, 2, 'natureza/Rock_3'], [3, 4, 'natureza/Rock_Moss_1'], [-3, -5, 'natureza/Bush_1']])
    await por(grupo, rel, x, z, rel.includes('Rock') ? 0.5 : (rel.includes('Bush') ? 1.0 : 0.7));
  const marcas = {
    clareira: { x: 0, z: 0, cam: 'medio' },
    trilha: { x: 0, z: 6, cam: 'nuca' },
    entre_arvores: { x: -5, z: -8, cam: 'baixo' },
    toco: { x: 2, z: -3, cam: 'medio' },
    fundo: { x: 0, z: -14, cam: 'aberto' },
    alto: { x: 0, z: 0, cam: 'aereo' },
  };
  return { grupo, marcas, piso: p };
}

async function estrada(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x3a3326); // terra
  // estrada de terra/asfalto no meio do mato
  const estr = new THREE.Mesh(new THREE.PlaneGeometry(5, 70),
    new THREE.MeshStandardMaterial({ color: opts.asfalto ? 0x2b2d31 : 0x5a4a34, roughness: 1 }));
  estr.rotation.x = -Math.PI / 2; estr.position.y = 0.02; estr.receiveShadow = true; grupo.add(estr);
  if (opts.asfalto) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 0.8 });
    for (let z = -30; z < 30; z += 3) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1.2), mat); t.rotation.x = -Math.PI / 2; t.position.set(0, 0.03, z); grupo.add(t); }
  }
  await florestaEmVolta(grupo, { r0: 5, r1: 30, n: 50, sem: 9 });
  cerca(grupo, -3.2, -12, -3.2, 12);
  const marcas = {
    meio: { x: 0, z: 0, cam: 'medio' },
    vindo: { x: 0, z: 10, cam: 'aberto' },
    indo: { x: 0, z: -10, cam: 'nuca' },
    acostamento: { x: -2.6, z: 2, cam: 'medio' },
    curva: { x: 0, z: -18, cam: 'aereo' },
    beira_mato: { x: 4, z: -6, cam: 'baixo' },
  };
  return { grupo, marcas, piso: p };
}

async function casa_interior(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x6a5540, 40);
  // paredes de uma sala/cozinha
  const parede = new THREE.MeshStandardMaterial({ color: 0x8a7a66, roughness: 1, side: THREE.DoubleSide });
  const fundo = new THREE.Mesh(new THREE.BoxGeometry(12, 3.2, 0.2), parede); fundo.position.set(0, 1.6, -4); fundo.receiveShadow = true; grupo.add(fundo);
  const esq = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 8), parede); esq.position.set(-6, 1.6, 0); grupo.add(esq);
  // moveis do interior/
  await por(grupo, 'interior/Couch_Large1', -3, -2.8, ALTURAS.movel, { ry: 0 });
  await por(grupo, 'interior/Table_RoundSmall', -3, -1, 0.5);
  await por(grupo, 'interior/Kitchen_Oven', 3.5, -3.4, 1.1, { ry: 0 });
  await por(grupo, 'interior/Kitchen_Fridge', 5, -3.3, 1.8, { ry: 0 });
  await por(grupo, 'interior/Bed_Single', -4.4, 1.5, 0.6, { ry: Math.PI / 2 });
  await por(grupo, 'interior/Window_Large1', 0, -3.9, 1.6);
  await por(grupo, 'interior/Light_Floor1', 2, -1, 1.5);
  const marcas = {
    sala: { x: -2.5, z: 0, cam: 'medio' },
    sofa: { x: -3, z: -1.8, cam: 'medio' },
    cozinha: { x: 4, z: -2, cam: 'medio' },
    quarto: { x: -4, z: 1.5, cam: 'medio' },
    janela: { x: 0, z: -3, cam: 'close' },
    porta: { x: 3, z: 3, cam: 'ombro' },
  };
  return { grupo, marcas, piso: p };
}

async function cemiterio(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x2a3326);
  const r = semente(13);
  for (let i = 0; i < 12; i++) cruz(grupo, (r() - 0.5) * 16, (r() - 0.5) * 16, (r() - 0.5) * 0.4);
  await florestaEmVolta(grupo, { r0: 10, r1: 26, n: 24, mortas: true, sem: 17 });
  cerca(grupo, -10, 10, 10, 10, 0x4a4238);
  cerca(grupo, -10, -10, 10, -10, 0x4a4238);
  await por(grupo, 'vila/Well', 6, -4, 2.2); // poço velho de pedra
  const marcas = {
    entrada: { x: 0, z: 9, cam: 'aberto' },
    entre_cruzes: { x: 0, z: 0, cam: 'medio' },
    cruz_grande: { x: -3, z: -3, cam: 'baixo' },
    fundo: { x: 0, z: -9, cam: 'aereo' },
    arvore_morta: { x: 8, z: -6, cam: 'baixo' },
    poco: { x: 6, z: -4, cam: 'medio' },
  };
  return { grupo, marcas, piso: p };
}

async function vila(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x4a6a2e);
  // praça de terra no centro
  const praca = new THREE.Mesh(new THREE.CircleGeometry(9, 32),
    new THREE.MeshStandardMaterial({ color: 0x8a7050, roughness: 1 }));
  praca.rotation.x = -Math.PI / 2; praca.position.y = 0.02; praca.receiveShadow = true; grupo.add(praca);
  await por(grupo, 'vila/Well', 0, 0, 2.4);
  await por(grupo, 'vila/House_1', -9, -5, ALTURAS.casa_vila, { ry: Math.PI / 4 });
  await por(grupo, 'vila/House_3', 9, -5, ALTURAS.casa_vila, { ry: -Math.PI / 4 });
  await por(grupo, 'vila/Mill', -11, 8, ALTURAS.moinho, { ry: -Math.PI / 3 });
  await por(grupo, 'vila/Inn', 10, 7, 6, { ry: -Math.PI / 2 }); // taverna
  await por(grupo, 'vila/MarketStand_1', -3, 5, 2.4, { ry: Math.PI });
  await por(grupo, 'vila/MarketStand_2', 4, 5, 2.2, { ry: Math.PI });
  await por(grupo, 'vila/Cart', 5, -2, 1.8, { ry: 0.5 });
  await florestaEmVolta(grupo, { r0: 18, r1: 34, n: 26, sem: 21 });
  const marcas = {
    praca: { x: 0, z: 3, cam: 'medio' },
    poco: { x: 0, z: 0, cam: 'medio' },
    moinho: { x: -9, z: 6, cam: 'aberto' },
    taverna: { x: 8, z: 6, cam: 'medio' },
    mercado: { x: 0, z: 5, cam: 'medio' },
    casa: { x: -7, z: -4, cam: 'medio' },
    alto: { x: 0, z: 0, cam: 'aereo' },
  };
  return { grupo, marcas, piso: p };
}

async function campo(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x6a7a2e);
  const r = semente(23);
  // trigo em fileiras
  for (let i = 0; i < 90; i++) await por(grupo, 'natureza/Wheat', (r() - 0.5) * 30, (r() - 0.5) * 24, 1.0 + r() * 0.4, { ry: r() * 6.283 });
  cerca(grupo, -14, 10, 14, 10);
  cerca(grupo, -14, -10, -14, 10);
  await por(grupo, 'vila/Stable', 11, -8, 5, { ry: -Math.PI / 2 }); // celeiro
  await por(grupo, 'vila/Hay', 7, 3, 1.2);
  await por(grupo, 'animais/Cow', -5, 5, ALTURAS.animal_grande, { ry: 1 });
  await florestaEmVolta(grupo, { r0: 20, r1: 34, n: 16, sem: 29 });
  const marcas = {
    trigo: { x: 0, z: 0, cam: 'medio' },
    fileiras: { x: 0, z: 4, cam: 'aberto' },
    cerca: { x: 0, z: 9, cam: 'medio' },
    celeiro: { x: 9, z: -6, cam: 'medio' },
    vaca: { x: -5, z: 5, cam: 'medio' },
    alto: { x: 0, z: 0, cam: 'aereo' },
  };
  return { grupo, marcas, piso: p };
}

async function acampamento(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x2e4620);
  await por(grupo, 'objetos/Tent', -2, -1, ALTURAS.barraca, { ry: 0.4 });
  await por(grupo, 'objetos/Bonfire', 1.5, 1.5, ALTURAS.fogueira);
  // chama da fogueira (brilha via bloom)
  const chama = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.0, 10),
    new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff7a1a, emissiveIntensity: 3 }));
  chama.position.set(1.5, 0.6, 1.5); chama.name = 'chama_fogueira'; grupo.add(chama);
  await por(grupo, 'objetos/Backpack', 2.4, -0.6, 0.5);
  await por(grupo, 'natureza/WoodLog', 0.2, 2.8, 0.4, { ry: 0.6 });
  await florestaEmVolta(grupo, { r0: 6, r1: 30, n: 50, sem: 31 });
  const marcas = {
    fogueira: { x: 1.5, z: 1.5, cam: 'medio' },
    barraca: { x: -2, z: -1, cam: 'medio' },
    sentado: { x: -0.2, z: 2.8, cam: 'medio' },
    mato: { x: -6, z: -6, cam: 'baixo' },
    alto: { x: 0, z: 0, cam: 'aereo' },
    frente_fogo: { x: 1.5, z: 3.4, cam: 'close' },
  };
  return { grupo, marcas, piso: p, fogoX: 1.5, fogoZ: 1.5 };
}

async function torre(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x24401e);
  // torre de vigia de madeira (primitivas): 4 pernas, plataforma, cabine, escada
  const g = new THREE.Group();
  const mad = new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 1 });
  const h = 6;
  for (const [px, pz] of [[1.2, 1.2], [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]]) {
    const perna = new THREE.Mesh(new THREE.BoxGeometry(0.2, h, 0.2), mad);
    perna.position.set(px, h / 2, pz); perna.castShadow = true; g.add(perna);
  }
  const plat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 3), mad); plat.position.y = h; plat.castShadow = true; g.add(plat);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x6a5238, roughness: 1 }));
  cab.position.y = h + 0.9; g.add(cab);
  const teto = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1, 4), new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: 1 }));
  teto.position.y = h + 2.3; teto.rotation.y = Math.PI / 4; g.add(teto);
  // janela acesa
  const jan = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffcf6b, emissiveIntensity: 1.8 }));
  jan.position.set(0, h + 0.9, 1.31); g.add(jan);
  g.position.set(0, 0, -4); grupo.add(g);
  await florestaEmVolta(grupo, { r0: 8, r1: 32, n: 56, sem: 37 });
  const marcas = {
    pe_torre: { x: 0, z: 0, cam: 'baixo' },
    base: { x: 0, z: 4, cam: 'aberto' },
    cabine: { x: 0, z: -4, cam: 'medio' },
    janela: { x: 0, z: -2.6, cam: 'close' },
    mato: { x: -7, z: -7, cam: 'baixo' },
    alto: { x: 0, z: -4, cam: 'aereo' },
  };
  return { grupo, marcas, piso: p };
}

const CENARIOS = { bairro, floresta, estrada, casa_interior, cemiterio, vila, campo, acampamento, torre };

export async function montar(nome, scene, opts = {}) {
  const fn = CENARIOS[nome] || bairro;
  return await fn(scene, opts);
}

export const NOMES = Object.keys(CENARIOS);
