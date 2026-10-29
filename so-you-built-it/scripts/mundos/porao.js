// Mundo "porao": casa com porao, terreno em corte; agua do solo empurra paredes e piso -> manta, dreno, poco com bomba e valvula.
// Etapas (p.etapa): cava, vaza, manta, sobe, dreno, poco, bomba, valvula, final.
(() => {
const X0 = -14, X1 = 14, Z0 = -4, Z1 = 2.5;
const B = { x0: -4, x1: 4, y0: -3.4, z0: -1.5 };       // buraco do porao (com laje e paredes)
const PIT = { x0: 2.5, x1: 3.5, y0: -4.5, z0: 0.3 };   // poco de coleta no canto
const WT = 0.25, FL = -3.15;                             // espessura da parede; nivel do piso interno
const AQB = -9;
const W3 = {};
function unidade(m) { m.geometry.translate(0, -m.position.y + 0.5, 0); m.position.y = 0; return m; }
function setH(m, y0, y1) { m.visible = y1 - y0 > 0.01; m.position.y = y0; m.scale.y = Math.max(0.001, y1 - y0); }
function tubo(pts, r, m) {
  const c = new T3.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new T3.LineCurve3(new T3.Vector3(...pts[i - 1]), new T3.Vector3(...pts[i])));
  const me = new T3.Mesh(new T3.TubeGeometry(c, 100, r, 10, false), m); me.castShadow = true; scene.add(me); return { me, c };
}

function monta() {
  quintal();
  const grass = tmat('grama', { relevo: 1 }), top = tmat('terra'), sub = tmat('terra2'), clay = tmat('argila'), rock = tmat('rocha', { relevo: 4 });
  const camadas = [[-0.18, 0, grass], [-1.6, -0.18, top], [-4.0, -1.6, sub], [AQB, -4.0, clay], [-12, AQB, rock]];
  for (const [ya, yb, m] of camadas) {
    const cortes = new Set([ya, yb]); for (const v of [B.y0, PIT.y0]) if (v > ya && v < yb) cortes.add(v);
    const ys = [...cortes].sort((a, b) => a - b);
    for (let i = 0; i + 1 < ys.length; i++) {
      const y0 = ys[i], y1 = ys[i + 1], mid = (y0 + y1) / 2;
      if (mid > B.y0) { solid(X0, B.x0, y0, y1, Z0, Z1, m, 2.2); solid(B.x0, B.x1, y0, y1, Z0, B.z0, m, 2.2); solid(B.x1, X1, y0, y1, Z0, Z1, m, 2.2); }
      else if (mid > PIT.y0) { solid(X0, PIT.x0, y0, y1, Z0, Z1, m, 2.2); solid(PIT.x0, PIT.x1, y0, y1, Z0, PIT.z0, m, 2.2); solid(PIT.x1, X1, y0, y1, Z0, Z1, m, 2.2); }
      else solid(X0, X1, y0, y1, Z0, Z1, m, 2.2);
    }
  }
  // agua no solo (faixa azul na face do corte)
  const lm = new T3.MeshBasicMaterial({ color: 0x2f8fe0, transparent: true, opacity: 0.36, depthWrite: false });
  W3.lencois = [0, 1, 2].map(() => { const m = new T3.Mesh(new T3.PlaneGeometry(1, 1), lm); scene.add(m); return m; });
  W3.linha = new T3.Mesh(new T3.PlaneGeometry(1, 0.06), new T3.MeshBasicMaterial({ color: 0x7fd0ff })); scene.add(W3.linha);
  // terra que sai
  W3.terra = unidade(solid(B.x0, B.x1, 0, 1, B.z0, Z1 - 0.01, top, 2.2));
  W3.monte = new T3.Mesh(new T3.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), tmat('terra', { relevo: 5 })); W3.monte.position.set(-7.5, 0, 0.4); scene.add(W3.monte);
  // estrutura de concreto: paredes, laje do piso, laje de cima
  const conc = tmat('concreto', { relevo: 1.5 }), cz = (B.z0 + Z1) / 2, cd = Z1 - B.z0;
  W3.estrutura = grupo();
  const cb = (...a) => uvMundo(box(...a, W3.estrutura), 1.6);
  cb(WT, -B.y0, cd, conc, B.x0 + WT / 2, B.y0 / 2, cz); cb(WT, -B.y0, cd, conc, B.x1 - WT / 2, B.y0 / 2, cz);
  cb(B.x1 - B.x0, -B.y0, WT, conc, 0, B.y0 / 2, B.z0 + WT / 2);
  cb(PIT.x0 - B.x0, 0.25, cd, conc, (B.x0 + PIT.x0) / 2, B.y0 + 0.125, cz);
  cb(B.x1 - PIT.x1, 0.25, cd, conc, (B.x1 + PIT.x1) / 2, B.y0 + 0.125, cz);
  cb(PIT.x1 - PIT.x0, 0.25, PIT.z0 - B.z0, conc, (PIT.x0 + PIT.x1) / 2, B.y0 + 0.125, (B.z0 + PIT.z0) / 2);
  cb(B.x1 - B.x0 + 0.4, 0.3, cd, conc, 0, 0.15, cz);
  // casa em cima (paredes cortadas e telhado)
  W3.casa = grupo();
  const fach = mat(0xe9e1d2, { roughness: 0.8 });
  box(0.3, 3.2, cd, fach, B.x0 + 0.15, 1.9, cz, W3.casa); box(0.3, 3.2, cd, fach, B.x1 - 0.15, 1.9, cz, W3.casa); box(B.x1 - B.x0, 3.2, 0.3, fach, 0, 1.9, B.z0 + 0.15, W3.casa);
  const tel = new T3.Mesh(new T3.CylinderGeometry(0.01, 6.2, 2.4, 4, 1), new T3.MeshStandardMaterial({ map: textura('telhado', GERA.telhado).tx })); tel.rotation.y = Math.PI / 4; tel.scale.z = 0.55; tel.position.set(0, 4.7, cz); tel.castShadow = true; W3.casa.add(tel);
  // moveis no porao (o espaco a mais)
  W3.moveis = grupo();
  const tec = mat(0x6b7a8f, { roughness: 0.95 });
  box(2.6, 0.6, 1.1, tec, -1.8, FL + 0.3, 0.6, W3.moveis); box(2.6, 1.0, 0.35, tec, -1.8, FL + 0.8, 0.1, W3.moveis);
  box(1.0, 0.8, 0.8, mat(0xb08a5a), 0.9, FL + 0.4, 0.2, W3.moveis); box(0.8, 0.6, 0.7, mat(0xa07a4c), 0.9, FL + 1.1, 0.2, W3.moveis);
  // agua: poca no piso, jatos nas paredes, jatos do piso
  W3.poca = unidade(solid(B.x0 + WT, PIT.x0, 0, 1, B.z0 + WT, Z1 - 0.02, mat(0x3f9fe3, { roughness: 0.1, transparent: true, opacity: 0.75 })));
  const am = mat(0x4fa8ef, { roughness: 0.1 });
  W3.jatos = [...Array(24)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.07, 8, 6), am); scene.add(m); m.userData = { s: i % 2 ? -1 : 1, y: lerp(-2.9, -1.0, rnd(i * 3.1)), z: lerp(-0.8, 2.2, rnd(i * 5.3)), f: rnd(i * 7.9) }; return m; });
  W3.fontes = [...Array(18)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.07, 8, 6), am); scene.add(m); m.userData = { x: lerp(-3.2, 1.8, rnd(i * 2.9)), z: lerp(-0.5, 2.1, rnd(i * 6.1)), f: rnd(i * 4.4) }; return m; });
  W3.trincas = grupo();
  for (let i = 0; i < 5; i++) { const t = box(0.9 + rnd(i) * 0.8, 0.02, 0.06, mat(0x1b1b1b), lerp(-3, 1.5, i / 4), FL + 0.01, lerp(0, 2, rnd(i * 3)), W3.trincas); t.rotation.y = rnd(i * 7) * 2; }
  // manta preta do lado de fora das paredes
  W3.manta = grupo();
  box(0.08, -B.y0, 0.04, mat(0x15161a, { roughness: 0.6 }), B.x0 - 0.04, B.y0 / 2, Z1 + 0.02, W3.manta);
  box(0.08, -B.y0, 0.04, mat(0x15161a, { roughness: 0.6 }), B.x1 + 0.04, B.y0 / 2, Z1 + 0.02, W3.manta);
  // dreno frances: cano furado no cascalho, no pe das paredes (corte do cano visivel)
  W3.dreno = grupo();
  const bm = [mat(0xc9c2b6), mat(0x9b9387), mat(0xe0dad0)];
  for (const s of [-1, 1]) {
    for (let i = 0; i < 40; i++) { const me = new T3.Mesh(new T3.DodecahedronGeometry(0.07 + rnd(i + s) * 0.05), bm[i % 3]); me.position.set(s * lerp(4.08, 4.9, rnd(i * 2.3 + s)), lerp(-3.55, -2.7, rnd(i * 6.1 + s)), Z1 + 0.03); W3.dreno.add(me); }
    const cano = new T3.Mesh(new T3.RingGeometry(0.12, 0.2, 18), new T3.MeshBasicMaterial({ color: 0xf2f4f5 })); cano.position.set(s * 4.5, -3.15, Z1 + 0.06); W3.dreno.add(cano);
  }
  W3.ligacao = tubo([[4.5, -3.6, Z1 - 0.3], [PIT.x1 - 0.1, -3.6, Z1 - 0.3]], 0.1, mat(0xf2f4f5, { roughness: 0.3 }));
  W3.gotasSolo = [...Array(20)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.06, 8, 6), am); scene.add(m); m.userData = { s: i % 2 ? -1 : 1, f: rnd(i * 3.7), y: lerp(-2.6, -0.8, rnd(i * 8.3)) }; return m; });
  // poco de coleta: agua dentro, bomba, boia, cano de saida, valvula
  W3.pitAgua = unidade(solid(PIT.x0 + 0.05, PIT.x1 - 0.05, 0, 1, PIT.z0 + 0.05, Z1 - 0.03, mat(0x3f9fe3, { roughness: 0.1, transparent: true, opacity: 0.8 })));
  W3.bomba = grupo(); W3.bomba.position.set(3.0, PIT.y0, Z1 - 0.6);
  cyl(0.28, 0.3, 0.6, mat(0x2b4a7a, { metalness: 0.4, roughness: 0.4 }), 18, W3.bomba).position.y = 0.3;
  W3.boia = new T3.Mesh(new T3.SphereGeometry(0.13, 14, 10), mat(0xe8c040, { roughness: 0.4 })); scene.add(W3.boia);
  W3.haste = cyl(0.02, 0.02, 1, mat(0x777777), 6); W3.haste.geometry.translate(0, 0.5, 0);
  W3.saida = tubo([[3.0, PIT.y0 + 0.6, Z1 - 0.6], [3.0, -1.0, Z1 - 0.6], [5.2, -1.0, Z1 - 0.6], [5.2, 0.1, Z1 - 0.6], [7.2, 0.1, Z1 - 0.6]], 0.08, mat(0x30343a, { roughness: 0.4 }));
  W3.valvula = grupo(); W3.valvula.position.set(3.0, -2.2, Z1 - 0.6);
  box(0.3, 0.42, 0.3, mat(0xc0c4c8, { metalness: 0.6, roughness: 0.3 }), 0, 0, 0, W3.valvula);
  W3.aba = box(0.24, 0.03, 0.24, mat(0xd04030), 0, 0.05, 0.16, W3.valvula);
  W3.saidaGotas = [...Array(14)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.07, 8, 6), am); scene.add(m); return m; });
}

