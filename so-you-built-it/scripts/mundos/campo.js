// Mundo "campo": sitio com o solo em corte. Casinha de madeira (NAO o sobrado do quintal()), celeiro, silo e moinho
// ao fundo, morros no horizonte. Palco por parametro (igual terreno/riacho): cada cena diz o estado em "p";
// [a, b] anima de a ate b na cena. Serve para: cisterna de chuva, privada/fossa seca e poco, fogao a lenha e chamine,
// caixa d'agua, seca. (PLANO-KIRO-MUNDOS.md, mundo 6; feito pelo Claude em 17/11/2026.)
//
// p aceito (tudo opcional):
//  foco: "geral" | "casa" | "cisterna" | "privada" | "poco" | "chamine" | "fundo" | "dentro"   (enquadramento)
//  -- casinha (x = -6.5) --
//  interior: 1 (parede da frente aberta, ve o comodo)   fogo: "chao" | "fogao"   chamine: 0 | "curta" | "alta"
//  fumaca_dentro: 0..1 (comodo enche de fumaca)   fumaca: 0..1 (fumaca sai pelo topo da chamine)
//  desce: 1 (vento empurra a fumaca de volta para baixo)   vento: 0..1 (setas de vento)
//  creosoto: 0..1 (crosta preta no cano, cano em corte)   fogo_chamine: 0..1 (chamas no topo)
//  teto_queima: 0..1 (telhado em volta do cano fica em brasa)   colar: 1 (colar isolante onde o cano passa)
//  chapeu: 1 (chapeu com tela no topo)   faisca: 0..1 (faiscas saindo)   tiragem: 0..1 (setas do ar quente subindo)
//  -- agua da chuva (x -3.5 .. 0) --
//  calha: 1 (calha + descida)   tambor: 1 (tambor aberto sob a descida)   mosquito: 0..1
//  cisterna: 1 (tanque de concreto enterrado, no corte)   tampa: 1   nivel: 0..1 (agua na cisterna)
//  sujo: 0..1 (agua marrom)   desvio: 1 (desvio das primeiras aguas, cano ao lado da descida)
//  filtro: 1 (tela na calha)   bomba: 1 (bomba manual na tampa)   ladrao: 1 (cano extravasor saindo da cisterna)
//  -- privada e poco (x 3.5 .. 11) --
//  privada: 1 (casinha)   privada_x: x em m para mudar o lugar (padrao 4.2; ex.: [4.2, 1])   fossa_seca: profundidade em m (ex.: 2)
//  enche: 0..1 (fossa enchendo)   cheiro: 0..1   moscas: 0..1   respiro: 1 (cano preto de respiro)
//  cal: 1 (camada de cinza/serragem)   poco: 1 (poco de agua a direita)   lencol: nivel da agua em m (ex.: -4)
//  contamina: 0..1 (mancha marrom da fossa ate o poco)   seca: 0..1 (grama amarela, chao rachado)
//  -- geral --
//  chuva: 0..1   rotulo: "TEXTO"   cor: "red" | "green" | "white"   marcas: [{"t": "Clay", "x": 0, "y": -3}]
(() => {
const X0 = -15, X1 = 15, Z0 = -3, Z1 = 2.5, ZF = Z1 + 0.06;
const Y = { grama: -0.18, terra: -1.4, argila: -4.5, areia: -7.5, fundo: -10 };
const XC = -6.5, XP = 4.2, XW = 11, XT = -1.6;  // casa, privada, poco, cisterna
const W3 = {};
const V = (v, lt, d = 0) => v === undefined || v === null ? d : Array.isArray(v) ? lerp(v[0], v[1], ease(clamp(lt * 1.6))) : v;

function fundo() {
  const ceu = new T3.Mesh(new T3.SphereGeometry(180, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new T3.MeshBasicMaterial({ map: textura('ceu', GERA.ceu).tx, side: T3.BackSide, fog: false }));
  ceu.material.map.repeat.set(3, 1); scene.add(ceu);
  scene.fog = new T3.Fog(0xd8e4ea, 45, 170);
  W3.gramaM = tmat('grama', { relevo: 1 }); W3.secaM = mat(0xc9b26a, { roughness: 0.95 });
  W3.pasto = new T3.Mesh(new T3.PlaneGeometry(400, 200), W3.gramaM); W3.pasto.rotation.x = -Math.PI / 2; W3.pasto.position.set(0, -0.01, Z0 - 100); W3.pasto.receiveShadow = true; scene.add(W3.pasto); uvMundo(W3.pasto, 3);
  // morros no horizonte
  const morro = mat(0x6f8f55, { roughness: 1 });
  for (const [mx, mz, r, h] of [[-60, -120, 40, 0.35], [10, -140, 55, 0.3], [70, -115, 42, 0.4], [-20, -100, 30, 0.25]]) {
    const m = new T3.Mesh(new T3.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), morro); m.scale.y = h; m.position.set(mx, -1, mz); scene.add(m);
  }
  // celeiro vermelho
  const cel = grupo(); cel.position.set(-14, 0, -30);
  const verm = mat(0x9b2f25, { roughness: 0.8 }), branco = mat(0xf2ede2);
  box(9, 5, 7, verm, 0, 2.5, 0, cel);
  const tri = new T3.Shape(); tri.moveTo(-4.9, 0); tri.lineTo(4.9, 0); tri.lineTo(0, 3); tri.closePath();
  const tel = new T3.Mesh(new T3.ExtrudeGeometry(tri, { depth: 7.6, bevelEnabled: false }), mat(0x4a4744)); tel.position.set(0, 5, -3.8); tel.castShadow = true; cel.add(tel);
  box(3, 3.6, 0.1, branco, 0, 1.8, 3.52, cel); box(2.6, 3.2, 0.1, mat(0x7a241c), 0, 1.7, 3.56, cel);
  box(0.16, 4.2, 0.12, branco, 0, 1.8, 3.62, cel).rotation.z = 0.68; box(0.16, 4.2, 0.12, branco, 0, 1.8, 3.62, cel).rotation.z = -0.68;
  // silo
  const silo = cyl(2, 2, 11, mat(0xb8bcc0, { metalness: 0.5, roughness: 0.45 }), 24); silo.position.set(-5.5, 5.5, -32);
  const dome = new T3.Mesh(new T3.SphereGeometry(2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x9ea3a8, { metalness: 0.5, roughness: 0.4 })); dome.position.set(-5.5, 11, -32); scene.add(dome);
  // moinho de vento (torre de trelica + roda)
  const moi = grupo(); moi.position.set(16, 0, -26);
  const ferro = mat(0x6b6f74, { metalness: 0.6, roughness: 0.5 });
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = cyl(0.08, 0.08, 9.4, ferro, 6, moi); p.position.set(a * 0.7, 4.6, b * 0.7); p.rotation.z = -a * 0.07; p.rotation.x = b * 0.07; }
  W3.roda = grupo(moi); W3.roda.position.set(0, 9.3, 0.9);
  for (let i = 0; i < 18; i++) { const pa = box(0.32, 1.7, 0.04, mat(0xd9d4c8), 0, 1.25, 0, W3.roda); const g = new T3.Group(); g.rotation.z = i / 18 * Math.PI * 2; W3.roda.add(g); g.add(pa); }
  box(0.08, 0.6, 2.4, ferro, 0, 9.3, -0.4, moi);
  // cerca e arvores
  const cerca = tmat('cerca', { relevo: 1 });
  for (let i = -6; i <= 6; i++) { const p = box(0.15, 1.2, 0.15, cerca, i * 3.2, 0.6, -13); uvMundo(p, 1); }
  for (const yy of [0.45, 0.95]) uvMundo(box(39, 0.1, 0.06, cerca, 0, yy, -13), 2);
  for (const [px, pz, sc] of [[-19, -9, 1.4], [20, -11, 1.6], [8, -36, 1.8], [-24, -40, 1.6], [27, -30, 1.4]]) arvore(px, pz, sc);
}

function casa() {
  const g = W3.casa = grupo(); g.position.set(XC, 0, 0);
  const mad = W3.madM = tmat('madeira', { relevo: 1.2 }), escuro = mat(0x5a3d25);
  W3.paredeF = uvMundo(box(5.6, 2.7, 0.12, mad, 0, 1.55, 1.9, g), 1.6);
  uvMundo(box(5.6, 2.7, 0.12, mad, 0, 1.55, -1.9, g), 1.6);
  for (const s of [-1, 1]) uvMundo(box(0.12, 2.7, 3.9, mad, s * 2.8, 1.55, 0, g), 1.6);
  box(5.7, 0.2, 4.1, escuro, 0, 0.1, 0, g);  // assoalho elevado
  // janela e porta na frente (somem com o interior)
  W3.frente = grupo(g);
  box(1.1, 1.0, 0.05, mat(0x86a9c9, { roughness: 0.2 }), 1.4, 1.8, 1.98, W3.frente); box(0.9, 1.8, 0.05, mat(0x6b4426), -0.6, 1.1, 1.98, W3.frente);
  // telhado de duas aguas (cumeeira em x): cada agua e uma placa inclinada
  const tm = W3.telM = mat(0x5c5f63, { metalness: 0.4, roughness: 0.55 });
  W3.telhas = [];
  for (const s of [-1, 1]) { const t = box(3.4, 0.08, 4.6, tm, s * 1.5, 3.55, 0, g); t.rotation.z = -s * 0.5; W3.telhas.push(t); }
  // calha e descida (lado direito, frente)
  W3.calha = grupo(g);
  box(0.18, 0.14, 4.4, mat(0x9aa0a6, { metalness: 0.7, roughness: 0.35 }), 3.05, 2.75, 0, W3.calha);
  W3.descida = cyl(0.08, 0.08, 2.6, mat(0x9aa0a6, { metalness: 0.7, roughness: 0.35 }), 10, W3.calha); W3.descida.position.set(3.1, 1.45, 1.95);
  W3.filtro = box(0.24, 0.05, 4.4, mat(0x2b2b2b, { metalness: 0.3 }), 3.05, 2.84, 0, g);
  W3.desvio = cyl(0.11, 0.11, 1.6, mat(0xd5d8dc), 10, g); W3.desvio.position.set(3.45, 2.0, 1.95);
  // comodo por dentro
  W3.dentro = grupo(g);
  box(5.4, 0.02, 3.7, mat(0x7a5434), 0, 0.21, 0, W3.dentro);
  box(1.2, 0.8, 0.6, mat(0x8d6a45), 1.6, 0.6, -1.4, W3.dentro);  // mesa
  // fogo no chao (pedras + chamas) e fogao de ferro
  W3.fogoChao = grupo(W3.dentro); W3.fogoChao.position.set(-1.2, 0.22, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, s = new T3.Mesh(new T3.IcosahedronGeometry(0.16, 0), mat(0x7b7570)); s.position.set(Math.cos(a) * 0.45, 0.08, Math.sin(a) * 0.45); W3.fogoChao.add(s); }
  W3.fogao = grupo(W3.dentro); W3.fogao.position.set(-1.2, 0.22, -0.6);
  const ferro = mat(0x222324, { metalness: 0.5, roughness: 0.5 });
  box(1.1, 0.8, 0.8, ferro, 0, 0.45, 0, W3.fogao); W3.portinha = box(0.5, 0.35, 0.03, mat(0xff8a2a, { emissive: 0xff5a10, emissiveIntensity: 1.2 }), 0, 0.4, 0.42, W3.fogao);
  W3.chamas = [];
  const fm = new T3.MeshBasicMaterial({ color: 0xffa23a, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 6; i++) { const f = new T3.Mesh(new T3.ConeGeometry(0.12, 0.5, 6), fm); W3.fogoChao.add(f); W3.chamas.push(f); }
  W3.luzFogo = new T3.PointLight(0xff8a3a, 0, 6); W3.luzFogo.position.set(-1.2, 0.8, 0.3); W3.dentro.add(W3.luzFogo);
  // chamine (cano de ferro) sai do fogao e atravessa o telhado do lado esquerdo
  W3.cano = cyl(0.14, 0.14, 1, mat(0x6a6e73, { metalness: 0.6, roughness: 0.4 }), 12, g); W3.cano.castShadow = false;
  W3.chamaTopo = grupo(g); for (let i = 0; i < 4; i++) { const f = new T3.Mesh(new T3.ConeGeometry(0.22 - i * 0.03, 1.1 - i * 0.15, 8), new T3.MeshBasicMaterial({ color: i % 2 ? 0xffd040 : 0xff6a1a, transparent: true, opacity: 0.92 })); f.position.set((i - 1.5) * 0.08, 0.5, 0); W3.chamaTopo.add(f); }
  W3.canoCorte = box(0.2, 1, 0.02, mat(0x140d06, { roughness: 1 }), 0, 0, 0, g);  // crosta de creosoto (aparece no cano em corte)
  W3.colar = cyl(0.3, 0.3, 0.3, mat(0xb9b2a5), 14, g);
  W3.chapeu = grupo(g); { const c = new T3.Mesh(new T3.ConeGeometry(0.36, 0.25, 12), ferro); c.position.y = 0.32; W3.chapeu.add(c); const t = cyl(0.16, 0.16, 0.22, mat(0x444444, { wireframe: true }), 10, W3.chapeu); t.position.y = 0.1; }
  W3.brasa = box(1.7, 0.05, 1.7, new T3.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0 }), 0, 0, 0, g); W3.brasa.rotation.z = 0.5; W3.brasa.castShadow = false;
  // fumaca dentro do comodo
  W3.nevoa = box(5.4, 2.4, 3.6, new T3.MeshBasicMaterial({ color: 0x8e8e8e, transparent: true, opacity: 0, depthWrite: false }), 0, 1.45, 0, g); W3.nevoa.castShadow = false;
}

