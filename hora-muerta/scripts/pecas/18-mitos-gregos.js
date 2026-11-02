// Pacote 18 (18-mitos-gregos). Old Tales / mitologia grega. Reusa PALS.cl_grecia (ja existe no engine).
// Roteiro usa "tema":"mito" + "paleta":"grecia". const O18; helpers p18_. figurino hoplita vem do 02.
//   f_olimpo f_labirinto f_mar_ciclope f_sereias f_submundo f_icaro f_troia + zeus hades medusa minotauro ciclope

const O18 = { marmore: '#f3e2c4', marmoreEsc: '#c9b58a', pedra: '#b8a478', pedraEsc: '#6a5a3a', ouro: '#f0a43a', bronze: '#c08a3a',
  nuvem: '#e4ddd0', ceu: '#8fb8d6', mar: '#2a6a8a', marEsc: '#164a60', pele: '#e0b48a', tunica: '#f3e2c4', vermelho: '#a8321f',
  verde: '#5c7d3a', pretoAzul: '#1a1826', sombra: '#2a1f14', raio: '#fff4b0', labirinto: '#7a6a4a' };

// coluna grega (helper) - dorica simples
const p18_coluna = (cx, baseY, h, w = 22) => {
  x.fillStyle = O18.marmore; x.fillRect(cx - w / 2, baseY - h, w, h);
  x.fillStyle = O18.marmoreEsc; x.fillRect(cx - w / 2 - 5, baseY - h - 8, w + 10, 10); x.fillRect(cx - w / 2 - 5, baseY - 8, w + 10, 10);
  x.strokeStyle = 'rgba(0,0,0,0.1)'; x.lineWidth = 2; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(cx - w / 2 + i * w / 4, baseY - h); x.lineTo(cx - w / 2 + i * w / 4, baseY); x.stroke(); }
};

// f_olimpo: palacio nas nuvens, tronos, Zeus com raio.
COMP.f_olimpo = (t, lt, p) => {
  const T = TF(); fundoFlat('#8fb8d6', '#e8d4b0', [0.5, 0.2, 600]);
  // nuvens embaixo
  x.fillStyle = O18.nuvem; for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(W * (0.15 + i * 0.25), H * (0.78 + (i % 2) * 0.04), 120, 36, 0, 0, 7); x.fill(); }
  x.fillStyle = 'rgba(228,221,208,0.6)'; x.fillRect(0, H * 0.82, W, H * 0.18);
  // palacio (fronton + colunas)
  for (let i = 0; i < 5; i++) p18_coluna(W * (0.24 + i * 0.13), H * 0.74, H * 0.34, 20);
  x.fillStyle = O18.marmore; x.fillRect(W * 0.18, H * 0.36, W * 0.64, 14); x.fillStyle = O18.marmoreEsc; x.beginPath(); x.moveTo(W * 0.16, H * 0.36); x.lineTo(W * 0.5, H * 0.24); x.lineTo(W * 0.84, H * 0.36); x.fill();
  // trono central + Zeus com raio
  x.fillStyle = O18.ouro; x.fillRect(W * 0.46, H * 0.5, W * 0.08, H * 0.24);
  const pers = p.pers && O18_pers[p.pers] ? O18_pers[p.pers] : zeus;
  pers(W * 0.5, H * 0.72, 0.6, { raio: true }, t);
};

// f_labirinto: corredores de cima, fio de Ariadne, Minotauro. p={fio:0..1, minotauro}
COMP.f_labirinto = (t, lt, p) => {
  const T = TF(); fundoFlat('#6a5a3a', '#2a2214');
  // grade de paredes (vista de cima)
  x.strokeStyle = O18.labirinto; x.lineWidth = 10;
  const cols = 7, rows = 10, cw = W / cols, ch = H / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const gx = c * cw, gy = r * ch; if ((r + c) % 2 === 0) { x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + cw, gy); x.stroke(); } if ((r * c) % 3 === 0) { x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx, gy + ch); x.stroke(); } }
  // fio de Ariadne que se desenha
  const fio = rng(p.fio ?? 0.6, lt); x.strokeStyle = O18.vermelho; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.1, H * 0.95); let fx = W * 0.1, fy = H * 0.95; const steps = Math.floor(fio * 10);
  for (let i = 0; i < steps; i++) { fx += (i % 2 ? cw : 0) * (i % 4 < 2 ? 1 : -1); fy -= ch * 0.8; x.lineTo(Math.max(20, Math.min(W - 20, fx)), Math.max(20, fy)); } x.stroke();
  // Minotauro no centro
  if (p.minotauro) minotauro(W * 0.5, H * 0.52, 0.7, {}, t);
};

