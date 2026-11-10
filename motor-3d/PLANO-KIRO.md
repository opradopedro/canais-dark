# Motor 3D (estilo do Reel) para Signal Lost, Old Tales e Hora Muerta: plano + pedido do Kiro

Referência: Reel do @joaoexplicai "a linha branca" (98 s). Vídeo e quadros: pasta `referencias/estilo-3d-reel/` (Pedro coloca o `referencia.mp4` lá; os quadros estão em `/mnt/project-files/estilo-3d-reel/`).

## 1. O que o vídeo faz

**Visual**
- 3D low-poly estilizado, cara de jogo indie. Nada realista.
- Personagens "manequim": cabeça redonda lisa, corpo simples, camiseta e calça de cor única. Rosto é um DESENHO 2D (olhos ovais pretos, sobrancelhas, boca) que troca de expressão.
- Cenários de peças simples: pinheiros, casas com telhado colorido, postes com luz quente, asfalto com faixa amarela, gramado verde forte, carro, canteiro de flores.
- Criatura: silhueta gigante e fina, braços compridos, olhos amarelos que brilham. Aparece entre as árvores.
- Luz: dia ensolarado com sombra dura; noite azul-marinho com estrelas, cone de luz dos postes, lanterna na mão. Chuva com gotas e anéis no chão.
- Câmera: corte a cada 2 a 3 s; plano aéreo, médio, close no rosto, câmera baixa olhando a criatura de baixo. Sempre com travelling lento, nunca parada.
- Legenda: UMA palavra por vez no centro, fonte arredondada grossa branca com contorno preto, palavra-chave em amarelo.

**Narrativa (copiar o jeito de contar, não o tema)**
1. Gancho com o mistério em 1 frase ("Imagine viver numa cidade cercada por uma linha branca…").
2. Regra estranha que todo mundo obedece sem saber por quê.
3. Dia normal (contraste) → "Mas quando a noite chega…".
4. Personagem cético que acha ridículo e resolve testar.
5. Pedido de seguir no meio ("…porque agora vem a parte assustadora").
6. Escalada: barulho, silhueta, criatura, fuga, tropeço.
7. Virada: a regra funciona.
8. Gancho final: a regra está acabando ("a chuva está apagando a linha… o que acontece quando ela sumir?").
9. A última frase volta para a primeira (loop do Short).
- 3ª pessoa, presente, frases curtas, ~1min30 por parte.

**Por canal**
- **Signal Lost** (inglês): suspense/sobrevivência. Noite, floresta, estrada, rádio, torre, bunker.
- **Hora Muerta** (espanhol): lendas latino-americanas e regras de terror. Bairro, panteón, casa velha, estrada de terra; criaturas (Silbón, Llorona, Cadejo…) feitas com o manequim esticado/escurecido + olhos brilhando. Susto no fim é permitido; NENHUM som depois da narração.
- **Old Tales** (inglês): contos diversos (dia a dia, soldados, mitos). Vila medieval, campo, moinho, castelo; luz quente de dia e de entardecer, menos criatura.

## 2. Abordagem

**Three.js em código, renderizado no Chromium headless do GitHub Actions (como o So You Built It). Custo zero.**

- **Modelos prontos CC0 já estão no repositório**: `motor-3d/assets/` (322 arquivos, 29 MB). Licenças em `assets/LICENCAS.md`, lista com animações em `assets/catalogo.json`.
  - `personagens/Mannequin_Medium.glb` + `animacoes/Rig_Medium_*.glb` (KayKit, ~130 animações: Idle_A/B, Walking_A/B/C, Running_A/B, Sneaking, Crouching, Crawling, Walking_Backwards, Dodge_*, Hit_A/B, Death_A/B, PickUp, Interact, Use_Item, Throw, Sit_Chair_*, Sit_Floor_*, Lie_*, Waving, Cheering, Holding_A/B/C, Lockpicking, Digging, Chopping, Skeletons_* (bom para criatura)…).
  - Quaternius: `natureza/` (pinheiros, árvores, árvores mortas, salgueiros, arbustos, pedras, tocos, troncos, flores), `rua/` (ruas, postes, semáforos), `casas/`, `vila/` (medieval), `interior/` (123 móveis), `animais/` (lobo, cavalo, cervo… com animações), `criaturas/` (aranha, rato, cobra), `objetos/` (rádio, celular, tocha, machado, pá, fogueira, barraca, sinalizador…).
  - Faltam (o Kiro faz em código com primitivas): carro, cerca de madeira, túmulo/cruz, vela, lanterna de mão, poste de luz de bairro simples, chuva, neblina.