function agua() {
  // tambor aberto
  W3.tambor = cyl(0.45, 0.45, 1.0, mat(0x2f5f8a, { roughness: 0.5 }), 18); W3.tambor.position.set(XC + 3.1, 0.5, 1.95);
  W3.tamborAgua = cyl(0.42, 0.42, 0.02, new T3.MeshStandardMaterial({ color: 0x5f8f6a, roughness: 0.2 }), 18); W3.tamborAgua.position.set(XC + 3.1, 0.92, 1.95);
  // cisterna enterrada (no corte): caixa de concreto oca vista em corte
  const conc = tmat('concreto', { relevo: 1.5 });
  W3.cist = grupo(); W3.cist.position.set(XT, 0, 0);
  for (const s of [-1, 1]) uvMundo(box(0.25, 2.6, 0.3, conc, s * 1.25, -1.3, Z1 - 0.07, W3.cist), 1.5);
  uvMundo(box(2.75, 0.25, 0.3, conc, 0, -2.6, Z1 - 0.07, W3.cist), 1.5);
  W3.vaoCist = box(2.25, 2.35, 0.02, mat(0x3a332b), 0, -1.3, ZF + 0.005, W3.cist); W3.vaoCist.castShadow = false;  // fundo escuro do vao
  W3.aguaCistM = new T3.MeshBasicMaterial({ color: 0x3f8fd8, transparent: true, opacity: 0.85 });
  W3.aguaCist = box(2.25, 1, 0.1, W3.aguaCistM, 0, 0, ZF + 0.03, W3.cist); W3.aguaCist.castShadow = false;
  W3.tampa = box(2.9, 0.18, 2.3, conc, 0, 0.05, Z1 - 1.15, W3.cist); uvMundo(W3.tampa, 1.5);
  W3.bomba = grupo(W3.cist); { const v = mat(0x2f6b3a, { metalness: 0.4, roughness: 0.5 }); const c = cyl(0.12, 0.12, 1.1, v, 10, W3.bomba); c.position.set(0.6, 0.65, Z1 - 1.0); const a = box(0.8, 0.07, 0.07, v, 0.95, 1.2, Z1 - 1.0, W3.bomba); a.rotation.z = 0.35; const b = cyl(0.04, 0.04, 2.3, v, 8, W3.bomba); b.position.set(0.6, -1.1, ZF + 0.08); }
  // cano da descida ate a cisterna (enterrado, raso)
  { const xa = XC + 3.1, xb = XT - 1.0; W3.canoEnt = grupo(); box(xb - xa, 0.16, 0.16, mat(0xd5d8dc), (xa + xb) / 2, -0.35, ZF + 0.02, W3.canoEnt); box(0.16, 0.5, 0.16, mat(0xd5d8dc), xa, -0.1, ZF + 0.02, W3.canoEnt); }
  W3.ladrao = box(1.8, 0.14, 0.14, mat(0xd5d8dc), XT + 2.1, -0.55, ZF + 0.02);
  W3.mosq = []; for (let i = 0; i < 14; i++) W3.mosq.push([rnd(i * 3.1) - 0.5, rnd(i * 5.7), rnd(i * 7.3) * 6.28]);
}

