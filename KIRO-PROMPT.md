# KIRO-PROMPT — repertório grande de mundos e gráficos (estilo flat)

Pedido do Pedro (02/11/2026): "mande o prompt pra fazer os mundos e gráficos novos, além de outros futuros que a gente
pode ir reutilizando depois... não poupe itens novos, capriche bem para termos MUITO repertório."

**Para o Pedro:** abra a sessão do Kiro (a mesma "Kiro crew" que já usamos para os mundos), dentro da pasta do repositório
`canais-dark`, e cole o bloco da seção A. Só isso. Quando o Kiro parar, cole o bloco da seção B ("continue").
Se usar vários agentes ao mesmo tempo (crew), cada um pega um pacote diferente: os arquivos não se cruzam.

---

## A. PROMPT PARA COLAR NO KIRO (copie de "INÍCIO" até "FIM")

```
INÍCIO
Você vai criar um repertório GRANDE de cenários e elementos gráficos animados (estilo "flat") para 3 canais de
YouTube Shorts que renderizam com o motor canvas 2D do repositório canais-dark. Trabalhe sozinho até acabar ou
até o crédito acabar, sem me perguntar nada.

1. Prepare: `git checkout producao && git pull origin producao`. NUNCA use a branch main. Nunca escreva chave,
   token ou senha em arquivo nenhum.
2. Leia, nesta ordem: `KIRO-PROMPT.md` (seções C, D e E: regras, kit e TODOS os pacotes com o que cada peça mostra),
   `ESTILO-VISUAL.md` (seções 2, 5 e 6), e o código das peças-modelo no `hora-muerta/scripts/engine.html`
   (bloco "ESTILO FLAT": `COMP.retrato`, `COMP.f_pueblo`, `COMP.f_aldeia`, `COMP.f_onibus`).
3. Em `PLANO-MUNDOS.md`, tabela "Pacotes do Kiro", pegue o primeiro pacote PENDENTE (os pacotes 01, 02 e 03 vêm
   primeiro, porque os outros usam as funções deles). Mude para `FAZENDO (kiro, data)`, commit e push.
4. Escreva TODAS as peças do pacote no arquivo dele, `hora-muerta/scripts/pecas/NN-nome.js` (já existe, vazio, e já
   está ligado no engine.html). Não mexa no engine.html nem em peça que já existe.
5. Faça o roteiro de teste do pacote `hora-muerta/testes/pacote-NN.json` com UMA cena por peça (e uma por variação
   importante), gere a prévia com `python motor-en/previa.py hora-muerta/testes/pacote-NN.json previas/pacote-NN`
   e OLHE os JPGs. Conserte o que estiver feio, vazio, cortado, com borda preta, com coisa em cima da legenda ou
   parecido demais com outra peça. Até 3 voltas por peça. Critérios na seção C.
6. `python motor-en/validar_roteiros.py` tem que terminar com `ROTEIROS OK`.
7. Acrescente cada peça na seção do pacote no `MUNDOS.md` (nome, o que mostra, parâmetros `p.`, serve para).
   Mude o pacote para `FEITO (kiro, data)` no `PLANO-MUNDOS.md`. Commit ("kiro: pacote NN ...") e
   `git push origin producao`. Se o push recusar, `git pull --rebase origin producao` e envie de novo.
8. Volte ao passo 3 com o próximo pacote PENDENTE. Não pare entre pacotes.
9. No fim, me mande: pacotes feitos, peças criadas, o que ficou faltando e qualquer problema.
FIM
```

## B. PARA CONTINUAR (quando o Kiro parar no meio)

```
Continue o KIRO-PROMPT.md de onde parou: git pull origin producao, veja no PLANO-MUNDOS.md qual pacote está
FAZENDO ou é o próximo PENDENTE e siga os passos 3 a 9 da seção A. Não refaça o que já está FEITO.
```

Para consertar uma peça específica: "No pacote NN, a peça f_xxx está [problema]. Conserte só ela, gere a prévia de
novo, valide e envie."

---

## C. REGRAS (valem para toda peça) — o que torna a peça "aprovada"

1. **Onde:** cada pacote tem o seu arquivo `hora-muerta/scripts/pecas/NN-nome.js`. Os arquivos rodam depois do
   script principal do motor e podem usar tudo dele (`x`, `W`=1080, `H`=1920, `TF()`, `fonte()`, `pessoa()`,
   `corpoFlat()`, `camFlat()`, `fundoFlat()`, `caixa()`, `papel()`, `glow`, `ease`, `lerp`, `rng`, `rnd`, `E`).
2. **Nomes:** peça de cena = `COMP.f_<nome>` (minúsculas, sem acento). Função ajudante que outros pacotes vão usar
   = o nome EXATO da seção E (ex.: `fxChuva`, `figura`, `wukong`). Ajudante interno = prefixo do pacote
   (`p05_nuvem`) para não colidir. Nunca redefina uma função ou peça que já existe.
