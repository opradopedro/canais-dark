// Pacote 11 (11-hm-criaturas). Hora Muerta: aparicoes das lendas latinas. Paleta padrao HM (violeta).
// Estilo flat: silhueta, olhos, forma. NUNCA gore (sem sangue, sem ferida, sem rosto mutilado).
// Criaturas: funcao nome(cx, base, s, o, t), o = {dist:0..1 (longe->perto), vira:0..1, olhos:true}.
// Peca: COMP.f_aparicion (p = {quien:'nome', lugar:'f_peca_fundo', dist:[a,b]}).
//   criaturas: llorona charro_negro cadejo lechuza_bruja duende nahual sombreron siguanaba tunda patasola mano_peluda nina_muneca monja

const O11 = { branco: '#e8e2d2', pretoAzul: '#0e0a18', preto: '#0a0812', sombra: '#120e1e', olhoVermelho: '#e03a3a',
  olhoBrasa: '#ff7a2a', olhoAmarelo: '#ffcf4a', pele: '#c9bfae', manto: '#1a1526', chapeu: '#120f1c', osso: '#efe9dc', madeira: '#4a3726' };

// helper: par de olhos que brilham
const p11_olhos = (cx, cy, sep, r, cor, t) => {
  const b = 0.6 + 0.4 * Math.sin(t * 3);
  x.save(); x.globalAlpha = b; if (typeof glow === 'function') glow(cx, cy, r * 3, cor.replace(')', ',0.5)').replace('rgb', 'rgba'));
  x.fillStyle = cor; x.beginPath(); x.arc(cx - sep, cy, r, 0, 7); x.arc(cx + sep, cy, r, 0, 7); x.fill(); x.restore();
};

// ---- criaturas (cada uma desenha em cx,base com escala s) ----

function llorona(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O11.branco; x.beginPath(); x.moveTo(-38, 0); x.lineTo(38, 0); x.lineTo(24, -210); x.lineTo(-24, -210); x.fill(); // vestido branco
  x.fillStyle = '#efe9dc'; x.beginPath(); x.arc(0, -228, 24, 0, 7); x.fill(); // cabeca
  // cabelo longo escuro cobrindo o rosto e caindo pelos lados (topo simetrico sobre a cabeca)
  x.fillStyle = O11.sombra; x.beginPath(); x.moveTo(-24, -228); x.quadraticCurveTo(-26, -254, 0, -254); x.quadraticCurveTo(26, -254, 24, -228); x.quadraticCurveTo(40, -150, 20, -110); x.lineTo(-20, -110); x.quadraticCurveTo(-40, -150, -24, -228); x.fill();
  if (o.olhos) { x.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3); x.fillStyle = O11.olhoAmarelo; x.beginPath(); x.arc(-8, -228, 3, 0, 7); x.arc(8, -228, 3, 0, 7); x.fill(); x.globalAlpha = 1; }
  x.restore();
}

function charro_negro(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  // cavalo preto de perfil (silhueta limpa)
  x.fillStyle = O11.preto;
  x.beginPath(); x.ellipse(0, -46, 86, 34, 0, 0, 7); x.fill(); // tronco
  x.fillRect(-72, -46, 14, 46); x.fillRect(-48, -46, 14, 46); x.fillRect(40, -46, 14, 46); x.fillRect(64, -46, 14, 46); // 4 patas
  // pescoco + cabeca inclinados pra frente (direita)
  x.beginPath(); x.moveTo(70, -64); x.lineTo(104, -118); x.lineTo(124, -112); x.lineTo(132, -96); x.lineTo(100, -58); x.fill();
  x.beginPath(); x.moveTo(104, -118); x.lineTo(100, -132); x.lineTo(112, -116); x.fill(); // orelha
  // crina + rabo
  x.fillStyle = '#1a1420'; x.beginPath(); x.moveTo(70, -64); x.quadraticCurveTo(84, -96, 96, -110); x.lineTo(88, -108); x.quadraticCurveTo(74, -84, 64, -68); x.fill();
  x.beginPath(); x.moveTo(-82, -56); x.quadraticCurveTo(-110, -40, -104, 2); x.lineTo(-92, 0); x.quadraticCurveTo(-92, -40, -74, -54); x.fill();
  p11_olhos(120, -104, 5, 4, 'rgb(255,122,42)', t);
  // charro montado (chapeu largo)
  x.fillStyle = O11.manto; x.fillRect(-20, -116, 40, 74);
  x.fillStyle = '#efe9dc'; x.beginPath(); x.arc(0, -128, 16, 0, 7); x.fill();
  x.fillStyle = O11.chapeu; x.beginPath(); x.ellipse(0, -144, 48, 10, 0, 0, 7); x.fill(); x.fillRect(-16, -166, 32, 22);
  p11_olhos(0, -128, 6, 4, 'rgb(255,122,42)', t);
  x.restore();
}

