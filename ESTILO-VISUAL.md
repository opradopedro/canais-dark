# Estilo visual "flat" (Hora Muerta e Old Tales) — guia para o Kiro e para o Claude

Pedido do Pedro (01/11/2026): os vídeos de terror (Hora Muerta e Signal Lost) e do Old Tales devem ficar bonitos como um vídeo de
referência que ele mandou (desenho animado plano e limpo) e contar a história de um jeito parecido.
**Correção do Pedro no mesmo dia: "só se inspire, não faça exatamente igual".** A referência é INSPIRAÇÃO de
qualidade e ritmo. Cada canal tem a SUA identidade (seção 2). Não copie cores, relógio, cartões, frases nem o
enredo da referência.

Tudo continua de custo zero: canvas 2D no `hora-muerta/scripts/engine.html`, renderizado no GitHub Actions.
- Quadros da referência (só para entender o nível de qualidade): `referencias/estilo-flat/referencia-quadros.jpg`.
- Como os NOSSOS canais ficam: `referencias/estilo-flat/exemplos-hm-e-cl.jpg` (em cima Hora Muerta, embaixo Old
  Tales), gerados por `hora-muerta/testes/flat-exemplo.json` e `flat-exemplo-cl.json` (fora de `stories/`, nunca
  são publicados).

## 1. O que aprender da referência (princípios, não aparência)

1. **Desenho plano e legível**: formas simples, cor chapada, cena entendida em meio segundo, nada de granulado,
   ruído ou escuridão que esconde tudo. (O visual antigo era escuro e borrado: é isso que o Pedro achou feio.)
2. **Personagem com rosto e emoção**, não silhueta preta. O público se apega a uma pessoa.
3. **Informação na tela que ajuda a história**: hora, lugar, nome, listas, mensagens. Dá contexto sem falar mais.
4. **Ritmo**: um plano novo a cada 1,5–3 s e alguma coisa sempre se mexendo.
5. **Narrativa**: personagem concreto com nome e idade, tempo marcado, números concretos, um plano/lista que o
   público acompanha, falsa segurança, pergunta aberta no fim que puxa comentário.

## 2. Identidade de cada canal (o que é NOSSO)

O motor escolhe pelo roteiro: Old Tales tem `"tema"` = `"calmo"`, `"epico"` ou `"mito"`; Signal Lost tem `"paleta": "sv"`; o resto é Hora Muerta.

**Old Tales por época (02/11):** o canal agora vai além de 1300 (dia a dia, soldados, mitos). `"paleta"` escolhe a cor:
sem paleta = "Pergaminho" medieval (abaixo); `"grecia"` = terracota `#7a3b22` → `#2a130b`, destaque laranja de vaso
`#f0a43a`, preto `#1d1310`; `"china"` = jade-noite `#24434a` → `#0e1b1e`, destaque dourado `#f4c542`, laca vermelha
`#c8372d`, jade `#3fa88b`. Mesma faixa de pergaminho, mesmas fontes serifadas: muda a cor e os cenários.

**Signal Lost — "Sinal"**: fundo azul-petróleo `#12303a` → `#04090c`, destaque ciano `#4fe3ff`, luz de sódio `#ffd166`,
vermelho `#ff4d5e`; HUD no canto ESQUERDO com barras de sinal do celular ("NO SIGNAL" piscando quando `sinal` = 0),
hora grande e lugar; cartões de vidro escuro com faixa ciano e letra de terminal (Courier); narração em 1ª pessoa.

