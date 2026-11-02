// Mundo "caneta": como funciona a caneta esferografica (ideia do Pedro, issue #8).
// Dois lugares ligados por etapa: "mesa" (caneta escrevendo no papel, furinho do corpo, invento de 1938) e
// "ponta" (a ponta ampliada e cortada ao meio: esfera de aco, encaixe de latao com a borda dobrada, tinta no canal,
// esfera rolando no papel e levando a tinta).
// Etapas: escreve, ponta, encaixe, tinta, rola, grossa, furo, biro, final.
(() => {
const ETAPAS = ['escreve', 'ponta', 'encaixe', 'tinta', 'rola', 'grossa', 'furo', 'biro', 'final'];
const LUGAR = { escreve: 'mesa', ponta: 'ponta', encaixe: 'ponta', tinta: 'ponta', rola: 'ponta', grossa: 'ponta', furo: 'mesa', biro: 'mesa', final: 'mesa' };
const NP = 90;            // pontos do traco escrito no papel
const W3 = {};
const TINTA = 0x1d4fd8;

// traco "manuscrito" no papel (x, z), parametro u de 0 a 1
function traco(u) { const x = -3.2 + u * 6.4; return [x, 0.9 + Math.sin(u * 26) * 0.32 + Math.sin(u * 7) * 0.15]; }

function mesa(g) {
  uvMundo(box(30, 1, 18, tmat('madeira', { relevo: 1 }), 0, -0.5, -2, g), 4);
  box(8.5, 0.03, 11, mat(0xfbfbf7, { roughness: 0.9 }), 0, 0.015, 0.5, g);
  // linhas do caderno
  for (let i = 0; i < 12; i++) box(8.5, 0.005, 0.03, mat(0x9ec3e6), 0, 0.033, -4.2 + i * 0.85, g);
  box(0.03, 0.005, 11, mat(0xf08a8a), -3.6, 0.034, 0.5, g);
  // traco de tinta: segmentos que aparecem conforme a caneta anda
  W3.seg = [];
  const tm = mat(TINTA, { roughness: 0.4 });
  for (let i = 0; i < NP; i++) {
    const [x0, z0] = traco(i / NP), [x1, z1] = traco((i + 1) / NP), L = Math.hypot(x1 - x0, z1 - z0);
    const m = box(L + 0.03, 0.01, 0.07, tm, (x0 + x1) / 2, 0.04, (z0 + z1) / 2, g); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.castShadow = false;
    W3.seg.push(m);
  }
  // caneta: eixo +y, ponta na origem do grupo
  W3.caneta = grupo(g);
  const corpo = grupo(W3.caneta); W3.corpo = corpo;
  const vidro = new T3.MeshStandardMaterial({ color: 0xd6e6f2, roughness: 0.08, transparent: true, opacity: 0.55, depthWrite: false });
  const casca = new T3.Mesh(new T3.CylinderGeometry(0.42, 0.42, 11, 6), vidro); casca.position.y = 2.9 + 5.5; corpo.add(casca);
  const cone = new T3.Mesh(new T3.CylinderGeometry(0.4, 0.13, 2.3, 24), new T3.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.25, transparent: true, opacity: 0.6 })); cone.position.y = 0.6 + 1.15; corpo.add(cone);
  const latao = mat(0xd8b25a, { metalness: 0.9, roughness: 0.3 });
  const bico = cyl(0.04, 0.12, 0.55, latao, 16, corpo); bico.position.y = 0.3;
  const esfera = new T3.Mesh(new T3.SphereGeometry(0.045, 16, 10), mat(0xdfe4ea, { metalness: 1, roughness: 0.15 })); esfera.position.y = 0.03; corpo.add(esfera);
  // carga de tinta (tubo transparente com tinta azul que baixa)
  cyl(0.11, 0.11, 10.6, new T3.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }), 12, corpo).position.y = 2.2 + 5.3;
  W3.tintaTubo = cyl(0.09, 0.09, 1, mat(TINTA, { roughness: 0.3 }), 12, corpo); W3.tintaTubo.castShadow = false;
  W3.tampao = cyl(0.3, 0.3, 0.6, mat(0x1d4fd8, { roughness: 0.5 }), 16, corpo); W3.tampao.position.y = 13.9 + 0.3;
  // furinho no corpo (lado da frente, meio da caneta)
  W3.furoY = 7.5;
  W3.furo = new T3.Mesh(new T3.CircleGeometry(0.1, 20), mat(0x10151c)); W3.furo.position.set(0, W3.furoY, 0.37); corpo.add(W3.furo);
  // setas de ar entrando no furo
  W3.ar = [...Array(8)].map((_, i) => { const m = new T3.Mesh(new T3.ConeGeometry(0.06, 0.2, 10), new T3.MeshBasicMaterial({ color: 0x1f7bff })); m.rotation.x = -Math.PI / 2; corpo.add(m); m.userData = { f: i / 8 }; return m; });
  W3.caneta.rotation.set(-0.42, 0, -0.38);
  // caneta-tinteiro antiga com borrao (cena 1938)
  W3.antiga = grupo(g); W3.antiga.position.set(-2.4, 0.15, 3.8); W3.antiga.rotation.y = 0.5;
  const pena = cyl(0.2, 0.2, 5, mat(0x1a1a1a, { roughness: 0.3, metalness: 0.3 }), 16, W3.antiga); pena.rotation.z = Math.PI / 2;
  const nib = new T3.Mesh(new T3.ConeGeometry(0.2, 0.8, 16), latao); nib.rotation.z = Math.PI / 2; nib.position.x = 2.9; W3.antiga.add(nib);
  W3.borrao = new T3.Mesh(new T3.CircleGeometry(0.75, 28), mat(0x101a55, { roughness: 0.2 })); W3.borrao.rotation.x = -Math.PI / 2; W3.borrao.position.set(0.6, 0.036, 3.0); W3.borrao.scale.set(1.4, 0.8, 1); g.add(W3.borrao);
}

