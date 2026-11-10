// kit/camera.js — camera RELATIVA ao ator: usa a posicao e a rotacao reais do alvo e a altura do osso head.
//
// aplicarPlano(cam, plano, alvoObj, t, opts) posiciona a camera no instante t (segundos DENTRO do trecho).
//   plano: aereo, aberto, medio, close, baixo, ombro, pov, nuca
//   alvoObj: { obj, head, altura, raio } — obj (Object3D do ator/criatura), head (osso), altura (m), raio (m)
//   opts: { dur, tremor, scene, obstaculos, fov } — scene+obstaculos permitem desviar de objetos na frente.
//
// close/medio ficam NA FRENTE do rosto (direcao para onde o ator olha); ombro/nuca atras; baixo na frente
// olhando para cima. O enquadramento (quanto o ator ocupa na tela) e calculado pela distancia a partir do fov.
// Tudo deterministico (so depende de t): nenhum relogio, nenhum random livre.
import * as THREE from 'three';

const _cabeca = new THREE.Vector3();
const _frente = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _olha = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _ray = new THREE.Raycaster();
const _dir = new THREE.Vector3();
const _box = new THREE.Box3();

// vetor "frente" do ator no mundo (para onde o rosto aponta). O manequim olha para +Z local; apos rotation.y
// a frente no mundo e (sin ry, 0, cos ry). Usamos a matriz do obj para ser robusto a qualquer rotacao.
function frenteDe(obj) {
  obj.updateMatrixWorld(true);
  obj.getWorldQuaternion(_q);
  _frente.set(0, 0, 1).applyQuaternion(_q); // +Z local = frente do manequim
  _frente.y = 0;
  if (_frente.lengthSq() < 1e-6) _frente.set(0, 0, 1);
  _frente.normalize();
  return _frente;
}

// posicao do ROSTO (olhos) do alvo no mundo: usa o plano do rosto se existir (fica na altura dos olhos),
// senao o osso head, senao uma fracao da altura. E o ponto que a camera mira em close/medio.
function cabecaDe(alvo) {
  if (alvo.rosto) {
    alvo.rosto.getWorldPosition(_cabeca);
  } else if (alvo.head) {
    alvo.head.getWorldPosition(_cabeca);
    _cabeca.y += (alvo.altura || 1.7) * 0.06; // pequeno ajuste p/ cima (osso fica no pescoco)
  } else {
    alvo.obj.getWorldPosition(_cabeca);
    _cabeca.y += (alvo.altura || 1.7) * 0.9;
  }
  return _cabeca;
}

// enquadramento: distancia da camera ao alvo para que uma ALTURA (m) ocupe uma FRACAO da tela, dado o fov vertical.
function distParaEnquadrar(alturaAlvoM, fracaoTela, fovGraus) {
  const fov = THREE.MathUtils.degToRad(fovGraus);
  const alturaVisivel = alturaAlvoM / Math.max(0.05, fracaoTela); // altura total que a tela deve cobrir
  return (alturaVisivel / 2) / Math.tan(fov / 2);
}

