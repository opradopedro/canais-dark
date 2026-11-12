#!/usr/bin/env python3
"""Prepara o audio/legenda/capa e monta os 3 videos de prova da Entrega 3 (Release 'teste-cartoon').

NAO publica nada no YouTube e NAO altera os canal.json.
Modos:
  python motor-en/preparar_teste_cartoon.py <pasta_prep>
  python motor-en/preparar_teste_cartoon.py --montar <pasta_prep> <pasta_shards> <pasta_final>
"""
import glob, json, os, re, shutil, subprocess, sys, time

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
MOTOR = os.path.join(RAIZ, "hora-muerta", "scripts")
sys.path.insert(0, MOTOR)
sys.path.insert(0, AQUI)

import checar_fim
import mix
import sincronia

ITENS = [
    ("HM041", "hora-muerta", "hora-muerta/stories/041-kilometro-13-1.json", "es"),
    ("SV031", "signal-lost", "signal-lost/stories/031-fourth-floor-1.json", "en"),
    ("CL042", "old-tales", "old-tales/stories/042-wukong-2.json", "en"),
]

# so os codigos pedidos (ex.: TESTE_CARTOON=CL042); a matriz cartoon-shards do canais.yml tem que bater
if os.environ.get("TESTE_CARTOON"):
    _so = set(os.environ["TESTE_CARTOON"].split(","))
    ITENS = [i for i in ITENS if i[0] in _so]


def _env_canal(canal, idioma):
    env = dict(os.environ)
    env["MOTOR_VISUAL"] = "cartoon"
    env["HM_SEM_KOKORO"] = "1"
    env["CANAIS_NARRACOES_DIA"] = "12"
    env["LEGENDA_IDIOMA"] = idioma
    env["LEGENDA_MODELO"] = "small"
    cj = os.path.join(RAIZ, canal, "canal.json")
    c = json.load(open(cj, encoding="utf-8")) if os.path.isfile(cj) else {}
    env["HM_VOZ_TEMPO"] = str(c.get("voz_tempo", "0.9"))
    env["GEMINI_TTS_VOICE"] = c.get("voz", "Algenib")
    env["GEMINI_TTS_ESTILO"] = c.get("estilo_voz", "[whispering] [slow] [deep voice] ")
    env["CAPA_SELO"] = c.get("selo_parte", "PART" if idioma == "en" else "PARTE")
    return env


def _preencher_copia(src_path, dst_path, idioma):
    txt = open(src_path, encoding="utf-8").read()
    if idioma == "es":
        trocas = {"{dia_siguiente}": "mañana", "{fecha_siguiente}": "mañana"}
    else:
        trocas = {
            "{when_next}": "tomorrow, Friday",
            "{next_card}": "TOMORROW",
            "{next_day}": "Friday",
            "{next_date}": "Friday",
            "{dia_siguiente}": "Friday",
            "{fecha_siguiente}": "Friday",
        }
    for k, v in trocas.items():
        txt = txt.replace(k, v)
    open(dst_path, "w", encoding="utf-8").write(txt)


def preparar(pasta_prep):
    os.makedirs(pasta_prep, exist_ok=True)
    for idx, (cod, canal, rel_rot, idioma) in enumerate(ITENS):
        if idx > 0:
            time.sleep(15)
        print(f"\n=== [teste-cartoon: audio/legenda/capa] {cod} ({canal}) ===", flush=True)
        src_rot = os.path.join(RAIZ, rel_rot)
        rot_out = os.path.join(pasta_prep, f"{cod}_roteiro.json")
        wav_out = os.path.join(pasta_prep, f"{cod}_voz.wav")
        tp_out = os.path.join(pasta_prep, f"{cod}_tempos.json")
        tr_out = os.path.join(pasta_prep, f"{cod}_trilha.m4a")
        capa_out = os.path.join(pasta_prep, f"{cod}-cartoon_capa.jpg")

        _preencher_copia(src_rot, rot_out, idioma)
        env = _env_canal(canal, idioma)

        for tent in range(1, 4):
            r = subprocess.run([sys.executable, os.path.join(AQUI, "tts_guard.py"), rot_out, wav_out, tp_out], env=env)
            if r.returncode == 0:
                break
            if tent == 3:
                raise RuntimeError(f"tts_guard.py falhou para {cod} apos 3 tentativas")
            print(f"[{cod}] tts_guard tentativa {tent} falhou; aguardando 25s...", flush=True)
            time.sleep(25)
        # REGRA (12/11): voz que engole o fim ("Parte dos" sem o "mañana") grava de novo 1 vez
        mudas = sincronia.fim_mudo(wav_out, tp_out, idioma)
        if mudas:
            banco = os.environ.get("CANAIS_NARRACOES") or os.path.join(RAIZ, "narracoes")
            for f in glob.glob(os.path.join(banco, f"{cod}_*.wav")):
                os.remove(f)
            print(f"[{cod}] VOZ SEM O FIM ({' '.join(mudas)}): gravo de novo", flush=True)
            subprocess.run([sys.executable, os.path.join(AQUI, "tts_guard.py"), rot_out, wav_out, tp_out], env=env, check=True)
            print(f"[{cod}] fim depois de gravar de novo: {sincronia.fim_mudo(wav_out, tp_out, idioma) or 'falado'}", flush=True)
        if idioma == "es":
            subprocess.run([sys.executable, os.path.join(MOTOR, "mix.py"), rot_out, wav_out, tp_out, tr_out],
                           env=env, check=True)
        else:
            subprocess.run([sys.executable, os.path.join(AQUI, "mix_en.py"), rot_out, wav_out, tp_out, tr_out],
                           env=env, check=True)

        al = sincronia.ajustar(tr_out, tp_out, idioma)
        print(f"[{cod}] legenda alinhada:", json.dumps(al, ensure_ascii=False), flush=True)

        subprocess.run([sys.executable, os.path.join(MOTOR, "capa.py"), rot_out, tp_out, capa_out],
                       env=env, check=True)
        if os.path.exists(wav_out):
            os.remove(wav_out)
        print(f"[{cod}] pronto em {pasta_prep}", flush=True)


