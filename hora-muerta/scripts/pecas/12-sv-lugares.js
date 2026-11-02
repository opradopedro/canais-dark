// Pacote 12 (12-sv-lugares). Signal Lost ("paleta":"sv"): frio, moderno. Placas em INGLES. Cores via TF() (sv) + neutras.
// sv: fundo1 #12303a, ciano de tela #4fe3ff (destaque), sodio amarelo #ffd166 (acento), perigo #ff4d5e.
//   f_floresta f_corredor f_elevador f_motel f_garagem f_mercado_noite f_cabana f_farol f_estrada_nevoa f_lago_gelado

const O12 = { metal: '#3a4650', metalEsc: '#222a30', concreto: '#4a525a', concretoEsc: '#2a3036', vidro: '#9fb6bf',
  asfalto: '#1c2228', neve: '#d8e4e8', neveEsc: '#9fb2b8', madeira: '#3a2e24', preto: '#0a1014', branco: '#e6f1f2' };

// HUD de sinal do celular no canto esquerdo (marca do canal). Fica fora da zona de legenda.
const p12_hud = (t, barras = 1) => {
  const T = TF(); x.save(); x.globalAlpha = 0.8;
  for (let i = 0; i < 4; i++) { x.fillStyle = i < barras ? T.destaque : 'rgba(120,140,150,0.4)'; x.fillRect(W * 0.04 + i * 12, H * 0.06 - i * 5, 8, 10 + i * 5); }
  x.fillStyle = T.perigo; x.font = fonte('fonteTxt', 20); x.textAlign = 'left'; if (barras === 0) x.fillText('NO SIGNAL', W * 0.04, H * 0.1);
  x.restore();
};

// f_floresta: trilha no mato a noite, lanterna, arvores altas, torre de guarda, olhos. p={torre, ojos}
COMP.f_floresta = (t, lt, p) => {
  const T = TF(); fundoFlat(T.fundo1, T.fundo2, [0.5, 0.2, 500]);
  // arvores altas (silhueta)
  for (let i = 0; i < 6; i++) { const tx = W * (0.02 + i * 0.18); x.fillStyle = i % 2 ? O12.metalEsc : '#1a2228'; x.fillRect(tx, 0, W * 0.08, H); x.beginPath(); x.moveTo(tx - 20, H * 0.4); x.lineTo(tx + W * 0.04, 0); x.lineTo(tx + W * 0.08 + 20, H * 0.4); x.fill(); }
  // chao / trilha
  x.fillStyle = O12.asfalto; x.beginPath(); x.moveTo(W * 0.4, H * 0.5); x.lineTo(W * 0.6, H * 0.5); x.lineTo(W * 0.8, H); x.lineTo(W * 0.2, H); x.fill();
  // torre de guarda ao fundo
  if (p.torre) { x.fillStyle = O12.metalEsc; x.fillRect(W * 0.7, H * 0.26, W * 0.06, H * 0.24); x.strokeStyle = O12.metal; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.7, H * 0.5); x.lineTo(W * 0.73, H * 0.26); x.moveTo(W * 0.76, H * 0.5); x.lineTo(W * 0.73, H * 0.26); x.stroke(); x.fillStyle = O12.metal; x.fillRect(W * 0.68, H * 0.2, W * 0.1, H * 0.06); glow(W * 0.73, H * 0.22, 30, 'rgba(255,209,102,0.3)'); }
  // feixe de lanterna
  x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,209,102,0.12)'; x.beginPath(); x.moveTo(W * 0.5, H); x.lineTo(W * 0.3, H * 0.4); x.lineTo(W * 0.7, H * 0.4); x.fill(); x.restore();
  // olhos no mato
  if (p.ojos) { const b = 0.5 + 0.5 * Math.sin(t * 3); x.globalAlpha = 0.5 + 0.5 * b; x.fillStyle = T.destaque; x.beginPath(); x.arc(W * 0.14, H * 0.44, 5, 0, 7); x.arc(W * 0.18, H * 0.44, 5, 0, 7); x.fill(); x.globalAlpha = 1; }
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.4, 0.8);
  p12_hud(t, p.ojos ? 0 : 1);
};

