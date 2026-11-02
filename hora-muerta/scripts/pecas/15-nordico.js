// Pacote 15 (15-nordico). Old Tales / mundo nordico-viking. Cria PALS.cl_nordico (copiado de cl_grecia, cores frias:
// azul-cinza de fiorde, gelo, prata e sangue). Roteiro usa "tema":"epico"/"mito" + "paleta":"nordico". const O15; helpers p15_.
//   f_fiorde f_salao_viking f_aldeia_viking f_ataque f_yggdrasil f_bifrost f_mar_norte + thor odin loki

if (typeof PALS !== 'undefined' && !PALS.cl_nordico) {
  PALS.cl_nordico = { fundo1: '#2e4a5a', fundo2: '#0e1a24', parede: 'rgba(220,235,245,0.06)', creme: '#e4edf0', papel: '#e4edf0', tinta: '#16222a',
    destaque: '#9fc6d8', acento: '#c0a24a', acento2: '#8c2f2f', perigo: '#8c2f2f', ok: '#6a9a7a', luz: 'rgba(200,225,240,0.18)',
    fonteTit: '700 {s}px Georgia, "Times New Roman", serif', fonteTxt: 'italic 400 {s}px Georgia, "Times New Roman", serif' };
}

const O15 = { agua: '#2a4a5a', aguaEsc: '#16303c', rocha: '#5a6670', rochaEsc: '#343c44', neve: '#dce8ec', neveEsc: '#a8bcc4',
  madeira: '#5a4330', madeiraEsc: '#352616', turfa: '#4a5a3a', ferro: '#8a929a', ferroEsc: '#4a525a', ouro: '#c0a24a',
  sangue: '#8c2f2f', pele: '#e0b894', fogo: '#f6903a', sombra: '#16222a', arcoiris: ['#8c2f2f', '#c0a24a', '#6a9a7a', '#9fc6d8', '#6a5a9a'] };

// drakkar (barco viking) helper
const p15_drakkar = (cx, cy, s, t) => {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  x.fillStyle = O15.madeiraEsc; x.beginPath(); x.moveTo(-90, 0); x.quadraticCurveTo(0, 30, 90, 0); x.lineTo(70, -18); x.lineTo(-70, -18); x.fill();
  // proa com cabeca de dragao
  x.beginPath(); x.moveTo(-90, 0); x.quadraticCurveTo(-120, -20, -108, -50); x.quadraticCurveTo(-96, -40, -94, -18); x.fill();
  // vela
  x.fillStyle = O15.creme; x.fillRect(-30, -90, 60, 70); x.strokeStyle = O15.sangue; x.lineWidth = 4; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-30, -80 + i * 22); x.lineTo(30, -80 + i * 22); x.stroke(); }
  x.strokeStyle = O15.madeira; x.lineWidth = 5; x.beginPath(); x.moveTo(0, -90); x.lineTo(0, -18); x.stroke();
  // escudos na borda
  for (let i = 0; i < 5; i++) { x.fillStyle = i % 2 ? O15.sangue : O15.ouro; x.beginPath(); x.arc(-60 + i * 30, -8, 9, 0, 7); x.fill(); }
  x.restore();
};

// f_fiorde: montanhas, agua, drakkar chegando.
COMP.f_fiorde = (t, lt, p) => {
  const T = TF(); fundoFlat('#5a7a8a', '#1a2a34', [0.5, 0.15, 500]);
  // montanhas com neve
  for (let i = 0; i < 3; i++) { const mx = W * (0.1 + i * 0.34); x.fillStyle = i % 2 ? O15.rochaEsc : O15.rocha; x.beginPath(); x.moveTo(mx - W * 0.2, H * 0.55); x.lineTo(mx, H * 0.14 + i * 20); x.lineTo(mx + W * 0.2, H * 0.55); x.fill(); x.fillStyle = O15.neve; x.beginPath(); x.moveTo(mx - 30, H * 0.26 + i * 20); x.lineTo(mx, H * 0.14 + i * 20); x.lineTo(mx + 30, H * 0.26 + i * 20); x.fill(); }
  // agua do fiorde
  x.fillStyle = O15.agua; x.fillRect(0, H * 0.55, W, H * 0.45); x.fillStyle = 'rgba(220,235,245,0.1)'; for (let i = 0; i < 5; i++) x.fillRect(0, H * (0.6 + i * 0.07), W, 3);
  // drakkar chegando
  p15_drakkar(W * 0.5, H * 0.72, 1, t);
};

