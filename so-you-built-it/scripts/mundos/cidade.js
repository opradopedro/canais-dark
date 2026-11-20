// Mundo "cidade": avenida de cidade grande em CORTE (PLANO-KIRO-MUNDOS.md, mundo 1; feito pelo Claude na rotina de 20/11/2026).
// A avenida corre para longe da camera (eixo z), entre predios altos dos dois lados. O corte (face em z = ZF) mostra
// o subsolo da rua: asfalto, base, terra, argila e rocha, e as redes que o roteiro liga por parametro.
// Sem etapas fixas (igual terreno/riacho/campo): cada cena diz o estado em "p"; [a, b] anima de a ate b na cena.
//
// p aceito (tudo opcional):
//  foco: "geral" | "rua" | "sub" | "cano" | "esgoto" | "metro" | "fundo" | "tunel" | "tanque" | "poco"   (enquadramento)
//  -- superficie --
//  meiofio: 1 (calcadas com guia; sem isso a rua e chata de predio a predio)   abaulado: 1 (rua mais alta no meio)
//  chuva: 0..1   alaga: m de agua na rua (ex.: [0, 0.6])   carros: n (0..6, parados nas faixas)   boia: 0..1 (carros boiando)
//  engarrafa: 1 (fila de carros ate o fundo)   sujo: 0..1 (agua marrom na rua)   moscas: 0..1
//  -- drenagem --
//  boca: 1 (boca de lobo nas duas guias, com grelha e cano ate a galeria)   galeria: "pequena" | "grande" (cano de chuva sob a rua)
//  galeria_cheia: 0..1   pv: 1 (poco de visita com tampa no meio da rua)   tampa_voa: 0..1 (a tampa pula com um jato de agua)
//  -- G-Cans (Toquio) --
//  tunel: 1 (tunel gigante na rocha, y = -12)   enche_tunel: 0..1   poco: 1 (poco vertical gigante a esquerda, x = -12)
//  tanque: 1 (salao com pilares a direita, x 4..15)   enche_tanque: 0..1   bombas: 1 (bombas + setas para o rio)   escoa: 0..1 (setas da agua descendo)
//  -- esgoto --
//  valeta: 1 (canaleta aberta no meio da rua)   esgoto: 1 (cano de tijolo oval sob a rua, x = -3.2)   esgoto_nivel: 0..1
//  ligacoes: 1 (canos dos predios ate o esgoto)   transborda: 0..1 (esgoto sobe pela tampa e suja a rua)
//  tratamento: 1 (seta "TO TREATMENT" no fim do esgoto)
//  -- agua --
//  agua: 1 (adutora azul sob a rua, x = 3.4)   pressao: 0..1 (setas no cano)   vaza: 0..1 (vazamento: mancha molhada sobe)
//  buraco: 0..1 (a rua afunda sobre o vazamento)   estoura: 0..1 (jato de agua sai pela rua)   registro: 1 (registros na rua e no cano)
//  anel: 1 (segundo cano, x = -6.8: a rede em anel)
//  -- metro (vala a ceu aberto e tampada) --
//  vala: 0..1 (a vala no meio da rua vai sendo cavada ate 7 m)   desaba: 0..1 (as paredes de terra caem para dentro)
//  paredes: 1 (paredes-diafragma de concreto nos dois lados)   escoras: n (0..3 escoras de aco atravessando)
//  lencol: nivel da agua do solo em m (ex.: -3)   infiltra: 0..1 (agua entrando no fundo da vala)
//  laje: 1 (laje de cobertura: a vala vira tunel e a rua volta por cima)   trilho: 1   trem: 0..1 (trem chega no tunel)
//  -- geral --
//  rotulo: "TEXTO"   cor: "red" | "green" | "white"   marcas: [{"t": "Clay", "x": 0, "y": -3}]
(() => {
const X0 = -16, X1 = 16, Z0 = -3.5, Z1 = 2.5, ZF = Z1 + 0.06;
const Y = { asf: -0.3, base: -0.8, terra: -4.2, argila: -9, fundo: -26 };
const RX = 6, CX = 9; // meia largura da rua e fim da calcada
const XG = 0, YG = -2.4, XE = -3.2, YE = -4.6, XA = 3.4, YA = -1.4, XAN = -6.8, XPV = 1.6;
const XT = 0, YT = -12.4, RT = 2.3, XPO = -12, XTQ0 = 4.5, XTQ1 = 15.5, YTQ0 = -15.6, YTQ1 = -9.2;
const VX0 = -4.6, VX1 = 4.6, VY = -7; // vala do metro
const W3 = {};
const V = (v, lt, d = 0) => v === undefined || v === null ? d : Array.isArray(v) ? lerp(v[0], v[1], ease(clamp(lt * 1.6))) : v;
const basic = (c, o = {}) => new T3.MeshBasicMaterial({ color: c, ...o });
const aguaM = (op = 0.55) => basic(0x3f9fe3, { transparent: true, opacity: op, depthWrite: false });

function janelas(seed, base) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 1024; const cx = cv.getContext('2d');
  cx.fillStyle = base; cx.fillRect(0, 0, 256, 1024);
  for (let r = 0; r < 26; r++) for (let i = 0; i < 4; i++) {
    const acesa = rnd(seed + r * 7 + i * 3) > 0.82, g = cx.createLinearGradient(0, r * 40, 0, r * 40 + 28);
    g.addColorStop(0, acesa ? '#f6d98a' : '#8fb2d4'); g.addColorStop(1, acesa ? '#d9a84e' : '#3f5f86');
    cx.fillStyle = g; cx.fillRect(14 + i * 60, 8 + r * 40, 44, 26);
  }
  const tx = new T3.CanvasTexture(cv); tx.colorSpace = T3.SRGBColorSpace; tx.wrapS = tx.wrapT = T3.RepeatWrapping; return tx;
}
// disco "furo" no corte: um tubo visto de frente (anel + interior + agua)
function tubo(px, py, r, anelM, dentro, pai = scene, esp = 0.16) {
  const g = grupo(pai); g.position.set(px, py, ZF + 0.01);
  const an = new T3.Mesh(new T3.RingGeometry(r, r + esp, 48), anelM); g.add(an);
  const fu = new T3.Mesh(new T3.CircleGeometry(r, 48), basic(dentro)); fu.position.z = -0.005; g.add(fu);
  // agua dentro: retangulo recortado pelo circulo (aproximado por varias faixas)
  const ag = grupo(g); ag.userData.r = r;
  for (let k = 0; k < 24; k++) { const yy = -r + (k + 0.5) * (2 * r / 24), w = 2 * Math.sqrt(Math.max(0, r * r - yy * yy)); const m = new T3.Mesh(new T3.PlaneGeometry(w, 2 * r / 24 + 0.002), aguaM(0.85)); m.position.set(0, yy, 0.002); ag.add(m); }
  g.userData.agua = ag; return g;
}
function nivelTubo(g, f, cor) { const ag = g.userData.agua, r = ag.userData.r; ag.children.forEach((m, k) => { const yy = -r + (k + 0.5) * (2 * r / 24); m.visible = f > 0.01 && yy < -r + 2 * r * f; if (cor) m.material.color.setHex(cor); }); }
function carro(cor, pai = scene) {
  const g = grupo(pai);
  box(1.8, 0.7, 4.2, mat(cor, { metalness: 0.4, roughness: 0.4 }), 0, 0.55, 0, g);
  box(1.6, 0.6, 2.2, mat(0x2b3a4a, { metalness: 0.3, roughness: 0.2 }), 0, 1.15, -0.2, g);
  for (const [a, b] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) { const w = cyl(0.34, 0.34, 0.25, mat(0x151515), 14, g); w.rotation.z = Math.PI / 2; w.position.set(a, 0.34, b); }
  return g;
}
function trem() {
  const g = grupo(); const corpo = mat(0xd9dde2, { metalness: 0.6, roughness: 0.35 }), faixa = mat(0xd23b2f);
  box(3.0, 3.1, 14, corpo, 0, 1.75, -7, g); box(3.02, 0.35, 14, faixa, 0, 1.0, -7, g);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) box(0.02, 0.9, 1.4, basic(0xfff1c2), s * 1.51, 2.3, -1.5 - i * 2.2, g);
  box(2.6, 1.0, 0.05, basic(0x2b3a4a), 0, 2.4, 0.01, g);
  for (const s of [-0.9, 0.9]) { const l = new T3.Mesh(new T3.CircleGeometry(0.18, 16), basic(0xfff6c8)); l.position.set(s, 1.0, 0.03); g.add(l); }
  return g;
}

