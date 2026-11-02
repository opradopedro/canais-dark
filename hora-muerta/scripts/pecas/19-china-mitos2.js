// Pacote 19 (19-china-mitos2). Old Tales / mitos chineses 2. Reusa PALS.cl_china (ja existe no engine).
// Roteiro usa "tema":"mito" + "paleta":"china". const O19; helpers p19_.
//   f_dez_sois f_palacio_lua f_nuwa f_pangu f_ponte_pegas f_nezha f_mulan + houyi change nuwa nezha mulan coelhoJade

const O19 = { vermelho: '#c8372d', ouro: '#f4c542', jade: '#3fa88b', terra: '#7a5a3a', terraEsc: '#4a3620', pele: '#e8c49a',
  tinta: '#2b1712', branco: '#f4e8cf', lua: '#cfe0e8', luaEsc: '#9fb2bc', ceuNoite: '#14202e', fogo: '#f6903a',
  rocha: '#6a5a4a', osmanthus: '#e8b84a', barro: '#9a6a4a', agua: '#2a6a8a', seda: '#d64a7a', dragaoVerde: '#2a7a5a', sombra: '#1a1008' };

// sol-passaro (corvo de tres pernas) helper
const p19_solAve = (cx, cy, r, vivo = true) => {
  if (!vivo) { x.globalAlpha = 0.25; }
  glow(cx, cy, r * 2, 'rgba(246,120,40,0.4)'); x.fillStyle = vivo ? '#ff6a2a' : '#5a3a2a'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  x.fillStyle = vivo ? O19.sombra : '#3a2616'; x.beginPath(); x.ellipse(cx, cy, r * 0.5, r * 0.3, 0, 0, 7); x.fill(); // corvo dentro
  x.globalAlpha = 1;
};

// f_dez_sois: ceu com 10 sois-passaro e terra rachando; Houyi com arco derruba um a um. p={flechas:0..1}
COMP.f_dez_sois = (t, lt, p) => {
  const T = TF(); fundoFlat('#e66a2a', '#7a2418', [0.5, 0.2, 500]);
  const derrubados = Math.floor(rng(p.flechas ?? 0, lt) * 9);
  // 10 sois, alguns ja caidos
  for (let i = 0; i < 10; i++) { const sx = W * (0.1 + (i % 5) * 0.2); const sy = H * (0.12 + Math.floor(i / 5) * 0.14); p19_solAve(sx, sy, 28, i >= derrubados); }
  // terra rachada
  x.fillStyle = O19.terraEsc; x.fillRect(0, H * 0.72, W, H * 0.28); x.strokeStyle = '#2a1a0c'; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(W * (0.1 + i * 0.16), H * 0.72); for (let k = 0; k < 4; k++) x.lineTo(W * (0.1 + i * 0.16) + Math.sin(k + i) * 20, H * (0.76 + k * 0.06)); x.stroke(); }
  // Houyi com arco
  houyi(W * 0.5, H * 0.94, 0.7, { atira: true }, t);
};

