// kit/personagem.js — personagem LISO (estilo do Reel) montado em peças presas aos ossos do Mannequin_Medium.
//
// As malhas do manequim KayKit ficam ESCONDIDAS; só o esqueleto (ossos + mixer) é usado. O corpo é feito de
// peças lisas (esferas, cápsulas, caixas arredondadas) presas a cada osso, então a animação KayKit anima o corpo.
//
// pessoa(spec) -> ator { obj, mixer, head, _rosto, altura, raio, acao, rosto, segurar, setTime }
//   spec: { altura, semente, corpo, pele, cabelo, cabelo_cor, camisa, calca, roupa, chapeu, acessorio, rosto, rostoEstilo, acao }
//   Qualquer campo omitido é sorteado por `semente` (variedade). "semente" só => tudo sai dela.
//
// Tudo determinístico: nenhum relógio, nenhum Math.random sem semente.
import * as THREE from 'three';
import { instanciar, animacoesManequim } from './modelos.js';
import { montarHumanoide, grupoEm } from './corpo.js';

// ---------------- RNG com semente ----------------
function rng(sem) {
  let a = (sem | 0) >>> 0 || 1;
  return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
}
const escolher = (r, lista) => lista[Math.floor(r() * lista.length)];

// ---------------- bibliotecas de variedade ----------------
export const PELES = ['#f2d6be', '#e8c0a0', '#d9a77f', '#c98d5f', '#a8703f', '#8a5a34', '#6b4426', '#f6e0c8'];
export const CABELO_CORES = ['#1a120a', '#3a2a18', '#5a3a1e', '#7a5230', '#2a2a2a', '#b8b8b8', '#d9c48a', '#8a2a1a', '#e8e8e8', '#4a2e5a'];
export const CABELOS = ['curto', 'longo', 'careca', 'coque', 'cacheado', 'rabo', 'trança', 'moicano'];
export const CORPOS = ['magro', 'medio', 'forte', 'gordo', 'idoso', 'crianca'];
export const CAMISA_CORES = ['#cfd2d6', '#3f5a3a', '#6a2b22', '#2e3a6a', '#7a5a34', '#4a4a4a', '#b0c4de', '#8a6a9a', '#d8b43a', '#2a6a5a'];
export const CALCA_CORES = ['#2a3550', '#3a2f24', '#1a1a20', '#4a4030', '#30302a', '#5a3a2a'];
export const ROUPAS = ['camiseta', 'camisa', 'moletom', 'jaqueta', 'vestido', 'saia', 'enfermeira', 'policial',
  'guarda', 'medieval', 'tunica', 'chines', 'soldado'];
export const ACESSORIOS = ['', '', '', 'oculos', 'bone', 'chapeu_palha', 'gorro', 'mochila', 'avental'];
export const ROSTO_ESTILOS = ['oval', 'redondo', 'traco'];

// resolve o spec final a partir da semente (preenche o que faltar)
function resolverSpec(spec = {}) {
  const r = rng(spec.semente ?? 12345);
  const corpo = spec.corpo || escolher(r, CORPOS);
  const crianca = corpo === 'crianca';
  return {
    semente: spec.semente ?? 12345,
    corpo,
    altura: spec.altura || (crianca ? 1.2 : 1.62 + r() * 0.2),
    pele: spec.pele || escolher(r, PELES),
    cabelo: spec.cabelo || escolher(r, CABELOS),
    cabelo_cor: spec.cabelo_cor || escolher(r, CABELO_CORES),
    camisa: spec.camisa || escolher(r, CAMISA_CORES),
    calca: spec.calca || escolher(r, CALCA_CORES),
    roupa: spec.roupa || escolher(r, ROUPAS),
    chapeu: spec.chapeu || null,
    acessorio: spec.acessorio ?? escolher(r, ACESSORIOS),
    rostoEstilo: spec.rostoEstilo || escolher(r, ROSTO_ESTILOS),
    rosto: spec.rosto || 'neutro',
    sardas: spec.sardas ?? (r() < 0.25),
    rugas: spec.rugas ?? (corpo === 'idoso'),
    barba: spec.barba ?? (!crianca && r() < 0.3),
    acao: spec.acao,
    mangaCurta: spec.mangaCurta ?? (r() < 0.5),
  };
}

