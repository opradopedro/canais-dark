// Pacote 06 (06-china-historica). China antiga real, paleta china. Regras: KIRO-PROMPT.md secao C.
// Use com "paleta":"china". Cores TF() + neutras. Usa ceuFlat, figura, obj_*, fxFumaca, fxNeve, fxChuva dos pacotes 01-03.
//   f_china_rua f_palacio_china f_muralha_china f_templo_china f_arrozal f_bambuzal f_lago_china f_rio_china f_casa_china

const C6 = { laca: '#c8372d', ouro: '#f4c542', ouroEsc: '#c8961a', telhado: '#d8a830', muro: '#8a7a68', pedra: '#9a928a',
  madeira: '#7a5230', madeiraEsc: '#4a3018', jade: '#3fa88b', verde: '#4a7a4a', agua: '#4a8ca0', terra: '#b8956a' };

// telhado curvo chines (cx = centro, base = beiral, w = largura, cor)
function p6_telhado(cx, base, w, cor) {
  x.fillStyle = cor; x.beginPath(); x.moveTo(cx - w / 2 - 18, base); x.quadraticCurveTo(cx - w / 2, base - 10, cx - w * 0.3, base - 26);
  x.lineTo(cx + w * 0.3, base - 26); x.quadraticCurveTo(cx + w / 2, base - 10, cx + w / 2 + 18, base); x.closePath(); x.fill();
  x.fillStyle = 'rgba(0,0,0,0.15)'; x.fillRect(cx - w / 2, base - 8, w, 8);
}
function p6_lanterna(cx, cy, t, i) { const k = 0.9 + 0.1 * Math.sin(t * 4 + i); glow(cx, cy, 28 * k, 'rgba(230,80,60,0.35)'); x.fillStyle = C6.laca; x.beginPath(); x.ellipse(cx, cy, 14, 18, 0, 0, 7); x.fill(); x.fillStyle = C6.ouro; x.fillRect(cx - 8, cy - 20, 16, 4); x.fillRect(cx - 8, cy + 16, 16, 4); }

// f_china_rua: rua de Chang'an. p = {noite:true, tambor:true}
COMP.f_china_rua = (t, lt, p) => {
  const noite = p.noite;
  if (typeof ceuFlat === 'function') ceuFlat(noite ? 'noite' : 'tarde', t); else fundoFlat('#24434a', '#0e1b1e');
  // muros de quarteirao com portoes e telhados curvos ao fundo
  for (let k = 0; k < 2; k++) { const yy = H * (0.4 + k * 0.06); x.fillStyle = k ? '#6a5a48' : C6.muro; x.fillRect(0, yy, W, 50); for (let i = 0; i < 5; i++) p6_telhado(W * (0.12 + i * 0.2), yy, 120, C6.telhado); }
  // chao
  x.fillStyle = '#7a6a56'; x.fillRect(0, H * 0.52, W, H * 0.48);
  // lanternas vermelhas penduradas
  for (let i = 0; i < 6; i++) p6_lanterna(W * (0.1 + i * 0.16), H * 0.3 + (i % 2) * 20, t, i);
  // camelos da rota da seda + mercadores
  if (typeof figura === 'function') { figura(W * 0.3, H * 0.9, 0.8, { figurino: 'mercador', olhar: 1 }, t); figura(W * 0.6, H * 0.9, 0.8, { figurino: 'hanfu', olhar: -1 }, t); }
  if (typeof boi === 'function') boi(W * 0.8, H * 0.92, 0.9, { cor: '#b89a6a', olhar: -1, anda: p.noite ? 0 : 0.5 }, t);
  if (noite) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) p6_lanterna(W * (0.1 + i * 0.16), H * 0.3 + (i % 2) * 20, t, i); }
};

