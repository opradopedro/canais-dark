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
// n e cortado pela metade por padrao para o render caber em < 25 min no Actions (pedido do Pedro).
const _FATOR_ARVORES = 0.55; // reduz a quantidade de arvores visiveis (performance)
async function florestaEmVolta(grupo, { r0 = 14, r1 = 34, n = 36, mortas = false, sem = 11 } = {}) {
  n = Math.max(6, Math.round(n * _FATOR_ARVORES));
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

// figurante de fundo: versão LEVE do personagem liso (sem esqueleto/animação, barato), com cores variadas,
// cabeça-bola, tronco, braços e pernas em cápsulas e um rostinho simples. Para a vila/campo terem gente de verdade.
const _PELES_F = ['#f2d6be', '#d9a77f', '#c98d5f', '#a8703f', '#8a5a34'];
const _ROUPAS_F = ['#6a2b22', '#2e3a6a', '#3f5a3a', '#7a5a34', '#8a6a9a', '#d8b43a', '#b0c4de', '#4a4a4a'];
function figuraFundo(grupo, x, z, ry = 0, sem = 1) {
  const r = (() => { let a = (sem | 0) >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
  const g = new THREE.Group();
  const pele = new THREE.MeshStandardMaterial({ color: _PELES_F[Math.floor(r() * _PELES_F.length)], roughness: 0.78 });
  const roupa = new THREE.MeshStandardMaterial({ color: _ROUPAS_F[Math.floor(r() * _ROUPAS_F.length)], roughness: 0.82 });
  const calca = new THREE.MeshStandardMaterial({ color: '#2a3550', roughness: 0.85 });
  const alt = 1.5 + r() * 0.2, rc = 0.15;
  const tronco = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, alt * 0.38, 6, 10), roupa); tronco.position.y = alt * 0.52; tronco.castShadow = true; g.add(tronco);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(rc, 16, 14), pele); cab.position.y = alt * 0.9; cab.castShadow = true; g.add(cab);
  // rostinho: dois olhos pretos num plano
  const fc = document.createElement('canvas'); fc.width = fc.height = 64; const fx = fc.getContext('2d'); fx.fillStyle = '#000'; fx.beginPath(); fx.ellipse(22, 30, 6, 8, 0, 0, 7); fx.ellipse(42, 30, 6, 8, 0, 0, 7); fx.fill();
  const rosto = new THREE.Mesh(new THREE.PlaneGeometry(rc * 1.8, rc * 1.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(fc), transparent: true, depthTest: false })); rosto.position.set(0, alt * 0.9, rc * 0.95); rosto.renderOrder = 6; g.add(rosto);
  // pernas
  for (const sx of [-0.08, 0.08]) { const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, alt * 0.3, 6, 8), calca); p.position.set(sx, alt * 0.18, 0); p.castShadow = true; g.add(p); }
  // braços
  for (const sx of [-0.2, 0.2]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, alt * 0.3, 6, 8), roupa); b.position.set(sx, alt * 0.52, 0); b.castShadow = true; g.add(b); }
  g.position.set(x, 0, z); g.rotation.y = ry; grupo.add(g); return g;
}