- **Prova já feita** (`testes/prova-assets.html` e `.jpg`): os .glb carregam no Three.js 0.170 com GLTFLoader, as animações KayKit tocam no manequim via SkeletonUtils.clone + AnimationMixer, bloom funciona no swiftshader. Problemas que a prova mostrou e o Kiro precisa resolver:
  1. **Escala**: o manequim veio muito maior que as árvores/casas. Normalizar cada modelo com `Box3` para altura real (pessoa 1,7 m, pinheiro 6 a 10 m, casa ~5 m).
  2. **Rosto 2D**: o plano com a CanvasTexture ficou na lateral da cabeça. Prender no osso `head`, achar a frente certa (+Z ou -Z do osso) e ajustar tamanho. Rosto com `depthTest` normal e um leve deslocamento para não piscar.
  3. Avisos `handslotl/handslotr` no console são inofensivos (o manequim não tem esses ossos); para segurar lanterna, prender o objeto no osso `hand.r`.
  4. Os discos nas juntas do manequim KayKit dão cara de robô. Testar: material liso branco-acinzentado `roughness 0.8` costuma bastar. Se ainda ficar robótico, criar em código um corpo de cápsulas com os MESMOS nomes de ossos (`hips, spine, chest, head, upperarm.l…`) para reaproveitar as animações.

Por que não as outras opções: vídeo de IA (Veo, Kling) muda a cara do personagem a cada plano e estoura os US$ 20/mês; Blender no Actions renderiza devagar sem placa de vídeo.

## 3. Pedido para o Kiro (colar inteiro)

