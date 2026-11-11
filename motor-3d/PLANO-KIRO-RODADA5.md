# motor-3d, rodada 5: últimos ajustes antes de ir ao ar (pedido para o Kiro)

Conferido pelo Claude em 11/11/2026 na rodada 4.

**Ficou bom:** os 8 cenários acabados (bairro, estrada, casa, hospital e cemitério principalmente) já estão no nível do Reel. Corpo sem buracos, criatura alta reconhecível, vulto, Cadejo, lobisomem e espantalho ok.

**O que ainda impede de publicar:**
1. **Rosto com "máscara de bandido"**: no personagem de pele clara aparece uma FAIXA PRETA de orelha a orelha na altura dos olhos (HM "juegan", "noche", "Quedate", "y", "lo"). É o cabelo/boné/barba descendo ou o fundo do plano do rosto pintado de preto. O rosto tem que ficar sobre a PELE: só olhos, sobrancelhas e boca desenhados, fundo transparente. Cabelo e boné acima da sobrancelha; barba só abaixo da boca.
2. **Pose agachada**: todos os personagens e criaturas humanoides ficam de joelho dobrado e quadril baixo mesmo parados (catálogo de criaturas e HM "creia"). Em `Idle_A` a perna tem que ficar quase reta. Provável causa: comprimento da coxa/canela calculado com os ossos fora da pose de repouso, ou o quadril (`hips`) recebendo deslocamento de altura errado. Conferir com o personagem parado ao lado de uma porta de 2 m.
3. **Plano aéreo só de telhado**: no HM, 4 de 18 quadros mostram só o telhado de uma casa visto de cima ("blanca", "barrio", "lluvia"). `aereo` precisa mostrar a rua inteira com várias casas e postes (como o último plano do Reel), câmera mais alta e mais longe, não em cima de uma casa só. No máximo 1 aéreo a cada 6 cortes.
4. **Criatura alta**: braços longos caindo junto ao corpo quando parada (não abertos em V). Pode balançar de leve.
5. **Fantasma**: sem faixas de sobreposição (use `depthWrite: false` + uma malha única ou renderOrder), corpo humano liso translúcido.
6. **Mãos de bolinha** grandes demais nos braços finos: reduzir a ~1,3x a grossura do antebraço.

> Repositório canais-dark, branch `producao` (`git pull origin producao` antes). Leia `motor-3d/PLANO-KIRO-RODADA5.md` e faça os 6 itens acima. Não mexa em `ROTEIROS.md`, `validar_roteiros.py`, `series.md` nem `stories/`. Re-gere `catalogo_personagens.jpg`, `catalogo_criaturas.jpg`, `catalogo_poses.jpg`, as 3 folhas e a amostra SV de 20 s. Some ao fiscal: aéreo seguido de aéreo reprova; mais de 1 aéreo a cada 6 cortes reprova. Atualize o `FALTA.md`, commits pequenos, push no `producao`.

## Depois (Claude)
Se a rodada 5 resolver esses 6 itens, o motor está pronto: o Claude atualiza `ROTEIROS.md`, os `series.md` dos 3 canais e o `validar_roteiros.py` (com o `variedade.py`) e a próxima série nova de cada canal já sai em 3D.