// f_corredor: corredor com portas, fluorescente piscando, placa EXIT, maca, vulto no fim. p={pisca, vulto:0..1}
COMP.f_corredor = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a2228', '#0a1014');
  // perspectiva do corredor (trapezios)
  x.fillStyle = O12.concretoEsc; x.beginPath(); x.moveTo(0, 0); x.lineTo(W * 0.3, H * 0.2); x.lineTo(W * 0.3, H * 0.8); x.lineTo(0, H); x.fill();
  x.beginPath(); x.moveTo(W, 0); x.lineTo(W * 0.7, H * 0.2); x.lineTo(W * 0.7, H * 0.8); x.lineTo(W, H); x.fill();
  x.fillStyle = O12.concreto; x.fillRect(W * 0.3, H * 0.2, W * 0.4, H * 0.6); // fundo
  x.fillStyle = '#12181c'; x.beginPath(); x.moveTo(0, 0); x.lineTo(W * 0.3, H * 0.2); x.lineTo(W * 0.7, H * 0.2); x.lineTo(W, 0); x.fill(); // teto
  x.fillStyle = O12.asfalto; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.3, H * 0.8); x.lineTo(W * 0.7, H * 0.8); x.lineTo(W, H); x.fill(); // chao
  // portas laterais
  for (let i = 0; i < 2; i++) { const u = 0.1 + i * 0.4; x.fillStyle = O12.metalEsc; x.fillRect(W * (0.3 - u * 0.25), H * (0.3 + u * 0.1), W * 0.05, H * 0.3); x.fillStyle = O12.metalEsc; x.fillRect(W * (0.65 + u * 0.2), H * (0.3 + u * 0.1), W * 0.05, H * 0.3); }
  // fluorescente piscando
  const pisca = p.pisca ? (Math.sin(t * 20) > -0.3 ? 1 : 0.2) : 1;
  x.save(); x.globalAlpha = 0.5 * pisca; glow(W * 0.5, H * 0.22, 120, 'rgba(230,241,242,0.5)'); x.fillStyle = 'rgba(230,241,242,0.6)'; x.fillRect(W * 0.44, H * 0.2, W * 0.12, 8); x.restore();
  // placa EXIT
  x.fillStyle = '#1a3a2a'; x.fillRect(W * 0.46, H * 0.24, W * 0.08, 22); x.fillStyle = '#5fe08a'; x.font = fonte('fonteTit', 16); x.textAlign = 'center'; x.fillText('EXIT', W * 0.5, H * 0.26 + 6);
  // maca
  x.fillStyle = O12.metal; x.fillRect(W * 0.2, H * 0.68, W * 0.16, 10); x.fillRect(W * 0.21, H * 0.68, 6, 40); x.fillRect(W * 0.34, H * 0.68, 6, 40);
  // vulto no fim
  const vu = rng(p.vulto ?? 0, lt); if (vu > 0.05) { x.save(); x.globalAlpha = Math.min(vu, 0.9); x.fillStyle = O12.preto; x.beginPath(); x.moveTo(W * 0.46, H * 0.74); x.lineTo(W * 0.54, H * 0.74); x.lineTo(W * 0.52, H * 0.42); x.lineTo(W * 0.48, H * 0.42); x.fill(); x.beginPath(); x.arc(W * 0.5, H * 0.4, 14, 0, 7); x.fill(); x.restore(); }
  x.font = fonte('fonteTxt', 14); x.textAlign = 'left';
  p12_hud(t, p.vulto ? 0 : 2);
};

// f_elevador: elevador, painel de botoes com andar que muda sozinho, porta abrindo. p={andar, abre:0..1}
COMP.f_elevador = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a3036', '#12181c');
  // cabine
  x.fillStyle = O12.metal; x.fillRect(W * 0.1, H * 0.1, W * 0.8, H * 0.85);
  x.fillStyle = O12.metalEsc; x.fillRect(W * 0.12, H * 0.12, W * 0.76, H * 0.8);
  // porta abrindo (duas folhas)
  const ab = rng(p.abre ?? 0, lt); x.fillStyle = O12.metal; x.fillRect(W * 0.2, H * 0.14, W * 0.3 * (1 - ab), H * 0.76); x.fillRect(W * (0.8 - 0.3 * (1 - ab)), H * 0.14, W * 0.3 * (1 - ab), H * 0.76);
  x.fillStyle = '#060a0c'; x.fillRect(W * (0.2 + 0.3 * (1 - ab)), H * 0.14, W * (0.6 - 0.6 * (1 - ab)), H * 0.76);
  // display de andar
  const andar = Math.floor(rng(p.andar ?? 0, lt) * 13);
  x.fillStyle = '#060a0c'; x.fillRect(W * 0.42, H * 0.04, W * 0.16, H * 0.05); x.fillStyle = T.perigo; x.font = fonte('fonteTit', 28); x.textAlign = 'center'; x.fillText(andar === 13 ? '13' : String(andar), W * 0.5, H * 0.08);
  // painel de botoes
  for (let i = 0; i < 6; i++) { const bx = W * 0.82, by = H * (0.3 + i * 0.08); x.fillStyle = i === andar % 6 ? T.destaque : O12.metalEsc; x.beginPath(); x.arc(bx, by, 9, 0, 7); x.fill(); }
  x.font = fonte('fonteTxt', 14); x.textAlign = 'left';
  p12_hud(t, 1);
};

