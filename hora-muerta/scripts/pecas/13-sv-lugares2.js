// Pacote 13 (13-sv-lugares2). Signal Lost 2 ("paleta":"sv"): frio, moderno. Placas em INGLES. Cores via TF() (sv) + neutras.
// Reusa p12_hud (HUD de sinal) do pacote 12. const topo O13; helpers p13_.
//   f_bunker f_shopping f_radio f_aviao f_navio f_deserto f_estacao_polar f_escritorio f_suburbio f_ilha

const O13 = { metal: '#3a4650', metalEsc: '#222a30', concreto: '#4a525a', concretoEsc: '#2a3036', vidro: '#9fb6bf',
  asfalto: '#1c2228', neve: '#d8e4e8', neveEsc: '#9fb2b8', madeira: '#3a2e24', preto: '#0a1014', branco: '#e6f1f2', areia: '#6a5a44' };

// f_bunker: porta blindada, painel de radio, camas, contador de dias. p={dias}
COMP.f_bunker = (t, lt, p) => {
  const T = TF(); fundoFlat('#222a30', '#0e1418');
  x.fillStyle = O13.concretoEsc; x.fillRect(0, H * 0.84, W, H * 0.16);
  // porta blindada redonda
  x.fillStyle = O13.metal; x.beginPath(); x.arc(W * 0.2, H * 0.5, 110, 0, 7); x.fill(); x.fillStyle = O13.metalEsc; x.beginPath(); x.arc(W * 0.2, H * 0.5, 86, 0, 7); x.fill();
  x.strokeStyle = O13.metal; x.lineWidth = 10; for (let i = 0; i < 6; i++) { const a = i / 6 * 7; x.beginPath(); x.moveTo(W * 0.2, H * 0.5); x.lineTo(W * 0.2 + Math.cos(a) * 80, H * 0.5 + Math.sin(a) * 80); x.stroke(); } x.fillStyle = O13.metal; x.beginPath(); x.arc(W * 0.2, H * 0.5, 16, 0, 7); x.fill();
  // painel de radio
  x.fillStyle = O13.metalEsc; x.fillRect(W * 0.5, H * 0.3, W * 0.4, H * 0.24); for (let i = 0; i < 6; i++) { x.fillStyle = [T.destaque, T.acento, T.perigo][i % 3]; x.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + i); x.beginPath(); x.arc(W * (0.54 + i * 0.055), H * 0.36, 7, 0, 7); x.fill(); x.globalAlpha = 1; }
  x.strokeStyle = T.destaque; x.lineWidth = 2; x.beginPath(); for (let xx = 0; xx <= W * 0.36; xx += 8) { const yy = H * 0.48 + Math.sin(xx * 0.08 + t * 4) * 12; if (xx === 0) x.moveTo(W * 0.52, yy); else x.lineTo(W * 0.52 + xx, yy); } x.stroke();
  // camas (beliche)
  x.fillStyle = O13.metal; x.fillRect(W * 0.52, H * 0.62, W * 0.3, 10); x.fillRect(W * 0.52, H * 0.76, W * 0.3, 10);
  // contador de dias (riscos na parede)
  x.strokeStyle = O13.branco; x.lineWidth = 3; const dias = Math.floor(rng(p.dias ?? 0.5, lt) * 20) + 4; for (let i = 0; i < dias; i++) { const gx = W * 0.06 + (i % 10) * 18; const gy = H * 0.74 + Math.floor(i / 10) * 24; if (i % 5 === 4) { x.beginPath(); x.moveTo(gx - 16, gy - 12); x.lineTo(gx, gy + 2); x.stroke(); } else { x.beginPath(); x.moveTo(gx, gy - 12); x.lineTo(gx, gy + 2); x.stroke(); } }
  p12_hud(t, 0);
};

