# motor-3d

Motor de história 3D low-poly (estilo do Reel de referência) para **Signal Lost, Old Tales e Hora Muerta**.
Usado quando o roteiro tem `"visual": "3d"`. Plano completo e pedido do Kiro: `PLANO-KIRO.md`.

## Como funciona

Mesmo contrato do engine 2D dos canais: `setup(h)` recebe o roteiro já com os tempos, `render(t)` desenha o
quadro do segundo `t` de forma **determinística** (nada de relógio nem `Math.random` sem semente — animação por
`t` via `mixer.setTime`, chuva/fogueira por funções de `t`). O `hora-muerta/scripts/render.py` detecta
`"visual": "3d"`, sobe um `http.server` local (só `127.0.0.1`, porta livre) servindo esta pasta, abre
`engine.html` e espera `window.pronto` (todos os `.glb` carregados) antes do primeiro quadro. Roteiros sem
`"visual": "3d"` continuam no engine flat de sempre. O So You Built It não é tocado.

## Pastas

- `assets/`: 322 modelos CC0 (.glb). Licenças em `assets/LICENCAS.md`, lista com animações em `assets/catalogo.json`.
- `vendor/three/`: Three.js 0.170 (build + addons GLTFLoader, SkeletonUtils, EffectComposer, UnrealBloomPass…). MIT.
- `fontes/Fredoka.ttf`: fonte da legenda (arredondada grossa). OFL.
- `kit/`: as peças do motor —
  - `modelos.js`: carrega/cacheia os `.glb`, normaliza a escala pela altura real (pessoa 1,7 m, criança 1,2 m,
    pinheiro 6–10 m, casa ~5 m), liga sombra.
  - `personagem.js`: `pessoa({id, altura, pele, camisa, calca, cabelo, chapeu})` a partir do manequim KayKit, com
    rosto 2D (8 expressões), cabelo/chapéu em primitivas no osso `head`, objeto na mão `hand.r` (lanterna com
    SpotLight, tocha, rádio, celular).
  - `criatura.js`: `alta` (manequim esticado 3–4×), `vulto` (silhueta parada), `rastejante` (Crawling), `animal`
    (lobo/cachorro escurecido). Olhos que brilham via bloom (cor > 1).
  - `luz.js`: presets `dia, entardecer, noite, noite_neblina, madrugada, interior_noite, chuva, fogueira`; céu com
    estrelas à noite; chuva (gotas + anéis) e fogueira (luz tremendo) por `t`.
  - `cenarios/index.js`: `bairro, floresta, estrada, casa_interior, cemiterio, vila, campo, acampamento, torre`,
    cada um com 6+ marcas nomeadas (posição de ator + plano de câmera sugerido).
  - `camera.js`: planos `aereo, aberto, medio, close, baixo, ombro, pov, nuca` com travelling lento automático
    (nunca parada) e tremor opcional para susto; `planoAutomatico` troca de plano a cada ~2,5 s sem repetir.
- `engine.html`: junta tudo (`setup`/`render`), bloom, e a legenda (uma palavra no centro, Fredoka branca com
  contorno preto, amarelo para `*destaque*`), com o tempo de cada palavra vindo de `ST.segs[].w`
  (alinhamento forçado do `motor-en/sincronia.py` na produção).
- `testes/`: roteiros de exemplo + saída (ver abaixo). `prova-assets.html` é a prova original dos modelos.

## Roteiro 3D (resumo)

```json
{
  "visual": "3d",
  "elenco": { "garoto": { "altura": 1.7, "pele": "#d9a77f", "camisa": "#3f5a3a", "cabelo": "curto" } },
  "lineas": [ { "texto": "...", "pausa": 0.5 } ],
  "cenas": [
    { "linea": 0, "cena": {
        "cenario": "bairro", "marca": "linha", "plano": "medio", "luz": "noite", "efeito": "chuva",
        "atores": [ { "id": "garoto", "acao": "Walking_A", "rosto": "medo", "para": "linha", "segura": "lanterna" } ],
        "criatura": { "tipo": "alta", "marca": "arvores" }
    } }
  ],
  "destaque": [ "linha", "noite" ]
}
```

- O **elenco** é declarado uma vez no topo; cada ator reaparece igual em todas as cenas.
- `plano` pode ser um dos oito, ou `"auto"` (o motor corta sozinho a cada ~2,5 s: aberto → médio → close…).
- Palavra com `*asteriscos*` no texto (ou que esteja em `destaque`) sai **amarela** na legenda.

## Tempo de render (medido neste PC — CPU, sem placa de vídeo, swiftshader)

Medido em 10/11/2026, 1080×1920 a 30 fps, cena pesada (floresta à noite com chuva):
**~600 ms por quadro em regime** → **~18 min por minuto de vídeo**. A média sobe nas cenas de floresta+chuva e
cai nas de interior/torre. Um Short de ~90 s fica perto do limite de 25 min.

Para caber em < 25 min no GitHub Actions, já estão aplicadas as duas reduções do plano:
1. **Sombra `mapSize` 1024** (padrão em `luz.js`; só sobe para 2048 se um close pedir).
2. **Menos árvores visíveis**: `kit/cenarios/index.js` tem `_FATOR_ARVORES = 0.55` (corta ~45% das árvores em volta).
Além disso o **bloom roda em meia resolução** (540×960), o que corta ~1/3 do tempo sem perder o brilho.
Se ainda passar de 25 min num canal, baixe `_FATOR_ARVORES` (ex.: 0,4) ou reduza o nº de cenas de floresta/chuva.

## Rodar os testes locais

```bash
# 1) gera os tempos fixos (sem TTS: tempo de leitura fixo, só para a legenda sair palavra por palavra)
python motor-3d/testes/tempos_fixos.py motor-3d/testes/SV-3d-exemplo.json motor-3d/testes/SV-3d-tempos.json --ppm 105

# 2a) 6 quadros de conferência (rápido): salva JPGs ao lado do "video"
python hora-muerta/scripts/render.py motor-3d/testes/SV-3d-exemplo.json motor-3d/testes/SV-3d-tempos.json \
    motor-3d/testes/saida/SV-3d.mp4 --teste 7,22.8,38.6,54.4,70.2,83.4

# 2b) vídeo completo (lento, ~20 min): o MP4 fica FORA do git
python hora-muerta/scripts/render.py motor-3d/testes/SV-3d-exemplo.json motor-3d/testes/SV-3d-tempos.json \
    SAIDA_FORA_DO_GIT/SV-3d.mp4
```

Os 6 quadros de cada canal estão em `testes/saida/` (SV = Signal Lost, HM = Hora Muerta, CL = Old Tales). O MP4
completo não entra no git (`testes/saida/.gitignore` ignora `*.mp4`).
