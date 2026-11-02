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
| `detector` | cozinha com detector no teto, fogao e fumaca + camara de ionizacao em raio X (americio, particulas alfa, ions + e -, placas, circuito, medidor de corrente), apito | teto, fonte, alfa, ions, corrente, fumaca, cai, apita, final | detector de fumaca, radiacao, sensores, corrente eletrica |
| `fechadura` | cilindro de fechadura em corte, pinos | — | fechadura, cadeado |
| `geladeira` | geladeira em corte, ciclo do gás | — | geladeira, freezer, bomba de calor |
| `microondas` | micro-ondas em corte, ondas | — | micro-ondas, forno |
| `tela` | pixels e camadas da tela do celular | — | telas, LED, toque |
| `arcondicionado` | split interno e externo, ciclo | — | ar-condicionado, desumidificador |
| `ponte` | rio em corte com pilar | — | ponte, pilar, ensecadeira |
| `panela` | panela de pressao cortada ao meio no fogao: agua, comida, bolhas, vapor que escapa, tampa que trava, anel de borracha, moleculas de vapor presas, termometro 100->121 C, barras de tempo, peso da valvula que pula | aberta, escapa, tampa, anel, pressao, termo, comida, valvula, final | panela de pressao, ponto de ebulicao, vapor, cozinha |
| `sabao` | sabao por dentro: prato com gordura, agua que escorre, molecula com cabeca e cauda, micelas prendendo a gordura, enxague, oleo usado + soda virando sabao e glicerina, barras curando | prato, repele, molecula, cabeca, mergulha, micela, enxague, oleo, saponifica, cura, final | sabao, detergente, gordura, quimica, limpeza |
| `iglu` | campo de neve com nevasca: monte de neve que o vento leva, blocos de neve em espiral (destaque no bloco novo), cupula com bloco-chave, CORTE ao meio com porta no nivel do chao, tunel mais baixo que o piso, banco elevado, pessoa, lamparina, particulas de ar quente (laranja) e frio (azul) | etapas: monte, sopra, blocos, espiral, domo, porta, tunel, banco, isola, quente, final | iglu, neve, isolamento, ar quente sobe / frio desce (YB037) |
| `caneta` | mesa com caderno e caneta esferografica que escreve (traco cresce), furinho do corpo com ar entrando e tinta baixando, caneta-tinteiro com borrao; ponta ampliada e cortada: encaixe de latao, esfera de aco que rola no papel deixando trilha, tinta no canal | etapas: escreve, ponta, encaixe, tinta, rola, grossa, furo, biro, final | caneta, ponta, esfera, tinta, objetos pequenos ampliados (YB038) |
| `piscina` | piscina em corte com lençol | — | piscina, lago, tanque |
| `bunker` | vala reaterrada com objeto trocável, raios gama na camada 2D | — | abrigo, porão, coisa enterrada |
| `eletrico` | carro na rua com raio-x, bateria, inversor, motor em corte | — | carro elétrico, motor, bateria |
| `guindaste` | canteiro, prédio que cresce, poste com talha, guindaste de torre | — | guindaste, talha, obra |
| `vaso` | vaso sanitário cortado por plano, sifão com água, caixa com boia | — | descarga, sifão, encanamento |
| `navio` | mar aberto com ondas, porta-contêineres, corte do casco, lastro | — | navio, estabilidade, contêiner, flutuação |
| `controle` | sala com TV e sofá + controle remoto em raio X (domos de borracha, pastilha de carbono, chip, LED infravermelho), feixe de luz, onda do código | sala, camera, botao, aperta, chip, led, pulsos, sensor, final | controle remoto, sensores, qualquer aparelho com botão e luz |
| `poco` | quintal com terreno em corte: buraco, desmorona, aneis de concreto, sarilho e balde, bomba manual com cano transparente, lencol que desce (linha 25 ft), bomba eletrica submersa + caixa d'agua, cascalho, tela, laje e chuva | buraco, desmorona, revestimento, balde, manual, seca, eletrica, filtro, final | poco, agua subterranea, bombas, solo em camadas |
| `porao` | casa em corte com porao (moveis), agua do solo que empurra paredes e sobe pelo piso, manta, dreno frances no cascalho, poco de coleta com bomba de boia, cano de saida, valvula de retencao | cava, vaza, manta, sobe, dreno, poco, bomba, valvula, final | porao, impermeabilizacao, drenagem, bombas |
| `terreno` | quintal com solo em corte (grama, terra, argila mole cinza, areia, rocha) e PECAS LIGADAS POR PARAMETRO em cada cena (sem etapas fixas): casa/predio/torre de Pisa que afunda, inclina, racha e treme; sapata, estacas (concreto ou madeira), radier, baldrame, manta, subsolo-caixa, apoios de borracha; lencol, poco com bomba, argila que encolhe; monumento com degraus; encosta, corte, deslizamento, muro de arrimo, dreno+barbacas, gabiao; estrada (lama, cascalho, base, asfalto, abaulado, valetas, buraco, cano de esgoto, caverna, cratera); ferrovia (trilho, dormente, lastro); calcada com junta e raiz; poste de cerca (podre, concreto, cascalho); chuva, setas, rotulos | lista completa de `p` no comentario do topo de `terreno.js` (foco, casa, afunda, inclina, estacas, encosta, estrada, trilho, poste...) | fundacao, solo, terremoto, muro, estrada, ferrovia, calcada, cerca, cidade que afunda, Pisa, Veneza (YB022-YB035) |
| `tunel` | rio em corte com cidade, túnel cortado no eixo, escudo, tuneladora | — | túnel, metrô, escavação |