function ponta(g) {
  // tudo ampliado: esfera de raio 1 no centro; o encaixe de latao cortado ao meio (metade de tras + faces do corte)
  uvMundo(box(14, 0.4, 10, mat(0xfbfbf7, { roughness: 0.95 }), 0, -1.2, -2, g), 4);
  W3.papel = grupo(g);
  // fibras do papel que passam por baixo (mostram o movimento)
  W3.fibras = [...Array(36)].map((_, i) => { const m = box(0.5 + rnd(i) * 0.8, 0.02, 0.04, mat(0xe2ded2), 0, -0.99, (rnd(i * 3.3) - 0.5) * 4, W3.papel); m.rotation.y = (rnd(i * 5.5) - 0.5) * 0.6; m.userData = { f: rnd(i * 7.1) }; return m; });
  // trilha de tinta deixada no papel (cresce para a esquerda)
  W3.trilha = box(1, 0.03, 0.9, mat(TINTA, { roughness: 0.35 }), 0, -0.985, 0, g); W3.trilha.castShadow = false;

  const perfil = [[0.84, -0.6], [1.0, -0.68], [1.32, -0.35], [2.6, 6], [2.6, 9.5], [1.55, 9.5], [1.55, 7], [0.36, 6.6], [0.36, 1.2], [0.72, 0.75], [1.04, 0.2], [1.05, -0.2], [0.84, -0.55]];
  const latao = mat(0xd4ad55, { metalness: 0.85, roughness: 0.32, side: T3.DoubleSide });
  const lat = new T3.Mesh(new T3.LatheGeometry(perfil.map(([r, y]) => new T3.Vector2(r, y)), 48, Math.PI / 2, Math.PI), latao);
  lat.castShadow = true; g.add(lat);
  const corteMat = mat(0xe8c870, { metalness: 0.6, roughness: 0.45 });
  W3.borda = [];
  for (const sx of [1, -1]) {
    const sh = new T3.Shape(perfil.map(([r, y]) => new T3.Vector2(sx * r, y)));
    const m = new T3.Mesh(new T3.ShapeGeometry(sh), corteMat); m.position.z = 0.002; g.add(m);
    // borda dobrada (o que segura a esfera): destaque
    const b = new T3.Mesh(new T3.CircleGeometry(0.16, 16), new T3.MeshBasicMaterial({ color: 0xff4b3e, transparent: true, opacity: 0 })); b.position.set(sx * 0.9, -0.52, 0.01); g.add(b); W3.borda.push(b);
  }
  // tinta no canal (face do corte) e em volta da esfera
  const tsh = new T3.Shape([[-0.36, 6.6], [-1.55, 7], [-1.55, 9.5], [1.55, 9.5], [1.55, 7], [0.36, 6.6], [0.36, 1.2], [0.72, 0.75], [1.0, 0.25], [-1.0, 0.25], [-0.72, 0.75], [-0.36, 1.2]].map(([a, b]) => new T3.Vector2(a, b)));
  W3.tinta = new T3.Mesh(new T3.ShapeGeometry(tsh), mat(TINTA, { roughness: 0.25, transparent: true, opacity: 1 })); W3.tinta.position.z = 0.001; g.add(W3.tinta);
  // esfera de aco com manchinhas de tinta (para ver que gira)
  W3.bola = grupo(g);
  const aco = new T3.Mesh(new T3.SphereGeometry(1, 48, 32), mat(0xe1e6ec, { metalness: 1, roughness: 0.12 })); aco.castShadow = true; W3.bola.add(aco);
  W3.manchas = [...Array(26)].map((_, i) => { const d = new T3.Vector3(rnd(i) - 0.5, rnd(i * 2.2) - 0.5, rnd(i * 3.7) - 0.5).normalize(); const m = new T3.Mesh(new T3.SphereGeometry(0.16, 12, 8), mat(TINTA, { roughness: 0.3 })); m.scale.set(1, 1, 0.25); m.position.copy(d.multiplyScalar(0.985)); m.lookAt(0, 0, 0); W3.bola.add(m); return m; });
}

