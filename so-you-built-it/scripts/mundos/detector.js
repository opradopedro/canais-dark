// Mundo "detector": como o detector de fumaca (ionizacao) sente a fumaca.
// Dois lugares: a cozinha com o detector no teto (x=0) e a camara de ionizacao em raio X (x=60).
// Etapas: teto, fonte, alfa, ions, corrente, fumaca, cai, apita, final.
(() => {
const LOCAL = { casa: new T3.Vector3(0, 0, 0), raiox: new T3.Vector3(60, 0, 0) };
const ETAPA_LOCAL = { teto: 'casa', fonte: 'raiox', alfa: 'raiox', ions: 'raiox', corrente: 'raiox', fumaca: 'raiox',
                      cai: 'raiox', apita: 'casa', final: 'casa' };
const ORDEM = ['teto', 'fonte', 'alfa', 'ions', 'corrente', 'fumaca', 'cai', 'apita', 'final'];
const W3 = {};
const vidro = (cor, op) => new T3.MeshStandardMaterial({ color: cor, roughness: 0.25, metalness: 0.2, transparent: true, opacity: op, depthWrite: false });

function monta() {
  scene.add(sun.target);
  // ---- cozinha ----
  const C = LOCAL.casa;
  uvMundo(box(30, 0.3, 24, tmat('madeira', { relevo: 1.2 }), C.x, -0.15, 0), 2.5);
  const parede = tmat('concreto', { color: 0xece6dc, relevo: 0.5 });
  uvMundo(box(30, 12, 0.4, parede, C.x, 6, -9), 3);
  uvMundo(box(0.4, 12, 24, parede, C.x - 12, 6, 0), 3);
  W3.teto = box(30, 0.3, 24, new T3.MeshBasicMaterial({ color: 0xe8e3da }), C.x, 12.15, 0);
  const luz = new T3.PointLight(0xfff1dc, 40, 30, 1.4); luz.position.set(C.x - 2, 9, 4); scene.add(luz);
  // fogao e panela
  box(4, 3.4, 2.6, mat(0xdadde0, { roughness: 0.4, metalness: 0.4 }), C.x - 4, 1.7, -7.4);
  box(4, 0.1, 2.6, mat(0x1b1c1f), C.x - 4, 3.45, -7.4);
  const pan = cyl(0.9, 0.8, 0.5, mat(0x30333a, { metalness: 0.6, roughness: 0.4 }), 24); pan.position.set(C.x - 4, 3.75, -7.3);
  box(1.6, 0.12, 0.2, mat(0x111111), C.x - 2.3, 3.85, -7.3);
  // detector no teto
  W3.det = grupo(); W3.det.position.set(C.x + 1, 11.75, -2);
  cyl(1.0, 1.1, 0.5, mat(0xf7f7f4, { roughness: 0.5, emissive: 0x9a9a96 }), 32, W3.det);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; box(0.08, 0.3, 0.3, mat(0xc9ccd0), Math.cos(a) * 1.02, -0.05, Math.sin(a) * 1.02, W3.det).rotation.y = -a; }
  W3.ledCasa = new T3.Mesh(new T3.SphereGeometry(0.09, 10, 8), new T3.MeshBasicMaterial({ color: 0x400000 })); W3.ledCasa.position.set(0.5, -0.28, 0.4); W3.det.add(W3.ledCasa);
  W3.ondas = [...Array(3)].map(() => { const m = new T3.Mesh(new T3.TorusGeometry(1, 0.05, 6, 40), new T3.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.copy(W3.det.position).add(new T3.Vector3(0, -0.3, 0)); scene.add(m); return m; });
  // fumaca subindo da panela
  const fm = new T3.MeshStandardMaterial({ color: 0x8c8f94, roughness: 1, transparent: true, opacity: 0.5, depthWrite: false });
  W3.fumCasa = [...Array(26)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.5 + rnd(i) * 0.5, 12, 8), fm); scene.add(m); return m; });
  // ---- camara em raio X ----
  const R = LOCAL.raiox;
  const chao = new T3.Mesh(new T3.CircleGeometry(16, 48), mat(0x1a1d25, { roughness: 0.9 })); chao.rotation.x = -Math.PI / 2; chao.position.set(R.x, -3.2, 0); chao.receiveShadow = true; scene.add(chao);
  W3.camara = cyl(3.0, 3.0, 4.2, vidro(0x9aa4b8, 0.12), 40); W3.camara.position.set(R.x, 1.0, 0);
  const metal = mat(0xb9c0c8, { metalness: 0.8, roughness: 0.3 });
  W3.placaE = box(0.18, 3.6, 3.2, metal, R.x - 2.3, 1.0, 0); W3.placaD = box(0.18, 3.6, 3.2, metal, R.x + 2.3, 1.0, 0);
  // fonte: botao dourado com o americio
  W3.fonte = cyl(0.42, 0.42, 0.16, mat(0xd9b24a, { metalness: 0.8, roughness: 0.3 }), 24); W3.fonte.position.set(R.x, -1.0, 0);
  W3.fonteLuz = new T3.PointLight(0xffd36a, 0, 5, 2); W3.fonteLuz.position.set(R.x, -0.6, 0); scene.add(W3.fonteLuz);
  box(1.4, 0.12, 1.4, mat(0x50565e, { metalness: 0.6 }), R.x, -1.14, 0);
  // particulas alfa (amarelas, saem da fonte e param logo)
  const am = new T3.MeshBasicMaterial({ color: 0xffe066 });
  W3.alfas = [...Array(16)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.07, 8, 6), am); scene.add(m); m.userData = { a: (i / 16) * Math.PI - Math.PI / 2 + (rnd(i) - 0.5) * 0.3, f: rnd(i * 3.3), z: (rnd(i * 7) - 0.5) * 1.6 }; return m; });
  // ions: + vermelho vai para a placa da esquerda, - azul para a direita
  const pm = new T3.MeshStandardMaterial({ color: 0xff4f4f, emissive: 0x551010, roughness: 0.4 }), nm = new T3.MeshStandardMaterial({ color: 0x4fa3ff, emissive: 0x102a55, roughness: 0.4 });
  W3.ions = [...Array(36)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.12, 10, 8), i % 2 ? pm : nm); scene.add(m); m.userData = { s: i % 2 ? -1 : 1, y: lerp(-0.6, 2.6, rnd(i * 2.1)), z: (rnd(i * 5.7) - 0.5) * 2.4, f: rnd(i * 9.1) }; return m; });
  // fios, bateria e chip
  const fio = mat(0xd8a24a, { metalness: 0.6, roughness: 0.35 });
  const tubo = (pts, r, m) => { const c = new T3.CurvePath(); for (let i = 1; i < pts.length; i++) c.add(new T3.LineCurve3(new T3.Vector3(...pts[i - 1]), new T3.Vector3(...pts[i]))); const me = new T3.Mesh(new T3.TubeGeometry(c, 80, r, 8, false), m); scene.add(me); return c; };
  W3.circuito = tubo([[R.x - 2.3, -0.8, 1.7], [R.x - 2.3, -2.4, 1.7], [R.x + 2.3, -2.4, 1.7], [R.x + 2.3, -0.8, 1.7]], 0.06, fio);
  box(1.4, 0.6, 0.7, mat(0x2b2f36), R.x - 0.9, -2.4, 1.7); box(0.5, 0.6, 0.7, mat(0xc8a03a, { metalness: 0.5 }), R.x - 0.45, -2.4, 1.7);
  W3.chip = box(1.0, 0.25, 1.0, mat(0x15161a, { roughness: 0.4 }), R.x + 1.1, -2.4, 1.7);
  W3.chipLuz = new T3.PointLight(0x7cf0ff, 0, 4, 2); W3.chipLuz.position.set(R.x + 1.1, -1.8, 2.2); scene.add(W3.chipLuz);
  W3.eletrons = [...Array(14)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(0.08, 8, 6), new T3.MeshBasicMaterial({ color: 0x9ff7ff })); scene.add(m); return m; });
  // fumaca entrando na camara
  const sm = new T3.MeshStandardMaterial({ color: 0x6f737a, roughness: 1, transparent: true, opacity: 0.55, depthWrite: false });
  W3.fumo = [...Array(18)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.16 + rnd(i) * 0.14, 12, 8), sm); scene.add(m); m.userData = { y: lerp(-0.4, 2.6, rnd(i * 3.7)), z: (rnd(i * 1.9) - 0.5) * 2.2, f: rnd(i * 6.3) }; return m; });
}

