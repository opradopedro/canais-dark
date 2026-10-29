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
  - Old Tales sem "tema": "calmo"
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


def pecas(engine):
    txt = open(os.path.join(RAIZ, engine), encoding="utf-8").read()
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
        if canal == "old-tales" and h.get("tema") != "calmo":
            erros.append(f"{n}: Old Tales precisa de \"tema\": \"calmo\" (sem flash vermelho, legenda dourada)")
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
    return len(hs), erros, avisos


def main():
    total_erros = 0
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