async function vila(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x4a6a2e);
  // praça de terra no centro
  const praca = new THREE.Mesh(new THREE.CircleGeometry(8, 32),
    new THREE.MeshStandardMaterial({ color: 0x8a7050, roughness: 1 }));
  praca.rotation.x = -Math.PI / 2; praca.position.y = 0.02; praca.receiveShadow = true; grupo.add(praca);
  // caminho de pedra ligando as casas
  const caminho = new THREE.Mesh(new THREE.PlaneGeometry(3, 26),
    new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: 1 }));
  caminho.rotation.x = -Math.PI / 2; caminho.position.set(0, 0.015, -2); grupo.add(caminho);
  // poço ~1,2 m de altura (escala igual à pessoa); casas com porta ~2 m (casa_vila ~5,5 m)
  await por(grupo, 'vila/Well', 0, 0, 1.2);
  // casas mais perto e espalhadas (vila cheia, não chão vazio)
  await por(grupo, 'vila/House_1', -7, -4, ALTURAS.casa_vila, { ry: Math.PI / 5 });
  await por(grupo, 'vila/House_2', 7, -4, ALTURAS.casa_vila, { ry: -Math.PI / 5 });
  await por(grupo, 'vila/House_3', -8, 4, 5.2, { ry: Math.PI / 2 });
  await por(grupo, 'vila/House_4', 8, 3, 5.0, { ry: -Math.PI / 2 });
  await por(grupo, 'vila/Mill', -11, 9, ALTURAS.moinho, { ry: -Math.PI / 3 });
  await por(grupo, 'vila/Inn', 10, 8, 6, { ry: -Math.PI / 2 }); // taverna
  await por(grupo, 'vila/MarketStand_1', -3, 5, 2.4, { ry: Math.PI });
  await por(grupo, 'vila/MarketStand_2', 3, 5, 2.2, { ry: Math.PI });
  await por(grupo, 'vila/Cart', 5, -1, 1.8, { ry: 0.5 });
  await por(grupo, 'vila/Barrel', -4, 1, 0.9); await por(grupo, 'vila/Barrel', -4.6, 1.4, 0.9);
  await por(grupo, 'vila/Crate', 4, 1.5, 0.8, { ry: 0.3 });
  await por(grupo, 'vila/Hay', 6, 4, 1.2);
  cerca(grupo, -9, 7, -5, 7); cerca(grupo, 5, 6, 9, 6);
  // aldeões de fundo (vila viva)
  figuraFundo(grupo, -2.5, 4, 2.4, 11); figuraFundo(grupo, 2.2, 3.4, -1.0, 23);
  figuraFundo(grupo, -1.2, -1.5, 0.8, 37); figuraFundo(grupo, 4.2, -0.5, 2.2, 51);
  await florestaEmVolta(grupo, { r0: 20, r1: 34, n: 20, sem: 21 });
  const marcas = {
    praca: { x: 0, z: 3, cam: 'medio' },
    poco: { x: 1.2, z: 0.6, cam: 'medio' },
    moinho: { x: -8, z: 7, cam: 'aberto' },
    taverna: { x: 8, z: 6.5, cam: 'medio' },
    mercado: { x: 0, z: 3.6, cam: 'medio' },
    casa: { x: -5, z: -3, cam: 'medio' },
    alto: { x: 0, z: 1, cam: 'aereo' },
  };
  return { grupo, marcas, piso: p };
}

async function campo(scene, opts) {
  const grupo = new THREE.Group(); scene.add(grupo);
  const p = piso(scene, 0x6a7a2e);
  const r = semente(23);
  // trigo em fileiras (mais denso, campo cheio)
  for (let i = 0; i < 120; i++) await por(grupo, 'natureza/Wheat', (r() - 0.5) * 30, (r() - 0.5) * 22, 1.0 + r() * 0.4, { ry: r() * 6.283 });
  cerca(grupo, -14, 10, 14, 10);
  cerca(grupo, -14, -10, -14, 10);
  cerca(grupo, 14, -10, 14, 10);
  await por(grupo, 'vila/Stable', 11, -8, 5, { ry: -Math.PI / 2 }); // celeiro
  await por(grupo, 'vila/Mill', -12, -7, ALTURAS.moinho, { ry: Math.PI / 3 });
  await por(grupo, 'vila/Hay', 7, 3, 1.2); await por(grupo, 'vila/Hay', 8.2, 2, 1.1);
  await por(grupo, 'vila/Cart', -6, -4, 1.8, { ry: 0.8 });
  await por(grupo, 'animais/Cow', -5, 5, ALTURAS.animal_grande, { ry: 1 });
  await por(grupo, 'animais/Donkey', 3, -3, 1.4, { ry: -0.6 });
  figuraFundo(grupo, 1, 2, 2.6, 67); figuraFundo(grupo, -3, -1, 1.2, 83);
  await florestaEmVolta(grupo, { r0: 20, r1: 34, n: 14, sem: 29 });
  const marcas = {
    trigo: { x: 0, z: 0, cam: 'medio' },
    fileiras: { x: 0, z: 4, cam: 'aberto' },
    cerca: { x: 0, z: 9, cam: 'medio' },
    celeiro: { x: 9, z: -6, cam: 'medio' },
    vaca: { x: -5, z: 5, cam: 'medio' },
    alto: { x: 0, z: 1, cam: 'aereo' },
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

// ======================= CENARIOS NOVOS (rodada 3) =======================
// helpers de primitiva comuns
function caixa(grupo, x, y, z, w, h, d, cor, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85 }));
  m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; grupo.add(m); return m;
}
function luzQuente(grupo, x, y, z, cor = 0xffd79a, inten = 10, dist = 8) {
  const l = new THREE.PointLight(cor, inten, dist, 1.8); l.position.set(x, y, z); grupo.add(l); return l;
}
function paredeCorredor(grupo, cor, len = 24, larg = 4, alt = 3) {
  const mat = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9, side: THREE.DoubleSide });
  const ch = new THREE.Mesh(new THREE.BoxGeometry(larg, 0.1, len), mat); ch.position.set(0, alt, 0); grupo.add(ch);
  for (const sx of [-larg / 2, larg / 2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, alt, len), mat); p.position.set(sx, alt / 2, 0); p.receiveShadow = true; grupo.add(p); }
}

