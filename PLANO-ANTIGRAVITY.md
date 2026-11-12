# Plano para o Antigravity: motor "cartoon" para Hora Muerta, Signal Lost e Old Tales

Cole este arquivo inteiro no Antigravity (modelo Argon). Repositório: `opradopedro/canais-dark`, branch **`producao`**
(NUNCA `main`). Leia antes: `ROTEIROS.md` (raiz, seções "Estilo 3D" e "Duração"), `motor-3d/README.md`,
`motor-3d/vocabulario.py`, `motor-3d/testes/*-3d-exemplo.json`, `hora-muerta/scripts/render.py`,
`motor-en/produce.py`, `motor-en/sincronia.py`, `motor-en/mix_en.py`, `motor-en/checar_fim.py`,
`.github/workflows/canais.yml`, e os `canal.json` de `hora-muerta/`, `signal-lost/`, `old-tales/`.

## Decisão do Pedro (11/11/2026)

O Pedro aprovou o vídeo-teste do Wukong feito com a skill `cartoon-3d-short` e quer **os 3 canais de história**
(Hora Muerta em espanhol, Signal Lost e Old Tales em inglês) com esse visual, rodando no GitHub Actions (repo
público = minutos grátis), custo zero. O So You Built It e o Radar GTA NÃO mudam.

Ponto de partida: `opradopedro/claude-skills`, pasta `skills/cartoon-3d-short/templates/wukong/` (Remotion + three.js,
bonecos 2D desenhados em canvas dentro de mundo 3D com contorno de tinta, desfoque de lente, bloom, correção de cor).
Leia `skills/cartoon-3d-short/NOTAS-PEDRO.md`. **NÃO mude o visual**: `ink.ts`, `lensblur.ts`, `grade.ts`, `shade.ts`,
`lights.ts`, `cardshade.ts`, `paint.ts`, `toon.ts` ficam como estão (pode acrescentar presets de luz em `lights.ts`).
Roda sem GPU: Chromium com `chromiumOptions: { gl: "swangle" }`, ~3 s/quadro em 1080x1920 com `concurrency: 4`.

O problema do teste: `story.ts`, `world.ts` e `monkey.ts` foram escritos à mão para UMA história. O objetivo é um
motor que lê o roteiro e monta o vídeo sozinho.

## Regra de ouro: ler os roteiros 3D que já existem

Há estoque de 10 a 14 dias de roteiros `"visual": "3d"` em cada canal. O motor novo tem que renderizar ESSES
roteiros sem reescrever nada: mesmo formato (`elenco`, `lineas`, `cenas[].cena` com `cenario`, `marca`, `plano`,
`luz`, `efeito`, `atores[{id, acao, rosto, de, para, segura}]`, `criatura{tipo, marca}`, `*destaque*`) e o mesmo
vocabulário de `motor-3d/vocabulario.py` (cenários e marcas, 16 luzes, 9 planos, 14 criaturas, 8 expressões,
objetos de mão, ações). Ações do KayKit (`Walking_A`, `Crouching`, `Cheering`...) viram as poses do boneco 2D por
uma tabela (`acoes.ts`: andar, correr, agachar, sentar, deitar, braços para cima, apontar, lutar, cair, pular, segurar).

A troca de motor é por canal: `canal.json` ganha `"motor_visual": "cartoon"`; o `render.py` manda roteiros `"3d"`
para o motor cartoon quando o canal tiver essa chave. Sem a chave, tudo continua no `motor-3d` de hoje.

## Ordem do Old Tales (pedido do Pedro, 11/11/2026)