## Peças FLAT (estilo novo de Hora Muerta e Old Tales, 01/11) — guia: `ESTILO-VISUAL.md`
Só com `"visual": "flat"` no roteiro. Nome `f_<nome>` (exceto o exemplo `retrato`). Kit: `TF()` (paleta do canal), `fonte`, `fundoFlat`, `caixa`, `papel`,
`pessoa`, `corpoFlat` (pessoa de corpo inteiro, anda e carrega lanterna), `velaFlat`, `cempa`, `camFlat` (câmera com `foco`/`escala`); o motor desenha `hud` e `cartao` a partir do `p` de qualquer cena.

| Peça | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `retrato` | close de um personagem flat com rosto (respira, pisca); fundo do canal: HM violeta com janela de lua e vela, CL verde com janela em arco e fogo | `pessoa:{chapeu, cabeloTipo, barba, bigode, oculos, pele, roupa, detalhe, expressao, olhar}`, `zoomRosto`, `janela`, `fundo`, `luz` | apresentar personagem, reação, regras/plano (com `cartao`) |
| `f_panteon` | cemitério de povoado à noite: lua, igreja ao fundo, cruzes e lápides com cempasúchil, caminho de pétalas, tumba sem nome com vela, portão de ferro | `vela` 0..1, `tumba` 0..1 (abre), `reja` 0..1, `nota` (papel no portão), `marta` {x, y, s, lanterna, saia, cabeloTipo...} (pessoa de corpo inteiro), `foco`/`escala` (câmera) | cemitério, velório, Día de Muertos, lendas de túmulo |
| `f_pueblo` | rua de povoado latino: casas coloridas, papel picado balançando, igreja com sino, poste, cachorro; a casa da direita é "a casa da personagem" | `janelas` 0..1, `casa` 'apagada'/'acesa'/'vulto', `porta` 0..1, `amanhecer` 0..1, `chamado` "texto", `cachorro`, `poste` 'pisca', `sino`, `marta` {x: [de, ate], anda: 1, ...}, `foco`/`escala` | qualquer história de povoado, rua à noite, volta pra casa |
| `f_onibus` | (HM e SV) dentro de um ônibus à noite, visto do fundo: corredor, bancos, janelas com postes passando, motorista e retrovisor | `passageiros` N, `vulto` 0..1 (alguém sentado num banco vazio), `porta` 0..1, `parado`, `afunda` 0..1 (ônibus inclina), `espelho` (olhos no retrovisor), `luzes` 'piscam', `foco`/`escala` | ônibus, metrô, trem, viagem à noite |
| `f_posto` | (SV, serve ao HM) posto de gasolina sozinho na estrada à noite: toldo com luz, 2 bombas, loja com balconista, placa alta, pinheiros, carro que chega | `carro` 0..1 (entra pela direita), `farol` false, `luz` 'piscam', `vulto` 0..1 (na beira do mato), `chuva`, `placa` "texto", `balconista` false, `foco`/`escala` | posto, loja de conveniência, estrada, plantão noturno |
| `f_aldeia` | (Old Tales) vila inglesa de 1300 de lado: céu pela hora, faixas de plantação, igreja de pedra, casas de palha com fumaça, poço, galinhas | `ceu` aurora/dia/tarde/noite, `luzes` 0..1, `poste` (ale-stake), `sino`, `galinhas`, `pessoas` [{x, anda, capuz, touca, saia, ...}], `foco`/`escala` | qualquer história de vila medieval |
| `f_casa` | (Old Tales) interior camponês: fogo no chão, fumaça subindo pelo telhado, cama de palha, caldeirão, barris, cabra | `fogo` 0..1, `caldeirao`, `barris` N, `cabra`, `noite`, `pessoa` {x, ...}, `foco`/`escala` | casa medieval, cozinha, noite em família |

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

