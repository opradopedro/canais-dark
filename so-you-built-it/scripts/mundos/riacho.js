// Mundo "riacho": agua correndo e o que se constroi nela. Duas areas, ambas com o solo em corte (face em z = ZF):
//  VALE (x = 0): o riacho corre na direcao da camera; o corte mostra o vale em V. Pontes que atravessam o vale
//   (tronco, tabuas, pilar no meio, arco de pedra, trelica, junta de dilatacao) e estrada em aterro com bueiro.
//  PERFIL (x = OX = 43): corte ao longo da agua. Barragem de terra (represa), dique de rio com cidade baixa (dique)
//   e lago de jardim (lago).
// Sem etapas fixas (igual ao terreno): cada cena diz o estado em "p". [a, b] vai de a ate b durante a cena.
//
// p aceito (tudo opcional):
//  foco: "vale" | "ponte" | "deck" | "arco" | "chave" | "aterro" | "atras" | "carro" | "represa" | "crista" |
//        "jusante" | "dique" | "sob" | "lago" | "geral"
//  agua: nivel da agua em m (vale: leito em -2.4, margem em 0; perfil: chao em 0)   chuva: 0..1   lama: 1 (agua marrom)
//  VALE: ponte: "tronco" | "tabuas" | "pilar" | "arco" | "trelica"   quebra: 0..1 (meio da ponte cede/cai)
//   podre: 0..1   leva: 0..1 (enchente leva a ponte)   cimbre: 1 (forma de madeira sob o arco)
//   pedras: 0..1 (quantas aduelas do arco ja estao no lugar; 1 = todas)   chave: 1 (pedra-chave em amarelo)
//   forca: 0..1 (setas do peso descendo pelo arco)   junta: 1 (junta de dilatacao no meio, pede ponte "pilar")
//   calor: -1..1 (frio abre a junta, calor fecha)   empena: 0..1 (sem junta: o calor levanta o tabuleiro)
//   aterro: 1 (estrada em aterro atravessando o vale)   bueiro: "cano" | "caixa"   entupido: 0..1 (galhos na boca)
//   agua_baixo: nivel depois do aterro   lamina: m de agua por cima da estrada   rompe: 0..1 (aterro levado)
//   enrocamento: 1 (pedras na saida do bueiro)   carro: 1   boia: 0..1 (o carro flutua e e arrastado)
//  PERFIL: perfil: "represa" | "dique" | "lago"   nucleo: 1 (nucleo de argila)   enrocamento: 1 (pedras na face da agua)
//   vertedouro: 1   transborda: 0..1   rompe: 0..1   enchente: m de agua na cidade   vaza: 0..1 (agua atravessando)
//   dreno: 1 (filtro de brita no pe)   empurra: 0..1 (setas da agua empurrando)   baixo: m (terra do lado de dentro
//   do dique mais baixa; no dique use 1.5, o pe do dique ja desce ate la)   cortina: 1 (parede sob o dique)   fervura: 0..1 (areia brotando atras do dique)
//   barreira: 0 (esconde a barragem/dique: antes de construir)   bomba: 1 (bomba tirando agua da cidade / do lago para o filtro)   manta: 1   argila: 1 (fundo do lago)
//   algas: 0..1   plantas: 1   peixes: n
//  rotulo: "TEXTO" (pilula no alto)   cor: "red" | "green" | "white"   marcas: [{"t": "Clay", "x": 0, "y": -1}]
//   (no perfil, x das marcas e relativo a OX)
(() => {
const Z0 = -60, Z1 = 2.5, ZF = Z1 + 0.02, OX = 43;
const VW = 5.5, BW = 1.5, BED = -2.4;               // vale: meia largura no alto, meia largura do leito, fundo
const W3 = { geo: {} };
const V = (v, lt, d = 0) => v === undefined || v === null ? d : Array.isArray(v) ? lerp(v[0], v[1], ease(clamp(lt * 1.6))) : v;
const NP = 60;

function prismaGeo(pts, z0, z1) {
  const s = new T3.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
  const g = new T3.ExtrudeGeometry(s, { depth: z1 - z0, bevelEnabled: false }); g.translate(0, 0, z0); return g;
}
function prisma(pts, z0, z1, m, esc) { const me = new T3.Mesh(prismaGeo(pts, z0, z1), m); me.castShadow = me.receiveShadow = true; scene.add(me); return esc ? uvMundo(me, esc) : me; }
// troca a geometria de uma malha por uma da cache (agua que sobe e desce sem recriar a cada quadro)
function geoDe(me, chave, f) { if (!W3.geo[chave]) W3.geo[chave] = f(); if (me.geometry !== W3.geo[chave]) me.geometry = W3.geo[chave]; }
function barra(a, b, e, m, pai) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), me = box(L, e, e, m, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2], pai);
  me.rotation.z = Math.atan2(dy, dx); return me;
}
function casinha(px, pz, cor, pai) {
  const g = grupo(pai); g.position.set(px, 0, pz);
  box(2.2, 1.6, 2.0, mat(cor), 0, 0.8, 0, g);
  const tri = new T3.Shape(); tri.moveTo(-1.3, 0); tri.lineTo(1.3, 0); tri.lineTo(0, 0.9); tri.closePath();
  const r = new T3.Mesh(new T3.ExtrudeGeometry(tri, { depth: 2.2, bevelEnabled: false }), mat(0x9c4a32)); r.position.set(0, 1.6, -1.1); r.castShadow = true; g.add(r);
  box(0.5, 0.8, 0.05, mat(0x5a3e28), 0.4, 0.4, 1.01, g); box(0.5, 0.45, 0.05, mat(0x9fc6e8, { roughness: 0.2 }), -0.5, 1.0, 1.01, g);
  return g;
}
const supVale = xx => { const a = Math.abs(xx); return a >= VW ? 0 : a <= BW ? BED : BED * (VW - a) / (VW - BW); };
function aguaValePts(L) {
  if (L <= 0) { const xl = BW + (L - BED) / (-BED) * (VW - BW); return [[-xl, L], [-BW, BED], [BW, BED], [xl, L]]; }
  return [[-17, L], [-17, 0], [-VW, 0], [-BW, BED], [BW, BED], [VW, 0], [17, 0], [17, L]];
}