function estado(et, k) {
  const s = ORDEM.indexOf(et);
  return {
    s, k,
    alfa: s >= 2 && s <= 6 ? 1 : 0,
    ions: s >= 3 && s <= 6 ? 1 : 0,
    I: s < 4 ? 0 : s === 4 ? ease(Math.min(1, k * 2)) : s === 5 ? 1 - 0.25 * ease(Math.max(0, k * 2 - 0.8)) : s === 6 ? lerp(0.75, 0.2, ease(Math.min(1, k * 1.6))) : 0,
    fumo: s === 5 ? ease(Math.min(1, k * 1.5)) : s === 6 ? 1 : 0,
    apita: s === 7 || s === 8 ? 1 : 0,
    fumCasa: s === 7 ? 1 : s === 8 ? 1 - ease(k) * 0.6 : 0,
  };
}

function atualiza(t, ctx) {
  const et = ctx.p.etapa, k = ctx.lt, lugar = ETAPA_LOCAL[et], c = LOCAL[lugar], S = estado(et, k); W3.S = S;
  sun.position.set(c.x - 8, 18, c.z + 14); sun.target.position.copy(c);
  scene.background = new T3.Color(lugar === 'casa' ? 0xd9d2c6 : 0x10131a);
  hemi.intensity = lugar === 'casa' ? 1.0 : 0.75;
  const R = LOCAL.raiox;
  // casa: apito e fumaca
  const bip = S.apita && (t * 2.2) % 1 < 0.5;
  W3.ledCasa.material.color.set(bip ? 0xff2a1a : (Math.floor(t) % 4 === 0 ? 0x30ff6a : 0x400000));
  W3.ondas.forEach((o, i) => { const u = (t * 1.1 + i / 3) % 1; o.scale.setScalar(1 + u * 4); o.material.opacity = S.apita ? 0.8 * (1 - u) : 0; });
  W3.fumCasa.forEach((m, i) => {
    const u = (t * 0.12 + rnd(i * 4.4)) % 1; m.visible = S.fumCasa > 0.02;
    m.position.set(LOCAL.casa.x - 4 + Math.sin(u * 6 + i) * 0.8 + u * 4.5 * rnd(i * 2), 4 + u * 7.6, -7.3 + u * 5 * rnd(i * 5));
    m.scale.setScalar(S.fumCasa * (0.4 + u * 0.9));
  });
  // fonte
  W3.fonteLuz.intensity = S.s >= 1 && S.s <= 6 ? 3 + Math.sin(t * 6) * 1 : 0;
  W3.alfas.forEach((m) => {
    const u = m.userData, q = (t * 1.6 + u.f) % 1, r = q * 1.6;
    m.visible = S.alfa > 0 && q < 0.92;
    m.position.set(R.x + Math.sin(u.a) * r, -0.9 + Math.cos(u.a) * r * 0.9 + 0.1, u.z * q);
  });
  // ions andam ate as placas; com fumaca muitos grudam e param
  const vel = S.s === 6 ? lerp(1, 0.15, ease(Math.min(1, k * 1.6))) : 1;
  W3.ions.forEach((m, i) => {
    const u = m.userData, preso = S.s === 6 && i % 4 !== 0 && k > u.f * 0.6;
    m.visible = S.ions > 0 && (S.s > 3 || k > u.f * 0.7);
    if (preso) { const f = W3.fumo[i % W3.fumo.length]; m.position.copy(f.position).add(new T3.Vector3(Math.sin(i) * 0.3, Math.cos(i) * 0.3, 0.2)); return; }
    const q = (t * 0.35 * vel + u.f) % 1;
    m.position.set(R.x + u.s * lerp(0.1, 2.1, q), u.y, u.z);
  });
  // eletrons no circuito: velocidade = corrente
  W3.eletrons.forEach((m, i) => { const q = (t * 0.25 * S.I + i / 14) % 1, p = W3.circuito.getPointAt(q); m.position.copy(p); m.visible = S.I > 0.02; m.scale.setScalar(0.6 + S.I * 0.6); });
  W3.chipLuz.intensity = S.s === 6 && k > 0.6 ? 6 + 4 * Math.sin(t * 20) : 0;
  W3.fumo.forEach((m) => {
    const u = m.userData, q = (t * 0.12 + u.f) % 1;
    m.visible = S.fumo > 0.02;
    m.position.set(R.x - 4.5 + q * 9 * S.fumo, u.y + Math.sin(t + u.f * 9) * 0.2, u.z);
    if (S.s === 6) m.position.x = R.x - 2.0 + u.f * 4.0 + Math.sin(t * 0.5 + u.f * 6) * 0.3;
  });
}

