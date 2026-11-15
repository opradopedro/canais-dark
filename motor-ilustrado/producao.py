#!/usr/bin/env python3
"""Motor ilustrado na PRODUCAO diaria (HM, SV, CL com "visual": "ilustrado"; Pedro 15/11).

O job "rodar" do canais.yml faz voz, trilha, legenda alinhada e capa (CARTOON_PREP) e guarda <COD>_roteiro.json e
<COD>_tempos.json. As fatias do canais.yml chamam:
    python motor-ilustrado/producao.py fatia <roteiro.json> <tempos.json> <i> <n> <saida.mp4>
que baixa os fundos do mundo, monta o estado VERTICAL 9:16 nativo e desenha so a sua parte dos quadros.
O motor-en/cartoon_montar.py junta as fatias, poe o som, confere legenda/fim e agenda (igual ao cartoon).
Tambem: estado (para a capa) e video inteiro (fora do Actions).
"""
import json, os, subprocess, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import montar_estado  # noqa: E402


def estado(roteiro, tempos, pasta, vertical=True):
    rot = json.load(open(roteiro, encoding="utf-8"))
    fundos = os.environ.get("ILUSTRADO_FUNDOS") or os.path.join(pasta, "fundos")  # env: teste local com fundos ja baixados
    if not os.path.isdir(fundos) or not os.listdir(fundos):
        subprocess.run([sys.executable, os.path.join(AQUI, "fundos.py"), "--baixar", rot["mundo"], fundos], check=True)
    est = os.path.join(pasta, "estado_v.json" if vertical else "estado.json")
    montar_estado.montar(roteiro, tempos, fundos, est)
    if vertical:
        e = json.load(open(est)); e["formato"] = "vertical"; json.dump(e, open(est, "w"))
    return est


def fatia(roteiro, tempos, i, n, saida):
    pasta = tempfile.mkdtemp(prefix="ilustrado-")
    est = estado(roteiro, tempos, pasta)
    subprocess.run(["node", os.path.join(AQUI, "render.cjs"), est, saida, "--shard", f"{i}/{n}"], check=True)


def video(roteiro, tempos, saida, n=2):
    """Video inteiro sem som (fora das fatias): n processos em paralelo e junta."""
    pasta = tempfile.mkdtemp(prefix="ilustrado-")
    est = estado(roteiro, tempos, pasta)
    partes = [os.path.join(pasta, f"p{i}.mp4") for i in range(n)]
    procs = [subprocess.Popen(["node", os.path.join(AQUI, "render.cjs"), est, partes[i], "--shard", f"{i}/{n}"]) for i in range(n)]
    if any(p.wait() for p in procs):
        sys.exit("render ilustrado falhou")
    lista = os.path.join(pasta, "lista.txt")
    open(lista, "w").write("".join(f"file '{p}'\n" for p in partes))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", saida], check=True)


def quadro(roteiro, tempos, t, saida_png):
    """Quadro sem legenda (fundo da capa)."""
    pasta = tempfile.mkdtemp(prefix="ilustrado-capa-")
    est = estado(roteiro, tempos, pasta)
    e = json.load(open(est)); e["sem_legenda"] = True; json.dump(e, open(est, "w"))
    subprocess.run(["node", os.path.join(AQUI, "still.cjs"), est, str(t), saida_png], check=True)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "fatia":
        fatia(sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), sys.argv[6])
    elif cmd == "video":
        video(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == "quadro":
        quadro(sys.argv[2], sys.argv[3], float(sys.argv[4]), sys.argv[5])
