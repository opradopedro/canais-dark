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

## Primeiros 3 segundos (REGRA do Pedro, 14/11: "fazer a pessoa ficar no vídeo nos primeiros segundos")

Vale para **Hora Muerta, Signal Lost e Old Tales** (o So You Built It está bom, não muda). Vale por cima de qualquer
modelo antigo de abertura (o "Imagine..." do Estilo 3D e o "quem é: nome, idade, ofício" do flat). No Shorts e no
TikTok a pessoa decide em 1 a 3 segundos se fica ou desliza; quem desliza derruba o vídeo inteiro.

### O que os números mostraram (14/11)
- **Nossos vídeos:** as aberturas que mais seguraram foram a **regra com ameaça para VOCÊ** ("Si un perro negro te
  sigue de noche, nunca lo mires a los ojos" 1.156 views; "Si alguien te llama por tu nombre a las 3:33... no contestes"
  1.030), o **fato real** ("En 2023, todo internet compartía una foto..." 1.177) e o **meio do perigo** sem
  "Part two" ("There was no her. Just the car, and the dark trees." 988). As que morreram abriam **apresentando
  alguém** ("Doña Marta tiene tres reglas" 72, "En el perchero de Andrés..." 21, "El trabajo de Don Chuy..." 0,
  "You wake up in Japan... You grow rice." 0).
- **Concorrentes (vidIQ, 14/11):** "If your mom wakes you up at 3 AM... do not get out of bed" (2,8 mi, regra para
  você); Wukong do Henreeeology, 1,5 mi: "Imagine you crossed your own name out of the Book of Death. Nothing can
  kill you now. So, how do you end up trapped under a mountain for 500 years?" (poder + o fim primeiro + pergunta);
  "In this town, there's a monster that can only move in the dark. If the lights go out for one second, it's over
  for all of us." (103 mil em 1 dia: regra + o que está em jogo; o pai/narrador só aparece aos 15 s).
- **Nosso erro de molde (3D, até 14/11):** toda parte 1 abria com "Imagina/Imagine..." + plano **aéreo vazio** +
  2ª fala de biografia ("Martín tiene cuarenta y cinco años..."). As partes 2 abriam com "Parte dos.". Tudo isso saiu.

### As regras (o fiscal barra a partir de HM045, SV035 e CL046)
1. **1ª fala = perigo ou pergunta, em até 16 palavras (ideal 8-13).** A palavra-chave (amarela) vem cedo.
2. **2ª fala = o que está em jogo** (o que acontece se errar, o que vem aí, o fim que vamos ver). **Nome, idade e
   profissão só da 3ª fala em diante**, curtinho ("Martín, el nuevo velador, empieza esta semana.").
3. **Parte 2, 3, 4, 5: nunca "Parte dos/Part two" na voz.** O título e o cartão já dizem a parte. Abra no perigo do
   cliffhanger, explicado para quem NÃO viu a parte 1 (o Shorts mostra a parte 2 para gente nova):
   "Algo en dos patas rasca la reja y dice: Martín, ábreme la capilla."
4. **Rodízio de ganchos** (duas séries seguidas do canal não abrem com a mesma 1ª palavra gasta: Imagine/Imagina,
   If/Si, You, What/Qué):
   - **A. Regra-ameaça para você:** "Si en el monte oyes la voz de tu hermano desde dos lados, no contestes."
   - **B. O fim primeiro / paradoxo:** "How does a boy born in a locked bronze room end up holding Medusa's head?"
   - **C. No meio do perigo:** "A las tres, un autobús sin luces se detiene frente a Lucía y abre la puerta."
   - **D. Fato real / viral:** "En 2023, todo internet compartía una foto..." (só com fonte de verdade).
   - **E. Lugar com regra + preço:** "En este panteón, el perro negro que entra de noche camina en dos patas."
   - **F. "Imagine/You wake up" com enrascada:** só se a mesma frase já disser o perigo ("You wake up in 480 BC, and
     the biggest army on Earth is coming for you."). No máximo 1 em cada 3 séries.
   - **G. Prova / último rastro:** "Nora's last post came from a town that isn't on any map."
5. **A 1ª imagem também é gancho.** A cena da fala 0 mostra o protagonista com medo, a criatura ou o objeto do perigo,
   em `close`, `medio`, `baixo` ou `ombro`. **Nunca `aereo`**, nunca paisagem vazia (no celular fica tudo pequeno).
   No motor ilustrado: personagem GRANDE ocupando a tela vertical, nunca o quadro 16:9 com faixas borradas.
6. **Promessa em até 5 s:** quem fica precisa saber a pergunta que o vídeo vai responder (vai sobreviver? o que é a
   coisa? como ele acabou preso?). A resposta vem no fim da série, não antes.
7. **Mito em 3ª pessoa (Old Tales):** o gancho pode ser pergunta ao espectador (tipo B) sem trocar a pessoa da
   história. "You" fica para o POV e a vida de época (regra de 13/11).
8. **Título e 1ª fala se completam, não se repetem:** o título promete, a 1ª fala já entrega o perigo.
9. **Rotina de seguir/compartilhar:** em regra de terror, a última fala pode ser "Send this to someone who walks
   alone at night" / "Mándaselo a quien camina solo de noche" no lugar da pergunta de comentário (compartilhamento
   pesa no Shorts e no TikTok). Use em 1 de cada 3 séries, para não virar fórmula.