function privadaPoco() {
  const mad = tmat('cerca', { relevo: 1 });
  W3.priv = grupo(); W3.priv.position.set(XP, 0, 0.6);
  for (const s of [-1, 1]) uvMundo(box(0.08, 2.3, 1.4, mad, s * 0.7, 1.15, 0, W3.priv), 1.2);
  uvMundo(box(1.48, 2.3, 0.08, mad, 0, 1.15, -0.7, W3.priv), 1.2);
  uvMundo(box(1.48, 2.3, 0.08, mad, 0, 1.15, 0.7, W3.priv), 1.2);
  box(0.14, 0.4, 0.03, mat(0x2a1c10), 0, 1.9, 0.75, W3.priv);  // lua da porta (fresta)
  const tt = box(1.7, 0.08, 1.7, mat(0x5c5f63, { metalness: 0.4 }), 0, 2.35, 0, W3.priv); tt.rotation.z = 0.12;
  W3.respiro = cyl(0.1, 0.1, 4.2, mat(0x161616, { roughness: 0.4 }), 10, W3.priv); W3.respiro.position.set(0.86, 1.1, 0.2);
  // fossa (no corte, abaixo da privada)
  W3.fossa = grupo(); W3.fossaVao = box(1.2, 1, 0.02, mat(0x2b2620), 0, 0, ZF + 0.005, W3.fossa);
  W3.fossaParede = []; for (const s of [-1, 1]) W3.fossaParede.push(box(0.12, 1, 0.3, mat(0x6b5a44), s * 0.66, 0, Z1 - 0.07, W3.fossa));
  W3.lodo = box(1.2, 1, 0.1, mat(0x6e4b22, { roughness: 1 }), 0, 0, ZF + 0.03, W3.fossa); W3.lodo.castShadow = false;
  W3.cal = box(1.2, 0.12, 0.12, mat(0xd8d2c4), 0, 0, ZF + 0.04, W3.fossa);
  W3.mancha = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ color: 0x5a3a1a, transparent: true, opacity: 0, depthWrite: false })); W3.mancha.position.z = ZF + 0.06; scene.add(W3.mancha);
  // poco: mureta de pedra + poco em corte ate o lencol
  W3.poco = grupo(); W3.poco.position.set(XW, 0, 0);
  const pedra = tmat('rocha', { relevo: 3 });
  for (const s of [-1, 1]) uvMundo(box(0.25, 0.8, 1.4, pedra, s * 0.75, 0.4, Z1 - 0.7, W3.poco), 1);
  for (const s of [-1, 1]) box(0.1, 1.6, 0.1, mat(0x6b4a2e), s * 0.75, 1.5, Z1 - 0.7, W3.poco);
  box(1.7, 0.1, 0.1, mat(0x6b4a2e), 0, 2.25, Z1 - 0.7, W3.poco);
  W3.balde = cyl(0.18, 0.14, 0.3, mat(0x7a7d80, { metalness: 0.5 }), 10, W3.poco); W3.balde.position.set(0, 1.2, Z1 - 0.7);
  W3.pocoVao = box(1.25, Math.abs(Y.areia) + 0.5, 0.02, mat(0x22201c), 0, (Y.areia - 0.5) / 2, ZF + 0.005, W3.poco);
  W3.lencol = box(X1 - X0, 1, 0.02, new T3.MeshBasicMaterial({ color: 0x3f9fe3, transparent: true, opacity: 0.32, depthWrite: false }), 0, 0, ZF);
  W3.lencolLinha = box(X1 - X0, 0.05, 0.03, new T3.MeshBasicMaterial({ color: 0x9fd4ff }), 0, 0, ZF + 0.01);
}

