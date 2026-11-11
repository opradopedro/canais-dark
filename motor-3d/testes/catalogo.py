#!/usr/bin/env python3
"""Gera os catalogos visuais do motor-3d para o Pedro e o Claude escolherem:
  testes/saida/catalogo_personagens.jpg  (24 personagens por semente, grade 6x4)
  testes/saida/catalogo_criaturas.jpg    (todas as criaturas, grade)
  testes/saida/catalogo_cenarios.jpg     (1 quadro de cada cenario, grade)
Usa testes/catalogo.html (que importa o kit) renderizado no Chromium.

Uso: python catalogo.py            # gera os 3
     python catalogo.py personagens | criaturas | cenarios   # so um
"""
import base64, functools, http.server, io, os, socket, sys, threading
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
MOTOR3D = os.path.dirname(AQUI)
SAIDA = os.path.join(AQUI, "saida")

from criatura_tipos import TIPOS  # lista local p/ nao depender de import JS
from cenario_nomes import NOMES as CEN_NOMES


class _H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def guess_type(self, path):
        p = str(path).lower()
        if p.endswith(".js") or p.endswith(".mjs"): return "application/javascript"
        if p.endswith(".glb"): return "model/gltf-binary"
        if p.endswith(".ttf"): return "font/ttf"
        return super().guess_type(path)


def _porta():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def _grade(itens, caminho, cols, cel_w=270, rotulos=None):
    cel_h = int(cel_w * 960 / 540)
    linhas = (len(itens) + cols - 1) // cols
    folha = Image.new("RGB", (cols * cel_w, linhas * cel_h), (28, 28, 34))
    draw = ImageDraw.Draw(folha)
    for i, b64 in enumerate(itens):
        im = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB").resize((cel_w, cel_h))
        x, y = (i % cols) * cel_w, (i // cols) * cel_h
        folha.paste(im, (x, y))
        if rotulos and i < len(rotulos):
            draw.rectangle([x, y + cel_h - 22, x + cel_w, y + cel_h], fill=(0, 0, 0))
            draw.text((x + 6, y + cel_h - 20), rotulos[i], fill=(255, 255, 255))
    folha.save(caminho, quality=88)
    print("ok", caminho)


def gerar(quais):
    os.makedirs(SAIDA, exist_ok=True)
    porta = _porta()
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(_H, directory=MOTOR3D))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 540, "height": 960})
        pg.goto(f"http://127.0.0.1:{porta}/testes/catalogo.html")
        pg.wait_for_function("() => window.pronto === true", timeout=60000)

        if "personagens" in quais:
            fotos, rot = [], []
            for s in range(24):
                fotos.append(pg.evaluate("s => window.pessoaFoto({semente:s}, 'dia')", s * 7 + 3))
                rot.append(f"semente {s*7+3}")
            _grade(fotos, os.path.join(SAIDA, "catalogo_personagens.jpg"), cols=6, rotulos=rot)

        if "criaturas" in quais:
            # cada criatura parada (Idle) e andando, lado a lado
            ANDA = {"alta": "Walking_A", "cao_negro": "Walk", "coisa_com_chifres": "Walk", "aranha_gigante": "Spider_Walk",
                    "rastejante": "Crawling", "olhos_no_escuro": None}
            PARA = {"cao_negro": "Idle", "coisa_com_chifres": "Idle", "aranha_gigante": "Spider_Idle", "alta": "Idle_A",
                    "rastejante": "Crawling", "olhos_no_escuro": None}
            fotos, rot = [], []
            for tp in TIPOS:
                for nome, mapa, padrao, t in (("parada", PARA, "Idle_A", 0.8), ("andando", ANDA, "Walking_A", 0.45)):
                    ac = mapa.get(tp, padrao)
                    fotos.append(pg.evaluate("a => window.criaturaFoto(a.tp, {}, 'noite', a.ac, a.t)", {"tp": tp, "ac": ac, "t": t}))
                    rot.append(f"{tp} ({nome})")
            _grade(fotos, os.path.join(SAIDA, "catalogo_criaturas.jpg"), cols=6, rotulos=rot)

        if "cenarios" in quais:
            fotos, rot = [], []
            for nm in CEN_NOMES:
                preset = 'dia'
                fotos.append(pg.evaluate("a => window.cenarioFoto(a.nm, a.p)", {"nm": nm, "p": preset}))
                rot.append(nm)
            _grade(fotos, os.path.join(SAIDA, "catalogo_cenarios.jpg"), cols=6, rotulos=rot)
        b.close()
    srv.shutdown()


def main():
    quais = sys.argv[1:] or ["personagens", "criaturas", "cenarios"]
    gerar(set(quais))


if __name__ == "__main__":
    main()
