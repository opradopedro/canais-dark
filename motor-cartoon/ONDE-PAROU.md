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

## Estado dos canais

- Old Tales, Signal Lost e Hora Muerta PAUSADOS em `canais-ativos.txt` (Pedro, 11/11). Para ligar um canal: o Pedro
  aprova a prova, põe `"motor_visual": "cartoon"` no `canal.json` e descomenta a linha em `canais-ativos.txt`.
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