// f_motel: motel de estrada, letreiro neon que falha, portas numeradas, maquina de gelo, carro.
COMP.f_motel = (t, lt, p) => {
  const T = TF(); ceuFlat('estrelas', t);
  // predio do motel
  x.fillStyle = O12.concretoEsc; x.fillRect(0, H * 0.4, W, H * 0.4);
  x.fillStyle = O12.asfalto; x.fillRect(0, H * 0.8, W, H * 0.2);
  // letreiro neon que falha
  const on = Math.sin(t * 6) > -0.4 ? 1 : 0.15; x.save(); x.globalAlpha = on; glow(W * 0.5, H * 0.24, 80, 'rgba(255,77,94,0.4)'); x.fillStyle = T.perigo; x.font = fonte('fonteTit', 40); x.textAlign = 'center'; x.fillText('MOTEL', W * 0.5, H * 0.26); x.restore();
  x.strokeStyle = O12.metal; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.5, H * 0.3); x.lineTo(W * 0.5, H * 0.4); x.stroke();
  // portas numeradas
  for (let i = 0; i < 4; i++) { const dx = W * (0.1 + i * 0.22); x.fillStyle = O12.madeira; x.fillRect(dx, H * 0.5, W * 0.1, H * 0.3); x.fillStyle = T.acento; x.font = fonte('fonteTxt', 18); x.textAlign = 'center'; x.fillText(String(i + 1), dx + W * 0.05, H * 0.56); if (i === 1) { glow(dx + W * 0.05, H * 0.62, 30, 'rgba(255,209,102,0.3)'); } }
  // maquina de gelo
  x.fillStyle = O12.metal; x.fillRect(W * 0.9, H * 0.56, W * 0.08, H * 0.24); x.fillStyle = T.destaque; x.font = fonte('fonteTxt', 12); x.fillText('ICE', W * 0.94, H * 0.6);
  // carro estacionado
  x.fillStyle = '#2a3036'; x.fillRect(W * 0.3, H * 0.84, W * 0.2, H * 0.08); x.fillRect(W * 0.35, H * 0.8, W * 0.1, H * 0.05); x.fillStyle = O12.preto; x.beginPath(); x.arc(W * 0.35, H * 0.92, 10, 0, 7); x.arc(W * 0.45, H * 0.92, 10, 0, 7); x.fill();
  x.font = fonte('fonteTxt', 14); x.textAlign = 'left';
  p12_hud(t, 1);
};

