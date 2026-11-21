#!/usr/bin/env python3
"""TRAVA DO FIM DO VIDEO: mede o audio dos ultimos segundos do MP4 FINAL e barra chiado/estrondo no fim.

Por que existe (Pedro, 05/11, depois de reclamar ~15 vezes): o "chiado alto e estridente" no ultimo segundo dos
Shorts nao era a voz do Gemini. Era o efeito "susto" (ruido + boom + apito agudo de 1,8-2,2 kHz) que o roteiro
manda tocar no FIM da ultima frase; como so sobra 1,2 s de silencio depois dela, o susto inteiro caia no
ultimo segundo do video, mais alto que a voz (o loudnorm ainda sobe tudo). Os consertos anteriores (fade no fim,
cortar estatica do Gemini) atacavam outra coisa, por isso "voltava": nada media o MP4 que sobe.
O SUSTO NO FIM PODE (Pedro, 05/11: e bom para o engajamento); o que esta trava barra e o chiado e o estouro: o
mix.py deixa o efeito do fim so no grave e no volume da voz.

Regra (no MP4 que vai para o YouTube, depois de tudo pronto):
  - referencia = volume da fala no corpo do video (percentil 90 das janelas de 50 ms, do 1 s ate 3 s antes do fim);
  - nos ultimos 2 s nenhuma janela pode passar da referencia + 1 dB (fim nao pode ser mais alto que a fala);
  - no ultimo 0,7 s o som tem que estar baixo (referencia - 10 dB): o video termina calmo, sem estouro;
  - som solto: depois que a fala acaba nada volta a soar (estalo do Gemini, efeito);
  - chiado: energia acima de 3 kHz nos ultimos 2 s acima do maximo normal do corpo (percentil 99 + 3 dB) por
    0,15 s ou mais (um "s" da fala dura 1 janela; chiado dura varias).

Uso: python motor-en/checar_fim.py [--consertar] video.mp4 [mais.mp4 ...]   -> imprime o laudo; sai 1 se algum reprovar.
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
    # som solto depois que a fala acabou (estalo de estatica do Gemini, efeito, estrondo): nos ultimos 2 s, depois de
    # um respiro de 0,1 s ou mais abaixo de fala-25 dB, nada pode voltar acima de fala-20 dB e terminar no fim
    q = rms[fim]; tf = t[fim]
    alto = q > ref - 20.0
    if alto.any():
        k = np.where(alto)[0][-1]  # ultima janela alta
        i = k
        while i - 1 >= 0 and alto[i - 1]:
            i -= 1
        ilha = (k - i + 1) * JAN
        antes = 0
        j = i - 1
        while j >= 0 and q[j] < ref - 25.0:
            antes += 1; j -= 1
        if antes * JAN >= 0.1 and ilha <= 0.6 and j >= 0:
            erros.append(f"som solto depois da fala: {ilha:.2f}s em {tf[i]:.2f}s ({q[i:k + 1].max():.1f} dB)")
    if n_agudo >= 3:
        erros.append(f"chiado agudo no fim: {n_agudo * JAN:.2f}s acima de 3 kHz (pico {agudo_fim:.1f}, limite {ref_agudo:.1f})")
    # ESTATICA DE TV (estalo do Gemini) em QUALQUER ponto do video (HM003/HM021/HM022: 0,13-0,16 s de ruido branco
    # a -14 dB colado na ultima frase). Detector em motor-en/estatica.py (espectro chato = ruido; um "s" nao e chato).
    import estatica
    for i0, i1 in estatica.achar_estatica(a, SR, ref=ref):
        if (i1 - i0) / SR >= 0.08:
            erros.append(f"estatica de TV (chiado) em {i0 / SR:.2f}s ({(i1 - i0) / SR:.2f}s)")
    return {"ok": not erros, "motivo": "; ".join(erros) or "fim limpo", "dur": round(dur, 2),
            "fala_db": round(ref, 1), "pico_fim_db": round(pico_fim, 1), "ultimo_db": round(nivel_ult, 1),
            "agudo_fim_db": round(agudo_fim, 1), "agudo_corpo_db": round(ref_agudo, 1)}


CONSERTAVEL = ("estouro no fim", "ultimo ")


def consertar(mp4, voltas=5):
    """CONSERTO AUTOMATICO do fim (21/11: SV040 barrado 3 dias seguidos porque a ULTIMA PALAVRA da voz saiu 1,5 dB
    mais alta que a fala; nao era chiado nem susto). So mexe quando o laudo reprova APENAS por volume (estouro no fim /
    ultimo trecho alto): abaixa o volume dos ultimos 2 s so onde passa do limite (a fala continua inteira, so um
    pouco mais baixa) e confere de novo. Chiado agudo, estatica e som solto NAO sao consertados aqui (voz nova).
    Devolve o laudo final (o MP4 e reescrito no lugar, video copiado sem recodificar)."""
    import os, tempfile
    r = conferir(mp4)
    if r["ok"]:
        return r
    partes = [m.strip() for m in r["motivo"].split(";")]
    if not all(m.startswith(CONSERTAVEL) for m in partes):
        return r
    for volta in range(1, voltas + 1):
        a = _audio(mp4).astype(np.float64)
        dur = len(a) / SR
        rms, _ = _janelas(a)
        t = np.arange(len(rms)) * JAN
        corpo = (t >= 1.0) & (t < dur - 3.0)
        ref = float(np.percentile(rms[corpo], 90))
        alvo = np.full(len(rms), np.inf)
        alvo[t >= dur - 2.4] = ref - 0.5 - 0.5 * volta
        alvo[t >= dur - 1.0] = ref - 12.0 - volta
        g = np.minimum(0.0, alvo - rms)  # dB por janela
        g = np.minimum(g, np.minimum(np.roll(g, 1), np.roll(g, -1)))  # vizinhas tambem (sem degrau na borda)
        q = int(SR * JAN)
        centros = (np.arange(len(g)) + 0.5) * q
        ganho = 10 ** (np.interp(np.arange(len(a)), centros, g) / 20)
        b = (a * ganho).astype(np.float32)
        d = tempfile.mkdtemp()
        raw, novo = os.path.join(d, "a.f32"), os.path.join(d, "novo.mp4")
        b.tofile(raw)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", raw,
                        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ac", "2",
                        "-movflags", "+faststart", "-shortest", novo], check=True)
        os.replace(novo, mp4)
        os.remove(raw); os.rmdir(d)
        r = conferir(mp4)
        print(f"conserto do fim, volta {volta}: {'OK' if r['ok'] else r['motivo']}", flush=True)
        if r["ok"]:
            r["consertado"] = volta
            return r
    return r


def exigir(mp4):
    """Para o produce.py: levanta erro (NAO SUBIU) se o fim do video tiver chiado/estrondo."""
    r = conferir(mp4)
    print(f"fim do video: {'OK' if r['ok'] else 'REPROVADO'} ({r['motivo']})", flush=True)
    if not r["ok"]:
        raise RuntimeError(f"NAO SUBIU: CHIADO NO FIM DO VIDEO ({r['motivo']})")
    return r


if __name__ == "__main__":
    ruim = 0
    arrumar = "--consertar" in sys.argv
    for f in [x for x in sys.argv[1:] if x != "--consertar"]:
        r = consertar(f) if arrumar else conferir(f)
        ruim += not r["ok"]
        print(("OK       " if r["ok"] else "REPROVADO"), f, r)
    sys.exit(1 if ruim else 0)