function monta() {
  quintal({ zFundo: Z0, zCasa: -75, xCasa: -28 });
  scene.add(sun.target);
  reflexos(0.45);
  const terra = tmat('terra'), terra2 = tmat('terra2'), rocha = tmat('rocha', { relevo: 4 }), grama = tmat('grama', { relevo: 1 });
  const conc = tmat('concreto', { relevo: 1.5 }), madeira = tmat('madeira', { relevo: 1 }), asf = tmat('asfalto', { relevo: 1 });
  const argila = (GERA.argilaR = GERA.argilaR || (() => geraTerra(0x80817a, 21, 40, [0.8, 1.12])), tmat('argilaR'));
  const areia = tmat('terra2', { color: 0xd8c08a }), cascalho = tmat('cascalho', { relevo: 3 });
  W3.mat = { terra, terra2, argila, cascalho, conc, madeira };

  // ---------------- VALE ----------------
  prisma([[-17, -6], [-17, 0], [-VW, 0], [-BW, BED], [BW, BED], [VW, 0], [17, 0], [17, -6]], Z0, Z1, terra, 2.2);
  solid(-17, 17, -10, -6, Z0, Z1, rocha, 2.2);
  solid(-17, -VW, 0, 0.12, Z0, Z1, grama, 3); solid(VW, 17, 0, 0.12, Z0, Z1, grama, 3);
  solid(-BW, BW, BED, BED + 0.08, Z0, Z1, cascalho, 1.5);
  W3.aguaM = mat(0x2f7fc0, { roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.78 });
  W3.lamaM = mat(0x7a5a36, { roughness: 0.4, transparent: true, opacity: 0.9 });
  W3.aguaCima = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM); scene.add(W3.aguaCima);
  W3.aguaBaixo = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM); scene.add(W3.aguaBaixo);
  // espuma correndo para a camera
  W3.espuma = [...Array(NP)].map((_, i) => { const m = new T3.Mesh(new T3.PlaneGeometry(0.35, 0.08), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); m.rotation.x = -Math.PI / 2; m.userData = { f: rnd(i * 1.3), a: rnd(i * 4.1) }; scene.add(m); return m; });

  // pontes (z -1.3..1.3)
  W3.ponte = {};
  const P = W3.ponte;
  P.tronco = grupo(); { const l = cyl(0.42, 0.38, 15, mat(0x6a4a2e, { roughness: 1 }), 14, P.tronco); l.rotation.z = Math.PI / 2; l.position.y = 0.4; }
  P.encontros = grupo(); for (const sx of [-1, 1]) { const e = box(2.2, 1.6, 2.8, conc, sx * 6.6, -0.45, 0, P.encontros); uvMundo(e, 2); }
  // tabuleiro em duas metades com pivo nas margens (cede no meio, enchente leva, junta no meio)
  P.tab = grupo();
  P.meias = [-1, 1].map(sx => {
    const piv = grupo(P.tab); piv.position.set(sx * 6.5, 0.35, 0);
    const me = box(1, 0.22, 2.6, madeira, 0, 0, 0, piv); uvMundo(me, 1.2);
    const corr = box(1, 0.5, 0.08, madeira, 0, 0.35, 1.25, piv), corr2 = box(1, 0.5, 0.08, madeira, 0, 0.35, -1.25, piv);
    const dedos = grupo(piv); for (let k = 0; k < 6; k++) box(0.3, 0.06, 0.18, mat(0x9aa3ad, { metalness: 0.6, roughness: 0.4 }), 0, 0.12, -1.05 + k * 0.42 + (sx > 0 ? 0.21 : 0), dedos);
    return { piv, me, corr, corr2, dedos, sx };
  });
  P.pilar = box(0.9, 1, 2.4, conc, 0, 0, 0); uvMundo(P.pilar, 2);
  // arco de pedra
  const R = 7.117, CY = -4.517, RE = R + 0.6, AL = Math.atan2(-CY, VW), NA = 15;
  W3.arcoY = xx => CY + Math.sqrt(Math.max(0, R * R - xx * xx));
  W3.arcoR = { R, CY, RE, AL };
  P.arco = grupo();
  const pedra = tmat('concreto', { color: 0xd9c49a, relevo: 2 }), pedraAd = tmat('concreto', { color: 0xf0e2c0, relevo: 3 });
  P.aduelas = [];
  for (let i = 0; i < NA; i++) {
    const a0 = AL + (Math.PI - 2 * AL) * i / NA, a1 = AL + (Math.PI - 2 * AL) * (i + 1) / NA, am = (a0 + a1) / 2;
    const b = box((R + 0.3) * (a1 - a0) * 0.95, 0.6, 2.6, pedraAd, (R + 0.3) * Math.cos(am), CY + (R + 0.3) * Math.sin(am), 0, P.arco);
    b.rotation.z = am - Math.PI / 2; P.aduelas.push(b);
  }
  P.chaveM = mat(0xffd23a, { roughness: 0.6, emissive: 0x5a4400 }); P.pedraAd = pedraAd;
  const xe = Math.sqrt(RE * RE - CY * CY), ext = [];
  for (let k = 0; k <= 16; k++) { const xx = -k / 16 * xe; ext.push([xx, CY + Math.sqrt(RE * RE - xx * xx)]); }
  const top = CY + RE + 0.35;
  P.timpano = [prisma([[-12, 0], [-8, top], [0, top], ...ext], -1.3, 1.3, pedra, 2), prisma([[12, 0], ...ext.map(([a, b]) => [-a, b]).reverse(), [0, top], [8, top]], -1.3, 1.3, pedra, 2)];
  P.timpano.forEach(m => P.arco.add(m));
  P.cimbre = grupo();
  for (const xx of [-4, -2.5, -1, 1, 2.5, 4]) { const y0 = supVale(xx), y1 = W3.arcoY(xx); box(0.18, y1 - y0, 2.2, madeira, xx, (y0 + y1) / 2, 0, P.cimbre); }
  for (let k = 0; k < 12; k++) { const xa = -5.2 + k * 0.95, xb = xa + 0.95; barra([xa, W3.arcoY(xa) - 0.05, 0], [xb, W3.arcoY(xb) - 0.05, 0], 0.16, madeira, P.cimbre).scale.z = 14; }
  // trelica de aco
  P.trel = grupo(); const aco = mat(0xb5442e, { metalness: 0.45, roughness: 0.45 });
  for (const zz of [-1.25, 1.25]) {
    const xs = [-6.5, -4.33, -2.17, 0, 2.17, 4.33, 6.5], yb = 0.5, yt = 2.4;
    barra([-4.33, yt, zz], [4.33, yt, zz], 0.22, aco, P.trel); barra([-6.5, yb, zz], [6.5, yb, zz], 0.22, aco, P.trel);
    barra([-6.5, yb, zz], [-4.33, yt, zz], 0.22, aco, P.trel); barra([6.5, yb, zz], [4.33, yt, zz], 0.22, aco, P.trel);
    for (let i = 1; i < 6; i++) barra([xs[i], yb, zz], [xs[i], yt, zz], 0.16, aco, P.trel);
    for (let i = 1; i < 5; i++) { const c = xs[i] < 0 ? 1 : -1; if (xs[i] === 0) continue; barra([xs[i], yt, zz], [xs[i] + c * 2.17, yb, zz], 0.14, aco, P.trel); }
    barra([-2.17, yt, zz], [0, yb, zz], 0.14, aco, P.trel); barra([2.17, yt, zz], [0, yb, zz], 0.14, aco, P.trel);
  }
  for (const xx of [-4.33, -2.17, 0, 2.17, 4.33]) box(0.14, 0.14, 2.5, aco, xx, 2.4, 0, P.trel);

  // aterro da estrada com bueiro (z -1.6..1.6)
  W3.aterro = grupo(); W3.aterro.position.y = BED;
  const plug = [[-VW - 0.01, 0.4], [-VW, 0], [-BW, BED], [BW, BED], [VW, 0], [VW + 0.01, 0.4]].map(([a, b]) => [a, b - BED]);
  const mkPlug = furo => {
    const s = new T3.Shape(); s.moveTo(plug[0][0], plug[0][1]); plug.slice(1).forEach(p => s.lineTo(p[0], p[1])); s.closePath();
    if (furo === 'cano') { const h = new T3.Path(); h.absarc(0, 0.55, 0.45, 0, Math.PI * 2, true); s.holes.push(h); }
    if (furo === 'caixa') { const h = new T3.Path(); h.moveTo(-1.4, 0.06); h.lineTo(-1.4, 1.9); h.lineTo(1.4, 1.9); h.lineTo(1.4, 0.06); h.closePath(); s.holes.push(h); }
    const g = new T3.ExtrudeGeometry(s, { depth: 3.2, bevelEnabled: false }); g.translate(0, 0, -1.6); return g;
  };
  W3.plugs = {};
  for (const k of ['sem', 'cano', 'caixa']) { const me = new T3.Mesh(mkPlug(k), terra2); me.castShadow = me.receiveShadow = true; W3.aterro.add(me); uvMundo(me, 2); W3.plugs[k] = me; }
  W3.asfMeio = box(2 * VW + 0.02, 0.12, 3.2, asf, 0, 0.46 - BED, 0, W3.aterro); uvMundo(W3.asfMeio, 3);
  W3.estrada = grupo(); for (const sx of [-1, 1]) { uvMundo(box(17 - VW, 0.46, 3.2, terra2, sx * (VW + (17 - VW) / 2), 0.23, 0, W3.estrada), 2); uvMundo(box(17 - VW, 0.12, 3.2, asf, sx * (VW + (17 - VW) / 2), 0.46, 0, W3.estrada), 3); }
  W3.cano = cyl(0.5, 0.5, 3.4, mat(0x9aa0a6, { metalness: 0.5, roughness: 0.5, side: T3.DoubleSide }), 24); W3.cano.rotation.x = Math.PI / 2; W3.cano.position.set(0, BED + 0.55, 0);
  W3.cano.geometry = new T3.CylinderGeometry(0.5, 0.5, 3.4, 24, 1, true);
  W3.caixa = grupo(); box(3.1, 0.2, 3.4, conc, 0, BED + 2.0, 0, W3.caixa); for (const sx of [-1, 1]) box(0.2, 1.9, 3.4, conc, sx * 1.5, BED + 1.0, 0, W3.caixa); box(3.1, 0.1, 3.4, conc, 0, BED + 0.05, 0, W3.caixa);
  W3.galhos = grupo(); for (let k = 0; k < 11; k++) { const g = cyl(0.05, 0.07, 1.2 + rnd(k) * 0.8, mat(0x4a3420, { roughness: 1 }), 6, W3.galhos); g.rotation.set(rnd(k * 2) * 3, rnd(k * 3) * 3, rnd(k * 5) * 3); g.position.set((rnd(k * 7) - 0.5) * 1.2, BED + 0.5 + (rnd(k * 9) - 0.5) * 0.8, 1.75); }
  { const tampa = new T3.Mesh(new T3.CircleGeometry(0.5, 20), mat(0x3a2a1a, { roughness: 1 })); tampa.position.set(0, BED + 0.55, 1.72); W3.galhos.add(tampa); }
  W3.enroc = grupo(); for (let k = 0; k < 22; k++) { const r = new T3.Mesh(new T3.DodecahedronGeometry(0.28 + rnd(k) * 0.2), mat(0x8a8780, { roughness: 1 })); r.position.set((rnd(k * 3) - 0.5) * 3.2, BED + 0.15, 1.8 + rnd(k * 5) * 1.6); r.castShadow = true; W3.enroc.add(r); }
  W3.lamina = box(2 * VW, 1, 3.2, W3.aguaM, 0, 0, 0); W3.cascataV = box(2 * VW, 1, 0.06, W3.aguaM, 0, 0, 1.64);
  // carro
  W3.carro = grupo(); { const lata = mat(0xd23b2b, { metalness: 0.4, roughness: 0.35 }); box(3.0, 0.6, 1.5, lata, 0, 0.55, 0, W3.carro); box(1.7, 0.5, 1.4, lata, -0.2, 1.1, 0, W3.carro); box(1.6, 0.42, 1.42, mat(0x223344, { roughness: 0.15 }), -0.2, 1.1, 0, W3.carro).scale.set(1.02, 1, 1.0); for (const [a, b] of [[-1, -0.75], [-1, 0.75], [1, -0.75], [1, 0.75]]) { const r = cyl(0.33, 0.33, 0.25, mat(0x1a1a1a), 16, W3.carro); r.rotation.x = Math.PI / 2; r.position.set(a, 0.33, b); } }

  // ---------------- PERFIL ----------------
  W3.perfil = grupo();
  const PF = W3.perfil;
  const mkB = (x0, x1, y0, y1, m, z0 = Z0, z1 = Z1) => { const me = box(x1 - x0, y1 - y0, z1 - z0, m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, PF); return uvMundo(me, 2.2); };
  mkB(OX - 26, OX + 26, -10, -5.5, rocha); W3.areiaP = mkB(OX - 26, OX + 26, -5.5, -3.5, areia);
  W3.soloE = mkB(OX - 26, OX, -3.5, 0, terra); W3.soloD = mkB(OX, OX + 26, -3.5, 0, terra);
  W3.gramaE = mkB(OX - 26, OX, 0, 0.1, grama); W3.gramaD = mkB(OX, OX + 26, 0, 0.1, grama);
  // lago: chao com bacia (so ate z = -9; atras e chao inteiro)
  const bacia = [[OX - 26, -3.5], [OX - 26, 0], [OX - 6, 0], [OX - 4.2, -2], [OX + 4.2, -2], [OX + 6, 0], [OX + 26, 0], [OX + 26, -3.5]];
  W3.lagoSolo = grupo(PF);
  W3.lagoSolo.add(prisma(bacia, -9, Z1, terra, 2.2));
  W3.lagoSolo.add(uvMundo(box(52, 3.6, 51, terra, OX, -1.75, -9 - 25.5), 2.2));
  W3.lagoSolo.add(uvMundo(box(20, 0.1, 11.5, grama, OX - 16, 0.05, -9 + 5.75), 3)); W3.lagoSolo.add(uvMundo(box(20, 0.1, 11.5, grama, OX + 16, 0.05, -9 + 5.75), 3));
  W3.lagoSolo.add(uvMundo(box(52, 0.1, 51, grama, OX, 0.05, -9 - 25.5), 3));
  const linha = (d) => [[OX - 6, 0], [OX - 4.2, -2], [OX + 4.2, -2], [OX + 6, 0], [OX + 6 + d, 0], [OX + 4.2 + d * 0.7, -2 - d], [OX - 4.2 - d * 0.7, -2 - d], [OX - 6 - d, 0]];
  W3.manta = prisma(linha(0.08), -9, Z1 + 0.01, mat(0x1c1c1c, { roughness: 0.6 })); PF.add(W3.manta);
  W3.argilaL = prisma(linha(0.4), -9, Z1 + 0.005, argila, 1.5); PF.add(W3.argilaL);
  W3.aguaLago = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM.clone()); PF.add(W3.aguaLago);
  W3.algaCor = new T3.Color(0x4f8a2a); W3.aguaCor = new T3.Color(0x2f7fc0);
  W3.peixes = [...Array(7)].map((_, i) => { const g = grupo(PF); const c = new T3.Mesh(new T3.SphereGeometry(0.28, 14, 10), mat(i % 3 === 1 ? 0xf4f0e8 : 0xff7a1a, { roughness: 0.4 })); c.scale.set(1.8, 0.6, 0.7); g.add(c); const r = new T3.Mesh(new T3.ConeGeometry(0.2, 0.35, 8), c.material); r.rotation.z = Math.PI / 2; r.position.x = -0.6; g.add(r); g.userData = { f: rnd(i * 3.7), a: rnd(i * 5.1) }; return g; });
  W3.plantas = grupo(PF); for (let k = 0; k < 40; k++) { const lado = k % 2 ? 1 : -1, hh = 0.8 + rnd(k) * 0.9; const c = cyl(0.03, 0.05, hh, mat(0x4f8f3a), 5, W3.plantas); c.position.set(OX + lado * (6.2 + rnd(k * 3) * 1.3), hh / 2, -7 + rnd(k * 5) * 9); c.rotation.z = (rnd(k * 7) - 0.5) * 0.3; }
  W3.bombaL = grupo(PF); box(1.4, 1.1, 1.2, mat(0x3c6fa8, { metalness: 0.3, roughness: 0.4 }), OX + 7.6, 0.55, -2, W3.bombaL); box(1.0, 0.9, 1.0, mat(0x2b2b2b), OX + 7.6, 1.55, -2, W3.bombaL);
  // barragem / dique (trapezio extrudado ao longo de z) e cidade
  const dims = { represa: { b: 8, c: 1.5, h: 4.2 }, dique: { b: 6, c: 1.6, h: 3.2 } };
  W3.dims = dims; W3.barr = {};
  for (const k of ['represa', 'dique']) {
    const d = dims[k], g = grupo(PF);
    const pe = k === 'dique' ? [[OX + d.b + 1.5, -1.5], [OX, -1.5], [OX, 0]] : [[OX + d.b, 0]];  // dique: lado de dentro desce ate a terra baixa (baixo = 1.5)
    const corpo = prisma([[OX - d.b, 0], [OX - d.c, d.h], [OX + d.c, d.h], ...pe], Z0, Z1, terra2, 2.2); g.add(corpo);
    const nuc = new T3.Mesh(new T3.ShapeGeometry((() => { const s = new T3.Shape(); s.moveTo(OX - 2.6, 0); s.lineTo(OX - 0.8, d.h - 0.3); s.lineTo(OX + 0.8, d.h - 0.3); s.lineTo(OX + 2.6, 0); s.closePath(); return s; })()), argila); nuc.position.z = ZF + 0.01; g.add(nuc); uvMundo(nuc, 1.5);
    const enr = prisma([[OX - d.b - 0.5, 0], [OX - d.c - 0.25, d.h + 0.1], [OX - d.c + 0.25, d.h + 0.1], [OX - d.b + 0.6, 0]], Z0, Z1 + 0.03, rocha, 1.2); g.add(enr);
    const vert = prisma([[OX - d.c - 0.1, d.h + 0.02], [OX + d.c, d.h + 0.02], [OX + d.b + 0.4, 0.02], [OX + d.b + 0.4, 0.3], [OX + d.c, d.h + 0.32], [OX - d.c - 0.1, d.h + 0.32]], -8, -2, conc, 2); g.add(vert);
    const dren = prisma([[OX + d.b * 0.45, 0], [OX + d.b + 0.6, 0], [OX + d.b + 0.6, 0.5], [OX + d.b * 0.7, 0.5]], Z0, Z1 + 0.02, cascalho, 1); g.add(dren);
    W3.barr[k] = { g, corpo, nuc, enr, vert, dren, d };
  }
  W3.cortina = box(0.25, 5.3, Z1 - Z0, mat(0x6c747c, { metalness: 0.5, roughness: 0.5 }), OX, -2.65 + 0.1, (Z0 + Z1) / 2, PF);
  W3.represaAgua = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM); PF.add(W3.represaAgua);
  W3.sobre = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM); PF.add(W3.sobre);
  W3.cheia = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM); PF.add(W3.cheia);
  W3.vertAgua = new T3.Mesh(new T3.BufferGeometry(), W3.aguaM); PF.add(W3.vertAgua);
  W3.cidade = grupo(PF); [[OX + 13, -3, 0xe8dcc4], [OX + 17, -7, 0xd9c7a0], [OX + 21, -2.5, 0xcfd8dc], [OX + 15.5, -12, 0xe3c9b5], [OX + 22, -10, 0xe8dcc4]].forEach(([a, b, c]) => casinha(a, b, c, W3.cidade));
  W3.fervura = new T3.Mesh(new T3.ConeGeometry(0.7, 0.35, 16), areia); W3.fervura.position.set(OX + 9, 0, 1.2); PF.add(W3.fervura);
  W3.canoBomba = grupo(PF);
  // gotas (vazamento, bomba, transbordo) e chuva
  W3.gotas = [...Array(NP)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.11, 8, 6), new T3.MeshBasicMaterial({ color: 0x5fb6ff })); m.userData = { f: rnd(i * 2.7), a: rnd(i * 6.1), b: rnd(i * 8.3) }; scene.add(m); return m; });
  W3.chuva = [...Array(120)].map((_, i) => { const m = new T3.Mesh(new T3.BoxGeometry(0.03, 0.5, 0.03), new T3.MeshBasicMaterial({ color: 0xc8dcf0, transparent: true, opacity: 0.7 })); m.userData = { f: rnd(i * 1.9), x: (rnd(i * 3.3) - 0.5) * 30, z: (rnd(i * 5.7) - 0.7) * 14 }; scene.add(m); return m; });
}

