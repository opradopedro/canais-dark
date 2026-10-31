// Mundo "terreno": quintal com o solo em corte (grama, terra, argila mole, areia, rocha) e pecas que o roteiro liga
// por parametro em cada cena. Serve para muitos temas de chao: fundacao de casa, predio em solo mole, terremoto,
// muro de arrimo, estrada, calcada, poste de cerca, cidade que afunda (Cidade do Mexico).
// Diferente dos outros mundos, nao tem lista fixa de etapas: cada cena diz o estado em "p". Valores com [a, b]
// vao de a ate b durante a cena (ex.: "afunda": [0, 0.8]). "etapa" e opcional e so serve de nome.
//
// p aceito (tudo opcional):
//  foco: "trilho" | "calcada" | "casa" | "fundo" | "muro" | "estrada" | "poste" | "coluna" | "predio" | "geral" (enquadramento)
//  casa: "casa" | "predio" (aparece no centro, x = 0)   afunda: m (ou [a,b])   inclina: graus (ou [a,b])
//  racha: 0..1 (rachaduras na parede)   treme: 0..1 (terremoto)   isola: 1 (apoios de borracha sob a casa)
//  sapata: 1   estacas: profundidade em m (ex.: 3 curtas, 8.5 ate a rocha)   radier: 1   baldrame: 1   manta: 1
//  caixa: 1 (subsolo/caixao sob o predio: fundacao compensada)   lencol: nivel da agua em m (ex.: -2 ou [-2,-5])
//  poco: 1 (poco com bomba tirando agua do fundo)   solo_cede: m (ou [a,b]) argila encolhe e o chao desce
//  coluna: 1 (monumento com estacas ate a rocha a direita da casa)   degraus: n (ou [a,b]) degraus novos na base
//  encosta: "natural" | "corte" | "desaba" | "muro" | "gabiao"   muro_inclina: graus   agua_muro: 0..1
//  dreno: 1 (brita + barbacas atras do muro)   carga: 0..1 (seta do empurrao da terra)
//  estrada: "lama" | "cascalho" | "base" | "asfalto"   abaulado: 1   valeta: 1   buraco: 0..1   umido: 0..1
//  calcada: 1   junta: 1   raiz: 0..1 (raiz da arvore levanta a placa)   trinca: 0..1 (placa racha)
//  poste: 1   poste_prof: m   podre: 0..1   poste_inclina: graus   poste_base: "terra" | "concreto" | "cascalho"
//  torre: casa "torre" = torre redonda de pedra com arcos (Pisa); contrapeso: 1 (blocos de chumbo na base, lado alto)
//  extrai: 0..1 (tubos tiram terra sob o lado alto)   madeira: 1 (estacas de madeira, Veneza)
//  cano: 1 (cano de esgoto sob a estrada)   cavidade: 0..1 (vazio cresce sobre o cano)   colapso: 0..1 (estrada cai no buraco)
//  trilho: "terra" | "dormente" | "brita" (ferrovia em corte na area da estrada)   afunda_trilho: m
//  chuva: 0..1   peso: 0..1 (setas do peso da casa)   rotulo: "TEXTO" (pilula no alto)   cor: "red"|"green"|"white"
//  marcas: [{"t": "Soft clay", "x": 0, "y": -3}] (rotulos presos ao corte)
(() => {
const X0 = -15, X1 = 15, Z0 = -3, Z1 = 2.5, ZF = Z1 + 0.06;
const Y = { grama: -0.18, terra: -1.2, argila: -6.5, areia: -7.4, fundo: -12 };
const W3 = {};
const V = (v, lt, d = 0) => v === undefined || v === null ? d : Array.isArray(v) ? lerp(v[0], v[1], ease(clamp(lt * 1.6))) : v;
const grau = g => g * Math.PI / 180;

function janelas() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 1024; const cx = cv.getContext('2d');
  cx.fillStyle = '#d9d3c7'; cx.fillRect(0, 0, 256, 1024);
  for (let r = 0; r < 24; r++) for (let i = 0; i < 4; i++) {
    const g = cx.createLinearGradient(0, r * 42, 0, r * 42 + 30); g.addColorStop(0, '#7fa6cc'); g.addColorStop(1, '#41618a');
    cx.fillStyle = g; cx.fillRect(14 + i * 60, 8 + r * 42, 46, 28);
  }
  const tx = new T3.CanvasTexture(cv); tx.colorSpace = T3.SRGBColorSpace; return tx;
}

function monta() {
  quintal({ zCasa: -30 });
  scene.add(sun.target);
  const conc = tmat('concreto', { relevo: 1.5 }), terra = tmat('terra'), argila = (GERA.argilaMole = GERA.argilaMole || (() => geraTerra(0x77786f, 14, 50, [0.8, 1.12])), tmat('argilaMole')), areia = tmat('terra2', { color: 0xd8c08a }), rocha = tmat('rocha', { relevo: 4 });
  W3.conc = conc;
  // solo: as camadas acima da rocha ficam num grupo que encolhe (solo_cede) e todas tremem juntas (terremoto)
  W3.terra = grupo(); W3.mole = grupo(W3.terra);
  W3.mole.position.y = Y.areia; // pivo do encolhimento no topo da areia
  const camada = (y0, y1, m, pai, dy = 0) => { const me = box(X1 - X0, y1 - y0, Z1 - Z0, m, 0, (y0 + y1) / 2 + dy, (Z0 + Z1) / 2, pai); uvMundo(me, 2.2); return me; };
  camada(Y.grama, 0, tmat('grama', { relevo: 1 }), W3.mole, -Y.areia);
  camada(Y.terra, Y.grama, terra, W3.mole, -Y.areia);
  camada(Y.argila, Y.terra, argila, W3.mole, -Y.areia);
  camada(Y.areia, Y.argila, areia, W3.mole, -Y.areia);
  camada(Y.fundo, Y.areia, rocha, W3.terra);
  // barranco do fundo: so aparece quando o solo cede (senao veria o vazio atras do corte)
  uvMundo(box(X1 - X0, -Y.areia, 0.3, terra, 0, Y.areia / 2 - 0.02, Z0 - 0.15, W3.terra), 2.2);
  // agua do solo: faixa azul no corte, do nivel do lencol ate a areia
  W3.lencol = box(X1 - X0, 1, 0.02, new T3.MeshBasicMaterial({ color: 0x3f9fe3, transparent: true, opacity: 0.32, depthWrite: false }), 0, 0, ZF, W3.terra);
  W3.lencolLinha = box(X1 - X0, 0.05, 0.03, new T3.MeshBasicMaterial({ color: 0x9fd4ff }), 0, 0, ZF + 0.01, W3.terra);

  // ---- casa / predio (centro) ----
  W3.base = grupo(W3.terra); W3.casa = grupo(W3.terra);
  const parede = mat(0xefe6d2), tel = new T3.MeshStandardMaterial({ map: textura('telhado', GERA.telhado).tx, roughness: 0.75 });
  W3.casinha = grupo(W3.casa);
  box(4, 2.8, 4.2, parede, 0, 1.4 + 0.25, -0.0, W3.casinha);
  const tri = new T3.Shape(); tri.moveTo(-2.3, 0); tri.lineTo(2.3, 0); tri.lineTo(0, 1.5); tri.closePath();
  const roof = new T3.Mesh(new T3.ExtrudeGeometry(tri, { depth: 4.6, bevelEnabled: false }), tel); roof.position.set(0, 3.05, -2.3); roof.castShadow = true; W3.casinha.add(roof);
  { const g = roof.geometry, p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2, (p.getY(i) + p.getZ(i)) / 2); }
  for (const dx of [-1.1, 1.1]) { box(0.8, 0.8, 0.05, mat(0x6d97c4, { roughness: 0.2 }), dx, 1.9, 2.12, W3.casinha); box(0.92, 0.08, 0.08, mat(0xffffff), dx, 1.46, 2.14, W3.casinha); }
  box(0.8, 1.6, 0.05, mat(0x8a5a3a), 0, 1.05, 2.12, W3.casinha);
  W3.predio = grupo(W3.casa);
  const jt = janelas(), fm = new T3.MeshStandardMaterial({ map: jt, roughness: 0.6 }), lado = mat(0xcfc8ba);
  box(3.6, 13, 3.6, [lado, lado, mat(0x9a948a), lado, fm, lado], 0, 6.5 + 0.25, 0, W3.predio);
  box(1.2, 1.4, 1.2, mat(0x8d877d), 0.6, 13.9, 0, W3.predio); cyl(0.04, 0.04, 2.4, mat(0x555555), 6, W3.predio).position.set(0.6, 15.6, 0);
  W3.torre = grupo(W3.casa);
  { const pedra = mat(0xf1ece0, { roughness: 0.55 }), sombra = mat(0x8c867a);
    for (let i = 0; i < 7; i++) { const r = i === 6 ? 1.05 : 1.45; const c = cyl(r, r, 1.75, pedra, 28, W3.torre); c.position.y = 0.25 + 0.875 + i * 1.75;
      const anel = new T3.Mesh(new T3.TorusGeometry(r + 0.06, 0.07, 6, 32), pedra); anel.rotation.x = Math.PI / 2; anel.position.y = 0.25 + (i + 1) * 1.75; W3.torre.add(anel);
      for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; if (Math.cos(a) < -0.2) continue; const ar = box(0.26, 1.1, 0.05, sombra, Math.sin(a) * (r + 0.01), 0.25 + 0.8 + i * 1.75, Math.cos(a) * (r + 0.01), W3.torre); ar.rotation.y = a; } } }
  W3.chumbo = grupo(W3.base); for (let i = 0; i < 4; i++) box(1.2, 0.25, 1.2, mat(0x55585e, { metalness: 0.6, roughness: 0.4 }), -2.4, 0.13 + i * 0.26, 0.6, W3.chumbo);
  W3.tubos = grupo(W3.base); for (let i = 0; i < 4; i++) { const c = cyl(0.06, 0.06, 4.2, mat(0x7c8288, { metalness: 0.6 }), 8, W3.tubos); c.rotation.z = 1.1; c.position.set(-3.6 + i * 0.1, -1.4 - i * 0.18, Z1 - 0.04); }
  W3.estMad = mat(0x8a6038, { roughness: 0.9 });
  // fundacoes (ficam no corte, um pouco a frente da face)
  const fz = (h, w, y, xx = 0, pai = W3.base) => box(w, h, 0.4, conc, xx, y, Z1 - 0.12, pai);
  W3.sapata = grupo(W3.base); for (const s of [-1, 1]) uvMundo(fz(0.35, 1.3, -0.95, s * 1.75, W3.sapata), 1.5), uvMundo(fz(0.8, 0.35, -0.45, s * 1.75, W3.sapata), 1.5);
  W3.radier = grupo(W3.base); uvMundo(fz(0.45, 5.6, 0.0, 0, W3.radier), 1.5);
  W3.baldrame = grupo(W3.base); uvMundo(fz(0.5, 4.4, 0.0, 0, W3.baldrame), 1.5);
  W3.manta = grupo(W3.base); box(4.5, 0.06, 0.42, mat(0x151515, { roughness: 0.5 }), 0, 0.28, Z1 - 0.1, W3.manta); for (const s of [-1, 1]) box(0.06, 0.5, 0.42, mat(0x151515), s * 2.23, 0.03, Z1 - 0.1, W3.manta);
  W3.caixa = grupo(W3.base);
  { const cz = mat(0x9c978e), ins = mat(0x3b3a37); box(4.6, 4, 0.3, ins, 0, -1.9, Z1 - 0.1, W3.caixa); for (const s of [-1, 1]) uvMundo(box(0.3, 4.2, 0.42, conc, s * 2.3, -1.9, Z1 - 0.1, W3.caixa), 1.5); uvMundo(box(4.9, 0.35, 0.42, conc, 0, -3.95, Z1 - 0.1, W3.caixa), 1.5); box(4.4, 0.12, 0.3, cz, 0, -1.9, Z1 - 0.05, W3.caixa); }
  W3.estacas = (p0 => p0)([-1.75, -1.15, -0.6, 0, 0.6, 1.15, 1.75]).map(xx => { const e = cyl(0.17, 0.17, 1, conc, 14, W3.base); e.position.set(xx, 0, Z1 - 0.08); uvMundo(e, 1.2); return e; });
  W3.apoios = grupo(W3.base);
  for (const s of [-1, 0, 1]) for (let k = 0; k < 5; k++) box(0.5, 0.05, 0.42, mat(k % 2 ? 0x8b8f94 : 0x161616, { metalness: k % 2 ? 0.7 : 0, roughness: 0.5 }), s * 1.6, 0.03 + k * 0.05, Z1 - 0.1, W3.apoios);
  W3.trincas = grupo(W3.casa);

  // ---- coluna (monumento) com estacas ate a rocha ----
  W3.coluna = grupo(W3.terra); W3.coluna.position.x = 5.2;
  { const pedra = mat(0xe8e2d4, { roughness: 0.6 }), ouro = mat(0xe0b040, { metalness: 0.8, roughness: 0.3 });
    box(2.2, 1.0, 2.2, pedra, 0, 0.5, 0, W3.coluna); cyl(0.38, 0.45, 7.5, pedra, 20, W3.coluna).position.y = 4.75;
    box(0.9, 0.5, 0.9, pedra, 0, 8.7, 0, W3.coluna); const anjo = new T3.Mesh(new T3.ConeGeometry(0.35, 1.2, 10), ouro); anjo.position.y = 9.55; anjo.castShadow = true; W3.coluna.add(anjo);
    const asa = new T3.Mesh(new T3.SphereGeometry(0.5, 12, 8), ouro); asa.scale.set(1.4, 0.35, 0.2); asa.position.y = 9.75; W3.coluna.add(asa);
    for (const xx of [-0.7, 0, 0.7]) { const e = cyl(0.15, 0.15, -Y.areia + 0.3, conc, 12, W3.coluna); e.position.set(xx, Y.areia / 2 - 0.15, Z1 - 0.08 - 0); }
    W3.degraus = [...Array(14)].map((_, i) => box(3.2 + i * 0.25, 0.22, 3.2 + i * 0.25, pedra, 0, -0.11 - i * 0.22, 0, W3.coluna)); }
  W3.poco = grupo(W3.terra); W3.poco.position.x = 2.9;
  { cyl(0.1, 0.1, -Y.areia + 0.6, mat(0xdfe3e6, { roughness: 0.3 }), 12, W3.poco).position.set(0, Y.areia / 2 + 0.3, Z1 - 0.05);
    box(0.7, 0.6, 0.6, mat(0x2f6fb5, { metalness: 0.3 }), 0, 0.3, Z1 - 0.3, W3.poco);
    W3.gotas = [...Array(16)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.09, 8, 6), new T3.MeshBasicMaterial({ color: 0x3fa9ff })); W3.poco.add(m); return m; }); }

  // ---- encosta e muro de arrimo (direita, x 7..15) ----
  W3.enc = grupo(W3.terra);
  const HM = 3.2, XM = 8.6;
  const morro = (x0, x1, pai) => { const g = grupo(pai); uvMundo(box(x1 - x0, HM - 0.2, Z1 - Z0, terra, (x0 + x1) / 2, (HM - 0.2) / 2, (Z0 + Z1) / 2, g), 2.2); uvMundo(box(x1 - x0, 0.2, Z1 - Z0, tmat('grama', { relevo: 1 }), (x0 + x1) / 2, HM - 0.1, (Z0 + Z1) / 2, g), 3); return g; };
  morro(10.2, X1, W3.enc);
  const cunha = (xa, xb, h, m, pai) => { const s = new T3.Shape(); s.moveTo(xa, 0); s.lineTo(xb, 0); s.lineTo(xb, h); s.closePath(); const me = new T3.Mesh(new T3.ExtrudeGeometry(s, { depth: Z1 - Z0, bevelEnabled: false }), m); me.position.z = Z0; me.castShadow = me.receiveShadow = true; uvMundo(me, 2.2); pai.add(me); return me; };
  W3.natural = grupo(W3.enc); cunha(6.0, 10.21, HM, terra, W3.natural);
  W3.corte = morro(XM + 0.45, 10.21, W3.enc);
  W3.monte = grupo(W3.enc); cunha(XM + 0.5, 6.4, 1.6, tmat('terra', { relevo: 5 }), W3.monte).scale.x = 1; // terra que desabou
  W3.monte.children[0].geometry.translate(0, 0, 0);
  W3.muro = grupo(W3.enc); W3.muro.position.set(XM + 0.45, 0, 0);
  uvMundo(box(0.45, HM, Z1 - Z0, conc, -0.225, HM / 2, (Z0 + Z1) / 2, W3.muro), 1.5); uvMundo(box(1.6, 0.35, Z1 - Z0, conc, -0.2, 0.17, (Z0 + Z1) / 2, W3.muro), 1.5);
  W3.barbaca = [0.8, 1.9].map(yy => { const c = cyl(0.07, 0.07, 0.7, mat(0xeeeeee), 10, W3.muro); c.rotation.z = Math.PI / 2; c.position.set(-0.2, yy, Z1 - 0.05); return c; });
  W3.brita = grupo(W3.enc); { const bm = [mat(0xc9c2b6), mat(0x9b9387), mat(0xe0dad0)]; for (let i = 0; i < 110; i++) { const me = new T3.Mesh(new T3.DodecahedronGeometry(0.09 + rnd(i) * 0.05), bm[i % 3]); me.position.set(XM + 0.55 + rnd(i * 3.1) * 0.5, 0.1 + rnd(i * 5.3) * (HM - 0.5), Z1 + 0.02); W3.brita.add(me); } }
  W3.gab = grupo(W3.enc); { const pd = [mat(0x9a9288), mat(0x7e776e), mat(0xb6aea2)], fio = new T3.MeshBasicMaterial({ color: 0x9aa3ab, wireframe: true });
    [[0, 0, 2.0], [0.4, 1, 1.6], [0.8, 2, 1.2]].forEach(([dx, r, w]) => { const cx0 = XM + 0.45 - w + dx; box(w, 1.05, Z1 - Z0, fio, cx0 + w / 2, r * 1.07 + 0.53, (Z0 + Z1) / 2, W3.gab).castShadow = false;
      for (let i = 0; i < 30; i++) { const me = new T3.Mesh(new T3.DodecahedronGeometry(0.17 + rnd(i + r * 40) * 0.07), pd[i % 3]); me.position.set(cx0 + 0.15 + rnd(i * 2.3 + r) * (w - 0.3), r * 1.07 + 0.15 + rnd(i * 4.1 + r) * 0.8, Z1 - 0.1); me.castShadow = true; W3.gab.add(me); } }); }
  W3.aguaMuro = box(1.6, 1, 0.02, new T3.MeshBasicMaterial({ color: 0x3f9fe3, transparent: true, opacity: 0.4, depthWrite: false }), XM + 1.25, 0, ZF + 0.01, W3.enc);
  W3.jatos = [...Array(12)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.06, 6, 5), new T3.MeshBasicMaterial({ color: 0x5ab8ff })); W3.enc.add(m); return m; });
  W3.HM = HM; W3.XM = XM;

  // ---- estrada / calcada (esquerda, x -13..-6), corte transversal ----
  W3.est = grupo(W3.terra); W3.est.position.x = -9.5;
  W3.lama = box(5.4, 0.12, Z1 - Z0, tmat('terra', { color: 0x7a5534, relevo: 3 }), 0, 0.06, (Z0 + Z1) / 2, W3.est); uvMundo(W3.lama, 2);
  W3.casc = box(5.6, 0.3, Z1 - Z0, tmat('cascalho', { relevo: 3 }), 0, 0.15, (Z0 + Z1) / 2, W3.est); uvMundo(W3.casc, 1.5);
  W3.basec = box(6.2, 0.45, Z1 - Z0, tmat('cascalho', { color: 0x8c8478, relevo: 3 }), 0, 0.22, (Z0 + Z1) / 2, W3.est); uvMundo(W3.basec, 1.2);
  const asf = tmat('asfalto', { relevo: 1 });
  W3.asfPlano = box(5.6, 0.14, Z1 - Z0, asf, 0, 0.52, (Z0 + Z1) / 2, W3.est); uvMundo(W3.asfPlano, 2);
  { const s = new T3.Shape(); s.moveTo(-2.8, 0); s.lineTo(2.8, 0); s.lineTo(2.8, 0.1); s.lineTo(0, 0.32); s.lineTo(-2.8, 0.1); s.closePath();
    W3.asfCurvo = new T3.Mesh(new T3.ExtrudeGeometry(s, { depth: Z1 - Z0, bevelEnabled: false }), asf); W3.asfCurvo.position.set(0, 0.45, Z0); W3.asfCurvo.castShadow = W3.asfCurvo.receiveShadow = true; uvMundo(W3.asfCurvo, 2); W3.est.add(W3.asfCurvo); }
  W3.faixa = box(0.15, 0.02, Z1 - Z0 - 0.5, new T3.MeshBasicMaterial({ color: 0xf2f2f2 }), 0, 0.78, (Z0 + Z1) / 2 - 0.2, W3.est);
  W3.poca = box(3.4, 0.04, Z1 - Z0 - 0.4, mat(0x4f8fc8, { roughness: 0.05, transparent: true, opacity: 0.8 }), 0, 0.6, (Z0 + Z1) / 2, W3.est);
  W3.furo = box(1.0, 0.16, 1.2, mat(0x1c1c1e), 0.6, 0.55, Z1 - 0.55, W3.est);
  W3.valetas = [-1, 1].map(s => box(0.9, 0.06, Z1 - Z0, mat(0x4f8fc8, { roughness: 0.05, transparent: true, opacity: 0.85 }), s * 3.7, 0.03, (Z0 + Z1) / 2, W3.est));
  W3.umido = box(6.2, 0.9, 0.02, new T3.MeshBasicMaterial({ color: 0x2f7fd0, transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.2, ZF, W3.est);
  W3.cano = new T3.Mesh(new T3.TorusGeometry(0.55, 0.12, 10, 32), mat(0x9a948a, { roughness: 0.9 })); W3.cano.position.set(0, -2.4, Z1 - 0.02); W3.est.add(W3.cano);
  W3.esgoto = box(0.9, 0.35, 0.02, mat(0x5e4a2a), 0, -2.7, Z1 + 0.02, W3.est);
  W3.vazio = new T3.Mesh(new T3.CircleGeometry(1, 32), mat(0x14100c, { roughness: 1 })); W3.vazio.position.set(0, -1.2, ZF + 0.02); W3.est.add(W3.vazio);
  W3.trilho = grupo(W3.est);
  { const bm = [mat(0x9a948c), mat(0x7c766e), mat(0xb4ada3)]; W3.lastro = grupo(W3.trilho);
    for (let i = 0; i < 260; i++) { const xx = (rnd(i * 2.3) - 0.5) * 5.2, yy = rnd(i * 4.1) * 0.6 * (1 - Math.abs(xx) / 3.4); const me = new T3.Mesh(new T3.DodecahedronGeometry(0.1 + rnd(i) * 0.05), bm[i % 3]); me.position.set(xx, yy, lerp(Z0, Z1, rnd(i * 7.7))); me.castShadow = true; W3.lastro.add(me); }
    W3.dormentes = grupo(W3.trilho); for (let k = 0; k < 6; k++) box(2.8, 0.2, 0.28, tmat('concreto'), 0, 0.68, Z1 - 0.2 - k * 0.95, W3.dormentes);
    W3.trilhos = grupo(W3.trilho); for (const s of [-0.72, 0.72]) { box(0.08, 0.16, Z1 - Z0, mat(0x6d6f73, { metalness: 0.8, roughness: 0.35 }), s, 0.86, (Z0 + Z1) / 2, W3.trilhos); box(0.16, 0.04, Z1 - Z0, mat(0x55575b, { metalness: 0.7 }), s, 0.79, (Z0 + Z1) / 2, W3.trilhos); } }
  // calcada: duas placas de concreto, raiz de arvore
  W3.calc = grupo(W3.est);
  W3.placas = [-1, 1].map(s => { const g = grupo(W3.calc); g.position.x = s * 1.4; uvMundo(box(2.75, 0.18, Z1 - Z0, conc, 0, 0.09, (Z0 + Z1) / 2, g), 1.4); return g; });
  W3.raiz = new T3.Mesh(new T3.TorusGeometry(0.55, 0.12, 8, 20, Math.PI), mat(0x6a4a30)); W3.raiz.position.set(1.4, -0.4, Z1 - 0.1); W3.est.add(W3.raiz);
  W3.arv = arvore(-12.6 + 9.5 + 3.4, -1.0, 1.0); W3.est.add(W3.arv); W3.arv.position.set(3.6, 0, -0.6);

  // ---- poste de cerca (x = -4.3) ----
  W3.post = grupo(W3.terra); W3.post.position.set(-4.3, 0, Z1 - 0.05);
  W3.postPiv = grupo(W3.post);
  W3.madeira = mat(0x9a6a42); W3.podreM = mat(0x3b2a1c, { roughness: 1 });
  W3.postSup = box(0.2, 2.2, 0.2, W3.madeira, 0, 1.1, 0, W3.postPiv);
  W3.postInf = box(0.2, 1, 0.2, W3.madeira, 0, -0.5, 0, W3.postPiv);
  for (const yy of [0.6, 1.8]) box(3.2, 0.1, 0.05, W3.madeira, -1.6, yy, -0.12, W3.postPiv);
  W3.colar = box(0.6, 1, 0.42, conc, 0, 0, 0, W3.post); uvMundo(W3.colar, 1.2);
  W3.cascPost = grupo(W3.post); { const bm = [mat(0xc9c2b6), mat(0x9b9387)]; for (let i = 0; i < 40; i++) { const me = new T3.Mesh(new T3.DodecahedronGeometry(0.07 + rnd(i) * 0.04), bm[i % 2]); me.position.set((rnd(i * 2.7) - 0.5) * 0.5, -rnd(i * 4.9) * 0.3, 0.12); W3.cascPost.add(me); } }

  // chuva e setas
  W3.chuva = [...Array(140)].map((_, i) => { const m = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 0.35, 4), new T3.MeshBasicMaterial({ color: 0xb8d8f0, transparent: true, opacity: 0.6 })); m.userData = { x: lerp(-14, 14, rnd(i * 1.3)), z: lerp(-2, 3.5, rnd(i * 2.9)), f: rnd(i * 4.7) }; scene.add(m); return m; });
}

