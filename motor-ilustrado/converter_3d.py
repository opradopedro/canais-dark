#!/usr/bin/env python3
"""Converte roteiros do motor 3D/cartoon (HM, SV) para o motor ILUSTRADO (Pedro, 15/11: termina a serie atual no
cartoon e a proxima ja sai no ilustrado).

O roteiro 3D tem "cenas" (cenario + marca + plano + luz + atores com animacao + criatura). Aqui vira:
  - "visual": "ilustrado", "mundo": "<hm|sv>-<serie>", "elenco" do boneco 2D (o antigo fica em "elenco_3d")
  - cada fala ganha "cena" (fundo, camera, fx, atores) e o "cenas" antigo fica em "cenas_3d"
  - motor-ilustrado/cenarios/<mundo>.json com um fundo por LUGAR (+ variante de dia e com o onibus), REGRA 13/11.

Uso: python motor-ilustrado/converter_3d.py hora-muerta/stories/045-ojos-negros-1.json [...]
"""
import hashlib
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))

ESTILO_TERROR = ("eerie horror story illustration, dark moody atmosphere, muted desaturated colors with cold blue shadows, "
                 "realistic proportions, unsettling and lonely, mature adult tone, not childish")

LUGARES = {
    ("casa_interior", "porta"): "the inside of a modest house's front door, a small entry hall with a coat hook and a little table",
    ("casa_interior", "sala"): "a modest living room with an old sofa, a small TV, a rug and framed family photos",
    ("casa_interior", "sofa"): "a modest living room with an old sofa, a small TV, a rug and framed family photos",
    ("casa_interior", "cozinha"): "a small home kitchen with a table, two chairs, a fridge and a window over the sink",
    ("casa_interior", "quarto"): "a simple bedroom with a bed, a nightstand lamp and a closed closet",
    ("casa_interior", "janela"): "a living room window with thin curtains, the dark street visible outside",
    ("bairro", "poste"): "a street corner under a single old street lamp",
    ("bairro", "calcada"): "a cracked sidewalk in front of a row of small houses",
    ("bairro", "rua"): "the middle of a quiet residential street with a few parked cars",
    ("bairro", "faixa"): "the middle of a quiet residential street with a few parked cars",
    ("bairro", "frente_casa"): "the front yard and porch of a small one-story house with a lit porch light",
    ("bairro", "arvores"): "a row of tall dark trees at the edge of the street",
    ("bairro", "fim_rua"): "the dead end of a street with a chain-link fence and an empty lot",
    ("vila", "alto"): "a low hill above a wide cornfield, seven scarecrows on wooden poles standing in a row",
    ("vila", "moinho"): "an old metal windmill at the edge of a cornfield",
    ("vila", "praca"): "a small town square with a kiosk, benches and an old church",
    ("vila", "casa"): "the porch of a humble farmhouse with adobe walls",
    ("vila", "taverna"): "a small rural cantina with wooden tables",
    ("vila", "mercado"): "a narrow village market street with closed stalls",
    ("vila", "poco"): "an old stone well in a dirt farmyard facing the cornfield",
    ("floresta", "fundo"): "deep inside a dense pine forest",
    ("floresta", "clareira"): "a small clearing in a pine forest",
    ("floresta", "trilha"): "a narrow dirt trail between tall pine trees",
    ("floresta", "entre_arvores"): "dense tall tree trunks close together, dark gaps between them",
    ("floresta", "pe_torre"): "the base of a tall wooden fire lookout tower in a pine forest, a ladder going up",
    ("floresta", "toco"): "a large tree stump with an axe and stacked firewood beside a small cabin",
    ("cemiterio", "entrada"): "the rusty iron gate at the entrance of an old cemetery",
    ("cemiterio", "entre_cruzes"): "a narrow path between rows of old graves and crosses",
    ("cemiterio", "cruz_grande"): "a large stone cross over an old grave",
    ("cemiterio", "mausoleu"): "an old stone mausoleum chapel with a heavy wooden door",
    ("cemiterio", "fundo"): "the far back corner of a cemetery with crooked forgotten headstones",
    ("cemiterio", "arvore_morta"): "a dead twisted tree among old graves",
    ("estrada", "ponto"): "a lonely roadside bus stop with a small concrete shelter and one lamp",
    ("estrada", "meio"): "the middle of an empty two-lane highway",
    ("estrada", "acostamento"): "the gravel shoulder of a highway with a metal guardrail",
    ("estrada", "vindo"): "an empty highway stretching toward the viewer",
    ("estrada", "indo"): "an empty highway stretching away into the distance",
    ("estrada", "curva"): "a sharp mountain highway curve with a bent guardrail over a drop",
}

