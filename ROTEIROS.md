# Como escrever roteiros (vale para o Kiro e para o Claude)

Este é o manual ÚNICO. Quem escreve (Kiro no PC do Pedro ou Claude no site/app) segue exatamente estes passos.
Tudo fica salvo no GitHub, na branch `producao`: se o crédito de um acabar no meio de uma série, o outro
continua de onde parou, só lendo os arquivos.

## Antes de começar
1. `git pull origin producao` (pegue o que o outro escreveu).
2. Leia o `SKILL.md` do canal, o `references/temas.md` e o `references/series.md` (o plano das séries).
3. Se houver série com parte marcada `FALTA` em `series.md`, **termine essa série primeiro**, seguindo o resumo que está lá.
4. Depois disso, **as ideias do Pedro vêm antes de qualquer tema próprio** (ver a seção abaixo).
5. **Escolher tema olhando YouTube E TikTok** (REGRA do Pedro, 13/11): antes de escolher temas novos, veja quais vídeos foram melhor nos dois. YouTube: views do painel (dados.json). TikTok: `vidiq_tiktok_profile_videos` das contas @horamuerta.relatos, @oldtales.retold e @so.you.built.it (o que postamos está em `tiktok/postados.json`). Tema, gancho ou formato que foi bem em qualquer um dos dois ganha mais séries parecidas.

## Ideia do Pedro = próximo vídeo (REGRA do Pedro, 31/10: vale para todos os canais)
"Quando eu mandar uma ideia, esse vídeo é o próximo a sair. Se for história em sequência (estou na parte 2 de 4),
saem a 3 e a 4 e logo depois entra a minha."

- Onde chegam: issues abertas `[YB] Ideia de vídeo`, `[HM] ...`, `[SV] ...`, `[CL] ...` (botão "Ideia" do painel),
  ou um pedido direto no chat. Liste com `gh api "repos/opradopedro/canais-dark/issues?state=open"`.
  A produção diária avisa na issue "Aviso dos canais" (`IDEIA SEM ROTEIRO #n`) enquanto a ideia não virar roteiro.
- Escreva o roteiro da ideia ANTES de qualquer tema do backlog, com estes dois campos no JSON:
  `"prioridade": "pedro"` e `"ideia": "#<número da issue>"` (pedido pelo chat: `"ideia": "chat dd/mm"`).
  Se a ideia for uma série, ponha os dois campos em TODAS as partes.
- Código: o próximo número livre, como sempre. Não precisa renumerar nada: a produção (`motor-en/prioridade.py`,
  usada pelos três `produce.py`) põe na frente da fila tudo que tem `"prioridade": "pedro"`.
- Ordem que a produção segue: 1) série que já começou no YouTube termina; 2) ideias do Pedro (a mais antiga
  primeiro); 3) o resto, na ordem dos arquivos. Vídeo que já está AGENDADO no YouTube não muda de data: a ideia
  entra no primeiro horário livre depois dele. No So You Built It a ideia pega o primeiro horário livre, seja
  Curiosidade ou Evolução.
- **"Faz sair AGORA"** (pedido direto do Pedro, ex. Wukong 11/11): ponha também `"furar_fila": true` em todas as partes.
  A série passa na frente até de série pela metade, a parte 1 é publicada ~20 min depois de subir (sem esperar o
  horário do canal) e as outras saem uma por dia no horário normal. Use só quando o Pedro pedir "agora".
- Depois de enviar, comente na issue qual código ficou (ex.: "virou YB036, entra como próximo da fila") e feche.
  Marque o tema como ideia do Pedro em `references/temas.md`.

## Os canais
| Pasta | Canal | Formato | Código |
|---|---|---|---|
| `signal-lost/` | Signal Lost (EN) | terror de sobrevivência, séries de 2 a 3 partes (1min30–2min cada), 1/dia às 19h NY | `SVnnn` |
| `old-tales/` | Old Tales (EN) | histórias e contos antigos: um dia na época (medieval etc.), soldado (Esparta, Roma...) e mitos (China/Wukong em destaque), 1/dia ao meio-dia NY | `CLnnn` |
| `hora-muerta/` | Hora Muerta (ES) | terror, séries de 2 partes | `HMnnn` |
| `so-you-built-it/` | So You Built It (EN) | engenharia 3D, formatos Evolucao e Curiosidade | `YBnnn` |

