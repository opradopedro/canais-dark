// Mundo "sabao": como o sabao tira gordura (molecula com cabeca que gosta de agua e cauda que gosta de oleo,
// micelas) e como ele e feito (oleo usado + soda caustica = sabao + glicerina).
// Tres lugares no mesmo ponto, ligados por etapa: pia (prato engordurado), "micro" (dentro da agua) e bancada.
// Etapas: prato, repele, molecula, cabeca, mergulha, micela, enxague, oleo, saponifica, cura, final.
(() => {
const ETAPAS = ['prato', 'repele', 'molecula', 'cabeca', 'mergulha', 'micela', 'enxague', 'oleo', 'saponifica', 'cura', 'final'];
const LUGAR = { prato: 'pia', repele: 'pia', molecula: 'micro', cabeca: 'micro', mergulha: 'micro', micela: 'micro',
  enxague: 'pia', oleo: 'banca', saponifica: 'banca', cura: 'banca', final: 'pia' };
const N = 150, NM = 5, RG = 1.3, RM = 0.5;           // moleculas, micelas, raio da gordura e de cada micela
const W3 = {};
const _m = new T3.Matrix4(), _q = new T3.Quaternion(), _v = new T3.Vector3(), _s = new T3.Vector3(), _z = new T3.Vector3(0, 1, 0);

// direcoes espalhadas por igual numa esfera (espiral de Fibonacci)
function fib(i, n) { const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996; return new T3.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); }

function cozinha(g) {
  uvMundo(box(16, 10, 0.3, tmat('concreto', { color: 0xeef2f3, relevo: 0.4 }), 0, 3, -3.2, g), 1.2);
  uvMundo(box(16, 4, 7, tmat('concreto', { color: 0x5b6168, relevo: 0.8 }), 0, -2, -0.2, g), 2);
  // cuba da pia (fundo metalico em volta do prato)
  box(5.2, 0.05, 3.8, mat(0xb9c0c6, { metalness: 0.85, roughness: 0.3 }), 0, 0.02, 0.1, g);
  // prato
  const branco = mat(0xf7f6f2, { roughness: 0.25, metalness: 0.05 });
  const prato = cyl(1.45, 1.2, 0.1, branco, 48, g); prato.position.y = 0.1;
  const borda = new T3.Mesh(new T3.TorusGeometry(1.42, 0.06, 10, 48), branco); borda.rotation.x = Math.PI / 2; borda.position.y = 0.16; g.add(borda);
  // manchas de gordura
  const gord = mat(0xe8a825, { roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.88 });
  W3.manchas = [[-0.35, 0.2, 0.42], [0.45, -0.25, 0.34], [0.1, 0.55, 0.26], [-0.6, -0.45, 0.22], [0.75, 0.4, 0.18], [0.05, -0.05, 0.3]].map(([px, pz, r]) => {
    const m = new T3.Mesh(new T3.SphereGeometry(r, 24, 12), gord); m.scale.set(1, 0.22, 1); m.position.set(px, 0.17, pz); g.add(m); return m;
  });
  // torneira cromada
  const cromo = mat(0xdfe5ea, { metalness: 1, roughness: 0.12 });
  cyl(0.12, 0.14, 3.2, cromo, 20, g).position.set(0, 1.6, -2.4);
  const bico = cyl(0.09, 0.09, 2.2, cromo, 20, g); bico.rotation.x = Math.PI / 2; bico.position.set(0, 3.2, -1.3);
  cyl(0.11, 0.09, 0.25, cromo, 20, g).position.set(0, 3.1, -0.22);
  // jato de agua e gotas
  W3.aguaMat = new T3.MeshStandardMaterial({ color: 0x9fd4f5, roughness: 0.05, transparent: true, opacity: 0.6 });
  W3.jato = cyl(0.07, 0.09, 2.9, W3.aguaMat, 16, g); W3.jato.castShadow = false; W3.jato.position.set(0, 1.55, -0.22);
  W3.gotas = [...Array(40)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.05 + rnd(i * 3.1) * 0.05, 10, 8), W3.aguaMat); g.add(m); m.userData = { a: rnd(i * 1.7) * 6.28, f: rnd(i * 5.3), v: 0.6 + rnd(i * 2.2) }; return m; });
  // espuma e gotinhas de gordura indo embora
  const esp = new T3.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true, opacity: 0.7 });
  W3.espuma = [...Array(36)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.06 + rnd(i * 4.4) * 0.12, 12, 8), esp); g.add(m); const a = rnd(i * 2.9) * 6.28, r = rnd(i * 7.7) * 1.2; m.userData = { x: Math.cos(a) * r, z: Math.sin(a) * r, f: rnd(i * 9.1) }; return m; });
  W3.pontos = [...Array(30)].map((_, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.035, 8, 6), mat(0xe8a825, { roughness: 0.2 })); g.add(m); m.userData = { a: rnd(i * 3.3) * 6.28, f: rnd(i * 6.1) }; return m; });
  // barra de sabao (cena final)
  W3.barra = grupo(g);
  const bm = mat(0xf2d7c8, { roughness: 0.45 });
  const geo = new T3.BoxGeometry(1.1, 0.38, 0.7, 6, 3, 4), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new T3.Vector3().fromBufferAttribute(p, i), k = 0.86 + 0.14 * Math.cos(v.x * 1.4) * Math.cos(v.z * 2); p.setXYZ(i, v.x * (0.94 + 0.06 * Math.cos(v.y * 4)), v.y * k, v.z); }
  geo.computeVertexNormals();
  const b = new T3.Mesh(geo, bm); b.castShadow = true; W3.barra.add(b);
  W3.barra.position.set(1.9, 0.3, 0.9); W3.barra.rotation.y = -0.5;
}