async function hospital(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x8a9096, 40);
  paredeCorredor(g, 0xcfd6dc, 30, 4.2, 3); for (let z = -12; z <= 12; z += 4) luzQuente(g, 0, 2.9, z, 0xeaf2ff, 6, 6);
  caixa(g, 1.4, 0.5, -6, 2, 1, 0.8, 0xdfe6ec); // maca
  await por(g, 'interior/Door_5', 0, -14.8, 2.2);
  const marcas = { corredor: { x: 0, z: 2, cam: 'nuca' }, maca: { x: 1.2, z: -6, cam: 'medio' }, fundo: { x: 0, z: -12, cam: 'aberto' }, porta: { x: 0, z: -13, cam: 'medio' }, entrada: { x: 0, z: 10, cam: 'aberto' }, meio: { x: 0, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function escola(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x9a8a6a, 40);
  paredeCorredor(g, 0xe8d8b0, 26, 4.5, 3); for (let z = -10; z <= 10; z += 5) luzQuente(g, 0, 2.9, z, 0xfff0c0, 6, 7);
  for (let i = 0; i < 4; i++) await por(g, 'interior/Door_3', (i % 2 ? 1 : -1) * 2.1, -8 + i * 4, 2.2, { ry: i % 2 ? -Math.PI / 2 : Math.PI / 2 });
  const marcas = { corredor: { x: 0, z: 2, cam: 'nuca' }, sala: { x: -1.5, z: -4, cam: 'medio' }, fundo: { x: 0, z: -10, cam: 'aberto' }, porta: { x: -1.5, z: -4, cam: 'medio' }, entrada: { x: 0, z: 9, cam: 'aberto' }, meio: { x: 0, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function metro(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x4a4a52, 40);
  // plataforma + trilhos + túnel escuro
  caixa(g, 0, 0.1, 0, 8, 0.2, 30, 0x6a6a72); // plataforma
  caixa(g, 0, -0.3, 5, 3, 0.4, 30, 0x2a2a30); // valeta dos trilhos
  for (let i = 0; i < 2; i++) caixa(g, i ? 1 : -1, -0.1, 5, 0.12, 0.1, 30, 0xb0b0b8); // trilhos
  for (let z = -12; z <= 12; z += 6) luzQuente(g, 0, 3, z, 0xeaf2ff, 7, 8);
  const tunel = caixa(g, 0, 2, -15, 6, 4.5, 2, 0x0a0a0e); // boca do túnel
  const marcas = { plataforma: { x: -1.5, z: 0, cam: 'medio' }, beira: { x: 0, z: 2.5, cam: 'medio' }, tunel: { x: 0, z: -12, cam: 'aberto' }, fundo: { x: 0, z: -13, cam: 'baixo' }, banco: { x: -2.5, z: -3, cam: 'medio' }, alto: { x: 0, z: 0, cam: 'aereo' } };
  return { grupo: g, marcas, piso: p }; }

async function elevador_predio(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x3a3a40, 20);
  const mat = 0x6a6a72; caixa(g, 0, 1.4, -1.4, 2.6, 2.8, 0.1, mat); // fundo
  caixa(g, -1.4, 1.4, 0, 0.1, 2.8, 2.8, mat); caixa(g, 1.4, 1.4, 0, 0.1, 2.8, 2.8, mat); // laterais
  caixa(g, 0, 2.85, 0, 2.8, 0.1, 2.8, 0x2a2a30); luzQuente(g, 0, 2.7, 0, 0xfff0c0, 5, 4);
  caixa(g, 0.9, 1.4, -1.33, 0.3, 0.5, 0.05, 0xffcf6b); // painel aceso
  const marcas = { cabine: { x: 0, z: 0.4, cam: 'medio' }, canto: { x: -0.8, z: 0.4, cam: 'close' }, painel: { x: 0.9, z: 0.2, cam: 'close' }, porta: { x: 0, z: 1.2, cam: 'medio' }, fundo: { x: 0, z: -1, cam: 'medio' }, alto: { x: 0, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function posto_gasolina(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x3a3d42, 60);
  caixa(g, 0, 3.0, -8, 10, 0.3, 6, 0xdfe6ec); // teto da cobertura
  for (const sx of [-4, 4]) caixa(g, sx, 1.5, -8, 0.25, 3, 0.25, 0xb0b0b8); // pilares
  for (const sx of [-1.5, 1.5]) caixa(g, sx, 0.7, -7, 0.6, 1.4, 0.5, 0xd84a3a); // bombas
  luzQuente(g, 0, 2.8, -8, 0xeaf2ff, 14, 14);
  await por(g, 'casas/1Story_Sign_Mat', 8, 0, -6, { ry: -Math.PI / 2 });
  const marcas = { bomba: { x: 1, z: -6, cam: 'medio' }, loja: { x: 7, z: -5, cam: 'medio' }, cobertura: { x: 0, z: -8, cam: 'aberto' }, estrada: { x: 0, z: 8, cam: 'aberto' }, fundo: { x: 0, z: -12, cam: 'baixo' }, alto: { x: 0, z: -4, cam: 'aereo' } };
  return { grupo: g, marcas, piso: p }; }

async function farol(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x2a3a3a, 80);
  // mar
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), new THREE.MeshStandardMaterial({ color: 0x1a3a4a, roughness: 0.4 })); mar.rotation.x = -Math.PI / 2; mar.position.set(0, 0.05, -30); g.add(mar);
  // torre do farol
  const torre = caixa(g, 0, 5, -6, 2.4, 10, 2.4, 0xeeeee6); const faixa = caixa(g, 0, 6, -6, 2.5, 1.5, 2.5, 0xd84a3a);
  const lanterna = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 1.4, 12), new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffcf6b, emissiveIntensity: 2 })); lanterna.position.set(0, 10.5, -6); g.add(lanterna);
  luzQuente(g, 0, 10.5, -6, 0xffe8a0, 22, 30);
  const marcas = { base: { x: 0, z: 0, cam: 'baixo' }, pedra: { x: -3, z: 2, cam: 'medio' }, mar: { x: 2, z: 4, cam: 'aberto' }, topo: { x: 0, z: 2, cam: 'aereo' }, costa: { x: 4, z: 3, cam: 'medio' }, farol: { x: 0, z: 0, cam: 'baixo' } };
  return { grupo: g, marcas, piso: p }; }

