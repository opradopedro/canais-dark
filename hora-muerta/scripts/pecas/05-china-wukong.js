// Pacote 05 (05-china-wukong). Jornada ao Oeste, paleta china. Regras: KIRO-PROMPT.md secao C.
// Use com "paleta":"china" (e "tema":"mito" no Old Tales). Cores TF() + neutras.
//   personagens: wukong zhuBajie shaWujing tangSanzang reiDragao budaGigante imperadorJade soldadoCeleste
//   dragaoChines(cx,cy,s,o,t) nuvemSalto(cx,cy,s,t)
//   cenas: f_montanha_flores f_cachoeira f_palacio_dragao f_ceu_jade f_pomar_pessegos f_palma_buda
//          f_montanha_preso f_caminho_oeste f_montanha_flamejante

const C5 = { ouro: '#f4c542', ouroEsc: '#c8961a', laca: '#c8372d', jade: '#3fa88b', pele: '#e8c58a', peleW: '#f0c88c',
  madeira: '#7a5230', pedra: '#6a6a72', nuvem: '#f0e8d8', verde: '#4a7a4a', agua: '#3a7a8c', ceu: '#24434a' };

// Sun Wukong: macaco dourado, rosto coracao cor de pessego, faixa dourada, tunica, bastao.
// o = {faixa:true, bastao:true, pose:'parado'|'pula'|'luta'|'senta_nuvem'|'ri'|'preso', expressao, olhar:-1|1, s}
function wukong(cx, base, s, o = {}, t = 0) {
  const ld = o.olhar || 1, pose = o.pose || 'parado';
  const bob = pose === 'pula' ? Math.abs(Math.sin(t * 4)) * 40 : (pose === 'senta_nuvem' ? Math.sin(t * 1.5) * 6 : 0);
  if (pose === 'preso') { // so a cabeca para fora da montanha
    x.save(); x.translate(cx, base); x.scale(s * ld, s);
    p5_cabeca_wukong(0, -10, o, t); x.restore(); return;
  }
  x.save(); x.translate(cx, base - bob); x.scale(s * ld, s);
  x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, 60, 10, 0, 0, 7); x.fill();
  const passo = pose === 'luta' ? Math.sin(t * 8) : 0;
  // cauda
  x.strokeStyle = '#a8763a'; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(-30, -70); x.quadraticCurveTo(-90, -110 + Math.sin(t * 2) * 20, -60, -170); x.stroke();
  // pernas
  x.fillStyle = '#8a5a2a'; x.save(); x.translate(-18, -70); x.rotate(passo * 0.4); x.fillRect(-9, 0, 18, 70); x.restore(); x.save(); x.translate(18, -70); x.rotate(-passo * 0.4); x.fillRect(-9, 0, 18, 70); x.restore();
  // tunica
  x.fillStyle = C5.laca; x.beginPath(); x.moveTo(-40, -190); x.lineTo(40, -190); x.lineTo(48, -70); x.lineTo(-48, -70); x.fill(); x.fillStyle = C5.ouro; x.fillRect(-48, -120, 96, 10);
  // bracos (um com bastao)
  x.fillStyle = '#8a5a2a'; x.save(); x.translate(-40, -176); x.rotate(0.3); x.fillRect(-7, 0, 14, 80); x.restore();
  x.save(); x.translate(40, -176); x.rotate(pose === 'luta' ? -1.2 : -0.3); x.fillStyle = '#8a5a2a'; x.fillRect(-7, 0, 14, 80);
  if (o.bastao !== false) { x.save(); x.translate(0, 70); glow(0, 0, 50, 'rgba(246,178,74,0.3)'); x.strokeStyle = C5.ouro; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, -130); x.lineTo(0, 130); x.stroke(); x.fillStyle = C5.laca; x.fillRect(-7, -130, 14, 12); x.fillRect(-7, 118, 14, 12); x.restore(); }
  x.restore();
  // cabeca
  p5_cabeca_wukong(0, -236, o, t);
  x.restore();
}
function p5_cabeca_wukong(cx, cy, o, t) {
  x.save(); x.translate(cx, cy);
  // orelhas
  x.fillStyle = '#a8763a'; x.beginPath(); x.arc(-44, -6, 16, 0, 7); x.arc(44, -6, 16, 0, 7); x.fill();
  // cabeca peluda
  x.fillStyle = '#a8763a'; x.beginPath(); x.ellipse(0, -6, 48, 50, 0, 0, 7); x.fill();
  // rosto em coracao cor de pessego
  x.fillStyle = C5.peleW; x.beginPath(); x.moveTo(0, 30); x.bezierCurveTo(-42, 20, -40, -34, 0, -22); x.bezierCurveTo(40, -34, 42, 20, 0, 30); x.fill();
  // faixa dourada
  if (o.faixa !== false) { x.strokeStyle = C5.ouro; x.lineWidth = 7; x.beginPath(); x.arc(0, -18, 46, Math.PI * 1.08, Math.PI * 1.92); x.stroke(); x.fillStyle = C5.ouro; x.beginPath(); x.arc(0, -56, 7, 0, 7); x.fill(); }
  // olhos vivos
  const ex = o.expressao || 'ri', pis = (t % 3.2) > 3.08 ? 0.2 : 1;
  x.fillStyle = '#1c1220'; x.beginPath(); x.ellipse(-15, -4, 6, 9 * pis, 0, 0, 7); x.ellipse(15, -4, 6, 9 * pis, 0, 0, 7); x.fill();
  if (pis > 0.5) { x.fillStyle = '#fff'; x.beginPath(); x.arc(-13, -7, 2.4, 0, 7); x.arc(17, -7, 2.4, 0, 7); x.fill(); }
  x.strokeStyle = '#5a2228'; x.lineWidth = 3; x.lineCap = 'round';
  if (ex === 'luta' || ex === 'bravo') { x.beginPath(); x.moveTo(-10, 12); x.lineTo(10, 12); x.stroke(); }
  else { x.beginPath(); x.arc(0, 8, 12, 0.15, Math.PI - 0.15); x.stroke(); } // sorriso
  x.restore();
}