// f_shopping: shopping abandonado, escada rolante parada, fonte seca, vitrine com manequim. p={vira}
COMP.f_shopping = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a3036', '#141a1e');
  x.fillStyle = '#3a424a'; x.fillRect(0, H * 0.82, W, H * 0.18);
  // claraboia
  x.fillStyle = 'rgba(159,182,191,0.1)'; x.beginPath(); x.moveTo(W * 0.3, 0); x.lineTo(W * 0.7, 0); x.lineTo(W * 0.6, H * 0.14); x.lineTo(W * 0.4, H * 0.14); x.fill();
  // escada rolante parada
  x.fillStyle = O13.metalEsc; x.beginPath(); x.moveTo(W * 0.1, H * 0.82); x.lineTo(W * 0.4, H * 0.4); x.lineTo(W * 0.46, H * 0.4); x.lineTo(W * 0.18, H * 0.82); x.fill();
  x.strokeStyle = O13.metal; x.lineWidth = 2; for (let i = 0; i < 8; i++) { const u = i / 8; x.beginPath(); x.moveTo(W * (0.1 + u * 0.3), H * (0.82 - u * 0.42)); x.lineTo(W * (0.14 + u * 0.3), H * (0.82 - u * 0.42)); x.stroke(); }
  x.strokeStyle = O13.vidro; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.1, H * 0.72); x.lineTo(W * 0.4, H * 0.3); x.stroke();
  // fonte seca
  x.fillStyle = O13.concreto; x.beginPath(); x.ellipse(W * 0.72, H * 0.8, 90, 26, 0, 0, 7); x.fill(); x.fillStyle = O13.concretoEsc; x.beginPath(); x.ellipse(W * 0.72, H * 0.78, 60, 16, 0, 0, 7); x.fill();
  // vitrine com manequim
  x.fillStyle = 'rgba(159,182,191,0.12)'; x.fillRect(W * 0.52, H * 0.4, W * 0.16, H * 0.34); x.strokeStyle = O13.vidro; x.lineWidth = 2; x.strokeRect(W * 0.52, H * 0.4, W * 0.16, H * 0.34);
  const vira = rng(p.vira ?? 0, lt); x.save(); x.translate(W * 0.6, H * 0.74); x.fillStyle = O13.neveEsc; x.fillRect(-12, -120, 24, 90); x.beginPath(); x.arc(0, -134, 14, 0, 7); x.fill(); if (vira > 0.5) { x.fillStyle = O13.preto; x.beginPath(); x.arc(-5, -134, 3, 0, 7); x.arc(5, -134, 3, 0, 7); x.fill(); } x.restore();
  p12_hud(t, 1);
};

// f_radio: estacao de radio, painel, microfone, onda na tela, janela com antena. p={voz:0..1}
COMP.f_radio = (t, lt, p) => {
  const T = TF(); fundoFlat('#1a2228', '#0a1014');
  x.fillStyle = O13.concretoEsc; x.fillRect(0, H * 0.7, W, H * 0.3);
  // janela com antena de fundo
  x.fillStyle = '#0c1620'; x.fillRect(W * 0.6, H * 0.12, W * 0.34, H * 0.3); x.strokeStyle = O13.metal; x.lineWidth = 4; x.strokeRect(W * 0.6, H * 0.12, W * 0.34, H * 0.3);
  x.strokeStyle = O13.metalEsc; x.lineWidth = 3; x.beginPath(); x.moveTo(W * 0.77, H * 0.42); x.lineTo(W * 0.77, H * 0.16); x.stroke(); for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(W * 0.74, H * (0.2 + i * 0.04)); x.lineTo(W * 0.8, H * (0.2 + i * 0.04)); x.stroke(); } if (typeof glow === 'function') glow(W * 0.77, H * 0.16, 16, 'rgba(255,77,94,0.4)');
  // painel + tela com onda de voz
  x.fillStyle = O13.metalEsc; x.fillRect(W * 0.08, H * 0.4, W * 0.44, H * 0.3);
  x.fillStyle = '#060a0c'; x.fillRect(W * 0.1, H * 0.43, W * 0.4, H * 0.14);
  const voz = rng(p.voz ?? 0.5, lt); x.strokeStyle = T.destaque; x.lineWidth = 2; x.beginPath(); for (let xx = 0; xx <= W * 0.4; xx += 4) { const yy = H * 0.5 + Math.sin(xx * 0.1 + t * 6) * (6 + voz * 30) * Math.sin(xx * 0.02); if (xx === 0) x.moveTo(W * 0.1, yy); else x.lineTo(W * 0.1 + xx, yy); } x.stroke();
  // botoes
  for (let i = 0; i < 5; i++) { x.fillStyle = i === 2 ? T.perigo : O13.metal; x.beginPath(); x.arc(W * (0.14 + i * 0.08), H * 0.63, 8, 0, 7); x.fill(); }
  // microfone
  x.strokeStyle = O13.metal; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.3, H * 0.7); x.lineTo(W * 0.3, H * 0.76); x.stroke(); x.fillStyle = O13.metalEsc; x.beginPath(); x.ellipse(W * 0.3, H * 0.68, 12, 18, 0, 0, 7); x.fill();
  p12_hud(t, 2);
};

