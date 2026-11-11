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
import { montarHumanoide, grupoEm } from './corpo.js';

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

// ======== criaturas humanoides: o MESMO corpo inteiriço do personagem (kit/corpo.js), com parâmetros ========
const mat = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9, ...extra });

async function animarManequim(obj, nome, timeScale = 1) {
  const mixer = new THREE.AnimationMixer(obj);
  const dic = await animacoesManequim();
  let atual = null;
  const acao = (n) => { const clip = dic[n] || dic['Idle_A']; if (!clip) return; if (atual) atual.stop(); atual = mixer.clipAction(clip); atual.reset(); atual.timeScale = 1; atual.play(); };
  acao(nome);
  return { mixer, acao, setTime: t => mixer.setTime(Math.max(0, t) * timeScale) };
}

// configuração base de cada tipo (opts do roteiro sobrescreve altura/cor/olhos)
const HUMANOIDES = {
  alta: { altura: 3.5, cor: 0x3a2e22, largura: 0.3, prof: 0.17, braco: 0.045, perna: 0.06, cabeca: 0.13, antebraco: 2.4, olhos: [3.4, 2.9, 0.4], olhoR: 0.026, acao: 'Idle_A', ts: 0.5 },
  sem_rosto: { altura: 2.05, cor: 0x15151c, largura: 0.38, prof: 0.22, braco: 0.055, perna: 0.068, cabeca: 0.14, corCabeca: 0xe8e2d6, corMao: 0xe8e2d6, acao: 'Idle_A', ts: 0.7, semOlhos: true },
  mulher_branca: { altura: 1.8, cor: 0xeeeee6, largura: 0.3, prof: 0.18, braco: 0.042, perna: 0.05, cabeca: 0.14, corMao: 0xd8d8d0, acao: 'Idle_B', ts: 0.6, semOlhos: true },
  espantalho: { altura: 1.95, cor: 0x7a4a2a, calca: 0x3a4a6a, largura: 0.34, prof: 0.2, braco: 0.05, perna: 0.062, cabeca: 0.16, corCabeca: 0xc8a85a, corMao: 0xd8b25a, acao: 'Idle_A', ts: 0.8, olhos: [0.05, 0.05, 0.05], olhoR: 0.03 },
  lobisomem: { altura: 2.3, cor: 0x3a2818, largura: 0.48, prof: 0.32, braco: 0.075, perna: 0.085, cabeca: 0.16, acao: 'Sneaking', ts: 0.8, olhos: [5, 3.5, 0.4], olhoR: 0.03, antebraco: 1.15 },
  gigante_mitologico: { altura: 4.5, cor: 0x9a8a6a, calca: 0x6a4a2a, largura: 0.5, prof: 0.32, braco: 0.09, perna: 0.11, cabeca: 0.24, acao: 'Idle_A', ts: 0.6, olhos: [3, 3, 3], olhoR: 0.035 },
  rastejante: { altura: 1.7, cor: 0x8a8278, largura: 0.28, prof: 0.17, braco: 0.04, perna: 0.05, cabeca: 0.12, antebraco: 1.35, acao: 'Crawling', ts: 0.8, olhos: [5, 3.6, 0.5], olhoR: 0.024 },
  vulto: { altura: 2.25, cor: 0x050507, largura: 0.36, prof: 0.22, braco: 0.055, perna: 0.068, cabeca: 0.15, acao: 'Idle_A', ts: 0.5, olhos: [3.2, 0.4, 0.4], olhoR: 0.022, halo: 1.14 },
  fantasma: { altura: 1.85, cor: 0xcfe0ee, largura: 0.32, prof: 0.2, braco: 0.045, perna: 0.05, cabeca: 0.15, acao: 'Idle_B', ts: 0.5, olhos: [0.05, 0.05, 0.08], olhoR: 0.03, translucido: true, semPernas: true },
};

