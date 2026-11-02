// Pacote 16 (16-egito). Old Tales / Egito antigo. Cria PALS.cl_egito (areia, ouro, azul-nilo, turquesa).
// Roteiro usa "tema":"epico"/"mito" + "paleta":"egito". const O16; helpers p16_.
//   f_nilo f_piramide f_vila_operarios f_tumba f_templo_egito f_julgamento + anubis osiris ra

if (typeof PALS !== 'undefined' && !PALS.cl_egito) {
  PALS.cl_egito = { fundo1: '#c79a4a', fundo2: '#5a3a18', parede: 'rgba(255,240,200,0.07)', creme: '#f3e6c4', papel: '#f3e6c4', tinta: '#2a1a0c',
    destaque: '#e8c24a', acento: '#2a8ab0', acento2: '#3fb59a', perigo: '#9a3a2a', ok: '#3fb59a', luz: 'rgba(255,220,130,0.22)',
    fonteTit: '700 {s}px Georgia, "Times New Roman", serif', fonteTxt: 'italic 400 {s}px Georgia, "Times New Roman", serif' };
}

const O16 = { areia: '#d8b878', areiaEsc: '#b89450', pedra: '#c9a86a', pedraEsc: '#8a6e40', nilo: '#2a7a9a', niloEsc: '#164a60',
  ouro: '#e8c24a', turquesa: '#3fb59a', azul: '#2a63a0', vermelho: '#9a3a2a', preto: '#1a1208', tocha: '#f6903a', hiero: '#8a6e40', pele: '#c8955a', linho: '#f3e6c4' };

// hieroglifos decorativos (helper)
const p16_hieros = (px, py, w, h) => {
  x.fillStyle = O16.hiero; const cols = Math.floor(w / 26);
  for (let c = 0; c < cols; c++) for (let r = 0; r < Math.floor(h / 30); r++) { const gx = px + c * 26 + 6, gy = py + r * 30 + 6; const k = (c + r) % 5;
    if (k === 0) { x.beginPath(); x.arc(gx + 7, gy + 8, 7, 0, 7); x.fill(); } // olho de Hórus simplificado
    else if (k === 1) { x.fillRect(gx, gy, 14, 4); x.fillRect(gx + 5, gy, 4, 18); } // ankh-ish
    else if (k === 2) { x.beginPath(); x.moveTo(gx, gy + 16); x.lineTo(gx + 7, gy); x.lineTo(gx + 14, gy + 16); x.fill(); } // piramide
    else if (k === 3) { x.fillRect(gx, gy + 6, 16, 4); x.fillRect(gx, gy + 12, 10, 4); } // linhas
    else { x.beginPath(); x.ellipse(gx + 7, gy + 8, 7, 4, 0, 0, 7); x.fill(); } }
};