// f_aviao: cabine de aviao a noite, assentos, janela com asa, luz de cinto, alguem na asa.
COMP.f_aviao = (t, lt, p) => {
  const T = TF(); fundoFlat('#222a30', '#10161a');
  // teto curvo
  x.fillStyle = O13.concretoEsc; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(W * 0.5, H * 0.18, W, 0); x.lineTo(W, H * 0.3); x.lineTo(0, H * 0.3); x.fill();
  // fileiras de assentos
  for (let r = 0; r < 3; r++) { const sy = H * (0.4 + r * 0.18); for (const sx of [0.16, 0.3, 0.6, 0.74]) { x.fillStyle = O13.metalEsc; x.fillRect(W * sx, sy, W * 0.1, H * 0.14); x.fillRect(W * sx, sy - H * 0.04, W * 0.1, H * 0.05); } }
  // janela com asa + figura na asa
  x.fillStyle = '#0a1420'; x.beginPath(); x.ellipse(W * 0.46, H * 0.46, 26, 40, 0, 0, 7); x.fill(); x.strokeStyle = O13.metal; x.lineWidth = 4; x.stroke();
  if (typeof luaFlat === 'function') { x.save(); x.beginPath(); x.ellipse(W * 0.46, H * 0.46, 24, 38, 0, 0, 7); x.clip(); luaFlat(W * 0.52, H * 0.4, 14, 1, t); x.fillStyle = O13.metal; x.beginPath(); x.moveTo(W * 0.44, H * 0.56); x.lineTo(W * 0.5, H * 0.5); x.lineTo(W * 0.5, H * 0.56); x.fill(); x.fillStyle = O13.preto; x.beginPath(); x.arc(W * 0.47, H * 0.5, 5, 0, 7); x.fill(); x.restore(); }
  // luz de "fasten seatbelt"
  const on = Math.sin(t * 4) > 0 ? 1 : 0.3; x.save(); x.globalAlpha = on; x.fillStyle = T.acento; x.fillRect(W * 0.44, H * 0.34, W * 0.12, 14); x.fillStyle = O13.preto; x.font = fonte('fonteTxt', 10); x.textAlign = 'center'; x.fillText('SEATBELT', W * 0.5, H * 0.34 + 11); x.restore();
  x.font = fonte('fonteTxt', 14); x.textAlign = 'left';
  p12_hud(t, 0);
};

// f_navio: conves de navio na tempestade, ondas, conteineres, luz.
COMP.f_navio = (t, lt, p) => {
  const T = TF(); fundoFlat('#2a3640', '#0c1418', [0.5, 0.1, 400]);
  // mar revolto visivel (alto)
  x.fillStyle = '#123240'; x.beginPath(); x.moveTo(0, H * 0.4); for (let xx = 0; xx <= W; xx += 24) x.lineTo(xx, H * 0.4 + Math.sin(xx * 0.02 + t * 2) * 30); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  x.fillStyle = '#0a2028'; x.beginPath(); x.moveTo(0, H * 0.52); for (let xx = 0; xx <= W; xx += 24) x.lineTo(xx, H * 0.52 + Math.sin(xx * 0.025 + t * 2.4 + 1) * 24); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  if (typeof fxRelampago === 'function') fxRelampago(t, 2.5);
  // conves inclinado (massa solida do navio)
  x.save(); x.translate(W * 0.5, H * 0.74); x.rotate(Math.sin(t) * 0.04); x.translate(-W * 0.5, -H * 0.74);
  x.fillStyle = O13.metalEsc; x.beginPath(); x.moveTo(W * 0.02, H * 0.72); x.lineTo(W * 0.98, H * 0.72); x.lineTo(W * 0.9, H); x.lineTo(W * 0.1, H); x.fill();
  x.fillStyle = '#2e3a44'; x.fillRect(0, H * 0.7, W, 16);
  // conteineres (empilhados no conves)
  for (let i = 0; i < 4; i++) { x.fillStyle = [T.perigo, T.acento, T.destaque, O13.metal][i]; x.globalAlpha = 0.85; x.fillRect(W * (0.1 + i * 0.2), H * 0.52, W * 0.16, H * 0.18); x.globalAlpha = 1; x.strokeStyle = O13.preto; x.lineWidth = 2; x.strokeRect(W * (0.1 + i * 0.2), H * 0.52, W * 0.16, H * 0.18); for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(W * (0.1 + i * 0.2) + W * 0.04 * k, H * 0.52); x.lineTo(W * (0.1 + i * 0.2) + W * 0.04 * k, H * 0.7); x.stroke(); } }
  // mastro com luz
  x.strokeStyle = O13.metal; x.lineWidth = 5; x.beginPath(); x.moveTo(W * 0.85, H * 0.52); x.lineTo(W * 0.85, H * 0.24); x.stroke(); glow(W * 0.85, H * 0.24, 30, 'rgba(255,209,102,0.5)'); x.fillStyle = T.acento; x.beginPath(); x.arc(W * 0.85, H * 0.24, 7, 0, 7); x.fill();
  x.restore();
  p12_hud(t, 0);
};

