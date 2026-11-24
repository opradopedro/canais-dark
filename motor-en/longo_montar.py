#!/usr/bin/env python3
"""VIDEO LONGO automatico (16:9) dos canais de historia, no formato aprovado pelo Pedro (15/11/2026):
- Old Tales: 1 serie por longo (5 partes + abertura + epilogo). Os extras sao roteiros do motor ilustrado escritos
  pelo roteirista em old-tales/longos/<serie>.json (campos "abertura" e "epilogo").
- Hora Muerta e Signal Lost: coletanea assumida ("3 relatos..."), 3+ series inteiras, 10 a 14 min. O plano e criado
  sozinho quando as series fecham.
- PISO DURO: nada abaixo de 10 min sobe (motor-en/longo.py trava). Legenda fora da voz ou chiado no fim: nao sobe.

Cada longo e um arquivo <canal>/longos/<nome>.json ("plano"):
  {"titulo", "descricao", "tags", "capa_texto", "series": [slug], "partes": [{"codigo", "roteiro", "youtube", "rotulo"}],
   "abertura": caminho ou roteiro, "epilogo": caminho ou roteiro, "liberar_em": ISO UTC, "feito": {...}}
De onde vem cada parte (na ordem): Release longo-<canal> (voz guardada na producao: redesenha em 16:9 sem gravar voz),
Release teste-ilustrado (<COD>-horizontal.mp4 ja pronto) ou, por ultimo, voz nova a partir do roteiro.
Na parte que nao e a ultima da serie, a ultima fala ("Part two, tomorrow") sai do longo.

Uso: python motor-en/longo_montar.py              -> planeja e monta/sobe o primeiro longo pronto (GitHub Actions)
     python motor-en/longo_montar.py --sem-subir  -> monta e guarda na Release teste-longo, sem publicar
     python motor-en/longo_montar.py --plano <arquivo>  -> so esse plano (mesmo sem estar liberado)
"""
import datetime as dt
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
sys.path.insert(0, os.path.join(RAIZ, "motor-ilustrado"))
import longo  # noqa: E402

REPO = os.environ.get("GITHUB_REPOSITORY", "opradopedro/canais-dark")
DADOS = "https://opradopedro.github.io/canais-dark/dados.json"
CANAIS = {"old-tales": {"cid": "cl", "pref": "CL", "idioma": "en", "token": "YT_REFRESH_TOKEN_CLASSICS"},
          "signal-lost": {"cid": "sv", "pref": "SV", "idioma": "en", "token": "YT_REFRESH_TOKEN_SURVIVAL"},
          "hora-muerta": {"cid": "hm", "pref": "HM", "idioma": "es", "token": "YT_REFRESH_TOKEN_ES"}}
FIM_DE_PARTE = re.compile(r"\b(part|parte)\s+\w+\s*[,.:!]?\s*(tomorrow|next|ma[nñ]ana|sale|is coming)", re.I)
FONTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
TITULO_COLETANEA = {"hora-muerta": "{n} relatos de terror para escuchar en la oscuridad",
                    "signal-lost": "{n} true scary stories to listen to in the dark"}


def agora():
    return dt.datetime.now(dt.timezone.utc)


def run(*cmd):
    print("+", " ".join(map(str, cmd))[:300], flush=True)
    subprocess.run(list(map(str, cmd)), check=True)


def baixar(tag, nome, destino):
    url = f"https://github.com/{REPO}/releases/download/{tag}/{nome}"
    try:
        with urllib.request.urlopen(url, timeout=300) as r, open(destino, "wb") as f:
            shutil.copyfileobj(r, f)
        return os.path.getsize(destino) > 0
    except Exception:
        return False


def publico(vid):
    try:
        urllib.request.urlopen("https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + vid,
                               timeout=30)
        return True
    except Exception:
        return False


def ler(caminho):
    return json.load(open(caminho, encoding="utf-8"))