function molecula(g) {
  // molecula grande e detalhada: cabeca (carboxilato) + cauda em zigue-zague de carbonos com hidrogenios
  W3.mol = grupo(g);
  W3.cabMat = mat(0xff5a3a, { roughness: 0.35 });
  W3.cauMat = mat(0x4a4f57, { roughness: 0.5 });
  const cab = new T3.Mesh(new T3.SphereGeometry(0.42, 32, 20), W3.cabMat); W3.mol.add(cab);
  for (const s of [-1, 1]) { const o = new T3.Mesh(new T3.SphereGeometry(0.2, 20, 14), W3.cabMat); o.position.set(s * 0.32, 0.3, 0); W3.mol.add(o); }
  const hm = mat(0xf2f2f2, { roughness: 0.4 });
  let prev = new T3.Vector3(0, -0.35, 0);
  for (let i = 0; i < 12; i++) {
    const c = new T3.Vector3((i % 2 ? 0.16 : -0.16), -0.55 - i * 0.26, 0);
    const at = new T3.Mesh(new T3.SphereGeometry(0.15, 16, 12), W3.cauMat); at.position.copy(c); W3.mol.add(at);
    const lig = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.05, c.distanceTo(prev), 8), W3.cauMat);
    lig.position.copy(c).add(prev).multiplyScalar(0.5); lig.quaternion.setFromUnitVectors(_z, c.clone().sub(prev).normalize()); W3.mol.add(lig);
    for (const s of [-1, 1]) { const h = new T3.Mesh(new T3.SphereGeometry(0.08, 10, 8), hm); h.position.set(c.x * 1.9, c.y, s * 0.2); W3.mol.add(h); }
    prev = c;
  }
}

