// Mundo "controle": como o controle remoto fala com a TV (luz infravermelha piscando um codigo).
// Dois lugares na mesma cena: a sala com a TV (x=0) e o controle em raio X (x=60, deitado ao longo de x).
// Etapas: sala, camera, botao, aperta, chip, led, pulsos, sensor, final.
(() => {
const LOCAL = { sala: new T3.Vector3(0, 0, 0), raiox: new T3.Vector3(60, 0, 0) };
const ETAPA_LOCAL = { sala: 'sala', camera: 'sala', botao: 'raiox', aperta: 'raiox', chip: 'raiox', led: 'raiox',
                      pulsos: 'raiox', sensor: 'sala', final: 'sala' };
const W3 = {};
// codigo do botao "volume +": 1 = rajada longa de espera, depois bits (1 = espaco longo, 0 = espaco curto)
const BITS = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1];
const NB = 14;  // contas de luz no feixe entre o controle e a TV
const vidro = (cor, op) => new T3.MeshStandardMaterial({ color: cor, roughness: 0.25, metalness: 0.15, transparent: true, opacity: op, depthWrite: false });
function contorno(geo, cor, op, parent) {
  const l = new T3.LineSegments(new T3.EdgesGeometry(geo, 25), new T3.LineBasicMaterial({ color: cor, transparent: true, opacity: op }));
  parent.add(l); return l;
}
// controle (casca + botoes), usado na mao (sala) e grande em raio X
function controleSolido(escala, parent) {
  const g = grupo(parent);
  const casca = mat(0x23262d, { roughness: 0.55, metalness: 0.1 });
  box(8, 0.7, 2.3, casca, 0, 0, 0, g);
  const borr = mat(0x3a3f4a, { roughness: 0.8 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const b = cyl(0.26, 0.26, 0.16, borr, 18, g); b.position.set(-2.6 + i * 1.3, 0.42, -0.7 + j * 0.7); }
  const verm = cyl(0.32, 0.32, 0.18, mat(0xb8322a, { roughness: 0.6 }), 20, g); verm.position.set(-3.4, 0.43, 0);
  W3.ledMao = cyl(0.18, 0.18, 0.3, mat(0x40121a, { roughness: 0.2, emissive: 0x000000 }), 16, g);
  W3.ledMao.rotation.z = Math.PI / 2; W3.ledMao.position.set(4.12, 0.05, 0);
  g.scale.setScalar(escala);
  return g;
}

function monta() {
  scene.add(sun.target);
  // ---- sala ----
  const S = LOCAL.sala;
  uvMundo(box(40, 0.3, 22, tmat('madeira', { relevo: 1.2 }), S.x, -0.15, 2), 2.5);
  const parede = tmat('concreto', { color: 0xe9e2d6, relevo: 0.6 });
  uvMundo(box(40, 16, 0.5, parede, S.x, 8, -8.2), 3);
  box(9, 0.8, 2.2, mat(0x3b2a1f, { roughness: 0.7 }), S.x, 2.6, -6.6);  // rack
  // TV na parede
  W3.tv = grupo(); W3.tv.position.set(S.x, 6.6, -7.7);
  box(11.6, 6.8, 0.35, mat(0x0d0e11, { roughness: 0.3, metalness: 0.3 }), 0, 0, 0, W3.tv);
  W3.telaMat = new T3.MeshBasicMaterial({ color: 0x1b2a44 });
  const tela = new T3.Mesh(new T3.PlaneGeometry(11, 6.2), W3.telaMat); tela.position.set(0, 0, 0.19); W3.tv.add(tela);
  // sensor infravermelho: domo escuro no canto de baixo da TV
  W3.sensor = new T3.Mesh(new T3.SphereGeometry(0.22, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x2a0d14, { roughness: 0.15 }));
  W3.sensor.rotation.x = Math.PI / 2; W3.sensor.position.set(4.9, -3.45, 0.2); W3.tv.add(W3.sensor);
  // sofa
  const tecido = mat(0x6b7a8f, { roughness: 0.95 });
  box(9, 1.4, 3.4, tecido, S.x, 1.0, 6.8); box(9, 3, 0.9, tecido, S.x, 2.4, 8.4);
  box(0.9, 2.2, 3.4, tecido, S.x - 4.5, 1.6, 6.8); box(0.9, 2.2, 3.4, tecido, S.x + 4.5, 1.6, 6.8);
  // controle na "mao" (na frente do sofa, apontando para a TV)
  W3.mao = grupo(); W3.mao.position.set(S.x + 1.5, 3.2, 3.6); W3.mao.rotation.y = Math.PI / 2 + 0.12; W3.mao.rotation.z = 0.12;
  controleSolido(0.42, W3.mao);
  W3.brilho = new T3.Mesh(new T3.SphereGeometry(0.35, 20, 14),
    new T3.MeshBasicMaterial({ color: 0xe2c4ff, transparent: true, opacity: 0.85, depthWrite: false }));
  scene.add(W3.brilho);
  // feixe de luz: contas que viajam do controle ate o sensor
  W3.contaMat = new T3.MeshBasicMaterial({ color: 0xff2a5a, transparent: true, opacity: 0, depthWrite: false });
  W3.contas = Array.from({ length: NB }, () => { const c = new T3.Mesh(new T3.SphereGeometry(0.12, 10, 8), W3.contaMat); scene.add(c); return c; });
  W3.luzSala = new T3.PointLight(0x9fb8ff, 0, 30, 1.6); W3.luzSala.position.set(S.x, 6, -5); scene.add(W3.luzSala);
  // ---- controle em raio X ----
  const R = LOCAL.raiox;
  W3.casca = box(8, 0.9, 2.4, vidro(0x8a93a6, 0.14), R.x, 0.15, 0); W3.casca.castShadow = false;
  contorno(W3.casca.geometry, 0xc6d0e6, 0.6, W3.casca);
  const placa = box(7.6, 0.08, 2.1, mat(0x1f6b3a, { roughness: 0.6 }), R.x, -0.15, 0);
  placa.castShadow = false;
  // trilhas de cobre na placa
  const cobre = mat(0xd8a24a, { roughness: 0.35, metalness: 0.6 });
  for (let i = 0; i < 6; i++) box(6.8, 0.01, 0.04, cobre, R.x - 0.2, -0.1, -0.85 + i * 0.34);
  // cada botao: domo de borracha (sobe e desce) com pastilha de carbono embaixo; contato dourado em pente na placa
  W3.domos = []; W3.pastilhas = []; W3.contatos = [];
  const borr = vidro(0x55607a, 0.55), carbono = mat(0x111214, { roughness: 0.9 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const px = R.x - 2.6 + i * 1.3, pz = -0.7 + j * 0.7;
    const d = new T3.Mesh(new T3.SphereGeometry(0.3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), borr); d.position.set(px, 0.2, pz); scene.add(d);
    const p = cyl(0.17, 0.17, 0.05, carbono, 16); p.position.set(px, 0.15, pz);
    const ct = new T3.Mesh(new T3.RingGeometry(0.05, 0.19, 16), new T3.MeshBasicMaterial({ color: 0xd8a24a, side: T3.DoubleSide }));
    ct.rotation.x = -Math.PI / 2; ct.position.set(px, -0.1, pz); scene.add(ct);
    W3.domos.push(d); W3.pastilhas.push(p); W3.contatos.push(ct);
  }
  W3.alvo = 5;  // o botao que o dedo aperta (volume +)
  W3.chip = box(1.1, 0.22, 1.1, mat(0x15161a, { roughness: 0.4 }), R.x + 2.4, -0.02, 0);
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) box(0.08, 0.04, 0.22, cobre, R.x + 2.0 + k * 0.26, -0.1, s * 0.62);
  W3.chipLuz = new T3.PointLight(0x7cf0ff, 0, 4, 2); W3.chipLuz.position.set(R.x + 2.4, 0.6, 0); scene.add(W3.chipLuz);
  // LED na ponta
  W3.ledMat = new T3.MeshStandardMaterial({ color: 0x5a1020, roughness: 0.15, emissive: 0x000000, transparent: true, opacity: 0.9 });
  W3.led = new T3.Mesh(new T3.SphereGeometry(0.28, 20, 14), W3.ledMat); W3.led.position.set(R.x + 4.15, 0.1, 0); scene.add(W3.led);
  W3.ledLuz = new T3.PointLight(0xff2a5a, 0, 8, 2); W3.ledLuz.position.set(R.x + 4.6, 0.2, 0); scene.add(W3.ledLuz);
  // pulsos saindo do LED (fila de barrinhas que viaja para +x)
  W3.pulsoMat = new T3.MeshBasicMaterial({ color: 0xff2a5a, transparent: true, opacity: 0.9, depthWrite: false });
  W3.pulsos = Array.from({ length: 22 }, () => { const b = new T3.Mesh(new T3.BoxGeometry(0.18, 0.5, 0.5), W3.pulsoMat); scene.add(b); return b; });
  const chao = new T3.Mesh(new T3.CircleGeometry(16, 48), mat(0x1a1d25, { roughness: 0.9 })); chao.rotation.x = -Math.PI / 2; chao.position.set(R.x, -1.3, 0); chao.receiveShadow = true; scene.add(chao);
}

// o codigo como sequencia de rajadas: [inicio, duracao] em "tempo de codigo" (0 a 1)
function trem() {
  const ev = [[0, 0.16]]; let t = 0.24;
  for (const b of BITS) { ev.push([t, 0.022]); t += b ? 0.062 : 0.04; }
  ev.push([t, 0.022]);
  const fim = t + 0.03; return ev.map(([a, d]) => [a / fim, d / fim]);
}
const TREM = trem();
const aceso = u => TREM.some(([a, d]) => u >= a && u < a + d);

function atualiza(t, ctx) {
  const et = ctx.p.etapa, k = ctx.lt, lugar = ETAPA_LOCAL[et], c = LOCAL[lugar];
  sun.position.set(c.x - 8, 15, c.z + 14); sun.target.position.copy(c);
  scene.background = new T3.Color(lugar === 'sala' ? 0xc9c1b4 : 0x10131a);
  hemi.intensity = lugar === 'sala' ? 1.0 : 0.75;
  const enviando = ['camera', 'led', 'pulsos', 'sensor', 'final'].includes(et);
  const u = ((t * 1.3) % 1);  // o codigo repete enquanto o botao fica apertado
  const piscando = enviando && aceso(u);
  // ---- sala: feixe ----
  const S = LOCAL.sala, ini = new T3.Vector3(S.x + 1.5 + 1.75 * 0.42 * 2.2, 3.4, 3.4), fimv = new T3.Vector3(S.x + 4.9, 6.6 - 3.45, -7.5);
  const visivel = et === 'camera' ? 0.95 : et === 'sensor' || et === 'final' ? 0.7 : et === 'sala' ? 0.0 : 0;
  W3.contas.forEach((b, i) => {
    const f = ((i / NB) + t * 0.9) % 1, p = ini.clone().lerp(fimv, f);
    b.position.copy(p); b.scale.setScalar(aceso((u - f * 0.3 + 1) % 1) ? 1.2 : 0.35);
  });
  W3.contaMat.opacity = enviando ? visivel : 0;
  W3.ledMao.material.emissive = new T3.Color(piscando && et === 'camera' ? 0xc58bff : 0x000000);
  W3.ledMao.material.emissiveIntensity = 4;
  // na camera do celular o infravermelho aparece como um brilho roxo-branco
  W3.brilho.visible = et === 'camera' && piscando;
  W3.brilho.position.copy(W3.ledMao.getWorldPosition(new T3.Vector3()));
  // tela: escura no comeco, acende e mostra o volume subindo no final
  W3.telaMat.color.set(et === 'final' ? 0x3a6bd0 : et === 'sensor' ? 0x2a4f9a : 0x1b2a44);
  W3.luzSala.intensity = et === 'final' ? 18 : 6;
  W3.sensor.material.emissive = new T3.Color(et === 'sensor' && piscando ? 0x8a1030 : 0x000000);
  W3.mao.position.y = 3.2 + Math.sin(t * 1.4) * 0.05;
  // ---- raio X ----
  const apertado = ['aperta', 'chip', 'led', 'pulsos'].includes(et) ? (et === 'aperta' ? ease(k * 2.5) : 1) : 0;
  W3.domos.forEach((d, i) => {
    const a = i === W3.alvo ? apertado : 0;
    d.scale.set(1, 1 - 0.55 * a, 1); W3.pastilhas[i].position.y = 0.15 - 0.2 * a;
    W3.contatos[i].material.color.set(i === W3.alvo && a > 0.9 ? 0x6dff9a : 0xd8a24a);
  });
  W3.domos[W3.alvo].material = W3.domos[W3.alvo].material;
  W3.chipLuz.intensity = et === 'chip' ? 6 + 4 * Math.sin(t * 18) : 0;
  W3.ledMat.emissive = new T3.Color(piscando && lugar === 'raiox' ? 0xff2a5a : 0x000000); W3.ledMat.emissiveIntensity = 3;
  W3.ledLuz.intensity = piscando && lugar === 'raiox' ? 9 : 0;
  const R = LOCAL.raiox;
  W3.pulsos.forEach((b, i) => {
    const f = i / W3.pulsos.length, px = R.x + 4.6 + f * 9;
    b.position.set(px, 0.1, 0);
    b.visible = (et === 'led' || et === 'pulsos') && aceso((u - f * 0.55 + 1) % 1);
  });
  W3.casca.material.opacity = et === 'botao' ? 0.2 + 0.12 * Math.sin(t * 5) : 0.14;
}

// camera: alvo relativo ao lugar; troca de lugar = corte seco com zoom
const CAM = {
  sala: { y: 4.4, d: 18, h: 1.6, a: 0.42 }, camera: { y: 3.3, d: 4.2, h: 0.35, a: Math.PI - 0.5, x: 1.7, z: 3.4 }, botao: { y: 0.1, d: 9.5, h: 4.2, a: 0.35 },
  aperta: { y: 0.0, d: 5.5, h: 1.6, a: 0.05, x: -1.3 }, chip: { y: 0.0, d: 6, h: 2.4, a: 0.5, x: 2.4 },
  led: { y: 0.1, d: 7.5, h: 1.2, a: 0.9, x: 5.5 }, pulsos: { y: 0.1, d: 13, h: 1.8, a: 0.15, x: 7 },
  sensor: { y: 3.4, d: 7, h: 0.4, a: 0.25, x: 4.5, z: -6.5 }, final: { y: 5.6, d: 15, h: 1.0, a: 0.08, z: -2 },
};
function camera(t, ctx) {
  const cfg = j => { const e = (ST.cenas[j].p || {}).etapa; return { ...CAM[e], c: LOCAL[ETAPA_LOCAL[e]] }; };
  const cur = cfg(ctx.i), prev = cfg(Math.max(0, ctx.i - 1)), corte = prev.c !== cur.c;
  const k = corte ? 1 : ease((t - ctx.t0) / 1.4), L = (a, b) => lerp(a || 0, b || 0, k);
  const d = L(prev.d, cur.d) * (1 - 0.05 * ctx.lt), a = L(prev.a, cur.a) + ctx.lt * 0.06, h = L(prev.h, cur.h), y = L(prev.y, cur.y);
  const ox = L(prev.x, cur.x), oz = L(prev.z, cur.z);
  const zoom = corte ? 1 + 0.6 * Math.max(0, 1 - (t - ctx.t0) / 0.35) : 1;
  const cx = cur.c.x + ox, cz = cur.c.z + oz;
  cam.position.set(cx + Math.sin(a) * d * zoom, y + h * zoom, cz + Math.cos(a) * d * zoom);
  cam.lookAt(cx, y, cz); cam.updateMatrixWorld();
  W3.flash = corte && ctx.i > 0 ? Math.max(0, 1 - (t - ctx.t0) / 0.3) : 0;
}
function overlay(t, ctx) {
  if (W3.flash > 0) { x.fillStyle = `rgba(255,255,255,${0.7 * W3.flash})`; x.fillRect(0, 0, W, H); }
  const et = ctx.p.etapa, s = back((t - ctx.t0) * 3), R = LOCAL.raiox, branco = 'rgba(255,255,255,0.92)';
  if (et === 'sala') pill(W / 2, 300, 'Invisible light', branco, COL.ink, 42, s);
  if (et === 'camera') {
    // moldura de celular: a camera mostra o brilho que o olho nao ve
    x.save(); x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 10; x.beginPath(); x.roundRect(W * 0.12, H * 0.16, W * 0.76, H * 0.6, 60); x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.arc(W / 2, H * 0.16 + 34, 9, 0, 7); x.fill(); x.restore();
    pill(W / 2, H * 0.16 + 100, 'Phone camera', COL.green, '#fff', 40, s);
  }
  if (et === 'botao') { const [px, py] = proj(R.x - 1.3, 0.6, 0); pill(px, py - 120, 'Rubber dome', branco, COL.ink, 38, s); }
  if (et === 'aperta') pill(W / 2, 300, 'Carbon pad closes the circuit', COL.green, '#fff', 36, s);
  if (et === 'chip') { const [px, py] = proj(R.x + 2.4, 0.3, 0); pill(px, py - 120, 'Chip: button = code', branco, COL.ink, 38, s); }
  if (et === 'led') { const [px, py] = proj(R.x + 4.15, 0.4, 0); pill(px, py - 130, 'Infrared LED', COL.red, '#fff', 40, s); }
  if (et === 'pulsos' || et === 'led') {
    // o codigo como onda: rajadas e espacos, embaixo da tela
    const y0 = H * 0.8, x0 = W * 0.08, w = W * 0.84, hh = 70;
    x.save(); x.globalAlpha = Math.min(1, (t - ctx.t0) * 3); x.strokeStyle = '#ff4f7a'; x.lineWidth = 5; x.beginPath(); x.moveTo(x0, y0);
    let ult = false;
    for (let i = 0; i <= 400; i++) {
      const uu = i / 400, on = aceso(uu), px = x0 + uu * w;
      if (on !== ult) x.lineTo(px, on ? y0 - hh : y0);
      x.lineTo(px, on ? y0 - hh : y0); ult = on;
    }
    x.stroke(); x.restore();
    if (et === 'pulsos') pill(W / 2, y0 - hh - 70, '38,000 flashes per second', branco, COL.ink, 36, s);
  }
  if (et === 'sensor') pill(W / 2, 300, 'IR sensor', COL.green, '#fff', 42, s);
  if (et === 'final') {
    const n = Math.min(12, Math.floor(6 + (t - ctx.t0) * 4)); const x0 = W * 0.2, y0 = H * 0.34;
    for (let i = 0; i < 14; i++) { x.fillStyle = i < n ? '#ffffff' : 'rgba(255,255,255,0.25)'; x.fillRect(x0 + i * (W * 0.6 / 14), y0, W * 0.6 / 14 - 8, 26); }
    pill(W / 2, y0 - 50, 'VOLUME', branco, COL.ink, 34, s);
  }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