// f_palacio_lua: palacio frio na lua, Chang'e, coelho de jade, osmanthus.
COMP.f_palacio_lua = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a2a3a', '#05101c', [0.5, 0.3, 600]);
  if (typeof estrelasFlat === 'function') estrelasFlat(t, 40);
  // superficie da lua
  x.fillStyle = O19.lua; x.beginPath(); x.ellipse(W * 0.5, H * 1.15, W * 0.8, H * 0.45, 0, 0, 7); x.fill();
  x.fillStyle = O19.luaEsc; for (const [cx, cy, r] of [[0.3, 0.86, 20], [0.7, 0.9, 14], [0.5, 0.94, 24]]) { x.beginPath(); x.arc(W * cx, H * cy, r, 0, 7); x.fill(); }
  // palacio frio
  x.fillStyle = O19.branco; x.fillRect(W * 0.38, H * 0.5, W * 0.24, H * 0.22); x.fillStyle = O19.vermelho; x.beginPath(); x.moveTo(W * 0.34, H * 0.5); x.quadraticCurveTo(W * 0.5, H * 0.4, W * 0.66, H * 0.5); x.lineTo(W * 0.62, H * 0.52); x.quadraticCurveTo(W * 0.5, H * 0.44, W * 0.38, H * 0.52); x.fill();
  // arvore de osmanthus
  x.strokeStyle = O19.terraEsc; x.lineWidth = 8; x.beginPath(); x.moveTo(W * 0.14, H * 0.74); x.lineTo(W * 0.14, H * 0.54); x.stroke(); x.fillStyle = O19.jade; x.beginPath(); x.arc(W * 0.14, H * 0.48, 36, 0, 7); x.fill(); x.fillStyle = O19.osmanthus; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(W * 0.14 + Math.cos(i) * 24, H * 0.48 + Math.sin(i) * 24, 4, 0, 7); x.fill(); }
  // Chang'e
  change(W * 0.74, H * 0.78, 0.6, {}, t);
  // coelho de jade socando pilao
  coelhoJade(W * 0.3, H * 0.84, 0.5, { soca: true }, t);
  // personagem opcional
  if (p.pers && typeof O19_pers[p.pers] === 'function') O19_pers[p.pers](W * 0.5, H * 0.9, 0.8, { atira: true, soca: true }, t);
};

// f_nuwa: ceu rachado, Nuwa serpente-mulher derretendo pedras de 5 cores, pessoas de barro. p={conserta:0..1}
COMP.f_nuwa = (t, lt, p) => {
  const T = TF(); fundoFlat('#3a2a4a', '#140f22', [0.5, 0.3, 500]);
  const con = rng(p.conserta ?? 0.5, lt);
  // buraco no ceu (vai fechando conforme conserta)
  x.fillStyle = '#060410'; x.beginPath(); x.ellipse(W * 0.5, H * 0.22, 120 * (1 - con), 60 * (1 - con), 0, 0, 7); x.fill();
  x.strokeStyle = '#1a1230'; x.lineWidth = 4; for (let i = 0; i < 5; i++) { const a = i / 5 * 7; x.beginPath(); x.moveTo(W * 0.5, H * 0.22); x.lineTo(W * 0.5 + Math.cos(a) * 160, H * 0.22 + Math.sin(a) * 90); x.stroke(); }
  // pedras de 5 cores
  const cores = ['#c8372d', '#f4c542', '#3fa88b', '#6a9ad6', '#8a4a9a'];
  for (let i = 0; i < 5; i++) { x.fillStyle = cores[i]; glow(W * (0.3 + i * 0.1), H * 0.22, 20, 'rgba(255,220,120,0.3)'); x.beginPath(); x.arc(W * (0.3 + i * 0.1), H * 0.22, 8, 0, 7); x.fill(); }
  // chao
  x.fillStyle = O19.terra; x.fillRect(0, H * 0.74, W, H * 0.26);
  // Nuwa serpente-mulher (cauda de serpente)
  nuwa(W * 0.5, H * 0.72, 0.9, {}, t);
  // pessoas de barro
  for (let i = 0; i < 3; i++) { x.fillStyle = O19.barro; x.fillRect(W * (0.1 + i * 0.08), H * 0.82, 14, 40); x.beginPath(); x.arc(W * (0.1 + i * 0.08) + 7, H * 0.8, 8, 0, 7); x.fill(); }
};

