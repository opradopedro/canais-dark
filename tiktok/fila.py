"""Fila do TikTok: diz quais videos do YouTube ainda faltam postar no TikTok, com qual legenda.

Regras do Pedro:
- (13/11/2026) O TikTok acompanha o YouTube: video que entrou no ar no YouTube vai para o TikTok.
- (14/11/2026) So posta o video que esta PUBLICO no YouTube AGORA, e o MESMO arquivo (mesmo ID do YouTube).
  Nunca agenda com antecedencia na vidIQ (post agendado la nao pode ser cancelado: foi assim que o
  Wukong cartoon antigo CL042 saiu no TikTok em 14/11 depois de ter sido trocado pelo ilustrado).

Fonte da verdade = feed publico do canal no YouTube (feeds/videos.xml): so lista video publico.
Video privado, desagendado, substituido ou ainda agendado nao aparece la, entao nao vai para o TikTok.
O controle e pelo ID do video do YouTube (a "versao"): o cartoon e o ilustrado tem IDs diferentes.

Uso: python tiktok/fila.py                       -> JSON com o que postar AGORA (publicar na hora, sem publishAt)
     python tiktok/fila.py --marcar <youtubeId> <postId> <canal> [codigo] [<link do post no TikTok>]
     python tiktok/fila.py --ignorar <youtubeId> <canal> [motivo]           -> nunca postar esse video
A postagem em si e feita pela rotina do Claude com a vidIQ (TIKTOK.md explica o passo a passo).
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTADO = os.path.join(AQUI, "postados.json")
INICIO = dt.datetime(2026, 11, 13, 22, 0, tzinfo=dt.timezone.utc)  # o que ja estava no ar antes do TikTok nao vai

# canal -> canal do YouTube + conta do TikTok na vidIQ (platformAccountId). Signal Lost entra quando a conta existir.
CONTAS = {
    "hm": {"nome": "Hora Muerta", "yt": "UCiLd9rv-eC7-22CkPNMAF4A", "conta": "_000FBVWbbJdNMceopUD4slkvmLZlmLG8U3G",
           "tags": "#terror #historiasdeterror #leyendas #miedo #fyp"},
    "cl": {"nome": "Old Tales", "yt": "UCmpeyiBOctQZsuwQkATFM9w", "conta": "_000c1r5lizrOj4PxU5edauda4atRTSfCXOB",
           "tags": "#history #mythology #storytime #fyp"},
    "yb": {"nome": "So You Built It", "yt": "UC1ZjZVb5O-Bv_GXfukN3Tqw", "conta": "_000gO7yEeCRneJHtqZge5qXHTrBrOrGCaR0",
           "tags": "#engineering #howitworks #science #fyp"},
    # REGRA do Pedro (15/11): o Signal Lost so posta no TikTok os videos do motor NOVO (ilustrado).
    "sv": {"nome": "Signal Lost", "yt": "UC9gwQy8PJ5DA6Ii4ic8Pr-g", "conta": "_000YWmW5XJxNaQwk5spdhkLeeujRfv_CCJ4",
           "tags": "#horror #scarystories #survival #creepy #fyp", "so_visual": "ilustrado"},
}
DADOS = "https://opradopedro.github.io/canais-dark/dados.json"
RAIZ = os.path.dirname(AQUI)


def visuais(cid):
    """youtubeId -> "visual" do roteiro (dados.json do painel liga o video ao arquivo do roteiro)."""
    out = {}
    try:
        dados = json.load(urllib.request.urlopen(DADOS, timeout=60))
    except Exception as e:
        print("dados.json falhou (%s): canal com filtro de visual fica de fora nesta rodada" % e, file=sys.stderr)
        return out
    for c in dados["canais"]:
        if c["id"] != cid:
            continue
        for i in c["itens"]:
            m = re.search(r"(?:youtu\.be/|shorts/|v=)([\w-]{11})", i.get("youtube") or "")
            if not m or not i.get("arquivo"):
                continue
            arq = os.path.join(RAIZ, i["arquivo"])
            if not os.path.exists(arq):  # roteiro pode ter ido para arquivo/
                arq = os.path.join(RAIZ, os.path.dirname(os.path.dirname(i["arquivo"])), "arquivo", os.path.basename(i["arquivo"]))
            try:
                out[m.group(1)] = json.load(open(arq, encoding="utf-8")).get("visual")
            except Exception:
                pass
    return out
MAX_POR_RODADA = {"yb": 2}  # por conta, por execucao (o resto fica para a proxima). Padrao: 1
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015",
      "media": "http://search.yahoo.com/mrss/"}


def legenda(titulo, tags):
    t = " ".join(p for p in titulo.split() if p.lower() not in ("#shorts", "#short"))
    tem = {p.lower() for p in t.split() if p.startswith("#")}
    extra = [x for x in tags.split() if x.lower() not in tem]
    return (t + " " + " ".join(extra)).strip()[:2200]


def _token():
    import urllib.parse
    for k in ("YT_REFRESH_TOKEN_EN", "YT_REFRESH_TOKEN_ES"):
        if os.environ.get(k):
            dados = urllib.parse.urlencode({"client_id": os.environ["YT_CLIENT_ID"],
                                            "client_secret": os.environ["YT_CLIENT_SECRET"],
                                            "refresh_token": os.environ[k], "grant_type": "refresh_token"}).encode()
            return json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", dados, timeout=60))["access_token"]
    raise RuntimeError("sem token do YouTube para o plano B")


def publicos_api(canal_yt):
    """Plano B (15/11: feed do YouTube dando 404): API do YouTube, playlist de uploads, so status public."""
    tok = _token()
    def get(u):
        return json.load(urllib.request.urlopen(urllib.request.Request(
            "https://www.googleapis.com/youtube/v3/" + u, headers={"Authorization": "Bearer " + tok}), timeout=60))
    itens = get("playlistItems?part=contentDetails&maxResults=30&playlistId=UU" + canal_yt[2:])["items"]
    ids = ",".join(i["contentDetails"]["videoId"] for i in itens)
    out = []
    for v in get("videos?part=snippet,status&id=" + ids)["items"]:
        if v["status"]["privacyStatus"] != "public":
            continue
        out.append({"id": v["id"], "titulo": v["snippet"]["title"],
                    "publicado": dt.datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00"))})
    return sorted(out, key=lambda v: v["publicado"])


def publicos(canal_yt):
    """Videos PUBLICOS do canal agora: [{id, titulo, publicado}] do mais antigo para o mais novo."""
    try:
        return publicos_feed(canal_yt)
    except Exception as e:
        print("feed falhou (%s), usando a API do YouTube" % e, file=sys.stderr)
        return publicos_api(canal_yt)


def publicos_feed(canal_yt):
    url = "https://www.youtube.com/feeds/videos.xml?channel_id=" + canal_yt
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    raiz = ET.fromstring(urllib.request.urlopen(req, timeout=60).read())
    out = []
    for e in raiz.findall("a:entry", NS):
        out.append({"id": e.find("yt:videoId", NS).text, "titulo": e.find("a:title", NS).text or "",
                    "publicado": dt.datetime.fromisoformat(e.find("a:published", NS).text)})
    return sorted(out, key=lambda v: v["publicado"])


def ainda_publico(vid):
    """Segunda conferencia, na hora de postar: o oEmbed so responde para video publico."""
    try:
        u = "https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=" + vid
        urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=30)
        return True
    except Exception:
        return False


def carregar():
    est = json.load(open(ESTADO, encoding="utf-8"))
    est.setdefault("ignorar_youtube", {})
    return est


def fila():
    est = carregar()
    feitos = {p.get("youtube") for p in est["postados"].values() if p.get("youtube")}
    ign = set(est["ignorar_youtube"])
    saida = []
    for cid, cfg in CONTAS.items():
        if not cfg.get("conta"):
            continue  # conta ainda nao ligada na vidIQ
        vis = visuais(cid) if cfg.get("so_visual") else None
        n = 0
        for v in publicos(cfg["yt"]):
            if v["publicado"] < INICIO or v["id"] in feitos or v["id"] in ign:
                continue
            if vis is not None and vis.get(v["id"]) != cfg["so_visual"]:
                continue  # Signal Lost: video do motor antigo nao vai
            if n >= MAX_POR_RODADA.get(cid, 1):
                break
            if not ainda_publico(v["id"]):
                continue
            saida.append({"youtubeId": v["id"], "codigo": v["id"], "agora": True,  # compatibilidade: sempre na hora
                          "quando": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(), "canal": cid, "conta": cfg["conta"], "nome": cfg["nome"],
                          "youtube": "https://www.youtube.com/shorts/" + v["id"], "titulo": v["titulo"],
                          "legenda": legenda(v["titulo"], cfg["tags"]),
                          "no_youtube_desde": v["publicado"].isoformat()})
            n += 1
    return saida


def salvar(est):
    json.dump(est, open(ESTADO, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def marcar(vid, post_id, canal, cod=None, link=None):
    est = carregar()
    chave = cod or vid
    antes = est["postados"].get(chave) or {}
    est["postados"][chave] = {"postId": post_id, "youtube": vid, "canal": canal,
                              # se so esta completando o link depois, mantem a hora em que foi postado
                              "quando": antes.get("quando") if antes.get("postId") == post_id and antes.get("quando")
                              else dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()}
    if link:  # postUrl do vidiq_social_post_status: o painel le as views do TikTok por ele
        est["postados"][chave]["tiktok"] = link
    salvar(est)
    print("MARCADO", chave, vid)


def pendentes():
    """Posts enviados a vidIQ sem o link do TikTok gravado (o TikTok ainda processava quando a rotina acabou).
    A rotina chama vidiq_social_post_status (gratis) para cada um e completa com --marcar ... <postUrl>."""
    est = carregar()
    return [{"chave": k, "postId": p["postId"], "youtube": p.get("youtube"), "canal": p.get("canal")}
            for k, p in est["postados"].items() if p.get("postId") and p.get("youtube") and not p.get("tiktok")]


def ignorar(vid, canal, motivo=""):
    est = carregar()
    est["ignorar_youtube"][vid] = {"canal": canal, "motivo": motivo}
    salvar(est)
    print("IGNORADO", vid)


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 5 and a[0] == "--marcar" and re.match(r"\d{4}-\d\d-\d\dT", a[3]):
        marcar(a[1], a[2], a[4])  # forma antiga: --marcar <codigo=youtubeId> <postId> <quando> <canal>
    elif len(a) >= 4 and a[0] == "--marcar":
        link = next((x for x in a[4:] if x.startswith("https://")), None)
        cod = next((x for x in a[4:] if not x.startswith("https://")), None)
        marcar(a[1], a[2], a[3], cod, link)
    elif a[:1] == ["--pendentes"]:
        print(json.dumps(pendentes(), ensure_ascii=False, indent=1))
    elif len(a) >= 3 and a[0] == "--ignorar":
        ignorar(a[1], a[2], " ".join(a[3:]))
    else:
        print(json.dumps(fila(), ensure_ascii=False, indent=1))
