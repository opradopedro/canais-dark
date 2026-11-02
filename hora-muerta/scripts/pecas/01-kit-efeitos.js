// Pacote 01 (01-kit-efeitos). Efeitos e ceus usados por TODOS os pacotes. Regras: KIRO-PROMPT.md secao C.
// Cada fx desenha POR CIMA do que ja esta na tela. f = forca 0..1. t = segundos (continuo). Cores: so TF() + neutras.
// Nunca redefinir funcoes que ja existem no engine (TF, glow, rnd, rng, ease, lerp, clamp, fundoFlat, W, H, x).
//
// Resumo (exemplos de cena no fim de cada bloco):
//   fxChuva(t,f,vento) fxNeve(t,f) fxNevoa(t,f,y) fxFumaca(cx,cy,t,f) fxFogo(cx,cy,s,t) fxFagulhas(cx,cy,t,f)
//   fxFolhas(t,f,cor) fxPetalas(t,f,cor) fxVagalumes(t,f) fxPoeira(t,f,y) fxRelampago(t,quando) fxOndas(y,t,c1,c2)
//   fxRaiosLuz(cx,cy,t,f) fxBrilhoMagico(cx,cy,t,f) fxPuff(cx,cy,t,t0) fxFlechas(t,t0,f)
//   ceuFlat(tipo,t) luaFlat(cx,cy,r,fase,t) estrelasFlat(t,n)   +   COMP.f_ceu

// ---- chuva: riscos finos inclinados + respingos no chao ----
// exemplo: {"linea": 2, "comp": "f_aldeia", "p": {"chuva": 1}}  (muitas pecas chamam fxChuva pelo seu proprio p.chuva)
function fxChuva(t, f = 1, vento = 0.25) {
  const n = Math.round(90 * f);
  x.save(); x.strokeStyle = 'rgba(200,220,235,0.5)'; x.lineWidth = 2; x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const sp = 900 + rnd(i) * 700, yy = ((t * sp + rnd(i * 3.3) * H * 2) % (H + 120)) - 60;
    const xx = (rnd(i * 7.1) * (W + 300) - 150 + yy * vento) % (W + 300) - 150;
    x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx - 10 * vento, yy + 26); x.stroke();
  }
  // respingos
  x.strokeStyle = 'rgba(200,220,235,0.35)';
  for (let i = 0; i < Math.round(24 * f); i++) {
    const xx = rnd(i * 2.2) * W, r = 4 + (t * 3 + rnd(i) * 3) % 3 * 6;
    x.beginPath(); x.arc(xx, H * (0.9 + rnd(i * 5) * 0.08), r, Math.PI, 0); x.stroke();
  }
  x.restore();
}

// ---- neve: flocos redondos caindo com balanco ----
// exemplo: {"comp": "f_aldeia", "p": {"neve": 1, "ceu": "noite"}}
function fxNeve(t, f = 1) {
  const n = Math.round(120 * f);
  x.save(); x.fillStyle = 'rgba(245,248,255,0.9)';
  for (let i = 0; i < n; i++) {
    const sp = 60 + rnd(i) * 90, yy = ((t * sp + rnd(i * 3.1) * H * 2) % (H + 60)) - 30;
    const xx = rnd(i * 7.7) * W + Math.sin(t * 1.4 + i) * (14 + rnd(i * 2) * 20);
    const r = 2 + rnd(i * 9) * 4;
    x.globalAlpha = 0.5 + rnd(i * 4) * 0.5; x.beginPath(); x.arc(xx, yy, r, 0, 7); x.fill();
  }
  x.restore();
}