// f_pangu: ovo cosmico rachando, Pangu empurrando ceu e terra.
COMP.f_pangu = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a2420', '#0c0a08');
  // ceu (em cima) e terra (embaixo) separando-se
  const sep = 0.5 * Math.sin(t * 0.5) * 0.1;
  x.fillStyle = '#3a4a5a'; x.fillRect(0, 0, W, H * (0.4 + sep)); x.fillStyle = O19.terraEsc; x.fillRect(0, H * (0.6 - sep), W, H * (0.4 + sep));
  // ovo cosmico rachado (casca nos lados)
  x.fillStyle = O19.branco; x.beginPath(); x.moveTo(0, H * 0.3); x.quadraticCurveTo(W * 0.1, H * 0.5, 0, H * 0.7); x.lineTo(0, H * 0.3); x.fill(); x.beginPath(); x.moveTo(W, H * 0.3); x.quadraticCurveTo(W * 0.9, H * 0.5, W, H * 0.7); x.fill();
  // Pangu no centro empurrando
  x.save(); x.translate(W * 0.5, H * 0.5);
  x.fillStyle = O19.pele; x.fillRect(-14, -40, 28, 80); x.beginPath(); x.arc(0, -52, 16, 0, 7); x.fill();
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -58, 16, Math.PI, 0); x.fill(); // cabelo
  x.strokeStyle = O19.pele; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(-10, -30); x.lineTo(-20, -70 + sep * 200); x.moveTo(10, -30); x.lineTo(20, -70 + sep * 200); x.stroke(); // bracos pra cima
  x.beginPath(); x.moveTo(-8, 30); x.lineTo(-16, 70); x.moveTo(8, 30); x.lineTo(16, 70); x.stroke(); // pernas pra baixo
  x.restore();
  glow(W * 0.5, H * 0.5, 100, 'rgba(244,197,66,0.2)');
};

// f_ponte_pegas: Via Lactea, pegas formando ponte, Vaqueiro e Tecela. p={encontro}
COMP.f_ponte_pegas = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a1a3a', '#05050f', [0.5, 0.3, 600]);
  if (typeof estrelasFlat === 'function') estrelasFlat(t, 80);
  // via lactea (faixa de luz)
  x.save(); x.globalAlpha = 0.3; x.fillStyle = O19.branco; x.beginPath(); x.moveTo(0, H * 0.3); x.quadraticCurveTo(W * 0.5, H * 0.5, W, H * 0.3); x.lineTo(W, H * 0.5); x.quadraticCurveTo(W * 0.5, H * 0.7, 0, H * 0.5); x.fill(); x.restore();
  // ponte de pegas (passaros em arco)
  x.fillStyle = O19.sombra; for (let i = 0; i < 14; i++) { const u = i / 14; const px = W * (0.1 + u * 0.8); const py = H * 0.5 - Math.sin(u * Math.PI) * H * 0.14; x.beginPath(); x.ellipse(px, py, 14, 6, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(px - 10, py); x.lineTo(px - 20, py - 8); x.lineTo(px - 6, py - 2); x.fill(); x.beginPath(); x.moveTo(px + 10, py); x.lineTo(px + 20, py - 8); x.lineTo(px + 6, py - 2); x.fill(); }
  // Vaqueiro (esq) e Tecela (dir), se aproximam no encontro
  const enc = p.encontro ? 1 : 0;
  if (typeof figura === 'function') { figura(W * (0.2 + enc * 0.25), H * 0.46, 0.5, { figurino: 'mercador', olhar: 1 }, t); figura(W * (0.8 - enc * 0.25), H * 0.46, 0.5, { figurino: 'mercador', olhar: -1 }, t); }
  if (p.encontro) { x.fillStyle = O19.seda; glow(W * 0.5, H * 0.42, 40, 'rgba(214,74,122,0.3)'); x.beginPath(); x.arc(W * 0.5, H * 0.42, 8, 0, 7); x.fill(); }
};

