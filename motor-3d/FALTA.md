# motor-3d — o que já está pronto e o que falta

Atualizado por Kiro em 10/11/2026 (rodada 2 = qualidade visual). Branch `producao`.

## Pronto

### Rodada 1 — estrutura (Etapas 1, 2 e 3 do PLANO-KIRO.md)
- **Vendor e fonte**: `vendor/three/` (Three.js 0.170, MIT) e `fontes/Fredoka.ttf` (OFL), nos `LICENCAS.md`.
- **Kit** (`kit/`): `modelos.js`, `personagem.js`, `criatura.js`, `luz.js`, `camera.js`, `cenarios/index.js`.
  9 cenários com 6+ marcas cada. 8 planos de câmera.
- **engine.html**: `setup(h)`/`render(t)` determinístico, bloom, legenda uma palavra (Fredoka, amarelo p/ destaque).
- **Ligação**: `hora-muerta/scripts/render.py` sobe http local e abre o engine 3D quando o roteiro tem
  `"visual": "3d"`; `comum.py` (`resolver`) trata cenas 3D e o `elenco`. 2D e So You Built It intactos.
- **Testes**: `SV/HM/CL-3d-exemplo.json` (~80–88 s) + tempos fixos. MP4 completo fica fora do git.

### Rodada 2 — qualidade visual (PLANO-KIRO-RODADA2.md)
- **Câmera relativa ao ator**: `close`/`medio` na frente do rosto, `ombro`/`nuca` atrás, `baixo` de baixo p/ cima.
  A altura do alvo vem do osso `head`/do plano do rosto real (`getWorldPosition`). Enquadramento calculado pelo
  fov (close ≈ cabeça+ombros; medio ≈ corpo; aberto ≈ ator 25%+cenário; aereo ≈ vila/rua + horizonte).
- **Nada entre câmera e ator**: raycast câmera→cabeça; se bloqueado, a câmera orbita (±30/60/90°) e, em último
  caso, o engine **esconde o objeto que bloqueia** só naquele quadro. Teste de câmera dentro do núcleo de árvore/casa.
- **Noite legível**: céu em degradê (domo), hemisférico+ambiente altos, **rim light azulada** atrás do ator.
  Postes/janelas quentes. `entardecer` sem filtro laranja (céu laranja-rosado, cores dos objetos preservadas).
- **Rosto sempre de frente**: em `close`/`medio` o ator vira até 35° p/ a câmera; rosto 2D com `depthTest` off
  (nunca some dentro da cabeça), olhos/boca pretos grandes com brilho. Cabeça do manequim reduzida a 80%.
- **Criatura reconhecível**: `alta` aparece inteira no plano `baixo`/`aberto`, recortada contra o céu pela rim
  light, olhos brilhando. Braços compridos de verdade (ossos **sem ponto**: `upperarml/r`, `lowerarml/r`).
- **Old Tales**: dia claro e entardecer bonito; `aereo` mais perto; `vila`/`campo` com mais casas, barracas,
  cercas, carroças e aldeões de fundo; poço ~1,2 m, portas ~2 m.
- **Fiscal** `testes/conferir_quadros.py`: 1 quadro a cada 2,5 s; reprova se brilho médio < 45, se o ator ocupa
  < 3% em close/medio/baixo (passada de silhueta magenta), ou se há objeto no raycast. Gera relatório +
  folha de contato 6×3. **Os 3 testes (SV, HM, CL) passam** (`*_folha.jpg` + `*_relatorio.txt` em `testes/saida/`).

## Falta / pontos a melhorar (para o Claude ou uma próxima sessão do Kiro)

1. **Rosto meio baixo na cabeça**: os olhos ficam no terço de baixo do cabeção. Dá para subir mais em
   `kit/personagem.js` (`rostoMesh.position.y` e as coordenadas dos olhos em `desenharRosto`).
2. **A legenda cobre os olhos no close** (ambos ficam no centro da tela). Se incomodar, descer a legenda para
   ~62% em `engine.html` (`desenharLegenda`, `yc`) OU subir levemente o alvo do close.
3. **Luz da lanterna** puxa um pouco para o verde pela luz ambiente da noite; se quiser mais quente, subir a cor
   da `SpotLight` em `kit/personagem.js`.
4. **`animal` e `rastejante`** (criaturas) só têm teste indireto; falta uma cena de exemplo com lobo/rastejante.
5. **Tempo de render**: a rim light e o ambiente extra pesam pouco; o custo segue dominado por floresta+chuva.
   Se algum canal passar de 25 min no Actions, baixar `_FATOR_ARVORES` em `kit/cenarios/index.js`.
6. **O que o Claude faz depois** (seção 4 do PLANO-KIRO.md e "Depois" do RODADA2): conferir as folhas de contato,
   atualizar `ROTEIROS.md`, os `series.md` dos 3 canais e `validar_roteiros.py` (exigir `visual:3d` + `cena` +
   `elenco`) e escolher a 1ª série nova de cada canal p/ sair em 3D. **Eu NÃO mexi nesses.**
