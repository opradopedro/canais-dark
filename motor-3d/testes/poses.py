#!/usr/bin/env python3
"""Teste do corpo inteirico: o mesmo personagem nas 6 animacoes pedidas (Idle_A, Walking_A, Running_A, Crawling,
Sit_Chair_Idle, Death_A), em 2 instantes cada. Gera testes/saida/catalogo_poses.jpg (6 x 2)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalogo import _porta, _H, _grade, MOTOR3D, SAIDA
import functools, http.server, threading
from playwright.sync_api import sync_playwright

ANIMS = ["Idle_A", "Walking_A", "Running_A", "Crawling", "Sit_Chair_Idle", "Death_A"]


def main(semente=17):
    porta = _porta()
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(_H, directory=MOTOR3D))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    fotos, rot = [], []
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 540, "height": 960})
        pg.goto(f"http://127.0.0.1:{porta}/testes/catalogo.html")
        pg.wait_for_function("() => window.pronto === true", timeout=60000)
        for t in (0.35, 0.95):
            for a in ANIMS:
                fotos.append(pg.evaluate("x => window.poseFoto({semente: x.s}, x.a, x.t)", {"s": semente, "a": a, "t": t}))
                rot.append(f"{a} t={t}")
        b.close()
    srv.shutdown()
    _grade(fotos, os.path.join(SAIDA, "catalogo_poses.jpg"), cols=6, rotulos=rot)


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 17)