3. **Assinatura da peça:** `COMP.f_nome = (t, lt, p) => { ... }`. `t` = segundos desde o começo do vídeo (contínuo),
   `lt` = 0→1 dentro da cena, `p` = parâmetros vindos do roteiro (`"p": {...}` da cena). Todo `p.` tem valor padrão:
   a peça tem que ficar bonita com `p` vazio.
4. **Cores só de `TF()`** (fundo1, fundo2, creme, papel, tinta, destaque, acento, acento2, perigo, ok, luz), mais
   cores "de objeto" neutras (madeira, pedra, pele `PAL.pele[0..4]`). Assim a mesma peça serve às paletas:
   Hora Muerta (violeta), Signal Lost (`"paleta": "sv"`), Old Tales medieval, `grecia` e `china`.
5. **Estilo:** formas arredondadas, cor chapada, uma sombra suave, contorno só quando ajuda. SEM granulado, SEM
   `blur`, SEM vinheta própria, SEM foto/imagem externa, SEM fonte da internet. Gente com `pessoa()` (busto) ou
   `figura()`/`corpoFlat()` (corpo inteiro): cabeça oval cor de pele, olhos ovais escuros com brilho, bochecha corada.
6. **Movimento:** no mínimo 3 coisas mexendo (fogo, fumaça, água, folhas, gente andando, luz piscando, nuvem,
   bandeira, respiração). Nada de imagem parada: o canal exige vídeo animado.
7. **Câmera:** chame `camFlat(p, lt)` logo depois do `x.save()` do começo, e `x.restore()` no fim. Desenhe o cenário
   cobrindo a tela inteira (0..W, 0..H) e um pouco além, para o zoom nunca mostrar borda preta.
8. **Áreas livres:** HUD no canto superior (até 18 % da altura) e a faixa da legenda (58 % a 68 % da altura) sem
   nada importante. Assunto principal entre 18 % e 56 %. Chão/pé da cena de 68 % para baixo.
9. **Leve:** cada quadro tem que desenhar rápido (o vídeo tem ~1.500 quadros). Nada de laço com milhares de
   formas; pré-calcule posições aleatórias com `rnd(seed)` (nunca `Math.random()`: o vídeo tem que sair igual
   sempre).
10. **Comentário acima de cada peça:** o que mostra, todos os `p.` com valores aceitos, e um exemplo de cena:
    `// exemplo: {"linea": 3, "comp": "f_moinho", "p": {"roda": 1, "pessoa": {"x": 0.3}}}`
11. **Identidade própria:** inspiração no vídeo de referência só no nível de capricho. Proibido copiar: trem,
    maquinista, zumbi, HUD "DAY 1" vermelho com relógio digital, azul-marinho com faixa laranja (ESTILO-VISUAL.md §2).
12. **Fatos:** cenário histórico tem que bater com a época (nada de estribo em Esparta, nada de vidro em casa de
    camponês de 1300, nada de pagode em Esparta). Na dúvida, mais simples.
13. **Prova de erros:** `node --check hora-muerta/scripts/pecas/NN-nome.js` não pode dar erro (o fiscal faz isso);
    a prévia não pode ter tela preta nem peça faltando; se uma peça der erro no navegador, a cena fica vazia: olhe
    os JPGs SEMPRE.

## D. PALETAS DE ÉPOCA (Old Tales)

O Old Tales escolhe a cor pela `"paleta"` do roteiro. Já existem: nenhuma (medieval, verde), `grecia` (terracota),
`china` (jade e laca vermelha). Os pacotes 14 a 17 criam as outras, no começo do próprio arquivo, assim:
`PALS.cl_roma = { ...mesmas 13 chaves do PALS.cl_grecia... };` (copie de lá e troque só as cores).
O fiscal já aceita `roma`, `nordico`, `egito` e `japao`. Sugestões: roma = vermelho-tijolo e mármore com dourado;
nordico = azul-gelo e cinza-pedra com âmbar; egito = areia e lápis-lazúli com ouro; japao = índigo e papel washi com
vermelho-torii.

## E. OS PACOTES (o repertório)

Cada linha = uma peça ou função. Faça todas. Os parâmetros listados são o mínimo; acrescente mais se ajudar.
Quando um pacote fala em "pessoa(s)" no `p`, use o formato do `f_aldeia`:
`pessoas: [{x, anda, capuz, touca, saia, roupa, figurino, ...}]`.

