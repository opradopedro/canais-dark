"""Trilha de ACAO do Old Tales (REGRA do Pedro, 12/11: "tira essa musica de crianca e coloca uma de acao").

Feita em codigo (custo zero, sem licenca): tambores taiko graves, ostinato de cordas na escala pentatonica menor
(cara de lenda antiga), drone grave e golpe de tambor nas viradas. Comeca so com tambor e cresce.
Nada toca depois que a narracao acaba (o mix_en.py ja corta tudo no fim).

Uso direto (para ouvir): python motor-en/trilha_acao.py saida.wav 60
"""
import numpy as np

BPM = 104


def _taiko(sr, f0=95.0, f1=42.0, dur=0.55, ruido=0.25, seed=0):
    t = np.arange(int(dur * sr)) / sr
    f = f1 + (f0 - f1) * np.exp(-t / 0.06)
    fase = 2 * np.pi * np.cumsum(f) / sr
    corpo = np.sin(fase) * np.exp(-t / 0.18) + 0.45 * np.sin(2.3 * fase) * np.exp(-t / 0.07)  # pele: aparece no celular
    rng = np.random.default_rng(seed)
    ataque = rng.standard_normal(len(t)) * np.exp(-t / 0.012)
    ataque = np.convolve(ataque, np.ones(3) / 3, "same")  # tira o chiado agudo
    return (corpo + ruido * ataque).astype(np.float32)


def _corda(sr, f, dur, brilho=0.5):
    t = np.arange(int(dur * sr)) / sr
    x = np.zeros_like(t)
    for k in range(1, 9):  # dente de serra suave (sem agudo demais)
        x += np.sin(2 * np.pi * f * k * t) / k * (brilho ** (k - 1))
    env = np.minimum(1, t / 0.015) * np.exp(-t / (dur * 0.6))
    return (x * env).astype(np.float32)


def _pb(x, sr, fc, passes=2):
    """Passa-baixa barato: media movel repetida (sem scipy)."""
    n = max(1, int(sr / (2.2 * fc)))
    k = np.ones(n, dtype=np.float32) / n
    for _ in range(passes):
        x = np.convolve(x, k, "same")
    return x.astype(np.float32)


def trilha_acao(n, sr, viradas=(), seed=7):
    """n amostras de trilha de acao, rms ~0,1. viradas = tempos (s) de golpe forte (troca de cena importante)."""
    out = np.zeros(n + sr * 2, np.float32)
    batida = 60.0 / BPM
    compasso = 4 * batida
    dur = n / sr
    grande = _taiko(sr, 92, 40, 0.7, 0.3, seed)
    medio = _taiko(sr, 150, 75, 0.35, 0.35, seed + 1)
    aro = _taiko(sr, 420, 300, 0.08, 0.6, seed + 2) * 0.35

    def por(buf, s, t, g):
        i = int(t * sr)
        if 0 <= i < len(buf):
            j = min(len(buf), i + len(s))
            buf[i:j] += s[: j - i] * g

    # tambores: 1 e 3 grandes, contratempo medio, rufar no fim de cada 4 compassos
    c, t0 = 0, 0.0
    while t0 < dur:
        cresce = min(1.0, 0.55 + 0.45 * t0 / max(1.0, dur * 0.5))
        por(out, grande, t0, 1.0 * cresce)
        por(out, medio, t0 + 1.5 * batida, 0.55 * cresce)
        por(out, grande, t0 + 2 * batida, 0.8 * cresce)
        por(out, medio, t0 + 3 * batida, 0.5 * cresce)
        por(out, aro, t0 + 3.5 * batida, 0.6 * cresce)
        if c % 4 == 3:
            for k in range(6):
                por(out, medio, t0 + 3 * batida + k * batida / 6, (0.35 + 0.1 * k) * cresce)
        c += 1
        t0 += compasso
    tambor = _pb(out, sr, 4000, 1)

    # ostinato de cordas (pentatonica menor em Re), colcheias, entra no 3o compasso; sobe um tom a cada 2 compassos
    notas = [73.42, 73.42, 87.31, 73.42, 98.0, 87.31, 110.0, 98.0]  # D2 D2 F2 D2 G2 F2 A2 G2
    cordas = np.zeros_like(out)
    passo = batida / 2
    t, i = 2 * compasso, 0
    while t < dur:
        f = notas[i % len(notas)] * (1.0 if (i // 16) % 2 == 0 else 1.122)
        por(cordas, _corda(sr, 2 * f, passo * 0.95, 0.6), t, 0.5)
        if i % 2 == 0:  # dedilhado agudo (tipo guzheng) nas batidas
            por(cordas, _corda(sr, 4 * f, batida * 0.9, 0.35), t, 0.22)
        i += 1
        t += passo
    cordas = _pb(cordas, sr, 3200)

    # drone grave (Re1 + quinta), entra devagar
    tt = np.arange(len(out)) / sr
    drone = ((np.sin(2 * np.pi * 36.71 * tt) + 0.5 * np.sin(2 * np.pi * 55.0 * tt)) * np.minimum(1, tt / 6) * 0.12).astype(np.float32)

    mix = tambor + cordas * 1.1 + drone
    golpe = _taiko(sr, 70, 30, 1.2, 0.4, seed + 9)
    for v in viradas:
        if 0 < v < dur - 1.0:
            por(mix, golpe, v, 1.2)
    mix = mix[:n]
    r = float(np.sqrt((mix ** 2).mean()) + 1e-9)
    mix = mix * (0.1 / r)
    pico = float(np.abs(mix).max())
    if pico > 0.95:
        mix *= 0.95 / pico
    return mix.astype(np.float32)


if __name__ == "__main__":
    import sys
    import soundfile as sf
    sr = 44100
    d = float(sys.argv[2]) if len(sys.argv) > 2 else 30
    sf.write(sys.argv[1], trilha_acao(int(d * sr), sr, viradas=[8.0, 20.0]), sr)