function monta() {
  fundo();
  scene.add(sun.target);
  // solo em corte
  const camada = (y0, y1, m) => uvMundo(box(X1 - X0, y1 - y0, Z1 - Z0, m, 0, (y0 + y1) / 2, (Z0 + Z1) / 2), 2.2);
  W3.topo = camada(Y.grama, 0, W3.gramaM);
  camada(Y.terra, Y.grama, tmat('terra'));
  camada(Y.argila, Y.terra, tmat('argila'));
  camada(Y.areia, Y.argila, tmat('terra2', { color: 0xd8c08a }));
  camada(Y.fundo, Y.areia, tmat('rocha', { relevo: 4 }));
  casa(); agua(); privadaPoco();
  // chuva e fumaca (particulas)
  const gm = new T3.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.55 });
  W3.chuva = []; for (let i = 0; i < 160; i++) { const m = new T3.Mesh(new T3.BoxGeometry(0.02, 0.45, 0.02), gm); m.userData = { x: (rnd(i * 1.7) - 0.5) * 34, z: Z0 + rnd(i * 2.9) * (Z1 - Z0 + 2), f: rnd(i * 4.1) }; scene.add(m); W3.chuva.push(m); }
  W3.fumacaM = new T3.MeshBasicMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.55, depthWrite: false });
  W3.fum = []; for (let i = 0; i < 26; i++) { const m = new T3.Mesh(new T3.IcosahedronGeometry(0.3, 1), W3.fumacaM); m.userData.f = i / 26; scene.add(m); W3.fum.push(m); }
  W3.fagulhas = []; const fa = new T3.MeshBasicMaterial({ color: 0xffb040 }); for (let i = 0; i < 14; i++) { const m = new T3.Mesh(new T3.SphereGeometry(0.04, 6, 4), fa); m.userData.f = rnd(i * 3.3); scene.add(m); W3.fagulhas.push(m); }
  W3.gotas = []; for (let i = 0; i < 10; i++) { const m = new T3.Mesh(new T3.SphereGeometry(0.05, 6, 4), new T3.MeshBasicMaterial({ color: 0x9fd4ff })); scene.add(m); W3.gotas.push(m); }
}

