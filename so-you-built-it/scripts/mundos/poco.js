// Mundo "poco": quintal com o terreno em corte; buraco -> poco de agua com bomba eletrica e filtro.
// Etapas (p.etapa de cada cena): buraco, desmorona, revestimento, balde, manual, seca, eletrica, filtro, final.
(() => {
const X0 = -14, X1 = 14, Z0 = -3, Z1 = 2.5;
const SH = { x0: -0.8, x1: 0.8, y0: -10, z0: 0.9 };
const SZ = (SH.z0 + Z1) / 2, AQ = -3.6, AQB = -11, BOT = -13.5;
const WT0 = -4.6, WTSECO = -8.4, LIMITE = -7.6, CANO = -7.2, RW = 0.15;
const W3 = {};

function unidade(m) { m.geometry.translate(0, -m.position.y + 0.5, 0); m.position.y = 0; return m; }
function setH(m, y0, y1) { m.visible = y1 - y0 > 0.01; m.position.y = y0; m.scale.y = Math.max(0.001, y1 - y0); }

function monta() {
  quintal();
  if (!GERA.areia) GERA.areia = () => geraTerra(0xc9a56a, 7, 500, [0.6, 1.2]);
  const grass = tmat('grama', { relevo: 1 }), top = tmat('terra'), sub = tmat('terra2'), sand = tmat('areia', { relevo: 2 }), rock = tmat('rocha', { relevo: 4 });
  const camadas = [[-0.18, 0, grass], [-1.6, -0.18, top], [AQ, -1.6, sub], [AQB, AQ, sand], [BOT, AQB, rock]];
  for (const [ya, yb, m] of camadas) {
    const cortes = new Set([ya, yb]);
    if (SH.y0 > ya && SH.y0 < yb) cortes.add(SH.y0);
    const ys = [...cortes].sort((a, b) => a - b);
    for (let i = 0; i + 1 < ys.length; i++) {
      const y0 = ys[i], y1 = ys[i + 1], mid = (y0 + y1) / 2;
      if (mid > SH.y0) {
        solid(X0, SH.x0, y0, y1, Z0, Z1, m, 2.2); solid(SH.x0, SH.x1, y0, y1, Z0, SH.z0, m, 2.2); solid(SH.x1, X1, y0, y1, Z0, Z1, m, 2.2);
      } else solid(X0, X1, y0, y1, Z0, Z1, m, 2.2);
    }
  }
  const tufo = tmat('folhas', { semRelevo: true });
  for (let i = 0; i < 90; i++) {
    const px = lerp(X0, X1, rnd(i * 2.7)); if (px > SH.x0 - 1.9 && px < SH.x1 + 1.9) continue;
    const m = new T3.Mesh(new T3.ConeGeometry(0.06, 0.18 + rnd(i) * 0.12, 4), tufo); m.position.set(px, 0.08, Z1 - 0.05 - rnd(i * 3) * 0.2); scene.add(m);
  }
  // agua no solo (lencol freatico): faixa azul na face do corte
  W3.lencol = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ color: 0x2f8fe0, transparent: true, opacity: 0.38, depthWrite: false }));
  W3.lencol.position.z = Z1 + 0.012; scene.add(W3.lencol);
  W3.linha = new T3.Mesh(new T3.PlaneGeometry(1, 0.06), new T3.MeshBasicMaterial({ color: 0x7fd0ff }));
  W3.linha.position.z = Z1 + 0.014; scene.add(W3.linha);
  // terra dentro do buraco (sai com a escavacao) e monte ao lado
  W3.terra = unidade(solid(SH.x0, SH.x1, 0, 1, SH.z0, Z1 - 0.01, top, 2.2));
  W3.monte = new T3.Mesh(new T3.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), tmat('terra', { relevo: 5 })); W3.monte.position.set(-3.2, 0, 0.6); W3.monte.castShadow = true; scene.add(W3.monte);
  W3.pa = grupo(); box(0.06, 1.3, 0.06, tmat('madeira'), 0, 0.65, 0, W3.pa); box(0.3, 0.38, 0.04, mat(0x8d949b, { metalness: 0.6, roughness: 0.4 }), 0, 0.05, 0, W3.pa);
  W3.pa.position.set(-2.0, 0.2, 1.4); W3.pa.rotation.z = 0.35;
  // agua dentro do poco
  W3.agua = unidade(solid(SH.x0, SH.x1, 0, 1, SH.z0, Z1 - 0.02, mat(0x3f9fe3, { roughness: 0.12, transparent: true, opacity: 0.82 })));
  // desmoronamento: pedacos que caem e o entulho no fundo
  W3.entulho = unidade(solid(SH.x0, SH.x1, 0, 1, SH.z0, Z1 - 0.02, tmat('terra2', { relevo: 5 }), 2.2));
  const cm = [tmat('terra'), tmat('terra2')];
  W3.pedacos = [...Array(16)].map((_, i) => {
    const m = new T3.Mesh(new T3.DodecahedronGeometry(0.16 + rnd(i * 4.1) * 0.16), cm[i % 2]); m.castShadow = true; scene.add(m);
    m.userData = { x: i % 2 ? SH.x0 + 0.2 : SH.x1 - 0.2, y: lerp(-0.6, -3.4, rnd(i * 2.3)), z: lerp(SH.z0 + 0.3, Z1 - 0.2, rnd(i * 7.7)), f: rnd(i * 5.3) * 0.55 };
    return m;
  });
  // aneis de concreto (1 m cada, com junta)
  const conc = tmat('concreto', { relevo: 1.5 });
  W3.aneis = [];
  for (let i = 0; i < 11; i++) {
    const g = grupo(), y0 = SH.y0 + i, y1 = Math.min(y0 + 0.96, 0.3), cy = (y0 + y1) / 2, h = y1 - y0;
    uvMundo(box(RW, h, Z1 - SH.z0, conc, SH.x0 + RW / 2, cy, SZ, g), 1.6);
    uvMundo(box(RW, h, Z1 - SH.z0, conc, SH.x1 - RW / 2, cy, SZ, g), 1.6);
    uvMundo(box(SH.x1 - SH.x0, h, RW, conc, 0, cy, SH.z0 + RW / 2, g), 1.6);
    g.userData.y0 = y0; W3.aneis.push(g);
  }
  // fendas da tela filtrante no anel de baixo (aparecem no filtro)
  W3.fendas = grupo();
  const fm = mat(0x1d2730);
  for (let r = 0; r < 14; r++) for (let c = 0; c < 4; c++) box(0.26, 0.04, 0.02, fm, lerp(-0.5, 0.5, c / 3), SH.y0 + 0.4 + r * 0.3, SH.z0 + RW + 0.012, W3.fendas);
  // sarilho com corda e balde
  const mad = tmat('madeira', { relevo: 1 });
  W3.sarilho = grupo(); W3.sarilho.position.set(0, 0, SZ);
  box(0.12, 1.7, 0.12, mad, -1.15, 0.85, 0, W3.sarilho); box(0.12, 1.7, 0.12, mad, 1.15, 0.85, 0, W3.sarilho);
  const eixo = cyl(0.09, 0.09, 2.4, mad, 12, W3.sarilho); eixo.rotation.z = Math.PI / 2; eixo.position.y = 1.55;
  W3.corda = cyl(0.02, 0.02, 1, mat(0xcaa86a), 6, W3.sarilho); W3.corda.geometry.translate(0, -0.5, 0); W3.corda.position.y = 1.55;
  W3.balde = grupo(W3.sarilho);
  cyl(0.24, 0.18, 0.36, mat(0x8f969c, { metalness: 0.6, roughness: 0.35 }), 18, W3.balde).position.y = -0.18;
  W3.baldeAgua = cyl(0.21, 0.21, 0.04, mat(0x3f9fe3, { roughness: 0.1 }), 18, W3.balde); W3.baldeAgua.position.y = -0.02;
  // tampa de concreto + bomba manual
  W3.tampa = grupo(); W3.tampa.position.set(0, 0, SZ);
  uvMundo(box(2.1, 0.24, Z1 - SH.z0 + 0.3, conc, 0, 0.42, 0, W3.tampa), 1.6);
  W3.manual = grupo(); W3.manual.position.set(0, 0.54, SZ);
  const ferro = mat(0x2f6b45, { roughness: 0.4, metalness: 0.4 });
  cyl(0.15, 0.17, 1.1, ferro, 18, W3.manual).position.y = 0.55;
  cyl(0.19, 0.19, 0.08, ferro, 18, W3.manual).position.y = 1.12;
  box(0.55, 0.1, 0.1, ferro, 0.36, 0.78, 0, W3.manual);
  W3.alavanca = grupo(W3.manual); W3.alavanca.position.set(-0.1, 1.2, 0);
  box(1.0, 0.06, 0.06, ferro, -0.5, 0, 0, W3.alavanca);
  W3.baldeChao = cyl(0.22, 0.17, 0.32, mat(0x8f969c, { metalness: 0.6, roughness: 0.35 }), 18); W3.baldeChao.position.set(0.68, 0.7, SZ + 0.1);
  // cano da bomba manual (transparente para ver a agua subindo)
  W3.cano = cyl(0.07, 0.07, 1, mat(0xf2f4f5, { roughness: 0.25, transparent: true, opacity: 0.45, depthWrite: false }), 14); W3.cano.position.set(0, 0, Z1 - 0.35);
  W3.coluna = cyl(0.05, 0.05, 1, mat(0x3f9fe3, { roughness: 0.1 }), 12); W3.coluna.geometry.translate(0, 0.5, 0); W3.coluna.position.set(0, 0, Z1 - 0.35);
  W3.cano.geometry.translate(0, 0.5, 0);
  const am = mat(0x7fd0ff, { roughness: 0.1 });
  W3.gotas = [...Array(10)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.05, 10, 8), am); scene.add(m); return m; });
  // bomba eletrica submersa, cabo, cano ate a caixa d'agua
  W3.eletrica = grupo();
  const inox = mat(0xc9d0d6, { metalness: 0.75, roughness: 0.25 });
  cyl(0.17, 0.17, 0.9, inox, 18, W3.eletrica).position.y = 0.45;
  cyl(0.18, 0.18, 0.06, mat(0x2b3036), 18, W3.eletrica).position.y = 0.92;
  W3.cano2 = cyl(0.06, 0.06, 1, mat(0x2b4a7a, { roughness: 0.4 }), 12); W3.cano2.geometry.translate(0, 0.5, 0);
  W3.cabo = cyl(0.025, 0.025, 1, mat(0x111111), 6); W3.cabo.geometry.translate(0, 0.5, 0);
  const curva = new T3.CurvePath(), pts = [[0.2, 0.3, Z1 - 0.35], [0.2, 0.9, Z1 - 0.35], [3.6, 0.9, Z1 - 0.35], [3.6, 3.3, Z1 - 0.35]];
  for (let i = 1; i < pts.length; i++) curva.add(new T3.LineCurve3(new T3.Vector3(...pts[i - 1]), new T3.Vector3(...pts[i])));
  W3.saida = { curva, me: new T3.Mesh(new T3.TubeGeometry(curva, 60, 0.06, 10, false), mat(0x2b4a7a, { roughness: 0.4 })) }; W3.saida.me.castShadow = true; scene.add(W3.saida.me);
  W3.caixa = grupo(); W3.caixa.position.set(3.6, 0, Z1 - 0.6);
  for (const [px, pz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) box(0.1, 2.0, 0.1, mad, px, 1.0, pz, W3.caixa);
  box(1.3, 0.1, 1.3, mad, 0, 2.02, 0, W3.caixa);
  cyl(0.68, 0.68, 1.15, mat(0xf0f2f2, { roughness: 0.3, transparent: true, opacity: 0.45, depthWrite: false }), 24, W3.caixa).position.y = 2.65;
  W3.caixaAgua = cyl(0.64, 0.64, 1, mat(0x3f9fe3, { roughness: 0.1 }), 24, W3.caixa); W3.caixaAgua.geometry.translate(0, 0.5, 0); W3.caixaAgua.position.y = 2.1;
  W3.bolhas = [...Array(12)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.05, 8, 6), am); scene.add(m); return m; });
  // filtro: cascalho em volta do fundo, colar de concreto, laje inclinada e chuva
  W3.cascalho = grupo();
  const bm = [mat(0xc9c2b6), mat(0x9b9387), mat(0xe0dad0), mat(0xb0a898)];
  for (let i = 0; i < 140; i++) {
    const lado = i % 2 ? -1 : 1, me = new T3.Mesh(new T3.DodecahedronGeometry(0.07 + rnd(i) * 0.05), bm[i % 4]); me.rotation.set(i, i * 2, i * 3);
    me.position.set(lado * lerp(0.84, 1.3, rnd(i * 2.3)), lerp(SH.y0 + 0.05, -5.6, rnd(i * 6.1)), Z1 + 0.02); W3.cascalho.add(me);
  }
  W3.colar = grupo();
  uvMundo(box(0.26, 1.8, 0.06, conc, SH.x0 - 0.13, -0.9, Z1 + 0.02, W3.colar), 1.6);
  uvMundo(box(0.26, 1.8, 0.06, conc, SH.x1 + 0.13, -0.9, Z1 + 0.02, W3.colar), 1.6);
  W3.laje = grupo(); W3.laje.position.set(0, 0, SZ);
  for (const s of [-1, 1]) { const l = uvMundo(box(1.0, 0.12, Z1 - SH.z0 + 0.4, conc, s * 1.55, 0.2, 0, W3.laje), 1.6); l.rotation.z = -s * 0.12; }
  const sm = mat(0xd9b46a, { roughness: 0.8 });
  W3.graos = [...Array(26)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.06, 8, 6), sm); scene.add(m); m.userData = { l: i % 2 ? -1 : 1, y: lerp(SH.y0 + 0.3, -6.0, rnd(i * 3.9)), f: rnd(i * 8.3) }; return m; });
  const cm2 = mat(0x8fc8ff, { roughness: 0.1, transparent: true, opacity: 0.85 });
  W3.chuva = [...Array(36)].map(() => { const m = new T3.Mesh(new T3.CapsuleGeometry(0.03, 0.22, 4, 6), cm2); scene.add(m); return m; });
}

