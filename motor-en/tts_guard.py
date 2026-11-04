"""Narracao com BANCO: a voz do Gemini e gravada UMA vez por roteiro e reaproveitada para sempre.

Por que existe: a chave do Gemini da so 10 narracoes por dia, e os canais antigos (GTA, engenharia,
terror) ja usam 6. Sobram 4 para estes canais. Sem o banco, cada teste, cada ajuste de imagem e
cada nova tentativa depois de um erro gastava mais uma.

Como funciona:
  - O audio bruto do Gemini e guardado em narracoes/<CODIGO>_<chave>.wav (fora do GitHub).
  - A <chave> depende SO do texto falado, da voz, do modelo e do estilo. Mudar imagem, cena, capa,
    legenda (visual), musica ou horario NAO muda a chave: a narracao e reaproveitada, de graca.
  - Mudar o texto de uma fala gera chave nova = narracao nova (e o certo: a voz precisa dizer o novo).
  - Corte, pausas, tempos da legenda e mixagem sao refeitos a partir do audio guardado: sem custo.
  - Conta as narracoes NOVAS do dia (dia do Google, fuso da California). Passou do limite, recusa
    e o tts.py segue o caminho normal de falha (VOZ FALHOU ao publicar). Nada e publicado com voz errada.

Para regravar a voz de um roteiro (ficou ruim), apague o arquivo dele em narracoes/.

Variaveis (opcionais):
  CANAIS_NARRACOES_DIA  limite de narracoes novas por dia para estes canais (padrao 4)
  CANAIS_NARRACOES      pasta do banco (padrao: <repositorio>/narracoes)

Uso: igual ao tts.py do motor, que este arquivo apenas embrulha (o motor nao e alterado):
  python motor-en/tts_guard.py historia.json voz.wav tempos.json [--motor gemini|kokoro]
"""
import datetime as dt, hashlib, json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
MOTOR = os.path.join(RAIZ, "hora-muerta", "scripts")  # motor testado, nunca alterado
sys.path.insert(0, MOTOR)
sys.path.insert(0, AQUI)
import tts  # noqa: E402  (tts.py do motor)
from comum import carregar  # noqa: E402

BANCO = os.environ.get("CANAIS_NARRACOES") or os.path.join(RAIZ, "narracoes")
LIMITE = int(os.environ.get("CANAIS_NARRACOES_DIA", "4"))
CONTADOR = os.path.join(BANCO, "contador.json")
_gemini_real = tts.gemini
_codigo = "SEMCODIGO"