// ---------------- rosto 2D (CanvasTexture), 3 estilos + 8 expressões ----------------
const EXPRESSOES = ['neutro', 'sorriso', 'medo', 'susto', 'desconfiado', 'triste', 'bravo', 'olhos_fechados'];

function desenharRosto(estilo, exp, extra = {}) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'); x.clearRect(0, 0, 256, 256);
  const olhoY = 118, ex = 86, dx = 170; // olhos no MEIO da bola, bem separados
  x.lineCap = 'round'; x.lineJoin = 'round'; x.fillStyle = '#000'; x.strokeStyle = '#000';

  // --- olhos conforme o estilo ---
  const brilho = (cx, cy) => { x.save(); x.fillStyle = '#e8e8e8'; x.beginPath(); x.ellipse(cx + 5, cy - 6, 3.5, 4, 0, 0, 7); x.fill(); x.restore(); };
  function olhos(rx, ry, fechado) {
    if (fechado) {
      x.lineWidth = 12; x.beginPath();
      x.moveTo(ex - 20, olhoY); x.quadraticCurveTo(ex, olhoY + 11, ex + 20, olhoY);
      x.moveTo(dx - 20, olhoY); x.quadraticCurveTo(dx, olhoY + 11, dx + 20, olhoY); x.stroke();
      return;
    }
    if (estilo === 'traco') { // olho em traço (minimalista)
      x.lineWidth = 14; x.beginPath();
      x.moveTo(ex - 18, olhoY); x.lineTo(ex + 18, olhoY);
      x.moveTo(dx - 18, olhoY); x.lineTo(dx + 18, olhoY); x.stroke();
    } else if (estilo === 'redondo') { // olho redondo com pupila (branco quebrado p/ nao estourar no bloom)
      for (const cx of [ex, dx]) {
        x.fillStyle = '#dcdcdc'; x.beginPath(); x.arc(cx, olhoY, rx, 0, 7); x.fill();
        x.lineWidth = 4; x.strokeStyle = '#000'; x.stroke();
        x.fillStyle = '#000'; x.beginPath(); x.arc(cx + 3, olhoY, rx * 0.55, 0, 7); x.fill();
      }
    } else { // oval do Reel (grande, preto)
      x.fillStyle = '#000';
      x.beginPath(); x.ellipse(ex, olhoY, rx, ry, 0, 0, 7); x.fill();
      x.beginPath(); x.ellipse(dx, olhoY, rx, ry, 0, 0, 7); x.fill();
      brilho(ex, olhoY - ry * 0.3); brilho(dx, olhoY - ry * 0.3);
    }
  }
  const sobr = (alta, brava) => {
    x.lineWidth = 14; x.strokeStyle = '#000';
    const y = olhoY - 46 - (alta ? 14 : 0);
    x.beginPath();
    if (brava) { x.moveTo(ex - 30, y - 8); x.lineTo(ex + 30, y + 10); x.moveTo(dx - 30, y + 10); x.lineTo(dx + 30, y - 8); }
    else { x.moveTo(ex - 30, y + (alta ? 4 : 10)); x.lineTo(ex + 30, y); x.moveTo(dx - 30, y); x.lineTo(dx + 30, y + (alta ? 4 : 10)); }
    x.stroke();
  };
  const boca = (fn, w = 12) => { x.lineWidth = w; x.strokeStyle = '#000'; x.beginPath(); fn(); x.stroke(); };
  const bocaO = (ry) => { x.fillStyle = '#000'; x.beginPath(); x.ellipse(128, 198, 16, ry, 0, 0, 7); x.fill(); };

  // rugas/sardas opcionais
  if (extra.rugas) { x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 3; for (const yy of [olhoY + 28, olhoY + 40]) { x.beginPath(); x.moveTo(60, yy); x.quadraticCurveTo(128, yy + 8, 196, yy); x.stroke(); } }
  if (extra.sardas) { x.fillStyle = 'rgba(120,70,40,0.45)'; for (const [sx, sy] of [[96, 150], [110, 158], [146, 158], [160, 150]]) { x.beginPath(); x.arc(sx, sy, 3.2, 0, 7); x.fill(); } }

  const rx = estilo === 'redondo' ? 20 : 22, ry = 26;
  switch (exp) {
    case 'sorriso': olhos(rx, ry * 0.85); sobr(false, false); boca(() => x.arc(128, 182, 38, 0.12 * Math.PI, 0.88 * Math.PI)); break;
    case 'medo': olhos(rx + 2, ry + 4); sobr(true, false); bocaO(24); break;
    case 'susto': olhos(rx + 5, ry + 8); sobr(true, false); bocaO(32); break;
    case 'desconfiado': olhos(rx - 4, ry * 0.6); sobr(false, false); boca(() => { x.moveTo(104, 192); x.lineTo(152, 186); }); break;
    case 'triste': olhos(rx, ry); sobr(true, false); boca(() => x.arc(128, 210, 32, 1.15 * Math.PI, 1.85 * Math.PI)); break;
    case 'bravo': olhos(rx - 2, ry * 0.8); sobr(false, true); boca(() => { x.moveTo(98, 200); x.lineTo(158, 200); }); break;
    case 'olhos_fechados': olhos(rx, ry, true); sobr(false, false); boca(() => { x.moveTo(108, 190); x.lineTo(148, 190); }); break;
    default: olhos(rx, ry); sobr(false, false); boca(() => { x.moveTo(104, 192); x.lineTo(152, 192); });
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

const _rostoCache = {};
function texturaRosto(estilo, exp, extra) {
  const chave = `${estilo}|${exp}|${extra.rugas ? 1 : 0}${extra.sardas ? 1 : 0}`;
  if (!_rostoCache[chave]) _rostoCache[chave] = desenharRosto(estilo, EXPRESSOES.includes(exp) ? exp : 'neutro', extra);
  return _rostoCache[chave];
}

// ---------------- helpers de osso ----------------
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

// cápsula presa a um osso, orientada na DIREÇÃO REAL do osso filho (robusto a qualquer eixo do rig),
// cobrindo do início do osso até o filho. A cápsula padrão tem eixo Y; alinhamos Y com a direção ao filho.
const _eixoY = new THREE.Vector3(0, 1, 0);
function capsulaOsso(osso, filho, mat, { r = 0.07, folga = 0.0 } = {}) {
  if (!osso) return null;
  const dir = filho ? filho.position.clone() : new THREE.Vector3(0, -0.3, 0);
  let L = dir.length() || 0.3; L += folga;
  dir.normalize();
  const g = new THREE.CapsuleGeometry(r, Math.max(0.02, L - r * 2), 6, 12);
  const m = new THREE.Mesh(g, mat);
  m.quaternion.setFromUnitVectors(_eixoY, dir); // deita a cápsula na direção do filho
  m.position.copy(dir).multiplyScalar(L / 2);    // centro da cápsula no meio do osso
  m.castShadow = true;
  osso.add(m);
  return m;
}

// ---------------- cabelo e chapéu (primitivas) ----------------
function fazerCabelo(tipo, cor, raioCabeca = 0.16) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: cor || 0x3a2a1a, roughness: 0.9 });
  const R = raioCabeca;
  if (tipo === 'careca') return g;
  if (tipo === 'curto' || tipo === 'moicano') {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 20, 14, 0, 6.3, 0, Math.PI * 0.55), mat);
    calota.position.y = R * 0.1; g.add(calota);
    if (tipo === 'moicano') { const crista = new THREE.Mesh(new THREE.BoxGeometry(R * 0.3, R * 0.5, R * 1.6), mat); crista.position.y = R * 0.6; g.add(crista); }
  } else if (tipo === 'longo' || tipo === 'trança' || tipo === 'rabo') {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(R * 1.05, 20, 16, 0, 6.3, 0, Math.PI * 0.8), mat);
    g.add(calota);
    const costas = new THREE.Mesh(new THREE.CapsuleGeometry(R * 0.5, R * (tipo === 'longo' ? 1.6 : 1.1), 6, 10), mat);
    costas.position.set(0, -R * 1.0, -R * 0.7); g.add(costas);
  } else if (tipo === 'coque') {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 20, 14, 0, 6.3, 0, Math.PI * 0.6), mat); g.add(calota);
    const coque = new THREE.Mesh(new THREE.SphereGeometry(R * 0.55, 14, 12), mat); coque.position.set(0, R * 1.0, -R * 0.4); g.add(coque);
  } else if (tipo === 'cacheado') {
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; const b = new THREE.Mesh(new THREE.SphereGeometry(R * 0.5, 10, 8), mat); b.position.set(Math.cos(a) * R * 0.8, R * 0.5 + (i % 3) * R * 0.1, Math.sin(a) * R * 0.8); g.add(b); }
  }
  return g;
}