const ETAPAS = ['cava', 'vaza', 'manta', 'sobe', 'dreno', 'poco', 'bomba', 'valvula', 'final'];
function estado(s, k) {
  const at = (i, f) => s < i ? 0 : s > i ? 1 : ease(clamp(f(k), 0, 1));
  return {
    s, k,
    dig: at(0, k => k * 1.8), obra: at(0, k => k * 2.2 - 1.0), moveis: at(0, k => k * 3 - 2.2),
    jatos: s === 1 ? ease(clamp(k * 2 - 0.2, 0, 1)) : s === 2 ? 1 - ease(clamp(k * 3, 0, 1)) : 0,
    manta: at(2, k => k * 2),
    fontes: s === 3 ? ease(clamp(k * 2 - 0.4, 0, 1)) : s === 4 ? 1 - ease(clamp(k * 3, 0, 1)) : 0,
    poca: s === 1 ? 0.25 * ease(clamp(k * 1.5 - 0.3, 0, 1)) : s === 2 ? 0.25 * (1 - ease(clamp(k * 2, 0, 1))) : s === 3 ? 0.35 * ease(clamp(k * 1.5 - 0.4, 0, 1)) : s === 4 ? 0.35 * (1 - ease(clamp(k * 2, 0, 1))) : 0,
    wt: s < 3 ? -2.2 : s === 3 ? lerp(-2.2, -0.9, ease(clamp(k * 1.5, 0, 1))) : s === 4 ? lerp(-0.9, -3.3, ease(clamp(k * 1.5 - 0.3, 0, 1))) : -3.3,
    dreno: at(4, k => k * 2.5),
    ligacao: at(5, k => k * 2),
    pit: s < 5 ? 0 : 1,
    bomba: at(6, k => k * 3),
    valvula: at(7, k => k * 3),
  };
}

