// Pacote 17 (17-japao). Old Tales / Japao antigo. Cria PALS.cl_japao (vermelho torii, branco/preto sumi-e, rosa sakura, verde).
// Roteiro usa "tema":"epico"/"mito" + "paleta":"japao". f_mar_japao: onda estilizada propria, NAO copiar Hokusai. const O17; helpers p17_.
//   f_castelo_japao f_vila_japao f_torii f_dojo f_mar_japao f_palacio_dragao_mar + momotaro oni kitsune tanuki

if (typeof PALS !== 'undefined' && !PALS.cl_japao) {
  PALS.cl_japao = { fundo1: '#3a4a5a', fundo2: '#14202a', parede: 'rgba(255,245,240,0.06)', creme: '#f2ece0', papel: '#f2ece0', tinta: '#1a1414',
    destaque: '#d6453a', acento: '#e8a0b0', acento2: '#5a7a5a', perigo: '#9a2a24', ok: '#5a7a5a', luz: 'rgba(255,220,220,0.18)',
    fonteTit: '700 {s}px Georgia, "Times New Roman", serif', fonteTxt: 'italic 400 {s}px Georgia, "Times New Roman", serif' };
}

const O17 = { vermelho: '#d6453a', vermelhoEsc: '#9a2a24', madeira: '#5a4330', madeiraEsc: '#352616', branco: '#f2ece0', preto: '#1a1414',
  sakura: '#e8a0b0', verde: '#5a7a5a', verdeEsc: '#3a5a3a', agua: '#2a6a8a', aguaEsc: '#164a60', pedra: '#8a8a82', telha: '#3a4654', ouro: '#d6b24a', neve: '#e4edf0' };

// cerejeira (helper)
const p17_sakura = (cx, baseY, s = 1) => {
  x.save(); x.translate(cx, baseY); x.scale(s, s);
  x.strokeStyle = O17.madeiraEsc; x.lineWidth = 10; x.beginPath(); x.moveTo(0, 0); x.lineTo(-8, -80); x.stroke(); x.lineWidth = 6; x.beginPath(); x.moveTo(-6, -60); x.lineTo(-40, -90); x.moveTo(-6, -50); x.lineTo(30, -80); x.stroke();
  x.fillStyle = O17.sakura; for (const [bx, by] of [[-8, -100], [-44, -96], [30, -90], [-20, -112], [10, -108]]) { x.beginPath(); x.arc(bx, by, 24, 0, 7); x.fill(); }
  x.restore();
};

// telhado japones em beiral curvo (helper)
const p17_telhado = (px, py, w) => {
  x.fillStyle = O17.telha; x.beginPath(); x.moveTo(px - 14, py); x.quadraticCurveTo(px + w / 2, py - 30, px + w + 14, py); x.lineTo(px + w, py - 4); x.quadraticCurveTo(px + w / 2, py - 22, px, py - 4); x.fill();
};

// f_castelo_japao: castelo de telhados em camadas, cerejeiras.
COMP.f_castelo_japao = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  x.fillStyle = O17.verdeEsc; x.fillRect(0, H * 0.72, W, H * 0.28);
  // base de pedra
  x.fillStyle = O17.pedra; x.beginPath(); x.moveTo(W * 0.3, H * 0.72); x.lineTo(W * 0.4, H * 0.56); x.lineTo(W * 0.6, H * 0.56); x.lineTo(W * 0.7, H * 0.72); x.fill();
  // torre com 4 andares de telhado
  for (let k = 0; k < 4; k++) { const u = k / 4; const cw = W * (0.3 - u * 0.05); const cy = H * (0.56 - k * 0.11); x.fillStyle = O17.branco; x.fillRect(W * 0.5 - cw / 2, cy - H * 0.08, cw, H * 0.08); p17_telhado(W * 0.5 - cw / 2 - 10, cy, cw + 20); }
  // topo dourado
  x.fillStyle = O17.ouro; x.fillRect(W * 0.49, H * 0.1, W * 0.02, H * 0.04);
  // cerejeiras
  p17_sakura(W * 0.12, H * 0.78, 1); p17_sakura(W * 0.88, H * 0.78, 1);
};

