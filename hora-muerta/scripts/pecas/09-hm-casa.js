// Pacote 09 (09-hm-casa). Hora Muerta: casa e lugares domesticos. Paleta padrao HM (violeta). Regras: KIRO-PROMPT.md secao C.
// Hora Muerta e o canal padrao (sem "tema"/"paleta"). Placas em espanhol. Cores TF() + neutras.
//   f_cocina f_cuarto f_altar f_telefono f_bano f_azotea f_vecindad f_sala

const H9 = { parede: '#3a2f4a', paredeEsc: '#241c33', madeira: '#5a4030', madeiraEsc: '#3a2818', azulejo: '#6a7a8a',
  vela: '#f6b24a', cempa: '#ff8a2a', vermelho: '#d6354a', creme: '#efe4cc', metal: '#8a8a92', noite: '#2a1f3d' };

// f_cocina: cozinha de avo. p = {porta:0..1 (porta do quintal), abuela:true, olla:true}
COMP.f_cocina = (t, lt, p) => {
  fundoFlat('#3a2d2a', '#1f1618');
  // parede com janela de noite
  x.fillStyle = H9.noite; x.fillRect(W * 0.08, H * 0.2, W * 0.26, H * 0.26); x.strokeStyle = H9.madeira; x.lineWidth = 6; x.strokeRect(W * 0.08, H * 0.2, W * 0.26, H * 0.26); if (typeof luaFlat === 'function') { x.save(); x.beginPath(); x.rect(W * 0.08, H * 0.2, W * 0.26, H * 0.26); x.clip(); luaFlat(W * 0.26, H * 0.28, 30, 1, t); x.restore(); }
  // altar de parede com fotos e velas
  x.fillStyle = H9.madeira; x.fillRect(W * 0.62, H * 0.3, W * 0.26, 16); x.fillStyle = H9.creme; x.fillRect(W * 0.66, H * 0.22, 40, 50); x.fillStyle = '#5a4a6a'; x.fillRect(W * 0.7, H * 0.24, 32, 42);
  if (typeof velaFlat === 'function') { velaFlat(W * 0.76, H * 0.3, 0.8, 1, t); velaFlat(W * 0.84, H * 0.3, 0.8, 1, t); }
  // fogao a lenha com panela
  x.fillStyle = '#2a2420'; x.fillRect(W * 0.1, H * 0.58, W * 0.3, H * 0.22); glow(W * 0.25, H * 0.64, 70, 'rgba(246,120,40,0.3)');
  if (p.olla !== false) { x.fillStyle = '#1a1612'; x.beginPath(); x.ellipse(W * 0.25, H * 0.6, 54, 26, 0, 0, 7); x.fill(); if (typeof fxFumaca === 'function') fxFumaca(W * 0.25, H * 0.56, t, 0.5); }
  // porta do quintal
  const pt = rng(p.porta ?? 0, lt); x.fillStyle = H9.noite; x.fillRect(W * 0.78, H * 0.52, W * 0.14 * (0.2 + pt), H * 0.4); x.fillStyle = H9.madeiraEsc; x.fillRect(W * 0.78, H * 0.52, 8, H * 0.4);
  // chao
  x.fillStyle = '#2e2420'; x.fillRect(0, H * 0.8, W, H * 0.2);
  if (p.abuela && typeof figura === 'function') figura(W * 0.5, H * 0.94, 0.8, { figurino: 'abuela', pose: 'parado' }, t);
};