const ETAPAS = ['buraco', 'desmorona', 'revestimento', 'balde', 'manual', 'seca', 'eletrica', 'filtro', 'final'];
function estado(s, k) {
  const at = (i, f) => s < i ? 0 : s > i ? 1 : ease(clamp(f(k), 0, 1));
  return {
    s, k,
    dig: at(0, k => k * 1.5),
    rub: s === 1 ? ease(clamp(k * 1.6, 0, 1)) : s === 2 ? 1 - ease(clamp(k * 3, 0, 1)) : 0,
    rings: at(2, k => k * 1.8 - 0.25),
    sarilho: s === 3 ? back(clamp(k * 3, 0, 1)) : s === 2 ? 0 : s === 4 ? 1 - ease(clamp(k * 4, 0, 1)) : 0,
    manual: s === 4 ? back(clamp(k * 3 - 0.3, 0, 1)) : s === 5 ? 1 : s === 6 ? 1 - ease(clamp(k * 2.5, 0, 1)) : 0,
    tampa: s < 4 ? 0 : s === 4 ? ease(clamp(k * 3, 0, 1)) : 1,
    flow: s === 4 ? ease(clamp(k * 3 - 1.2, 0, 1)) : s === 5 ? 1 - ease(clamp(k * 2.2 - 0.5, 0, 1)) : 0,
    wt: s < 5 ? WT0 : s === 5 ? lerp(WT0, WTSECO, ease(clamp(k * 1.5, 0, 1))) : s < 8 ? WTSECO : lerp(WTSECO, -6.4, ease(k)),
    limite: s === 5 ? ease(clamp(k * 2 - 0.7, 0, 1)) : 0,
    epump: at(6, k => k * 1.8),
    eflow: s < 6 ? 0 : s === 6 ? ease(clamp(k * 3 - 1.7, 0, 1)) : 1,
    caixa: s < 6 ? 0 : s === 6 ? back(clamp(k * 4, 0, 1)) : 1,
    nivel: s < 6 ? 0 : s === 6 ? 0.08 + 0.6 * ease(clamp(k * 2 - 1, 0, 1)) : s === 7 ? 0.7 : 0.9,
    filtro: at(7, k => k * 2),
    chuva: s === 7 ? ease(clamp(k * 3 - 0.8, 0, 1)) : 0,
  };
}

