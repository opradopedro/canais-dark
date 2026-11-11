# motor-3d, rodada 4: acabamento (pedido para o Kiro)

Conferido pelo Claude em 11/11/2026 nas folhas e catálogos da rodada 3.

**Melhorou:** o boneco liso com cabeça-bola e boné ficou no caminho certo, o rosto aparece, a criatura alta tem olhos amarelos e a variedade existe (13 criaturas, 27 cenários).

**Mas ficou com cara de rascunho, e o fiscal não pega isso:**
1. **Corpo desmontado**: mãos, antebraços, coxas e pés aparecem SOLTOS no ar, com vão entre as peças; o tronco é uma placa fina. O mesmo nas criaturas (`alta`, `sem_rosto`, `rastejante`, `lobisomem`, `espantalho`, `gigante_mitologico`): bolinhas e cápsulas flutuando. `vulto` é só uma pílula.
2. **Cenários novos são caixas**: hospital, escola, metrô, elevador, posto, farol, mina, igreja, deserto, praia, castelo, cidade grega e navio são paredes lisas e blocos sem detalhe, e no catálogo a câmera está dentro ou rente à parede. O lago congelado tem o chão verde aparecendo.
3. **Planos sem nada**: ainda há quadros só de grama e céu (SV "you", "an", "and", "washing").

Regra: **menos itens e mais acabados vale mais que muitos itens feios.** Qualidade de referência: os quadros do Reel em `referencias/estilo-3d-reel/`.

## Pedido (colar inteiro no Kiro)

> Repositório canais-dark, branch `producao` (`git pull origin producao` antes). Leia `motor-3d/PLANO-KIRO-RODADA4.md`. Não mexa em `ROTEIROS.md`, `validar_roteiros.py`, `series.md` nem `stories/`.
>
> 1. **Corpo inteiriço** (personagem e TODAS as criaturas de corpo humanoide): cada segmento vai do osso ATÉ o osso filho (calcule a distância entre `getWorldPosition` dos dois na pose de repouso, crie a cápsula com esse comprimento e oriente para o filho), com uma esfera em cada junta (ombro, cotovelo, pulso, quadril, joelho, tornozelo) do mesmo raio da cápsula, para nunca abrir vão em nenhuma animação. Tronco = cápsula/caixa arredondada GROSSA (profundidade ~60% da largura), não placa. Mãos encostadas no pulso, pés encostados no tornozelo. Pescoço curto ligando cabeça e tronco. Teste em `Idle_A`, `Walking_A`, `Running_A`, `Crawling`, `Sit_Chair_Idle`, `Death_A`.
> 2. **Criaturas**: refaça com o item 1. `vulto` = silhueta humana inteira preta (não pílula), borda levemente esfumada. `mulher_branca` com cabelo longo preto cobrindo o rosto e braços ligados ao corpo. `fantasma` com corpo humano translúcido que afina embaixo, não cone. `lobisomem` com cabeça de lobo (use a cabeça do `animais/Wolf.glb` ou focinho em primitivas), corpo peludo marrom-escuro curvado.
> 3. **Cenários: acabar 8 antes de qualquer outro**: `bairro`, `floresta`, `estrada`, `casa_interior`, `cemiterio`, `hospital`, `vila`, `templo_oriental`. Cada um com chão de material próprio, pelo menos 15 objetos de detalhe (dos `assets/` e primitivas: portas, janelas, luminárias, placas, bancos, macas, armários, lixeiras, plantas, cercas, lanternas), luz própria de dia e de noite, e 6 marcas onde a câmera NUNCA fica dentro/rente à parede (distância mínima 1,5 m de qualquer parede). Os outros 19 cenários ficam marcados `"rascunho": true` e o engine se recusa a usá-los (erro claro) até serem acabados numa próxima rodada.
> 4. **Lago congelado/neve**: chão branco-azulado em todo o cenário (sem verde aparecendo).
> 5. **Todo plano tem assunto**: quadro sem ator, criatura nem objeto principal ocupando ≥ 10% da tela reprova no fiscal (some esse teste). Planos de ambiente mostram uma casa, a torre, a estrada com poste etc., nunca só grama e céu.
> 6. **Catálogos de novo** (`catalogo_personagens`, `catalogo_criaturas` com cada criatura em `Idle` e andando, `catalogo_cenarios` com os 8 acabados de dia E de noite) + folhas SV/HM/CL + `SV-3d_amostra.mp4` de 20 s. Atualize o `FALTA.md`. Commits pequenos, push no `producao`.
