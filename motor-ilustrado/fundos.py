"""Fundos do motor ilustrado: gera na Cloudflare Workers AI (camada gratis) SO o que falta e guarda na Release "fundos".

Cada mundo (cenarios/<mundo>.json) tem uma lista de cenarios com prompt fixo. Um cenario gerado uma vez e
reaproveitado por todas as series e videos longos daquele mundo (ex.: hogwarts/salao-comunal). Para variar a mesma
sala, o motor muda zoom, corte e luz; so crie cenario novo quando o LUGAR muda.

Uso:
  python motor-ilustrado/fundos.py            # gera os que faltam de todos os mundos e sobe na Release fundos
  python motor-ilustrado/fundos.py --teste    # compara modelos (Release fundos-teste)
  python motor-ilustrado/fundos.py --baixar <mundo> <pasta>   # baixa os fundos de um mundo (para o render)
Precisa: CF_ACCOUNT_ID, CF_API_TOKEN, gh autenticado (GH_TOKEN) no Actions.
"""
import base64, json, os, subprocess, sys, time, urllib.request, urllib.error, glob

AQUI = os.path.dirname(os.path.abspath(__file__))
MODELO = os.environ.get("FUNDOS_MODELO", "@cf/black-forest-labs/flux-2-klein-4b")  # teste 13/11: melhor custo/qualidade
REL = "fundos"
ESTILO_BASE = ("clean detailed digital illustration, crisp dark ink outlines, soft painterly shading, "
               "premium animated explainer background art, cinematic composition, wide 16:9 shot, "
               "empty scene with open floor space in the middle, no people, no characters, no animals, no text, no watermark")


def cf(modelo, prompt, seed, w=1600, h=912):
    conta, tok = os.environ["CF_ACCOUNT_ID"], os.environ["CF_API_TOKEN"]
    url = f"https://api.cloudflare.com/client/v4/accounts/{conta}/ai/run/{modelo}"
    corpo = {"prompt": prompt, "seed": seed}
    if "flux-1-schnell" in modelo:
        corpo = {"prompt": prompt, "steps": 8}
    else:
        corpo.update({"width": w, "height": h})
    if "flux-2" in modelo:  # flux-2 pede multipart
        lim = "----fundos"
        partes = []
        for k, v in corpo.items():
            partes.append(f"--{lim}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n")
        dados = ("".join(partes) + f"--{lim}--\r\n").encode()
        tipo = f"multipart/form-data; boundary={lim}"
    else:
        dados, tipo = json.dumps(corpo).encode(), "application/json"
    req = urllib.request.Request(url, data=dados, headers={"Authorization": f"Bearer {tok}", "Content-Type": tipo})
    for tentativa in range(3):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                ct, raw = r.headers.get("Content-Type", ""), r.read()
            if ct.startswith("image/"):
                return raw
            d = json.loads(raw)
            img = (d.get("result") or {}).get("image")
            if not img:
                raise RuntimeError(f"sem imagem: {str(d)[:300]}")
            return base64.b64decode(img)
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:400]
            print(f"  {modelo} HTTP {e.code}: {msg}")
            if e.code in (400, 401, 403, 404):
                raise
        except Exception as e:  # noqa
            print(f"  {modelo} erro: {e}")
        time.sleep(10 * (tentativa + 1))
    raise RuntimeError(f"falhou {modelo}")


def para_16x9(caminho):
    """Corta para 16:9 e deixa em 1920x1080 (ffmpeg)."""
    saida = caminho.rsplit(".", 1)[0] + ".jpg"
    tmp = saida + ".tmp.jpg"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", caminho, "-vf",
                    "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=1920:1080:flags=lanczos", "-q:v", "2", tmp], check=True)
    os.replace(tmp, saida)
    if caminho != saida:
        os.remove(caminho)
    return saida