Regras de cada canal: no `SKILL.md` da pasta. Old Tales (REGRA do Pedro, 02/11: "não só coisas calmas"):
`"tema"` = `"calmo"` (um dia na época), `"epico"` (soldado, batalha) ou `"mito"` (mitologia); `"paleta"` = nada
(medieval), `"grecia"` ou `"china"`; `"piano": 0` sempre; sem susto de terror. Fato histórico conferido em fonte
confiável; mito fiel à versão tradicional, dizendo a fonte na descrição. Detalhes na seção "LINHA DO CANAL" do
`old-tales/SKILL.md`.

## Tom do Old Tales (REGRA do Pedro, 12/11: "muito amigável, muito calmo, criancinha")

Old Tales conta mitos, lendas, batalhas e curiosidades históricas para PRENDER, não para ninar. Vale para todo
roteiro novo (CL042 em diante, inclusive as partes 2-5 do Wukong que estão em `old-tales/em-espera/`: reescrever).

- **Primeiro segundo = conflito, choque, pergunta ou curiosidade.** O problema não é a palavra "Imagine", é abrir
  CALMO, descrevendo paisagem sem perigo ("Imagine a stone on a mountain...": o Pedro pularia na hora). Proibido abrir com
  "Once upon a time", "Long ago", "There once was", "Today" (o fiscal barra). Modelos:
  - Pergunta-desafio: "Have you heard of the crazy monkey who challenged the champions of Heaven? That's Wukong, and his story starts like this."
  - Fato chocante: "This monkey erased his own name from the Book of Death. And Heaven couldn't stop him."
  - "Imagine/You wake up" COM ENRASCADA (o Pedro gosta): "Imagine you wake up in the Stone Age. You have one day to find a tribe, or you die alone."
    "You wake up in 1500, with your modern brain, the year they reach America." "You wake up in 1600, and the village calls you a witch."
    A primeira frase já põe você em perigo ou numa situação absurda; a segunda diz o que está em jogo.
- **Suspense e ação em toda parte:** perigo, briga, desafio, perseguição, castigo, traição. Cada 15-20 s algo muda
  (virada, revelação, número absurdo). Verbos fortes, frases curtas. Nada de cena fofa parada.
- **Curiosidade real** a cada parte (um número, um detalhe da fonte que quase ninguém sabe): é o que segura a retenção.
- **Personagem com atitude:** herói ousado, arrogante, perigoso; vilões de verdade. Nada de "cute", "little", "happy".
- **Gancho no meio** ("Stay, because...") e fim com cliffhanger de perigo + "Part X, {when_next}".
- **Visual combinando:** câmera que avança, céu escuro/tempestade nas viradas, expressões de raiva/desafio, lutas.
  Bonito, mas NÃO infantil (também evita o YouTube marcar como "feito para crianças", que corta RPM).
- Sem susto de terror e sem sangue explícito: tensão sim, gore não.

Visual e som de ação (REGRA do Pedro, 12/11 22h: "tire todos os elementos de criança e bote de ação"):
- Pelo menos 4 cenas com ação de verdade (`Melee_*`, `Hit_*`, `Jump_*`, `Running_*`, `Dodge_*`, `Ranged_*`); o fiscal barra.
- Rostos de raiva/medo nas viradas, céu de tempestade (`"luz": "tempestade"`) nos momentos de perigo.
- A trilha é de ação para todo o Old Tales (tambores, `motor-en/trilha_acao.py`); o alaúde saiu.
- Quando a narração fala de roupa, o personagem aparece vestido. Wukong veste armadura quando o elenco tem `roupa`;
  `"roupa": "nenhuma"` no ator da cena deixa só o pelo (ex.: antes de roubar a roupa).

## Estilo novo: Hora Muerta, Signal Lost e Old Tales (REGRA do Pedro, 01/11)
Gráficos limpos e história contada com ritmo, INSPIRADOS num vídeo que o Pedro mandou, mas com identidade própria de
cada canal: "só se inspire, não faça exatamente igual". Guia completo: **`ESTILO-VISUAL.md`** (seções 2 e 3).

- (Até HM040, SV030 e CL033. Daí em diante vale o **Estilo 3D**, seção abaixo.) **Toda história nova** desses 3 canais era no estilo flat. O fiscal barra quem não for: a partir de HM021, SV012 e
  CL013, o roteiro precisa de `"visual": "flat"` e só pode usar peças `f_*`, `retrato` e `texto`.
  Signal Lost também leva `"paleta": "sv"`; Old Tales leva `"tema"` calmo/epico/mito e `"piano": 0`.