// ---- nevoa: faixas chapadas translucidas que deslizam na altura y (0..1) ----
// exemplo: {"comp": "f_floresta", "p": {"nevoa": 0.8}}
function fxNevoa(t, f = 0.6, y = 0.72) {
  x.save();
  for (let i = 0; i < 4; i++) {
    const yy = H * y + i * 46 - 60, off = ((t * (18 + i * 8) + i * 300) % (W + 600)) - 300;
    x.fillStyle = `rgba(220,225,235,${0.08 + 0.05 * f})`;
    x.beginPath(); x.ellipse(off + W * 0.3, yy, 420, 40, 0, 0, 7); x.ellipse(off + W * 0.75, yy + 10, 360, 34, 0, 0, 7); x.fill();
  }
  x.restore();
}

// ---- fumaca: coluna de bolinhas que sobem, crescem e somem (chamine, incenso, fogueira) ----
// exemplo: {"comp": "f_casa", "p": {}}  (usado por dentro de outras pecas)
function fxFumaca(cx, cy, t, f = 1) {
  x.save();
  for (let i = 0; i < Math.round(10 * f); i++) {
    const ph = (t * 0.5 + i / 10) % 1, yy = cy - ph * 240, r = 8 + ph * 34;
    const sway = Math.sin(t * 1.2 + i * 2) * 30 * ph;
    x.fillStyle = `rgba(190,190,200,${0.3 * (1 - ph)})`;
    x.beginPath(); x.arc(cx + sway, yy, r, 0, 7); x.fill();
  }
  x.restore();
}

// ---- fogo: fogueira/tocha flat, 3 camadas de chama tremendo + brilho ----
// exemplo: {"comp": "f_aldeia", "p": {}}  (chamada por dentro de pecas; cx,cy = base da chama, s = tamanho)
function fxFogo(cx, cy, s = 1, t = 0) {
  const T = TF(), k = 0.82 + 0.12 * Math.sin(t * 9 + cx) + 0.06 * Math.sin(t * 19);
  glow(cx, cy - 40 * s, 180 * s * k, 'rgba(246,160,60,0.4)');
  const camadas = [[48, 'rgba(214,90,40,0.9)'], [34, T.acento], [18, T.creme]];
  for (const [h, col] of camadas) {
    x.fillStyle = col; x.beginPath();
    const hh = h * s * k, w = h * 0.7 * s;
    x.moveTo(cx - w, cy);
    x.quadraticCurveTo(cx - w * 0.6, cy - hh * 0.6, cx + Math.sin(t * 7) * 6 * s, cy - hh);
    x.quadraticCurveTo(cx + w * 0.6, cy - hh * 0.6, cx + w, cy);
    x.quadraticCurveTo(cx, cy - hh * 0.2, cx - w, cy); x.fill();
  }
  // brasas na base
  x.fillStyle = 'rgba(120,60,40,0.9)'; x.beginPath(); x.ellipse(cx, cy, 36 * s, 10 * s, 0, 0, 7); x.fill();
}

// ---- fagulhas: faiscas subindo (forja, fogueira) ----
// exemplo: {"comp": "f_forja", "p": {}}
function fxFagulhas(cx, cy, t, f = 1) {
  x.save();
  for (let i = 0; i < Math.round(22 * f); i++) {
    const ph = (t * 0.9 + rnd(i) ) % 1, yy = cy - ph * 300, xx = cx + Math.sin(t * 3 + i) * 50 * ph + (rnd(i * 2) - 0.5) * 40;
    x.fillStyle = `rgba(255,${160 + Math.round(rnd(i * 3) * 70)},70,${1 - ph})`;
    x.beginPath(); x.arc(xx, yy, 2 + rnd(i * 5) * 2, 0, 7); x.fill();
  }
  x.restore();
}

// ---- folhas de outono caindo e girando ----
// exemplo: {"comp": "f_campo", "p": {"estacao": "outono"}}
function fxFolhas(t, f = 1, cor = '#c8762f') {
  x.save();
  for (let i = 0; i < Math.round(40 * f); i++) {
    const sp = 70 + rnd(i) * 70, yy = ((t * sp + rnd(i * 3) * H * 2) % (H + 60)) - 30;
    const xx = rnd(i * 7) * W + Math.sin(t * 1.6 + i) * 60, rot = t * 2 + i;
    x.save(); x.translate(xx, yy); x.rotate(rot); x.fillStyle = cor; x.globalAlpha = 0.85;
    x.beginPath(); x.ellipse(0, 0, 9, 5, 0, 0, 7); x.fill(); x.restore();
  }
  x.restore();
}