// f_nilo: rio com papiro, felucas, crocodilo, cheia. p={cheia:0..1}
COMP.f_nilo = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  // margem / areia
  x.fillStyle = O16.areia; x.fillRect(0, H * 0.5, W, H * 0.5);
  // rio (sobe com a cheia)
  const cheia = rng(p.cheia ?? 0.4, lt); const topoRio = H * (0.72 - cheia * 0.12);
  x.fillStyle = O16.nilo; x.fillRect(0, topoRio, W, H - topoRio); x.fillStyle = 'rgba(255,255,255,0.1)'; for (let i = 0; i < 4; i++) x.fillRect(0, topoRio + 20 + i * 24, W, 3);
  // papiros na margem
  for (let i = 0; i < 6; i++) { const px = W * (0.04 + i * 0.07); x.strokeStyle = '#4a7a3a'; x.lineWidth = 4; x.beginPath(); x.moveTo(px, topoRio); x.lineTo(px + Math.sin(t + i) * 6, topoRio - 70 - (i % 3) * 20); x.stroke(); x.fillStyle = '#6a9a4a'; x.beginPath(); x.arc(px + Math.sin(t + i) * 6, topoRio - 70 - (i % 3) * 20, 10, 0, 7); x.fill(); }
  // feluca (barco com vela triangular)
  x.fillStyle = O16.madeira || '#6a4a2e'; x.fillStyle = '#6a4a2e'; x.beginPath(); x.moveTo(W * 0.5, topoRio + 40); x.quadraticCurveTo(W * 0.6, topoRio + 60, W * 0.7, topoRio + 40); x.lineTo(W * 0.68, topoRio + 30); x.lineTo(W * 0.52, topoRio + 30); x.fill();
  x.fillStyle = O16.linho; x.beginPath(); x.moveTo(W * 0.6, topoRio + 30); x.lineTo(W * 0.6, topoRio - 60); x.lineTo(W * 0.68, topoRio + 28); x.fill(); x.strokeStyle = '#6a4a2e'; x.lineWidth = 3; x.beginPath(); x.moveTo(W * 0.6, topoRio + 30); x.lineTo(W * 0.6, topoRio - 64); x.stroke();
  // crocodilo (silhueta na agua)
  x.fillStyle = '#2a5a3a'; x.beginPath(); x.ellipse(W * 0.2, topoRio + 50, 70, 12, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(W * 0.12, topoRio + 48); x.lineTo(W * 0.08, topoRio + 44); x.lineTo(W * 0.14, topoRio + 52); x.fill(); x.fillStyle = O16.ouro; x.fillRect(W * 0.16, topoRio + 44, 4, 3); x.fillRect(W * 0.2, topoRio + 44, 4, 3);
};

// f_piramide: canteiro de obra, rampa, blocos, trenó com agua no chao (fato historico).
COMP.f_piramide = (t, lt, p) => {
  const T = TF(); ceuFlat('dia', t);
  x.fillStyle = O16.areia; x.fillRect(0, H * 0.58, W, H * 0.42);
  // piramide em construcao (degraus)
  x.fillStyle = O16.pedra; x.beginPath(); x.moveTo(W * 0.3, H * 0.58); x.lineTo(W * 0.62, H * 0.2); x.lineTo(W * 0.94, H * 0.58); x.fill();
  x.strokeStyle = O16.pedraEsc; x.lineWidth = 2; for (let i = 1; i < 8; i++) { const u = i / 8; x.beginPath(); x.moveTo(W * (0.3 + u * 0.16), H * (0.58 - u * 0.38)); x.lineTo(W * (0.94 - u * 0.16), H * (0.58 - u * 0.38)); x.stroke(); }
  // rampa de terra
  x.fillStyle = O16.areiaEsc; x.beginPath(); x.moveTo(W * 0.1, H * 0.76); x.lineTo(W * 0.5, H * 0.36); x.lineTo(W * 0.56, H * 0.38); x.lineTo(W * 0.2, H * 0.76); x.fill();
  // treno com bloco + agua no chao (fato: molhavam a areia)
  x.fillStyle = O16.pedraEsc; x.fillRect(W * 0.3, H * 0.66, W * 0.1, W * 0.1); x.fillStyle = '#6a4a2e'; x.fillRect(W * 0.28, H * 0.74, W * 0.14, 8);
  x.fillStyle = 'rgba(42,122,154,0.4)'; x.beginPath(); x.ellipse(W * 0.26, H * 0.77, 30, 6, 0, 0, 7); x.fill(); // agua derramada
  // trabalhadores puxando
  if (typeof figura === 'function') { figura(W * 0.2, H * 0.84, 0.6, { figurino: 'egipcio', pose: 'andando', olhar: 1 }, t); figura(W * 0.14, H * 0.86, 0.6, { figurino: 'egipcio', pose: 'andando', olhar: 1 }, t); }
  x.strokeStyle = '#6a4a2e'; x.lineWidth = 3; x.beginPath(); x.moveTo(W * 0.16, H * 0.82); x.lineTo(W * 0.3, H * 0.74); x.stroke();
};