function p5_companheiro(cx, base, s, o, t, corpo, cabeca) {
  const ld = o.olhar || 1; x.save(); x.translate(cx, base); x.scale(s * ld, s);
  x.fillStyle = 'rgba(0,0,0,0.2)'; x.beginPath(); x.ellipse(0, 0, 54, 10, 0, 0, 7); x.fill();
  x.fillStyle = '#2e2622'; x.fillRect(-26, -70, 20, 70); x.fillRect(6, -70, 20, 70);
  x.fillStyle = corpo; x.beginPath(); x.moveTo(-44, -210); x.lineTo(44, -210); x.lineTo(52, -64); x.lineTo(-52, -64); x.fill();
  cabeca(0, -250, t); x.restore();
}
function zhuBajie(cx, base, s, o = {}, t = 0) { p5_companheiro(cx, base, s, o, t, '#5a6b4a', (hx, hy, tt) => { x.save(); x.translate(hx, hy); x.fillStyle = '#d9a0a8'; x.beginPath(); x.ellipse(0, 0, 46, 42, 0, 0, 7); x.fill(); for (const d of [-1, 1]) { x.beginPath(); x.moveTo(d * 30, -34); x.lineTo(d * 46, -56); x.lineTo(d * 14, -42); x.fill(); } x.fillStyle = '#c87f8a'; x.beginPath(); x.ellipse(0, 14, 20, 14, 0, 0, 7); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(-5, 12, 3, 0, 7); x.arc(5, 12, 3, 0, 7); x.fill(); x.beginPath(); x.arc(-14, -6, 4, 0, 7); x.arc(14, -6, 4, 0, 7); x.fill(); x.restore(); }); }
function shaWujing(cx, base, s, o = {}, t = 0) { p5_companheiro(cx, base, s, o, t, '#6a6a72', (hx, hy, tt) => { x.save(); x.translate(hx, hy); x.fillStyle = C5.pele; x.beginPath(); x.ellipse(0, 0, 40, 46, 0, 0, 7); x.fill(); x.fillStyle = '#2e2622'; x.beginPath(); x.ellipse(0, -20, 42, 22, 0, Math.PI, 0); x.fill(); x.fillStyle = '#1c1220'; x.beginPath(); x.ellipse(-14, 2, 4, 6, 0, 0, 7); x.ellipse(14, 2, 4, 6, 0, 0, 7); x.fill(); x.restore(); const r = 40 * (o.s || 1); x.save(); x.translate(hx, hy + 44); x.fillStyle = '#d8d2c2'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(Math.cos(i / 5 * 7) * 30, Math.sin(i / 5 * 7) * 14 + 10, 6, 0, 7); x.fill(); } x.restore(); }); }
function tangSanzang(cx, base, s, o = {}, t = 0) { // monge no cavalo branco
  if (typeof cavalo === 'function') cavalo(cx, base, s * 1.1, { cor: '#e4ddd0', olhar: o.olhar || 1 }, t);
  x.save(); x.translate(cx - 6, base - 150 * s); x.scale(s, s); x.fillStyle = C5.laca; x.beginPath(); x.moveTo(-30, 0); x.lineTo(30, 0); x.lineTo(24, -80); x.lineTo(-24, -80); x.fill(); x.fillStyle = C5.ouro; x.fillRect(-26, -40, 52, 8); x.fillStyle = C5.pele; x.beginPath(); x.ellipse(0, -104, 28, 32, 0, 0, 7); x.fill(); x.fillStyle = C5.ouro; x.strokeStyle = C5.ouroEsc; x.lineWidth = 3; x.beginPath(); x.moveTo(-28, -118); x.lineTo(28, -118); x.lineTo(20, -150); x.lineTo(-20, -150); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#1c1220'; x.beginPath(); x.arc(-9, -104, 3, 0, 7); x.arc(9, -104, 3, 0, 7); x.fill(); x.restore(); }
function reiDragao(cx, base, s, o = {}, t = 0) { p5_companheiro(cx, base, s, o, t, C5.agua, (hx, hy, tt) => { x.save(); x.translate(hx, hy); x.fillStyle = C5.jade; x.beginPath(); x.ellipse(0, 0, 40, 44, 0, 0, 7); x.fill(); x.fillStyle = C5.ouro; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(d * 20, -36); x.lineTo(d * 34, -64); x.lineTo(d * 8, -44); x.fill(); } x.fillStyle = '#1c1220'; x.beginPath(); x.arc(-13, 0, 4, 0, 7); x.arc(13, 0, 4, 0, 7); x.fill(); x.restore(); }); }
function budaGigante(cx, cy, s, o = {}, t = 0) { glow(cx, cy, 240 * s, 'rgba(246,200,80,0.35)'); x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = 'rgba(246,200,120,0.5)'; x.beginPath(); x.moveTo(-120, 160); x.lineTo(120, 160); x.lineTo(70, -40); x.lineTo(-70, -40); x.fill(); x.beginPath(); x.arc(0, -70, 56, 0, 7); x.fill(); x.restore(); }
function imperadorJade(cx, base, s, o = {}, t = 0) { if (typeof figura === 'function') figura(cx, base, s, { figurino: 'imperador_china', olhar: o.olhar }, t); }
function soldadoCeleste(cx, base, s, o = {}, t = 0) { if (typeof figura === 'function') figura(cx, base, s, { figurino: 'soldado_china', arma: 'lanca', roupa: C5.ouro, olhar: o.olhar }, t); }

