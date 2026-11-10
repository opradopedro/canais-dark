// kit/personagem.js — pessoas e o que elas seguram, a partir do Mannequin_Medium.glb + animacoes KayKit.
//
// pessoa({id, altura, pele, camisa, calca, cabelo, chapeu}) devolve um ator com:
//   .obj        Object3D para por na cena (pes no y=0)
//   .mixer      AnimationMixer (determinista: use ator.pose(nome, t) ou mixer.setTime)
//   .acao(nome) toca uma animacao do catalogo (Idle_A, Walking_A, Crawling, Waving...)
//   .rosto(exp) troca a expressao 2D (neutro, sorriso, medo, susto, desconfiado, triste, bravo, olhos_fechados)
//   .segurar(objeto)  poe lanterna/tocha/radio/celular na mao direita (hand.r)
//   .setTime(t) avanca a animacao para o segundo t (DETERMINISTICO)
//
// Tudo deterministico: nenhum requestAnimationFrame, nenhum Date.now, nenhum Math.random sem semente.
import * as THREE from 'three';
import { instanciar, animacoesManequim } from './modelos.js';

// acha um osso tolerando as variacoes de nome do rig (head, hand.r, hand_r, handr, mixamorig:Head...)
function acharOsso(raiz, ...nomes) {
  let achado = null;
  const alvo = nomes.map(n => n.toLowerCase().replace(/[._:]/g, ''));
  raiz.traverse(b => {
    if (achado || !b.isBone) return;
    const n = b.name.toLowerCase().replace(/[._:]/g, '').replace('mixamorig', '');
    if (alvo.includes(n)) achado = b;
  });
  return achado;
}

// ---------------- rosto 2D (CanvasTexture) ----------------
// desenha olhos/sobrancelha/boca num canvas e devolve a textura. Estilo do reel: olhos ovais pretos grandes,
// sobrancelhas grossas, boca que muda com a emocao. Fundo transparente (so o rosto).
const EXPRESSOES = ['neutro', 'sorriso', 'medo', 'susto', 'desconfiado', 'triste', 'bravo', 'olhos_fechados'];

