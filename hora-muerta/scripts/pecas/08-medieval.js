// Pacote 08 (08-medieval). Old Tales medieval, paleta padrao (verde-pergaminho). Regras: KIRO-PROMPT.md secao C.
// Use com "tema":"calmo" (Old Tales medieval). Cores TF() + neutras. Usa ceuFlat, figura, multidao, obj_*, fx* dos pacotes 01-03.
//   f_moinho f_mercado f_castelo f_salao f_campo f_mosteiro f_forja f_igreja f_estrada_antiga f_taverna f_cerco f_porto f_floresta_medieval f_torneio

const M8 = { pedra: '#9a8a74', pedraEsc: '#6a5a48', madeira: '#7a5230', madeiraEsc: '#4a3018', palha: '#c8a85a',
  telha: '#8a4a3a', verde: '#5c7d3a', trigo: '#d9b45a', agua: '#3a6a7a', vitral: '#c8372d', ocre: '#e3b75f', ceu: '#6a8ca8' };

function p8_casa(cx, base, w, h, cor) { x.fillStyle = cor || M8.pedra; x.fillRect(cx - w / 2, base - h, w, h); x.fillStyle = M8.telha; x.beginPath(); x.moveTo(cx - w / 2 - 10, base - h); x.lineTo(cx + w / 2 + 10, base - h); x.lineTo(cx, base - h - 40); x.fill(); x.fillStyle = M8.madeiraEsc; x.fillRect(cx - 12, base - 40, 24, 40); }

// f_moinho: moinho d'agua com roda girando. p = {corte:true (pedras de moer), moleiro:true}
COMP.f_moinho = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat(M8.ceu, '#3c5238');
  x.fillStyle = M8.verde; x.fillRect(0, H * 0.6, W, H * 0.4);
  // casa do moinho
  p8_casa(W * 0.4, H * 0.66, 220, 200, M8.pedra);
  // calha de agua
  x.fillStyle = M8.madeira; x.fillRect(W * 0.1, H * 0.4, W * 0.3, 16);
  x.fillStyle = M8.agua; for (let i = 0; i < 6; i++) x.fillRect(W * 0.1 + (t * 200 + i * 60) % (W * 0.3), H * 0.4, 20, 10);
  // roda d'agua girando
  const wx = W * 0.6, wy = H * 0.58, r = 90; x.save(); x.translate(wx, wy); x.rotate(t * 1.2); x.strokeStyle = M8.madeiraEsc; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, r, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) { x.save(); x.rotate(i / 8 * 7); x.fillStyle = M8.madeira; x.fillRect(-10, -r, 20, 24); x.restore(); x.strokeStyle = M8.madeira; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(i / 8 * 7) * r, Math.sin(i / 8 * 7) * r); x.stroke(); } x.restore();
  // agua caindo na roda
  if (typeof fxOndas === 'function') fxOndas(0.7, t, M8.agua, '#1a3a4a');
  // sacos de grao
  if (typeof obj_saco_grao === 'function') { obj_saco_grao(W * 0.2, H * 0.86, 0.8, {}, t); obj_saco_grao(W * 0.3, H * 0.88, 0.7, {}, t); }
  if (p.moleiro && typeof figura === 'function') figura(W * 0.78, H * 0.9, 0.8, { figurino: 'campones', pose: 'carrega', olhar: -1 }, t);
};