function fazerChapeu(tipo, raioCabeca = 0.16) {
  const g = new THREE.Group(); const R = raioCabeca;
  const marrom = new THREE.MeshStandardMaterial({ color: 0x5a4330, roughness: 0.9 });
  if (tipo === 'chapeu' || tipo === 'chapeu_aba' || tipo === 'chapeu_palha') {
    const cor = tipo === 'chapeu_palha' ? 0xd8b25a : 0x5a4330;
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.95 });
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(R * 2.0, R * 2.0, R * 0.18, 24), m); aba.position.y = R * 0.7; g.add(aba);
    const copa = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.1, R * 1.25, R * 1.2, 20), m); copa.position.y = R * 1.4; g.add(copa);
  } else if (tipo === 'bone') {
    const copa = new THREE.Mesh(new THREE.SphereGeometry(R * 1.1, 18, 12, 0, 6.3, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x2e4a6a, roughness: 0.9 })); copa.position.y = R * 0.5; g.add(copa);
    const aba = new THREE.Mesh(new THREE.BoxGeometry(R * 1.6, R * 0.1, R * 1.1), copa.material); aba.position.set(0, R * 0.45, R * 1.1); g.add(aba);
  } else if (tipo === 'gorro') {
    const gorro = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 20, 14, 0, 6.3, 0, Math.PI * 0.62), new THREE.MeshStandardMaterial({ color: 0x7a2b22, roughness: 1 })); gorro.position.y = R * 0.2; g.add(gorro);
  } else if (tipo === 'capuz') {
    const capuz = new THREE.Mesh(new THREE.SphereGeometry(R * 1.5, 18, 14, 0, 6.3, 0, Math.PI * 0.72), new THREE.MeshStandardMaterial({ color: 0x2c2620, roughness: 1 })); capuz.position.set(0, 0, -R * 0.2); g.add(capuz);
  }
  return g;
}

