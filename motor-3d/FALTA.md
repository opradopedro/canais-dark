# motor-3d — o que já está pronto e o que falta

Atualizado por Kiro em 10/11/2026 (rodada 3). Branch `producao`.

## Pronto

### Rodada 1 — estrutura
Vendor three 0.170, fonte Fredoka, kit (modelos/personagem/criatura/luz/camera/cenarios), engine determinístico,
legenda, ligação no `render.py` (`"visual":"3d"` sobe http local). 2D e So You Built It intactos.

### Rodada 2 — câmera e luz
Câmera relativa ao ator, noite legível, rosto de frente, `entardecer` sem filtro laranja. Fiscal com brilho,
cobertura do ator e raycast.

### Rodada 3 — personagem, criatura, variedade
- **Personagem liso em código** (`kit/personagem.js`): malhas do manequim escondidas; corpo em peças presas aos
  ossos (bola na cabeça, tronco, braços/pernas em cápsulas, tênis). Rosto do Reel em 3 estilos (oval, redondo,
  traço) + 8 expressões, olhos grandes pretos com brilho. **Gerador por semente**: tipo de corpo (magro, médio,
  forte, gordo, idoso, criança), 8 tons de pele, 8 cabelos, 13 roupas (incl. uniformes, medieval, túnica, chinês),
  acessórios (óculos, boné, chapéu de palha, gorro, mochila, avental). `pessoa({semente:17})` sai tudo sozinho.
- **13 criaturas** (`kit/criatura.js`), montadas em peças/modelos: `alta` (3,5 m magra, braços longos, olhos
  amarelos), `sem_rosto`, `cao_negro`, `mulher_branca`, `vulto`, `rastejante`, `espantalho`, `olhos_no_escuro`,
  `lobisomem`, `fantasma`, `aranha_gigante`, `coisa_com_chifres`, `gigante_mitologico`. Parâmetros (altura, cor,
  cor/nº dos olhos) para variar entre histórias.
- **Figurantes** = versão leve do personagem liso (cores variadas), não mais cápsula azul.
- **Enquadramento**: travelling visível (2 quadros a 2,5 s diferem), criatura inteira no plano `baixo`, troncos/
  casas entre câmera e alvo (ou > ~20% da tela, ou perto demais) SOMEM naquele quadro; chão/rua não contam.
- **27 cenários** (9 + 18 novos): hospital, escola, metro, elevador, posto, farol, lago_congelado, mina,
  igreja_antiga, deserto, praia_noite, fazenda, castelo, mercado_medieval, templo_oriental, cidade_grega, navio,
  cabana_neve.
- **Céu e clima** (`kit/luz.js`): lua cheia/minguante (disco), neblina baixa, neve (flocos), tempestade com
  relâmpago, nascer/pôr do sol, nublado.
- **Fiscal** (`testes/conferir_quadros.py`): + 3 testes (quadro repetido < 2%, obstáculo > 25%, criatura > 8%).
  **Os 3 testes (SV, HM, CL) passam.**
- **Catálogo visual** (`testes/catalogo.py` + `catalogo.html`): `catalogo_personagens.jpg` (24 por semente),
  `catalogo_criaturas.jpg` (13), `catalogo_cenarios.jpg` (27) em `testes/saida/`.
- **Anti-repetição** (`motor-3d/variedade.py`): avisa quando criatura/cenário/semente de protagonista repete em
  < 5 séries no mesmo canal (o Claude liga no `validar_roteiros.py`).
- **Amostra de movimento**: `testes/saida/SV-3d_amostra.mp4` (20 s, 720×1280, ~0,5 MB).

## Falta / pontos a melhorar (para o Claude ou próxima sessão do Kiro)

1. **Variante por estação do cenário**: os cenários aceitam `opts.variante` (semente) em alguns pontos, mas falta
   ligar a estação (verão/outono/neve/chuva) trocando cores de folhagem e o preset de luz por cenário. Hoje a
   estação vem só pelo `luz` da cena. Sugestão: `montarCenario(nome, scene, {variante, estacao})`.
2. **Pose de repouso do manequim**: em algumas animações os braços abrem (T) por 1-2 quadros; `Idle_A` resolve,
   mas vale revisar quais clips usar por emoção.
3. **Catálogo de cenários** usa sempre `dia`; vale variar o preset por cenário (farol/metro à noite etc.).
4. **Faces**: 3 estilos prontos; faltam variações de nariz/boca mais fortes e um estilo "desenho" extra se quiser.
5. **Rostos dos figurantes**: hoje só dois olhos; dá para reusar `desenharRosto` do personagem se o custo permitir.
6. **Tempo de render**: ~0,6 s/quadro (1080×1920, swiftshader). As criaturas/figurantes extras pesam pouco. Se um
   canal passar de 25 min no Actions, baixar `_FATOR_ARVORES` em `kit/cenarios/index.js`.
7. **O que o Claude faz depois** (seções "Depois" dos planos): conferir os catálogos e as folhas, atualizar
   `ROTEIROS.md`, os `series.md` dos 3 canais e o `validar_roteiros.py` (exigir `visual:3d` + `cena` + `elenco`,
   ligar o `variedade.py`), e escolher a 1ª série nova de cada canal em 3D. **Eu NÃO mexi nesses.**
