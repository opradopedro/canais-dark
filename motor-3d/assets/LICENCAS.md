# Licenças dos modelos 3D

Todos os arquivos desta pasta são **CC0 (domínio público)**: podem ser usados em vídeos monetizados, sem crédito obrigatório.

| Pasta | Origem | Pack | Licença |
|---|---|---|---|
| `personagens/Mannequin_Medium.glb` | Kay Lousberg (kaylousberg.com), KayKit Character Animations 1.1 | boneco-manequim do rig `Rig_Medium` | CC0 |
| `animacoes/Rig_Medium_*.glb` | KayKit Character Animations 1.1 | ~130 animações (andar, correr, cair, sentar, deitar, acenar, pegar, morrer, rastejar, agachar…) para o `Rig_Medium` | CC0 |
| `natureza/` | Quaternius | Ultimate Nature Pack + Simple Nature Pack (`Simple_*`) | CC0 |
| `rua/` | Quaternius | Modular Streets (ruas, postes, semáforo, placas) | CC0 |
| `casas/` | Quaternius | Ultimate Textured Buildings + Buildings Pack | CC0 |
| `vila/` | Quaternius | Medieval Village Pack (casas, moinho, poço, taverna, ferreiro, sino) | CC0 |
| `interior/` | Quaternius | Ultimate House Interior (camas, sofás, cozinha, portas, janelas, luzes) | CC0 |
| `animais/` | Quaternius | Ultimate Animated Animals (lobo, cavalo, cervo, husky, vaca, raposa, burro) com animações | CC0 |
| `criaturas/` | Quaternius | Easy Enemy Pack (aranha, rato, cobra) com animações | CC0 |
| `objetos/` | Quaternius | Survival Pack (rádio, celular, tocha, machado, pá, fogueira, barraca, lanterna, sinalizador…) | CC0 |

Fontes de onde foram copiados (10/11/2026): github.com/trebeljahr/quaternius-showcase (pasta public/glb, lista de licenças em LICENSES.md) e github.com/NoLimitNexus/game-models (só os arquivos KayKit; a pasta `library/ours` deles NÃO foi copiada, não tem licença livre).
Sites oficiais: https://quaternius.com e https://kaylousberg.itch.io/character-animations

`catalogo.json` lista cada arquivo com tamanho e nomes das animações.

## Biblioteca e fonte (motor 3D)

| Pasta | O que é | Origem | Licença |
|---|---|---|---|
| `../vendor/three/` | Three.js 0.170 (build + addons: GLTFLoader, SkeletonUtils, BufferGeometryUtils, EffectComposer, RenderPass, ShaderPass, MaskPass, UnrealBloomPass, OutputPass, shaders) | three.js (unpkg.com/three@0.170.0) | MIT |
| `../fontes/Fredoka.ttf` | fonte da legenda (arredondada grossa), variável wght/wdth | Google Fonts (ofl/fredoka) | OFL 1.1 (ver `../fontes/OFL.txt`) |

MIT e OFL permitem uso comercial sem royalty. A cópia local evita qualquer download na hora do render (custo zero).