// f_palacio_china: patio de palacio imperial. p = {trono:true, audiencia:true}
COMP.f_palacio_china = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat('#6a8ca8', '#24434a');
  // escadaria + plataforma
  x.fillStyle = C6.pedra; for (let i = 0; i < 5; i++) x.fillRect(W * 0.2 + i * 10, H * 0.7 + i * 16, W * 0.6 - i * 20, 16);
  // salao: colunas vermelhas, telhado amarelo
  x.fillStyle = C6.laca; for (const px of [0.26, 0.4, 0.6, 0.74]) x.fillRect(W * px - 10, H * 0.42, 20, H * 0.3);
  p6_telhado(W * 0.5, H * 0.42, W * 0.6, C6.telhado); p6_telhado(W * 0.5, H * 0.34, W * 0.46, C6.ouro);
  // leoes de pedra
  x.fillStyle = C6.pedra; for (const px of [0.2, 0.8]) { x.beginPath(); x.ellipse(W * px, H * 0.78, 24, 20, 0, 0, 7); x.fill(); x.beginPath(); x.arc(W * px + (px < 0.5 ? 10 : -10), H * 0.72, 14, 0, 7); x.fill(); }
  if (p.trono) { x.fillStyle = C6.ouro; x.fillRect(W * 0.44, H * 0.5, W * 0.12, 60); if (typeof figura === 'function') figura(W * 0.5, H * 0.56, 0.7, { figurino: 'imperador_china', pose: 'senta' }, t); }
  if (p.audiencia && typeof multidao === 'function') multidao(0.3, 0.7, H * 0.86, 0.6, 5, { figurino: 'hanfu', formacao: 'fila' }, t);
};

// f_muralha_china: Grande Muralha. p = {sinal:N (torres acendendo), estacao}
COMP.f_muralha_china = (t, lt, p) => {
  const est = p.estacao;
  if (typeof ceuFlat === 'function') ceuFlat(est === 'inverno' ? 'noite' : 'tarde', t); else fundoFlat('#7a6a8a', '#24434a');
  // montanhas em camadas
  for (let k = 0; k < 3; k++) { x.fillStyle = ['#5a6a7a', '#4a5a6a', '#3a4a5a'][k]; x.beginPath(); x.moveTo(0, H * (0.4 + k * 0.1)); for (let i = 0; i <= 6; i++) x.lineTo(i / 6 * W, H * (0.4 + k * 0.1) - (i % 2 ? 110 : 30)); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }
  // muralha serpenteando
  x.strokeStyle = C6.muro; x.lineWidth = 34; x.lineCap = 'round'; x.beginPath(); x.moveTo(-20, H * 0.6); for (let i = 0; i <= 10; i++) x.lineTo(i / 10 * W, H * 0.6 - Math.sin(i * 0.8) * 60); x.stroke();
  x.strokeStyle = '#6a5a48'; x.lineWidth = 6; x.beginPath(); x.moveTo(-20, H * 0.6 - 18); for (let i = 0; i <= 10; i++) x.lineTo(i / 10 * W, H * 0.6 - 18 - Math.sin(i * 0.8) * 60); x.stroke();
  // torres de sinal (acendem em sequencia)
  const sinal = p.sinal ?? 0;
  for (let i = 0; i < 4; i++) { const tx = W * (0.15 + i * 0.24), ty = H * 0.6 - Math.sin(i * 2 * 0.8) * 60 - 30; x.fillStyle = C6.muro; x.fillRect(tx - 20, ty, 40, 50); if (i < sinal * clamp(lt * 1.5)) { if (typeof fxFumaca === 'function') fxFumaca(tx, ty - 6, t + i, 0.6); glow(tx, ty - 10, 40, 'rgba(246,160,60,0.4)'); } }
  if (est === 'inverno' && typeof fxNeve === 'function') fxNeve(t, 0.5);
};

// f_templo_china: templo/pagode na montanha. p = {sino:true, neve:true}
COMP.f_templo_china = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.neve ? 'noite' : 'dia', t); else fundoFlat('#6a8ca8', '#24434a');
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.6, 0.5);
  // montanha
  x.fillStyle = '#4a5a4a'; x.beginPath(); x.moveTo(0, H); x.lineTo(W * 0.5, H * 0.3); x.lineTo(W, H); x.fill();
  // pagode de 3 niveis
  x.save(); x.translate(W * 0.5, H * 0.72);
  for (let n = 0; n < 3; n++) { const w = 180 - n * 44, yy = -n * 120; x.fillStyle = C6.laca; x.fillRect(-w / 2 + 14, yy - 100, w - 28, 100); p6_telhado(0, yy - 100, w, C6.telhado); }
  x.fillStyle = C6.ouro; x.fillRect(-8, -360, 16, 40);
  x.restore();
  // monge
  if (typeof figura === 'function') figura(W * 0.3, H * 0.92, 0.7, { figurino: 'monge_budista', pose: 'reza' }, t);
  if (p.sino && typeof obj_sino === 'function') obj_sino(W * 0.76, H * 0.6, 1.4, {}, t);
  if (typeof fxFumaca === 'function') fxFumaca(W * 0.62, H * 0.84, t, 0.4);
  if (p.neve && typeof fxNeve === 'function') fxNeve(t, 0.5);
};

