"""Fiscal dos roteiros: confere TODO roteiro (escrito pelo Kiro ou pelo Claude) antes de ele ir ao ar.

Roda sozinho no GitHub a cada envio para a branch producao (.github/workflows/validar.yml).
Rode tambem antes de enviar: python motor-en/validar_roteiros.py
Sai com erro (e o GitHub fica vermelho) se achar:
  - codigo repetido, fora da sequencia ou com prefixo errado para o canal
  - campo obrigatorio faltando (codigo, titulo, descricao, tags, lineas, cenas)
  - cena apontando para uma fala que nao existe
  - peca de cena que nao existe no motor (engine.html)
  - serie quebrada (parte faltando, "anterior" errado)
  - parte que promete a seguinte sem o marcador {when_next}
  - Old Tales sem "tema" calmo/epico/mito ou com paleta de epoca que nao existe
  - roteiro novo curto ou longo demais (REGRA do Pedro, 05/11: SYBI ~1 min, historias 1min30 a 2 min)
"""
import glob, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# canal -> motor de cenas que ele usa (None = motor proprio, so confere o basico)
CANAIS = {
    "signal-lost": "hora-muerta/scripts/engine.html",
    "old-tales": "hora-muerta/scripts/engine.html",
    "hora-muerta": "hora-muerta/scripts/engine.html",
    "so-you-built-it": None,
}

# a partir destes codigos (inclusive) so vale estilo flat; os anteriores sao series do estilo antigo
TEMAS_CL = {"calmo", "epico", "mito"}
PALETAS_CL = {None, "grecia", "china", "roma", "nordico", "egito", "japao"}  # roma/nordico/egito/japao: PALS.cl_<nome> vem dos pacotes 14-17 (KIRO-PROMPT.md)
FLAT_DESDE = {"hora-muerta": 21, "signal-lost": 12, "old-tales": 13}
# REGRA do Pedro (07-10/11): series NOVAS desses 3 canais no motor 3D (motor-3d/, estilo do Reel). ROTEIROS.md "Estilo 3D"
TRES_D_DESDE = {"hora-muerta": 41, "signal-lost": 31, "old-tales": 34}
sys.path.insert(0, os.path.join(RAIZ, "motor-3d"))
from vocabulario import vocab as _vocab3d
V3D = _vocab3d()


def conferir_3d(n, h):
    """Roteiro com "visual":"3d": elenco, cenas e vocabulario do motor 3D."""
    e = []
    elenco = h.get("elenco")
    if not isinstance(elenco, dict) or not elenco:
        e.append(f"{n}: roteiro 3D precisa de \"elenco\" (atores declarados uma vez no topo)")
        elenco = {}
    for i, c in enumerate(h.get("cenas") or []):
        cn = c.get("cena")
        if not isinstance(cn, dict):
            e.append(f"{n}: cena {i} sem o bloco \"cena\" do motor 3D"); continue
        cen = cn.get("cenario")
        if cen not in V3D["cenarios"]:
            e.append(f"{n}: cena {i}: cenario '{cen}' nao esta pronto; use um de {sorted(V3D['cenarios'])}"); continue
        marcas = V3D["cenarios"][cen]
        def ok(campo, val, lista):
            if val is not None and val not in lista:
                e.append(f"{n}: cena {i}: {campo} '{val}' nao existe; use um de {lista}")
        ok("marca", cn.get("marca"), marcas)
        ok("plano", cn.get("plano"), V3D["planos"])
        ok("luz", cn.get("luz"), V3D["luzes"])
        ok("efeito", cn.get("efeito"), V3D["efeitos"])
        cr = cn.get("criatura")
        if cr:
            ok("criatura", cr.get("tipo"), V3D["criaturas"])
            ok("marca da criatura", cr.get("marca"), marcas)
        for a in cn.get("atores") or []:
            if a.get("id") not in elenco:
                e.append(f"{n}: cena {i}: ator '{a.get('id')}' nao esta no elenco")
            ok("acao", a.get("acao"), V3D["acoes"])
            ok("rosto", a.get("rosto"), V3D["expressoes"])
            ok("segura", a.get("segura"), V3D["objetos_mao"])
            ok("de", a.get("de"), marcas)
            ok("para", a.get("para"), marcas)
    return e
