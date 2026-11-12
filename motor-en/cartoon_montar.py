#!/usr/bin/env python3
"""Producao no motor cartoon, ultima etapa: junta as fatias, poe o som, confere e agenda no YouTube.

O job "rodar" do canais.yml roda o produce.py do canal com CARTOON_PREP=1: ele grava voz, trilha, legenda alinhada,
capa, <COD>_roteiro.json e <COD>_upload.json (com o horario) e para antes de desenhar. Os jobs "cartoon-fatias"
desenham cada roteiro em pedacos paralelos (motor-cartoon/render.mjs --shard i/N). Este script, no job
"cartoon-montar", faz o resto com as MESMAS travas da producao normal (legenda colada na voz e fim sem chiado):
legenda fora da voz ou chiado no fim NAO SOBE.

Uso: python motor-en/cartoon_montar.py <canal> <pasta_prep> <pasta_fatias> [--sem-subir]
"""
import datetime as dt
import glob
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
PAINEL = {"signal-lost": "sv", "old-tales": "cl", "hora-muerta": "hm"}


def _modulo(nome, caminho):
    spec = importlib.util.spec_from_file_location(nome, caminho)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def fatias_de(pasta_fatias, cod):
    fs = glob.glob(os.path.join(pasta_fatias, "**", f"fatia-{cod}-*.mp4"), recursive=True)
    fs = [f for f in fs if os.path.getsize(f) > 0]
    return sorted(fs, key=lambda p: int(re.search(r"-(\d+)\.mp4$", p).group(1)))


def montar_um(base, fatias, saida_mp4):
    lista = base + "_fatias.txt"
    with open(lista, "w", encoding="utf-8") as f:
        for s in fatias:
            f.write(f"file '{os.path.abspath(s)}'\n")
    sem_som = base + "_video.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", sem_som],
                   check=True)
    dur = float(json.load(open(base + "_tempos.json", encoding="utf-8"))["dur"])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sem_som, "-i", base + "_trilha.m4a",
                    "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-crf", "24", "-preset", "slow",
                    "-pix_fmt", "yuv420p", "-af", f"afade=t=out:st={max(0.0, dur - 0.8):.2f}:d=0.8",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", saida_mp4], check=True)
    os.remove(sem_som)
    os.remove(lista)


def main():
    canal, prep, pasta_fatias = sys.argv[1], sys.argv[2], sys.argv[3]
    subir = "--sem-subir" not in sys.argv
    hm = canal == "hora-muerta"
    if hm:
        sys.path.insert(0, os.path.join(RAIZ, "hora-muerta", "scripts"))
        prod = _modulo("produce_hm", os.path.join(RAIZ, "hora-muerta", "scripts", "produce.py"))
        yt = _modulo("yt_upload_hm", os.path.join(RAIZ, "hora-muerta", "scripts", "yt_upload.py"))
        os.environ.setdefault("YT_TOKEN_VAR", "YT_REFRESH_TOKEN_ES")
        c, idioma = {}, "es"
    else:
        prod = _modulo("produce_en", os.path.join(AQUI, "produce.py"))
        c = prod.ler_canal(os.path.join(RAIZ, canal))
        prod.aplicar_ambiente(c)
        import yt_upload as yt
        yt.configurar(c["prefixo"], c["idioma"])
        idioma = c["idioma"]
    ups = sorted(glob.glob(os.path.join(prep, "*_upload.json")))
    if not ups:
        print("nada preparado (fila cheia ou sem roteiro): nada a montar")
        return 0
    painel = os.path.join(RAIZ, "painel-saida", PAINEL.get(canal, canal))
    os.makedirs(painel, exist_ok=True)
    falhas = []
    for upj in ups:
        base = upj[:-len("_upload.json")]
        cod = os.path.basename(base)
        fatias = fatias_de(pasta_fatias, cod)
        print(f"\n=== {cod}: {len(fatias)} fatia(s) ===", flush=True)
        if not fatias:
            falhas.append(f"{cod}: nenhuma fatia desenhada")
            continue
        montar_um(base, fatias, base + ".mp4")
        leg, ok = prod.revisar(base, idioma)
        if not leg:
            falhas.append(f"NAO SUBIU {cod}: LEGENDA FORA DA VOZ ou CHIADO NO FIM (motor cartoon)")
            continue
        up = json.load(open(upj, encoding="utf-8"))
        up["arquivo"] = os.path.abspath(base + ".mp4")
        if up.get("miniatura"):
            up["miniatura"] = os.path.abspath(base + "_capa.jpg")
        # horario que ja passou enquanto as fatias desenhavam (ex.: "furar fila" = sai na hora): +20 min a partir de agora
        agora = dt.datetime.now(dt.timezone.utc)
        if up.get("publicar_em"):
            quando = dt.datetime.strptime(up["publicar_em"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=dt.timezone.utc)
            if quando < agora + dt.timedelta(minutes=15):
                up["publicar_em"] = (agora + dt.timedelta(minutes=20)).strftime("%Y-%m-%dT%H:%M:%SZ")
        json.dump(up, open(upj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        vid = None
        if subir:
            r = yt.subir(upj) if hm else yt.subir(upj, c.get("canal_titulo"))
            vid = r["id"]
            print(f"AGENDADO {cod} https://youtu.be/{vid} publica em {up.get('publicar_em')} (UTC)", flush=True)
        # copia para o painel (Release painel-<canal>), igual a producao normal (guardar do produce.py)
        try:
            os.environ[{"hora-muerta": "HM_VIDEOS", "old-tales": "CL_VIDEOS", "signal-lost": "SV_VIDEOS"}[canal]] = painel
            prod.guardar(cod, base, up, vid) if hm else prod.guardar(c, cod, base, up, vid)
        except Exception as e:
            print("copia do painel falhou (o video subiu):", e, flush=True)
    if falhas:
        print("\n".join(falhas), flush=True)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