// dragao chines: corpo longo serpenteando, bigodes, perola. o.voa
function dragaoChines(cx, cy, s, o = {}, t = 0) {
  x.save(); x.translate(cx, cy); x.scale(s, s);
  x.strokeStyle = C5.jade; x.lineWidth = 26; x.lineCap = 'round'; x.beginPath();
  for (let i = 0; i <= 20; i++) { const px = -200 + i * 22, py = Math.sin(i * 0.6 + t * 2) * 50; if (i === 0) x.moveTo(px, py); else x.lineTo(px, py); }
  x.stroke();
  // cabeca na ponta direita
  const hx = 240, hy = Math.sin(20 * 0.6 + t * 2) * 50;
  x.fillStyle = C5.jade; x.beginPath(); x.ellipse(hx, hy, 30, 24, 0, 0, 7); x.fill();
  x.fillStyle = C5.ouro; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(hx + d * 10, hy - 20); x.lineTo(hx + d * 24, hy - 48); x.lineTo(hx + d * 2, hy - 26); x.fill(); }
  x.strokeStyle = C5.ouroEsc; x.lineWidth = 3; x.beginPath(); x.moveTo(hx + 20, hy); x.quadraticCurveTo(hx + 60, hy - 20, hx + 80, hy + 10); x.moveTo(hx + 20, hy + 6); x.quadraticCurveTo(hx + 60, hy + 26, hx + 80, hy); x.stroke();
  x.fillStyle = '#1c1220'; x.beginPath(); x.arc(hx + 10, hy - 6, 4, 0, 7); x.fill();
  // perola
  glow(hx + 70, hy - 30, 40, 'rgba(246,240,200,0.5)'); x.fillStyle = C5.nuvem; x.beginPath(); x.arc(hx + 70, hy - 30, 14, 0, 7); x.fill();
  x.restore();
}
// nuvem do Wukong (espiral fofa com rastro)
function nuvemSalto(cx, cy, s, t = 0) { x.save(); x.translate(cx, cy + Math.sin(t * 2) * 6); x.scale(s, s); x.fillStyle = C5.nuvem; for (const p of [[-50, 6, 30], [-14, -4, 36], [26, 4, 30], [56, 10, 22]]) { x.beginPath(); x.arc(p[0], p[1], p[2], 0, 7); x.fill(); } x.strokeStyle = '#d8d0bf'; x.lineWidth = 4; x.beginPath(); x.arc(-14, -4, 18, 0, 5); x.stroke(); x.restore(); }