function cadejo(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O11.pretoAzul; x.beginPath(); x.ellipse(0, -40, 80, 38, 0, 0, 7); x.fill(); // corpo
  x.fillRect(-60, -40, 14, 44); x.fillRect(-30, -40, 14, 44); x.fillRect(30, -40, 14, 44); x.fillRect(54, -40, 14, 44);
  x.beginPath(); x.moveTo(60, -56); x.quadraticCurveTo(100, -70, 96, -40); x.quadraticCurveTo(92, -30, 70, -34); x.fill(); // cabeca
  x.beginPath(); x.moveTo(84, -70); x.lineTo(78, -92); x.lineTo(96, -74); x.fill(); // orelha
  p11_olhos(86, -52, 7, 5, 'rgb(224,58,58)', t);
  x.restore();
}

function lechuza_bruja(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#3a3242'; x.beginPath(); x.ellipse(0, -60, 50, 70, 0, 0, 7); x.fill(); // corpo coruja
  const flap = Math.sin(t * 4) * 14;
  x.beginPath(); x.moveTo(-40, -70); x.quadraticCurveTo(-110, -90 + flap, -90, -40); x.quadraticCurveTo(-60, -50, -40, -40); x.fill();
  x.beginPath(); x.moveTo(40, -70); x.quadraticCurveTo(110, -90 + flap, 90, -40); x.quadraticCurveTo(60, -50, 40, -40); x.fill();
  // rosto de bruja (disco facial claro)
  x.fillStyle = '#d9cdb6'; x.beginPath(); x.arc(0, -96, 34, 0, 7); x.fill();
  p11_olhos(0, -100, 12, 7, 'rgb(255,207,74)', t);
  x.fillStyle = O11.chapeu; x.beginPath(); x.moveTo(-14, -124); x.lineTo(14, -124); x.lineTo(0, -116); x.fill(); // bico
  x.restore();
}

function duende(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#2a4a2a'; x.beginPath(); x.moveTo(-22, 0); x.lineTo(22, 0); x.lineTo(14, -54); x.lineTo(-14, -54); x.fill(); // corpinho
  x.fillStyle = O11.pele; x.beginPath(); x.arc(0, -66, 14, 0, 7); x.fill();
  x.fillStyle = '#b02a2a'; x.beginPath(); x.moveTo(-18, -74); x.lineTo(18, -74); x.lineTo(0, -120); x.fill(); // chapeu pontudo
  if (o.olhos !== false) p11_olhos(0, -66, 5, 3, 'rgb(255,207,74)', t);
  x.restore();
}

function nahual(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  // meio homem meio coiote: corpo em pe com cabeca de coiote
  x.fillStyle = '#3a2f22'; x.beginPath(); x.moveTo(-28, 0); x.lineTo(28, 0); x.lineTo(20, -150); x.lineTo(-20, -150); x.fill();
  x.beginPath(); x.moveTo(-20, -150); x.quadraticCurveTo(0, -168, 20, -150); x.lineTo(14, -186); x.lineTo(-14, -186); x.fill(); // pescoco
  x.beginPath(); x.moveTo(-16, -186); x.lineTo(16, -186); x.lineTo(28, -210); x.lineTo(-4, -222); x.lineTo(-28, -206); x.fill(); // focinho coiote
  x.beginPath(); x.moveTo(-18, -200); x.lineTo(-30, -236); x.lineTo(-6, -214); x.fill(); x.beginPath(); x.moveTo(18, -200); x.lineTo(30, -236); x.lineTo(6, -214); x.fill(); // orelhas
  p11_olhos(0, -204, 8, 4, 'rgb(255,122,42)', t);
  x.restore();
}

