// Pacote 10 (10-hm-lugares). Hora Muerta: lugares de lenda. Paleta padrao HM (violeta). Regras: KIRO-PROMPT.md secao C.
// Placas em espanhol. Cores TF() + neutras. ceuFlat('noite'/'estrelas') ja desenha a lua: nao somar luaFlat por cima.
//   f_rio f_carretera f_hacienda f_iglesia f_escuela f_milpa f_selva f_puente f_pozo f_feria f_cerro f_estacion f_panaderia

const O10 = {
  terra: '#4a3828', terraEsc: '#2e2214', pedra: '#6a6a74', pedraEsc: '#3a3a44', madeira: '#5a4030', madeiraEsc: '#352414',
  parede: '#3a2f4a', paredeEsc: '#241c33', agua: '#2a3a5a', aguaEsc: '#16233a', mato: '#2a3a28', matoEsc: '#17231a',
  creme: '#efe4cc', metal: '#8a8a92', vela: '#f6b24a', vermelho: '#d6354a', neon: '#f6b24a', ferro: '#52525c', noite: '#2a1f3d' };

// chao reutilizavel
const p10_chao = (c, y) => { x.fillStyle = c; x.fillRect(0, H * y, W, H * (1 - y)); };

// f_rio: beira de rio, pedra, lua refletida, mulher de costas (cabelo longo), nevoa baixa. p={vira:0..1}
COMP.f_rio = (t, lt, p) => {
  ceuFlat('noite', t);
  // agua
  x.fillStyle = O10.agua; x.fillRect(0, H * 0.58, W, H * 0.3);
  x.fillStyle = O10.aguaEsc; x.fillRect(0, H * 0.82, W, H * 0.06);
  // lua refletida tremendo (logo abaixo da lua, sutil)
  if (typeof glow === 'function') glow(W * 0.76, H * 0.62, 44, 'rgba(240,235,200,0.2)');
  x.fillStyle = 'rgba(240,235,200,0.25)'; for (let i = 0; i < 4; i++) { const yy = H * (0.6 + i * 0.03); x.beginPath(); x.ellipse(W * 0.76 + Math.sin(t * 2 + i) * 6, yy, 26 - i * 4, 3, 0, 0, 7); x.fill(); }
  // margem
  p10_chao(O10.matoEsc, 0.88);
  // pedra
  x.fillStyle = O10.pedra; x.beginPath(); x.ellipse(W * 0.2, H * 0.86, 70, 34, 0, 0, 7); x.fill();
  x.fillStyle = O10.pedraEsc; x.beginPath(); x.ellipse(W * 0.2, H * 0.9, 70, 20, 0, 0, 7); x.fill();
  // mulher de costas, cabelo longo (sem rosto quando de costas)
  const v = rng(p.vira ?? 0, lt);
  x.save(); x.translate(W * 0.52, H * 0.66); const es = 1.5;
  x.fillStyle = O10.creme; x.beginPath(); x.moveTo(-34 * es, 0); x.lineTo(34 * es, 0); x.lineTo(24 * es, 160 * es); x.lineTo(-24 * es, 160 * es); x.fill(); // vestido branco
  x.fillStyle = '#efe9dc'; x.beginPath(); x.arc(0, -14 * es, 22 * es, 0, 7); x.fill(); // cabeca
  x.fillStyle = '#1a1420'; x.beginPath(); x.moveTo(-22 * es, -24 * es); x.quadraticCurveTo(-30 * es, 70 * es, -14 * es, 110 * es); x.lineTo(14 * es, 110 * es); x.quadraticCurveTo(30 * es, 70 * es, 22 * es, -24 * es); x.quadraticCurveTo(0, -4 * es, -22 * es, -24 * es); x.fill(); // cabelo longo cobrindo
  if (v > 0.5) { x.fillStyle = 'rgba(0,0,0,0.6)'; x.beginPath(); x.arc(0, -14 * es, 20 * es, 0, 7); x.fill(); } // ao virar, rosto em sombra (sem sangue)
  x.restore();
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.5, 0.82);
};