// f_deserto: estrada no deserto, posto ao longe, cacto, ceu estrelado, luz no ceu. p={luz}
COMP.f_deserto = (t, lt, p) => {
  const T = TF(); ceuFlat('estrelas', t);
  // luz estranha no ceu
  if (p.luz) { const b = 0.5 + 0.5 * Math.sin(t * 2); glow(W * 0.5, H * 0.26, 90 * b, 'rgba(79,227,255,0.3)'); x.fillStyle = 'rgba(79,227,255,' + (0.2 * b) + ')'; x.beginPath(); x.ellipse(W * 0.5, H * 0.26, 50, 20, 0, 0, 7); x.fill(); }
  // chao de deserto
  x.fillStyle = O13.areia; x.fillRect(0, H * 0.66, W, H * 0.34); x.fillStyle = '#4a3e2e'; x.fillRect(0, H * 0.78, W, H * 0.22);
  // estrada reta ao longe
  x.fillStyle = O13.asfalto; x.beginPath(); x.moveTo(W * 0.46, H * 0.66); x.lineTo(W * 0.54, H * 0.66); x.lineTo(W * 0.7, H); x.lineTo(W * 0.3, H); x.fill();
  // posto ao longe
  x.fillStyle = O13.metalEsc; x.fillRect(W * 0.1, H * 0.56, W * 0.14, H * 0.1); glow(W * 0.17, H * 0.58, 30, 'rgba(255,209,102,0.3)'); x.fillStyle = T.acento; x.fillRect(W * 0.12, H * 0.52, W * 0.1, 8);
  // cacto
  x.fillStyle = '#3a5a3a'; x.fillRect(W * 0.82, H * 0.58, 16, H * 0.14); x.fillRect(W * 0.78, H * 0.62, 10, 30); x.fillRect(W * 0.86, H * 0.6, 10, 36); x.fillRect(W * 0.78, H * 0.6, 4, -20); x.fillRect(W * 0.92, H * 0.58, 4, -16);
  p12_hud(t, p.luz ? 0 : 1);
};