// monta pos/olha para um plano, em coordenadas do MUNDO, usando a frente do ator e a cabeca real.
// orbitDeg gira a posicao da camera em volta do alvo (para desviar de obstaculos).
function montar(plano, alvo, a, fov, orbitDeg = 0) {
  const cab = cabecaDe(alvo).clone();          // topo (cabeca) do ator no mundo
  const base = alvo.obj.getWorldPosition(new THREE.Vector3()); base.y = 0; // pes
  const alturaCorpo = Math.max(0.6, cab.y - base.y + (alvo.raio || 0.3));
  const fr = frenteDe(alvo.obj).clone();        // para onde o ator olha (XZ)
  const lado = new THREE.Vector3(fr.z, 0, -fr.x); // perpendicular (lado direito)

  // aplica o orbit (gira a direcao "frente" em volta do eixo Y) para tentar desviar
  if (orbitDeg) {
    const rad = THREE.MathUtils.degToRad(orbitDeg);
    fr.applyAxisAngle(new THREE.Vector3(0, 1, 0), rad);
    lado.set(fr.z, 0, -fr.x);
  }

  const centroCorpo = new THREE.Vector3(base.x, base.y + alturaCorpo * 0.5, base.z);
  let pos = new THREE.Vector3(), olha = new THREE.Vector3();
  const dolly = 0.22 * a; // travelling VISIVEL (aproxima/afasta ao longo do trecho; 2 quadros a 2,5s diferem)
  const desliza = (a - 0.5) * 2; // -1..+1 ao longo do trecho, para o deslize lateral ser perceptivel

  switch (plano) {
    case 'close': { // rosto: olhos no centro do quadro. cab ja e a posicao do rosto (olhos).
      const alvoAltura = 0.95; // altura visivel em metros (cabeca do manequim com folga)
      const d = distParaEnquadrar(alvoAltura, 0.85, fov) * (1 - dolly * 0.5);
      pos.copy(cab).addScaledVector(fr, d).addScaledVector(lado, 0.22 * desliza);
      pos.y = cab.y + 0.04 * desliza;
      olha.copy(cab);
      break;
    }
    case 'medio': { // corpo inteiro ~65% da tela; de frente, leve lateral. Olha p/ o peito (rosto no terco de cima).
      const d = distParaEnquadrar(alturaCorpo * 1.05, 0.72, fov) * (1 - dolly * 0.4);
      pos.copy(centroCorpo).addScaledVector(fr, d).addScaledVector(lado, 0.45 + 0.6 * desliza);
      pos.y = base.y + alturaCorpo * 0.66;
      olha.set(base.x, base.y + alturaCorpo * 0.62, base.z);
      break;
    }
    case 'aberto': { // ator ~25% + cenario; dolly e orbit lateral BEM visiveis ao longo do trecho
      const d = distParaEnquadrar(alturaCorpo, 0.25, fov) * (1 - dolly * 0.6);
      pos.copy(centroCorpo).addScaledVector(fr, d).addScaledVector(lado, 1.2 + 2.4 * desliza);
      pos.y = base.y + alturaCorpo * 0.9 + 0.8 + 0.5 * desliza;
      olha.copy(centroCorpo); olha.y = base.y + alturaCorpo * 0.5;
      break;
    }
    case 'baixo': { // de baixo p/ cima: a criatura/ator INTEIRO (pes ao topo) recortado no ceu.
      // enquadra a altura inteira + folga (0.82) e afasta o bastante; o olhar mira o meio do corpo.
      const d = distParaEnquadrar(alturaCorpo * 1.12, 0.82, fov) * (1 - dolly * 0.25);
      pos.copy(base).addScaledVector(fr, d).addScaledVector(lado, 0.4 + 0.5 * desliza);
      pos.y = base.y + 0.35 + a * 0.4;
      olha.set(base.x, base.y + alturaCorpo * 0.55, base.z);
      break;
    }
    case 'ombro': { // por cima do ombro: ATRAS e ao lado, olhando para a frente do ator
      pos.copy(cab).addScaledVector(fr, -1.1).addScaledVector(lado, 0.75); pos.y = cab.y + 0.15;
      olha.copy(cab).addScaledVector(fr, 3.0); olha.y = cab.y - 0.2;
      break;
    }
    case 'nuca': { // atras da cabeca, seguindo
      pos.copy(cab).addScaledVector(fr, -2.0 + dolly).addScaledVector(lado, 0.15); pos.y = cab.y + 0.2;
      olha.copy(cab).addScaledVector(fr, 3.5); olha.y = cab.y - 0.1;
      break;
    }
    case 'pov': { // ponto de vista do ator, olhando a frente
      pos.copy(cab).addScaledVector(fr, 0.1); pos.y = cab.y;
      olha.copy(cab).addScaledVector(fr, 4.0);
      break;
    }
    case 'aereo': { // de cima mas inclinado p/ o HORIZONTE; orbita visivelmente ao longo do trecho (nunca parada)
      const h = 5.0 + alturaCorpo * 0.7;
      const ang = desliza * 0.5; // gira a posicao em torno do alvo ao longo do trecho
      pos.set(base.x + Math.sin(ang) * (5 + h * 0.4) + 3, base.y + h, base.z + Math.cos(ang) * (5 + h * 0.4) + h * 0.6);
      olha.set(base.x, base.y + 2.0, base.z - 6);
      break;
    }
    default: {
      const d = distParaEnquadrar(alturaCorpo, 0.6, fov);
      pos.copy(centroCorpo).addScaledVector(fr, d); pos.y = base.y + alturaCorpo * 0.6;
      olha.copy(centroCorpo);
    }
  }
  return { pos, olha, cab };
}

