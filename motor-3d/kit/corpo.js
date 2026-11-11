// kit/corpo.js — corpo INTEIRIÇO montado em peças presas aos ossos do Mannequin_Medium (rodada 4).
//
// Regra: cada segmento vai do osso ATÉ o osso filho, medido em coordenadas do MUNDO na pose de repouso, e é
// preso ao osso pai com Object3D.attach (mantém a posição de mundo). Em cada junta (ombro, cotovelo, pulso,
// quadril, joelho, tornozelo) há uma esfera do mesmo raio da cápsula, então nenhuma animação abre vão.
// Tronco grosso (profundidade ~60% da largura), pescoço curto, mãos no pulso, pés no tornozelo.
//
// Ossos do rig (o GLTFLoader tira o ponto): hips, spine, chest, head, upperarml/r, lowerarml/r, wristl/r,
// handl/r, upperlegl/r, lowerlegl/r, footl/r, toesl/r.
import * as THREE from 'three';
import { animacoesManequim } from './modelos.js';

const _Y = new THREE.Vector3(0, 1, 0);

export function acharOsso(raiz, ...nomes) {
  let achado = null;
  const alvo = nomes.map(n => n.toLowerCase().replace(/[._:]/g, ''));
  raiz.traverse(b => {
    if (achado || !b.isBone) return;
    const n = b.name.toLowerCase().replace(/[._:]/g, '').replace('mixamorig', '');
    if (alvo.includes(n)) achado = b;
  });
  return achado;
}

const wpos = b => b.getWorldPosition(new THREE.Vector3());

// cápsula entre dois pontos do MUNDO (raio em metros), presa ao osso `pai`.
export function capsulaEntre(pai, a, b, r, mat, { escalaX = 1, escalaZ = 1 } = {}) {
  if (!pai) return null;
  const d = b.clone().sub(a); const L = d.length();
  if (L < 1e-4) return null;
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 6, 12), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(_Y, d.normalize());
  m.scale.set(escalaX, 1, escalaZ);
  m.castShadow = true;
  pai.attach(m);
  return m;
}

// esfera de junta, centrada num ponto do mundo, presa ao osso
export function esferaEm(osso, centro, r, mat) {
  if (!osso) return null;
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat);
  s.position.copy(centro); s.castShadow = true;
  osso.attach(s);
  return s;
}

// grupo posicionado num ponto do mundo (eixos do mundo na pose de repouso) e preso ao osso;
// o que for adicionado a ele usa metros e +Z = frente do personagem.
export function grupoEm(osso, centro) {
  const g = new THREE.Group(); g.position.copy(centro);
  osso.attach(g);
  return g;
}

/**
 * Monta um humanoide liso e inteiriço.
 * P = {
 *   mat: { pele, camisa, calca, sapato, manga ('curta'|'longa') },
 *   largura, profundidade (tronco, m), braco, perna (raios, m), cabeca (raio, m),
 *   antebraco (fator de comprimento do antebraço; >1 = braços longos), semPernas, cauda (altura da cauda p/ fantasma)
 * }
 * devolve { head, chest, hips, spine, maos:{l,r}, centroCabeca (mundo), R, ossos, pecas:[] }
 */