function monta() {
  // ---- ceu, chao longe e predios ----
  const ceu = new T3.Mesh(new T3.SphereGeometry(220, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new T3.MeshBasicMaterial({ map: textura('ceu', GERA.ceu).tx, side: T3.BackSide, fog: false }));
  ceu.material.map.repeat.set(3, 1); scene.add(ceu);
  scene.fog = new T3.Fog(0xc9d3dc, 60, 210);
  scene.add(sun.target);
  const asf = tmat('asfalto', { relevo: 1 }), conc = W3.conc = tmat('concreto', { relevo: 1.5 }), calcM = tmat('concreto', { relevo: 1, color: 0xcfc9bd });
  const terra = tmat('terra'), argila = tmat('argila'), rocha = tmat('rocha', { relevo: 4 }), base = tmat('cascalho', { relevo: 3 });
  // avenida e calcadas que seguem para longe (so superficie)
  uvMundo(box(2 * RX, 0.3, 160, asf, 0, -0.15, Z0 - 80), 3);
  for (const s of [-1, 1]) { uvMundo(box(CX - RX, 0.45, 160, calcM, s * (RX + CX) / 2, 0.0, Z0 - 80), 2); }
  for (let k = 0; k < 30; k++) box(0.18, 0.02, 2.6, basic(0xf2f2f2), 0, 0.02, Z0 - 2 - k * 6);
  // predios dos dois lados
  const cores = ['#d9d3c7', '#b9b2a6', '#9aa4ad', '#c8b49a', '#a7b8c2'];
  for (const s of [-1, 1]) {
    let z = Z1 + 1;
    for (let i = 0; i < 11; i++) {
      const d = 7 + rnd(i * 3 + s) * 6, h = 14 + rnd(i * 5.1 + s * 2) * 34, w = 9 + rnd(i * 1.7 + s) * 4;
      const tx = janelas(i * 11 + (s > 0 ? 50 : 0), cores[(i + (s > 0 ? 2 : 0)) % cores.length]); tx.repeat.set(Math.round(d / 3), Math.round(h / 10));
      const fm = new T3.MeshStandardMaterial({ map: tx, roughness: 0.6 }), lado = mat(0xb5aea2);
      const txf = tx.clone(); txf.needsUpdate = true; txf.repeat.set(Math.round(w / 3), Math.round(h / 10));
      const ff = new T3.MeshStandardMaterial({ map: txf, roughness: 0.6 });
      const mm = s < 0 ? [fm, lado, mat(0x7d7870), lado, ff, ff] : [lado, fm, mat(0x7d7870), lado, ff, ff];
      box(w, h, d, mm, s * (CX + w / 2), h / 2 + 0.2, z - d / 2);
      z -= d + 0.4;
    }
  }
  // postes de luz
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) { const p = cyl(0.08, 0.1, 6, mat(0x50565c, { metalness: 0.6 }), 8); p.position.set(s * (RX + 0.6), 3.2, Z0 - 2 - k * 14); box(1.2, 0.12, 0.3, mat(0x50565c), s * (RX + 0.1), 6.1, Z0 - 2 - k * 14); }

  // ---- o pedaco em corte (z de Z0 a Z1) ----
  W3.solo = grupo();
  const cam = (x0, x1, y0, y1, m, pai = W3.solo, esc = 2.2) => { const me = box(x1 - x0, y1 - y0, Z1 - Z0, m, (x0 + x1) / 2, (y0 + y1) / 2, (Z0 + Z1) / 2, pai); uvMundo(me, esc); return me; };
  // colunas de solo: esquerda | meio (a vala) | direita
  const colunas = [[X0, VX0, 'esq'], [VX0, VX1, 'meio'], [VX1, X1, 'dir']];
  W3.col = {};
  for (const [a, b, nome] of colunas) {
    const g = W3.col[nome] = grupo(W3.solo);
    cam(a, b, Y.base, Y.asf, base, g, 1.2); cam(a, b, Y.terra, Y.base, terra, g); cam(a, b, Y.argila, Y.terra, argila, g);
  }
  cam(X0, X1, Y.fundo, Y.argila, rocha, W3.solo);
  // superficie do corte: asfalto plano / abaulado + calcadas
  W3.asfE = cam(-RX, VX0, Y.asf, 0, asf, W3.col.esq, 3); W3.asfD = cam(VX1, RX, Y.asf, 0, asf, W3.col.dir, 3);
  W3.asfM = cam(VX0, VX1, Y.asf, 0, asf, W3.col.meio, 3);
  { const s = new T3.Shape(); s.moveTo(-RX, 0); s.quadraticCurveTo(0, 0.5, RX, 0); s.lineTo(RX, 0); s.closePath();
    W3.coroa = new T3.Mesh(new T3.ExtrudeGeometry(s, { depth: Z1 - Z0 + 160, bevelEnabled: false, curveSegments: 16 }), asf); W3.coroa.position.z = Z0 - 160; W3.coroa.receiveShadow = true; uvMundo(W3.coroa, 3); scene.add(W3.coroa); }
  W3.calc = grupo(); for (const s of [-1, 1]) { cam(s < 0 ? -CX : RX, s < 0 ? -RX : CX, 0, 0.22, calcM, W3.calc, 2); box(0.2, 0.25, Z1 - Z0 + 160, conc, s * RX, 0.1, Z0 - 80 + 3, W3.calc); }
  W3.chato = grupo(); for (const s of [-1, 1]) cam(s < 0 ? -CX : RX, s < 0 ? -RX : CX, Y.asf, 0, asf, W3.chato, 3);
  cam(X0, -CX, Y.asf, 0.2, calcM, W3.solo, 2); cam(CX, X1, Y.asf, 0.2, calcM, W3.solo, 2);
  // agua do solo (faixa azul no corte)
  W3.lencol = box(X1 - X0, 1, 0.02, aguaM(0.3), 0, 0, ZF, W3.solo);
  W3.lencolLados = [[X0, VX0], [VX1, X1]].map(([a, b]) => box(b - a, 1, 0.02, aguaM(0.3), (a + b) / 2, 0, ZF, W3.solo));

  // ---- drenagem ----
  const anelC = mat(0xa9a59c, { roughness: 0.7 }), ferro = mat(0x2c2f33, { metalness: 0.7, roughness: 0.4 });
  W3.galP = tubo(XG, YG, 0.35, anelC, 0x1a1a1a); W3.galG = tubo(XG, YG, 1.15, anelC, 0x161616, scene, 0.25);
  W3.bocas = grupo();
  for (const s of [-1, 1]) {
    box(0.9, 0.06, 0.9, ferro, s * (RX - 0.55), 0.03, Z1 - 0.9, W3.bocas);
    for (let k = 0; k < 5; k++) box(0.06, 0.07, 0.8, basic(0x111111), s * (RX - 0.55) - 0.32 + k * 0.16, 0.05, Z1 - 0.9, W3.bocas);
    box(0.9, -YG - 0.2, 0.05, basic(0x1c1c1c), s * (RX - 0.55), (YG + 0.2) / 2 - 0.05, ZF + 0.005, W3.bocas);
    box(Math.abs(s * (RX - 0.55)) - 1.0, 0.36, 0.05, basic(0x1c1c1c), s * ((RX - 0.55) + 1.0) / 2, YG, ZF + 0.006, W3.bocas);
  }
  W3.bocaAgua = [-1, 1].map(s => { const m = box(0.7, 1, 0.02, aguaM(0.8), s * (RX - 0.55), 0, ZF + 0.02, W3.bocas); return m; });
  W3.pv = grupo(); box(1.0, -YG - 1.1, 0.05, basic(0x1e1e1e), XPV, (YG + 1.1) / 2 - 0.15, ZF + 0.004, W3.pv);
  W3.tampa = cyl(0.55, 0.55, 0.08, ferro, 24, W3.pv); W3.tampa.position.set(XPV, 0.05, Z1 - 0.7);
  W3.jato = [...Array(40)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.1, 6, 5), basic(0x6fc0ff)); m.userData.f = rnd(i * 3.3); scene.add(m); return m; });

  // ---- G-Cans: tunel, poco, tanque ----
  W3.tun = tubo(XT, YT, RT, anelC, 0x101214, scene, 0.4);
  W3.poco = grupo(); box(3.0, -YT, 0.05, basic(0x121416), XPO, YT / 2, ZF + 0.004, W3.poco);
  for (const s of [-1, 1]) box(0.35, -YT, 0.06, anelC, XPO + s * 1.67, YT / 2, ZF + 0.006, W3.poco);
  box(Math.abs(XPO - XT) - RT, 1.6, 0.05, basic(0x121416), (XPO + XT - RT) / 2, YT, ZF + 0.005, W3.poco);
  W3.pocoAgua = box(3.0, 1, 0.02, aguaM(0.85), XPO, 0, ZF + 0.012, W3.poco);
  W3.tq = grupo(); box(XTQ1 - XTQ0, YTQ1 - YTQ0, 0.05, basic(0x1a1c1f), (XTQ0 + XTQ1) / 2, (YTQ0 + YTQ1) / 2, ZF + 0.004, W3.tq);
  for (let k = 0; k < 6; k++) box(0.55, YTQ1 - YTQ0, 0.07, anelC, XTQ0 + 1.0 + k * 1.95, (YTQ0 + YTQ1) / 2, ZF + 0.01, W3.tq);
  box(XTQ0 - XT - RT + 0.2, 1.4, 0.05, basic(0x121416), (XT + RT + XTQ0) / 2, YT - 0.3, ZF + 0.005, W3.tq);
  W3.tqAgua = box(XTQ1 - XTQ0, 1, 0.02, aguaM(0.75), (XTQ0 + XTQ1) / 2, 0, ZF + 0.008, W3.tq);
  W3.bombas = grupo(); for (let k = 0; k < 3; k++) { box(0.8, 1.1, 0.1, mat(0x2f6fb5, { metalness: 0.4 }), XTQ1 - 0.8, YTQ1 - 1 - k * 1.5, ZF + 0.03, W3.bombas); }
  box(0.4, -YTQ1 + 0.2, 0.05, basic(0x1a1c1f), XTQ1 - 0.2, YTQ1 / 2, ZF + 0.004, W3.bombas);

  // ---- esgoto ----
  W3.esg = tubo(XE, YE, 0.85, mat(0x9a4a32, { roughness: 0.9 }), 0x141110, scene, 0.28); W3.esg.scale.set(0.85, 1.15, 1);
  W3.valeta = grupo(); box(1.0, 0.25, Z1 - Z0 + 160, basic(0x3a3328), XE, 0.0, Z0 - 77, W3.valeta);
  W3.valetaAgua = box(0.9, 0.04, Z1 - Z0 + 160, basic(0x6a5236), XE, 0.09, Z0 - 77, W3.valeta);
  W3.lig = grupo(); for (const s of [-1, 1]) { const xx0 = s * CX, xx1 = XE + s * 0.7; box(Math.abs(xx1 - xx0), 0.18, 0.05, mat(0x8a8f94), (xx0 + xx1) / 2, -1.9 - (s > 0 ? 0.5 : 0), ZF + 0.007, W3.lig); box(0.18, 2.1 + (s > 0 ? 0.5 : 0), 0.05, mat(0x8a8f94), xx0, -0.85 - (s > 0 ? 0.25 : 0), ZF + 0.007, W3.lig); }
  W3.lig.children[0].rotation.z = -0.06; W3.lig.children[2].rotation.z = 0.14;
  W3.sujeira = box(2 * RX, 0.05, Z1 - Z0 + 40, basic(0x6a5236, { transparent: true, opacity: 0.85 }), 0, 0.06, Z0 - 17);

  // ---- agua ----
  const azul = mat(0x2f6fb5, { metalness: 0.3, roughness: 0.4 });
  W3.adu = tubo(XA, YA, 0.32, azul, 0x0f2a48, scene, 0.12); nivelTubo(W3.adu, 1);
  W3.anel = tubo(XAN, YA, 0.32, azul, 0x0f2a48, scene, 0.12); nivelTubo(W3.anel, 1);
  W3.molhado = box(2.6, 1, 0.02, basic(0x1d2f45, { transparent: true, opacity: 0.55, depthWrite: false }), XA, 0, ZF + 0.003);
  W3.furo = new T3.Mesh(new T3.CircleGeometry(1.2, 24), basic(0x14100c)); W3.furo.rotation.x = -Math.PI / 2; W3.furo.position.set(XA, 0.03, Z1 - 1.2); scene.add(W3.furo);
  W3.reg = grupo(); for (const xx of [XA - 1.2, XAN + 1.2]) { cyl(0.22, 0.22, 0.05, ferro, 12, W3.reg).position.set(xx, 0.03, Z1 - 0.6); box(0.14, -YA - 0.3, 0.05, mat(0x3a3f45), xx, YA / 2 + 0.1, ZF + 0.008, W3.reg); const v = new T3.Mesh(new T3.TorusGeometry(0.22, 0.05, 6, 16), basic(0xd23b2f)); v.position.set(xx, YA + 0.45, ZF + 0.02); W3.reg.add(v); }

  // ---- metro ----
  W3.vala = grupo();
  W3.valaFundo = box(VX1 - VX0, 0.1, Z1 - Z0, terra, 0, 0, (Z0 + Z1) / 2, W3.vala);
  W3.valaTras = uvMundo(box(VX1 - VX0, 1, 0.1, terra, 0, 0, Z0 + 0.05, W3.vala), 2.2);
  W3.valaLado = [-1, 1].map(s => uvMundo(box(0.06, 1, Z1 - Z0, terra, s * (VX1 - 0.03), 0, (Z0 + Z1) / 2, W3.vala), 2.2));
  W3.desab = [-1, 1].map(s => { const sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(-s * 2.6, 0); sh.lineTo(0, 3.2); sh.closePath(); const me = new T3.Mesh(new T3.ExtrudeGeometry(sh, { depth: Z1 - Z0, bevelEnabled: false }), tmat('terra', { relevo: 5 })); me.position.set(s * VX1, 0, Z0); me.castShadow = true; uvMundo(me, 2); scene.add(me); return me; });
  W3.paredes = grupo(); for (const s of [-1, 1]) uvMundo(box(0.6, -VY + 2.2, Z1 - Z0, conc, s * (VX1 - 0.3), (VY - 2.2) / 2, (Z0 + Z1) / 2, W3.paredes), 1.5);
  W3.escoras = [-1.6, -3.4, -5.2].map(yy => { const g = grupo(); box(VX1 - VX0 - 1.2, 0.35, 0.35, mat(0xd8a12a, { metalness: 0.5, roughness: 0.4 }), 0, yy, Z1 - 0.6, g); box(VX1 - VX0 - 1.2, 0.35, 0.35, mat(0xd8a12a, { metalness: 0.5, roughness: 0.4 }), 0, yy, Z0 + 1.2, g); return g; });
  W3.infil = box(VX1 - VX0 - 0.1, 1, Z1 - Z0, aguaM(0.6), 0, 0, (Z0 + Z1) / 2, W3.vala);
  W3.laje = grupo(); uvMundo(box(VX1 - VX0, 0.6, Z1 - Z0, conc, 0, -1.4, (Z0 + Z1) / 2, W3.laje), 1.5);
  uvMundo(box(VX1 - VX0, 0.6, Z1 - Z0, conc, 0, VY + 0.3, (Z0 + Z1) / 2, W3.laje), 1.5);
  W3.sobLaje = cam(VX0, VX1, Y.argila, VY, argila, W3.laje);
  W3.valaSob = uvMundo(box(VX1 - VX0, 1, Z1 - Z0, argila, 0, 0, (Z0 + Z1) / 2, W3.vala), 2.2);
  W3.reaterro = grupo(W3.laje); cam(VX0, VX1, -1.1, Y.asf, base, W3.reaterro, 1.2); cam(VX0, VX1, Y.asf, 0, asf, W3.reaterro, 3);
  W3.luzTun = new T3.PointLight(0xfff0d0, 0, 14); W3.luzTun.position.set(0, -3, 0.5); scene.add(W3.luzTun);
  W3.trilho = grupo(); for (const s of [-0.75, 0.75]) box(0.12, 0.15, Z1 - Z0, mat(0x9aa0a6, { metalness: 0.8 }), s, VY + 0.68, (Z0 + Z1) / 2, W3.trilho);
  for (let k = 0; k < 8; k++) box(2.4, 0.12, 0.25, mat(0x6b5a48), 0, VY + 0.6, Z0 + 0.4 + k * 0.75, W3.trilho);
  W3.trem = trem(); W3.trem.position.set(0, VY + 0.6, Z1 - 0.2);

  // ---- carros ----
  const cc = [0xd23b2f, 0x2f6fb5, 0xe8e8e8, 0x2b2b2b, 0xd8a12a, 0x3a7a4a];
  W3.carros = [...Array(6)].map((_, i) => { const g = carro(cc[i]); g.userData = { x: i % 2 ? 2.8 : -2.8, z: Z1 - 6.5 - Math.floor(i / 2) * 7 }; return g; });
  W3.fila = [...Array(14)].map((_, i) => { const g = carro(cc[(i + 3) % 6]); g.position.set(i % 2 ? 2.8 : -2.8, 0, Z0 - 6 - Math.floor(i / 2) * 5.5); return g; });

  // ---- agua da rua e chuva ----
  W3.alaga = box(2 * CX, 1, Z1 - Z0 + 160, aguaM(0.5), 0, 0, Z0 - 77.5 + 0.02);
  W3.alagaF = box(2 * CX, 1, 0.02, aguaM(0.65), 0, 0, ZF + 0.03);
  W3.chuva = [...Array(160)].map((_, i) => { const m = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 0.4, 4), basic(0xb8d8f0, { transparent: true, opacity: 0.6 })); m.userData = { x: lerp(-12, 12, rnd(i * 1.3)), z: lerp(-14, 3.5, rnd(i * 2.9)), f: rnd(i * 4.7) }; scene.add(m); return m; });
}

