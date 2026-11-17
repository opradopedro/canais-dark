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
//  -- pecas novas (17/11, rotina de roteiros): caixa d'agua, moinho no poco, biodigestor --
//  caixa: "chao" | "alta" (caixa d'agua em x = 7.6)   caixa_h: altura da base em m (padrao 6; ex.: [0, 6])   caixa_nivel: 0..1
//  cano_poco: 1 (cano do poco ate o topo da caixa)   enche_caixa: 0..1 (agua caindo dentro da caixa)
//  cano_casa: 1 (cano da caixa, enterrado, ate a torneira na parede da casa)   torneira: 0..1 (jato: fraco 0.15, forte 1)
//  pressao: 0..1 (setas descendo pelo cano)   boia: 1 (boia + ladrao no topo da caixa)   escora: 1 (travas em X nas pernas)
//  bomba_mao: 1 (bomba de alavanca no poco)   bombeia: 0..1 (alavanca sobe e desce)
//  moinho_poco: 1 (cata-vento de muitas pas em torre sobre o poco)   gira: 0..1 (velocidade da roda e da haste)
//  dobra: 0..1 (tempestade: roda vira de lado, fora do vento)   haste: 1 (haste e pistao no poco em corte)   sobe: 0..1 (agua subindo no cano)
//  bio: 1 (biodigestor enterrado em x = -1.6, cupula em corte)   bio_nivel: 0..1 (esterco diluido)   bolhas: 0..1
//  bio_aberto: 1 (sem cupula: tanque aberto)   gas: 0..1 (gas amarelo em cima)   gasometro: 0..1 (tambor flutuante que sobe)
//  gas_cano: 1 (cano de gas ate o fogao)   chama_azul: 1 (chama azul no fogao; use interior: 1, fogo: "fogao")
//  esterco: 0..1 (monte de esterco no chao)   moscas_esterco: 0..1   cheiro_esterco: 0..1   biofert: 0..1 (adubo saindo para a horta)
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

