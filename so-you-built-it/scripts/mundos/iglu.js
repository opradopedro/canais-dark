// Mundo "iglu": como se faz e como funciona um iglu (ideia do Pedro, issue #6).
// Campo de neve com nevasca; monte de neve que o vento leva; blocos de neve em ESPIRAL (cada um apoiado no anterior,
// sem forma); cupula; depois CORTE ao meio (metade da frente some) mostrando porta no nivel do chao (calor sai),
// tunel mais baixo que o piso (ar frio fica preso), banco elevado (ar quente sobe), lamparina e pessoa.
// Etapas: monte, sopra, blocos, espiral, domo, porta, tunel, banco, isola, quente, final.
(() => {
const ETAPAS = ['monte', 'sopra', 'blocos', 'espiral', 'domo', 'porta', 'tunel', 'banco', 'isola', 'quente', 'final'];
const CORTE = new Set(['porta', 'tunel', 'banco', 'isola', 'quente']);
const R = 2.3, HD = 2.35, ROWS = 8, PHI0 = 0.1, PHI1 = 1.36;   // raio e altura da cupula, fileiras da espiral
const NNEVE = 260, NAR = 26;
const W3 = {};
const _m = new T3.Matrix4(), _q = new T3.Quaternion(), _v = new T3.Vector3(), _s = new T3.Vector3(1, 1, 1);

function pessoa(g, cor) {
  const p = grupo(g), roupa = mat(cor, { roughness: 0.7 });
  const corpo = new T3.Mesh(new T3.CapsuleGeometry(0.28, 0.75, 6, 14), roupa); corpo.position.y = 0.66; corpo.castShadow = true; p.add(corpo);
  const cab = new T3.Mesh(new T3.SphereGeometry(0.22, 18, 12), mat(0xc98d63, { roughness: 0.6 })); cab.position.y = 1.42; p.add(cab);
  const capuz = new T3.Mesh(new T3.TorusGeometry(0.22, 0.08, 10, 20), mat(0xf2ead8, { roughness: 1 })); capuz.position.set(0, 1.44, 0.06); p.add(capuz);
  return p;
}

function monta() {
  scene.add(sun.target);
  reflexos(0.5);
  const neve = mat(0xf4f8fc, { roughness: 0.95 }), corteMat = mat(0xdbe8f3, { roughness: 1 });
  // chao de neve em duas lajes: a da frente some no corte e mostra a secao em z = 0
  W3.chaoTras = box(80, 30, 60, [neve, neve, neve, neve, corteMat, neve], 0, -15, -30);
  W3.chaoFrente = box(80, 30, 40, neve, 0, -15, 20);
  W3.chaoTras.receiveShadow = W3.chaoFrente.receiveShadow = true;
  // morrinhos de neve ao fundo
  for (let i = 0; i < 9; i++) { const m = new T3.Mesh(new T3.SphereGeometry(4 + rnd(i) * 5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), neve); m.scale.y = 0.35; m.position.set((rnd(i * 3.3) - 0.5) * 70, 0, -25 - rnd(i * 7.1) * 25); scene.add(m); }

  // monte de neve solta (etapas monte/sopra)
  W3.monte = new T3.Mesh(new T3.SphereGeometry(2.0, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xfbfdff, { roughness: 1 }));
  W3.monte.castShadow = true; W3.monte.receiveShadow = true; scene.add(W3.monte);
  // buraco de onde saem os blocos
  W3.cava = box(2.2, 0.04, 1.4, mat(0xb9cfe2, { roughness: 1 }), -4.2, 0.0, 1.0);

  // blocos da cupula em espiral
  W3.blocoMat = mat(0xeef5fb, { roughness: 0.9 });
  W3.blocoNovo = mat(0xffe27a, { roughness: 0.7, emissive: 0x6b5200 });
  W3.blocos = [];
  for (let j = 0; j < ROWS; j++) {
    const phiM = PHI0 + (j + 0.5) / ROWS * (PHI1 - PHI0), r = R * Math.cos(phiM), n = Math.max(4, Math.round(2 * Math.PI * r / 0.82));
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + j * 0.37, phi = PHI0 + (j + i / n) / ROWS * (PHI1 - PHI0);
      const rr = R * Math.cos(phi), y = HD * Math.sin(phi);
      const nz = new T3.Vector3(Math.cos(phi) * Math.cos(a), Math.sin(phi) * R / HD, Math.cos(phi) * Math.sin(a)).normalize();
      const tx = new T3.Vector3(-Math.sin(a), 0, Math.cos(a)), ty = new T3.Vector3().crossVectors(nz, tx).normalize();
      const w = 2 * Math.PI * rr / n * 0.95, b = new T3.Mesh(new T3.BoxGeometry(w, 0.4, 0.4), W3.blocoMat);
      b.castShadow = true; b.receiveShadow = true;
      b.quaternion.setFromRotationMatrix(_m.makeBasis(tx, ty, nz)); b.position.set(rr * Math.cos(a), y, rr * Math.sin(a));
      const da = Math.atan2(Math.sin(a), Math.cos(a));
      b.userData = { porta: Math.abs(da) < 0.42 && phi < 0.5, z: rr * Math.sin(a) };
      scene.add(b); W3.blocos.push(b);
    }
  }
  W3.chave = cyl(0.42, 0.5, 0.36, W3.blocoMat, 20); W3.chave.position.y = HD + 0.02;

  // tunel de entrada: cavidade na secao (corte) + telhado de neve (meia-calha) por fora
  // cavidade inteira (vazio do tunel): forma simples por baixo do nivel do chao
  const cav = new T3.Shape();
  cav.moveTo(1.2, 0.0); cav.lineTo(1.2, -0.3); cav.quadraticCurveTo(1.25, -0.95, 1.9, -0.95); cav.lineTo(3.5, -0.95); cav.quadraticCurveTo(4.0, -0.9, 4.4, 0.0); cav.closePath();
  W3.cavidade = new T3.Mesh(new T3.ShapeGeometry(cav, 24), mat(0x86a9c8, { roughness: 1 })); W3.cavidade.position.z = 0.02; scene.add(W3.cavidade);
  W3.porch = grupo();
  const metade = (z) => { const m = new T3.Mesh(new T3.CylinderGeometry(0.85, 0.85, 1.6, 24, 1, false, z, Math.PI / 2), mat(0xeef5fb, { roughness: 0.9, side: T3.DoubleSide })); m.rotation.z = Math.PI / 2; m.position.set(2.95, 0.0, 0); m.castShadow = true; W3.porch.add(m); return m; };
  W3.porchTras = [metade(Math.PI / 2)];
  W3.porchFrente = [metade(0)];
  W3.boca = new T3.Mesh(new T3.CircleGeometry(0.62, 24, 0, Math.PI), mat(0x24384d, { roughness: 1 })); W3.boca.rotation.y = Math.PI / 2; W3.boca.position.set(3.76, 0.0, 0); W3.porch.add(W3.boca);

  // banco elevado (metade de tras aparece no corte)
  W3.banco = box(2.5, 0.7, 2.0, mat(0xe6eff7, { roughness: 1 }), -0.85, 0.35, -1.0);
  W3.pele = box(1.9, 0.08, 1.4, mat(0x8a6a4a, { roughness: 1 }), -0.85, 0.74, -0.9);

  // pessoa (construtor fora; depois sentada no banco) e lamparina de oleo
  W3.pessoa = pessoa(scene, 0xc9452f);
  W3.lamp = grupo(); W3.lamp.position.set(0.55, 0.72, -0.4);
  const pedra = new T3.Mesh(new T3.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(0x6b6b66)); pedra.position.y = 0.02; W3.lamp.add(pedra);
  W3.chama = new T3.Mesh(new T3.SphereGeometry(0.07, 10, 8), new T3.MeshBasicMaterial({ color: 0xffb340 })); W3.chama.scale.y = 1.8; W3.chama.position.y = 0.12; W3.lamp.add(W3.chama);
  W3.luz = new T3.PointLight(0xffa040, 0, 7, 1.2); W3.luz.position.set(0.55, 1.2, -0.2); scene.add(W3.luz);

  // nevasca
  W3.neve = new T3.InstancedMesh(new T3.SphereGeometry(0.055, 6, 4), new T3.MeshBasicMaterial({ color: 0xffffff }), NNEVE);
  W3.neve.frustumCulled = false; scene.add(W3.neve);
  // ar quente (laranja) e frio (azul)
  W3.quente = [...Array(NAR)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.09, 10, 8), new T3.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.85 })); scene.add(m); m.userData = { f: rnd(i * 2.3), a: rnd(i * 5.9), b: rnd(i * 8.7) }; return m; });
  W3.frio = [...Array(NAR)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.09, 10, 8), new T3.MeshBasicMaterial({ color: 0x3f8cff, transparent: true, opacity: 0.85 })); scene.add(m); m.userData = { f: rnd(i * 3.1), a: rnd(i * 6.3), b: rnd(i * 9.2) }; return m; });
}