O fiscal (`validar_roteiros.py`, `conferir_gancho`) barra: "Parte/Part" na 1ª fala, 1ª fala com mais de 16 palavras,
abertura calma, biografia (nome + idade) nas 2 primeiras falas, cena da fala 0 vazia ou `aereo`, e mesma 1ª palavra
gasta em duas séries seguidas.

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
1. Gancho em 1 frase, seguindo **"Primeiros 3 segundos"** (rodízio A-G; "Imagine" só de vez em quando e já com perigo).
2. A regra/o fato estranho que todo mundo aceita sem saber por quê.
3. Contraste com o normal ("Durante o dia, tudo funciona normalmente… Mas quando a noite chega…").
4. Um personagem que duvida e resolve testar/descobrir (o nome dele entra aqui, da 3ª fala em diante, nunca na 2ª).
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

## Motor ILUSTRADO no Hora Muerta e no Signal Lost (REGRA do Pedro, 15/11: "a próxima série já no modelo novo")

A partir de **HM045** e **SV038** (o fiscal barra), HM e SV saem no motor ilustrado: fundo ilustrado por IA (um por LUGAR,
Release "fundos") + boneco 2D, câmera, criatura e legenda em código, vertical 9:16 nativo. O jeito de escrever NÃO muda:

1. Escreva a parte como sempre no formato 3D (`"visual": "3d"`, `elenco`, `cenas` com cenario/marca/plano/luz/atores/criatura).
2. Rode `python motor-ilustrado/converter_3d.py <arquivo.json> [...]`. Ele troca para `"visual": "ilustrado"`, põe a cena em
   cada fala e cria/atualiza `motor-ilustrado/cenarios/<hm|sv>-<serie>.json` (um fundo por lugar, variante de dia).
3. Rode o fiscal. Envie os roteiros JUNTO com o `cenarios/*.json`: o push gera os fundos (cota grátis da Cloudflare,
   ~45 por dia; o que não couber sai no dia seguinte às 00:15 UTC). Escreva com pelo menos 3 dias de antecedência.
   O conversor já monta o **gancho visual** (Pedro 15/11: "ganhar o público nos primeiros 5 segundos"): a 1ª cena é a
   criatura de perto no lugar dela (se ela aparece nas 7 primeiras falas) ou o herói em close; o motor abre com um
   avanço rápido de câmera e a legenda grande. O fiscal barra 1ª cena sem ninguém ou de longe.
4. Criaturas que o motor desenha: olhos_no_escuro (crianças de olhos pretos), espantalho, alta/vulto (sem rosto),
   lobisomem (nahual), cao_negro, sem_rosto, rastejante. Outra criatura nova: use a mais parecida ou peça para incluir.
   Cenários conhecidos: casa_interior, bairro, vila, floresta, cemiterio, estrada (outro: o conversor usa o nome como
   descrição; prefira acrescentar a descrição em LUGARES do converter_3d.py).

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
Cada série vira um vídeo longo no YouTube. **PISO DURO: nenhum longo sai com menos de 10 min, em hipótese nenhuma**
(REGRA do Pedro, 15/11; o YouTube libera anúncio no meio a partir de 8 min, e 10 min é a nossa margem).
- A trava é `python motor-en/longo.py trava <video.mp4>`: abaixo de 10 min ela sai com erro e o longo NÃO sobe.
  Todo código que subir longo roda a trava antes do upload.