- **Séries que já começaram no YouTube** terminam no estilo antigo. As que não tinham começado foram para
  `<canal>/descartados/` (01/11): não volte com elas; para reaproveitar, reescreva no estilo flat com código novo.
- **Peças flat que já existem** (use estas antes de criar outra): `retrato`, `texto`, `f_panteon`, `f_pueblo`,
  `f_onibus`, `f_posto` (terror) e `f_aldeia`, `f_casa` (Old Tales). A lista com parâmetros está no `MUNDOS.md`.
  Se a história pedir um lugar que não existe, adapte a história a esses lugares ou crie a peça (seções 5 e 6 do guia).
- Estrutura: gancho concreto (0–5 s) → quem é (nome, idade, ofício, cartão `nome`) → como funciona (regras/plano em
  lista de 3, cartão `lista`) → virada com hora exata (cartão `msg`/`rotulo`) → pergunta aberta + aviso da próxima parte.
- Gancho: use o rodízio da seção 3 do `ESTILO-VISUAL.md`; não repita o mesmo tipo em duas séries seguidas do canal.
- Frases de 3 a 10 palavras, uma ideia por frase, números e horas concretos, uma linha por plano (corte a cada
  1,5–3 s; `"en"` na cena corta no meio de uma linha). No Hora Muerta, evite ponto no meio da linha: use vírgula.
- Proibido copiar a referência: nada de "luckiest person alive", "forgot one thing", "Tell me in the comments" como
  fórmula, nem trem/maquinista/zumbi.
- Modelos prontos para copiar: `hora-muerta/stories/021-*` a `024-*`, `signal-lost/stories/012-*` a `014-*`,
  `old-tales/stories/013-*` a `015-*`.

## Estilo 3D: Hora Muerta, Signal Lost e Old Tales (REGRA do Pedro, 07-10/11, substitui o flat para séries NOVAS)

Referência: Reel "a linha branca" (`referencias/estilo-3d-reel/`, quadros em `/mnt/project-files/estilo-3d-reel/`).
Motor: `motor-3d/` (Three.js, custo zero, mesmo render do `hora-muerta/scripts/render.py`). O fiscal exige
`"visual": "3d"` a partir de **HM041, SV031 e CL034**. Séries já começadas terminam no estilo em que começaram.

**Jeito de contar (os 3 canais):** 3ª pessoa no presente, frases curtas, como quem explica um mistério.
1. Gancho com o mistério em 1 frase ("Imagine viver numa cidade cercada por uma linha branca…").
2. A regra/o fato estranho que todo mundo aceita sem saber por quê.
3. Contraste com o normal ("Durante o dia, tudo funciona normalmente… Mas quando a noite chega…").
4. Um personagem que duvida e resolve testar/descobrir.
5. No meio, pedido para seguir ("…porque agora vem a parte assustadora" / "lo que viene ahora…").
6. Escalada (barulho, silhueta, perseguição) e a virada (a regra funciona, ou não).
7. Gancho final que deixa a pergunta aberta e puxa a próxima parte; a última frase volta para a primeira (loop).
- Signal Lost = suspense/sobrevivência (inglês). Hora Muerta = lendas latinas e regras de terror (espanhol; susto no fim
  pode, som depois da narração não). Old Tales = contos diversos: dia a dia, soldados, mitos (inglês; criatura rara).
- Continuam valendo: mínimo 2 partes, `{when_next}`/`{dia_siguiente}`, "Duração", legenda, regra das ideias do Pedro.

**Campos do roteiro 3D** (exemplos completos em `motor-3d/testes/*-3d-exemplo.json`, resumo em `motor-3d/README.md`):
- `"visual": "3d"`, `"elenco": {"mateo": {"semente": 17}}` (ou altura, pele, camisa, calca, cabelo, roupa, acessorio,
  rosto_estilo). O mesmo ator aparece igual em todas as cenas e partes da série.
- `"cenas": [{"linea": 0, "cena": {"cenario", "marca", "plano", "luz", "efeito", "atores": [{"id", "acao", "rosto",
  "de", "para", "segura"}], "criatura": {"tipo", "marca"}}}]`, uma cena por fala de preferência. `"plano": "auto"` deixa
  o motor cortar sozinho a cada ~2,5 s (recomendado); fixe um plano só quando a fala pedir (revelação = `baixo`).