function atualiza(t, ctx) {
  const p = ctx.p, lt = ctx.lt, S = W3.S = { p, lt };
  sun.position.set(-10, 26, 14); sun.target.position.set(0, 0, 0);
  // superficie
  const mf = !!p.meiofio, ab = !!p.abaulado;
  W3.calc.visible = mf; W3.chato.visible = !mf;
  W3.coroa.visible = ab;
  // vala do metro
  const va = V(p.vala, lt), laje = !!p.laje, prof = va * (-VY);
  const aberta = va > 0.02 && !laje;
  W3.col.meio.visible = !(va > 0.02);
  W3.vala.visible = va > 0.02;
  W3.valaFundo.position.y = -prof; { const hs = Math.max(0.01, -prof - Y.argila); W3.valaSob.scale.y = hs; W3.valaSob.position.y = Y.argila + hs / 2; W3.valaSob.visible = !laje; } W3.valaTras.scale.y = Math.max(0.01, prof); W3.valaTras.position.y = -prof / 2;
  W3.valaLado.forEach(m => { m.scale.y = Math.max(0.01, prof); m.position.y = -prof / 2; });
  const de = V(p.desaba, lt); W3.desab.forEach(m => { m.visible = aberta && de > 0.02; m.scale.set(de, de, 1); m.position.y = -prof; });
  W3.paredes.visible = !!p.paredes;
  const ne = Math.round(V(p.escoras, lt)); W3.escoras.forEach((g, i) => g.visible = aberta && i < ne && -[-1.6, -3.4, -5.2][i] < prof);
  const inf = V(p.infiltra, lt); W3.infil.visible = va > 0.02 && inf > 0.02; W3.infil.scale.y = Math.max(0.01, inf * 1.4); W3.infil.position.y = -prof + inf * 0.7;
  W3.laje.visible = laje; W3.luzTun.intensity = laje ? 30 : 0;
  W3.trilho.visible = !!p.trilho; const tr = V(p.trem, lt); W3.trem.visible = tr > 0.02; W3.trem.position.z = lerp(Z0 - 1, Z1 - 0.2, ease(clamp(tr)));
  W3.asfM.visible = !va || laje;
  // lencol
  const len = p.lencol === undefined ? null : V(p.lencol, lt); W3.lencol.visible = len !== null;
  const corta = len !== null && va > 0.02 && !laje; W3.lencol.visible = len !== null && !corta; W3.lencolLados.forEach(m => m.visible = corta);
  if (len !== null) { const h = len - Y.argila; [W3.lencol, ...W3.lencolLados].forEach(m => { m.scale.y = h; m.position.y = Y.argila + h / 2; }); }
  // drenagem
  W3.galP.visible = p.galeria === 'pequena'; W3.galG.visible = p.galeria === 'grande';
  const gc = V(p.galeria_cheia, lt); nivelTubo(W3.galP, gc); nivelTubo(W3.galG, gc);
  W3.bocas.visible = !!p.boca;
  const chuva = V(p.chuva, lt);
  W3.bocaAgua.forEach(m => { const h = -YG * (p.boca ? clamp(chuva * 1.2) : 0); m.visible = h > 0.05; m.scale.y = Math.max(0.01, h); m.position.y = -h / 2 + 0.0; });
  W3.pv.visible = !!p.pv;
  const tv = V(p.tampa_voa, lt), es = V(p.estoura, lt);
  W3.tampa.position.y = 0.05 + tv * (2.4 + Math.sin(t * 9) * 0.25); W3.tampa.rotation.x = tv * 0.6;
  W3.jato.forEach((m, i) => { const q = (t * 1.6 + m.userData.f) % 1, f = Math.max(tv, es), xx = tv >= es ? XPV : XA, zz = tv >= es ? Z1 - 0.7 : Z1 - 1.2;
    m.visible = f > 0.05; m.position.set(xx + Math.sin(i * 2.1) * 0.25 * q, q * 3.2 * f * (1 - q * 0.5) * 1.6, zz + Math.cos(i * 1.7) * 0.25 * q); m.material.color.setHex(p.transborda ? 0x6a5236 : 0x6fc0ff); });
  // G-Cans
  W3.tun.visible = !!p.tunel; nivelTubo(W3.tun, V(p.enche_tunel, lt));
  W3.poco.visible = !!p.poco;
  const et = V(p.enche_tunel, lt), hp = clamp(et * 1.3) * 3.5; W3.pocoAgua.scale.y = Math.max(0.01, hp); W3.pocoAgua.position.y = YT - 0.8 + hp / 2; W3.pocoAgua.visible = hp > 0.05;
  W3.tq.visible = !!p.tanque; const eq = V(p.enche_tanque, lt), hq = eq * (YTQ1 - YTQ0); W3.tqAgua.visible = hq > 0.05; W3.tqAgua.scale.y = Math.max(0.01, hq); W3.tqAgua.position.y = YTQ0 + hq / 2;
  W3.bombas.visible = !!p.bombas && !!p.tanque;
  // esgoto
  W3.esg.visible = !!p.esgoto; nivelTubo(W3.esg, V(p.esgoto_nivel, lt), 0x6a5236);
  W3.valeta.visible = !!p.valeta; W3.lig.visible = !!p.ligacoes;
  const su = Math.max(V(p.sujo, lt), V(p.transborda, lt)); W3.sujeira.visible = su > 0.03; W3.sujeira.material.opacity = 0.85 * su;
  // agua
  W3.adu.visible = !!p.agua; W3.anel.visible = !!p.anel; W3.reg.visible = !!p.registro;
  const vz = V(p.vaza, lt); W3.molhado.visible = vz > 0.02; W3.molhado.scale.y = Math.max(0.01, vz * 1.6); W3.molhado.position.y = YA + vz * 0.8;
  const bu = V(p.buraco, lt); W3.furo.visible = bu > 0.03; W3.furo.scale.setScalar(0.2 + bu * 0.8);
  // alagamento
  const al = V(p.alaga, lt); W3.alaga.visible = W3.alagaF.visible = al > 0.02;
  W3.alaga.scale.y = W3.alagaF.scale.y = Math.max(0.01, al); W3.alaga.position.y = W3.alagaF.position.y = al / 2 + 0.01;
  const marrom = V(p.sujo, lt) > 0.3 || V(p.transborda, lt) > 0.3; [W3.alaga, W3.alagaF].forEach(m => m.material.color.setHex(marrom ? 0x7a6040 : 0x3f9fe3));
  // carros
  const nc = Math.round(V(p.carros, lt)), boia = V(p.boia, lt);
  W3.carros.forEach((g, i) => { const u = g.userData; g.visible = i < nc && !(aberta && Math.abs(u.x) < VX1 + 1); g.position.set(u.x + boia * Math.sin(t * 0.8 + i) * 0.6, boia * al * 0.55, u.z + boia * Math.sin(t * 0.5 + i * 2) * 1.2); g.rotation.set(boia * 0.08 * Math.sin(t * 1.3 + i), boia * 0.4 * Math.sin(t * 0.4 + i), boia * 0.1 * Math.cos(t * 1.1 + i)); });
  W3.fila.forEach(g => g.visible = !!p.engarrafa);
  // chuva
  W3.chuva.forEach(m => { const u = m.userData, q = (t * 1.5 + u.f) % 1; m.visible = chuva > u.f * 0.95; m.position.set(u.x, lerp(12, 0, q), u.z); });
}