// ---- CENAS ----
function p5_ceu_china(t, tipo) { if (typeof ceuFlat === 'function') ceuFlat(tipo || 'tarde', t); else fundoFlat(C5.ceu, '#0e1b1e'); }

// COMP.f_montanha_flores: Montanha das Flores e Frutas. p = {pedra:true, racha:0..1, macacos:N, petalas:true}
COMP.f_montanha_flores = (t, lt, p) => {
  p5_ceu_china(t, 'dia');
  // picos verdes em camadas
  for (let k = 0; k < 3; k++) { x.fillStyle = ['#3a6a4a', '#2e5a3e', '#244a32'][k]; x.beginPath(); x.moveTo(0, H * (0.4 + k * 0.1)); for (let i = 0; i <= 6; i++) { const px = i / 6 * W; x.lineTo(px, H * (0.4 + k * 0.1) - (i % 2 ? 120 : 40) - k * 10); } x.lineTo(W, H); x.lineTo(0, H); x.fill(); }
  // pessegueiros floridos
  for (const px of [0.15, 0.82]) { x.fillStyle = C5.madeira; x.fillRect(W * px - 8, H * 0.5, 16, 120); x.fillStyle = '#f4a6c0'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(W * px + (rnd(i) - 0.5) * 70, H * 0.46 + (rnd(i * 2) - 0.5) * 50, 28, 0, 7); x.fill(); } }
  // cachoeira a direita
  x.fillStyle = 'rgba(180,220,230,0.6)'; x.fillRect(W * 0.86, H * 0.3, 40, H * 0.5); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,255,255,0.4)'; x.fillRect(W * 0.86 + (i % 3) * 12, H * 0.3 + ((t * 300 + i * 90) % (H * 0.5)), 8, 40); }
  // pedra magica
  if (p.pedra !== false) { const rx = W * 0.5, ry = H * 0.52, rac = rng(p.racha ?? 0, lt); glow(rx, ry, 120 * (0.5 + rac), 'rgba(246,220,120,' + (0.2 + rac * 0.3) + ')'); x.fillStyle = '#7a756e'; x.beginPath(); x.moveTo(rx - 56, ry + 60); x.lineTo(rx - 64, ry - 20); x.lineTo(rx - 20, ry - 66); x.lineTo(rx + 40, ry - 58); x.lineTo(rx + 64, ry); x.lineTo(rx + 44, ry + 62); x.closePath(); x.fill(); x.fillStyle = '#5a5650'; x.beginPath(); x.moveTo(rx + 40, ry + 62); x.lineTo(rx + 64, ry); x.lineTo(rx + 44, ry - 40); x.lineTo(rx + 20, ry + 50); x.closePath(); x.fill(); if (rac > 0.1) { x.strokeStyle = C5.ouro; x.lineWidth = 2 + rac * 5; x.beginPath(); x.moveTo(rx - 10, ry - 60); x.lineTo(rx + 6, ry - 10); x.lineTo(rx - 14, ry + 20); x.lineTo(rx + 10, ry + 56); x.moveTo(rx + 6, ry - 10); x.lineTo(rx + 40, ry - 4); x.stroke(); } }
  // macacos
  const n = p.macacos ?? 4; if (typeof macaco === 'function') for (let i = 0; i < n; i++) macaco(W * (0.2 + i / Math.max(1, n) * 0.6), H * 0.82, 0.7, { olhar: i % 2 ? 1 : -1 }, t + i);
  if (p.petalas && typeof fxPetalas === 'function') fxPetalas(t, 0.7);
};

