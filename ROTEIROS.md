# Como escrever roteiros (vale para o Kiro e para o Claude)

Este é o manual ÚNICO. Quem escreve (Kiro no PC do Pedro ou Claude no site/app) segue exatamente estes passos.
Tudo fica salvo no GitHub, na branch `producao`: se o crédito de um acabar no meio de uma série, o outro
continua de onde parou, só lendo os arquivos.

## Antes de começar
1. `git pull origin producao` (pegue o que o outro escreveu).
2. Leia o `SKILL.md` do canal, o `references/temas.md` e o `references/series.md` (o plano das séries).
3. Se houver série com parte marcada `FALTA` em `series.md`, **termine essa série primeiro**, seguindo o resumo que está lá.

## Os canais
| Pasta | Canal | Formato | Código |
|---|---|---|---|
| `signal-lost/` | Signal Lost (EN) | terror de sobrevivência, séries de 3 a 4 partes, 1/dia às 19h NY | `SVnnn` |
| `old-tales/` | Old Tales (EN) | "You wake up in..." na Idade Média (~1300), 2ª pessoa, fatos reais, calmo e bonito, 1/dia ao meio-dia NY | `CLnnn` |
| `hora-muerta/` | Hora Muerta (ES) | terror, séries de 2 partes | `HMnnn` |
| `so-you-built-it/` | So You Built It (EN) | engenharia 3D, formatos Evolucao e Curiosidade | `YBnnn` |

Regras de cada canal: no `SKILL.md` da pasta. Para o Old Tales: `"tema": "calmo"` e `"piano": 0` sempre, nada
assustador, e cada fato histórico conferido em fonte confiável (nada de mito).

## Passo 1: o plano da série (ANTES de escrever qualquer parte)
Em `<canal>/references/series.md`, acrescente um bloco assim e já faça commit + push:

```
## medieval-village (CL001-CL003) — Old Tales — por: kiro
- CL001 parte 1/3: acorda na vila, cama de palha, sino, fogo sem chaminé, cerveja fraca. FEITO
- CL002 parte 2/3: dia de feira, pedágio, porcos, placas com desenho, sal, pelourinho, toque de recolher. FALTA
- CL003 parte 3/3: colheita em agosto, dízimo, respiga, banquete do senhor, música no fogo. FALTA
Tom/estilo: calmo, voz Algieba, cenas vila/casa/mercado.
```

O resumo de cada parte tem que bastar para outra pessoa escrever aquela parte sem ter visto a conversa.

## Passo 2: escrever as partes
- Arquivo `<canal>/stories/NNN-slug-P.json`, código na sequência (próximo número livre do canal).
- Copie a estrutura de um roteiro existente do mesmo canal. Campos: `codigo`, `serie`, `serie_titulo`, `parte`,
  `partes`, `anterior` (código da parte anterior), `titulo`, `capa`, `descripcion`, `tags`, `lineas`, `cenas`,
  `eventos`, `destaque`. Opcional: `"autor": "kiro"` ou `"claude"`.
- Parte que não é a última: a última fala promete a seguinte com o marcador `{when_next}` (EN) ou
  `{dia_siguiente}` (ES), e a cena final usa `{next_card}`. Nunca escreva "tomorrow" à mão.
- Cenas: só peças que existem em `hora-muerta/scripts/engine.html` (`COMP.<nome>`). Peça nova só se a
  história pedir; ela é só ADICIONADA, nunca mude uma peça que outro canal usa.
- Prévia grátis (não gasta narração): `python motor-en/previa.py <roteiro> <pasta>`. OLHE os JPGs: a cena
  tem que combinar com o texto.
- **Depois de CADA parte**: marque `FEITO` em `series.md`, rode o fiscal e faça commit + push. Partes pequenas,
  enviadas uma de cada vez: se o crédito acabar, nada se perde.

## Passo 3: o fiscal (obrigatório antes de cada push)
`python motor-en/validar_roteiros.py` precisa terminar em `ROTEIROS OK`. Ele pega código repetido, peça de
cena que não existe, série quebrada, falta de `{when_next}`, Old Tales sem tema calmo. O GitHub roda o mesmo
fiscal em todo push e a produção diária não usa canal com roteiro quebrado.

## Enviar
```
git add <canal>/stories <canal>/references
git commit -m "<canal>: <codigo> <titulo curto> (por kiro|claude)"
git pull --rebase origin producao
python motor-en/validar_roteiros.py
git push origin producao
```
Se o pull trouxer um roteiro com o MESMO código que você usou (os dois escreveram ao mesmo tempo), troque o
seu para o próximo número livre, ajuste o `anterior` e o `series.md`, rode o fiscal e envie de novo.

## O que NÃO fazer
- **Signal Lost e Old Tales:** quem escreve o roteiro não publica nem gasta narração. A produção diária no
  GitHub Actions faz isso sozinha. **Hora Muerta e So You Built It** continuam narrando e subindo pelas
  rotinas do Claude, como sempre.
- Não apagar nem reescrever roteiro que já está no YouTube (o código dele aparece em `yt_upload.py publicados`).
- Não pôr chave, token ou senha em nenhum arquivo.
- Não mexer em `main`: a branch de trabalho é `producao`.