// f_carretera: estrada de terra de lado, veiculo, postes, morros, olhos no mato. p={veiculo,ojos}
COMP.f_carretera = (t, lt, p) => {
  ceuFlat('estrelas', t);
  // morros
  x.fillStyle = O10.paredeEsc; x.beginPath(); x.moveTo(0, H * 0.6); x.quadraticCurveTo(W * 0.3, H * 0.48, W * 0.6, H * 0.6); x.quadraticCurveTo(W * 0.8, H * 0.5, W, H * 0.58); x.lineTo(W, H * 0.7); x.lineTo(0, H * 0.7); x.fill();
  // estrada de terra
  x.fillStyle = O10.terra; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.3, H * 0.66); x.lineTo(W * 0.7, H * 0.66); x.lineTo(W, H); x.fill();
  x.strokeStyle = O10.terraEsc; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.5, H * 0.66); x.lineTo(W * 0.5, H); x.stroke();
  // postes
  for (let i = 0; i < 3; i++) { const px = W * (0.18 + i * 0.3), py = H * (0.66 - i * 0.03); x.strokeStyle = O10.madeiraEsc; x.lineWidth = 6; x.beginPath(); x.moveTo(px, py); x.lineTo(px, py - 90 + i * 18); x.stroke(); }
  // veiculo
  const veh = p.veiculo || 'autobus';
  x.save(); x.translate(W * 0.5, H * 0.78);
  if (veh === 'autobus') { x.fillStyle = '#c9a23a'; x.fillRect(-90, -70, 180, 70); x.fillStyle = O10.noite; x.fillRect(-80, -58, 160, 34); x.fillStyle = '#1a1a1a'; x.beginPath(); x.arc(-54, 6, 16, 0, 7); x.arc(54, 6, 16, 0, 7); x.fill(); glow(0, -30, 60, 'rgba(246,200,90,0.3)'); }
  else if (veh === 'camioneta') { x.fillStyle = '#5a6a7a'; x.fillRect(-80, -50, 90, 50); x.fillRect(-20, -70, 60, 70); x.fillStyle = '#1a1a1a'; x.beginPath(); x.arc(-50, 6, 15, 0, 7); x.arc(30, 6, 15, 0, 7); x.fill(); }
  else if (veh === 'bicicleta') { x.strokeStyle = O10.metal; x.lineWidth = 5; x.beginPath(); x.arc(-26, -10, 22, 0, 7); x.arc(26, -10, 22, 0, 7); x.stroke(); if (typeof figura === 'function') figura(0, 0, 0.5, { figurino: 'campesino', pose: 'parado' }, t); }
  else { if (typeof figura === 'function') figura(0, 4, 0.7, { figurino: 'campesino', pose: 'andando' }, t); }
  x.restore();
  // olhos no mato
  if (p.ojos) { x.fillStyle = '#ffd24a'; const b = 0.5 + 0.5 * Math.sin(t * 3); x.globalAlpha = 0.6 + 0.4 * b; x.beginPath(); x.arc(W * 0.12, H * 0.6, 6, 0, 7); x.arc(W * 0.16, H * 0.6, 6, 0, 7); x.fill(); x.globalAlpha = 1; }
};