// f_vila_japao: casas de madeira, arrozal, ponte.
COMP.f_vila_japao = (t, lt, p) => {
  const T = TF(); ceuFlat('dia', t);
  // montanha ao fundo
  x.fillStyle = '#7a8a94'; x.beginPath(); x.moveTo(W * 0.5, H * 0.2); x.lineTo(W * 0.2, H * 0.5); x.lineTo(W * 0.8, H * 0.5); x.fill(); x.fillStyle = O17.neve; x.beginPath(); x.moveTo(W * 0.5, H * 0.2); x.lineTo(W * 0.42, H * 0.3); x.lineTo(W * 0.58, H * 0.3); x.fill();
  // arrozal (faixas de agua espelhada)
  x.fillStyle = '#6a8a6a'; x.fillRect(0, H * 0.5, W, H * 0.5); x.fillStyle = 'rgba(120,170,190,0.4)'; for (let i = 0; i < 4; i++) x.fillRect(0, H * (0.56 + i * 0.1), W, H * 0.04);
  // casas de madeira
  for (let i = 0; i < 2; i++) { const hx = W * (0.1 + i * 0.5); x.fillStyle = O17.madeira; x.fillRect(hx, H * 0.52, W * 0.2, H * 0.14); p17_telhado(hx - 8, H * 0.52, W * 0.2 + 16); x.fillStyle = O17.preto; x.fillRect(hx + W * 0.08, H * 0.58, W * 0.04, H * 0.08); }
  // ponte em arco
  x.strokeStyle = O17.vermelho; x.lineWidth = 10; x.beginPath(); x.arc(W * 0.5, H * 0.92, W * 0.18, Math.PI + 0.4, -0.4); x.stroke();
};

// f_torii: portao vermelho na agua (Itsukushima).
COMP.f_torii = (t, lt, p) => {
  const T = TF(); ceuFlat('por', t);
  // mar
  x.fillStyle = O17.agua; x.fillRect(0, H * 0.6, W, H * 0.4); x.fillStyle = 'rgba(255,220,220,0.12)'; for (let i = 0; i < 4; i++) x.fillRect(0, H * (0.66 + i * 0.07), W, 3);
  // torii na agua
  x.fillStyle = O17.vermelho; x.fillRect(W * 0.3, H * 0.34, 20, H * 0.4); x.fillRect(W * 0.66, H * 0.34, 20, H * 0.4);
  x.fillRect(W * 0.24, H * 0.3, W * 0.5, 16); // travessa superior curva
  x.beginPath(); x.moveTo(W * 0.22, H * 0.3); x.quadraticCurveTo(W * 0.5, H * 0.24, W * 0.78, H * 0.3); x.lineTo(W * 0.78, H * 0.26); x.quadraticCurveTo(W * 0.5, H * 0.2, W * 0.22, H * 0.26); x.fill();
  x.fillRect(W * 0.3, H * 0.4, W * 0.36, 12); // travessa de baixo
  // reflexo
  x.save(); x.globalAlpha = 0.25; x.fillStyle = O17.vermelho; x.fillRect(W * 0.3, H * 0.74, 20, H * 0.18); x.fillRect(W * 0.66, H * 0.74, 20, H * 0.18); x.restore();
};