// f_nezha: Nezha nas rodas de fogo com faixa vermelha e anel, mar revolto, dragao.
COMP.f_nezha = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a4a5a', '#0c1620', [0.5, 0.2, 400]);
  // mar revolto
  x.fillStyle = O19.agua; x.beginPath(); x.moveTo(0, H * 0.6); for (let xx = 0; xx <= W; xx += 24) x.lineTo(xx, H * 0.6 + Math.sin(xx * 0.02 + t * 2) * 30); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // dragao do mar (corpo em arcos verdes)
  x.strokeStyle = O19.dragaoVerde; x.lineWidth = 20; x.beginPath(); let up = true; for (let xx = 0; xx <= W; xx += 70) { const yy = H * (up ? 0.56 : 0.72); if (xx === 0) x.moveTo(0, H * 0.72); x.quadraticCurveTo(xx + 35, yy, xx + 70, H * 0.72); up = !up; } x.stroke();
  x.fillStyle = O19.dragaoVerde; x.beginPath(); x.moveTo(W * 0.9, H * 0.5); x.lineTo(W * 0.98, H * 0.42); x.lineTo(W, H * 0.54); x.quadraticCurveTo(W * 0.94, H * 0.58, W * 0.9, H * 0.5); x.fill(); x.fillStyle = O19.ouro; x.beginPath(); x.arc(W * 0.95, H * 0.48, 4, 0, 7); x.fill();
  // Nezha em pe nas rodas de fogo
  nezha(W * 0.4, H * 0.56, 0.9, {}, t);
};

// f_mulan: Mulan diante do espelho (casa) ou montada com exercito (norte gelado). p={cena}
COMP.f_mulan = (t, lt, p) => {
  const T = TF();
  if (p.cena === 'exercito') {
    ceuFlat('estrelas', t);
    x.fillStyle = O19.lua; x.fillRect(0, H * 0.6, W, H * 0.4); // neve do norte
    // montanhas
    x.fillStyle = '#4a5a6a'; x.beginPath(); x.moveTo(0, H * 0.6); x.lineTo(W * 0.3, H * 0.38); x.lineTo(W * 0.6, H * 0.6); x.fill(); x.beginPath(); x.moveTo(W * 0.5, H * 0.6); x.lineTo(W * 0.8, H * 0.42); x.lineTo(W, H * 0.6); x.fill();
    // exercito ao fundo (lanças)
    if (typeof multidao === 'function') multidao(0.5, 0.95, H * 0.7, 0.4, 5, { figurino: 'soldado_china', pose: 'parado', formacao: 'bloco' }, t);
    // Mulan montada a cavalo
    x.save(); x.translate(W * 0.3, H * 0.84); x.fillStyle = O19.sombra; x.beginPath(); x.ellipse(0, 0, 70, 30, 0, 0, 7); x.fill(); x.fillRect(-56, 0, 12, 44); x.fillRect(-28, 0, 12, 44); x.fillRect(28, 0, 12, 44); x.fillRect(48, 0, 12, 44); x.beginPath(); x.moveTo(56, -16); x.lineTo(90, -56); x.lineTo(100, -40); x.lineTo(72, -4); x.fill(); x.restore();
    mulan(W * 0.3, H * 0.78, 0.5, { armadura: true }, t);
  } else {
    fundoFlat('#3a2d3a', '#1a1018');
    // quarto com espelho
    x.fillStyle = O19.terraEsc; x.fillRect(W * 0.3, H * 0.76, W * 0.4, 14); // penteadeira
    x.fillStyle = O19.luaEsc; x.fillRect(W * 0.56, H * 0.3, W * 0.2, H * 0.44); x.fillStyle = '#5a6a74'; x.fillRect(W * 0.58, H * 0.32, W * 0.16, H * 0.4); // espelho
    // Mulan diante do espelho + reflexo
    mulan(W * 0.4, H * 0.92, 0.8, {}, t);
    x.save(); x.beginPath(); x.rect(W * 0.58, H * 0.32, W * 0.16, H * 0.4); x.clip(); mulan(W * 0.66, H * 0.86, 0.6, { armadura: true }, t); x.restore(); // reflexo guerreiro
  }
};

// ---- personagens (cx, base, s, o, t) ----