// f_hacienda: fazenda abandonada, portao de ferro, patio com fonte seca, arcos, janela acesa no alto.
COMP.f_hacienda = (t, lt, p) => {
  ceuFlat('noite', t);
  p10_chao('#2e2a30', 0.7);
  // muro com arcos
  x.fillStyle = O10.parede; x.fillRect(W * 0.06, H * 0.3, W * 0.88, H * 0.42);
  x.fillStyle = O10.paredeEsc; for (let i = 0; i < 4; i++) { const ax = W * (0.12 + i * 0.2); x.beginPath(); x.moveTo(ax, H * 0.72); x.lineTo(ax, H * 0.5); x.arc(ax + W * 0.07, H * 0.5, W * 0.07, Math.PI, 0); x.lineTo(ax + W * 0.14, H * 0.72); x.fill(); }
  // janela acesa no alto
  x.fillStyle = O10.vela; glow(W * 0.78, H * 0.38, 50, 'rgba(246,178,74,0.35)'); x.fillRect(W * 0.74, H * 0.34, W * 0.08, H * 0.1);
  // portao de ferro
  x.strokeStyle = O10.ferro; x.lineWidth = 6; for (let i = 0; i < 6; i++) { const gx = W * (0.4 + i * 0.035); x.beginPath(); x.moveTo(gx, H * 0.56); x.lineTo(gx, H * 0.72); x.stroke(); } x.strokeRect(W * 0.4, H * 0.56, W * 0.21, H * 0.16);
  // fonte seca
  x.fillStyle = O10.pedra; x.beginPath(); x.ellipse(W * 0.26, H * 0.82, 90, 30, 0, 0, 7); x.fill(); x.fillStyle = O10.pedraEsc; x.beginPath(); x.ellipse(W * 0.26, H * 0.8, 60, 18, 0, 0, 7); x.fill(); x.fillStyle = O10.pedra; x.fillRect(W * 0.25, H * 0.68, 20, H * 0.12);
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.4, 0.78);
};

// f_iglesia: igreja por dentro a noite, santos, velas, confessionario. p={confesion}
COMP.f_iglesia = (t, lt, p) => {
  fundoFlat('#2a2238', '#160f24', [0.5, 0.2, 500]);
  // colunas / arco gotico
  x.fillStyle = O10.paredeEsc; x.beginPath(); x.moveTo(W * 0.5, H * 0.08); x.lineTo(W * 0.2, H * 0.3); x.lineTo(W * 0.2, H); x.lineTo(W * 0.8, H); x.lineTo(W * 0.8, H * 0.3); x.fill();
  // vitral
  x.fillStyle = '#4a3a6a'; x.beginPath(); x.arc(W * 0.5, H * 0.26, 54, Math.PI, 0); x.fill(); glow(W * 0.5, H * 0.24, 60, 'rgba(120,90,200,0.3)');
  for (let i = 0; i < 3; i++) { x.fillStyle = [O10.vermelho, '#6a9ad6', O10.vela][i]; x.beginPath(); x.arc(W * 0.5, H * 0.26, 54, Math.PI + i * 1.04, Math.PI + (i + 1) * 1.04); x.lineTo(W * 0.5, H * 0.26); x.fill(); }
  // santos (nichos) — figura em manto
  for (let i = 0; i < 2; i++) { const nx = W * (0.26 + i * 0.48); x.fillStyle = '#1a1424'; x.beginPath(); x.moveTo(nx - 30, H * 0.6); x.lineTo(nx - 30, H * 0.4); x.arc(nx, H * 0.4, 30, Math.PI, 0); x.lineTo(nx + 30, H * 0.6); x.fill();
    // manto (corpo cheio)
    x.fillStyle = '#6a5a8a'; x.beginPath(); x.moveTo(nx - 18, H * 0.6); x.lineTo(nx - 22, H * 0.46); x.quadraticCurveTo(nx, H * 0.42, nx + 22, H * 0.46); x.lineTo(nx + 18, H * 0.6); x.fill();
    // cabeca + auréola
    x.fillStyle = O10.vela; x.globalAlpha = 0.4; x.beginPath(); x.arc(nx, H * 0.445, 16, 0, 7); x.fill(); x.globalAlpha = 1;
    x.fillStyle = O10.creme; x.beginPath(); x.arc(nx, H * 0.46, 11, 0, 7); x.fill(); }
  // bancos
  for (let i = 0; i < 3; i++) { x.fillStyle = O10.madeiraEsc; x.fillRect(W * 0.28, H * (0.72 + i * 0.08), W * 0.44, 14); }
  // velas
  if (typeof velaFlat === 'function') { velaFlat(W * 0.34, H * 0.64, 0.7, 1, t); velaFlat(W * 0.66, H * 0.64, 0.7, 1, t); }
  // confessionario
  if (p.confesion) { x.fillStyle = O10.madeira; x.fillRect(W * 0.06, H * 0.5, W * 0.14, H * 0.42); x.fillStyle = '#1a1420'; x.fillRect(W * 0.09, H * 0.56, W * 0.08, H * 0.2); const s = 0.4 + 0.3 * Math.sin(t); x.fillStyle = 'rgba(0,0,0,' + (0.5 * s) + ')'; x.beginPath(); x.arc(W * 0.13, H * 0.64, 14, 0, 7); x.fill(); }
};