// COMP.f_cachoeira: Caverna da Cortina d'Agua vista de dentro. p = {atravessa:true, trono:true}
COMP.f_cachoeira = (t, lt, p) => {
  fundoFlat('#1a3a3e', '#0a1a1e');
  // trono de pedra
  if (p.trono !== false) { x.fillStyle = C5.pedra; x.beginPath(); x.roundRect(W * 0.38, H * 0.4, W * 0.24, H * 0.3, 16); x.fill(); x.fillStyle = '#5a5a62'; x.fillRect(W * 0.38, H * 0.4, W * 0.24, 20); }
  // macacos comemorando
  if (typeof macaco === 'function') for (let i = 0; i < 4; i++) macaco(W * (0.16 + i * 0.18), H * 0.84, 0.6, { olhar: i % 2 ? 1 : -1 }, t + i * 1.3);
  // cortina de agua na frente
  x.save(); x.globalAlpha = 0.5; x.fillStyle = '#9ad0e0'; x.fillRect(0, 0, W, H); for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(rnd(i) * W, (t * 500 + rnd(i * 2) * H) % H, 6, 80); } x.restore();
  if (p.atravessa && typeof wukong === 'function') wukong(W * 0.5, H * 0.86, 0.9, { pose: 'pula' }, t);
};

// COMP.f_palacio_dragao: palacio do Rei Dragao no fundo do mar. p = {pilar:0..1, dragao:true}
COMP.f_palacio_dragao = (t, lt, p) => {
  fundoFlat('#1a4a5a', '#06202c');
  // bolhas
  for (let i = 0; i < 20; i++) { x.fillStyle = 'rgba(200,240,255,0.25)'; const bx = rnd(i) * W, by = H - ((t * 60 + rnd(i * 2) * H) % H); x.beginPath(); x.arc(bx, by, 4 + rnd(i * 3) * 8, 0, 7); x.fill(); }
  // corais e colunas
  x.fillStyle = '#2e6a6a'; for (const px of [0.1, 0.9]) { x.fillRect(W * px - 16, H * 0.3, 32, H * 0.5); }
  x.fillStyle = C5.laca; x.fillRect(W * 0.3, H * 0.35, 20, H * 0.4); x.fillRect(W * 0.68, H * 0.35, 20, H * 0.4);
  x.fillStyle = '#c8961a'; x.beginPath(); x.moveTo(W * 0.25, H * 0.35); x.lineTo(W * 0.75, H * 0.35); x.lineTo(W * 0.7, H * 0.26); x.lineTo(W * 0.3, H * 0.26); x.fill();
  // pilar de ferro que brilha/encolhe
  const pil = rng(p.pilar ?? 0.5, lt); glow(W * 0.5, H * 0.55, 80 * pil, 'rgba(246,200,120,' + (0.3 * pil) + ')'); x.fillStyle = C5.ouro; x.fillRect(W * 0.5 - 8, H * 0.4, 16, H * 0.3 * (0.5 + pil * 0.5));
  if (p.dragao !== false && typeof dragaoChines === 'function') dragaoChines(W * 0.5, H * 0.22, 0.7, {}, t);
};

