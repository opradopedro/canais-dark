// Mundo "panela": panela de pressao em corte no fogao. Agua presa a ~120 C cozinha mais rapido.
// Etapas: aberta, escapa, tampa, anel, pressao, termo, comida, valvula, final.
(() => {
const R = 1.2, HP = 1.6, AG = 0.95;   // raio, altura da panela, nivel da agua
const ETAPAS = ['aberta', 'escapa', 'tampa', 'anel', 'pressao', 'termo', 'comida', 'valvula', 'final'];
const W3 = {};
const metal = () => mat(0xc4cacf, { metalness: 0.8, roughness: 0.28, side: T3.DoubleSide });

function monta() {
  scene.add(sun.target);
  scene.background = new T3.Color(0xd9d2c6);
  // parede de azulejo e bancada
  uvMundo(box(16, 10, 0.3, tmat('concreto', { color: 0xf1ece4, relevo: 0.4 }), 0, 3, -3.2), 2);
  uvMundo(box(16, 0.4, 6, tmat('madeira', { relevo: 1 }), 0, -0.55, -0.4), 2);
  box(5, 0.35, 3.6, mat(0x1d1f22, { roughness: 0.3, metalness: 0.3 }), 0, -0.18, 0);
  // queimador e chama
  const anel = new T3.Mesh(new T3.TorusGeometry(0.75, 0.06, 8, 40), mat(0x3a3c40, { metalness: 0.6 })); anel.rotation.x = Math.PI / 2; anel.position.y = 0.02; scene.add(anel);
  W3.chamas = [...Array(18)].map((_, i) => {
    const m = new T3.Mesh(new T3.ConeGeometry(0.07, 0.2, 8), new T3.MeshBasicMaterial({ color: 0x3a7bff, transparent: true, opacity: 0.85 }));
    const a = i / 18 * Math.PI * 2; m.position.set(Math.cos(a) * 0.95, 0.0, Math.sin(a) * 0.95); scene.add(m); return m;
  });
  // panela cortada ao meio (metade de tras) + fundo
  const corpo = new T3.Mesh(new T3.CylinderGeometry(R, R, HP, 48, 1, true, Math.PI / 2, Math.PI), metal()); corpo.position.y = 0.1 + HP / 2; scene.add(corpo);
  const fundo = new T3.Mesh(new T3.CircleGeometry(R, 48), metal()); fundo.rotation.x = -Math.PI / 2; fundo.position.y = 0.11; scene.add(fundo);
  for (const s of [-1, 1]) { box(0.06, HP, 0.06, mat(0x9aa0a5, { metalness: 0.8 }), s * R, 0.1 + HP / 2, 0); box(0.7, 0.12, 0.2, mat(0x1b1b1b), s * (R + 0.35), 0.1 + HP * 0.85, -0.2); }
  // agua (metade) com face do corte
  W3.aguaMat = new T3.MeshStandardMaterial({ color: 0x3f9fe3, roughness: 0.1, transparent: true, opacity: 0.75, side: T3.DoubleSide });
  W3.agua = new T3.Group(); scene.add(W3.agua);
  const ac = new T3.Mesh(new T3.CylinderGeometry(R - 0.04, R - 0.04, AG, 48, 1, false, Math.PI / 2, Math.PI), W3.aguaMat); ac.position.y = 0.1 + AG / 2; W3.agua.add(ac);
  const af = new T3.Mesh(new T3.PlaneGeometry(2 * (R - 0.04), AG), W3.aguaMat); af.position.set(0, 0.1 + AG / 2, 0.001); W3.agua.add(af);
  // comida: cenoura e feijao
  W3.comida = grupo();
  const cen = mat(0xf08a2a, { roughness: 0.6 }), fei = mat(0x7a3b2a, { roughness: 0.5 });
  for (let i = 0; i < 9; i++) { const c = cyl(0.11, 0.11, 0.12, cen, 14, W3.comida); c.position.set(lerp(-0.9, 0.9, rnd(i * 2.1)), 0.25 + rnd(i * 4.4) * 0.5, -0.1 - rnd(i * 6.6) * 0.8); c.rotation.set(rnd(i) * 3, 0, rnd(i * 3) * 3); }
  for (let i = 0; i < 26; i++) { const b = new T3.Mesh(new T3.SphereGeometry(0.06, 10, 8), fei); b.scale.set(1.4, 0.9, 1); b.position.set(lerp(-1, 1, rnd(i * 3.3)), 0.18 + rnd(i * 7.1) * 0.25, -0.05 - rnd(i * 2.9) * 0.9); W3.comida.add(b); }
  // bolhas e vapor
  W3.bolhas = [...Array(30)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.05, 8, 6), new T3.MeshBasicMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.8 })); scene.add(m); m.userData = { x: lerp(-1, 1, rnd(i * 1.7)), z: -0.05 - rnd(i * 3.9) * 0.9, f: rnd(i * 5.5) }; return m; });
  const vm = new T3.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.45, depthWrite: false });
  W3.vapor = [...Array(22)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.18 + rnd(i) * 0.14, 10, 8), vm); scene.add(m); m.userData = { x: lerp(-0.9, 0.9, rnd(i * 2.7)), z: -0.4 + rnd(i * 6.1) * 0.6, f: rnd(i * 8.1) }; return m; });
  // moleculas de vapor presas (pressao)
  W3.mols = [...Array(60)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.045, 8, 6), new T3.MeshBasicMaterial({ color: 0xffffff })); scene.add(m); m.userData = { a: rnd(i * 2.2) * 6.28, b: rnd(i * 4.4) * 6.28, s: 1 + rnd(i * 6.6) * 2 }; return m; });
  // tampa (metade), anel de borracha, valvula com peso
  W3.tampa = grupo();
  const tp = new T3.Mesh(new T3.CircleGeometry(R + 0.06, 48, 0, Math.PI), metal()); tp.rotation.x = -Math.PI / 2; tp.rotation.z = Math.PI; W3.tampa.add(tp);
  const dom = new T3.Mesh(new T3.SphereGeometry(R + 0.04, 40, 10, Math.PI / 2, Math.PI, 0, 0.32), metal()); dom.position.y = -1.18; W3.tampa.add(dom);
  box(1.6, 0.12, 0.2, mat(0x1b1b1b), 0, 0.3, -0.3, W3.tampa);
  W3.anel = new T3.Mesh(new T3.TorusGeometry(R - 0.02, 0.05, 8, 40, Math.PI), mat(0x1a1a1a, { roughness: 0.9 })); W3.anel.rotation.x = Math.PI / 2; W3.anel.rotation.z = Math.PI; W3.tampa.add(W3.anel);
  cyl(0.05, 0.05, 0.35, mat(0x9aa0a5, { metalness: 0.8 }), 12, W3.tampa).position.set(0.3, 0.32, -0.25);
  W3.peso = grupo(W3.tampa); W3.peso.position.set(0.3, 0.52, -0.25);
  cyl(0.16, 0.2, 0.22, mat(0x2b2f36, { metalness: 0.5, roughness: 0.4 }), 18, W3.peso); cyl(0.05, 0.05, 0.12, mat(0x2b2f36), 10, W3.peso).position.y = 0.16;
  W3.jato = [...Array(14)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.1, 8, 6), vm); scene.add(m); return m; });
}

