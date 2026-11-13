// Mundo "cola": como a cola gruda as coisas (ideia do Pedro, issue #25).
// Dois lugares ligados por etapa: "bancada" (dois blocos de madeira, frasco de cola branca, grampo, super cola) e
// "micro" (a junta ampliada e cortada: superficie aspera com picos e vales, cola que escorre nos vales, moleculas que
// puxam a superficie = adesao, agua que sai = secagem, cadeias de plastico emaranhadas = coesao, camada fina x grossa).
// Etapas: junta, aspera, escorre, gruda, seca, corrente, aperta, fina, super, final.
(() => {
const ETAPAS = ['junta', 'aspera', 'escorre', 'gruda', 'seca', 'corrente', 'aperta', 'fina', 'super', 'final'];
const LUGAR = { junta: 'bancada', aspera: 'micro', escorre: 'micro', gruda: 'micro', seca: 'micro', corrente: 'micro',
  aperta: 'bancada', fina: 'micro', super: 'bancada', final: 'bancada' };
const W3 = {};
const BRANCO = 0xf4f1e8, AMBAR = 0xe2b866, MADEIRA_A = 0xc8995c, MADEIRA_B = 0xb07a44;

// perfis da junta ampliada (x de -6 a 6): topo da peca de baixo e fundo da peca de cima
const fBaixo = x => -0.6 + 0.35 * Math.sin(3.1 * x) + 0.2 * Math.sin(7.3 * x + 1) + 0.1 * Math.sin(13 * x);
const fCima = x => 0.95 + 0.3 * Math.sin(2.7 * x + 2) + 0.18 * Math.sin(8.1 * x) + 0.1 * Math.sin(15 * x + 0.5);
const X0 = -6, X1 = 6, NX = 160, PROF = 3;

function forma(pts) { return new T3.Shape(pts.map(([a, b]) => new T3.Vector2(a, b))); }
function extruda(sh, m, prof, parent) {
  const g = new T3.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, -prof / 2);
  const me = new T3.Mesh(g, m); me.castShadow = me.receiveShadow = true; parent.add(me); return me;
}
const xs = [...Array(NX + 1)].map((_, i) => X0 + (X1 - X0) * i / NX);

function bancada(g) {
  uvMundo(box(30, 1, 18, tmat('madeira', { relevo: 1 }), 0, -0.5, -2, g), 4);
  W3.blocoA = box(5, 1.2, 2.6, mat(MADEIRA_A, { roughness: 0.8 }), 0, 0.6, 0, g);
  W3.cimaB = grupo(g);
  box(5, 1.2, 2.6, mat(MADEIRA_B, { roughness: 0.8 }), 0, 0, 0, W3.cimaB);
  // linha de cola em cima do bloco A (cresce)
  W3.linha = box(1, 0.08, 0.35, mat(BRANCO, { roughness: 0.35 }), 0, 1.24, 0, g); W3.linha.castShadow = false;
  // gotinhas espremidas para fora (aparecem no grampo)
  W3.espreme = [...Array(10)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.12, 12, 8), mat(BRANCO, { roughness: 0.3 })); m.position.set(-2.2 + i * 0.49, 1.22, i % 2 ? 1.32 : -1.32); g.add(m); return m; });
  // frasco de cola branca
  W3.frasco = grupo(g);
  cyl(0.55, 0.6, 2.4, mat(0xfafafa, { roughness: 0.4 }), 24, W3.frasco).position.y = 1.2;
  cyl(0.3, 0.55, 0.5, mat(0xff7a1a, { roughness: 0.4 }), 24, W3.frasco).position.y = 2.65;
  const bico = new T3.Mesh(new T3.ConeGeometry(0.16, 0.6, 16), mat(0xff7a1a, { roughness: 0.4 })); bico.position.y = 3.2; W3.frasco.add(bico);
  box(1.12, 0.9, 0.05, mat(0x2e6bd8), 0, 1.3, 0.57, W3.frasco);
  W3.gota = new T3.Mesh(new T3.SphereGeometry(0.12, 12, 8), mat(BRANCO, { roughness: 0.3 })); g.add(W3.gota);
  // grampo em C (aco)
  W3.grampo = grupo(g);
  const aco = mat(0x8c96a4, { metalness: 0.85, roughness: 0.3 }), verm = mat(0xd8322a, { roughness: 0.5 });
  box(0.5, 4.6, 0.5, verm, 3.2, 1.9, 0, W3.grampo);
  box(3.0, 0.5, 0.5, verm, 1.95, 4.0, 0, W3.grampo);
  box(3.0, 0.5, 0.5, verm, 1.95, -0.2, 0, W3.grampo);
  W3.fuso = cyl(0.12, 0.12, 2.2, aco, 12, W3.grampo); W3.fuso.position.set(0.8, 3.0, 0);
  W3.sapata = cyl(0.45, 0.45, 0.15, aco, 20, W3.grampo); W3.sapata.position.set(0.8, 2.0, 0);
  // super cola: tubinho prateado e tampa azul
  W3.tubo = grupo(g);
  cyl(0.28, 0.28, 2.0, mat(0xc8ccd2, { metalness: 0.9, roughness: 0.25 }), 20, W3.tubo).position.y = 1.0;
  cyl(0.12, 0.28, 0.5, mat(0xc8ccd2, { metalness: 0.9, roughness: 0.25 }), 20, W3.tubo).position.y = 2.25;
  cyl(0.06, 0.12, 0.5, mat(0x1f7bff, { roughness: 0.4 }), 12, W3.tubo).position.y = 2.75;
  W3.umidade = [...Array(40)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.11, 10, 6), new T3.MeshBasicMaterial({ color: 0x2f8cff })); m.userData = { a: rnd(i) * 6.28, r: 1.6 + rnd(i * 2.1) * 2.4, h: rnd(i * 3.3) * 2.6, f: rnd(i * 5.7) }; g.add(m); return m; });
}