async function lago_congelado(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0xcfe0ee, 90);
  const gelo = new THREE.Mesh(new THREE.CircleGeometry(16, 32), new THREE.MeshStandardMaterial({ color: 0xbfe0f0, roughness: 0.25, metalness: 0.1 })); gelo.rotation.x = -Math.PI / 2; gelo.position.y = 0.02; g.add(gelo);
  // rachaduras
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const c = caixa(g, Math.cos(a) * 5, 0.03, Math.sin(a) * 5, 0.08, 0.02, 6, 0x6a90a8, a); }
  await florestaEmVolta(g, { r0: 18, r1: 34, n: 20, mortas: true, sem: 61 });
  const marcas = { centro: { x: 0, z: 0, cam: 'medio' }, borda: { x: 10, z: 2, cam: 'aberto' }, rachadura: { x: 3, z: 3, cam: 'baixo' }, mata: { x: -14, z: -6, cam: 'aberto' }, alto: { x: 0, z: 0, cam: 'aereo' }, meio: { x: 0, z: 4, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function mina(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x3a2e22, 40);
  paredeCorredor(g, 0x4a3a2a, 28, 4, 3.2);
  for (let z = -10; z <= 10; z += 4) { const viga = caixa(g, 0, 1.6, z, 0.2, 3.2, 0.2, 0x3a2a18); caixa(g, 0, 3.1, z, 4, 0.2, 0.3, 0x3a2a18); luzQuente(g, 0, 2.6, z, 0xffb060, 4, 5); }
  caixa(g, 1, 0.3, -5, 1.2, 0.6, 2, 0x2a2a30); // vagonete
  const marcas = { tunel: { x: 0, z: 2, cam: 'nuca' }, vagonete: { x: 1, z: -5, cam: 'medio' }, fundo: { x: 0, z: -11, cam: 'baixo' }, viga: { x: 0, z: -2, cam: 'medio' }, entrada: { x: 0, z: 10, cam: 'aberto' }, meio: { x: 0, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function igreja_antiga(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x4a4238, 50);
  paredeCorredor(g, 0x6a6258, 30, 8, 6);
  for (let z = -10; z <= 10; z += 5) for (const sx of [-3.6, 3.6]) caixa(g, sx, 3, z, 0.4, 6, 0.4, 0x5a5248); // colunas
  const altar = caixa(g, 0, 0.6, -12, 3, 1.2, 1.5, 0x8a7a5a); const cruz = caixa(g, 0, 2.5, -13, 0.2, 1.4, 0.2, 0xcfc0a0); caixa(g, 0, 2.9, -13, 0.8, 0.2, 0.2, 0xcfc0a0);
  for (let z = -10; z <= 8; z += 3) for (const sx of [-2, 2]) caixa(g, sx, 0.4, z, 1.4, 0.8, 0.6, 0x4a3a2a); // bancos
  luzQuente(g, 0, 5, -11, 0xffe0a0, 10, 14);
  const marcas = { nave: { x: 0, z: 2, cam: 'nuca' }, altar: { x: 0, z: -10, cam: 'medio' }, coluna: { x: -3, z: -2, cam: 'baixo' }, banco: { x: -2, z: 0, cam: 'medio' }, entrada: { x: 0, z: 10, cam: 'aberto' }, alto: { x: 0, z: -2, cam: 'aereo' } };
  return { grupo: g, marcas, piso: p }; }

async function deserto(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0xd8b474, 120);
  const r = semente((o && o.variante) || 71);
  for (let i = 0; i < 6; i++) { const d = caixa(g, (r() - 0.5) * 40, 0.6, (r() - 0.5) * 40, 2 + r() * 3, 1.2, 2 + r() * 3, 0xc8a464); } // dunas
  for (let i = 0; i < 5; i++) await por(g, 'natureza/Rock_' + (1 + Math.floor(r() * 5)), (r() - 0.5) * 30, (r() - 0.5) * 30, 0.6 + r() * 0.6);
  const marcas = { areia: { x: 0, z: 0, cam: 'medio' }, duna: { x: 4, z: -6, cam: 'aberto' }, horizonte: { x: 0, z: -14, cam: 'aberto' }, pedra: { x: -4, z: 3, cam: 'medio' }, alto: { x: 0, z: 0, cam: 'aereo' }, meio: { x: 0, z: 4, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function praia_noite(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0xcfc088, 120);
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(140, 70), new THREE.MeshStandardMaterial({ color: 0x14283a, roughness: 0.4 })); mar.rotation.x = -Math.PI / 2; mar.position.set(0, 0.04, -35); g.add(mar);
  for (let i = 0; i < 5; i++) { const a = -14 + i * 7; caixa(g, a, 0.1, -6, 5, 0.1, 1, 0x1a3a4a); } // ondas rasas
  await por(g, 'natureza/WoodLog', -6, 3, 0.5, { ry: 0.5 });
  const marcas = { areia: { x: 0, z: 4, cam: 'medio' }, mar: { x: 0, z: -4, cam: 'aberto' }, tronco: { x: -6, z: 3, cam: 'medio' }, horizonte: { x: 0, z: -12, cam: 'aberto' }, alto: { x: 0, z: 0, cam: 'aereo' }, meio: { x: 2, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function fazenda(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x6a7a2e, 90);
  await por(g, 'vila/Stable', -8, -6, 5.5, { ry: Math.PI / 4 });
  await por(g, 'casas/2Story_GableRoof_Mat', 9, -6, ALTURAS.casa, { ry: -Math.PI / 4 });
  await por(g, 'vila/Well', 2, 0, 1.2); await por(g, 'vila/Cart', -3, 3, 1.8, { ry: 0.5 }); await por(g, 'vila/Hay', 5, 2, 1.2);
  cerca(g, -12, 8, 12, 8); for (let i = 0; i < 40; i++) await por(g, 'natureza/Wheat', (semente(7)() - 0.5) * 20 + 0, -2 + i * 0.3, 1.0);
  await por(g, 'animais/Cow', -4, 4, ALTURAS.animal_grande, { ry: 1 }); await por(g, 'animais/Donkey', 4, -2, 1.4, { ry: -0.6 });
  figuraFundo(g, 1, 3, 2.2, 95);
  const marcas = { curral: { x: -6, z: -4, cam: 'medio' }, casa: { x: 7, z: -4, cam: 'aberto' }, poco: { x: 2, z: 0.8, cam: 'medio' }, campo: { x: 0, z: 4, cam: 'aberto' }, alto: { x: 0, z: 0, cam: 'aereo' }, cerca: { x: 0, z: 7, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function castelo(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x4a5a3a, 120);
  // muralha + torres + portão
  caixa(g, 0, 3, -10, 20, 6, 1.2, 0x8a8278); for (const sx of [-10, 10]) { caixa(g, sx, 4, -10, 3, 8, 3, 0x7a7268); caixa(g, sx, 8.3, -10, 3.4, 1, 3.4, 0x6a1e1e); }
  caixa(g, 0, 2.2, -9.3, 3, 4.4, 0.4, 0x3a2a1a); // portão
  // torre central
  caixa(g, 0, 6, -16, 5, 12, 5, 0x8a8278); const bandeira = caixa(g, 0, 12.5, -16, 0.1, 1.5, 1.2, 0x6a1e1e);
  const marcas = { portao: { x: 0, z: -6, cam: 'medio' }, muralha: { x: 0, z: -4, cam: 'aberto' }, torre: { x: 0, z: -10, cam: 'baixo' }, patio: { x: 0, z: 2, cam: 'aberto' }, alto: { x: 0, z: -6, cam: 'aereo' }, meio: { x: 0, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function mercado_medieval(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x8a7050, 60);
  await por(g, 'vila/MarketStand_1', -3, 2, 2.4, { ry: Math.PI }); await por(g, 'vila/MarketStand_2', 3, 2, 2.2, { ry: Math.PI });
  await por(g, 'vila/MarketStand_1', -3, -4, 2.4, { ry: 0 }); await por(g, 'vila/MarketStand_2', 3, -4, 2.2, { ry: 0 });
  await por(g, 'vila/House_1', -9, -6, ALTURAS.casa_vila, { ry: Math.PI / 4 }); await por(g, 'vila/House_3', 9, -6, 5, { ry: -Math.PI / 4 });
  await por(g, 'vila/Barrel', -1, 0, 0.9); await por(g, 'vila/Crate', 1, -1, 0.8);
  figuraFundo(g, -1.5, 1, 2.5, 101); figuraFundo(g, 1.8, -2, -0.5, 113); figuraFundo(g, 0, -1, 1.2, 127);
  await florestaEmVolta(g, { r0: 16, r1: 30, n: 12, sem: 73 });
  const marcas = { praca: { x: 0, z: -1, cam: 'medio' }, barraca: { x: -3, z: 2, cam: 'medio' }, casa: { x: -7, z: -5, cam: 'aberto' }, multidao: { x: 0, z: 0, cam: 'aberto' }, alto: { x: 0, z: -1, cam: 'aereo' }, meio: { x: 1, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function templo_oriental(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x5a6a4a, 90);
  // pagode: base + telhados curvos vermelhos
  caixa(g, 0, 1, -8, 6, 2, 6, 0xb03a2a); for (let i = 0; i < 3; i++) { const y = 2.5 + i * 1.8, w = 7 - i * 1.4; const tel = caixa(g, 0, y, -8, w, 0.3, w, 0x8a2a1a); caixa(g, 0, y + 0.9, -8, w - 1.2, 1.4, w - 1.2, 0xc8372d); }
  for (const sx of [-2, 2]) caixa(g, sx, 1, -5, 0.3, 2, 0.3, 0xf4c542); // colunas douradas
  // torii vermelho
  for (const sx of [-2.5, 2.5]) caixa(g, sx, 1.5, 2, 0.3, 3, 0.3, 0xc8372d); caixa(g, 0, 3.1, 2, 6, 0.3, 0.4, 0xc8372d);
  await florestaEmVolta(g, { r0: 16, r1: 30, n: 14, sem: 77 });
  const marcas = { templo: { x: 0, z: -3, cam: 'medio' }, torii: { x: 0, z: 2, cam: 'aberto' }, escada: { x: 0, z: -4, cam: 'baixo' }, jardim: { x: 4, z: 0, cam: 'medio' }, alto: { x: 0, z: -3, cam: 'aereo' }, meio: { x: 0, z: -1, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function cidade_grega(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x9a8a6a, 100);
  // templo com colunas + frontão
  for (let i = 0; i < 6; i++) caixa(g, -5 + i * 2, 2.5, -8, 0.5, 5, 0.5, 0xe8e0d0); caixa(g, 0, 5.3, -8, 12, 0.6, 2.5, 0xdfd6c0); caixa(g, 0, 0.3, -8, 12, 0.6, 3, 0xdfd6c0);
  const front = new THREE.Mesh(new THREE.ConeGeometry(6.5, 2, 3), new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.9 })); front.rotation.y = Math.PI / 2; front.scale.z = 0.4; front.position.set(0, 6.5, -8); g.add(front);
  for (let i = 0; i < 4; i++) caixa(g, -6 + i * 4, 0.5, 2, 1, 1, 1, 0xcfc0a0); // pedestais
  const marcas = { templo: { x: 0, z: -3, cam: 'medio' }, colunas: { x: 0, z: -6, cam: 'baixo' }, agora: { x: 0, z: 3, cam: 'aberto' }, escada: { x: 0, z: -5, cam: 'medio' }, alto: { x: 0, z: -3, cam: 'aereo' }, meio: { x: 2, z: 0, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

async function navio(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0x14283a, 140);
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshStandardMaterial({ color: 0x14283a, roughness: 0.4 })); mar.rotation.x = -Math.PI / 2; mar.position.y = 0.02; g.add(mar);
  // convés
  caixa(g, 0, 0.6, 0, 5, 0.4, 14, 0x6a4a2a); for (const sx of [-2.5, 2.5]) caixa(g, sx, 1.2, 0, 0.3, 1.2, 14, 0x5a3a1e); // amurada
  const mastro = caixa(g, 0, 4, -2, 0.4, 8, 0.4, 0x4a3420); const vela = caixa(g, 0, 5, -2, 4, 4, 0.2, 0xe8e0d0); // vela
  const marcas = { conves: { x: 0, z: 2, cam: 'medio' }, proa: { x: 0, z: -5, cam: 'aberto' }, mastro: { x: 0, z: -2, cam: 'baixo' }, popa: { x: 0, z: 5, cam: 'medio' }, mar: { x: 3, z: 0, cam: 'aberto' }, alto: { x: 0, z: 0, cam: 'aereo' } };
  return { grupo: g, marcas, piso: p }; }

async function cabana_neve(scene, o) { const g = new THREE.Group(); scene.add(g); const p = piso(scene, 0xe6eef4, 90);
  const cab = await por(g, 'casas/1Story_GableRoof_Mat', 2, -4, ALTURAS.casa, { ry: -Math.PI / 5 });
  // neve no telhado + janela acesa
  caixa(g, 2, 2.6, -4, 4, 0.3, 4, 0xf4f8fc, -Math.PI / 5);
  const jan = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.8), new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffcf6b, emissiveIntensity: 1.8 })); jan.position.set(0.6, 1.4, -2.2); g.add(jan); luzQuente(g, 0.6, 1.4, -1.8, 0xffcf6b, 6, 6);
  await florestaEmVolta(g, { r0: 12, r1: 30, n: 22, sem: 81 });
  for (let i = 0; i < 20; i++) { const s = semente(i + 5); await por(g, 'natureza/PineTree_' + (1 + i % 5), (s() - 0.5) * 24, (s() - 0.5) * 24, 6 + s() * 2, { ry: s() * 6.28 }); }
  const marcas = { cabana: { x: 0, z: 0, cam: 'medio' }, janela: { x: 0.6, z: -1, cam: 'close' }, mata: { x: -8, z: -6, cam: 'aberto' }, frente: { x: 0, z: 3, cam: 'aberto' }, alto: { x: 0, z: -2, cam: 'aereo' }, meio: { x: -1, z: 1, cam: 'medio' } };
  return { grupo: g, marcas, piso: p }; }

const CENARIOS = { bairro, floresta, estrada, casa_interior, cemiterio, vila, campo, acampamento, torre,
  hospital, escola, metro, elevador_predio, posto_gasolina, farol, lago_congelado, mina, igreja_antiga,
  deserto, praia_noite, fazenda, castelo, mercado_medieval, templo_oriental, cidade_grega, navio, cabana_neve };

export async function montar(nome, scene, opts = {}) {
  const fn = CENARIOS[nome] || bairro;
  return await fn(scene, opts);
}

export const NOMES = Object.keys(CENARIOS);