### Peça nova do engine.html (Hora Muerta)
- `siguanaba`: mulher de costas lavando roupa numa pedra do rio, guacal dourado; p.dist [a,b], p.vira [a,b] (0 costas, 1 cara de cavalo); o evento `susto` faz ela virar de vez. Usada em HM013-014.
- `metro`: corredor do vagao de metro parado no tunel, bancos, barras, janelas; porta de vidro no fundo mostra o vagao da frente. p.luz [a,b], p.parpadeo, p.frente [a,b], p.gente (0 = vazio), p.cara, p.tunel (luzes passando). Eventos: apaga, aparece (rosto no vidro), mano (marca de mao). Usada em SV005-008.
- `salao` (Old Tales, calmo): salao do castelo com lareira, tapecarias, janelas em arco, juncos. p.hora aurora|dia|noite, p.mesa (trenchers), p.gente 0..1, p.camas (palha, meninos, cachorro), p.armadura (cavaleiro sendo vestido), p.espada + p.toque [a,b] (cerimonia de cavaleiro). Usada em CL004-006.
- `forja` (Old Tales, calmo): ferreiro, fornalha, bigorna, cocho. p.faiscas, p.vapor (ferradura na agua), p.malha (cota de malha + barril de areia). Usada em CL004-006.
- `oso` (Hora Muerta): quintal à noite com cerca e bicicleta, urso polar DE PÉ com olhos vermelhos. p.dist [a,b] (1 longe, 0 colado), p.foto (moldura de foto de celular com data p.fecha), p.bici. Eventos acerca, susto. Usada em HM015-016.
- `mina` (Signal Lost): galeria de mina em perspectiva com quadros de madeira, trilho, água escura que sobe, luz do capacete. p.agua [a,b], p.lampada, p.parpadeo, p.fundo [a,b] (luz debaixo da água no fundo), p.pisca, p.cima (luz de resgate de cima), p.burbujas. Evento luz. Usada em SV009-011.

## Peças dos pacotes do Kiro (`hora-muerta/scripts/pecas/`, ver KIRO-PROMPT.md)
Cada pacote acrescenta as suas linhas na própria seção (assim os agentes não se atrapalham).