> Projeto: repositório canais-dark, branch `producao` (nunca main). Faça `git pull origin producao` antes de começar.
>
> Leia nesta ordem: `motor-3d/PLANO-KIRO.md` (este arquivo, seções 1 e 2), `motor-3d/assets/LICENCAS.md`, `motor-3d/assets/catalogo.json`, `motor-3d/testes/prova-assets.html` (prova que já funciona), `hora-muerta/scripts/render.py`, `hora-muerta/scripts/engine.html` (só a parte de legenda e o contrato `setup(h)` / `render(t)`), `hora-muerta/scripts/comum.py`, `ROTEIROS.md`, `ESTILO-VISUAL.md` e um roteiro de cada canal: `signal-lost/stories/026-tower-six-3.json`, `old-tales/stories/030-ten-suns-3.json`, o último de `hora-muerta/stories/`. Assista `referencias/estilo-3d-reel/referencia.mp4`.
>
> Objetivo: criar `motor-3d/engine.html` (Three.js 0.170 em módulo, com GLTFLoader, SkeletonUtils, EffectComposer + UnrealBloomPass), que os 3 canais (Signal Lost, Old Tales, Hora Muerta) usam quando o roteiro tem `"visual": "3d"`. Mesmo contrato do engine atual: `setup(h)` recebe o roteiro já com os tempos, `render(t)` desenha o quadro do segundo `t` de forma DETERMINÍSTICA (nada de relógio nem Math.random sem semente: animação pelo tempo `t`, `mixer.setTime`). Use SÓ os modelos de `motor-3d/assets/` e primitivas em código. Nada de API paga nem download na hora do render; copie os arquivos do three 0.170 que precisar para `motor-3d/vendor/three/` (build/three.module.js e os addons usados).
>
> Etapa 1, kit (`motor-3d/kit/`):
> - `modelos.js`: carrega e guarda em cache os .glb, normaliza a escala pela altura real (pessoa 1,7 m, criança 1,2 m, pinheiro 6 a 10 m, casa ~5 m), liga sombra.
> - `personagem.js`: `pessoa({id, altura, pele, camisa, calca, cabelo:'curto'|'longo'|'careca'|'coque', chapeu})` a partir do `Mannequin_Medium.glb` com as animações de `animacoes/` (nomes no catálogo). Cabelo e chapéu em primitivas presas no osso `head`. Rosto 2D em CanvasTexture preso no osso `head`, de frente, com expressões `neutro, sorriso, medo, susto, desconfiado, triste, bravo, olhos_fechados`; trocar expressão por comando. Objeto na mão preso em `hand.r` (lanterna com SpotLight, tocha, rádio, celular com tela acesa).
> - `criatura.js`: `alta` (manequim esticado 3 a 4x na vertical, preto-marrom, braços longos, animação `Skeletons_Walking`), `vulto` (silhueta preta parada), `rastejante` (manequim com `Crawling`), `animal` (lobo/cachorro dos `animais/` escurecido). Olhos que brilham via bloom (cor > 1).
> - `luz.js`: presets `dia`, `entardecer`, `noite`, `noite_neblina`, `madrugada`, `interior_noite` (lâmpada amarela), `chuva` (gotas + anéis no chão), `fogueira` (luz tremendo pelo `t`). Céu com estrelas à noite.
> - `cenarios/`: `bairro` (rua com faixa, calçada, casas, postes acesos, floresta em volta), `floresta`, `estrada` (estrada de terra/asfalto no meio do mato), `casa_interior` (sala/cozinha/quarto com móveis do `interior/`), `cemiterio` (cruzes e túmulos em primitiva, árvores mortas, cerca), `vila` (medieval: casas, poço, moinho, taverna, mercado), `campo` (trigo, cerca, celeiro), `acampamento` (barraca, fogueira, floresta), `torre` (torre de vigia de madeira na floresta). Cada cenário com 6 ou mais "marcas" nomeadas (posição de ator + posição de câmera sugerida).
> - `camera.js`: planos `aereo, aberto, medio, close, baixo, ombro, pov, nuca` com travelling lento automático (dolly/orbit pequeno, nunca parada) e `tremor` opcional para susto.
>
> Etapa 2, roteiro → vídeo:
> - Roteiro com `"visual": "3d"` e, em cada linha, um campo `cena`, por exemplo: `{"cenario":"bairro","marca":"linha","plano":"medio","luz":"noite","efeito":"chuva","atores":[{"id":"garoto","acao":"Walking_A","rosto":"medo","de":"rua","para":"linha","segura":"lanterna"}],"criatura":{"tipo":"alta","marca":"arvores"}}`. Atores são declarados uma vez no topo do roteiro (`"elenco": {"garoto": {...pessoa}}`) e reaparecem iguais em todas as cenas.
> - Dentro de uma mesma linha, trocar de plano a cada 2 a 3 s sozinho (sequência aberto → médio → close etc., sem repetir o mesmo plano duas vezes seguidas).
> - Legenda: UMA palavra por vez no centro da tela (zona segura do Shorts), fonte arredondada grossa ("Fredoka" ou "Baloo 2", arquivo .ttf salvo em `motor-3d/fontes/`), branca com contorno preto; palavras com *asteriscos* no texto ficam amarelas. Tempo da legenda pelo alinhamento do áudio que o pipeline já gera (`motor-en/sincronia.py`), nunca antes da voz.
> - Ligação: em `hora-muerta/scripts/render.py`, se o roteiro tiver `"visual": "3d"`, subir um servidor http local (python `http.server` numa porta livre, em thread) servindo a raiz `motor-3d/`, abrir `http://localhost:PORTA/engine.html` em vez do `engine.html` atual e esperar todos os .glb carregarem antes do primeiro quadro. Roteiros sem `"visual": "3d"` continuam exatamente como hoje. Não mexer em nada do So You Built It.
> - 1080x1920, 30 fps. Meça o tempo de render de 1 minuto de vídeo no seu PC e escreva no `motor-3d/README.md`; se passar de 25 min por vídeo no Actions, reduza sombras (mapSize 1024) e o número de árvores visíveis.
>
> Etapa 3, testes (só local, NÃO subir para o YouTube, fora de `stories/`):
> - `motor-3d/testes/SV-3d-exemplo.json` (suspense, inglês, ~90 s, no jeito de contar do Reel), `motor-3d/testes/HM-3d-exemplo.json` (lenda latina, espanhol, ~90 s), `motor-3d/testes/CL-3d-exemplo.json` (conto calmo numa vila antiga, inglês, ~90 s). Use áudio de teste qualquer ou silêncio com tempos fixos.
> - Renderize os três, salve 6 quadros de cada em `motor-3d/testes/saida/` (jpg) e o MP4 completo fora do git.
>
> Regras: custo zero, só os modelos CC0 da pasta (se baixar mais algum, tem que ser CC0 e entrar no `LICENCAS.md`), commits pequenos com mensagem clara em português, push no branch `producao`. Se o tempo acabar, termine a Etapa 1 inteira e liste o que falta em `motor-3d/FALTA.md`. Não altere `ROTEIROS.md`, `validar_roteiros.py` nem os `series.md`: isso o Claude faz depois de conferir os testes.

## 4. Depois que o Kiro terminar (Claude, sessão curta)
- Conferir os quadros de teste e ajustar o que estiver feio.
- Atualizar `ROTEIROS.md`, os `series.md` dos 3 canais e o `validar_roteiros.py` (exigir `"visual":"3d"` + `cena` + `elenco` a partir de um código novo de cada canal).
- Séries já começadas terminam no estilo atual; séries novas já saem em 3D.