- Quem decide o que entra é `python motor-en/longo.py plano <canal>` (formato APROVADO pelo Pedro em 15/11):
- **Old Tales: 1 série por longo, sempre.** Toda série do Old Tales tem **5 partes** de ~2 min (250–275 palavras)
  e os extras do longo (abertura, cartões, epílogo) completam até passar de 10 min. Série que não chega a 10min30
  na estimativa NÃO junta outra série: o plano manda **aumentar os extras** (epílogo maior, mais cartões).
- **Hora Muerta e Signal Lost: coletânea assumida.** O longo junta 3 ou mais séries inteiras, em ordem, de 10 a 14 min,
  com título de coletânea (ex.: HM "3 relatos de terror para escuchar en la oscuridad" / SV "3 true scary stories to listen to in
  the dark"), abertura curta que promete as 3 histórias e uma vinheta entre elas. Séries de 2 a 3 partes.
- **So You Built It:** o longo junta 9 a 12 vídeos do mesmo tema (cada um ~1 min) até passar de 10 min.
- **Extras só do longo (Old Tales, OBRIGATÓRIO):** ao escrever a ÚLTIMA parte de uma série do Old Tales, escreva também
  `old-tales/longos/<serie>.json` com `titulo` (título do longo, em inglês, com o nome do mito), `descricao`, `tags`,
  `capa_texto` (2 a 4 palavras) e dois roteiros completos do motor ilustrado, mesmo formato de uma parte (`codigo`
  tipo `CL070A`/`CL070E`, `mundo`, `elenco`, `lineas` com `cena`): `abertura` (40–55 palavras, ~20 s, promete a
  história inteira) e `epilogo` (230–270 palavras, ~2 min: "o que aconteceu depois" / "o que é verdade nessa lenda",
  com cartões de fato; termina com uma pergunta para comentar). Modelo: `old-tales/longos/wukong-ilustrado.json` +
  `wukong-abertura.json` + `wukong-epilogo.json`. Sem esse arquivo o longo da série NÃO sai (não chega a 10 min).
- **Hora Muerta e Signal Lost:** a coletânea é montada sozinha (título, descrição e capítulos automáticos); não precisa
  de extras. Só entram séries do motor ilustrado (o 16:9 é desenhado de novo, com a mesma voz do Short).
- **Como sai:** `.github/workflows/longos.yml` roda 2x por dia (17h40 e 1h40 UTC). Quando todas as partes estão no ar, ele
  redesenha cada parte em 16:9 com a voz guardada (Release `longo-<canal>`), tira o "Part two, tomorrow", junta abertura
  + partes + epílogo, faz a capa e os capítulos, confere legenda, fim e a trava de 10 min, e publica. O plano ganha
  `"feito"` com o link.
- No TikTok, 2 min também é bom: só vídeo com mais de 1 min entra no Creator Rewards.

### Retenção dentro de cada parte (vale para os 4 canais)
- 0–3 s: ver **"Primeiros 3 segundos"** (acima). Nada de "Parte dos" nem "Na parte anterior...": no máximo 1 linha de recapitulação, e depois do gancho.
- A cada 20–30 s, um novo "gancho aberto" (pergunta sem resposta, "mas não era o pior", número que choca). Em 2 min são 4 a 5.
- Corte a cada 2–4 s (já é regra); cartão com texto fica pelo menos 2,5 s na tela (pedido do Pedro, 13/11).
- Aos 60–70% da parte, a virada; nos últimos 10 s, o gancho da próxima parte e uma pergunta simples para comentar.
- A última frase emenda com a primeira quando der (loop).
- O fiscal conta as palavras a partir de YB048, HM037, SV024 e CL031 (os roteiros anteriores já estavam escritos).
- O tempo a mais é para a história **respirar**, não para encher: mais detalhe concreto, mais um obstáculo, mais
  uma regra quebrada, o personagem tentando algo antes da virada. Continue com frases curtas e um plano por linha.
- Séries continuam com **no mínimo 2 partes** e gancho de "quero mais" no fim de cada parte não final. Com partes
  maiores, prefira séries de 2 a 3 partes (4 só em história muito longa). Old Tales: sempre 5 partes (1 série = 1 longo).
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
