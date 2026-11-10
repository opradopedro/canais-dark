// kit/criatura.js — as criaturas: silhueta alta, vulto parado, rastejante e animal escurecido.
//
// criatura(tipo, opts) -> { obj, mixer, setTime(t), acao(nome) }
//   'alta'       manequim esticado 3-4x na vertical, preto-marrom, braços longos, anima Skeletons_Walking
//   'vulto'      silhueta preta PARADA (sem mixer), olhos brilhando
//   'rastejante' manequim com Crawling, escurecido
//   'animal'     lobo/cachorro dos animais/ escurecido (Walk/Idle), olhos brilhando
//
// Olhos que brilham: material com cor > 1 (fora do intervalo 0..1) para o UnrealBloomPass acender.
// Tudo deterministico (setTime / mixer.setTime), nada de relogio nem random sem semente.
import * as THREE from 'three';
import { instanciar, animacoesManequim, animacoesAnimal } from './modelos.js';

function acharOsso(raiz, ...nomes) {
  let achado = null;
  const alvo = nomes.map(n => n.toLowerCase().replace(/[._:]/g, ''));
  raiz.traverse(b => {
    if (achado || !b.isBone) return;
    const n = b.name.toLowerCase().replace(/[._:]/g, '').replace('mixamorig', '');
    if (alvo.includes(n)) achado = b;
  });
  return achado;
}

// dois olhos que brilham (cor > 1 => bloom). Presos no osso dado (ou no objeto, se nao houver osso).
function porOlhos(destino, { cor = [4, 3.4, 1], raio = 0.09, sep = 0.17, frente = 0.5, alturaY = 0.5 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(cor[0], cor[1], cor[2]) });
  for (const dx of [-sep, sep]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(raio, 12, 8), mat);
    e.position.set(dx, alturaY, frente);
    destino.add(e);
  }
}

function escurecer(obj, cor = 0x14100c, rough = 1) {
  obj.traverse(m => {
    if (m.isMesh) {
      m.material = new THREE.MeshStandardMaterial({ color: cor, roughness: rough });
      m.castShadow = true;
    }
  });
}

// alonga os bracos do manequim. Os ossos (sem ponto, GLTFLoader tira o ponto): upperarml/r, lowerarml/r.
// O osso de braco do rig KayKit cresce ao longo do seu eixo X local (o filho fica deslocado em X), entao
// escalamos .x. Escalar o pai propaga para o filho, por isso aplicamos so no upperarm e no lowerarm (nao na mao).
function alongarBracos(obj, fator) {
  for (const nm of ['upperarml', 'upperarmr', 'lowerarml', 'lowerarmr']) {
    const b = acharOsso(obj, nm);
    if (b) b.scale.x *= fator;
  }
}

export async function criatura(tipo = 'alta', opts = {}) {
  if (tipo === 'vulto') {
    // silhueta humana preta parada, bem escura, olhos brilhando. Manequim em T-pose leve, sem mixer.
    const altura = opts.altura || 2.4;
    const { obj } = await instanciar('personagens/Mannequin_Medium', { altura });
    escurecer(obj, 0x1a2234, 1);  // azul-chumbo bem escuro (nao preto puro): a rim light o recorta do fundo
    const head = acharOsso(obj, 'head');
    if (head) { head.scale.multiplyScalar(0.8); porOlhos(head, { cor: opts.olhos || [4.5, 0.6, 0.6], frente: 0.17, alturaY: 0.02, raio: 0.05, sep: 0.07 }); }
    return { obj, mixer: null, setTime() {}, acao() {}, head, altura, raio: altura * 0.18 };
  }

  if (tipo === 'animal') {
    const arq = 'animais/' + (opts.modelo || 'Wolf');
    const altura = opts.altura || 0.9;
    const { obj, animacoes } = await instanciar(arq, { altura });
    escurecer(obj, opts.cor || 0x15110d, 0.95);
    // olhos brilhando perto do focinho (frente do bicho): prende na raiz, baixo e a frente
    porOlhos(obj, { cor: opts.olhos || [4, 3.2, 0.8], raio: 0.04, sep: 0.06, frente: altura * 0.9, alturaY: altura * 0.75 });
    const mixer = new THREE.AnimationMixer(obj);
    const dic = {}; for (const c of animacoes) dic[c.name] = c;
    let atual = null;
    const acao = (nome) => {
      const clip = dic[nome] || dic['Walk'] || dic['Idle'] || animacoes[0];
      if (!clip) return;
      if (atual) atual.stop();
      atual = mixer.clipAction(clip); atual.reset().play();
    };
    acao(opts.acao || 'Walk');
    return { obj, mixer, setTime: t => mixer.setTime(Math.max(0, t)), acao, head: null, altura, raio: altura };
  }

  // 'alta' ou 'rastejante': manequim com animacao do catalogo
  const esticar = tipo === 'alta' ? (opts.esticar || 3.4) : 1;
  const base = opts.altura || 1.7;
  const { obj } = await instanciar('personagens/Mannequin_Medium', { altura: base, aoChao: true });
  escurecer(obj, opts.cor || 0x241e18, 1);  // marrom-escuro (nao preto): capta a rim light e nao vira buraco preto

  const head = acharOsso(obj, 'head');
  if (head) { head.scale.multiplyScalar(0.8); porOlhos(head, { cor: opts.olhos || [4.5, 3.6, 1], frente: 0.17, alturaY: 0.03, raio: 0.06, sep: 0.08 }); }

  const mixer = new THREE.AnimationMixer(obj);
  const dic = await animacoesManequim();
  let atual = null;
  const acao = (nome) => {
    const clip = dic[nome] || dic['Skeletons_Walking'] || dic['Walking_A'];
    if (!clip) return;
    if (atual) atual.stop();
    atual = mixer.clipAction(clip); atual.reset().play();
  };
  acao(opts.acao || (tipo === 'rastejante' ? 'Crawling' : 'Skeletons_Walking'));

  let altura = base;
  if (tipo === 'alta') {
    obj.scale.y *= esticar;               // estica so na vertical: fica alta e fina
    alongarBracos(obj, 1.7);              // bracos bem compridos (nomes sem ponto)
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    obj.position.y -= box.min.y;          // pes de volta no chao
    altura = box.max.y - box.min.y;
  }

  return { obj, mixer, setTime: t => mixer.setTime(Math.max(0, t)), acao, head, altura, raio: altura * 0.18 };
}
