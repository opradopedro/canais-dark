# Motor cartoon: onde parou (para a Kiro continuar)

Atualizado em 12/11/2026 (noite) pelo Claude. Plano completo: `PLANO-ANTIGRAVITY.md` (raiz). Regras de roteiro: `ROTEIROS.md`.

## Feito

- **Antigravity (12/11 madrugada):** `motor-cartoon/` (Remotion + three.js, cenários de terror e do Old Tales em
  `cenarios/`, elenco e criaturas em `elenco/`, ações em `src/acoes.ts`, câmera em `src/camera.ts`); `render.py` manda
  roteiro `"visual": "3d"`/`"cartoon"` para o motor cartoon quando o canal tem `"motor_visual": "cartoon"`;
  Wukong partes 2-5 reescritas no tom novo (`old-tales/stories/042..045`); provas na Release `teste-cartoon`
  (HM041 e SV031 passaram na conferência; CL036 é a parte 1 antiga).
- **Claude (12/11 tarde):** produção diária em fatias paralelas (`canais.yml`):
  1. job `rodar` roda o `produce.py` do canal com `CARTOON_PREP=1`: voz, trilha, legenda alinhada, capa, horário e
     `<COD>_roteiro.json`/`_upload.json`, e para antes de desenhar (artefato `cartoon-prod`);
  2. `prod-cartoon-fatias`: 10 jobs, cada um desenha 1/10 dos quadros (`render.mjs --shard i/10`);
  3. `prod-cartoon-montar`: `motor-en/cartoon_montar.py` junta, põe o som, confere (legenda colada na voz +
     fim sem chiado) e agenda no YouTube; cópia para o painel.
  Prova do CL042 refeita em 10 fatias (`teste-cartoon`, só CL042 via `TESTE_CARTOON`).
- **Claude (12/11 noite), consertos pedidos pelo Pedro nas provas HM041/SV031:**
  - `elenco/objetos.ts` + `elenco/objetos-palavras.json`: quando a fala cita polícia, caminhão, ônibus, carro,
    ambulância, vaca, cavalo, cachorro, placa, enfermeira, médico, guarda, multidão, criança, soldado ou monge, a
    cena mostra (veículos cruzam ao fundo, animais/placas/figurantes na frente da câmera). Roteiro pode forçar com
    `"objetos"` no bloco `cena`. Posições em `src/CartoonShort.tsx` (procure "Objetos e figurantes").
  - Fiscal: `cenas_repetidas()` no `motor-en/validar_roteiros.py` (seção "Cena que muda" do `ROTEIROS.md`).
  - Voz que engole o fim ("Parte dos" sem "mañana"): `sincronia.fim_mudo()` + regravação 1 vez nos 2 produce.py e
    no `preparar_teste_cartoon.py`; `conferir()` também reprova fim mudo.
  - Estática/zumbido do SV mais baixos (`mix_en.py`), teto no hospital e na casa, rabo de cavalo e gota de suor
    tirados (pareciam coisa flutuando), lanterna com facho 3D saindo da lente.
  - Old Tales de ação (Pedro, 12/11 22h: "tire todos os elementos de criança"): trilha de tambores em código
    (`motor-en/trilha_acao.py`) no lugar do alaúde, capa retangular do macaco saiu, Wukong de armadura quando o
    elenco tem `roupa` (`"roupa": "nenhuma"` no ator da cena tira), fiscal pede 4+ cenas de ação no Old Tales.
  - Estrada: morro do fundo baixado e afastado.
  - Ainda não mexido (antes): a estrada "em cima do morro" (o Pedro achou estranho o morro verde atrás da estrada no
    `cenarios/estrada`); vale baixar/afastar o morro.

## Erros que o Pedro já reprovou (NUNCA repetir; confira em imagem antes de mandar prova)

1. Coisa desenhada em posição fixa no cartão (barba, óculos, cruz no peito, rabo de cavalo, gota de suor) não
   acompanha o rosto quando o boneco anda/inclina: parece "flutuando". Tudo que é do rosto vai no `faceFront`
   (`src/toon.ts`); não criar enfeite novo em `drawExtrasAndProp` com coordenada fixa.
2. Símbolo/emblema no peito (cruz de enfermeira) ficou estranho: roupa sem logo.
3. Veículo anda NA rua, na faixa, ao longo dela (`pista` no cenário); nunca atravessando mato/calçada e nunca em
   cima da câmera (9 m ou mais na frente). Cenário novo com rua declara `pista: { x, largura }`.
4. Placa na beira da rua, nunca no meio do asfalto.
5. Capa/peça retangular solta no corpo ("quadrado dentro do macaco"): roupa tem que seguir o contorno do corpo.
6. Teto sumindo de dia (interior sem teto): todo interior tem teto.
7. Narração cita algo e a imagem não mostra / cena repetida: ver "Cena que muda" no `ROTEIROS.md` (o fiscal barra).
8. Old Tales infantil (alaúde, fofo): trilha de ação e 4+ cenas de ação (o fiscal barra).
9. Voz que engole a última palavra ("Parte dos" sem "mañana"): a produção regrava até 2 vezes e não sobe sem o fim.

## Estado dos canais

- 13/11: Pedro aprovou as provas; Old Tales, Signal Lost e Hora Muerta LIGADOS no motor cartoon (`"motor_visual":
  "cartoon"` no `canal.json` e linha em `canais-ativos.txt`). Roteiros antigos sem `"visual": "3d"` (HM031-040,
  SV018-030, CL024-033) foram para `<canal>/em-espera/`: o motor cartoon só desenha roteiro com bloco `cena`.
- A história do hospital (Fourth Floor) virou SV033/SV034 porque SV031/SV032 já existem privados no YouTube.
- SV031/SV032, CL018/022/023, HM029/030 estão no YouTube como PRIVADOS: a produção os trata como já enviados.
  Para refazer alguma dessas histórias, use código NOVO.

## Falta (em ordem)

1. Acompanhar o 1º vídeo de cada canal ligado (logs na Release `logs`: `cartoon-fatia-N_ERRO.txt`, `<canal>_ERRO.txt`).
2. Hora Muerta produz as 2 partes da série na mesma execução: as fatias desenham as duas (tempo dobra, ~1h30).
3. Old Tales: depois do Wukong (CL042-045) escrever conto grego (3 partes), China antiga (3) e Zhong Kui (3),
   no tom da seção "Tom do Old Tales" do `ROTEIROS.md`, com os cenários que faltarem em `cenarios/old_tales.ts`.
4. Visual: menos "fofo" no Old Tales (lutas, céu de tempestade nas viradas, rostos de raiva); no terror, mais
   presença da criatura (na prova do SV031 a sombra quase não aparece).
5. Validador: o fiscal ainda exige `"visual": "3d"` nas séries novas (o motor cartoon lê esse mesmo formato).