// f_mar_ciclope: ilha, caverna, ovelhas, ciclope gigante, barco fugindo.
COMP.f_mar_ciclope = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  // mar
  x.fillStyle = O18.mar; x.fillRect(0, H * 0.62, W, H * 0.38);
  // ilha com caverna
  x.fillStyle = O18.pedraEsc; x.beginPath(); x.moveTo(0, H * 0.62); x.quadraticCurveTo(W * 0.3, H * 0.2, W * 0.6, H * 0.62); x.fill();
  x.fillStyle = O18.pretoAzul; x.beginPath(); x.ellipse(W * 0.3, H * 0.56, 50, 60, 0, Math.PI, 0); x.fill();
  // ovelhas
  for (let i = 0; i < 3; i++) { x.fillStyle = O18.tunica; x.beginPath(); x.ellipse(W * (0.12 + i * 0.1), H * 0.6, 16, 10, 0, 0, 7); x.fill(); }
  // ciclope gigante na ilha
  ciclope(W * 0.3, H * 0.56, 0.9, {}, t);
  // barco fugindo
  x.fillStyle = O18.bronze; x.beginPath(); x.moveTo(W * 0.72, H * 0.72); x.quadraticCurveTo(W * 0.8, H * 0.8, W * 0.9, H * 0.72); x.lineTo(W * 0.88, H * 0.68); x.lineTo(W * 0.74, H * 0.68); x.fill(); x.fillStyle = O18.tunica; x.beginPath(); x.moveTo(W * 0.81, H * 0.68); x.lineTo(W * 0.81, H * 0.52); x.lineTo(W * 0.9, H * 0.66); x.fill();
};

// f_sereias: rochedo, sereias-passaro (arte grega), Ulisses amarrado ao mastro.
COMP.f_sereias = (t, lt, p) => {
  const T = TF(); ceuFlat('por', t);
  x.fillStyle = O18.mar; x.fillRect(0, H * 0.6, W, H * 0.4);
  // rochedo
  x.fillStyle = O18.pedraEsc; x.beginPath(); x.moveTo(W * 0.1, H * 0.6); x.lineTo(W * 0.25, H * 0.3); x.lineTo(W * 0.42, H * 0.6); x.fill();
  // sereias-passaro (corpo de ave + cabeca de mulher) no rochedo
  for (let i = 0; i < 2; i++) { const sx = W * (0.2 + i * 0.1), sy = H * (0.42 + i * 0.06); x.fillStyle = '#8a6a4a'; x.beginPath(); x.ellipse(sx, sy, 20, 14, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(sx + 14, sy); x.lineTo(sx + 34, sy - 10); x.lineTo(sx + 30, sy + 6); x.fill(); x.fillStyle = O18.pele; x.beginPath(); x.arc(sx - 14, sy - 10, 9, 0, 7); x.fill(); x.fillStyle = O18.sombra; x.beginPath(); x.arc(sx - 14, sy - 14, 9, Math.PI, 0); x.fill(); }
  // barco com Ulisses amarrado ao mastro
  x.fillStyle = O18.bronze; x.beginPath(); x.moveTo(W * 0.6, H * 0.76); x.quadraticCurveTo(W * 0.72, H * 0.86, W * 0.86, H * 0.76); x.lineTo(W * 0.84, H * 0.7); x.lineTo(W * 0.62, H * 0.7); x.fill();
  x.strokeStyle = O18.madeira || '#6a4a2e'; x.strokeStyle = '#6a4a2e'; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.73, H * 0.7); x.lineTo(W * 0.73, H * 0.48); x.stroke();
  if (typeof figura === 'function') figura(W * 0.73, H * 0.7, 0.5, { figurino: 'hoplita', pose: 'parado' }, t);
  x.strokeStyle = O18.tunica; x.lineWidth = 3; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(W * 0.69, H * (0.56 + i * 0.03)); x.lineTo(W * 0.77, H * (0.56 + i * 0.03)); x.stroke(); } // cordas
};