// f_dojo: samurai treinando.
COMP.f_dojo = (t, lt, p) => {
  const T = TF(); fundoFlat('#3a2f24', '#1a1208');
  // piso de tatame
  x.fillStyle = '#8a7a54'; x.fillRect(0, H * 0.74, W, H * 0.26); x.strokeStyle = '#6a5a3a'; x.lineWidth = 2; for (let i = 0; i < 6; i++) x.strokeRect(W * (i / 6), H * 0.74, W / 6, H * 0.13);
  // parede de shoji (papel em grade)
  x.fillStyle = '#d8d0c0'; x.fillRect(W * 0.1, H * 0.2, W * 0.8, H * 0.54); x.strokeStyle = O17.madeiraEsc; x.lineWidth = 4; for (let i = 0; i <= 6; i++) { x.beginPath(); x.moveTo(W * (0.1 + i * 0.133), H * 0.2); x.lineTo(W * (0.1 + i * 0.133), H * 0.74); x.stroke(); } for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(W * 0.1, H * (0.2 + i * 0.135)); x.lineTo(W * 0.9, H * (0.2 + i * 0.135)); x.stroke(); }
  // samurai treinando com katana
  if (typeof figura === 'function') figura(W * 0.5, H * 0.9, 0.95, { figurino: 'samurai', arma: 'katana', pose: 'ataca', olhar: 1 }, t);
  // personagem opcional (momotaro/oni/kitsune/tanuki) a esquerda
  if (p.pers && typeof O17_pers[p.pers] === 'function') O17_pers[p.pers](W * 0.2, H * 0.92, 0.9, {}, t);
};

// f_mar_japao: onda grande estilizada PROPRIA (nao Hokusai), barco de pesca.
COMP.f_mar_japao = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  // mar base
  x.fillStyle = O17.agua; x.fillRect(0, H * 0.5, W, H * 0.5);
  // onda grande estilizada (espiral de cristas arredondadas, geometria propria)
  x.save(); x.translate(W * 0.34, H * 0.56);
  x.fillStyle = O17.aguaEsc; x.beginPath(); x.moveTo(-W * 0.3, H * 0.2); x.quadraticCurveTo(-W * 0.1, -H * 0.3, W * 0.2, -H * 0.1); x.quadraticCurveTo(W * 0.1, -H * 0.02, W * 0.12, H * 0.06); x.quadraticCurveTo(-W * 0.05, H * 0.02, -W * 0.3, H * 0.2); x.fill();
  // espuma (bolhas brancas na crista)
  x.fillStyle = O17.branco; for (let i = 0; i < 7; i++) { const a = -2.3 + i * 0.3; x.beginPath(); x.arc(Math.cos(a) * W * 0.22, -H * 0.06 + Math.sin(a) * H * 0.1, 10 - i, 0, 7); x.fill(); }
  x.restore();
  // ondas menores em camadas
  x.fillStyle = '#3a7a9a'; for (let r = 0; r < 3; r++) { x.beginPath(); x.moveTo(0, H * (0.7 + r * 0.08)); for (let xx = 0; xx <= W; xx += 40) x.lineTo(xx, H * (0.7 + r * 0.08) + Math.sin(xx * 0.03 + t + r) * 10); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }
  // barquinho de pesca
  x.fillStyle = O17.madeiraEsc; x.beginPath(); x.moveTo(W * 0.7, H * 0.66); x.quadraticCurveTo(W * 0.76, H * 0.72, W * 0.82, H * 0.66); x.lineTo(W * 0.8, H * 0.62); x.lineTo(W * 0.72, H * 0.62); x.fill();
};

