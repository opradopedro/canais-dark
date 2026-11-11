#!/usr/bin/env python3
"""Diagnostico: renderiza UM quadro de um roteiro 3D no instante t e salva <saida>.jpg (com info do plano).
Uso: python quadro.py SV-3d-exemplo.json SV-3d-tempos.json 17.5 saida.jpg"""
import base64, functools, http.server, json, os, sys, threading
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from conferir_quadros import _H, _porta, MOTOR3D, carregar, resolver
from playwright.sync_api import sync_playwright

hist, temp, t, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
estado = resolver(carregar(hist), json.load(open(temp)))
porta = _porta()
srv = http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(_H, directory=MOTOR3D))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1920})
    pg.goto(f"http://127.0.0.1:{porta}/engine.html")
    pg.wait_for_function("() => typeof window.setup === 'function'", timeout=30000)
    pg.evaluate("h => setup(h)", estado); pg.wait_for_function("() => window.pronto === true", timeout=120000)
    pg.evaluate("t => window.prepararQuadro(t)", t)
    d = pg.evaluate("t => { render(t); return document.getElementById('c').toDataURL('image/jpeg',0.85).split(',')[1]; }", t)
    open(out, "wb").write(base64.b64decode(d))
    print(pg.evaluate("() => ({q: window.__ultimoQuadro, c: window.__caminfo()})"))
    b.close()
srv.shutdown()