### Pacote 01 — `01-kit-efeitos.js` (efeitos e céus, usados por todos)
Funções globais, cada uma desenha por cima do que já está na tela; `f` = força 0..1.
- `fxChuva(t, f, vento)` — riscos finos inclinados, respingos no chão.
- `fxNeve(t, f)` — flocos redondos caindo com balanço.
- `fxNevoa(t, f, y)` — faixas chapadas translúcidas que deslizam na altura `y` (0..1).
- `fxFumaca(cx, cy, t, f)` — coluna de bolinhas que sobem, crescem e somem (chaminé, incenso, fogueira).
- `fxFogo(cx, cy, s, t)` — fogueira/tocha flat: 3 camadas de chama (acento, destaque, creme) tremendo + brilho.
- `fxFagulhas(cx, cy, t, f)` — faíscas subindo (forja, fogueira).
- `fxFolhas(t, f, cor)` e `fxPetalas(t, f, cor)` — caindo e girando (outono; flor de pêssego; cempasúchil).
- `fxVagalumes(t, f)` — pontinhos que piscam e flutuam.
- `fxPoeira(t, f, y)` — poeira de estrada / batalha levantando do chão.
- `fxRelampago(t, quando)` — clarão rápido + raio em zigue-zague no céu (usa `E.pulse`).
- `fxOndas(y, t, cor1, cor2)` — mar/rio flat em 3 camadas ondulando.
- `fxRaiosLuz(cx, cy, t, f)` — feixes de luz (janela de igreja, céu divino, Buda).
- `fxBrilhoMagico(cx, cy, t, f)` — estrelinhas girando (magia, imortalidade, transformação).
- `fxPuff(cx, cy, t, t0)` — nuvem de fumaça redonda que estoura (transformação do Wukong, sumiço).
- `fxFlechas(t, t0, f)` — chuva de flechas cruzando o céu (Termópilas "lutaremos à sombra").
- `fxSangueNao` NÃO existe: o canal não mostra sangue. Ferido = cair, escurecer, expressão.
- `ceuFlat(tipo, t)` — céu inteiro: 'aurora' | 'dia' | 'tarde' | 'por' | 'noite' | 'tempestade' | 'eclipse' |
  'boreal' (aurora boreal) | 'dez_sois' (mito chinês) | 'estrelas'; sol/lua desenhados; nuvens flat passando.
- `luaFlat(cx, cy, r, fase, t)` — lua com fase 0..1 e halo.
- `estrelasFlat(t, n)` — estrelas piscando (posições fixas com `rnd`).
- Peça `COMP.f_ceu` — só o céu (`p.tipo`, `p.lua`, `p.chuva`, `p.neve`, `p.nevoa`, `p.relampago`), para planos
  de passagem de tempo e abertura.

### Pacote 02 — `02-kit-figuras.js` (personagens de corpo inteiro e animais)
- `figura(cx, base, s, o, t)` — pessoa de corpo inteiro no mesmo traço do `corpoFlat` (que continua igual), com
  `o.figurino`: 'campones' | 'camponesa' | 'monge' | 'freira' | 'cavaleiro' | 'escudeiro' | 'senhor' | 'dama' |
  'ferreiro' | 'mercador' | 'hoplita' (elmo coríntio com crista, escudo redondo com Λ, lança) | 'menino_esparta'
  (manto vermelho simples, descalço) | 'legionario' | 'viking' | 'samurai' | 'ashigaru' | 'hanfu' (China, homem e
  mulher) | 'monge_budista' (manto açafrão, chapéu) | 'imperador_china' | 'soldado_china' (armadura lamelar) |
  'egipcio' | 'farao' | 'pastor' | 'peregrino' (concha, cajado) | 'vaqueiro' (HM: chapéu, botas) | 'abuela' (HM:
  xale, saia) | 'padre' | 'policial' | 'enfermeira' | 'motorista' | 'guarda_florestal' | 'mochileiro' (SV).
  Também: `o.pose` 'parado' | 'anda' | 'corre' | 'aponta' | 'ajoelha' | 'luta' | 'reza' | 'carrega' | 'senta';
  `o.olhar` -1/1; `o.expressao` (mesmas do `pessoa`); `o.arma` 'lanca' | 'espada' | 'arco' | 'bastao' | 'foice' |
  'tocha' | 'lanterna'; `o.escudo` 'esparta' | 'romano' | 'viking' | 'redondo'; `o.pele`, `o.cabelo`, `o.roupa`.
- `multidao(x0, x1, base, s, n, o, t)` — fila/grupo de figuras com variação de altura e roupa (exército, feira,
  procissão); `o.figurino` e `o.formacao` 'fila' | 'falange' | 'grupo'.
- Animais flat (corpo + pose + piscar + mexer): `cavalo`, `boi`, `porco`, `ovelha`, `cabra`, `galinha` (já existe,
  não refaça), `cachorro`, `gato`, `corvo`, `coruja`, `lobo`, `cobra`, `macaco` (vários tamanhos, para a Montanha das
  Flores e Frutas), `garca`, `peixe`, `carpa_koi`, `cervo`, `urso`, `burro`. Assinatura `nome(cx, base, s, o, t)` com
  `o.anda`, `o.olhar`, `o.cor`.

### Pacote 03 — `03-kit-objetos.js` (objetos, armas, veículos)
Funções `obj_<nome>(cx, cy, s, o, t)` e a peça de close `COMP.f_objeto` (`p.obj` = nome, `p.rotulo` = texto numa
etiqueta de papel, `p.gira`, `p.brilho`; fundo liso da paleta com luz por trás) para mostrar uma coisa em close.
- Luz: `vela`, `lamparina`, `tocha`, `lanterna_papel` (China, vermelha), `lampiao`, `lanterna_eletrica`, `fogueira`.
- Escrita: `pergaminho_aberto` (com linhas), `livro_iluminado`, `carta_lacre`, `selo_china` (carimbo vermelho),
  `rolo_chines` (pintura pendurada), `mapa_velho`, `bilhete` (HM), `foto_antiga`, `jornal`.