function micro(g) {
  // dentro da agua: fundo azul, moleculas de agua passeando, gordura e moleculas de sabao instanciadas
  W3.aguaPart = [...Array(46)].map((_, i) => {
    const o = grupo(g), om = mat(0x4aa3ff, { roughness: 0.3 }), hm = mat(0xffffff, { roughness: 0.3 });
    o.add(new T3.Mesh(new T3.SphereGeometry(0.11, 12, 8), om));
    for (const s of [-1, 1]) { const h = new T3.Mesh(new T3.SphereGeometry(0.065, 10, 6), hm); h.position.set(s * 0.1, 0.07, 0); o.add(h); }
    o.userData = { p: new T3.Vector3((rnd(i * 1.3) - 0.5) * 7, (rnd(i * 2.7) - 0.5) * 11, -1.5 - rnd(i * 4.1) * 4), f: rnd(i * 6.6) };
    return o;
  });
  W3.gordura = new T3.Mesh(new T3.SphereGeometry(RG, 48, 32), mat(0xf0b02a, { roughness: 0.18, metalness: 0.05 })); g.add(W3.gordura);
  W3.gotasM = [...Array(NM)].map(() => { const m = new T3.Mesh(new T3.SphereGeometry(RM, 32, 20), W3.gordura.material); g.add(m); return m; });
  W3.cMic = [...Array(NM)].map((_, j) => { const a = j / NM * 6.28 + 0.4; return new T3.Vector3(Math.cos(a) * 2.05, Math.sin(a) * 2.6, (j % 2 ? -0.6 : 0.4)); });
  W3.cabI = new T3.InstancedMesh(new T3.SphereGeometry(0.15, 14, 10), mat(0xff5a3a, { roughness: 0.35 }), N);
  W3.cauI = new T3.InstancedMesh(new T3.CylinderGeometry(0.045, 0.035, 0.62, 8), mat(0x4a4f57, { roughness: 0.5 }), N);
  for (const m of [W3.cabI, W3.cauI]) { m.frustumCulled = false; m.castShadow = false; g.add(m); }
  W3.dir = [...Array(N)].map((_, i) => fib(i, N));
  W3.dirM = [...Array(N)].map((_, i) => fib(Math.floor(i / NM), N / NM));
  W3.ini = [...Array(N)].map((_, i) => new T3.Vector3((rnd(i * 3.7) - 0.5) * 9, (rnd(i * 8.3) - 0.5) * 14, (rnd(i * 5.1) - 0.5) * 3));
}

function bancada(g) {
  uvMundo(box(16, 10, 0.3, tmat('concreto', { color: 0xd8d2c8, relevo: 0.8 }), 0, 3, -3.2, g), 2);
  uvMundo(box(16, 4, 7, tmat('madeira', { relevo: 1 }), 0, -2, -0.2, g), 2);
  const inox = mat(0xdde2e6, { metalness: 0.55, roughness: 0.32, side: T3.DoubleSide });
  // panela de inox aberta
  const corpo = new T3.Mesh(new T3.CylinderGeometry(1.0, 0.95, 1.3, 40, 1, true), inox); corpo.position.set(0, 0.65, 0); corpo.castShadow = true; g.add(corpo);
  cyl(0.95, 0.95, 0.04, inox, 40, g).position.set(0, 0.02, 0);
  W3.liqMat = mat(0xc98a1c, { roughness: 0.15 });
  W3.liq = new T3.Mesh(new T3.CircleGeometry(0.97, 40), W3.liqMat); W3.liq.rotation.x = -Math.PI / 2; g.add(W3.liq);
  // pote de vidro com oleo usado
  W3.pote = grupo(g); W3.pote.position.set(-1.9, 0, 0.2);
  const vidro = new T3.MeshStandardMaterial({ color: 0xe8f2f4, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false });
  W3.oleoPote = cyl(0.36, 0.36, 0.95, mat(0xb8740f, { roughness: 0.15, transparent: true, opacity: 0.9 }), 24, W3.pote);
  W3.oleoPote.castShadow = false;
  cyl(0.42, 0.42, 1.4, vidro, 24, W3.pote).position.y = 0.7;
  // galao de soda caustica com faixa de perigo
  W3.galao = grupo(g); W3.galao.position.set(1.9, 0, 0.1);
  box(0.8, 1.3, 0.55, mat(0xf4f4f0, { roughness: 0.5 }), 0, 0.65, 0, W3.galao);
  box(0.81, 0.32, 0.56, mat(0xff4b3e, { roughness: 0.5 }), 0, 0.7, 0, W3.galao);
  cyl(0.14, 0.14, 0.22, mat(0x1d5fbf), 16, W3.galao).position.set(0.2, 1.4, 0);
  // colher de pau
  W3.colher = grupo(g);
  const pau = cyl(0.05, 0.05, 2.0, tmat('madeira', { relevo: 0.5 }), 10, W3.colher); pau.position.y = 1.0;
  const conc = new T3.Mesh(new T3.SphereGeometry(0.17, 14, 10), pau.material); conc.scale.set(1, 1.4, 0.4); W3.colher.add(conc);
  // jatos (oleo e soda)
  W3.fio = cyl(0.06, 0.06, 1, mat(0xb8740f, { roughness: 0.15 }), 10, g); W3.fio.castShadow = false;
  // forma com barras, luvas e oculos
  W3.forma = grupo(g); W3.forma.position.set(0, 0, 1.6);
  box(3.2, 0.12, 1.0, mat(0x2e6fb5, { roughness: 0.6 }), 0, 0.06, 0, W3.forma);
  W3.barras = [-1.2, -0.4, 0.4, 1.2].map(px => box(0.7, 0.36, 0.7, mat(0xf3e6c4, { roughness: 0.55 }), px, 0.3, 0, W3.forma));
  W3.epi = grupo(g); W3.epi.position.set(-2.1, 0, 1.6);
  const luva = mat(0x3b6fe0, { roughness: 0.6 });
  for (const s of [0, 1]) { const l = box(0.45, 0.08, 0.95, luva, s * 0.55, 0.05, 0, W3.epi); l.rotation.y = s ? -0.3 : 0.2; }
  const lente = new T3.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.55, roughness: 0.05 });
  for (const s of [-1, 1]) { const o = new T3.Mesh(new T3.TorusGeometry(0.22, 0.05, 8, 24), mat(0x222222)); o.position.set(0.3 + s * 0.27, 0.3, -0.75); o.rotation.x = -0.25; W3.epi.add(o); const l = new T3.Mesh(new T3.CircleGeometry(0.21, 24), lente); l.position.copy(o.position); l.rotation.x = -0.25; W3.epi.add(l); }
}

