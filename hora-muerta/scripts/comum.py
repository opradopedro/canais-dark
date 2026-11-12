"""Leitura do roteiro (stories/*.json) e conversao de eventos e cenas para segundos."""
import json, os, shutil


def carregar(path):
    h = json.load(open(path, encoding="utf-8"))
    h["lineas"] = [l if isinstance(l, dict) else {"texto": l} for l in h["lineas"]]
    return h


def motor_visual(path, h=None):
    """Devolve o motor visual do canal ('cartoon' ou None): le MOTOR_VISUAL ou o canal.json do canal."""
    if os.environ.get("MOTOR_VISUAL"):
        return os.environ["MOTOR_VISUAL"]
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    cands = [os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(path))), "canal.json")]
    cod = (h or {}).get("codigo", "")
    for pref, pasta in (("HM", "hora-muerta"), ("SV", "signal-lost"), ("CL", "old-tales")):
        if cod.startswith(pref):
            cands.append(os.path.join(raiz, pasta, "canal.json"))
    for cj in cands:
        if os.path.isfile(cj):
            try:
                mv = json.load(open(cj, encoding="utf-8")).get("motor_visual")
                if mv:
                    return mv
            except Exception:
                pass
    return None


def node_bin():
    """Encontra o executavel do Node 22 (PATH ou Kiro-Cli no Windows)."""
    n = shutil.which("node")
    if n:
        return n
    for p in (
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Kiro-Cli", "node.exe"),
        r"C:\Program Files\nodejs\node.exe",
    ):
        if p and os.path.isfile(p):
            return p
    return "node"


def _tempo(segs, ref):
    """ref = {"linea": i, "en": "inicio"|"fin"|fracao 0..1, "mas": segundos}"""
    s = segs[ref["linea"]]
    en = ref.get("en", "inicio")
    base = s["t0"] if en == "inicio" else s["t1"] if en == "fin" else s["t0"] + (s["t1"] - s["t0"]) * float(en)
    return round(base + float(ref.get("mas", 0)), 3)


def resolver(h, timing):
    """Devolve o dicionario que o engine.html recebe em setup().

    2D (visual != "3d"): cada cena tem "comp" + "p" (engine flat).
    3D (visual == "3d"): cada cena tem "cena" (cenario/marca/plano/luz/efeito/atores/criatura); o elenco (atores
    declarados uma vez) vai em "elenco". Mesma linha do tempo (t0 por cena) e mesma legenda (segs com w por palavra).
    """
    segs = timing["segs"]
    tresd = h.get("visual") in ("3d", "cartoon")
    cenas = []
    for i, c in enumerate(h["cenas"]):
        t0 = 0 if i == 0 else _tempo(segs, {"en": "inicio", "mas": -0.25, **c})
        if tresd:
            cenas.append({"t0": t0, "cena": c.get("cena", {})})
        else:
            cenas.append({"t0": t0, "comp": c["comp"], "p": c.get("p", {})})
    eventos = [{"tipo": e["tipo"], "t": _tempo(segs, e), "dur": e.get("dur")} for e in h.get("eventos", [])]
    eventos.sort(key=lambda e: e["t"])
    gancho = None
    if h.get("gancho"):
        g = h["gancho"]
        ini = cenas[g["cena"]]["t0"] - 0.5
        ev = next((e for e in eventos if e["tipo"] == g["evento"] and e["t"] >= ini), None)
        if ev:
            gancho = {"cena": g["cena"], "t": ev["t"] + g.get("mas", 0.4), "dur": g.get("dur", 0.8)}
    return {"segs": segs, "cenas": cenas, "eventos": eventos, "destaque": h.get("destaque", []),
            "gancho": gancho, "dur": timing["dur"], "tema": h.get("tema"),
            "visual": h.get("visual"), "paleta": h.get("paleta"),
            "serie": h.get("serie", ""), "parte": int(h.get("parte", 1) or 1), "codigo": h.get("codigo", ""),
            "elenco": h.get("elenco", {})}
