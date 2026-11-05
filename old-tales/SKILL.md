---
name: canal-classics
description: Produz e agenda no YouTube os Shorts do canal Old Tales (ingles) — historias e contos antigos (dia a dia medieval, um dia de soldado de Esparta, outras epocas) e mitologias (com destaque para a China antiga e Jornada ao Oeste), narrados e animados, ao meio-dia de Nova York. Reaproveita o motor do canal-terror.
---

# Canal Old Tales (historias antigas e mitos, ingles)

## LINHA DO CANAL (REGRA do Pedro, 02/11/2026) — vale por cima de tudo abaixo

"Não quero só coisas calmas no Old Tales, mas histórias ou contos antigos." O canal conta **histórias e contos
antigos**, em 3 frentes, revezando entre elas (não fazer 2 séries seguidas da mesma frente):

| Frente | `"tema"` | O que é | Exemplos |
|---|---|---|---|
| **Um dia na época** | `"calmo"` | "You wake up as..." em 2ª pessoa, dia a dia real de uma época, fatos conferidos | camponês em 1300, cervejeira, moleiro, monge copista, peregrino |
| **Soldado / vida dura** | `"epico"` | um dia (ou uma campanha) de quem viveu a guerra ou um treino duro, fatos conferidos | soldado de Esparta (agogê, syssitia, Termópilas), legionário romano, arqueiro em Agincourt, viking num ataque, samurai, guarda da Grande Muralha |
| **Mitos e lendas** | `"mito"` | contos de mitologia contados como caso, fiéis à versão tradicional | **China (favorito do Pedro):** Sun Wukong / Jornada ao Oeste, Nezha, Houyi e Chang'e, Nüwa, Pangu, Cobra Branca, Vaqueiro e Tecelã; também grego, nórdico, egípcio, japonês |

- **Paleta por época** (`"paleta"` no roteiro): sem paleta = medieval (verde/pergaminho); `"grecia"` = Esparta,
  Grécia e mitos gregos (terracota e preto, de vaso grego); `"china"` = China antiga e mitos chineses (jade, laca
  vermelha, dourado). Época nova (Roma, Egito, nórdico, Japão) = paleta nova `PALS.cl_<nome>` no motor + validador.
- **Tom:** pode ter tensão, batalha, monstro e morte, sempre contados como um contador de histórias (voz Algieba,
  quente), sem sangue explícito, sem susto de terror (sem flash vermelho, sem grito). O que fica é a sensação de
  "eu estive lá". Todas as frentes seguem o estilo flat e o jeito de contar do `ESTILO-VISUAL.md`.