// f_arrozal: terracos de arroz. p = {chuva:true}
COMP.f_arrozal = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.chuva ? 'tempestade' : 'aurora', t); else fundoFlat('#8aa8c0', '#4a7a4a');
  // terracos espelhados
  for (let k = 0; k < 5; k++) { const yy = H * (0.45 + k * 0.1); x.fillStyle = k % 2 ? '#9ac0b0' : '#7aa890'; x.beginPath(); x.moveTo(0, yy); x.quadraticCurveTo(W / 2, yy - 20, W, yy); x.lineTo(W, yy + H * 0.1); x.lineTo(0, yy + H * 0.1); x.fill(); x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(0, yy + 4, W, 6); }
  // camponeses curvados + bufalo + chapeu conico
  if (typeof figura === 'function') { x.save(); x.translate(W * 0.3, H * 0.62); x.rotate(0.3); figura(0, 0, 0.5, { figurino: 'hanfu', pose: 'ajoelha' }, t); x.restore(); }
  if (typeof boi === 'function') boi(W * 0.62, H * 0.66, 0.7, { cor: '#3a3a42', olhar: -1, anda: 0.4 }, t);
  if (p.chuva && typeof fxChuva === 'function') fxChuva(t, 0.8);
};

// f_bambuzal: floresta de bambu. p = {vento:1, luta:true}
COMP.f_bambuzal = (t, lt, p) => {
  fundoFlat('#2e4a2e', '#16281a');
  // luz entrando
  if (typeof fxRaiosLuz === 'function') fxRaiosLuz(W * 0.6, H * 0.1, t, 0.8);
  // colmos de bambu balancando
  const vento = p.vento ?? 0.5;
  for (let i = 0; i < 12; i++) { const bx = (i / 11) * W + 20, sway = Math.sin(t * 1.4 + i) * 20 * vento; x.strokeStyle = i % 2 ? '#5a8a3a' : '#4a7a2e'; x.lineWidth = 14 + (i % 3) * 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, H); x.quadraticCurveTo(bx + sway * 0.5, H * 0.4, bx + sway, 0); x.stroke(); for (let s = H * 0.8; s > 0; s -= 120) { x.strokeStyle = '#3a5a22'; x.lineWidth = 3; x.beginPath(); x.moveTo(bx - 8, s); x.lineTo(bx + 8, s); x.stroke(); } }
  // caminho de pedra
  x.fillStyle = '#6a6a62'; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(W * 0.5, H * (0.82 + i * 0.04), 60 - i * 8, 16, 0, 0, 7); x.fill(); }
  if (p.luta && typeof figura === 'function') { figura(W * 0.35, H * 0.9, 0.8, { figurino: 'hanfu', pose: 'luta', arma: 'espada', olhar: 1 }, t); figura(W * 0.65, H * 0.9, 0.8, { figurino: 'hanfu', pose: 'luta', arma: 'espada', olhar: -1 }, t); }
};