def chave(linhas):
    """Impressao digital da narracao: so o que muda o som da voz entra aqui."""
    base = {"linhas": list(linhas),
            "voz": os.environ.get("GEMINI_TTS_VOICE", "Algenib"),
            "modelo": os.environ.get("GEMINI_TTS_MODEL", ""),
            "estilo": tts.ESTILO}
    return hashlib.sha256(json.dumps(base, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()[:16]


def dia_google():
    """A cota gratis do Gemini zera a meia-noite da California."""
    from zoneinfo import ZoneInfo
    return dt.datetime.now(ZoneInfo("America/Los_Angeles")).strftime("%Y-%m-%d")


def usadas_hoje(somar=0):
    """Le (e opcionalmente soma) o contador de narracoes novas do dia."""
    os.makedirs(BANCO, exist_ok=True)
    try:
        dados = json.load(open(CONTADOR, encoding="utf-8"))
    except Exception:
        dados = {}
    hoje = dia_google()
    dados[hoje] = max(0, int(dados.get(hoje, 0)) + somar)
    if somar:
        dados = {k: dados[k] for k in sorted(dados)[-14:]}  # guarda so as ultimas 2 semanas
        tmp = CONTADOR + ".tmp"
        json.dump(dados, open(tmp, "w", encoding="utf-8"), indent=1)
        os.replace(tmp, CONTADOR)
    return dados[hoje]


def arquivo_do_banco(linhas):
    return os.path.join(BANCO, f"{_codigo}_{chave(linhas)}.wav")


def limpar_fim(audio, sr):
    """Corta o estalo de estatica que o Gemini as vezes deixa NO FIM da narracao.

    Visto no SV001 (28/10): depois da ultima palavra vem um silencio curto e, colado no fim do arquivo,
    0,2 s de chiado alto (mais forte que a propria voz). Regra: procura, no ultimo 1,5 s, o ultimo trecho
    de silencio de 0,1 s ou mais; se o que vem depois dele e curto (ate 0,45 s) e vai ate o fim do arquivo,
    e lixo, nao fala: corta tudo dali em diante. Fala de verdade nao termina colada no fim do arquivo
    depois de um silencio (o tts.py ainda poe 1,2 s de silencio no final).
    """
    import numpy as np
    a = np.asarray(audio, dtype="float32")
    if a.ndim > 1:
        a = a.mean(axis=1)
    q = max(1, int(sr * 0.02))
    n = len(a) // q
    if n < 10:
        return audio
    rms = np.sqrt((a[: n * q].reshape(n, q) ** 2).mean(axis=1))
    mudo = rms < 0.003
    janela = int(1.5 / 0.02)
    ini = max(0, n - janela)
    corte = None
    k = n - 1
    while k >= ini:
        if mudo[k]:
            j = k
            while j - 1 >= ini and mudo[j - 1]:
                j -= 1
            if (k - j + 1) * 0.02 >= 0.1:
                depois = (n - 1 - k) * 0.02
                if 0 < depois <= 0.45:
                    corte = (k + 1) * q
                break
            k = j - 1
        else:
            k -= 1
    if corte is None:
        return audio
    print(f"narracao: cortei {len(a) / sr - corte / sr:.2f} s de estatica no fim da voz", flush=True)
    return audio[:corte]


# ---------------------------------------------------------------------------------------------------------------
# CORTE BLINDADO (CL015, 03-04/11). O Gemini narrou o CL015, a voz foi para o banco, mas o corte nos silencios
# reprovou ("corte suspeito": a voz emendou duas frases sem respiro). Como o banco devolve SEMPRE o mesmo audio,
# toda tentativa reprovava igual e o aviso dizia, errado, "o Gemini nao narrou" (4 execucoes, ~80 min cada).
# Agora: (1) marcas pelo Whisper primeiro, no inicio exato da 1a palavra de cada linha; (2) se o corte nos
# silencios reprovar, corta no vale de energia logo antes dessa palavra; (3) se nem assim, a 2a tentativa do
# tts.py pede UMA tomada nova ao Gemini (outra leitura, gasta 1 narracao) e grava no banco no lugar da velha.
# A legenda continua conferida depois (sincronia.py): nada sobe fora de sincronia.
# ---------------------------------------------------------------------------------------------------------------
_cortar_original = tts.cortar
_marcas_gemini = tts.marcas
_estado = {"chamadas": 0, "audio_ok": False, "gemini_caiu": False, "tomada_nova": False}


class MarcasPalavra(list):
    """Inicio de cada linha (segundos). exata[k] = a 1a palavra da linha k foi ouvida (marca precisa)."""
    exata = ()


def marcas_palavra(audio, linhas):
    """Marcas pelo Whisper local (sem cota, sem rede), com a informacao de quais sao exatas."""
    try:
        import legenda_whisper as L
        n16 = int(len(audio) * L.SR / tts.SR)
        a16 = tts.np.interp(tts.np.linspace(0, len(audio) - 1, n16), tts.np.arange(len(audio)), audio).astype("float32")
        ws = [l.split() for l in linhas]
        ini = L.casar([w for p in ws for w in p], L.ouvir(a16, os.environ.get("LEGENDA_IDIOMA", "en")))
        v, exata, k = MarcasPalavra(), [], 0
        for p in ws:
            j = next((j for j, t in enumerate(ini[k:k + len(p)]) if t is not None), None)
            ant = v[-1] if v else 0.0
            # a 1a palavra achada pode ser a 3a da linha: a linha comecou ~0,3 s por palavra antes (YB018, 29/10)
            v.append(None if j is None else max(ant, ini[k + j] - 0.3 * j))
            exata.append(j == 0)
            k += len(p)
            if v[-1] is None:
                print("marcas whisper incompletas (linha %d nao ouvida)" % len(v), file=sys.stderr)
                return None
        v.exata = exata
        print("marcas whisper:", [round(x, 1) for x in v], file=sys.stderr)
        return v
    except Exception as e:
        print("marcas whisper falharam:", e, file=sys.stderr)
        return None


def marcas_whisper_primeiro(audio, linhas, key):
    """Whisper antes do Gemini (como no So You Built It desde 29/10): preciso, local e sem cota."""
    return marcas_palavra(audio, linhas) or _marcas_gemini(audio, linhas, key)


def corte_pelas_palavras(audio, linhas, marcas):
    """Corta no ponto mais silencioso dos 0,4 s antes do inicio de cada linha (mesmo sem pausa entre as frases)."""
    np = tts.np
    fr = int(tts.SR * 0.02)
    n = len(audio) // fr
    rms = np.sqrt((audio[: n * fr].reshape(n, fr) ** 2).mean(1) + 1e-12)
    silencio = rms < max(0.004, np.percentile(rms, 30) * 0.6)
    voz = np.where(~silencio)[0]
    if len(voz) == 0:
        return None
    cortes = [int(voz[0])]
    for g in list(marcas)[1:]:
        q = int(round(g / 0.02))
        lo, hi = max(cortes[-1] + 10, q - 20), min(n - 1, q + 3)
        if lo >= hi:
            return None
        cortes.append(lo + int(np.argmin(rms[lo:hi])))
    cortes.append(int(voz[-1]) + 1)
    pedacos = []
    for i, j in zip(cortes, cortes[1:]):
        dentro = np.where(~silencio[i:j])[0]
        if len(dentro) == 0:
            return None
        a, b = i + int(dentro[0]), i + int(dentro[-1]) + 1
        # mesma folga do corte normal: 80 ms antes e 160 ms depois, sem invadir a linha vizinha
        pedacos.append(audio[max(i, a - 4) * fr: min(j, b + 8) * fr])
    chars = np.array([len(tts.re.sub(r"[^\w]", "", l)) + 0.5 * len(l.split()) for l in linhas], float)
    durs = np.array([len(p) / tts.SR for p in pedacos])
    razao = (durs / durs.sum()) / (chars / chars.sum())
    if razao.min() < 0.3 or razao.max() > 3.2:
        print("corte pelas palavras tambem suspeito:", np.round(razao, 2).tolist(), file=sys.stderr)
        return None
    print("corte pelas palavras do Whisper (frases emendadas sem respiro):", np.round(razao, 2).tolist(), file=sys.stderr)
    return pedacos


def cortar_blindado(audio, linhas, guia=None):
    pedacos = _cortar_original(audio, linhas, guia)
    if pedacos:
        return pedacos
    marcas = guia if getattr(guia, "exata", None) else marcas_palavra(audio, linhas)
    return corte_pelas_palavras(audio, linhas, marcas) if marcas else None


def tomada_nova(arq, linhas, key):
    """O audio do banco ja reprovou no corte: pede outra leitura ao Gemini (1 por execucao, se houver cota)."""
    n = usadas_hoje()
    if _estado["tomada_nova"] or n >= LIMITE:
        if n >= LIMITE:
            print(f"sem cota para tomada nova ({n} de {LIMITE} hoje): fica a voz do banco", flush=True)
        return None
    _estado["tomada_nova"] = True
    usadas_hoje(1)
    try:
        audio = _gemini_real(linhas, key)
    except Exception as e:
        usadas_hoje(-1)
        print(f"tomada nova: GEMINI FORA DO AR: {str(e)[:200]}", flush=True)
        return None
    tmp = arq + ".tmp.wav"
    tts.sf.write(tmp, audio, tts.SR)
    os.replace(tmp, arq)
    print(f"TOMADA NOVA gravada no banco no lugar da que nao cortava: {os.path.basename(arq)} ({n + 1} de {LIMITE} hoje)",
          flush=True)
    return limpar_fim(audio, tts.SR)


def gemini_com_banco(linhas, key):
    _estado["chamadas"] += 1
    arq = arquivo_do_banco(linhas)
    if os.path.exists(arq):
        if _estado["chamadas"] >= 2:
            # o tts.py so pede a voz de novo quando o corte reprovou: o mesmo audio reprovaria igual
            nova = tomada_nova(arq, linhas, key)
            if nova is not None:
                _estado["audio_ok"] = True
                return nova
        print(f"narracao: reaproveitando {os.path.basename(arq)} (nao gasta cota)", flush=True)
        _estado["audio_ok"] = True
        return limpar_fim(tts.sf.read(arq, dtype="float32")[0], tts.SR)
    n = usadas_hoje()
    if n >= LIMITE:
        raise RuntimeError(f"LIMITE DE NARRACOES: {n} de {LIMITE} ja usadas hoje (dia do Google {dia_google()}); "
                           f"tente depois da meia-noite da California (5h no Brasil)")
    usadas_hoje(1)  # conta ANTES de chamar: se o processo morrer no meio, melhor sobrar do que estourar
    try:
        audio = _gemini_real(linhas, key)
    except Exception as e:
        # o Gemini NAO entregou audio (fora do ar, 503/429): nada foi gasto, devolve a conta. Antes (CL015, 03/11)
        # cada tentativa com o Gemini fora comia uma das 4 do dia e travava os outros canais com LIMITE falso.
        usadas_hoje(-1)
        _estado["gemini_caiu"] = True
        print(f"GEMINI FORA DO AR: {str(e)[:200]}", flush=True)
        raise
    tmp = arq + ".tmp.wav"
    tts.sf.write(tmp, audio, tts.SR)
    os.replace(tmp, arq)  # so aparece no banco quando estiver inteiro
    _estado["audio_ok"] = True
    if _estado["chamadas"] >= 2:
        _estado["tomada_nova"] = True  # ja foi uma leitura nova nesta execucao
    print(f"narracao NOVA gravada no banco: {os.path.basename(arq)} ({n + 1} de {LIMITE} hoje)", flush=True)
    return limpar_fim(audio, tts.SR)


def main():
    global _codigo
    historia, wav = sys.argv[1], sys.argv[2]
    _codigo = carregar(historia).get("codigo", "SEMCODIGO")
    # o tts.py reaproveita um "_bruto.wav" pelo NOME, sem olhar se o texto mudou. Apagando, toda
    # narracao passa pelo banco, que confere o texto.
    bruto = os.path.splitext(wav)[0] + "_bruto.wav"
    if os.path.exists(bruto):
        os.remove(bruto)
    tts.gemini = gemini_com_banco
    tts.marcas = marcas_whisper_primeiro
    tts.cortar = cortar_blindado
    sys.argv = [tts.__file__] + sys.argv[1:]
    try:
        tts.main()
    except SystemExit as e:
        if e.code and "VOZ FALHOU" in str(e.code) and _estado["audio_ok"] and not _estado["gemini_caiu"]:
            # o aviso antigo dizia "o Gemini nao narrou" mesmo quando ele narrou e so o corte reprovou (CL015)
            sys.exit("CORTE DA VOZ FALHOU: o Gemini narrou, mas a voz nao separou nas linhas do roteiro (nem pelos "
                     "silencios, nem pelas palavras do Whisper, nem com tomada nova). Repetir agora nao adianta; "
                     "a proxima execucao pede outra leitura.")
        raise


if __name__ == "__main__":
    main()
