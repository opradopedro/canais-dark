# motor-3d — o que já está pronto e o que falta

Atualizado por Kiro em 11/11/2026 (rodada 5: rosto, pose, aéreo, últimos ajustes). Branch `producao`.

## Pronto

### Rodadas 1–3 (resumo)
Estrutura (kit, engine determinístico, legenda, ligação no `render.py`), câmera relativa ao ator, noite legível,
rostos, bibliotecas de personagens (semente), 13 criaturas, fiscal, catálogos, `variedade.py`.

### Rodada 4 — acabamento
- **Corpo inteiriço** (`kit/corpo.js`): cada segmento vai do osso ao osso filho, medido em coordenadas do mundo na
  pose de repouso e preso com `attach`; esfera em cada junta (ombro, cotovelo, pulso, quadril, joelho, tornozelo);
  tronco grosso (profundidade ~60% da largura), pescoço, mãos no pulso, tênis no tornozelo. Sem vão em `Idle_A`,
  `Walking_A`, `Running_A`, `Crawling`, `Sit_Chair_Idle`, `Death_A` (`testes/saida/catalogo_poses.jpg`,
  gerado por `testes/poses.py`).
- **Criaturas humanoides no mesmo corpo**: `alta`, `sem_rosto`, `mulher_branca` (cabelo preto cobrindo o rosto,
  braços ligados, vestido), `espantalho`, `lobisomem` (focinho, orelhas, tufos, curvado com `Sneaking`),
  `gigante_mitologico`, `rastejante`, `vulto` (silhueta humana inteira com borda esfumada), `fantasma` (corpo
  translúcido que afina embaixo). `catalogo_criaturas.jpg` mostra cada uma parada e andando.
- **8 cenários acabados** (`kit/cenarios/acabados.js`): `bairro`, `floresta` (com torre de vigia), `estrada`,
  `casa_interior`, `cemiterio`, `hospital`, `vila`, `templo_oriental`. Chão com textura própria, 19–39 objetos de
  detalhe cada, luz de dia e de noite (postes, janelas, lanternas, velas acendem; interiores trocam a cor da
  lâmpada), 6+ marcas a ≥ 1,5 m de qualquer parede ou objeto grande. `testes/cenarios_check.py` confere tudo.
- **Os outros 19 cenários são rascunho**: o engine dá erro claro se um roteiro pedir um deles.
- **Câmera**: nos interiores fica presa no cômodo com 1,5 m de folga das paredes; fora, longe 1,5 m de casas e
  objetos grandes. Em plano de ambiente sem ator, o assunto é o maior objeto principal perto da marca (casa > carro >
  poste). Em plano aberto/aéreo com ator, um objeto principal fica ao fundo.
- **Fiscal**: + teste "quadro sem assunto" (ator + criatura + objetos principais < 10% da tela reprova).
  **SV, HM e CL passam.** O teste SV saiu da `torre` (rascunho) para a `floresta`.
- **Lago congelado/cabana na neve**: chão branco-azulado em todo o cenário (continuam rascunho).
- Catálogos novos (`catalogo_personagens`, `catalogo_criaturas`, `catalogo_cenarios` com os 8 de dia e de noite),
  folhas SV/HM/CL e `SV-3d_amostra.mp4` (20 s, ~0,8 MB).

### Rodada 5 — rosto, pose, aéreo, últimos ajustes
- **Sem "máscara de bandido"**: cabelo, boné, gorro e capuz agora são calotas inclinadas para trás
  (`calotaInclinada` em `kit/personagem.js`): a frente fica acima da sobrancelha, a nuca desce. Calota com dois lados
  (a fresta entre cabeça e cabelo não mostra o céu). Barba só no queixo, abaixo da boca. Rosto continua só olhos,
  sobrancelhas e boca em fundo transparente.
- **Em pé de verdade**: o esqueleto do manequim era "chibi" (quadril a ~18% da altura). `proporcionar()` em
  `kit/corpo.js` dá proporção humana aos ossos (perna 2,6× mais longa, base do pescoço a 84,5% da altura); as
  animações perdem as faixas de posição (`clipsHumanos()`, só o quadril fica) e, depois do mixer, `posAnimar()`
  endireita a perna nas poses paradas (Idle_A: joelho quase reto), solta os braços junto ao corpo e apoia os pés no
  chão em todo quadro. Pessoa de 1,70 m fica com ~1,74 m até o topo da cabeça (porta de 2,2 m sobra por cima).
- **Criatura alta**: braços pendurados junto ao corpo quando parada, com balanço leve; corpo um pouco mais grosso.
  As outras humanoides paradas também soltam um pouco os braços.
- **Fantasma liso**: passada só de profundidade antes da cor → uma camada translúcida só, sem faixas.
- **Mãos menores**: ~1,3× a grossura do antebraço (antes 1,35× a do braço).
- **Aéreo mostra a rua**: alto e longe (12–13,5 m de altura, 14–16 m atrás; 9 m/10 m em cenário com poucos objetos),
  olhando ao longo do eixo em que casas/postes se espalham; o giro e o deslocamento são escolhidos para caberem
  mais objetos no quadro (`montarAereoRua` em `kit/camera.js`). Dentro de cômodo não há aéreo (vira aberto).
- **Cortes planejados** (`planejarCortes`): o vídeo inteiro vira uma lista de cortes; `plano: aereo` do roteiro só
  vale no 1º corte da linha; nunca aéreo seguido de aéreo e no máximo 1 aéreo a cada 6 cortes (o excedente vira
  aberto/médio). Plano de objeto `medio` agora é mais perto e de lado (não repete o `aberto`).
- **Fiscal**: + "aéreo seguido de aéreo" e + "mais de 1 aéreo a cada 6 cortes" (lista `window.__cortes` e quadros
  amostrados). Corrigida a medida do ciano (o tone mapping clareava o ciano e as casas não contavam como assunto).
  **SV, HM e CL passam.**
- Re-gerados: `catalogo_personagens`, `catalogo_criaturas`, `catalogo_poses`, folhas SV/HM/CL e
  `SV-3d_amostra.mp4` (20 s, ~0,8 MB).

## Falta / pontos a melhorar

1. **19 cenários em rascunho**: escola, metrô, elevador, posto, farol, lago congelado, mina, igreja antiga,
   deserto, praia, fazenda, castelo, mercado medieval, cidade grega, navio, cabana na neve, campo, acampamento, torre.
   Cada um precisa do mesmo acabamento dos 8 (e passar no `cenarios_check.py`) antes de entrar num vídeo.
2. **Proporção nova x animações**: as poses vêm do esqueleto chibi; em `Walking_A`/`Running_A` o passo fica
   largo e os braços ainda abrem um pouco. `Death_A` em t≈1 s ainda está de pé (a queda vem depois).
3. **Aéreo em cenário sem rua** (floresta, cemitério): escolhe o melhor giro, mas a "rua" é só o eixo dos objetos.
4. **Figurantes** da vila continuam na versão leve (sem esqueleto); trocar pelo personagem completo se o tempo de
   render permitir.
5. **O que o Claude faz depois**: conferir catálogos e folhas, atualizar `ROTEIROS.md`, os `series.md` e o
   `validar_roteiros.py` (exigir `visual:3d` + `cena` + `elenco`, aceitar só os 8 cenários acabados, ligar o
   `variedade.py`). **Eu NÃO mexi nesses arquivos.**