### Pacote 01 (01-kit-efeitos)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `fxChuva(t,f,vento)` | riscos de chuva inclinados + respingos | `f` 0..1, `vento` | qualquer cena de chuva |
| `fxNeve(t,f)` | flocos redondos caindo com balanço | `f` 0..1 | inverno, neve |
| `fxNevoa(t,f,y)` | faixas translúcidas deslizando na altura `y` | `f` 0..1, `y` 0..1 | névoa de floresta/mar |
| `fxFumaca(cx,cy,t,f)` | coluna de bolinhas subindo | `f` 0..1 | chaminé, incenso, fogueira |
| `fxFogo(cx,cy,s,t)` | fogueira/tocha flat, 3 camadas + brilho | `s` tamanho | fogueira, tocha, lareira |
| `fxFagulhas(cx,cy,t,f)` | faíscas subindo | `f` 0..1 | forja, fogueira |
| `fxFolhas(t,f,cor)` | folhas de outono girando ao cair | `f`, `cor` | outono, campo |
| `fxPetalas(t,f,cor)` | pétalas caindo (pêssego, cempasúchil) | `f`, `cor` | flor, magia, Dia de Muertos |
| `fxVagalumes(t,f)` | pontinhos verdes que piscam e flutuam | `f` 0..1 | selva, noite |
| `fxPoeira(t,f,y)` | poeira do chão (estrada, batalha) | `f`, `y` | falange, estrada |
| `fxRelampago(t,quando)` | clarão + raio em zigue-zague | `quando` t(s) do flash | tempestade |
| `fxOndas(y,t,c1,c2)` | mar/rio flat em 3 camadas | `y` linha d'água, `c1/c2` | mar, rio, lago |
| `fxRaiosLuz(cx,cy,t,f)` | feixes de luz divinos | `f` 0..1 | igreja, céu divino, Buda |
| `fxBrilhoMagico(cx,cy,t,f)` | estrelinhas girando | `f` 0..1 | magia, imortalidade |
| `fxPuff(cx,cy,t,t0)` | nuvem de fumaça que estoura | `t0` instante | transformação, sumiço |
| `fxFlechas(t,t0,f)` | saraivada de flechas no céu | `t0`, `f` | Termópilas, cerco |
| `ceuFlat(tipo,t)` | céu inteiro com sol/lua e nuvens | `tipo`: aurora/dia/tarde/por/noite/tempestade/eclipse/boreal/dez_sois/estrelas | fundo de qualquer cena ao ar livre |
| `luaFlat(cx,cy,r,fase,t)` | lua com fase e halo | `fase` 0..1 | noite |
| `estrelasFlat(t,n)` | estrelas piscando (posições fixas) | `n` quantidade | céu noturno |
| `COMP.f_ceu` | só o céu (passagem de tempo, abertura) | `tipo`, `lua`, `chuva`, `neve`, `nevoa`, `relampago` | plano de céu, transição de tempo |

### Pacote 02 (02-kit-figuras)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `figura(cx,base,s,o,t)` | pessoa de corpo inteiro no traço flat | `o.figurino`, `o.pose` (parado/anda/corre/aponta/ajoelha/luta/reza/carrega/senta), `o.olhar` -1/1, `o.arma`, `o.escudo`, `o.expressao`, `o.pele/cabelo/roupa` | qualquer personagem de época numa cena |
| figurinos | campones, camponesa, monge, freira, cavaleiro, escudeiro, senhor, dama, ferreiro, mercador, hoplita, menino_esparta, legionario, viking, samurai, ashigaru, hanfu, hanfu_f, monge_budista, imperador_china, soldado_china, egipcio, farao, pastor, peregrino, vaqueiro, abuela, padre, policial, enfermeira, motorista, guarda_florestal, mochileiro | `o.figurino` = nome | roupa certa para cada época/canal |
| armas | lanca, espada, arco, bastao, foice, tocha, lanterna | `o.arma` | mão da figura |
| escudos | esparta (Λ), romano, viking, redondo | `o.escudo` | braço de trás |
| `multidao(x0,x1,base,s,n,o,t)` | grupo/fila/falange de figuras | `o.formacao` fila/falange/grupo, `o.figurino` | exército, feira, procissão |
| `cavalo` `boi` `burro` `porco` `ovelha` `cabra` `cachorro` `gato` `lobo` `cervo` `urso` `macaco` | animais de 4 patas / corpo | `(cx,base,s,o,t)`; `o.anda`, `o.olhar` -1/1, `o.cor` | cenas com bichos |
| `corvo` `coruja` `garca` | aves | idem | céu, floresta, lago |
| `peixe` `carpa_koi` `cobra` | aquáticos/serpente | `(cx,cy,s,o,t)` | água, mito |
| `COMP.f_figura` | vitrine: 1 figura OU 1 animal no fundo do canal | `p.figurino` **ou** `p.animal`, `p.arma`, `p.escudo`, `p.pose`, `p.x`, `p.s` | plano simples de um personagem |