// ---- petalas (flor de pessego rosa / cempasuchil laranja) ----
// exemplo: {"comp": "f_montanha_flores", "p": {"petalas": 1}}
function fxPetalas(t, f = 1, cor = '#f4a6c0') {
  x.save();
  for (let i = 0; i < Math.round(46 * f); i++) {
    const sp = 55 + rnd(i) * 55, yy = ((t * sp + rnd(i * 2.7) * H * 2) % (H + 60)) - 30;
    const xx = rnd(i * 6.3) * W + Math.sin(t * 1.9 + i * 1.3) * 70;
    x.save(); x.translate(xx, yy); x.rotate(Math.sin(t * 2 + i) * 1.2); x.fillStyle = cor; x.globalAlpha = 0.9;
    x.beginPath(); x.ellipse(0, 0, 7, 4, 0.6, 0, 7); x.fill(); x.restore();
  }
  x.restore();
}

// ---- vagalumes: pontinhos que piscam e flutuam ----
// exemplo: {"comp": "f_selva", "p": {"vagalumes": 1}}
function fxVagalumes(t, f = 1) {
  x.save();
  for (let i = 0; i < Math.round(26 * f); i++) {
    const xx = rnd(i) * W + Math.sin(t * 0.7 + i) * 50, yy = H * (0.4 + rnd(i * 3) * 0.5) + Math.cos(t * 0.6 + i) * 40;
    const a = 0.3 + 0.7 * Math.abs(Math.sin(t * 2.5 + i * 2));
    glow(xx, yy, 24, `rgba(190,240,120,${0.25 * a})`); x.fillStyle = `rgba(220,255,150,${a})`;
    x.beginPath(); x.arc(xx, yy, 3, 0, 7); x.fill();
  }
  x.restore();
}

// ---- poeira de estrada / batalha levantando do chao ----
// exemplo: {"comp": "f_falange", "p": {"poeira": 1}}
function fxPoeira(t, f = 1, y = 0.82) {
  x.save();
  for (let i = 0; i < Math.round(16 * f); i++) {
    const ph = (t * 0.4 + rnd(i)) % 1, xx = rnd(i * 3) * W, yy = H * y - ph * 120;
    x.fillStyle = `rgba(190,170,130,${0.22 * (1 - ph) * f})`;
    x.beginPath(); x.arc(xx + Math.sin(t + i) * 20, yy, 30 + ph * 50, 0, 7); x.fill();
  }
  x.restore();
}

// ---- relampago: clarao rapido + raio em zigue-zague no ceu ----
// quando = tempo (s) do flash; dura ~0.4s. Ex.: {"comp": "f_ceu", "p": {"tipo": "tempestade", "relampago": 2.0}}
function fxRelampago(t, quando) {
  if (quando == null) return;
  const dt = t - quando; if (dt < 0 || dt > 0.45) return;
  const a = dt < 0.08 ? dt / 0.08 : Math.max(0, 1 - (dt - 0.08) / 0.37);
  x.save(); x.fillStyle = `rgba(230,235,255,${0.5 * a})`; x.fillRect(0, 0, W, H);
  x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath();
  let px = W * (0.3 + rnd(Math.floor(quando * 10)) * 0.4), py = 0;
  x.moveTo(px, py);
  for (let i = 0; i < 7; i++) { px += (rnd(i + quando) - 0.5) * 120; py += H * 0.09; x.lineTo(px, py); }
  x.stroke(); x.restore();
}

