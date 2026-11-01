# Estilo visual "flat" (Hora Muerta e Old Tales) — guia para o Kiro e para o Claude

Pedido do Pedro (01/11/2026): os vídeos de terror (Hora Muerta) e do Old Tales devem ficar com gráficos como o
vídeo de referência (desenho animado plano e limpo) e contar a história do mesmo jeito. O visual antigo
(escuro, granulado, silhuetas pretas, vinheta pesada) está "feio". Tudo continua de custo zero: canvas 2D no
`hora-muerta/scripts/engine.html`, renderizado no GitHub Actions.

- Quadros da referência: `referencias/estilo-flat/referencia-quadros.jpg` (1 quadro a cada 2 s) e
  `referencia-detalhe.jpg`. Vídeo original: pasta do projeto `estilo-flat/referencia.mp4`.
- Exemplo já pronto no motor: `referencias/estilo-flat/exemplo-retrato.jpg`, gerado por
  `hora-muerta/testes/flat-exemplo.json` (fora de `stories/`, nunca é publicado).

## 1. Como a referência é feita (o que copiar)

**Visual**
- Ilustração vetorial plana: formas simples com cantos arredondados, cor chapada, quase sem contorno, no máximo
  UMA sombra suave por objeto. Nada de granulado, ruído, blur pesado ou vinheta preta.
- Paleta fixa: fundo azul-noite (`#1e2638` a `#33415f`), creme `#f4ead8` para texto, e poucos acentos fortes:
  laranja `#f08a3c`, amarelo `#ffd23f`, verde `#7ee081`, vermelho `#e2453c`. Já está no motor como `PAL`.
- Personagens com ROSTO: olhos brancos com pupila, sobrancelha que mostra emoção, boca, nariz em traço. É o que
  mais diferencia do visual antigo (silhuetas pretas). Corpo = busto em forma de sino; roupa com uma faixa de cor.
- Cada cena é UM lugar fácil de ler em meio segundo: cabine com janela e trilho, plataforma cheia de gente,
  rádio em close, foto na parede, prateleiras de comida, lista de portas. Objeto principal no centro, grande.
- Muito texto na tela que AJUDA a história (não é a legenda):
  - HUD fixo no canto de cima: `• DAY 1` (vermelho) / `2:58 AM` (grande) / `NIGHT TRAIN 742` (pequeno).
    O relógio avança quando a história avança (2:58 → 3:04 → 3:20). Dá urgência.
  - Plaquinha de nome: `JOELL, 45 / NIGHT TRAIN DRIVER`.
  - Mensagem que se digita sozinha (rádio, celular, carta), caixa vermelha.
  - Lista com caixinhas que vão sendo marcadas (`✓ Speed ✓ Fuel ✓ Doors`), suprimentos com barras.
  - Etiquetas curtas: `120 KM/H`, `TOO DANGEROUS`, `NEXT STATION 12 KM`.
  - Painéis com números que mexem (velocímetro, combustível 61 %).
- Movimento sempre: nada parado mais de ~1 s. Trem desliza, zumbis andam, ponteiro treme, lâmpada pisca,
  pessoa respira e pisca o olho, câmera faz zoom lento. Corte de plano a cada 1,5 a 3 s (a referência tem
  ~30 planos em 66 s).
- Legenda: 1 a 4 palavras por vez, letra grossa (Arial Black), caixa normal (não tudo maiúsculo), branca com
  contorno preto, e SÓ a palavra-chave em amarelo. Fica no meio-baixo da tela (no peito do personagem).
- Abertura e fecho em tela escura com o trem/objeto pequeno no horizonte e olhos vermelhos piscando no escuro
  (o perigo está em volta). Pergunta final grande: "WHAT DID HE FORGET?" com a última palavra em vermelho.

**Jeito de contar** (transcrição da referência, 66 s)

| s | Fala | Função |
|---|---|---|
| 0–8 | "If the apocalypse starts while you're driving a train, you might be the luckiest person alive. Nothing can catch you... unless you forget one thing." | Gancho: situação extrema + "você teria sorte" + "a menos que esqueça UMA coisa" (abre a pergunta que só fecha no fim) |
| 8–21 | "Meet Joell. He's 45. He drives the night train from the city to the coast. 200 passengers ride behind him. Every night is the same. Check the brakes, check the fuel, pour a coffee." | Personagem com nome, idade, profissão; rotina banal em frases de 3–6 palavras |
| 21–29 | "At 3:04, the radio crackled. 'All trains: mass infection in the city. Do not stop. Do not open the doors.'" | Incidente com HORA exata e ordem curta e clara |
| 29–39 | "His first thought was to go back for his daughter. But every station is packed... some are already infected." | Desejo pessoal x perigo (dilema) |
| 40–55 | "The train had one huge advantage: at 120 km/h nothing on foot can keep up. Fuel for 2,000 km, food for a week, full water tanks. He locked every door." | Lógica de sobrevivência com NÚMEROS concretos (o público adora "faz sentido") |
| 55–61 | "Speed, check. Fuel, check. Doors, check. Joell had thought of everything." | Checklist em ritmo de 3 + falsa segurança |
| 61–66 | "But Joell forgot one thing. What did he forget? Tell me in the comments." | Reviravolta em aberto + pergunta direta = comentários |

