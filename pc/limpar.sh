#!/usr/bin/env bash
# Limpeza do PC depois de cada job (Pedro, 23/11: "exclua sempre os que ja foram postados").
# Roda de 2 jeitos: (1) hook do runner ACTIONS_RUNNER_HOOK_JOB_COMPLETED (instalado pelo pc/dentro-wsl.sh) e
# (2) ultimo passo dos jobs do canais.yml que rodam no PC. Na nuvem nao faz nada.
# REGRA: so apaga o video (e os arquivos dele) cujo codigo aparece como "AGENDADO <COD>" no log do job,
# ou seja, ja subiu para o YouTube. O que nao subiu fica (a proxima execucao recomeca do zero de qualquer jeito).
# Nunca falha: erro aqui nao pode deixar o job vermelho.
set -u
[ "${RUNNER_ENVIRONMENT:-self-hosted}" = github-hosted ] && exit 0
TMP=${TMPDIR:-/tmp}

# codigos que ja subiram (logs do job rodar e do job montar)
CODS=$(cat "$TMP/rodar-log.txt" "$TMP/montar-log.txt" 2>/dev/null | grep -oE 'AGENDADO [A-Z]+[0-9]+' | awk '{print $2}' | sort -u)
apagados=0
for c in $CODS; do
  for f in "$TMP"/canais/*/"$c".* "$TMP"/canais/*/"$c"_* "$TMP"/cartoon-prod/"$c".* "$TMP"/cartoon-prod/"$c"_* \
           "$TMP"/fatias/*/fatia-"$c"-* "$TMP"/fatias/fatia-"$c"-*; do
    [ -e "$f" ] || continue
    rm -rf -- "$f" && apagados=$((apagados + 1))
  done
  # copia leve do painel: so depois de subir (o passo do painel roda antes desta limpeza)
  if [ -n "${GITHUB_WORKSPACE:-}" ]; then
    for f in "$GITHUB_WORKSPACE"/painel-saida/*/"$c"*; do [ -e "$f" ] && rm -f -- "$f" && apagados=$((apagados + 1)); done
  fi
done
[ -n "$CODS" ] && echo "limpeza: ja subiram $(echo $CODS | tr '\n' ' ')-> $apagados arquivo(s) apagado(s)"

# restos que nunca sao video: pasta temporaria do runner e logs do runner com mais de 7 dias
[ -n "${RUNNER_TEMP:-}" ] && [ -d "$RUNNER_TEMP" ] && find "$RUNNER_TEMP" -mindepth 1 -maxdepth 1 -mmin +5 -exec rm -rf {} + 2>/dev/null
find "$HOME/runner/_diag" -type f -mtime +7 -delete 2>/dev/null

# disco apertado (menos de 5 GB livres): limpa caches de pip/npm (baixam de novo sozinhos)
livre=$(df -Pk "$TMP" 2>/dev/null | awk 'NR==2{print int($4/1048576)}')
if [ -n "$livre" ] && [ "$livre" -lt 5 ]; then
  rm -rf "$HOME/.cache/pip" "$HOME/.npm/_cacache" 2>/dev/null
  echo "limpeza: so ${livre} GB livres, caches de pip/npm apagados"
fi
exit 0