function houyi(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O19.vermelho; x.fillRect(-26, -140, 52, 100); x.fillStyle = O19.ouro; x.fillRect(-26, -140, 52, 12);
  x.fillStyle = O19.pele; x.beginPath(); x.arc(0, -158, 18, 0, 7); x.fill();
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -166, 18, Math.PI, 0); x.fill(); x.fillStyle = O19.sombra; x.fillRect(-4, -176, 8, 10);
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(-6, -158, 2.5, 0, 7); x.arc(6, -158, 2.5, 0, 7); x.fill();
  // arco esticado para cima
  if (o.atira) { x.strokeStyle = O19.terraEsc; x.lineWidth = 5; x.beginPath(); x.arc(30, -150, 50, -1.2, 1.2); x.stroke(); x.strokeStyle = O19.branco; x.lineWidth = 2; x.beginPath(); x.moveTo(30 + Math.cos(-1.2) * 50, -150 + Math.sin(-1.2) * 50); x.lineTo(10, -150); x.lineTo(30 + Math.cos(1.2) * 50, -150 + Math.sin(1.2) * 50); x.stroke(); x.strokeStyle = O19.ouro; x.beginPath(); x.moveTo(10, -150); x.lineTo(80, -200); x.stroke(); }
  x.restore();
}

function change(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // vestido fluido de seda, flutuando
  x.fillStyle = O19.seda; x.beginPath(); x.moveTo(-28, 0); x.quadraticCurveTo(-40, -80, -18, -150); x.lineTo(18, -150); x.quadraticCurveTo(40, -80, 28, 0); x.quadraticCurveTo(0, 14, -28, 0); x.fill();
  x.fillStyle = O19.pele; x.beginPath(); x.arc(0, -168, 18, 0, 7); x.fill();
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -174, 18, Math.PI, 0); x.fill(); x.fillRect(-16, -174, 5, 40); x.fillRect(11, -174, 5, 40); // cabelo longo
  x.fillStyle = O19.ouro; x.beginPath(); x.arc(0, -182, 6, 0, 7); x.fill(); // enfeite
  // faixas de seda flutuando
  x.strokeStyle = O19.branco; x.lineWidth = 3; x.beginPath(); x.moveTo(-28, -60); x.quadraticCurveTo(-70, -40 + Math.sin(t) * 10, -90, -70); x.stroke(); x.beginPath(); x.moveTo(28, -60); x.quadraticCurveTo(70, -40 + Math.sin(t + 1) * 10, 90, -70); x.stroke();
  x.restore();
}

function nuwa(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // metade superior mulher
  x.fillStyle = O19.vermelho; x.fillRect(-22, -140, 44, 70);
  x.fillStyle = O19.pele; x.beginPath(); x.arc(0, -156, 16, 0, 7); x.fill();
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -162, 16, Math.PI, 0); x.fill();
  // cauda de serpente (verde, enrolada)
  x.fillStyle = O19.jade; x.beginPath(); x.moveTo(-22, -70); x.quadraticCurveTo(-60, -40, -30, -10); x.quadraticCurveTo(10, 10, 50, -10); x.quadraticCurveTo(70, -30, 40, -50); x.quadraticCurveTo(20, -64, 22, -70); x.fill();
  x.strokeStyle = '#2a7a5a'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(-10 + i * 14, -30, 6, 0, Math.PI); x.stroke(); }
  // segura uma pedra colorida
  x.fillStyle = O19.ouro; glow(0, -120, 16, 'rgba(244,197,66,0.4)'); x.beginPath(); x.arc(24, -120, 7, 0, 7); x.fill();
  x.restore();
}