// óculos/mochila/avental presos onde fizer sentido
function porAcessorio(tipo, head, chest, raioCabeca = 0.16) {
  // head = grupo no centro da cabeca; chest = grupo no osso chest (metros, +Z frente)
  const R = raioCabeca;
  if (tipo === 'oculos' && head) {
    const m = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
    for (const dx of [-R * 0.5, R * 0.5]) { const o = new THREE.Mesh(new THREE.TorusGeometry(R * 0.33, R * 0.06, 8, 16), m); o.position.set(dx, 0.0, R * 1.02); head.add(o); }
  } else if (tipo === 'mochila' && chest) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.16), new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.9 }));
    m.position.set(0, 0.05, -0.2); chest.add(m);
  } else if (tipo === 'avental' && chest) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.06), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 1 }));
    m.position.set(0, -0.12, 0.13); chest.add(m);
  } else if ((tipo === 'bone' || tipo === 'chapeu_palha' || tipo === 'gorro') && head) {
    head.add(fazerChapeu(tipo, R));
  }
}

// ---------------- objeto na mão (hand.r) ----------------
function fazerObjeto(nome) {
  const g = new THREE.Group(); let luz = null;
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.5, metalness: 0.2 });
  if (nome === 'lanterna') {
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 12), metal); corpo.rotation.x = Math.PI / 2; g.add(corpo);
    const lente = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0xfff3c0, emissive: 0xffe8a0, emissiveIntensity: 2.4 })); lente.rotation.x = Math.PI / 2; lente.position.z = 0.1; g.add(lente);
    luz = new THREE.SpotLight(0xffe2b0, 55, 24, 0.6, 0.5, 1.4); luz.position.set(0, 0, 0.12); luz.target.position.set(0, -0.4, 3); g.add(luz, luz.target); luz.castShadow = true; luz.shadow.mapSize.set(1024, 1024);
  } else if (nome === 'tocha') {
    const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.4, 10), new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 1 })); g.add(cabo);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff7a1a, emissiveIntensity: 3 })); chama.position.y = 0.24; chama.scale.y = 1.6; g.add(chama);
    luz = new THREE.PointLight(0xff8a3a, 14, 10, 1.6); luz.position.y = 0.26; g.add(luz);
  } else if (nome === 'radio') {
    const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.05), new THREE.MeshStandardMaterial({ color: 0x2e3a2a, roughness: 0.8 })); g.add(caixa);
    const antena = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 6), metal); antena.position.set(0.03, 0.16, 0); g.add(antena);
  } else if (nome === 'celular') {
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.012), new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.4 })); g.add(corpo);
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.058, 0.12), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, emissive: 0x7fc8ff, emissiveIntensity: 2.2 })); tela.position.z = 0.0075; g.add(tela);
    luz = new THREE.PointLight(0x9fd8ff, 3, 3, 2); luz.position.z = 0.1; g.add(luz);
  }
  return { obj: g, luz };
}