function atualiza(t, ctx) {
  const s = Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), k = ctx.lt, corte = CORTE.has(ETAPAS[s]);
  W3.s = s;
  scene.background = new T3.Color(s === 10 ? 0x8fa6c4 : 0xcfe0ee);
  scene.fog = new T3.Fog(s === 10 ? 0x8fa6c4 : 0xcfe0ee, 25, 90);
  sun.position.set(-8, 9, 10); sun.target.position.set(0, 0.5, 0);
  sun.intensity = s === 10 ? 1.2 : 2.4;

  // monte de neve solta e o vento levando
  W3.monte.visible = s <= 1;
  const leva = s === 1 ? ease(clamp(k * 1.3)) : 0, cresce = s === 0 ? back(clamp(k * 2)) : 1;
  W3.monte.scale.set(cresce * (1 - 0.75 * leva), cresce * 0.75 * (1 - 0.85 * leva), cresce * (1 - 0.6 * leva));
  W3.monte.position.x = leva * 1.6;

  // blocos: quantos ja estao no lugar
  const total = W3.blocos.length, row0 = W3.blocos.findIndex(b => b.position.y > 0.55);
  let vis = 0;
  if (s === 2) vis = Math.floor(ease(clamp(k * 1.2)) * Math.max(1, row0));
  else if (s === 3) vis = Math.max(1, row0) + Math.floor(ease(clamp(k * 1.1)) * (total - row0));
  else if (s >= 4) vis = total;
  W3.blocos.forEach((b, i) => {
    let v = i < vis;
    if (b.userData.porta && s >= 5) v = false;
    if (corte && b.userData.z > 0.05) v = false;
    b.visible = v;
    b.material = (s === 2 || s === 3) && i === vis - 1 ? W3.blocoNovo : W3.blocoMat;
  });
  W3.chave.visible = s >= 4;
  W3.chave.position.y = HD + 0.02 + (s === 4 ? (1 - back(clamp(k * 2.2))) * 2.5 : 0);
  if (corte) W3.chave.visible = false;
  W3.cava.visible = s === 2 || s === 3;

  // corte: some a laje da frente e aparece a secao
  W3.chaoFrente.visible = !corte;
  W3.cavidade.visible = corte && s >= 6;
  W3.cavidade.scale.set(1, s === 6 ? ease(clamp(k * 2.5)) : 1, 1);
  W3.porch.visible = s >= 6;
  W3.porchFrente.forEach(m => { m.visible = !corte; });
  W3.boca.visible = !corte;
  W3.banco.visible = W3.pele.visible = s >= 7;
  const sobe = s === 7 ? back(clamp(k * 2.2)) : 1;
  W3.banco.scale.y = Math.max(0.01, sobe); W3.banco.position.y = 0.35 * sobe; W3.pele.position.y = 0.74 * sobe;

  // pessoa
  const dentro = s >= 7 && s <= 9;
  W3.pessoa.visible = s <= 4 || dentro;
  if (dentro) { W3.pessoa.position.set(-0.9, 0.5, -0.5); W3.pessoa.rotation.set(0, 0.35, 0); W3.pessoa.scale.setScalar(0.9); }
  else { W3.pessoa.position.set(-3.4, 0, 1.6); W3.pessoa.rotation.set(0, 0.6 + Math.sin(t * 2) * 0.05, 0); W3.pessoa.scale.setScalar(1); }
  W3.lamp.visible = s >= 7 && s <= 9;
  W3.chama.scale.set(1 + 0.15 * Math.sin(t * 17), 1.8 + 0.3 * Math.sin(t * 23), 1);
  W3.luz.intensity = s >= 7 && s <= 9 ? 6 + Math.sin(t * 19) * 0.6 : s === 10 ? 10 : 0;
  W3.luz.position.set(s === 10 ? 1.0 : 0.55, s === 10 ? 0.8 : 1.2, s === 10 ? 0.4 : -0.2);

  // nevasca: forte no monte/sopra, leve nos blocos
  const forte = s <= 1 ? 1 : s <= 4 ? 0.35 : s === 10 ? 0.25 : 0;
  W3.neve.visible = forte > 0;
  for (let i = 0; i < NNEVE; i++) {
    const vel = 6 + rnd(i * 1.7) * 5, on = rnd(i * 4.4) < forte;
    const px = ((t * vel + rnd(i * 2.9) * 30) % 30) - 15, py = 0.1 + rnd(i * 5.3) * 5 + Math.sin(t * 3 + i) * 0.2, pz = (rnd(i * 7.7) - 0.4) * 9;
    _v.set(px, on ? py : -50, pz); _m.compose(_v, _q.identity(), _s); W3.neve.setMatrixAt(i, _m);
  }
  W3.neve.instanceMatrix.needsUpdate = true;

  // ar quente e frio (so no corte)
  const ar = corte;
  W3.quente.forEach((m, i) => {
    const u = m.userData; m.visible = ar;
    if (!ar) return;
    if (s === 5) {
      // porta no nivel do chao: o quente sai pelo alto da porta e sobe la fora
      const q = (t * 0.35 + u.f) % 1;
      if (q < 0.5) m.position.set(lerp(-1.2 + u.a * 1.5, 2.1, q * 2), lerp(1.0 + u.b * 0.8, 0.55, q * 2), 0.25);
      else m.position.set(lerp(2.1, 4.2, (q - 0.5) * 2), 0.55 + (q - 0.5) * 2 * 1.8, 0.25);
    } else {
      // preso la em cima, girando devagar
      const ang = t * 0.5 + u.f * 6.28, cx = -0.3 + Math.cos(ang) * (0.6 + u.a * 0.8), cy = 1.55 + Math.sin(ang) * 0.35 + u.b * 0.2;
      m.position.set(cx, cy, 0.25);
    }
  });
  W3.frio.forEach((m) => {
    const u = m.userData; m.visible = ar;
    if (!ar) return;
    if (s === 5) {
      // entra rente ao chao
      const q = (t * 0.32 + u.f) % 1;
      m.position.set(lerp(4.2, -1.6, q), 0.14 + u.b * 0.18, 0.25);
    } else {
      // escorrega para o fundo do tunel e fica la
      const fundo = new T3.Vector3(2.0 + u.a * 1.6, -0.82 + u.b * 0.45, 0.25);
      const ini = new T3.Vector3(-1.0 + u.a * 2.2, 0.15 + u.b * 0.2, 0.25);
      const kk = s === 6 ? ease(clamp(k * 1.6 - u.f * 0.4)) : 1;
      m.position.lerpVectors(ini, fundo, kk); m.position.x += Math.sin(t * 1.3 + u.f * 9) * 0.06;
    }
  });
}