function atualiza(t, ctx) {
  const p = ctx.p, lt = ctx.lt, S = W3.S = { p, lt };
  sun.position.set(-8, 16, 12); sun.target.position.set(0, 0, 0);
  W3.roda.rotation.z = t * 0.9;
  const seca = V(p.seca, lt), chuva = V(p.chuva, lt);
  W3.pasto.material = W3.topo.material = seca > 0.5 ? W3.secaM : W3.gramaM;
  // ---- casa: interior, fogo, chamine, fumaca ----
  const intr = !!p.interior;
  W3.paredeF.visible = W3.frente.visible = !intr;
  const fogo = p.fogo; W3.fogoChao.visible = fogo === 'chao'; W3.fogao.visible = fogo === 'fogao';
  W3.chamas.forEach((f, i) => { const a = i / 6 * Math.PI * 2; f.position.set(Math.cos(a) * 0.18, 0.25 + 0.05 * Math.sin(t * 9 + i), Math.sin(a) * 0.18); f.scale.y = 0.8 + 0.35 * Math.sin(t * 11 + i * 2); });
  W3.luzFogo.intensity = fogo ? 6 + Math.sin(t * 13) * 1.2 : 0;
  const ch = p.chamine || 0, xCano = -1.2, yBase = fogo === 'fogao' ? 1.1 : 2.6;
  const yCruz = 3.55 + Math.tan(0.5) * (xCano + 1.5);  // altura da agua esquerda do telhado no x do cano
  const yTopo = ch === 'alta' ? 5.6 : ch === 'curta' ? yCruz + 0.35 : yBase;
  W3.cano.visible = !!ch; W3.canoCorte.visible = !!ch && V(p.creosoto, lt) > 0.02;
  if (ch) { const hh = yTopo - yBase; W3.cano.scale.y = hh; W3.cano.position.set(xCano, yBase + hh / 2, fogo === 'fogao' ? -0.6 : 0);
    W3.canoCorte.scale.set(0.3 + V(p.creosoto, lt) * 0.9, hh, 1); W3.canoCorte.position.set(xCano, yBase + hh / 2, (fogo === 'fogao' ? -0.6 : 0) + 0.16); }
  W3.colar.visible = !!ch && !!p.colar; W3.colar.position.set(xCano, yCruz, fogo === 'fogao' ? -0.6 : 0);
  W3.chapeu.visible = !!ch && !!p.chapeu; W3.chapeu.position.set(xCano, yTopo, fogo === 'fogao' ? -0.6 : 0);
  const tq = V(p.teto_queima, lt); W3.brasa.material.opacity = tq * (0.7 + 0.3 * Math.sin(t * 7)); W3.brasa.visible = tq > 0.02; W3.brasa.position.set(xCano, yCruz + 0.05, fogo === 'fogao' ? -0.6 : 0);
  W3.nevoa.material.opacity = 0.75 * V(p.fumaca_dentro, lt);
  const fu = V(p.fumaca, lt), desce = !!p.desce, zc = fogo === 'fogao' ? -0.6 : 0;
  W3.fum.forEach((m, i) => { const q = (t * 0.35 + m.userData.f) % 1; m.visible = fu > 0.02 && !!ch;
    const dy = desce ? (q < 0.35 ? q * 2.2 : 0.77 - (q - 0.35) * 3.2) : q * 6, dx = desce ? q * 2.2 : q * 1.6 * (0.4 + V(p.vento, lt));
    m.position.set(XC + xCano + dx + Math.sin(i * 2.1 + t) * 0.15 * q, yTopo + 0.3 + dy, zc + Math.cos(i * 1.7) * 0.2 * q); m.scale.setScalar(0.5 + q * 2.2); });
  W3.fumacaM.opacity = 0.5 * fu;
  const fc = V(p.fogo_chamine, lt), fa = Math.max(V(p.faisca, lt), fc);
  W3.chamaTopo.visible = fc > 0.02 && !!ch; W3.chamaTopo.position.set(xCano, yTopo, zc); W3.chamaTopo.children.forEach((f, i) => { f.scale.set(1, fc * (0.8 + 0.35 * Math.sin(t * 12 + i * 1.7)), 1); f.position.y = 0.5 * f.scale.y; });
  W3.fagulhas.forEach((m, i) => { const q = (t * 0.9 + m.userData.f) % 1; m.visible = fa > 0.02 && !!ch && !(p.chapeu && i % 3); m.position.set(XC + xCano + (rnd(i * 7.1) - 0.5) * 2.2 * q, yTopo + 0.2 + q * 2.4 - q * q * 2.6, zc + 0.4 + (rnd(i * 2.3) - 0.5) * 1.2 * q); });
  // ---- agua da chuva ----
  W3.calha.visible = !!p.calha; W3.filtro.visible = !!p.filtro && !!p.calha; W3.desvio.visible = !!p.desvio && !!p.calha;
  W3.tambor.visible = W3.tamborAgua.visible = !!p.tambor;
  const ci = !!p.cisterna; W3.cist.visible = ci; W3.tampa.visible = ci && !!p.tampa; W3.bomba.visible = ci && !!p.bomba;
  W3.canoEnt.visible = ci && !!p.calha; W3.ladrao.visible = ci && !!p.ladrao;
  const nv = V(p.nivel, lt), hA = Math.max(0.02, nv * 2.3); W3.aguaCist.visible = ci && nv > 0.01; W3.aguaCist.scale.y = hA; W3.aguaCist.position.y = -2.475 + hA / 2;
  const su = V(p.sujo, lt); W3.aguaCistM.color.setRGB(lerp(0.25, 0.45, su), lerp(0.56, 0.33, su), lerp(0.85, 0.16, su));
  W3.gotas.forEach((m, i) => { const q = (t * 1.6 + i / 10) % 1; m.visible = !!p.calha && chuva > 0.2;
    if (ci) m.position.set(lerp(XC + 3.1, XT - 1.0, q), -0.35, ZF + 0.12); else m.position.set(XC + 3.1, lerp(1.6, 0.95, q), Z1 - 0.4); });
  // ---- privada, fossa, poco ----
  const pv = p.privada, xp = p.privada_x === undefined ? XP : V(p.privada_x, lt);
  W3.priv.visible = !!pv; W3.priv.position.x = xp; W3.respiro.visible = !!p.respiro;
  const fs = V(p.fossa_seca, lt); W3.fossa.visible = !!pv && fs > 0.05; W3.fossa.position.set(xp, -fs / 2 - 0.05, 0);
  W3.fossaVao.scale.y = fs; W3.fossaParede.forEach(m => m.scale.y = fs);
  const en = V(p.enche, lt), hl = Math.max(0.01, en * fs); W3.lodo.scale.y = hl; W3.lodo.position.y = -fs / 2 + hl / 2; W3.lodo.visible = en > 0.01;
  W3.cal.visible = !!p.cal && en > 0.01; W3.cal.position.y = -fs / 2 + hl + 0.06;
  W3.poco.visible = !!p.poco;
  const len = p.lencol === undefined ? null : V(p.lencol, lt);
  W3.lencol.visible = W3.lencolLinha.visible = len !== null;
  if (len !== null) { const h = Math.max(0.05, len - Y.areia); W3.lencol.scale.y = h; W3.lencol.position.y = Y.areia + h / 2; W3.lencolLinha.position.y = len; }
  const co = V(p.contamina, lt); W3.mancha.material.opacity = 0.55 * co;
  { const xa = xp, xb = xa + (XW - xa) * co, yb = len ?? -4; W3.mancha.scale.set(Math.max(0.1, xb - xa + 1.2), Math.max(0.5, fs + Math.abs(yb) * co), 1); W3.mancha.position.set((xa + xb) / 2, (-fs + yb * co) / 2 - 0.3, ZF + 0.06); }
  W3.chuva.forEach(m => { const u = m.userData, q = (t * 1.4 + u.f) % 1; m.visible = chuva > u.f * 0.95; m.position.set(u.x, lerp(9, 0, q), u.z); });
}

