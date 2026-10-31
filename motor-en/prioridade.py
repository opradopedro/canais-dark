"""Ordem da fila de TODOS os canais (REGRA do Pedro, 31/10):
"quando eu mandar uma ideia, esse video e o proximo a sair; se o canal esta no meio de uma serie,
termina a serie e logo depois entra a ideia".

Roteiro escrito a partir de uma ideia do Pedro leva no JSON:  "prioridade": "pedro"
(e, se veio de issue do painel, "ideia": "#8"). Ver ROTEIROS.md.

Ordem: 1) serie ja comecada no YouTube (alguma parte subiu e falta outra);
       2) ideias do Pedro (a mais antiga primeiro, pela ordem dos arquivos);
       3) o resto, na ordem dos arquivos de stories/.
Videos que ja estao AGENDADOS no YouTube nao mudam de data: a ideia entra no primeiro horario livre depois deles.
"""


def e_ideia(h):
    return str(h.get("prioridade", "")).strip().lower() == "pedro"


def ordenar_series(series, ja, carregar):
    """series: lista de listas de arquivos (uma lista por serie). Devolve na ordem da fila (ordenacao estavel)."""
    def chave(fs):
        hs = [carregar(f) for f in fs]
        if any(h["codigo"] in ja for h in hs):
            return 0  # serie pela metade termina primeiro
        if any(e_ideia(h) for h in hs):
            return 1
        return 2
    return sorted(series, key=chave)


def ordenar_roteiros(arqs, carregar):
    """Lista simples de roteiros (canal sem series): ideias do Pedro primeiro, resto na ordem dos arquivos."""
    return sorted(arqs, key=lambda f: 0 if e_ideia(carregar(f)) else 1)
