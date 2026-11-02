// Pacote 14 (14-roma). Old Tales / Roma antiga. Cria PALS.cl_roma (copiado de cl_grecia, cores romanas:
// vermelho imperial, ouro, marmore). Roteiro usa "tema":"epico"/"calmo" + "paleta":"roma". const topo O14; helpers p14_.
//   f_roma_rua f_coliseu f_acampamento_romano f_termas f_forum f_estrada_romana f_domus

// paleta romana (mesma forma de PALS.cl_grecia: 14 chaves)
if (typeof PALS !== 'undefined' && !PALS.cl_roma) {
  PALS.cl_roma = { fundo1: '#6a2a24', fundo2: '#24100c', parede: 'rgba(255,230,200,0.06)', creme: '#f1e4c8', papel: '#f1e4c8', tinta: '#2a1510',
    destaque: '#e8b84a', acento: '#c23b2a', acento2: '#2a1510', perigo: '#9a2418', ok: '#7c8f4a', luz: 'rgba(255,200,130,0.20)',
    fonteTit: '700 {s}px Georgia, "Times New Roman", serif', fonteTxt: 'italic 400 {s}px Georgia, "Times New Roman", serif' };
}

const O14 = { marmore: '#e6ddc8', marmoreEsc: '#b8ae96', pedra: '#9a8f78', pedraEsc: '#5a5244', telha: '#9a4530', telhaEsc: '#6a2e1e',
  madeira: '#6a4a2e', madeiraEsc: '#3f2c18', ouro: '#e8b84a', purpura: '#6a1f3a', terra: '#7a5a3a', ceu: '#8fb8d6', sombra: '#2a1510' };

// coluna romana (helper)
const p14_coluna = (cx, baseY, h, w = 26) => {
  x.fillStyle = O14.marmore; x.fillRect(cx - w / 2, baseY - h, w, h);
  x.fillStyle = O14.marmoreEsc; x.fillRect(cx - w / 2 - 6, baseY - h - 10, w + 12, 12); x.fillRect(cx - w / 2 - 6, baseY - 10, w + 12, 12);
  x.strokeStyle = 'rgba(0,0,0,0.12)'; x.lineWidth = 2; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(cx - w / 2 + i * w / 4, baseY - h); x.lineTo(cx - w / 2 + i * w / 4, baseY); x.stroke(); }
};

// f_roma_rua: insulas, lojas, fontanario, carroca. p={carroca}
COMP.f_roma_rua = (t, lt, p) => {
  const T = TF(); fundoFlat(T.fundo1, T.fundo2, [0.5, 0.2, 500]);
  // insulas (predios de apartamento)
  for (let i = 0; i < 3; i++) { const bx = W * (0.04 + i * 0.32); x.fillStyle = i % 2 ? '#8a5a3a' : '#9a6a44'; x.fillRect(bx, H * 0.2, W * 0.28, H * 0.56); x.fillStyle = O14.telha; x.fillRect(bx - 6, H * 0.18, W * 0.28 + 12, 16);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { x.fillStyle = O14.sombra; x.fillRect(bx + W * 0.05 + c * W * 0.14, H * (0.26 + r * 0.14), W * 0.08, H * 0.08); } }
  // chao de pedra
  x.fillStyle = O14.pedra; x.fillRect(0, H * 0.76, W, H * 0.24); x.strokeStyle = O14.pedraEsc; x.lineWidth = 2; for (let i = 0; i < 8; i++) x.strokeRect(W * (i / 8), H * 0.76, W / 8, H * 0.12);
  // fontanario
  x.fillStyle = O14.marmore; x.beginPath(); x.ellipse(W * 0.2, H * 0.82, 60, 20, 0, 0, 7); x.fill(); x.fillStyle = O14.marmoreEsc; x.fillRect(W * 0.19, H * 0.7, 16, H * 0.12); x.fillStyle = O14.ceu; x.globalAlpha = 0.4; x.beginPath(); x.ellipse(W * 0.2, H * 0.82, 44, 12, 0, 0, 7); x.fill(); x.globalAlpha = 1;
  // carroca (proibida de dia -> à noite ok)
  if (p.carroca) { x.fillStyle = O14.madeira; x.fillRect(W * 0.55, H * 0.78, W * 0.2, H * 0.06); x.strokeStyle = O14.madeiraEsc; x.lineWidth = 4; x.beginPath(); x.arc(W * 0.6, H * 0.86, 14, 0, 7); x.arc(W * 0.72, H * 0.86, 14, 0, 7); x.stroke(); }
};