// ---- deteccao de obstaculo entre a camera e a cabeca do alvo ----
// devolve TODOS os objetos de topo (filhos de obstaculos) no caminho camera->cabeca (varios raios: cabeca,
// peito e pes do alvo, para pegar tronco que tapa o corpo todo).
function bloqueadores(posCam, cab, base, obstaculos, alvoObj) {
  const achados = new Set();
  if (!obstaculos || !obstaculos.length) return achados;
  const alvos = [cab, new THREE.Vector3((cab.x + base.x) / 2, (cab.y + base.y) / 2, (cab.z + base.z) / 2), base];
  for (const pt of alvos) {
    _dir.copy(pt).sub(posCam); const dist = _dir.length();
    if (dist < 0.05) continue;
    _dir.normalize(); _ray.set(posCam, _dir); _ray.far = dist - 0.3;
    for (const h of _ray.intersectObjects(obstaculos, true)) {
      let o = h.object, doAlvo = false; while (o) { if (o === alvoObj) { doAlvo = true; break; } o = o.parent; }
      if (doAlvo) continue;
      let top = h.object; while (top.parent && !obstaculos.includes(top)) top = top.parent;
      achados.add(top);
    }
  }
  return achados;
}

// camera DENTRO de um objeto? So conta se a camera esta dentro do NUCLEO do objeto (caixa encolhida ~40%),
// nao na copa vazia da arvore. Evita falso positivo quando a camera passa perto de uma arvore sem estar nela.
function dentroDeObjeto(posCam, obstaculos) {
  const centro = new THREE.Vector3(), tam = new THREE.Vector3();
  for (const o of (obstaculos || [])) {
    _box.setFromObject(o);
    if (_box.isEmpty()) continue;
    _box.getCenter(centro); _box.getSize(tam);
    // nucleo: 55% do tamanho em torno do centro (ignora a borda da copa/telhado)
    const nx = tam.x * 0.275, ny = tam.y * 0.4, nz = tam.z * 0.275;
    if (Math.abs(posCam.x - centro.x) < nx && Math.abs(posCam.z - centro.z) < nz &&
        posCam.y > _box.min.y && posCam.y < _box.min.y + tam.y * 0.8) return true;
  }
  return false;
}

// aplica o plano no instante t (segundos dentro do trecho). alvo = {obj, head, altura, raio}.
export function aplicarPlano(cam, plano, alvo, t, opts = {}) {
  const dur = opts.dur || 3;
  const lt = Math.max(0, Math.min(1, t / dur));
  const a = lt * lt * (3 - 2 * lt); // smoothstep (travelling lento)
  const fov = opts.fov || cam.fov || 42;

  // escolhe o orbit que NAO deixa a camera dentro de um objeto (preferindo 0); os troncos que ainda taparem
  // o alvo serao ESCONDIDOS pelo engine (nao basta orbitar, regra da rodada 3).
  const tentativas = [0, 25, -25, 55, -55, 90, -90];
  let m = null;
  for (const orb of tentativas) {
    const cand = montar(plano, alvo, a, fov, orb);
    if (!dentroDeObjeto(cand.pos, opts.obstaculos)) { m = cand; break; }
    if (!m) m = cand;
  }

  let px = m.pos.x, py = m.pos.y, pz = m.pos.z;
  const tr = opts.tremor || 0;
  if (tr > 0) {
    px += Math.sin(t * 57.0) * 0.05 * tr;
    py += Math.sin(t * 61.0 + 1.3) * 0.05 * tr;
    pz += Math.sin(t * 53.0 + 2.1) * 0.04 * tr;
  }
  cam.position.set(px, py, pz);
  cam.lookAt(m.olha.x, m.olha.y, m.olha.z);
  if (opts.fov) { cam.fov = opts.fov; cam.updateProjectionMatrix(); }
  // TODOS os objetos entre a camera e o alvo (cabeca/peito/pes): o engine esconde neste quadro
  const base = alvo.obj.getWorldPosition(new THREE.Vector3()); base.y = 0.1;
  const lista = [...bloqueadores(cam.position, m.cab, base, opts.obstaculos, alvo.obj)];
  return { bloqueado: lista.length > 0, bloqueadores: lista };
}

export const PLANOS = ['aereo', 'aberto', 'medio', 'close', 'baixo', 'ombro', 'pov', 'nuca'];

// sequencia automatica de planos: troca a cada ~2,5 s sem repetir o anterior.
export function planoAutomatico(t, durLinha, planoBase, { passo = 2.5, ordem } = {}) {
  const seq = ordem || ['aberto', 'medio', 'close', 'baixo', 'medio', 'aereo'];
  if (planoBase && planoBase !== 'auto') {
    return { plano: planoBase, tLocal: t, dur: durLinha, idx: 0 };
  }
  const idx = Math.min(seq.length - 1, Math.floor(t / passo));
  const inicio = idx * passo;
  const dur = Math.min(passo, durLinha - inicio);
  return { plano: seq[idx % seq.length], tLocal: t - inicio, dur: Math.max(0.6, dur), idx };
}
