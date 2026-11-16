#!/usr/bin/env bash
# Roda como root dentro do WSL "canais" (chamado pelo pc/instalar.ps1). Pode rodar de novo.
set -euo pipefail
REPO=opradopedro/canais-dark
BASE=https://raw.githubusercontent.com/$REPO/producao/pc
export DEBIAN_FRONTEND=noninteractive

echo "-- Linux isolado do Windows (sem acesso ao C:, sem rodar .exe)"
cat > /etc/wsl.conf <<'C'
[automount]
enabled=false
mountFsTab=false
[interop]
enabled=false
appendWindowsPath=false
C

echo "-- programas (FFmpeg, fontes, Python, gh); demora uns minutos"
echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections
apt-get update -qq
apt-get install -y -qq ffmpeg fonts-dejavu git curl ca-certificates jq unzip python3 python3-venv python3-pip gh > /dev/null
for i in 1 2 3; do apt-get install -y -qq ttf-mscorefonts-installer > /dev/null 2>&1 && break; dpkg --configure -a || true; sleep 10; done

echo "-- bibliotecas do Chromium"
python3 -m venv /opt/pw && /opt/pw/bin/pip install -q playwright && /opt/pw/bin/playwright install-deps chromium > /dev/null

echo "-- usuarios: 'canais' roda os videos, 'sinal' guarda o login do GitHub"
id canais > /dev/null 2>&1 || useradd -m -s /bin/bash canais
id sinal > /dev/null 2>&1 || useradd -m -s /bin/bash sinal
chmod 700 /home/canais /home/sinal

echo "-- login no GitHub"
if ! su - sinal -c "gh auth status" > /dev/null 2>&1; then
  echo
  echo ">>> Abra https://github.com/login/device no celular ou no navegador e digite o codigo que aparecer abaixo <<<"
  echo
  su - sinal -c "BROWSER=true gh auth login --hostname github.com --git-protocol https --web --scopes repo"
fi

echo "-- seguranca: PR de fora nunca roda neste PC sem aprovacao"
su - sinal -c "gh api -X PUT repos/$REPO/actions/permissions/fork-pr-contributor-approval -f approval_policy=all_external_contributors" > /dev/null \
  || echo "AVISO: nao consegui ligar a aprovacao de PR de fora (fazer em Settings > Actions > General)"

echo "-- runner do GitHub (label canais-pc)"
V=$(su - sinal -c "gh api repos/actions/runner/releases/latest --jq .tag_name" | sed 's/^v//')
if [ ! -x /home/canais/runner/run.sh ]; then
  su - canais -c "mkdir -p runner && cd runner && curl -fsSL https://github.com/actions/runner/releases/download/v$V/actions-runner-linux-x64-$V.tar.gz | tar xz"
fi
/home/canais/runner/bin/installdependencies.sh > /dev/null
pkill -f Runner.Listener || true
TOK=$(su - sinal -c "gh api -X POST repos/$REPO/actions/runners/registration-token --jq .token")
su - canais -c "cd runner && ./config.sh --unattended --replace --url https://github.com/$REPO --token $TOK --name pc-pedro --labels canais-pc --work _work" > /dev/null
echo "runner registrado"

echo "-- sinal de vida (Release pc-sinal)"
su - sinal -c "gh release view pc-sinal -R $REPO > /dev/null 2>&1 || gh release create pc-sinal -R $REPO --title 'Sinal do PC' --notes 'Atualizada a cada 5 min pelo PC do Pedro (pc/ligar.sh). Sem atualizar ha 20 min = producao vai para a nuvem.'"

mkdir -p /opt/canais-pc
curl -fsSL $BASE/ligar.sh -o /opt/canais-pc/ligar.sh
curl -fsSL $BASE/sinal.sh -o /opt/canais-pc/sinal.sh
chmod 755 /opt/canais-pc/*.sh
echo "OK dentro do Linux"