// f_cuarto: quarto. p = {espejo:true (reflexo atrasado), sombra:true}
COMP.f_cuarto = (t, lt, p) => {
  fundoFlat(H9.parede, H9.paredeEsc, [0.3, 0.3, 400]);
  // cama com colcha
  x.fillStyle = H9.madeira; x.fillRect(W * 0.1, H * 0.6, W * 0.4, H * 0.3); x.fillStyle = '#6a4a6a'; x.fillRect(W * 0.1, H * 0.56, W * 0.4, 30); x.fillStyle = H9.creme; x.beginPath(); x.ellipse(W * 0.18, H * 0.56, 40, 16, 0, 0, 7); x.fill();
  // janela com lua
  x.fillStyle = H9.noite; x.fillRect(W * 0.1, H * 0.2, W * 0.24, H * 0.26); if (typeof luaFlat === 'function') { x.save(); x.beginPath(); x.rect(W * 0.1, H * 0.2, W * 0.24, H * 0.26); x.clip(); luaFlat(W * 0.28, H * 0.28, 28, 1, t); x.restore(); } x.fillStyle = H9.madeira; x.fillRect(W * 0.21, H * 0.2, 6, H * 0.26);
  // espelho com reflexo ATRASADO (desenha pessoa com atraso)
  if (p.espejo) { x.fillStyle = H9.metal; x.fillRect(W * 0.6, H * 0.26, W * 0.24, H * 0.4); x.fillStyle = '#4a4458'; x.fillRect(W * 0.62, H * 0.28, W * 0.2, H * 0.36); x.save(); x.beginPath(); x.rect(W * 0.62, H * 0.28, W * 0.2, H * 0.36); x.clip(); if (typeof pessoa === 'function') pessoa(W * 0.72, H * 0.66, 0.5, { t: t - 0.6, expressao: 'medo' }); x.restore(); }
  // porta entreaberta com sombra
  if (p.sombra) { x.fillStyle = '#1a1420'; x.fillRect(W * 0.86, H * 0.44, W * 0.12, H * 0.46); const s = 0.5 + 0.5 * Math.sin(t); x.fillStyle = 'rgba(0,0,0,' + (0.4 * s) + ')'; x.beginPath(); x.ellipse(W * 0.9, H * 0.7, 30, 80, 0, 0, 7); x.fill(); }
  x.fillStyle = H9.paredeEsc; x.fillRect(0, H * 0.9, W, H * 0.1);
};

// f_altar: altar de Dia de Muertos. p = {foto:true, vela_apaga:0..1}
COMP.f_altar = (t, lt, p) => {
  fundoFlat(H9.noite, '#140f22', [0.5, 0.4, 500]);
  // papel picado no topo
  for (let i = 0; i < 8; i++) { x.fillStyle = [H9.cempa, H9.vermelho, '#7fe0c4', '#f6b24a'][i % 4]; x.beginPath(); x.moveTo(W * (0.08 + i * 0.12), H * 0.1); x.lineTo(W * (0.14 + i * 0.12), H * 0.1); x.lineTo(W * (0.11 + i * 0.12), H * 0.16); x.fill(); }
  // degraus do altar
  for (let k = 0; k < 3; k++) { x.fillStyle = k % 2 ? '#4a3a5a' : '#5a4068'; x.fillRect(W * (0.2 + k * 0.04), H * (0.5 + k * 0.1), W * (0.6 - k * 0.08), H * 0.1); }
  // foto no centro
  if (p.foto !== false) { x.fillStyle = H9.creme; x.fillRect(W * 0.44, H * 0.34, W * 0.12, H * 0.16); x.fillStyle = '#5a4a6a'; x.fillRect(W * 0.46, H * 0.36, W * 0.08, H * 0.12); x.fillStyle = '#3a2f4a'; x.beginPath(); x.arc(W * 0.5, H * 0.42, 16, 0, 7); x.fill(); }
  // cempasuchil
  if (typeof cempa === 'function') for (let i = 0; i < 8; i++) cempa(W * (0.24 + i * 0.07), H * (0.56 + (i % 2) * 0.04), 12);
  // velas (uma apaga)
  const apaga = rng(p.vela_apaga ?? 0, lt);
  if (typeof velaFlat === 'function') { velaFlat(W * 0.3, H * 0.6, 1, 1, t); velaFlat(W * 0.5, H * 0.7, 1, 1 - apaga, t); velaFlat(W * 0.7, H * 0.6, 1, 1, t); }
  // pao de morto + caveira de acucar
  if (typeof obj_caveira_acucar === 'function') obj_caveira_acucar(W * 0.38, H * 0.76, 0.4, {}, t);
  if (typeof obj_pao === 'function') obj_pao(W * 0.62, H * 0.78, 0.5, {}, t);
};