// f_garagem: estacionamento subterraneo, pilares numerados, luz piscando, carro com alarme. p={alarme}
COMP.f_garagem = (t, lt, p) => {
  const T = TF(); fundoFlat('#222a30', '#0a1014');
  x.fillStyle = O12.asfalto; x.fillRect(0, H * 0.7, W, H * 0.3);
  x.fillStyle = '#12181c'; x.fillRect(0, 0, W, H * 0.12); // teto baixo
  // pilares numerados
  for (let i = 0; i < 4; i++) { const px = W * (0.08 + i * 0.28); x.fillStyle = O12.concreto; x.fillRect(px, H * 0.12, W * 0.08, H * 0.58); x.fillStyle = T.acento; x.fillRect(px, H * 0.4, W * 0.08, 16); x.fillStyle = O12.concretoEsc; x.font = fonte('fonteTit', 20); x.textAlign = 'center'; x.fillText(String(String.fromCharCode(65 + i)) + (i + 1), px + W * 0.04, H * 0.43 + 4); }
  // luz piscando
  const pisca = Math.sin(t * 15) > 0 ? 1 : 0.25; x.save(); x.globalAlpha = 0.4 * pisca; glow(W * 0.5, H * 0.14, 150, 'rgba(230,241,242,0.4)'); x.restore();
  // carro com alarme (faróis piscando)
  const al = p.alarme ? (Math.sin(t * 8) > 0 ? 1 : 0.1) : 0.3; x.fillStyle = '#2a3036'; x.fillRect(W * 0.4, H * 0.6, W * 0.22, H * 0.1); x.fillRect(W * 0.45, H * 0.54, W * 0.12, H * 0.06);
  x.save(); x.globalAlpha = al; x.fillStyle = p.alarme ? T.perigo : T.acento; x.beginPath(); x.arc(W * 0.41, H * 0.64, 6, 0, 7); x.arc(W * 0.61, H * 0.64, 6, 0, 7); x.fill(); if (p.alarme) glow(W * 0.5, H * 0.62, 90, 'rgba(255,77,94,0.25)'); x.restore();
  x.fillStyle = O12.preto; x.beginPath(); x.arc(W * 0.45, H * 0.7, 10, 0, 7); x.arc(W * 0.57, H * 0.7, 10, 0, 7); x.fill();
  x.font = fonte('fonteTxt', 14); x.textAlign = 'left';
  p12_hud(t, 0);
};

// f_mercado_noite: supermercado 24h vazio, corredores, freezer, alto-falante, carrinho andando sozinho.
COMP.f_mercado_noite = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a3036', '#141a1e');
  x.fillStyle = '#12181c'; x.fillRect(0, 0, W, H * 0.1);
  x.fillStyle = '#3a424a'; x.fillRect(0, H * 0.82, W, H * 0.18); // piso
  // luzes fluorescentes no teto
  for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(230,241,242,0.5)'; x.fillRect(W * (0.1 + i * 0.25), H * 0.06, W * 0.12, 6); glow(W * (0.16 + i * 0.25), H * 0.08, 60, 'rgba(230,241,242,0.2)'); }
  // prateleiras / corredores
  for (let i = 0; i < 3; i++) { const sx = W * (0.14 + i * 0.3); x.fillStyle = O12.metal; x.fillRect(sx, H * 0.3, W * 0.14, H * 0.5); for (let r = 0; r < 4; r++) { x.fillStyle = [T.destaque, T.acento, T.perigo, '#8aa'][r % 4]; x.globalAlpha = 0.5; x.fillRect(sx + 6, H * (0.34 + r * 0.11), W * 0.12, 10); x.globalAlpha = 1; } }
  // freezer (vidro ciano)
  x.fillStyle = 'rgba(79,227,255,0.12)'; x.fillRect(W * 0.78, H * 0.3, W * 0.16, H * 0.5); x.strokeStyle = T.destaque; x.lineWidth = 2; x.strokeRect(W * 0.78, H * 0.3, W * 0.16, H * 0.5);
  // carrinho andando sozinho
  const cx = W * (0.2 + 0.5 * ((t * 0.08) % 1)); x.strokeStyle = O12.branco; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, H * 0.78); x.lineTo(cx + 30, H * 0.78); x.lineTo(cx + 24, H * 0.68); x.lineTo(cx - 6, H * 0.68); x.closePath(); x.stroke(); x.fillStyle = O12.metalEsc; x.beginPath(); x.arc(cx + 4, H * 0.82, 5, 0, 7); x.arc(cx + 24, H * 0.82, 5, 0, 7); x.fill();
  p12_hud(t, 1);
};

