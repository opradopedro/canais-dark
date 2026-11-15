#!/usr/bin/env python3
"""Pecas 16:9 do VIDEO LONGO no motor ilustrado (usado pelo motor-en/longo_montar.py).

- de_trilha(): parte que ja saiu como Short. Usa a voz/trilha e os tempos GUARDADOS na producao (Release longo-<canal>),
  entao nao grava voz de novo (nao gasta a cota de narracao) e desenha o mesmo roteiro em 16:9 nativo.
- do_roteiro(): peca nova (abertura e epilogo do longo, ou parte sem trilha guardada): voz + trilha + legenda alinhada
  + desenho 16:9, com as mesmas conferencias da producao (legenda presa na voz e fim sem chiado).
Os dois devolvem (mp4 com som, tempos.json, legenda_ok).
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, os.path.join(RAIZ, "motor-en"))
sys.path.insert(0, os.path.join(RAIZ, "hora-muerta", "scripts"))
sys.path.insert(0, AQUI)
import montar_estado  # noqa: E402

CANAL = {"CL": ("old-tales", "en"), "HM": ("hora-muerta", "es"), "SV": ("signal-lost", "en")}


def rodar(cmd, env=None):
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, env=env)


def _desenhar(rot, tp, tr, pasta, cod, n=2):
    """Desenho 16:9 (n processos) + som. O fim some suave nos ultimos 0,8 s (trava de chiado)."""
    mundo = json.load(open(rot, encoding="utf-8"))["mundo"]
    fundos = os.path.join(pasta, "fundos-" + mundo)
    if not os.path.isdir(fundos) or not os.listdir(fundos):
        rodar([sys.executable, os.path.join(AQUI, "fundos.py"), "--baixar", mundo, fundos])
    est = os.path.join(pasta, f"{cod}_estado.json")
    montar_estado.montar(rot, tp, fundos, est)  # sem "formato": vertical = 16:9
    partes = [os.path.join(pasta, f"{cod}_h{i}.mp4") for i in range(n)]
    procs = [subprocess.Popen(["node", os.path.join(AQUI, "render.cjs"), est, partes[i], "--shard", f"{i}/{n}"]) for i in range(n)]
    if any(p.wait() for p in procs):
        raise RuntimeError(f"desenho 16:9 de {cod} falhou")
    lista = os.path.join(pasta, f"{cod}_lista.txt")
    open(lista, "w").write("".join(f"file '{p}'\n" for p in partes))
    mudo = os.path.join(pasta, f"{cod}_mudo.mp4")
    rodar(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", mudo])
    dur = float(json.load(open(tp))["dur"])
    h = os.path.join(pasta, f"{cod}-horizontal.mp4")
    rodar(["ffmpeg", "-v", "error", "-y", "-i", mudo, "-i", tr, "-c:v", "libx264", "-crf", "21", "-preset", "medium",
           "-pix_fmt", "yuv420p", "-af", f"afade=t=out:st={max(0.0, dur - 0.8):.2f}:d=0.8", "-c:a", "aac", "-b:a", "192k",
           "-shortest", "-movflags", "+faststart", h])
    return h


def _conferir(h, tp, idioma):
    import sincronia
    rel = sincronia.conferir(h, tp, idioma)
    print("LEGENDA", "OK" if rel["ok"] else "FORA", json.dumps(rel, ensure_ascii=False)[:300], flush=True)
    return bool(rel["ok"])


def de_trilha(rot, tp, tr, pasta):
    cod = json.load(open(rot, encoding="utf-8"))["codigo"]
    idioma = CANAL[cod[:2]][1]
    h = _desenhar(rot, tp, tr, pasta, cod)
    return h, tp, _conferir(h, tp, idioma)


def do_roteiro(rot_src, pasta):
    import preparar_teste_cartoon as ptc
    import sincronia
    os.makedirs(pasta, exist_ok=True)
    cod = json.load(open(rot_src, encoding="utf-8"))["codigo"]
    canal, idioma = CANAL[cod[:2]]
    rot, wav, tp, tr = (os.path.join(pasta, f"{cod}_{n}") for n in ("roteiro.json", "voz.wav", "tempos.json", "trilha.m4a"))
    ptc._preencher_copia(rot_src, rot, idioma)
    env = ptc._env_canal(canal, idioma)
    tts = [sys.executable, os.path.join(RAIZ, "motor-en", "tts_guard.py"), rot, wav, tp]
    rodar(tts, env)
    if sincronia.fim_mudo(wav, tp, idioma):
        print("VOZ SEM O FIM: gravo de novo", flush=True)
        rodar(tts, env)
    mix = os.path.join(RAIZ, "motor-en", "mix_en.py") if idioma == "en" else os.path.join(RAIZ, "hora-muerta", "scripts", "mix.py")
    rodar([sys.executable, mix, rot, wav, tp, tr], env)
    print("legenda:", sincronia.ajustar(tr, tp, idioma), flush=True)
    h = _desenhar(rot, tp, tr, pasta, cod)
    return h, tp, _conferir(h, tp, idioma)