// f_telefono: close de telefone. p = {tipo:'disco'|'celular', quien, texto}
COMP.f_telefono = (t, lt, p) => {
  fundoFlat(H9.parede, H9.paredeEsc, [0.5, 0.42, 480]);
  const tipo = p.tipo || 'disco';
  if (tipo === 'disco') {
    const tremor = Math.sin(t * 30) * 3; x.save(); x.translate(W * 0.5 + tremor, H * 0.44);
    x.fillStyle = '#1a1420'; x.beginPath(); x.roundRect(-120, -40, 240, 160, 24); x.fill(); x.fillStyle = '#2a2230'; x.beginPath(); x.arc(0, 60, 70, 0, 7); x.fill(); x.fillStyle = H9.creme; for (let i = 0; i < 10; i++) { const a = i / 10 * 7; x.beginPath(); x.arc(Math.cos(a) * 46, 60 + Math.sin(a) * 46, 8, 0, 7); x.fill(); }
    x.fillStyle = '#1a1420'; x.beginPath(); x.roundRect(-130, -90, 260, 50, 20); x.fill();
    x.restore();
  } else {
    x.fillStyle = '#1a1420'; x.beginPath(); x.roundRect(W * 0.5 - 90, H * 0.26, 180, 320, 24); x.fill(); x.fillStyle = '#3a4a5a'; x.beginPath(); x.roundRect(W * 0.5 - 78, H * 0.3, 156, 280, 12); x.fill();
    if (p.quien) { x.fillStyle = TF().destaque; x.font = fonte('fonteTit', 44); x.textAlign = 'center'; x.fillText(p.quien, W * 0.5, H * 0.4); }
    if (p.texto) { x.fillStyle = TF().creme; x.font = fonte('fonteTxt', 30); x.textAlign = 'center'; x.fillText(String(p.texto).slice(0, 16), W * 0.5, H * 0.5); }
  }
  // mao que hesita
  if (typeof pessoa === 'function') { x.fillStyle = TF()['creme']; }
  x.fillStyle = '#c2875e'; x.beginPath(); x.ellipse(W * 0.5, H * 0.86, 40, 30, 0, 0, 7); x.fill(); for (let i = 0; i < 4; i++) x.fillRect(W * 0.5 - 30 + i * 18, H * 0.8, 12, 30);
};

// f_bano: banheiro velho. p = {escrito:"texto" (no vapor do espelho)}
COMP.f_bano = (t, lt, p) => {
  fundoFlat('#2e3a40', '#1a2228');
  // azulejos
  x.strokeStyle = 'rgba(255,255,255,0.06)'; x.lineWidth = 2; for (let yy = 0; yy < H * 0.7; yy += 50) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke(); } for (let xx = 0; xx < W; xx += 50) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, H * 0.7); x.stroke(); }
  // espelho embacado
  x.fillStyle = 'rgba(200,210,215,0.3)'; x.fillRect(W * 0.3, H * 0.2, W * 0.4, H * 0.3); x.strokeStyle = H9.metal; x.lineWidth = 6; x.strokeRect(W * 0.3, H * 0.2, W * 0.4, H * 0.3);
  if (p.escrito) { x.fillStyle = 'rgba(40,50,55,0.8)'; x.font = fonte('fonteTit', 56); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(p.escrito, W * 0.5, H * 0.35); }
  // pia + torneira pingando
  x.fillStyle = H9.creme; x.beginPath(); x.ellipse(W * 0.5, H * 0.66, 90, 30, 0, 0, 7); x.fill(); x.fillStyle = H9.metal; x.fillRect(W * 0.5 - 8, H * 0.58, 16, 20);
  const drip = (t % 1.5) / 1.5; x.fillStyle = 'rgba(150,200,220,0.7)'; x.beginPath(); x.arc(W * 0.5, H * 0.6 + drip * 50, 4, 0, 7); x.fill();
};

// f_azotea: laje a noite. p = {vulto:true}
COMP.f_azotea = (t, lt, p) => {
  if (typeof ceuFlat === 'function') ceuFlat('noite', t); else fundoFlat(H9.noite, '#140f22');
  // laje
  x.fillStyle = '#4a4050'; x.fillRect(0, H * 0.62, W, H * 0.38);
  // tanque de agua
  x.fillStyle = '#3a3242'; x.fillRect(W * 0.08, H * 0.42, W * 0.2, H * 0.2);
  // varal com lencol balancando
  x.strokeStyle = '#2a2230'; x.lineWidth = 2; x.beginPath(); x.moveTo(W * 0.35, H * 0.5); x.lineTo(W * 0.75, H * 0.5); x.stroke();
  const sw = Math.sin(t * 1.5) * 10; x.fillStyle = H9.creme; x.beginPath(); x.moveTo(W * 0.42, H * 0.5); x.quadraticCurveTo(W * 0.44 + sw * 0.01, H * 0.6, W * 0.42 + sw, H * 0.68); x.lineTo(W * 0.52 + sw, H * 0.68); x.quadraticCurveTo(W * 0.54, H * 0.6, W * 0.52, H * 0.5); x.fill();
  // antenas
  x.strokeStyle = '#2a2230'; x.lineWidth = 3; x.beginPath(); x.moveTo(W * 0.85, H * 0.62); x.lineTo(W * 0.85, H * 0.4); x.moveTo(W * 0.8, H * 0.46); x.lineTo(W * 0.9, H * 0.46); x.stroke();
  // vulto em outra laje
  if (p.vulto) { x.fillStyle = 'rgba(20,15,30,0.85)'; x.beginPath(); x.ellipse(W * 0.9, H * 0.56, 24, 50, 0, 0, 7); x.fill(); x.fillStyle = H9.vermelho; x.beginPath(); x.arc(W * 0.88, H * 0.48, 2.5, 0, 7); x.arc(W * 0.92, H * 0.48, 2.5, 0, 7); x.fill(); }
};

