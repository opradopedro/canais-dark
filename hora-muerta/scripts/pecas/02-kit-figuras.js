// Pacote 02 (02-kit-figuras). Personagens de corpo inteiro (figurinos de epoca) e animais. Regras: KIRO-PROMPT.md secao C.
// Mesmo traco do corpoFlat (ja existe no engine): cabeca oval cor de pele, olhos ovais escuros com brilho, corpo em gota.
// Cores: TF() + neutras (madeira, pedra, metal, PAL.pele). Nunca redefinir funcoes que ja existem.
//
//   figura(cx, base, s, o, t)  -- pessoa de corpo inteiro, o.figurino escolhe a roupa, o.pose a acao
//   multidao(x0, x1, base, s, n, o, t)  -- grupo/fila/falange de figuras
//   animais: cavalo boi porco ovelha cabra cachorro gato corvo coruja lobo cobra macaco garca peixe
//            carpa_koi cervo urso burro  -- nome(cx, base, s, o, t)

// paleta de objeto (neutras, nao dependem do canal)
const P2 = { metal: '#9aa3ad', metalEsc: '#5c6670', madeira: '#7a5230', madeiraEsc: '#4a3018', pano: '#c8b48a',
  bronze: '#b5892f', couro: '#6b4a2a', ferro: '#6b7078', ouro: '#e3b94a', branco: '#e9e4d6', vermelho: '#b23b2e',
  azul: '#355a8c', verde: '#4a6b3a', preto: '#20242b' };

// cabeca+rosto no estilo do engine. cy = centro da cabeca (coord local).
function p2_rosto(cy, pele, cab, o, t) {
  const ex = o.expressao || 'neutro', ol = (o.olhar2 || 0) * 4;
  x.fillStyle = pele; x.beginPath(); x.ellipse(0, cy, 40, 44, 0, 0, 7); x.fill();
  if (!o.semCabelo) { x.fillStyle = cab; x.beginPath(); x.ellipse(0, cy - 22, 42, 26, 0, Math.PI, 0); x.fill(); }
  const pis = (t % 3.4) > 3.28 ? 0.15 : 1;
  x.fillStyle = '#1c1220'; x.beginPath(); x.ellipse(-14 + ol, cy + 2, 4.5, 6.5 * pis, 0, 0, 7); x.ellipse(14 + ol, cy + 2, 4.5, 6.5 * pis, 0, 0, 7); x.fill();
  if (pis > 0.5) { x.fillStyle = '#fff'; x.beginPath(); x.arc(-12 + ol, cy - 1, 1.6, 0, 7); x.arc(16 + ol, cy - 1, 1.6, 0, 7); x.fill(); }
  x.fillStyle = 'rgba(220,90,80,0.28)'; x.beginPath(); x.ellipse(-20, cy + 12, 8, 5, 0, 0, 7); x.ellipse(20, cy + 12, 8, 5, 0, 0, 7); x.fill();
  x.strokeStyle = '#5a2228'; x.lineWidth = 3; x.lineCap = 'round';
  if (ex === 'sorriso') { x.beginPath(); x.arc(0, cy + 18, 10, 0.2, Math.PI - 0.2); x.stroke(); }
  else if (ex === 'medo' || ex === 'surpresa') { x.fillStyle = '#5a2228'; x.beginPath(); x.ellipse(0, cy + 20, 6, 8, 0, 0, 7); x.fill(); }
  else if (ex === 'bravo') { x.beginPath(); x.moveTo(-9, cy + 18); x.lineTo(9, cy + 18); x.stroke(); }
  else { x.beginPath(); x.moveTo(-6, cy + 18); x.lineTo(6, cy + 18); x.stroke(); }
  if (o.barba) { x.fillStyle = o.corBarba || cab; x.beginPath(); x.moveTo(-38, cy + 6); x.quadraticCurveTo(0, cy + 60, 38, cy + 6); x.quadraticCurveTo(0, cy + 28, -38, cy + 6); x.fill(); }
}