- Palavra-chave entre `*asteriscos*` sai amarela na legenda (1 ou 2 por fala, no máximo).
- Vocabulário válido (cenários prontos e marcas, luzes, criaturas, expressões, animações): `python3 motor-3d/vocabulario.py`.
  Cenários prontos hoje: bairro, floresta, estrada, casa_interior, cemiterio, hospital, vila, templo_oriental. Os outros
  19 são rascunho e o motor recusa. Criaturas: alta, sem_rosto, cao_negro, mulher_branca, vulto, rastejante, espantalho,
  olhos_no_escuro, lobisomem, fantasma, aranha_gigante, coisa_com_chifres, gigante_mitologico, animal.

**OLD TALES: 3D PAUSADO (Pedro, 11/11 11h, depois do CL036 reprovado).** Nada 3D vai ao ar no Old Tales até o Kiro
fazer a rodada 6 (`motor-3d/PLANO-KIRO-RODADA6.md`) e o Pedro aprovar um MP4 de teste. Enquanto isso saem os roteiros
prontos do estilo atual (CL018, CL022-CL033). Série 3D nova do Old Tales vai para `old-tales/em-espera/`, NUNCA para
`stories/`. Hora Muerta e Signal Lost não mudam.

**3D vai ao ar já (REGRA do Pedro, 11/11):** a fila (`motor-en/prioridade.py`) põe séries 3D na frente de qualquer
série do estilo antigo que ainda não começou. As séries prontas no estilo antigo viram **RESERVA**: só saem se faltar
roteiro 3D. Por isso o **estoque mínimo desses 3 canais conta só roteiros 3D** (reserva não conta): a rotina escreve
3D até ter 10 a 14 dias de 3D, mesmo que a reserva esteja cheia. Série já começada no YouTube termina antes.

**Variedade (REGRA do Pedro, 10/11): nada se repete sempre.** Cada série nova escolhe protagonista (`semente` nova),
cenário principal e criatura DIFERENTES das últimas 5 séries do canal; varie também luz/clima (noite, neblina, chuva,
lua cheia, entardecer, neve…). O fiscal avisa repetição (`motor-3d/variedade.py`). Se a história precisar de um cenário
que ainda é rascunho, escreva com o pronto mais parecido e anote no `PLANO-MUNDOS.md` o cenário que faltou.

## Cena que muda (REGRA do Pedro, 12/11: "repete a mesma cena, nada muda na imagem")

Vale para todo roteiro `"visual": "3d"` (motor cartoon). A imagem tem que mostrar o que a voz está falando:

- Duas cenas seguidas não podem ser quase iguais: mesmo `cenario` + mesma `marca` + atores com a mesma `acao` e o
  mesmo objeto na mão, sem criatura nem objeto novo. Mudar só o `rosto` ou o `plano` não basta. O fiscal reprova
  ("repete a cena anterior quase igual") e também a 3ª vez da mesma cena no vídeo.
- Quando a fala cita polícia, caminhão, ônibus, carro, ambulância, vaca, cavalo, cachorro, placa, enfermeira,
  médico, guarda, multidão, criança, soldado ou monge, o motor põe isso na tela sozinho (lista em
  `motor-cartoon/elenco/objetos-palavras.json`). Para forçar em outra cena: `"objetos": ["viatura", {"tipo": "vaca", "n": 3}]`
  dentro do bloco `cena`.
- Criatura de terror aparece de verdade: nas falas de passos, voz, sombra, "atrás dela", ponha a `criatura` na cena.

## Duração (REGRA do Pedro, 05/11: "a pessoa entende a história e o vídeo acaba")
Vale por cima de qualquer número antigo (prompt, SKILL.md, temas.md) que fale em "8 frases", "40 a 58 s" ou "35 a 50 s".

| Canal | Duração | Palavras faladas | Frases |
|---|---|---|---|
| So You Built It | ~1 min (55–75 s); pode ir até ~90 s se o tema pedir | 170–210 (fiscal aceita 165–280) | 14–18 |
| Hora Muerta, Signal Lost (a partir de HM055 e SV047) | **1min50 a 2 min**, CADA parte | 185–205 (fiscal aceita 170–215) | 20–26 |
| Old Tales (a partir de CL059) | **1min50 a 2 min**, CADA parte | 250–275 (fiscal aceita 235–285) | 22–30 |