PECAS_FLAT_FIXAS = {"retrato", "texto"}

# REGRA do Pedro (05/11): videos mais longos. "a pessoa entende a historia e o video acaba".
# So You Built It ~1 min (pode passar se o tema pedir); historias (HM, SV, CL) 1min30 a 2 min. Shorts aceita ate 3 min.
# Medido nos videos prontos: a voz do SYBI fala ~3,1 palavras/s; a das historias ~1,55 palavras/s (lenta, com pausas).
# canal -> (codigo a partir do qual vale, min palavras, max palavras). Roteiros anteriores (estoque de 05/11) ficam como estao.
DURACAO_DESDE = {
    "so-you-built-it": (48, 165, 280),  # ~55 s a ~90 s; o ideal e 170-210 palavras (~1 min)
    "hora-muerta": (37, 135, 195),      # ~1min30 a ~2min05
    "signal-lost": (24, 135, 195),
    "old-tales": (31, 135, 195),
}
TOM_CL_DESDE = 42  # CL042 em diante: regra de tom de 12/11 (CL041 ja saiu)
MARCADOR_PALAVRAS = 3  # {when_next}/{dia_siguiente} viram ~3 palavras faladas ("tomorrow, Thursday")


def palavras(lineas):
    total = 0
    for l in lineas:
        t = l if isinstance(l, str) else (l.get("texto") or "")
        total += len(re.sub(r"\{\w+\}", "", t).split()) + MARCADOR_PALAVRAS * len(re.findall(r"\{\w+\}", t))
    return total


def _motor_txt(engine):
    """engine.html + os arquivos de pecas/ que ele carrega com <script src> (pecas extras do Kiro)."""
    txt = open(engine, encoding="utf-8").read()
    base = os.path.dirname(engine)
    for src in re.findall(r'<script src="(pecas/[^"]+)"', txt):
        arq = os.path.join(base, src)
        if os.path.exists(arq):
            txt += "\n" + open(arq, encoding="utf-8").read()
    return txt


def pecas(engine):
    txt = _motor_txt(os.path.join(RAIZ, engine))
    return set(re.findall(r"COMP\.(\w+)\s*=", txt))


def prefixo(canal, codigos):
    cj = os.path.join(RAIZ, canal, "canal.json")
    if os.path.exists(cj):
        return json.load(open(cj, encoding="utf-8"))["prefixo"]
    # canais antigos sem canal.json: o prefixo e o da maioria dos roteiros
    pref = [re.match(r"[A-Z]+", c).group(0) for c in codigos if re.match(r"[A-Z]+", c)]
    return max(set(pref), key=pref.count) if pref else None


