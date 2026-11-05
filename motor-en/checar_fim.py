#!/usr/bin/env python3
"""TRAVA DO FIM DO VIDEO: mede o audio dos ultimos segundos do MP4 FINAL e barra chiado/estrondo no fim.

Por que existe (Pedro, 05/11, depois de reclamar ~15 vezes): o "chiado alto e estridente" no ultimo segundo dos
Shorts nao era a voz do Gemini. Era o efeito "susto" (ruido + boom + apito agudo de 1,8-2,2 kHz) que o roteiro
manda tocar no FIM da ultima frase; como so sobra 1,2 s de silencio depois dela, o susto inteiro caia no
ultimo segundo do video, mais alto que a voz (o loudnorm ainda sobe tudo). Os consertos anteriores (fade no fim,
cortar estatica do Gemini) atacavam outra coisa, por isso "voltava": nada media o MP4 que sobe.

Regra (no MP4 que vai para o YouTube, depois de tudo pronto):
  - referencia = volume da fala no corpo do video (percentil 90 das janelas de 50 ms, do 1 s ate 3 s antes do fim);
  - nos ultimos 2 s nenhuma janela pode passar da referencia + 1 dB (fim nao pode ser mais alto que a fala);
  - no ultimo 0,7 s o som tem que estar baixo (referencia - 10 dB): o video termina calmo, sem estouro;
  - chiado: energia acima de 3 kHz nos ultimos 2 s acima do maximo normal do corpo (percentil 99 + 3 dB) por
    0,15 s ou mais (um "s" da fala dura 1 janela; chiado dura varias).

Uso: python motor-en/checar_fim.py video.mp4 [mais.mp4 ...]   -> imprime o laudo; sai 1 se algum reprovar.
No codigo: checar_fim.conferir(mp4) -> {"ok": bool, "motivo": str, ...}
"""
import subprocess, sys
import numpy as np

SR = 48000
JAN = 0.05


def _audio(mp4):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def _janelas(a):
    q = int(SR * JAN); n = len(a) // q
    b = a[: n * q].reshape(n, q).astype(np.float64)
    rms = 20 * np.log10(np.sqrt((b ** 2).mean(axis=1)) + 1e-9)
    esp = np.abs(np.fft.rfft(b * np.hanning(q), axis=1)) ** 2
    f = np.fft.rfftfreq(q, 1 / SR)
    agudo = 10 * np.log10(esp[:, f >= 3000].sum(axis=1) / q + 1e-12)
    return rms, agudo


def conferir(mp4, cauda=2.0, final=0.7):
    a = _audio(mp4)
    dur = len(a) / SR
    if dur < 6:
        return {"ok": True, "motivo": "video curto demais para medir", "dur": dur}
    rms, agudo = _janelas(a)
    t = np.arange(len(rms)) * JAN
    corpo = (t >= 1.0) & (t < dur - 3.0)
    ref = float(np.percentile(rms[corpo], 90))
    ref_agudo = float(np.percentile(agudo[corpo], 99)) + 3.0
    fim = t >= dur - cauda
    ult = t >= dur - final
    pico_fim = float(rms[fim].max()); t_pico = float(t[fim][rms[fim].argmax()])
    nivel_ult = float(rms[ult].max())
    agudo_fim = float(agudo[fim].max())
    n_agudo = int((agudo[fim] > ref_agudo).sum())
    erros = []
    if pico_fim > ref + 1.0:
        erros.append(f"estouro no fim: {pico_fim:.1f} dB em {t_pico:.2f}s (fala {ref:.1f} dB)")
    if nivel_ult > ref - 10.0:
        erros.append(f"ultimo {final}s alto: {nivel_ult:.1f} dB (limite {ref - 10:.1f})")
    if n_agudo >= 3:
        erros.append(f"chiado agudo no fim: {n_agudo * JAN:.2f}s acima de 3 kHz (pico {agudo_fim:.1f}, limite {ref_agudo:.1f})")
    return {"ok": not erros, "motivo": "; ".join(erros) or "fim limpo", "dur": round(dur, 2),
            "fala_db": round(ref, 1), "pico_fim_db": round(pico_fim, 1), "ultimo_db": round(nivel_ult, 1),
            "agudo_fim_db": round(agudo_fim, 1), "agudo_corpo_db": round(ref_agudo, 1)}


def exigir(mp4):
    """Para o produce.py: levanta erro (NAO SUBIU) se o fim do video tiver chiado/estrondo."""
    r = conferir(mp4)
    print(f"fim do video: {'OK' if r['ok'] else 'REPROVADO'} ({r['motivo']})", flush=True)
    if not r["ok"]:
        raise RuntimeError(f"NAO SUBIU: CHIADO NO FIM DO VIDEO ({r['motivo']})")
    return r


if __name__ == "__main__":
    ruim = 0
    for f in sys.argv[1:]:
        r = conferir(f)
        ruim += not r["ok"]
        print(("OK       " if r["ok"] else "REPROVADO"), f, r)
    sys.exit(1 if ruim else 0)