// ---- ondas: mar/rio flat em 3 camadas ondulando (y = altura da linha d'agua 0..1) ----
// exemplo: {"comp": "f_mar_egeu", "p": {}}
function fxOndas(y, t, c1, c2) {
  const T = TF(); c1 = c1 || T.acento2; c2 = c2 || T.fundo2;
  x.save();
  for (let k = 0; k < 3; k++) {
    const yy = H * y + k * 40;
    x.fillStyle = k === 0 ? c1 : (k === 1 ? mezcla(c1, c2, 0.5) : c2);
    x.beginPath(); x.moveTo(0, yy);
    for (let xx = 0; xx <= W; xx += 40) x.lineTo(xx, yy + Math.sin(xx * 0.01 + t * (1.5 - k * 0.3) + k) * (10 + k * 4));
    x.lineTo(W, H); x.lineTo(0, H); x.fill();
  }
  x.restore();
}
// mistura simples de duas cores hex #rrggbb
function mezcla(a, b, k) {
  const pa = /#(..)(..)(..)/.exec(a), pb = /#(..)(..)(..)/.exec(b);
  if (!pa || !pb) return a;
  const m = (i) => Math.round(parseInt(pa[i], 16) * (1 - k) + parseInt(pb[i], 16) * k);
  return `rgb(${m(1)},${m(2)},${m(3)})`;
}

// ---- raios de luz: feixes de luz (janela de igreja, ceu divino, Buda) ----
// exemplo: {"comp": "f_igreja", "p": {}}
function fxRaiosLuz(cx, cy, t, f = 1) {
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = -3; i <= 3; i++) {
    const a = (0.04 + 0.03 * Math.abs(Math.sin(t * 0.8 + i))) * f;
    x.fillStyle = `rgba(255,236,180,${a})`;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + i * 70 - 90, H); x.lineTo(cx + i * 70 + 90, H); x.fill();
  }
  x.restore();
}

// ---- brilho magico: estrelinhas girando (magia, imortalidade, transformacao) ----
// exemplo: {"comp": "f_pomar_pessegos", "p": {}}
function fxBrilhoMagico(cx, cy, t, f = 1) {
  x.save();
  for (let i = 0; i < Math.round(16 * f); i++) {
    const an = t * 1.5 + i / 16 * 7, r = 40 + (i % 4) * 30 + Math.sin(t * 2 + i) * 14;
    const xx = cx + Math.cos(an) * r, yy = cy + Math.sin(an) * r, a = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i));
    estrelinha(xx, yy, 5 + (i % 3) * 3, `rgba(255,236,160,${a})`);
  }
  x.restore();
}
function estrelinha(cx, cy, r, cor) {
  x.fillStyle = cor; x.save(); x.translate(cx, cy);
  x.beginPath(); for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.moveTo(0, 0); x.quadraticCurveTo(r * 0.3, r * 0.3, 0, r); x.quadraticCurveTo(-r * 0.3, r * 0.3, 0, 0); } x.fill(); x.restore();
}

// ---- puff: nuvem de fumaca redonda que estoura (transformacao do Wukong, sumico) ----
// t0 = instante do estouro. Ex.: {"comp": "f_caminho_oeste", "p": {"puff": 1.5}}
function fxPuff(cx, cy, t, t0) {
  if (t0 == null) return; const dt = t - t0; if (dt < 0 || dt > 0.7) return;
  const ph = dt / 0.7, r = 20 + ph * 130, a = 1 - ph;
  x.save(); x.fillStyle = `rgba(235,235,245,${0.7 * a})`;
  for (let i = 0; i < 8; i++) { const an = i / 8 * 7; x.beginPath(); x.arc(cx + Math.cos(an) * r, cy + Math.sin(an) * r, 26 + ph * 20, 0, 7); x.fill(); }
  x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.restore();
}

