# Mundos e peças de cena (vale para o Kiro e para o Claude)

Biblioteca de cenários para REAPROVEITAR. Criar cenário é a parte que mais gasta crédito; usar um que já
existe é de graça. Antes de criar, procure aqui. Depois de criar, acrescente na tabela.

Há dois tipos:

| Tipo | Onde | Quem usa | Como o roteiro chama |
|---|---|---|---|
| **Mundo 3D** (Three.js) | `so-you-built-it/scripts/mundos/<nome>.js` | So You Built It | `"mundo": "<nome>"` e cada cena com `"p": {"etapa": "..."}` |
| **Peça de cena** (canvas 2D com profundidade) | `hora-muerta/scripts/engine.html`, `COMP.<nome>` | Signal Lost, Old Tales, Hora Muerta | cada cena com `"comp": "<nome>"` e `"p": {...}` |

## Como criar sem quebrar nada
1. `git pull origin producao`.
2. Mundo 3D: copie o mais parecido (`fossa.js` = terreno em corte; `borracha.js` = vários lugares com zoom;
   `vaso.js` = objeto cortado por plano). Guia completo: seção "Escrever um mundo novo" em `so-you-built-it/SKILL.md`.
   Helpers do motor: `quintal, arvore, tmat('terra'|'concreto'|'madeira'|'grama'|'asfalto'|'cobre'|...), mat, box, solid,
   cyl, grupo, uvMundo, reflexos, proj, pill, cameraPadrao`.
3. Peça de cena: ADICIONE um `COMP.<nome>` novo em `engine.html` (antes de `COMP.texto`). Nunca mude uma peça que já
   existe: outro canal usa. Escreva no comentário acima dela quais `p.` ela aceita.
4. Faça um roteiro de teste (ou use o real) e peça a prévia no GitHub (não pesa o PC, não gasta narração):
   escreva o caminho do roteiro em `.github/previa.txt`, faça commit e `git push origin producao`. Os JPGs aparecem
   em https://github.com/opradopedro/canais-dark/releases/tag/previas (`<CODIGO>_previa_<segundo>.jpg`).
   No PC também dá: `python motor-en/previa.py <roteiro> <pasta>`.
5. OLHE os JPGs. Conserte o que estiver feio, vazio ou confuso.
6. Acrescente a linha na tabela abaixo, rode `python motor-en/validar_roteiros.py`, commit e push.

## Mundos 3D (So You Built It)
| Mundo | O que mostra | Etapas principais | Serve para |
|---|---|---|---|
| `fossa` | terreno em corte com quintal e sobrado, camadas de solo, lençol freático | buraco, caixa, filtro | fossa, poço, cisterna, porão, fundação (qualquer coisa enterrada) |
| `borracha` | vários lugares na mesma cena com corte e zoom | — | modelo para Curiosidades de objeto pequeno |
| `fechadura` | cilindro de fechadura em corte, pinos | — | fechadura, cadeado |
| `geladeira` | geladeira em corte, ciclo do gás | — | geladeira, freezer, bomba de calor |
| `microondas` | micro-ondas em corte, ondas | — | micro-ondas, forno |
| `tela` | pixels e camadas da tela do celular | — | telas, LED, toque |
| `arcondicionado` | split interno e externo, ciclo | — | ar-condicionado, desumidificador |
| `ponte` | rio em corte com pilar | — | ponte, pilar, ensecadeira |
| `piscina` | piscina em corte com lençol | — | piscina, lago, tanque |
| `bunker` | vala reaterrada com objeto trocável, raios gama na camada 2D | — | abrigo, porão, coisa enterrada |
| `eletrico` | carro na rua com raio-x, bateria, inversor, motor em corte | — | carro elétrico, motor, bateria |
| `guindaste` | canteiro, prédio que cresce, poste com talha, guindaste de torre | — | guindaste, talha, obra |
| `vaso` | vaso sanitário cortado por plano, sifão com água, caixa com boia | — | descarga, sifão, encanamento |
| `navio` | mar aberto com ondas, porta-contêineres, corte do casco, lastro | — | navio, estabilidade, contêiner, flutuação |
| `controle` | sala com TV e sofá + controle remoto em raio X (domos de borracha, pastilha de carbono, chip, LED infravermelho), feixe de luz, onda do código | sala, camera, botao, aperta, chip, led, pulsos, sensor, final | controle remoto, sensores, qualquer aparelho com botão e luz |
| `tunel` | rio em corte com cidade, túnel cortado no eixo, escudo, tuneladora | — | túnel, metrô, escavação |

## Peças de cena (engine.html)
| Peça | O que mostra | Clima | Canais |
|---|---|---|---|
| `reloj` | relógio digital vermelho no escuro | terror | SV, HM |
| `puerta` | porta de casa abrindo, luz por baixo, mão | terror | HM |
| `pasillo` | corredor em perspectiva com vulto ao fundo | terror | SV, HM |
| `ventana` | janela à noite | terror | HM |
| `vela` | vela com retrato | terror | HM |
| `ojos` | olhos no escuro | terror | SV, HM |
| `telefono` | celular com mensagem na tela | terror | SV, HM |
| `tela`, `tres_espejos`, `bano`, `camino`, `rio`, `autobus`, `manglar`, `pies` | cenas do Hora Muerta | terror | HM |
| `elevator` | cabine de elevador 3D, portas de metal, fresta de luz, sombra, dedos | terror | SV |
| `olho`, `quarto` | olho enorme; quarto em perspectiva com cama, lanterna, tábuas | terror gótico | (arquivo do Old Tales) |
| `vila` | vila medieval: céu por hora (aurora/dia/tarde), casas de palha, igreja com sino, castelo, colheita, fogueira | calmo | CL |
| `casa` | casa de camponês por dentro: fogo central, cama de palha, mesa, raio de sol | calmo | CL |
| `mercado` | rua de feira medieval: casas de enxaimel, toldos, placas, gente, porcos, portão | calmo | CL |
| `texto` | cartela de texto (no tema calmo vira pergaminho dourado) | os dois | todos |