// f_mercado: feira. p = {pelourinho:true, pedagio:true}
COMP.f_mercado = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat(M8.ceu, '#3c5238');
  x.fillStyle = '#b8a070'; x.fillRect(0, H * 0.58, W, H * 0.42);
  // barracas listradas com placas
  const sinais = ['\u{1F97E}', '', '']; // evita emoji: desenha icone simples
  for (let i = 0; i < 4; i++) { const bx = W * (0.16 + i * 0.22), by = H * 0.56; x.fillStyle = M8.madeira; x.fillRect(bx - 50, by - 60, 100, 60); for (let s = 0; s < 5; s++) { x.fillStyle = s % 2 ? M8.vitral : '#e8dcc0'; x.fillRect(bx - 50 + s * 20, by - 80, 20, 20); } x.fillStyle = M8.madeiraEsc; x.fillRect(bx - 50, by, 10, 60); x.fillRect(bx + 40, by, 10, 60);
    // placa com desenho simples
    x.fillStyle = '#e8dcc0'; x.beginPath(); x.arc(bx, by - 100, 16, 0, 7); x.fill(); x.fillStyle = M8.madeiraEsc; if (i === 0) x.fillRect(bx - 8, by - 108, 16, 10); else if (i === 1) { x.beginPath(); x.arc(bx, by - 100, 8, 0, 7); x.fill(); } else { x.fillRect(bx - 2, by - 112, 4, 20); } }
  // porco solto
  if (typeof porco === 'function') porco(W * 0.5, H * 0.9, 0.7, { olhar: 1 }, t);
  if (p.pelourinho) { x.fillStyle = M8.madeira; x.fillRect(W * 0.85, H * 0.5, 16, H * 0.3); x.fillRect(W * 0.8, H * 0.52, 90, 16); }
  if (p.pedagio) { x.fillStyle = M8.madeiraEsc; x.fillRect(0, H * 0.4, 20, H * 0.2); x.fillRect(0, H * 0.4, W * 0.14, 16); }
  if (typeof multidao === 'function') multidao(0.2, 0.7, H * 0.9, 0.6, 4, { figurino: 'campones', formacao: 'grupo' }, t);
};

// f_castelo: castelo de fora, muralha, torre, ponte levadica. p = {ponte:0..1, bandeiras:true}
COMP.f_castelo = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('tarde', t); else fundoFlat(M8.ceu, '#3c5238');
  x.fillStyle = M8.verde; x.fillRect(0, H * 0.66, W, H * 0.34);
  // fosso
  x.fillStyle = M8.agua; x.fillRect(0, H * 0.78, W, H * 0.1);
  // muralha + ameias
  x.fillStyle = M8.pedra; x.fillRect(W * 0.2, H * 0.4, W * 0.6, H * 0.4); for (let i = 0; i < 10; i++) x.fillRect(W * 0.2 + i * (W * 0.6 / 10), H * 0.36, W * 0.6 / 20, 20);
  // torres
  for (const px of [0.2, 0.8]) { x.fillStyle = M8.pedraEsc; x.fillRect(W * px - 34, H * 0.3, 68, H * 0.5); x.fillStyle = M8.telha; x.beginPath(); x.moveTo(W * px - 40, H * 0.3); x.lineTo(W * px + 40, H * 0.3); x.lineTo(W * px, H * 0.22); x.fill(); if (p.bandeiras !== false) { const w = Math.sin(t * 2) * 6; x.fillStyle = M8.vitral; x.beginPath(); x.moveTo(W * px, H * 0.22); x.lineTo(W * px + 40 + w, H * 0.24); x.lineTo(W * px, H * 0.28); x.fill(); } }
  // portao + ponte levadica
  x.fillStyle = M8.madeiraEsc; x.fillRect(W * 0.46, H * 0.56, W * 0.08, H * 0.24);
  const pt = rng(p.ponte ?? 0.5, lt); x.save(); x.translate(W * 0.46, H * 0.8); x.rotate((1 - pt) * -1.4); x.fillStyle = M8.madeira; x.fillRect(0, -10, W * 0.08, 10 + H * 0.1 * pt); x.restore();
};

// f_salao: salao do castelo. p = {senhor:true}
COMP.f_salao = (t, lt, p) => {
  fundoFlat('#3a3026', '#201810');
  // lareira enorme com fogo
  x.fillStyle = M8.pedra; x.fillRect(W * 0.38, H * 0.3, W * 0.24, H * 0.4); x.fillStyle = '#1a1208'; x.fillRect(W * 0.42, H * 0.42, W * 0.16, H * 0.24);
  if (typeof fxFogo === 'function') fxFogo(W * 0.5, H * 0.64, 1.6, t);
  // tapecarias
  for (const px of [0.15, 0.85]) { x.fillStyle = M8.vitral; x.fillRect(W * px - 40, H * 0.26, 80, H * 0.3); x.fillStyle = M8.ocre; x.fillRect(W * px - 30, H * 0.3, 60, 10); }
  // mesa alta + senhor e servos
  x.fillStyle = M8.madeira; x.fillRect(W * 0.2, H * 0.78, W * 0.6, 24);
  if (typeof figura === 'function') { figura(W * 0.3, H * 0.96, 0.7, { figurino: 'senhor', pose: 'senta' }, t); figura(W * 0.7, H * 0.96, 0.6, { figurino: 'campones', pose: 'carrega', olhar: -1 }, t); }
};