// figura: pessoa de corpo inteiro. base = pes (y). s = escala (1 = ~360px). ld = lado (olhar -1|1).
// o = {figurino, pose, olhar:-1|1, expressao, pele, cabelo, roupa, arma, escudo}
// exemplo: {"linea":0,"comp":"f_objeto"...}  ou dentro de pecas: figura(W*0.5, H*0.9, 1, {figurino:'hoplita', arma:'lanca', escudo:'esparta'}, t)
function figura(cx, base, s, o = {}, t = 0) {
  const fg = o.figurino || 'campones', pose = o.pose || 'parado', ld = o.olhar || 1;
  const pele = o.pele || PAL.pele[2], cab = o.cabelo || '#2e1d14';
  const passo = pose === 'anda' ? Math.sin(t * 6) : pose === 'corre' ? Math.sin(t * 11) : 0;
  const amp = pose === 'corre' ? 0.6 : 0.32;
  const R = {
    campones: ['#6b5a3a', '#4a3a24'], camponesa: ['#7a5a6a', '#5a3a4a'], monge: ['#6b5230', '#4a3620'],
    freira: ['#2b2b33', '#16161c'], cavaleiro: [P2.metal, P2.metalEsc], escudeiro: ['#5a6b4a', '#3a4a2e'],
    senhor: ['#5a3a6a', '#3a2446'], dama: ['#8c4a6a', '#5a2a44'], ferreiro: ['#5a4030', '#3a2818'],
    mercador: ['#8c6a2a', '#5a4418'], hoplita: ['#9a2d22', '#6b1f18'], menino_esparta: ['#b23b2e', '#7a271f'],
    legionario: ['#a8321f', '#5c6670'], viking: ['#5a6b7a', '#3a4654'], samurai: ['#355a4a', '#213a30'],
    ashigaru: ['#6b5a3a', '#4a3a24'], hanfu: ['#8c3a3a', '#5a2424'], hanfu_f: ['#c86a8c', '#8c3a5a'],
    monge_budista: ['#d98b2a', '#a8631a'], imperador_china: ['#c8a030', '#8c6a18'], soldado_china: ['#7a4a30', '#4a2a18'],
    egipcio: ['#e9e4d6', '#c8b48a'], farao: ['#e3b94a', '#b5892f'], pastor: ['#6b5a3a', '#4a3a24'],
    peregrino: ['#5a4a3a', '#3a2e24'], vaqueiro: ['#5a4030', '#3a2818'], abuela: ['#6a4a5a', '#44303a'],
    padre: ['#2b2b33', '#16161c'], policial: [P2.azul, '#223a5a'], enfermeira: ['#d8dde2', '#aab2bc'],
    motorista: ['#4a4a52', '#2e2e36'], guarda_florestal: ['#4a5a3a', '#2e3a24'], mochileiro: ['#6b6b52', '#44442e'],
  };
  const par = o.roupa ? [o.roupa, o.roupa] : (R[fg] || R.campones), roupa = par[0], roupaEsc = par[1];
  x.save(); x.translate(cx, base); x.scale(s * ld, s);
  x.fillStyle = 'rgba(0,0,0,0.22)'; x.beginPath(); x.ellipse(0, 0, 70, 12, 0, 0, 7); x.fill();
  const calca = (fg === 'hoplita' || fg === 'egipcio' || fg === 'menino_esparta') ? pele : (fg === 'legionario' ? '#8c3a2a' : '#2e2622');
  x.fillStyle = calca;
  x.save(); x.translate(-14, -118); x.rotate(passo * amp); x.beginPath(); x.roundRect(-10, 0, 20, 118, 9); x.fill(); x.restore();
  x.save(); x.translate(14, -118); x.rotate(-passo * amp); x.beginPath(); x.roundRect(-10, 0, 20, 118, 9); x.fill(); x.restore();
  const alt = (pose === 'ajoelha' || pose === 'senta') ? -150 : -250;
  x.fillStyle = roupa; x.beginPath();
  if (fg === 'dama' || fg === 'camponesa' || fg === 'freira' || fg === 'hanfu_f' || fg === 'abuela' || fg === 'enfermeira') {
    x.moveTo(-34, alt); x.lineTo(34, alt); x.lineTo(70, -60); x.lineTo(-70, -60);
  } else { x.moveTo(-36, alt); x.lineTo(36, alt); x.lineTo(44, -110); x.lineTo(-44, -110); }
  x.fill(); x.beginPath(); x.ellipse(0, alt + 2, 40, 22, 0, 0, 7); x.fill();
  p2_tronco(fg, roupa, roupaEsc, alt);
  const braX = (pose === 'aponta' || pose === 'luta') ? 36 : 30;
  x.save(); x.translate(-braX, alt + 18); x.rotate(0.2 - passo * 0.1); x.fillStyle = roupaEsc; x.beginPath(); x.roundRect(-8, 0, 16, 96, 8); x.fill(); x.fillStyle = pele; x.beginPath(); x.arc(0, 100, 10, 0, 7); x.fill(); x.restore();
  x.save(); x.translate(braX, alt + 18);
  const braAng = pose === 'aponta' ? -1.1 : pose === 'luta' ? -0.8 : pose === 'reza' ? -0.6 : pose === 'carrega' ? -0.5 : -0.15 + passo * 0.1;
  x.rotate(braAng); x.fillStyle = roupa; x.beginPath(); x.roundRect(-8, 0, 16, 96, 8); x.fill(); x.fillStyle = pele; x.beginPath(); x.arc(0, 100, 10, 0, 7); x.fill();
  if (o.arma) p2_arma(o.arma, t);
  x.restore();
  if (o.escudo) { x.save(); x.translate(-braX - 6, alt + 70); p2_escudo(o.escudo); x.restore(); }
  const cy = alt - 46;
  p2_rosto(cy, pele, cab, o, t);
  p2_cabeca(fg, cy, o);
  x.restore();
}