function desenharRosto(exp) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  x.clearRect(0, 0, 256, 256);
  // olhos grandes e BEM pretos, como no Reel. Centros mais juntos, olhos maiores, boca marcada.
  const olhoY = 122, ex = 84, dx = 172;
  x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineCap = 'round'; x.lineJoin = 'round';

  const olho = (cx, rx, ry) => { x.beginPath(); x.ellipse(cx, olhoY, rx, ry, 0, 0, 7); x.fill(); };
  const brilho = (cx) => { x.save(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx + 6, olhoY - 8, 5, 6, 0, 0, 7); x.fill(); x.restore(); };
  const sobr = (cx, dir, alta) => {
    x.lineWidth = 14; x.beginPath();
    const y = olhoY - 48 - (alta ? 14 : 0);
    x.moveTo(cx - 30 * dir, y + (alta ? 6 : 12)); x.lineTo(cx + 30 * dir, y);
    x.stroke();
  };
  const boca = (fn, w = 12) => { x.lineWidth = w; x.beginPath(); fn(); x.stroke(); };

  switch (exp) {
    case 'sorriso':
      olho(ex, 19, 22); olho(dx, 19, 22); brilho(ex); brilho(dx);
      sobr(ex, 1, false); sobr(dx, -1, false);
      boca(() => x.arc(128, 184, 40, 0.12 * Math.PI, 0.88 * Math.PI));
      break;
    case 'medo':
      olho(ex, 21, 30); olho(dx, 21, 30); brilho(ex); brilho(dx);
      sobr(ex, 1, true); sobr(dx, -1, true);
      x.beginPath(); x.ellipse(128, 202, 18, 26, 0, 0, 7); x.fill();
      break;
    case 'susto':
      olho(ex, 24, 33); olho(dx, 24, 33); brilho(ex); brilho(dx);
      x.lineWidth = 15; x.beginPath(); x.moveTo(ex - 32, olhoY - 64); x.lineTo(ex + 28, olhoY - 70);
      x.moveTo(dx - 28, olhoY - 70); x.lineTo(dx + 32, olhoY - 64); x.stroke();
      x.beginPath(); x.ellipse(128, 206, 28, 36, 0, 0, 7); x.fill();
      break;
    case 'desconfiado':
      olho(ex, 18, 15); olho(dx, 18, 20); brilho(dx);
      x.lineWidth = 14; x.beginPath(); x.moveTo(ex - 30, olhoY - 44); x.lineTo(ex + 30, olhoY - 32);
      x.moveTo(dx - 30, olhoY - 50); x.lineTo(dx + 30, olhoY - 50); x.stroke();
      boca(() => { x.moveTo(100, 192); x.lineTo(152, 186); });
      break;
    case 'triste':
      olho(ex, 18, 22); olho(dx, 18, 22); brilho(ex); brilho(dx);
      x.lineWidth = 14; x.beginPath(); x.moveTo(ex - 28, olhoY - 38); x.lineTo(ex + 30, olhoY - 52);
      x.moveTo(dx - 30, olhoY - 52); x.lineTo(dx + 28, olhoY - 38); x.stroke();
      boca(() => x.arc(128, 210, 34, 1.15 * Math.PI, 1.85 * Math.PI));
      break;
    case 'bravo':
      olho(ex, 18, 17); olho(dx, 18, 17);
      x.lineWidth = 15; x.beginPath(); x.moveTo(ex - 30, olhoY - 52); x.lineTo(ex + 30, olhoY - 32);
      x.moveTo(dx - 30, olhoY - 32); x.lineTo(dx + 30, olhoY - 52); x.stroke();
      boca(() => { x.moveTo(96, 200); x.lineTo(160, 200); });
      break;
    case 'olhos_fechados':
      x.lineWidth = 13; x.beginPath();
      x.moveTo(ex - 20, olhoY); x.quadraticCurveTo(ex, olhoY + 12, ex + 20, olhoY);
      x.moveTo(dx - 20, olhoY); x.quadraticCurveTo(dx, olhoY + 12, dx + 20, olhoY); x.stroke();
      sobr(ex, 1, false); sobr(dx, -1, false);
      boca(() => { x.moveTo(108, 190); x.lineTo(148, 190); });
      break;
    default: // neutro
      olho(ex, 18, 22); olho(dx, 18, 22); brilho(ex); brilho(dx);
      sobr(ex, 1, false); sobr(dx, -1, false);
      boca(() => { x.moveTo(104, 192); x.lineTo(152, 192); });
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// cache das texturas de rosto (uma por expressao): deterministico e barato
const _rostos = {};
function texturaRosto(exp) {
  if (!_rostos[exp]) _rostos[exp] = desenharRosto(EXPRESSOES.includes(exp) ? exp : 'neutro');
  return _rostos[exp];
}

// ---------------- cabelo e chapeu em primitivas ----------------
function fazerCabelo(tipo, cor) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: cor || 0x3a2a1a, roughness: 0.9 });
  if (tipo === 'careca') return g;
  if (tipo === 'curto') {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), mat);
    calota.position.y = 0.02; g.add(calota);
  } else if (tipo === 'longo') {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.75), mat);
    g.add(calota);
    const costas = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.14), mat);
    costas.position.set(0, -0.16, -0.12); g.add(costas);
  } else if (tipo === 'coque') {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), mat);
    g.add(calota);
    const coque = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat);
    coque.position.set(0, 0.18, -0.08); g.add(coque);
  }
  return g;
}

function fazerChapeu(tipo) {
  const g = new THREE.Group();
  const marrom = new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 0.9 });
  if (tipo === 'chapeu' || tipo === 'chapeu_aba') {
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 24), marrom);
    aba.position.y = 0.12; g.add(aba);
    const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.2, 20), marrom);
    copa.position.y = 0.22; g.add(copa);
  } else if (tipo === 'gorro') {
    const gorro = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.6),
      new THREE.MeshStandardMaterial({ color: 0x7a2b22, roughness: 1 }));
    gorro.position.y = 0.04; g.add(gorro);
  } else if (tipo === 'capuz') {
    const capuz = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.7),
      new THREE.MeshStandardMaterial({ color: 0x2c2620, roughness: 1 }));
    capuz.position.set(0, 0, -0.03); g.add(capuz);
  }
  return g;
}