const FOCO = {
  geral: { x: 0, y: -2.5, d: 30, h: 3 }, rua: { x: 0, y: 1.0, d: 15, h: 2.6 }, sub: { x: 0, y: -2.2, d: 13, h: 1.2 },
  cano: { x: 3.0, y: -1.0, d: 7.5, h: 0.8 }, esgoto: { x: -3.0, y: -3.2, d: 9, h: 1 }, metro: { x: 0, y: -3.2, d: 17, h: 1.6 },
  fundo: { x: 0, y: -8, d: 34, h: 1 }, tunel: { x: -3, y: -10.5, d: 24, h: 0.6 }, tanque: { x: 9.5, y: -11.5, d: 19, h: 0.4 },
  poco: { x: -9, y: -6.5, d: 26, h: 0.5 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: -2.2, d: 13, a: 0, h: 1.2, zFoco: Z1 }, p => FOCO[p.foco] || {}); }

function overlay(t, ctx) {
  const S = W3.S, p = S.p, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)';
  const cor = p.cor === 'red' ? COL.red : p.cor === 'green' ? COL.green : branco, fg = p.cor === 'red' || p.cor === 'green' ? '#fff' : COL.ink;
  if (p.rotulo) pill(W / 2, H * 0.12, p.rotulo, cor, fg, 44, s);
  (p.marcas || []).forEach((m, i) => { const [px, py] = proj(m.x, m.y, ZF + 0.05); pill(px, py, m.t, m.cor === 'red' ? COL.red : m.cor === 'green' ? COL.green : branco, m.cor ? '#fff' : COL.ink, 34, back((t - ctx.t0 - 0.25 - i * 0.15) * 3)); });
  const seta = (x0, y0, x1, y1, c) => { x.save(); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 14; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); x.beginPath(); x.moveTo(x1 + Math.cos(a) * 26, y1 + Math.sin(a) * 26); x.lineTo(x1 + Math.cos(a + 2.4) * 34, y1 + Math.sin(a + 2.4) * 34); x.lineTo(x1 + Math.cos(a - 2.4) * 34, y1 + Math.sin(a - 2.4) * 34); x.fill(); x.restore(); };
  const lt = S.lt, q = (t * 0.8) % 1;
  // pressao na adutora: setas correndo dentro do cano (de frente: setas para a camera viram pulsos)
  const pr = V(p.pressao, lt);
  if (pr > 0.02 && p.agua) { x.globalAlpha = pr; for (const k of [0, 0.33, 0.66]) { const qq = (q + k) % 1, [ax, ay] = proj(XA - 1.8 + qq * 1.2, YA + 0.75, ZF + 0.05), [bx, by] = proj(XA - 1.2 + qq * 1.2, YA + 0.75, ZF + 0.05); seta(ax, ay, bx, by, COL.yellow); } x.globalAlpha = 1; }
  // agua descendo pelo poco / pelas bocas de lobo
  const ec = V(p.escoa, lt);
  if (ec > 0.02) { x.globalAlpha = ec;
    if (p.poco) for (const k of [0, 0.5]) { const qq = (q + k) % 1, [ax, ay] = proj(XPO, -1 - qq * 8, ZF + 0.05), [bx, by] = proj(XPO, -2.2 - qq * 8, ZF + 0.05); seta(ax, ay, bx, by, '#6fc0ff'); }
    if (p.boca) for (const sg of [-1, 1]) { const [ax, ay] = proj(sg * (RX - 0.55), -0.3 - q * 1.2, ZF + 0.05), [bx, by] = proj(sg * (RX - 0.55), -1.1 - q * 1.2, ZF + 0.05); seta(ax, ay, bx, by, '#6fc0ff'); }
    if (p.tanque && p.bombas) { const [ax, ay] = proj(XTQ1 - 0.2, YTQ1 + 1 + q * 5, ZF + 0.05), [bx, by] = proj(XTQ1 - 0.2, YTQ1 + 2.2 + q * 5, ZF + 0.05); seta(ax, ay, bx, by, '#6fc0ff'); }
    x.globalAlpha = 1; }
  // empurrao da terra na vala
  if (W3.vala.visible && !p.laje && (V(p.desaba, lt) > 0.02 || p.carga)) { for (const sg of [-1, 1]) for (const yy of [-1.5, -3.5]) { const [ax, ay] = proj(sg * (VX1 + 2.2), yy, ZF), [bx, by] = proj(sg * (VX1 + 0.6), yy, ZF); seta(ax, ay, bx, by, COL.red); } }
  // moscas
  const mo = V(p.moscas, lt);
  if (mo > 0.02) { x.fillStyle = '#111'; for (let i = 0; i < 16 * mo; i++) { const [px, py] = proj(XE + Math.sin(t * 2.3 + i * 1.9) * 1.6, 0.9 + Math.cos(t * 3.1 + i) * 0.6, Z1 - 0.6); x.beginPath(); x.arc(px, py, 5, 0, 6.28); x.fill(); } }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