// ---- flechas: chuva de flechas cruzando o ceu (Termopilas) ----
// t0 = instante da saraivada. Ex.: {"comp": "f_termopilas", "p": {"flechas": 2}}
function fxFlechas(t, t0, f = 1) {
  if (t0 == null) return; const dt = t - t0; if (dt < 0 || dt > 1.4) return;
  x.save(); x.strokeStyle = 'rgba(40,30,24,0.85)'; x.lineWidth = 3; x.lineCap = 'round';
  for (let i = 0; i < Math.round(60 * f); i++) {
    const sp = 1.0 + rnd(i) * 0.3, ph = (dt / 1.4) * sp + rnd(i * 2) * 0.2; if (ph > 1) continue;
    const x0 = rnd(i * 3) * W, arc = -H * 0.2;
    const xx = x0 + ph * 260 - 130, yy = H * 0.1 + Math.sin(ph * Math.PI) * arc + ph * H * 0.7;
    x.save(); x.translate(xx, yy); x.rotate(Math.atan2(1, -0.3)); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 24); x.stroke();
    x.fillStyle = 'rgba(40,30,24,0.85)'; x.beginPath(); x.moveTo(-4, 2); x.lineTo(4, 2); x.lineTo(0, -6); x.fill(); x.restore();
  }
  x.restore();
}

// ---- lua com fase 0..1 e halo ----
// exemplo: luaFlat(W*0.75, H*0.14, 70, 0.5, t)
function luaFlat(cx, cy, r, fase = 1, t = 0) {
  glow(cx, cy, r * 3.2, 'rgba(255,248,225,0.2)');
  x.fillStyle = '#f3ecd2'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  if (fase < 0.98) { x.fillStyle = 'rgba(0,0,0,0.001)'; x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.clip();
    x.fillStyle = 'rgba(20,16,30,0.55)'; x.beginPath(); x.arc(cx + r * (1 - fase) * 2, cy, r, 0, 7); x.fill(); x.restore(); }
  x.fillStyle = 'rgba(200,190,170,0.3)'; x.beginPath(); x.arc(cx - r * 0.3, cy - r * 0.2, r * 0.16, 0, 7); x.arc(cx + r * 0.2, cy + r * 0.25, r * 0.1, 0, 7); x.fill();
}

// ---- estrelas piscando (posicoes fixas com rnd, iguais em todo render) ----
// exemplo: estrelasFlat(t, 60)
function estrelasFlat(t, n = 50) {
  x.save();
  for (let i = 0; i < n; i++) {
    const a = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.2 + i * 7));
    x.fillStyle = `rgba(255,245,225,${0.6 * a})`;
    x.beginPath(); x.arc(rnd(i) * W, rnd(i * 3.1) * H * 0.45, 1 + rnd(i * 5) * 2.2, 0, 7); x.fill();
  }
  x.restore();
}

