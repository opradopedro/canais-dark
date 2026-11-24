"""Vigia das postagens (Pedro, 24/11/2026: "nunca mais deixe isso acontecer").

O TikTok ficou 6 dias parado (18-24/11) e o longo do Wukong subiu 11 vezes repetido sem ninguem perceber,
porque as rotinas terminavam "com sucesso". Este vigia olha o RESULTADO (o que esta no ar) e nao o processo:
  1. YouTube: cada canal postou dentro do prazo? (feed publico, sem token)
  2. YouTube: algum video com o MESMO titulo publico mais de uma vez? (longo repetido)
  3. TikTok: Short publico no YouTube ha mais de 8 h que nao foi para o TikTok?
  4. TikTok: a rotina do Claude rodou nas ultimas 14 h? (tiktok/estatisticas.json "gerado")
  5. Radar GTA no YouTube (repost dos Reels do Instagram): ultimo envio ha menos de 30 h?
Problema achado = sai com codigo 1 (o GitHub manda e-mail) e o texto vai para a Release "logs" (vigia.txt).
Uso: python vigia/postagens.py
"""
import collections
import datetime as dt
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "tiktok"))
import fila  # noqa: E402

PRAZO_H = {"hm": 30, "cl": 30, "sv": 30, "yb": 24}  # HM/CL/SV 1 Short por dia; SYBI 2 por dia (21Z e 23Z: maior intervalo normal 22 h)
AGORA = dt.datetime.now(dt.timezone.utc)


def _norm(t):
    t = re.sub(r"#\w+", " ", t or "")
    return re.sub(r"\W+", " ", t).strip().lower()


def checar():
    prob, ok = [], []
    for cid, cfg in fila.CONTAS.items():
        try:
            vids = fila.publicos(cfg["yt"])
        except Exception as e:
            prob.append(f"{cfg['nome']}: nao consegui ler o canal do YouTube ({e})")
            continue
        if not vids:
            prob.append(f"{cfg['nome']}: nenhum video publico no YouTube")
            continue
        h = (AGORA - vids[-1]["publicado"]).total_seconds() / 3600
        (prob if h > PRAZO_H[cid] else ok).append(
            f"{cfg['nome']} YouTube: ultimo Short ha {h:.0f} h ({vids[-1]['id']})" + (" - PARADO" if h > PRAZO_H[cid] else ""))
        rep = collections.defaultdict(list)
        for v in vids:
            rep[_norm(v["titulo"])].append(v["id"])
        for t, ids in rep.items():
            if len(ids) > 1:
                prob.append(f"{cfg['nome']} YouTube: o MESMO video esta publico {len(ids)} vezes ({', '.join(ids)}): '{t[:60]}'")
    try:
        atr = fila.atrasados(8)
    except Exception as e:
        atr = []
        prob.append(f"TikTok: nao consegui conferir a fila ({e})")
    por = collections.Counter(a["canal"] for a in atr)
    for cid, n in por.items():
        velho = min(a["no_youtube_desde"] for a in atr if a["canal"] == cid)
        prob.append(f"{fila.CONTAS[cid]['nome']} TikTok: {n} Short(s) no ar no YouTube e fora do TikTok (o mais antigo desde {velho[:16]}Z)")
    for cid in fila.CONTAS:
        if cid not in por:
            ok.append(f"{fila.CONTAS[cid]['nome']} TikTok: em dia")
    try:
        g = json.load(open(os.path.join(RAIZ, "tiktok", "estatisticas.json"), encoding="utf-8"))["gerado"]
        h = (AGORA - dt.datetime.fromisoformat(g.replace("Z", "+00:00"))).total_seconds() / 3600
        (prob if h > 14 else ok).append(f"Rotina do TikTok: ultima rodada ha {h:.0f} h" + (" - A ROTINA PAROU" if h > 14 else ""))
    except Exception as e:
        prob.append(f"Rotina do TikTok: sem tiktok/estatisticas.json ({e})")
    try:
        d = json.load(open(os.path.join(RAIZ, "gta6", "youtube-publicados.json"), encoding="utf-8"))
        q = max(v.get("quando", "") for v in d.values() if isinstance(v, dict))
        h = (AGORA - dt.datetime.fromisoformat(q.replace("Z", "+00:00"))).total_seconds() / 3600
        (prob if h > 30 else ok).append(f"Radar GTA YouTube: ultimo Short ha {h:.0f} h" + (" - PARADO (Reels do Instagram podem ter parado)" if h > 30 else ""))
    except Exception as e:
        prob.append(f"Radar GTA YouTube: nao consegui ler gta6/youtube-publicados.json ({e})")
    return prob, ok


def main():
    prob, ok = checar()
    txt = f"Vigia das postagens {AGORA:%Y-%m-%d %H:%M}Z\n\n"
    txt += ("PROBLEMAS:\n" + "\n".join("- " + p for p in prob) + "\n\n") if prob else "Tudo postando.\n\n"
    txt += "OK:\n" + "\n".join("- " + o for o in ok) + "\n"
    print(txt)
    open("/tmp/vigia.txt", "w", encoding="utf-8").write(txt)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8").write(txt.replace("\n", "  \n"))
    return 1 if prob else 0


if __name__ == "__main__":
    sys.exit(main())