- **Fatos:** "Um dia na época" e "Soldado" = fatos históricos conferidos em fonte confiável (anote a fonte no
  `series.md`). "Mitos" = fiel à versão tradicional (ex.: *Jornada ao Oeste*, de Wu Cheng'en, séc. XVI); diga na
  descrição de onde vem o conto. Nunca invente "fato" histórico.
- **Mito em 2ª pessoa funciona:** "You are a stone monkey. You were born from a rock." Ou narrado em 3ª pessoa
  como caso. Escolha um e mantenha na série.
- Backlog com ideias nas 3 frentes: `references/temas.md`. Cenários que faltam: `KIRO-PROMPT.md` (raiz).

Canal faceless de Shorts em ingles que conta **historias que ja existem**: tragedias de Shakespeare,
cantos da Odisseia, contos de Poe, mitos gregos e nordicos, lendas arturianas. A historia nao e
inventada — o trabalho e **cortar ao essencial, narrar bem e animar a cena**.

- Publicacao: **1 parte por dia** ao **meio-dia de Nova York** (o motor acerta o horario de verao
  sozinho). Uma obra em 4 partes sai em 4 dias.
- Vantagem sobre inventar historia: o roteiro e **adaptacao**, nao criacao. Sai mais rapido, erra menos
  e os temas nunca acabam. Obra em dominio publico: sem problema de direito autoral.
- Nunca marcado como feito para criancas. Categoria 24, idioma `en`.

## Como rodar

```bash
python3 motor-en/produce.py old-tales --teste --saida /tmp/cl              # so os JPG
python3 motor-en/produce.py old-tales --saida /tmp/cl                      # MP4 sem subir
python3 motor-en/produce.py old-tales --proximo --subir --saida /tmp/cl    # agenda a serie
python3 motor-en/yt_upload.py canal --canal old-tales                      # de quem e o token?
```

Variaveis de ambiente: `GEMINI_API_KEY`, `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN_CLASSICS`.
As mensagens de erro e a trava de canal sao as mesmas do `canal-survival` (ver o SKILL.md dele).
Codigo dos roteiros: `CLNNN`.

## IMPORTANTE: por onde comecar (decisao de custo)

O motor de cenas que estamos reaproveitando foi feito para **terror gotico**: corredor, vela e retrato,
porta, janela, olhos no escuro, agua ao luar, estrada a noite. Peca de cena nova e a coisa **mais caro**
de produzir no pipeline inteiro.

Por isso a ordem de trabalho e:

1. **Primeiro, os classicos escuros** — eles cabem nas pecas que ja existem, com zero codigo novo:
   Macbeth (vela e retrato, corredor do castelo, punhal), Hamlet (vulto na muralha, o fantasma do pai),
   Poe (O Coracao Delator, O Gato Preto, A Queda da Casa de Usher), Frankenstein, Dracula, Fausto,
   A Pata de Macaco, O Corvo.
2. **Depois, se o canal responder bem**, vale investir em pecas novas para antiguidade e mar aberto:
   navio, vela de barco, caverna, templo, falesia. So entao entram Odisseia, Iliada e mitos gregos.

Nao comece pela Odisseia: ela e a que exige mais codigo novo. Comece por Macbeth e Poe.

## Escrever um roteiro novo

> **Duração (Pedro, 05/11):** cada parte tem 1min30 a 2 min (150–185 palavras, 16–22 frases). Vale por cima dos
> números antigos abaixo (40–58 s, 7–9 frases). Ver seção "Duração" do `ROTEIROS.md`.

> **Estilo novo (Pedro, 01/11):** séries novas usam `"visual": "flat"` e o jeito de contar do `ESTILO-VISUAL.md`
> (raiz do repo) e da seção "Estilo novo" do `ROTEIROS.md`. Isso vale por cima do que estiver diferente abaixo.


Mesmo formato do `canal-survival` (ver o SKILL.md dele para os campos, as pecas de cena, os efeitos e
o marcador `{when_next}` — use sempre ele, nunca escreva "tomorrow" na mao, porque com duas
publicacoes por dia a parte seguinte pode sair no mesmo dia). Diferencas deste canal:

- **Serie de 2 a 4 partes** por obra. Cada parte tem 1min30 a 2 min (150-185 palavras); uma tragedia inteira nao cabe: corte em atos.
  Ex.: Macbeth em 3 partes (a profecia / o assassinato / a queda).
- **Primeira frase = o gancho da historia, nao o nome da obra.** Errado: "Today, Macbeth."
  Certo: "Three witches told him he would be king. So he killed to make it true."
  O nome da obra entra no titulo e na descricao, nao na narracao.
- **Narre como quem conta um caso**, nao como aula de literatura. Sem data, sem nome de autor na
  narracao, sem "nesta obra o autor explora". Presente ou passado simples, frases curtas.
- **Fidelidade:** a reviravolta tem que ser a da obra. Confira os fatos antes de escrever — este canal
  perde a confianca do publico se errar a historia.
- Na descricao, credite a obra e o autor: `Based on "Macbeth" by William Shakespeare (public domain).`
- Feche com uma pergunta que puxa comentario ("Was it the witches, or was it always him?").

## Virar video longo depois (planejado)

Igual ao `canal-survival`: as partes de uma obra sao pensadas para grudar em ordem e virar um video
unico da tragedia inteira. Aqui isso e ainda mais valioso, porque "Macbeth em 4 minutos" e um formato
que funciona bem em video longo.
