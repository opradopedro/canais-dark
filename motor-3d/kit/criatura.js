// kit/criatura.js — biblioteca de criaturas (>= 12 tipos), montadas em peças presas aos ossos do manequim
// (ou em modelos de animais/criaturas quando faz sentido). Olhos brilham via bloom (cor > 1).
//
// criatura(tipo, opts) -> { obj, mixer, setTime(t), acao(nome), head, altura, raio }
//   tipos: alta, sem_rosto, cao_negro, mulher_branca, vulto, rastejante, espantalho, olhos_no_escuro,
//          lobisomem, fantasma, aranha_gigante, coisa_com_chifres, gigante_mitologico
//   opts (variam entre histórias): altura, cor, olhos (cor [r,g,b] >1), nOlhos, nBracos, semente
//
// Determinístico: setTime(t) / mixer.setTime; nenhum relógio nem random sem semente.
import * as THREE from 'three';
import { instanciar, animacoesManequim } from './modelos.js';

function rng(sem) { let a = (sem | 0) >>> 0 || 7; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }

function acharOsso(raiz, ...nomes) {
  let achado = null;
  const alvo = nomes.map(n => n.toLowerCase().replace(/[._:]/g, ''));
  raiz.traverse(b => { if (achado || !b.isBone) return; const n = b.name.toLowerCase().replace(/[._:]/g, '').replace('mixamorig', ''); if (alvo.includes(n)) achado = b; });
  return achado;
}

const _eixoY = new THREE.Vector3(0, 1, 0);
function capsulaOsso(osso, filho, mat, r, escalaComp = 1) {
  if (!osso) return null;
  const dir = filho ? filho.position.clone() : new THREE.Vector3(0, -0.3, 0);
  let L = (dir.length() || 0.3) * escalaComp; dir.normalize();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.02, L - r * 2), 6, 10), mat);
  m.quaternion.setFromUnitVectors(_eixoY, dir); m.position.copy(dir).multiplyScalar(L / 2); m.castShadow = true;
  osso.add(m); return m;
}

// olhos que brilham (cor > 1). n = quantos pares. destino = osso/obj.
function porOlhos(destino, { cor = [4, 3.6, 0.5], raio = 0.035, sep = 0.06, frente = 0.17, alturaY = 0.0, n = 1 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(cor[0], cor[1], cor[2]) });
  for (let k = 0; k < n; k++) {
    const dy = k * raio * 2.5;
    for (const dx of [-sep, sep]) { const e = new THREE.Mesh(new THREE.SphereGeometry(raio, 10, 8), mat); e.position.set(dx, alturaY + dy, frente); destino.add(e); }
  }
}

function escurecer(obj, cor, rough = 1) {
  obj.traverse(m => { if (m.isMesh || m.isSkinnedMesh) { m.material = new THREE.MeshStandardMaterial({ color: cor, roughness: rough }); m.castShadow = true; } });
}
function esconderMalhas(obj) { obj.traverse(m => { if (m.isMesh || m.isSkinnedMesh) m.visible = false; }); }

// monta um corpo humanoide em peças, com parâmetros de criatura (fino, braços longos, cabeça pequena...)
function corpoHumanoide(obj, { cor = 0x1a1510, rCorpo = 0.1, rBraco = 0.05, rPerna = 0.06, bracoLongo = 1, cabeca = 0.14 } = {}) {
  esconderMalhas(obj);
  const mat = new THREE.MeshStandardMaterial({ color: cor, roughness: 1 });
  const B = n => acharOsso(obj, n);
  const hips = B('hips'), head = B('head');
  const uar = B('upperarmr'), lar = B('lowerarmr'), hnr = B('handr');
  const ual = B('upperarml'), lal = B('lowerarml'), hnl = B('handl');
  const ulr = B('upperlegr'), llr = B('lowerlegr'), ftr = B('footr');
  const ull = B('upperlegl'), lll = B('lowerlegl'), ftl = B('footl');
  obj.updateMatrixWorld(true);
  // tronco
  if (hips && head) {
    const esc = obj.scale.y || 1;
    const alt = Math.max(0.2, (head.getWorldPosition(new THREE.Vector3()).y - hips.getWorldPosition(new THREE.Vector3()).y) / esc * 0.9);
    const t = new THREE.Mesh(new THREE.CapsuleGeometry(rCorpo, alt, 6, 10), mat); t.position.y = alt * 0.5; t.castShadow = true; hips.add(t);
  }
  // cabeça pequena
  if (head) { const h = new THREE.Mesh(new THREE.SphereGeometry(cabeca, 16, 14), mat); h.scale.y = 1.15; h.position.y = cabeca; h.castShadow = true; head.add(h); }
  // braços (longos): escala o comprimento por bracoLongo
  if (uar) capsulaOsso(uar, lar, mat, rBraco, bracoLongo);
  if (lar) capsulaOsso(lar, hnr, mat, rBraco * 0.9, bracoLongo);
  if (ual) capsulaOsso(ual, lal, mat, rBraco, bracoLongo);
  if (lal) capsulaOsso(lal, hnl, mat, rBraco * 0.9, bracoLongo);
  // mãos (garras pequenas)
  for (const h of [hnr, hnl]) if (h) { const c = new THREE.Mesh(new THREE.SphereGeometry(rBraco * 1.1, 8, 6), mat); h.add(c); }
  // pernas
  if (ulr) capsulaOsso(ulr, llr, mat, rPerna); if (llr) capsulaOsso(llr, ftr, mat, rPerna * 0.85);
  if (ull) capsulaOsso(ull, lll, mat, rPerna); if (lll) capsulaOsso(lll, ftl, mat, rPerna * 0.85);
  return { head, hips };
}

