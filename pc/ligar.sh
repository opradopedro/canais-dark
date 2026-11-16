#!/usr/bin/env bash
# Liga o robo dos canais (chamado pela tarefa "Canais - robo" do Windows ao entrar no PC). Roda como root.
# Fica aberto para sempre: enquanto ele roda, o WSL nao desliga.
pkill -f Runner.Listener || true
( while true; do su - canais -c "cd ~/runner && ./run.sh"; sleep 30; done ) >> /var/log/canais-runner.log 2>&1 &
( while true; do su - sinal -c "bash /opt/canais-pc/sinal.sh"; sleep 300; done ) >> /var/log/canais-sinal.log 2>&1 &
wait