# OLD TALES (Pedro 16/11: formato do Wukong ilustrado em todos os canais de historia). Acao/aventura, adulto, sem fogueira.
ESTILO_CL = {
    "china": "dark epic ancient Chinese fantasy illustration, misty mountains, jade green, lacquer red and gold accents, "
             "dramatic moody light, realistic proportions, mature adult tone, not childish",
    "grecia": "dark epic ancient Greek illustration, marble, bronze and deep red accents, dramatic moody light, "
              "realistic proportions, mature adult tone, not childish",
}
LUGARES_CL = {
    ("aldeia_china", "praca"): "the main square of an ancient Chinese village with tiled roofs and red lanterns",
    ("aldeia_china", "casa"): "inside a humble ancient Chinese family house with a wooden table, chairs and paper windows",
    ("aldeia_china", "templo"): "the steps of a small ancient Chinese village temple with red pillars",
    ("aldeia_china", "jardim"): "a walled courtyard garden of an ancient Chinese house with a plum tree",
    ("aldeia_china", "mercado"): "a narrow ancient Chinese market street with wooden stalls and hanging cloth",
    ("aldeia_china", "poco"): "an old stone well in an ancient Chinese village courtyard",
    ("palacio_ceu", "escada"): "a huge stone staircase leading up to an imperial palace gate",
    ("palacio_ceu", "nuvens"): "an imperial palace with golden roofs seen from above, floating over a sea of clouds",
    ("palacio_ceu", "colunas"): "a long hall of tall red lacquered columns in an imperial palace",
    ("palacio_ceu", "salao"): "an imperial throne hall with a golden dragon throne on a raised platform",
    ("submundo", "entrada"): "the gate of the underworld, a black stone arch between jagged rocks lit by blue spirit flames",
    ("submundo", "livro"): "a dark underworld archive with an enormous open book on a stone lectern",
    ("submundo", "juiz"): "the hall of the underworld judge, a high black desk under hanging chains",
    ("submundo", "mesa"): "a long stone table with scrolls and an ink brush in a dim underworld office",
    ("submundo", "pilares"): "huge black stone pillars in a misty underworld cavern",
    ("submundo", "corredor"): "a long narrow underworld corridor with ghostly blue lanterns",
    ("submundo", "fundo"): "the deepest pit of the underworld, a dark misty abyss",
    ("esparta_cidade", "praca"): "the dusty training square of ancient Sparta with simple stone buildings",
    ("esparta_cidade", "templo"): "the columns at the front of an ancient Greek temple",
    ("esparta_cidade", "escada"): "wide stone steps of an ancient Greek temple",
    ("esparta_cidade", "casa"): "inside a simple ancient Spartan house with a stone floor, a bench and a hearth",
    ("esparta_cidade", "mercado"): "a small ancient Greek market street with clay jars and stalls",
    ("mar_jangada", "mar"): "a dark rough sea with ancient warships",
}
LUGARES_CL_SERIE = {  # campo_batalha muda de cara em cada historia
    "mulan": {"beira_mato": "the edge of a pine forest beside a military camp of tents with banners",
              "acostamento": "a rocky mountain road where an ancient Chinese army column marches",
              "curva": "a narrow mountain pass covered in snow",
              "pe_torre": "the foot of a wooden watchtower in an ancient Chinese army camp",
              "vindo": "a wide battlefield on the northern steppe, an enemy army approaching on the horizon",
              "meio": "the middle of a wide battlefield on the northern steppe",
              "indo": "a long road across the steppe toward distant mountains"},
    "thermopylae": {"beira_mato": "the rocky slope above the narrow coastal pass of Thermopylae",
                    "acostamento": "the old Phocian stone wall across the narrow pass of Thermopylae",
                    "curva": "a narrow goat path winding over the mountain above Thermopylae",
                    "pe_torre": "a Spartan camp behind a stone wall in a narrow pass",
                    "vindo": "the narrow pass of Thermopylae between cliffs and the sea, a huge Persian army on the plain beyond",
                    "meio": "the middle of the narrow pass of Thermopylae between steep cliffs and the sea",
                    "indo": "the narrow pass of Thermopylae seen toward the sea at the far end"},
}
LUZ_CL = {"dia": ("dia", "in daylight"), "nublado": ("dia", "in daylight"),
          "tempestade": ("tempestade", "under a dark stormy sky"), "chuva": ("tempestade", "under a dark stormy sky"),
          "por_sol": ("dourado", "at sunset, golden orange light"), "entardecer": ("dourado", "at sunset, golden orange light"),
          "nascer_sol": ("dourado", "at sunset, golden orange light"),
          "noite": ("noite", "at night, blue moonlight and torches"), "madrugada": ("noite", "at night, blue moonlight and torches"),
          "interior_noite": ("noite", "at night, blue moonlight and torches"), "fogueira": ("noite", "at night, blue moonlight and torches"),
          "neve": ("neve", "in falling snow")}