function estado(s, k) {
  const at = (i, f) => s < i ? 0 : s > i ? 1 : ease(clamp(f(k), 0, 1));
  return {
    s, k,
    ferve: s <= 1 ? 1 : s <= 3 ? 0.6 : s === 4 ? 0.3 : 0.4,
    escapa: s === 0 ? 0.5 : s === 1 ? 1 : s === 2 ? 1 - ease(clamp(k * 2, 0, 1)) : 0,
    tampa: at(2, k => k * 2),
    anel: s === 3 ? 1 : 0,
    pressao: s < 4 ? (s === 3 ? 0.2 : 0) : s === 4 ? lerp(0.25, 1, ease(clamp(k * 1.5, 0, 1))) : 1,
    temp: s < 5 ? 100 : s === 5 ? lerp(100, 121, ease(clamp(k * 1.4, 0, 1))) : 121,
    comida: s === 6 ? 1 : 0,
    valvula: s >= 7 ? 1 : 0,
  };
}

function atualiza(t, ctx) {
  const S = estado(Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), ctx.lt); W3.S = S;
  sun.position.set(-5, 12, 9); sun.target.position.set(0, 0.8, 0);
  W3.chamas.forEach((m, i) => { m.scale.y = 0.8 + 0.4 * Math.sin(t * 14 + i * 1.7); });
  // bolhas: fervura forte no aberto, mais calma com pressao (a agua nao ferve tao facil)
  W3.bolhas.forEach((m) => {
    const u = m.userData, q = (t * (0.6 + S.ferve) + u.f) % 1; m.visible = rnd(Math.floor(t * 2) + u.f * 9) < S.ferve + 0.15;
    m.position.set(u.x + Math.sin(q * 8 + u.f * 9) * 0.04, 0.15 + q * (AG - 0.08), u.z); m.scale.setScalar(0.6 + q * 0.8);
  });
  W3.vapor.forEach((m) => {
    const u = m.userData, q = (t * 0.35 + u.f) % 1; m.visible = S.escapa > 0.02;
    m.position.set(u.x + Math.sin(t + u.f * 7) * 0.2, 0.1 + HP + q * 3.5, u.z); m.scale.setScalar(S.escapa * (0.6 + q * 1.6)); m.material.opacity = 0.45;
  });
  // tampa desce e trava
  W3.tampa.visible = S.tampa > 0; W3.tampa.position.set(0, 0.1 + HP + (1 - S.tampa) * 2.2, 0); W3.tampa.rotation.y = (1 - S.tampa) * 0.6;
  W3.anel.material.color.set(S.anel ? (Math.sin(t * 6) > 0 ? 0xff5a3a : 0x1a1a1a) : 0x1a1a1a);
  // moleculas presas: mais rapidas e mais juntas com pressao
  W3.mols.forEach((m) => {
    const u = m.userData, v = 1 + S.pressao * 3; m.visible = S.pressao > 0.05 && S.tampa >= 1;
    const px = Math.sin(t * u.s * v * 0.6 + u.a) * (R - 0.15), py = 0.1 + AG + 0.08 + (Math.sin(t * u.s * v * 0.8 + u.b) * 0.5 + 0.5) * (HP - AG - 0.18), pz = -0.1 - (Math.cos(t * u.s * 0.5 + u.a) * 0.5 + 0.5) * 0.9;
    m.position.set(px, py, pz);
  });
  W3.comida.children.forEach((c, i) => { c.scale.y = S.comida ? 1 - 0.25 * ease(clamp(S.k * 1.5, 0, 1)) : 1; });
  // valvula de peso pula e solta vapor
  const pula = S.valvula ? Math.max(0, Math.sin(t * 9)) * 0.08 : 0;
  W3.peso.position.y = 0.52 + pula; W3.peso.rotation.y = S.valvula ? Math.sin(t * 5) * 0.4 : 0;
  W3.jato.forEach((m, i) => {
    const q = (t * 1.6 + i / 14) % 1; m.visible = S.valvula > 0 && pula > 0.01 || (S.valvula > 0 && q < 0.6);
    m.position.set(0.3 + q * 1.2 + Math.sin(i) * 0.1, 0.1 + HP + 0.7 + q * 1.6, -0.25); m.scale.setScalar(0.4 + q * 1.8);
  });
}