// f_salao_viking: casa longa, fogo central, escudos na parede, banquete.
COMP.f_salao_viking = (t, lt, p) => {
  const T = TF(); fundoFlat('#3a2e20', '#1a1208');
  // teto em A (vigas)
  x.fillStyle = O15.madeiraEsc; x.beginPath(); x.moveTo(0, H * 0.3); x.lineTo(W * 0.5, 0); x.lineTo(W, H * 0.3); x.lineTo(W, H * 0.34); x.lineTo(0, H * 0.34); x.fill();
  x.strokeStyle = O15.madeira; x.lineWidth = 5; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(W * (i / 6), H * 0.34); x.lineTo(W * 0.5, H * 0.04); x.stroke(); }
  // chao
  x.fillStyle = '#3a2e1e'; x.fillRect(0, H * 0.78, W, H * 0.22);
  // escudos na parede
  for (let i = 0; i < 5; i++) { x.fillStyle = i % 2 ? O15.sangue : O15.ferro; x.beginPath(); x.arc(W * (0.12 + i * 0.19), H * 0.44, 28, 0, 7); x.fill(); x.fillStyle = O15.ouro; x.beginPath(); x.arc(W * (0.12 + i * 0.19), H * 0.44, 8, 0, 7); x.fill(); }
  // fogo central
  if (typeof fxFogo === 'function') fxFogo(W * 0.5, H * 0.82, 1.4, t); else { glow(W * 0.5, H * 0.78, 80, 'rgba(246,144,58,0.5)'); }
  // mesa de banquete
  x.fillStyle = O15.madeira; x.fillRect(W * 0.15, H * 0.66, W * 0.3, 14); x.fillRect(W * 0.55, H * 0.66, W * 0.3, 14);
  for (let i = 0; i < 3; i++) { x.fillStyle = O15.ouro; x.beginPath(); x.arc(W * (0.2 + i * 0.08), H * 0.64, 6, 0, 7); x.fill(); x.beginPath(); x.arc(W * (0.6 + i * 0.08), H * 0.64, 6, 0, 7); x.fill(); }
  if (typeof figura === 'function') { figura(W * 0.3, H * 0.9, 0.7, { figurino: 'viking', pose: 'senta' }, t); figura(W * 0.7, H * 0.9, 0.7, { figurino: 'viking', pose: 'senta', olhar: -1 }, t); }
  // deus opcional no centro (thor/odin/loki)
  if (p.deus && typeof O15_deus[p.deus] === 'function') O15_deus[p.deus](W * 0.5, H * 0.92, 0.9, { raio: true }, t);
};

// f_aldeia_viking: casas de turfa, ovelhas, neve.
COMP.f_aldeia_viking = (t, lt, p) => {
  const T = TF(); ceuFlat('boreal', t);
  // neve
  x.fillStyle = O15.neve; x.beginPath(); x.moveTo(0, H * 0.62); x.quadraticCurveTo(W * 0.5, H * 0.58, W, H * 0.62); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // casas de turfa (telhado de grama)
  for (let i = 0; i < 3; i++) { const hx = W * (0.1 + i * 0.3); x.fillStyle = O15.madeiraEsc; x.fillRect(hx, H * 0.5, W * 0.18, H * 0.14); x.fillStyle = O15.turfa; x.beginPath(); x.moveTo(hx - 10, H * 0.5); x.lineTo(hx + W * 0.09, H * 0.4); x.lineTo(hx + W * 0.18 + 10, H * 0.5); x.fill(); x.fillStyle = O15.neveEsc; x.fillRect(hx - 10, H * 0.49, W * 0.2, 5); x.fillStyle = O15.fogo; glow(hx + W * 0.09, H * 0.57, 16, 'rgba(246,144,58,0.3)'); x.fillRect(hx + W * 0.07, H * 0.54, W * 0.04, H * 0.06); }
  // ovelhas
  for (let i = 0; i < 3; i++) { const sx = W * (0.3 + i * 0.18); x.fillStyle = O15.creme; x.beginPath(); x.ellipse(sx, H * 0.82, 22, 14, 0, 0, 7); x.fill(); x.fillStyle = O15.sombra; x.beginPath(); x.arc(sx - 20, H * 0.8, 7, 0, 7); x.fill(); x.fillRect(sx - 8, H * 0.92, 4, 8); x.fillRect(sx + 8, H * 0.92, 4, 8); }
};