const XK = 7.6;  // caixa d'agua
function extras() {
  const aco = mat(0x9aa3ab, { metalness: 0.6, roughness: 0.35 }), ferro = mat(0x5a5f66, { metalness: 0.6, roughness: 0.5 }), pvc = mat(0xd5d8dc);
  // caixa d'agua: tanque + 4 pernas (escala em y conforme a altura) + travas
  W3.cx = grupo(); W3.cx.position.set(XK, 0, 0.4);
  W3.tanque = cyl(1.15, 1.15, 1.9, aco, 24, W3.cx);
  W3.tampaCx = new T3.Mesh(new T3.ConeGeometry(1.25, 0.45, 24), ferro); W3.cx.add(W3.tampaCx);
  W3.nivelCx = box(0.28, 1, 0.04, new T3.MeshBasicMaterial({ color: 0x3f9fe3 }), 0, 0, 1.17, W3.cx); W3.nivelCx.castShadow = false;
  W3.reguaCx = box(0.34, 1.8, 0.03, mat(0x2a2e33), 0, 0, 1.16, W3.cx); W3.reguaCx.castShadow = false;
  W3.pernas = []; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) W3.pernas.push(box(0.14, 1, 0.14, ferro, a * 0.8, 0, b * 0.8, W3.cx));
  W3.travas = grupo(W3.cx); for (const zz of [-0.8, 0.8]) for (const s of [-1, 1]) { const t = box(0.07, 1, 0.07, ferro, 0, 0, zz, W3.travas); t.userData.s = s; }
  W3.boia = grupo(W3.cx); { const b = new T3.Mesh(new T3.SphereGeometry(0.16, 10, 8), mat(0xff8a2a)); b.position.set(-0.5, 0, 0.6); W3.boia.add(b); const l = box(1.6, 0.1, 0.1, pvc, 1.6, 0, 0.6, W3.boia); }
  // cano do poco ate a caixa (3 trechos) e da caixa ate a casa (4 trechos)
  W3.cPoco = [box(1, 0.12, 0.12, pvc), box(0.12, 1, 0.12, pvc), box(1, 0.12, 0.12, pvc)];
  W3.cCasa = [box(0.14, 1, 0.14, pvc), box(1, 0.14, 0.14, pvc), box(0.14, 1, 0.14, pvc), box(0.5, 0.1, 0.1, mat(0xb08d3a, { metalness: 0.7 }))];
  W3.jato = []; for (let i = 0; i < 16; i++) { const m = new T3.Mesh(new T3.SphereGeometry(0.07, 6, 4), new T3.MeshBasicMaterial({ color: 0x7fc4ff })); m.userData.f = i / 16; scene.add(m); W3.jato.push(m); }
  W3.queda = []; for (let i = 0; i < 10; i++) { const m = new T3.Mesh(new T3.SphereGeometry(0.06, 6, 4), new T3.MeshBasicMaterial({ color: 0x7fc4ff })); m.userData.f = i / 10; scene.add(m); W3.queda.push(m); }
  // bomba de alavanca no poco
  W3.bmao = grupo(); W3.bmao.position.set(XW + 0.35, 0.8, Z1 - 0.7);
  { const v = mat(0x2f6b3a, { metalness: 0.4, roughness: 0.5 }); cyl(0.13, 0.13, 1.2, v, 10, W3.bmao).position.y = 0.5; const bc = cyl(0.04, 0.04, 0.5, v, 8, W3.bmao); bc.rotation.z = Math.PI / 2; bc.position.set(-0.3, 0.8, 0);
    W3.alav = grupo(W3.bmao); W3.alav.position.set(0, 1.1, 0); box(1.2, 0.07, 0.07, v, 0.55, 0, 0, W3.alav); }
  // cata-vento sobre o poco
  W3.mp = grupo(); W3.mp.position.set(XW, 0, Z1 - 0.7);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = cyl(0.06, 0.06, 7.4, ferro, 6, W3.mp); p.position.set(a * 0.75, 3.6, b * 0.75); p.rotation.z = -a * 0.08; p.rotation.x = b * 0.08; }
  for (let k = 1; k < 4; k++) { const yy = k * 1.8, w = 1.5 - k * 0.12; for (const zz of [-1, 1]) box(w * 2 * 0.75 + 0.1, 0.05, 0.05, ferro, 0, yy, zz * (0.75 - k * 0.05), W3.mp); }
  W3.mpCab = grupo(W3.mp); W3.mpCab.position.set(0, 7.3, 0);
  W3.mpRoda = grupo(W3.mpCab); W3.mpRoda.position.set(0, 0, 0.5);
  for (let i = 0; i < 18; i++) { const g = new T3.Group(); g.rotation.z = i / 18 * Math.PI * 2; W3.mpRoda.add(g); const pa = box(0.36, 1.5, 0.03, mat(0xdfe3e6, { metalness: 0.4 }), 0, 1.05, 0, g); pa.rotation.y = 0.35; }
  cyl(0.18, 0.18, 0.4, ferro, 12, W3.mpRoda).rotation.x = Math.PI / 2;
  const cauda = box(0.04, 0.9, 1.6, mat(0xb0362b), 0, 0.3, -1.6, W3.mpCab); box(0.06, 0.06, 1.6, ferro, 0, 0, -0.8, W3.mpCab);
  W3.hasteA = cyl(0.035, 0.035, 1, mat(0x8a8f96, { metalness: 0.7 }), 6); W3.hasteA.castShadow = false;
  W3.hasteB = cyl(0.04, 0.04, 1, mat(0x8a8f96, { metalness: 0.7 }), 6); W3.hasteB.castShadow = false;
  W3.cilindro = box(0.42, 0.9, 0.05, mat(0x4a4e55, { metalness: 0.5 }), XW, 0, ZF + 0.05); W3.cilindro.castShadow = false;
  W3.pistao = box(0.36, 0.14, 0.06, mat(0xd8a431, { metalness: 0.6 }), XW, 0, ZF + 0.08); W3.pistao.castShadow = false;
  W3.tuboPoco = box(0.2, 1, 0.04, new T3.MeshBasicMaterial({ color: 0x3f9fe3, transparent: true, opacity: 0.85 }), XW + 0.3, 0, ZF + 0.07); W3.tuboPoco.castShadow = false;
  // biodigestor (corte): paredes, cupula, entrada inclinada, caixa de saida
  const XB = XT, tij = mat(0xa0563a, { roughness: 0.9 }), escuro = mat(0x2a241e);
  W3.bio = grupo(); W3.bio.position.set(XB, -0.9, 0);  // tudo 0.9 m mais fundo: a cupula fica abaixo da grama
  W3.bioVao = box(2.6, 2.4, 0.02, escuro, 0, -1.7, ZF + 0.005, W3.bio); W3.bioVao.castShadow = false;
  for (const s of [-1, 1]) box(0.22, 2.4, 0.3, tij, s * 1.4, -1.7, Z1 - 0.07, W3.bio);
  box(3.0, 0.22, 0.3, tij, 0, -3.0, Z1 - 0.07, W3.bio);
  W3.cup = new T3.Mesh(new T3.RingGeometry(1.28, 1.5, 24, 1, 0, Math.PI), tij); W3.cup.position.set(0, -0.5, ZF + 0.01); W3.bio.add(W3.cup);
  W3.cupVao = new T3.Mesh(new T3.CircleGeometry(1.28, 24, 0, Math.PI), escuro); W3.cupVao.position.set(0, -0.5, ZF + 0.006); W3.bio.add(W3.cupVao);
  W3.gasM = new T3.MeshBasicMaterial({ color: 0xf2d75a, transparent: true, opacity: 0.5, depthWrite: false });
  W3.gasArea = new T3.Mesh(new T3.CircleGeometry(1.26, 24, 0, Math.PI), W3.gasM); W3.gasArea.position.set(0, -0.5, ZF + 0.02); W3.bio.add(W3.gasArea);
  W3.slurry = box(2.56, 1, 0.08, mat(0x6b4a22, { roughness: 1 }), 0, 0, ZF + 0.03, W3.bio); W3.slurry.castShadow = false;
  W3.entrada = cyl(0.16, 0.16, 3.2, pvc, 10, W3.bio); W3.entrada.position.set(-2.0, -0.4, ZF + 0.04); W3.entrada.rotation.z = -0.55; W3.entrada.castShadow = false;
  W3.funil = new T3.Mesh(new T3.CylinderGeometry(0.45, 0.2, 0.5, 14), mat(0x8a7a66)); W3.funil.position.set(-2.85, 1.1, Z1 - 0.3); W3.bio.add(W3.funil);
  W3.saida = box(0.9, 1.9, 0.3, tij, 2.1, -0.05, Z1 - 0.07, W3.bio); W3.saidaVao = box(0.6, 1.7, 0.02, mat(0x5a3d1c), 2.1, 0.0, ZF + 0.02, W3.bio);
  W3.adubo = box(3.5, 0.06, 0.6, mat(0x5a3d1c, { roughness: 1 }), 4.4, 0.93, Z1 - 0.4, W3.bio);
  W3.gasometro = grupo(W3.bio); { const d = cyl(0.8, 0.8, 1.1, mat(0x6f767e, { metalness: 0.5, roughness: 0.45 }), 20, W3.gasometro); d.position.y = 0.55; } W3.gasometro.position.set(0, 0.6, Z1 - 1.2);
  W3.gasCano = grupo(W3.bio); { const y = mat(0xd8a431, { metalness: 0.5 }); box(0.1, 1.6, 0.1, y, 0, 1.3, Z1 - 1.2, W3.gasCano); box(XB - (XC + 2.8) + 0.2, 0.1, 0.1, y, -(XB - (XC + 2.8)) / 2, 2.1, Z1 - 1.2, W3.gasCano); }
  W3.monte = new T3.Mesh(new T3.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x4e3416, { roughness: 1 })); W3.monte.position.set(XB + 3.4, 0, Z1 - 1.2); W3.monte.scale.set(1.1, 0.6, 0.8); scene.add(W3.monte);
  W3.bolhas = []; for (let i = 0; i < 18; i++) { const m = new T3.Mesh(new T3.SphereGeometry(0.07, 6, 4), new T3.MeshBasicMaterial({ color: 0xfff0a0 })); m.userData = { x: (rnd(i * 3.7) - 0.5) * 2.2, f: rnd(i * 1.3) }; scene.add(m); W3.bolhas.push(m); }
  // chama azul no fogao
  W3.azul = grupo(W3.fogao); for (let i = 0; i < 6; i++) { const f = new T3.Mesh(new T3.ConeGeometry(0.06, 0.22, 6), new T3.MeshBasicMaterial({ color: i % 2 ? 0x3a7bff : 0x7fb0ff, transparent: true, opacity: 0.9 })); const a = i / 6 * Math.PI * 2; f.position.set(0.25 + Math.cos(a) * 0.12, 0.95, Math.sin(a) * 0.12); W3.azul.add(f); }
}