function atualiza(t, ctx) {
  const S = estado(Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), ctx.lt); W3.S = S;
  const yTop = lerp(0, B.y0, S.dig);
  setH(W3.terra, B.y0, yTop); W3.terra.visible = S.dig < 1;
  W3.monte.visible = S.dig > 0.02 && S.obra < 1; W3.monte.scale.set(2.4 * S.dig + 0.01, 1.2 * S.dig * (1 - S.obra * 0.9) + 0.01, 1.6 * S.dig + 0.01);
  W3.estrutura.visible = S.obra > 0; W3.estrutura.position.y = (1 - S.obra) * 6;
  W3.casa.visible = S.obra >= 1 || S.s > 0; W3.casa.position.y = (1 - S.obra) * 8;
  W3.moveis.visible = S.moveis > 0; W3.moveis.scale.setScalar(Math.max(0.01, back(S.moveis)));
  // lencol
  const wt = S.wt;
  const faixa = (m, xa, xb, yt) => { m.visible = yt > AQB + 0.01; m.scale.set(xb - xa, Math.max(0.01, yt - AQB), 1); m.position.set((xa + xb) / 2, (yt + AQB) / 2, Z1 + 0.012); };
  faixa(W3.lencois[0], X0, B.x0, wt); faixa(W3.lencois[1], B.x1, X1, wt); faixa(W3.lencois[2], B.x0, B.x1, Math.min(wt, PIT.y0));
  W3.linha.scale.x = X1 - X0; W3.linha.position.set(0, wt, Z1 + 0.014); W3.linha.visible = wt < B.y0 || S.s < 4;
  // jatos pelas paredes
  W3.jatos.forEach((m) => {
    const u = m.userData, q = (t * 0.9 + u.f) % 1; m.visible = S.jatos > 0.05 && u.y < wt;
    const px = u.s * lerp(B.x1 - WT, B.x1 - WT - 1.6, q);
    m.position.set(px, u.y - q * q * 1.2, u.z); m.scale.setScalar(S.jatos);
  });
  W3.fontes.forEach((m) => {
    const u = m.userData, q = (t * 1.2 + u.f) % 1; m.visible = S.fontes > 0.05;
    m.position.set(u.x, FL + 4 * q * (1 - q) * 0.9, u.z); m.scale.setScalar(S.fontes);
  });
  W3.trincas.visible = S.s === 3 || (S.s === 4 && S.k < 0.3);
  setH(W3.poca, FL, FL + Math.max(0.001, S.poca)); W3.poca.visible = S.poca > 0.01;
  W3.manta.visible = S.manta > 0; W3.manta.scale.y = Math.max(0.01, S.manta); W3.manta.position.y = 0;
  // dreno
  W3.dreno.visible = S.dreno > 0; W3.dreno.position.y = (1 - S.dreno) * -2;
  W3.gotasSolo.forEach((m) => {
    const u = m.userData, q = (t * 0.6 + u.f) % 1; m.visible = S.dreno >= 1 && S.s <= 6;
    m.position.set(u.s * lerp(7, 4.5, q), lerp(u.y, -3.15, q * q), Z1 + 0.05); m.scale.setScalar(u.y > wt + 2.5 ? 0.01 : 1);
  });
  W3.ligacao.me.visible = S.ligacao > 0;
  W3.ligacao.me.geometry.setDrawRange(0, Math.floor(W3.ligacao.me.geometry.index.count * S.ligacao / 6) * 6);
  // poco: enche, a boia sobe, a bomba liga e esvazia (ciclo)
  let nivel = 0.15, ligada = false;
  if (S.s === 5) nivel = lerp(0.1, 0.75, ease(clamp(S.k * 1.4 - 0.2, 0, 1)));
  if (S.s >= 6) { const c = (t * 0.22) % 1; ligada = c > 0.55; nivel = ligada ? lerp(0.8, 0.15, (c - 0.55) / 0.45) : lerp(0.15, 0.8, c / 0.55); }
  setH(W3.pitAgua, PIT.y0 + 0.05, PIT.y0 + 0.05 + nivel); W3.pitAgua.visible = S.pit > 0;
  W3.bomba.visible = S.bomba > 0; W3.bomba.scale.setScalar(Math.max(0.01, back(S.bomba)));
  W3.boia.visible = W3.haste.visible = S.bomba > 0.5;
  W3.boia.position.set(3.35, PIT.y0 + 0.05 + nivel, Z1 - 0.35); W3.haste.position.set(3.35, PIT.y0 + 0.4, Z1 - 0.35); W3.haste.scale.y = Math.max(0.01, nivel - 0.35);
  W3.saida.me.visible = S.bomba > 0.3;
  W3.valvula.visible = S.valvula > 0; W3.valvula.scale.setScalar(Math.max(0.01, back(S.valvula)));
  W3.aba.rotation.x = ligada ? -0.9 : 0;
  W3.ligada = ligada && S.bomba >= 1;
  W3.saidaGotas.forEach((m, i) => {
    const q = (t * 0.5 + i / 14) % 1; m.visible = W3.ligada;
    const p = W3.saida.c.getPointAt(q); m.position.set(p.x, p.y, p.z + 0.1);
  });
}