const CAM = {
  aberta: { y: 1.3, d: 7.5, h: 2.2 }, escapa: { y: 2.2, d: 8.5, h: 1.2 }, tampa: { y: 1.6, d: 7.5, h: 2.0 }, anel: { y: 1.7, d: 5, h: 1.2, x: 0.8 },
  pressao: { y: 1.4, d: 6.2, h: 1.0 }, termo: { y: 1.1, d: 6.5, h: 1.2 }, comida: { y: 0.6, d: 5.2, h: 1.5 }, valvula: { y: 2.2, d: 6, h: 1.0, x: 0.4 },
  final: { y: 1.6, d: 9, h: 2.0 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: 1.2, d: 7, a: 0, h: 1.6, zFoco: 0 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const S = W3.S, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)';
  // termometro
  if ([0, 1, 4, 5, 6, 8].includes(S.s)) {
    const x0 = W * 0.84, y0 = H * 0.2, h = H * 0.3, f = clamp((S.temp - 20) / 110, 0, 1);
    x.save(); x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.roundRect(x0 - 26, y0, 52, h, 26); x.fill(); x.beginPath(); x.arc(x0, y0 + h + 20, 44, 0, 7); x.fill();
    x.fillStyle = S.temp > 101 ? COL.red : '#ff7a3a'; x.fillRect(x0 - 12, y0 + h * (1 - f), 24, h * f + 20); x.beginPath(); x.arc(x0, y0 + h + 20, 32, 0, 7); x.fill(); x.restore();
    const c = Math.round(S.temp), fr = Math.round(c * 9 / 5 + 32);
    pill(x0 - 10, y0 - 50, `${c}°C · ${fr}°F`, S.temp > 101 ? COL.red : branco, S.temp > 101 ? '#fff' : COL.ink, 34, 1);
  }
  if (S.s === 1) pill(W / 2, H * 0.14, 'Steam escapes', branco, COL.ink, 40, s);
  if (S.s === 3) { const [px, py] = proj(R, 0.1 + HP, 0.2); pill(px - 120, py - 90, 'Rubber seal', COL.green, '#fff', 38, s); }
  if (S.s === 4) {
    const [ax, ay] = proj(0, 0.1 + HP - 0.2, 0), [bx, by] = proj(0, 0.1 + AG + 0.05, 0);
    x.save(); x.strokeStyle = COL.red; x.fillStyle = COL.red; x.lineWidth = 12;
    for (const dx of [-160, 0, 160]) { const k = (t * 1.2) % 1; x.globalAlpha = 0.9; x.beginPath(); x.moveTo(ax + dx, ay); x.lineTo(bx + dx, by - 30); x.stroke(); x.beginPath(); x.moveTo(bx + dx, by); x.lineTo(bx + dx - 26, by - 40); x.lineTo(bx + dx + 26, by - 40); x.fill(); }
    x.restore(); pill(W / 2, H * 0.14, 'Steam pushes down', COL.red, '#fff', 40, s);
  }
  if (S.s === 6) {
    const y0 = H * 0.06, x0 = W * 0.08, w = W * 0.55, k = ease(clamp((t - ctx.t0) * 0.8, 0, 1));
    pill(x0 + 150, y0 - 10, 'Open pot', branco, COL.ink, 30, 1);
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(x0, y0 + 30, w, 34); x.fillStyle = '#ff7a3a'; x.fillRect(x0, y0 + 30, w * k, 34);
    pill(x0 + 190, y0 + 110, 'Pressure cooker', COL.green, '#fff', 30, 1);
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(x0, y0 + 150, w, 34); x.fillStyle = COL.green; x.fillRect(x0, y0 + 150, w * 0.38 * k, 34);
  }
  if (S.s === 7) { const [px, py] = proj(0.3, 0.1 + HP + 0.6, -0.25); pill(px, py - 120, 'Weight lifts', COL.green, '#fff', 38, s); }
}
MUNDO = { monta, atualiza, camera, overlay };
})();