function atualizaExtras(t, p, lt) {
  // ---- caixa d'agua ----
  const cx = p.caixa, h = cx === 'chao' ? 0 : V(p.caixa_h, lt, 6), yc = h + 0.95;
  W3.cx.visible = !!cx; W3.tanque.position.y = yc; W3.tampaCx.position.y = yc + 1.17;
  const nv = V(p.caixa_nivel, lt, 0.7); W3.nivelCx.scale.y = Math.max(0.02, nv * 1.75); W3.nivelCx.position.y = yc - 0.875 + nv * 0.875; W3.reguaCx.position.y = yc;
  W3.pernas.forEach(m => { m.visible = h > 0.2; m.scale.y = Math.max(0.01, h); m.position.y = h / 2; });
  W3.travas.visible = !!p.escora && h > 0.2; W3.travas.children.forEach((m, i) => { const L = Math.hypot(h, 1.6); m.scale.y = L; m.position.set(0, h / 2, m.position.z); m.rotation.z = m.userData.s * Math.atan2(1.6, h); });
  W3.boia.visible = !!cx && !!p.boia; W3.boia.position.y = yc - 0.85 + nv * 1.6;
  const topo = yc + 1.0;
  const cp = !!cx && !!p.cano_poco; W3.cPoco.forEach(m => m.visible = cp);
  if (cp) { const xa = XW - 0.3, xb = XK + 1.3; W3.cPoco[0].scale.x = xa - xb; W3.cPoco[0].position.set((xa + xb) / 2, 1.0, Z1 - 0.7);
    W3.cPoco[1].scale.y = topo - 1.0; W3.cPoco[1].position.set(xb, (topo + 1.0) / 2, Z1 - 0.7); W3.cPoco[2].scale.x = 1.0; W3.cPoco[2].position.set(xb - 0.5, topo, Z1 - 0.7); }
  const ec = V(p.enche_caixa, lt); W3.queda.forEach(m => { const q = (t * 1.5 + m.userData.f) % 1; m.visible = cp && ec > 0.02; m.position.set(XK + 0.8, topo - q * 1.2, Z1 - 0.7 + (m.userData.f - 0.5) * 0.1); });
  const cc = !!cx && !!p.cano_casa; W3.cCasa.forEach(m => m.visible = cc);
  const xt = XC + 2.95, yt = 1.0, yen = -0.5;
  if (cc) { W3.cCasa[0].scale.y = yc - 0.95 - yen + 0.1; W3.cCasa[0].position.set(XK - 0.3, (yc - 0.95 + yen) / 2, ZF + 0.03);
    W3.cCasa[1].scale.x = XK - 0.3 - xt; W3.cCasa[1].position.set((XK - 0.3 + xt) / 2, yen, ZF + 0.03);
    W3.cCasa[2].scale.y = yt - yen; W3.cCasa[2].position.set(xt, (yt + yen) / 2, ZF + 0.03); W3.cCasa[3].position.set(xt + 0.25, yt, ZF + 0.03); }
  const tn = V(p.torneira, lt);
  W3.jato.forEach(m => { const q = (t * 2 + m.userData.f) % 1; m.visible = cc && tn > 0.02; const vx = 0.4 + tn * 3.2; m.position.set(xt + 0.5 + vx * q * 0.6, yt - 4.9 * (q * 0.6) * (q * 0.6), ZF + 0.08); });
  // ---- bomba de mao e cata-vento ----
  W3.bmao.visible = !!p.bomba_mao; W3.alav.rotation.z = 0.35 * Math.sin(t * 5) * V(p.bombeia, lt);
  const mpv = !!p.moinho_poco, gi = V(p.gira, lt), dob = V(p.dobra, lt);
  W3.mp.visible = mpv; W3.mpCab.rotation.y = dob * 1.4; W3.mpRoda.rotation.z = -t * (0.3 + gi * 5) * (1 - 0.7 * dob) * (gi > 0.02 ? 1 : 0);
  const ha = mpv && !!p.haste, len = p.lencol === undefined ? -4 : V(p.lencol, lt), yp = len - 0.9, curso = 0.25 * Math.sin(t * (0.3 + gi * 5) * (1 - 0.7 * dob)) * (gi > 0.02 ? 1 : 0);
  W3.hasteA.visible = mpv; W3.hasteA.scale.y = 7.2 - 0.9; W3.hasteA.position.set(XW, (7.2 + 0.9) / 2 + curso, Z1 - 0.7);
  W3.hasteB.visible = W3.cilindro.visible = W3.pistao.visible = ha; W3.hasteB.scale.y = 0.9 - yp; W3.hasteB.position.set(XW, (0.9 + yp) / 2 + curso, ZF + 0.08);
  W3.cilindro.position.y = yp; W3.pistao.position.y = yp + curso;
  const so = V(p.sobe, lt); W3.tuboPoco.visible = ha && so > 0.02; { const hh = Math.max(0.05, (0.9 - yp) * so); W3.tuboPoco.scale.y = hh; W3.tuboPoco.position.y = yp + hh / 2; }
  // ---- biodigestor ----
  const bi = !!p.bio; W3.bio.visible = bi; W3.monte.visible = V(p.esterco, lt) > 0.02; W3.monte.scale.set(1.1, 0.6 * Math.max(0.05, V(p.esterco, lt)), 0.8);
  if (bi) { const ab = !!p.bio_aberto; W3.cup.visible = W3.cupVao.visible = !ab;
    const bn = V(p.bio_nivel, lt), hs = Math.max(0.02, bn * 2.4); W3.slurry.visible = bn > 0.01; W3.slurry.scale.y = hs; W3.slurry.position.y = -2.9 + hs / 2;
    const g = V(p.gas, lt); W3.gasArea.visible = !ab && g > 0.02; W3.gasM.opacity = 0.55 * g;
    W3.gasometro.visible = p.gasometro !== undefined; W3.gasometro.position.y = 0.95 + V(p.gasometro, lt) * 1.0;
    W3.gasCano.visible = !!p.gas_cano; W3.adubo.visible = V(p.biofert, lt) > 0.02; W3.adubo.scale.x = Math.max(0.05, V(p.biofert, lt)); W3.adubo.position.x = 2.65 + 1.75 * W3.adubo.scale.x;
    const bo = V(p.bolhas, lt); W3.bolhas.forEach(m => { const q = (t * 0.6 + m.userData.f) % 1; m.visible = bo > m.userData.f * 0.9 && bn > 0.05; m.position.set(XT + m.userData.x, -3.8 + q * (hs + (ab ? 3.4 : 1.4)), ZF + 0.1); }); }
  else W3.bolhas.forEach(m => m.visible = false);
  W3.azul.visible = !!p.chama_azul; W3.azul.children.forEach((f, i) => f.scale.y = 0.8 + 0.3 * Math.sin(t * 14 + i));
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
  casa(); agua(); privadaPoco(); extras();
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
  atualizaExtras(t, p, lt);
}