// f_campo: colheita. p = {estacao}
COMP.f_campo = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.estacao === 'inverno' ? 'noite' : 'tarde', t); else fundoFlat(M8.ocre, '#3c5238');
  // trigo balancando
  x.fillStyle = M8.trigo; x.fillRect(0, H * 0.6, W, H * 0.4);
  x.strokeStyle = '#b89a3a'; x.lineWidth = 3; for (let i = 0; i < 40; i++) { const sx = i / 40 * W + 10, sway = Math.sin(t * 1.5 + i) * 8; x.beginPath(); x.moveTo(sx, H * 0.62); x.lineTo(sx + sway, H * 0.5); x.stroke(); x.fillStyle = M8.ocre; x.beginPath(); x.ellipse(sx + sway, H * 0.49, 5, 10, 0, 0, 7); x.fill(); }
  // feixes + carroca
  if (typeof obj_carroca === 'function') obj_carroca(W * 0.8, H * 0.82, 1.0, {}, t);
  // camponeses com foice
  if (typeof figura === 'function') { x.save(); x.translate(W * 0.3, H * 0.84); x.rotate(0.2); figura(0, 0, 0.6, { figurino: 'campones', arma: 'foice', pose: 'carrega' }, t); x.restore(); }
  if (p.estacao === 'outono' && typeof fxFolhas === 'function') fxFolhas(t, 0.5);
};

// f_mosteiro: scriptorium. p = {livro:true (close da pagina)}
COMP.f_mosteiro = (t, lt, p) => {
  fundoFlat('#3a3426', '#201a10');
  // janela alta com luz
  x.fillStyle = '#c9d7e0'; x.beginPath(); x.moveTo(W * 0.6, H * 0.5); x.lineTo(W * 0.6, H * 0.18); x.quadraticCurveTo(W * 0.7, H * 0.08, W * 0.8, H * 0.18); x.lineTo(W * 0.8, H * 0.5); x.fill();
  if (typeof fxRaiosLuz === 'function') fxRaiosLuz(W * 0.7, H * 0.2, t, 0.8);
  // monges copiando
  x.fillStyle = M8.madeira; x.fillRect(W * 0.2, H * 0.68, W * 0.5, 20);
  if (typeof figura === 'function') { figura(W * 0.3, H * 0.86, 0.7, { figurino: 'monge', pose: 'senta' }, t); figura(W * 0.5, H * 0.86, 0.7, { figurino: 'monge', pose: 'senta' }, t); }
  // tinteiros
  x.fillStyle = '#1a1208'; for (const px of [0.26, 0.46]) { x.beginPath(); x.arc(W * px, H * 0.67, 8, 0, 7); x.fill(); }
  if (p.livro && typeof obj_livro === 'function') obj_livro(W * 0.82, H * 0.74, 0.9, {}, t);
};

// f_forja: forja flat. p = {}
COMP.f_forja = (t, lt, p) => {
  fundoFlat('#2e2620', '#161008');
  // fornalha com fole
  x.fillStyle = M8.pedra; x.fillRect(W * 0.1, H * 0.45, W * 0.3, H * 0.35); glow(W * 0.22, H * 0.56, 120, 'rgba(246,120,40,0.4)'); x.fillStyle = '#e8671f'; x.beginPath(); x.arc(W * 0.22, H * 0.58, 40, 0, 7); x.fill();
  // bigorna com faiscas
  x.fillStyle = M8.madeira; x.fillRect(W * 0.52, H * 0.7, 40, 60); x.fillStyle = '#5c6670'; x.beginPath(); x.moveTo(W * 0.5, H * 0.66); x.lineTo(W * 0.62, H * 0.66); x.lineTo(W * 0.6, H * 0.72); x.lineTo(W * 0.52, H * 0.72); x.fill();
  if (typeof fxFagulhas === 'function') fxFagulhas(W * 0.56, H * 0.66, t, 0.8);
  // ferreiro
  if (typeof figura === 'function') figura(W * 0.76, H * 0.9, 0.8, { figurino: 'ferreiro', pose: 'luta', arma: 'espada', olhar: -1 }, t);
  // ferradura na agua com vapor
  x.fillStyle = M8.agua; x.beginPath(); x.ellipse(W * 0.4, H * 0.86, 40, 14, 0, 0, 7); x.fill(); if (typeof fxFumaca === 'function') fxFumaca(W * 0.4, H * 0.84, t, 0.3);
};

