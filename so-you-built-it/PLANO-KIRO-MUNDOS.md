# So You Built It: mundos 3D novos para parar de repetir a casa (pedido para o Kiro)

Pedido do Pedro em 11/11/2026: "hoje tá tudo repetindo a mesma coisa com a casa. Não é pra remover a casa, e sim
começar a usar outros cenários também."

## O problema (conferido pelo Claude em 11/11)

- Dos roteiros YB045 a YB064 (os próximos 20 vídeos), **20 de 20** usam `terreno` (8) ou `riacho` (12).
  No canal inteiro: `terreno` 23 vezes, `riacho` 12, todo o resto 1 ou 2 vezes cada.
- Além disso, 10 mundos chamam `quintal()` do `engine3d.html`, que monta SEMPRE o mesmo sobrado, cerca, árvores e
  céu. Por isso até os vídeos de mundos diferentes parecem o mesmo lugar.
- Os mundos de objeto (`panela`, `caneta`, `sabao`...) são de um tema só. A rotina de roteiros só consegue escrever
  muita coisa com `terreno` e `riacho` porque eles são "palcos" com vários parâmetros. Falta palco para outros
  lugares.

## O que fazer

Criar **6 mundos-palco novos**, no mesmo jeito do `terreno.js` e do `riacho.js`: sem etapas fixas, cada cena liga
peças por parâmetro em `"p"`, e cada mundo serve para **pelo menos 6 temas diferentes**. Nenhum deles usa
`quintal()` nem o sobrado. **Não remova nem mude** `terreno`, `riacho`, `quintal()` ou qualquer mundo existente:
roteiros já prontos usam.

Ordem de prioridade (faça de cima para baixo, um mundo por vez, commit e push a cada um):

| # | Mundo | O lugar | Peças por parâmetro (mínimo) | Temas que ele destrava (Curiosidade = C, Evolucao = E) |
|---|---|---|---|---|
| 1 | `cidade` | avenida de cidade grande em corte: asfalto, calçada, prédios altos de vidro e tijolo ao fundo, carros e ônibus, e o SUBSOLO em corte com as redes | cruzamento com semáforo e laço indutivo no asfalto, carro/moto/bicicleta parados, bueiro redondo e tampa, galeria pluvial, esgoto, cano de água, gás, fibra, túnel de metrô (vala aberta e tampada), vapor saindo da rua, chuva, alagamento | C: como o semáforo sabe que tem carro (backlog) · C: por que a tampa do bueiro é redonda · E: you built a subway (cut and cover) · C: por que Nova York solta vapor da rua · E: you built a storm drain / a cidade que não alaga · C: por que abrem a mesma rua toda hora (camadas de redes) |
| 2 | `oficina` | bancada de oficina/escrivaninha com luz quente, ferramentas e lupa; o objeto aparece GRANDE no centro e pode ser cortado ao meio ou ampliado num círculo de zoom | `objeto`: "ziper", "fosforo", "velcro", "grampeador", "abridor", "termica", "relogio", "cadeado", "bicicleta" (coroa, corrente, catraca); `corte`: 0..1; `zoom`: 0..1 com centro; `gira`: graus; peças internas destacadas por nome | C: zíper · C: fósforo · C: velcro · C: grampeador dobra o grampo · C: abridor de lata · C: garrafa térmica · C: relógio mecânico · C: marcha da bicicleta (todos já estão no `references/temas.md` sem `[x]`) |
| 3 | `arranhaceu` | um prédio de ~100 andares no meio de outros, visto de longe e em corte vertical; céu com vento e nuvens | `balanca`: 0..1 (vento entorta o topo), amortecedor de massa no topo (bola pendurada, tipo Taipei 101), núcleo de concreto, elevador na caixa com cabos, contrapeso e freio de segurança, escada rolante em corte (degrau com 2 pares de rodas em 2 trilhos), caixas d'água por zona com bombas, para-raios e raio, fachada de vidro | C: por que arranha-céu balança e a bola de Taipei 101 · C: freio do elevador se o cabo arrebenta · C: degrau da escada rolante vira piso (backlog) · C: como a água chega ao 100º andar · C: para-raios · E: you built a skyscraper (fundação, núcleo, vento, amortecedor) |
| 4 | `montanha` | encosta de montanha de rocha em corte, com neve no topo e vale embaixo | estrada em serpentina, túnel na rocha (perfuração e explosão, cambotas), galeria contra avalanche, tela contra queda de pedras, teleférico com cabos e torre, trem de cremalheira, barragem em arco num cânion, `neve`/`avalanche`/`chuva`: 0..1 | E: you built a mountain road · C: galeria de avalanche · C: trem de cremalheira sobe 48% · C: barragem em arco (Hoover) segura o lago pela forma · E: you built a mountain tunnel · C: teleférico não cai |
| 5 | `litoral` | costa em corte: praia, mar com ondas, porto (pode copiar o mar do `navio.js`, mas com menos vértices para não ficar lento) | quebra-mar de tetrápodes, farol com lente de Fresnel, píer sobre estacas, eclusa de canal (comportas, câmara enchendo, barco subindo), muro anti-tsunami, ilha artificial (aterro dragado), espigões e erosão da areia, `onda`: altura, `mare`: nível | C: tetrápodes · C: eclusa do Canal do Panamá · C: lente do farol · E: you built an artificial island · C: muro anti-tsunami do Japão · C: espigão segura a praia |
| 6 | `campo` | sítio/fazenda: casa de madeira simples (NÃO o sobrado), celeiro, pasto, horizonte aberto | cisterna de chuva enterrada com calha e filtro, fossa seca/privada, chaminé de fogão a lenha com tiragem, caixa d'água elevada, silo de grãos, moinho de vento puxando água, pivô de irrigação, biodigestor, `chuva`/`fumaca`: 0..1 | E: rainwater cistern (backlog) · E: outhouse (backlog) · E: wood stove chimney (backlog) · C: por que a caixa d'água fica no alto · C: silo de grãos que explode · C: moinho de vento puxa água sem motor |
| 7 (se sobrar) | `mina` | mina a céu aberto em degraus e mina subterrânea em corte | escavadeira de roda de caçambas (Bagger 288) e esteira de km, caminhão gigante, elevador de mina, ventilação | C: Bagger 288 nunca desliga (backlog) · C: caminhão de mina · E: you built a mine shaft |

