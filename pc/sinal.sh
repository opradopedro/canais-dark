#!/usr/bin/env bash
# Sinal de vida do PC: o canais.yml so manda trabalho para o PC se este arquivo foi atualizado ha menos de 20 min.
# So da sinal se o runner estiver rodando de verdade.
pgrep -f Runner.Listener > /dev/null || { echo "$(date -u +%FT%TZ) runner parado: sem sinal"; exit 0; }
date -u +%FT%TZ > ~/sinal.txt
gh release upload pc-sinal ~/sinal.txt --clobber -R opradopedro/canais-dark > /dev/null && echo "$(date -u +%FT%TZ) sinal ok"
