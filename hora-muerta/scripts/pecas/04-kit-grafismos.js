// Pacote 04 (04-kit-grafismos). Telas de explicacao e transicao. Regras: KIRO-PROMPT.md secao C.
// Cores TF() + neutras. Texto nas areas livres (topo ate 18%, assunto 18-56%, legenda 58-68% limpa).
//   COMP.f_mapa f_linha_tempo f_titulo_epoca f_duelo f_ficha f_contagem f_comparar f_regras f_porta_tempo

const O4 = { tinta: '#2a1a14', mar: '#4a7a8c', terra: '#c8b48a', ouro: '#e3b94a', vermelho: '#b23b2e' };

// COMP.f_mapa: mapa antigo de pergaminho com costa/rios/montanhas; rota que se desenha, pontos com alfinete.
// p = {regiao: 'europa'|'grecia'|'china'|'mexico'|'mediterraneo'|'escandinavia'|'egito'|'japao'|'mundo',
//      rota: [[x,y],...] (0..1, desenha com lt), pontos: [{x,y,nome}], zoom}
// exemplo: {"linea":0,"comp":"f_mapa","p":{"regiao":"grecia","rota":[[0.2,0.4],[0.5,0.5],[0.8,0.3]],"pontos":[{"x":0.8,"y":0.3,"nome":"Sparta"}]}}
COMP.f_mapa = (t, lt, p) => {
  const T = TF();
  // fundo de pergaminho
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e7d7ad'); g.addColorStop(1, '#cdb988'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(120,90,50,0.5)'; x.lineWidth = 10; x.strokeRect(24, 24, W - 48, H - 48);
  // massas de terra (formas suaves por regiao, so decorativas)
  const seed = (p.regiao || 'mundo').length;
  x.fillStyle = '#b7a06a';
  for (let i = 0; i < 5; i++) { const cx = rnd(seed + i) * W, cy = H * (0.28 + rnd(seed + i * 2) * 0.5); x.beginPath(); x.ellipse(cx, cy, 120 + rnd(i) * 160, 80 + rnd(i * 3) * 120, rnd(i * 5) * 3, 0, 7); x.fill(); }
  // rios
  x.strokeStyle = O4.mar; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.15, H * 0.3); x.quadraticCurveTo(W * 0.4, H * 0.5, W * 0.3, H * 0.8); x.stroke();
  // montanhas
  x.fillStyle = '#8a7250'; for (let i = 0; i < 6; i++) { const mx = W * (0.3 + i * 0.09), my = H * 0.42; x.beginPath(); x.moveTo(mx - 26, my); x.lineTo(mx, my - 40); x.lineTo(mx + 26, my); x.fill(); }
  // rota tracejada que se desenha
  if (p.rota && p.rota.length > 1) {
    x.strokeStyle = O4.vermelho; x.lineWidth = 5; x.setLineDash([14, 10]); x.lineDashOffset = -t * 20;
    const n = p.rota.length, prog = clamp(lt * 1.3) * (n - 1);
    x.beginPath(); x.moveTo(p.rota[0][0] * W, p.rota[0][1] * H);
    for (let i = 1; i < n; i++) { const seg = Math.min(1, prog - (i - 1)); if (seg <= 0) break; const a = p.rota[i - 1], b = p.rota[i]; x.lineTo((a[0] + (b[0] - a[0]) * seg) * W, (a[1] + (b[1] - a[1]) * seg) * H); }
    x.stroke(); x.setLineDash([]);
  }
  // pontos com alfinete que cai
  for (const pt of (p.pontos || [])) {
    const px = pt.x * W, py = pt.y * H, drop = ease(clamp(lt * 2)) ;
    x.fillStyle = O4.vermelho; x.beginPath(); x.arc(px, py - (1 - drop) * 60, 11, 0, 7); x.fill(); x.fillStyle = '#7a1f16'; x.beginPath(); x.moveTo(px - 6, py - (1 - drop) * 60 + 6); x.lineTo(px + 6, py - (1 - drop) * 60 + 6); x.lineTo(px, py); x.fill();
    if (pt.nome) { x.fillStyle = O4.tinta; x.font = fonte('fonteTit', 34); x.textAlign = 'center'; x.fillText(pt.nome, px, py - 70); }
  }
};

