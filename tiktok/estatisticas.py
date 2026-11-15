"""Numeros do TikTok para o painel, de graca: le a pagina PUBLICA do perfil e de cada video no TikTok.

Pedido do Pedro (15/11/2026): o painel dos canais mostra o TikTok (seguidores, views e posts), atualizando sozinho, sem custo.
- Perfil: seguidores, curtidas e numero de videos (https://www.tiktok.com/@<handle>).
- Cada post: views, curtidas, comentarios e compartilhamentos, pelo link do post gravado em postados.json (campo "tiktok").
Nao gasta credito da vidIQ. Se o TikTok bloquear a leitura (ex.: IP do GitHub Actions), fica valendo o ultimo
estatisticas.json gravado (a rotina do TikTok roda isto no fim de cada execucao e faz o commit).

Uso: python tiktok/estatisticas.py           -> imprime o JSON
     python tiktok/estatisticas.py --salvar  -> grava tiktok/estatisticas.json (so se conseguiu ler algo)
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "estatisticas.json")
HANDLES = {"hm": "horamuerta.relatos", "cl": "oldtales.retold", "yb": "so.you.built.it", "sv": "siganllost.tales"}
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def _pagina(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def _stats(html):
    m = re.search(r'"stats":(\{[^{}]*\})', html)
    return json.loads(m.group(1)) if m else None


def perfil(handle):
    s = _stats(_pagina("https://www.tiktok.com/@" + handle))
    if not s or "followerCount" not in s:
        return None
    return {"seguidores": int(s["followerCount"]), "curtidas": int(s.get("heartCount") or s.get("heart") or 0),
            "videos": int(s.get("videoCount", 0))}


def video(url):
    s = _stats(_pagina(url))
    if not s or "playCount" not in s:
        return None
    return {"views": int(s["playCount"]), "likes": int(s.get("diggCount", 0)),
            "comentarios": int(s.get("commentCount", 0)), "compart": int(s.get("shareCount", 0))}


def coletar():
    postados = json.load(open(os.path.join(AQUI, "postados.json"), encoding="utf-8"))["postados"]
    out, lidos = {}, 0
    for cid, h in HANDLES.items():
        c = {"handle": h, "link": "https://www.tiktok.com/@" + h, "posts": []}
        try:
            c["perfil"] = perfil(h)
            lidos += c["perfil"] is not None
        except Exception as e:
            c["erro"] = str(e)[:120]
        for chave, p in postados.items():
            if p.get("canal") != cid or not p.get("tiktok"):
                continue
            item = {"youtube": p.get("youtube"), "codigo": chave if re.match(r"[A-Z]{2}\d+$", chave) else None,
                    "tiktok": p["tiktok"], "quando": p.get("quando")}
            try:
                n = video(p["tiktok"])
                if n:
                    item.update(n)
                    lidos += 1
            except Exception:
                pass
            c["posts"].append(item)
        c["posts"].sort(key=lambda x: x.get("quando") or "")
        c["views"] = sum(x.get("views", 0) for x in c["posts"])
        out[cid] = c
    return {"gerado": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "canais": out}, lidos


if __name__ == "__main__":
    dados, lidos = coletar()
    if "--salvar" in sys.argv:
        if not lidos:
            print("TikTok nao respondeu: estatisticas.json mantido", file=sys.stderr)
            sys.exit(0)
        json.dump(dados, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("estatisticas.json gravado:", {k: (v.get("perfil") or {}).get("seguidores") for k, v in dados["canais"].items()})
    else:
        print(json.dumps(dados, ensure_ascii=False, indent=1))