// f_igreja: igreja de pedra por dentro. p = {missa:true}
COMP.f_igreja = (t, lt, p) => {
  fundoFlat('#2e2a3a', '#16121e');
  // vitral com raios
  x.fillStyle = '#c9d7e0'; x.beginPath(); x.arc(W * 0.5, H * 0.26, 90, Math.PI, 0); x.fill(); x.fillStyle = M8.vitral; for (let i = 0; i < 4; i++) { x.fillStyle = [M8.vitral, M8.ocre, M8.verde, M8.agua][i]; x.beginPath(); x.moveTo(W * 0.5, H * 0.26); x.arc(W * 0.5, H * 0.26, 90, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4); x.fill(); }
  if (typeof fxRaiosLuz === 'function') fxRaiosLuz(W * 0.5, H * 0.3, t, 0.7);
  // colunas / nave
  for (const px of [0.16, 0.84]) p7_coluna_m(W * px, H * 0.8, 300, 26);
  // velas
  if (typeof velaFlat === 'function') { velaFlat(W * 0.4, H * 0.76, 1.2, 1, t); velaFlat(W * 0.6, H * 0.76, 1.2, 1, t); }
  // padre
  if (typeof figura === 'function') figura(W * 0.5, H * 0.92, 0.7, { figurino: 'padre', pose: 'reza' }, t);
};
function p7_coluna_m(cx, base, h, w) { x.fillStyle = M8.pedra; x.fillRect(cx - w / 2, base - h, w, h); x.fillStyle = M8.pedraEsc; for (let i = 0; i < 3; i++) x.fillRect(cx - w / 2 + 4 + i * (w / 3), base - h, 2, h); }

// f_estrada_antiga: estrada de terra com peregrinos, cruz de pedra, hospedaria. p = {chuva:true}
COMP.f_estrada_antiga = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.chuva ? 'tempestade' : 'tarde', t); else fundoFlat(M8.ceu, '#3c5238');
  // morros
  x.fillStyle = M8.verde; x.beginPath(); x.moveTo(0, H * 0.5); x.quadraticCurveTo(W * 0.5, H * 0.4, W, H * 0.5); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // estrada
  x.fillStyle = '#9a8460'; x.beginPath(); x.moveTo(W * 0.4, H * 0.5); x.lineTo(W * 0.6, H * 0.5); x.lineTo(W * 0.9, H); x.lineTo(W * 0.1, H); x.fill();
  // cruz de pedra
  if (typeof obj_cruz === 'function') obj_cruz(W * 0.78, H * 0.58, 1.0, { cor: M8.pedra }, t);
  // hospedaria
  p8_casa(W * 0.2, H * 0.56, 120, 90, M8.pedra);
  // peregrinos
  if (typeof figura === 'function') { figura(W * 0.45, H * 0.88, 0.7, { figurino: 'peregrino', pose: 'anda', arma: 'bastao', olhar: 1 }, t); figura(W * 0.56, H * 0.9, 0.6, { figurino: 'peregrino', pose: 'anda', olhar: 1 }, t); }
  if (p.chuva && typeof fxChuva === 'function') fxChuva(t, 0.8);
};