// f_estacao_polar: base de pesquisa na neve, modulos, antena, aurora, porta batendo.
COMP.f_estacao_polar = (t, lt, p) => {
  const T = TF(); ceuFlat('boreal', t);
  // neve
  x.fillStyle = O13.neve; x.beginPath(); x.moveTo(0, H * 0.68); x.quadraticCurveTo(W * 0.5, H * 0.64, W, H * 0.68); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // modulos sobre pernas
  for (let i = 0; i < 2; i++) { const mx = W * (0.14 + i * 0.4); x.fillStyle = T.perigo; x.globalAlpha = 0.85; x.fillRect(mx, H * 0.46, W * 0.26, H * 0.16); x.globalAlpha = 1; x.strokeStyle = O13.preto; x.lineWidth = 2; x.strokeRect(mx, H * 0.46, W * 0.26, H * 0.16); x.fillStyle = O13.metal; x.fillRect(mx + 20, H * 0.62, 8, 30); x.fillRect(mx + W * 0.26 - 28, H * 0.62, 8, 30); x.fillStyle = T.acento; x.fillRect(mx + W * 0.1, H * 0.5, W * 0.06, H * 0.05); glow(mx + W * 0.13, H * 0.52, 20, 'rgba(255,209,102,0.3)'); }
  // antena
  x.strokeStyle = O13.metal; x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.72, H * 0.46); x.lineTo(W * 0.72, H * 0.2); x.stroke(); x.beginPath(); x.arc(W * 0.72, H * 0.2, 18, Math.PI, 0); x.stroke();
  // porta batendo (um modulo com porta aberta oscilando)
  const ba = Math.sin(t * 3) * 0.3; x.save(); x.translate(W * 0.14, H * 0.62); x.rotate(ba); x.fillStyle = O13.metalEsc; x.fillRect(0, -H * 0.12, 10, H * 0.12); x.restore();
  // cachorros (silhuetas pequenas)
  for (let i = 0; i < 3; i++) { x.fillStyle = O13.metalEsc; x.beginPath(); x.ellipse(W * (0.3 + i * 0.06), H * 0.78, 16, 7, 0, 0, 7); x.fill(); x.fillRect(W * (0.3 + i * 0.06) + 10, H * 0.74, 6, 8); }
  p12_hud(t, 1);
};

// f_escritorio: escritorio vazio a noite, baias, monitores ligados, impressora imprimindo sozinha.
COMP.f_escritorio = (t, lt, p) => {
  const T = TF(); fundoFlat('#222a30', '#10161a');
  x.fillStyle = '#2e363c'; x.fillRect(0, H * 0.78, W, H * 0.22);
  // baias (divisorias)
  for (let i = 0; i < 3; i++) { const bx = W * (0.08 + i * 0.3); x.fillStyle = O13.metalEsc; x.fillRect(bx, H * 0.5, W * 0.24, H * 0.28); x.fillRect(bx, H * 0.4, 8, H * 0.38); // mesa+divisoria
    // monitor ligado
    const gl = i === 1 ? T.perigo : T.destaque; x.fillStyle = '#060a0c'; x.fillRect(bx + W * 0.04, H * 0.42, W * 0.12, H * 0.08); glow(bx + W * 0.1, H * 0.46, 30, (i === 1 ? 'rgba(255,77,94,0.25)' : 'rgba(79,227,255,0.2)')); x.fillStyle = gl; x.globalAlpha = 0.4; x.fillRect(bx + W * 0.05, H * 0.43, W * 0.1, H * 0.06); x.globalAlpha = 1; }
  // impressora imprimindo sozinha
  x.fillStyle = O13.metal; x.fillRect(W * 0.82, H * 0.6, W * 0.12, H * 0.1); const pr = (t * 0.5) % 1; x.fillStyle = O13.branco; x.fillRect(W * 0.84, H * 0.7, W * 0.08, 40 * pr); x.strokeStyle = T.destaque; x.lineWidth = 2; x.beginPath(); x.moveTo(W * 0.85, H * 0.62); x.lineTo(W * 0.91, H * 0.62); x.stroke();
  // luz de teto fraca piscando
  const pisca = Math.sin(t * 12) > 0.4 ? 0.3 : 0.08; x.save(); x.globalAlpha = pisca; glow(W * 0.5, H * 0.1, 180, 'rgba(230,241,242,0.4)'); x.restore();
  p12_hud(t, 1);
};