- Comida e casa: `pao`, `jarra_cerveja`, `caldeirao`, `cesto`, `saco_grao`, `queijo`, `pessego` (imortalidade),
  `tigela_arroz`, `bule_cha`, `cabaca`, `ovo`, `moedas` (pilha), `chave_antiga`, `sino`, `tambor`, `ampulheta`.
- Armas e guerra: `espada`, `lanca`, `escudo_esparta`, `escudo_romano`, `escudo_viking`, `arco`, `elmo_corintio`,
  `bastao_ouro` (Ruyi Jingu Bang, que cresce: `o.tamanho`), `katana`, `trabuco` (catapulta de cerco), `estandarte`.
- Fé e mistério: `cruz`, `rosario`, `veladora` (vela de vidro com santo), `cempasuchil` (buquê), `caveira_acucar`,
  `incensario`, `amuleto`, `estatua_buda`, `leque_bananeira` (Montanha Flamejante), `espelho_mao`.
- Moderno (terror): `celular` (tela com `o.texto`), `radio_comunicador`, `chave_carro`, `mapa_papel`, `bussola`.
- Veículos (de lado, com roda girando / balanço na água, `o.anda`): `carroca`, `carruagem`, `barco_remo`, `junco`
  (barco chinês), `drakkar` (viking), `trirreme` (grego), `galera_romana`, `carro_velho`, `caminhonete`, `bicicleta`,
  `moto`, `ambulancia`, `viatura`.

### Pacote 04 — `04-kit-grafismos.js` (telas de explicação e transição)
Peças de cena para explicar e marcar tempo/lugar:
- `COMP.f_mapa` — mapa antigo de pergaminho com costa, rios e montanhas desenhados; `p.regiao` 'europa' | 'grecia' |
  'china' | 'mexico' | 'mediterraneo' | 'escandinavia' | 'egito' | 'japao' | 'mundo'; `p.rota` [[x,y]...] que se
  desenha com `lt`; `p.pontos` [{x, y, nome}] com alfinete que cai; `p.zoom`.
- `COMP.f_linha_tempo` — faixa com anos; marcador que anda de `p.de` até `p.ate`; rótulos `p.marcos` [{ano, texto}].
- `COMP.f_titulo_epoca` — cartela de abertura bonita: `p.titulo` ("Sparta, 480 BC"), `p.sub`, moldura da paleta
  (grega: grega/meandro; chinesa: nuvens e selo; medieval: iluminura; HM: papel picado; SV: tela de vidro).
- `COMP.f_duelo` — tela dividida na diagonal com dois personagens (`p.esq`, `p.dir` no formato do `pessoa`) e um
  "VS" ou um símbolo (`p.meio`), para confronto ou comparação.
- `COMP.f_ficha` — ficha de personagem: busto à esquerda, 3 a 5 linhas com ícones à direita (`p.linhas`
  [{icone, texto}]; ícones: idade, peso, fome, frio, dinheiro, espada, hora, perigo) que entram uma a uma.
- `COMP.f_contagem` — número grande que conta (`p.de`, `p.ate`, `p.rotulo`: "300 Spartans", "500 years", "72 forms").
- `COMP.f_comparar` — duas colunas "then / now" ou "rule / reality" com 3 itens cada (`p.esq`, `p.dir`).
- `COMP.f_regras` — lista de regras grande em papel/pergaminho/vidro conforme a paleta, item por item com visto
  (`p.itens`, `p.titulo`), para Hora Muerta e Signal Lost (regras) e Old Tales (tarefas do dia).
- `COMP.f_porta_tempo` — transição: o mundo atual dobra como página/pergaminho e revela outro (`p.de`, `p.para`
  nomes de peça simples) — opcional, se ficar leve.

### Pacote 05 — `05-china-wukong.js` (Jornada ao Oeste — favorito do Pedro; paleta `china`)
- `wukong(cx, base, s, o, t)` — Sun Wukong flat: macaco dourado, rosto em formato de coração cor de pêssego, faixa
  dourada na cabeça (`o.faixa`), túnica, `o.bastao` (bastão de ouro), `o.pose` 'parado' | 'pula' | 'luta' |
  'senta_nuvem' | 'ri' | 'preso' (só a cabeça para fora da montanha), `o.expressao`. Tem que ser simpático e
  carismático (é o protagonista de uma série longa).
- `zhuBajie(...)` (porco com ancinho), `shaWujing(...)` (monge do rio com colar de caveiras estilizadas), `tangSanzang
  (...)` (monge em cavalo branco), `reiDragao(...)`, `budaGigante(...)` (só silhueta luminosa e mão), `imperadorJade
  (...)`, `soldadoCeleste(...)` (armadura dourada).