function sombreron(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O11.manto; x.beginPath(); x.moveTo(-34, 0); x.lineTo(34, 0); x.lineTo(24, -140); x.lineTo(-24, -140); x.fill();
  x.fillStyle = '#efe9dc'; x.beginPath(); x.arc(0, -156, 16, 0, 7); x.fill();
  // chapeu ENORME
  x.fillStyle = O11.chapeu; x.beginPath(); x.ellipse(0, -172, 90, 18, 0, 0, 7); x.fill(); x.fillRect(-26, -210, 52, 40); x.beginPath(); x.ellipse(0, -210, 26, 8, 0, 0, 7); x.fill();
  p11_olhos(0, -156, 6, 3, 'rgb(255,207,74)', t);
  x.restore();
}

function p11_siguanaba(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O11.branco; x.beginPath(); x.moveTo(-38, 0); x.lineTo(38, 0); x.lineTo(24, -210); x.lineTo(-24, -210); x.fill();
  x.fillStyle = '#efe9dc'; x.beginPath(); x.arc(0, -228, 24, 0, 7); x.fill();
  // cabelo longo pros lados, rosto vira ao fundo (vazio escuro, sem gore)
  x.fillStyle = O11.sombra; x.beginPath(); x.moveTo(-24, -244); x.quadraticCurveTo(-40, -140, -20, -100); x.lineTo(20, -100); x.quadraticCurveTo(40, -140, 24, -244); x.quadraticCurveTo(0, -220, -24, -244); x.fill();
  const vira = o.vira ?? 0; if (vira > 0.5) { x.fillStyle = O11.preto; x.beginPath(); x.arc(0, -228, 20, 0, 7); x.fill(); if (o.olhos) p11_olhos(0, -230, 6, 3, 'rgb(255,207,74)', t); }
  x.restore();
}

function tunda(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#2a3a2a'; x.beginPath(); x.moveTo(-34, 0); x.lineTo(34, 0); x.lineTo(22, -170); x.lineTo(-22, -170); x.fill();
  x.fillStyle = O11.pele; x.beginPath(); x.arc(0, -188, 20, 0, 7); x.fill();
  // uma perna de pau/molinillo (pata de pilao)
  x.fillStyle = O11.madeira; x.fillRect(-6, 0, 12, 40); x.beginPath(); x.ellipse(0, 40, 20, 10, 0, 0, 7); x.fill();
  if (o.olhos !== false) p11_olhos(0, -190, 6, 3, 'rgb(255,122,42)', t);
  x.restore();
}

function patasola(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O11.preto; x.beginPath(); x.moveTo(-30, 0); x.lineTo(30, 0); x.lineTo(14, -150); x.lineTo(-14, -150); x.fill(); // tronco com uma perna so (base estreita)
  x.beginPath(); x.arc(0, -168, 20, 0, 7); x.fill();
  p11_olhos(0, -172, 8, 5, 'rgb(224,58,58)', t);
  x.restore();
}

function mano_peluda(cx, base, s, o = {}, t = 0) {
  const sc = s; const sub = (o.dist ?? 1);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  // mao peluda saindo de baixo (dedos sobem)
  x.fillStyle = '#2a2420';
  for (let f = 0; f < 4; f++) { const fx = -30 + f * 20; x.fillRect(fx, 0, 14, -70 * sub); x.beginPath(); x.arc(fx + 7, -70 * sub, 7, 0, 7); x.fill(); }
  x.fillRect(-36, 0, 86, 24);
  // pelos
  x.strokeStyle = '#1a1612'; x.lineWidth = 2; for (let i = 0; i < 20; i++) { const hx = -34 + i * 4; x.beginPath(); x.moveTo(hx, -10 * sub); x.lineTo(hx + 2, -22 * sub); x.stroke(); }
  x.restore();
}