| | Hora Muerta — "Veladora" | Old Tales — "Pergaminho" |
|---|---|---|
| Fundo | violeta-noite `#2a1f3d` → `#140f22` | verde-floresta `#3c5238` → `#1b2519` |
| Destaque da legenda | laranja cempasúchil `#ff8a2a` | dourado `#f2c66d` |
| Acentos | luz de vela `#f6b24a`, verde-espectro `#7fe0c4`, vermelho `#d6354a` | ocre `#e3b75f`, vinho `#8c2f39`, verde-musgo `#5c7d3a` |
| Relógio (HUD) | relógio de ponteiro redondo no canto DIREITO, hora e "Noche 1 · lugar" embaixo | faixa de pergaminho no canto ESQUERDO com sol/lua: "Day 1 · Dawn · Year 1300" |
| Cartões | bilhete de papel creme, torto, preso com fita, letra itálica serifada; título em vermelho | pergaminho reto com pontas enroladas, letra serifada |
| Lista | "reglas" numeradas com visto vermelho à mão | lista do dia com visto verde |
| Luz que mexe | vela acesa, lua na janela, cortina balançando | fogo baixo, janela em arco com campo |
| Pessoas | olhos ovais escuros com brilho, bochecha corada, sombra comprida | igual, com capuz, touca, chapéu, elmo |
| Fecho | "¿Quién la escribió?" com a palavra-chave em laranja | "What did he take?" calmo, palavra em dourado |

**Proibido (fica cópia):** HUD com "DAY 1" vermelho + relógio digital grande à esquerda; caixas escuras de borda fina;
legenda branca com amarelo; azul-marinho com faixa laranja no uniforme; trem/maquinista/zumbi; as frases
"luckiest person alive", "forgot one thing", "Tell me in the comments" como fórmula fixa.

## 3. Jeito de contar (nosso, inspirado)

Estrutura de uma parte (40–58 s no Hora Muerta; tempo do canal no Old Tales):

| Momento | O que faz | Hora Muerta (exemplo) | Old Tales (exemplo) |
|---|---|---|---|
| 0–5 s Gancho | uma situação estranha e concreta, sem enrolar | "Doña Marta cuida el panteón desde hace treinta años. Y nunca ha roto sus tres reglas." | "You wake up in 1300, as the miller's new apprentice." |
| 5–15 s Quem | nome, idade, ofício (fala + cartão `nome`) | "Doña Marta, 67" | "Walter, 52, the village miller" |
| 15–30 s Como funciona | rotina/regras/plano em lista de 3 (cartão `lista`) | as 3 reglas | "carry the grain, check the wheel, keep the stones apart" |
| 30–45 s Virada | hora exata no relógio + algo quebra o normal (cartão `msg` ou `rotulo`) | "A las 3:10, una nota en la reja. Era su propia letra." | "By noon, a farmer is shouting at the door." |
| Fim | pergunta aberta + aviso da parte 2 | "¿Quién la escribió? Parte dos, {dia_siguiente}." | "What did Walter take from his sack? Part two, {when_next}." |

Rodízio de ganchos (não repita o mesmo tipo duas séries seguidas):
1. **Regra quebrada** — "X tiene tres reglas. Esta noche rompió una."
2. **Objeto fora do lugar** — "En la reja había una nota. Con su letra."
3. **Número estranho** — "El autobús lleva 14 pasajeros. Él contó 15."
4. **Ofício curioso** — "Su trabajo es apagar las velas del pueblo a las 3."
5. **Você no lugar** (Old Tales) — "You wake up in 1300 as a ___. Here's your first day."
6. **Pergunta direta** — "¿Qué harías si tu abuela te llamara... diez años después?"

Regras: frases de 3 a 10 palavras, uma ideia por frase, números e horas concretos, o relógio do HUD avança com a
história, 1 palavra de destaque por frase. Parte 2 responde a pergunta da parte 1 na primeira frase e explica a
reviravolta. Hora Muerta em 3ª pessoa (ou "yo" testemunha); Old Tales continua em 2ª pessoa ("you").
Old Tales nunca assusta: a pergunta final é de curiosidade.

## 4. Como ligar o estilo num roteiro

