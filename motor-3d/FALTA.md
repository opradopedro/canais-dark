# motor-3d — o que já está pronto e o que falta

Atualizado por Kiro em 11/11/2026 (rodada 4: acabamento). Branch `producao`.

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

## Falta / pontos a melhorar

1. **19 cenários em rascunho**: escola, metrô, elevador, posto, farol, lago congelado, mina, igreja antiga,
   deserto, praia, fazenda, castelo, mercado medieval, cidade grega, navio, cabana na neve, campo, acampamento, torre.
   Cada um precisa do mesmo acabamento dos 8 (e passar no `cenarios_check.py`) antes de entrar num vídeo.
2. **Braços da `alta`** em `Idle_A` ficam abertos em diagonal (os antebraços longos); para pendurar mais junto ao
   corpo, vale uma animação própria ou girar os ombros por código.
3. **Cabelo `curto`/boné** às vezes desce até a sobrancelha; subir um pouco a calota em `fazerCabelo`.
4. **Fantasma**: as peças translúcidas sobrepostas mostram faixas; um único material com `depthWrite` e
   ordem fixa deixaria mais liso.
5. **Figurantes** da vila continuam na versão leve (sem esqueleto); trocar pelo personagem completo se o tempo de
   render permitir.
6. **O que o Claude faz depois**: conferir catálogos e folhas, atualizar `ROTEIROS.md`, os `series.md` e o
   `validar_roteiros.py` (exigir `visual:3d` + `cena` + `elenco`, aceitar só os 8 cenários acabados, ligar o
   `variedade.py`). **Eu NÃO mexi nesses arquivos.**