// f_lago_china: Lago Oeste com pagode e ponte de arco. p = {cobra:true, chuva:true}
COMP.f_lago_china = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.chuva ? 'tempestade' : 'noite', t); else { fundoFlat('#3a4a6a', '#1a2a3a'); if (!p.chuva && typeof luaFlat === 'function') luaFlat(W * 0.7, H * 0.16, 56, 1, t); }
  // montanhas suaves
  x.fillStyle = '#3a4a5a'; x.beginPath(); x.moveTo(0, H * 0.5); x.quadraticCurveTo(W * 0.3, H * 0.38, W * 0.6, H * 0.46); x.quadraticCurveTo(W * 0.85, H * 0.4, W, H * 0.48); x.lineTo(W, H * 0.6); x.lineTo(0, H * 0.6); x.fill();
  // pagode Leifeng na margem
  x.save(); x.translate(W * 0.2, H * 0.56); for (let n = 0; n < 3; n++) { const w = 70 - n * 16; x.fillStyle = C6.madeiraEsc; x.fillRect(-w / 2 + 6, -n * 50 - 44, w - 12, 44); p6_telhado(0, -n * 50 - 44, w, '#5a4a3a'); } x.restore();
  // agua
  if (typeof fxOndas === 'function') fxOndas(0.6, t, C6.agua, '#1a2a3a'); else { x.fillStyle = C6.agua; x.fillRect(0, H * 0.6, W, H * 0.4); }
  // ponte de arco
  x.strokeStyle = C6.pedra; x.lineWidth = 16; x.beginPath(); x.arc(W * 0.62, H * 0.68, 90, Math.PI, 0); x.stroke();
  // salgueiros
  for (const px of [0.1, 0.9]) { x.strokeStyle = '#4a6a3a'; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(W * px + (i - 3) * 8, H * 0.46); x.quadraticCurveTo(W * px + (i - 3) * 10, H * 0.56, W * px + (i - 3) * 14 + Math.sin(t + i) * 6, H * 0.62); x.stroke(); } }
  if (p.cobra && typeof cobra === 'function') cobra(W * 0.5, H * 0.72, 1.0, { cor: '#e8e4da' }, t);
  if (p.chuva && typeof fxChuva === 'function') fxChuva(t, 0.8);
};

// f_rio_china: rio largo com junco e montanhas karst. p = {}
COMP.f_rio_china = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('aurora', t); else fundoFlat('#c0a8b8', '#6a8ca8');
  // montanhas karst (agulhas) com nevoa
  x.fillStyle = '#7a8a8a'; for (const px of [0.15, 0.3, 0.55, 0.78, 0.92]) { const h = 0.2 + rnd(px * 10) * 0.22; x.beginPath(); x.moveTo(W * px - 40, H * 0.55); x.quadraticCurveTo(W * px, H * (0.55 - h), W * px + 40, H * 0.55); x.fill(); }
  if (typeof fxNevoa === 'function') fxNevoa(t, 0.7, 0.5);
  // agua
  if (typeof fxOndas === 'function') fxOndas(0.6, t, C6.agua, '#3a5a6a'); else { x.fillStyle = C6.agua; x.fillRect(0, H * 0.6, W, H * 0.4); }
  // junco a vela
  if (typeof obj_junco === 'function') obj_junco(W * 0.5, H * 0.66, 1.4, {}, t);
  // pescador com cormorao
  if (typeof figura === 'function') figura(W * 0.2, H * 0.74, 0.5, { figurino: 'hanfu', pose: 'parado' }, t);
  if (typeof corvo === 'function') corvo(W * 0.26, H * 0.66, 0.4, {}, t);
};

// f_casa_china: interior de casa chinesa antiga. p = {}
COMP.f_casa_china = (t, lt, p) => {
  fundoFlat('#4a3a2e', '#2a2018');
  // biombo de papel
  x.fillStyle = '#e8dcc0'; x.fillRect(W * 0.1, H * 0.25, W * 0.4, H * 0.4); x.strokeStyle = C6.madeiraEsc; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(W * 0.1 + i * W * 0.1, H * 0.25); x.lineTo(W * 0.1 + i * W * 0.1, H * 0.65); x.stroke(); } x.beginPath(); x.moveTo(W * 0.1, H * 0.45); x.lineTo(W * 0.5, H * 0.45); x.stroke();
  // janela redonda
  x.fillStyle = '#2a3a4a'; x.beginPath(); x.arc(W * 0.78, H * 0.38, 70, 0, 7); x.fill(); x.strokeStyle = C6.madeira; x.lineWidth = 6; x.beginPath(); x.arc(W * 0.78, H * 0.38, 70, 0, 7); x.moveTo(W * 0.78 - 70, H * 0.38); x.lineTo(W * 0.78 + 70, H * 0.38); x.moveTo(W * 0.78, H * 0.38 - 70); x.lineTo(W * 0.78, H * 0.38 + 70); x.stroke();
  // mesa baixa com cha + lanterna
  x.fillStyle = C6.madeira; x.fillRect(W * 0.3, H * 0.72, W * 0.4, 20); x.fillRect(W * 0.32, H * 0.74, 14, 50); x.fillRect(W * 0.66, H * 0.74, 14, 50);
  if (typeof obj_bule_cha === 'function') obj_bule_cha(W * 0.5, H * 0.66, 0.8, {}, t);
  p6_lanterna(W * 0.5, H * 0.22, t, 0);
};