def conferir(canal, engine):
    erros, avisos = [], []
    arqs = sorted(glob.glob(os.path.join(RAIZ, canal, "stories", "*.json")))
    hs = []
    for a in arqs:
        nome = os.path.relpath(a, RAIZ)
        try:
            h = json.load(open(a, encoding="utf-8"))
        except Exception as e:
            erros.append(f"{nome}: JSON invalido ({e})"); continue
        h["_arq"] = nome; hs.append(h)
    pref = prefixo(canal, [h.get("codigo", "") for h in hs])
    comps = pecas(engine) if engine else None
    global PECAS_FLAT
    PECAS_FLAT = PECAS_FLAT_FIXAS | {c for c in (comps or ()) if c.startswith("f_")}
    vistos = {}
    for h in hs:
        n, cod = h["_arq"], h.get("codigo", "")
        for campo in ("codigo", "titulo", "lineas", "cenas"):
            if not h.get(campo):
                erros.append(f"{n}: falta o campo '{campo}'")
        if not (h.get("descripcion") or h.get("description")):
            erros.append(f"{n}: falta a descricao ('descripcion')")
        if pref and not re.fullmatch(rf"{pref}\d{{3,}}", cod):
            erros.append(f"{n}: codigo '{cod}' deveria ser {pref} + 3 numeros")
        if cod in vistos:
            erros.append(f"{n}: codigo {cod} repetido (tambem em {vistos[cod]}). Use o proximo numero livre.")
        vistos[cod] = n
        lineas = h.get("lineas") or []
        for i, l in enumerate(lineas):
            if not (isinstance(l, str) or (isinstance(l, dict) and l.get("texto"))):
                erros.append(f"{n}: fala {i} sem texto")
        for c in h.get("cenas") or []:
            if not isinstance(c.get("linea"), int) or not 0 <= c["linea"] < len(lineas):
                erros.append(f"{n}: cena aponta para a fala {c.get('linea')}, que nao existe")
            if comps is not None and c.get("comp") and c["comp"] not in comps:
                erros.append(f"{n}: peca de cena '{c['comp']}' nao existe no motor ({engine})")
        for e in h.get("eventos") or []:
            if isinstance(e.get("linea"), int) and not 0 <= e["linea"] < len(lineas):
                erros.append(f"{n}: evento '{e.get('tipo')}' aponta para a fala {e['linea']}, que nao existe")
        # REGRA do Pedro (02/11): Old Tales nao e so calmo. tema = calmo (dia a dia), epico (soldado, batalha) ou mito
        if canal == "old-tales" and h.get("tema") not in TEMAS_CL:
            erros.append(f"{n}: Old Tales precisa de \"tema\" entre {sorted(TEMAS_CL)} (identidade do canal: legenda dourada, sem flash vermelho)")
        if canal == "old-tales" and h.get("paleta") not in PALETAS_CL:
            erros.append(f"{n}: paleta '{h.get('paleta')}' nao existe no Old Tales; use uma de {sorted(p for p in PALETAS_CL if p)} ou nenhuma (medieval)")
        # REGRA do Pedro (01/11): historia nova de Hora Muerta, Signal Lost e Old Tales so no estilo flat
        num = int(re.sub(r"\D", "", cod) or 0)
        if canal in TRES_D_DESDE and num >= TRES_D_DESDE[canal] and h.get("visual") != "3d":
            erros.append(f"{n}: serie nova precisa de \"visual\": \"3d\" (motor-3d, ROTEIROS.md 'Estilo 3D')")
        if h.get("visual") == "3d":
            erros += conferir_3d(n, h)
        elif canal in FLAT_DESDE and num >= FLAT_DESDE[canal]:
            if h.get("visual") != "flat":
                erros.append(f"{n}: historia nova precisa de \"visual\": \"flat\" (estilo novo, ESTILO-VISUAL.md)")
            velhas = sorted({c.get("comp") for c in h.get("cenas") or []} - PECAS_FLAT)
            if velhas:
                erros.append(f"{n}: pecas do estilo antigo {velhas}; use so pecas flat (f_*, retrato, texto)")
        if canal in DURACAO_DESDE and num >= DURACAO_DESDE[canal][0]:
            _, pmin, pmax = DURACAO_DESDE[canal]
            pw = palavras(lineas)
            if not pmin <= pw <= pmax:
                alvo = "~1 min" if canal == "so-you-built-it" else "1min30 a 2 min"
                erros.append(f"{n}: {pw} palavras faladas; o video tem que dar {alvo} ({pmin} a {pmax} palavras, ROTEIROS.md 'Duracao')")
        # REGRA do Pedro (12/11): Old Tales com suspense e acao, nada de abertura calma/infantil ("Imagine a stone...")
        if canal == "old-tales" and num >= TOM_CL_DESDE and lineas:
            l0 = lineas[0] if isinstance(lineas[0], str) else (lineas[0].get("texto") or "")
            if re.match(r"\s*(imagine|you wake up|once upon|today|long ago|in a land|there (was|once))\b", l0, re.I):
                erros.append(f"{n}: abertura calma proibida no Old Tales ('{l0[:40]}...'); comece com choque, pergunta ou curiosidade (ROTEIROS.md 'Tom do Old Tales')")
        if canal == "signal-lost" and h.get("visual") == "flat" and h.get("paleta") != "sv":
            erros.append(f"{n}: Signal Lost no estilo flat precisa de \"paleta\": \"sv\"")
        partes, parte = int(h.get("partes", 1) or 1), int(h.get("parte", 1) or 1)
        fala = json.dumps(h.get("lineas"), ensure_ascii=False)
        if parte < partes and not any(m in fala for m in ("{when_next}", "{dia_siguiente}", "{fecha_siguiente}", "{next_day}", "{next_date}")):
            avisos.append(f"{n}: parte {parte} de {partes} nao promete a seguinte com {{when_next}} na narracao")
    # series: partes 1..N sem buraco e "anterior" certo
    series = {}
    for h in hs:
        if h.get("serie"):
            series.setdefault(h["serie"], []).append(h)
    for s, lista in series.items():
        lista.sort(key=lambda h: int(h.get("parte", 1) or 1))
        for i, h in enumerate(lista):
            if int(h.get("parte", 1) or 1) != i + 1:
                erros.append(f"{h['_arq']}: serie '{s}' pulou uma parte (esperava parte {i + 1})")
            if i > 0 and h.get("anterior") and h["anterior"] != lista[i - 1].get("codigo"):
                erros.append(f"{h['_arq']}: 'anterior' deveria ser {lista[i - 1].get('codigo')}, nao {h['anterior']}")
    # anti-repeticao do 3D (REGRA do Pedro 10/11: variedade de criaturas, cenarios e rostos entre historias)
    if canal in TRES_D_DESDE:
        import subprocess
        r = subprocess.run([sys.executable, os.path.join(RAIZ, "motor-3d", "variedade.py"), "--canal", canal],
                           capture_output=True, text=True)
        avisos += [f"variedade: {l.strip()}" for l in r.stdout.splitlines() if l.strip().lower().startswith(("aviso", "-", "!"))]
    return len(hs), erros, avisos


