#!/usr/bin/env python3
"""Gera um tempos.json de TESTE (tempos fixos, sem TTS) para os roteiros 3D de exemplo.

So para os testes locais do motor-3d: cada palavra recebe um tempo deterministico (ritmo de leitura fixo),
para a legenda sair UMA palavra por vez sem precisar de audio real. NAO usar em producao (la vale o
alinhamento forcado do motor-en/sincronia.py).

Uso: python tempos_fixos.py SV-3d-exemplo.json SV-3d-tempos.json [--ppm 150]
"""
import argparse, json, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(AQUI), "..", "hora-muerta", "scripts"))


def gerar(historia_path, saida_path, ppm=150):
    h = json.load(open(historia_path, encoding="utf-8"))
    lineas = [l if isinstance(l, dict) else {"texto": l} for l in h["lineas"]]
    por_palavra = 60.0 / ppm            # segundos por palavra
    segs = []
    t = 0.5                              # meio segundo de respiro no comeco
    for l in lineas:
        texto = l["texto"]
        palavras = texto.split()
        w = []
        for _ in palavras:
            w.append(round(t, 3))
            t += por_palavra
        t0 = w[0] if w else round(t, 3)
        t1 = round(t, 3)
        segs.append({"t0": round(t0, 3), "t1": t1, "text": texto, "w": w,
                     "w_fim": [round(x + por_palavra * 0.9, 3) for x in w]})
        t += float(l.get("pausa", 0.5))  # pausa entre linhas
    dur = round(t + 0.8, 3)
    tempos = {"segs": segs, "dur": dur, "legenda": "fixo-teste"}
    json.dump(tempos, open(saida_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return dur


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("historia"); ap.add_argument("tempos"); ap.add_argument("--ppm", type=int, default=150)
    a = ap.parse_args()
    dur = gerar(a.historia, a.tempos, a.ppm)
    print(f"ok {a.tempos}  dur={dur}s")


if __name__ == "__main__":
    main()