// f_cabana: cabana na neve, janela acesa, lareira, pegadas que chegam a porta. p={pegadas}
COMP.f_cabana = (t, lt, p) => {
  const T = TF(); ceuFlat('estrelas', t);
  // neve no chao
  x.fillStyle = O12.neve; x.beginPath(); x.moveTo(0, H * 0.72); x.quadraticCurveTo(W * 0.5, H * 0.68, W, H * 0.72); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // cabana
  x.fillStyle = O12.madeira; x.fillRect(W * 0.3, H * 0.42, W * 0.4, H * 0.32);
  x.fillStyle = '#2a2018'; x.beginPath(); x.moveTo(W * 0.26, H * 0.42); x.lineTo(W * 0.5, H * 0.28); x.lineTo(W * 0.74, H * 0.42); x.fill();
  x.fillStyle = O12.neve; x.beginPath(); x.moveTo(W * 0.28, H * 0.4); x.lineTo(W * 0.5, H * 0.29); x.lineTo(W * 0.72, H * 0.4); x.lineTo(W * 0.68, H * 0.42); x.lineTo(W * 0.32, H * 0.42); x.fill(); // neve no telhado
  // janela acesa + lareira (brilho quente)
  glow(W * 0.42, H * 0.56, 50, 'rgba(255,209,102,0.4)'); x.fillStyle = T.acento; x.fillRect(W * 0.38, H * 0.5, W * 0.08, H * 0.1);
  // chamine com fumaca
  x.fillStyle = '#2a2018'; x.fillRect(W * 0.6, H * 0.3, W * 0.04, H * 0.1); if (typeof fxFumaca === 'function') fxFumaca(W * 0.62, H * 0.3, t, 0.4);
  // porta
  x.fillStyle = '#2a2018'; x.fillRect(W * 0.56, H * 0.56, W * 0.08, H * 0.18);
  // pegadas chegando a porta
  if (p.pegadas) { x.fillStyle = O12.neveEsc; for (let i = 0; i < 8; i++) { const u = i / 8; const fx = W * (0.1 + u * 0.48); const fy = H * (0.92 - u * 0.16); x.beginPath(); x.ellipse(fx, fy, 8, 4, 0, 0, 7); x.fill(); } }
  p12_hud(t, 0);
};

// f_farol: farol na costa a noite, feixe girando, ondas, barco ao longe. p={barco}
COMP.f_farol = (t, lt, p) => {
  const T = TF(); ceuFlat('estrelas', t);
  // mar
  x.fillStyle = '#0c2630'; x.fillRect(0, H * 0.62, W, H * 0.38);
  x.strokeStyle = 'rgba(159,182,191,0.2)'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { const yy = H * (0.66 + i * 0.06); x.beginPath(); for (let xx = 0; xx <= W; xx += 30) { if (xx === 0) x.moveTo(0, yy); else x.lineTo(xx, yy + Math.sin(xx * 0.03 + t + i) * 4); } x.stroke(); }
  // rocha + farol
  x.fillStyle = O12.concretoEsc; x.beginPath(); x.moveTo(W * 0.1, H); x.lineTo(W * 0.2, H * 0.62); x.lineTo(W * 0.38, H * 0.62); x.lineTo(W * 0.46, H); x.fill();
  x.fillStyle = O12.branco; x.beginPath(); x.moveTo(W * 0.26, H * 0.62); x.lineTo(W * 0.29, H * 0.24); x.lineTo(W * 0.35, H * 0.24); x.lineTo(W * 0.38, H * 0.62); x.fill();
  x.fillStyle = T.perigo; x.fillRect(W * 0.28, H * 0.4, W * 0.08, 16); x.fillRect(W * 0.28, H * 0.52, W * 0.08, 16);
  // lanterna do farol + feixe girando
  x.fillStyle = T.acento; x.fillRect(W * 0.29, H * 0.2, W * 0.06, H * 0.05); glow(W * 0.32, H * 0.22, 40, 'rgba(255,209,102,0.5)');
  const ang = t * 0.6; x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.14; x.translate(W * 0.32, H * 0.22); x.rotate(Math.sin(ang) * 0.6 - 0.3); x.fillStyle = 'rgba(255,209,102,1)'; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, -H * 0.1); x.lineTo(W, H * 0.1); x.fill(); x.restore();
  // barco ao longe
  if (p.barco) { x.fillStyle = O12.preto; x.beginPath(); x.moveTo(W * 0.7, H * 0.66); x.lineTo(W * 0.78, H * 0.66); x.lineTo(W * 0.76, H * 0.69); x.lineTo(W * 0.72, H * 0.69); x.fill(); x.fillRect(W * 0.735, H * 0.6, 3, H * 0.06); glow(W * 0.74, H * 0.62, 14, 'rgba(255,209,102,0.3)'); }
  p12_hud(t, 1);
};