## Regras de cada mundo

1. `git pull origin producao` antes de começar. Trabalhe no branch `producao`.
2. Siga a seção "Escrever um mundo novo" do `so-you-built-it/SKILL.md` e o `MUNDOS.md`:
   `MUNDO = { monta, atualiza, camera, overlay }`, `atualiza` sem estado (tudo em função de `t`, `ctx.p` e `ctx.lt`),
   `[a, b]` nos parâmetros anima de a até b durante a cena, igual ao `terreno.js`.
3. No topo do arquivo, um comentário com **todos** os `p` aceitos (como no `terreno.js` e no `riacho.js`). É isso que
   a rotina de roteiros lê para escrever sem abrir o resto do código.
4. Cada mundo precisa de pelo menos 4 enquadramentos por `foco` (geral, e um para cada área), porque o roteiro
   troca de plano a cada cena. Vertical 1080x1920: a largura visível é ~0,45 x a distância da câmera.
5. Visual igual ao resto do canal: 3D semirrealista em corte, texturas do motor (`tmat`), luz e sombra suaves.
   Nada de céu vazio ou chão infinito liso: ponha fundo (prédios, morros, mar, horizonte) para cada lugar ser
   reconhecível em 1 segundo.
6. Desempenho: cada quadro em menos de ~0,3 s no Chromium sem GPU (o `navio.js` com 53 mil vértices animados ficou
   lento demais). Partículas com `InstancedMesh` e `frustumCulled = false`.
7. **Um roteiro real por mundo**, escolhido da coluna de temas, seguindo o `ROTEIROS.md` da raiz (duração, gancho,
   fatos conferidos, `"autor": "kiro"`, próximo código YB livre, `"mundo": "<nome>"`). Marque `[x]` no
   `references/temas.md` e escreva no `references/series.md` como os outros.
8. Prévia na nuvem: o caminho do roteiro em `.github/previa.txt`, commit e push no `producao`. Os JPGs saem em
   https://github.com/opradopedro/canais-dark/releases/tag/previas. **Olhe os JPGs** e conserte o que estiver vazio,
   escuro, cortado ou confuso antes de seguir.
9. Acrescente a linha do mundo na tabela "Mundos 3D" do `MUNDOS.md` (o que mostra, os `p`, para quais temas serve)
   e rode `python motor-en/validar_roteiros.py` até "ROTEIROS OK".
10. Commits pequenos (um por mundo), push no `producao`. Não mexa nos roteiros já prontos nem nos outros canais.

## Entrega

Ao terminar, escreva no fim deste arquivo, para cada mundo: FEITO, o código do roteiro de teste e os segundos das
prévias que melhor mostram o lugar. Se parar no meio, deixe escrito qual mundo ficou pela metade.

## Depois (Claude)

Com pelo menos 3 mundos novos no ar, o Claude confere as prévias e liga a regra de variedade do SYBI no
`ROTEIROS.md` e no `validar_roteiros.py`: o mesmo mundo no máximo 2 vezes em cada 7 roteiros seguidos, e
`terreno` + `riacho` juntos no máximo 2 em cada 7. Assim a rotina de roteiros passa a espalhar os vídeos pelos
cenários novos sozinha, sem tirar a casa do canal.
