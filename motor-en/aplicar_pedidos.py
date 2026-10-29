"""Aplica os pedidos do painel ANTES da producao, com o Gemini (gratis), sem Claude e sem Kiro.

Roda no GitHub Actions antes de cada producao (canais.yml). Para o canal da vez:
  - "pedido" (Pedir mudanca) num video que ainda nao subiu: o Gemini reescreve SO o que foi pedido no roteiro,
    o fiscal confere; se passar, salva, comenta no ticket e fecha. Se nao passar, comenta e deixa aberto.
  - "pedido" num video que ja saiu: comenta que ja foi publicado e fecha.
  - "gostei" / "naogostei": guarda em metricas/votos.csv (a analise semanal le) e fecha.
  - "ideia": fica aberta para a proxima escrita de roteiros.
Uso: python motor-en/aplicar_pedidos.py <pasta do canal>
"""
import csv, datetime as dt, glob, json, os, re, subprocess, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.environ.get("GITHUB_REPOSITORY", "opradopedro/canais-dark")
ID = {"signal-lost": "sv", "old-tales": "cl", "hora-muerta": "hm", "so-you-built-it": "yb"}
API_G = "https://generativelanguage.googleapis.com/v1beta"


def gh(metodo, caminho, corpo=None):
    req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/{caminho}", method=metodo,
                                 data=json.dumps(corpo).encode() if corpo is not None else None,
                                 headers={"Accept": "application/vnd.github+json",
                                          "Authorization": "Bearer " + os.environ["GH_TOKEN"]})
    with urllib.request.urlopen(req, timeout=30) as r:
        txt = r.read().decode()
        return json.loads(txt) if txt else {}


def responder(n, texto, fechar=False, etiqueta=None):
    gh("POST", f"issues/{n}/comments", {"body": texto})
    if etiqueta:
        gh("POST", f"issues/{n}/labels", {"labels": [etiqueta]})
    if fechar:
        gh("PATCH", f"issues/{n}", {"state": "closed"})


def _modelo(key):
    """Modelo de texto flash mais novo da conta (cota gratis), igual ao tts.py do motor."""
    if os.environ.get("GEMINI_TEXT_MODEL"):
        return os.environ["GEMINI_TEXT_MODEL"]
    req = urllib.request.Request(f"{API_G}/models?pageSize=1000", headers={"x-goog-api-key": key})
    nomes = [m["name"].split("/")[-1] for m in json.load(urllib.request.urlopen(req, timeout=60)).get("models", [])
             if "generateContent" in m.get("supportedGenerationMethods", [])]
    ok = [n for n in nomes if "flash" in n and not re.search(r"tts|image|live|audio|lite|exp", n)]
    versao = lambda n: float((re.findall(r"\d+(?:\.\d+)?", n) or ["0"])[0])
    ok.sort(key=lambda n: ("preview" in n, -versao(n)))
    return (ok or ["gemini-2.5-flash"])[0]


def gemini(prompt):
    key = os.environ["GEMINI_API_KEY"]
    modelo = _modelo(key)
    corpo = {"contents": [{"parts": [{"text": prompt}]}],
             "generationConfig": {"responseMimeType": "application/json", "temperature": 0.4}}
    req = urllib.request.Request(f"{API_G}/models/{modelo}:generateContent", json.dumps(corpo).encode(),
                                 {"Content-Type": "application/json", "x-goog-api-key": key})
    with urllib.request.urlopen(req, timeout=180) as r:
        out = json.load(r)
    return out["candidates"][0]["content"]["parts"][0]["text"]


def pecas():
    txt = open(os.path.join(RAIZ, "hora-muerta", "scripts", "engine.html"), encoding="utf-8").read()
    return sorted(set(re.findall(r"COMP\.(\w+)\s*=", txt)))


