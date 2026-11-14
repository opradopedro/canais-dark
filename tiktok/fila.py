"""Fila do TikTok: diz quais videos do YouTube ainda faltam postar no TikTok, quando e com qual legenda.

Regras do Pedro (13/11/2026):
- O TikTok acompanha o YouTube, na mesma frequencia: video que entrou no ar no YouTube vai para o TikTok.
- Series antigas (ja no ar quando o TikTok comecou) nunca vao: estao em postados.json -> "ignorar".
- Serie que estava rodando: as partes atrasadas saem de 8 em 8 horas ate alcancar o YouTube.

Uso: python tiktok/fila.py            -> imprime JSON com a lista do que postar agora
     python tiktok/fila.py --marcar CL043 7f3c...   -> grava em postados.json (codigo + postId da vidIQ)
A postagem em si e feita pela rotina do Claude com a vidIQ (TIKTOK.md explica o passo a passo).
"""
import datetime as dt
import json
import os
import sys
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTADO = os.path.join(AQUI, "postados.json")
DADOS = "https://opradopedro.github.io/canais-dark/dados.json"

# canal do painel -> conta do TikTok na vidIQ (platformAccountId). Signal Lost entra quando a conta existir.
CONTAS = {
    "hm": {"nome": "Hora Muerta", "conta": "_000FBVWbbJdNMceopUD4slkvmLZlmLG8U3G",
           "tags": "#terror #historiasdeterror #leyendas #miedo #fyp"},
    "cl": {"nome": "Old Tales", "conta": "_000c1r5lizrOj4PxU5edauda4atRTSfCXOB",
           "tags": "#history #mythology #storytime #fyp"},
    "yb": {"nome": "So You Built It", "conta": "_000gO7yEeCRneJHtqZge5qXHTrBrOrGCaR0",
           "tags": "#engineering #howitworks #science #fyp"},
}
INTERVALO_SERIE_H = 8    # partes atrasadas da mesma conta: 8 em 8 horas
INTERVALO_SOLTO_H = 2    # SYBI (sem serie): 2 no mesmo dia saem com 2 h de distancia, como no YouTube


def legenda(titulo, tags):
    t = " ".join(p for p in titulo.split() if p.lower() not in ("#shorts", "#short"))
    tem = {p.lower() for p in t.split() if p.startswith("#")}
    extra = [x for x in tags.split() if x.lower() not in tem]
    return (t + " " + " ".join(extra)).strip()[:2200]


def fila(agora=None):
    agora = agora or dt.datetime.now(dt.timezone.utc)
    est = json.load(open(ESTADO, encoding="utf-8"))
    dados = json.load(urllib.request.urlopen(DADOS, timeout=60))
    saida = []
    for c in dados["canais"]:
        cfg = CONTAS.get(c["id"])
        if not cfg:
            continue
        ign = set(est["ignorar"].get(c["id"], []))
        feitos = est["postados"]
        prontos = []
        for i in c["itens"]:
            cod = i["codigo"]
            if cod in ign or cod in feitos or not i.get("youtube"):
                continue
            no_ar = i["estado"] == "publicado" or (
                i["estado"] == "agendado" and i.get("publica_em")
                and dt.datetime.fromisoformat(i["publica_em"].replace("Z", "+00:00")) <= agora)
            if no_ar:
                prontos.append(i)
        prontos.sort(key=lambda i: i["codigo"])
        passo = INTERVALO_SOLTO_H if c["id"] == "yb" else INTERVALO_SERIE_H
        # o primeiro sai agora; os outros atrasados da mesma conta, de passo em passo
        prox = agora + dt.timedelta(minutes=5)
        for i in prontos:
            saida.append({"codigo": i["codigo"], "canal": c["id"], "conta": cfg["conta"], "nome": cfg["nome"],
                          "youtube": i["youtube"], "legenda": legenda(i["titulo"], cfg["tags"]),
                          "agora": prox <= agora + dt.timedelta(minutes=20),
                          "quando": prox.replace(microsecond=0).isoformat()})
            prox += dt.timedelta(hours=passo)
    return saida


def marcar(cod, post_id, quando, canal):
    est = json.load(open(ESTADO, encoding="utf-8"))
    est["postados"][cod] = {"postId": post_id, "quando": quando, "canal": canal}
    json.dump(est, open(ESTADO, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("MARCADO", cod)


if __name__ == "__main__":
    if len(sys.argv) >= 6 and sys.argv[1] == "--marcar":
        marcar(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    else:
        print(json.dumps(fila(), ensure_ascii=False, indent=1))
