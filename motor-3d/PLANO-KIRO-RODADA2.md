# motor-3d, rodada 2: deixar BONITO (pedido para o Kiro)

Conferido pelo Claude em 10/11/2026. A rodada 1 montou toda a estrutura certa (kit, 9 cenários, engine determinístico, legenda, ligação no render.py, testes). Nenhum roteiro de produção usa `"visual": "3d"` ainda, então nada quebrado foi ao ar.

**Mas o resultado ainda não serve para publicar.** Nos 18 quadros de `testes/saida/`:
- Em ~12 de 18 o personagem não aparece direito: câmera dentro ou atrás de árvore, mirando o chão ou o céu, ou mostrando só o topo da cabeça na borda de baixo. Nenhum rosto aparece de frente em nenhum quadro.
- A noite está quase preta: silhuetas pretas em fundo azul, sem chão visível. No Reel a noite é azul-marinho LEGÍVEL (chão verde-escuro visível, casas e postes iluminados).
- Old Tales: planos aéreos de chão marrom vazio com um poço minúsculo no meio, e um filtro laranja forte.
- A criatura nunca aparece inteira e reconhecível.

Compare lado a lado com `referencias/estilo-3d-reel/` (no PC: o `referencia.mp4`). Em TODO quadro do Reel dá para saber em 1 segundo quem está na tela, onde está e o que sente.

## Pedido (colar inteiro no Kiro)

> Repositório canais-dark, branch `producao` (`git pull origin producao` antes). Leia `motor-3d/PLANO-KIRO-RODADA2.md` (este arquivo) e `motor-3d/FALTA.md`. A estrutura da rodada 1 fica; esta rodada é só QUALIDADE VISUAL. Não mexa em `ROTEIROS.md`, `validar_roteiros.py`, `series.md` nem nos `stories/`.
>
> 1. **Câmera relativa ao ator** (`kit/camera.js`): hoje os planos usam offsets fixos em +Z do mundo e ignoram para onde o ator olha. Refaça `montar()` usando a POSIÇÃO e a ROTAÇÃO do ator: `close` e `medio` ficam NA FRENTE do rosto (direção para onde ele olha), `ombro`/`nuca` atrás, `baixo` na frente olhando para cima. A altura do alvo vem do osso `head` real do ator (`getWorldPosition`), não de um número fixo. Enquadramento: `close` = cabeça + ombros ocupando ~45% da altura da tela; `medio` = corpo inteiro ocupando ~60%; `aberto` = ator ~25% + cenário; `aereo` = cenário com o ator visível e pelo menos uma casa/estrada/marca reconhecível.
> 2. **Nada entre câmera e ator**: antes de cada quadro, faça um raycast da câmera até a cabeça do ator (e da criatura, se for o alvo). Se algo bloquear, esconda esse objeto naquele trecho OU gire a câmera em volta do ator (tente ±30°, ±60°) até ficar livre. A câmera também nunca pode ficar DENTRO de um objeto (teste a distância até a caixa de cada árvore/casa).
> 3. **Noite legível** (`kit/luz.js`): no preset `noite`, suba o hemisférico/ambiente para que chão, casas e árvores apareçam em azul-esverdeado escuro (média de brilho do quadro entre 55 e 90 numa escala 0–255, nunca abaixo de 45). Céu azul-marinho com degradê, não preto. Personagem sempre com uma luz de recorte (rim light) azulada para destacar do fundo. Postes e janelas acesos com cor quente. `entardecer` sem filtro laranja chapado: céu laranja-rosado, mas cores dos objetos preservadas.
> 4. **Rosto sempre visível**: em `close`/`medio`, o ator vira levemente para a câmera (máx. 35°) e o rosto 2D fica de frente; aumente o contraste (olhos e boca pretos bem marcados, tamanho como no Reel). Reduza a cabeça do manequim para ~80% (osso `head`).
> 5. **Criatura reconhecível**: `alta` deve aparecer INTEIRA em pelo menos um plano por cena (plano `baixo` ou `aberto`), recortada contra o céu ou contra uma luz, com olhos brilhando. Os ossos no .glb se chamam `upperarm.l`, `lowerarm.l`, `hand.l` (e `.r`), mas o GLTFLoader do Three.js TIRA O PONTO: no código viram `upperarml`, `lowerarml`, `handl`, `handr`. Provavelmente é por isso que o braço não estica (e confira também o `hand.r` da lanterna). Use os nomes sem ponto e faça os braços ficarem compridos de verdade.
> 6. **Old Tales**: tire o filtro laranja, use dia claro e entardecer bonito, aproxime o `aereo` (vila inteira visível, casas grandes na tela, não chão vazio), espalhe mais casas/barracas/cercas/pessoas na `vila` e no `campo`. Escala dos objetos da vila igual à da pessoa (porta da casa ~2 m, poço ~1,2 m de altura).
> 7. **Fiscal automático** `motor-3d/testes/conferir_quadros.py`: renderiza 1 quadro a cada 2,5 s de um roteiro e reprova se (a) brilho médio < 45, (b) o ator-alvo ocupa menos de 3% da tela nos planos `close`/`medio`/`baixo` (use uma passada de render com o ator pintado de cor única para medir), (c) algum objeto bloqueia o raycast câmera→cabeça. Escreve um relatório e uma folha de contato (`testes/saida/<nome>_folha.jpg`, 6x3 quadros pequenos). Só considere pronto quando os 3 testes (SV, HM, CL) passarem.
> 8. Re-renderize os 3 testes, troque as imagens de `testes/saida/` pelas novas folhas de contato e atualize o `FALTA.md`. Commits pequenos, push no `producao`.

## Depois (Claude)
Quando as folhas de contato estiverem boas: atualizar `ROTEIROS.md`, os `series.md` dos 3 canais e o `validar_roteiros.py` para `"visual":"3d"`, e escolher a primeira série nova de cada canal para sair em 3D.