def conferir_pecas_js():
    """Pecas extras do Kiro (hora-muerta/scripts/pecas/*.js): todas carregadas pelo engine.html e sem erro de sintaxe."""
    import shutil, subprocess
    erros = []
    eng = os.path.join(RAIZ, "hora-muerta", "scripts", "engine.html")
    if not os.path.exists(eng):
        return erros
    carregadas = set(re.findall(r'<script src="pecas/([^"]+)"', open(eng, encoding="utf-8").read()))
    node = shutil.which("node")
    for arq in sorted(glob.glob(os.path.join(RAIZ, "hora-muerta", "scripts", "pecas", "*.js"))):
        nome = os.path.basename(arq)
        if nome not in carregadas:
            erros.append(f"pecas/{nome}: falta a linha <script src=\"pecas/{nome}\"></script> no bloco PECAS EXTRAS do engine.html")
        if node:
            r = subprocess.run([node, "--check", arq], capture_output=True, text=True)
            if r.returncode:
                erros.append(f"pecas/{nome}: erro de JavaScript: {next((l for l in r.stderr.splitlines() if 'Error' in l), r.stderr.strip()[:200])}")
    for nome in carregadas - {os.path.basename(a) for a in glob.glob(os.path.join(RAIZ, "hora-muerta", "scripts", "pecas", "*.js"))}:
        erros.append(f"engine.html carrega pecas/{nome}, mas o arquivo nao existe")
    return erros


def main():
    total_erros = 0
    ej = conferir_pecas_js()
    print(f"pecas extras (js): {len(ej)} erro(s)")
    for e in ej:
        print("  ERRO  ", e)
    total_erros += len(ej)
    for canal, engine in CANAIS.items():
        if not os.path.isdir(os.path.join(RAIZ, canal, "stories")):
            continue
        n, erros, avisos = conferir(canal, engine)
        print(f"{canal}: {n} roteiros, {len(erros)} erro(s), {len(avisos)} aviso(s)")
        for e in erros:
            print("  ERRO  ", e)
        for a in avisos:
            print("  aviso ", a)
        total_erros += len(erros)
    if total_erros:
        sys.exit(f"ROTEIROS COM ERRO: {total_erros}. Conserte antes de enviar.")
    print("ROTEIROS OK")


if __name__ == "__main__":
    main()