No JSON do roteiro: `"visual": "flat"`. Isso muda: sem granulado, vinheta leve, flash branco no `susto`, legenda
com destaque da cor do canal, cartela `texto` do canal, HUD e cartões. Sem `"visual"` nada muda (Signal Lost e
episódios antigos ficam iguais).

Campos novos em cada cena (`"p"`), valem para QUALQUER peça quando `visual` é `flat`:

| Campo | Exemplo | O que faz |
|---|---|---|
| `hud` | HM: `{"dia": "Noche 1", "hora": "3:10", "ampm": "AM", "lugar": "Panteón"}` · CL: `{"dia": "Day 1", "hora": "Dawn", "lugar": "Year 1300", "ceu": "aurora"}` | Relógio/faixa. Fica nas cenas seguintes até outra cena trocar. `"hud": false` esconde. CL `ceu`: aurora, dia, tarde, noite. |
| `cartao` | `{"tipo": "nome", "titulo": "Doña Marta, 67", "sub": "cuida el panteón", "y": 0.2}` | Etiqueta de nome |
| | `{"tipo": "msg", "titulo": "NOTA EN LA REJA", "texto": "...", "y": 0.2}` | Bilhete que se escreve sozinho |
| | `{"tipo": "lista", "titulo": "LAS REGLAS DE MARTA", "itens": ["...", "...", "..."], "y": 0.2}` | Lista numerada; os itens são marcados ao longo da cena (ou `"marcados": 2`) |
| | `{"tipo": "rotulo", "titulo": "su propia letra", "y": 0.22}` | Etiqueta curta |
| `cartao2` | igual | Segundo cartão, entra um pouco depois |

Posição `y`: Hora Muerta de 0.2 para baixo (o relógio ocupa o canto direito até 0.18); Old Tales de 0.12 para baixo.
Nunca abaixo de 0.55 (legenda e botões do Shorts). Corte no meio de uma linha: `{"linea": 3, "en": 0.5, ...}`.

## 5. Kit de desenho no motor (use nas peças novas)

`hora-muerta/scripts/engine.html`, bloco "ESTILO FLAT" (antes de `COMP.texto`):
- `TF()` — paleta do canal atual (`TF().fundo1`, `fundo2`, `creme`, `papel`, `tinta`, `destaque`, `acento`,
  `acento2`, `perigo`, `ok`, `luz`). **Use sempre `TF()`**, nunca cor fixa, para a peça servir aos dois canais.
- `fonte('fonteTit'|'fonteTxt', tamanho)` — fonte do canal. `PAL.pele[0..4]` — tons de pele.
- `fundoFlat(c1, c2, [x, y, raio, cor])`, `caixa(...)`, `papel(x, y, w, h, giro)` (bilhete ou pergaminho do canal).
- `pessoa(cx, cy, escala, {pele, cabelo, cabeloTipo: 'curto'|'longo'|'coque'|'careca', roupa, detalhe, chapeu:
  'chapeu'|'capuz'|'touca'|'elmo', corChapeu, barba, bigode, corBarba, oculos, expressao: 'neutro'|'medo'|'sorriso'|
  'surpresa'|'bravo'|'triste', olhar: -1..1, t})` — busto com rosto; `cx, cy` = queixo; respira e pisca sozinho.
- Já existentes: `glow`, `ease`, `lerp`, `rng(valor_ou_[de,ate], lt)`, `rnd(seed)`, `E.since/E.pulse`.
- Peça-exemplo: `COMP.retrato` (close de personagem, fundo do canal com janela e vela/fogo).
- Cenários prontos: `f_panteon`, `f_pueblo` (copie a estrutura deles). Ajudantes: `corpoFlat` (pessoa de corpo inteiro que
  anda e carrega lanterna), `velaFlat`, `cempa` (flor), `camFlat(p, lt)` (câmera: `p.foco` [x, y] + `p.escala`, já travada
  para nunca mostrar borda preta). Chame `camFlat` logo no começo da peça, dentro de `x.save()`/`x.restore()`.