function monta() {
  scene.add(sun.target);
  reflexos(0.6);
  W3.pia = grupo(); W3.micro = grupo(); W3.banca = grupo();
  cozinha(W3.pia); molecula(W3.micro); micro(W3.micro); bancada(W3.banca);
  W3.micro.position.y = 2;
}

function instancia(i, cab, cau, esc) {
  // cabeca em cab, cauda apontando de cab para cau
  _s.setScalar(esc);
  _m.compose(cab, _q.identity(), _s); W3.cabI.setMatrixAt(i, _m);
  _v.copy(cau).sub(cab); const L = _v.length(); _q.setFromUnitVectors(_z, _v.normalize());
  _m.compose(_v.copy(cab).lerp(cau, 0.5), _q, _s); W3.cauI.setMatrixAt(i, _m);
}

function atualiza(t, ctx) {
  const s = Math.max(0, ETAPAS.indexOf(ctx.p.etapa)), k = ctx.lt, lugar = LUGAR[ETAPAS[s]];
  W3.s = s; W3.lugar = lugar;
  W3.pia.visible = lugar === 'pia'; W3.micro.visible = lugar === 'micro'; W3.banca.visible = lugar === 'banca';
  scene.background = new T3.Color(lugar === 'micro' ? 0x5fb0e6 : lugar === 'banca' ? 0xd8d2c8 : 0xe8eef0);
  scene.fog = lugar === 'micro' ? new T3.Fog(0x5fb0e6, 8, 22) : null;
  sun.position.set(-5, 12, 9); sun.target.position.set(0, 0.5, 0);

  if (lugar === 'pia') {
    const agua = s !== 10, limpa = s === 6 ? ease(clamp(k * 1.4)) : s === 10 ? 1 : 0;
    W3.jato.visible = agua; W3.jato.scale.x = W3.jato.scale.z = 1 + 0.08 * Math.sin(t * 30);
    W3.manchas.forEach((m, i) => { const e = 1 - limpa; m.visible = e > 0.02; m.scale.set(e, 0.22 * e, e); });
    // gotas: escorregam por cima da gordura no 'repele' (rolam para fora), espalham no resto
    W3.gotas.forEach((m) => {
      const u = m.userData, q = (t * u.v + u.f) % 1; m.visible = agua;
      const r = 0.15 + q * (s === 1 ? 1.5 : 1.1), y = 0.22 + Math.sin(q * Math.PI) * (s === 1 ? 0.35 : 0.2);
      m.position.set(Math.cos(u.a) * r, y, -0.22 + Math.sin(u.a) * r * 0.9);
    });
    W3.espuma.forEach((m) => { const u = m.userData; m.visible = s === 6 || s === 10; const e = s === 10 ? 1 : ease(clamp(k * 2)); m.position.set(u.x, 0.2 + Math.abs(Math.sin(t * 1.5 + u.f * 6)) * 0.05, u.z); m.scale.setScalar(e * (0.8 + 0.3 * Math.sin(t * 2 + u.f * 9))); });
    W3.pontos.forEach((m) => { const u = m.userData, q = (t * 0.7 + u.f) % 1; m.visible = s === 6 && k > 0.15; const r = 0.3 + q * 2.4; m.position.set(Math.cos(u.a) * r, 0.22 - Math.max(0, r - 1.45) * 0.25, Math.sin(u.a) * r); });
    W3.barra.visible = s === 10; W3.barra.position.y = 0.3 + (s === 10 ? (1 - back(clamp(k * 2.5))) * 1.5 : 0);
  }

  if (lugar === 'micro') {
    W3.aguaPart.forEach((o) => { const u = o.userData; o.position.set(u.p.x + Math.sin(t * 0.7 + u.f * 9) * 0.3, u.p.y + Math.cos(t * 0.5 + u.f * 7) * 0.3, u.p.z); o.rotation.set(t * 0.8 + u.f * 6, t * 0.6, 0); });
    // molecula sozinha (molecula, cabeca)
    W3.mol.visible = s === 2 || s === 3;
    if (W3.mol.visible) {
      const ent = s === 2 ? back(clamp(k * 2.2)) : 1;
      W3.mol.scale.setScalar(ent * 1.25); W3.mol.position.set(0, 2.6, 0); W3.mol.rotation.set(0.1, t * 0.6, 0.18);
      const pc = s === 3 && k < 0.45 ? 0.5 + 0.5 * Math.sin(t * 12) : 0, pt = s === 3 && k >= 0.45 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
      W3.cabMat.emissive.setRGB(pc * 0.6, pc * 0.2, 0); W3.cauMat.emissive.setRGB(pt * 0.45, pt * 0.4, 0);
    }
    // gordura + moleculas instanciadas (mergulha, micela)
    const vivo = s === 4 || s === 5;
    W3.gordura.visible = vivo; W3.cabI.visible = W3.cauI.visible = vivo;
    const sep = s === 5 ? ease(clamp(k * 1.6)) : 0;
    W3.gordura.scale.setScalar(Math.max(0.001, 1 - sep));
    W3.gotasM.forEach((m, j) => { m.visible = vivo && sep > 0.01; m.position.copy(W3.cMic[j]).multiplyScalar(sep); m.scale.setScalar(Math.max(0.001, sep)); });
    if (vivo) {
      const cab = new T3.Vector3(), cau = new T3.Vector3(), a = new T3.Vector3(), b = new T3.Vector3();
      for (let i = 0; i < N; i++) {
        const d = W3.dir[i];
        // no 'mergulha' cada uma nada do lugar inicial ate a superficie, cauda para dentro
        const ki = s === 4 ? ease(clamp(k * 1.8 - rnd(i * 1.9) * 0.7)) : 1;
        a.copy(d).multiplyScalar(RG + 0.33); b.copy(d).multiplyScalar(RG - 0.25);
        if (ki < 1) {
          const ini = W3.ini[i], vai = _v.set(Math.sin(t + i), Math.cos(t * 1.3 + i), 0).multiplyScalar(0.25);
          const ca = ini.clone().add(vai), cu = ca.clone().add(new T3.Vector3(Math.sin(i * 2.1 + t * 0.5), Math.cos(i * 1.3), Math.sin(i * 0.7)).normalize().multiplyScalar(0.58));
          a.lerpVectors(ca, a, ki); b.lerpVectors(cu, b, ki);
        }
        if (sep > 0) {
          const j = i % NM, c = W3.cMic[j], dm = W3.dirM[i];
          cab.copy(dm).multiplyScalar(RM + 0.33).add(c); cau.copy(dm).multiplyScalar(RM - 0.22).add(c);
          a.lerp(cab, sep); b.lerp(cau, sep);
        }
        instancia(i, a, b, 1);
      }
      W3.cabI.instanceMatrix.needsUpdate = W3.cauI.instanceMatrix.needsUpdate = true;
      const gira = s === 5 ? t * 0.25 : t * 0.12;
      W3.cabI.rotation.y = W3.cauI.rotation.y = W3.gordura.rotation.y = gira;
      W3.gotasM.forEach(m => { m.rotation.y = 0; });
      // as micelas giram junto: aplica a mesma rotacao nas gotas
      W3.gotasM.forEach((m, j) => { const p = W3.cMic[j].clone().multiplyScalar(sep).applyAxisAngle(_z, gira); m.position.copy(p); });
    }
  }

  if (lugar === 'banca') {
    // nivel e cor: oleo ambar -> soda entra -> massa cremosa de sabao
    const cheio = s === 7 ? 0.15 + 0.45 * ease(clamp(k * 1.5)) : 0.6 + (s >= 8 ? 0.1 * ease(clamp(k * 2)) : 0);
    W3.liq.position.set(0, 0.04 + cheio * 1.1, 0); W3.liq.visible = s !== 9;
    const cor = s === 7 ? 0 : s === 8 ? ease(clamp((k - 0.3) * 1.6)) : 1;
    W3.liqMat.color.setRGB(lerp(0.79, 0.95, cor), lerp(0.54, 0.9, cor), lerp(0.11, 0.77, cor)); W3.liqMat.roughness = lerp(0.15, 0.6, cor);
    // pote inclina e despeja (oleo), galao inclina e despeja (soda)
    const p1 = s === 7 ? Math.sin(Math.PI * clamp(k * 1.25)) : 0, p2 = s === 8 ? Math.sin(Math.PI * clamp(k * 2.2)) : 0;
    W3.pote.position.set(-1.9 + p1 * 0.75, p1 * 1.3, 0.2); W3.pote.rotation.z = -p1 * 1.6;
    W3.oleoPote.scale.y = s === 7 ? Math.max(0.05, 1 - ease(clamp(k * 1.3))) : 0.05; W3.oleoPote.position.y = 0.48 * W3.oleoPote.scale.y;
    W3.galao.position.set(1.9 - p2 * 0.7, p2 * 1.2, 0.1); W3.galao.rotation.z = p2 * 1.5;
    W3.fio.visible = p1 > 0.8 || p2 > 0.8;
    W3.fio.material.color.set(p2 > 0.8 ? 0xf0f6ff : 0xb8740f);
    const xf = p1 > 0.8 ? -0.55 : 0.6, yf = 0.04 + cheio * 1.1, alto = 2.1;
    W3.fio.scale.y = alto - yf; W3.fio.position.set(xf, (alto + yf) / 2, 0.2);
    W3.colher.visible = s === 8 && k > 0.35;
    W3.colher.position.set(Math.cos(t * 4) * 0.45, yf - 0.2, Math.sin(t * 4) * 0.45); W3.colher.rotation.set(Math.sin(t * 4) * 0.25, 0, -Math.cos(t * 4) * 0.25);
    W3.forma.visible = W3.epi.visible = s === 9;
    W3.barras.forEach((b, i) => { const e = s === 9 ? back(clamp(k * 3 - i * 0.25)) : 0; b.scale.set(1, Math.max(0.01, e), 1); b.position.y = 0.12 + 0.18 * e; });
  }
}