- `dragaoChines(cx, cy, s, o, t)` — corpo longo serpenteando em onda, bigodes, pérola; `o.voa`.
- `nuvemSalto(cx, cy, s, t)` — a nuvem do Wukong (espiral fofa com rastro).
- `COMP.f_montanha_flores` — Montanha das Flores e Frutas: picos verdes, pessegueiros floridos, macacos pulando,
  cachoeira grande à direita; `p.pedra` (a pedra mágica que racha e brilha, `p.racha` 0..1), `p.macacos` N.
- `COMP.f_cachoeira` — Caverna da Cortina d'Água vista de dentro: cortina de água caindo na frente, trono de pedra,
  macacos comemorando; `p.atravessa` (Wukong pulando pela água), `p.trono`.
- `COMP.f_palacio_dragao` — palácio do Rei Dragão no fundo do mar: corais, peixes, bolhas, colunas, o pilar de ferro
  que encolhe (`p.pilar` 0..1 brilho/encolhe), `p.dragao`.
- `COMP.f_ceu_jade` — Céu de Jade: palácios dourados sobre nuvens, portão celestial, soldados celestes em fila;
  `p.caos` 0..1 (Wukong derrubando tudo), `p.portao` aberto.
- `COMP.f_pomar_pessegos` — pomar dos pêssegos da imortalidade: árvores enormes, pêssegos brilhando, `p.come`
  (Wukong comendo), `p.guardas` dormindo.
- `COMP.f_palma_buda` — a mão gigante de Buda vista de cima com 5 dedos como pilares nas nuvens; `p.voa` (Wukong
  voando até "o fim do mundo"), `p.fecha` 0..1 (a mão fecha e vira montanha).
- `COMP.f_montanha_preso` — montanha dos 5 elementos com Wukong preso até o pescoço, estações passando
  (`p.estacao` 'primavera'|'verao'|'outono'|'inverno' e `p.anos` contador), passarinho pousando na cabeça.
- `COMP.f_caminho_oeste` — estrada para o oeste: Tang Sanzang no cavalo, Wukong na frente, Bajie e Wujing atrás;
  montanhas passando em camadas (parallax); `p.terreno` 'montanha' | 'deserto' | 'floresta' | 'rio'.
- `COMP.f_montanha_flamejante` — montanha em chamas, calor ondulando, leque de bananeira; `p.apaga` 0..1.

### Pacote 06 — `06-china-historica.js` (China antiga real; paleta `china`)
- `COMP.f_china_rua` — rua de Chang'an (dinastia Tang): muros de quarteirão, portões, lanternas vermelhas, telhados
  curvos, camelos da Rota da Seda, mercadores; `p.noite` (toque de recolher: portões fechando), `p.tambor`.
- `COMP.f_palacio_china` — pátio de palácio imperial: escadaria, telhados amarelos, colunas vermelhas, leões de
  pedra, oficiais em fila; `p.trono` (interior com imperador), `p.audiencia`.
- `COMP.f_muralha_china` — Grande Muralha serpenteando nas montanhas, torre de sinal com fumaça (`p.sinal` 0..N
  torres acendendo em sequência), guarda olhando o horizonte, `p.estacao`.
- `COMP.f_templo_china` — templo/pagode na montanha com névoa, sino, incenso, monges; `p.sino`, `p.neve`.
- `COMP.f_arrozal` — terraços de arroz espelhados, camponeses curvados, búfalo, chapéu cônico; `p.chuva`.
- `COMP.f_bambuzal` — floresta de bambu balançando, luz entrando, caminho de pedra; `p.vento`, `p.luta`
  (dois guerreiros duelando entre bambus).
- `COMP.f_lago_china` — Lago Oeste: pagode na margem (Leifeng), ponte de arco, barco, salgueiros, lua; `p.cobra`
  (a cobra branca na água), `p.chuva`.
- `COMP.f_rio_china` — rio largo com junco a vela, montanhas karst (em agulha) ao fundo, pescador com cormorão.
- `COMP.f_casa_china` — interior de casa chinesa antiga: biombo de papel, mesa baixa, chá, lanterna, janela redonda.

### Pacote 07 — `07-grecia-esparta.js` (paleta `grecia`)
- `COMP.f_esparta` — Esparta: vila SEM muralha (fato) ao pé do monte Taigeto, templos simples, oliveiras, rio Eurotas;
  `p.ceu`, `p.pessoas`, `p.treino` (meninos correndo).
- `COMP.f_agoge` — pátio de treino da agogê: meninos descalços com manto simples, instrutor, poeira, corrida,
  luta; `p.atividade` 'corrida' | 'luta' | 'frio' (dormindo em junco que eles mesmos cortaram no rio) | 'fome'.
- `COMP.f_syssitia` — refeitório comunitário: mesa longa, caldo negro na tigela, pão de cevada, homens deitados de
  lado; `p.caldo` (close da tigela fumegando).