function nezha(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // rodas de fogo nos pes
  for (const dx of [-16, 16]) { glow(dx, 10, 30, 'rgba(246,144,58,0.5)'); x.strokeStyle = O19.fogo; x.lineWidth = 5; x.beginPath(); x.arc(dx, 10, 18, 0, 7); x.stroke(); x.fillStyle = O19.ouro; x.beginPath(); x.arc(dx, 10, 6, 0, 7); x.fill(); }
  // corpo de menino
  x.fillStyle = O19.vermelho; x.fillRect(-18, -90, 36, 80);
  x.fillStyle = O19.ouro; x.fillRect(-18, -50, 36, 10); // anel/cinto dourado (Qiankun)
  x.fillStyle = O19.pele; x.beginPath(); x.arc(0, -106, 15, 0, 7); x.fill();
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -112, 15, Math.PI, 0); x.fill(); x.fillStyle = O19.sombra; x.beginPath(); x.arc(-8, -118, 6, 0, 7); x.arc(8, -118, 6, 0, 7); x.fill(); // coques duplos
  // faixa vermelha esvoacante (Huntian Ling)
  x.strokeStyle = O19.seda; x.lineWidth = 5; x.beginPath(); x.moveTo(16, -80); x.quadraticCurveTo(70, -60 + Math.sin(t * 2) * 20, 100, -100); x.stroke();
  x.restore();
}

function mulan(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  if (o.armadura) {
    x.fillStyle = '#5a6a7a'; x.fillRect(-26, -140, 52, 100); x.fillStyle = O19.ferro || '#8a929a'; x.fillStyle = '#8a929a'; x.fillRect(-26, -140, 52, 20);
    x.fillStyle = O19.vermelho; x.beginPath(); x.moveTo(0, -140); x.lineTo(-10, -100); x.lineTo(10, -100); x.fill(); // capa/detalhe
  } else {
    x.fillStyle = O19.seda; x.beginPath(); x.moveTo(-26, 0); x.lineTo(26, 0); x.lineTo(18, -140); x.lineTo(-18, -140); x.fill();
  }
  x.fillStyle = O19.pele; x.beginPath(); x.arc(0, -158, 17, 0, 7); x.fill();
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -164, 17, Math.PI, 0); x.fill();
  if (o.armadura) { x.fillStyle = '#8a929a'; x.beginPath(); x.arc(0, -168, 18, Math.PI, Math.PI * 1.6); x.fill(); } // elmo
  else { x.fillStyle = O19.sombra; x.beginPath(); x.arc(0, -150, 8, 0, 7); x.fill(); x.fillStyle = O19.ouro; x.beginPath(); x.arc(0, -172, 4, 0, 7); x.fill(); } // coque + enfeite
  x.fillStyle = O19.sombra; x.beginPath(); x.arc(-6, -158, 2.5, 0, 7); x.arc(6, -158, 2.5, 0, 7); x.fill();
  x.restore();
}

function coelhoJade(cx, base, s, o = {}, t = 0) {
  const sc = s; x.save(); x.translate(cx, base); x.scale(sc, sc);
  // coelho branco
  x.fillStyle = O19.branco; x.beginPath(); x.ellipse(0, -30, 24, 30, 0, 0, 7); x.fill();
  x.beginPath(); x.ellipse(-8, -66, 6, 20, -0.2, 0, 7); x.fill(); x.beginPath(); x.ellipse(8, -66, 6, 20, 0.2, 0, 7); x.fill(); // orelhas
  x.fillStyle = O19.seda; x.beginPath(); x.arc(-5, -40, 2.5, 0, 7); x.arc(5, -40, 2.5, 0, 7); x.fill(); // olhos rosados
  // pilao e almofariz (socando)
  const soca = o.soca ? Math.abs(Math.sin(t * 4)) * 10 : 0;
  x.fillStyle = O19.jade; x.beginPath(); x.ellipse(26, -6, 16, 10, 0, 0, 7); x.fill(); x.fillStyle = O19.terraEsc; x.fillRect(22, -40 - soca, 8, 30);
  x.restore();
}

const O19_pers = { houyi, change, nuwa, nezha, mulan, coelhoJade };