// f_taverna: taverna. p = {}
COMP.f_taverna = (t, lt, p) => {
  fundoFlat('#3a2e22', '#201810');
  // barris
  if (typeof obj_jarra === 'function') { x.fillStyle = M8.madeira; for (const px of [0.12, 0.88]) { x.beginPath(); x.ellipse(W * px, H * 0.8, 44, 60, 0, 0, 7); x.fill(); x.strokeStyle = M8.madeiraEsc; x.lineWidth = 4; x.beginPath(); x.ellipse(W * px, H * 0.8, 44, 60, 0, 0, 7); x.stroke(); } }
  // fogo
  if (typeof fxFogo === 'function') fxFogo(W * 0.5, H * 0.54, 1.2, t);
  glow(W * 0.5, H * 0.5, 200, 'rgba(246,178,74,0.2)');
  // mesas + gente rindo
  x.fillStyle = M8.madeira; x.fillRect(W * 0.25, H * 0.74, W * 0.5, 16);
  if (typeof figura === 'function') { figura(W * 0.35, H * 0.9, 0.7, { figurino: 'campones', pose: 'senta', expressao: 'sorriso' }, t); figura(W * 0.6, H * 0.9, 0.7, { figurino: 'mercador', pose: 'senta', expressao: 'sorriso', olhar: -1 }, t); }
  // cantor com alaude
  if (typeof figura === 'function') figura(W * 0.5, H * 0.66, 0.6, { figurino: 'campones', pose: 'parado' }, t);
};

// f_cerco: muralha sob cerco, trabuco. p = {tiro:0..1}
COMP.f_cerco = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('tarde', t); else fundoFlat(M8.ceu, '#3c5238');
  x.fillStyle = M8.verde; x.fillRect(0, H * 0.7, W, H * 0.3);
  // muralha a direita com arqueiros nas ameias
  x.fillStyle = M8.pedra; x.fillRect(W * 0.7, H * 0.3, W * 0.3, H * 0.5); for (let i = 0; i < 5; i++) x.fillRect(W * 0.7 + i * (W * 0.3 / 5), H * 0.26, W * 0.3 / 10, 20);
  if (typeof figura === 'function') figura(W * 0.82, H * 0.34, 0.5, { figurino: 'cavaleiro', arma: 'arco', olhar: -1 }, t);
  // trabuco a esquerda
  if (typeof obj_trabuco === 'function') obj_trabuco(W * 0.25, H * 0.74, 1.6, {}, t);
  // escadas
  x.strokeStyle = M8.madeira; x.lineWidth = 6; x.save(); x.translate(W * 0.64, H * 0.78); x.rotate(-0.5); for (let i = 0; i < 8; i++) x.strokeRect(0, -i * 20, 40, 4); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -160); x.moveTo(40, 0); x.lineTo(40, -160); x.stroke(); x.restore();
  // pedra voando
  const tiro = rng(p.tiro ?? 0.5, lt); x.fillStyle = M8.pedra; x.beginPath(); x.arc(W * (0.3 + tiro * 0.4), H * (0.3 - Math.sin(tiro * Math.PI) * 0.2), 16, 0, 7); x.fill();
};

// f_porto: porto medieval, coca (navio 1 mastro), guindaste de roda. p = {}
COMP.f_porto = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat(M8.ceu, '#3c5238');
  // cais
  x.fillStyle = '#8a7a5a'; x.fillRect(0, H * 0.6, W, H * 0.12);
  // mar
  if (typeof fxOndas === 'function') fxOndas(0.72, t, M8.agua, '#1a3a4a'); else { x.fillStyle = M8.agua; x.fillRect(0, H * 0.72, W, H * 0.28); }
  // coca (navio de um mastro)
  x.save(); x.translate(W * 0.6, H * 0.74 + Math.sin(t * 1.3) * 5); x.fillStyle = M8.madeira; x.beginPath(); x.moveTo(-90, 0); x.quadraticCurveTo(0, 40, 90, 0); x.lineTo(70, -20); x.lineTo(-70, -20); x.fill(); x.strokeStyle = M8.madeiraEsc; x.lineWidth = 6; x.beginPath(); x.moveTo(0, -20); x.lineTo(0, -120); x.stroke(); x.fillStyle = '#e8dcc0'; x.fillRect(-50, -118, 100, 70); x.fillStyle = M8.vitral; x.fillRect(-10, -118, 20, 70); x.restore();
  // guindaste de roda
  x.fillStyle = M8.madeira; x.fillRect(W * 0.2, H * 0.4, 16, H * 0.2); x.fillRect(W * 0.2, H * 0.4, 100, 14); x.save(); x.translate(W * 0.2, H * 0.4); x.rotate(t * 0.5); x.strokeStyle = M8.madeiraEsc; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 30, 0, 7); for (let i = 0; i < 6; i++) { x.moveTo(0, 0); x.lineTo(Math.cos(i / 6 * 7) * 30, Math.sin(i / 6 * 7) * 30); } x.stroke(); x.restore();
  // barris + gaivotas
  if (typeof corvo === 'function') { corvo(W * 0.4, H * 0.2, 0.4, { cor: '#e8e4da' }, t); corvo(W * 0.8, H * 0.26, 0.3, { cor: '#e8e4da' }, t + 1); }
};