function micro(g) {
  // peca de baixo: do fundo (-3.2) ate o perfil fBaixo
  const pb = [[X0, -3.2], ...xs.map(x => [x, fBaixo(x)]), [X1, -3.2]];
  W3.pecaB = extruda(forma(pb), mat(MADEIRA_A, { roughness: 0.85 }), PROF, g);
  // peca de cima: do perfil fCima ate +3.4 (fica num grupo para descer na etapa 'fina')
  W3.grupoC = grupo(g);
  const pc = [[X0, 3.4], ...xs.map(x => [x, fCima(x)]), [X1, 3.4]];
  W3.pecaC = extruda(forma(pc), mat(MADEIRA_B, { roughness: 0.85 }), PROF, W3.grupoC);
  // cola: do perfil de baixo ate uma linha reta acima dos dentes de cima (a peca de cima cobre o resto)
  const pg = [[X0, 1.55], ...xs.map(x => [x, fBaixo(x)]).reverse().reverse(), [X1, 1.55]];
  W3.plano = new T3.Plane(new T3.Vector3(-1, 0, 0), X0);
  W3.colaMat = mat(BRANCO, { roughness: 0.3, clippingPlanes: [W3.plano] });
  W3.cola = extruda(forma(pg), W3.colaMat, PROF - 0.12, g); W3.cola.castShadow = false;
  // moleculas da cola encostadas nas duas superficies (adesao) e tracinhos de atracao
  W3.mol = []; W3.lig = [];
  const molM = mat(0xffd23a, { roughness: 0.4, emissive: new T3.Color(0x5a4200) });
  for (let i = 0; i < 26; i++) {
    const x = X0 + 0.3 + i * 0.45, emB = i % 2 === 0, y = emB ? fBaixo(x) + 0.16 : fCima(x) - 0.16;
    const m = new T3.Mesh(new T3.SphereGeometry(0.12, 12, 8), molM); m.position.set(x, y, PROF / 2 - 0.02); g.add(m); W3.mol.push(m);
    const l = box(0.05, 0.2, 0.02, new T3.MeshBasicMaterial({ color: 0xff4b3e }), x, emB ? y - 0.13 : y + 0.13, PROF / 2 - 0.01, g); l.castShadow = false; W3.lig.push(l);
  }
  // agua saindo (secagem)
  W3.agua = [...Array(36)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.2, 12, 8), new T3.MeshBasicMaterial({ color: 0x3f9cff })); m.userData = { x: X0 + 0.4 + rnd(i * 1.7) * 11.2, f: rnd(i * 4.1) }; g.add(m); return m; });
  // cadeias de plastico emaranhadas (coesao): linhas em zigue-zague na face do corte
  W3.cadeias = [];
  for (let c = 0; c < 9; c++) {
    const pts = [], n = 60, y0 = rnd(c * 9.1) * 0.6 - 0.2;
    let x = X0 + 0.3 + rnd(c * 2.3) * 2, y = y0;
    for (let k = 0; k < n; k++) {
      x += 0.12 + rnd(c * 31 + k) * 0.08; y += (rnd(c * 17 + k * 3) - 0.5) * 0.45;
      const yy = Math.min(fCima(x) - 0.08, Math.max(fBaixo(x) + 0.08, y)); y = yy;
      pts.push(new T3.Vector3(x, yy, PROF / 2 - 0.03));
      if (x > X1 - 0.3) break;
    }
    const geo = new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), pts.length * 3, 0.05, 6, false);
    const ln = new T3.Mesh(geo, mat([0x2fcf6a, 0xff7a1a, 0x7a4cff][c % 3], { roughness: 0.5 }));
    ln.userData.n = geo.index.count; g.add(ln); W3.cadeias.push(ln);
  }
  // rachadura da camada grossa (etapa 'fina')
  W3.racha = box(0.06, 0.9, 0.02, new T3.MeshBasicMaterial({ color: 0x1d2430 }), 1.2, 0.75, PROF / 2 - 0.01, g); W3.racha.castShadow = false;
}