// COMP.f_ceu_jade: Ceu de Jade, palacios dourados sobre nuvens. p = {caos:0..1, portao:true}
COMP.f_ceu_jade = (t, lt, p) => {
  fundoFlat('#6a8ca8', '#24434a');
  // nuvens base
  x.fillStyle = C5.nuvem; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(W * (0.1 + i * 0.2), H * 0.7, 160, 50, 0, 0, 7); x.fill(); }
  // palacios dourados
  const caos = rng(p.caos ?? 0, lt);
  for (const px of [0.2, 0.5, 0.8]) { x.save(); x.translate(W * px, H * 0.5 + caos * Math.sin(px * 10 + t * 5) * 20); x.rotate(caos * (rnd(px * 10) - 0.5) * 0.3); x.fillStyle = C5.laca; x.fillRect(-40, -60, 80, 80); x.fillStyle = C5.ouro; x.beginPath(); x.moveTo(-54, -60); x.lineTo(54, -60); x.lineTo(34, -96); x.lineTo(-34, -96); x.fill(); x.restore(); }
  // portao celestial
  if (p.portao) { x.fillStyle = C5.ouro; x.fillRect(W * 0.44, H * 0.28, 16, H * 0.3); x.fillRect(W * 0.54, H * 0.28, 16, H * 0.3); x.fillRect(W * 0.42, H * 0.26, W * 0.16, 14); }
  if (caos > 0.2 && typeof wukong === 'function') wukong(W * 0.5, H * 0.74, 0.8, { pose: 'luta', bastao: true }, t);
};

// COMP.f_pomar_pessegos: pomar dos pessegos da imortalidade. p = {come:true, guardas:true}
COMP.f_pomar_pessegos = (t, lt, p) => {
  p5_ceu_china(t, 'tarde');
  x.fillStyle = '#3a6a4a'; x.fillRect(0, H * 0.6, W, H * 0.4);
  // arvores com pessegos brilhando
  for (const px of [0.2, 0.5, 0.8]) { x.fillStyle = C5.madeira; x.fillRect(W * px - 12, H * 0.4, 24, H * 0.25); x.fillStyle = C5.verde; x.beginPath(); x.arc(W * px, H * 0.36, 90, 0, 7); x.fill(); for (let i = 0; i < 5; i++) { const fx = W * px + (rnd(px * 10 + i) - 0.5) * 120, fy = H * 0.34 + (rnd(px * 7 + i) - 0.5) * 100; glow(fx, fy, 30, 'rgba(255,180,200,0.3)'); x.fillStyle = '#f4a6b0'; x.beginPath(); x.arc(fx, fy, 14, 0, 7); x.fill(); } }
  if (p.guardas) { if (typeof figura === 'function') figura(W * 0.12, H * 0.9, 0.9, { figurino: 'soldado_china', pose: 'senta', expressao: 'neutro' }, t); }
  if (p.come !== false && typeof wukong === 'function') wukong(W * 0.5, H * 0.9, 0.9, { pose: 'parado', expressao: 'ri' }, t);
};

// COMP.f_palma_buda: a mao gigante de Buda, 5 dedos como pilares. p = {voa:true, fecha:0..1}
COMP.f_palma_buda = (t, lt, p) => {
  fundoFlat('#8aa8c0', '#3a5a7a');
  // nuvens
  x.fillStyle = C5.nuvem; for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(W * (0.1 + i * 0.25), H * (0.2 + (i % 2) * 0.1), 150, 44, 0, 0, 7); x.fill(); }
  const fecha = rng(p.fecha ?? 0, lt);
  // palma + 5 dedos (pilares)
  x.save(); x.translate(W * 0.5, H * 0.62); x.fillStyle = '#e8c58a'; x.beginPath(); x.ellipse(0, 60, 220, 90, 0, 0, 7); x.fill();
  for (let i = 0; i < 5; i++) { const dx = (i - 2) * 90; x.save(); x.translate(dx, 0); x.rotate(fecha * (i - 2) * -0.12); x.fillStyle = '#e8c58a'; x.beginPath(); x.roundRect(-30, -300, 60, 340, 30); x.fill(); x.restore(); }
  x.restore();
  if (p.voa && fecha < 0.5 && typeof wukong === 'function') { wukong(W * 0.5, H * 0.3, 0.6, { pose: 'senta_nuvem' }, t); if (typeof nuvemSalto === 'function') nuvemSalto(W * 0.5, H * 0.34, 0.8, t); }
};

