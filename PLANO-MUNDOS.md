# Plano de mundos, peças e roteiros (trabalho em lote)

Lista de trabalho que o Kiro ou o Claude seguem, um item por vez, de cima para baixo. Cada item cria o cenário
(mundo 3D ou peça) E um roteiro de verdade que o usa, para a fila dos canais encher. Status: PENDENTE, FAZENDO
(com quem e quando), FEITO. Regras: `ROTEIROS.md` e `MUNDOS.md`. Prévia sempre na nuvem (`.github/previa.txt`).
Nada aqui gasta narração: o GitHub Actions narra e posta depois, sozinho.

| # | Status | Canal | Cenário novo | Roteiro |
|---|---|---|---|---|
| 1 | FAZENDO (kiro, 29/10 01h) | So You Built It | mundo `controle` (controle remoto em corte, LED infravermelho piscando pulsos, sensor da TV, câmera do celular que mostra a luz) | YB017 Curiosidade "How a TV remote talks to the TV" (temas.md, nota 18) |
| 2 | PENDENTE | So You Built It | mundo `poco` (terreno em corte tipo `fossa`: buraco, desmorona, revestimento, bomba manual, bomba elétrica, filtro, lençol) | YB018 Evolucao "You built a water well" |
| 3 | PENDENTE | Hora Muerta | peças só se precisar (prefira as existentes) | HM013-HM014 série nova de lenda latina (ver temas.md do HM; espanhol; mesmo formato das séries 001-012) |
| 4 | PENDENTE | So You Built It | mundo `detector` (detector de fumaça em corte, câmara de ionização, amerício, corrente, fumaça corta, apita) | YB019 Curiosidade "How a smoke detector senses smoke" |
| 5 | PENDENTE | So You Built It | mundo `porao` (casa em corte com porão, pressão da água, dreno francês interno, poço com bomba de boia, válvula de retenção) | YB020 Evolucao "You built a basement. It flooded." |
| 6 | PENDENTE | Signal Lost | peça `metro` (vagão de metrô parado no túnel, luzes piscando, vagão da frente vazio pela porta de vidro) | SV005-SV008 série "Metrô parado no túnel" (temas.md) |
| 7 | PENDENTE | Old Tales | peças `salao` (salão do castelo, lareira enorme, mesa longa, tapeçarias) e `forja` (ferreiro, bigorna, faíscas) | CL004-CL006 série "You wake up as a squire in 1300" (fatos conferidos) |
| 8 | PENDENTE | So You Built It | mundo `panela` (panela de pressão em corte, água a ~120 °C, válvula de peso, vapor) | YB021 Curiosidade "How a pressure cooker cooks faster" |
| 9 | PENDENTE | So You Built It | mundo `escada` (escada rolante em corte, degraus com 2 pares de rodas em 2 trilhos que se aproximam no topo) | YB022 Curiosidade "How escalator steps flatten at the top" |
| 10 | PENDENTE | Hora Muerta | peças só se precisar | HM015-HM016 segunda série nova |
| 11 | PENDENTE | So You Built It | mundo `arranhaceu` (prédio em solo mole, afunda, radier, estacas até a rocha, âncoras contra o lençol) | YB023 Evolucao "You built a skyscraper on soft ground" |
| 12 | PENDENTE | So You Built It | mundo `semaforo` (cruzamento, laço indutivo no asfalto, carro muda a indutância, moto não aciona) | YB024 Curiosidade "How a traffic light knows a car is waiting" |
| 13 | PENDENTE | Signal Lost | peça `torre` (torre de guarda florestal à noite, floresta, rádio com luz) | SV009-SV011 série "Posto de guarda florestal" |
| 14 | PENDENTE | Old Tales | peça `mosteiro` (scriptorium com monges copiando livros à luz de vela, janelas altas) | CL007-CL009 série "You wake up in a monastery in 1300" |
| 15 | PENDENTE | So You Built It | mundo `barragem` (vale com rio, monte de terra, transborda, núcleo de argila, vertedouro) | YB025 Evolucao "You built a dam" |
| 16 | PENDENTE | So You Built It | mundo `arrimo` (barranco, muro tomba, água atrás do muro, barbacã e brita, gabião) | YB026 Evolucao "You built a retaining wall" |
| 17 | PENDENTE | Signal Lost | peça `ilha` (praia de ilha pequena à noite, fogueira, mar, vulto na água) | SV012-SV014 série "Náufrago na ilha" |
| 18 | PENDENTE | So You Built It | mundo `escavadeira` (Bagger 288, roda de caçambas, esteiras de km) | YB027 Curiosidade "How a bucket-wheel excavator digs nonstop" |

## Como fazer um item (resumo)
1. `git pull origin producao`; marque o item como `FAZENDO (kiro|claude, data)` e envie.
2. Leia o `SKILL.md` do canal e um cenário parecido que já existe (copie a estrutura).
3. Escreva o cenário novo e o roteiro (um roteiro por vez nas séries; plano da série primeiro em `series.md`).
4. Fiscal: `python motor-en/validar_roteiros.py` = `ROTEIROS OK`.
5. Prévia na nuvem: caminho do roteiro em `.github/previa.txt`, commit, push. Espere uns 4 a 6 minutos e baixe os JPGs
   `<CODIGO>_previa_*.jpg` da Release `previas`. Olhe e conserte (no máximo 2 voltas).
6. Atualize `MUNDOS.md` (tabela), `temas.md` (`[x]`), `series.md`; marque o item `FEITO`; commit e push.