// f_suburbio: rua de suburbio americano, casas iguais, gramados, poste, uma casa diferente. p={casa}
COMP.f_suburbio = (t, lt, p) => {
  const T = TF(); ceuFlat('estrelas', t);
  // gramado
  x.fillStyle = '#2a3a2e'; x.fillRect(0, H * 0.6, W, H * 0.2); x.fillStyle = O13.asfalto; x.fillRect(0, H * 0.8, W, H * 0.2);
  // casas iguais
  const dif = p.casa ? Math.floor(rng(p.casa, lt) * 4) : -1;
  for (let i = 0; i < 4; i++) { const hx = W * (0.04 + i * 0.24); const esc = i === dif; x.fillStyle = esc ? O13.preto : '#4a4a52'; x.fillRect(hx, H * 0.44, W * 0.18, H * 0.16); x.fillStyle = esc ? '#1a1a20' : '#3a3a42'; x.beginPath(); x.moveTo(hx - 6, H * 0.44); x.lineTo(hx + W * 0.09, H * 0.34); x.lineTo(hx + W * 0.18 + 6, H * 0.44); x.fill();
    // janela: acesa (igual) ou apagada (a diferente)
    if (!esc) { x.fillStyle = T.acento; glow(hx + W * 0.09, H * 0.52, 20, 'rgba(255,209,102,0.2)'); x.fillRect(hx + W * 0.06, H * 0.48, W * 0.06, H * 0.06); } else { x.fillStyle = '#0a0a0c'; x.fillRect(hx + W * 0.06, H * 0.48, W * 0.06, H * 0.06); } }
  // poste de luz
  x.strokeStyle = O13.metalEsc; x.lineWidth = 5; x.beginPath(); x.moveTo(W * 0.5, H * 0.8); x.lineTo(W * 0.5, H * 0.4); x.stroke(); x.fillStyle = T.acento; glow(W * 0.5, H * 0.4, 40, 'rgba(255,209,102,0.3)'); x.beginPath(); x.arc(W * 0.5, H * 0.4, 8, 0, 7); x.fill();
  p12_hud(t, 1);
};

// f_ilha: praia de ilha pequena a noite, fogueira, mar, vulto na agua, destrocos. p={vulto}
COMP.f_ilha = (t, lt, p) => {
  const T = TF(); ceuFlat('estrelas', t);
  // mar
  x.fillStyle = '#0c2630'; x.fillRect(0, H * 0.5, W, H * 0.24);
  x.strokeStyle = 'rgba(159,182,191,0.2)'; x.lineWidth = 2; for (let i = 0; i < 3; i++) { const yy = H * (0.54 + i * 0.05); x.beginPath(); for (let xx = 0; xx <= W; xx += 30) { if (xx === 0) x.moveTo(0, yy); else x.lineTo(xx, yy + Math.sin(xx * 0.03 + t + i) * 4); } x.stroke(); }
  // areia
  x.fillStyle = O13.areia; x.beginPath(); x.moveTo(0, H * 0.74); x.quadraticCurveTo(W * 0.5, H * 0.7, W, H * 0.74); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  // fogueira
  if (typeof fxFogo === 'function') fxFogo(W * 0.5, H * 0.86, 1, t); else { glow(W * 0.5, H * 0.84, 50, 'rgba(255,120,40,0.4)'); x.fillStyle = T.acento; x.beginPath(); x.moveTo(W * 0.47, H * 0.88); x.lineTo(W * 0.5, H * 0.8); x.lineTo(W * 0.53, H * 0.88); x.fill(); }
  x.strokeStyle = O13.madeira; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.45, H * 0.9); x.lineTo(W * 0.55, H * 0.86); x.moveTo(W * 0.55, H * 0.9); x.lineTo(W * 0.45, H * 0.86); x.stroke();
  // destrocos (tabuas)
  x.fillStyle = O13.madeira; x.save(); x.translate(W * 0.2, H * 0.8); x.rotate(0.3); x.fillRect(0, 0, 90, 12); x.restore(); x.save(); x.translate(W * 0.75, H * 0.82); x.rotate(-0.2); x.fillRect(0, 0, 70, 10); x.restore();
  // vulto na agua
  if (p.vulto) { const b = 0.5 + 0.5 * Math.sin(t * 2); x.save(); x.globalAlpha = 0.5 + 0.4 * b; x.fillStyle = O13.preto; x.beginPath(); x.arc(W * 0.7, H * 0.6, 14, 0, 7); x.fill(); x.fillRect(W * 0.7 - 10, H * 0.6, 20, 30); p13_eyered(W * 0.7, H * 0.58, t); x.restore(); }
  p12_hud(t, p.vulto ? 0 : 1);
};

// olhos vermelhos do vulto (helper local)
function p13_eyered(cx, cy, t) { const T = TF(); x.fillStyle = T.perigo; x.beginPath(); x.arc(cx - 5, cy, 3, 0, 7); x.arc(cx + 5, cy, 3, 0, 7); x.fill(); }