// f_vila_operarios: Deir el-Medina, pao e cerveja como salario.
COMP.f_vila_operarios = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  x.fillStyle = O16.areia; x.fillRect(0, H * 0.6, W, H * 0.4);
  // casas de tijolo em fileira (muro comum)
  for (let i = 0; i < 5; i++) { const hx = W * (0.04 + i * 0.19); x.fillStyle = i % 2 ? '#b89450' : '#c9a86a'; x.fillRect(hx, H * 0.42, W * 0.17, H * 0.22); x.fillStyle = O16.pedraEsc; x.fillRect(hx, H * 0.4, W * 0.17, 8); x.fillStyle = O16.preto; x.fillRect(hx + W * 0.06, H * 0.5, W * 0.05, H * 0.14); }
  // mesa com pao e cerveja (salario)
  x.fillStyle = '#6a4a2e'; x.fillRect(W * 0.3, H * 0.76, W * 0.4, 12);
  for (let i = 0; i < 3; i++) { x.fillStyle = '#c9a060'; x.beginPath(); x.ellipse(W * (0.36 + i * 0.08), H * 0.74, 16, 9, 0, 0, 7); x.fill(); } // paes
  x.fillStyle = O16.pedra; x.fillRect(W * 0.6, H * 0.68, 20, 32); x.fillStyle = O16.turquesa; x.fillRect(W * 0.6, H * 0.68, 20, 8); // jarra de cerveja
  // operario
  if (typeof figura === 'function') figura(W * 0.5, H * 0.94, 0.7, { figurino: 'egipcio', pose: 'parado' }, t);
};

// f_tumba: corredor com hieroglifos, sarcofago, tocha.
COMP.f_tumba = (t, lt, p) => {
  const T = TF(); fundoFlat('#3a2a14', '#180f06');
  // paredes do corredor em perspectiva
  x.fillStyle = '#4a3618'; x.beginPath(); x.moveTo(0, 0); x.lineTo(W * 0.22, H * 0.16); x.lineTo(W * 0.22, H * 0.84); x.lineTo(0, H); x.fill();
  x.beginPath(); x.moveTo(W, 0); x.lineTo(W * 0.78, H * 0.16); x.lineTo(W * 0.78, H * 0.84); x.lineTo(W, H); x.fill();
  x.fillStyle = '#5a4420'; x.fillRect(W * 0.22, H * 0.16, W * 0.56, H * 0.68); // fundo
  // hieroglifos nas paredes
  p16_hieros(W * 0.02, H * 0.2, W * 0.18, H * 0.5); p16_hieros(W * 0.8, H * 0.2, W * 0.18, H * 0.5);
  // sarcofago dourado no centro
  x.fillStyle = O16.ouro; x.beginPath(); x.moveTo(W * 0.4, H * 0.5); x.quadraticCurveTo(W * 0.5, H * 0.44, W * 0.6, H * 0.5); x.lineTo(W * 0.58, H * 0.82); x.lineTo(W * 0.42, H * 0.82); x.fill();
  x.fillStyle = O16.azul; x.beginPath(); x.ellipse(W * 0.5, H * 0.56, 22, 28, 0, 0, 7); x.fill(); x.fillStyle = O16.ouro; x.beginPath(); x.arc(W * 0.5, H * 0.56, 12, 0, 7); x.fill(); x.fillStyle = O16.preto; x.fillRect(W * 0.49, H * 0.6, 4, 16);
  // tochas
  if (typeof fxFogo === 'function') { fxFogo(W * 0.28, H * 0.5, 0.5, t); fxFogo(W * 0.72, H * 0.5, 0.5, t); } else { glow(W * 0.28, H * 0.5, 40, 'rgba(246,144,58,0.4)'); glow(W * 0.72, H * 0.5, 40, 'rgba(246,144,58,0.4)'); }
};