def montar(pasta_prep, pasta_shards, pasta_final):
    os.makedirs(pasta_final, exist_ok=True)
    falhas = []
    for cod, canal, _, idioma in ITENS:
        print(f"\n=== [teste-cartoon: montar e conferir] {cod} ({canal}) ===", flush=True)
        tp_out = os.path.join(pasta_prep, f"{cod}_tempos.json")
        tr_out = os.path.join(pasta_prep, f"{cod}_trilha.m4a")
        capa_in = os.path.join(pasta_prep, f"{cod}-cartoon_capa.jpg")
        mp4_final = os.path.join(pasta_final, f"{cod}-cartoon.mp4")
        capa_final = os.path.join(pasta_final, f"{cod}-cartoon_capa.jpg")

        padrao = os.path.join(pasta_shards, "**", f"shard-{cod}-*.mp4")
        shards = sorted(
            glob.glob(padrao, recursive=True),
            key=lambda p: int(re.search(r"-(\d+)\.mp4$", p).group(1)),
        )
        shards = [s for s in shards if os.path.getsize(s) > 0]
        if not shards:
            raise RuntimeError(f"Nenhum shard encontrado para {cod} em {pasta_shards}")

        lista_txt = os.path.join(pasta_final, f"{cod}_shards.txt")
        with open(lista_txt, "w", encoding="utf-8") as f:
            for s in shards:
                caminho = os.path.abspath(s).replace("\\", "/")
                f.write(f"file '{caminho}'\n")

        vid_sem_som = os.path.join(pasta_final, f"{cod}_video.mp4")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                        "-i", lista_txt, "-c", "copy", vid_sem_som], check=True)
        os.remove(lista_txt)

        dur = float(json.load(open(tp_out, encoding="utf-8"))["dur"])
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", vid_sem_som, "-i", tr_out,
                        "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p",
                        "-af", f"afade=t=out:st={max(0.0, dur - 0.8):.2f}:d=0.8",
                        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", mp4_final], check=True)
        os.remove(vid_sem_som)
        if os.path.isfile(capa_in):
            shutil.copy(capa_in, capa_final)

        rel = sincronia.conferir(mp4_final, tp_out, idioma)
        print((f"[{cod}] LEGENDA OK " if rel["ok"] else f"[{cod}] LEGENDA FORA DA VOZ ")
              + json.dumps(rel, ensure_ascii=False), flush=True)
        prob = mix.conferir_audio(mp4_final) if hasattr(mix, "conferir_audio") else []
        print(f"[{cod}] AUDIO OK" if not prob else f"[{cod}] AUDIO COM PROBLEMA: " + "; ".join(prob), flush=True)
        fim = checar_fim.conferir(mp4_final)
        print((f"[{cod}] FIM DO VIDEO OK " if fim["ok"] else f"[{cod}] CHIADO NO FIM DO VIDEO ")
              + json.dumps(fim, ensure_ascii=False), flush=True)
        if not rel["ok"] or not fim["ok"]:
            falhas.append(f"{cod}: legenda={rel['ok']} fim={fim['ok']}")

    if falhas:
        sys.exit("FALHA NA CONFERENCIA DOS VIDEOS DE TESTE: " + ", ".join(falhas))
    print(f"TODOS OS {len(ITENS)} VIDEOS DE TESTE PASSARAM NA CONFERENCIA!", flush=True)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--montar":
        montar(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        preparar(sys.argv[1])
