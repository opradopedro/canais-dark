// kit/modelos.js — carrega e guarda os .glb em cache, normaliza a escala pela ALTURA real e liga sombra.
//
// Por que normalizar: o manequim KayKit vem muito maior que as arvores/casas Quaternius (a prova-assets mostrou).
// Aqui cada modelo e medido com Box3 e redimensionado para a altura real pedida (pessoa 1,7 m, pinheiro 6-10 m...).
// Tudo e DETERMINISTICO: nada de relogio, nada de Math.random sem semente. O tempo vem sempre de render(t).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const RAIZ = new URL('../assets/', import.meta.url).href; // motor-3d/assets/
const loader = new GLTFLoader();
const _cache = new Map();   // caminho -> Promise<gltf> (cru, com animacoes)
const _medida = new Map();  // caminho -> { size:Vector3, center:Vector3 } (box do modelo cru)

// alturas de referencia (metros) por tipo de modelo; usadas quando o cenario nao passa altura explicita
export const ALTURAS = {
  pessoa: 1.7, crianca: 1.2, pinheiro: 8, arvore: 7, arvore_morta: 6, arbusto: 1.1,
  casa: 5, casa_vila: 5.5, torre_sino: 9, moinho: 8, poste: 6, semaforo: 5.5,
  animal_grande: 1.6, animal_medio: 1.0, lobo: 0.9, barraca: 1.8, fogueira: 0.8,
  movel: 1.0, objeto: 0.3, rua: 0.2,
};

function _url(rel) {
  // aceita "natureza/PineTree_1.glb" ou "natureza/PineTree_1"
  if (!rel.endsWith('.glb')) rel += '.glb';
  return RAIZ + rel;
}

// liga sombra em todas as malhas e arruma materiais que vem com cara de plastico
export function ligarSombra(obj) {
  obj.traverse(m => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      if (m.material) {
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const mat of mats) {
          if ('roughness' in mat && mat.roughness < 0.5) mat.roughness = 0.75; // menos brilho de plastico
          if ('metalness' in mat) mat.metalness = Math.min(mat.metalness, 0.1);
        }
      }
    }
  });
  return obj;
}

// carrega o gltf cru (uma vez por arquivo) — devolve Promise
export function carregar(rel) {
  const url = _url(rel);
  if (!_cache.has(url)) {
    _cache.set(url, new Promise((res, rej) => loader.load(url, g => {
      const box = new THREE.Box3().setFromObject(g.scene);
      const size = new THREE.Vector3(), center = new THREE.Vector3();
      box.getSize(size); box.getCenter(center);
      _medida.set(url, { size, center });
      res(g);
    }, undefined, rej)));
  }
  return _cache.get(url);
}

// pre-carrega varios arquivos de uma vez (o engine espera isto antes do 1o quadro)
export function preCarregar(lista) {
  return Promise.all(lista.map(carregar));
}

// devolve uma COPIA pronta para a cena, normalizada pela altura (m) e com os pes no y=0.
// Para modelos com esqueleto (manequim, animais) usa SkeletonUtils.clone (mantem os ossos para o mixer).
// opts: { altura, aoChao=true, sombra=true, girarPeloEixo } ; devolve { obj, animacoes, escala }
export async function instanciar(rel, opts = {}) {
  const url = _url(rel);
  const g = await carregar(rel);
  const temEsqueleto = g.scene.getObjectByProperty('isBone', true) || (g.animations && g.animations.length);
  const obj = temEsqueleto ? SkeletonUtils.clone(g.scene) : g.scene.clone(true);

  const { size, center } = _medida.get(url);
  let escala = 1;
  if (opts.altura && size.y > 1e-4) {
    escala = opts.altura / size.y;
    obj.scale.setScalar(escala);
  }
  if (opts.sombra !== false) ligarSombra(obj);

  // poe os pes no chao (y=0): desconta a base da box ja escalada
  if (opts.aoChao !== false) {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    obj.position.y -= box.min.y;
  }
  return { obj, animacoes: g.animations || [], escala, tamanho: size.clone().multiplyScalar(escala) };
}

// so a altura real do modelo cru (para calcular escalas sem instanciar de novo)
export async function alturaCrua(rel) {
  await carregar(rel);
  return _medida.get(_url(rel)).size.y;
}

// --- animacoes do manequim: todas as ~130 ficam num dicionario nome->AnimationClip ---
const _animCache = new Map();
const ARQUIVOS_ANIM = [
  'Rig_Medium_General', 'Rig_Medium_MovementBasic', 'Rig_Medium_MovementAdvanced',
  'Rig_Medium_Simulation', 'Rig_Medium_Special', 'Rig_Medium_Tools',
  'Rig_Medium_CombatMelee', 'Rig_Medium_CombatRanged',
];

// carrega TODAS as animacoes do rig medium (uma vez). Devolve { nome: AnimationClip }.
export async function animacoesManequim() {
  if (_animCache.has('tudo')) return _animCache.get('tudo');
  const dic = {};
  for (const f of ARQUIVOS_ANIM) {
    const g = await carregar('animacoes/' + f);
    for (const clip of g.animations) if (!dic[clip.name]) dic[clip.name] = clip;
  }
  _animCache.set('tudo', dic);
  return dic;
}

// carrega as animacoes de um animal (Wolf, Horse, Husky...). Devolve { nome: AnimationClip }.
export async function animacoesAnimal(rel) {
  const g = await carregar(rel);
  const dic = {};
  for (const clip of g.animations) dic[clip.name] = clip;
  return dic;
}