// f_coliseu: arena com gladiadores e publico.
COMP.f_coliseu = (t, lt, p) => {
  const T = TF(); fundoFlat('#c77a3a', '#6a3a1e', [0.5, 0.15, 500]);
  // arquibancada em arco
  for (let r = 0; r < 4; r++) { x.fillStyle = r % 2 ? '#c9b48a' : '#d8c79a'; x.beginPath(); x.ellipse(W * 0.5, H * 0.1, W * (0.6 - r * 0.08), H * (0.5 - r * 0.07), 0, 0, Math.PI); x.fill(); }
  // publico (pontinhos)
  x.fillStyle = O14.sombra; for (let i = 0; i < 80; i++) { const a = (i / 80) * Math.PI; const rr = 0.42 + (i % 4) * 0.04; x.beginPath(); x.arc(W * 0.5 + Math.cos(a) * W * rr, H * 0.1 + Math.sin(a) * H * (rr * 0.8), 3, 0, 7); x.fill(); }
  // arena (areia)
  x.fillStyle = '#d8b878'; x.beginPath(); x.ellipse(W * 0.5, H * 0.82, W * 0.46, H * 0.18, 0, 0, 7); x.fill(); x.fillStyle = '#c7a868'; x.beginPath(); x.ellipse(W * 0.5, H * 0.84, W * 0.4, H * 0.12, 0, 0, 7); x.fill();
  // gladiadores
  if (typeof figura === 'function') { figura(W * 0.4, H * 0.86, 0.85, { figurino: 'legionario', arma: 'espada', escudo: 'esparta', olhar: 1 }, t); figura(W * 0.6, H * 0.86, 0.85, { figurino: 'legionario', arma: 'espada', escudo: 'esparta', olhar: -1 }, t); }
};

// f_acampamento_romano: palicada, tendas em grade, legionarios cavando.
COMP.f_acampamento_romano = (t, lt, p) => {
  const T = TF(); fundoFlat('#7a5a3a', '#2e2012', [0.5, 0.3, 500]);
  // palicada ao fundo
  x.fillStyle = O14.madeiraEsc; for (let i = 0; i < 14; i++) { const px = W * (i / 14); x.beginPath(); x.moveTo(px, H * 0.42); x.lineTo(px + W * 0.03, H * 0.42); x.lineTo(px + W * 0.015, H * 0.34); x.fill(); x.fillRect(px, H * 0.42, W * 0.03, H * 0.1); }
  // chao
  x.fillStyle = O14.terra; x.fillRect(0, H * 0.52, W, H * 0.48);
  // tendas em grade (vermelhas)
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const tx = W * (0.14 + c * 0.28), ty = H * (0.56 + r * 0.18); x.fillStyle = r % 2 ? '#a8321f' : '#b23b2e'; x.beginPath(); x.moveTo(tx - 44, ty + 30); x.lineTo(tx, ty - 20); x.lineTo(tx + 44, ty + 30); x.fill(); x.fillStyle = O14.sombra; x.fillRect(tx - 10, ty + 10, 20, 20); }
  // legionario cavando
  if (typeof figura === 'function') figura(W * 0.5, H * 0.94, 0.7, { figurino: 'legionario', pose: 'parado' }, t);
};

// f_termas: piscinas, vapor, mosaico.
COMP.f_termas = (t, lt, p) => {
  const T = TF(); fundoFlat('#b89a6a', '#5a4428', [0.5, 0.2, 500]);
  // colunas
  p14_coluna(W * 0.14, H * 0.6, H * 0.4); p14_coluna(W * 0.86, H * 0.6, H * 0.4);
  // arco ao fundo
  x.fillStyle = O14.marmoreEsc; x.beginPath(); x.moveTo(W * 0.3, H * 0.6); x.lineTo(W * 0.3, H * 0.3); x.arc(W * 0.5, H * 0.3, W * 0.2, Math.PI, 0); x.lineTo(W * 0.7, H * 0.6); x.fill(); x.fillStyle = T.fundo2; x.beginPath(); x.moveTo(W * 0.34, H * 0.6); x.lineTo(W * 0.34, H * 0.32); x.arc(W * 0.5, H * 0.32, W * 0.16, Math.PI, 0); x.lineTo(W * 0.66, H * 0.6); x.fill();
  // piscina
  x.fillStyle = '#5f9ab0'; x.fillRect(W * 0.1, H * 0.66, W * 0.8, H * 0.24); x.fillStyle = 'rgba(255,255,255,0.15)'; for (let i = 0; i < 5; i++) x.fillRect(W * 0.1, H * (0.68 + i * 0.04), W * 0.8, 3);
  // mosaico na borda
  for (let i = 0; i < 16; i++) { x.fillStyle = [O14.ouro, O14.purpura, '#2a6a7a', O14.marmore][i % 4]; x.fillRect(W * (0.1 + i * 0.05), H * 0.63, W * 0.04, 10); }
  // vapor
  if (typeof fxFumaca === 'function') { fxFumaca(W * 0.3, H * 0.66, t, 0.4); fxFumaca(W * 0.7, H * 0.66, t, 0.4); }
};