// f_submundo: rio Estige, Caronte, Cerbero, almas palidas.
COMP.f_submundo = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a1f3d', '#0c0812', [0.5, 0.3, 500]);
  // rio Estige
  x.fillStyle = '#1a3a4a'; x.fillRect(0, H * 0.6, W, H * 0.4); x.fillStyle = 'rgba(90,180,200,0.1)'; for (let i = 0; i < 4; i++) x.fillRect(0, H * (0.66 + i * 0.07), W, 3);
  // barca de Caronte
  x.fillStyle = O18.sombra; x.beginPath(); x.moveTo(W * 0.3, H * 0.72); x.quadraticCurveTo(W * 0.5, H * 0.82, W * 0.7, H * 0.72); x.lineTo(W * 0.66, H * 0.68); x.lineTo(W * 0.34, H * 0.68); x.fill();
  // Caronte encapuzado com remo
  x.fillStyle = '#1a1620'; x.beginPath(); x.moveTo(W * 0.46, H * 0.68); x.lineTo(W * 0.54, H * 0.68); x.lineTo(W * 0.52, H * 0.46); x.lineTo(W * 0.48, H * 0.46); x.fill(); x.beginPath(); x.arc(W * 0.5, H * 0.46, 12, 0, 7); x.fill(); x.strokeStyle = '#6a4a2e'; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.56, H * 0.5); x.lineTo(W * 0.64, H * 0.74); x.stroke();
  // almas palidas (silhuetas translucidas)
  x.save(); x.globalAlpha = 0.3; x.fillStyle = O18.nuvem; for (let i = 0; i < 4; i++) { const ax = W * (0.1 + i * 0.07); x.beginPath(); x.moveTo(ax, H * 0.6); x.lineTo(ax + 10, H * 0.6); x.lineTo(ax + 6, H * 0.42); x.lineTo(ax + 2, H * 0.42); x.fill(); x.beginPath(); x.arc(ax + 5, H * 0.4, 6, 0, 7); x.fill(); } x.restore();
  // Cerbero de 3 cabecas na margem
  x.fillStyle = O18.pretoAzul; x.beginPath(); x.ellipse(W * 0.85, H * 0.78, 50, 24, 0, 0, 7); x.fill(); for (let i = -1; i <= 1; i++) { x.beginPath(); x.arc(W * 0.85 + i * 22, H * 0.66, 13, 0, 7); x.fill(); x.fillStyle = O18.vermelho; x.beginPath(); x.arc(W * 0.85 + i * 22 - 3, H * 0.65, 2.5, 0, 7); x.arc(W * 0.85 + i * 22 + 3, H * 0.65, 2.5, 0, 7); x.fill(); x.fillStyle = O18.pretoAzul; }
};

// f_icaro: ceu com sol forte, asas de cera derretendo, mar. p={derrete:0..1}
COMP.f_icaro = (t, lt, p) => {
  const T = TF(); fundoFlat('#5fa8d8', '#bfe0f0', [0.7, 0.14, 500]);
  // sol forte
  glow(W * 0.74, H * 0.16, 180, 'rgba(255,230,120,0.5)'); x.fillStyle = '#ffd24a'; x.beginPath(); x.arc(W * 0.74, H * 0.16, 56, 0, 7); x.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 7; x.strokeStyle = 'rgba(255,210,74,0.5)'; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.74 + Math.cos(a) * 64, H * 0.16 + Math.sin(a) * 64); x.lineTo(W * 0.74 + Math.cos(a) * 84, H * 0.16 + Math.sin(a) * 84); x.stroke(); }
  // mar embaixo
  x.fillStyle = O18.mar; x.fillRect(0, H * 0.8, W, H * 0.2);
  // Icaro caindo com asas
  const der = rng(p.derrete ?? 0.5, lt); x.save(); x.translate(W * 0.42, H * (0.4 + der * 0.2)); x.rotate(der * 0.4);
  x.fillStyle = O18.pele; x.fillRect(-8, -20, 16, 50);
  // asas (penas caindo conforme derrete)
  x.fillStyle = O18.tunica; x.beginPath(); x.moveTo(-8, -10); x.quadraticCurveTo(-70, -30 + der * 30, -90, 10 + der * 20); x.quadraticCurveTo(-50, -4, -8, 6); x.fill(); x.beginPath(); x.moveTo(8, -10); x.quadraticCurveTo(70, -30 + der * 30, 90, 10 + der * 20); x.quadraticCurveTo(50, -4, 8, 6); x.fill();
  x.restore();
  // penas soltas caindo
  x.fillStyle = O18.tunica; for (let i = 0; i < 5; i++) { x.save(); x.translate(W * (0.3 + i * 0.08), H * (0.55 + ((t * 20 + i * 40) % 200) / 500)); x.rotate(t + i); x.beginPath(); x.ellipse(0, 0, 10, 4, 0, 0, 7); x.fill(); x.restore(); }
};