// f_ataque: praia com drakkars, mosteiro ao fundo (Lindisfarne 793).
COMP.f_ataque = (t, lt, p) => {
  const T = TF(); fundoFlat('#6a5a4a', '#2a2018', [0.6, 0.2, 500]);
  if (typeof fxFumaca === 'function') fxFumaca(W * 0.75, H * 0.3, t, 0.6);
  // mosteiro em chamas ao fundo
  x.fillStyle = O15.rochaEsc; x.fillRect(W * 0.6, H * 0.28, W * 0.3, H * 0.24); x.fillStyle = O15.rocha; x.fillRect(W * 0.7, H * 0.18, W * 0.1, H * 0.1); x.beginPath(); x.moveTo(W * 0.7, H * 0.18); x.lineTo(W * 0.75, H * 0.12); x.lineTo(W * 0.8, H * 0.18); x.fill();
  glow(W * 0.72, H * 0.34, 70, 'rgba(246,144,58,0.4)');
  // mar e praia
  x.fillStyle = O15.agua; x.fillRect(0, H * 0.5, W, H * 0.2); x.fillStyle = '#6a5a44'; x.fillRect(0, H * 0.7, W, H * 0.3);
  // drakkars na praia
  p15_drakkar(W * 0.2, H * 0.64, 0.8, t); p15_drakkar(W * 0.42, H * 0.6, 0.6, t);
  // viking avancando
  if (typeof figura === 'function') figura(W * 0.5, H * 0.92, 0.8, { figurino: 'viking', arma: 'espada', pose: 'andando' }, t);
};

// f_yggdrasil: arvore do mundo com 9 mundos (mito).
COMP.f_yggdrasil = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a2a3a', '#05101c', [0.5, 0.4, 600]);
  if (typeof estrelasFlat === 'function') { } // ceu ja escuro
  // tronco gigante
  x.fillStyle = O15.madeiraEsc; x.fillRect(W * 0.46, H * 0.4, W * 0.08, H * 0.6);
  // raizes
  x.strokeStyle = O15.madeiraEsc; x.lineWidth = 10; for (let i = -1; i <= 1; i += 2) { x.beginPath(); x.moveTo(W * 0.5, H); x.quadraticCurveTo(W * (0.5 + i * 0.2), H * 0.92, W * (0.5 + i * 0.35), H * 0.98); x.stroke(); }
  // copa
  x.fillStyle = '#2a4a3a'; x.beginPath(); x.arc(W * 0.5, H * 0.34, W * 0.34, 0, 7); x.fill(); x.fillStyle = '#1e3a2e'; x.beginPath(); x.arc(W * 0.5, H * 0.34, W * 0.26, 0, 7); x.fill();
  // galhos
  x.strokeStyle = O15.madeira; x.lineWidth = 6; for (let i = 0; i < 5; i++) { const a = -2.2 + i * 0.5; x.beginPath(); x.moveTo(W * 0.5, H * 0.42); x.lineTo(W * 0.5 + Math.cos(a) * W * 0.22, H * 0.42 + Math.sin(a) * H * 0.18); x.stroke(); }
  // 9 mundos (orbes de luz)
  for (let i = 0; i < 9; i++) { const a = i / 9 * 7; const rr = i < 3 ? 0.1 : (i < 6 ? 0.2 : 0.3); const ox = W * 0.5 + Math.cos(a + t * 0.1) * W * rr; const oy = H * 0.34 + Math.sin(a + t * 0.1) * H * (rr * 0.8); x.fillStyle = O15.arcoiris[i % 5]; glow(ox, oy, 24, 'rgba(200,225,240,0.3)'); x.beginPath(); x.arc(ox, oy, 8, 0, 7); x.fill(); }
};