export function montarHumanoide(obj, P) {
  obj.updateMatrixWorld(true);
  obj.traverse(m => { if (m.isMesh || m.isSkinnedMesh) m.visible = false; });

  const nomes = ['hips', 'spine', 'chest', 'head', 'upperarml', 'lowerarml', 'wristl', 'handl', 'upperarmr', 'lowerarmr',
    'wristr', 'handr', 'upperlegl', 'lowerlegl', 'footl', 'toesl', 'upperlegr', 'lowerlegr', 'footr', 'toesr'];
  const o = {}, p = {};
  for (const n of nomes) { o[n] = acharOsso(obj, n); if (o[n]) p[n] = wpos(o[n]); }
  const M = P.mat;
  const camisaBraco = M.manga === 'curta' ? M.pele : M.camisa;
  const rB = P.braco || 0.055, rP = P.perna || 0.07, R = P.cabeca || 0.15;
  const larg = P.largura || 0.34, prof = P.profundidade || larg * 0.6;
  const pecas = [];
  const add = m => { if (m) pecas.push(m); return m; };

  // ---------- tronco grosso ----------
  const yOmbro = p.upperarml && p.upperarmr ? (p.upperarml.y + p.upperarmr.y) / 2 : p.chest.y + 0.15;
  const topo = new THREE.Vector3(p.chest.x, yOmbro - rB * 0.3, p.chest.z);
  const rT = prof / 2, ex = larg / prof;
  // a cápsula passa rT de cada ponta: começa um pouco acima do quadril para não engolir as coxas
  const iniTronco = p.hips.clone().add(new THREE.Vector3(0, rT * 0.75, 0));
  if (o.hips && o.spine) add(capsulaEntre(o.hips, iniTronco, p.spine, rT, M.camisa, { escalaX: ex }));
  if (o.spine && o.chest) add(capsulaEntre(o.spine, p.spine, p.chest, rT, M.camisa, { escalaX: ex }));
  if (o.chest) add(capsulaEntre(o.chest, p.chest, topo, rT * 1.02, M.camisa, { escalaX: ex * 1.04 }));
  // ombros: barra entre os dois ombros (fecha o vão entre tronco e braço)
  if (o.chest && p.upperarml && p.upperarmr) add(capsulaEntre(o.chest, p.upperarml, p.upperarmr, rB * 1.15, M.camisa));
  // quadril: barra entre as duas coxas, na cor da calça
  if (o.hips && p.upperlegl && p.upperlegr) add(capsulaEntre(o.hips, p.upperlegl, p.upperlegr, rP * 1.12, M.calca));
  // cintura (liga o tronco ao quadril)
  if (o.hips) { const c = add(esferaEm(o.hips, p.hips.clone().add(new THREE.Vector3(0, rT * 0.2, 0)), rT * 0.95, M.calca)); if (c) c.scale.set(ex * 0.95, 0.6, 1); }

  // ---------- pescoço e cabeça ----------
  let centroCabeca = null;
  if (o.head) {
    const baseCab = p.head;
    if (o.chest) add(capsulaEntre(o.chest, topo, baseCab.clone().add(new THREE.Vector3(0, 0.02, 0)), Math.max(0.045, R * 0.33), M.pele));
    centroCabeca = baseCab.clone().add(new THREE.Vector3(0, R * 0.92, 0));
    const bola = add(esferaEm(o.head, centroCabeca, R, P.matCabeca || M.pele));
    if (bola) bola.scale.y = 0.95;
  }

  // ---------- braços ----------
  const maos = {};
  for (const s of ['l', 'r']) {
    const ua = o['upperarm' + s], la = o['lowerarm' + s], wr = o['wrist' + s], hd = o['hand' + s];
    if (!ua || !la) continue;
    add(esferaEm(ua, p['upperarm' + s], rB * 1.1, M.camisa));
    add(capsulaEntre(ua, p['upperarm' + s], p['lowerarm' + s], rB, camisaBraco));
    if (M.manga === 'curta') { // manga: só o primeiro terço do braço
      const fim = p['upperarm' + s].clone().lerp(p['lowerarm' + s], 0.38);
      add(capsulaEntre(ua, p['upperarm' + s], fim, rB * 1.2, M.camisa));
    }
    add(esferaEm(la, p['lowerarm' + s], rB, camisaBraco)); // cotovelo
    const ext = P.antebraco || 1;
    const alvoPulso = p['wrist' + s] || p['hand' + s];
    const fimAnte = p['lowerarm' + s].clone().add(alvoPulso.clone().sub(p['lowerarm' + s]).multiplyScalar(ext));
    const matAnte = M.manga === 'longa' ? M.camisa : M.pele;
    add(capsulaEntre(la, p['lowerarm' + s], fimAnte, rB * 0.92, matAnte));
    // mão: encostada no fim do antebraço
    const dir = fimAnte.clone().sub(p['lowerarm' + s]).normalize();
    const centroMao = fimAnte.clone().addScaledVector(dir, rB * 0.95);
    const ossoMao = ext === 1 && hd ? hd : la;
    if (ext === 1 && wr) add(esferaEm(wr, fimAnte, rB * 0.9, M.pele)); else add(esferaEm(la, fimAnte, rB * 0.9, M.pele));
    const mao = add(esferaEm(ossoMao, centroMao, rB * 0.92 * 1.3, P.matMao || M.pele));
    maos[s] = { osso: ossoMao, centro: centroMao, mesh: mao };
  }

  // ---------- pernas ----------
  for (const s of ['l', 'r']) {
    const ul = o['upperleg' + s], ll = o['lowerleg' + s], ft = o['foot' + s], to = o['toes' + s];
    if (!ul || !ll) continue;
    if (P.semPernas) continue;
    add(esferaEm(ul, p['upperleg' + s], rP * 1.05, M.calca));
    add(capsulaEntre(ul, p['upperleg' + s], p['lowerleg' + s], rP, M.calca));
    add(esferaEm(ll, p['lowerleg' + s], rP * 0.95, M.calca)); // joelho
    if (ft) {
      add(capsulaEntre(ll, p['lowerleg' + s], p['foot' + s], rP * 0.88, M.calca));
      add(esferaEm(ft, p['foot' + s], rP * 0.88, M.calca)); // tornozelo
      // tênis: caixa do tornozelo até a ponta (encostado no tornozelo)
      const ponta = to ? p['toes' + s].clone() : p['foot' + s].clone().add(new THREE.Vector3(0, -0.05, 0.12));
      const ini = p['foot' + s].clone(); ini.y = Math.min(ini.y, ponta.y + 0.03);
      const fr = ponta.clone().sub(ini); fr.y = 0; if (fr.lengthSq() < 1e-5) fr.set(0, 0, 1); fr.normalize();
      const comp = Math.max(0.16, ponta.clone().sub(p['foot' + s]).length() + rP * 1.6);
      const sap = new THREE.Mesh(new THREE.BoxGeometry(rP * 1.9, rP * 1.25, comp), M.sapato);
      sap.position.copy(p['foot' + s]).addScaledVector(fr, comp * 0.32); sap.position.y = Math.max(rP * 0.62, p['foot' + s].y - rP * 0.55);
      sap.lookAt(sap.position.clone().add(fr)); sap.castShadow = true;
      ft.attach(sap); add(sap);
    }
  }

  // ---------- cauda (fantasma: corpo que afina embaixo, sem pernas) ----------
  if (P.semPernas && o.hips) {
    const alt = Math.max(0.3, p.hips.y - (P.caudaFim ?? 0.15));
    const cauda = new THREE.Mesh(new THREE.CylinderGeometry(rT * ex * 0.95, 0.03, alt, 16, 1, false), M.camisa);
    cauda.position.set(p.hips.x, p.hips.y - alt / 2, p.hips.z); cauda.scale.z = 1 / ex * 1.2;
    o.hips.attach(cauda); add(cauda);
  }

  // ---------- borda esfumada (vulto): uma casca maior e transparente em cada peça ----------
  if (P.halo) {
    const halo = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
    for (const m of [...pecas]) { const c = new THREE.Mesh(m.geometry, halo); c.position.copy(m.position); c.quaternion.copy(m.quaternion); c.scale.copy(m.scale).multiplyScalar(P.halo); m.parent.add(c); }
  }

  return { head: o.head, chest: o.chest, hips: o.hips, spine: o.spine, maos, centroCabeca, R, ossos: o, pontos: p, pecas };
}