function atualiza(t, ctx) {
  const S = estado(Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), ctx.lt); W3.S = S;
  const yTop = lerp(0, SH.y0, S.dig), wt = S.wt;
  // escavacao
  setH(W3.terra, SH.y0, yTop); W3.terra.visible = S.dig < 1;
  W3.monte.visible = S.dig > 0.02 && S.rings < 1; W3.monte.scale.set(1.5 * S.dig + 0.01, 0.9 * S.dig * (1 - S.rings * 0.9) + 0.01, 1.2 * S.dig + 0.01);
  W3.pa.visible = S.s <= 1; W3.pa.position.y = 0.2 + (S.s === 0 && S.dig < 1 ? Math.abs(Math.sin(t * 3)) * 0.4 : 0);
  // lencol no corte
  W3.lencol.scale.set(X1 - X0, wt - AQB, 1); W3.lencol.position.set(0, (wt + AQB) / 2, Z1 + 0.012);
  W3.linha.scale.x = X1 - X0; W3.linha.position.set(0, wt, Z1 + 0.014);
  // entulho e pedacos que caem
  const rubTop = SH.y0 + 3.2 * S.rub;
  setH(W3.entulho, SH.y0, rubTop); W3.entulho.visible = S.rub > 0.01;
  W3.pedacos.forEach((m) => {
    const u = m.userData, q = (S.k - u.f) / 0.3;
    m.visible = S.s === 1 && q > -0.15 && q < 1;
    m.position.set(u.x + Math.sin(q * 3) * 0.1, lerp(u.y, rubTop, ease(clamp(q, 0, 1)) ** 1.6), u.z); m.rotation.set(q * 4, q * 2, q * 5);
  });
  // aneis
  W3.aneis.forEach((g, i) => { const v = clamp(S.rings * 11 - i, 0, 1); g.visible = v > 0; g.position.y = (1 - ease(v)) * 4; });
  W3.fendas.visible = S.filtro > 0.3 && S.rings >= 1;
  // agua no poco
  const fundo = Math.max(SH.y0, yTop, rubTop);
  setH(W3.agua, fundo, wt); W3.agua.visible = wt > fundo + 0.01; W3.agua.scale.x = S.rings > 0 ? (SH.x1 - SH.x0 - 2 * RW) / (SH.x1 - SH.x0) : 1;
  // sarilho e balde (sobe e desce devagar)
  W3.sarilho.visible = S.sarilho > 0.01; W3.sarilho.scale.setScalar(Math.max(0.01, S.sarilho));
  const ciclo = (t * 0.16) % 1, desce = ciclo < 0.5 ? ease(ciclo * 2) : 1 - ease((ciclo - 0.5) * 2);
  const by = lerp(1.0, wt + 0.15, desce);
  W3.balde.position.y = by; W3.corda.scale.y = 1.55 - by; W3.baldeAgua.visible = ciclo > 0.5;
  // bomba manual
  W3.tampa.visible = S.tampa > 0.01; W3.tampa.position.y = (1 - S.tampa) * 3;
  W3.manual.visible = S.manual > 0.01; W3.manual.scale.setScalar(Math.max(0.01, S.manual));
  const bombeando = S.s === 4 || S.s === 5;
  W3.alavanca.rotation.z = bombeando ? Math.sin(t * 4.5) * 0.32 : 0;
  W3.baldeChao.visible = S.manual > 0.5;
  W3.cano.visible = S.manual > 0.5; setH(W3.cano, CANO, 0.6);
  let colTop = 0.6;
  if (S.s === 5) colTop = lerp(0.6, CANO, ease(clamp(S.k * 2 - 0.55, 0, 1)));
  const colBot = Math.max(CANO, S.s === 5 && wt < CANO ? CANO : CANO);
  W3.coluna.visible = W3.cano.visible && colTop > colBot + 0.05 && S.s >= 4; W3.coluna.position.y = colBot; W3.coluna.scale.y = Math.max(0.001, colTop - colBot);
  W3.gotas.forEach((g, i) => {
    const u = (t * 1.6 + i / 10) % 1; g.visible = S.flow > 0.05 && S.manual > 0.5;
    g.position.set(0.62 + Math.sin(i * 3) * 0.02, lerp(1.32, 0.8, u * u), SZ + 0.1); g.scale.setScalar(S.flow);
  });
  // bomba eletrica
  const py = lerp(0.6, SH.y0 + 0.4, S.epump);
  W3.eletrica.visible = S.epump > 0; W3.eletrica.position.set(0.2, py, Z1 - 0.35);
  W3.cano2.visible = W3.cabo.visible = S.epump > 0;
  W3.cano2.position.set(0.2, py + 0.9, Z1 - 0.35); W3.cano2.scale.y = Math.max(0.001, 0.3 - (py + 0.9));
  W3.cabo.position.set(0.38, py + 0.5, Z1 - 0.38); W3.cabo.scale.y = Math.max(0.001, 0.9 - (py + 0.5));
  W3.saida.me.visible = S.epump > 0.9;
  W3.caixa.visible = S.caixa > 0.01; W3.caixa.scale.setScalar(Math.max(0.01, S.caixa));
  W3.caixaAgua.scale.y = Math.max(0.001, 1.1 * S.nivel);
  W3.bolhas.forEach((b, i) => {
    const u = (t * 0.5 + i / 12) % 1; b.visible = S.eflow > 0.05;
    if (u < 0.55) b.position.set(0.2, lerp(py + 0.9, 0.3, u / 0.55), Z1 - 0.2);
    else { const p = W3.saida.curva.getPointAt((u - 0.55) / 0.45); b.position.set(p.x, p.y, p.z + 0.08); }
    b.scale.setScalar(S.eflow);
  });
  // filtro
  W3.cascalho.visible = S.filtro > 0; W3.cascalho.position.y = (1 - S.filtro) * -3; W3.cascalho.scale.setScalar(Math.max(0.01, S.filtro));
  W3.colar.visible = S.filtro > 0.2; W3.colar.scale.y = Math.max(0.01, clamp(S.filtro * 1.5 - 0.3, 0, 1));
  W3.laje.visible = S.filtro > 0.4; W3.laje.position.y = (1 - clamp(S.filtro * 1.6 - 0.6, 0, 1)) * 2.5;
  W3.graos.forEach((m) => {
    const u = m.userData, q = (t * 0.25 + u.f) % 1; m.visible = S.s === 7;
    const para = S.filtro > 0.6 ? 1.38 : 0.9;
    m.position.set(u.l * lerp(4.5, para, Math.min(1, q * 1.4)), u.y + Math.sin(q * 9) * 0.05, Z1 + 0.03);
  });
  W3.chuva.forEach((m, i) => {
    const u = (t * 0.9 + rnd(i * 3.1)) % 1; m.visible = S.chuva > 0.05;
    const px = lerp(-3.2, 3.2, rnd(i * 6.7)), chao = Math.abs(px) < 2.1 ? 0.55 - Math.abs(px) * 0.12 : 0.05;
    m.position.set(px, lerp(6.5, chao, u), lerp(SZ - 0.6, Z1 - 0.1, rnd(i * 4.4))); m.scale.setScalar(u < 0.95 ? S.chuva : 0.01);
  });
}