const CAM = {
  prato: { y: 0.3, d: 7.5, h: 4.2 }, repele: { y: 0.25, d: 5.2, h: 2.6, a: 0.25 }, enxague: { y: 0.3, d: 6.8, h: 3.6, a: -0.2 }, final: { y: 0.4, d: 7.5, h: 3.4, x: 0.5 },
  molecula: { y: 2.5, d: 7.5, h: 0.3 }, cabeca: { y: 2.5, d: 7, h: 0.2, a: 0.3 }, mergulha: { y: 2.0, d: 10.5, h: 0.5 }, micela: { y: 2.0, d: 11.5, h: 0.6, a: -0.3 },
  oleo: { y: 1.0, d: 7.2, h: 2.0, x: -0.4 }, saponifica: { y: 1.0, d: 7.2, h: 2.4, x: 0.3 }, cura: { y: 0.6, d: 8.2, h: 3.4, x: -0.3 },
};
function camera(t, ctx) { cameraPadrao(t, ctx, { x: 0, y: 0.5, d: 7, a: 0, h: 3, zFoco: 0 }, p => CAM[p.etapa] || {}); }

function overlay(t, ctx) {
  const S = W3.s, s = back((t - ctx.t0) * 3), branco = 'rgba(255,255,255,0.92)';
  // flash branco ao trocar de lugar (entra na agua, sai dela)
  if (ctx.i > 0) {
    const ant = LUGAR[(ST.cenas[ctx.i - 1].p || {}).etapa];
    if (ant && ant !== W3.lugar) { const a = clamp(1 - (t - ctx.t0) * 3.5); if (a > 0) { x.fillStyle = `rgba(255,255,255,${a})`; x.fillRect(0, 0, W, H); } }
  }
  if (S === 0) pill(W / 2, H * 0.16, 'Grease', '#e8a825', '#fff', 46, s);
  if (S === 1) { pill(W / 2, H * 0.14, 'Oil + Water', branco, COL.ink, 44, s); pill(W / 2, H * 0.14 + 90, "DON'T MIX", COL.red, '#fff', 44, back((t - ctx.t0) * 3 - 1.2)); }
  if (S === 2) pill(W / 2, H * 0.12, 'Soap molecule', branco, COL.ink, 46, s);
  if (S === 3) {
    const [hx, hy] = proj(0, 4.6, 0), [tx, ty] = proj(0, 1.0, 0), tm = ctx.t0 + 0.45 * (ctx.t1 - ctx.t0);
    pill(hx, hy - 150, '💧 Loves water', COL.red, '#fff', 40, s);
    if (ctx.lt > 0.4) pill(tx, ty + 60, '🛢️ Loves oil', '#3d434b', '#fff', 40, back((t - tm) * 3));
  }
  if (S === 4) pill(W / 2, H * 0.12, 'Tails dig in', '#3d434b', '#fff', 44, s);
  if (S === 5) pill(W / 2, H * 0.12, 'Micelles', COL.green, '#fff', 48, s);
  if (S === 6) pill(W / 2, H * 0.14, 'Washed away', COL.green, '#fff', 44, s);
  if (S === 7) { const [px, py] = proj(-1.9, 1.9, 0.2); pill(Math.max(230, px), Math.max(150, py - 120), 'Used cooking oil', '#b8740f', '#fff', 40, s); }
  if (S === 8) {
    if (ctx.lt < 0.5) { const [px, py] = proj(1.9, 1.7, 0.1); pill(Math.min(W - 230, px), py - 110, '⚠ Lye (NaOH)', COL.red, '#fff', 40, s); }
    const tm = ctx.t0 + 0.45 * (ctx.t1 - ctx.t0), y0 = H * 0.12;
    if (ctx.lt > 0.45) { pill(W / 2, y0, 'Fat + Lye', branco, COL.ink, 42, back((t - tm) * 3)); pill(W / 2, y0 + 95, '= Soap + Glycerin', COL.green, '#fff', 42, back((t - tm) * 3 - 1.2)); }
  }
  if (S === 9) {
    pill(W * 0.3, H * 0.12, '🧤 Gloves + goggles', branco, COL.ink, 36, s);
    const k = ease(clamp((ctx.lt - 0.35) * 1.8)), y0 = H * 0.2, x0 = W * 0.12, w = W * 0.76;
    if (ctx.lt > 0.3) {
      pill(W / 2, y0, `Cure: ${Math.max(1, Math.ceil(k * 4))} of 4 weeks`, COL.green, '#fff', 40, 1);
      x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(x0, y0 + 60, w, 30); x.fillStyle = COL.green; x.fillRect(x0, y0 + 60, w * k, 30);
    }
  }
  if (S === 10) pill(W / 2, H * 0.14, 'Now you know', COL.green, '#fff', 46, s);
}
MUNDO = { monta, atualiza, camera, overlay };
})();
