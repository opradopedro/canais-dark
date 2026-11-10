# motor-3d, rodada 3: personagem, criatura e enquadramento (pedido para o Kiro)

Conferido pelo Claude em 10/11/2026 nas folhas `testes/saida/*_folha.jpg` da rodada 2.

**Melhorou muito:** a noite ficou legível, os rostos aparecem, o fiscal passa e quase não há mais quadro preto.

**Ainda não dá para publicar.** O que mais afasta do Reel:
1. **O personagem parece um robô de armadura.** O manequim KayKit tem discos nas juntas, peito com placas e uma cabeça QUADRADA gigante (chibi). No Reel o boneco é liso, com cabeça REDONDA (bola), proporção quase normal (cabeça ~1,3x a real), camiseta e calça jeans de cor chapada e tênis.
2. **Rosto pequeno e baixo**: os olhos ficam no terço de baixo da cabeça e são minúsculos. No Reel os olhos ficam no meio da bola, grandes (ovais pretos), com sobrancelhas grossas e boca que se lê de longe.
3. **A criatura não é a criatura**: aparece como manequim preto baixinho de braços em T e olhos vermelhos. Tem que ser ALTA (3 a 4 m), MAGRA, braços que passam do joelho, olhos AMARELOS brilhando, de preferência vista de baixo ou de longe entre as árvores.
4. **Enquadramento**: ainda há quadros com tronco de árvore tapando tudo (SV e HM, "the/had", "sombra/solo"), quadro de nuca sem motivo, close demais da cabeçona em sequência, e quadros iguais em pares (câmera parada entre cortes). No Old Tales, os aldeões de fundo são cápsulas azuis (parecem peões de tabuleiro) e o plano aberto mostra chão marrom vazio com um poço minúsculo.

## Pedido (colar inteiro no Kiro)

> Repositório canais-dark, branch `producao` (`git pull origin producao` antes). Leia `motor-3d/PLANO-KIRO-RODADA3.md` (este arquivo) e compare o tempo todo com os quadros do Reel em `referencias/estilo-3d-reel/`. Não mexa em `ROTEIROS.md`, `validar_roteiros.py`, `series.md` nem `stories/`.
>
> 1. **Personagem novo em código** (`kit/personagem.js`): continue usando o esqueleto e as animações do `Mannequin_Medium.glb`, mas ESCONDA as malhas dele e monte o corpo com peças lisas presas nos ossos (sem skin): cabeça = esfera (raio ~0,15 m, levemente achatada), pescoço curto, tronco = caixa arredondada com a cor da camiseta, braços e antebraços = cápsulas (cor da camiseta na parte de cima se for manga curta, pele no resto), mãos = esferas pequenas, coxas e canelas = cápsulas cor da calça, tênis = caixa arredondada branca/preta. Altura total ~1,7 m (criança 1,2 m) e cabeça proporcional (1,3x a real, não chibi). Material liso `roughness 0.75`, sem textura. Lembre que o Three.js tira o ponto dos nomes dos ossos (`upperarml`, `lowerarml`, `handr`…). Opções de cabelo (`curto`, `longo`, `careca`, `coque`, `cacheado`) e chapéu continuam em primitivas.
> 2. **Rosto do Reel**: na frente da bola, centralizado na ALTURA DO MEIO da cabeça; olhos ovais pretos grandes (cada um ~18% da largura da cabeça) com um pontinho de brilho branco, sobrancelhas grossas, boca simples. As 8 expressões continuam. O rosto acompanha a curvatura (pode ser um decal em esfera ou um plano levemente na frente).
> 3. **Criatura `alta` de verdade** (`kit/criatura.js`): também em peças presas nos ossos do mesmo esqueleto: tronco fino e comprido, braços em cápsulas finas 2x mais longas que o normal (passam do joelho), pernas compridas, cabeça pequena, cor marrom-escuro quase preta, olhos AMARELOS (cor > 1 para o bloom) e só os olhos brilham. Altura 3,5 m. Animação lenta (`Walking_A` com `timeScale` 0,5, ou `Skeletons_Walking`). Nada de braço em T: se a pose de repouso ficar em T, use `Idle_A` ou `Skeletons_Idle`.
> 4. **Aldeões e figurantes**: troque as cápsulas azuis pelo mesmo personagem do item 1 com cores variadas e animações `Idle_A/B`, `Walking_B`, `Working_A`.
> 5. **Enquadramento** (`kit/camera.js` + engine):
>    - Cada corte muda de verdade (posição E ângulo); o travelling dentro do trecho tem que ser visível (2 quadros com 2,5 s de diferença nunca podem sair idênticos).
>    - No máximo 2 closes seguidos; depois um plano que mostre o lugar.
>    - Se o raycast acusar árvore/tronco entre câmera e alvo, a árvore SOME naquele trecho (não basta orbitar). Proibido quadro com tronco ocupando > 25% da tela.
>    - `nuca`/`ombro` só quando o roteiro pedir, ou quando o personagem olha para algo que aparece no fundo.
>    - Plano da criatura: `baixo` com a criatura inteira (pés ao topo da cabeça) dentro do quadro, ou `aberto` com ela entre as árvores ao fundo e o personagem em primeiro plano (como no Reel).
>    - Old Tales: `aberto`/`aereo` sempre com casas grandes na tela e pessoas reconhecíveis; poço, barraca e carroça perto da câmera, não minúsculos no meio do chão.
> 6. **Fiscal** (`testes/conferir_quadros.py`): some 3 testes novos: (a) dois quadros seguidos com diferença média < 2% reprovam; (b) objeto que não é ator/criatura ocupando > 25% da tela reprova; (c) em plano de criatura, a silhueta da criatura tem que ocupar > 8% da tela.
> 7. Re-renderize os 3 testes, gere as folhas de contato novas e também UM MP4 de 20 s do SV (`testes/saida/SV-3d_amostra.mp4`, até 8 MB, pode ser com crf alto) para dar para ver o movimento. Atualize o `FALTA.md`. Commits pequenos, push no `producao`.