### Pacote 03 (03-kit-objetos)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `obj_<nome>(cx,cy,s,o,t)` | desenha um objeto centrado em cx,cy | `o.cor`, `o.texto` (celular), `o.tamanho` (bastao), `o.anda` (veículos) | compor objetos dentro de cenas |
| luz | vela, lamparina, tocha, lanterna_papel, lampiao, lanterna_eletrica, fogueira | — | iluminação de cena |
| escrita | pergaminho, livro, carta, selo, rolo_chines, mapa, bilhete, foto, jornal | — | documento em close ou cena |
| comida/casa | pao, jarra, caldeirao, cesto, saco_grao, queijo, pessego, tigela_arroz, bule_cha, cabaca, ovo, moedas, chave, sino, tambor, ampulheta | — | mesa, cozinha, mercado |
| armas | espada, lanca, escudo_esparta, arco, elmo_corintio, bastao_ouro, katana, trabuco, estandarte | `bastao_ouro` cresce com `o.tamanho` | guerra, mito |
| fé/mistério | cruz, rosario, veladora, cempasuchil, caveira_acucar, incensario, amuleto, estatua_buda, leque, espelho | — | altar, templo, Dia de Muertos |
| moderno | celular, radio_com, chave_carro, mapa_papel, bussola | `celular` mostra `o.texto` na tela | terror, Signal Lost |
| veículos | carroca, carruagem, barco_remo, junco, drakkar, trirreme, galera, carro_velho, caminhonete, bicicleta, moto, ambulancia, viatura | `o.anda` gira a roda | estrada, mar |
| `COMP.f_objeto` | um objeto grande em close, fundo liso + luz, etiqueta opcional | `p.obj`, `p.rotulo`, `p.gira`, `p.brilho`, `p.s`, `p.cor`, `p.texto` | mostrar um objeto importante |

### Pacote 04 (04-kit-grafismos)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `COMP.f_mapa` | mapa de pergaminho com terra/rios/montanhas, rota tracejada, pinos | `p.regiao`, `p.rota` [[x,y]], `p.pontos` [{x,y,nome}] | mostrar onde fica / rota de viagem |
| `COMP.f_linha_tempo` | faixa de anos com marcos e marcador que anda | `p.de`, `p.ate`, `p.rotulo`, `p.marcos` [{ano,texto}] | datar eventos |
| `COMP.f_titulo_epoca` | cartela de abertura com moldura por paleta | `p.titulo`, `p.sub` | abrir um vídeo |
| `COMP.f_duelo` | tela dividida na diagonal, 2 figuras + símbolo | `p.esq`, `p.dir` (figura), `p.meio` ("VS") | confronto, comparação |
| `COMP.f_ficha` | ficha: busto + linhas com ícone entrando uma a uma | `p.pessoa`, `p.titulo`, `p.linhas` [{icone,texto}] (idade/peso/fome/frio/dinheiro/espada/hora/perigo) | apresentar personagem |
| `COMP.f_contagem` | número grande que conta de/até | `p.de`, `p.ate`, `p.rotulo` | "300 Spartans", "72 forms" |
| `COMP.f_comparar` | duas colunas then/now ou rule/reality | `p.esq` {titulo,itens}, `p.dir` {…} | contraste |
| `COMP.f_regras` | lista grande em papel com visto | `p.titulo`, `p.itens`, `p.marcados` | regras, tarefas do dia |
| `COMP.f_porta_tempo` | transição: o mundo dobra e revela luz | — | virar de época/cena |

### Pacote 05 (05-china-wukong)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `wukong(cx,base,s,o,t)` | Sun Wukong: macaco dourado, rosto coração, faixa e bastão | `o.pose` parado/pula/luta/senta_nuvem/ri/preso, `o.faixa`, `o.bastao`, `o.expressao`, `o.olhar` | protagonista da série |
| `zhuBajie` `shaWujing` `tangSanzang` `reiDragao` `imperadorJade` `soldadoCeleste` `budaGigante` | companheiros e figuras da jornada | `(cx,base,s,o,t)` | cenas da jornada |
| `dragaoChines(cx,cy,s,o,t)` | dragão longo serpenteando + pérola | `o.voa` | China, mito |
| `nuvemSalto(cx,cy,s,t)` | a nuvem voadora do Wukong | — | voo |
| `COMP.f_montanha_flores` | Montanha das Flores e Frutas, pedra mágica, macacos, cachoeira | `p.pedra`, `p.racha` 0..1, `p.macacos` N, `p.petalas` | abertura da série |
| `COMP.f_cachoeira` | Caverna da Cortina d'Água, trono, cortina na frente | `p.atravessa`, `p.trono` | o rei macaco |
| `COMP.f_palacio_dragao` | palácio do Rei Dragão no fundo do mar, pilar de ferro | `p.pilar` 0..1, `p.dragao` | o bastão mágico |
| `COMP.f_ceu_jade` | Céu de Jade, palácios dourados, portão, caos | `p.caos` 0..1, `p.portao` | rebelião no céu |
| `COMP.f_pomar_pessegos` | pomar dos pêssegos da imortalidade, guardas | `p.come`, `p.guardas` | roubo dos pêssegos |
| `COMP.f_palma_buda` | mão gigante de Buda, 5 dedos como pilares | `p.voa`, `p.fecha` 0..1 | aprisionamento |
| `COMP.f_montanha_preso` | montanha dos 5 elementos, Wukong preso, estações | `p.estacao`, `p.anos` N | 500 anos preso |
| `COMP.f_caminho_oeste` | estrada para o oeste, os 4 peregrinos, parallax | `p.terreno` montanha/deserto/floresta/rio | a jornada |
| `COMP.f_montanha_flamejante` | montanha em chamas, calor ondulando | `p.apaga` 0..1 | episódio do leque |