// f_bifrost: ponte arco-iris.
COMP.f_bifrost = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a2a4a', '#05101c', [0.5, 0.3, 600]);
  if (typeof luaFlat === 'function') { } // sem lua dupla
  // ponte arco-iris em perspectiva
  for (let k = 0; k < O15.arcoiris.length; k++) { x.fillStyle = O15.arcoiris[k]; x.globalAlpha = 0.8; x.beginPath(); x.moveTo(W * (0.42 + k * 0.016), H); x.lineTo(W * (0.46 + k * 0.01), H * 0.3); x.lineTo(W * (0.47 + k * 0.01), H * 0.3); x.lineTo(W * (0.46 + k * 0.016), H); x.fill(); x.globalAlpha = 1; }
  // largura da ponte na base
  x.save(); x.globalAlpha = 0.5; for (let k = 0; k < O15.arcoiris.length; k++) { x.fillStyle = O15.arcoiris[k]; x.beginPath(); x.moveTo(W * (0.2 + k * 0.04), H); x.lineTo(W * (0.45 + k * 0.004), H * 0.3); x.lineTo(W * (0.46 + k * 0.004), H * 0.3); x.lineTo(W * (0.24 + k * 0.04), H); x.fill(); } x.restore();
  // Asgard no topo (portao dourado)
  glow(W * 0.5, H * 0.24, 80, 'rgba(192,162,74,0.4)'); x.fillStyle = O15.ouro; x.fillRect(W * 0.44, H * 0.16, W * 0.12, H * 0.14); x.fillStyle = O15.madeiraEsc; x.beginPath(); x.moveTo(W * 0.44, H * 0.16); x.arc(W * 0.5, H * 0.16, W * 0.06, Math.PI, 0); x.fill();
};

// f_mar_norte: tempestade, serpente Jörmungandr. p={serpente}
COMP.f_mar_norte = (t, lt, p) => {
  const T = TF(); fundoFlat('#3a4a54', '#0c1620', [0.5, 0.1, 400]);
  if (typeof fxRelampago === 'function') fxRelampago(t, 2.2);
  if (typeof fxChuva === 'function') fxChuva(t, 0.6);
  // ondas altas
  x.fillStyle = O15.agua; x.beginPath(); x.moveTo(0, H * 0.5); for (let xx = 0; xx <= W; xx += 24) x.lineTo(xx, H * 0.5 + Math.sin(xx * 0.02 + t * 2) * 36); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  x.fillStyle = O15.aguaEsc; x.beginPath(); x.moveTo(0, H * 0.64); for (let xx = 0; xx <= W; xx += 24) x.lineTo(xx, H * 0.64 + Math.sin(xx * 0.025 + t * 2.4 + 1) * 28); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // drakkar jogado nas ondas
  p15_drakkar(W * 0.3, H * 0.56, 0.7, t);
  // serpente Jörmungandr (corpo em arcos saindo da agua)
  if (p.serpente) { x.strokeStyle = '#2a5a4a'; x.lineWidth = 22; x.beginPath(); let up = true; for (let xx = W * 0.4; xx <= W; xx += 60) { const yy = H * (up ? 0.44 : 0.6); if (xx === W * 0.4) x.moveTo(xx, H * 0.6); x.quadraticCurveTo(xx + 30, yy, xx + 60, H * 0.6); up = !up; } x.stroke();
    // cabeca
    x.fillStyle = '#2a5a4a'; x.beginPath(); x.moveTo(W * 0.42, H * 0.44); x.lineTo(W * 0.36, H * 0.34); x.lineTo(W * 0.3, H * 0.44); x.quadraticCurveTo(W * 0.36, H * 0.5, W * 0.42, H * 0.44); x.fill(); x.fillStyle = O15.perigo || '#8c2f2f'; x.beginPath(); x.arc(W * 0.35, H * 0.4, 5, 0, 7); x.fill(); }
};

// ---- personagens miticos (cx, base, s, o, t) ----

function thor(cx, base, s, o = {}, t = 0) {
  const sc = s;
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  // corpo
  x.fillStyle = '#6a2f2f'; x.fillRect(-32, -140, 64, 100); x.fillStyle = O15.ferro; x.fillRect(-32, -140, 64, 24); // peitoral
  x.fillStyle = O15.pele; x.beginPath(); x.arc(0, -164, 24, 0, 7); x.fill();
  // barba ruiva
  x.fillStyle = '#9a5a2a'; x.beginPath(); x.moveTo(-18, -160); x.quadraticCurveTo(0, -120, 18, -160); x.lineTo(14, -164); x.lineTo(-14, -164); x.fill();
  // elmo
  x.fillStyle = O15.ferro; x.beginPath(); x.arc(0, -174, 24, Math.PI, 0); x.fill(); x.fillStyle = O15.creme; x.beginPath(); x.moveTo(-24, -174); x.lineTo(-40, -196); x.lineTo(-18, -182); x.fill(); x.beginPath(); x.moveTo(24, -174); x.lineTo(40, -196); x.lineTo(18, -182); x.fill();
  // martelo Mjolnir no braco direito (com raio)
  x.fillStyle = O15.ferroEsc; x.fillRect(44, -130, 8, 60); x.fillStyle = O15.ferro; x.fillRect(30, -150, 36, 30);
  if (o.raio) { x.strokeStyle = O15.destaque || '#9fc6d8'; x.lineWidth = 4; x.beginPath(); x.moveTo(48, -150); x.lineTo(40, -180); x.lineTo(54, -170); x.lineTo(44, -210); x.stroke(); glow(48, -150, 30, 'rgba(159,198,216,0.4)'); }
  x.restore();
}

