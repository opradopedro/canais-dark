"""ESTATICA DO GEMINI: o TTS do Gemini as vezes devolve um estalo de chiado (estatica de TV, ruido branco a ~-6 dB,
mais alto que a propria voz) colado no COMECO e/ou no FIM da gravacao, separado da fala por um silencio curto.
Visto no SV001 (28/10) e em TODAS as narracoes brutas do Hora Muerta (HM001/HM002: 0,1 s a -6 dB no fim, depois de
0,2 s de silencio). O motor-en ja cortava o do fim (tts_guard.limpar_fim), mas o tts.py do Hora Muerta e o do
So You Built It NUNCA cortavam: por isso o "chiado insuportavel no fim" voltava (Pedro, 05/11).

limpar_bordas(audio, sr): procura, nos primeiros e nos ultimos 1,5 s, uma "ilha" de som curta (ate 0,45 s) separada
da fala por 0,1 s ou mais de silencio e encostada na borda do arquivo. Fala de verdade nao fica assim: corta.
"""
import numpy as np

Q = 0.02
MUDO = 0.003  # rms (~ -50 dB)


def _rms(a, q):
    n = len(a) // q
    return np.sqrt((a[: n * q].reshape(n, q) ** 2).mean(axis=1)) if n else np.zeros(0)


def _fim(a, sr, janela=1.5, ilha_max=0.45, silencio_min=0.1):
    """Amostra onde cortar o fim (ou None)."""
    q = max(1, int(sr * Q)); rms = _rms(a, q); n = len(rms)
    if n < 10:
        return None
    mudo = rms < MUDO
    ini = max(0, n - int(janela / Q))
    k = n - 1
    while k >= ini and mudo[k]:  # silencio final ja limpo
        k -= 1
    fim_ilha = k
    while k >= ini and not mudo[k]:
        k -= 1
    if k < ini:
        return None
    dur_ilha = (fim_ilha - k) * Q
    j = k
    while j - 1 >= ini and mudo[j - 1]:
        j -= 1
    if dur_ilha <= ilha_max and (k - j + 1) * Q >= silencio_min and (fim_ilha + 1) >= n - int(0.3 / Q):
        return (k + 1) * q
    return None


def achar_estatica(mono, sr, ref=None, jan=0.04):
    """Trechos de ESTATICA DE TV (ruido branco): quase toda a energia acima de 3 kHz, espectro chato de 2,5 a 11,5 kHz
    (um "s" da fala tem pico, nao e chato: planura ~0,5; a estatica do Gemini da 0,94-0,98) e alto, perto do volume
    da fala. Devolve [(inicio, fim)] em amostras, janelas de 40 ms emendadas."""
    x = np.asarray(mono, dtype="float64")
    q = int(jan * sr); n = len(x) // q
    if n < 3:
        return []
    b = x[: n * q].reshape(n, q)
    r = 20 * np.log10(np.sqrt((b ** 2).mean(axis=1)) + 1e-9)
    if ref is None:
        voz = r[r > -40]
        ref = float(np.percentile(voz, 90)) if len(voz) else -20.0
    sp = np.abs(np.fft.rfft(b * np.hanning(q), axis=1)) ** 2 + 1e-15
    f = np.fft.rfftfreq(q, 1 / sr)
    hf = 10 * np.log10(sp[:, f > 3000].sum(axis=1) / sp.sum(axis=1))
    lim = np.arange(2500, min(11501, sr / 2), 500)
    e = np.stack([sp[:, (f >= lim[i]) & (f < lim[i + 1])].sum(axis=1) for i in range(len(lim) - 1)], axis=1)
    plana = np.exp(np.log(e).mean(axis=1)) / e.mean(axis=1)
    ruim = (hf > -6.0) & (plana > 0.8) & (r > ref - 6.0)
    out = []
    i = 0
    while i < n:
        if ruim[i]:
            j = i
            while j + 1 < n and ruim[j + 1]:
                j += 1
            out.append((i * q, (j + 1) * q))
            i = j + 1
        else:
            i += 1
    return out


def tirar_estatica(audio, sr, nome="narracao"):
    """Estatica colada na fala (sem silencio antes): perto do fim corta dali em diante; no meio, silencia o trecho."""
    a = np.array(audio, dtype="float32", copy=True)
    mono = a.mean(axis=1) if a.ndim > 1 else a
    trechos = achar_estatica(mono, sr)
    if not trechos:
        return a
    total = len(mono)
    for i0, i1 in reversed(trechos):
        i0 = max(0, i0 - int(0.01 * sr)); i1 = min(total, i1 + int(0.02 * sr))
        if total - i1 < int(1.5 * sr):  # perto do fim: nada depois disso e fala
            print(f"{nome}: cortei estatica de TV colada no fim ({i0 / sr:.2f} s ate o fim)", flush=True)
            a = a[:i0]; total = i0
        else:
            print(f"{nome}: silenciei estatica de TV em {i0 / sr:.2f}-{i1 / sr:.2f} s", flush=True)
            a[i0:i1] = 0
    return a


def limpar_bordas(audio, sr, nome="narracao"):
    audio = tirar_estatica(audio, sr, nome)
    a = np.asarray(audio, dtype="float32")
    mono = a.mean(axis=1) if a.ndim > 1 else a
    total = len(mono) / sr
    corte_fim = _fim(mono, sr)
    corte_ini = _fim(mono[::-1].copy(), sr)
    ini = len(mono) - corte_ini if corte_ini is not None else 0
    fim = corte_fim if corte_fim is not None else len(mono)
    if fim - ini < sr:  # sobraria quase nada: nao mexe nos cortes
        ini, fim = 0, len(mono)
    if ini or fim < len(mono):
        print(f"{nome}: cortei estatica do Gemini (inicio {ini / sr:.3f} s, fim {total - fim / sr:.3f} s)", flush=True)
    out = np.array(audio[ini:fim], dtype="float32", copy=True)
    # estalo colado na primeira/ultima amostra (HM001: 20 ms a -21 dB no inicio): rampa de 30 ms nas duas pontas
    r = min(int(0.03 * sr), len(out) // 4)
    if r > 0:
        rampa = np.linspace(0, 1, r, dtype="float32")
        if out.ndim > 1:
            rampa = rampa[:, None]
        out[:r] *= rampa; out[-r:] *= rampa[::-1]
    return out


if __name__ == "__main__":
    import sys, soundfile as sf
    for f in sys.argv[1:]:
        x, sr = sf.read(f, dtype="float32")
        y = limpar_bordas(x, sr, f)
        print(f, len(x) / sr, "->", len(y) / sr)