function monta() {
  scene.add(sun.target);
  gl.localClippingEnabled = true;
  reflexos(0.6);
  W3.bancada = grupo(); W3.micro = grupo();
  bancada(W3.bancada); micro(W3.micro);
}

function atualiza(t, ctx) {
  const s = Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), e = ETAPAS[s], k = ctx.lt, lugar = LUGAR[e];
  W3.s = s; W3.e = e; W3.lugar = lugar;
  W3.mesma = ctx.i > 0 && (ST.cenas[ctx.i - 1].p || {}).etapa === e;
  W3.bancada.visible = lugar === 'bancada'; W3.micro.visible = lugar === 'micro';
  scene.background = new T3.Color(lugar === 'micro' ? 0x2a3442 : 0xe9e4da);
  scene.fog = null;
  sun.position.set(-6, 14, 9); sun.target.position.set(0, 0, 0);

  if (lugar === 'bancada') {
    const junto = e !== 'junta';
    W3.frasco.visible = e === 'junta';
    W3.tubo.visible = e === 'super';
    W3.grampo.visible = e === 'aperta';
    // bloco de cima: ao lado na 'junta', em cima nas outras
    if (!junto) W3.cimaB.position.set(-2.6, 2.6, -2.2); else W3.cimaB.position.set(0, 1.86, 0);
    W3.cimaB.rotation.set(0, junto ? 0 : 0.5, junto ? 0 : 0.15);
    // linha de cola
    const L = e === 'junta' ? 0.2 + 4.4 * ease(k * 1.2) : 4.6;
    W3.linha.visible = e === 'junta'; W3.linha.scale.x = L; W3.linha.position.x = -2.3 + L / 2;
    W3.frasco.position.set(-2.3 + L + 2.16, 3.86, 0); W3.frasco.rotation.set(0, 0, 2.4);
    W3.gota.visible = e === 'junta' || e === 'super';
    if (e === 'junta') { const q = (t * 1.6) % 1; W3.gota.position.set(-2.3 + L, 1.28 + (1 - q) * 0.25, 0); }
    // grampo apertando + cola espremida
    const aperto = e === 'aperta' ? ease(k * 1.4) : 0;
    W3.sapata.position.y = 3.0 - 0.36 - aperto * 0.18 + 0.2 * (1 - aperto); W3.fuso.position.y = W3.sapata.position.y + 1.1;
    W3.espreme.forEach((m, i) => { m.visible = e === 'aperta' || e === 'final'; m.scale.setScalar(e === 'final' ? 0.8 : aperto * (0.7 + rnd(i) * 0.6)); });
    // super cola: gota na ponta, umidade do ar correndo para ela
    W3.tubo.position.set(1.9, 4.6, 0.4); W3.tubo.rotation.set(0, 0, 2.5);
    if (e === 'super') W3.gota.position.set(0.6, lerp(3.4, 2.55, ease(k * 2)), 0.4);
    W3.umidade.forEach(m => {
      const u = m.userData, q = e === 'super' ? ease(clamp((t - ctx.t0) * 0.35 + u.f * 0.3)) : 0;
      m.visible = e === 'super';
      const r = u.r * (1 - q * 0.85);
      m.position.set(0.6 + Math.cos(u.a + t * 0.3) * r, 2.6 + u.h * (1 - q) + Math.sin(t * 2 + u.a) * 0.1, 0.4 + Math.sin(u.a + t * 0.3) * r * 0.6);
    });
    // final: a peca colada levanta inteira
    const sobe = e === 'final' ? ease(k * 1.3) * 1.6 : 0;
    W3.blocoA.position.y = 0.6 + sobe; if (junto) W3.cimaB.position.y = 1.86 + sobe;
    W3.blocoA.rotation.z = W3.cimaB.rotation.z = e === 'final' ? Math.sin(t * 1.4) * 0.08 * ease(k * 1.3) : (junto ? 0 : 0.15);
    if (e === 'final') W3.espreme.forEach(m => { m.position.y = 1.22 + sobe; });
    else W3.espreme.forEach(m => { m.position.y = 1.22; });
  }

  if (lugar === 'micro') {
    const iE = ETAPAS.indexOf(e);
    // cola espalhando da esquerda para a direita na 'escorre'; ausente na 'aspera'
    W3.cola.visible = e !== 'aspera';
    W3.plano.constant = e === 'escorre' ? X0 + (X1 - X0) * ease(k * 1.15) : X1 + 1;
    // cor: branca molhada -> ambar translucida depois de secar
    const seco = e === 'seca' ? ease(k) : iE > ETAPAS.indexOf('seca') ? 1 : 0;
    W3.colaMat.color.setHex(BRANCO).lerp(new T3.Color(AMBAR), seco);
    // peca de cima: some na 'aspera' (so a superficie de baixo), desce na 'fina'
    W3.grupoC.visible = e !== 'aspera';
    W3.grupoC.position.y = e === 'fina' ? -0.18 * ease(k * 1.5) : 0;
    // adesao
    const ad = e === 'gruda';
    W3.mol.forEach((m, i) => { m.visible = ad || e === 'seca'; m.scale.setScalar(ad ? 1 + 0.35 * Math.sin(t * 6 + i) : 0.8); });
    W3.lig.forEach((l, i) => { l.visible = ad; l.scale.y = 0.6 + 0.4 * Math.abs(Math.sin(t * 6 + i)); });
    // agua subindo e saindo
    W3.agua.forEach(m => {
      const u = m.userData, q = ((t - ctx.t0) * 0.45 + u.f) % 1;
      m.visible = e === 'seca';
      m.position.set(u.x, lerp(fBaixo(u.x) + 0.3, 3.9, q), PROF / 2 + 0.05 + q * 1.2);
      m.scale.setScalar(1 - q * 0.6);
    });
    // cadeias aparecendo (coesao); ficam depois
    W3.cadeias.forEach((ln, c) => {
      ln.visible = iE >= ETAPAS.indexOf('corrente');
      const prog = e === 'corrente' && !W3.mesma ? clamp(k * 1.4 - c * 0.06) : 1;
      ln.geometry.setDrawRange(0, Math.max(3, Math.floor(ln.userData.n * prog / 3) * 3));
    });
    W3.racha.visible = false;
  }
}

