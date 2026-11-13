# Plano de mundos, peças e roteiros (trabalho em lote)

Lista de trabalho que o Kiro ou o Claude seguem, um item por vez, de cima para baixo. Cada item cria o cenário
(mundo 3D ou peça) E um roteiro de verdade que o usa, para a fila dos canais encher. Status: PENDENTE, FAZENDO
(com quem e quando), FEITO. Regras: `ROTEIROS.md` e `MUNDOS.md`. Itens 19+ seguem o `ESTILO-VISUAL.md` (visual flat, prioridade do Pedro em 01/11: fazer antes dos itens 9-18). Prévia sempre na nuvem (`.github/previa.txt`).
Nada aqui gasta narração: o GitHub Actions narra e posta depois, sozinho.

| # | Status | Canal | Cenário novo | Roteiro |
|---|---|---|---|---|
| 1 | FEITO (kiro, 29/10) | So You Built It | mundo `controle` (controle remoto em corte, LED infravermelho piscando pulsos, sensor da TV, câmera do celular que mostra a luz) | YB017 Curiosidade "How a TV remote talks to the TV" (temas.md, nota 18) |
| 2 | FEITO (kiro, 29/10) | So You Built It | mundo `poco` (terreno em corte tipo `fossa`: buraco, desmorona, revestimento, bomba manual, bomba elétrica, filtro, lençol) | YB018 Evolucao "You built a water well" |
| 3 | FEITO (kiro, 29/10) | Hora Muerta | peças só se precisar (prefira as existentes) | HM013-HM014 série nova de lenda latina (ver temas.md do HM; espanhol; mesmo formato das séries 001-012) |
| 4 | FEITO (kiro, 29/10) | So You Built It | mundo `detector` (detector de fumaça em corte, câmara de ionização, amerício, corrente, fumaça corta, apita) | YB019 Curiosidade "How a smoke detector senses smoke" |
| 5 | FEITO (kiro, 29/10) | So You Built It | mundo `porao` (casa em corte com porão, pressão da água, dreno francês interno, poço com bomba de boia, válvula de retenção) | YB020 Evolucao "You built a basement. It flooded." |
| 6 | FEITO (kiro, 29/10) | Signal Lost | peça `metro` (vagão de metrô parado no túnel, luzes piscando, vagão da frente vazio pela porta de vidro) | SV005-SV008 série "Metrô parado no túnel" (temas.md) |
| 7 | FEITO (kiro, 29/10) | Old Tales | peças `salao` (salão do castelo, lareira enorme, mesa longa, tapeçarias) e `forja` (ferreiro, bigorna, faíscas) | CL004-CL006 série "You wake up as a squire in 1300" (fatos conferidos) |
| 8 | FEITO (kiro, 29/10) | So You Built It | mundo `panela` (panela de pressão em corte, água a ~120 °C, válvula de peso, vapor) | YB021 Curiosidade "How a pressure cooker cooks faster" |
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
| 19 | FEITO (claude, 01/11) | Hora Muerta | peças flat `f_panteon`, `f_pueblo` | HM021-HM022 "Las reglas del panteón" (1ª série flat; use como modelo) |
| 20 | FEITO em parte (claude, 01/11: `f_aldeia`, `f_casa` + série CL013-CL015 brewster); FALTA `f_moinho` | Old Tales | peças flat `f_aldeia`, `f_casa`, `f_moinho` | CL série nova no estilo flat (ex.: "You wake up as the miller's apprentice") |
| 21 | PENDENTE | Hora Muerta | peças flat `f_cocina`, `f_telefono`, `f_altar` | HM série nova no estilo flat |
| 22 | PENDENTE (`f_onibus` já feito em 01/11, usado em HM023-024) | Hora Muerta | peças flat `f_rio`, `f_cuarto`, `f_carretera` | HM série de lenda no estilo flat (Llorona/Siguanaba/Patasola) |
| 23 | PENDENTE | Old Tales | peças flat `f_mercado`, `f_castelo`, `f_campo`, `f_mosteiro` | CL série nova no estilo flat |
| 24 | PENDENTE | Signal Lost | peças flat `f_floresta` (trilha/torre de guarda no mato), `f_corredor` (corredor de prédio/hospital) com `"paleta": "sv"` | SV série nova no estilo flat (`f_posto` e `f_onibus` já existem) |

## Pacotes do Kiro (REPERTÓRIO GRANDE, pedido do Pedro em 02/11) — PRIORIDADE sobre a tabela de cima
Prompt pronto para colar no Kiro: **`KIRO-PROMPT.md`, seção A**. O que cada pacote tem: seção E do mesmo arquivo.
Cada pacote é um arquivo próprio em `hora-muerta/scripts/pecas/` (já criado e ligado no `engine.html`), então
vários agentes podem trabalhar ao mesmo tempo, um pacote cada. Faça 01, 02 e 03 primeiro. Os itens 20 a 24 da
tabela de cima estão dentro dos pacotes 08, 09, 10 e 12 (fazer lá, não aqui).

