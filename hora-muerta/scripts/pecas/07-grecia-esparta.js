// Pacote 07 (07-grecia-esparta). Grecia e Esparta, paleta grecia. Regras: KIRO-PROMPT.md secao C.
// Use com "paleta":"grecia". Cores TF() + neutras. Usa ceuFlat, figura, multidao, fxPoeira, fxFlechas, fxOndas dos pacotes 01-03.
//   f_esparta f_agoge f_syssitia f_falange f_termopilas f_templo_grego f_agora f_mar_egeu

const G7 = { marmore: '#efe7d2', pedra: '#c8b48a', pedraEsc: '#a08a60', terra: '#b8956a', oliva: '#6a7a4a',
  bronze: '#b5892f', vermelho: '#9a2d22', azul: '#3a6a8c', ocre: '#d9893b', coluna: '#e4dcc4' };

// coluna dorica (cx, base, altura, larg)
function p7_coluna(cx, base, h, w) {
  x.fillStyle = G7.coluna; x.fillRect(cx - w / 2, base - h, w, h);
  x.fillStyle = G7.pedraEsc; for (let i = 0; i < 4; i++) x.fillRect(cx - w / 2 + 2 + i * (w / 4), base - h, 2, h);
  x.fillStyle = G7.marmore; x.fillRect(cx - w / 2 - 4, base - h - 10, w + 8, 10); x.fillRect(cx - w / 2 - 6, base - 6, w + 12, 6);
}

// f_esparta: vila SEM muralha ao pe do Taigeto, templos simples, oliveiras, rio. p = {ceu, treino:true}
COMP.f_esparta = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.ceu || 'dia', t); else fundoFlat('#c89a6a', '#7a3b22');
  // monte Taigeto ao fundo
  x.fillStyle = '#8a7a6a'; x.beginPath(); x.moveTo(0, H * 0.5); x.lineTo(W * 0.3, H * 0.2); x.lineTo(W * 0.55, H * 0.4); x.lineTo(W * 0.8, H * 0.22); x.lineTo(W, H * 0.45); x.lineTo(W, H); x.lineTo(0, H); x.fill();
  x.fillStyle = '#e4dcc4'; x.beginPath(); x.moveTo(W * 0.3, H * 0.2); x.lineTo(W * 0.24, H * 0.3); x.lineTo(W * 0.36, H * 0.3); x.fill(); // pico nevado
  // chao
  x.fillStyle = '#9a8a5a'; x.fillRect(0, H * 0.55, W, H * 0.45);
  // templos simples (sem muralha!)
  for (const px of [0.2, 0.7]) { const bx = W * px, by = H * 0.56; p7_coluna(bx - 24, by, 70, 14); p7_coluna(bx + 24, by, 70, 14); x.fillStyle = G7.marmore; x.beginPath(); x.moveTo(bx - 44, by - 80); x.lineTo(bx + 44, by - 80); x.lineTo(bx, by - 110); x.fill(); }
  // oliveiras
  for (const px of [0.4, 0.85]) { x.fillStyle = G7.madeira || '#7a5230'; x.fillRect(W * px - 6, H * 0.6, 12, 60); x.fillStyle = G7.oliva; x.beginPath(); x.arc(W * px, H * 0.56, 40, 0, 7); x.fill(); }
  // rio Eurotas
  x.fillStyle = G7.azul; x.beginPath(); x.moveTo(0, H * 0.82); x.quadraticCurveTo(W * 0.5, H * 0.78, W, H * 0.84); x.lineTo(W, H * 0.9); x.lineTo(0, H * 0.88); x.fill();
  if (p.treino && typeof multidao === 'function') multidao(0.3, 0.6, H * 0.76, 0.5, 3, { figurino: 'menino_esparta', pose: 'corre', formacao: 'fila' }, t);
};