ROUPA_CL = {
    "soldado_china": dict(armadura="#7a1c24", faixa="#1a1a1a", elmo="#3a3a40"),
    "soldado_esparta": dict(armadura="#b8862a", manto="#8a1a14", elmo="#b8862a"),
    "rei": dict(roupa="tunica", tiara=True),
    "chines": dict(roupa="tunica"),
    "casual": dict(roupa="tunica"),
}

SERIES = {
    "ojos-negros": "in a working-class neighborhood of a northern Latin American city",
    "siete-espantapajaros": "on a dry farm in the Latin American countryside",
    "voz-del-monte": "in a mountain pine forest of the sierra",
    "nahual-panteon": "in the municipal cemetery of a small Latin American town, tombs painted in faded colors",
    "autobus-tres": "on a rural Latin American mountain highway",
    "night-groundskeeper": "in an old small-town American cemetery",
    "footprints-snow": "at an isolated farmhouse in snowy woods during a blizzard, deep snow everywhere",
    "black-dog": "on Alder Street, a quiet American suburban street",
}
DIA = {"dia", "nascer_sol", "entardecer", "nublado"}
PERIODO = {False: "at night, dark blue moonlight, deep shadows", True: "in pale overcast daylight"}

POSE = [("Idle", "parado"), ("Walking_Backwards", "andar"), ("Walking", "andar"), ("Running", "correr"), ("Sit", "parado"),  # sentado sem cadeira desenhada flutua (Pedro 15/11): fica em pe
       
        ("Lie", "deitado"), ("Crouch", "agachar"), ("Sneak", "agachar"), ("PickUp", "agachar"), ("Interact", "apontar"),
        ("Holding", "apontar"), ("Work", "apontar"), ("Waving", "apontar"), ("Melee", "lutar"), ("Hit", "susto"),
        ("Death", "cair"), ("Jump", "pular")]
ROSTO = {"neutro": "calmo", "desconfiado": "determinado", "susto": "choque", "bravo": "raiva", "olhos_fechados": "triste",
         "medo": "medo", "triste": "triste", "sorriso": "sorriso"}
PLANO = {"close": ([1.45, 1.6], 0.58), "ombro": ([1.3, 1.45], 0.58), "nuca": ([1.3, 1.42], 0.58),
         "medio": ([1.15, 1.3], 0.6), "auto": ([1.12, 1.26], 0.6), "baixo": ([1.2, 1.32], 0.66),
         "aereo": ([1.0, 1.08], 0.45), "aberto": ([1.0, 1.12], 0.55)}
def pose_de(acao):
    a = acao or ""
    if a.startswith("Melee") and ("Attack" in a):
        return "golpe"
    if a.startswith("Melee") or a.startswith("Dodge"):
        return "lutar"
    for k, p in (("Cheering", "triunfo"), ("Death", "cair"), ("Lie_StandUp", "agachar"), ("Push_Ups", "agachar"),
                 ("Sit_Floor", "agachar"), ("Crouching", "agachar"), ("Sneaking", "agachar"), ("Ranged", "apontar")):
        if a.startswith(k):
            return p
    return next((p for k, p in POSE if a.startswith(k)), "parado")


PELE = ["#f2d6b2", "#e8c49a", "#d4a679", "#b8865a", "#9a6a44"]
ROUPA = ["#3a4a5a", "#5a3a3a", "#3a5a4a", "#5a5040", "#40405a", "#6a5a3a"]