// COMP.f_montanha_preso: montanha dos 5 elementos com Wukong preso, estacoes passando. p = {estacao, anos:N}
COMP.f_montanha_preso = (t, lt, p) => {
  const est = p.estacao || 'primavera';
  const ceus = { primavera: 'dia', verao: 'dia', outono: 'tarde', inverno: 'noite' };
  p5_ceu_china(t, ceus[est]);
  // montanha
  x.fillStyle = est === 'inverno' ? '#8a96a8' : '#5a6a4a'; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.3, H * 0.3); x.lineTo(W * 0.5, H * 0.45); x.lineTo(W * 0.7, H * 0.28); x.lineTo(W, H); x.fill();
  if (est === 'inverno' && typeof fxNeve === 'function') fxNeve(t, 0.6);
  if (est === 'outono' && typeof fxFolhas === 'function') fxFolhas(t, 0.6);
  // Wukong preso ate o pescoco
  if (typeof wukong === 'function') wukong(W * 0.5, H * 0.5, 1.0, { pose: 'preso', expressao: 'triste', faixa: true }, t);
  // passarinho na cabeca
  if (typeof corvo === 'function') corvo(W * 0.5, H * 0.42, 0.4, {}, t);
  if (p.anos != null) { x.fillStyle = TF().creme; x.font = fonte('fonteTit', 56); x.textAlign = 'center'; x.fillText(p.anos + ' years', W * 0.5, H * 0.16); }
};

// COMP.f_caminho_oeste: estrada para o oeste, os 4 peregrinos, montanhas em parallax. p = {terreno}
COMP.f_caminho_oeste = (t, lt, p) => {
  const terr = p.terreno || 'montanha';
  p5_ceu_china(t, terr === 'deserto' ? 'tarde' : 'dia');
  // montanhas em 3 camadas (parallax pelo t)
  for (let k = 0; k < 3; k++) { const off = (t * (8 + k * 6)) % 300; x.fillStyle = ['#4a5a6a', '#3a4a5a', terr === 'deserto' ? '#b89a6a' : '#2e3e4e'][k]; x.beginPath(); x.moveTo(-off, H * (0.5 + k * 0.08)); for (let i = 0; i <= 8; i++) x.lineTo(-off + i * 180, H * (0.5 + k * 0.08) - (i % 2 ? 100 : 30)); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }
  x.fillStyle = terr === 'deserto' ? '#d8b878' : '#6a5a3a'; x.fillRect(0, H * 0.78, W, H * 0.22);
  // os quatro
  if (typeof wukong === 'function') wukong(W * 0.3, H * 0.9, 0.7, { pose: 'parado' }, t);
  if (typeof tangSanzang === 'function') tangSanzang(W * 0.5, H * 0.92, 0.7, { olhar: 1 }, t);
  if (typeof zhuBajie === 'function') zhuBajie(W * 0.68, H * 0.9, 0.6, { olhar: 1 }, t);
  if (typeof shaWujing === 'function') shaWujing(W * 0.82, H * 0.9, 0.6, { olhar: 1 }, t);
};

// COMP.f_montanha_flamejante: montanha em chamas, leque de bananeira. p = {apaga:0..1}
COMP.f_montanha_flamejante = (t, lt, p) => {
  fundoFlat('#7a2a1a', '#3a1208');
  const apaga = rng(p.apaga ?? 0, lt);
  // montanha (tom quente visivel)
  x.fillStyle = '#8a3a1e'; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.35, H * 0.32); x.lineTo(W * 0.62, H * 0.42); x.lineTo(W * 0.85, H * 0.3); x.lineTo(W, H); x.fill();
  x.fillStyle = '#6a2a14'; x.beginPath(); x.moveTo(W * 0.35, H * 0.32); x.lineTo(W * 0.5, H * 0.5); x.lineTo(W * 0.2, H); x.lineTo(0, H); x.lineTo(0, H * 0.68); x.fill();
  // chamas grandes na crista (somem com apaga)
  if (typeof fxFogo === 'function') for (const px of [0.3, 0.45, 0.6, 0.78]) { if (rnd(px * 100) > apaga) fxFogo(W * px, H * (0.4 + rnd(px * 5) * 0.06), 2.2, t + px * 3); }
  else { x.fillStyle = '#e8671f'; for (const px of [0.3, 0.6]) { x.beginPath(); x.arc(W * px, H * 0.42, 40, 0, 7); x.fill(); } }
  // calor ondulando
  x.save(); x.globalAlpha = 0.1 * (1 - apaga); x.fillStyle = '#ffce8a'; for (let i = 0; i < 3; i++) x.fillRect(0, H * (0.5 + i * 0.1) + Math.sin(t * 3 + i) * 10, W, 20); x.restore();
};
