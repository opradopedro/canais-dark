// kit/cenarios/acabados.js — os 8 cenários ACABADOS da rodada 4 (os outros 19 ficam como rascunho).
//
// Cada cenário devolve:
//   { grupo, marcas, piso, principais:[obj], ajustarLuz(noturno), vista:{pos,olha}, limites?, acabado:true, nDetalhes }
//   - chão com material próprio (textura procedural determinística)
//   - >= 15 objetos de detalhe (contados em nDetalhes)
//   - luz própria de dia e de noite (postes/janelas/lâmpadas acendem com ajustarLuz(true))
//   - 6+ marcas a >= 1,5 m de qualquer parede/objeto principal (testes/cenarios_check.py confere)
//   - principais = objetos que podem ser o ASSUNTO de um plano (casa, torre, poste, mausoléu...)
//   - paredes de interior marcadas userData.parede (a câmera fica presa em `limites`, nunca rente à parede)
import * as THREE from 'three';
import { instanciar, ALTURAS } from '../modelos.js';

function semente(s) { let a = (s | 0) >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }

// ---------------- texturas procedurais (determinísticas) ----------------
const _texCache = {};
function textura(tipo) {
  if (_texCache[tipo]) return _texCache[tipo];
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const r = semente(tipo.length * 97 + 13);
  const base = { grama: '#3f6e2e', grama_escura: '#2e4a26', asfalto: '#2f3136', terra: '#6a5434', madeira: '#7a5a3a', ladrilho: '#d8dcd6',
    pedra: '#8a8a82', cascalho: '#7e7468', concreto: '#9a9c9e', piso_floresta: '#3a4a2a', neve: '#e6eef6' }[tipo] || '#777';
  x.fillStyle = base; x.fillRect(0, 0, 256, 256);
  if (tipo === 'madeira') { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#6e5032' : '#82603e'; x.fillRect(0, i * 32, 256, 31); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, i * 32 + 31, 256, 1); x.fillRect((i * 97) % 256, i * 32, 1, 32); } }
  else if (tipo === 'ladrilho' || tipo === 'pedra') { const n = tipo === 'ladrilho' ? 4 : 5; const s = 256 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = (r() - 0.5) * (tipo === 'pedra' ? 26 : 10); x.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 255})`; x.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); } x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 3; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, 256); x.moveTo(0, i * s); x.lineTo(256, i * s); x.stroke(); } }
  else { const nPts = 1800; for (let i = 0; i < nPts; i++) { const v = r(); x.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.09)'; const s = 1 + r() * 3; x.fillRect(r() * 256, r() * 256, s, s); } }
  if (tipo === 'grama' || tipo === 'grama_escura' || tipo === 'piso_floresta') for (let i = 0; i < 500; i++) { x.strokeStyle = r() > 0.5 ? 'rgba(120,170,80,0.35)' : 'rgba(20,40,15,0.3)'; const px = r() * 256, py = r() * 256; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 3, py - 3 - r() * 4); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  _texCache[tipo] = t; return t;
}
function matTex(tipo, rep, extra = {}) { const t = textura(tipo).clone(); t.needsUpdate = true; t.repeat.set(rep, rep); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, ...extra }); }
const M = (cor, o = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, ...o });

// ---------------- construtor de cenário (conta detalhes, registra luzes e principais) ----------------
function novo(scene) {
  const g = new THREE.Group(); scene.add(g);
  const C = { g, principais: [], luzes: [], brilhos: [], dia: [], n: 0 };
  C.det = (o) => { if (o) { o.userData.detalhe = true; C.n++; } return o; };
  C.princ = (o) => { if (o) { o.userData.principal = true; C.principais.push(o); } return o; };
  C.add = (m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  C.caixa = (x, y, z, w, h, d, mat, ry = 0) => { const m = C.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); m.rotation.y = ry; return m; };
  C.cil = (x, y, z, rt, rb, h, mat, seg = 12) => { const m = C.add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat)); m.position.set(x, y, z); return m; };
  C.esf = (x, y, z, r, mat) => { const m = C.add(new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat)); m.position.set(x, y, z); return m; };
  C.grupo = (x, z, ry = 0) => { const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s); return s; };
  C.chao = (tipo, tam, rep, y = 0, x = 0, z = 0, w = null) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w || tam, tam), matTex(tipo, rep)); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z);
    p.receiveShadow = true; p.userData.chao = true; g.add(p); return p;
  };
  // luz que só acende à noite (poste, janela, vela); emissivo que acende junto
  C.luzNoite = (x, y, z, cor = 0xffd79a, inten = 10, dist = 9) => { const l = new THREE.PointLight(cor, 0, dist, 1.7); l.position.set(x, y, z); l.userData.base = inten; g.add(l); C.luzes.push(l); return l; };
  C.brilho = (mesh, inten = 2.2) => { mesh.material = mesh.material.clone(); mesh.material.emissive = new THREE.Color(mesh.material.color); mesh.userData.base = inten; mesh.material.emissiveIntensity = 0; C.brilhos.push(mesh); return mesh; };
  // luz que fica sempre (interior): cor/força de dia e de noite
  C.luzSempre = (x, y, z, dia, noite, dist = 10) => { const l = new THREE.PointLight(dia[0], dia[1], dist, 1.6); l.position.set(x, y, z); l.userData.dia = dia; l.userData.noite = noite; g.add(l); C.dia.push(l); return l; };
  C.por = async (rel, x, z, altura, { ry = 0, y = 0, sx = 1 } = {}) => {
    const { obj } = await instanciar(rel, { altura }); obj.position.set(x, y, z); obj.rotation.y = ry; if (sx !== 1) { obj.scale.x *= sx; obj.scale.z *= sx; }
    g.add(obj); return obj;
  };
  C.fim = (marcas, vista, extra = {}) => ({
    grupo: g, marcas, piso: null, principais: C.principais, vista, acabado: true, nDetalhes: C.n, ...extra,
    ajustarLuz(noturno) {
      for (const l of C.luzes) l.intensity = noturno ? l.userData.base : 0;
      for (const b of C.brilhos) b.material.emissiveIntensity = noturno ? b.userData.base : 0;
      for (const l of C.dia) { const [cor, f] = noturno ? l.userData.noite : l.userData.dia; l.color.set(cor); l.intensity = f; }
    },
  });
  return C;
}

// --------- peças reutilizáveis ---------
function poste(C, x, z, ladoRua = 1) { // poste de bairro com braço p/ a rua; lâmpada acende à noite
  const s = C.grupo(x, z); const ferro = M(0x2a2d30, { roughness: 0.6 });
  const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 5, 10), ferro); mastro.position.y = 2.5; mastro.castShadow = true; s.add(mastro);
  const braco = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.1), ferro); braco.position.set(0.55 * ladoRua, 4.95, 0); s.add(braco);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.26), M(0xfff0c0)); lamp.position.set(1.05 * ladoRua, 4.88, 0); s.add(lamp); C.brilho(lamp, 2.6);
  const luz = new THREE.SpotLight(0xffd79a, 0, 16, 0.75, 0.55, 1.4); luz.position.set(x + 1.05 * ladoRua, 4.8, z); luz.target.position.set(x + 1.3 * ladoRua, 0, z); luz.userData.base = 34; C.g.add(luz, luz.target); C.luzes.push(luz);
  return C.princ(C.det(s));
}
function carro(C, x, z, ry, cor) {
  const s = C.grupo(x, z, ry); const lat = M(cor, { roughness: 0.45, metalness: 0.15 });
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.62, 4.3), lat); corpo.position.y = 0.62; corpo.castShadow = true; s.add(corpo);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.58, 2.2), lat); cab.position.set(0, 1.18, -0.15); s.add(cab);
  const vid = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.44, 2.0), M(0x1a2630, { roughness: 0.25 })); vid.position.set(0, 1.2, -0.15); s.add(vid);
  for (const [a, b] of [[0.95, 1.35], [-0.95, 1.35], [0.95, -1.35], [-0.95, -1.35]]) { const rd = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 16), M(0x141418)); rd.rotation.z = Math.PI / 2; rd.position.set(a, 0.36, b); s.add(rd); }
  for (const fx of [-0.62, 0.62]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.06), M(0xfff4d0)); f.position.set(fx, 0.7, 2.16); s.add(f); C.brilho(f, 2.4); const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.06), M(0xc02020)); t.position.set(fx, 0.72, -2.16); s.add(t); C.brilho(t, 1.6); }
  return C.princ(C.det(s));
}
function lanterna(C, x, z, cor = 0xffc070, alt = 2.2) { // lanterna em poste de madeira
  const s = C.grupo(x, z); const mad = M(0x4a3420);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, alt, 8), mad); p.position.y = alt / 2; p.castShadow = true; s.add(p);
  const cx = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.24), M(cor)); cx.position.y = alt + 0.12; s.add(cx); C.brilho(cx, 2.4);
  C.luzNoite(x, alt + 0.1, z, cor, 8, 9);
  return C.det(s);
}
function arvoreAnel(C, { r0, r1, n, tipos, sem, alt = [6, 9] }) { // árvores em anel, longe do centro (deterministico)
  const r = semente(sem); const ps = [];
  for (let i = 0; i < n; i++) { const a = r() * 6.283, d = r0 + r() * (r1 - r0); ps.push(C.por('natureza/' + tipos[Math.floor(r() * tipos.length)], Math.cos(a) * d, Math.sin(a) * d, alt[0] + r() * (alt[1] - alt[0]), { ry: r() * 6.28 })); }
  return Promise.all(ps);
}
function figurante(C, x, z, ry, sem) { // gente de fundo (versão leve do personagem liso)
  const r = semente(sem); const s = C.grupo(x, z, ry);
  const pele = M(['#f2d6be', '#d9a77f', '#c98d5f', '#8a5a34'][Math.floor(r() * 4)]), roupa = M(['#6a2b22', '#2e3a6a', '#3f5a3a', '#7a5a34', '#8a6a9a', '#b08a3a'][Math.floor(r() * 6)]), calca = M('#3a3428');
  const alt = 1.6 + r() * 0.15;
  const add = (geo, m, px, py, pz) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.castShadow = true; s.add(o); return o; };
  add(new THREE.CapsuleGeometry(0.17, alt * 0.3, 6, 12), roupa, 0, alt * 0.56, 0).scale.z = 0.65;
  add(new THREE.SphereGeometry(0.15, 16, 12), pele, 0, alt * 0.9, 0);
  for (const sx of [-1, 1]) { add(new THREE.CapsuleGeometry(0.065, alt * 0.38, 6, 8), calca, sx * 0.09, alt * 0.22, 0); add(new THREE.CapsuleGeometry(0.05, alt * 0.3, 6, 8), roupa, sx * 0.22, alt * 0.55, 0).rotation.z = sx * 0.12; }
  const fc = document.createElement('canvas'); fc.width = fc.height = 64; const fx = fc.getContext('2d'); fx.fillStyle = '#000'; fx.beginPath(); fx.ellipse(22, 30, 6, 8, 0, 0, 7); fx.ellipse(42, 30, 6, 8, 0, 0, 7); fx.fill();
  const rosto = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.27), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(fc), transparent: true, depthWrite: false })); rosto.position.set(0, alt * 0.9, 0.152); s.add(rosto);
  return C.det(s);
}

// =================================== BAIRRO ===================================
export async function bairro(scene) {
  const C = novo(scene);
  C.chao('grama', 120, 30, 0);
  C.chao('asfalto', 64, 10, 0.02, 0, 0, 7.2);
  const faixa = M(0xe8c23a, { emissive: 0x2a2000 });
  for (let z = -30; z < 30; z += 2.6) C.caixa(0, 0.03, z, 0.2, 0.01, 1.2, faixa).userData.chao = true;
  for (const sx of [-1, 1]) { const c = C.caixa(sx * 4.7, 0.09, 0, 2.2, 0.18, 64, matTex('concreto', 4)); c.userData.chao = true; }
  // casas dos dois lados, de frente para a rua
  const casas = ['casas/1Story_GableRoof_Mat', 'casas/2Story_GableRoof_Mat', 'casas/1Story_RoundRoof_Mat', 'casas/2Story_Slim_Mat', 'casas/1Story_Mat', 'casas/2Story_Mat'];
  let k = 0; const ps = [];
  for (const z of [-13, 0, 13]) for (const sx of [-1, 1]) { const rel = casas[k++ % casas.length]; ps.push(C.por(rel, sx * 11, z, ALTURAS.casa, { ry: sx > 0 ? -Math.PI / 2 : Math.PI / 2 }).then(o => C.princ(C.det(o)))); }
  await Promise.all(ps);
  // luz da varanda de cada casa (acende à noite)
  for (const z of [-13, 0, 13]) for (const sx of [-1, 1]) { const lp = C.caixa(sx * 7.6, 2.2, z, 0.12, 0.2, 0.2, M(0xffe0a0)); C.brilho(lp, 2.4); C.luzNoite(sx * 7.2, 2.2, z, 0xffcf8a, 6, 7); }
  for (const z of [-18, -6, 6, 18]) { poste(C, 4.9, z, -1); poste(C, -4.9, z + 6, 1); }
  carro(C, 2.4, 5, Math.PI, 0x7a2b22); carro(C, -2.4, -9, 0, 0x2e4a6a);
  // caixas de correio, lixeiras, hidrante, placa, arbustos, árvores de quintal, cercas
  for (const [x, z] of [[6.2, -9], [-6.2, -4], [6.2, 4], [-6.2, 9]]) { const s = C.grupo(x, z); const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), M(0x4a3420)); p.position.y = 0.55; s.add(p); const cx = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.45), M(0x2a4a8a)); cx.position.y = 1.2; s.add(cx); C.det(s); }
  await Promise.all([C.por('objetos/Trashcan', 6.0, -2, 1.0), C.por('objetos/Trashcan', -6.0, 2.5, 1.0), C.por('objetos/Trashcan', 6.0, 11, 1.0)].map(p => p.then(o => C.det(o))));
  const hid = C.cil(5.9, 0.4, 7.5, 0.13, 0.15, 0.8, M(0xc0302a)); C.det(hid);
  C.det(await C.por('rua/Sign_Stop', 5.9, 15.5, 2.6, { ry: -Math.PI / 2 }));
  for (const [x, z] of [[8.4, -6.5], [-8.4, -6.5], [8.4, 6.5], [-8.4, 6.5], [8.6, 19], [-8.6, -19]]) C.det(await C.por('natureza/Bush_1', x, z, 1.0));
  for (const [x, z] of [[15.5, -6.5], [-15.5, 6.5], [15.5, 19], [-15.5, -19]]) C.det(await C.por('natureza/CommonTree_1', x, z, 7));
  const picket = M(0xeeeee6);
  for (const sx of [-1, 1]) for (const z0 of [-17, 4]) { const s = C.grupo(sx * 6.9, z0); for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.1), picket); r.position.set(0, 0.4, i * 0.5); s.add(r); } const tv = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 5), picket); tv.position.set(0, 0.6, 2.25); s.add(tv); C.det(s); }
  await arvoreAnel(C, { r0: 24, r1: 38, n: 26, tipos: ['PineTree_1', 'PineTree_2', 'PineTree_3', 'CommonTree_3'], sem: 3, alt: [7, 10] });
  const marcas = { rua: { x: 0, z: 0 }, faixa: { x: 0, z: -4 }, calcada: { x: -4.2, z: 4 }, frente_casa: { x: 5.4, z: -2 }, poste: { x: 3.4, z: 9 }, arvores: { x: 0, z: -24 }, fim_rua: { x: 0, z: -18 } };
  return C.fim(marcas, { pos: [6, 6, 16], olha: [0, 1.5, 0] });
}

// =================================== FLORESTA ===================================
export async function floresta(scene) {
  const C = novo(scene);
  C.chao('piso_floresta', 120, 24, 0);
  C.chao('terra', 22, 6, 0.015, -1.5, 6, 2.2);
  // torre de vigia de madeira (assunto principal)
  const tw = C.grupo(6, -7); const mad = M(0x5a4330, { roughness: 1 }); const h = 6;
  for (const [px, pz] of [[1.2, 1.2], [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]]) { const pe = new THREE.Mesh(new THREE.BoxGeometry(0.22, h, 0.22), mad); pe.position.set(px, h / 2, pz); pe.castShadow = true; tw.add(pe); }
  for (const yy of [2, 4]) for (const [ax, az, rr] of [[0, 1.2, 0], [0, -1.2, 0], [1.2, 0, Math.PI / 2], [-1.2, 0, Math.PI / 2]]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), mad); tr.position.set(ax, yy, az); tr.rotation.y = rr; tw.add(tr); }
  const plat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 3.2), mad); plat.position.y = h; tw.add(plat);
  const cabine = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.7, 2.7), M(0x6a5238)); cabine.position.y = h + 0.95; cabine.castShadow = true; tw.add(cabine);
  const teto = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), M(0x3a2c1e)); teto.position.y = h + 2.4; teto.rotation.y = Math.PI / 4; tw.add(teto);
  const jan = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), M(0xffe08a)); jan.position.set(0, h + 1.0, 1.36); tw.add(jan); C.brilho(jan, 2.0);
  for (let i = 0; i < 10; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.07, 0.25), mad); d.position.set(1.6, 0.3 + i * 0.58, 1.6 - i * 0.12); tw.add(d); }
  C.luzNoite(6, h + 1.0, -5.2, 0xffd28a, 9, 10); C.princ(C.det(tw));
  // fogueira com pedras, barraca, mochila, troncos, tocos, pedras, cogumelos, placa, lanterna, machado
  const fog = await C.por('objetos/Bonfire', -1, 1, 0.55); C.princ(C.det(fog));
  const chama = C.add(new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 9), M(0xffa040))); chama.position.set(-1, 0.55, 1); C.brilho(chama, 3.2); C.luzNoite(-1, 0.9, 1, 0xff8a3a, 12, 11);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; C.det(await C.por('natureza/Rock_' + (1 + (i % 5)), -1 + Math.cos(a) * 0.75, 1 + Math.sin(a) * 0.75, 0.22)); if (i > 1) C.n--; }
  C.princ(C.det(await C.por('objetos/Tent', -4.5, -2.5, ALTURAS.barraca, { ry: 0.6 })));
  C.det(await C.por('objetos/Backpack', -3.2, -0.8, 0.5, { ry: 0.4 }));
  C.det(await C.por('natureza/WoodLog', 1.1, 2.6, 0.45, { ry: 1.2 })); C.det(await C.por('natureza/WoodLog_Moss', -3.4, 3.6, 0.45, { ry: 0.2 }));
  C.det(await C.por('natureza/TreeStump', 3.6, 1.0, 0.6)); C.det(await C.por('natureza/TreeStump_Moss', -6.5, 5, 0.6));
  C.det(await C.por('objetos/Axe', 3.6, 1.3, 0.75, { ry: 0.3, y: 0.55 }));
  for (const [x, z] of [[4.5, 4.5], [-6, -6], [2, -4], [-7.5, 1.5]]) C.det(await C.por('natureza/Rock_Moss_' + (1 + Math.floor(Math.abs(x)) % 4), x, z, 0.7));
  for (const [x, z] of [[5.5, 3], [-5.5, 6.5], [7.5, -1.5], [-2.5, -5.5]]) C.det(await C.por('natureza/Bush_2', x, z, 1.0));
  for (const [x, z] of [[3.2, 3.2], [3.5, 3.0], [-6.2, 4.6]]) { const s = C.grupo(x, z); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.14, 8), M(0xeeeedd)); t.position.y = 0.07; s.add(t); const ch = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8, 0, 6.3, 0, Math.PI / 2), M(0xb02a1a)); ch.position.y = 0.13; s.add(ch); C.det(s); }
  const placa = C.grupo(-0.4, 9.5, 0.2); const pp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.1), mad); pp.position.y = 0.8; placa.add(pp); const tb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 0.06), M(0x7a5a34)); tb.position.y = 1.4; placa.add(tb); C.princ(C.det(placa));
  lanterna(C, 2.6, 6.5, 0xffd08a, 2.0);
  await arvoreAnel(C, { r0: 11, r1: 34, n: 42, tipos: ['PineTree_1', 'PineTree_2', 'PineTree_3', 'PineTree_4', 'PineTree_5', 'CommonTree_1'], sem: 5, alt: [6, 10] });
  const marcas = { clareira: { x: 1.2, z: 3.4 }, trilha: { x: -1.5, z: 8.5 }, entre_arvores: { x: -7.5, z: -7 }, pe_torre: { x: 3.0, z: -1.6 }, fundo: { x: 0, z: -9 }, toco: { x: 2.2, z: -0.6 } };
  return C.fim(marcas, { pos: [3, 4.5, 14], olha: [1, 2, -3] });
}

// =================================== ESTRADA ===================================
export async function estrada(scene) {
  const C = novo(scene);
  C.chao('grama', 120, 30, 0);
  C.chao('cascalho', 72, 6, 0.012, 0, 0, 9);
  C.chao('asfalto', 72, 10, 0.02, 0, 0, 6);
  const branca = M(0xe8e4d8);
  for (let z = -34; z < 34; z += 3.2) C.caixa(0, 0.03, z, 0.16, 0.01, 1.4, branca).userData.chao = true;
  for (const sx of [-1, 1]) C.caixa(sx * 2.85, 0.03, 0, 0.12, 0.01, 72, branca).userData.chao = true;
  // postes de fiação de madeira com fios
  const mad = M(0x5a4330, { roughness: 1 });
  const topos = [];
  for (let i = 0; i < 6; i++) { const z = -25 + i * 10; const s = C.grupo(-5.6, z); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 7.5, 8), mad); p.position.y = 3.75; p.castShadow = true; s.add(p); const cr = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), mad); cr.position.y = 7.0; s.add(cr); C.princ(C.det(s)); topos.push(new THREE.Vector3(-5.6, 7.05, z)); }
  for (let i = 0; i < topos.length - 1; i++) for (const dx of [-0.65, 0.65]) { const a = topos[i].clone().add(new THREE.Vector3(dx, 0, 0)), b = topos[i + 1].clone().add(new THREE.Vector3(dx, 0, 0)); const f = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, a.distanceTo(b), 4), M(0x111111)); f.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.35, 0)); f.lookAt(b.clone().add(new THREE.Vector3(0, -0.35, 0))); f.rotateX(Math.PI / 2); C.g.add(f); }
  // ponto de ônibus (assunto) com banco e lâmpada
  const pt = C.grupo(5.8, -4, -Math.PI / 2); const vid = M(0x9ab4c0, { transparent: true, opacity: 0.45 }), met = M(0x5a5e62, { roughness: 0.5 });
  const teto = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.5), met); teto.position.y = 2.4; pt.add(teto);
  for (const sx of [-1.5, 1.5]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.08), met); c.position.set(sx, 1.2, -0.65); pt.add(c); }
  const fundoV = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.9, 0.04), vid); fundoV.position.set(0, 1.25, -0.68); pt.add(fundoV);
  const banco = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.45), M(0x7a5a34)); banco.position.set(0, 0.5, -0.4); pt.add(banco);
  const lp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.2), M(0xeaf2ff)); lp.position.set(0, 2.33, 0); pt.add(lp); C.brilho(lp, 2.2); C.luzNoite(5.8, 2.2, -4, 0xeaf2ff, 7, 7);
  C.princ(C.det(pt));
  carro(C, 4.1, 9, Math.PI + 0.06, 0x8a8a7a);
  C.det(await C.por('rua/Sign_Triangle', 3.8, 16, 2.4, { ry: -Math.PI / 2 })); C.det(await C.por('rua/Sign_NoParking', 3.8, -12, 2.4, { ry: -Math.PI / 2 }));
  const ml = C.grupo(-3.8, 14); const mp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), met); mp.position.y = 0.9; ml.add(mp); const mt = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.05), M(0x1e6a3a)); mt.position.y = 1.7; ml.add(mt); C.det(ml);
  // guard-rail
  const gr = C.grupo(3.6, -22); for (let i = 0; i < 7; i++) { const po = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), met); po.position.set(0, 0.4, i * 1.6); gr.add(po); } const lam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 9.8), met); lam.position.set(-0.05, 0.62, 4.8); gr.add(lam); C.det(gr);
  // cercas de madeira, lixeira, caixa de correio, postes de luz
  for (const [x, z] of [[-7.5, -16], [-7.5, 4], [7.5, 14]]) { const s = C.grupo(x, z); for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), mad); r.position.set(0, 0.55, i * 1.4); s.add(r); } for (const yy of [0.45, 0.9]) { const tv = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 7), mad); tv.position.set(0, yy, 3.5); s.add(tv); } C.det(s); }
  C.det(await C.por('objetos/Trashcan', 4.4, -1.6, 1.0));
  const cc = C.grupo(-4, -6); const ccp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), mad); ccp.position.y = 0.55; cc.add(ccp); const ccx = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.5), M(0x5a5a5a)); ccx.position.y = 1.2; cc.add(ccx); C.det(cc);
  for (const z of [-14, 22]) poste(C, 4.0, z, -1);
  await arvoreAnel(C, { r0: 13, r1: 36, n: 40, tipos: ['PineTree_1', 'PineTree_3', 'CommonTree_1', 'CommonTree_3', 'BirchTree_1'], sem: 9, alt: [6, 10] });
  const marcas = { meio: { x: 0, z: 0 }, vindo: { x: 0.8, z: 12 }, indo: { x: -0.8, z: -12 }, acostamento: { x: -3.6, z: 2 }, ponto: { x: 3.6, z: -4 }, curva: { x: 0, z: -24 }, beira_mato: { x: -8.5, z: -8 } };
  return C.fim(marcas, { pos: [4, 4, 18], olha: [0, 1.5, 0] });
}

// =================================== CASA (INTERIOR) ===================================
export async function casa_interior(scene) {
  const C = novo(scene);
  const X = 5.5, Z = 4.8, H = 3.0;
  C.chao('madeira', 2 * Z, 3, 0, 0, 0, 2 * X).userData.chao = true;
  C.chao('grama', 80, 20, -0.01); // lá fora
  const parede = M(0xd8c8a8, { side: THREE.FrontSide }), rodape = M(0x6a4a2a);
  const pared = (x, z, w, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, H), parede); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; m.userData.parede = true; C.g.add(m); const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 0.04), rodape); r.position.set(x, 0.06, z); r.rotation.y = ry; r.userData.parede = true; C.g.add(r); };
  pared(0, -Z, 2 * X, 0); pared(0, Z, 2 * X, Math.PI); pared(-X, 0, 2 * Z, Math.PI / 2); pared(X, 0, 2 * Z, -Math.PI / 2);
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(2 * X, 2 * Z), M(0xeeeae0)); teto.rotation.x = Math.PI / 2; teto.position.y = H; teto.userData.parede = true; C.g.add(teto);
  // sala (esquerda), cozinha (direita fundo), quarto (direita frente)
  C.princ(C.det(await C.por('interior/Couch_Large1', -3.4, -3.8, 0.95)));
  C.det(await C.por('interior/Table_RoundSmall', -3.4, -2.5, 0.5));
  C.det(await C.por('interior/Carpet_1', -3.0, -2.2, 0.03));
  const tvm = C.grupo(-5.2, -0.6, Math.PI / 2); const rack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.4), M(0x3a2a1a)); rack.position.y = 0.25; tvm.add(rack); const tv = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.06), M(0x101014)); tv.position.y = 0.9; tvm.add(tv); const tela = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.6), M(0x6a90b8)); tela.position.set(0, 0.9, 0.035); tvm.add(tela); C.brilho(tela, 1.4); C.princ(C.det(tvm));
  C.det(await C.por('interior/Bookshelf', -4.9, 2.6, 1.9, { ry: Math.PI / 2 }));
  C.det(await C.por('interior/Light_Floor1', -4.6, -4.2, 1.6)); C.luzNoite(-4.6, 1.5, -4.0, 0xffd28a, 6, 6);
  C.det(await C.por('interior/Houseplant_3', -1.4, -4.2, 1.0)); C.det(await C.por('interior/Houseplant_1', 4.8, 4.2, 0.8));
  C.princ(C.det(await C.por('interior/Kitchen_Fridge', 4.9, -4.1, 1.85)));
  C.det(await C.por('interior/Kitchen_Oven', 3.6, -4.2, 0.95)); C.det(await C.por('interior/Kitchen_Sink', 2.4, -4.2, 0.95)); C.det(await C.por('interior/Kitchen_Cabinet1', 1.2, -4.2, 0.95));
  C.det(await C.por('interior/Chair_1', 2.0, -1.8, 0.9, { ry: 0.4 })); C.det(await C.por('interior/Table_RoundLarge', 2.8, -1.4, 0.78));
  C.princ(C.det(await C.por('interior/Bed_Single', 4.4, 2.6, 0.62, { ry: -Math.PI / 2 })));
  C.det(await C.por('interior/NightStand_1', 4.9, 1.0, 0.55)); C.det(await C.por('interior/Light_Desk', 4.9, 1.0, 0.4, { y: 0.55 }));
  C.det(await C.por('interior/Door_1', 0.6, 4.75, 2.2, { ry: Math.PI }));
  // janela no fundo (vidro que mostra o céu: claro de dia, azul-escuro à noite)
  const janFr = C.caixa(-1.2, 1.7, -Z + 0.03, 1.8, 1.3, 0.06, M(0xf2f2ee)); janFr.userData.parede = true;
  const vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.1), new THREE.MeshBasicMaterial({ color: 0xbfe0ff })); vidro.position.set(-1.2, 1.7, -Z + 0.07); C.g.add(vidro); C.det(janFr);
  // quadros e relógio
  for (const [x, z, ry, cor] of [[-5.45, 0.9, Math.PI / 2, 0x3a6a8a], [5.45, -1.4, -Math.PI / 2, 0x8a4a3a]]) { const q = C.caixa(x, 1.8, z, 0.04, 0.6, 0.8, M(cor), 0); q.rotation.y = ry; C.det(q); }
  const rel = C.cil(1.8, 2.3, -Z + 0.05, 0.22, 0.22, 0.05, M(0xf4f0e6), 20); rel.rotation.x = Math.PI / 2; C.det(rel);
  // luz de teto: sempre acesa (branca de dia, amarela à noite)
  C.det(await C.por('interior/Light_Ceiling1', 0, 0, 0.3, { y: H - 0.3 }));
  C.luzSempre(0, H - 0.4, 0, [0xfff8f0, 6], [0xffd28a, 11], 14);
  C.luzSempre(2.5, H - 0.4, 2, [0xfff8f0, 3], [0xffcf80, 5], 9);
  const ajustarOrig = C.fim; // vidro troca de cor com a hora
  const r = C.fim({ sala: { x: -2.2, z: 0.4 }, sofa: { x: -2.9, z: -2.4 }, cozinha: { x: 2.4, z: -2.5 }, quarto: { x: 2.0, z: 2.2 }, janela: { x: -1.2, z: -2.6 }, porta: { x: 0.6, z: 2.9 } },
    { pos: [3.2, 2.3, 3.0], olha: [-1.5, 1.0, -2] },
    { limites: { xmin: -X, xmax: X, zmin: -Z, zmax: Z, ymax: H }, interior: true });
  const base = r.ajustarLuz; r.ajustarLuz = (n) => { base(n); vidro.material.color.set(n ? 0x14203e : 0xbfe0ff); };
  return r;
}

// =================================== CEMITÉRIO ===================================
export async function cemiterio(scene) {
  const C = novo(scene);
  C.chao('grama_escura', 120, 30, 0);
  C.chao('terra', 26, 6, 0.015, 0, 0, 2.4);
  const pedra = M(0x8a8678, { roughness: 1 }), pedraEsc = M(0x6a665c, { roughness: 1 }), r = semente(13);
  // lápides variadas em fileiras (deixa o caminho livre)
  for (let i = 0; i < 18; i++) {
    const lado = i % 2 ? 1 : -1, fila = Math.floor(i / 2), x = lado * (2.6 + (fila % 3) * 2.0), z = -8 + Math.floor(fila / 3) * 4.2 + (r() - 0.5) * 0.6;
    const s = C.grupo(x, z, (r() - 0.5) * 0.25); const tipo = i % 3;
    if (tipo === 0) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.8, 0.16), pedra); b.position.y = 0.4; s.add(b); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.16, 16, 1, false, 0, Math.PI), pedra); t.rotation.set(Math.PI / 2, 0, Math.PI / 2); t.position.y = 0.8; s.add(t); }
    else if (tipo === 1) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.14), pedraEsc); v.position.y = 0.55; s.add(v); const hz = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.12), pedraEsc); hz.position.y = 0.8; s.add(hz); }
    else { const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.2), pedra); b.position.y = 0.28; s.add(b); }
    const cova = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 1.5), M(0x3a4a30)); cova.position.set(0, 0.06, 0.85); s.add(cova);
    s.rotation.z = (r() - 0.5) * 0.12; C.det(s);
    if (i % 5 === 0) { const v = C.cil(x + 0.25, 0.1, z + 0.3, 0.035, 0.035, 0.2, M(0xf2ead8)); const ch = C.esf(x + 0.25, 0.25, z + 0.3, 0.035, M(0xffb040)); C.brilho(ch, 3.0); C.luzNoite(x + 0.25, 0.4, z + 0.3, 0xffa050, 1.6, 3); }
  }
  // mausoléu (assunto)
  const mz = C.grupo(5.5, -12); const corpo = new THREE.Mesh(new THREE.BoxGeometry(4, 3.2, 3.6), pedra); corpo.position.y = 1.6; corpo.castShadow = true; mz.add(corpo);
  const front = new THREE.Mesh(new THREE.ConeGeometry(2.9, 1.3, 4), pedraEsc); front.position.y = 3.85; front.rotation.y = Math.PI / 4; front.scale.set(1, 1, 0.75); mz.add(front);
  for (const sx of [-1.4, 1.4]) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3, 12), M(0xa8a498)); col.position.set(sx, 1.5, 1.95); mz.add(col); }
  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.06), M(0x1a1a1e)); porta.position.set(0, 1.1, 1.82); mz.add(porta); C.princ(C.det(mz));
  // cruz grande
  const cg = C.grupo(-4.5, -11); const cv = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.3), pedra); cv.position.y = 1.6; cg.add(cv); const ch2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 0.28), pedra); ch2.position.y = 2.4; cg.add(ch2); const bs = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 1.0), pedraEsc); bs.position.y = 0.2; cg.add(bs); C.princ(C.det(cg));
  // cerca de ferro e portão
  const ferro = M(0x1e1e22, { roughness: 0.6 });
  const cercaFerro = (x0, z0, x1, z1) => { const s = new THREE.Group(); const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 0.35); for (let i = 0; i <= n; i++) { const t = i / n; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6), ferro); b.position.set(x0 + (x1 - x0) * t, 0.7, z0 + (z1 - z0) * t); s.add(b); } for (const yy of [0.3, 1.25]) { const tv = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, L), ferro); tv.position.set((x0 + x1) / 2, yy, (z0 + z1) / 2); tv.rotation.y = Math.atan2(x1 - x0, z1 - z0); s.add(tv); } C.g.add(s); return C.det(s); };
  cercaFerro(-11, 12, -1.8, 12); cercaFerro(1.8, 12, 11, 12); cercaFerro(-11, 12, -11, -16); cercaFerro(11, 12, 11, -16);
  const portao = C.grupo(0, 12); for (const sx of [-1.8, 1.8]) { const pp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.6, 0.4), pedra); pp.position.set(sx, 1.3, 0); portao.add(pp); } const arco = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.06, 6, 20, Math.PI), ferro); arco.position.y = 2.5; portao.add(arco); C.princ(C.det(portao));
  // árvores mortas, banco, flores, pá num túmulo novo, lanternas
  for (const [x, z, t] of [[8, 3, 'CommonTree_Dead_1'], [-8, -3, 'CommonTree_Dead_3'], [-8.5, 7, 'BirchTree_Dead_1'], [8.5, -6, 'Willow_Dead_1']]) C.det(await C.por('natureza/' + t, x, z, 6.5));
  C.det(await C.por('vila/Bench_1', -1.9, 5.5, 0.9, { ry: Math.PI / 2 }));
  for (const [x, z] of [[2.6, -7.2], [-4.6, -3.1], [4.6, 1.2]]) C.det(await C.por('natureza/Flowers', x, z, 0.35));
  const monte = C.add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 8, 0, 6.3, 0, Math.PI / 2), M(0x4a3a24))); monte.position.set(-6.6, 0, 3.2); monte.scale.set(0.7, 0.4, 1.3); C.det(monte);
  C.det(await C.por('objetos/Shovel', -5.6, 3.6, 1.1, { ry: 0.6 }));
  lanterna(C, -1.6, 8.5, 0xffc070, 2.4); lanterna(C, 1.6, -4.5, 0xffc070, 2.4); lanterna(C, 1.6, 2.5, 0xffc070, 2.4);
  await arvoreAnel(C, { r0: 18, r1: 36, n: 24, tipos: ['CommonTree_Dead_1', 'CommonTree_Dead_3', 'BirchTree_Dead_1', 'PineTree_4'], sem: 17, alt: [6, 9] });
  const marcas = { entrada: { x: 0, z: 9 }, entre_cruzes: { x: 0, z: 0 }, cruz_grande: { x: -2.2, z: -8 }, mausoleu: { x: 3.4, z: -6.4 }, fundo: { x: 0, z: -9 }, arvore_morta: { x: 6, z: 1.5 } };
  return C.fim(marcas, { pos: [4, 4, 15], olha: [0, 1.2, -4] });
}

// =================================== HOSPITAL (corredor) ===================================
export async function hospital(scene) {
  const C = novo(scene);
  const X = 3.6, Z = 15, H = 3.2;
  C.chao('ladrilho', 2 * Z, 10, 0, 0, 0, 2 * X).userData.chao = true;
  const parede = M(0xc8d6d0), faixa = M(0x6a9a8a);
  for (const [x, ry] of [[-X, Math.PI / 2], [X, -Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * Z, H), parede); m.position.set(x, H / 2, 0); m.rotation.y = ry; m.userData.parede = true; C.g.add(m); const fx = new THREE.Mesh(new THREE.PlaneGeometry(2 * Z, 0.25), faixa); fx.position.set(x * 0.998, 1.0, 0); fx.rotation.y = ry; fx.userData.parede = true; C.g.add(fx); }
  for (const [z, ry] of [[-Z, 0], [Z, Math.PI]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * X, H), parede); m.position.set(0, H / 2, z); m.rotation.y = ry; m.userData.parede = true; C.g.add(m); }
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(2 * X, 2 * Z), M(0xe8ece8)); teto.rotation.x = Math.PI / 2; teto.position.y = H; teto.userData.parede = true; C.g.add(teto);
  // luminárias do teto (sempre acesas; à noite mais frias e fracas)
  for (let z = -12; z <= 12; z += 4.8) { const pn = C.caixa(0, H - 0.04, z, 1.2, 0.05, 0.5, M(0xffffff)); pn.material.emissive = new THREE.Color(0xeaf4ff); pn.material.emissiveIntensity = 1.2; pn.userData.parede = true; C.det(pn); C.luzSempre(0, H - 0.3, z, [0xf4f8ff, 6], [0xcfe0ff, 4], 9); }
  // portas numeradas dos dois lados
  const placaNum = (txt) => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#2a4a5a'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#fff'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.fillText(txt, 64, 46); return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }); };
  let num = 101;
  for (const z of [-10, -4, 2, 8]) for (const sx of [-1, 1]) {
    C.det(await C.por('interior/Door_5', sx * (X - 0.05), z, 2.2, { ry: sx > 0 ? -Math.PI / 2 : Math.PI / 2 }));
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), placaNum(String(num++))); pl.position.set(sx * (X - 0.02), 2.45, z + 0.9); pl.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; C.g.add(pl);
  }
  // maca, cadeira de rodas, suporte de soro, cadeiras, lixeiras, planta, extintor, balcão, avisos, EXIT
  const maca = (x, z, ry) => { const s = C.grupo(x, z, ry); const met = M(0xb0b4b8, { roughness: 0.4 }); const col = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.16, 1.95), M(0xe8eef2)); col.position.y = 0.82; s.add(col); const trav = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.6), M(0xf6f6f6)); trav.position.set(0, 0.95, -0.7); s.add(trav); for (const [a, b] of [[0.3, 0.85], [-0.3, 0.85], [0.3, -0.85], [-0.3, -0.85]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6), met); p.position.set(a, 0.38, b); s.add(p); const rd = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M(0x222222)); rd.position.set(a, 0.05, b); s.add(rd); } return C.princ(C.det(s)); };
  maca(2.6, -6.5, 0); maca(-2.6, 5, 0.1);
  const cr = C.grupo(-2.6, -1.5, 0.6); const met = M(0x4a4e52, { roughness: 0.4 }); for (const sx of [-0.3, 0.3]) { const rd = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 16), met); rd.position.set(sx, 0.32, 0); rd.rotation.y = Math.PI / 2; cr.add(rd); } const ass = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.45), M(0x2a3a5a)); ass.position.y = 0.5; cr.add(ass); const enc = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), M(0x2a3a5a)); enc.position.set(0, 0.78, -0.22); cr.add(enc); C.det(cr);
  const soro = C.grupo(3.0, -5.2); const hs = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 6), met); hs.position.y = 0.9; soro.add(hs); const bolsa = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.04), M(0xd8eef8, { transparent: true, opacity: 0.8 })); bolsa.position.y = 1.65; soro.add(bolsa); C.det(soro);
  for (let i = 0; i < 4; i++) C.det(await C.por('interior/Chair_1', -3.0, 10.5 - i * 0.7, 0.85, { ry: Math.PI / 2 }));
  C.det(await C.por('interior/Trashcan_Small1', 3.1, 1.0, 0.5)); C.det(await C.por('interior/Trashcan_Small1', -3.1, -8.5, 0.5));
  C.det(await C.por('interior/Houseplant_2', 3.0, 12.8, 1.0));
  const ext = C.cil(3.42, 0.5, -1.5, 0.09, 0.09, 0.55, M(0xc02020)); C.det(ext);
  const balcao = C.grupo(2.5, 10.5); const tb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 3.0), M(0xd8d0c0)); tb.position.y = 0.52; balcao.add(tb); const tampo = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 3.1), M(0x6a5a4a)); tampo.position.y = 1.08; balcao.add(tampo); const mon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.45), M(0x14161a)); mon.position.set(-0.2, 1.3, 0); balcao.add(mon); C.princ(C.det(balcao));
  const aviso = C.caixa(-X + 0.04, 1.7, 1.0, 0.03, 0.8, 1.2, M(0x8a6a4a)); aviso.userData.parede = true; C.det(aviso);
  const exit = C.caixa(0, 2.75, -Z + 0.06, 0.8, 0.3, 0.05, M(0x20c060)); C.brilho(exit, 2.6); exit.material.emissiveIntensity = 1.6; exit.userData.base = 2.6; exit.userData.parede = true; C.det(exit);
  const jan = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), new THREE.MeshBasicMaterial({ color: 0xbfe0ff })); jan.position.set(0, 1.6, -Z + 0.05); C.g.add(jan);
  const r = C.fim({ corredor: { x: 0, z: 3.5 }, maca: { x: 1.0, z: -6.5 }, fundo: { x: 0, z: -11 }, porta: { x: -1.6, z: -4 }, entrada: { x: 0, z: 12 }, recepcao: { x: 0.4, z: 9.5 } },
    { pos: [1.4, 1.9, 12.5], olha: [0, 1.2, 0] },
    { limites: { xmin: -X, xmax: X, zmin: -Z, zmax: Z, ymax: H }, interior: true });
  const base = r.ajustarLuz; r.ajustarLuz = (n) => { base(n); exit.material.emissiveIntensity = 2.6; jan.material.color.set(n ? 0x0e1830 : 0xbfe0ff); };
  return r;
}

// =================================== VILA (medieval) ===================================
export async function vila(scene) {
  const C = novo(scene);
  C.chao('grama', 120, 30, 0);
  const praca = new THREE.Mesh(new THREE.CircleGeometry(7.5, 40), matTex('pedra', 6)); praca.rotation.x = -Math.PI / 2; praca.position.y = 0.02; praca.userData.chao = true; C.g.add(praca);
  for (const [x, z, w, d] of [[0, -11, 2.6, 8], [0, 11, 2.6, 8], [-11, 0, 8, 2.6], [11, 0, 8, 2.6]]) C.chao('terra', d, 3, 0.015, x, z, w);
  C.princ(C.det(await C.por('vila/Well', 0, 0, 1.25)));
  const casas = [['vila/House_1', -11, -7, Math.PI / 4], ['vila/House_2', 11, -7, -Math.PI / 4], ['vila/House_3', -11.5, 6.5, Math.PI * 0.75], ['vila/House_4', 16.5, 2, -Math.PI * 0.75]];
  for (const [rel, x, z, ry] of casas) C.princ(C.det(await C.por(rel, x, z, rel.endsWith('House_4') ? 4.4 : ALTURAS.casa_vila, { ry })));
  C.princ(C.det(await C.por('vila/Mill', -17, 15, ALTURAS.moinho, { ry: -Math.PI / 3 })));
  C.princ(C.det(await C.por('vila/Inn', 15, 14, 6.2, { ry: -Math.PI * 0.8 })));
  C.princ(C.det(await C.por('vila/Bell_Tower', 0, -19, 9)));
  C.princ(C.det(await C.por('vila/MarketStand_1', -4.2, 4.6, 2.4, { ry: Math.PI * 0.85 })));
  C.princ(C.det(await C.por('vila/MarketStand_2', 4.2, 4.6, 2.3, { ry: -Math.PI * 0.85 })));
  C.princ(C.det(await C.por('vila/Cart', 5.2, -2.6, 1.7, { ry: 0.5 })));
  for (const [x, z] of [[-5.6, 2.6], [-6.1, 3.2]]) C.det(await C.por('vila/Barrel', x, z, 0.9));
  C.det(await C.por('vila/Crate', 6.0, 2.2, 0.75, { ry: 0.3 })); C.det(await C.por('vila/Crate', 6.6, 2.9, 0.6, { ry: 0.8 }));
  C.det(await C.por('vila/Hay', 7.2, -4.8, 1.1)); C.det(await C.por('vila/Bench_2', -3.6, -3.9, 0.85, { ry: 0.6 }));
  C.det(await C.por('vila/Cauldron', -2.6, -6.2, 0.8));
  for (const [x, z] of [[-9.5, -1.5], [9.5, 2.5], [-3, 9.2]]) C.det(await C.por('natureza/Flowers', x, z, 0.35));
  for (const [x0, z0, ry] of [[-15, -2, 0], [23, -2, 0]]) { const s = C.grupo(x0, z0, ry); const mad = M(0x6a4a2e); for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), mad); p.position.set(0, 0.5, i * 1.3); s.add(p); } for (const yy of [0.35, 0.8]) { const tv = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 6.5), mad); tv.position.set(0, yy, 3.25); s.add(tv); } C.det(s); }
  for (const [x, z] of [[-5.8, -5.8], [5.8, -5.8], [-5.8, 6.4], [5.8, 6.4]]) lanterna(C, x, z, 0xffb860, 2.6);
  for (const [x, z, ry, s] of [[-2.8, 3.4, 2.4, 11], [2.4, 3.0, -1.0, 23], [-1.6, -2.4, 0.8, 37], [3.6, -1.0, 2.2, 51], [-7.6, 0.5, 1.5, 61]]) figurante(C, x, z, ry, s);
  await arvoreAnel(C, { r0: 24, r1: 38, n: 22, tipos: ['CommonTree_1', 'CommonTree_3', 'PineTree_2', 'Willow_1'], sem: 21, alt: [6, 9] });
  const marcas = { praca: { x: 0, z: 3.2 }, poco: { x: 1.8, z: 1.4 }, moinho: { x: -9, z: 12 }, taverna: { x: 7.6, z: 11.2 }, mercado: { x: 0, z: 2.6 }, casa: { x: -6.2, z: -3.2 }, alto: { x: 0, z: 1.5 } };
  return C.fim(marcas, { pos: [7, 6, 13], olha: [0, 1.5, -2] });
}

// =================================== TEMPLO ORIENTAL ===================================
export async function templo_oriental(scene) {
  const C = novo(scene);
  C.chao('grama', 120, 30, 0);
  const patio = new THREE.Mesh(new THREE.PlaneGeometry(14, 18), matTex('pedra', 7)); patio.rotation.x = -Math.PI / 2; patio.position.set(0, 0.02, -2); patio.userData.chao = true; C.g.add(patio);
  const verm = M(0xc8372d), vermEsc = M(0x8a2a1a), dour = M(0xe0b040, { roughness: 0.5, metalness: 0.3 }), pedra = M(0x9a968a);
  // pagode de 3 andares com beirais largos
  const pg = C.grupo(0, -10);
  const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 7), pedra); base.position.y = 0.4; pg.add(base);
  for (let i = 0; i < 3; i++) {
    const w = 5.2 - i * 1.2, y = 0.8 + i * 2.2;
    const parede = new THREE.Mesh(new THREE.BoxGeometry(w, 1.8, w), verm); parede.position.y = y + 0.9; parede.castShadow = true; pg.add(parede);
    const tel = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.45, w * 0.95, 0.55, 4, 1), vermEsc); tel.rotation.y = Math.PI / 4; tel.position.y = y + 2.05; pg.add(tel);
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), dour); p.position.set(sx * w * 0.66, y + 1.9, sz * w * 0.66); pg.add(p); }
  }
  const topo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.6, 8), dour); topo.position.y = 8.2; pg.add(topo);
  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.06), M(0x3a1a12)); porta.position.set(0, 1.6, 2.62); pg.add(porta);
  C.princ(C.det(pg));
  for (let i = 0; i < 4; i++) { const d = C.caixa(0, 0.1 + i * 0.18, -6.0 + i * -0.0 + 0.45 * (3 - i) * 0 , 3.2, 0.2, 0.5, pedra); d.position.z = -5.8 - i * 0.45; d.position.y = 0.1 + i * 0.18; d.userData.chao = true; }
  // torii
  const to = C.grupo(0, 6.5); for (const sx of [-2.4, 2.4]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.2, 12), verm); c.position.set(sx, 2.1, 0); c.castShadow = true; to.add(c); }
  const kasagi = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.32, 0.5), M(0x1a1a1a)); kasagi.position.y = 4.35; to.add(kasagi); const nuki = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 0.3), verm); nuki.position.y = 3.6; to.add(nuki); C.princ(C.det(to));
  // lago e ponte vermelha em arco
  const lago = new THREE.Mesh(new THREE.CircleGeometry(3.4, 32), M(0x1e3a4a, { roughness: 0.2, metalness: 0.2 })); lago.rotation.x = -Math.PI / 2; lago.position.set(7.5, 0.03, 1); lago.userData.chao = true; C.g.add(lago);
  const pt = C.grupo(7.5, 1, Math.PI / 2); for (let i = 0; i < 9; i++) { const t = (i / 8) * Math.PI; const tb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 1.6), verm); tb.position.set(-3.2 + i * 0.8, 0.25 + Math.sin(t) * 0.9, 0); tb.rotation.z = Math.cos(t) * -0.6; pt.add(tb); } C.princ(C.det(pt));
  // lanternas de pedra (acendem à noite)
  for (const [x, z] of [[-3.2, -4.5], [3.2, -4.5], [-3.2, 2], [3.2, 2]]) { const s = C.grupo(x, z); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.9, 8), pedra); b.position.y = 0.45; s.add(b); const cx = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.5), M(0xffe0a0)); cx.position.y = 1.12; s.add(cx); C.brilho(cx, 2.2); const tp = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.35, 4), pedra); tp.position.y = 1.5; tp.rotation.y = Math.PI / 4; s.add(tp); C.luzNoite(x, 1.1, z, 0xffcf80, 6, 7); C.det(s); }
  // lanternas de papel vermelhas num varal
  const varal = C.grupo(0, 3.2); const fio = new THREE.Mesh(new THREE.BoxGeometry(6, 0.02, 0.02), M(0x111111)); fio.position.y = 3.3; varal.add(fio);
  for (let i = 0; i < 5; i++) { const lp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), M(0xd83a2a)); lp.scale.y = 1.3; lp.position.set(-2.4 + i * 1.2, 2.95, 0); varal.add(lp); C.brilho(lp, 1.8); } C.det(varal);
  C.luzNoite(0, 2.8, 3.2, 0xff6a4a, 6, 8);
  // cerejeiras, bambus, incensário, sino, estátua, pedras, muretas
  for (const [x, z] of [[-6, -6], [6, -7], [-6.5, 3], [-4.5, 9]]) { const s = C.grupo(x, z); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.6, 8), M(0x4a2e22)); tr.position.y = 1.3; s.add(tr); const rr = semente(Math.round(x * 13 + z)); for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.75 + rr() * 0.3, 12, 10), M(0xf2a8c0)); f.position.set((rr() - 0.5) * 1.6, 2.7 + rr() * 0.8, (rr() - 0.5) * 1.6); f.castShadow = true; s.add(f); } C.det(s); }
  for (const [x, z] of [[-5.5, -1.5], [5.4, 7.2]]) { const s = C.grupo(x, z); const rr = semente(Math.round(x * 7 + z * 3)); for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.5 + rr() * 2, 6), M(0x5a8a3a)); b.position.set((rr() - 0.5) * 1.2, 2, (rr() - 0.5) * 1.2); b.rotation.z = (rr() - 0.5) * 0.15; s.add(b); } C.det(s); }
  C.det(await C.por('vila/Cauldron', 0, -3.0, 0.9));
  const sino = C.grupo(-4.2, -8.5); for (const sx of [-0.8, 0.8]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.6, 0.16), M(0x4a2e22)); c.position.set(sx, 1.3, 0); sino.add(c); } const vg = new THREE.Mesh(new THREE.BoxGeometry(2, 0.16, 0.2), M(0x4a2e22)); vg.position.y = 2.6; sino.add(vg); const sn = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 0.7, 14), dour); sn.position.y = 2.1; sino.add(sn); C.det(sino);
  const est = C.grupo(4.2, -8.5); const eb = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1), pedra); eb.position.y = 0.3; est.add(eb); const ec = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 12), pedra); ec.scale.y = 1.1; ec.position.y = 1.05; est.add(ec); const ecb = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), pedra); ecb.position.y = 1.72; est.add(ecb); C.det(est);
  for (const [x, z] of [[9.5, -2.2], [5.4, 3.6], [10, 3]]) C.det(await C.por('natureza/Rock_' + (2 + Math.round(x) % 4), x, z, 0.6));
  for (const [x, ry, L] of [[-7.2, 0, 16], [7.2, 0, 6]]) { const m = C.caixa(x, 0.45, x < 0 ? -2 : -8, 0.4, 0.9, L, M(0xe8e0d0)); C.det(m); }
  await arvoreAnel(C, { r0: 18, r1: 34, n: 22, tipos: ['PineTree_2', 'PineTree_4', 'CommonTree_3'], sem: 77, alt: [6, 9] });
  const marcas = { templo: { x: 0, z: -1.2 }, torii: { x: 0, z: 4.2 }, ponte: { x: 3.6, z: 1 }, escada: { x: -1.5, z: -1.3 }, jardim: { x: -5.4, z: 4.4 }, lanterna: { x: 1.8, z: -1.0 } };
  return C.fim(marcas, { pos: [6, 4.5, 14], olha: [0, 2, -4] });
}

export const ACABADOS = { bairro, floresta, estrada, casa_interior, cemiterio, hospital, vila, templo_oriental };