def existentes(rel):
    r = subprocess.run(["gh", "release", "view", rel, "--json", "assets"], capture_output=True, text=True)
    if r.returncode:
        subprocess.run(["gh", "release", "create", rel, "--title", f"Fundos ({rel})",
                        "--notes", "Cenarios do motor ilustrado (gerados uma vez, reaproveitados)"], check=True)
        return set()
    return {a["name"] for a in json.loads(r.stdout)["assets"]}


def mundos():
    for f in sorted(glob.glob(os.path.join(AQUI, "cenarios", "*.json"))):
        yield json.load(open(f))


def prompt_de(m, c):
    return f"{c['prompt']}. {m.get('estilo', '')}. {ESTILO_BASE}"


def conferir_lugares():
    """REGRA do Pedro (13/11): so reaproveita fundo quando e o MESMO lugar. Cada cenario tem "lugar" proprio
    (ex.: "quarto do Harry" e "quarto do Rony" sao 2 cenarios). Lugar repetido no mesmo mundo = erro."""
    erros = []
    for m in mundos():
        vistos = {}
        for cid, c in m["cenarios"].items():
            lugar = (c.get("lugar") or "").strip().lower()
            if not lugar:
                erros.append(f"{m['mundo']}/{cid}: falta o campo lugar")
            elif lugar in vistos:
                erros.append(f"{m['mundo']}/{cid}: mesmo lugar de {vistos[lugar]} ({lugar})")
            vistos[lugar] = cid
    if erros:
        sys.exit("CENARIOS COM PROBLEMA:\n" + "\n".join(erros))


def gerar_faltando():
    conferir_lugares()
    tem = existentes(REL)
    os.makedirs("/tmp/fundos", exist_ok=True)
    novos = []
    for m in mundos():
        for cid, c in m["cenarios"].items():
            nome = f"{m['mundo']}__{cid}.jpg"
            if nome in tem:
                continue
            print("gerando", nome)
            raw = cf(m.get("modelo", MODELO), prompt_de(m, c), c.get("seed", 7))
            p = f"/tmp/fundos/{m['mundo']}__{cid}.png"
            open(p, "wb").write(raw)
            novos.append(para_16x9(p))
    if novos:
        subprocess.run(["gh", "release", "upload", REL, *novos, "--clobber"], check=True)
    print(f"{len(novos)} fundos novos; {len(tem)} ja existiam (reaproveitados)")


def baixar(mundo, pasta):
    os.makedirs(pasta, exist_ok=True)
    subprocess.run(["gh", "release", "download", REL, "-p", f"{mundo}__*", "-D", pasta, "--clobber"], check=True)


def teste():
    modelos = ["@cf/black-forest-labs/flux-1-schnell", "@cf/leonardo/lucid-origin",
               "@cf/leonardo/phoenix-1.0", "@cf/black-forest-labs/flux-2-dev", "@cf/black-forest-labs/flux-2-klein-4b"]
    m = json.load(open(os.path.join(AQUI, "cenarios", "wukong.json")))
    ids = list(m["cenarios"])[:2]
    tem = existentes("fundos-teste")
    os.makedirs("/tmp/fundos-teste", exist_ok=True)
    out = []
    for mod in modelos:
        for cid in ids:
            curto = mod.split("/")[-1]
            nome = f"{curto}__{cid}.jpg"
            if nome in tem:
                continue
            t0 = time.time()
            try:
                raw = cf(mod, prompt_de(m, m["cenarios"][cid]), 7)
            except Exception as e:  # noqa
                print("FALHOU", mod, e)
                break
            p = f"/tmp/fundos-teste/{curto}__{cid}.png"
            open(p, "wb").write(raw)
            out.append(para_16x9(p))
            print("ok", nome, f"{time.time()-t0:.1f}s")
    if out:
        subprocess.run(["gh", "release", "upload", "fundos-teste", *out, "--clobber"], check=True)


if __name__ == "__main__":
    if "--teste" in sys.argv:
        teste()
    elif "--baixar" in sys.argv:
        i = sys.argv.index("--baixar")
        baixar(sys.argv[i + 1], sys.argv[i + 2])
    else:
        gerar_faltando()
