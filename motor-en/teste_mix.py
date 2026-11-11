"""Teste rapido da mixagem (roda no GitHub a cada mudanca nos scripts de audio).

Por que existe: de 08/11 a 10/11/2026 o Old Tales ficou sem postar porque o mix_en.py quebrava
(UnboundLocalError em mix_motor) so no tema calmo/epico/mito. Este teste mixa uma voz falsa
com um roteiro de cada tema e fica vermelho se qualquer um quebrar, antes de chegar na producao.

Uso: python motor-en/teste_mix.py
"""
import glob, json, os, subprocess, sys, tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def um_por_tema():
    vistos = {}
    for canal in ("old-tales", "signal-lost"):
        for f in sorted(glob.glob(os.path.join(RAIZ, canal, "stories", "*.json"))):
            try:
                h = json.load(open(f, encoding="utf-8"))
            except Exception:
                continue
            tema = (h.get("tema") or "suspense") + ("-3d" if h.get("visual") == "3d" else "")
            if tema not in vistos and h.get("lineas") and h.get("cenas"):
                vistos[tema] = f
    return vistos


def tempos_falsos(h, caminho):
    segs, t = [], 0.5
    for i, l in enumerate(h["lineas"]):
        txt = l if isinstance(l, str) else (l.get("texto") or l.get("text") or "")
        d = max(1.0, len(str(txt).split()) / 2.5)
        segs.append({"i": i, "t0": t, "t1": t + d, "w": []})
        t += d + 0.3
    json.dump({"segs": segs, "dur": t + 1}, open(caminho, "w"))
    return t + 1


def main():
    tmp = tempfile.mkdtemp()
    falhas = []
    for tema, f in um_por_tema().items():
        h = json.load(open(f, encoding="utf-8"))
        tp = os.path.join(tmp, tema + "_tempos.json"); dur = tempos_falsos(h, tp)
        voz = os.path.join(tmp, tema + "_voz.wav"); out = os.path.join(tmp, tema + ".m4a")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"sine=f=220:d={dur:.1f}",
                        "-ar", "24000", voz], check=True)
        r = subprocess.run([sys.executable, os.path.join(RAIZ, "motor-en", "mix_en.py"), f, voz, tp, out],
                           capture_output=True, text=True)
        ok = r.returncode == 0 and os.path.exists(out)
        print(("OK    " if ok else "FALHOU") + f" tema={tema} {os.path.basename(f)}")
        if not ok:
            print(r.stderr[-1500:]); falhas.append(tema)
    if falhas:
        sys.exit("MIX QUEBRADO nos temas: " + ", ".join(falhas))
    print("MIX OK")


if __name__ == "__main__":
    main()