// f_vecindad: patio de cortico. p = {puerta:true (porta acesa)}
COMP.f_vecindad = (t, lt, p) => {
  fundoFlat(H9.noite, '#140f22');
  // predio com portas numeradas
  x.fillStyle = H9.parede; x.fillRect(0, H * 0.2, W, H * 0.8);
  for (let i = 0; i < 4; i++) { const px = W * (0.1 + i * 0.22); x.fillStyle = H9.madeiraEsc; x.fillRect(px, H * 0.55, W * 0.1, H * 0.3); x.fillStyle = H9.creme; x.font = fonte('fonteTit', 24); x.textAlign = 'center'; x.fillText(String(i + 1), px + W * 0.05, H * 0.52); }
  // uma porta com luz
  if (p.puerta !== false) { const px = W * 0.32; glow(px + W * 0.05, H * 0.7, 80, 'rgba(246,178,74,0.3)'); x.fillStyle = H9.vela; x.fillRect(px, H * 0.55, W * 0.1, H * 0.3); x.fillStyle = H9.madeiraEsc; x.fillRect(px, H * 0.55, 6, H * 0.3); }
  // escada de ferro + varais
  x.strokeStyle = H9.metal; x.lineWidth = 4; for (let i = 0; i < 6; i++) x.strokeRect(W * 0.84, H * 0.3 + i * 30, 50, 4); x.beginPath(); x.moveTo(W * 0.84, H * 0.3); x.lineTo(W * 0.84, H * 0.85); x.moveTo(W * 0.89, H * 0.3); x.lineTo(W * 0.89, H * 0.85); x.stroke();
  x.strokeStyle = '#3a3242'; x.lineWidth = 2; x.beginPath(); x.moveTo(W * 0.1, H * 0.3); x.lineTo(W * 0.5, H * 0.3); x.stroke(); x.fillStyle = H9.creme; x.fillRect(W * 0.22, H * 0.3, 30, 40);
};

// f_sala: sala de casa. p = {tele:true (TV com chuvisco), toca:true}
COMP.f_sala = (t, lt, p) => {
  fundoFlat(H9.parede, H9.paredeEsc, [0.3, 0.4, 420]);
  // sofa
  x.fillStyle = '#5a3a4a'; x.fillRect(W * 0.08, H * 0.6, W * 0.4, H * 0.24); x.fillStyle = '#6a4458'; x.fillRect(W * 0.08, H * 0.54, W * 0.4, 30);
  // TV de tubo
  x.fillStyle = '#2a2420'; x.fillRect(W * 0.58, H * 0.5, W * 0.3, H * 0.26); x.fillStyle = p.tele ? '#8a8a92' : '#1a1612'; x.fillRect(W * 0.61, H * 0.53, W * 0.24, H * 0.2);
  if (p.tele) { for (let i = 0; i < 120; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.1 + rnd(i + Math.floor(t * 10)) * 0.3) + ')'; x.fillRect(W * 0.61 + rnd(i) * W * 0.24, H * 0.53 + rnd(i * 2) * H * 0.2, 4, 3); } }
  // cortina + porta da rua
  x.fillStyle = '#4a3a5a'; x.fillRect(W * 0.9, H * 0.2, W * 0.1, H * 0.5);
  if (p.toca) { glow(W * 0.95, H * 0.5, 50, 'rgba(214,53,74,0.3)'); }
  x.fillStyle = H9.paredeEsc; x.fillRect(0, H * 0.84, W, H * 0.16);
};