// ======================= rodada 5: proporção humana, pose e apoio no chão =======================
// O esqueleto do Mannequin_Medium é "chibi": quadril a ~18% da altura e pernas curtas (a cabeça enorme da malha
// escondida é que fazia a altura). Aqui os ossos ganham proporção humana (quadril ~50% da altura, ombro ~82%).
// As faixas de POSIÇÃO das animações são tiradas (só ficam as rotações e a do quadril), senão elas desfazem isso.

// quanto cada osso se afasta do pai (multiplica a posição local de repouso)
const PROP = {
  lowerlegl: 2.6, lowerlegr: 2.6, footl: 2.6, footr: 2.6, toesl: 1.3, toesr: 1.3,
  spine: 1.1, chest: 1.1, head: 0.95,
  upperarml: 1.2, upperarmr: 1.2, lowerarml: 1.25, lowerarmr: 1.25, wristl: 1.25, wristr: 1.25,
};
const OSSOS_PERNA = ['upperlegl', 'lowerlegl', 'footl', 'upperlegr', 'lowerlegr', 'footr'];
// folga de cada osso até o chão (o centro do osso fica dentro do corpo): usado para apoiar no chão
const APOIO = { toesl: 0.035, toesr: 0.035, footl: 0.075, footr: 0.075, lowerlegl: 0.07, lowerlegr: 0.07, handl: 0.05, handr: 0.05, chest: 0.13, head: 0.14, hips: 0.1 };