- Medido nos vídeos prontos (14/11): SYBI ~3,1 palavras/s; Hora Muerta ~1,7 palavras/s (HM041: 180 palavras = 1min46); Old Tales ~2,3 palavras/s (Wukong 1: 179 palavras = 1min18, curto demais).

### Por que 2 min (REGRA do Pedro, 14/11) e o vídeo longo
Cada série vira um vídeo longo no YouTube, e o longo precisa de **8 min ou mais** (anúncio no meio). 5 partes de 1min18
davam 6min30: não serve. Com ~1min55 por parte:
- **Old Tales:** série de 5 partes (no máximo 5) = ~9min30 + extras só do longo = **10 a 11 min**.
- **Hora Muerta e Signal Lost:** séries de 2 a 3 partes; o longo junta 2 ou 3 séries do mesmo tema (10 a 14 min).
- **Extras só do longo** (o motor monta, o roteirista escreve no campo `"longo"` da última parte): abertura de 15–20 s
  com a promessa da história inteira, um cartão explicativo extra por parte e um epílogo de 45–90 s ("o que
  aconteceu depois" / "o que é verdade nessa lenda"). Isso dá ao público do Short um motivo para ver o longo.
- No TikTok, 2 min também é bom: só vídeo com mais de 1 min entra no Creator Rewards.

### Retenção dentro de cada parte (vale para os 4 canais)
- 0–2 s: a frase de abertura já é o conflito ou a imagem mais forte. Nada de "Na parte anterior...": no máximo 1 linha de recapitulação, e depois do gancho.
- A cada 20–30 s, um novo "gancho aberto" (pergunta sem resposta, "mas não era o pior", número que choca). Em 2 min são 4 a 5.
- Corte a cada 2–4 s (já é regra); cartão com texto fica pelo menos 2,5 s na tela (pedido do Pedro, 13/11).
- Aos 60–70% da parte, a virada; nos últimos 10 s, o gancho da próxima parte e uma pergunta simples para comentar.
- A última frase emenda com a primeira quando der (loop).
- O fiscal conta as palavras a partir de YB048, HM037, SV024 e CL031 (os roteiros anteriores já estavam escritos).
- O tempo a mais é para a história **respirar**, não para encher: mais detalhe concreto, mais um obstáculo, mais
  uma regra quebrada, o personagem tentando algo antes da virada. Continue com frases curtas e um plano por linha.
- Séries continuam com **no mínimo 2 partes** e gancho de "quero mais" no fim de cada parte não final. Com partes
  maiores, prefira séries de 2 a 3 partes (4 só em história muito longa). Old Tales: até 5 partes (série que vira longo).
- O último susto continua na **penúltima** frase (trava de chiado no fim) e a legenda continua presa na voz.
- Shorts aceita até 3 min: nunca passe de ~2min10 numa parte.

## Estoque mínimo (REGRA do Pedro, 03/11: "nunca mais" aviso de ESTOQUE BAIXO)
- (Hora Muerta, Signal Lost e Old Tales: conta SÓ roteiro 3D; os do estilo antigo são reserva, ver "Estilo 3D".)
- Cada canal precisa ter SEMPRE pelo menos **10 dias** de roteiros prontos em `stories/` que ainda não subiram
  (Old Tales, Hora Muerta e Signal Lost: 10 roteiros; So You Built It: 20). A produção avisa com 4 dias.
- Quem escreve (rotina semanal de sexta, Kiro ou Claude em qualquer conversa) completa até **14 dias** à frente,
  não só até a sexta seguinte. Assim o estoque nunca cai abaixo do aviso entre uma rotina e outra.
- Para contar: a produção diária escreve `estoque: N roteiro(s) prontos (...)` no log do Actions de cada canal
  (ou `ESTOQUE BAIXO` na issue "Aviso dos canais"). Na dúvida, escreva 14 dias a partir do próximo código livre.

## Passo 1: o plano da série (ANTES de escrever qualquer parte)
Em `<canal>/references/series.md`, acrescente um bloco assim e já faça commit + push:

```
## medieval-village (CL001-CL003) — Old Tales — por: kiro
- CL001 parte 1/3: acorda na vila, cama de palha, sino, fogo sem chaminé, cerveja fraca. FEITO
- CL002 parte 2/3: dia de feira, pedágio, porcos, placas com desenho, sal, pelourinho, toque de recolher. FALTA
- CL003 parte 3/3: colheita em agosto, dízimo, respiga, banquete do senhor, música no fogo. FALTA
Tom/estilo: calmo, voz Algieba, cenas vila/casa/mercado.
```

O resumo de cada parte tem que bastar para outra pessoa escrever aquela parte sem ter visto a conversa.

## Passo 2: escrever as partes
- Arquivo `<canal>/stories/NNN-slug-P.json`, código na sequência (próximo número livre do canal).
- Copie a estrutura de um roteiro existente do mesmo canal. Campos: `codigo`, `serie`, `serie_titulo`, `parte`,
  `partes`, `anterior` (código da parte anterior), `titulo`, `capa`, `descripcion`, `tags`, `lineas`, `cenas`,
  `eventos`, `destaque`. Opcional: `"autor": "kiro"` ou `"claude"`. Ideia do Pedro: `"prioridade": "pedro"` e
  `"ideia": "#n"` (seção acima).
- Parte que não é a última: a última fala promete a seguinte com o marcador `{when_next}` (EN) ou
  `{dia_siguiente}` (ES), e a cena final usa `{next_card}`. Nunca escreva "tomorrow" à mão.
- Cenas: só peças que existem em `hora-muerta/scripts/engine.html` (`COMP.<nome>`), ou mundos 3D em
  `so-you-built-it/scripts/mundos/`. A lista completa, e como criar um novo, está em **`MUNDOS.md`**: procure lá
  antes de criar. Cenário novo é só ADICIONADO, nunca mude um que outro canal usa.
- O susto pode aparecer na imagem até o fim, mas **depois que a narração acaba não toca som nenhum** (REGRA do Pedro,
  05/11: nada de estrondo, barulho ou chiado no fim). O mix silencia tudo logo após a última palavra; a estática de TV que
  o Gemini cola na gravação é cortada (`motor-en/estatica.py`), e `motor-en/checar_fim.py` barra o vídeo se sobrar algo.
- Prévia grátis (não gasta narração nem pesa o PC): escreva o caminho do roteiro em `.github/previa.txt` e envie
  para a producao; os JPGs saem na Release `previas`. No PC: `python motor-en/previa.py <roteiro> <pasta>`.
  OLHE os JPGs: a cena tem que combinar com o texto.
- **Depois de CADA parte**: marque `FEITO` em `series.md`, rode o fiscal e faça commit + push. Partes pequenas,
  enviadas uma de cada vez: se o crédito acabar, nada se perde.

## Passo 3: o fiscal (obrigatório antes de cada push)
`python motor-en/validar_roteiros.py` precisa terminar em `ROTEIROS OK`. Ele pega código repetido, peça de
cena que não existe, série quebrada, falta de `{when_next}`, Old Tales sem tema calmo/epico/mito. O GitHub roda o mesmo
fiscal em todo push e a produção diária não usa canal com roteiro quebrado. Ele também barra roteiro novo fora da
duração (seção "Duração").

## Enviar
```
git add <canal>/stories <canal>/references
git commit -m "<canal>: <codigo> <titulo curto> (por kiro|claude)"
git pull --rebase origin producao
python motor-en/validar_roteiros.py
git push origin producao
```
Se o pull trouxer um roteiro com o MESMO código que você usou (os dois escreveram ao mesmo tempo), troque o
seu para o próximo número livre, ajuste o `anterior` e o `series.md`, rode o fiscal e envie de novo.

## Legenda (REGRA do Pedro, 30/10: vale para todos os canais)

- A legenda é feita pelo motor a partir do áudio final (alinhamento forçado, `motor-en/sincronia.py`). Ninguém
  cronometra legenda à mão nem por estimativa.
- Uma palavra nunca aparece antes da voz nem atrasada. O motor barra o vídeo (`NAO SUBIU ... LEGENDA FORA DA VOZ`) se
  qualquer palavra ficar fora de 0,12 s antes / 0,07 s depois da voz. Não desligue nem afrouxe essa trava.
- No roteiro, escreva exatamente o que a voz vai falar: frase no texto que a voz não fala reprova o vídeo.

## O que NÃO fazer
- **Signal Lost e Old Tales:** quem escreve o roteiro não publica nem gasta narração. A produção diária no
  GitHub Actions faz isso sozinha. **Hora Muerta e So You Built It** continuam narrando e subindo pelas
  rotinas do Claude, como sempre.
- Não apagar nem reescrever roteiro que já está no YouTube (o código dele aparece em `yt_upload.py publicados`).
- Não pôr chave, token ou senha em nenhum arquivo.
- Não mexer em `main`: a branch de trabalho é `producao`.