// f_estrada_nevoa: estrada reta com nevoa, farois, placa de milha, figura no acostamento.
COMP.f_estrada_nevoa = (t, lt, p) => {
  const T = TF(); fundoFlat(T.fundo1, T.fundo2, [0.5, 0.3, 500]);
  // estrada em perspectiva
  x.fillStyle = O12.asfalto; x.beginPath(); x.moveTo(W * 0.44, H * 0.4); x.lineTo(W * 0.56, H * 0.4); x.lineTo(W * 0.9, H); x.lineTo(W * 0.1, H); x.fill();
  // faixa central tracejada
  x.fillStyle = T.acento; for (let i = 0; i < 6; i++) { const u = i / 6; const yy = H * (0.44 + u * 0.56); const w = 4 + u * 16; x.fillRect(W * 0.5 - w / 2, yy, w, 10 + u * 20); }
  // farois vindo (dois pontos de luz)
  glow(W * 0.47, H * 0.42, 30, 'rgba(255,209,102,0.3)'); glow(W * 0.53, H * 0.42, 30, 'rgba(255,209,102,0.3)'); x.fillStyle = T.acento; x.beginPath(); x.arc(W * 0.47, H * 0.42, 5, 0, 7); x.arc(W * 0.53, H * 0.42, 5, 0, 7); x.fill();
  // placa de milha
  x.fillStyle = '#1a3a2a'; x.fillRect(W * 0.78, H * 0.44, W * 0.1, H * 0.08); x.fillStyle = O12.branco; x.font = fonte('fonteTxt', 16); x.textAlign = 'center'; x.fillText('MILE 0', W * 0.83, H * 0.49); x.fillStyle = O12.metal; x.fillRect(W * 0.825, H * 0.52, 6, H * 0.12);
  // figura no acostamento
  x.fillStyle = O12.preto; x.beginPath(); x.moveTo(W * 0.14, H * 0.9); x.lineTo(W * 0.18, H * 0.9); x.lineTo(W * 0.17, H * 0.7); x.lineTo(W * 0.15, H * 0.7); x.fill(); x.beginPath(); x.arc(W * 0.16, H * 0.68, 8, 0, 7); x.fill();
  x.font = fonte('fonteTxt', 14); x.textAlign = 'left';
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.7, 0.5);
  p12_hud(t, 1);
};

// f_lago_gelado: lago congelado com rachaduras, algo embaixo do gelo. p={racha:0..1}
COMP.f_lago_gelado = (t, lt, p) => {
  const T = TF(); ceuFlat('boreal', t);
  // margem nevada
  x.fillStyle = O12.neve; x.fillRect(0, H * 0.4, W, H * 0.12);
  // superficie de gelo
  x.fillStyle = '#9fc4cc'; x.fillRect(0, H * 0.5, W, H * 0.5);
  x.fillStyle = 'rgba(79,227,255,0.1)'; x.fillRect(0, H * 0.5, W, H * 0.5);
  // algo embaixo do gelo (sombra)
  const sub = 0.3 + 0.2 * Math.sin(t * 0.8); x.save(); x.globalAlpha = sub; x.fillStyle = O12.preto; x.beginPath(); x.ellipse(W * 0.5, H * 0.72, 90, 40, 0, 0, 7); x.fill(); x.save(); x.translate(W * 0.5, H * 0.72); p12_olhosGelo(T, t); x.restore(); x.restore();
  // rachaduras
  const r = rng(p.racha ?? 0, lt); x.strokeStyle = 'rgba(230,241,242,0.7)'; x.lineWidth = 2; if (r > 0.05) { x.save(); x.translate(W * 0.5, H * 0.66); for (let i = 0; i < 6; i++) { const a = i / 6 * 7; x.beginPath(); x.moveTo(0, 0); let rr = 0; for (let k = 0; k < 5; k++) { rr += 30 * r; x.lineTo(Math.cos(a + Math.sin(k) * 0.3) * rr, Math.sin(a + Math.sin(k) * 0.3) * rr); } x.stroke(); } x.restore(); }
  p12_hud(t, 0);
};

// olhos sob o gelo (helper local)
function p12_olhosGelo(T, t) { const b = 0.4 + 0.4 * Math.sin(t * 2); x.globalAlpha = b; x.fillStyle = T.destaque; x.beginPath(); x.arc(-14, 0, 5, 0, 7); x.arc(14, 0, 5, 0, 7); x.fill(); }
