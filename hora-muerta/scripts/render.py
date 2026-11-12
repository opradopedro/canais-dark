#!/usr/bin/env python3
"""Renderiza o video (sem audio) quadro a quadro: engine.html no Chromium (Playwright) -> FFmpeg.

Uso: python3 render.py historia.json tempos.json video.mp4 [--teste 1.5,10,22]
--teste salva JPGs nesses segundos (ao lado do video) em vez de renderizar tudo: use para conferir cenas.
1080x1920, 30 fps. Um Short de 45 s leva poucos minutos numa maquina comum.
"""
import argparse, base64, functools, http.server, json, os, socket, subprocess, sys, threading
from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, motor_visual, node_bin, resolver

ENGINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "engine.html")
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# raiz do motor 3D (motor-3d/, irma de hora-muerta/): engine.html + kit/ + vendor/ + assets/ + fontes/
MOTOR3D = os.path.join(RAIZ, "motor-3d")
MOTOR_CARTOON = os.path.join(RAIZ, "motor-cartoon")
GRAB = "t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.9).split(',')[1]; }"


class _Motor3DHandler(http.server.SimpleHTTPRequestHandler):
    """Serve motor-3d/ com o Content-Type CERTO: Chromium recusa modulo ES servido como text/plain.
    O SimpleHTTPRequestHandler no Windows marca .js como text/plain; aqui forcamos application/javascript."""
    def log_message(self, *a):
        pass  # silencio (nao polui o stdout do render)

    def guess_type(self, path):
        p = str(path).lower()
        if p.endswith(".js") or p.endswith(".mjs"):
            return "application/javascript"
        if p.endswith(".glb"):
            return "model/gltf-binary"
        if p.endswith(".json"):
            return "application/json"
        if p.endswith(".ttf"):
            return "font/ttf"
        return super().guess_type(path)


def _servidor_motor3d():
    """Sobe um http.server LOCAL (so 127.0.0.1) numa porta livre, em thread, servindo motor-3d/.
    Modulos ES e GLTFLoader com fetch nao funcionam por file://; por isso o 3D precisa de http."""
    porta = _porta_livre()
    Handler = functools.partial(_Motor3DHandler, directory=MOTOR3D)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", porta), Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv, porta


def _porta_livre():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0)); porta = s.getsockname()[1]; s.close()
    return porta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("historia"); ap.add_argument("tempos"); ap.add_argument("video")
    ap.add_argument("--teste"); ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    raw_h = carregar(a.historia)
    estado = resolver(raw_h, json.load(open(a.tempos)))
    tresd = estado.get("visual") in ("3d", "cartoon")
    if estado.get("visual") == "cartoon" or (tresd and motor_visual(a.historia, raw_h) == "cartoon"):
        if os.environ.get("CARTOON_PREP") and not a.teste:
            # producao em fatias (canais.yml, jobs cartoon-*): aqui so guarda o roteiro ja preenchido ao lado dos
            # tempos; o desenho roda em paralelo nas fatias e motor-en/cartoon_montar.py junta, confere e sobe
            import shutil
            base = os.path.abspath(a.video)[:-len("_video.mp4")] if a.video.endswith("_video.mp4") else os.path.splitext(os.path.abspath(a.video))[0]
            shutil.copy(a.historia, base + "_roteiro.json")
            print("CARTOON_PREP: roteiro guardado para as fatias", base + "_roteiro.json", flush=True)
            return
        cmd = [node_bin(), os.path.join(MOTOR_CARTOON, "render.mjs"),
               "--roteiro", os.path.abspath(a.historia),
               "--tempos", os.path.abspath(a.tempos),
               "--saida", os.path.abspath(a.video)]
        if a.teste:
            cmd += ["--teste", a.teste]
        subprocess.run(cmd, check=True)
        print("ok", a.video)
        return
    srv = None
    with sync_playwright() as p:
        try:
            b = p.chromium.launch()
        except Exception:  # playwright do pip mais novo que o Chromium da maquina: usa o instalado
            b = p.chromium.launch(executable_path=os.environ.get("HM_CHROMIUM", "/opt/pw-browsers/chromium"))
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        if tresd:
            # 3D: engine.html de motor-3d/ servido por http local; espera TODOS os .glb carregarem (window.pronto)
            srv, porta = _servidor_motor3d()
            pg.goto(f"http://127.0.0.1:{porta}/engine.html")
            pg.wait_for_function("() => typeof window.setup === 'function'", timeout=30000)
            pg.evaluate("h => setup(h)", estado)
            pg.wait_for_function("() => window.pronto === true", timeout=120000)
        else:
            # 2D (flat): engine.html do canal, via file:// (como sempre)
            pg.goto("file://" + ENGINE)
            pg.evaluate("h => setup(h)", estado)
        def quadro(t):
            # em 3D, espera a cena do instante t ficar montada (troca de cenario/luz e async) antes de desenhar
            if tresd:
                pg.evaluate("t => window.prepararQuadro(t)", t)
            return base64.b64decode(pg.evaluate(GRAB, t))

        if a.teste:
            base = os.path.splitext(a.video)[0]
            for t in [float(v) for v in a.teste.split(",")]:
                open(f"{base}_{t:05.1f}.jpg", "wb").write(quadro(t))
        else:
            n = int(estado["dur"] * a.fps)
            ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(a.fps),
                                   "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
                                   "-preset", "medium", a.video], stdin=subprocess.PIPE)
            for i in range(n):
                ff.stdin.write(quadro(i / a.fps))
            ff.stdin.close(); ff.wait()
        b.close()
    if srv:
        srv.shutdown()
    print("ok", a.video)


if __name__ == "__main__":
    main()