// f_forum: templos, rostra, orador.
COMP.f_forum = (t, lt, p) => {
  const T = TF(); fundoFlat(T.fundo1, T.fundo2, [0.5, 0.2, 500]);
  x.fillStyle = O14.pedra; x.fillRect(0, H * 0.74, W, H * 0.26);
  // templo ao fundo (fronton + colunas)
  for (let i = 0; i < 5; i++) p14_coluna(W * (0.26 + i * 0.12), H * 0.56, H * 0.3, 20);
  x.fillStyle = O14.marmore; x.fillRect(W * 0.2, H * 0.24, W * 0.6, 16);
  x.fillStyle = O14.marmoreEsc; x.beginPath(); x.moveTo(W * 0.18, H * 0.24); x.lineTo(W * 0.5, H * 0.12); x.lineTo(W * 0.82, H * 0.24); x.fill();
  // rostra (tribuna)
  x.fillStyle = O14.marmore; x.fillRect(W * 0.4, H * 0.62, W * 0.2, H * 0.12); x.fillStyle = O14.ouro; x.fillRect(W * 0.4, H * 0.62, W * 0.2, 6);
  // orador (toga)
  if (typeof figura === 'function') figura(W * 0.5, H * 0.62, 0.7, { figurino: 'mercador', pose: 'aponta', olhar: 1 }, t);
};

// f_estrada_romana: marcos de milha, legiao marchando.
COMP.f_estrada_romana = (t, lt, p) => {
  const T = TF(); ceuFlat('tarde', t);
  // campos
  x.fillStyle = '#7c8f4a'; x.fillRect(0, H * 0.5, W, H * 0.2);
  // estrada de pedra em perspectiva
  x.fillStyle = O14.pedra; x.beginPath(); x.moveTo(W * 0.42, H * 0.5); x.lineTo(W * 0.58, H * 0.5); x.lineTo(W * 0.85, H); x.lineTo(W * 0.15, H); x.fill();
  x.strokeStyle = O14.pedraEsc; x.lineWidth = 2; for (let i = 0; i < 6; i++) { const u = i / 6; x.beginPath(); x.moveTo(W * (0.42 - u * 0.27), H * (0.5 + u * 0.5)); x.lineTo(W * (0.58 + u * 0.27), H * (0.5 + u * 0.5)); x.stroke(); }
  // marco de milha
  x.fillStyle = O14.marmore; x.fillRect(W * 0.8, H * 0.52, 20, H * 0.1); x.fillStyle = O14.marmoreEsc; x.beginPath(); x.arc(W * 0.81, H * 0.52, 12, Math.PI, 0); x.fill();
  // legiao marchando (multidao de legionarios ao longe)
  if (typeof multidao === 'function') multidao(0.4, 0.6, H * 0.62, 0.4, 4, { figurino: 'legionario', pose: 'parado', formacao: 'bloco' }, t);
  else if (typeof figura === 'function') figura(W * 0.5, H * 0.66, 0.5, { figurino: 'legionario', pose: 'parado' }, t);
};

// f_domus: casa rica com atrio e impluvio.
COMP.f_domus = (t, lt, p) => {
  const T = TF(); fundoFlat('#b89a6a', '#4a3620', [0.5, 0.2, 500]);
  // parede com afresco
  x.fillStyle = '#a8321f'; x.fillRect(0, H * 0.1, W, H * 0.5); x.fillStyle = O14.marmore; x.fillRect(0, H * 0.56, W, 12);
  // colunas do atrio
  p14_coluna(W * 0.18, H * 0.68, H * 0.5); p14_coluna(W * 0.82, H * 0.68, H * 0.5);
  // abertura no teto (compluvio) com luz
  x.fillStyle = T.luz; x.fillRect(W * 0.35, 0, W * 0.3, H * 0.1); glow(W * 0.5, H * 0.1, 120, 'rgba(255,220,150,0.3)');
  // piso
  x.fillStyle = O14.pedra; x.fillRect(0, H * 0.68, W, H * 0.32);
  // impluvio (tanque de agua no centro)
  x.fillStyle = O14.marmoreEsc; x.fillRect(W * 0.38, H * 0.74, W * 0.24, H * 0.14); x.fillStyle = '#5f9ab0'; x.fillRect(W * 0.4, H * 0.76, W * 0.2, H * 0.1); x.fillStyle = 'rgba(255,255,255,0.2)'; x.fillRect(W * 0.4, H * 0.78, W * 0.2, 3);
  // mosaico ao redor
  for (let i = 0; i < 20; i++) { x.fillStyle = [O14.ouro, O14.purpura, O14.sombra][i % 3]; x.fillRect(W * (0.05 + i * 0.045), H * 0.9, W * 0.03, 8); }
};