function monta() {
  scene.add(sun.target);
  reflexos(0.7);
  W3.mesa = grupo(); W3.ponta = grupo();
  mesa(W3.mesa); ponta(W3.ponta);
}

function atualiza(t, ctx) {
  const s = Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), k = ctx.lt, lugar = LUGAR[ETAPAS[s]];
  W3.s = s; W3.lugar = lugar;
  W3.mesa.visible = lugar === 'mesa'; W3.ponta.visible = lugar === 'ponta';
  scene.background = new T3.Color(lugar === 'ponta' ? 0x2a3442 : 0xe9e4da);
  scene.fog = null;
  sun.position.set(-6, 14, 9); sun.target.position.set(0, 0, 0);

  if (lugar === 'mesa') {
    // quanto do traco ja foi escrito
    const u = s === 0 ? 0.08 + 0.85 * clamp(k * 1.05) : 0.93;
    const n = Math.floor(u * NP);
    W3.seg.forEach((m, i) => { m.visible = i < n; });
    const [px, pz] = traco(u);
    W3.caneta.position.set(px, 0.04, pz);
    if (s === 6) { W3.caneta.position.set(0.6, 0.04, 1.6); }
    if (s >= 7) { W3.caneta.position.set(1.2, 0.04, 2.4); }
    // tinta baixando no tubo; no furo ela desce visivelmente
    const nivel = s === 6 ? lerp(9.5, 8.2, ease(k)) : s >= 7 ? 8.2 : 9.5;
    W3.tintaTubo.scale.y = nivel - 0.75; W3.tintaTubo.position.y = 0.75 + (nivel - 0.75) / 2;
    W3.ar.forEach(m => { const q = (t * 0.9 + m.userData.f) % 1; m.visible = s === 6; m.position.set(Math.sin(m.userData.f * 6.28) * 0.25 * (1 - q), W3.furoY + Math.cos(m.userData.f * 6.28) * 0.25 * (1 - q), 1.4 - q * 1.0); m.scale.setScalar(1 - q * 0.5); });
    W3.furo.scale.setScalar(s === 6 ? 1 + 0.3 * Math.sin(t * 8) : 1);
    W3.antiga.visible = W3.borrao.visible = s === 7;
  }

  if (lugar === 'ponta') {
    // esfera gira quando a caneta anda (papel corre para a esquerda)
    const vel = s === 4 ? 1.6 : s === 5 ? 0 : 0.3;
    const desl = s === 4 ? t * vel : 0;
    W3.bola.rotation.z = -desl;  // rola sobre o papel (raio 1: angulo = deslocamento)
    W3.fibras.forEach(m => { const q = ((m.userData.f * 14 - (s === 4 ? t * vel : 0)) % 14 + 14) % 14; m.position.x = 7 - q; });
    W3.trilha.visible = s === 4 || s === 5;
    const L = s === 4 ? 0.2 + 6 * ease(k) : 6.2;
    W3.trilha.scale.x = L; W3.trilha.position.x = -L / 2 - 0.15;
    // tinta: pisca no 'tinta'; no 'grossa' fica parada (nada pinga)
    W3.tinta.material.emissive = new T3.Color(TINTA).multiplyScalar(s === 3 ? 0.4 + 0.4 * Math.sin(t * 8) : 0);
    W3.tinta.visible = s >= 3;
    W3.manchas.forEach(m => { m.visible = s >= 3; });
    W3.borda.forEach(b => { b.material.opacity = s === 2 ? 0.55 + 0.4 * Math.sin(t * 9) : 0; });
  }
}