const CAM = {
  monte: { y: 1.0, d: 13, h: 2.6, a: 0.15 }, sopra: { y: 1.0, d: 13, h: 2.4, a: 0.05 },
  blocos: { y: 0.9, d: 12, h: 3.2, a: -0.25, x: -1.2 }, espiral: { y: 1.2, d: 12.5, h: 3.4, a: 0.35 }, domo: { y: 1.3, d: 12.5, h: 2.6, a: -0.2 },
  porta: { y: 1.1, d: 11, h: 1.0, x: 0.9 }, tunel: { y: 0.4, d: 10.5, h: 1.2, x: 1.6 }, banco: { y: 1.1, d: 9.5, h: 1.0, x: -0.3 },
  isola: { y: 1.1, d: 11, h: 1.0, x: 0.3 }, quente: { y: 0.8, d: 12.5, h: 1.0, x: 0.9 }, final: { y: 1.0, d: 13.5, h: 1.8, a: 0.55, x: 0.9 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: 1, d: 13, a: 0, h: 2.5 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const S = W3.s, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)', tm = ctx.t0 + 0.4 * (ctx.t1 - ctx.t0);
  if (S === 0) pill(W / 2, H * 0.14, '❄ −40°', '#3f8cff', '#fff', 52, s);
  if (S === 1) pill(W / 2, H * 0.14, 'BLOWN AWAY', COL.red, '#fff', 48, back((t - tm) * 3));
  if (S === 2) pill(W / 2, H * 0.14, 'Wind-packed snow blocks', branco, COL.ink, 40, s);
  if (S === 3) pill(W / 2, H * 0.14, '🌀 Spiral', branco, COL.ink, 48, s);
  if (S === 4) pill(W / 2, H * 0.14, 'No frame needed', COL.green, '#fff', 46, back((t - tm) * 3));
  if (S === 5) { const [px, py] = proj(2.6, 1.6, 0); pill(px, py - 60, '🔥 Heat escapes', COL.red, '#fff', 40, s); }
  if (S === 6) { const [px, py] = proj(3.0, -1.4, 0); pill(px, py + 40, '❄ Cold air sinks', '#3f8cff', '#fff', 40, back((t - tm) * 3)); }
  if (S === 7) { const [px, py] = proj(-0.3, 2.3, 0); pill(px, py - 30, '🔥 Warm air rises', '#ff8a2a', '#fff', 40, s); }
  if (S === 8) pill(W / 2, H * 0.14, 'Snow = trapped air', branco, COL.ink, 44, s);
  if (S === 9) {
    const [ox, oy] = proj(4.2, 2.6, 0), [ix, iy] = proj(-0.3, 2.2, 0);
    pill(Math.min(W - 200, ox), oy - 40, 'Outside −40°', '#3f8cff', '#fff', 38, s);
    pill(Math.max(200, ix), iy - 40, 'Inside ~0°C', '#ff8a2a', '#fff', 38, back((t - tm) * 3));
  }
  if (S === 10) pill(W / 2, H * 0.14, 'You built an igloo', COL.green, '#fff', 44, s);
}
MUNDO = { monta, atualiza, camera, overlay };
})();