const CAM = {
  teto: { y: 9.5, d: 15, h: -2.5, a: 0.35, x: 1, z: -2 }, fonte: { y: -0.6, d: 5.5, h: 1.6, a: 0.25 },
  alfa: { y: 0.0, d: 7, h: 1.2, a: 0.2 }, ions: { y: 0.8, d: 10, h: 1.0, a: 0.1 }, corrente: { y: 0.0, d: 12, h: 1.6, a: 0.15 },
  fumaca: { y: 0.6, d: 11.5, h: 1.2, a: -0.2 }, cai: { y: 0.3, d: 11, h: 1.4, a: 0.1 },
  apita: { y: 10.5, d: 7, h: -2.6, a: 0.3, x: 1, z: -2 }, final: { y: 8, d: 19, h: -1.0, a: 0.4, x: -1, z: -3 },
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
  const et = ctx.p.etapa, S = W3.S, s = back((t - ctx.t0) * 3), R = LOCAL.raiox, branco = 'rgba(255,255,255,0.92)';
  if (et === 'teto') { const [px, py] = proj(LOCAL.casa.x + 1, 11.4, -2); pill(px, py + 110, 'Smoke detector', branco, COL.ink, 40, s); }
  if (et === 'fonte') { const [px, py] = proj(R.x, -0.9, 0); pill(px, py + 110, 'Americium-241', COL.yellow, COL.ink, 40, s); }
  if (et === 'alfa') pill(W / 2, 300, 'Alpha particles', COL.yellow, COL.ink, 40, s);
  if (et === 'ions') {
    const [ax, ay] = proj(R.x - 1.4, 3.0, 0), [bx, by] = proj(R.x + 1.4, 3.0, 0);
    pill(ax, ay - 70, '+', COL.red, '#fff', 48, s); pill(bx, by - 70, '−', '#2f7fe0', '#fff', 48, s);
    pill(W / 2, 300, 'Charged air', branco, COL.ink, 40, s);
  }
  if (S.I > 0 || et === 'corrente') {
    // medidor de corrente embaixo
    const y0 = H * 0.82, x0 = W * 0.15, w = W * 0.7;
    x.save(); x.fillStyle = 'rgba(0,0,0,0.45)'; x.beginPath(); x.roundRect(x0 - 20, y0 - 70, w + 40, 120, 24); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(x0, y0, w, 30);
    x.fillStyle = S.I > 0.5 ? '#3ddc84' : '#ff4f4f'; x.fillRect(x0, y0, w * S.I, 30); x.restore();
    pill(W / 2, y0 - 32, 'Current', branco, COL.ink, 32, 1);
  }
  if (et === 'cai') pill(W / 2, 300, 'Current drops!', COL.red, '#fff', 44, back((ctx.lt - 0.4) * 5));
  if (et === 'apita' && (t * 2.2) % 1 < 0.5) pill(W / 2, H * 0.62, 'BEEP! BEEP!', COL.red, '#fff', 64, 1);
}
MUNDO = { monta, atualiza, camera, overlay };
})();