### Pacote 06 (06-china-historica)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `COMP.f_china_rua` | rua de Chang'an: muros, portões, lanternas, telhados curvos, mercadores | `p.noite`, `p.tambor` | cidade imperial, Rota da Seda |
| `COMP.f_palacio_china` | pátio imperial: escadaria, colunas vermelhas, telhado amarelo, leões | `p.trono`, `p.audiencia` | corte, imperador |
| `COMP.f_muralha_china` | Grande Muralha serpenteando, torres de sinal com fumaça | `p.sinal` N torres, `p.estacao` | fronteira, aviso de guerra |
| `COMP.f_templo_china` | pagode de 3 níveis na montanha, névoa, sino, monge | `p.sino`, `p.neve` | templo, retiro |
| `COMP.f_arrozal` | terraços de arroz espelhados, búfalo, camponês | `p.chuva` | campo, trabalho |
| `COMP.f_bambuzal` | floresta de bambu balançando, luz entrando | `p.vento`, `p.luta` (duelo) | floresta, luta |
| `COMP.f_lago_china` | Lago Oeste: pagode, ponte de arco, salgueiros, lua | `p.cobra` (cobra branca), `p.chuva` | lenda da Serpente Branca |
| `COMP.f_rio_china` | rio largo, junco à vela, montanhas karst, pescador | — | viagem de rio |
| `COMP.f_casa_china` | interior: biombo de papel, janela redonda, mesa de chá | — | casa antiga |

### Pacote 07 (07-grecia-esparta)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
| `COMP.f_esparta` | vila de Esparta SEM muralha, monte Taigeto, templos, oliveiras, rio | `p.ceu`, `p.treino` | abertura espartana |
| `COMP.f_agoge` | pátio de treino: meninos (corrida/luta/frio/fome) + instrutor | `p.atividade` corrida/luta/frio/fome | criação dos guerreiros |
| `COMP.f_syssitia` | refeitório; `caldo` = close da tigela de caldo negro | `p.caldo` | comida espartana |
| `COMP.f_falange` | hoplitas de lado, escudos Λ sobrepostos, lanças, flautista | `p.avanca` 0..1 | formação de batalha |
| `COMP.f_termopilas` | desfiladeiro: montanha, mar, muro, exército persa, flechas | `p.flechas` t(s), `p.atras` (traição) | a batalha |
| `COMP.f_templo_grego` | templo com colunas, frontão, estátua, oráculo com fumaça | `p.oraculo` | Delfos, religião |
| `COMP.f_agora` | praça de Atenas: estoa, filósofo, ânforas | — | democracia, filosofia |
| `COMP.f_mar_egeu` | mar azul, trirreme, ilhas, golfinhos | `p.tempestade` | viagem marítima |

### Pacote 08 (08-medieval)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 09 (09-hm-casa)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 10 (10-hm-lugares)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 11 (11-hm-criaturas)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 12 (12-sv-lugares)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 13 (13-sv-lugares2)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 14 (14-roma)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 15 (15-nordico)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 16 (16-egito)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 17 (17-japao)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 18 (18-mitos-gregos)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|

### Pacote 19 (19-china-mitos2)
| Peça/função | O que mostra | Parâmetros | Serve para |
|---|---|---|---|
