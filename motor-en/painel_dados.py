"""Monta painel-web/dados.json: todos os canais, roteiros, videos agendados e publicados, numeros e links.

Roda no GitHub Actions (.github/workflows/painel.yml). NAO GASTA CREDITO nem narracao: so le o repositorio,
a API do YouTube (leitura) e as Releases painel-<canal> (copias leves dos videos).
"""
import csv, datetime as dt, glob, importlib.util, json, os, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.environ.get("GITHUB_REPOSITORY", "opradopedro/canais-dark")
SAIDA = os.path.join(RAIZ, "painel-web")

CANAIS = [
    # id, pasta, nome, idioma, quando sai, modulo yt_upload, variavel do token, prefixo
    ("sv", "signal-lost", "Signal Lost", "EN", "1/dia, 19h NY", "motor-en/yt_upload.py", "YT_REFRESH_TOKEN_SURVIVAL", "SV"),
    ("cl", "old-tales", "Old Tales", "EN", "1/dia, 12h NY", "motor-en/yt_upload.py", "YT_REFRESH_TOKEN_CLASSICS", "CL"),
    ("hm", "hora-muerta", "Hora Muerta", "ES", "series de 2 partes", "hora-muerta/scripts/yt_upload.py", "YT_REFRESH_TOKEN_ES", "HM"),
    ("yb", "so-you-built-it", "So You Built It", "EN", "2/dia, 17h e 19h NY", "so-you-built-it/scripts/yt_upload.py", "YT_REFRESH_TOKEN_EN", "YB"),
]


def _gh(url):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    if os.environ.get("GH_TOKEN"):
        req.add_header("Authorization", "Bearer " + os.environ["GH_TOKEN"])
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except Exception:
        return None


def assets(cid):
    rel = _gh(f"https://api.github.com/repos/{REPO}/releases/tags/painel-{cid}") or {}
    return {a["name"]: a["browser_download_url"] for a in rel.get("assets", [])}


def youtube(modulo, token_var, prefixo):
    """{codigo: {...}} com estado e numeros. Vazio se a chave nao estiver disponivel."""
    if not os.environ.get(token_var):
        return {}, "sem chave"
    os.environ["YT_TOKEN_VAR"] = token_var
    caminho = os.path.join(RAIZ, modulo)
    sys.path.insert(0, os.path.dirname(caminho))
    spec = importlib.util.spec_from_file_location("yt_" + prefixo, caminho)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    if hasattr(m, "configurar"):
        m.configurar(prefixo, "en")
    try:
        token = m.access_token()
        ja = m.publicados(token)
        ids = [v["id"] for v in ja.values()]
        stats = {}
        for k in range(0, len(ids), 50):
            r = m.get("videos", token, part="statistics", id=",".join(ids[k:k + 50]))
            for v in r.get("items", []):
                stats[v["id"]] = v.get("statistics", {})
        for cod, v in ja.items():
            st = stats.get(v["id"], {})
            v.update(views=int(st.get("viewCount", 0)), likes=int(st.get("likeCount", 0)),
                     comentarios=int(st.get("commentCount", 0)))
        return ja, None
    except BaseException as e:  # sys.exit dos scripts antigos tambem
        return {}, str(e)[:200]


def gta():
    """Radar GTA VI BR (Instagram): so leitura, da agenda.json do branch radar-gta6-midia do claude-skills.
    A producao e a publicacao continuam na rotina do Claude; os pedidos (etiqueta gta) ficam para ela."""
    base = "https://raw.githubusercontent.com/opradopedro/claude-skills/radar-gta6-midia/"
    c = {"id": "gta", "nome": "Radar GTA VI BR", "pasta": "gta6", "idioma": "PT", "quando": "3 Reels/dia (Instagram)",
         "aviso_youtube": "Instagram: produzido pela rotina do Claude. Aqui é só para ver; pedidos ficam para ela.", "itens": []}
    try:
        with urllib.request.urlopen(base + "agenda.json", timeout=30) as r:
            agenda = json.load(r)
    except Exception as e:
        c["aviso_youtube"] += f" (não consegui ler a agenda: {str(e)[:80]})"
        return c
    for p in agenda.get("posts", []):
        st = p.get("status", "")
        if st in ("cancelado", "removido"):
            continue
        arq = p.get("arquivo", "")
        cod = os.path.splitext(arq)[0].replace("radar_", "").upper() or p.get("data", "")
        ficha = p.get("ficha") or {}
        titulo = (p.get("legenda") or p.get("titulo") or ficha.get("tema") or arq).split("\n")[0][:120]
        quando = f"{p.get('data', '')}T{p.get('hora', '12:00')}:00-03:00" if p.get("data") else None
        it = {"codigo": cod, "titulo": titulo, "roteiro": [l for l in (p.get("roteiro") or p.get("legenda") or "").split("\n") if l.strip()][:20],
              "formato": p.get("formato") or ficha.get("formato"), "arquivo": "claude-skills/radar-gta6-midia/agenda.json",
              "estado": "publicado" if st == "postado" else "agendado", "publica_em": quando}
        if p.get("link"):
            it["youtube"] = p["link"]
        if arq:
            it["video"] = base + arq
        c["itens"].append(it)
    return c


def main():
    agora = dt.datetime.now(dt.timezone.utc)
    canais = []
    for cid, pasta, nome, idioma, quando, modulo, tvar, pref in CANAIS:
        ja, erro = youtube(modulo, tvar, pref)
        arq = assets(cid)
        itens = []
        for f in sorted(glob.glob(os.path.join(RAIZ, pasta, "stories", "*.json"))):
            try:
                h = json.load(open(f, encoding="utf-8"))
            except Exception:
                continue
            cod = h.get("codigo", "")
            linhas = [l["texto"] if isinstance(l, dict) else l for l in h.get("lineas", [])]
            it = {"codigo": cod, "titulo": h.get("titulo", ""), "roteiro": linhas,
                  "serie": h.get("serie_titulo", "").split("|")[0].strip() or h.get("serie", ""),
                  "parte": h.get("parte"), "partes": h.get("partes"), "formato": h.get("formato"),
                  "autor": h.get("autor"), "arquivo": os.path.relpath(f, RAIZ).replace("\\", "/"),
                  "estado": "roteiro"}
            v = ja.get(cod)
            if v:
                quando_pub = v.get("publishAt")
                futuro = quando_pub and dt.datetime.fromisoformat(quando_pub.replace("Z", "+00:00")) > agora
                it.update(estado="agendado" if futuro else "publicado", youtube=f"https://youtu.be/{v['id']}",
                          publica_em=quando_pub, views=v.get("views", 0), likes=v.get("likes", 0),
                          comentarios=v.get("comentarios", 0))
            if cod + ".mp4" in arq:
                it["video"] = arq[cod + ".mp4"]
            if cod + ".jpg" in arq:
                it["capa"] = arq[cod + ".jpg"]
            itens.append(it)
        canais.append({"id": cid, "nome": nome, "pasta": pasta, "idioma": idioma, "quando": quando,
                       "aviso_youtube": erro, "itens": itens})
    canais.append(gta())
    os.makedirs(SAIDA, exist_ok=True)
    json.dump({"gerado": agora.strftime("%Y-%m-%dT%H:%M:%SZ"), "repo": REPO, "canais": canais},
              open(os.path.join(SAIDA, "dados.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for c in canais:
        print(f"{c['nome']}: {len(c['itens'])} itens" + (f" (aviso: {c['aviso_youtube']})" if c["aviso_youtube"] else ""))


if __name__ == "__main__":
    main()