Regras que saem disso:
1. Primeira frase = "Se [situação extrema], você [vantagem surpreendente]... a não ser que [uma falha]".
2. Personagem com nome + idade + profissão na fala E na plaquinha, nos primeiros 10 s.
3. Frases curtas (3 a 10 palavras). Uma ideia por frase. Números concretos (horas, km, dias, pessoas).
4. Tempo marcado: hora do relógio a cada virada ("A las 3:04...").
5. Plano em lista que o público "confere" junto (3 itens, ritmo de três).
6. Fim da parte 1: "Ele pensou em tudo. Mas esqueceu uma coisa." + pergunta ao público + aviso da parte 2.
   A parte 2 responde a pergunta logo na primeira frase e fecha a história explicando a reviravolta.
7. Narrador em 3ª pessoa contando a história de alguém (Hora Muerta) ou 2ª pessoa "you" (Old Tales, que já é
   "You wake up in 1300"): mantém o formato do canal, só troca o ritmo e as ferramentas acima.

## 2. Como ligar o estilo num roteiro

No JSON do roteiro, acrescente `"visual": "flat"`. Isso, e só isso, muda: sem granulado, vinheta leve, flash
branco em vez de vermelho no `susto`, legenda nova (palavra-chave amarela), cartela `texto` plana, HUD e cartões
ligados. Roteiro sem `"visual"` continua exatamente como antes (Signal Lost e os episódios antigos não mudam).

Campos novos em cada cena (`"p"`), valem para QUALQUER peça quando `visual` é `flat`:

| Campo | Exemplo | O que faz |
|---|---|---|
| `hud` | `{"dia": "Noche 1", "hora": "3:04", "ampm": "AM", "lugar": "Ruta 9"}` | HUD do canto. Fica na tela nas cenas seguintes até outra cena trocar. `"hud": false` esconde. |
| `cartao` | `{"tipo": "nome", "titulo": "TOMÁS, 52", "sub": "chofer nocturno", "y": 0.17}` | Plaquinha de nome |
| | `{"tipo": "msg", "titulo": "Radio · canal 16", "texto": "No abras la puerta.", "y": 0.17}` | Mensagem que se digita sozinha |
| | `{"tipo": "lista", "titulo": "Plan de Tomás", "itens": ["Gasolina", "Puertas", "Radio"], "y": 0.17}` | Lista; os itens são marcados ao longo da cena (ou `"marcados": 2` fixo) |
| | `{"tipo": "rotulo", "titulo": "120 KM/H", "y": 0.2, "cor": "#ffd23f"}` | Etiqueta curta |
| `cartao2` | igual a `cartao` | Segundo cartão, entra um pouco depois |

Use `y` de 0.17 para baixo (acima disso é o HUD) e nunca abaixo de 0.55 (área da legenda e dos botões do Shorts).

**Cortar no meio da frase**: uma cena pode começar no meio de uma linha com `"en"` (fração 0..1) — ex.:
`{"linea": 3, "en": 0.5, "comp": "...", "p": {...}}`. Use para chegar ao ritmo de um plano a cada 1,5–3 s.
Melhor ainda: escreva linhas curtas (uma frase curta por linha).

**`destaque`**: lista de palavras que ficam amarelas na legenda (palavra por palavra). 1 por frase no máximo.

## 3. Kit de desenho que já está no motor (use nas peças novas)

Em `hora-muerta/scripts/engine.html`, bloco "ESTILO FLAT" (logo antes de `COMP.texto`):

- `PAL` — paleta (`PAL.noite`, `PAL.creme`, `PAL.amarelo`, `PAL.laranja`, `PAL.verde`, `PAL.vermelho`,
  `PAL.pele[0..4]` do mais claro ao mais escuro).
- `fundoFlat(cor1, cor2, [x, y, raio, corLuz])` — fundo em degradê suave com uma luz redonda.
- `caixa(x, y, w, h, fundo, borda, raio)` — retângulo arredondado.
- `pessoa(cx, cy, escala, {pele, cabelo, cabeloTipo: 'curto'|'longo'|'careca', roupa, faixa, gola,
  chapeu: 'bone'|'capuz'|'touca'|'elmo', corChapeu, barba, corBarba,
  expressao: 'neutro'|'medo'|'sorriso'|'surpresa'|'bravo', olhar: -1..1, t})` — busto com rosto. `cx, cy` =
  queixo. Respira e pisca sozinho (passe `t`).
- `hud(...)`, `cartao(...)` — já desenhados pelo motor a partir do `p` da cena; não chame dentro da peça.
- Já existentes e úteis: `glow`, `ease`, `lerp`, `rng(valor_ou_[de,ate], lt)`, `rnd(seed)`, `E.since/E.pulse`.

Peça-exemplo: `COMP.retrato` (close de um personagem). Copie a estrutura dela para as peças novas.

## 4. Regras para criar uma peça flat nova (Kiro)

