// kit/camera.js — planos de camera com travelling lento automatico (nunca parada) e tremor opcional.
//
// aplicarPlano(cam, plano, alvo, t, opts) posiciona a camera no instante t (segundos DENTRO da cena).
//   planos: aereo, aberto, medio, close, baixo, ombro, pov, nuca
//   alvo = {x,y,z} ponto olhado (ator/marca). opts.tremor>0 adiciona tremor (susto), deterministico.
//
// O travelling e um dolly/orbit PEQUENO e lento em funcao de t: a camera sempre desliza um pouco, nunca congela.
// Tudo deterministico (so depende de t): nenhum relogio, nenhum random livre.
import * as THREE from 'three';

const _v = new THREE.Vector3();

// cada plano devolve a posicao da camera e o ponto olhado, dado o alvo e um avanco a (0..1 do travelling)
function montar(plano, A, a) {
  // A = alvo {x,y,z}; a = avanco suave do travelling (cresce devagar com t)
  const ay = A.y;
  switch (plano) {
    case 'aereo': // olhando de cima, meio inclinado, descendo devagar
      return { pos: [A.x + 1.5 + a * 1.2, 11 - a * 1.5, A.z + 7 + a * 1.5], olha: [A.x, ay * 0.3, A.z - 1] };
    case 'aberto': // cena inteira, afastado, dolly lateral lento
      return { pos: [A.x + 3.2 + a * 1.6, ay + 2.2, A.z + 7.5], olha: [A.x, ay + 0.8, A.z - 1.5] };
    case 'medio': // corpo inteiro / meio corpo, aproximando de leve
      return { pos: [A.x + 1.4 + a * 0.5, ay + 1.6, A.z + 3.8 - a * 0.6], olha: [A.x, ay + 1.3, A.z] };
    case 'close': // rosto, com um leve orbit
      return { pos: [A.x + Math.sin(a * 0.6) * 0.6, ay + 1.62, A.z + 1.5 - a * 0.2], olha: [A.x, ay + 1.6, A.z] };
    case 'baixo': // camera baixa olhando para cima (criatura imponente)
      return { pos: [A.x - 0.8, 0.5 + a * 0.2, A.z + 2.6], olha: [A.x, ay + 2.6, A.z - 0.5] };
    case 'ombro': // por cima do ombro, atras e ao lado
      return { pos: [A.x - 0.7, ay + 1.75, A.z + 1.6], olha: [A.x + 0.6, ay + 1.4, A.z - 3] };
    case 'pov': // ponto de vista do personagem, olhando a frente
      return { pos: [A.x, ay + 1.6, A.z + 0.2], olha: [A.x + Math.sin(a * 0.5) * 0.5, ay + 1.5, A.z - 4] };
    case 'nuca': // atras da cabeca, seguindo
      return { pos: [A.x, ay + 1.75, A.z + 2.2 - a * 0.4], olha: [A.x, ay + 1.55, A.z - 3] };
    default:
      return { pos: [A.x + 2, ay + 1.6, A.z + 4], olha: [A.x, ay + 1.3, A.z] };
  }
}

// aplica o plano no instante t (segundos dentro da cena). dur = duracao prevista do trecho (para o travelling).
export function aplicarPlano(cam, plano, alvo, t, opts = {}) {
  const A = { x: alvo?.x || 0, y: alvo?.y ?? 1.0, z: alvo?.z || 0 };
  const dur = opts.dur || 3;
  // avanco suave 0..1 ao longo do trecho (ease), limitado para o dolly ser lento
  const lt = Math.max(0, Math.min(1, t / dur));
  const a = lt * lt * (3 - 2 * lt); // smoothstep

  const m = montar(plano, A, a);
  let [px, py, pz] = m.pos;

  // tremor de susto (deterministico): soma de senos de alta frequencia, so quando opts.tremor>0
  const tr = opts.tremor || 0;
  if (tr > 0) {
    px += Math.sin(t * 57.0) * 0.06 * tr;
    py += Math.sin(t * 61.0 + 1.3) * 0.06 * tr;
    pz += Math.sin(t * 53.0 + 2.1) * 0.04 * tr;
  }

  cam.position.set(px, py, pz);
  cam.lookAt(m.olha[0], m.olha[1], m.olha[2]);
  if (opts.fov) { cam.fov = opts.fov; cam.updateProjectionMatrix(); }
}

export const PLANOS = ['aereo', 'aberto', 'medio', 'close', 'baixo', 'ombro', 'pov', 'nuca'];

// sequencia automatica de planos: troca a cada 2-3 s sem repetir o anterior.
// dado o tempo t dentro da LINHA e a duracao da linha, devolve {plano, tLocal, dur, idx}.
export function planoAutomatico(t, durLinha, planoBase, { passo = 2.5, ordem } = {}) {
  // ordem padrao de corte (abre -> aproxima -> close -> volta), sem repetir em seguida
  const seq = ordem || ['aberto', 'medio', 'close', 'baixo', 'medio', 'aereo'];
  // se o roteiro fixou um plano, a cena inteira usa ele (travelling continua)
  if (planoBase && planoBase !== 'auto') {
    return { plano: planoBase, tLocal: t, dur: durLinha, idx: 0 };
  }
  const idx = Math.min(seq.length - 1, Math.floor(t / passo));
  const inicio = idx * passo;
  const dur = Math.min(passo, durLinha - inicio);
  return { plano: seq[idx % seq.length], tLocal: t - inicio, dur: Math.max(0.6, dur), idx };
}