const CAM = {
  buraco: { y: -3.2, d: 15 }, desmorona: { y: -2.2, d: 11 }, revestimento: { y: -4.6, d: 16.5 },
  balde: { y: -1.6, d: 10.5 }, manual: { y: -1.2, d: 9.5, x: 0.3 }, seca: { y: -4.4, d: 17 },
  eletrica: { x: 1.4, y: -3.6, d: 17.5 }, filtro: { y: -4.6, d: 16 }, final: { x: 1.2, y: -4.2, d: 18.5 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: -4, d: 15, a: 0, h: 1.9, zFoco: Z1 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const S = W3.S;
  const rotulo = (px, py, pz, txt, k, bg = 'rgba(255,255,255,0.92)', fg = COL.ink) => {
    if (k <= 0) return; const [a, b] = proj(px, py, pz); pill(a, b, txt, bg, fg, 34, back(clamp(k, 0, 1)));
  };
  if (S.s === 0) rotulo(-3.6, S.wt + 0.45, Z1, 'Water table', (S.dig - 0.5) * 4);
  if (S.s === 2) rotulo(-2.4, -2.5, Z1, 'Concrete rings', (S.k - 0.3) * 5);
  if (S.s === 4) rotulo(-1.4, 2.1, SZ, 'Hand pump', (S.k - 0.35) * 5);
  if (S.limite > 0) {
    const [ax, ay] = proj(-3.8, LIMITE, Z1 + 0.02), [bx, by] = proj(3.8, LIMITE, Z1 + 0.02);
    x.save(); x.globalAlpha = S.limite; x.strokeStyle = '#ff5a4e'; x.lineWidth = 7; x.setLineDash([22, 14]);
    x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.restore();
    rotulo(-2.6, LIMITE + 0.55, Z1, '25 ft max', S.limite, COL.red, '#fff');
  }
  if (S.s === 6) rotulo(-1.9, SH.y0 + 0.9, Z1, 'Electric pump', (S.epump - 0.8) * 5, COL.green, '#fff');
  if (S.s === 7) {
    rotulo(-2.6, -8.2, Z1, 'Gravel', (S.filtro - 0.4) * 4);
    rotulo(0, 1.6, SZ, 'Sealed cap', (S.filtro - 0.8) * 5);
  }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