1. `git pull origin producao`. Peça nova se chama `COMP.f_<nome>` (o `f_` marca que é flat) e vai no bloco
   ESTILO FLAT, antes de `COMP.texto`. Nunca altere uma peça que já existe.
2. Comentário acima da peça com todos os `p.` que ela aceita e um exemplo de cena.
3. Desenho: só `PAL`, formas arredondadas, cor chapada. Sem `grains`, sem `fog` preto, sem `vignette` própria,
   sem `x.filter = 'blur'`. Personagem sempre com `pessoa()` (ou figura de corpo inteiro no mesmo estilo:
   cabeça redonda cor de pele, olhos brancos, corpo em pílula com faixa de cor).
4. Movimento: pelo menos 2 coisas mexendo (fundo que desliza, luz que pisca, gente que anda, ponteiro).
   Use `t` para movimento contínuo e `lt` (0→1 na cena) para o que acontece uma vez.
5. Deixe livre a faixa do HUD (0 a 16 % da altura) e a da legenda (58 a 68 %). O objeto principal fica entre
   18 % e 56 %, ou embaixo de 68 % se for só cenário.
6. Faça um roteiro de teste em `hora-muerta/testes/` com `"visual": "flat"` (copie `flat-exemplo.json`) e gere
   a prévia (`.github/previa.txt` ou `python motor-en/previa.py`). OLHE os JPGs ao lado de
   `referencias/estilo-flat/referencia-quadros.jpg`: tem que parecer da mesma família.
7. Acrescente a peça na tabela do `MUNDOS.md` (com "flat" na descrição), rode `python motor-en/validar_roteiros.py`,
   commit e push na `producao`.

## 5. Peças flat a criar (lista de trabalho, na ordem)

Também está em `PLANO-MUNDOS.md` (itens 19 em diante). Cada peça serve a vários roteiros: pense em parâmetros.

**Hora Muerta (terror latino, espanhol)**
- `f_carretera` — estrada de noite vista de lado: veículo (`p.veiculo`: 'autobus'|'carro'|'camion'|'tren')
  deslizando, postes passando, lua, morros; `p.olhos` = pares de olhos vermelhos no escuro; `p.figura` = vulto
  flat na beira da estrada.
- `f_cabina` — vista de dentro do veículo: para-brisa com estrada em perspectiva, painel com velocímetro e
  combustível animados (`p.vel`, `p.comb`), costas do motorista; `p.espejo` mostra algo no retrovisor.
- `f_radio` — rádio/celular em close com luz piscando; usa o `cartao` tipo `msg` por cima.
- `f_pueblo` — rua de povoado latino de noite (casas coloridas apagadas, poste, cachorro, igreja ao fundo),
  `p.gente` (0..N pessoas flat), `p.janela_acesa`.
- `f_rio` — beira de rio com pedra, lua refletida, mulher de costas (Llorona/Siguanaba) com cabelo longo;
  `p.vira` 0..1 mostra o rosto (ainda flat: olhos vazios brancos, boca aberta — assusta sem sangue).
- `f_cuarto` — quarto com cama, porta, janela, espelho; `p.porta` aberta 0..1, `p.sombra` na porta,
  `p.espejo` com reflexo que não acompanha.
- `f_mapa` — mapa simples com rota pontilhada que avança (`p.de`, `p.ate`, `p.km`) — ótimo para "faltam 12 km".
- `f_foto` — foto polaroid presa na parede/painel com pessoa flat sorrindo (`p.legenda`: "mi hija ♥").
- `f_horizonte` — tela quase preta, objeto pequeno no horizonte, olhos vermelhos piscando (abertura e fecho).

**Old Tales (Idade Média, inglês, calmo, nada de susto)**
- `f_aldeia` — vila de 1300 vista de lado: casas de pau a pique com telhado de palha, fumaça, igreja, campo;
  `p.hora` 'aurora'|'dia'|'tarde'|'noite' muda o céu; camponeses flat andando.
- `f_casa` — interior: fogo no meio do chão, fumaça subindo pelo telhado, cama de palha, panela, animais.
- `f_mercado` — feira: barracas com toldo listrado, placas com desenho, porco andando, portão com pedágio.
- `f_castelo` — salão ou muralha: mesa longa, lareira, tapeçarias, senhor e servos flat.
- `f_campo` — colheita: trigo dourado balançando, foice, feixes, carroça.
- `f_mosteiro` — scriptorium: monges flat copiando à luz de vela, livro aberto com iluminura.
- Personagens Old Tales com `pessoa()`: `chapeu: 'capuz'` (camponês/monge), `'touca'` (mulher), `'elmo'`
  (soldado). Cartões em tom calmo: `rotulo` com fatos ("1 penny = 1 day of work"), `lista` com o dia
  ("☑ Bread ☑ Ale ☐ Candles").

Até as peças `f_` existirem, um roteiro flat pode misturar `retrato` + `texto` + peças antigas (as antigas
ficam mais claras no modo flat, mas continuam no estilo antigo). O ideal é que cada série nova use só peças `f_`.