// COMP.f_linha_tempo: faixa com anos, marcador que anda de p.de ate p.ate, rotulos p.marcos.
// p = {de: 480, ate: 300, rotulo:"BC", marcos:[{ano:480,texto:"Termopilas"},...]}
// exemplo: {"linea":0,"comp":"f_linha_tempo","p":{"de":490,"ate":479,"marcos":[{"ano":490,"texto":"Maratona"},{"ano":480,"texto":"Termopilas"}]}}
COMP.f_linha_tempo = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2);
  const y = H * 0.44, de = p.de ?? 0, ate = p.ate ?? 10;
  x.strokeStyle = T.creme; x.lineWidth = 8; x.beginPath(); x.moveTo(W * 0.1, y); x.lineTo(W * 0.9, y); x.stroke();
  const faixa = W * 0.8, x0 = W * 0.1;
  for (const m of (p.marcos || [])) {
    const fr = de === ate ? 0.5 : (m.ano - de) / (ate - de), px = x0 + fr * faixa;
    x.fillStyle = T.acento; x.beginPath(); x.arc(px, y, 9, 0, 7); x.fill();
    x.fillStyle = T.creme; x.font = fonte('fonteTit', 30); x.textAlign = 'center'; x.fillText(String(m.ano), px, y - 28);
    x.font = fonte('fonteTxt', 26); x.fillStyle = T.acento; x.save(); x.translate(px, y + 46); x.rotate(0.3); x.fillText(m.texto, 0, 0); x.restore();
  }
  // marcador que anda
  const prog = ease(clamp(lt * 1.1)), mx = x0 + prog * faixa;
  glow(mx, y, 50, T.luz); x.fillStyle = T.destaque; x.beginPath(); x.moveTo(mx, y - 18); x.lineTo(mx + 12, y - 36); x.lineTo(mx - 12, y - 36); x.fill();
  x.fillStyle = T.destaque; x.font = fonte('fonteTit', 64); x.textAlign = 'center'; x.fillText([p.rotulo].filter(Boolean).join(' ') || '', W / 2, H * 0.26);
};

// COMP.f_titulo_epoca: cartela de abertura com moldura por paleta. p = {titulo, sub}
// exemplo: {"linea":0,"comp":"f_titulo_epoca","p":{"titulo":"Sparta, 480 BC","sub":"The Hot Gates"}}
COMP.f_titulo_epoca = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2, [0.5, 0.42, 620]);
  const a = ease(clamp(lt * 3));
  x.save(); x.globalAlpha = a; x.textAlign = 'center'; x.textBaseline = 'middle';
  // moldura: grega (meandro), china (nuvens/selo), medieval/sv padrao
  x.strokeStyle = T.acento; x.lineWidth = 5;
  const mw = W * 0.74, mh = 300, mx = (W - mw) / 2, my = H * 0.42 - mh / 2;
  x.strokeRect(mx, my, mw, mh);
  if (CALMO() && ST.paleta === 'grecia') { x.lineWidth = 3; for (let i = 0; i < 10; i++) { const gx = mx + 30 + i * (mw - 60) / 9; x.strokeRect(gx, my - 14, 16, 8); x.strokeRect(gx, my + mh + 6, 16, 8); } }
  else if (CALMO() && ST.paleta === 'china') { x.fillStyle = '#c8372d'; x.fillRect(mx + mw - 54, my + mh - 54, 40, 40); }
  x.fillStyle = T.creme; x.font = fonte('fonteTit', 78); x.fillText(p.titulo || '', W / 2, H * 0.4);
  if (p.sub) { x.fillStyle = T.acento; x.font = fonte('fonteTxt', 40); x.fillText(p.sub, W / 2, H * 0.48); }
  x.restore();
};