function odin(cx, base, s, o = {}, t = 0) {
  const sc = s;
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  // manto longo
  x.fillStyle = '#3a4654'; x.beginPath(); x.moveTo(-40, 0); x.lineTo(40, 0); x.lineTo(24, -150); x.lineTo(-24, -150); x.fill();
  x.fillStyle = O15.pele; x.beginPath(); x.arc(0, -168, 22, 0, 7); x.fill();
  // barba branca longa
  x.fillStyle = O15.creme; x.beginPath(); x.moveTo(-16, -164); x.quadraticCurveTo(0, -90, 16, -164); x.lineTo(12, -168); x.lineTo(-12, -168); x.fill();
  // um olho (tapa-olho) + um olho brilhando
  x.fillStyle = O15.sombra; x.fillRect(-14, -176, 12, 8); x.fillStyle = O15.ouro; x.beginPath(); x.arc(8, -172, 3, 0, 7); x.fill();
  // chapeu de aba larga
  x.fillStyle = '#2a3642'; x.beginPath(); x.ellipse(0, -186, 40, 10, 0, 0, 7); x.fill(); x.fillRect(-16, -210, 32, 24);
  // lanca Gungnir
  x.strokeStyle = O15.madeira; x.lineWidth = 5; x.beginPath(); x.moveTo(44, -10); x.lineTo(44, -200); x.stroke(); x.fillStyle = O15.ferro; x.beginPath(); x.moveTo(44, -200); x.lineTo(38, -220); x.lineTo(50, -220); x.fill();
  // dois corvos (Huginn e Muninn)
  x.fillStyle = O15.sombra; for (const dx of [-50, 56]) { x.beginPath(); x.ellipse(dx, -200, 12, 7, 0, 0, 7); x.fill(); x.beginPath(); x.arc(dx + (dx < 0 ? -8 : 8), -204, 5, 0, 7); x.fill(); }
  x.restore();
}

function loki(cx, base, s, o = {}, t = 0) {
  const sc = s;
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#2a6a4a'; x.beginPath(); x.moveTo(-30, 0); x.lineTo(30, 0); x.lineTo(20, -150); x.lineTo(-20, -150); x.fill();
  x.fillStyle = O15.sangue; x.fillRect(-20, -150, 40, 12); // detalhe
  x.fillStyle = O15.pele; x.beginPath(); x.arc(0, -168, 20, 0, 7); x.fill();
  // cabelo preto liso
  x.fillStyle = O15.sombra; x.beginPath(); x.arc(0, -176, 20, Math.PI, 0); x.fill(); x.fillRect(-20, -176, 6, 30); x.fillRect(14, -176, 6, 30);
  // chifres/elmo curvo (malandro)
  x.strokeStyle = O15.ouro; x.lineWidth = 5; x.beginPath(); x.moveTo(-14, -186); x.quadraticCurveTo(-30, -210, -16, -220); x.moveTo(14, -186); x.quadraticCurveTo(30, -210, 16, -220); x.stroke();
  // sorriso de lado + olhos verdes
  x.fillStyle = '#6a9a7a'; x.beginPath(); x.arc(-7, -168, 3, 0, 7); x.arc(7, -168, 3, 0, 7); x.fill();
  x.strokeStyle = O15.sombra; x.lineWidth = 2; x.beginPath(); x.arc(0, -158, 8, 0.1, 1.2); x.stroke();
  x.restore();
}

// mapa nome->deus (para p.deus em f_salao_viking)
const O15_deus = { thor, odin, loki };