// f_escuela: sala de aula a noite, carteiras, quadro com giz escrevendo sozinho. p={escrito}
COMP.f_escuela = (t, lt, p) => {
  fundoFlat(O10.parede, O10.paredeEsc);
  p10_chao('#2e2824', 0.78);
  // quadro
  x.fillStyle = '#1a2a22'; x.fillRect(W * 0.3, H * 0.18, W * 0.4, H * 0.26); x.strokeStyle = O10.madeira; x.lineWidth = 8; x.strokeRect(W * 0.3, H * 0.18, W * 0.4, H * 0.26);
  // giz escrevendo sozinho (linhas aparecem com o tempo)
  const n = Math.floor(rng(p.escrito ?? 0, lt) * 4);
  x.strokeStyle = O10.creme; x.lineWidth = 3; for (let i = 0; i < n; i++) { const yy = H * (0.24 + i * 0.05); x.beginPath(); x.moveTo(W * 0.34, yy); x.lineTo(W * (0.34 + 0.28 * (0.4 + 0.6 * ((i * 7) % 5) / 5)), yy); x.stroke(); }
  // gizinho que se move
  const gx = W * 0.34 + (W * 0.3) * ((t * 0.3) % 1); x.fillStyle = O10.creme; x.fillRect(gx, H * (0.24 + Math.min(n, 3) * 0.05), 8, 8);
  // carteiras em fileira
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const dx = W * (0.22 + c * 0.28), dy = H * (0.58 + r * 0.16); x.fillStyle = O10.madeira; x.fillRect(dx, dy, 70, 12); x.fillStyle = O10.madeiraEsc; x.fillRect(dx + 6, dy + 12, 8, 40); x.fillRect(dx + 56, dy + 12, 8, 40); }
};

// f_milpa: milharal a noite com espantalho, lua, trilha. p={mueve}
COMP.f_milpa = (t, lt, p) => {
  ceuFlat('noite', t);
  p10_chao(O10.terraEsc, 0.66);
  // trilha
  x.fillStyle = O10.terra; x.beginPath(); x.moveTo(W * 0.46, H * 0.66); x.lineTo(W * 0.54, H * 0.66); x.lineTo(W * 0.66, H); x.lineTo(W * 0.34, H); x.fill();
  // milho (talos)
  x.strokeStyle = O10.matoEsc; x.lineWidth = 5; for (let i = 0; i < 20; i++) { const sx = (i * 53 % W); const sy = H * (0.66 + (i % 3) * 0.02); const h = 90 + (i % 4) * 20; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.sin(t + i) * 6, sy - h); x.stroke(); x.fillStyle = '#4a5a2a'; x.beginPath(); x.ellipse(sx, sy - h, 7, 20, 0.2, 0, 7); x.fill(); }
  // espantalho
  const m = rng(p.mueve ?? 0, lt); x.save(); x.translate(W * 0.5, H * 0.52); x.rotate(Math.sin(t * 1.5) * 0.06 * m);
  x.strokeStyle = O10.madeira; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 120); x.moveTo(-50, 30); x.lineTo(50, 30); x.stroke();
  x.fillStyle = '#b89050'; x.beginPath(); x.arc(0, -16, 20, 0, 7); x.fill(); x.fillStyle = O10.madeiraEsc; x.beginPath(); x.moveTo(-28, -28); x.lineTo(28, -28); x.lineTo(0, -46); x.fill(); // chapeu
  x.fillStyle = '#1a1420'; x.beginPath(); x.arc(-7, -18, 3, 0, 7); x.arc(7, -18, 3, 0, 7); x.fill();
  x.restore();
};