| Pacote | Status | Arquivo | O que tem |
|---|---|---|---|
| 01 | FEITO (kiro, 02/11) | `pecas/01-kit-efeitos.js` | efeitos e céus (chuva, neve, névoa, fogo, fumaça, flechas, céus, lua) |
| 02 | FEITO (kiro, 02/11) | `pecas/02-kit-figuras.js` | figuras de corpo inteiro (30 figurinos: hoplita, samurai, monge, hanfu...) e 20 animais |
| 03 | FEITO (kiro, 02/11) | `pecas/03-kit-objetos.js` | objetos, armas e veículos + peça `f_objeto` (close) |
| 04 | FEITO (kiro, 02/11) | `pecas/04-kit-grafismos.js` | grafismos: mapa, linha do tempo, título de época, duelo, ficha, contagem, regras |
| 05 | FEITO (kiro, 02/11) | `pecas/05-china-wukong.js` | China: Jornada ao Oeste (Wukong e companheiros, dragão, 9 cenários) |
| 06 | FEITO (kiro, 02/11) | `pecas/06-china-historica.js` | China antiga real (Chang'an, palácio, Grande Muralha, templo, arrozal, bambu, Lago Oeste) |
| 07 | FEITO (kiro, 02/11) | `pecas/07-grecia-esparta.js` | Grécia e Esparta (Esparta, agogê, syssitia, falange, Termópilas, templo, ágora, Egeu) |
| 08 | FEITO (kiro, 02/11) | `pecas/08-medieval.js` | medieval (moinho, mercado, castelo, campo, mosteiro, forja, igreja, taverna, cerco, porto, torneio) |
| 09 | FEITO (kiro, 02/11) | `pecas/09-hm-casa.js` | Hora Muerta casa (cocina, cuarto, altar, telefono, bano, azotea, vecindad, sala) |
| 10 | FEITO (kiro, 02/11) | `pecas/10-hm-lugares.js` | Hora Muerta lugares (rio, carretera, hacienda, iglesia, escuela, milpa, selva, puente, pozo, feria, cerro, estacion, panaderia) |
| 11 | FEITO (kiro, 02/11) | `pecas/11-hm-criaturas.js` | Hora Muerta criaturas (llorona, charro negro, cadejo, lechuza, duende, nahual, sombreron, siguanaba, tunda, patasola, mano peluda, nina muneca, monja) + `f_aparicion` |
| 12 | FEITO (kiro, 02/11) | `pecas/12-sv-lugares.js` | Signal Lost (floresta, corredor, elevador, motel, garagem, mercado, cabana, farol, névoa, lago gelado) |
| 13 | FEITO (kiro, 02/11) | `pecas/13-sv-lugares2.js` | Signal Lost 2 (bunker, shopping, rádio, avião, navio, deserto, estação polar, escritório, subúrbio, ilha) |
| 14 | FEITO (kiro, 02/11) | `pecas/14-roma.js` | Roma + paleta `roma` (rua, coliseu, acampamento, termas, forum, estrada, domus) |
| 15 | FEITO (kiro, 02/11) | `pecas/15-nordico.js` | nórdico + paleta `nordico` (fiorde, salão, aldeia, ataque, yggdrasil, bifrost, mar norte + Thor, Odin, Loki) |
| 16 | FEITO (kiro, 02/11) | `pecas/16-egito.js` | Egito + paleta `egito` (nilo, piramide, vila, tumba, templo, julgamento + Anúbis, Osiris, Rá) |
| 17 | FEITO (kiro, 02/11) | `pecas/17-japao.js` | Japão + paleta `japao` (castelo, vila, torii, dojo, mar, palacio dragao + Momotaro, Oni, Kitsune, Tanuki) |
| 18 | FEITO (kiro, 02/11) | `pecas/18-mitos-gregos.js` | mitos gregos (Olimpo, labirinto, ciclope, sereias, submundo, Ícaro, Troia + Zeus, Hades, Medusa, Minotauro, Ciclope) |
| 19 | FEITO (kiro, 02/11) | `pecas/19-china-mitos2.js` | mitos chineses 2 (10 sóis, palácio da lua, Nüwa, Pangu, ponte de pegas, Nezha, Mulan + Houyi, Chang'e, Nüwa, Nezha, Mulan, coelho de jade) |

## Como fazer um item (resumo)
1. `git pull origin producao`; marque o item como `FAZENDO (kiro|claude, data)` e envie.
2. Leia o `SKILL.md` do canal e um cenário parecido que já existe (copie a estrutura).
3. Escreva o cenário novo e o roteiro (um roteiro por vez nas séries; plano da série primeiro em `series.md`).
4. Fiscal: `python motor-en/validar_roteiros.py` = `ROTEIROS OK`.
5. Prévia na nuvem: caminho do roteiro em `.github/previa.txt`, commit, push. Espere uns 4 a 6 minutos e baixe os JPGs
   `<CODIGO>_previa_*.jpg` da Release `previas`. Olhe e conserte (no máximo 2 voltas).
6. Atualize `MUNDOS.md` (tabela), `temas.md` (`[x]`), `series.md`; marque o item `FEITO`; commit e push.

## Faltou na rotina de roteiros de 13/11 (claude)
- Old Tales / Perseu (CL046-CL048): não existe criatura górgona (mulher com cobras no cabelo). Usei `mulher_branca` na `caverna_gorgonas` com luz `tempestade`. Criatura nova sugerida: `gorgona` (cabelo de cobras animado, olhos que brilham) e `monstro_marinho` para o Ceto (usei `gigante_mitologico` na `ilha_mar`).