// ---- ceu inteiro: tipo = aurora|dia|tarde|por|noite|tempestade|eclipse|boreal|dez_sois|estrelas ----
// usado como fundo por outras pecas. Desenha sol/lua e nuvens flat passando.
function ceuFlat(tipo = 'dia', t = 0) {
  const paletas = {
    aurora: ['#f4b98a', '#8a6fb0'], dia: ['#7cc3e8', '#cfeaf5'], tarde: ['#f0a861', '#b85c7a'],
    por: ['#e8713e', '#3b2250'], noite: ['#1b2440', '#070a16'], tempestade: ['#45505e', '#1b2029'],
    eclipse: ['#2a2238', '#0c0812'], boreal: ['#0e2436', '#05101c'], dez_sois: ['#e66a2a', '#7a2418'], estrelas: ['#141a30', '#05070f'],
  };
  const [c1, c2] = paletas[tipo] || paletas.dia;
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const noturno = tipo === 'noite' || tipo === 'estrelas' || tipo === 'boreal' || tipo === 'eclipse';
  if (noturno) estrelasFlat(t, 60);
  if (tipo === 'boreal') { x.save(); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { x.fillStyle = `rgba(90,230,170,${0.08 + 0.04 * Math.sin(t + i)})`; x.beginPath(); x.moveTo(0, H * (0.18 + i * 0.08));
      for (let xx = 0; xx <= W; xx += 40) x.lineTo(xx, H * (0.18 + i * 0.08) + Math.sin(xx * 0.006 + t + i) * 50); x.lineTo(W, 0); x.lineTo(0, 0); x.fill(); } x.restore(); }
  if (tipo === 'dez_sois') { for (let i = 0; i < 10; i++) { const sx = W * (0.08 + (i % 5) * 0.21), sy = H * (0.08 + Math.floor(i / 5) * 0.12);
      glow(sx, sy, 90, 'rgba(255,200,90,0.4)'); x.fillStyle = '#ffd24a'; x.beginPath(); x.arc(sx, sy, 30, 0, 7); x.fill();
      x.fillStyle = '#d6471f'; x.beginPath(); x.arc(sx - 8, sy - 6, 7, 0, 7); x.fill(); } }
  else if (tipo === 'noite' || tipo === 'estrelas') luaFlat(W * 0.76, H * 0.13, 64, 1, t);
  else if (tipo === 'eclipse') { glow(W * 0.5, H * 0.16, 240, 'rgba(255,140,80,0.3)'); x.fillStyle = '#0c0812'; x.beginPath(); x.arc(W * 0.5, H * 0.16, 70, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,180,110,0.8)'; x.lineWidth = 6; x.stroke(); }
  else if (!noturno) { const sy = tipo === 'por' ? H * 0.3 : (tipo === 'tarde' ? H * 0.22 : H * 0.14); const sc = tipo === 'por' || tipo === 'tarde' ? '#ffd98a' : '#fff4c8';
    glow(W * 0.7, sy, 220, 'rgba(255,230,160,0.35)'); x.fillStyle = sc; x.beginPath(); x.arc(W * 0.7, sy, 52, 0, 7); x.fill(); }
  // nuvens flat passando (nao na tempestade pesada)
  const nn = tipo === 'tempestade' ? 5 : 3, cc = noturno ? 'rgba(120,120,150,0.22)' : 'rgba(255,255,255,0.45)';
  for (let i = 0; i < nn; i++) { const nx = ((t * (9 + i * 5) + i * 420) % (W + 520)) - 260, ny = H * (0.1 + i * 0.07);
    x.fillStyle = cc; x.beginPath(); x.roundRect(nx - 150, ny - 24, 300, 48, 24); x.roundRect(nx - 40, ny - 44, 170, 48, 24); x.fill(); }
}

// COMP.f_ceu: so o ceu, para planos de passagem de tempo e abertura.
// p = {tipo: (ceuFlat), lua: 0..1 (fase; forca noite com lua), chuva: 0..1, neve: 0..1, nevoa: 0..1, relampago: t(s)}
// exemplo: {"linea": 0, "comp": "f_ceu", "p": {"tipo": "tempestade", "relampago": 1.5, "chuva": 1}}
COMP.f_ceu = (t, lt, p) => {
  const tipo = p.tipo || 'dia';
  ceuFlat(tipo, t);
  // ceuFlat ja desenha a lua em noite/estrelas; so adiciona uma lua propria se o ceu nao tiver
  if (p.lua != null && tipo !== 'noite' && tipo !== 'estrelas') luaFlat(W * 0.5, H * 0.18, 90, rng(p.lua, lt), t);
  // horizonte simples para o ceu nunca ficar vazio embaixo
  x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.moveTo(0, H * 0.82); x.quadraticCurveTo(W * 0.5, H * 0.78, W, H * 0.82); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  if (p.nevoa) fxNevoa(t, rng(p.nevoa, lt), 0.78);
  if (p.chuva) fxChuva(t, rng(p.chuva, lt));
  if (p.neve) fxNeve(t, rng(p.neve, lt));
  if (p.relampago != null) fxRelampago(t, p.relampago);
};