export function proporcionar(obj, altura) {
  const ossos = {};
  obj.traverse(b => { if (b.isBone) ossos[b.name.toLowerCase().replace(/[._:]/g, '')] = b; });
  for (const [n, f] of Object.entries(PROP)) if (ossos[n]) ossos[n].position.multiplyScalar(f);
  const repouso = {};
  for (const [n, b] of Object.entries(ossos)) repouso[n] = b.quaternion.clone();
  // escala: base do pescoço a 84,5% da altura pedida
  obj.updateMatrixWorld(true);
  const yOsso = n => ossos[n] ? ossos[n].getWorldPosition(new THREE.Vector3()).y : 0;
  const pes = Math.min(yOsso('toesl'), yOsso('toesr'));
  const pesc = yOsso('head') - pes;
  if (pesc > 1e-3) obj.scale.multiplyScalar((0.845 * altura) / pesc);
  const info = { ossos, repouso, k: altura / 1.7 };
  aterrar(obj, info);
  return info;
}

// apoia o corpo no chão: o osso mais baixo (descontada a sua folga) encosta em y=0
export function aterrar(obj, info) {
  obj.updateMatrixWorld(true);
  let min = Infinity;
  for (const [n, folga] of Object.entries(APOIO)) {
    const b = info.ossos[n]; if (!b) continue;
    min = Math.min(min, b.getWorldPosition(_tmpA).y - folga * info.k);
  }
  if (isFinite(min)) { obj.position.y -= min; obj.updateMatrixWorld(true); }
}
const _tmpA = new THREE.Vector3(), _tmpB = new THREE.Vector3();
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion();

// gira `osso` (em espaço de mundo) para que a direção osso->filho vá na direção `alvo`, na fração f
export function apontar(osso, filho, alvo, f) {
  if (!osso || !filho || !osso.parent) return;
  osso.getWorldPosition(_tmpA); filho.getWorldPosition(_tmpB);
  const d = _tmpB.sub(_tmpA).normalize();
  const t = d.clone().lerp(alvo, f).normalize();
  _qa.setFromUnitVectors(d, t);
  osso.getWorldQuaternion(_qb); osso.parent.getWorldQuaternion(_qc);
  osso.quaternion.copy(_qc.invert().multiply(_qa.multiply(_qb)));
  osso.updateMatrixWorld(true);
}

// depois do mixer: endireita a perna nas poses paradas, pendura os braços (criatura alta) e apoia no chão
const RETAS = { Idle_A: 0.75, Idle_B: 0.75, Skeletons_Idle: 0.7, Holding_A: 0.6, Holding_B: 0.6, Interact: 0.5, Use_Item: 0.5,
  Walking_A: 0.3, Walking_B: 0.3, Walking_C: 0.3, Running_A: 0.2, Running_B: 0.2, Sneaking: 0.0 };
export function posAnimar(obj, info, anim, t, opts = {}) {
  const f = RETAS[anim] ?? 0;
  if (f > 0) for (const n of OSSOS_PERNA) { const b = info.ossos[n]; if (b) b.quaternion.slerp(info.repouso[n], f); }
  if (opts.pendurar) {
    obj.updateMatrixWorld(true);
    obj.getWorldQuaternion(_qa);
    for (const s of ['l', 'r']) {
      const lado = new THREE.Vector3(s === 'l' ? 1 : -1, 0, 0).applyQuaternion(_qa);
      const frente = new THREE.Vector3(0, 0, 1).applyQuaternion(_qa);
      const baixo = new THREE.Vector3(0, -1, 0).addScaledVector(lado, 0.1).addScaledVector(frente, 0.05 * Math.sin(t * 0.9 + (s === 'l' ? 0 : 1.7))).normalize();
      apontar(info.ossos['upperarm' + s], info.ossos['lowerarm' + s], baixo, opts.pendurar);
      apontar(info.ossos['lowerarm' + s], info.ossos['wrist' + s], baixo, opts.pendurar);
    }
  }
  aterrar(obj, info);
}

// animações para o corpo de proporção humana: sem as faixas de posição (exceto o quadril)
let _clipsHumanos = null;
export async function clipsHumanos() {
  if (_clipsHumanos) return _clipsHumanos;
  const base = await animacoesManequim();
  const out = {};
  for (const [nome, clip] of Object.entries(base)) {
    const c = clip.clone();
    c.tracks = c.tracks.filter(tr => !tr.name.endsWith('.position') || tr.name.startsWith('hips.'));
    out[nome] = c;
  }
  _clipsHumanos = out;
  return out;
}