function atualiza(t, ctx) {
  const p = ctx.p, lt = ctx.lt, P = W3.ponte, perfil = p.perfil, emPerfil = !!perfil || ['represa', 'crista', 'jusante', 'dique', 'sob', 'lago'].includes(p.foco);
  W3.S = { p, lt, emPerfil };
  const cx = emPerfil ? OX : 0;
  sun.position.set(cx - 10, 18, 14); sun.target.position.set(cx, 0, 0);
  const lama = !!p.lama, aguaMat = lama ? W3.lamaM : W3.aguaM;
  // ---------- VALE ----------
  const L = V(p.agua, lt, -1.7), aterro = !!p.aterro, rompe = V(p.rompe, lt);
  const lam = V(p.lamina, lt), Lb = p.agua_baixo !== undefined ? V(p.agua_baixo, lt) : L;
  const Lc = lam > 0.01 ? Math.max(L, 0.52 + lam) : L;
  const r2 = v => Math.round(v * 50) / 50;
  W3.aguaCima.material = W3.aguaBaixo.material = aguaMat;
  if (aterro) {
    geoDe(W3.aguaCima, 'c' + r2(Lc), () => prismaGeo(aguaValePts(r2(Lc)), Z0, -1.62));
    geoDe(W3.aguaBaixo, 'b' + r2(Lb), () => prismaGeo(aguaValePts(r2(Lb)), 1.62, ZF));
  } else {
    geoDe(W3.aguaCima, 'c' + r2(L), () => prismaGeo(aguaValePts(r2(L)), Z0, -1.3));
    geoDe(W3.aguaBaixo, 'b' + r2(L), () => prismaGeo(aguaValePts(r2(L)), -1.3, ZF));
  }
  W3.aguaCima.visible = W3.aguaBaixo.visible = !emPerfil || true;
  const forteza = 0.6 + Math.max(0, L + 1.7) * 0.6;
  W3.espuma.forEach((m, i) => {
    const u = m.userData, q = (t * 0.25 * forteza + u.f) % 1, zz = lerp(-18, ZF - 0.2, q), lv = aterro ? (zz < -1.6 ? Lc : Lb) : L;
    const half = lv <= 0 ? BW + (lv - BED) / (-BED) * (VW - BW) : 9;
    m.visible = !emPerfil && !(aterro && Math.abs(zz) < 1.7);
    m.position.set((u.a - 0.5) * 2 * half * 0.8, lv + 0.02, zz);
  });
  // pontes
  const tipo = p.ponte, q = V(p.quebra, lt), leva = V(p.leva, lt), pod = V(p.podre, lt);
  P.tronco.visible = tipo === 'tronco';
  P.encontros.visible = ['tabuas', 'pilar', 'trelica'].includes(tipo);
  P.tab.visible = ['tabuas', 'pilar', 'trelica'].includes(tipo);
  P.pilar.visible = tipo === 'pilar';
  P.arco.visible = tipo === 'arco'; P.trel.visible = tipo === 'trelica';
  const des = leva > 0 ? { z: ease(leva) * 9, r: ease(leva) * 0.7, y: -ease(leva) * 1.2 } : { z: 0, r: 0, y: 0 };
  for (const g of [P.tronco, P.tab, P.trel]) { g.position.set(0, des.y, des.z); g.rotation.y = des.r; }
  P.pilar.scale.y = 0.35 - BED + 0.6; P.pilar.position.y = (BED - 0.6 + 0.24) / 2 + 0.06;
  const junta = !!p.junta, cal = V(p.calor, lt), gap = junta ? clamp(0.32 - 0.26 * cal) : 0, emp = V(p.empena, lt);
  const podM = W3.podreM = W3.podreM || mat(0x4a4632, { roughness: 1 });
  P.meias.forEach(h => {
    const Lh = 6.5 - gap / 2;
    h.me.scale.x = h.corr.scale.x = h.corr2.scale.x = Lh; h.me.position.x = h.corr.position.x = h.corr2.position.x = -h.sx * Lh / 2;
    h.me.material = pod > 0.4 ? podM : W3.mat.madeira;
    h.dedos.visible = junta; h.dedos.position.x = -h.sx * (Lh - 0.15);
    h.corr.visible = h.corr2.visible = tipo !== 'trelica';
    h.piv.rotation.z = h.sx * (q * 0.55) - h.sx * emp * 0.12;
    if (tipo === 'tabuas' && q < 0.02) h.piv.rotation.z = h.sx * (0.012 + pod * 0.03);
  });
  // arco: aduelas uma a uma, pedra-chave, cimbre
  const nPed = Math.round(V(p.pedras, lt, 1) * P.aduelas.length), meio = (P.aduelas.length - 1) / 2;
  const ordem = P.aduelas.map((_, i) => i).sort((a, b) => Math.abs(b - meio) - Math.abs(a - meio));
  P.aduelas.forEach(b => { b.visible = false; b.material = P.pedraAd; });
  ordem.slice(0, nPed).forEach(i => { P.aduelas[i].visible = true; });
  if (p.chave) P.aduelas[Math.round(meio)].material = P.chaveM;
  P.timpano.forEach(m => { m.visible = nPed >= P.aduelas.length; });
  P.cimbre.visible = tipo === 'arco' && !!p.cimbre;
  // aterro e bueiro
  W3.aterro.visible = aterro; W3.estrada.visible = aterro;
  const bu = p.bueiro;
  W3.plugs.sem.visible = aterro && !bu; W3.plugs.cano.visible = aterro && bu === 'cano'; W3.plugs.caixa.visible = aterro && bu === 'caixa';
  W3.aterro.scale.y = 1 - 0.8 * rompe;
  W3.cano.visible = aterro && bu === 'cano'; W3.caixa.visible = aterro && bu === 'caixa';
  W3.galhos.visible = aterro && V(p.entupido, lt) > 0.05; W3.galhos.scale.setScalar(Math.max(0.01, V(p.entupido, lt)));
  W3.enroc.visible = aterro && !!p.enrocamento;
  const topo = BED + (0.52 - BED) * (1 - 0.8 * rompe);
  W3.lamina.visible = W3.cascataV.visible = aterro && lam > 0.01;
  W3.lamina.material = W3.cascataV.material = aguaMat;
  if (lam > 0.01) { W3.lamina.scale.y = lam; W3.lamina.position.y = topo + lam / 2; const hh = Math.max(0.05, topo + lam - Lb); W3.cascataV.scale.y = hh; W3.cascataV.position.y = Lb + hh / 2; }
  W3.carro.visible = !!p.carro;
  const bo = V(p.boia, lt);
  W3.carro.position.set(-1.2 + ease(bo) * 1.8, 0.52 + ease(bo) * 0.3 + Math.sin(t * 3) * 0.03 * bo, 0.2 + ease(bo) * 0.9);
  W3.carro.rotation.set(Math.sin(t * 2.3) * 0.04 * bo, ease(bo) * 0.55, Math.sin(t * 1.7) * 0.05 * bo);

  // ---------- PERFIL ----------
  const lago = perfil === 'lago', bz = perfil === 'represa' || perfil === 'dique' ? W3.barr[perfil] : null;
  const Lp = V(p.agua, lt, lago ? -0.4 : 2.5), baixo = V(p.baixo, lt), rp = V(p.rompe, lt);
  W3.soloE.visible = W3.soloD.visible = W3.gramaE.visible = W3.gramaD.visible = !lago;
  W3.lagoSolo.visible = lago;
  const hD = 3.5 - baixo; W3.soloD.scale.y = hD / 3.5; W3.soloD.position.y = -3.5 + hD / 2; W3.gramaD.position.y = -baixo + 0.05;
  W3.cidade.position.y = -baixo; W3.cidade.visible = !lago;
  for (const k in W3.barr) {
    const b = W3.barr[k], on = bz === b; b.g.visible = on && p.barreira !== 0;
    if (!on) continue;
    b.g.scale.y = Math.max(0.05, 1 - 0.8 * rp);
    b.nuc.visible = !!p.nucleo; b.enr.visible = !!p.enrocamento; b.vert.visible = !!p.vertedouro; b.dren.visible = !!p.dreno;
    b.corpo.material = p.nucleo || p.dreno ? W3.mat.terra2 : W3.mat.terra;
  }
  W3.cortina.visible = !!p.cortina && !!bz;
  W3.represaAgua.visible = !!bz; W3.sobre.visible = W3.cheia.visible = W3.vertAgua.visible = false;
  W3.represaAgua.material = W3.sobre.material = W3.cheia.material = aguaMat;
  if (bz) {
    const d = bz.d, hAt = d.h * Math.max(0.05, 1 - 0.8 * rp), Lr = r2(Math.min(Lp, hAt + 0.6)), xf = OX - d.b + (Math.min(Lr, hAt) / hAt) * (d.b - d.c);
    geoDe(W3.represaAgua, 'r' + perfil + Lr + '_' + r2(hAt), () => prismaGeo([[OX - 26, 0], [OX - d.b, 0], [xf, Math.min(Lr, hAt)], ...(Lr > hAt ? [[OX - d.c, Lr]] : []), [OX - 26, Lr]], Z0, Z1));
    const tb = V(p.transborda, lt);
    if (tb > 0.02) {
      W3.sobre.visible = true; const e = 0.12 + 0.25 * tb;
      geoDe(W3.sobre, 's' + perfil + r2(e) + '_' + r2(hAt), () => prismaGeo([[OX - d.c, hAt], [OX + d.c, hAt], [OX + d.b, 0], [OX + d.b + 1.5, 0], [OX + d.b + 1.5, e], [OX + d.b + 0.2, e], [OX + d.c, hAt + e], [OX - d.c, hAt + e]], Z0, Z1 + 0.02));
    }
    if (p.vertedouro && Lp > d.h - 0.4) { W3.vertAgua.visible = true; geoDe(W3.vertAgua, 'v' + perfil, () => prismaGeo([[OX - d.c - 0.1, d.h + 0.32], [OX + d.c, d.h + 0.32], [OX + d.b + 0.4, 0.3], [OX + d.b + 0.4, 0.5], [OX + d.c, d.h + 0.5], [OX - d.c - 0.1, d.h + 0.5]], -7.6, -2.4)); }
    const en = V(p.enchente, lt);
    if (en > 0.02) { W3.cheia.visible = true; const y0 = -baixo, xi = p.barreira === 0 ? OX - d.b : OX + d.b * 0.8; geoDe(W3.cheia, 'e' + r2(en) + '_' + r2(baixo) + '_' + xi, () => prismaGeo([[xi, y0], [OX + 26, y0], [OX + 26, y0 + en], [xi, y0 + en]], Z0, Z1)); }
  }
  // lago
  W3.manta.visible = lago && !!p.manta; W3.argilaL.visible = lago && !!p.argila;
  W3.aguaLago.visible = lago;
  if (lago) {
    const Ll = r2(Math.min(0, Lp)), k = (Ll + 2) / 2, xl = 4.2 + 1.8 * k;
    geoDe(W3.aguaLago, 'l' + Ll, () => prismaGeo([[OX - xl, Ll], [OX - 4.2, -2], [OX + 4.2, -2], [OX + xl, Ll]], -9, Z1));
    W3.aguaLago.material.color.copy(W3.aguaCor).lerp(W3.algaCor, V(p.algas, lt)); W3.aguaLago.material.opacity = 0.7 + 0.25 * V(p.algas, lt);
  }
  const np = lago ? Math.round(V(p.peixes, lt)) : 0;
  W3.peixes.forEach((g, i) => {
    g.visible = i < np; if (!g.visible) return; const u = g.userData, a = t * (0.35 + u.a * 0.3) + u.f * 6.28;
    g.position.set(OX + Math.cos(a) * (1.5 + u.a * 2), Math.min(0, Lp) - 0.45 - u.f * 0.6, -3.5 + Math.sin(a) * 2.5); g.rotation.y = -a - Math.PI / 2;
  });
  W3.plantas.visible = lago && !!p.plantas; W3.bombaL.visible = lago && !!p.bomba;
  W3.fervura.visible = perfil === 'dique' && V(p.fervura, lt) > 0.02; W3.fervura.position.y = -baixo; W3.fervura.scale.setScalar(Math.max(0.01, V(p.fervura, lt)));
  // gotas: vazamento pela barragem, sob o dique, para o fundo do lago, bomba
  const vz = V(p.vaza, lt), bomba = !!p.bomba;
  W3.gotas.forEach((m, i) => {
    const u = m.userData; m.visible = false; m.material.color.set(lama ? 0xb08a5a : 0x5fb6ff);
    const qq = (t * 0.3 + u.f) % 1;
    if (bz && perfil === 'represa' && vz > u.b * 0.95) {
      const d = bz.d, y0 = 0.3 + u.a * 1.6; let fim = OX + d.b * 0.75, para = 1;
      if (p.nucleo) para = 0.45;
      const k = qq * para, xx = lerp(OX - d.b + y0 * (d.b - d.c) / d.h + 0.3, p.dreno ? OX + d.b * 0.6 : fim, k), yy = lerp(y0, p.dreno ? 0.25 : 0.5 + u.a * 0.3, k);
      m.visible = true; m.position.set(xx, yy, ZF + 0.08);
    } else if (bz && perfil === 'dique' && vz > u.b * 0.95) {
      const lim = p.cortina ? OX - 0.4 : OX + 9, k = qq;
      let xx = lerp(OX - 12, OX + 9, k), yy = -4.5 + u.a * 0.8;
      if (xx > lim) { m.visible = false; return; }
      if (xx > OX + 8) yy = lerp(-4.2, -baixo, (xx - OX - 8));
      m.visible = true; m.position.set(xx, yy, ZF + 0.08);
    } else if (lago && vz > u.b * 0.95 && !p.manta && !p.argila) {
      m.visible = true; m.position.set(OX - 4 + u.a * 8, -2.1 - qq * 1.3, ZF + 0.08);
    } else if (bomba && u.b < 0.5 && (lago || perfil === 'dique')) {
      m.visible = true;
      if (lago) { const pts = [[OX + 3, -1.8], [OX + 7.0, -0.3], [OX + 7.6, 1.9], [OX + 5.4, 0.2]], s = qq * 3, j = Math.min(2, Math.floor(s)), f = s - j; m.position.set(lerp(pts[j][0], pts[j + 1][0], f), lerp(pts[j][1], pts[j + 1][1], f), -2); }
      else { const d = bz ? bz.d : W3.dims.dique, pts = [[OX + 14, -baixo + 0.2], [OX + d.c, d.h + 0.5], [OX - d.b - 1, Lp - 0.3]], s = qq * 2, j = Math.min(1, Math.floor(s)), f = s - j; m.position.set(lerp(pts[j][0], pts[j + 1][0], f), lerp(pts[j][1], pts[j + 1][1], f), -3); }
    }
  });
  // cano da bomba do dique (estatico, montado na 1a vez)
  W3.canoBomba.visible = perfil === 'dique' && bomba;
  if (W3.canoBomba.visible && !W3.canoBomba.children.length) {
    const d = W3.dims.dique, cm = mat(0x7d8790, { metalness: 0.5, roughness: 0.4 });
    barra([OX + 14, -1.3, -3], [OX + d.c, d.h + 0.5, -3], 0.3, cm, W3.canoBomba); barra([OX + d.c, d.h + 0.5, -3], [OX - d.b - 1, 1.6, -3], 0.3, cm, W3.canoBomba);
    box(1.8, 1.6, 1.6, mat(0x3c6fa8), OX + 14.8, -0.7, -3, W3.canoBomba);
  }
  if (W3.canoBomba.visible) W3.canoBomba.position.y = 0;
  // chuva
  const ch = V(p.chuva, lt);
  W3.chuva.forEach(m => { const u = m.userData, qq = (t * 1.4 + u.f) % 1; m.visible = ch > u.f * 0.95; m.position.set(cx + u.x, lerp(12, -1, qq), u.z); });
}

