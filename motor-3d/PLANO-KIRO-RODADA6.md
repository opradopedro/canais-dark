# Rodada 6 do motor 3D: o que o Pedro reprovou no 1o video 3D (CL036, Wukong, 11/11)

O CL036 foi ao ar e saiu do ar no mesmo dia. Reclamacoes do Pedro, com a causa provavel:

1. **"As coisas estao tremendo"**: `kit/camera.js` escolhe o `orbit` (0, 25, -25, 55...) A CADA QUADRO,
   conforme a camera cai ou nao dentro de objeto. Quando o teste muda de um quadro para o outro, a camera pula.
   Pedido: decidir orbit/aproximacao UMA vez por corte (no inicio do corte, igual a lista de cortes da r5) e so
   interpolar dentro dele. Conferir tambem o objeto escondido que some/volta entre quadros e a luz da fogueira.
   Fiscal: dois quadros seguidos (1/30 s) do mesmo corte nao podem ter a camera a mais de ~2 cm de distancia.
2. **"Machado aleatorio no meio do video"**: o `toco` da floresta tem machado fincado e aparece em cena que nao
   pede machado. Pedido: props de enfeite (machado, ferramentas) so com flag; o padrao e sem.
3. **"A pedra do Wukong e uma casa de madeira" / "a escada sao madeiras soltas"**: a floresta so tem a torre de
   vigia (`pe_torre`) com escada de tabuas soltas. Pedido: cenario NOVO `montanha_china` (pico de pedra, pedra
   magica grande com rachadura, cachoeira com caverna atras, pessegueiros, nevoa) e marcas `pedra`, `cachoeira`,
   `caverna`, `pico`, `pessegueiro`. Escada da torre: degraus presos nas laterais.
4. **"O macaco e um humano"**: nao existe macaco. Pedido: ator `macaco` (corpo de macaco low-poly, rabo,
   pelo, rosto 2D de macaco) com as mesmas animacoes do manequim, e `sun_wukong` = macaco com coroa dourada,
   capa e cajado (`segura: "cajado"`).
5. Para a serie inteira: `palacio_ceu` (nuvens, colunas, portao), `palacio_mar` (fundo do mar azul, corais),
   criaturas `dragao_chines` (rei dragao) e `buda_gigante` (mao enorme).
6. **Antes de ligar:** gerar um MP4 de 20 s do `old-tales/em-espera/036-wukong-1.json` (com os cenarios novos)
   e pedir aprovacao do Pedro. Nada 3D vai ao ar no Old Tales sem esse ok.

Os roteiros CL036-040 estao em `old-tales/em-espera/`; refazer com codigo novo quando o motor tiver isto.