// f_palacio_dragao_mar: Urashima Taro, palacio no fundo do mar, tartaruga.
COMP.f_palacio_dragao_mar = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a5a6a', '#06242e', [0.5, 0.3, 500]);
  // bolhas subindo
  x.fillStyle = 'rgba(220,245,250,0.25)'; for (let i = 0; i < 12; i++) { const bx = (i * 83) % W; const by = H - ((t * 30 + i * 60) % H); x.beginPath(); x.arc(bx, by, 4 + (i % 3) * 3, 0, 7); x.fill(); }
  // palacio (telhados vermelhos em camadas, submerso)
  x.fillStyle = '#c94a3a'; for (let k = 0; k < 3; k++) { const cw = W * (0.4 - k * 0.08); const cy = H * (0.5 - k * 0.12); x.fillStyle = O17.branco; x.fillRect(W * 0.5 - cw / 2, cy - H * 0.08, cw, H * 0.08); x.fillStyle = '#c94a3a'; x.beginPath(); x.moveTo(W * 0.5 - cw / 2 - 12, cy); x.quadraticCurveTo(W * 0.5, cy - 24, W * 0.5 + cw / 2 + 12, cy); x.lineTo(W * 0.5 + cw / 2, cy - 4); x.quadraticCurveTo(W * 0.5, cy - 18, W * 0.5 - cw / 2, cy - 4); x.fill(); }
  // chao de areia
  x.fillStyle = '#5a6a5a'; x.fillRect(0, H * 0.78, W, H * 0.22);
  // tartaruga gigante
  x.fillStyle = '#3a5a4a'; x.beginPath(); x.ellipse(W * 0.3, H * 0.84, 60, 30, 0, 0, 7); x.fill(); x.fillStyle = '#2a4a3a'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(W * 0.3 - 40 + i * 20, H * 0.82, 10, 0, 7); x.fill(); } x.fillStyle = '#3a5a4a'; x.beginPath(); x.arc(W * 0.36, H * 0.8, 12, 0, 7); x.fill(); x.fillStyle = O17.preto; x.beginPath(); x.arc(W * 0.38, H * 0.79, 2, 0, 7); x.fill();
};

// ---- personagens (cx, base, s, o, t) ----

function momotaro(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // menino com kimono e faixa (nasceu de um pessego)
  x.fillStyle = O17.vermelho; x.beginPath(); x.moveTo(-26, 0); x.lineTo(26, 0); x.lineTo(18, -90); x.lineTo(-18, -90); x.fill();
  x.fillStyle = O17.branco; x.fillRect(-20, -60, 40, 10); // obi (faixa)
  x.fillStyle = O17.pele || '#e8c49a'; x.fillStyle = '#e8c49a'; x.beginPath(); x.arc(0, -108, 18, 0, 7); x.fill();
  x.fillStyle = O17.preto; x.beginPath(); x.arc(0, -116, 18, Math.PI, 0); x.fill(); // cabelo
  x.fillStyle = O17.branco; x.fillRect(-14, -124, 28, 6); // bandana
  x.fillStyle = O17.vermelho; x.beginPath(); x.arc(0, -121, 4, 0, 7); x.fill();
  x.fillStyle = O17.preto; x.beginPath(); x.arc(-6, -108, 2.5, 0, 7); x.arc(6, -108, 2.5, 0, 7); x.fill();
  // katana nas costas
  x.strokeStyle = O17.preto; x.lineWidth = 5; x.beginPath(); x.moveTo(14, -80); x.lineTo(30, -30); x.stroke();
  x.restore();
}

function oni(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // ogro grande (sem gore): corpo vermelho/azul, tanga de tigre, tacape
  x.fillStyle = o.cor === 'azul' ? '#3a6a9a' : '#c94a3a'; x.fillRect(-40, -170, 80, 130);
  x.fillStyle = '#d6b24a'; x.fillRect(-40, -56, 80, 20); for (let i = 0; i < 4; i++) { x.fillStyle = O17.preto; x.fillRect(-36 + i * 22, -56, 6, 20); } // tanga listrada de tigre
  // cabeca
  x.fillStyle = o.cor === 'azul' ? '#3a6a9a' : '#c94a3a'; x.beginPath(); x.arc(0, -192, 30, 0, 7); x.fill();
  // chifres
  x.fillStyle = O17.branco; x.beginPath(); x.moveTo(-20, -208); x.lineTo(-30, -240); x.lineTo(-10, -214); x.fill(); x.beginPath(); x.moveTo(20, -208); x.lineTo(30, -240); x.lineTo(10, -214); x.fill();
  // cabelo preto bagunçado
  x.fillStyle = O17.preto; x.beginPath(); x.arc(0, -200, 30, Math.PI, 0); x.fill();
  // rosto bravo (sem sangue): sobrancelhas, olhos amarelos, presas pequenas
  x.fillStyle = O17.ouro; x.beginPath(); x.arc(-10, -192, 5, 0, 7); x.arc(10, -192, 5, 0, 7); x.fill();
  x.strokeStyle = O17.preto; x.lineWidth = 3; x.beginPath(); x.moveTo(-18, -200); x.lineTo(-4, -196); x.moveTo(18, -200); x.lineTo(4, -196); x.stroke();
  x.fillStyle = O17.branco; x.beginPath(); x.moveTo(-8, -180); x.lineTo(-4, -174); x.lineTo(-2, -180); x.fill(); x.beginPath(); x.moveTo(8, -180); x.lineTo(4, -174); x.lineTo(2, -180); x.fill();
  // tacape (kanabo)
  x.fillStyle = O17.madeiraEsc; x.fillRect(46, -180, 16, 150); x.fillStyle = O17.preto; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(46 + (i % 2) * 16, -170 + i * 30, 4, 0, 7); x.fill(); }
  x.restore();
}

