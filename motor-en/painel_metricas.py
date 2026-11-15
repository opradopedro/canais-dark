"""Metricas estilo YouTube Studio para a aba "Metricas" do painel (painel-web/dados.json). CUSTO ZERO.

Pedido do Pedro (15/11/2026): engajamento, comentarios, views por dia, % assistida, inscritos etc., de YouTube e TikTok.

- YouTube Analytics API (gratis, mesma chave OAuth dos uploads): views por dia, minutos assistidos, duracao media,
  % media assistida, inscritos ganhos/perdidos, curtidas, comentarios, compartilhamentos, origem das views,
  paises e melhores videos dos ultimos 28 dias. Precisa do escopo yt-analytics.readonly no refresh token e da
  "YouTube Analytics API" ligada no projeto do Google Cloud. Se faltar, o painel cai no plano B abaixo e mostra o aviso.
- Plano B (sempre): numeros do canal (inscritos, views, videos) pela Data API + historico diario gravado em
  metricas/painel-historico.json (uma foto por dia), que da views/seguidores por dia de YouTube E TikTok.
"""
import datetime as dt, json, os, urllib.error, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HIST = os.path.join(RAIZ, "metricas", "painel-historico.json")
ANALYTICS = "https://youtubeanalytics.googleapis.com/v2/reports"
DIAS = 28


def _get(url, token):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.load(r)


def escopos(token):
    try:
        with urllib.request.urlopen("https://oauth2.googleapis.com/tokeninfo?access_token=" + token, timeout=20) as r:
            return json.load(r).get("scope", "")
    except Exception:
        return ""


def canal_info(m, token):
    """Inscritos, views e videos do canal (Data API, escopo youtube basta) e o link do canal."""
    it = m.get("channels", token, part="statistics,snippet", mine="true")["items"][0]
    st, sn = it.get("statistics", {}), it.get("snippet", {})
    url = sn.get("customUrl")
    return {"id": it["id"], "titulo": sn.get("title"),
            "link": f"https://www.youtube.com/{url}" if url else f"https://www.youtube.com/channel/{it['id']}",
            "inscritos": int(st.get("subscriberCount", 0)), "views": int(st.get("viewCount", 0)),
            "videos": int(st.get("videoCount", 0)), "inscritos_ocultos": st.get("hiddenSubscriberCount", False)}


def _relatorio(token, inicio, fim, metrics, **extra):
    q = {"ids": "channel==MINE", "startDate": inicio, "endDate": fim, "metrics": metrics}
    q.update(extra)
    r = _get(ANALYTICS + "?" + urllib.parse.urlencode(q), token)
    cols = [h["name"] for h in r.get("columnHeaders", [])]
    return [dict(zip(cols, row)) for row in r.get("rows", []) or []]


def analytics(token):
    """Relatorios dos ultimos 28 dias. Devolve {"erro": ...} se o token nao tiver o escopo ou a API estiver desligada."""
    if "yt-analytics" not in escopos(token):
        return {"erro": "sem_escopo"}
    hoje = dt.date.today()
    inicio, fim = (hoje - dt.timedelta(days=DIAS)).isoformat(), hoje.isoformat()
    base = "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments,shares"
    try:
        dias = _relatorio(token, inicio, fim, base, dimensions="day", sort="day")
        total = _relatorio(token, inicio, fim, base)
        top = _relatorio(token, inicio, fim, "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,comments,shares,subscribersGained",
                         dimensions="video", sort="-views", maxResults=10)
        try:
            origem = _relatorio(token, inicio, fim, "views", dimensions="insightTrafficSourceType", sort="-views")
        except Exception:
            origem = []
        try:
            paises = _relatorio(token, inicio, fim, "views", dimensions="country", sort="-views", maxResults=6)
        except Exception:
            paises = []
    except urllib.error.HTTPError as e:
        corpo = e.read().decode("utf-8", "replace")
        if "accessNotConfigured" in corpo or "has not been used" in corpo or "disabled" in corpo:
            return {"erro": "api_desligada"}
        return {"erro": f"HTTP {e.code}: {corpo[:160]}"}
    except Exception as e:
        return {"erro": str(e)[:160]}
    return {"inicio": inicio, "fim": fim, "dias": dias, "total": (total or [{}])[0], "top": top,
            "origem": origem, "paises": paises}


def historico_ler():
    try:
        return json.load(open(HIST, encoding="utf-8"))
    except Exception:
        return {}


def historico_gravar(hist, dia, cid, foto):
    """Uma foto por dia por canal (a ultima do dia vale). Guarda 400 dias."""
    hist.setdefault(dia, {})[cid] = foto
    for velho in sorted(hist)[:-400]:
        hist.pop(velho, None)
    os.makedirs(os.path.dirname(HIST), exist_ok=True)
    json.dump(hist, open(HIST, "w", encoding="utf-8"), ensure_ascii=False, indent=0, sort_keys=True)


def serie(hist, cid):
    """[{dia, yt:{...}, tt:{...}}] do canal, em ordem, para o painel calcular o que ganhou por dia."""
    return [{"dia": d, **hist[d][cid]} for d in sorted(hist) if cid in hist[d]][-90:]