// f_selva: mata fechada, cipos, rio, patasola (vulto de uma perna so). p={patasola}
COMP.f_selva = (t, lt, p) => {
  fundoFlat('#14241a', '#081209', [0.3, 0.2, 400]);
  // rio ao fundo
  x.fillStyle = O10.aguaEsc; x.fillRect(W * 0.3, H * 0.52, W * 0.4, H * 0.12);
  // arvores altas
  for (let i = 0; i < 5; i++) { const tx = W * (0.05 + i * 0.22); x.fillStyle = i % 2 ? O10.matoEsc : '#1a2a18'; x.fillRect(tx, 0, W * 0.1, H); }
  // cipos
  x.strokeStyle = '#2a3a22'; x.lineWidth = 4; for (let i = 0; i < 6; i++) { const cx = W * (0.1 + i * 0.16); x.beginPath(); x.moveTo(cx, 0); for (let yy = 0; yy <= H * 0.6; yy += 30) x.lineTo(cx + Math.sin(yy * 0.02 + i) * 20, yy); x.stroke(); }
  // patasola: vulto escuro com uma perna so
  if (p.patasola) { x.save(); x.translate(W * 0.5, H * 0.6); x.fillStyle = '#0a1008'; x.beginPath(); x.moveTo(-26, 0); x.lineTo(26, 0); x.lineTo(14, 120); x.lineTo(-6, 120); x.fill(); x.fillStyle = '#0a1008'; x.beginPath(); x.arc(0, -16, 20, 0, 7); x.fill(); x.fillStyle = '#d6354a'; x.beginPath(); x.arc(-7, -18, 4, 0, 7); x.arc(7, -18, 4, 0, 7); x.fill(); x.restore(); }
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.4, 0.8);
};

// f_puente: ponte de pedra sobre barranco, nevoa, figura no meio. p={figura}
COMP.f_puente = (t, lt, p) => {
  ceuFlat('noite', t);
  // barranco (abismo)
  x.fillStyle = '#0c0a14'; x.fillRect(0, H * 0.5, W, H * 0.5);
  // ponte de pedra em arco
  x.fillStyle = O10.pedra; x.fillRect(0, H * 0.5, W, H * 0.1);
  x.fillStyle = '#1a1620'; x.beginPath(); x.arc(W * 0.5, H * 0.6, W * 0.22, Math.PI, 0); x.fill();
  // parapeito
  x.fillStyle = O10.pedraEsc; for (let i = 0; i < 10; i++) x.fillRect(W * (i * 0.1), H * 0.46, W * 0.03, 30);
  // figura no meio
  if (p.figura && typeof figura === 'function') figura(W * 0.5, H * 0.5, 0.6, { figurino: 'encapuchado', pose: 'parado' }, t);
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.6, 0.6);
};