// f_troia: muralha e cavalo de madeira. p={cavalo}
COMP.f_troia = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  x.fillStyle = O18.pedra; x.fillRect(0, H * 0.78, W, H * 0.22);
  // muralha de Troia
  x.fillStyle = O18.pedraEsc; x.fillRect(0, H * 0.3, W, H * 0.48); x.fillStyle = O18.pedra; for (let i = 0; i < 10; i++) { x.fillRect(W * (i * 0.1), H * 0.3, W * 0.09, 20); } // ameias
  x.fillStyle = O18.sombra; x.fillRect(W * 0.44, H * 0.5, W * 0.12, H * 0.28); // portao
  // cavalo de madeira
  if (p.cavalo !== false) { x.save(); x.translate(W * 0.5, H * 0.78); x.fillStyle = '#6a4a2e'; x.beginPath(); x.ellipse(0, -60, 80, 44, 0, 0, 7); x.fill(); x.fillRect(-70, -30, 18, 40); x.fillRect(-40, -30, 18, 40); x.fillRect(24, -30, 18, 40); x.fillRect(54, -30, 18, 40);
    x.beginPath(); x.moveTo(60, -80); x.lineTo(96, -130); x.lineTo(110, -110); x.lineTo(80, -64); x.fill(); // pescoco+cabeca
    x.fillStyle = '#4a3420'; x.beginPath(); x.moveTo(96, -130); x.lineTo(92, -148); x.lineTo(104, -128); x.fill(); // orelha
    x.strokeStyle = '#4a3420'; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-70, -80 + i * 20); x.lineTo(70, -80 + i * 20); x.stroke(); } // tabuas
    x.fillStyle = O18.ouro; x.fillRect(-2, -84, 4, 10); x.restore(); }
};

// ---- personagens (cx, base, s, o, t) ----

function zeus(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O18.tunica; x.beginPath(); x.moveTo(-34, 0); x.lineTo(34, 0); x.lineTo(22, -150); x.lineTo(-22, -150); x.fill();
  x.fillStyle = O18.ouro; x.fillRect(-24, -150, 48, 8);
  x.fillStyle = O18.pele; x.beginPath(); x.arc(0, -168, 20, 0, 7); x.fill();
  x.fillStyle = O18.nuvem; x.beginPath(); x.moveTo(-14, -162); x.quadraticCurveTo(0, -110, 14, -162); x.lineTo(10, -166); x.lineTo(-10, -166); x.fill(); // barba branca
  x.fillStyle = O18.nuvem; x.beginPath(); x.arc(0, -178, 20, Math.PI, 0); x.fill(); // cabelo
  x.fillStyle = O18.ouro; x.beginPath(); x.arc(0, -186, 20, Math.PI, Math.PI * 1.3); x.stroke(); // coroa de louros-ish
  if (o.raio) { x.strokeStyle = O18.raio; x.lineWidth = 5; x.beginPath(); x.moveTo(40, -120); x.lineTo(30, -90); x.lineTo(46, -84); x.lineTo(34, -40); x.stroke(); glow(40, -100, 30, 'rgba(255,244,176,0.5)'); }
  x.restore();
}