1. **Sun Wukong, 5 episódios.** A parte 1 já foi feita à mão pelo Claude no visual cartoon (`CL041`, 87 s, publicada
   em 11/11 pela tarefa `subir:old-tales:cl041-wukong-1`; o código do projeto está no branch `entregas`, pasta `cl041-wukong-1/`,
   arquivo `wukong-cl041-fonte.tar.gz`, use como referência de cenas, macaco, caverna, festa e legenda).
   As partes 2 a 5 são os roteiros `old-tales/em-espera/037..040-wukong-*.json`: renumere para **CL042 a CL045**
   (CL036-040 já existem no YouTube), troque `"serie"` para `"wukong-cartoon"`, mova para `stories/` e renderize pelo
   motor novo. Cenários que essas partes pedem: mar com jangada, cidade humana, templo do Subodhi, palácio do Rei
   Dragão no fundo do mar, submundo, palácio do Céu, jardim de pêssegos, fornalha, mão do Buda, montanha que prende.
   O macaco tem que ser o mesmo da parte 1 (`monkey.ts`, pelo dourado, coroa e capa depois que vira rei).
**TOM (REGRA do Pedro, 12/11):** o Pedro achou a parte 1 "muito amigável, muito calma, criancinha". Antes de
renderizar, REESCREVA as falas das partes 2-5 (e de toda série nova) pela seção "Tom do Old Tales" do `ROTEIROS.md`:
abertura com choque ou pergunta ("Have you heard of the crazy monkey who challenged the champions of Heaven?"), nunca
"Imagine..."; suspense, ação, briga, castigo e uma curiosidade real por parte. No visual: menos fofo, mais ação
(câmera avançando, lutas, céu de tempestade nas viradas, expressões de raiva e desafio, Wukong arrogante e perigoso,
generais do Céu ameaçadores). O fiscal `validar_roteiros.py` barra abertura calma do CL042 em diante.

2. **Um conto da Grécia** (3 partes, sugestão: Perseu e a Medusa; cenários `grecia_templo`, `ilha_mar`, `caverna_gorgonas`).
3. **Um conto da China antiga** (3 partes, sugestão: Mulan, a balada original do séc. V; `aldeia_china`, `campo_batalha`).
4. **Zhong Kui**, o caçador de demônios (3 partes; `palacio_ceu`, `cemiterio` à noite, demônios como criaturas).

Roteiros novos seguem o `ROTEIROS.md` (1min30 a 2min por parte, gancho no fim, "Parte X sai dia X") e entram no
`old-tales/references/series.md` antes de escrever. Hora Muerta e Signal Lost seguem o estoque 3D que já existe.

## Atalho já pronto: publicar vídeo feito fora do Actions

`canais.yml` aceita a tarefa `subir:<canal>:<tag da Release>`: baixa `video.mp4` + `upload.json` de uma Release ou da pasta `<tag>/` do branch `entregas` (formato do
`yt_upload.py`, `"arquivo": "video.mp4"`) da Release e publica na hora. Serve para um vídeo renderizado no PC.

## Entrega 1: pasta `motor-cartoon/`

1. Copie o exemplo do Wukong para `motor-cartoon/` com `package.json` (versões fixas do exemplo) e `package-lock.json`.
2. **Cenários** (`motor-cartoon/cenarios/*.ts`): um arquivo por cenário do vocabulário, com as MESMAS marcas
   (posição do ator + câmeras "aereo/aberto/medio/close/baixo/ombro/pov/nuca"). Prioridade:
   - Terror/suspense (HM e SV): `bairro`, `floresta`, `estrada`, `casa_interior`, `cemiterio`, `hospital`, `vila`
   - Old Tales: `templo_oriental` + os do Wukong (`montanha_nuvens`, `cachoeira`, `caverna_reino`, `palacio_ceu`, já
     prontos no world.ts) + `aldeia_china`, `esparta_cidade` (colunas, muro, arena), `campo_batalha`, `mosteiro`
   Tudo em código (rocha com ruído, sem modelo externo). Pedra é pedra (textura de rocha natural), nunca madeira.