// f_floresta_medieval: floresta do senhor, veado, cacador. p = {neve:true}
COMP.f_floresta_medieval = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.neve ? 'noite' : 'dia', t); else fundoFlat('#3c5238', '#1b2519');
  // arvores em camadas
  for (let k = 0; k < 3; k++) { x.fillStyle = ['#2e4a28', '#24401e', '#1a3014'][k]; for (let i = 0; i < 6; i++) { const tx = (i * 1.7 + k * 0.5) % 6 / 6 * W + 40; x.fillStyle = M8.madeiraEsc; x.fillRect(tx - 8, H * (0.4 + k * 0.1), 16, 200); x.fillStyle = ['#2e4a28', '#24401e', '#1a3014'][k]; x.beginPath(); x.moveTo(tx - 50, H * (0.45 + k * 0.1)); x.lineTo(tx + 50, H * (0.45 + k * 0.1)); x.lineTo(tx, H * (0.25 + k * 0.1)); x.fill(); } }
  x.fillStyle = '#2a3a1e'; x.fillRect(0, H * 0.78, W, H * 0.22);
  // veado
  if (typeof cervo === 'function') cervo(W * 0.3, H * 0.86, 0.9, { olhar: 1 }, t);
  // cacador
  if (typeof figura === 'function') figura(W * 0.72, H * 0.9, 0.8, { figurino: 'cavaleiro', arma: 'arco', olhar: -1 }, t);
  if (p.neve && typeof fxNeve === 'function') fxNeve(t, 0.5);
};

// f_torneio: justa, dois cavaleiros galopando, arquibancada. p = {choque:0..1}
COMP.f_torneio = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat(M8.ceu, '#3c5238');
  x.fillStyle = M8.verde; x.fillRect(0, H * 0.6, W, H * 0.4);
  // arquibancada com bandeiras
  x.fillStyle = M8.madeira; x.fillRect(0, H * 0.42, W, H * 0.16); for (let i = 0; i < 8; i++) { const w = Math.sin(t * 2 + i) * 5; x.fillStyle = [M8.vitral, M8.ocre, M8.verde][i % 3]; x.beginPath(); x.moveTo(W * (0.08 + i * 0.12), H * 0.42); x.lineTo(W * (0.08 + i * 0.12) + 30 + w, H * 0.44); x.lineTo(W * (0.08 + i * 0.12), H * 0.47); x.fill(); x.fillStyle = M8.madeiraEsc; x.fillRect(W * (0.08 + i * 0.12) - 2, H * 0.42, 4, 30); }
  // barreira central
  x.fillStyle = '#e8dcc0'; x.fillRect(W * 0.2, H * 0.74, W * 0.6, 16);
  // dois cavaleiros galopando um pro outro
  const ch = rng(p.choque ?? 0, lt);
  if (typeof cavalo === 'function' && typeof figura === 'function') {
    cavalo(W * (0.2 + ch * 0.2), H * 0.82, 0.9, { cor: '#6b4a2a', olhar: 1, anda: 1 }, t); figura(W * (0.2 + ch * 0.2), H * 0.7, 0.6, { figurino: 'cavaleiro', arma: 'lanca', olhar: 1 }, t);
    cavalo(W * (0.8 - ch * 0.2), H * 0.82, 0.9, { cor: '#3a2a1a', olhar: -1, anda: 1 }, t); figura(W * (0.8 - ch * 0.2), H * 0.7, 0.6, { figurino: 'cavaleiro', arma: 'lanca', olhar: -1 }, t);
  }
  if (typeof fxPoeira === 'function') fxPoeira(t, 0.5, 0.86);
};