function hades(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O18.pretoAzul; x.beginPath(); x.moveTo(-34, 0); x.lineTo(34, 0); x.lineTo(22, -150); x.lineTo(-22, -150); x.fill();
  x.fillStyle = O18.pele; x.beginPath(); x.arc(0, -168, 20, 0, 7); x.fill();
  x.fillStyle = '#2a2436'; x.beginPath(); x.moveTo(-14, -162); x.quadraticCurveTo(0, -116, 14, -162); x.fill(); // barba escura
  x.fillStyle = '#2a2436'; x.beginPath(); x.arc(0, -178, 20, Math.PI, 0); x.fill();
  // elmo de invisibilidade (coroa escura)
  x.fillStyle = O18.sombra; x.beginPath(); x.arc(0, -184, 20, Math.PI, 0); x.fill();
  // bident (cajado de 2 pontas)
  x.strokeStyle = O18.ouro; x.lineWidth = 4; x.beginPath(); x.moveTo(42, -10); x.lineTo(42, -200); x.stroke(); x.beginPath(); x.moveTo(42, -200); x.lineTo(34, -220); x.moveTo(42, -200); x.lineTo(50, -220); x.stroke();
  x.restore();
}

function medusa(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O18.verde; x.beginPath(); x.moveTo(-30, 0); x.lineTo(30, 0); x.lineTo(18, -130); x.lineTo(-18, -130); x.fill();
  x.fillStyle = '#9aa85a'; x.beginPath(); x.arc(0, -150, 22, 0, 7); x.fill(); // rosto esverdeado
  // cobras no cabelo (varias)
  x.strokeStyle = '#4a7a3a'; x.lineWidth = 5; for (let i = 0; i < 7; i++) { const a = Math.PI + i * (Math.PI / 6); const bx = Math.cos(a) * 22, by = -150 + Math.sin(a) * 22; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + Math.cos(a) * 30 + Math.sin(t + i) * 8, by + Math.sin(a) * 30, bx + Math.cos(a) * 40, by + Math.sin(a) * 36); x.stroke(); x.fillStyle = '#4a7a3a'; x.beginPath(); x.arc(bx + Math.cos(a) * 40, by + Math.sin(a) * 36, 4, 0, 7); x.fill(); }
  // olhar (olhos amarelos que petrificam)
  x.fillStyle = O18.ouro; x.beginPath(); x.arc(-7, -150, 4, 0, 7); x.arc(7, -150, 4, 0, 7); x.fill();
  x.restore();
}

function minotauro(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#6a4a30'; x.fillRect(-34, -150, 68, 110); // corpo
  x.fillStyle = O18.sombra; x.beginPath(); x.arc(0, -172, 26, 0, 7); x.fill(); // cabeca de touro
  x.beginPath(); x.moveTo(0, -158); x.lineTo(16, -150); x.lineTo(0, -146); x.lineTo(-16, -150); x.fill(); // focinho
  // chifres
  x.strokeStyle = O18.tunica; x.lineWidth = 6; x.beginPath(); x.moveTo(-20, -186); x.quadraticCurveTo(-40, -200, -34, -214); x.moveTo(20, -186); x.quadraticCurveTo(40, -200, 34, -214); x.stroke();
  x.fillStyle = O18.vermelho; x.beginPath(); x.arc(-9, -176, 3, 0, 7); x.arc(9, -176, 3, 0, 7); x.fill();
  x.restore();
}

function ciclope(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#9a7a5a'; x.fillRect(-40, -180, 80, 150); // corpo grande
  x.fillStyle = '#a88a68'; x.beginPath(); x.arc(0, -200, 34, 0, 7); x.fill(); // cabeca
  x.fillStyle = O18.tunica; x.beginPath(); x.arc(0, -204, 14, 0, 7); x.fill(); // um olho grande
  x.fillStyle = O18.sombra; x.beginPath(); x.arc(0, -204, 6, 0, 7); x.fill();
  x.fillStyle = '#6a5a3a'; x.beginPath(); x.arc(0, -224, 34, Math.PI, 0); x.fill(); // cabelo
  x.restore();
}

// mapa nome->personagem (p.pers em f_olimpo)
const O18_pers = { zeus, hades, medusa, minotauro, ciclope };