function kitsune(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // raposa branca de varias caudas
  x.fillStyle = O17.branco; x.beginPath(); x.ellipse(0, -40, 50, 26, 0, 0, 7); x.fill(); // corpo
  x.fillRect(-40, -40, 12, 42); x.fillRect(28, -40, 12, 42); // patas
  // caudas (leque)
  for (let i = 0; i < 5; i++) { const a = 0.5 + i * 0.35; x.fillStyle = i % 2 ? O17.branco : '#e8e0d4'; x.beginPath(); x.moveTo(40, -40); x.quadraticCurveTo(40 + Math.cos(a) * 80, -40 - Math.sin(a) * 80, 40 + Math.cos(a) * 70, -40 - Math.sin(a) * 90); x.quadraticCurveTo(60, -60, 40, -40); x.fill(); x.fillStyle = O17.vermelho; x.beginPath(); x.arc(40 + Math.cos(a) * 72, -40 - Math.sin(a) * 86, 5, 0, 7); x.fill(); }
  // cabeca
  x.fillStyle = O17.branco; x.beginPath(); x.moveTo(-50, -56); x.quadraticCurveTo(-78, -64, -76, -40); x.quadraticCurveTo(-70, -32, -50, -36); x.fill();
  x.beginPath(); x.moveTo(-60, -66); x.lineTo(-66, -88); x.lineTo(-50, -70); x.fill(); // orelha
  x.fillStyle = O17.ouro; x.beginPath(); x.arc(-66, -52, 3, 0, 7); x.fill();
  x.restore();
}

function tanuki(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // guaxinim-cão gordinho
  x.fillStyle = '#6a5340'; x.beginPath(); x.ellipse(0, -40, 42, 40, 0, 0, 7); x.fill(); // corpo redondo
  x.fillStyle = '#8a7358'; x.beginPath(); x.ellipse(0, -30, 26, 24, 0, 0, 7); x.fill(); // barriga clara
  x.fillStyle = '#6a5340'; x.beginPath(); x.arc(0, -78, 22, 0, 7); x.fill(); // cabeca
  // mascara escura nos olhos
  x.fillStyle = O17.preto; x.beginPath(); x.ellipse(-9, -80, 8, 6, 0.3, 0, 7); x.fill(); x.beginPath(); x.ellipse(9, -80, 8, 6, -0.3, 0, 7); x.fill();
  x.fillStyle = O17.branco; x.beginPath(); x.arc(-9, -80, 2.5, 0, 7); x.arc(9, -80, 2.5, 0, 7); x.fill();
  // orelhas
  x.fillStyle = '#6a5340'; x.beginPath(); x.arc(-16, -96, 8, 0, 7); x.arc(16, -96, 8, 0, 7); x.fill();
  // folha na cabeca (transformacao) + cauda listrada
  x.fillStyle = O17.verde; x.beginPath(); x.ellipse(0, -100, 8, 14, 0, 0, 7); x.fill();
  x.fillStyle = '#4a3a2a'; x.beginPath(); x.ellipse(40, -30, 20, 12, 0.4, 0, 7); x.fill(); x.fillStyle = O17.branco; x.fillRect(48, -36, 6, 12);
  x.restore();
}

const O17_pers = { momotaro, oni, kitsune, tanuki };