const CAM = {
  junta: { x: 0, y: 1.2, d: 13, h: 4.5, a: 0.25 }, aperta: { x: 1, y: 1.8, d: 12, h: 3, a: -0.3 },
  super: { x: 0.8, y: 2.8, d: 11, h: 2.2, a: 0.2 }, final: { x: 0, y: 2.5, d: 13, h: 2.5, a: 0.5 },
  aspera: { x: 0, y: -0.4, d: 15, h: 0.5, a: 0 }, escorre: { x: 0, y: 0.2, d: 15, h: 0.6, a: 0.12 },
  gruda: { x: -1.5, y: 0.3, d: 7, h: 0.3, a: 0.08 }, seca: { x: 0, y: 1.2, d: 15, h: 0.8, a: -0.1 },
  corrente: { x: 0.5, y: 0.3, d: 10, h: 0.3, a: 0.05 }, fina: { x: 0, y: 0.4, d: 13, h: 0.5, a: -0.15 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: 1, d: 12, a: 0, h: 3 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const e = W3.e, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)', tm = ctx.t0 + 0.45 * (ctx.t1 - ctx.t0), s2 = back((t - tm) * 3);
  if (ctx.i > 0) {
    const ant = LUGAR[(ST.cenas[ctx.i - 1].p || {}).etapa];
    if (ant && ant !== W3.lugar) { const a = clamp(1 - (t - ctx.t0) * 3.5); if (a > 0) { x.fillStyle = `rgba(255,255,255,${a})`; x.fillRect(0, 0, W, H); } }
  }
  if (e === 'junta') pill(W / 2, H * 0.12, 'Liquid... then solid?', branco, COL.ink, 44, s);
  if (e === 'aspera') { pill(W / 2, H * 0.12, 'Zoom: x1000', COL.yellow, COL.ink, 46, s); pill(W / 2, H * 0.12 + 95, 'Mountains + valleys', branco, COL.ink, 42, s2); }
  if (e === 'escorre') pill(W / 2, H * 0.12, 'Flows into the gaps', branco, COL.ink, 44, s);
  if (e === 'gruda') pill(W / 2, H * 0.12, 'ADHESION', COL.yellow, COL.ink, 52, s);
  if (e === 'seca') { pill(W / 2, H * 0.12, 'Water leaves', '#3f9cff', '#fff', 46, s); pill(W / 2, H * 0.12 + 95, 'Glue dries', branco, COL.ink, 42, s2); }
  if (e === 'corrente') { pill(W / 2, H * 0.12, 'Tangled chains', COL.green, '#fff', 46, s); pill(W / 2, H * 0.12 + 95, 'COHESION', COL.yellow, COL.ink, 44, s2); }
  if (e === 'aperta') pill(W / 2, H * 0.12, 'Clamp = pressure', COL.red, '#fff', 46, s);
  if (e === 'fina') pill(W / 2, H * 0.12, 'Thin layer = stronger', COL.green, '#fff', 44, s);
  if (e === 'super') { pill(W / 2, H * 0.12, 'Super glue', branco, COL.ink, 46, s); pill(W / 2, H * 0.12 + 95, 'Moisture = trigger', '#3f9cff', '#fff', 42, s2); }
  if (e === 'final') pill(W / 2, H * 0.12, 'Adhesion + cohesion', COL.green, '#fff', 44, s);
}
MUNDO = { monta, atualiza, camera, overlay };
})();