// COMP.f_duelo: tela dividida na diagonal, dois personagens (p.esq, p.dir no formato de pessoa) + simbolo p.meio.
// exemplo: {"linea":0,"comp":"f_duelo","p":{"esq":{"figurino":"hoplita"},"dir":{"figurino":"legionario"},"meio":"VS"}}
COMP.f_duelo = (t, lt, p) => {
  const T = TF();
  // dois fundos
  x.fillStyle = T.fundo1; x.fillRect(0, 0, W, H);
  x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.clip(); fundoFlat('#3a2a2a', '#1a1010'); x.restore();
  x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.lineTo(W, 0); x.closePath(); x.clip(); fundoFlat('#2a2a3a', '#101018'); x.restore();
  x.strokeStyle = T.destaque; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, H); x.stroke();
  // figuras (usa figura do pacote 02 se existir, senao pessoa)
  if (typeof figura === 'function') { figura(W * 0.26, H * 0.62, 1.0, { ...(p.esq || { figurino: 'hoplita' }), olhar: 1 }, t); figura(W * 0.74, H * 0.52, 1.0, { ...(p.dir || { figurino: 'legionario' }), olhar: -1 }, t); }
  // simbolo no meio
  const m = p.meio || 'VS'; glow(W / 2, H * 0.4, 100, T.luz); x.fillStyle = T.destaque; x.font = fonte('fonteTit', 110); x.textAlign = 'center'; x.textBaseline = 'middle'; x.save(); x.translate(W / 2, H * 0.4); x.rotate(-0.08); x.fillText(m, 0, 0); x.restore();
};

// COMP.f_ficha: ficha de personagem, busto a esquerda + linhas com icone a direita (entram uma a uma).
// p = {pessoa:{...}, titulo, linhas:[{icone:'idade'|'peso'|'fome'|'frio'|'dinheiro'|'espada'|'hora'|'perigo', texto}]}
// exemplo: {"linea":0,"comp":"f_ficha","p":{"pessoa":{"figurino":"camponesa"},"titulo":"Agnes, 14","linhas":[{"icone":"fome","texto":"Hungry"},{"icone":"frio","texto":"Cold"}]}}
COMP.f_ficha = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2);
  // busto
  if (p.pessoa && p.pessoa.figurino && typeof figura === 'function') figura(W * 0.28, H * 0.66, 1.1, { ...p.pessoa, olhar: 1 }, t);
  else pessoa(W * 0.28, H * 0.46, 1.1, { ...(p.pessoa || {}), t });
  // painel de papel a direita
  papel(W * 0.5, H * 0.24, W * 0.42, 110 + (p.linhas || []).length * 76, -0.01);
  x.save(); x.translate(W * 0.5 + 30, H * 0.24 + 56); x.textAlign = 'left'; x.textBaseline = 'middle';
  x.fillStyle = T.perigo; x.font = fonte('fonteTit', 44); x.fillText(p.titulo || '', 0, 0);
  const marc = clamp(lt * 1.3) * ((p.linhas || []).length + 0.5);
  (p.linhas || []).forEach((ln, i) => { if (i >= marc) return; const yy = 70 + i * 76; p4_icone(ln.icone, 20, yy, T); x.fillStyle = T.tinta; x.font = fonte('fonteTxt', 40); x.fillText(ln.texto || '', 62, yy); });
  x.restore();
};
function p4_icone(ic, cx, cy, T) {
  x.save(); x.translate(cx, cy); x.strokeStyle = T.tinta; x.fillStyle = T.tinta; x.lineWidth = 3;
  if (ic === 'idade' || ic === 'hora') { x.beginPath(); x.arc(0, 0, 16, 0, 7); x.stroke(); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -10); x.moveTo(0, 0); x.lineTo(8, 4); x.stroke(); }
  else if (ic === 'peso') { x.fillRect(-14, -6, 28, 18); x.strokeRect(-14, -6, 28, 18); }
  else if (ic === 'fome') { x.beginPath(); x.ellipse(0, 0, 14, 10, 0, 0, 7); x.stroke(); x.beginPath(); x.moveTo(-4, -10); x.lineTo(-4, 12); x.moveTo(4, -10); x.lineTo(4, 12); x.stroke(); }
  else if (ic === 'frio') { for (let i = 0; i < 3; i++) { x.save(); x.rotate(i * Math.PI / 3); x.beginPath(); x.moveTo(-14, 0); x.lineTo(14, 0); x.stroke(); x.restore(); } }
  else if (ic === 'dinheiro') { x.fillStyle = O4.ouro; x.beginPath(); x.arc(0, 0, 14, 0, 7); x.fill(); x.fillStyle = '#a8841a'; x.font = '700 18px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$', 0, 1); }
  else if (ic === 'espada') { x.beginPath(); x.moveTo(0, -16); x.lineTo(0, 10); x.moveTo(-8, 8); x.lineTo(8, 8); x.stroke(); }
  else if (ic === 'perigo') { x.fillStyle = O4.vermelho; x.beginPath(); x.moveTo(0, -16); x.lineTo(16, 12); x.lineTo(-16, 12); x.fill(); x.fillStyle = '#fff'; x.font = '700 16px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('!', 0, 4); }
  else { x.beginPath(); x.arc(0, 0, 10, 0, 7); x.stroke(); }
  x.restore();
}

