#!/usr/bin/env python3
"""Anti-repeticao dos roteiros 3D: avisa quando a MESMA criatura, o MESMO cenario principal ou a MESMA semente de
protagonista aparece em menos de 5 SERIES de distancia dentro do mesmo canal.

Le os stories/*.json de cada canal (signal-lost, old-tales, hora-muerta) que tenham "visual":"3d", agrupa por
serie (campo "serie"), ordena pelo codigo, e compara series vizinhas. NAO altera nada; so avisa (o Claude liga
isto no validar_roteiros.py depois).

Uso: python variedade.py [--canal signal-lost] [--distancia 5]
Sai com 0 se nao houver aviso, 1 se houver (para dar para usar em CI).
"""
import argparse, glob, json, os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # canais-dark/
CANAIS = {"signal-lost": "SV", "old-tales": "CL", "hora-muerta": "HM"}


def _carregar(canal):
    """Series 3D do canal, ordenadas pelo codigo: [(serie, codigo, {criaturas, cenarios, sementes})]."""
    pasta = os.path.join(RAIZ, canal, "stories")
    series = {}
    for f in sorted(glob.glob(os.path.join(pasta, "*.json"))):
        try:
            h = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        if h.get("visual") != "3d":
            continue
        serie = h.get("serie", h.get("codigo", os.path.basename(f)))
        info = series.setdefault(serie, {"codigo": h.get("codigo", ""), "criaturas": set(), "cenarios": set(), "sementes": set()})
        # codigo mais baixo da serie para ordenar
        if h.get("codigo", "") and (not info["codigo"] or h["codigo"] < info["codigo"]):
            info["codigo"] = h["codigo"]
        # protagonista: sementes do elenco
        for ator in (h.get("elenco") or {}).values():
            if isinstance(ator, dict) and "semente" in ator:
                info["sementes"].add(ator["semente"])
        # cenario principal (o mais frequente) e criaturas de cada cena
        contagem = {}
        for c in h.get("cenas", []):
            cena = c.get("cena") or {}
            if cena.get("cenario"):
                contagem[cena["cenario"]] = contagem.get(cena["cenario"], 0) + 1
            cr = cena.get("criatura")
            if cr and cr.get("tipo"):
                info["criaturas"].add(cr["tipo"])
        if contagem:
            info["cenarios"].add(max(contagem, key=contagem.get))
    ordenadas = sorted(series.items(), key=lambda kv: kv[1]["codigo"])
    return [(s, i) for s, i in ordenadas]


def conferir(canal, distancia=5):
    series = _carregar(canal)
    avisos = []
    for i, (serie, info) in enumerate(series):
        viz = series[max(0, i - distancia):i]  # as `distancia` series anteriores
        for campo, rotulo in [("criaturas", "criatura"), ("cenarios", "cenario principal"), ("sementes", "semente de protagonista")]:
            for val in info[campo]:
                for js, (serieV, infoV) in enumerate(viz):
                    if val in infoV[campo]:
                        d = i - (max(0, i - distancia) + js)
                        avisos.append(f"[{canal}] {rotulo} '{val}' repete: serie '{serie}' ({info['codigo']}) e "
                                      f"'{serieV}' ({infoV['codigo']}), a {d} serie(s) de distancia (< {distancia})")
    return avisos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--canal", choices=list(CANAIS), help="so um canal (padrao: todos)")
    ap.add_argument("--distancia", type=int, default=5)
    a = ap.parse_args()
    canais = [a.canal] if a.canal else list(CANAIS)
    todos = []
    for c in canais:
        todos += conferir(c, a.distancia)
    if todos:
        print("VARIEDADE: avisos de repeticao\n" + "\n".join(f"  - {x}" for x in todos))
    else:
        print("VARIEDADE OK: nenhuma repeticao dentro de", a.distancia, "series nos canais", ", ".join(canais))
    sys.exit(1 if todos else 0)


if __name__ == "__main__":
    main()