def gravar(caminho, dados):
    json.dump(dados, open(caminho, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def achar_roteiro(rel):
    """O roteiro pode ter ido de stories/ para arquivo/ depois de publicado."""
    arq = os.path.join(RAIZ, rel)
    if os.path.exists(arq):
        return arq
    alt = os.path.join(RAIZ, os.path.dirname(os.path.dirname(rel)), "arquivo", os.path.basename(rel))
    return alt if os.path.exists(alt) else arq


# ------------------------------------------------------------------ planejar
def _series_publicadas(dados, cid):
    """{slug: {"partes": n, "itens": [...], "visual"}} das series do canal com TODAS as partes publicadas."""
    c = next((x for x in dados.get("canais", []) if x["id"] == cid), None)
    if not c:
        return {}
    series = {}
    for it in c["itens"]:
        if not it.get("arquivo"):
            continue
        try:
            h = ler(achar_roteiro(it["arquivo"]))
        except Exception:
            continue
        slug = h.get("serie") or h.get("codigo")
        s = series.setdefault(slug, {"partes": int(h.get("partes") or 1), "itens": {}, "visual": h.get("visual"),
                                     "titulo": (h.get("serie_titulo") or "").split("|")[0].strip() or slug,
                                     "palavras": 0})
        m = re.search(r"(?:youtu\.be/|shorts/|v=)([\w-]{11})", it.get("youtube") or "")
        s["itens"][int(h.get("parte") or 1)] = {"codigo": h.get("codigo"), "roteiro": it["arquivo"],
                                               "youtube": m.group(1) if m else None, "estado": it.get("estado"),
                                               "rotulo": h.get("titulo", "")}
        s["palavras"] += longo._palavras(h)
    return {k: v for k, v in series.items()
            if v["visual"] == "ilustrado" and len(v["itens"]) >= v["partes"]
            and all(v["itens"].get(i, {}).get("estado") == "publicado" for i in range(1, v["partes"] + 1))}


def _ja_planejadas(pasta):
    feitas = set()
    for f in glob.glob(os.path.join(pasta, "longos", "*.json")):
        try:
            p = ler(f)
        except Exception:
            continue
        if p.get("partes"):
            feitas.update(p.get("series") or [])
    return feitas


def planejar():
    """Cria/completa os planos das series que fecharam. Devolve a lista de arquivos mexidos."""
    try:
        dados = json.load(urllib.request.urlopen(DADOS, timeout=60))
    except Exception as e:
        print("dados.json falhou, nao planejo nesta rodada:", e, flush=True)
        return []
    mexidos = []
    for canal, cfg in CANAIS.items():
        pasta = os.path.join(RAIZ, canal)
        os.makedirs(os.path.join(pasta, "longos"), exist_ok=True)
        prontas = _series_publicadas(dados, cfg["cid"])
        ja = _ja_planejadas(pasta)
        livres = [(k, v) for k, v in prontas.items() if k not in ja]
        livres.sort(key=lambda kv: kv[1]["itens"][1]["codigo"] or "")
        if canal == "old-tales":
            for slug, s in livres:
                arq = os.path.join(pasta, "longos", slug + ".json")
                if not os.path.exists(arq):
                    print(f"[{canal}] serie {slug} fechou mas FALTAM OS EXTRAS (old-tales/longos/{slug}.json): "
                          "o roteirista escreve abertura e epilogo (ROTEIROS.md)", flush=True)
                    continue
                p = ler(arq)
                p["series"] = [slug]
                p["partes"] = [dict(s["itens"][i], rotulo=f"Part {i}") for i in range(1, s["partes"] + 1)]
                p.setdefault("liberar_em", agora().strftime("%Y-%m-%dT%H:%M:%SZ"))
                gravar(arq, p)
                mexidos.append(arq)
                print(f"[{canal}] plano completo: {slug}", flush=True)
            continue
        # 24/11: coletanea que saiu CURTA (< 10 min na montagem) ganha a proxima serie inteira publicada e
        # volta para a fila. Assim nunca fica falhando todo dia nem sobe abaixo do piso.
        for f in sorted(glob.glob(os.path.join(pasta, "longos", "coletanea-*.json"))):
            p = ler(f)
            if p.get("feito") or not p.get("curto") or not livres:
                continue
            slug, s = livres.pop(0)
            p["series"] = (p.get("series") or []) + [slug]
            p["partes"] += [dict(s["itens"][i], rotulo=s["titulo"] if i == 1 else "") for i in range(1, s["partes"] + 1)]
            n = len(p["series"])
            p["titulo"] = TITULO_COLETANEA[canal].format(n=n)
            p["capa_texto"] = p["titulo"].split(" para ")[0].split(" to ")[0].upper()
            linhas = [l for l in (p.get("descricao") or "").split("\n") if l.strip()]
            p["descricao"] = "\n".join(linhas + [f"{len(linhas) + 1}. {s['titulo']}"])
            p["aumentado"] = p.pop("curto")
            gravar(f, p)
            mexidos.append(f)
            print(f"[{canal}] {os.path.basename(f)} estava curta: entrou a serie {slug} ({n} relatos)", flush=True)
        # coletanea: series inteiras em ordem ate ~10min30 (o plano pede no minimo 3 series)
        ritmo = longo.RITMO.get(canal, 1.7)
        grupo, soma = [], longo.EXTRAS_S / 2
        for slug, s in livres:
            grupo.append((slug, s))
            soma += s["palavras"] / ritmo
            if soma >= longo.MARGEM_PLANO_S and len(grupo) >= 3:
                n = len(glob.glob(os.path.join(pasta, "longos", "coletanea-*.json"))) + 1
                nomes = [g[1]["titulo"] for g in grupo]
                p = {"titulo": TITULO_COLETANEA[canal].format(n=len(grupo)),
                     "descricao": "\n".join(f"{i + 1}. {t}" for i, t in enumerate(nomes)),
                     "capa_texto": TITULO_COLETANEA[canal].format(n=len(grupo)).split(" para ")[0].split(" to ")[0].upper(),
                     "series": [g[0] for g in grupo],
                     "partes": [dict(g[1]["itens"][i], rotulo=g[1]["titulo"] if i == 1 else "")
                                for g in grupo for i in range(1, g[1]["partes"] + 1)],
                     "liberar_em": agora().strftime("%Y-%m-%dT%H:%M:%SZ")}
                arq = os.path.join(pasta, "longos", f"coletanea-{n:02d}.json")
                gravar(arq, p)
                mexidos.append(arq)
                print(f"[{canal}] coletanea planejada: {nomes} (~{soma / 60:.1f} min)", flush=True)
                grupo, soma = [], longo.EXTRAS_S / 2
    return mexidos


def pronto(p):
    if p.get("feito") or p.get("curto") or not p.get("partes"):
        return False  # "curto": espera a proxima serie entrar (planejar)
    lib = p.get("liberar_em")
    if lib and dt.datetime.fromisoformat(lib.replace("Z", "+00:00")) > agora():
        return False
    ids = [x.get("youtube") for x in p["partes"] if x.get("youtube")]
    if not lib and len(ids) < len(p["partes"]):
        return False
    return all(publico(v) for v in ids)


# ------------------------------------------------------------------ montar
def _roteiro_de(valor, pasta, nome):
    if isinstance(valor, dict):
        arq = os.path.join(pasta, nome + ".json")
        gravar(arq, valor)
        return arq
    return achar_roteiro(valor)


def peca_parte(parte, cid, pasta):
    import longo_partes
    cod = parte["codigo"]
    loc = {n: os.path.join(pasta, f"{cod}_{n}") for n in ("roteiro.json", "tempos.json", "trilha.m4a")}
    if all(baixar(f"longo-{cid}", f"{cod}_{n}", loc[n]) for n in loc):
        print(f"{cod}: voz guardada na producao, redesenho em 16:9", flush=True)
        return longo_partes.de_trilha(loc["roteiro.json"], loc["tempos.json"], loc["trilha.m4a"], pasta)
    h, tp = os.path.join(pasta, f"{cod}-horizontal.mp4"), os.path.join(pasta, f"{cod}_tempos.json")
    if baixar("teste-ilustrado", f"{cod}-horizontal.mp4", h) and baixar("teste-ilustrado", f"{cod}_tempos.json", tp):
        print(f"{cod}: 16:9 ja pronto (Release teste-ilustrado)", flush=True)
        return h, tp, True
    print(f"{cod}: sem voz guardada, gravo do roteiro", flush=True)
    return longo_partes.do_roteiro(achar_roteiro(parte["roteiro"]), pasta)


def cortar_fim(h, tp, rot, pasta):
    """Tira a ultima fala ("Part two, tomorrow") da parte que nao fecha a serie."""
    segs = ler(tp)["segs"]
    r = ler(rot) if rot and os.path.exists(rot) else {}
    nao_final = int(r.get("parte") or 0) < int(r.get("partes") or 0)
    if not segs or not (nao_final or FIM_DE_PARTE.search(segs[-1].get("text", ""))):
        return h
    corte = max(1.0, float(segs[-1]["t0"]) - 0.15)
    saida = h.replace(".mp4", "_corte.mp4")
    run("ffmpeg", "-v", "error", "-y", "-i", h, "-t", f"{corte:.2f}", "-af", f"afade=t=out:st={max(0, corte - 0.6):.2f}:d=0.6",
        "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", saida)
    print(f"cortei a ultima fala em {corte:.1f}s: {segs[-1].get('text', '')[:60]}", flush=True)
    return saida


def juntar(pecas, saida):
    """Junta tudo em 1920x1080 30 fps, som 48 kHz estereo (as pecas podem vir de motores com tamanhos diferentes)."""
    ent, filt = [], []
    for i, p in enumerate(pecas):
        ent += ["-i", p]
        filt.append(f"[{i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,"
                    f"setsar=1,fps=30,format=yuv420p[v{i}];[{i}:a]aresample=48000,aformat=channel_layouts=stereo[a{i}]")
    filt.append("".join(f"[v{i}][a{i}]" for i in range(len(pecas))) + f"concat=n={len(pecas)}:v=1:a=1[v][a]")
    run("ffmpeg", "-v", "error", "-y", *ent, "-filter_complex", ";".join(filt), "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", saida)


def capa(video, t, texto, saida):
    """Thumbnail 1280x720: um quadro do video + o texto grande a esquerda (faixa escura para ler no celular)."""
    quadro = saida.replace(".jpg", "_q.png")
    run("ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1", "-vf", "scale=1280:720", quadro)
    palavras, linhas, atual = texto.upper().split(), [], ""
    for w in palavras:  # quebra em linhas de ate ~14 letras
        if atual and len(atual) + 1 + len(w) > 14:
            linhas.append(atual)
            atual = w
        else:
            atual = (atual + " " + w).strip()
    linhas.append(atual)
    tam = 118 if len(linhas) <= 2 else 92
    vf = ["drawbox=x=0:y=0:w=760:h=720:color=black@0.45:t=fill"]
    y0 = 360 - len(linhas) * tam * 0.6
    for i, l in enumerate(linhas):
        l = l.replace("'", "’").replace(":", "\\:")
        vf.append(f"drawtext=fontfile={FONTE}:text='{l}':fontsize={tam}:fontcolor=white:borderw=8:bordercolor=black:"
                  f"x=48:y={y0 + i * tam * 1.15:.0f}")
    run("ffmpeg", "-v", "error", "-y", "-i", quadro, "-vf", ",".join(vf), "-q:v", "3", saida)
    return saida


def mmss(s):
    s = int(s)
    return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}" if s >= 3600 else f"{s // 60}:{s % 60:02d}"


def _yt(canal):
    """o motor-en/yt_upload.py, sempre: longo_partes poe hora-muerta/scripts na frente do sys.path e o
    "import yt_upload" pegava o do Hora Muerta, que nao tem configurar() (17/11: Wukong montado e nao subiu)"""
    cfg = CANAIS[canal]
    import importlib.util
    spec = importlib.util.spec_from_file_location("yt_upload_motor_en", os.path.join(AQUI, "yt_upload.py"))
    yt = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(yt)
    yt.configurar(cfg["pref"], cfg["idioma"])
    os.environ["YT_TOKEN_VAR"] = cfg["token"]
    return yt


def videos_do_canal(yt, token, quantos=100):
    """[{id, titulo, privacidade, publicado}] dos ultimos envios do canal (custa ~2 unidades por 50)."""
    ch = yt.get("channels", token, part="contentDetails", mine="true")["items"][0]
    up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    ids, page = [], None
    while len(ids) < quantos:
        q = {"part": "contentDetails", "playlistId": up, "maxResults": 50}
        if page:
            q["pageToken"] = page
        r = yt.get("playlistItems", token, **q)
        ids += [i["contentDetails"]["videoId"] for i in r.get("items", [])]
        page = r.get("nextPageToken")
        if not page:
            break
    out = []
    for k in range(0, len(ids), 50):
        for v in yt.get("videos", token, part="snippet,status", id=",".join(ids[k:k + 50])).get("items", []):
            out.append({"id": v["id"], "titulo": v["snippet"]["title"], "privacidade": v["status"]["privacyStatus"],
                        "publicado": v["snippet"].get("publishedAt", "")})
    return out


def _mesmo(a, b):
    return re.sub(r"\W+", " ", a or "").strip().lower() == re.sub(r"\W+", " ", b or "").strip().lower()


def ja_subiu(canal, titulo):
    """TRAVA (24/11): o Wukong subiu 11 vezes porque o "feito" nao chegou ao repo. Antes de subir, olha o
    proprio canal: se ja existe video com o mesmo titulo, devolve o id dele e NAO sobe de novo."""
    yt = _yt(canal)
    tok = yt.access_token()
    achados = [v for v in videos_do_canal(yt, tok) if _mesmo(v["titulo"], titulo)]
    if not achados:
        return None
    achados.sort(key=lambda v: v["publicado"])
    return achados[0]["id"]


def limpar_duplicados():
    """Tira do ar (privado, nao apaga) as copias repetidas dos longos ja publicados: fica so o do "feito"."""
    tirados = []
    for canal in CANAIS:
        planos = []
        for arq in glob.glob(os.path.join(RAIZ, canal, "longos", "*.json")):
            try:
                p = ler(arq)
            except Exception:
                continue
            if p.get("feito", {}).get("youtube") and p.get("titulo"):
                planos.append(p)
        if not planos or not os.environ.get(CANAIS[canal]["token"]):
            continue
        yt = _yt(canal)
        tok = yt.access_token()
        vids = videos_do_canal(yt, tok)
        for p in planos:
            for v in vids:
                if v["id"] != p["feito"]["youtube"] and v["privacidade"] != "private" and _mesmo(v["titulo"], p["titulo"]):
                    yt.tirar_do_ar(v["id"], tok)
                    tirados.append(f"{canal} {v['id']}")
    print("LONGOS REPETIDOS TIRADOS DO AR:", ", ".join(tirados) if tirados else "nenhum", flush=True)
    return tirados


def subir(canal, p, mp4, jpg, capitulos, pasta):
    cfg = CANAIS[canal]
    yt = _yt(canal)
    cj = os.path.join(RAIZ, canal, "canal.json")
    c = ler(cj) if os.path.exists(cj) else {}
    cap = "\n".join(f"{mmss(t)} {nome}" for t, nome in capitulos)
    rotulo = "Capítulos" if cfg["idioma"] == "es" else "Chapters"
    up = {"arquivo": mp4, "titulo": p["titulo"], "descripcion": f"{p.get('descricao', '')}\n\n{rotulo}:\n{cap}".strip(),
          "tags": p.get("tags") or c.get("tags_longo") or [], "categoria": str(c.get("categoria", "24")),
          "sintetico": False, "miniatura": jpg, "privacidad": "public"}
    if p.get("serie_titulo"):
        up["serie_titulo"] = p["serie_titulo"]
    upj = os.path.join(pasta, "longo_upload.json")
    gravar(upj, up)
    return yt.subir(upj, c.get("canal_titulo"))["id"]


def prever_s(p, cfg):
    """24/11: duracao do longo ANTES de desenhar (46 min de render). Usa os tempos da voz ja gravada de cada parte
    (Release longo-<canal>), descontando a fala "Parte X sai..." que o montador corta. Sem tempos, estima pelo
    roteiro. Abertura/epilogo pelo numero de palavras. Devolve segundos."""
    canal_ritmo = {"hm": "hora-muerta", "sv": "signal-lost", "cl": "old-tales"}.get(cfg["cid"], "")
    ritmo = longo.RITMO.get(canal_ritmo, 1.9)
    total = 0.0
    with tempfile.TemporaryDirectory() as tmp:
        for x in p.get("partes") or []:
            tp = os.path.join(tmp, x["codigo"] + ".json")
            try:
                rot = ler(achar_roteiro(x["roteiro"]))
            except Exception:
                rot = {}
            if baixar(f"longo-{cfg['cid']}", f"{x['codigo']}_tempos.json", tp):
                segs = ler(tp).get("segs") or []
                nao_final = int(rot.get("parte") or 0) < int(rot.get("partes") or 0)
                if segs and (nao_final or FIM_DE_PARTE.search(segs[-1].get("text", ""))):
                    total += max(1.0, float(segs[-1]["t0"]) - 0.15)
                else:
                    total += float(ler(tp).get("dur") or (segs[-1]["t1"] if segs else 0))
            else:
                total += longo._palavras(rot) / ritmo
    for k in ("abertura", "epilogo"):
        v = p.get(k)
        if isinstance(v, dict):
            total += longo._palavras(v) / ritmo
        elif isinstance(v, str):
            try:
                total += longo._palavras(ler(v if os.path.isabs(v) else os.path.join(RAIZ, v))) / ritmo
            except Exception:
                total += 30
    return total


def montar(arq, publicar=True):
    import checar_fim
    import longo_partes
    canal = os.path.basename(os.path.dirname(os.path.dirname(os.path.abspath(arq))))
    cfg = CANAIS[canal]
    p = ler(arq)
    pasta = tempfile.mkdtemp(prefix="longo-")
    print(f"\n=== LONGO {canal}: {p['titulo']} ===", flush=True)
    pecas, capitulos, t, falhas = [], [], 0.0, []
    intro = "Intro" if cfg["idioma"] == "en" else "Introducción"
    lista = []
    if p.get("abertura"):
        lista.append(("abertura", p["abertura"], intro))
    lista += [("parte", x, x.get("rotulo") or "") for x in p["partes"]]
    if p.get("epilogo"):
        lista.append(("epilogo", p["epilogo"], "What happened next" if cfg["idioma"] == "en" else "Lo que pasó después"))
    for tipo, x, rotulo in lista:
        if tipo == "parte":
            h, tp, ok = peca_parte(x, cfg["cid"], pasta)
            rot = os.path.join(pasta, f"{x['codigo']}_roteiro.json")
            h = cortar_fim(h, tp, rot if os.path.exists(rot) else achar_roteiro(x["roteiro"]), pasta)
            nome = x["codigo"]
        else:
            h, tp, ok = longo_partes.do_roteiro(_roteiro_de(x, pasta, tipo), pasta)
            nome = tipo
        if not ok:
            falhas.append(f"{nome}: LEGENDA FORA DA VOZ")
        if rotulo or not capitulos:
            capitulos.append((t, rotulo or intro))
        pecas.append(h)
        t += longo.duracao(h)
    if falhas:
        sys.exit("LONGO NAO SUBIU: " + "; ".join(falhas))
    final = os.path.join(pasta, re.sub(r"\W+", "-", os.path.basename(arq)[:-5]) + ".mp4")
    juntar(pecas, final)
    fim = checar_fim.consertar(final)  # 21/11: so volume alto no fim se conserta sozinho
    print("FIM DO LONGO", "OK" if fim["ok"] else "COM CHIADO", json.dumps(fim, ensure_ascii=False), flush=True)
    if not fim["ok"]:
        sys.exit("LONGO NAO SUBIU: chiado no fim")
    if longo.trava(final) != 0:  # PISO DURO de 10 min (Pedro, 15/11)
        if p.get("titulo", "").split(" ")[0].isdigit() and canal in TITULO_COLETANEA:
            # coletanea: marca e o planejar junta a proxima serie publicada (nao remonta todo dia a toa)
            p["curto"] = {"min": round(longo.duracao(final) / 60, 1), "quando": agora().strftime("%Y-%m-%dT%H:%M:%SZ")}
            gravar(arq, p)
            print("coletanea marcada como CURTA: a proxima serie publicada entra nela", flush=True)
        sys.exit("LONGO NAO SUBIU: menos de 10 min")
    meio = capitulos[1][0] if len(capitulos) > 1 else 5.0
    jpg = capa(final, meio + float(p.get("capa_t", 6.0)), p.get("capa_texto") or p["titulo"], final.replace(".mp4", ".jpg"))
    dur = longo.duracao(final)
    if not publicar:
        if subprocess.run(["gh", "release", "view", "teste-longo"], capture_output=True).returncode != 0:
            run("gh", "release", "create", "teste-longo", "--title", "Provas do video longo", "--notes", "Nao publicado.")
        run("gh", "release", "upload", "teste-longo", final, jpg, "--clobber")
        print(f"PROVA DO LONGO pronta ({dur / 60:.1f} min) na Release teste-longo", flush=True)
        return None
    vid = ja_subiu(canal, p["titulo"])
    if vid:
        print(f"LONGO JA ESTAVA NO CANAL ({vid}): nao subo de novo, so marco como feito", flush=True)
    else:
        vid = subir(canal, p, final, jpg, capitulos, pasta)
    p["feito"] = {"youtube": vid, "quando": agora().strftime("%Y-%m-%dT%H:%M:%SZ"), "min": round(dur / 60, 1)}
    gravar(arq, p)
    print(f"LONGO PUBLICADO https://youtu.be/{vid} ({dur / 60:.1f} min)", flush=True)
    return vid


def main():
    a = sys.argv[1:]
    publicar = "--sem-subir" not in a
    if "--limpar" in a:
        limpar_duplicados()
        return 0
    if "--plano" in a:
        montar(os.path.join(RAIZ, a[a.index("--plano") + 1]) if not os.path.isabs(a[a.index("--plano") + 1])
               else a[a.index("--plano") + 1], publicar)
        return 0
    planejar()
    for canal in CANAIS:
        for arq in sorted(glob.glob(os.path.join(RAIZ, canal, "longos", "*.json"))):
            try:
                p = ler(arq)
            except Exception:
                continue
            if pronto(p):
                if publicar and p.get("titulo"):
                    vid = ja_subiu(canal, p["titulo"])
                    if vid:
                        p["feito"] = {"youtube": vid, "quando": agora().strftime("%Y-%m-%dT%H:%M:%SZ"),
                                      "obs": "ja estava no canal; nao montado de novo"}
                        gravar(arq, p)
                        print(f"[{canal}] {os.path.basename(arq)} ja estava no canal ({vid}): marcado como feito", flush=True)
                        continue
                # 24/11 (Pedro): erro de duracao nao pode nem acontecer. Confere ANTES de desenhar e, se nao
                # chega a 10 min, CONSERTA sozinho: coletanea ganha a proxima serie; Old Tales pede mais extras.
                prev = prever_s(p, CANAIS[canal])
                print(f"[{canal}] {os.path.basename(arq)}: previsto {prev / 60:.1f} min antes de montar", flush=True)
                if prev < longo.MINIMO_S:
                    if canal in TITULO_COLETANEA:
                        p["curto"] = {"previsto_min": round(prev / 60, 1),
                                      "quando": agora().strftime("%Y-%m-%dT%H:%M:%SZ")}
                        gravar(arq, p)
                        print(f"[{canal}] curta demais: vai ganhar a proxima serie publicada (sem desenhar a toa)",
                              flush=True)
                        planejar()
                        continue
                    sys.exit(f"LONGO NAO MONTADO {os.path.basename(arq)}: previsto {prev / 60:.1f} min (< 10). "
                             f"Old Tales: o roteirista precisa aumentar abertura/epilogo (ROTEIROS.md). Nada subiu.")
                montar(arq, publicar)
                return 0  # um longo por execucao (tempo de desenho)
    print("nenhum longo pronto para montar agora", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
