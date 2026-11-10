# motor-3d — o que já está pronto e o que falta

Atualizado por Kiro em 10/11/2026. Branch `producao`.

## Pronto (Etapas 1, 2 e 3 do PLANO-KIRO.md)

- **Vendor e fonte**: `vendor/three/` (Three.js 0.170, MIT) e `fontes/Fredoka.ttf` (OFL), nos `LICENCAS.md`.
- **Kit** (`kit/`): `modelos.js`, `personagem.js`, `criatura.js`, `luz.js`, `camera.js`, `cenarios/index.js`.
  9 cenários com 6+ marcas cada. 8 planos de câmera com travelling + tremor.
- **engine.html**: `setup(h)`/`render(t)` determinístico, bloom, legenda uma palavra (Fredoka, amarelo p/ destaque).
- **Ligação**: `hora-muerta/scripts/render.py` sobe http local e abre o engine 3D quando o roteiro tem
  `"visual": "3d"`; `comum.py` (`resolver`) trata cenas 3D e o `elenco`. 2D e So You Built It intactos.
- **Testes**: `testes/SV-3d-exemplo.json`, `HM-3d-exemplo.json`, `CL-3d-exemplo.json` (~80–88 s) + os tempos fixos
  e 6 quadros de cada em `testes/saida/`. MP4 completo fica fora do git.
- **Tempo de render** medido e reduções aplicadas (ver README): sombra 1024, bloom meia-res, menos árvores.

## Falta / pontos a melhorar (para o Claude ou uma próxima sessão do Kiro)

1. **Ossos do braço da criatura "alta"**: os nomes `upperarm.l/.r` etc. podem não bater com o rig KayKit (o
   alongamento do braço pode não ter efeito). Conferir os nomes reais dos ossos e ajustar em `kit/criatura.js`.
2. **Luz da lanterna puxa para o verde** nas cenas de floresta à noite (o hemisférico tinge o facho). Se quiser
   o facho mais quente, subir a cor da `SpotLight` da lanterna em `kit/personagem.js` ou reduzir o hemi da `noite`.
3. **Cabeça do manequim grande** (estilo do Reel, mas chama atenção). Se quiser menor, escalar o osso `head`.
4. **Rosto 2D**: confirmar em close que o plano do rosto está exatamente de frente em todos os planos (testei
   `close`/`medio`; conferir `pov`/`nuca`). Ajuste fino em `kit/personagem.js` (`rostoMesh.position`).
5. **Animais como criatura**: só testei `alta`/`vulto`. Falta um teste visual de `animal` (lobo escurecido) e
   `rastejante` (Crawling).
6. **Mais objetos na mão**: hoje `lanterna`/`tocha`/`radio`/`celular`. Dá para somar `machado`, `pá`, `faca`
   (há `.glb` em `assets/objetos/`), prendendo em `hand.r`.
7. **Interiores**: `casa_interior` tem sala/cozinha/quarto; faltam variações (banheiro, só-quarto) se um roteiro pedir.
8. **O que o Claude faz depois** (seção 4 do PLANO-KIRO.md): conferir os quadros, atualizar `ROTEIROS.md`, os
   `series.md` dos 3 canais e `validar_roteiros.py` (exigir `visual:3d` + `cena` + `elenco`). **Eu NÃO mexi nesses.**