3. **Luzes à noite**: `lights.ts` só tem `day` e `golden`. Crie as 16 luzes do vocabulário no mesmo esquema
   (noite azul legível, nunca preto chapado; lanterna/tocha como cone de luz com bloom; chuva, neblina, neve,
   tempestade com relâmpago por `t`). Terror precisa ser escuro mas sempre dá para ver rosto e criatura.
4. **Elenco** (`motor-cartoon/elenco/*.ts`) no estilo de `toon.ts`: pessoa genérica gerada pelo `elenco` do roteiro
   (semente, altura, pele, camisa, calça, cabelo, roupa, acessório; o mesmo ator sai igual em todas as cenas e partes),
   criança, idoso, monge, soldado_esparta (elmo com crista, escudo redondo), soldado_china, rei, deus, e o macaco do
   `monkey.ts`. Expressões do vocabulário mapeadas para as 14 de `toon.ts` (medo → nervous, susto → shock, ...).
5. **Criaturas** (as 14 do vocabulário) como cartões 2D grandes no mesmo traço: `alta` (3,5 m, olhos que brilham),
   `sem_rosto`, `mulher_branca`, `vulto`, `rastejante`, `espantalho`, `lobisomem`, `fantasma`, `cao_negro`,
   `aranha_gigante`, `coisa_com_chifres`, `gigante_mitologico`, `olhos_no_escuro`, `animal`. Corpo inteiro, nada solto.
6. **Câmera**: só deslizamento suave (smootherstep), aproximação lenta nos planos parados, `"plano": "auto"` corta a
   cada ~2,5 s sem repetir. **Sem tremor** (o Pedro reprovou tremor). Susto: no máximo um tranco de 6 quadros.
7. **Legenda**: a do `Wukong.tsx` (até 3 palavras, entra 1 quadro antes da voz, `*destaque*` amarelo), com o tempo de
   `sincronia.py`. Funciona em espanhol (HM) e inglês.
8. **Som**: a mixagem continua no `mix_en.py`/`mix.py` de cada canal. Regra: NENHUM som depois da última palavra
   (`checar_fim.py` tem que passar). Susto no fim da história pode (é imagem), estalo/chiado não.

## Entrega 2: Actions

- No workflow: Node 22, `npm ci` em `motor-cartoon` (com cache), Chromium do Playwright.
- Renderizar em pedaços de 150 quadros, um processo por pedaço, e juntar com `ffmpeg -f concat -c copy`
  (o render inteiro estourou a memória no teste). Cache de texturas com limite (LRU de 40, como o world.ts do Wukong).
- Conta de tempo: 1 min de vídeo ≈ 1h30 de render no runner de 4 CPUs. Cada canal tem 4 horários por dia em
  `canais.yml`; garanta que a primeira tentativa comece cedo o bastante para terminar antes da hora de publicar.
- `sincronia.py conferir` no MP4 final antes de subir (trava de legenda), como já é hoje.

## Entrega 3: prova antes de ligar (NÃO publicar)

Renderize pelo motor novo, a partir dos roteiros que já existem: 1 parte do Hora Muerta, 1 do Signal Lost e 1 do
Old Tales (a parte 2 do Wukong, CL042, ver "Ordem do Old Tales"). Suba os 3 MP4 numa Release `teste-cartoon` e avise o
Pedro. **Só depois de ele aprovar** ponha `"motor_visual": "cartoon"` nos 3 `canal.json`. Até lá a produção diária
segue no motor de hoje, e o 3D do Old Tales continua pausado.

## Regras que não podem ser quebradas

- Branch `producao`; nada de publicar teste; custo zero (nada de API paga nem modelo externo de site que bloqueia a nuvem).
- Variedade: o mesmo cenário no máximo 2 vezes em 7 vídeos do canal (`motor-3d/variedade.py` continua valendo).
- Rodar `python motor-en/validar_roteiros.py` até "ROTEIROS OK" e `python motor-en/teste_mix.py` antes de cada push.
- Commits pequenos, um por entrega, com o que foi feito na mensagem.