const CAM = {
  cava: { y: -0.6, d: 16 }, vaza: { y: -1.4, d: 12, x: 1.6 }, manta: { y: -1.2, d: 14 }, sobe: { y: -1.6, d: 12, x: -0.6 },
  dreno: { y: -1.9, d: 20 }, poco: { y: -2.6, d: 10, x: 2.8 }, bomba: { y: -2.4, d: 9.5, x: 3.0 }, valvula: { y: -1.6, d: 10, x: 3.4 },
  final: { y: -0.4, d: 18 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: -1.5, d: 14, a: 0, h: 1.9, zFoco: Z1 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const S = W3.S;
  const rot = (px, py, pz, txt, k, bg = 'rgba(255,255,255,0.92)', fg = COL.ink, sz = 34) => { if (k <= 0) return; const [a, b] = proj(px, py, pz); pill(a, b, txt, bg, fg, sz, back(clamp(k, 0, 1))); };
  if (S.s === 1) {
    // setas da pressao da agua empurrando as paredes
    for (const s of [-1, 1]) for (let j = 0; j < 3; j++) {
      const [ax, ay] = proj(s * 6.2, -2.8 + j * 0.6, Z1), [bx, by] = proj(s * 4.4, -2.8 + j * 0.6, Z1);
      const k = clamp(S.k * 3 - j * 0.3, 0, 1); if (k <= 0) continue;
      x.save(); x.globalAlpha = k; x.strokeStyle = '#3fa4f0'; x.fillStyle = '#3fa4f0'; x.lineWidth = 10;
      x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke();
      const an = Math.atan2(by - ay, bx - ax); x.beginPath(); x.moveTo(bx, by); x.lineTo(bx - 28 * Math.cos(an - 0.5), by - 28 * Math.sin(an - 0.5)); x.lineTo(bx - 28 * Math.cos(an + 0.5), by - 28 * Math.sin(an + 0.5)); x.fill(); x.restore();
    }
    rot(6.0, -0.9, Z1, 'Water pressure', (S.k - 0.3) * 4);
  }
  if (S.s === 2) rot(-6.0, -1.0, Z1, 'Waterproofing', (S.k - 0.4) * 4);
  if (S.s === 4) rot(-6.0, -2.2, Z1, 'French drain', (S.k - 0.4) * 4);
  if (S.s === 5) rot(1.2, -4.2, Z1, 'Sump pit', (S.k - 0.3) * 4);
  if (S.s === 6) rot(1.4, -2.2, Z1, 'Sump pump', (S.k - 0.3) * 4, COL.green, '#fff');
  if (S.s === 7) rot(1.4, -2.2, Z1, 'Check valve', (S.k - 0.3) * 4, COL.green, '#fff');
}
MUNDO = { monta, atualiza, camera, overlay };
})();