async function humanoide(tipo, opts) {
  const C = { ...HUMANOIDES[tipo] };
  const altura = opts.altura || C.altura;
  const k = altura / C.altura; // escala os raios se o roteiro pedir outra altura
  const { obj } = await instanciar('personagens/Mannequin_Medium', { altura, aoChao: true });
  const corpo = opts.cor || C.cor;
  const extra = C.translucido ? { transparent: true, opacity: 0.45, emissive: 0x3a5a7a, emissiveIntensity: 0.5, depthWrite: false } : {};
  const mCorpo = mat(corpo, extra), mCalca = C.calca ? mat(C.calca) : mCorpo;
  const mCab = C.corCabeca ? mat(C.corCabeca) : mCorpo, mMao = C.corMao ? mat(C.corMao, extra) : mCorpo;
  const c = montarHumanoide(obj, {
    mat: { pele: mCorpo, camisa: mCorpo, calca: mCalca, sapato: C.translucido ? mCorpo : mat(0x1a1410), manga: 'longa' },
    matCabeca: mCab, matMao: mMao,
    largura: C.largura * k, profundidade: C.prof * k, braco: C.braco * k, perna: C.perna * k, cabeca: C.cabeca * k,
    antebraco: C.antebraco || 1, semPernas: C.semPernas, caudaFim: 0.35, halo: C.halo,
  });
  const R = c.R, cab = c.head && c.centroCabeca ? grupoEm(c.head, c.centroCabeca) : null;

  // olhos que brilham na frente da cabeça (só os olhos brilham)
  const olhos = opts.olhos || C.olhos;
  if (cab && olhos && !C.semOlhos) {
    const mo = new THREE.MeshBasicMaterial({ color: new THREE.Color(olhos[0], olhos[1], olhos[2]) });
    const n = opts.nOlhos || 1, rO = (C.olhoR || 0.03) * k;
    for (let i = 0; i < n; i++) for (const dx of [-R * 0.38, R * 0.38]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(rO, 10, 8), mo); e.position.set(dx, R * 0.12 + i * rO * 2.6, R * 0.9); cab.add(e);
    }
  }
  // detalhes por tipo
  if (tipo === 'mulher_branca' && cab && c.hips) {
    const preto = mat(0x0a0a0a);
    const calota = new THREE.Mesh(new THREE.SphereGeometry(R * 1.08, 18, 14), preto); calota.position.y = R * 0.05; cab.add(calota);
    const frente = new THREE.Mesh(new THREE.BoxGeometry(R * 1.7, R * 3.4, R * 0.18), preto); frente.position.set(0, -R * 0.9, R * 0.95); cab.add(frente); // cobre o rosto
    const costas = new THREE.Mesh(new THREE.BoxGeometry(R * 1.9, R * 4.4, R * 0.3), preto); costas.position.set(0, -R * 1.4, -R * 0.75); cab.add(costas);
    const yq = c.pontos.hips.y;
    const vest = new THREE.Mesh(new THREE.CylinderGeometry(C.largura * 0.55, C.largura * 1.25, yq + 0.05, 20, 1, true), mat(0xeeeee6, { side: THREE.DoubleSide }));
    vest.position.set(c.pontos.hips.x, yq / 2 + 0.03, c.pontos.hips.z); c.hips.attach(vest);
  }
  if (tipo === 'espantalho' && cab) {
    const chapeu = new THREE.Mesh(new THREE.ConeGeometry(R * 1.5, R * 2.0, 14), mat(0x3a2a1a)); chapeu.position.y = R * 1.35; cab.add(chapeu);
    const aba = new THREE.Mesh(new THREE.CylinderGeometry(R * 2.1, R * 2.1, R * 0.12, 18), chapeu.material); aba.position.y = R * 0.55; cab.add(aba);
    const boca = new THREE.Mesh(new THREE.BoxGeometry(R * 1.0, R * 0.08, R * 0.05), mat(0x1a1410)); boca.position.set(0, -R * 0.35, R * 0.96); cab.add(boca);
    for (const m of Object.values(c.maos)) for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.16, 5), mat(0xd8b25a)); p.position.copy(m.centro).add(new THREE.Vector3((i - 1.5) * 0.025, -0.08, 0)); p.rotation.x = Math.PI; m.osso.attach(p); }
  }
  if (tipo === 'lobisomem' && cab) {
    const pelo = mat(0x2e2014);
    const focinho = new THREE.Mesh(new THREE.BoxGeometry(R * 0.8, R * 0.62, R * 1.3), pelo); focinho.position.set(0, -R * 0.25, R * 1.05); cab.add(focinho);
    const nariz = new THREE.Mesh(new THREE.SphereGeometry(R * 0.16, 10, 8), mat(0x050505)); nariz.position.set(0, -R * 0.08, R * 1.72); cab.add(nariz);
    const dentes = new THREE.Mesh(new THREE.BoxGeometry(R * 0.7, R * 0.08, R * 0.08), mat(0xeeeedd)); dentes.position.set(0, -R * 0.55, R * 1.65); cab.add(dentes);
    for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.ConeGeometry(R * 0.32, R * 0.9, 6), pelo); o.position.set(sx * R * 0.6, R * 0.95, -R * 0.1); o.rotation.z = -sx * 0.25; cab.add(o); }
    // tufos de pelo nas costas e ombros
    if (c.chest) for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), pelo); t.position.copy(c.pontos.chest).add(new THREE.Vector3((i - 3) * 0.07, 0.05 + (i % 2) * 0.06, -C.prof * 0.55)); t.rotation.x = -0.9; c.chest.attach(t); }
  }
  if (tipo === 'gigante_mitologico' && cab) {
    const barba = new THREE.Mesh(new THREE.SphereGeometry(R * 0.85, 16, 10, 0, 6.3, Math.PI * 0.5, Math.PI * 0.5), mat(0x6a6a6a)); barba.position.set(0, -R * 0.25, R * 0.2); cab.add(barba);
    if (c.hips) { const yq = c.pontos.hips.y; const tun = new THREE.Mesh(new THREE.CylinderGeometry(C.largura * 0.6, C.largura * 0.95, yq * 0.5, 18, 1, true), mat(0x6a4a2a, { side: THREE.DoubleSide })); tun.position.set(c.pontos.hips.x, yq * 0.78, c.pontos.hips.z); c.hips.attach(tun); }
  }

  const ctrl = await animarManequim(obj, opts.acao || C.acao, C.ts);
  const flutua = tipo === 'fantasma' || tipo === 'mulher_branca';
  const setTime = t => { ctrl.setTime(t); if (flutua) obj.position.y = (tipo === 'fantasma' ? 0.25 : 0.04) + Math.sin(t * 1.3) * 0.07; };
  obj.updateMatrixWorld(true);
  return { obj, mixer: ctrl.mixer, setTime, acao: ctrl.acao, head: c.head, altura, raio: altura * 0.15 };
}

export async function criatura(tipo = 'alta', opts = {}) {
  const r = rng(opts.semente ?? 1);
  const olhos = opts.olhos || null;
  if (HUMANOIDES[tipo]) return humanoide(tipo, opts);

  // ----- olhos_no_escuro: só pares de olhos flutuando -----
  if (tipo === 'olhos_no_escuro') {
    const obj = new THREE.Group();
    const n = opts.nOlhos || 3; const rr = rng(opts.semente ?? 3);
    for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.position.set((rr() - 0.5) * 3, 1.2 + rr() * 1.2, (rr() - 0.5) * 2); porOlhos(g, { cor: olhos || [4.5, 3.6, 0.5], frente: 0, raio: 0.05, sep: 0.12 }); obj.add(g); }
    return { obj, mixer: null, setTime() {}, acao() {}, head: null, altura: 2.0, raio: 0.6 };
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