// ---------------- objeto na mao (hand.r) ----------------
// devolve { obj, luz } ; a luz (SpotLight da lanterna) e adicionada pelo chamador a cena se existir.
function fazerObjeto(nome) {
  const g = new THREE.Group();
  let luz = null;
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.5, metalness: 0.2 });
  if (nome === 'lanterna') {
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 12), metal);
    corpo.rotation.z = Math.PI / 2; g.add(corpo);
    const lente = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0xfff3c0, emissive: 0xffe08a, emissiveIntensity: 2 }));
    lente.rotation.z = Math.PI / 2; lente.position.x = 0.1; g.add(lente);
    luz = new THREE.SpotLight(0xffd79a, 40, 22, 0.55, 0.5, 1.4);
    luz.position.set(0.12, 0, 0);
    luz.target.position.set(3, -0.2, 0);
    g.add(luz, luz.target);
    luz.castShadow = true; luz.shadow.mapSize.set(1024, 1024);
  } else if (nome === 'tocha') {
    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 10),
      new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 1 }));
    g.add(cabo);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff7a1a, emissiveIntensity: 3 }));
    chama.position.y = 0.24; chama.scale.y = 1.6; g.add(chama);
    luz = new THREE.PointLight(0xff8a3a, 12, 10, 1.6); luz.position.y = 0.26; g.add(luz);
  } else if (nome === 'radio') {
    const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2e3a2a, roughness: 0.8 }));
    g.add(caixa);
    const antena = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 6), metal);
    antena.position.set(0.03, 0.16, 0); g.add(antena);
  } else if (nome === 'celular') {
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.4 }));
    g.add(corpo);
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.058, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xbfe6ff, emissive: 0x7fc8ff, emissiveIntensity: 2.2 }));
    tela.position.z = 0.0075; g.add(tela);
    luz = new THREE.PointLight(0x9fd8ff, 3, 3, 2); luz.position.z = 0.1; g.add(luz);
  }
  return { obj: g, luz };
}

// ---------------- pessoa ----------------
export async function pessoa(spec = {}) {
  const altura = spec.altura || 1.7;
  const { obj, animacoes } = await instanciar('personagens/Mannequin_Medium', { altura });

  const pele = new THREE.Color(spec.pele || '#e8d8c8');
  const camisa = new THREE.Color(spec.camisa || '#cfd2d6');
  const calca = new THREE.Color(spec.calca || '#3a3f4a');
  // pinta o manequim: corpo pela parte (nome do mesh), cabeca/maos cor de pele
  obj.traverse(m => {
    if (!m.isMesh) return;
    const n = (m.name || '').toLowerCase();
    let cor = camisa;
    if (n.includes('head') || n.includes('hand') || n.includes('face')) cor = pele;
    else if (n.includes('leg') || n.includes('foot') || n.includes('pant') || n.includes('shoe')) cor = calca;
    m.material = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75 });
  });

  const head = acharOsso(obj, 'head');
  const maoDir = acharOsso(obj, 'handr', 'hand_r', 'righthand');

  // cabeca do manequim ~80% (a cabeca KayKit e grande demais; o Reel tem cabeca grande mas nao tanto)
  if (head) head.scale.multiplyScalar(0.8);

  // rosto 2D preso na frente da cabeca. Fica de frente (+Z local do osso head no rig KayKit).
  let rostoMesh = null, expAtual = spec.rosto || 'neutro';
  if (head) {
    rostoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.42),
      // depthTest desligado + renderOrder alto: o rosto desenha SEMPRE por cima da esfera da cabeca (nao some dentro)
      new THREE.MeshBasicMaterial({ map: texturaRosto(expAtual), transparent: true, depthWrite: false, depthTest: false, side: THREE.FrontSide })
    );
    rostoMesh.position.set(0, 0.2, 0.28); // frente da cabeca, na altura dos olhos, FORA da esfera
    rostoMesh.renderOrder = 10;
    head.add(rostoMesh);
    // cabelo e chapeu presos no osso head
    const cab = fazerCabelo(spec.cabelo || 'curto', spec.cabelo_cor);
    head.add(cab);
    if (spec.chapeu) head.add(fazerChapeu(spec.chapeu));
  }

  const mixer = new THREE.AnimationMixer(obj);
  let acaoAtual = null;
  const dic = await animacoesManequim();

  const ator = {
    obj, mixer, spec,
    head, altura, raio: altura * 0.2,   // metadados p/ a camera (enquadramento) e o raycast
    _head: head, _mao: maoDir, _rosto: rostoMesh,
    acao(nome, { loop = true } = {}) {
      const clip = dic[nome] || dic['Idle_A'];
      if (!clip) return ator;
      const nova = mixer.clipAction(clip);
      nova.reset();
      nova.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      nova.clampWhenFinished = !loop;
      if (acaoAtual && acaoAtual !== nova) { acaoAtual.stop(); }
      nova.play();
      acaoAtual = nova;
      return ator;
    },
    rosto(exp) {
      expAtual = exp;
      if (rostoMesh) rostoMesh.material.map = texturaRosto(exp);
      return ator;
    },
    segurar(nome) {
      if (!maoDir || !nome) return ator;
      const { obj: o, luz } = fazerObjeto(nome);
      maoDir.add(o);
      return ator;
    },
    // DETERMINISTICO: poe a animacao no segundo t (sincronizado com render(t) do engine)
    setTime(t) { mixer.setTime(Math.max(0, t)); return ator; },
  };
  if (spec.acao) ator.acao(spec.acao);
  else ator.acao('Idle_A');
  return ator;
}

export { EXPRESSOES };