CRIATURAS = {
    "olhos_no_escuro": {"nino1": dict(tipo="humano", rosto_cor="#e6e2da", cabelo="curtinho", cabelo_cor="#1a1a1a",
                                      roupa="jaqueta", roupa_cor="#2a2a2e", olhos="pretos"),
                        "nino2": dict(tipo="humano", rosto_cor="#e6e2da", cabelo="normal", cabelo_cor="#2a1a10",
                                      roupa="jaqueta", roupa_cor="#4a4a50", olhos="pretos")},
    "espantalho": {"espantalho": dict(tipo="humano", rosto_cor="#cdb48a", membro="#c8a050", roupa="trapos",
                                      roupa_cor="#6a4a2a", chapeu="palha", olhos="pretos")},
    "alta": {"alta": dict(tipo="humano", rosto_cor="#2a2a2a", membro="#1c1c1c", roupa="trapos", roupa_cor="#111",
                          sem_rosto=True, cabelo="careca")},
    "vulto": {"alta": dict(tipo="humano", rosto_cor="#2a2a2a", membro="#1c1c1c", roupa="trapos", roupa_cor="#111",
                           sem_rosto=True, cabelo="careca")},
    "lobisomem": {"nahual": dict(tipo="macaco", pelo="#1c1a1a", rosto_cor="#3a3030", olhos="vermelhos")},
    "cao_negro": {"cao": dict(tipo="cao", pelo="#141414", olhos_cor="#ffd23a")},
    "sem_rosto": {"sem_rosto": dict(tipo="humano", rosto_cor="#e8e0d0", sem_rosto=True, cabelo="careca",
                                    roupa="jaqueta", roupa_cor="#2a3a2a")},
    "coisa_com_chifres": {"demonio": dict(tipo="humano", rosto_cor="#6a1414", membro="#4a0e0e", roupa="trapos",
                                          roupa_cor="#1a0a0a", olhos="vermelhos", cabelo="careca")},
    "rastejante": {"rastejante": dict(tipo="humano", rosto_cor="#4a3a2a", membro="#4a3a2a", roupa="trapos",
                                      roupa_cor="#2e2216", sem_rosto=True, cabelo="careca", desgaste=0.8)},
}
ESC_CRIATURA = {"olhos_no_escuro": 0.78, "alta": 1.5, "vulto": 1.25, "lobisomem": 1.3, "cao_negro": 1.2,
                "sem_rosto": 1.0, "rastejante": 1.0, "espantalho": 1.1, "coisa_com_chifres": 1.35}


def _h(s, n):
    return int(hashlib.md5(str(s).encode()).hexdigest(), 16) % n


def elenco_2d(el3d, regiao=None):
    out = {}
    for k, e in el3d.items():
        s = e.get("semente", _h(k, 9999))
        cab = e.get("cabelo", "curto")
        d = dict(tipo="humano", rosto_cor=PELE[_h(s, len(PELE))],
                 cabelo={"curto": "curtinho", "rabo": "longo", "longo": "longo", "grisalho": "normal", "careca": "careca"}.get(cab, "normal"),
                 cabelo_cor="#8a8a8a" if cab == "grisalho" or e.get("corpo") == "idoso" else ["#1a1a1a", "#2a1a10", "#4a2a14"][_h(s + 1, 3)])
        roupa = e.get("roupa", "casual")
        if roupa == "vestido":
            d.update(roupa="tunica", roupa_cor=["#7a3a4a", "#3a5a6a", "#6a5a2a"][_h(s, 3)])
        elif roupa == "guarda":
            d.update(roupa="jaqueta", roupa_cor="#1f2a44")
        else:
            d.update(roupa="jaqueta", roupa_cor=ROUPA[_h(s + 2, len(ROUPA))])
        if regiao:  # Old Tales: roupa de epoca
            r = ROUPA_CL.get(roupa, {})
            d.pop("roupa", None); d.pop("roupa_cor", None)
            d.update(r)
            if r.get("roupa") == "tunica":
                d["roupa_cor"] = e.get("camisa") or ({"rei": "#d8a431" if regiao == "china" else "#5a2a6a"}.get(roupa)
                                                    or ["#6a4a2a", "#3a4a5a", "#5a3a3a"][_h(s, 3)])
            if e.get("pele"):
                d["rosto_cor"] = e["pele"]
            if e.get("cabelo_cor"):
                d["cabelo_cor"] = e["cabelo_cor"]
            if e.get("cabelo") == "longo" and regiao == "china":
                d["cabelo"] = "coque"
        ac = e.get("acessorio")
        if ac == "barba":
            d.update(barba_estilo="chinesa" if regiao == "china" else ("cheia" if regiao else "curta"), barba=d["cabelo_cor"])
        if ac == "bone":
            d.update(chapeu="bone", chapeu_cor=ROUPA[_h(s + 3, len(ROUPA))])
        out[k] = d
    return out


