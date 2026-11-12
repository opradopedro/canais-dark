#!/usr/bin/env python3
"""Vocabulario do motor 3D lido direto do codigo (kit/*.js e assets/catalogo.json), para o validar_roteiros.py
nunca ficar desatualizado: cenarios acabados e suas marcas, luzes, planos, criaturas, expressoes, animacoes.
Uso: python3 motor-3d/vocabulario.py  (imprime o vocabulario)."""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))


def _ler(rel):
    return open(os.path.join(D, rel), encoding="utf-8").read()


def _lista(src, nome):
    m = re.search(rf"export const {nome}\s*=\s*\[(.*?)\]", src, re.S)
    return re.findall(r"'([^']*)'", m.group(1)) if m else []


def vocab():
    ac = _ler("kit/cenarios/acabados.js")
    nomes = re.findall(r"\w+", re.search(r"export const ACABADOS\s*=\s*\{([^}]*)\}", ac).group(1))
    cenarios = {}
    for i, n in enumerate(nomes):
        ini = ac.index(f"export async function {n}(")
        fim = ac.find("export async function", ini + 10)
        corpo = ac[ini: fim if fim > 0 else len(ac)]
        m = re.search(r"(?:const marcas = |C\.fim\()\{(.*?)\}\s*(?:;|,)\s*(?:\n|\{)", corpo, re.S)
        cenarios[n] = re.findall(r"(\w+):\s*\{\s*x:", m.group(1) + "}") if m else []
    cenarios.update({
        "montanha_nuvens": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "topo", "ovo", "beira", "salto"],
        "cachoeira": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco"],
        "caverna_reino": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "trono", "festa", "entrada"],
        "palacio_ceu": ["templo", "torii", "ponte", "escada", "jardim", "lanterna", "salao", "colunas", "nuvens"],
        "aldeia_china": ["praca", "poco", "moinho", "taverna", "mercado", "casa", "alto", "templo", "jardim"],
        "esparta_cidade": ["praca", "poco", "moinho", "taverna", "mercado", "casa", "alto", "templo", "escada"],
        "campo_batalha": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "meio", "vindo", "indo", "acostamento", "ponto", "curva", "beira_mato"],
        "mosteiro": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "praca", "poco", "casa", "entrada"],
        "mar_jangada": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "jangada", "proa", "popa", "mar", "horizonte"],
        "palacio_dragao": ["pilar", "trono", "entrada", "escada", "armas", "templo", "ponte", "torii", "lanterna"],
        "submundo": ["mesa", "livro", "juiz", "entrada", "corredor", "pilares", "fundo", "mausoleu", "cruz_grande", "entre_cruzes"],
        "jardim_pessegos": ["jardim", "arvore", "banquete", "mesa", "entrada", "templo"],
        "fornalha_ceu": ["fornalha", "topo_fornalha", "degraus", "patio", "entrada", "templo", "escada"],
        "mao_buda": ["palma", "pilar_central", "pilares", "beira", "templo", "pe_torre"],
        "montanha_cinco_dedos": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "base", "pedra", "selo"],
        "grecia_templo": ["praca", "poco", "moinho", "taverna", "mercado", "casa", "alto", "templo", "escada"],
        "ilha_mar": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "praia", "rochas", "ruinas", "topo"],
        "caverna_gorgonas": ["clareira", "trilha", "entre_arvores", "pe_torre", "fundo", "toco", "centro", "estatuas", "pilares", "entrada", "altar"],
    })
    luz = _ler("kit/luz.js")
    cor = re.search(r"const COR = \{(.*?)\n\};", luz, re.S)
    luzes = re.findall(r"^\s{2}(\w+):", cor.group(1), re.M) if cor else []
    pers = _ler("kit/personagem.js")
    expr = re.findall(r"'(\w+)'", re.search(r"const EXPRESSOES = \[(.*?)\]", pers, re.S).group(1))
    cat = json.load(open(os.path.join(D, "assets", "catalogo.json"), encoding="utf-8"))
    anims = sorted({a for k, v in cat.items() if k.startswith("animacoes/") for a in v["anim"]})
    return {
        "cenarios": cenarios, "luzes": luzes, "efeitos": ["chuva", "neve"],
        "planos": _lista(_ler("kit/camera.js"), "PLANOS") + ["auto"],
        "criaturas": _lista(_ler("kit/criatura.js"), "TIPOS_CRIATURA") + ["animal"],
        "expressoes": expr, "rosto_estilos": _lista(pers, "ROSTO_ESTILOS"),
        "objetos_mao": ["lanterna", "tocha", "radio", "celular", "cajado", "espada", "lanca", "escudo"], "acoes": anims,
    }


if __name__ == "__main__":
    print(json.dumps(vocab(), indent=1, ensure_ascii=False))