// f_agoge: patio de treino. p = {atividade:'corrida'|'luta'|'frio'|'fome'}
COMP.f_agoge = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.atividade === 'frio' ? 'noite' : 'dia', t); else fundoFlat('#c89a6a', '#7a3b22');
  x.fillStyle = '#b89a6a'; x.fillRect(0, H * 0.5, W, H * 0.5);
  // muro baixo de pedra
  x.fillStyle = G7.pedra; x.fillRect(0, H * 0.46, W, 30);
  const at = p.atividade || 'corrida';
  if (typeof fxPoeira === 'function' && (at === 'corrida' || at === 'luta')) fxPoeira(t, 0.6, 0.8);
  if (typeof figura === 'function') {
    if (at === 'corrida') { for (let i = 0; i < 3; i++) figura(W * (0.3 + i * 0.18), H * 0.86, 0.7, { figurino: 'menino_esparta', pose: 'corre', olhar: 1 }, t + i * 0.3); }
    else if (at === 'luta') { figura(W * 0.4, H * 0.86, 0.8, { figurino: 'menino_esparta', pose: 'luta', olhar: 1 }, t); figura(W * 0.6, H * 0.86, 0.8, { figurino: 'menino_esparta', pose: 'luta', olhar: -1 }, t); }
    else if (at === 'frio') { figura(W * 0.5, H * 0.9, 0.8, { figurino: 'menino_esparta', pose: 'senta', expressao: 'triste' }, t); x.fillStyle = G7.oliva; for (let i = 0; i < 8; i++) x.fillRect(W * 0.4 + i * 14, H * 0.88, 10, 24); } // junco
    else { figura(W * 0.5, H * 0.86, 0.8, { figurino: 'menino_esparta', expressao: 'triste' }, t); }
    // instrutor
    figura(W * 0.82, H * 0.86, 0.9, { figurino: 'hoplita', pose: 'aponta', olhar: -1 }, t);
  }
};

// f_syssitia: refeitorio comunitario. p = {caldo:true (close da tigela)}
COMP.f_syssitia = (t, lt, p) => {
  fundoFlat('#5a3a24', '#2a1810');
  if (p.caldo) { // close da tigela de caldo negro fumegante
    glow(W / 2, H * 0.42, 300, 'rgba(255,190,120,0.12)');
    x.fillStyle = G7.pedra; x.beginPath(); x.ellipse(W / 2, H * 0.5, 180, 120, 0, 0, 7); x.fill();
    x.fillStyle = '#2a2016'; x.beginPath(); x.ellipse(W / 2, H * 0.46, 150, 90, 0, 0, 7); x.fill();
    if (typeof fxFumaca === 'function') fxFumaca(W / 2, H * 0.4, t, 0.6);
    return;
  }
  // mesa longa, homens deitados de lado
  x.fillStyle = G7.madeira || '#7a5230'; x.fillRect(W * 0.1, H * 0.6, W * 0.8, 30);
  if (typeof multidao === 'function') multidao(0.2, 0.8, H * 0.58, 0.55, 5, { figurino: 'hoplita', pose: 'senta', formacao: 'fila' }, t);
  // tigelas na mesa
  x.fillStyle = G7.pedra; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(W * (0.22 + i * 0.14), H * 0.6, 20, 8, 0, 0, 7); x.fill(); }
  // pao de cevada
  x.fillStyle = '#c89a52'; x.beginPath(); x.ellipse(W * 0.5, H * 0.6, 26, 12, 0, 0, 7); x.fill();
};