const FOCO = {
  geral: { x: 0, y: 2.6, d: 30, h: 2 }, casa: { x: XC, y: 1.6, d: 13, h: 1.4 }, dentro: { x: XC, y: 1.3, d: 9, h: 0.6 },
  chamine: { x: XC - 1, y: 3.6, d: 12, h: 1.2 }, cisterna: { x: XT - 1.2, y: -0.3, d: 11, h: 1.2 },
  privada: { x: XP, y: 0.2, d: 10, h: 1.2 }, caixa: { x: XK + 0.6, y: 4.2, d: 17, h: 0.6 }, caixa_casa: { x: 0.8, y: 2.6, d: 37, h: 1 },
  torneira: { x: XC + 3.6, y: 0.9, d: 8, h: 0.6 }, moinho: { x: XW - 0.5, y: 3.6, d: 18, h: 0.6 }, pistao: { x: XW, y: -2.6, d: 11, h: 0.8 },
  bio: { x: XT + 0.3, y: -1.6, d: 12, h: 1.2 }, esterco: { x: XT + 3.0, y: 0.6, d: 10, h: 1.2 }, poco: { x: (XP + XW) / 2, y: -2.2, d: 19, h: 1.2 }, fundo: { x: 0, y: -2.6, d: 19, h: 1.2 },
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
  // setas de pressao no cano da caixa
  const pr = V(p.pressao, S.lt);
  if (pr > 0.02 && p.cano_casa) { x.globalAlpha = pr; const h = p.caixa === 'chao' ? 0 : V(p.caixa_h, S.lt, 6); for (let k = 0; k < 3; k++) { const q = (t * 0.7 + k / 3) % 1, yy = h * (1 - q) - 0.2, [ax, ay] = proj(XK - 0.3 - 0.5, yy + 0.6, ZF + 0.1), [bx, by] = proj(XK - 0.3 - 0.5, yy, ZF + 0.1); seta(ax, ay, bx, by, COL.yellow); } x.globalAlpha = 1; }
  const me = V(p.moscas_esterco, S.lt);
  if (me > 0.02) { x.fillStyle = '#111'; for (let i = 0; i < 14 * me; i++) { const [px, py] = proj(XT + 3.4 + Math.sin(t * 2.3 + i * 1.9) * 1.3, 0.9 + Math.cos(t * 3.1 + i) * 0.6, Z1 - 0.6); x.beginPath(); x.arc(px, py, 5, 0, 6.28); x.fill(); } }
  const ce = Math.max(V(p.cheiro_esterco, S.lt), p.bio_aberto ? V(p.cheiro_esterco, S.lt) : 0);
  if (ce > 0.02) { x.save(); x.strokeStyle = `rgba(120,170,40,${0.85 * ce})`; x.lineWidth = 9; x.lineCap = 'round'; const xc0 = p.bio_aberto ? XT : XT + 3.4;
    for (const k of [-0.6, 0, 0.6]) { x.beginPath(); for (let j = 0; j <= 12; j++) { const yy = 0.8 + j * 0.12 + ((t * 0.5) % 1) * 0.4, [px, py] = proj(xc0 + k + Math.sin(j * 0.9 + t * 3 + k * 4) * 0.18, yy, Z1 - 0.6); j ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
    x.restore(); }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