const CAM = {
  escreve: { x: 2.0, y: 4.5, d: 15, h: 4, a: 0.15 }, furo: { x: 3.3, y: 6.4, d: 4.2, h: 0.4, a: 0.05 },
  biro: { x: 0.2, y: 2.4, d: 13, h: 8, a: -0.15 }, final: { x: 2.2, y: 4.5, d: 15, h: 4, a: 0.4 },
  ponta: { y: 3.0, d: 15, h: 1.0 }, encaixe: { y: -0.2, d: 6.5, h: 0.4, a: 0.1 }, tinta: { y: 3.6, d: 15.5, h: 0.8, a: -0.15 },
  rola: { y: 0.0, d: 8.5, h: 0.8, a: 0.3 }, grossa: { y: 2.6, d: 13.5, h: 0.8, a: -0.1 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: 1, d: 10, a: 0, h: 3 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const S = W3.s, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)', tm = ctx.t0 + 0.45 * (ctx.t1 - ctx.t0);
  if (ctx.i > 0) {
    const ant = LUGAR[(ST.cenas[ctx.i - 1].p || {}).etapa];
    if (ant && ant !== W3.lugar) { const a = clamp(1 - (t - ctx.t0) * 3.5); if (a > 0) { x.fillStyle = `rgba(255,255,255,${a})`; x.fillRect(0, 0, W, H); } }
  }
  if (S === 0) pill(W / 2, H * 0.12, 'No leaks?', branco, COL.ink, 46, s);
  if (S === 1) { const [px, py] = proj(0, -1, 0); pill(W / 2, H * 0.12, 'Metal ball', branco, COL.ink, 46, s); pill(px, py + 110, '~1 mm', COL.yellow, COL.ink, 40, back((t - tm) * 3)); }
  if (S === 2) pill(W / 2, H * 0.12, 'Spins, but can\'t fall out', COL.green, '#fff', 40, s);
  if (S === 3) pill(W / 2, H * 0.12, 'Ink', '#1d4fd8', '#fff', 48, s);
  if (S === 4) pill(W / 2, H * 0.12, 'Rolls + paints', COL.green, '#fff', 46, s);
  if (S === 5) { pill(W / 2, H * 0.12, 'Thick like paste', branco, COL.ink, 44, s); pill(W / 2, H * 0.12 + 95, 'Ball = plug', '#1d4fd8', '#fff', 42, back((t - tm) * 3)); }
  if (S === 6) pill(W / 2, H * 0.12, 'Air in → ink down', '#3f8cff', '#fff', 44, s);
  if (S === 7) { pill(W / 2, H * 0.12, '1938', COL.yellow, COL.ink, 56, s); pill(W / 2, H * 0.12 + 105, 'László Bíró', branco, COL.ink, 44, back((t - tm) * 3)); }
  if (S === 8) pill(W / 2, H * 0.12, 'Now you know', COL.green, '#fff', 46, s);
}
MUNDO = { monta, atualiza, camera, overlay };
})();