// f_falange: linha de hoplitas de lado com escudos sobrepostos. p = {avanca:0..1}
COMP.f_falange = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('tarde', t); else fundoFlat('#c89a6a', '#7a3b22');
  x.fillStyle = '#9a8a5a'; x.fillRect(0, H * 0.6, W, H * 0.4);
  if (typeof fxPoeira === 'function') fxPoeira(t, 0.7, 0.85);
  const av = rng(p.avanca ?? 0, lt) * 40;
  // lancas erguidas atras
  x.strokeStyle = G7.madeira || '#7a5230'; x.lineWidth = 5; for (let i = 0; i < 6; i++) { const lx = W * (0.2 + i * 0.12) + av; x.beginPath(); x.moveTo(lx, H * 0.7); x.lineTo(lx + 30, H * 0.3); x.stroke(); x.fillStyle = G7.bronze; x.beginPath(); x.moveTo(lx + 26, H * 0.3); x.lineTo(lx + 34, H * 0.3); x.lineTo(lx + 36, H * 0.26); x.fill(); }
  // escudos redondos sobrepostos
  for (let i = 0; i < 6; i++) { const sx = W * (0.2 + i * 0.12) + av; x.fillStyle = G7.bronze; x.beginPath(); x.arc(sx, H * 0.66, 46, 0, 7); x.fill(); x.strokeStyle = '#8a6a1a'; x.lineWidth = 4; x.stroke(); x.fillStyle = '#4a3410'; x.font = '700 40px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('\u039B', sx, H * 0.66); }
  // flautista (aulos)
  if (typeof figura === 'function') figura(W * 0.9, H * 0.9, 0.7, { figurino: 'hoplita', pose: 'parado', olhar: -1 }, t);
};

// f_termopilas: desfiladeiro, mar a direita, montanha a esquerda, muro focio, exercito persa ao fundo. p = {flechas:t, atras:true}
COMP.f_termopilas = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('tarde', t); else fundoFlat('#c89a6a', '#7a3b22');
  // montanha a esquerda
  x.fillStyle = '#6a5a4a'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, H * 0.2); x.lineTo(W * 0.4, H * 0.5); x.lineTo(W * 0.35, H); x.fill();
  // mar a direita
  if (typeof fxOndas === 'function') { x.save(); x.beginPath(); x.rect(W * 0.6, 0, W * 0.4, H); x.clip(); fxOndas(0.4, t, G7.azul, '#1a3a4a'); x.restore(); } else { x.fillStyle = G7.azul; x.fillRect(W * 0.6, H * 0.4, W * 0.4, H * 0.6); }
  // passagem no meio com muro de pedra
  x.fillStyle = '#9a8a6a'; x.fillRect(W * 0.35, H * 0.55, W * 0.25, H * 0.45);
  x.fillStyle = G7.pedra; x.fillRect(W * 0.36, H * 0.52, W * 0.23, 24);
  // exercito persa enorme no horizonte (silhuetas pequenas)
  x.fillStyle = 'rgba(40,30,30,0.5)'; for (let i = 0; i < 24; i++) { x.fillRect(W * (0.38 + (i % 12) * 0.018), H * 0.4 - Math.floor(i / 12) * 10, 6, 16); }
  // espartanos na passagem
  if (typeof figura === 'function') { figura(W * 0.44, H * 0.9, 0.7, { figurino: 'hoplita', arma: 'lanca', escudo: 'esparta', olhar: 1 }, t); figura(W * 0.52, H * 0.9, 0.7, { figurino: 'hoplita', arma: 'lanca', escudo: 'esparta', olhar: 1 }, t); }
  if (p.flechas != null && typeof fxFlechas === 'function') fxFlechas(t, p.flechas, 1);
  if (p.atras) { x.strokeStyle = 'rgba(40,30,20,0.5)'; x.setLineDash([10, 8]); x.lineWidth = 4; x.beginPath(); x.moveTo(W * 0.1, H * 0.5); x.lineTo(W * 0.3, H * 0.3); x.stroke(); x.setLineDash([]); }
};

