#!/usr/bin/env bash
# Instala FFmpeg e fontes no runner sem derrubar o workflow quando o
# download das fontes da Microsoft (sourceforge) falha de vez em quando.
# 16/11: canais.yml (SYBI) caiu com "dpkg returned an error code (1)" no
# ttf-mscorefonts-installer, antes de produzir qualquer coisa.
set -u
# PC do Pedro (runner self-hosted, pasta pc/): tudo ja foi instalado pelo pc/dentro-wsl.sh e nao ha sudo
if [ "${RUNNER_ENVIRONMENT:-github-hosted}" != github-hosted ]; then
  command -v ffmpeg > /dev/null && { echo "PC: programas ja instalados"; exit 0; }
  echo "ERRO: ffmpeg nao esta instalado no PC (rode de novo o pc/instalar.ps1)"; exit 1
fi
echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | sudo debconf-set-selections

for i in 1 2 3; do
  sudo apt-get update -qq && break
  echo "apt-get update falhou (tentativa $i)"; sleep $((i * 15))
done

# essenciais: sem eles nao da para produzir, entao aqui pode falhar de verdade
ok=0
for i in 1 2 3; do
  if sudo apt-get install -y -qq ffmpeg fonts-dejavu > /dev/null; then ok=1; break; fi
  echo "ffmpeg/dejavu falhou (tentativa $i)"; sudo dpkg --configure -a || true; sleep $((i * 15))
done
[ "$ok" = 1 ] || { echo "ERRO: nao instalou ffmpeg"; exit 1; }

# fontes da Microsoft (Impact/Arial das capas e legendas): tenta 3x, depois segue
for i in 1 2 3; do
  if sudo apt-get install -y -qq ttf-mscorefonts-installer > /dev/null 2>&1 \
     && fc-list | grep -qi impact; then
    echo "fontes Microsoft ok"; exit 0
  fi
  echo "fontes Microsoft falharam (tentativa $i), tentando de novo"
  sudo dpkg --configure -a > /dev/null 2>&1 || true
  sudo dpkg-reconfigure -f noninteractive ttf-mscorefonts-installer > /dev/null 2>&1 \
    && fc-list | grep -qi impact && { echo "fontes Microsoft ok"; exit 0; }
  sleep $((i * 20))
done
echo "AVISO: fontes Microsoft nao instalaram; seguindo com DejaVu"
sudo dpkg --configure -a > /dev/null 2>&1 || true
exit 0