function p2_tronco(fg, roupa, roupaEsc, alt) {
  if (fg === 'cavaleiro' || fg === 'legionario' || fg === 'soldado_china' || fg === 'samurai') {
    x.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 3; i++) x.fillRect(-38, alt + 40 + i * 40, 76, 6);
    x.strokeStyle = roupaEsc; x.lineWidth = 4; x.beginPath(); x.moveTo(0, alt + 20); x.lineTo(0, -110); x.stroke();
  } else if (fg === 'hoplita') {
    x.fillStyle = '#c7a24a'; x.beginPath(); x.ellipse(0, alt + 60, 38, 50, 0, 0, 7); x.fill();
    x.strokeStyle = '#8c6a1a'; x.lineWidth = 3; for (let i = 0; i < 2; i++) { x.beginPath(); x.moveTo(-34, alt + 44 + i * 30); x.lineTo(34, alt + 44 + i * 30); x.stroke(); }
  } else if (fg === 'monge' || fg === 'monge_budista' || fg === 'freira' || fg === 'padre' || fg === 'peregrino') {
    x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, alt + 20); x.lineTo(0, -80); x.stroke();
    if (fg === 'padre' || fg === 'freira') { x.strokeStyle = '#e9e4d6'; x.lineWidth = 5; x.beginPath(); x.moveTo(0, alt + 30); x.lineTo(0, alt + 70); x.moveTo(-14, alt + 46); x.lineTo(14, alt + 46); x.stroke(); }
  } else if (fg === 'imperador_china' || fg === 'senhor' || fg === 'dama') {
    x.fillStyle = P2.ouro; x.beginPath(); x.ellipse(0, alt + 30, 42, 14, 0, 0, 7); x.fill();
  } else if (fg === 'egipcio' || fg === 'farao') {
    x.fillStyle = P2.ouro; x.fillRect(-42, alt + 20, 84, 10);
  } else if (fg === 'policial' || fg === 'motorista' || fg === 'guarda_florestal') {
    x.fillStyle = 'rgba(0,0,0,0.2)'; x.fillRect(-38, alt + 40, 76, 6); x.fillStyle = P2.ouro; x.beginPath(); x.arc(-22, alt + 60, 5, 0, 7); x.fill();
  }
}

function p2_arma(arma, t) {
  x.save(); x.translate(0, 100);
  if (arma === 'lanca') { x.strokeStyle = P2.madeira; x.lineWidth = 7; x.beginPath(); x.moveTo(0, -140); x.lineTo(0, 120); x.stroke(); x.fillStyle = P2.metal; x.beginPath(); x.moveTo(-8, -140); x.lineTo(8, -140); x.lineTo(0, -168); x.fill(); }
  else if (arma === 'espada') { x.fillStyle = P2.metal; x.beginPath(); x.roundRect(-5, -120, 10, 120, 4); x.fill(); x.fillStyle = P2.bronze; x.fillRect(-18, -4, 36, 8); x.fillRect(-4, 4, 8, 22); }
  else if (arma === 'arco') { x.strokeStyle = P2.madeira; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 70, -1.1, 1.1); x.stroke(); x.strokeStyle = '#d8d2c4'; x.lineWidth = 2; x.beginPath(); x.moveTo(Math.cos(-1.1) * 70, Math.sin(-1.1) * 70); x.lineTo(Math.cos(1.1) * 70, Math.sin(1.1) * 70); x.stroke(); }
  else if (arma === 'bastao') { x.strokeStyle = P2.ouro; x.lineWidth = 9; x.beginPath(); x.moveTo(0, -150); x.lineTo(0, 150); x.stroke(); x.fillStyle = '#c8372d'; x.fillRect(-7, -150, 14, 14); x.fillRect(-7, 136, 14, 14); }
  else if (arma === 'foice') { x.strokeStyle = P2.madeira; x.lineWidth = 7; x.beginPath(); x.moveTo(0, -120); x.lineTo(0, 110); x.stroke(); x.strokeStyle = P2.metal; x.lineWidth = 8; x.beginPath(); x.arc(-30, -120, 40, -0.3, 1.6); x.stroke(); }
  else if (arma === 'tocha') { x.strokeStyle = P2.madeira; x.lineWidth = 8; x.beginPath(); x.moveTo(0, -80); x.lineTo(0, 110); x.stroke(); if (typeof fxFogo === 'function') fxFogo(0, -80, 0.7, t); }
  else if (arma === 'lanterna') { x.strokeStyle = P2.metalEsc; x.lineWidth = 5; x.beginPath(); x.moveTo(0, -70); x.lineTo(0, 40); x.stroke(); const k = 0.8 + 0.2 * Math.sin(t * 9); glow(0, -90, 90 * k, 'rgba(246,178,74,' + (0.4 * k) + ')'); x.fillStyle = 'rgba(255,214,122,' + k + ')'; x.beginPath(); x.roundRect(-14, -118, 28, 44, 6); x.fill(); }
  x.restore();
}