const FOCO = {
  vale: { x: 0, y: -0.4, d: 25, h: 4 }, ponte: { x: 0, y: 0.4, d: 27, h: 4 }, deck: { x: 0, y: 0.5, d: 9, h: 3.5 },
  arco: { x: 0, y: 1.0, d: 28, h: 2.2 }, chave: { x: 0, y: 2.6, d: 13, h: 1.4 }, aterro: { x: 0, y: -0.6, d: 24, h: 4 },
  atras: { x: 0, y: -0.8, d: 19, a: 0, h: 10 }, carro: { x: -0.3, y: 0.6, d: 12, h: 2.2 },
  represa: { x: OX - 2, y: 1.8, d: 40, h: 3 }, crista: { x: OX + 2, y: 2.4, d: 22, h: 2.2 }, jusante: { x: OX + 13, y: 0.4, d: 26, h: 3.5 },
  dique: { x: OX + 1, y: 0, d: 36, h: 2.5 }, sob: { x: OX, y: -2.2, d: 28, h: 2.6 }, lago: { x: OX + 1, y: -0.4, d: 26, h: 3.2 },
  geral: { x: 0, y: 0, d: 40, h: 4 },
};
function camera(t, ctx) {
  const pad = ctx.p.perfil ? { ...FOCO.represa, ...(ctx.p.perfil === 'lago' ? FOCO.lago : ctx.p.perfil === 'dique' ? FOCO.dique : {}) } : FOCO.vale;
  cameraPadrao(t, ctx, { a: 0, ...pad, zFoco: Z1 }, p => {
    const base = p.perfil ? (p.perfil === 'lago' ? FOCO.lago : p.perfil === 'dique' ? FOCO.dique : FOCO.represa) : FOCO.vale;
    return { a: 0, ...base, ...(FOCO[p.foco] || {}) };
  });
}