// f_templo_egito: colunas papiriformes, estatuas.
COMP.f_templo_egito = (t, lt, p) => {
  const T = TF(); ceuFlat('por', t);
  x.fillStyle = O16.areia; x.fillRect(0, H * 0.72, W, H * 0.28);
  // colunas papiriformes (capitel em leque)
  for (let i = 0; i < 4; i++) { const cx = W * (0.16 + i * 0.23); x.fillStyle = O16.pedra; x.fillRect(cx - 18, H * 0.3, 36, H * 0.42); x.fillStyle = O16.pedraEsc; for (let k = 1; k < 5; k++) { x.fillRect(cx - 18, H * (0.3 + k * 0.08), 36, 3); }
    // capitel em leque de papiro
    x.fillStyle = O16.turquesa; x.beginPath(); x.moveTo(cx - 24, H * 0.3); x.quadraticCurveTo(cx, H * 0.22, cx + 24, H * 0.3); x.fill(); x.fillStyle = O16.ouro; x.fillRect(cx - 20, H * 0.3, 40, 6); }
  // dintel
  x.fillStyle = O16.pedraEsc; x.fillRect(0, H * 0.26, W, H * 0.06);
  // estatua sentada (faraó)
  x.fillStyle = O16.pedra; x.fillRect(W * 0.44, H * 0.5, W * 0.12, H * 0.22); x.beginPath(); x.arc(W * 0.5, H * 0.5, 22, 0, 7); x.fill(); x.fillStyle = O16.azul; x.beginPath(); x.arc(W * 0.5, H * 0.48, 24, Math.PI, 0); x.fill();
  // deus opcional
  if (p.deus && typeof O16_deus[p.deus] === 'function') O16_deus[p.deus](W * 0.5, H * 0.92, 0.9, {}, t);
};

// f_julgamento: pesagem do coracao (balanca, pena, Anubis, Ammit). p={pesa:0..1}
COMP.f_julgamento = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a1f3d', '#140f22', [0.5, 0.3, 500]);
  // parede de hieroglifos de fundo
  p16_hieros(0, H * 0.1, W, H * 0.2);
  // balanca
  const pesa = rng(p.pesa ?? 0.5, lt); const inc = (pesa - 0.5) * 0.4;
  x.strokeStyle = O16.ouro; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.5, H * 0.3); x.lineTo(W * 0.5, H * 0.62); x.stroke();
  x.save(); x.translate(W * 0.5, H * 0.32); x.rotate(inc); x.beginPath(); x.moveTo(-W * 0.18, 0); x.lineTo(W * 0.18, 0); x.stroke();
  // prato esquerdo (coracao) e direito (pena)
  x.fillStyle = O16.vermelho; x.beginPath(); x.arc(-W * 0.18, 60, 16, 0, 7); x.fill();
  x.fillStyle = O16.linho; x.beginPath(); x.moveTo(W * 0.18, 44); x.quadraticCurveTo(W * 0.2, 70, W * 0.18, 80); x.quadraticCurveTo(W * 0.16, 70, W * 0.18, 44); x.fill();
  x.strokeStyle = O16.ouro; x.lineWidth = 2; x.beginPath(); x.moveTo(-W * 0.18, 0); x.lineTo(-W * 0.18, 44); x.moveTo(W * 0.18, 0); x.lineTo(W * 0.18, 44); x.stroke();
  x.restore();
  // Anubis (cabeca de chacal) a esquerda
  anubis(W * 0.2, H * 0.92, 0.8, {}, t);
  // Ammit (devoradora) a direita - silhueta hibrida, sem gore
  x.fillStyle = '#4a3a2a'; x.save(); x.translate(W * 0.82, H * 0.82); x.beginPath(); x.ellipse(0, 0, 50, 24, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(40, -6); x.lineTo(64, -30); x.lineTo(70, -10); x.lineTo(50, 4); x.fill(); x.fillStyle = O16.ouro; x.beginPath(); x.arc(62, -18, 3, 0, 7); x.fill(); x.fillRect(-40, 10, 10, 20); x.fillRect(30, 10, 10, 20); x.restore();
};