def fiscal_ok(pasta):
    r = subprocess.run([sys.executable, os.path.join(RAIZ, "motor-en", "validar_roteiros.py")], cwd=RAIZ,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    erros = [l for l in r.stdout.splitlines() if "ERRO" in l and pasta in l.replace("\\", "/")]
    return not erros, erros


def publicados(pasta):
    """Codigos que ja estao no YouTube (agendados ou publicos): esses nao sao mais editados por aqui."""
    try:
        r = subprocess.run([sys.executable, os.path.join(RAIZ, "motor-en", "painel_dados.py")], cwd=RAIZ,
                           capture_output=True, text=True, timeout=300)
        d = json.load(open(os.path.join(RAIZ, "painel-web", "dados.json"), encoding="utf-8"))
        c = next(c for c in d["canais"] if c["pasta"] == pasta)
        return {i["codigo"]: i["estado"] for i in c["itens"] if i["estado"] != "roteiro"}
    except Exception:
        return None


def main(pasta):
    cid = ID[pasta]
    tickets = gh("GET", f"issues?state=open&labels=painel,{cid}&per_page=50")
    if not tickets:
        print(f"{pasta}: nenhum pedido aberto"); return
    ja = publicados(pasta)
    mudou = False
    for t in tickets:
        n, titulo, corpo = t["number"], t.get("title", ""), t.get("body") or ""
        labels = {l["name"] for l in t.get("labels", [])}
        m = re.match(r"\[([A-Z]+\d+)\]", titulo)
        cod = m.group(1) if m else None
        texto = corpo.split("\n---\n")[0].strip()
        if labels & {"gostei", "naogostei"} and cod:
            os.makedirs(os.path.join(RAIZ, "metricas"), exist_ok=True)
            arq = os.path.join(RAIZ, "metricas", "votos.csv"); novo = not os.path.exists(arq)
            with open(arq, "a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                if novo:
                    w.writerow(["data", "canal", "codigo", "voto", "comentario"])
                w.writerow([dt.date.today().isoformat(), cid, cod, "gostei" if "gostei" in labels else "naogostei", texto[:300]])
            mudou = True
            responder(n, "Voto registrado em metricas/votos.csv. A análise semanal usa isso. Obrigado!", fechar=True)
            continue
        if "pedido" not in labels or not cod:
            continue  # ideia: fica aberta para a escrita de roteiros
        if ja is not None and cod in ja:
            responder(n, f"O {cod} já está no YouTube ({ja[cod]}), então não dá mais para mudar o roteiro por aqui. "
                         "Se for grave, apague o vídeo agendado no YouTube Studio e reabra este pedido.", fechar=True)
            continue
        arqs = [f for f in glob.glob(os.path.join(RAIZ, pasta, "stories", "*.json"))
                if json.load(open(f, encoding="utf-8")).get("codigo") == cod]
        if not arqs:
            responder(n, f"Não achei o roteiro {cod} em {pasta}/stories. Confira o código."); continue
        arq = arqs[0]
        original = open(arq, encoding="utf-8").read()
        regras = open(os.path.join(RAIZ, "ROTEIROS.md"), encoding="utf-8").read()[:6000]
        prompt = (
            "Você edita o roteiro (JSON) de um vídeo curto do YouTube. Aplique SOMENTE o pedido do dono do canal, "
            "mudando o mínimo necessário. Mantenha exatamente o mesmo formato e os mesmos campos; mantenha o idioma "
            "da narração; mantenha os marcadores entre chaves como {when_next}; o campo 'codigo' não muda. "
            f"Peças de cena permitidas no campo 'comp': {', '.join(pecas())}. "
            "Se mudar o número de falas ('lineas'), ajuste os índices 'linea' de 'cenas' e 'eventos' para continuarem válidos. "
            "Responda APENAS com o JSON completo do roteiro editado.\n\n"
            f"REGRAS DO CANAL (trecho):\n{regras}\n\nPEDIDO DO DONO:\n{texto}\n\nROTEIRO ATUAL:\n{original}")
        try:
            novo = json.loads(gemini(prompt))
            if novo.get("codigo") != cod:
                raise ValueError("o Gemini mudou o código")
            novo["editado_por_pedido"] = n
            open(arq, "w", encoding="utf-8").write(json.dumps(novo, ensure_ascii=False, indent=1) + "\n")
            ok, erros = fiscal_ok(pasta)
            if not ok:
                open(arq, "w", encoding="utf-8").write(original)
                raise ValueError("o fiscal reprovou: " + "; ".join(erros[:3]))
        except Exception as e:
            responder(n, f"Não consegui aplicar sozinho ({str(e)[:300]}). Deixei aberto para o Kiro ou o Claude.")
            continue
        mudou = True
        responder(n, f"Aplicado no roteiro `{os.path.relpath(arq, RAIZ)}` antes da produção. "
                     "O vídeo sai já com a mudança.", fechar=True, etiqueta="feito")
        print(f"{pasta}: pedido #{n} aplicado em {cod}")
    if mudou:
        subprocess.run(["git", "add", "-A", f"{pasta}/stories", "metricas"], cwd=RAIZ)
        subprocess.run(["git", "-c", "user.name=canais-bot", "-c", "user.email=canais-bot@users.noreply.github.com",
                        "commit", "-q", "-m", f"{pasta}: pedidos do painel aplicados"], cwd=RAIZ)
        subprocess.run(["git", "pull", "-q", "--rebase", "origin", "producao"], cwd=RAIZ)
        subprocess.run(["git", "push", "-q", "origin", "HEAD:producao"], cwd=RAIZ)


if __name__ == "__main__":
    main(sys.argv[1])