const FOCO = {
  geral: { x: 0, y: 2.6, d: 30, h: 2 }, casa: { x: XC, y: 1.6, d: 13, h: 1.4 }, dentro: { x: XC, y: 1.3, d: 9, h: 0.6 },
  chamine: { x: XC - 1, y: 3.6, d: 12, h: 1.2 }, cisterna: { x: XT - 1.2, y: -0.3, d: 11, h: 1.2 },
  privada: { x: XP, y: 0.2, d: 10, h: 1.2 }, poco: { x: (XP + XW) / 2, y: -2.2, d: 19, h: 1.2 }, fundo: { x: 0, y: -2.6, d: 19, h: 1.2 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { ...FOCO.casa, a: 0, zFoco: Z1 }, p => FOCO[p.foco] || {}); }

function overlay(t, ctx) {
  const S = W3.S, p = S.p, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)';
  const cor = p.cor === 'red' ? COL.red : p.cor === 'green' ? COL.green : branco, fg = p.cor === 'red' || p.cor === 'green' ? '#fff' : COL.ink;
  if (p.rotulo) pill(W / 2, H * 0.12, p.rotulo, cor, fg, 44, s);
  (p.marcas || []).forEach((m, i) => { const [px, py] = proj(m.x, m.y, ZF + 0.05); pill(px, py, m.t, m.cor === 'red' ? COL.red : m.cor === 'green' ? COL.green : branco, m.cor ? '#fff' : COL.ink, 34, back((t - ctx.t0 - 0.25 - i * 0.15) * 3)); });
  const seta = (x0, y0, x1, y1, c) => { x.save(); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 12; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); const a = Math.atan2(y1 - y0, x1 - x0); x.beginPath(); x.moveTo(x1 + Math.cos(a) * 24, y1 + Math.sin(a) * 24); x.lineTo(x1 + Math.cos(a + 2.3) * 24, y1 + Math.sin(a + 2.3) * 24); x.lineTo(x1 + Math.cos(a - 2.3) * 24, y1 + Math.sin(a - 2.3) * 24); x.closePath(); x.fill(); x.restore(); };
  // mosquitos em volta do tambor
  const mq = V(p.mosquito, S.lt);
  if (mq > 0.02 && p.tambor) { x.fillStyle = '#111'; W3.mosq.forEach(([dx, dy, f], i) => { if (i / 14 > mq) return; const [px, py] = proj(XC + 3.1 + dx * 1.6 + Math.sin(t * 3 + f) * 0.25, 1.2 + dy * 1.2 + Math.cos(t * 4 + f) * 0.2, 2.2); x.beginPath(); x.arc(px, py, 9, 0, 6.28); x.fill(); }); }
  // moscas e cheiro na privada
  const xp = p.privada_x === undefined ? XP : V(p.privada_x, S.lt);
  const mo = V(p.moscas, S.lt);
  if (mo > 0.02 && p.privada) { x.fillStyle = '#111'; for (let i = 0; i < 12 * mo; i++) { const [px, py] = proj(xp + Math.sin(t * 2.3 + i * 1.9) * 1.1, 1.4 + Math.cos(t * 3.1 + i) * 0.9, 1.4); x.beginPath(); x.arc(px, py, 5, 0, 6.28); x.fill(); } }
  const che = V(p.cheiro, S.lt);
  if (che > 0.02 && p.privada) { x.save(); x.strokeStyle = `rgba(120,170,40,${0.85 * che})`; x.lineWidth = 9; x.lineCap = 'round';
    for (const k of [-0.5, 0, 0.5]) { x.beginPath(); for (let j = 0; j <= 12; j++) { const yy = 2.5 + j * 0.12 + ((t * 0.5) % 1) * 0.4, [px, py] = proj(xp + k + Math.sin(j * 0.9 + t * 3 + k * 4) * 0.18, yy, 1.3); j ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
    x.restore(); }
  // ar quente subindo no cano (tiragem) e vento
  const ti = V(p.tiragem, S.lt);
  if (ti > 0.02 && p.chamine) { x.globalAlpha = ti; for (let k = 0; k < 3; k++) { const q = (t * 0.8 + k / 3) % 1, [ax, ay] = proj(XC - 1.2 + 0.45, 1.4 + q * 2.6, 2.0), [bx, by] = proj(XC - 1.2 + 0.45, 1.9 + q * 2.6, 2.0); seta(ax, ay, bx, by, COL.yellow); } x.globalAlpha = 1; }
  const ve = V(p.vento, S.lt);
  if (ve > 0.02) { x.globalAlpha = ve; for (const yy of [4.6, 5.4, 6.2]) { const q = (t * 0.7 + yy) % 1, [ax, ay] = proj(XC - 5 + q * 3, yy, 0), [bx, by] = proj(XC - 3.6 + q * 3, yy - (p.desce ? 0.6 : 0), 0); seta(ax, ay, bx, by, 'rgba(255,255,255,0.95)'); } x.globalAlpha = 1; }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