function nina_muneca(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = '#b84a6a'; x.beginPath(); x.moveTo(-28, 0); x.lineTo(28, 0); x.lineTo(16, -90); x.lineTo(-16, -90); x.fill(); // vestidinho
  x.fillStyle = '#e8d4c0'; x.beginPath(); x.arc(0, -108, 24, 0, 7); x.fill(); // cabeca boneca
  x.fillStyle = '#5a3a2a'; x.beginPath(); x.arc(0, -120, 24, Math.PI, 0); x.fill(); // franja
  const vira = o.vira ?? 0;
  if (vira > 0.5) { // vira o rosto: olhos vazios
    x.fillStyle = O11.preto; x.beginPath(); x.arc(-9, -108, 5, 0, 7); x.arc(9, -108, 5, 0, 7); x.fill();
  } else { x.fillStyle = '#2a6a9a'; x.beginPath(); x.arc(-9, -108, 5, 0, 7); x.arc(9, -108, 5, 0, 7); x.fill(); x.fillStyle = '#c04a4a'; x.beginPath(); x.arc(0, -96, 4, 0, 7); x.fill(); }
  x.restore();
}

function monja(cx, base, s, o = {}, t = 0) {
  const d = o.dist ?? 1; const sc = s * (0.4 + 0.6 * d);
  x.save(); x.translate(cx, base); x.scale(sc, sc);
  x.fillStyle = O11.sombra; x.beginPath(); x.moveTo(-40, 0); x.lineTo(40, 0); x.lineTo(24, -200); x.lineTo(-24, -200); x.fill(); // habito
  x.beginPath(); x.moveTo(-24, -200); x.quadraticCurveTo(0, -250, 24, -200); x.fill(); // veu
  // rosto sem rosto: oval escuro vazio
  x.fillStyle = '#1a1620'; x.beginPath(); x.ellipse(0, -214, 16, 20, 0, 0, 7); x.fill();
  if (o.olhos) p11_olhos(0, -216, 6, 3, 'rgb(230,230,220)', t);
  // cruz no peito
  x.strokeStyle = '#8a8a92'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, -140); x.lineTo(0, -110); x.moveTo(-10, -128); x.lineTo(10, -128); x.stroke();
  x.restore();
}

// mapa nome->funcao para f_aparicion
const O11_crea = { llorona, charro_negro, cadejo, lechuza_bruja, duende, nahual, sombreron, siguanaba: p11_siguanaba, tunda, patasola, mano_peluda, nina_muneca, monja };

// COMP.f_aparicion: fundo simples + criatura que se aproxima. p = {quien, lugar, dist:[a,b]}
COMP.f_aparicion = (t, lt, p) => {
  const quien = p.quien || 'llorona';
  const lugar = p.lugar;
  // fundo: usa uma peca de fundo simples se existir, senao noite
  if (lugar && typeof COMP[lugar] === 'function') { try { COMP[lugar](t, lt, {}); } catch (e) { if (typeof ceuFlat === 'function') ceuFlat('noite', t); } }
  else if (typeof ceuFlat === 'function') { ceuFlat('noite', t); x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, H * 0.72, W, H * 0.28); }
  // escurecer um pouco para a silhueta destacar
  x.fillStyle = 'rgba(10,8,20,0.35)'; x.fillRect(0, 0, W, H);
  // aproximacao: dist vai de a->b conforme lt
  const a = (p.dist && p.dist[0] != null) ? p.dist[0] : 0.2;
  const b = (p.dist && p.dist[1] != null) ? p.dist[1] : 0.9;
  const d = a + (b - a) * rng(1, lt);
  const fn = O11_crea[quien] || llorona;
  const base = H * (0.6 + 0.3 * d); const s = 0.6 + 0.8 * d;
  fn(W * 0.5, base, s, { dist: d, vira: rng(1, lt) > 0.6 ? 1 : 0, olhos: true }, t);
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.4, 0.82);
};