function overlay(t, ctx) {
  const S = W3.S, p = S.p, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)';
  const cor = p.cor === 'red' ? COL.red : p.cor === 'green' ? COL.green : branco, fg = p.cor === 'red' || p.cor === 'green' ? '#fff' : COL.ink;
  if (p.rotulo) pill(W / 2, H * 0.12, p.rotulo, cor, fg, 44, s);
  const ox = S.emPerfil ? OX : 0;
  (p.marcas || []).forEach((m, i) => { const [px, py] = proj(m.x + ox, m.y, ZF + 0.05); pill(px, py, m.t, m.cor === 'red' ? COL.red : m.cor === 'green' ? COL.green : branco, m.cor ? '#fff' : COL.ink, 34, back((t - ctx.t0 - 0.25 - i * 0.15) * 3)); });
  const seta = (x0, y0, x1, y1, c) => { x.save(); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 14; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); x.beginPath(); x.moveTo(x1 + Math.cos(a) * 26, y1 + Math.sin(a) * 26); x.lineTo(x1 + Math.cos(a + 2.4) * 34, y1 + Math.sin(a + 2.4) * 34); x.lineTo(x1 + Math.cos(a - 2.4) * 34, y1 + Math.sin(a - 2.4) * 34); x.fill(); x.restore(); };
  // forca descendo pelo arco ate as margens
  const fo = V(p.forca, S.lt);
  if (fo > 0.02 && p.ponte === 'arco') {
    const { R, CY, AL } = W3.arcoR;
    x.globalAlpha = fo;
    const [ax, ay] = proj(0, CY + R + 1.4, 1.4), [bx, by] = proj(0, CY + R + 0.4, 1.4); seta(ax, ay, bx, by, COL.red);
    for (const sx of [-1, 1]) {
      const k = (t * 0.6) % 1;
      for (let j = 0; j < 3; j++) {
        const a0 = Math.PI / 2 + sx * (j / 3) * (Math.PI / 2 - AL), a1 = Math.PI / 2 + sx * ((j + 0.8) / 3) * (Math.PI / 2 - AL);
        const [px0, py0] = proj((R + 0.3) * Math.cos(a0), CY + (R + 0.3) * Math.sin(a0), 1.4), [px1, py1] = proj((R + 0.3) * Math.cos(a1), CY + (R + 0.3) * Math.sin(a1), 1.4);
        seta(px0, py0, px1, py1, k > j / 3 ? COL.yellow : COL.red);
      }
    }
    x.globalAlpha = 1;
  }
  // agua empurrando a barragem/dique
  const em = V(p.empurra, S.lt);
  if (em > 0.02 && p.perfil && p.perfil !== 'lago') {
    const d = W3.dims[p.perfil], Lp = V(p.agua, S.lt, 2.5);
    x.globalAlpha = em;
    for (const f of [0.25, 0.55, 0.85]) { const yy = Lp * (1 - f), xf = OX - d.b + (yy / d.h) * (d.b - d.c), [ax, ay] = proj(xf - 1.2 - f * 2.2, yy, ZF), [bx, by] = proj(xf - 0.2, yy, ZF); seta(ax, ay, bx, by, COL.red); }
    x.globalAlpha = 1;
  }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