- `COMP.f_falange` — linha de hoplitas de lado com escudos sobrepostos e lanças, avançando (`p.avanca` 0..1),
  poeira, flautista marcando o passo (fato: espartanos marchavam ao som de aulos).
- `COMP.f_termopilas` — o desfiladeiro: mar à direita, montanha à esquerda, muro fócio de pedra, espartanos na
  passagem, exército persa enorme no horizonte; `p.flechas` (céu escuro de flechas), `p.atras` (caminho pela
  montanha, a traição de Efialtes).
- `COMP.f_templo_grego` — templo com colunas e frontão, estátua, oráculo com fumaça (Delfos), sacerdotisa; `p.oraculo`.
- `COMP.f_agora` — praça de Atenas: estoa, mercadores, filósofo falando a um grupo, ânforas.
- `COMP.f_mar_egeu` — mar azul com trirreme remando, ilhas, golfinhos; `p.tempestade`.

### Pacote 08 — `08-medieval.js` (Old Tales medieval; paleta padrão)
- `COMP.f_moinho` — moinho d'água com roda girando, calha, sacos, pedras de moer em corte (`p.corte`), moleiro.
- `COMP.f_mercado` — feira: barracas listradas, placas com desenho (bota, pão, chave), porco solto, pesos e
  balança, pelourinho (`p.pelourinho`), portão com pedágio (`p.pedagio`).
- `COMP.f_castelo` — castelo de fora (muralha, torre, ponte levadiça `p.ponte` 0..1, bandeiras) — o salão de dentro
  já existe como peça antiga; faça também `COMP.f_salao` flat (mesa alta, lareira, tapeçarias, senhor e servos).
- `COMP.f_campo` — colheita: trigo balançando, foice, feixes, carroça, respiga; `p.estacao`.
- `COMP.f_mosteiro` — scriptorium: monges copiando à luz de janela alta, tinteiros, livro com iluminura (`p.livro`
  close da página brilhando ouro).
- `COMP.f_forja` — forja flat: fornalha com fole, bigorna com faíscas, ferradura na água com vapor.
- `COMP.f_igreja` — igreja de pedra por dentro: vitral com raios de luz, velas, padre, bancos (ou sem bancos:
  nave vazia, fato de 1300), sino; `p.missa`.
- `COMP.f_estrada_antiga` — estrada de terra com peregrinos, cruz de pedra, hospedaria, carroça; `p.chuva`.
- `COMP.f_taverna` — taverna: barris, fogo, mesas, gente rindo, cantor com alaúde.
- `COMP.f_cerco` — muralha de castelo sob cerco: trabuco atirando pedra (`p.tiro`), escadas, arqueiros nas ameias.
- `COMP.f_porto` — porto medieval: coca (navio de um mastro), guindaste de roda, barris, gaivotas.
- `COMP.f_floresta_medieval` — floresta do senhor: veado, caçador, guarda; `p.neve`.
- `COMP.f_torneio` — justa: dois cavaleiros galopando com lança, arquibancada com bandeiras (`p.choque` 0..1).

### Pacote 09 — `09-hm-casa.js` (Hora Muerta; paleta padrão violeta; ESPANHOL nas placas)
- `COMP.f_cocina` — cozinha de avó: fogão a lenha, panela fumegando, altar de parede com fotos e velas, porta do
  quintal (`p.porta` 0..1), janela com noite; `p.abuela`, `p.olla`.
- `COMP.f_cuarto` — quarto: cama com colcha, janela, espelho (`p.espejo` com reflexo ATRASADO), porta entreaberta com
  sombra (`p.sombra`), luz de abajur que pisca.
- `COMP.f_altar` — altar de Día de Muertos: degraus, fotos (`p.foto` que muda), cempasúchil, velas, pão de morto,
  caveiras de açúcar, papel picado; `p.vela_apaga`.
- `COMP.f_telefono` — close de telefone: `p.tipo` 'disco' (preto, tocando, tremendo) | 'celular' (tela com
  `p.quien` e `p.texto`), mão que hesita.
- `COMP.f_bano` — banheiro velho: azulejo, espelho embaçado com letra escrita no vapor (`p.escrito`), torneira
  pingando.
- `COMP.f_azotea` — laje à noite: tanque de água, varal com lençol balançando, antenas, lua, vulto em outra laje.
- `COMP.f_vecindad` — pátio de cortiço: portas numeradas, varais, escada de ferro, uma porta com luz (`p.puerta`).
- `COMP.f_sala` — sala de casa: sofá, TV de tubo com chuvisco (`p.tele`), cortina, porta da rua (`p.toca`).

### Pacote 10 — `10-hm-lugares.js` (Hora Muerta, lugares de lenda)
- `COMP.f_rio` — beira de rio com pedra e lua refletida, mulher de costas com cabelo longo (`p.vira` 0..1, rosto
  sem sangue), névoa baixa.
- `COMP.f_carretera` — estrada de terra de lado com veículo (`p.veiculo` 'autobus' | 'camioneta' | 'bicicleta'
  | 'a_pie'), postes, morros, olhos no mato (`p.ojos`).