def gancho_visual(d):
    """REGRA do Pedro (14-15/11: "ganhar o publico nos primeiros 5 segundos"). A 1a cena e a CRIATURA de perto, no lugar
    dela, se ela aparece nas 7 primeiras falas; senao, o heroi em close. Sem plano aberto vazio no 1o quadro."""
    ls = d.get("lineas") or []
    if not ls or not isinstance(ls[0], dict) or not ls[0].get("cena"):
        return
    gente = set(d.get("elenco_3d") or {})
    cri = None
    for j in range(min(7, len(ls))):
        c = ls[j].get("cena") or {}
        ats = [a for a in c.get("atores") or [] if a["id"] not in gente]
        if ats:
            cri = (c, ats)
            break
    c0 = ls[0]["cena"]
    if cri:
        c, ats = cri
        novos = []
        for k, a in enumerate(ats[:2]):
            n = dict(a, u=0.5 if len(ats) == 1 else round(0.44 + 0.12 * k, 2), v=0.93, esc=round(min(a.get("esc", 1.0) / 0.8 if a.get("v", 0.93) < 0.9 else a.get("esc", 1.0), 1.6) * 1.15, 2))
            n.pop("vira", None)
            novos.append(n)
        ls[0]["cena"] = {"fundo": c["fundo"], "cam": {"z": [1.75, 1.6], "x": 0.5, "y": 0.6},
                         "fx": [f for f in c.get("fx", []) if not f.startswith(("tremor", "flash"))], "atores": novos}
    else:
        c0["cam"] = {"z": [1.75, 1.6], "x": c0.get("cam", {}).get("x", 0.5), "y": 0.58}
        for a in c0.get("atores") or []:
            a["esc"] = max(a.get("esc", 1.0), 1.15)
            if a.get("pose") == "deitado":
                a["pose"] = "parado"
    d["gancho_visual"] = True