## 6. Regras para criar uma peça flat nova (Kiro)

1. `git pull origin producao`. Nome `COMP.f_<nome>`. Desde 02/11 a peça nova vai no arquivo do pacote em
   `hora-muerta/scripts/pecas/NN-nome.js` (ver `KIRO-PROMPT.md`), não mais dentro do `engine.html`. Nunca altere peça
   que já existe.
2. Comentário acima da peça: todos os `p.` aceitos e um exemplo de cena.
3. Cores só de `TF()`; formas arredondadas; cor chapada; uma sombra suave. Sem `grains`, `fog` preto, `vignette`
   própria ou `blur`. Gente sempre com `pessoa()` (ou corpo inteiro no mesmo estilo: cabeça oval cor de pele, olhos
   ovais escuros com brilho, corpo em gota).
4. Pelo menos 2 coisas mexendo (`t` = contínuo, `lt` = 0→1 na cena).
5. Livre: canto do HUD (Hora Muerta: direita até 18 % da altura; Old Tales: esquerda até 11 %) e a faixa da
   legenda (58–68 %). Assunto principal entre 18 % e 56 %.
6. Teste em `hora-muerta/testes/` (copie `flat-exemplo.json` ou `flat-exemplo-cl.json`), prévia
   (`.github/previa.txt` ou `python motor-en/previa.py`), compare com `exemplos-hm-e-cl.jpg`. Tem que parecer da
   mesma família dos exemplos, e NÃO da referência.
7. Linha na tabela do `MUNDOS.md`, `python motor-en/validar_roteiros.py` = `ROTEIROS OK`, commit e push na `producao`.

## 7. Peças flat a criar — LISTA COMPLETA AGORA NO `KIRO-PROMPT.md` (19 pacotes, 02/11). Abaixo, a lista antiga (já incluída lá)

**Hora Muerta (lendas e regras latinas, espanhol)**
- ~~`f_panteon`~~ e ~~`f_pueblo`~~ — FEITAS (01/11). Modelo de série completa: `hora-muerta/stories/021-reglas-panteon-1.json` e `022-...-2.json`.
- `f_carretera` — estrada de terra de lado com veículo (`p.veiculo`: 'autobus'|'camioneta'|'bicicleta'), postes, morros, olhos no mato.
- `f_cocina` — cozinha de avó: fogão a lenha, panela, altar com fotos e velas, porta do quintal (`p.porta`).
- `f_rio` — beira de rio com pedra e lua refletida, mulher de costas com cabelo longo; `p.vira` 0..1 (rosto sem sangue).
- `f_cuarto` — quarto: cama, janela, espelho (`p.espejo` com reflexo atrasado), porta com sombra.
- `f_telefono` — telefone de disco ou celular em close tocando; nome na tela (`p.quien`).
- `f_altar` — altar de Día de Muertos com fotos, cempasúchil e velas; `p.foto` que muda.

**Old Tales (1300, inglês) — mais épocas e mitos no `KIRO-PROMPT.md`**
- `f_aldeia` — vila de lado: casas de palha, fumaça, igreja, campo; `p.ceu` muda o céu; camponeses andando.
- `f_casa` — interior: fogo no chão, fumaça pelo telhado, cama de palha, panela, galinhas.
- `f_moinho` — moinho d'água com roda girando, sacos de grão, pedras de moer em corte.
- `f_mercado` — feira: barracas listradas, placas com desenho, porco, portão com pedágio.
- `f_castelo` — salão: mesa longa, lareira, tapeçarias, senhor e servos.
- `f_campo` — colheita: trigo balançando, foice, feixes, carroça.
- `f_mosteiro` — scriptorium: monges copiando à luz de vela, livro com iluminura.

Até as peças `f_` existirem, um roteiro flat pode usar `retrato` + `texto`. O ideal é cada série nova usar só peças flat.