// ---------------- corpo liso e INTEIRIÇO (kit/corpo.js) ----------------
function montarCorpo(obj, spec) {
  const f = { magro: 0.84, medio: 1.0, forte: 1.18, gordo: 1.42, idoso: 0.95, crianca: 0.92 }[spec.corpo] || 1;
  const pele = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.pele), roughness: 0.75 });
  const camisa = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.camisa), roughness: 0.75 });
  const calca = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.calca), roughness: 0.75 });
  const sapato = new THREE.MeshStandardMaterial({ color: ['medieval', 'tunica', 'chines', 'soldado'].includes(spec.roupa) ? 0x4a3524 : 0xf2f2f2, roughness: 0.75 });
  if (spec.roupa === 'enfermeira') camisa.color.set('#eef2f6');
  if (spec.roupa === 'policial') camisa.color.set('#1e2a44');
  if (spec.roupa === 'guarda') camisa.color.set('#4a5e3a');
  if (spec.roupa === 'soldado') camisa.color.set('#6a6350');
  const mangaCurta = spec.mangaCurta && !['jaqueta', 'moletom', 'medieval', 'tunica', 'soldado', 'chines', 'enfermeira', 'policial', 'guarda'].includes(spec.roupa);
  const escalaH = spec.altura / 1.7;
  const R = 0.15 * (spec.corpo === 'crianca' ? 1.05 : 1) * Math.max(0.85, Math.min(1.1, escalaH));

  const c = montarHumanoide(obj, {
    mat: { pele, camisa, calca, sapato, manga: mangaCurta ? 'curta' : 'longa' },
    largura: 0.34 * f * escalaH, profundidade: 0.34 * f * escalaH * (spec.corpo === 'gordo' ? 0.8 : 0.6),
    braco: 0.05 * Math.sqrt(f) * escalaH, perna: 0.064 * Math.sqrt(f) * escalaH, cabeca: R,
  });
  const { head, chest, hips } = c;

  // rosto, cabelo, chapéu, barba e acessórios num grupo na cabeça (metros, +Z = frente)
  let rostoMesh = null, cab = null;
  if (head && c.centroCabeca) {
    cab = grupoEm(head, c.centroCabeca);
    rostoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(R * 1.95, R * 1.95),
      new THREE.MeshBasicMaterial({ map: texturaRosto(spec.rostoEstilo, spec.rosto, spec), transparent: true, depthWrite: false, depthTest: false, side: THREE.FrontSide })
    );
    rostoMesh.position.set(0, 0, R * 0.93); rostoMesh.renderOrder = 10; cab.add(rostoMesh);
    cab.add(fazerCabelo(spec.cabelo, spec.cabelo_cor, R));
    if (spec.chapeu) cab.add(fazerChapeu(spec.chapeu, R));
    if (spec.barba) {
      const barba = new THREE.Mesh(new THREE.SphereGeometry(R * 0.82, 16, 10, 0, 6.3, Math.PI * 0.55, Math.PI * 0.45), new THREE.MeshStandardMaterial({ color: spec.cabelo_cor, roughness: 1 }));
      barba.position.set(0, -R * 0.22, R * 0.18); cab.add(barba);
    }
  }
  if (spec.acessorio) porAcessorio(spec.acessorio, cab, chest && grupoEm(chest, c.pontos.chest), R);

  // roupas por cima: vestido/túnica/saia (do quadril para baixo), capuz do moletom
  if (hips && c.pontos.hips) {
    const yq = c.pontos.hips.y, larg = 0.34 * f * escalaH;
    let corV = null, alt = 0;
    if (['vestido', 'tunica', 'medieval', 'chines', 'enfermeira'].includes(spec.roupa)) { corV = spec.roupa === 'medieval' ? 0x5a4a6a : spec.roupa === 'chines' ? 0xb03a2a : camisa.color; alt = spec.roupa === 'vestido' ? yq * 0.82 : yq * 0.62; }
    else if (spec.roupa === 'saia') { corV = calca.color; alt = yq * 0.42; }
    if (corV) {
      const saia = new THREE.Mesh(new THREE.CylinderGeometry(larg * 0.52, larg * 0.82, alt, 18, 1, true), new THREE.MeshStandardMaterial({ color: corV, roughness: 0.75, side: THREE.DoubleSide }));
      saia.position.set(c.pontos.hips.x, yq - alt / 2 + 0.05, c.pontos.hips.z); saia.castShadow = true; hips.attach(saia);
    }
  }
  if (spec.roupa === 'moletom' && chest && c.pontos.chest) {
    const capuz = new THREE.Mesh(new THREE.SphereGeometry(R * 0.95, 14, 10, 0, 6.3, 0, Math.PI * 0.6), camisa);
    capuz.position.copy(c.centroCabeca || c.pontos.chest).add(new THREE.Vector3(0, -R * 0.7, -R * 0.75)); chest.attach(capuz);
  }
  const maoR = c.maos.r;
  return { head, chest, maoDir: maoR && maoR.osso, maoCentro: maoR && maoR.centro, rostoMesh, raioCabeca: R };
}