- `COMP.f_hacienda` — fazenda abandonada: portão de ferro, pátio com fonte seca, arcos, janela acesa no alto.
- `COMP.f_iglesia` — igreja de povoado à noite por dentro: santos, velas, confessionário (`p.confesion`).
- `COMP.f_escuela` — sala de aula à noite: carteiras, quadro com giz escrevendo sozinho (`p.escrito`).
- `COMP.f_milpa` — milharal à noite com espantalho (`p.mueve`), lua, trilha.
- `COMP.f_selva` — mata fechada com cipós, rio, sons; `p.patasola` (vulto de uma perna só entre árvores).
- `COMP.f_puente` — ponte de pedra sobre barranco, névoa, figura no meio (`p.figura`).
- `COMP.f_pozo` — poço de pedra no quintal com balde, eco, mão saindo (`p.mano` 0..1).
- `COMP.f_feria` — parque de diversões abandonado: roda-gigante parada, carrossel que gira sozinho (`p.gira`).
- `COMP.f_cerro` — morro com cruz no topo, caminho de procissão com velas.
- `COMP.f_estacion` — estação de trem de povoado vazia (SEM trem chegando — proibido trem como na referência), relógio.
- `COMP.f_panaderia` — padaria de madrugada, forno aceso, pão, padeiro sozinho.

### Pacote 11 — `11-hm-criaturas.js` (aparições das lendas latinas)
Funções `nome(cx, base, s, o, t)` com `o.dist` 0..1 (longe/perto), `o.vira`, `o.olhos`; e a peça
`COMP.f_aparicion` (`p.quien` = nome da criatura, `p.lugar` = nome de peça de fundo simples, `p.dist` [a, b]).
Assustador, mas no estilo flat (silhueta, olhos, forma), nunca gore:
`llorona` (vestido branco, cabelo cobrindo o rosto), `charro_negro` (a cavalo, chapéu largo, olhos de brasa),
`cadejo` (cão preto de olhos vermelhos), `lechuza_bruja` (coruja com rosto), `duende` (pequeno, chapéu),
`nahual` (meio homem meio coiote), `sombreron` (chapéu enorme), `siguanaba` (flat), `tunda`, `patasola`,
`mano_peluda` (mão saindo de baixo da cama), `nina_muneca` (boneca que vira o rosto), `monja` (freira sem rosto).

### Pacote 12 — `12-sv-lugares.js` (Signal Lost; `"paleta": "sv"`, placas em inglês)
- `COMP.f_floresta` — trilha no mato à noite com lanterna, árvores altas, torre de guarda (`p.torre`), olhos.
- `COMP.f_corredor` — corredor de hospital/prédio: portas, luz fluorescente piscando (`p.pisca`), placa EXIT,
  maca, vulto no fim (`p.vulto` 0..1).
- `COMP.f_elevador` — elevador flat: painel de botões com andar que muda sozinho (`p.andar`), porta abrindo.
- `COMP.f_motel` — motel de estrada: letreiro neon que falha, portas numeradas, máquina de gelo, carro estacionado.
- `COMP.f_garagem` — estacionamento subterrâneo: pilares numerados, luz piscando, carro com alarme (`p.alarme`).
- `COMP.f_mercado_noite` — supermercado 24 h vazio: corredores, freezer, alto-falante, carrinho andando sozinho.
- `COMP.f_cabana` — cabana na neve: janela acesa, lareira, pegadas que chegam à porta (`p.pegadas`).
- `COMP.f_farol` — farol na costa à noite: feixe girando, ondas, barco ao longe (`p.barco`).
- `COMP.f_estrada_nevoa` — estrada reta com névoa, faróis, placa de milha, figura no acostamento.
- `COMP.f_lago_gelado` — lago congelado com rachaduras (`p.racha` 0..1), algo embaixo do gelo.

### Pacote 13 — `13-sv-lugares2.js` (Signal Lost, mais lugares)
- `COMP.f_bunker` — porta blindada, painel de rádio, camas, contador de dias na parede.
- `COMP.f_shopping` — shopping abandonado: escada rolante parada, fonte seca, vitrine com manequim (`p.vira`).
- `COMP.f_radio` — estação de rádio: painel, microfone, onda na tela (`p.voz` mexe a onda), janela com antena.
- `COMP.f_aviao` — cabine de avião à noite: assentos, janela com asa, luz de "cinto", comissária, alguém na asa.
- `COMP.f_navio` — convés de navio na tempestade, ondas, contêineres, luz.
- `COMP.f_deserto` — estrada no deserto, posto ao longe, cacto, céu estrelado, luz no céu (`p.luz`).
- `COMP.f_estacao_polar` — base de pesquisa na neve: módulos, antena, cachorros, aurora, porta batendo.
- `COMP.f_escritorio` — escritório vazio à noite: baias, monitores ligados, impressora imprimindo sozinha.
- `COMP.f_suburbio` — rua de subúrbio americano: casas iguais, gramados, poste, uma casa diferente (`p.casa`).
- `COMP.f_ilha` — praia de ilha pequena à noite: fogueira, mar, vulto na água (`p.vulto`), destroços.