def converter(path):
    d = json.load(open(path, encoding="utf-8"))
    if d.get("visual") == "ilustrado":
        print("ja e ilustrado:", path)
        return None
    pref = d["codigo"][:2].lower()
    serie = d["serie"]
    mundo = f"{pref}-{serie}"
    el3d = d.get("elenco", {})
    cl = pref == "cl"
    regiao = (d.get("paleta") if d.get("paleta") in ESTILO_CL else "china") if cl else None
    elenco = elenco_2d(el3d, regiao)
    cenas = {c["linea"]: c.get("cena", c) for c in d.get("cenas", [])}
    eventos = {}
    for ev in d.get("eventos", []):
        eventos.setdefault(ev["linea"], []).append(ev)
    lugares = {}
    ult = None
    heroi = next(iter(el3d), None)
    for i, l in enumerate(d["lineas"]):
        c = cenas.get(i, ult)
        ult = c
        if not c:
            continue
        dia = c.get("luz") in DIA
        objs = c.get("objetos") or []
        cen, marca = c.get("cenario"), c.get("marca")
        if cl:
            grupo, frase = LUZ_CL.get(c.get("luz"), ("dia", "in daylight"))
            dia = grupo != "noite"
            fid = f"{cen}-{marca}" + ("" if grupo == "dia" else f"-{grupo}")
            if fid not in lugares:
                base = (LUGARES_CL_SERIE.get(serie, {}).get(marca) if cen == "campo_batalha" else None) \
                    or LUGARES_CL.get((cen, marca), f"{cen} {marca}".replace("_", " "))
                lugares[fid] = {"lugar": f"{cen}/{marca} ({grupo})", "prompt": f"{base}, {frase}",
                                "seed": 100 + len(lugares) * 7 + _h(mundo, 50)}
        fid = fid if cl else f"{cen}-{marca}" + ("-onibus" if "onibus" in objs else "") + ("-dia" if dia else "")
        if fid not in lugares:
            base = LUGARES.get((cen, marca), f"{cen} {marca}".replace("_", " "))
            if "onibus" in objs:
                base += ", an old empty bus with dim green interior lights stopped there with its door open"
            lugares[fid] = {"lugar": f"{cen}/{marca}" + (" com onibus" if "onibus" in objs else "") + (" (dia)" if dia else " (noite)"),
                            "prompt": f"{base}, {SERIES.get(serie, '')}, {PERIODO[dia]}",
                            "seed": 100 + len(lugares) * 7 + _h(mundo, 50)}
        z, y = PLANO.get(c.get("plano"), PLANO["auto"])
        if i % 2:
            z = [z[1], z[0]]
        atores = []
        for a in c.get("atores", []):
            acao = a.get("acao", "Idle_A")
            pose = pose_de(acao)
            at = dict(id=a["id"], pose=pose, rosto=ROSTO.get(a.get("rosto"), "calmo"), v=0.8 if pose == "deitado" else 0.93, esc=1.0)
            if cl:
                at["arma"] = a.get("segura") or False
            if a.get("de") and a.get("para") and pose in ("andar", "correr"):
                at["u"] = [0.3, 0.5]
            atores.append(at)
        n = len(atores)
        for j, at in enumerate(atores):
            if "u" not in at:
                at["u"] = 0.5 if n == 1 else round(0.32 + j * (0.36 / max(1, n - 1)), 2)
        cri = c.get("criatura")
        if cri:
            tipo = cri.get("tipo")
            ids = CRIATURAS.get(tipo, CRIATURAS["alta"])
            for cid, cel in ids.items():
                elenco.setdefault(cid, cel)
            longe = cri.get("marca") not in (None, marca)
            esc = ESC_CRIATURA.get(tipo, 1.0) * (0.8 if longe else 1.0)
            base_u = 0.7 if atores else 0.5
            for at in atores:  # heroi para a esquerda, criatura na direita
                if not isinstance(at["u"], list):
                    at["u"] = min(at["u"], 0.36)
            pose_c = "agachar" if tipo == "rastejante" else ("agachar" if tipo == "cao_negro" and i % 3 == 0 else "parado")
            for k, cid in enumerate(ids):
                atores.append(dict(id=cid, pose=pose_c, rosto="calmo", u=round(base_u + k * 0.12 - (0.06 if len(ids) > 1 else 0), 2),
                                   v=0.86 if longe else 0.93, esc=round(esc, 2), vira=-1 if atores and k == 0 else 1))
        fx = []
        luz = c.get("luz", "")
        if not dia:
            fx.append("escuro")
        if cl and c.get("luz") in ("tempestade", "chuva"):
            fx.append("chuva")
        if "neblina" in luz or luz == "neve":
            fx.append("neblina")
        if luz in ("nascer_sol", "entardecer"):
            fx.append("dourado")
        for ev in eventos.get(i, []):
            if ev.get("tipo") == "golpe":
                fx += ["tremor@0.5", "flash@0.5"]
            elif ev.get("tipo") == "susto":
                fx += ["tremor@0.3", "flash@0.3", "vermelho"]
        us = [a["u"][0] if isinstance(a["u"], list) else a["u"] for a in atores] or [0.5]
        x = round(min(0.62, max(0.38, sum(us) / len(us))), 2)
        cena = {"fundo": fid, "cam": {"z": z, "x": x, "y": y}, "fx": list(dict.fromkeys(fx))}
        if atores:
            cena["atores"] = atores
        l["cena"] = cena
    d["visual"] = "ilustrado"
    d["mundo"] = mundo
    d["elenco_3d"] = el3d
    d["elenco"] = elenco
    if "cenas" in d:
        d["cenas_3d"] = d.pop("cenas")
    gancho_visual(d)
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # cenarios do mundo (junta com o que ja existe)
    cp = os.path.join(AQUI, "cenarios", f"{mundo}.json")
    m = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {
        "mundo": mundo, "_regra": "um fundo por lugar (Pedro 13/11); gerado por converter_3d.py",
        "estilo": ESTILO_CL[regiao] if cl else ESTILO_TERROR, "ordem": 20 + int(d["codigo"][2:]) // 2, "cenarios": {}}
    for k, v in lugares.items():
        m["cenarios"].setdefault(k, v)
    json.dump(m, open(cp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return mundo, len(lugares)


if __name__ == "__main__":
    if sys.argv[1] == "--gancho":  # aplica o gancho visual em roteiros ja convertidos
        for p in sys.argv[2:]:
            h = json.load(open(p, encoding="utf-8"))
            if h.get("visual") == "ilustrado" and h.get("elenco_3d") is not None and not h.get("gancho_visual"):
                gancho_visual(h)
                json.dump(h, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
                print("gancho visual:", p)
    else:
        for p in sys.argv[1:]:
            print(p, converter(p))