// f_pozo: poco de pedra no quintal, balde, mao saindo. p={mano:0..1}
COMP.f_pozo = (t, lt, p) => {
  ceuFlat('estrelas', t);
  p10_chao('#2e2a26', 0.66);
  // poco
  x.fillStyle = O10.pedra; x.beginPath(); x.ellipse(W * 0.5, H * 0.72, 120, 46, 0, 0, 7); x.fill();
  x.fillStyle = '#0a0812'; x.beginPath(); x.ellipse(W * 0.5, H * 0.72, 92, 32, 0, 0, 7); x.fill();
  x.fillStyle = O10.pedraEsc; x.fillRect(W * 0.5 - 118, H * 0.72, 236, H * 0.18);
  // teto do poco
  x.strokeStyle = O10.madeira; x.lineWidth = 8; x.beginPath(); x.moveTo(W * 0.38, H * 0.72); x.lineTo(W * 0.38, H * 0.5); x.moveTo(W * 0.62, H * 0.72); x.lineTo(W * 0.62, H * 0.5); x.stroke();
  x.fillStyle = O10.madeiraEsc; x.beginPath(); x.moveTo(W * 0.34, H * 0.5); x.lineTo(W * 0.66, H * 0.5); x.lineTo(W * 0.5, H * 0.42); x.fill();
  // balde
  x.fillStyle = O10.metal; x.fillRect(W * 0.49, H * 0.56, 30, 24);
  // mao saindo
  const man = rng(p.mano ?? 0, lt); if (man > 0.05) { x.save(); x.translate(W * 0.5, H * 0.72 - 40 * man); x.fillStyle = '#c9bfae'; for (let f = 0; f < 4; f++) { x.fillRect(-16 + f * 8, 0, 6, -28 * man); } x.fillRect(-18, 0, 36, 18); x.restore(); }
};

// f_feria: parque abandonado, roda-gigante parada, carrossel que gira sozinho. p={gira}
COMP.f_feria = (t, lt, p) => {
  ceuFlat('noite', t);
  p10_chao('#2a242e', 0.74);
  // roda-gigante
  x.save(); x.translate(W * 0.28, H * 0.5); x.strokeStyle = O10.ferro; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 150, 0, 7); x.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * 7; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 150, Math.sin(a) * 150); x.stroke(); x.fillStyle = [O10.vermelho, O10.vela, '#6a9ad6'][i % 3]; x.fillRect(Math.cos(a) * 150 - 12, Math.sin(a) * 150 - 8, 24, 20); }
  x.fillStyle = O10.ferro; x.beginPath(); x.arc(0, 0, 14, 0, 7); x.fill(); x.restore();
  // carrossel que gira sozinho
  const g = rng(p.gira ?? 0, lt); x.save(); x.translate(W * 0.72, H * 0.62); x.rotate(t * 0.5 * g);
  x.fillStyle = '#4a3a5a'; x.beginPath(); x.moveTo(-90, -40); x.lineTo(90, -40); x.lineTo(0, -90); x.fill(); // teto conico
  for (let i = 0; i < 4; i++) { const a = i / 4 * 7 + t * 0.5 * g; x.fillStyle = O10.creme; x.fillRect(Math.cos(a) * 70 - 8, -40, 8, 60); x.fillStyle = '#b89050'; x.beginPath(); x.ellipse(Math.cos(a) * 70, 10, 16, 24, 0, 0, 7); x.fill(); }
  x.restore();
  if (typeof glow === 'function') glow(W * 0.72, H * 0.62, 80, 'rgba(246,178,74,0.15)');
};

// f_cerro: morro com cruz no topo, caminho de procissao com velas.
COMP.f_cerro = (t, lt, p) => {
  ceuFlat('noite', t);
  // morro
  x.fillStyle = O10.paredeEsc; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.5, H * 0.2); x.lineTo(W, H); x.fill();
  x.fillStyle = '#1a1424'; x.beginPath(); x.moveTo(W * 0.1, H); x.lineTo(W * 0.5, H * 0.24); x.lineTo(W * 0.9, H); x.fill();
  // cruz no topo
  x.strokeStyle = O10.madeira; x.lineWidth = 10; x.beginPath(); x.moveTo(W * 0.5, H * 0.1); x.lineTo(W * 0.5, H * 0.26); x.moveTo(W * 0.45, H * 0.16); x.lineTo(W * 0.55, H * 0.16); x.stroke();
  if (typeof glow === 'function') glow(W * 0.5, H * 0.14, 50, 'rgba(246,178,74,0.2)');
  // caminho de procissao com velas (zigue-zague)
  for (let i = 0; i < 7; i++) { const u = i / 7; const cx = W * (0.5 + Math.sin(i * 1.3) * 0.12 * (1 - u)); const cy = H * (0.9 - u * 0.6); if (typeof velaFlat === 'function') velaFlat(cx, cy, 0.4 + u * 0.3, 1, t); }
};

