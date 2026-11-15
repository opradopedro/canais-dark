"""Video longo do YouTube: plano de quais series entram e TRAVA de duracao minima.

REGRA do Pedro (15/11/2026): nenhum video longo sai, em hipotese nenhuma, com menos de 10 minutos.
(O YouTube libera anuncio no meio a partir de 8 min; 10 min e o nosso piso, com margem.)
Se uma serie sozinha nao chega a 10 min, o longo junta a serie seguinte do mesmo canal (ou aumenta os extras).

Uso:
  python motor-en/longo.py plano <pasta do canal>    -> grupos de series (em ordem) que dao >= 10 min cada
  python motor-en/longo.py trava <video.mp4>         -> sai com erro (codigo 1) se o video tiver menos de 10 min
Qualquer codigo que suba video longo TEM que rodar a trava antes do upload e nao subir se ela falhar.
"""
import glob
import json
import os
import re
import subprocess
import sys

MINIMO_S = 600          # 10 min: piso duro (Pedro, 15/11)
MARGEM_PLANO_S = 630    # o plano mira 10min30 para sobrar folga depois da montagem
EXTRAS_S = 60           # abertura + epilogo + cartoes extras (estimativa conservadora)
# palavras faladas por segundo, medido nos videos prontos (ROTEIROS.md 'Duracao')
RITMO = {"hora-muerta": 1.7, "signal-lost": 1.7, "old-tales": 2.3, "so-you-built-it": 3.1}


def duracao(mp4):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4],
                         capture_output=True, text=True).stdout.strip()
    return float(out or 0)


def trava(mp4):
    d = duracao(mp4)
    if d < MINIMO_S:
        print(f"LONGO BARRADO: {mp4} tem {d / 60:.1f} min; o minimo e {MINIMO_S // 60} min (regra do Pedro). "
              f"Junte mais uma serie ou aumente os extras. NAO SUBIU.")
        return 1
    print(f"LONGO OK: {d / 60:.1f} min")
    return 0


def _palavras(h):
    total = 0
    for l in h.get("lineas") or []:
        t = l if isinstance(l, str) else (l.get("texto") or l.get("t") or "")
        total += len(re.sub(r"\{\w+\}", "", t).split())
    return total


def plano(pasta):
    canal = os.path.basename(os.path.normpath(pasta))
    ritmo = RITMO.get(canal, 1.7)
    series = []  # [(nome, [codigos], segundos estimados)]
    for arq in sorted(glob.glob(os.path.join(pasta, "stories", "*.json"))):
        h = json.load(open(arq, encoding="utf-8"))
        nome = h.get("serie") or h.get("codigo")
        seg = _palavras(h) / ritmo
        if series and series[-1][0] == nome:
            series[-1][1].append(h.get("codigo"))
            series[-1][2] += seg
        else:
            series.append([nome, [h.get("codigo")], seg])
    grupos, atual, soma = [], [], EXTRAS_S
    for s in series:
        atual.append(s)
        soma += s[2]
        if soma >= MARGEM_PLANO_S:
            grupos.append({"series": [x[0] for x in atual], "codigos": [c for x in atual for c in x[1]],
                           "estimado_min": round(soma / 60, 1)})
            atual, soma = [], EXTRAS_S
    sobra = {"series": [x[0] for x in atual], "estimado_min": round(soma / 60, 1)} if atual else None
    return {"canal": canal, "minimo_min": MINIMO_S / 60, "grupos": grupos, "esperando_mais_series": sobra}


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "trava":
        sys.exit(trava(sys.argv[2]))
    if len(sys.argv) == 3 and sys.argv[1] == "plano":
        print(json.dumps(plano(sys.argv[2]), ensure_ascii=False, indent=1))
        sys.exit(0)
    print(__doc__)
    sys.exit(2)