// ---------------- pessoa ----------------
export async function pessoa(specBruto = {}) {
  const spec = resolverSpec(specBruto);
  const { obj } = await instanciar('personagens/Mannequin_Medium', { altura: spec.altura });
  const { head, chest, maoDir, maoCentro, rostoMesh, raioCabeca } = montarCorpo(obj, spec);

  const mixer = new THREE.AnimationMixer(obj);
  let acaoAtual = null;
  const dic = await animacoesManequim();
  let expAtual = spec.rosto;

  const ator = {
    obj, mixer, spec, head, raioCabeca,
    altura: spec.altura, raio: spec.altura * 0.2,
    _head: head, _mao: maoDir, _rosto: rostoMesh,
    acao(nome, { loop = true } = {}) {
      const clip = dic[nome] || dic['Idle_A']; if (!clip) return ator;
      const nova = mixer.clipAction(clip); nova.reset();
      nova.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); nova.clampWhenFinished = !loop;
      if (acaoAtual && acaoAtual !== nova) acaoAtual.stop();
      nova.play(); acaoAtual = nova; return ator;
    },
    rosto(exp) { expAtual = exp; if (rostoMesh) rostoMesh.material.map = texturaRosto(spec.rostoEstilo, exp, spec); return ator; },
    segurar(nome) { if (!maoDir || !nome) return ator; const { obj: o } = fazerObjeto(nome); o.position.copy(maoCentro || maoDir.getWorldPosition(new THREE.Vector3())); maoDir.attach(o); return ator; },
    setTime(t) { mixer.setTime(Math.max(0, t)); return ator; },
  };
  ator.acao(spec.acao || 'Idle_A');
  return ator;
}

export { EXPRESSOES, resolverSpec };