// f_estacion: estacao de trem de povoado vazia (SEM trem chegando), relogio.
COMP.f_estacion = (t, lt, p) => {
  ceuFlat('noite', t);
  p10_chao('#2a2630', 0.72);
  // telheiro da estacao
  x.fillStyle = O10.madeiraEsc; x.fillRect(W * 0.1, H * 0.28, W * 0.8, H * 0.06);
  x.strokeStyle = O10.madeira; x.lineWidth = 8; for (let i = 0; i < 5; i++) { const px = W * (0.14 + i * 0.18); x.beginPath(); x.moveTo(px, H * 0.34); x.lineTo(px, H * 0.72); x.stroke(); }
  // parede do fundo com janelas
  x.fillStyle = O10.parede; x.fillRect(W * 0.1, H * 0.34, W * 0.8, H * 0.38);
  for (let i = 0; i < 3; i++) { x.fillStyle = O10.noite; x.fillRect(W * (0.2 + i * 0.22), H * 0.42, W * 0.1, H * 0.14); }
  // relogio
  x.fillStyle = O10.creme; x.beginPath(); x.arc(W * 0.5, H * 0.22, 28, 0, 7); x.fill(); x.strokeStyle = '#1a1420'; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.5, H * 0.22); x.lineTo(W * 0.5 + Math.cos(t * 0.3 - 1.57) * 14, H * 0.22 + Math.sin(t * 0.3 - 1.57) * 14); x.moveTo(W * 0.5, H * 0.22); x.lineTo(W * 0.5 + Math.cos(t * 0.02 - 1.57) * 20, H * 0.22 + Math.sin(t * 0.02 - 1.57) * 20); x.stroke();
  // trilhos VAZIOS (sem trem)
  x.strokeStyle = O10.ferro; x.lineWidth = 5; x.beginPath(); x.moveTo(0, H * 0.84); x.lineTo(W, H * 0.84); x.moveTo(0, H * 0.9); x.lineTo(W, H * 0.9); x.stroke();
  for (let i = 0; i < 12; i++) { x.fillStyle = O10.madeiraEsc; x.fillRect(W * (i / 12), H * 0.84, 20, H * 0.06); }
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.35, 0.88);
};

// f_panaderia: padaria de madrugada, forno aceso, pao, padeiro sozinho.
COMP.f_panaderia = (t, lt, p) => {
  fundoFlat('#3a2d22', '#1f1510');
  p10_chao('#2a2018', 0.8);
  // forno aceso
  x.fillStyle = '#2a1e16'; x.fillRect(W * 0.08, H * 0.4, W * 0.3, H * 0.4); x.fillStyle = '#1a1210'; x.beginPath(); x.arc(W * 0.23, H * 0.56, 56, Math.PI, 0); x.fill();
  if (typeof glow === 'function') glow(W * 0.23, H * 0.56, 70, 'rgba(246,120,40,0.4)'); x.fillStyle = 'rgba(246,120,40,0.5)'; x.beginPath(); x.arc(W * 0.23, H * 0.56, 40, Math.PI, 0); x.fill();
  // estantes de pao
  for (let r = 0; r < 2; r++) { x.fillStyle = O10.madeira; x.fillRect(W * 0.5, H * (0.44 + r * 0.16), W * 0.42, 12); for (let i = 0; i < 5; i++) { x.fillStyle = '#c9a060'; x.beginPath(); x.ellipse(W * (0.54 + i * 0.08), H * (0.42 + r * 0.16), 18, 11, 0, 0, 7); x.fill(); } }
  // padeiro sozinho
  if (typeof figura === 'function') figura(W * 0.42, H * 0.92, 0.75, { figurino: 'campesino', pose: 'parado' }, t);
  if (typeof fxFumaca === 'function') fxFumaca(W * 0.23, H * 0.4, t, 0.4);
};
