#!/usr/bin/env python3
"""Prova do motor ilustrado no Actions: voz (Gemini) + trilha + legenda alinhada + fundos + desenho + conferencia.
NAO publica no YouTube. Saida na Release "teste-ilustrado" (16:9 e vertical).
Uso: python motor-ilustrado/preparar_teste.py motor-ilustrado/testes/wukong-1.json /tmp/ilustrado
"""
import json, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, os.path.join(RAIZ, "motor-en"))
sys.path.insert(0, os.path.join(RAIZ, "hora-muerta", "scripts"))
import preparar_teste_cartoon as ptc  # noqa: E402  (mesmo ambiente de voz por canal)
import sincronia, checar_fim  # noqa: E402
import montar_estado  # noqa: E402

CANAL = {"CL": ("old-tales", "en"), "HM": ("hora-muerta", "es"), "SV": ("signal-lost", "en")}


def rodar(cmd, env=None):
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, env=env)


def main(rot_src, pasta):
    os.makedirs(pasta, exist_ok=True)
    rot = json.load(open(rot_src, encoding="utf-8"))
    cod = rot["codigo"]
    canal, idioma = CANAL[cod[:2]]
    rot_out, wav, tp, tr = (os.path.join(pasta, f"{cod}_{n}") for n in ("roteiro.json", "voz.wav", "tempos.json", "trilha.m4a"))
    ptc._preencher_copia(rot_src, rot_out, idioma)
    env = ptc._env_canal(canal, idioma)
    rodar([sys.executable, os.path.join(RAIZ, "motor-en", "tts_guard.py"), rot_out, wav, tp], env)
    mudas = sincronia.fim_mudo(wav, tp, idioma)
    if mudas:
        print("VOZ SEM O FIM:", mudas, "- gravo de novo", flush=True)
        rodar([sys.executable, os.path.join(RAIZ, "motor-en", "tts_guard.py"), rot_out, wav, tp], env)
    mix = os.path.join(RAIZ, "motor-en", "mix_en.py") if idioma == "en" else os.path.join(RAIZ, "hora-muerta", "scripts", "mix.py")
    rodar([sys.executable, mix, rot_out, wav, tp, tr], env)
    print("legenda:", sincronia.ajustar(tr, tp, idioma), flush=True)
    fundos = os.path.join(pasta, "fundos")
    rodar([sys.executable, os.path.join(AQUI, "fundos.py"), "--baixar", rot["mundo"], fundos])
    est = os.path.join(pasta, "estado.json")
    montar_estado.montar(rot_out, tp, fundos, est)
    # vertical NATIVO 9:16 (camera segue os atores; Pedro/retencao 14/11: nada de 16:9 no meio com faixas borradas)
    est_v = os.path.join(pasta, "estado_v.json")
    ev = json.load(open(est)); ev["formato"] = "vertical"; json.dump(ev, open(est_v, "w"))
    # desenho em 2 processos paralelos por formato (4 ao todo)
    n = 2
    procs = [subprocess.Popen(["node", os.path.join(AQUI, "render.cjs"), e, os.path.join(pasta, f"{nome}{i}.mp4"), "--shard", f"{i}/{n}"])
             for nome, e in (("f", est), ("g", est_v)) for i in range(n)]
    if any(p.wait() for p in procs):
        sys.exit("render falhou")
    mudos = {}
    for nome in ("f", "g"):
        lista = os.path.join(pasta, f"lista_{nome}.txt")
        open(lista, "w").write("".join(f"file '{os.path.join(pasta, f'{nome}{i}.mp4')}'\n" for i in range(n)))
        mudos[nome] = os.path.join(pasta, f"mudo_{nome}.mp4")
        rodar(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", mudos[nome]])
    mudo = mudos["f"]
    dur = float(json.load(open(tp))["dur"])
    h = os.path.join(pasta, f"{cod}-horizontal.mp4")
    rodar(["ffmpeg", "-v", "error", "-y", "-i", mudo, "-i", tr, "-c:v", "libx264", "-crf", "22", "-preset", "medium", "-pix_fmt", "yuv420p",
           "-af", f"afade=t=out:st={max(0.0, dur - 0.8):.2f}:d=0.8", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", h])
    v = os.path.join(pasta, f"{cod}-vertical.mp4")
    rodar(["ffmpeg", "-v", "error", "-y", "-i", mudos["g"], "-i", h, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "22",
           "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", "-movflags", "+faststart", v])
    rel = sincronia.conferir(h, tp, idioma)
    fim = checar_fim.conferir(h)
    print("LEGENDA", "OK" if rel["ok"] else "FORA", json.dumps(rel, ensure_ascii=False), flush=True)
    print("FIM", "OK" if fim["ok"] else "COM CHIADO", json.dumps(fim, ensure_ascii=False), flush=True)
    rodar(["gh", "release", "view", "teste-ilustrado"]) if subprocess.run(["gh", "release", "view", "teste-ilustrado"], capture_output=True).returncode == 0 else \
        rodar(["gh", "release", "create", "teste-ilustrado", "--title", "Provas do motor ilustrado", "--notes", "Nao publicado. So para o Pedro avaliar."])
    rodar(["gh", "release", "upload", "teste-ilustrado", h, v, tp, "--clobber"])
    if not rel["ok"] or not fim["ok"]:
        sys.exit("conferencia reprovou")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