// ---- deuses (cx, base, s, o, t) ----

function anubis(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O16.pele; x.fillRect(-26, -150, 52, 110); // corpo
  x.fillStyle = O16.ouro; x.fillRect(-26, -60, 52, 14); // cinto
  // cabeca de chacal (preta)
  x.fillStyle = O16.preto; x.beginPath(); x.ellipse(0, -164, 20, 24, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(0, -176); x.lineTo(20, -176); x.lineTo(6, -156); x.fill(); // focinho
  x.beginPath(); x.moveTo(-16, -182); x.lineTo(-24, -222); x.lineTo(-6, -190); x.fill(); x.beginPath(); x.moveTo(16, -182); x.lineTo(24, -222); x.lineTo(6, -190); x.fill(); // orelhas
  x.fillStyle = O16.ouro; x.beginPath(); x.arc(10, -166, 3, 0, 7); x.fill();
  // nemes listrado
  x.fillStyle = O16.azul; x.fillRect(-26, -150, 12, 50); x.fillRect(14, -150, 12, 50);
  x.restore();
}

function osiris(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // corpo verde (deus da ressurreicao), envolto como mumia
  x.fillStyle = O16.turquesa; x.fillRect(-28, -150, 56, 110); x.strokeStyle = O16.linho; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(-28, -140 + i * 20); x.lineTo(28, -140 + i * 20); x.stroke(); }
  x.fillStyle = '#5aa88a'; x.beginPath(); x.arc(0, -164, 20, 0, 7); x.fill();
  // coroa Atef (branca com plumas)
  x.fillStyle = O16.linho; x.beginPath(); x.moveTo(-14, -180); x.quadraticCurveTo(0, -230, 14, -180); x.fill(); x.fillStyle = O16.vermelho; x.fillRect(-16, -182, 32, 6);
  // cajado e mangual cruzados no peito
  x.strokeStyle = O16.ouro; x.lineWidth = 4; x.beginPath(); x.moveTo(-10, -130); x.lineTo(-18, -80); x.moveTo(10, -130); x.lineTo(18, -80); x.stroke();
  x.fillStyle = O16.ouro; x.beginPath(); x.arc(10, -166, 3, 0, 7); x.arc(-10, -166, 3, 0, 7); x.fill();
  x.restore();
}

function ra(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // barca solar
  x.fillStyle = '#6a4a2e'; x.beginPath(); x.moveTo(-90, 0); x.quadraticCurveTo(0, 36, 90, 0); x.lineTo(70, -14); x.lineTo(-70, -14); x.fill();
  x.beginPath(); x.moveTo(-90, 0); x.quadraticCurveTo(-110, -30, -96, -46); x.lineTo(-84, -36); x.lineTo(-78, -12); x.fill(); // proa curva
  // Ra em pe (cabeca de falcao + disco solar)
  x.fillStyle = O16.pele; x.fillRect(-14, -90, 28, 76);
  x.fillStyle = O16.vermelho; x.beginPath(); x.ellipse(0, -104, 16, 18, 0, 0, 7); x.fill(); x.fillStyle = O16.ouro; x.beginPath(); x.moveTo(-6, -104); x.lineTo(-18, -100); x.lineTo(-6, -96); x.fill(); // bico
  // disco solar sobre a cabeca
  glow(0, -124, 40, 'rgba(255,220,100,0.5)'); x.fillStyle = O16.ouro; x.beginPath(); x.arc(0, -124, 16, 0, 7); x.fill();
  x.restore();
}

// alias com acento usado no roteiro ("rá")
const O16_deus = { anubis, osiris, ra, 'rá': ra };