// f_templo_grego: templo com colunas e frontao, estatua, oraculo. p = {oraculo:true}
COMP.f_templo_grego = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat('#8aa8c0', '#7a3b22');
  x.fillStyle = '#9a8a6a'; x.fillRect(0, H * 0.72, W, H * 0.28);
  // plataforma
  x.fillStyle = G7.marmore; x.fillRect(W * 0.12, H * 0.7, W * 0.76, 20);
  // colunas
  for (let i = 0; i < 6; i++) p7_coluna(W * (0.2 + i * 0.12), H * 0.7, 230, 30);
  // frontao
  x.fillStyle = G7.marmore; x.fillRect(W * 0.16, H * 0.44, W * 0.68, 30);
  x.beginPath(); x.moveTo(W * 0.14, H * 0.44); x.lineTo(W * 0.86, H * 0.44); x.lineTo(W * 0.5, H * 0.3); x.fill();
  // estatua dentro
  if (typeof figura === 'function') figura(W * 0.5, H * 0.68, 0.9, { figurino: 'hoplita', roupa: G7.bronze, olhar: 1 }, t);
  if (p.oraculo && typeof fxFumaca === 'function') { fxFumaca(W * 0.5, H * 0.66, t, 0.7); if (typeof figura === 'function') figura(W * 0.3, H * 0.92, 0.7, { figurino: 'dama', pose: 'reza' }, t); }
};

// f_agora: praca de Atenas. p = {}
COMP.f_agora = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('dia', t); else fundoFlat('#8aa8c0', '#7a3b22');
  x.fillStyle = '#b89a6a'; x.fillRect(0, H * 0.6, W, H * 0.4);
  // estoa (fileira de colunas atras)
  for (let i = 0; i < 8; i++) p7_coluna(W * (0.08 + i * 0.12), H * 0.58, 130, 18);
  x.fillStyle = G7.marmore; x.fillRect(0, H * 0.43, W, 16);
  // anforas
  x.fillStyle = G7.ocre; for (const px of [0.15, 0.85]) { x.beginPath(); x.ellipse(W * px, H * 0.76, 18, 30, 0, 0, 7); x.fill(); }
  // filosofo falando a um grupo
  if (typeof figura === 'function') { figura(W * 0.3, H * 0.9, 0.8, { figurino: 'senhor', pose: 'aponta', roupa: G7.marmore, olhar: 1 }, t); }
  if (typeof multidao === 'function') multidao(0.5, 0.75, H * 0.9, 0.6, 3, { figurino: 'mercador', formacao: 'grupo', olhar: -1 }, t);
};

// f_mar_egeu: mar azul com trirreme, ilhas, golfinhos. p = {tempestade:true}
COMP.f_mar_egeu = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat(p.tempestade ? 'tempestade' : 'dia', t); else fundoFlat('#8aa8c0', '#3a6a8c');
  // ilhas no horizonte
  x.fillStyle = '#8a7a6a'; for (const px of [0.15, 0.5, 0.82]) { x.beginPath(); x.moveTo(W * px - 70, H * 0.48); x.quadraticCurveTo(W * px, H * 0.4, W * px + 70, H * 0.48); x.fill(); x.fillStyle = '#efe7d2'; x.fillRect(W * px - 8, H * 0.43, 10, 10); x.fillStyle = '#8a7a6a'; }
  // mar
  if (typeof fxOndas === 'function') fxOndas(0.5, t, G7.azul, '#1a3a4a'); else { x.fillStyle = G7.azul; x.fillRect(0, H * 0.5, W, H * 0.5); }
  // trirreme
  if (typeof obj_trirreme === 'function') obj_trirreme(W * 0.5, H * 0.62, 1.6, { anda: !p.tempestade }, t);
  // golfinhos
  if (!p.tempestade) for (const px of [0.25, 0.75]) { x.fillStyle = '#5a7a8c'; x.save(); x.translate(W * px, H * 0.78 + Math.sin(t * 2 + px * 10) * 10); x.beginPath(); x.ellipse(0, 0, 40, 16, -0.4, 0, 7); x.fill(); x.beginPath(); x.moveTo(-36, -6); x.lineTo(-56, -22); x.lineTo(-30, -14); x.fill(); x.restore(); }
  if (p.tempestade && typeof fxChuva === 'function') fxChuva(t, 0.8);
};