// COMP.f_contagem: numero grande que conta de p.de ate p.ate. p = {de,ate,rotulo}
// exemplo: {"linea":0,"comp":"f_contagem","p":{"de":0,"ate":300,"rotulo":"Spartans"}}
COMP.f_contagem = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2, [0.5, 0.4, 620]);
  const de = p.de ?? 0, ate = p.ate ?? 100, val = Math.round(de + (ate - de) * ease(clamp(lt * 1.2)));
  glow(W / 2, H * 0.4, 160, T.luz);
  x.fillStyle = T.destaque; x.font = fonte('fonteTit', 220); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(val), W / 2, H * 0.4);
  if (p.rotulo) { x.fillStyle = T.creme; x.font = fonte('fonteTit', 56); x.fillText(p.rotulo, W / 2, H * 0.54); }
};

// COMP.f_comparar: duas colunas (then/now, rule/reality) com 3 itens cada. p = {esq:{titulo,itens:[]}, dir:{...}}
// exemplo: {"linea":0,"comp":"f_comparar","p":{"esq":{"titulo":"RULE","itens":["No talking","Lights on","Door shut"]},"dir":{"titulo":"REALITY","itens":["A voice","Dark","Open"]}}}
COMP.f_comparar = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2);
  x.strokeStyle = T.acento; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2, H * 0.2); x.lineTo(W / 2, H * 0.56); x.stroke();
  const col = (c, x0, cor) => { if (!c) return; x.textAlign = 'center'; x.fillStyle = cor; x.font = fonte('fonteTit', 44); x.fillText(c.titulo || '', x0, H * 0.24); x.font = fonte('fonteTxt', 38); x.fillStyle = T.creme; (c.itens || []).forEach((it, i) => { if (i >= clamp(lt * 1.4) * 3.5) return; x.fillText(it, x0, H * 0.32 + i * 60); }); };
  col(p.esq, W * 0.26, T.ok); col(p.dir, W * 0.74, T.perigo);
};

// COMP.f_regras: lista de regras grande em papel/pergaminho, item por item com visto. p = {titulo, itens:[], marcados}
// exemplo: {"linea":0,"comp":"f_regras","p":{"titulo":"THE RULES","itens":["Close the gate","Do not answer","Keep a candle lit"]}}
COMP.f_regras = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo1, T.fundo2);
  cartao({ tipo: 'lista', titulo: p.titulo || 'RULES', itens: p.itens || [], marcados: p.marcados, y: 0.2 }, lt);
};

// COMP.f_porta_tempo: transicao, o mundo dobra como pagina e revela a cor da proxima epoca. p = {de,para (cores ou nada)}
// exemplo: {"linea":0,"comp":"f_porta_tempo","p":{}}
COMP.f_porta_tempo = (t, lt, p) => {
  const T = TF();
  fundoFlat(T.fundo2, '#0a0a12');
  const prog = ease(clamp(lt));
  // metade de cima dobra
  x.save(); x.fillStyle = T.fundo1; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, H * 0.5 * (1 - prog)); x.lineTo(0, H * 0.5 * (1 - prog)); x.fill(); x.restore();
  glow(W / 2, H * 0.5, 300 * prog, T.luz);
  // linha de luz no vinco
  x.strokeStyle = T.destaque; x.globalAlpha = 1 - prog; x.lineWidth = 6; x.beginPath(); x.moveTo(0, H * 0.5); x.lineTo(W, H * 0.5); x.stroke(); x.globalAlpha = 1;
};