### Pacote 14 — `14-roma.js` (cria `PALS.cl_roma`)
`f_roma_rua` (ínsulas, lojas, fontanário, carroça proibida de dia), `f_coliseu` (arena com gladiadores e
público), `f_acampamento_romano` (paliçada, tendas em grade, legionários cavando), `f_termas` (piscinas, vapor,
mosaico), `f_forum` (templos, rostra, orador), `f_estrada_romana` (marcos de milha, legião marchando), `f_domus`
(casa rica com átrio e implúvio). Figurino `legionario` vem do pacote 02.

### Pacote 15 — `15-nordico.js` (cria `PALS.cl_nordico`)
`f_fiorde` (montanhas, água, drakkar chegando), `f_salao_viking` (casa longa, fogo central, escudos na parede,
banquete), `f_aldeia_viking` (casas de turfa, ovelhas, neve), `f_ataque` (praia com drakkars, mosteiro ao fundo:
Lindisfarne 793), `f_yggdrasil` (árvore do mundo com 9 mundos, mito), `f_bifrost` (ponte arco-íris), `f_mar_norte`
(tempestade, serpente Jörmungandr `p.serpente`). Personagens mitológicos: `thor` (martelo), `odin` (um olho,
corvos), `loki`.

### Pacote 16 — `16-egito.js` (cria `PALS.cl_egito`)
`f_nilo` (rio com papiro, felucas, crocodilo, cheia `p.cheia`), `f_piramide` (canteiro de obra: rampa, blocos,
trabalhadores puxando trenó com água no chão — fato), `f_vila_operarios` (Deir el-Medina, pão e cerveja como
salário), `f_tumba` (corredor com hieróglifos, sarcófago, tocha), `f_templo_egito` (colunas papiriformes,
estátuas), `f_julgamento` (pesagem do coração: balança, pena, Anúbis, Ammit `p.pesa` 0..1, mito).
Personagens: `anubis`, `osiris`, `rá` (barca solar).

### Pacote 17 — `17-japao.js` (cria `PALS.cl_japao`)
`f_castelo_japao` (castelo de telhados em camadas, cerejeiras), `f_vila_japao` (casas de madeira, arrozal,
ponte), `f_torii` (portão vermelho na água, Itsukushima), `f_dojo` (samurai treinando), `f_mar_japao` (onda grande
estilizada SEM copiar Hokusai, barco de pesca), `f_palacio_dragao_mar` (Urashima Taro, tartaruga). Personagens:
`momotaro`, `oni` (ogro, sem gore), `kitsune`, `tanuki`.

### Pacote 18 — `18-mitos-gregos.js` (paleta `grecia`)
`f_olimpo` (palácio nas nuvens, tronos, Zeus com raio), `f_labirinto` (corredores vistos de cima, fio de Ariadne
que se desenha `p.fio`, Minotauro `p.minotauro`), `f_mar_ciclope` (ilha, caverna, ovelhas, ciclope gigante,
barco fugindo), `f_sereias` (rochedo, sereias-pássaro como na arte grega antiga, Ulisses amarrado ao mastro),
`f_submundo` (rio Estige, Caronte no barco, Cérbero de 3 cabeças, almas pálidas), `f_icaro` (céu com sol forte,
asas de cera derretendo `p.derrete` 0..1, mar), `f_troia` (muralha e cavalo de madeira `p.cavalo`). Personagens:
`zeus`, `hades`, `medusa` (cobras no cabelo, olhar), `minotauro`, `ciclope`.

### Pacote 19 — `19-china-mitos2.js` (paleta `china`)
`f_dez_sois` (céu com 10 sóis-pássaro e terra rachando; Houyi com arco `p.flechas` derruba um a um),
`f_palacio_lua` (palácio frio na lua, Chang'e, coelho de jade socando o pilão, árvore de osmanthus),
`f_nuwa` (céu rachado com buraco, Nüwa serpente-mulher derretendo pedras de 5 cores `p.conserta` 0..1, pessoas de
barro ganhando vida), `f_pangu` (ovo cósmico rachando, Pangu empurrando céu e terra), `f_ponte_pegas` (Via Láctea,
pegas formando ponte, Vaqueiro e Tecelã se encontrando `p.encontro`), `f_nezha` (Nezha nas rodas de fogo com faixa
vermelha e anel, mar revolto, dragão), `f_mulan` (Mulan diante do espelho, depois montada com o exército no norte
gelado; `p.cena` 'casa' | 'exercito'). Personagens: `houyi`, `change`, `nuwa`, `nezha`, `mulan`, `coelhoJade`.

---

## F. O que fazer quando acabar tudo (ideias para depois)
- Variações de estação (neve, chuva) nas peças mais usadas.
- Mais figurinos e rostos para as séries não repetirem os mesmos personagens.
- Peças pedidas pelos roteiros: a rotina semanal de roteiros anota em `PLANO-MUNDOS.md` quando faltou um lugar.