function atualiza(t, ctx) {
  const p = ctx.p, lt = ctx.lt, S = W3.S = { p, lt };
  sun.position.set(-8, 16, 12); sun.target.position.set(0, 0, 0);
  // terremoto: o chao vai e volta
  const treme = V(p.treme, lt), gx = treme * 0.35 * Math.sin(t * 17) * (0.6 + 0.4 * Math.sin(t * 3.1));
  W3.terra.position.x = gx; S.gx = gx;
  // solo que cede (argila encolhe): o grupo "mole" escala em y a partir do topo da areia
  const cede = V(p.solo_cede, lt), hm = -Y.areia; W3.mole.scale.y = (hm - cede) / hm; S.cede = cede;
  // lencol
  const len = p.lencol === undefined ? null : V(p.lencol, lt);
  W3.lencol.visible = W3.lencolLinha.visible = len !== null;
  if (len !== null) { const top = len - cede * (len - Y.areia) / hm, h = Math.max(0.05, top - Y.areia); W3.lencol.scale.y = h; W3.lencol.position.y = Y.areia + h / 2; W3.lencolLinha.position.y = top; }
  // casa / predio
  const tipo = p.casa, af = V(p.afunda, lt) + cede, inc = grau(V(p.inclina, lt));
  W3.casa.visible = W3.base.visible = !!tipo;
  W3.casinha.visible = tipo === 'casa'; W3.predio.visible = tipo === 'predio'; W3.torre.visible = tipo === 'torre';
  W3.chumbo.visible = !!p.contrapeso; const ex = V(p.extrai, lt); W3.tubos.visible = ex > 0.02; W3.tubos.children.forEach((c, i) => c.scale.y = clamp(ex * 1.3 - i * 0.08));
  const isola = !!p.isola, rel = isola ? -gx * 0.85 : gx * 0.35 * Math.sin(t * 17 + 0.6);
  W3.base.position.set(0, -af, 0);
  W3.casa.position.set(rel + Math.sin(inc) * 1.5, -af + (isola ? 0.28 : 0), 0); W3.casa.rotation.z = -inc + (isola ? 0 : treme * 0.03 * Math.sin(t * 17));
  W3.base.rotation.z = -inc * 0.9;
  W3.sapata.visible = !!p.sapata; W3.radier.visible = !!p.radier; W3.baldrame.visible = !!p.baldrame; W3.manta.visible = !!p.manta; W3.caixa.visible = !!p.caixa; W3.apoios.visible = isola;
  W3.apoios.children.forEach((m, i) => { m.position.x = (Math.floor(i / 5) - 1) * 1.6 + (i % 5) / 4 * rel; });
  const est = V(p.estacas, lt);
  W3.estacas.forEach(e => { e.material = p.madeira ? W3.estMad : W3.conc; e.visible = est > 0.05; e.scale.y = Math.max(0.01, est); e.position.y = -est / 2 - 0.2; });
  // coluna e degraus
  W3.coluna.visible = !!p.coluna; W3.coluna.position.y = 0;
  const nd = Math.round(V(p.degraus, lt));
  W3.degraus.forEach((d, i) => { d.visible = i < nd; });
  W3.poco.visible = !!p.poco;
  W3.gotas.forEach((m, i) => { const q = (t * 0.8 + i / 16) % 1; m.position.set(0, lerp(Y.areia + 0.4, 0.5, q), Z1 + 0.05); m.visible = !!p.poco; });
  // encosta
  const en = p.encosta; W3.enc.visible = !!en;
  W3.natural.visible = en === 'natural' || en === 'desaba' && lt > 0.55;
  W3.corte.visible = en === 'corte' || en === 'muro' || en === 'gabiao' || en === 'desaba' && lt <= 0.55;
  W3.monte.visible = en === 'desaba' && lt > 0.45 || p.monte === 1;
  if (en === 'desaba') { const k = ease(clamp((lt - 0.35) * 3)); W3.monte.scale.set(1, k, 1); W3.natural.scale.set(1, 1 - 0.45 * k, 1); } else { W3.monte.scale.set(1, 1, 1); W3.natural.scale.set(1, 1, 1); }
  const mi = grau(V(p.muro_inclina, lt));
  W3.muro.visible = en === 'muro'; W3.muro.rotation.z = mi; W3.corte.rotation.z = mi * 0.6; W3.corte.position.x = -Math.sin(mi) * 1.2;
  W3.gab.visible = en === 'gabiao';
  W3.brita.visible = !!p.dreno && en === 'muro'; W3.barbaca.forEach(b => b.visible = !!p.dreno);
  const aw = V(p.agua_muro, lt); W3.aguaMuro.visible = aw > 0.02 && !!en; W3.aguaMuro.scale.y = Math.max(0.01, aw * W3.HM); W3.aguaMuro.position.y = aw * W3.HM / 2;
  W3.jatos.forEach((m, i) => { const q = (t * 1.3 + i / 12) % 1, yb = i % 2 ? 0.8 : 1.9; m.visible = !!p.dreno && en === 'muro'; m.position.set(W3.XM - 0.1 - q * 0.9, yb - q * q * 1.2, Z1 + 0.05); });
  // estrada
  const es = p.estrada, calc = !!p.calcada; W3.est.visible = !!es || calc;
  W3.lama.visible = es === 'lama'; W3.casc.visible = es === 'cascalho';
  W3.basec.visible = es === 'base' || es === 'asfalto' || calc;
  const ab = !!p.abaulado; W3.asfPlano.visible = es === 'asfalto' && !ab; W3.asfCurvo.visible = es === 'asfalto' && ab; W3.faixa.visible = es === 'asfalto';
  W3.faixa.position.y = ab ? 0.78 : 0.6;
  const chuva = V(p.chuva, lt);
  W3.poca.visible = !!es && !ab && chuva > 0.1; W3.poca.position.y = es === 'lama' ? 0.13 : es === 'cascalho' ? 0.31 : es === 'base' ? 0.46 : 0.6; W3.poca.scale.y = 1;
  const bu = V(p.buraco, lt); W3.furo.visible = bu > 0.05; W3.furo.scale.set(0.3 + bu * 0.7, 1, 0.3 + bu * 0.7); W3.furo.position.y = es === 'asfalto' ? (ab ? 0.7 : 0.55) : 0.3;
  W3.valetas.forEach(v => v.visible = !!p.valeta);
  const um = V(p.umido, lt); W3.umido.visible = um > 0.02; W3.umido.material.opacity = 0.4 * um;
  W3.calc.visible = calc; W3.raiz.visible = calc && V(p.raiz, lt) > 0.02; W3.arv.visible = calc && p.raiz !== undefined;
  const rz = V(p.raiz, lt), tr = V(p.trinca, lt), jun = !!p.junta;
  W3.raiz.scale.setScalar(0.4 + rz * 0.6); W3.raiz.position.y = -0.5 + rz * 0.25;
  W3.placas.forEach((g, i) => { const s = i ? 1 : -1; g.position.x = s * (jun ? 1.42 : 1.375) + (tr > 0 ? s * tr * 0.06 : 0); g.position.y = i === 1 ? rz * 0.28 : 0; g.rotation.z = i === 1 ? rz * 0.12 : 0; });
  W3.cano.visible = W3.esgoto.visible = !!p.cano;
  const cv = V(p.cavidade, lt), co = V(p.colapso, lt); W3.vazio.visible = cv > 0.02; W3.vazio.scale.set(0.6 + cv * 1.6, 0.4 + cv * 1.0, 1); W3.vazio.position.y = -2.0 + cv * 0.9;
  if (es) { const cai = co * 1.4; [W3.asfPlano, W3.asfCurvo, W3.basec, W3.faixa].forEach(m => { m.userData.y0 ??= m.position.y; m.position.y = m.userData.y0 - cai; m.rotation.z = co * 0.15; }); }
  const tri = p.trilho; W3.trilho.visible = !!tri; if (tri) { W3.est.visible = true; W3.lastro.visible = tri === 'brita'; W3.dormentes.visible = tri !== 'terra';
    const at = V(p.afunda_trilho, lt); W3.dormentes.position.y = (tri === 'brita' ? 0 : -0.58) - at; W3.trilhos.position.y = (tri === 'terra' ? -0.77 : tri === 'dormente' ? -0.58 : 0) - at; }
  // poste
  W3.post.visible = !!p.poste;
  const pp = p.poste_prof ?? 0.6, pi = grau(V(p.poste_inclina, lt)), pod = V(p.podre, lt);
  W3.postInf.scale.y = pp; W3.postInf.position.y = -pp / 2; W3.postPiv.rotation.z = pi;
  W3.postInf.material = pod > 0.4 ? W3.podreM : W3.madeira;
  const pb = p.poste_base || 'terra'; W3.colar.visible = pb === 'concreto'; W3.colar.scale.y = pp * 0.85; W3.colar.position.y = -pp * 0.85 / 2 + 0.02;
  W3.cascPost.visible = pb === 'cascalho' || pb === 'concreto'; W3.cascPost.position.y = -pp;
  // chuva
  W3.chuva.forEach(m => { const u = m.userData, q = (t * 1.4 + u.f) % 1; m.visible = chuva > u.f * 0.95; m.position.set(u.x, lerp(9, 0, q), u.z); });
}