function p2_escudo(tipo) {
  if (tipo === 'esparta' || tipo === 'redondo') { x.fillStyle = tipo === 'esparta' ? '#b5892f' : P2.madeira; x.beginPath(); x.arc(0, 0, 50, 0, 7); x.fill(); x.strokeStyle = '#6b4a10'; x.lineWidth = 4; x.stroke(); if (tipo === 'esparta') { x.fillStyle = '#4a3410'; x.font = '700 44px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('\u039B', 0, 2); } }
  else if (tipo === 'romano') { x.fillStyle = '#a8321f'; x.beginPath(); x.roundRect(-38, -52, 76, 104, 12); x.fill(); x.fillStyle = P2.ouro; x.beginPath(); x.arc(0, 0, 10, 0, 7); x.fill(); x.fillStyle = 'rgba(255,220,120,0.5)'; for (const yy of [-30, 30]) x.fillRect(-34, yy, 68, 5); }
  else if (tipo === 'viking') { x.fillStyle = P2.madeira; x.beginPath(); x.arc(0, 0, 48, 0, 7); x.fill(); x.fillStyle = P2.metal; x.beginPath(); x.arc(0, 0, 10, 0, 7); x.fill(); x.strokeStyle = P2.metalEsc; x.lineWidth = 4; for (let i = 0; i < 6; i++) { const a = i / 6 * 7; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); x.stroke(); } }
}

function p2_cabeca(fg, cy, o) {
  const top = cy - 40;
  if (fg === 'hoplita') { x.fillStyle = '#c7a24a'; x.beginPath(); x.ellipse(0, cy - 4, 42, 48, 0, Math.PI, 0); x.fill(); x.fillRect(-42, cy - 4, 84, 20); x.fillStyle = '#8c1f18'; x.beginPath(); x.moveTo(-10, top - 8); x.quadraticCurveTo(0, top - 50, 30, top - 20); x.quadraticCurveTo(10, top, -10, top - 8); x.fill(); }
  else if (fg === 'cavaleiro') { x.fillStyle = P2.metal; x.beginPath(); x.ellipse(0, cy - 6, 44, 44, 0, Math.PI, 0); x.fill(); x.fillRect(-44, cy - 6, 88, 10); x.fillStyle = P2.metalEsc; x.fillRect(-44, cy + 6, 88, 6); x.fillRect(-4, cy + 12, 8, 30); } // elmo com visor aberto (rosto aparece)
  else if (fg === 'legionario') { x.fillStyle = P2.metal; x.beginPath(); x.ellipse(0, cy - 6, 44, 40, 0, Math.PI, 0); x.fill(); x.fillRect(-44, cy - 6, 14, 30); x.fillRect(30, cy - 6, 14, 30); x.fillStyle = '#a8321f'; x.fillRect(-10, top - 14, 20, 14); }
  else if (fg === 'viking') { x.fillStyle = P2.metal; x.beginPath(); x.ellipse(0, cy - 4, 40, 36, 0, Math.PI, 0); x.fill(); x.fillStyle = P2.branco; for (const sx of [-1, 1]) { x.beginPath(); x.moveTo(sx * 30, cy - 30); x.quadraticCurveTo(sx * 60, cy - 70, sx * 44, cy - 84); x.quadraticCurveTo(sx * 40, cy - 60, sx * 24, cy - 34); x.fill(); } }
  else if (fg === 'samurai') { x.fillStyle = P2.preto; x.beginPath(); x.ellipse(0, cy - 6, 44, 38, 0, Math.PI, 0); x.fill(); x.fillStyle = P2.ouro; x.beginPath(); x.moveTo(-26, top - 4); x.quadraticCurveTo(0, top - 40, 26, top - 4); x.lineTo(16, top + 2); x.quadraticCurveTo(0, top - 22, -16, top + 2); x.fill(); }
  else if (fg === 'monge' || fg === 'peregrino') { x.fillStyle = o.corCapuz || '#4a3620'; x.beginPath(); x.ellipse(0, cy - 10, 48, 44, 0, Math.PI * 0.9, Math.PI * 2.1); x.fill(); }
  else if (fg === 'monge_budista') { x.fillStyle = o.pele || PAL.pele[2]; x.beginPath(); x.ellipse(0, cy - 18, 38, 14, 0, Math.PI, 0); x.fill(); }
  else if (fg === 'freira') { x.fillStyle = '#16161c'; x.beginPath(); x.ellipse(0, cy - 8, 50, 46, 0, Math.PI * 0.85, Math.PI * 2.15); x.fill(); x.fillStyle = '#e9e4d6'; x.beginPath(); x.ellipse(0, cy, 38, 40, 0, Math.PI * 1.1, Math.PI * 1.9); x.fill(); }
  else if (fg === 'farao') { x.fillStyle = '#2a63a0'; x.beginPath(); x.moveTo(-46, cy - 18); x.lineTo(46, cy - 18); x.lineTo(54, cy + 44); x.lineTo(40, cy + 44); x.lineTo(40, cy - 4); x.lineTo(-40, cy - 4); x.lineTo(-40, cy + 44); x.lineTo(-54, cy + 44); x.fill(); x.fillStyle = P2.ouro; x.fillRect(-48, cy - 22, 96, 10); x.fillStyle = '#c8372d'; x.beginPath(); x.arc(0, cy - 28, 7, 0, 7); x.fill(); } // nemes emoldura o rosto
  else if (fg === 'egipcio') { x.fillStyle = P2.preto; x.beginPath(); x.ellipse(0, cy - 18, 46, 24, 0, Math.PI, 0); x.fill(); x.fillRect(-46, cy - 18, 14, 50); x.fillRect(32, cy - 18, 14, 50); }
  else if (fg === 'imperador_china') { x.fillStyle = '#1a1a22'; x.fillRect(-36, top - 16, 72, 16); x.fillStyle = P2.ouro; for (let i = -2; i <= 2; i++) { x.beginPath(); x.arc(i * 16, top - 16, 3, 0, 7); x.fill(); } }
  else if (fg === 'hanfu' || fg === 'hanfu_f' || fg === 'soldado_china') { x.fillStyle = fg === 'soldado_china' ? P2.metal : '#1a1a22'; x.beginPath(); x.arc(0, cy - 34, 16, 0, 7); x.fill(); x.fillRect(-16, cy - 44, 32, 14); }
  else if (fg === 'vaqueiro' || fg === 'mercador' || fg === 'pastor') { x.fillStyle = fg === 'vaqueiro' ? '#6b4a2a' : P2.madeira; x.beginPath(); x.ellipse(0, cy - 36, 58, 14, 0, 0, 7); x.fill(); x.beginPath(); x.roundRect(-30, cy - 62, 60, 30, [20, 20, 4, 4]); x.fill(); }
  else if (fg === 'abuela') { x.fillStyle = '#8c6a7a'; x.beginPath(); x.ellipse(0, cy - 6, 48, 42, 0, Math.PI, 0); x.fill(); }
  else if (fg === 'policial' || fg === 'motorista') { x.fillStyle = fg === 'policial' ? P2.azul : '#3a3a42'; x.beginPath(); x.ellipse(0, cy - 34, 42, 12, 0, 0, 7); x.fill(); x.beginPath(); x.roundRect(-26, cy - 54, 52, 24, [16, 16, 2, 2]); x.fill(); x.fillStyle = P2.preto; x.fillRect(-26, cy - 40, 52, 8); }
  else if (fg === 'enfermeira') { x.fillStyle = '#e9e4d6'; x.beginPath(); x.ellipse(0, cy - 32, 34, 12, 0, Math.PI, 0); x.fill(); x.fillStyle = '#b23b2e'; x.fillRect(-5, cy - 44, 10, 10); x.fillRect(-9, cy - 40, 18, 4); }
  else if (fg === 'guarda_florestal' || fg === 'mochileiro') { x.fillStyle = fg === 'guarda_florestal' ? '#4a5a3a' : '#6b6b52'; x.beginPath(); x.ellipse(0, cy - 34, 48, 12, 0, 0, 7); x.fill(); x.beginPath(); x.roundRect(-26, cy - 52, 52, 22, [14, 14, 2, 2]); x.fill(); }
}

// multidao: grupo/fila/falange de figuras pequenas. formacao: 'fila'|'falange'|'grupo'
function multidao(x0, x1, base, s, n, o = {}, t = 0) {
  const form = o.formacao || 'grupo';
  for (let i = 0; i < n; i++) {
    const fr = n > 1 ? i / (n - 1) : 0.5, px = W * (x0 + (x1 - x0) * fr);
    const jit = form === 'grupo' ? (rnd(i) - 0.5) * 50 : 0, sy = base + (form === 'grupo' ? (rnd(i * 2) - 0.5) * 30 : 0);
    const sc = s * (form === 'grupo' ? 0.8 + rnd(i * 3) * 0.3 : 0.92 + (i % 2) * 0.08);
    figura(px + jit, sy, sc, { ...o, olhar: o.olhar || 1, pose: form === 'falange' ? 'parado' : (o.pose || 'parado'), pele: PAL.pele[1 + (i % 4)] }, t + i * 0.3);
  }
}

// ---------------- ANIMAIS ----------------
function p2_quad(cx, base, s, o, t, corpoW, corpoH, cor, cuello, cabW) {
  const ld = o.olhar || 1, passo = o.anda ? Math.sin(t * (o.anda * 6)) : 0;
  x.save(); x.translate(cx, base); x.scale(s * ld, s);
  x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, corpoW * 0.9, 10, 0, 0, 7); x.fill();
  x.fillStyle = cor;
  // 2 pernas tras (esq do corpo) e 2 frente (dir do corpo), bem separadas
  for (const par of [[-corpoW * 0.7, passo], [-corpoW * 0.45, -passo], [corpoW * 0.5, -passo], [corpoW * 0.75, passo]]) {
    x.save(); x.translate(par[0], -corpoH * 0.42); x.rotate(par[1] * 0.4); x.fillRect(-7, 0, 14, corpoH * 0.42); x.restore();
  }
  x.beginPath(); x.ellipse(0, -corpoH * 0.75, corpoW, corpoH * 0.42, 0, 0, 7); x.fill();
  x.save(); x.translate(corpoW * 0.8, -corpoH * 0.9); x.rotate(-0.3); x.fillRect(-cabW * 0.4, 0, cabW * 0.8, cuello); x.restore();
  x.beginPath(); x.ellipse(corpoW * 0.95, -corpoH * 0.9 - cuello * 0.8, cabW, cabW * 0.8, 0, 0, 7); x.fill();
  x.fillStyle = '#1c1220'; x.beginPath(); x.arc(corpoW * 1.1, -corpoH * 0.9 - cuello * 0.8 - 2, 3.2, 0, 7); x.fill();
  x.restore();
}
function cavalo(cx, base, s, o = {}, t = 0) { const c = o.cor || '#6b4a2a'; p2_quad(cx, base, s, o, t, 95, 150, c, 60, 30); const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = '#2e1d14'; x.beginPath(); x.ellipse(-86, -108, 12, 46, -0.25, 0, 7); x.fill(); x.save(); x.translate(64, -148); x.rotate(-0.3); x.fillRect(-6, 0, 12, 56); x.restore(); x.restore(); }
function boi(cx, base, s, o = {}, t = 0) { p2_quad(cx, base, s, o, t, 100, 140, o.cor || '#8a7258', 40, 34); const ld = o.olhar || 1; x.save(); x.fillStyle = '#d8cfbf'; x.beginPath(); x.arc(cx + 100 * s * ld, base - 158 * s, 8 * s, 0, 7); x.arc(cx + 118 * s * ld, base - 158 * s, 8 * s, 0, 7); x.fill(); x.restore(); }
function burro(cx, base, s, o = {}, t = 0) { p2_quad(cx, base, s, o, t, 80, 130, o.cor || '#9a938a', 46, 26); const ld = o.olhar || 1; x.save(); x.fillStyle = o.cor || '#9a938a'; for (const d of [-8, 8]) { x.save(); x.translate(cx + 95 * s * ld, base - 150 * s); x.rotate(d * 0.04); x.fillRect(d * s, -34 * s, 10 * s, 34 * s); x.restore(); } x.restore(); }
function porco(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, 70, 8, 0, 0, 7); x.fill(); x.fillStyle = o.cor || '#d98f9a'; for (const lx of [-40, -10, 25, 55]) x.fillRect(lx, -40, 12, 40); x.beginPath(); x.ellipse(0, -70, 80, 44, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(74, -78, 28, 26, 0, 0, 7); x.fill(); x.fillStyle = '#b86a76'; x.beginPath(); x.ellipse(96, -76, 10, 12, 0, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(84, -88, 3, 0, 7); x.fill(); x.restore(); }
function ovelha(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, 60, 8, 0, 0, 7); x.fill(); x.fillStyle = '#2e2622'; for (const lx of [-34, -6, 20, 44]) x.fillRect(lx, -36, 9, 36); x.fillStyle = o.cor || '#eae6dc'; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(-44 + i * 16, -66, 20, 0, 7); x.fill(); } x.beginPath(); x.ellipse(0, -66, 60, 36, 0, 0, 7); x.fill(); x.fillStyle = '#4a4038'; x.beginPath(); x.ellipse(60, -74, 20, 18, 0, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(66, -78, 3, 0, 7); x.fill(); x.restore(); }
function cabra(cx, base, s, o = {}, t = 0) { p2_quad(cx, base, s, o, t, 62, 110, o.cor || '#c9bfa8', 34, 24); const ld = o.olhar || 1; x.save(); x.fillStyle = '#5a4a3a'; for (const d of [0, 10]) { x.beginPath(); x.moveTo(cx + (70 + d) * s * ld, base - 130 * s); x.lineTo(cx + (66 + d) * s * ld, base - 158 * s); x.lineTo(cx + (74 + d) * s * ld, base - 156 * s); x.fill(); } x.restore(); }
function cachorro(cx, base, s, o = {}, t = 0) { p2_quad(cx, base, s, o, t, 58, 86, o.cor || '#8a6a46', 26, 22); const ld = o.olhar || 1; x.save(); x.fillStyle = o.cor || '#6a4a2a'; x.beginPath(); x.ellipse(cx + 54 * s * ld, base - 96 * s, 10 * s, 20 * s, -0.3, 0, 7); x.fill(); const wag = Math.sin(t * 8) * 0.4; x.save(); x.translate(cx - 56 * s * ld, base - 80 * s); x.rotate(wag); x.fillRect(0, -6 * s, 30 * s * ld, 8 * s); x.restore(); x.restore(); }
function gato(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, 44, 7, 0, 0, 7); x.fill(); x.fillStyle = o.cor || '#4a4a52'; x.beginPath(); x.ellipse(0, -36, 46, 28, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(40, -62, 22, 22, 0, 0, 7); x.fill(); for (const d of [-1, 1]) { x.beginPath(); x.moveTo(40 + d * 12, -80); x.lineTo(40 + d * 20, -98); x.lineTo(40 + d * 2, -86); x.fill(); } const tail = Math.sin(t * 3) * 0.5; x.save(); x.translate(-42, -40); x.rotate(-1 + tail); x.fillRect(0, -6, 50, 10); x.restore(); x.fillStyle = '#b9e34f'; x.beginPath(); x.arc(48, -64, 3.5, 0, 7); x.arc(34, -64, 3.5, 0, 7); x.fill(); x.restore(); }
function lobo(cx, base, s, o = {}, t = 0) { p2_quad(cx, base, s, o, t, 70, 96, o.cor || '#5c6066', 28, 24); const ld = o.olhar || 1; x.save(); x.fillStyle = o.cor || '#4a4e54'; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(cx + (64 + d * 6) * s * ld, base - 118 * s); x.lineTo(cx + (60 + d * 8) * s * ld, base - 142 * s); x.lineTo(cx + (72 + d * 6) * s * ld, base - 120 * s); x.fill(); } x.fillStyle = '#ffd24a'; x.beginPath(); x.arc(cx + 78 * s * ld, base - 112 * s, 3, 0, 7); x.fill(); x.restore(); }
function cervo(cx, base, s, o = {}, t = 0) { p2_quad(cx, base, s, o, t, 70, 140, o.cor || '#a07044', 56, 24); const ld = o.olhar || 1; x.save(); x.strokeStyle = '#6b4a2a'; x.lineWidth = 5 * s; x.lineCap = 'round'; for (const d of [-1, 1]) { const bx = cx + (90 + d * 8) * s * ld, by = base - 168 * s; x.beginPath(); x.moveTo(bx, by + 20 * s); x.lineTo(bx + d * 20 * s, by - 30 * s); x.moveTo(bx + d * 8 * s, by - 6 * s); x.lineTo(bx + d * 30 * s, by - 16 * s); x.stroke(); } x.restore(); }
function urso(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = 'rgba(0,0,0,0.22)'; x.beginPath(); x.ellipse(0, 0, 90, 10, 0, 0, 7); x.fill(); x.fillStyle = o.cor || '#4a3626'; for (const lx of [-54, 44]) x.fillRect(lx, -60, 22, 60); x.beginPath(); x.ellipse(0, -100, 96, 66, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(70, -150, 44, 42, 0, 0, 7); x.fill(); for (const dx of [54, 86]) { x.beginPath(); x.arc(dx, -186, 14, 0, 7); x.fill(); } x.fillStyle = '#d8b088'; x.beginPath(); x.ellipse(94, -144, 14, 12, 0, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(80, -158, 4, 0, 7); x.arc(100, -148, 4, 0, 7); x.fill(); x.restore(); }
function macaco(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1, sw = Math.sin(t * 2) * 6; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, 40, 7, 0, 0, 7); x.fill(); const cor = o.cor || '#7a5a3a'; const tail = Math.sin(t * 2); x.strokeStyle = cor; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(-30, -40); x.quadraticCurveTo(-80, -70 + tail * 20, -56, -120); x.stroke(); x.fillStyle = cor; x.beginPath(); x.ellipse(0, -60, 34, 42, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(sw, -118, 30, 32, 0, 0, 7); x.fill(); for (const dx of [-28, 28]) { x.beginPath(); x.arc(sw + dx, -124, 12, 0, 7); x.fill(); } x.fillStyle = '#e8cfa8'; x.beginPath(); x.ellipse(sw, -112, 20, 24, 0, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(sw - 8, -120, 3.5, 0, 7); x.arc(sw + 8, -120, 3.5, 0, 7); x.fill(); x.restore(); }
function corvo(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1, flap = o.anda ? 0 : Math.sin(t * 6) * 0.3; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = o.cor || '#1a1a22'; x.beginPath(); x.ellipse(0, -30, 40, 24, 0.2, 0, 7); x.fill(); x.beginPath(); x.ellipse(32, -54, 18, 16, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(48, -54); x.lineTo(70, -50); x.lineTo(48, -46); x.fill(); x.save(); x.translate(-6, -40); x.rotate(flap); x.beginPath(); x.ellipse(-20, 0, 34, 12, -0.3, 0, 7); x.fill(); x.restore(); x.fillStyle = '#ffd24a'; x.beginPath(); x.arc(36, -58, 3, 0, 7); x.fill(); x.restore(); }
function coruja(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.fillStyle = o.cor || '#7a6a52'; x.beginPath(); x.ellipse(0, -40, 42, 52, 0, 0, 7); x.fill(); for (const d of [-1, 1]) { x.beginPath(); x.moveTo(d * 26, -84); x.lineTo(d * 40, -108); x.lineTo(d * 10, -92); x.fill(); } x.fillStyle = '#efe4cc'; x.beginPath(); x.arc(-16, -52, 16, 0, 7); x.arc(16, -52, 16, 0, 7); x.fill(); const pis = (t % 3) > 2.85 ? 0.1 : 1; x.fillStyle = '#f0a43a'; x.beginPath(); x.arc(-16, -52, 9 * pis + 0.1, 0, 7); x.arc(16, -52, 9 * pis + 0.1, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(-16, -52, 4.5 * pis + 0.1, 0, 7); x.arc(16, -52, 4.5 * pis + 0.1, 0, 7); x.fill(); x.fillStyle = '#d98f2a'; x.beginPath(); x.moveTo(-6, -44); x.lineTo(6, -44); x.lineTo(0, -32); x.fill(); x.restore(); }
function garca(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.strokeStyle = '#c8a24a'; x.lineWidth = 5; for (const d of [-6, 6]) { x.beginPath(); x.moveTo(d, 0); x.lineTo(d, -90); x.stroke(); } x.fillStyle = o.cor || '#e9e6de'; x.beginPath(); x.ellipse(0, -118, 42, 26, 0, 0, 7); x.fill(); x.save(); x.translate(26, -140); x.rotate(-0.5); x.fillRect(-7, -40, 14, 44); x.restore(); x.beginPath(); x.arc(40, -176, 16, 0, 7); x.fill(); x.fillStyle = '#f0a43a'; x.beginPath(); x.moveTo(52, -176); x.lineTo(80, -172); x.lineTo(52, -170); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(46, -180, 3, 0, 7); x.fill(); x.restore(); }
function peixe(cx, cy, s, o = {}, t = 0) { const ld = o.olhar || 1, wig = Math.sin(t * 5) * 0.2; x.save(); x.translate(cx, cy); x.scale(s * ld, s); x.rotate(wig); x.fillStyle = o.cor || '#6aa0c0'; x.beginPath(); x.ellipse(0, 0, 44, 22, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(-40, 0); x.lineTo(-68, -18); x.lineTo(-68, 18); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(28, -4, 5, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(30, -4, 2.5, 0, 7); x.fill(); x.restore(); }
function carpa_koi(cx, cy, s, o = {}, t = 0) { const ld = o.olhar || 1, wig = Math.sin(t * 4) * 0.25; x.save(); x.translate(cx, cy); x.scale(s * ld, s); x.rotate(wig); x.fillStyle = '#f0ede6'; x.beginPath(); x.ellipse(0, 0, 50, 26, 0, 0, 7); x.fill(); x.fillStyle = o.cor || '#e2662c'; x.beginPath(); x.ellipse(14, -6, 20, 12, 0, 0, 7); x.ellipse(-16, 6, 14, 9, 0, 0, 7); x.fill(); x.fillStyle = '#1a1a22'; x.beginPath(); x.ellipse(-4, -8, 8, 6, 0, 0, 7); x.fill(); x.fillStyle = '#f0ede6'; x.beginPath(); x.moveTo(-46, 0); x.quadraticCurveTo(-78, -24, -74, 0); x.quadraticCurveTo(-78, 24, -46, 0); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(34, -6, 5, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(36, -6, 2.5, 0, 7); x.fill(); x.restore(); }
function cobra(cx, base, s, o = {}, t = 0) { const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s); x.strokeStyle = o.cor || '#4a6b3a'; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(-70, -10); for (let xx = -70; xx <= 60; xx += 10) x.lineTo(xx, -10 + Math.sin(xx * 0.08 + t * 3) * 14); x.stroke(); const hx = 60, hy = -10 + Math.sin(60 * 0.08 + t * 3) * 14; x.fillStyle = o.cor || '#4a6b3a'; x.beginPath(); x.ellipse(hx, hy, 18, 12, 0, 0, 7); x.fill(); x.fillStyle = '#ffd24a'; x.beginPath(); x.arc(hx + 6, hy - 3, 3, 0, 7); x.fill(); x.strokeStyle = '#b23b2e'; x.lineWidth = 2; x.beginPath(); x.moveTo(hx + 16, hy); x.lineTo(hx + 28, hy - 4); x.lineTo(hx + 20, hy); x.lineTo(hx + 28, hy + 4); x.stroke(); x.restore(); }

// mapa nome->funcao de animal (usado por f_figura e por outros pacotes)
const ANIM2 = { cavalo, boi, burro, porco, ovelha, cabra, cachorro, gato, lobo, cervo, urso, macaco, corvo, coruja, garca, peixe, carpa_koi, cobra };

// COMP.f_figura: mostra UMA figura (figurino) ou UM animal em pe no fundo do canal, com chao.
// Serve de vitrine e de plano simples "um personagem no cenario vazio".
// p = {figurino (figura) OU animal (nome), arma, escudo, pose, olhar:-1|1, expressao, cor, chao:true, x:0..1, s}
// exemplo: {"linea":0,"comp":"f_figura","p":{"figurino":"hoplita","arma":"lanca","escudo":"esparta"}}
// exemplo: {"linea":1,"comp":"f_figura","p":{"animal":"cavalo","anda":1}}
COMP.f_figura = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2, [0.5, 0.35, 560]);
  // chao
  if (p.chao !== false) { x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.moveTo(0, H * 0.78); x.quadraticCurveTo(W / 2, H * 0.75, W, H * 0.78); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }
  const px = (p.x ?? 0.5) * W, base = H * 0.86, s = p.s ?? 1.25;
  if (p.animal && ANIM2[p.animal]) ANIM2[p.animal](px, base, s, p, t);
  else figura(px, base, s, { figurino: p.figurino || 'campones', arma: p.arma, escudo: p.escudo, pose: p.pose, olhar: p.olhar, expressao: p.expressao, cor: p.cor, pele: p.pele, cabelo: p.cabelo, roupa: p.roupa, corCapuz: p.corCapuz, barba: p.barba }, t);
};

