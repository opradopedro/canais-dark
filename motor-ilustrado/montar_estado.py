"""Junta roteiro ilustrado + tempos.json (voz alinhada) + fundos baixados -> estado.json do engine.html.

Uso: python motor-ilustrado/montar_estado.py <roteiro.json> <tempos.json> <pasta_fundos> <saida.json>
Cada linea tem "cena" (ou "cenas": lista, dividida em partes iguais da fala). A cena vai do comeco da fala ate o
comeco da proxima, entao nunca ha buraco. Fundo = "<cenario>" do mundo do roteiro (ou "mundo/cenario").
"""
import json, os, sys


def montar(rot_path, tempos_path, pasta_fundos, saida):
    rot = json.load(open(rot_path, encoding="utf-8"))
    tp = json.load(open(tempos_path, encoding="utf-8"))
    segs, mundo = tp["segs"], rot.get("mundo", "")
    lin = rot["lineas"]
    if len(segs) != len(lin):
        sys.exit(f"tempos tem {len(segs)} falas e o roteiro {len(lin)}")
    cenas, fundos = [], {}
    for i, (l, s) in enumerate(zip(lin, segs)):
        a = 0.0 if i == 0 else s["t0"] - 0.15
        b = segs[i + 1]["t0"] - 0.15 if i + 1 < len(segs) else float(tp["dur"]) + 0.5
        lista = l.get("cenas") or [l["cena"]]
        for j, c in enumerate(lista):
            c = dict(c)
            c["t0"], c["t1"] = round(a + (b - a) * j / len(lista), 3), round(a + (b - a) * (j + 1) / len(lista), 3)
            fid = c["fundo"] if "/" in c["fundo"] else f"{mundo}/{c['fundo']}"
            c["fundo"] = fid
            arq = os.path.join(pasta_fundos, fid.replace("/", "__") + ".jpg")
            if not os.path.isfile(arq):
                sys.exit(f"FUNDO FALTANDO: {arq} (rode motor-ilustrado/fundos.py)")
            fundos[fid] = "file://" + os.path.abspath(arq)
            cenas.append(c)
    estado = {"dur": float(tp["dur"]), "fps": 30, "fundos": fundos, "elenco": rot.get("elenco", {}),
              "paleta": rot.get("paleta", {}), "cenas": cenas, "segs": segs, "legenda": tp.get("legenda")}
    json.dump(estado, open(saida, "w", encoding="utf-8"), ensure_ascii=False)
    return estado


if __name__ == "__main__":
    montar(*sys.argv[1:5])
