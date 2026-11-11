#!/usr/bin/env python3
"""Confere os 8 cenarios ACABADOS (rodada 4) e a recusa dos rascunhos:
  - >= 15 objetos de detalhe, >= 6 marcas, >= 1 objeto principal, luz propria de dia e de noite;
  - toda marca a >= 1,5 m de qualquer parede/objeto principal (a camera nunca fica rente a parede);
  - um cenario rascunho tem que dar ERRO claro no engine.
Uso: python cenarios_check.py   (sai 0 se tudo OK)"""
import functools, http.server, os, sys, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalogo import _porta, _H, MOTOR3D
from playwright.sync_api import sync_playwright

ACABADOS = ["bairro", "floresta", "estrada", "casa_interior", "cemiterio", "hospital", "vila", "templo_oriental"]


def main():
    porta = _porta()
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(_H, directory=MOTOR3D))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    falhas = []
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 540, "height": 960})
        pg.goto(f"http://127.0.0.1:{porta}/testes/catalogo.html")
        pg.wait_for_function("() => window.pronto === true", timeout=60000)
        for nome in ACABADOS:
            i = pg.evaluate("n => window.cenarioInfo(n)", nome)
            ruins = [f"{k} a {m['dmin']} m de {m['quem']}" for k, m in i["marcas"].items() if m["dmin"] < 1.5]
            ok = i["detalhes"] >= 15 and len(i["marcas"]) >= 6 and i["principais"] >= 1 and i["luzDiaNoite"] and not ruins
            print(f"{'OK ' if ok else 'FALHA'} {nome:16s} detalhes={i['detalhes']:3d} marcas={len(i['marcas'])} principais={i['principais']}"
                  + (f"  marcas rentes: {'; '.join(ruins)}" if ruins else ""))
            if not ok:
                falhas.append(nome)
        msg = pg.evaluate("n => window.cenarioRascunho(n)", "torre")
        rec = "RASCUNHO" in msg
        print(("OK " if rec else "FALHA") + f" rascunho 'torre' recusado: {msg[:110]}")
        if not rec:
            falhas.append("rascunho")
        b.close()
    srv.shutdown()
    print("CENARIOS OK" if not falhas else "CENARIOS COM FALHA: " + ", ".join(falhas))
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