const FOCO = {
  casa: { x: 0, y: 0.6, d: 13, h: 1.6 }, fundo: { x: 0, y: -2.8, d: 17, h: 1.2 }, predio: { x: 0, y: 3.5, d: 26, h: 2 },
  muro: { x: 8.0, y: 1.2, d: 11, h: 1.6 }, estrada: { x: -9.5, y: 0.2, d: 12, h: 2.2 }, poste: { x: -4.3, y: 0.4, d: 7.5, h: 1.2 },
  trilho: { x: -9.5, y: 0.4, d: 7.5, h: 1.4 }, calcada: { x: -9.5, y: 0.2, d: 9, h: 1.6 },
  coluna: { x: 4.6, y: 2.4, d: 19, h: 1.6 }, geral: { x: 0, y: 0, d: 30, h: 3 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: 0.6, d: 13, a: 0, h: 1.6, zFoco: Z1 }, p => FOCO[p.foco] || {}); }

function overlay(t, ctx) {
  const S = W3.S, p = S.p, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)';
  const cor = p.cor === 'red' ? COL.red : p.cor === 'green' ? COL.green : branco, fg = p.cor === 'red' || p.cor === 'green' ? '#fff' : COL.ink;
  if (p.rotulo) pill(W / 2, H * 0.12, p.rotulo, cor, fg, 44, s);
  (p.marcas || []).forEach((m, i) => { const [px, py] = proj(m.x + (S.gx || 0), m.y, ZF + 0.05); pill(px, py, m.t, m.cor === 'red' ? COL.red : m.cor === 'green' ? COL.green : branco, m.cor ? '#fff' : COL.ink, 34, back((t - ctx.t0 - 0.25 - i * 0.15) * 3)); });
  // rachaduras na parede (2D, presas a casa)
  const ra = V(p.racha, S.lt);
  if (ra > 0.02 && p.casa) {
    const af = V(p.afunda, S.lt) + S.cede, base = p.casa === 'predio' ? 13 : 2.8;
    x.save(); x.strokeStyle = 'rgba(30,22,16,0.9)'; x.lineWidth = 6; x.lineJoin = 'round';
    for (const [xa, dir] of [[-1.3, 1], [1.2, -1]]) {
      x.beginPath(); let [qx, qy] = proj(xa + (S.gx || 0), 0.4 - af, 2.12); x.moveTo(qx, qy);
      for (let k = 1; k <= 6; k++) { const yy = 0.4 + k / 6 * base * 0.75 * ra; const [ax, ay] = proj(xa + dir * k * 0.12 + (k % 2 ? 0.12 : -0.08) + (S.gx || 0), yy - af, 2.12); x.lineTo(ax, ay); }
      x.stroke();
    }
    x.restore();
  }
  // setas: peso da casa para baixo, empurrao da terra no muro
  const seta = (x0, y0, x1, y1, c) => { x.save(); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 14; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); x.beginPath(); x.moveTo(x1 + Math.cos(a) * 26, y1 + Math.sin(a) * 26); x.lineTo(x1 + Math.cos(a + 2.4) * 34, y1 + Math.sin(a + 2.4) * 34); x.lineTo(x1 + Math.cos(a - 2.4) * 34, y1 + Math.sin(a - 2.4) * 34); x.fill(); x.restore(); };
  const pe = V(p.peso, S.lt);
  if (pe > 0.02 && p.casa) { const af = V(p.afunda, S.lt) + S.cede; for (const xx of [-1.5, 0, 1.5]) { const k = (t * 0.9 + xx) % 1, [ax, ay] = proj(xx, 1.2 - af, ZF), [bx, by] = proj(xx, -0.8 - af - k * 1.2, ZF); x.globalAlpha = pe; seta(ax, ay, bx, by, COL.red); } x.globalAlpha = 1; }
  const ca = V(p.carga, S.lt);
  if (ca > 0.02 && p.encosta) { for (const yy of [0.7, 1.6, 2.5]) { const [ax, ay] = proj(W3.XM + 1.8, yy, ZF), [bx, by] = proj(W3.XM + 0.7, yy, ZF); x.globalAlpha = ca; seta(ax, ay, bx, by, COL.red); } x.globalAlpha = 1; }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