// aplica uma animação lenta do manequim e devolve o controlador
async function animarManequim(obj, nome, timeScale = 1) {
  const mixer = new THREE.AnimationMixer(obj);
  const dic = await animacoesManequim();
  let atual = null;
  const acao = (n) => { const clip = dic[n] || dic['Idle_A']; if (!clip) return; if (atual) atual.stop(); atual = mixer.clipAction(clip); atual.reset(); atual.timeScale = timeScale; atual.play(); };
  acao(nome);
  return { mixer, acao, setTime: t => mixer.setTime(Math.max(0, t) * timeScale) };
}

export async function criatura(tipo = 'alta', opts = {}) {
  const r = rng(opts.semente ?? 1);
  const olhos = opts.olhos || null;

  // ----- tipos baseados no manequim (peças) -----
  if (['alta', 'sem_rosto', 'mulher_branca', 'espantalho', 'lobisomem', 'gigante_mitologico', 'rastejante'].includes(tipo)) {
    const altura = opts.altura || ({ alta: 3.5, sem_rosto: 1.9, mulher_branca: 1.8, espantalho: 2.0, lobisomem: 2.3, gigante_mitologico: 4.5, rastejante: 1.7 })[tipo];
    const { obj } = await instanciar('personagens/Mannequin_Medium', { altura, aoChao: true });

    if (tipo === 'alta') {
      corpoHumanoide(obj, { cor: opts.cor || 0x3a2e22, rCorpo: 0.07, rBraco: 0.045, rPerna: 0.06, bracoLongo: 2.0, cabeca: 0.1 });
      const head = acharOsso(obj, 'head');
      if (head) porOlhos(head, { cor: olhos || [5, 4.2, 0.6], frente: 0.1, alturaY: 0.1, raio: 0.028, sep: 0.045, n: opts.nOlhos || 1 });
      const ctrl = await animarManequim(obj, opts.acao || 'Skeletons_Idle', opts.timeScale || 0.5);
      return finaliza(obj, ctrl, head, altura);
    }
    if (tipo === 'sem_rosto') { // terno escuro, cabeça lisa pálida, SEM rosto
      const { head } = corpoHumanoide(obj, { cor: opts.cor || 0x15151a, rCorpo: 0.12, rBraco: 0.06, rPerna: 0.075, bracoLongo: 1, cabeca: 0.14 });
      if (head) { const bola = head.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry'); if (bola) bola.material = new THREE.MeshStandardMaterial({ color: 0xe8e2d6, roughness: 1 }); }
      const ctrl = await animarManequim(obj, 'Idle_A', 1); return finaliza(obj, ctrl, head, altura);
    }
    if (tipo === 'mulher_branca') { // Llorona: vestido longo branco flutuando, cabelo cobrindo o rosto
      const { head, hips } = corpoHumanoide(obj, { cor: 0xeeeee6, rCorpo: 0.09, rBraco: 0.045, rPerna: 0.05, bracoLongo: 1.1, cabeca: 0.14 });
      if (hips) { const saia = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.3, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xeeeee6, roughness: 1, side: THREE.DoubleSide })); saia.position.y = -0.1; hips.add(saia); }
      if (head) { const cab = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14, 0, 6.3, 0, Math.PI * 0.95), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 })); cab.position.set(0, 0.14, 0.02); head.add(cab); }
      const ctrl = await animarManequim(obj, 'Idle_B', 0.6); return finaliza(obj, ctrl, head, altura);
    }
    if (tipo === 'espantalho') {
      const { head } = corpoHumanoide(obj, { cor: 0x6a4a2a, rCorpo: 0.09, rBraco: 0.05, rPerna: 0.06, bracoLongo: 1.1, cabeca: 0.15 });
      if (head) { const bola = head.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry'); if (bola) bola.material = new THREE.MeshStandardMaterial({ color: 0xc8a85a, roughness: 1 }); porOlhos(head, { cor: olhos || [0.1, 0.1, 0.1], frente: 0.15, alturaY: 0.14, raio: 0.03, sep: 0.06 }); const chapeu = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 })); chapeu.position.y = 0.32; head.add(chapeu); }
      const ctrl = await animarManequim(obj, 'Idle_A', 1); return finaliza(obj, ctrl, head, altura);
    }
    if (tipo === 'lobisomem') {
      const { head } = corpoHumanoide(obj, { cor: opts.cor || 0x3a2a1a, rCorpo: 0.15, rBraco: 0.08, rPerna: 0.09, bracoLongo: 1.3, cabeca: 0.17 });
      if (head) { const focinho = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 1 })); focinho.rotation.x = Math.PI / 2; focinho.position.set(0, 0.12, 0.18); head.add(focinho); porOlhos(head, { cor: olhos || [5, 3.5, 0.4], frente: 0.16, alturaY: 0.16, raio: 0.03, sep: 0.06 }); for (const sx of [-0.08, 0.08]) { const orelha = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), head.children[0].material); orelha.position.set(sx, 0.3, 0); head.add(orelha); } }
      const ctrl = await animarManequim(obj, opts.acao || 'Idle_A', 0.9); return finaliza(obj, ctrl, head, altura);
    }
    if (tipo === 'gigante_mitologico') {
      const { head } = corpoHumanoide(obj, { cor: opts.cor || 0x7a6a52, rCorpo: 0.2, rBraco: 0.11, rPerna: 0.13, bracoLongo: 1.1, cabeca: 0.26 });
      if (head) porOlhos(head, { cor: olhos || [4, 4, 4], frente: 0.26, alturaY: 0.24, raio: 0.05, sep: 0.1 });
      const ctrl = await animarManequim(obj, opts.acao || 'Idle_A', 0.6); return finaliza(obj, ctrl, head, altura);
    }
    if (tipo === 'rastejante') {
      corpoHumanoide(obj, { cor: opts.cor || 0x241a12, rCorpo: 0.1, rBraco: 0.05, rPerna: 0.06, bracoLongo: 1.2, cabeca: 0.12 });
      const head = acharOsso(obj, 'head'); if (head) porOlhos(head, { cor: olhos || [5, 3.6, 0.5], frente: 0.12, alturaY: 0.08, raio: 0.028, sep: 0.05 });
      const ctrl = await animarManequim(obj, 'Crawling', 0.8); return finaliza(obj, ctrl, head, altura);
    }
  }

  // ----- vulto: sombra sem detalhe (peça única, sem rosto) -----
  if (tipo === 'vulto') {
    const altura = opts.altura || 2.3;
    const obj = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 1 });
    const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, altura * 0.55, 6, 12), mat); corpo.position.y = altura * 0.45; corpo.castShadow = true; obj.add(corpo);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 14), mat); cab.position.y = altura * 0.88; obj.add(cab);
    porOlhos(cab, { cor: olhos || [4.5, 0.5, 0.5], frente: 0.19, alturaY: 0, raio: 0.045, sep: 0.07, n: opts.nOlhos || 1 });
    return { obj, mixer: null, setTime() {}, acao() {}, head: cab, altura, raio: altura * 0.2 };
  }

  // ----- olhos_no_escuro: só pares de olhos flutuando -----
  if (tipo === 'olhos_no_escuro') {
    const obj = new THREE.Group();
    const n = opts.nOlhos || 3; const rr = rng(opts.semente ?? 3);
    for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.position.set((rr() - 0.5) * 3, 1.2 + rr() * 1.2, (rr() - 0.5) * 2); porOlhos(g, { cor: olhos || [4.5, 3.6, 0.5], frente: 0, raio: 0.05, sep: 0.12 }); obj.add(g); }
    return { obj, mixer: null, setTime() {}, acao() {}, head: null, altura: 2.0, raio: 0.6 };
  }

  // ----- fantasma: translúcido, flutua -----
  if (tipo === 'fantasma') {
    const altura = opts.altura || 1.9;
    const obj = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xcfe0ee, roughness: 1, transparent: true, opacity: 0.5, emissive: 0x3a5a7a, emissiveIntensity: 0.4 });
    const corpo = new THREE.Mesh(new THREE.ConeGeometry(0.3, altura * 0.8, 16, 1, true), mat); corpo.position.y = altura * 0.4; corpo.rotation.x = Math.PI; corpo.position.y = altura * 0.45; obj.add(corpo);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), mat); cab.position.y = altura * 0.82; obj.add(cab);
    porOlhos(cab, { cor: olhos || [0.1, 0.1, 0.1], frente: 0.2, raio: 0.04, sep: 0.07 });
    obj.userData.flutua = true;
    return { obj, mixer: null, setTime(t) { obj.position.y = Math.sin(t * 1.2) * 0.15; }, acao() {}, head: cab, altura, raio: altura * 0.2 };
  }

  // ----- cão negro (Cadejo): usar Wolf escurecido, olhos vermelhos -----
  if (tipo === 'cao_negro') {
    const altura = opts.altura || 1.0;
    const { obj, animacoes } = await instanciar('animais/' + (opts.modelo || 'Wolf'), { altura });
    escurecer(obj, opts.cor || 0x0d0d0f, 0.95);
    porOlhos(obj, { cor: olhos || [5, 0.3, 0.3], raio: 0.045, sep: 0.07, frente: altura * 0.95, alturaY: altura * 0.8 });
    const mixer = new THREE.AnimationMixer(obj); const dic = {}; for (const c of animacoes) dic[c.name] = c; let atual = null;
    const acao = (n) => { const clip = dic[n] || dic['Walk'] || dic['Idle'] || animacoes[0]; if (!clip) return; if (atual) atual.stop(); atual = mixer.clipAction(clip); atual.reset().play(); };
    acao(opts.acao || 'Walk');
    return { obj, mixer, setTime: t => mixer.setTime(Math.max(0, t)), acao, head: null, altura, raio: altura };
  }

  // ----- aranha gigante: Spider.glb grande -----
  if (tipo === 'aranha_gigante') {
    const altura = opts.altura || 1.6;
    const { obj, animacoes } = await instanciar('criaturas/Spider', { altura });
    escurecer(obj, opts.cor || 0x120f14, 1);
    porOlhos(obj, { cor: olhos || [5, 0.4, 0.4], raio: 0.035, sep: 0.05, frente: altura * 0.5, alturaY: altura * 0.5, n: 2 });
    const mixer = new THREE.AnimationMixer(obj); const dic = {}; for (const c of animacoes) dic[c.name] = c; let atual = null;
    const acao = (n) => { const clip = dic[n] || dic['Spider_Walk'] || dic['Spider_Idle'] || animacoes[0]; if (!clip) return; if (atual) atual.stop(); atual = mixer.clipAction(clip); atual.reset().play(); };
    acao(opts.acao || 'Spider_Walk');
    return { obj, mixer, setTime: t => mixer.setTime(Math.max(0, t)), acao, head: null, altura, raio: altura };
  }

  // ----- coisa com chifres: Stag.glb escuro, olhos brilhando (cervo/caveira) -----
  if (tipo === 'coisa_com_chifres') {
    const altura = opts.altura || 2.0;
    const { obj, animacoes } = await instanciar('animais/Stag', { altura });
    escurecer(obj, opts.cor || 0x1a1410, 1);
    porOlhos(obj, { cor: olhos || [5, 3.4, 0.4], raio: 0.045, sep: 0.09, frente: altura * 0.6, alturaY: altura * 0.75 });
    const mixer = new THREE.AnimationMixer(obj); const dic = {}; for (const c of animacoes) dic[c.name] = c; let atual = null;
    const acao = (n) => { const clip = dic[n] || dic['Idle'] || animacoes[0]; if (!clip) return; if (atual) atual.stop(); atual = mixer.clipAction(clip); atual.reset().play(); };
    acao(opts.acao || 'Idle');
    return { obj, mixer, setTime: t => mixer.setTime(Math.max(0, t)), acao, head: null, altura, raio: altura };
  }

  // fallback: alta
  return criatura('alta', opts);
}

function finaliza(obj, ctrl, head, altura) {
  // recoloca os pés no chão após montar/animar
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  if (isFinite(box.min.y)) obj.position.y -= box.min.y;
  return { obj, mixer: ctrl.mixer, setTime: ctrl.setTime, acao: ctrl.acao, head, altura, raio: altura * 0.15 };
}

export const TIPOS_CRIATURA = ['alta', 'sem_rosto', 'cao_negro', 'mulher_branca', 'vulto', 'rastejante',
  'espantalho', 'olhos_no_escuro', 'lobisomem', 'fantasma', 'aranha_gigante', 'coisa_com_chifres', 'gigante_mitologico'];
