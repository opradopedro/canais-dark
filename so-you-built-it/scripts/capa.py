#!/usr/bin/env python3
"""Thumbnail do So You Built It: um quadro limpo do mundo 3D (sem legenda) + o texto do campo "capa".

Uso:
  python3 capa.py historia.json capa.jpg [tempos.json]   # sem tempos: estima pelo numero de palavras
  python3 capa.py --antigas [--saida DIR]                # poe capa em TODOS os Shorts ja no canal (YT_TOKEN_VAR)
O canal foi verificado por telefone em 05/11/2026: agora o YouTube aceita thumbnail personalizada
(thumbnails.set, 50 unidades da cota cada). 1080x1920 JPG < 2 MB.
Quadro: Evolucao = penultima cena (a obra pronta, antes do "Congratulations"); Curiosidade = cena a 60% do video.
O roteiro pode mandar: "capa_cena": indice da cena, "capa_t": segundos a partir do inicio dessa cena (padrao 1.6).
"""
import base64, glob, json, os, sys
from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from comum import carregar, resolver
import render

PALAVRAS_POR_S = 3.1  # ritmo da voz do canal (Puck, 1.06x)

DESENHA = """([t, texto]) => {
  ST.semLegenda = true;
  render(t);
  const c = document.getElementById('c'), g = c.getContext('2d'), W = c.width, H = c.height;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const sombra = g.createLinearGradient(0, 0, 0, H * 0.48);
  sombra.addColorStop(0, 'rgba(0,0,0,0.78)'); sombra.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sombra; g.fillRect(0, 0, W, H * 0.48);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const fonte = '"DejaVu Sans", Impact, Arial, sans-serif';
  let tam = 150, linhas;
  do {
    g.font = `900 ${tam}px ${fonte}`;
    linhas = []; let atual = '';
    for (const p of texto.split(' ')) {
      const teste = atual ? atual + ' ' + p : p;
      if (g.measureText(teste).width > W * 0.88 && atual) { linhas.push(atual); atual = p; } else atual = teste;
    }
    linhas.push(atual); tam -= 8;
  } while ((linhas.length > 3 || linhas.some(l => g.measureText(l).width > W * 0.9)) && tam > 70);
  const alt = tam * 1.1, y0 = H * 0.17;
  linhas.forEach((l, i) => {
    const y = y0 + i * alt;
    g.lineJoin = 'round'; g.lineWidth = tam * 0.18; g.strokeStyle = '#000'; g.strokeText(l, W / 2, y);
    g.fillStyle = i === linhas.length - 1 ? '#ffd23f' : '#ffffff'; g.fillText(l, W / 2, y);
  });
  return c.toDataURL('image/jpeg', 0.9).split(',')[1];
}"""


def tempos_estimados(h):
    """Sem a narracao gravada: cada frase dura palavras / ritmo da voz + pausa (basta para escolher o quadro)."""
    t, segs = 0.2, []
    for l in h["lineas"]:
        d = max(1.0, len(l["texto"].split()) / PALAVRAS_POR_S)
        segs.append({"t0": round(t, 3), "t1": round(t + d, 3), "text": l["texto"]})
        t += d + float(l.get("pausa", 0.3))
    return {"segs": segs, "dur": round(t + 0.6, 3)}


def texto_capa(h):
    if h.get("capa"):
        return h["capa"].upper()
    return " ".join(h["titulo"].split("#")[0].upper().split()[:5])


def quadro(h, estado):
    cenas = estado["cenas"]
    if "capa_cena" in h:
        i = int(h["capa_cena"])
    elif h.get("formato") == "Evolucao":
        i = max(0, len(cenas) - 2)
    else:
        i = int(len(cenas) * 0.6)
    i = min(max(i, 0), len(cenas) - 1)
    fim = cenas[i + 1]["t0"] if i + 1 < len(cenas) else estado["dur"] - 0.6
    return round(min(cenas[i]["t0"] + float(h.get("capa_t", 1.6)), max(cenas[i]["t0"], fim - 0.2)), 2)


def gerar(trabalhos):
    """trabalhos: lista de (historia.json, saida.jpg, tempos.json ou None). Abre o Chromium uma vez so."""
    render.three()
    feitos = []
    args = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]
    with sync_playwright() as p:
        try:
            b = p.chromium.launch(args=args)
        except Exception:
            b = p.chromium.launch(executable_path=os.environ.get("HM_CHROMIUM", "/opt/pw-browsers/chromium"), args=args)
        for historia, saida, tempos in trabalhos:
            try:
                h = carregar(historia)
                tm = json.load(open(tempos)) if tempos and os.path.exists(tempos) else tempos_estimados(h)
                estado = resolver(h, tm)
                pg = b.new_page(viewport={"width": 1080, "height": 1920})
                pg.goto("file://" + render.ENGINE)
                pg.evaluate("h => setup(h)", estado)
                jpg = base64.b64decode(pg.evaluate(DESENHA, [quadro(h, estado), texto_capa(h)]))
                pg.close()
                open(saida, "wb").write(jpg)
                feitos.append(saida)
                print("capa ok", saida, flush=True)
            except Exception as e:
                print("capa falhou", historia, str(e)[:200], flush=True)
        b.close()
    return feitos


def antigas(saida):
    """Gera e aplica a capa em todos os Shorts do canal que tem roteiro em stories/ (pode rodar de novo: so troca)."""
    import yt_upload
    tk = yt_upload.access_token()
    no_canal = yt_upload.publicados(tk)
    roteiros = {carregar(f)["codigo"]: f for f in glob.glob(os.path.join(os.path.dirname(AQUI), "stories", "*.json"))}
    os.makedirs(saida, exist_ok=True)
    fila = [(roteiros[c], os.path.join(saida, c + "_capa.jpg"), None) for c in sorted(no_canal) if c in roteiros]
    print(f"{len(fila)} Shorts para receber capa", flush=True)
    ok = falhas = 0
    for historia, jpg, _ in fila:
        if not os.path.exists(jpg) and not gerar([(historia, jpg, None)]):
            falhas += 1; continue
        cod = os.path.basename(jpg).split("_")[0]
        try:
            yt_upload.miniatura(tk, no_canal[cod]["id"], jpg)
            ok += 1
            print(f"CAPA APLICADA {cod} https://youtu.be/{no_canal[cod]['id']}", flush=True)
        except Exception as e:
            falhas += 1
            corpo = e.read().decode()[:300] if hasattr(e, "read") else str(e)[:300]
            print(f"CAPA FALHOU {cod}: {corpo}", flush=True)
            if "forbidden" in corpo.lower() or "quota" in corpo.lower():
                break  # canal sem permissao ou cota do dia acabou: nao adianta insistir
    print(f"CAPAS: {ok} aplicadas, {falhas} falharam", flush=True)
    return ok, falhas


if __name__ == "__main__":
    if sys.argv[1:2] == ["--antigas"]:
        saida = sys.argv[sys.argv.index("--saida") + 1] if "--saida" in sys.argv else "/tmp/yb-capas"
        ok, falhas = antigas(saida)
        sys.exit(1 if falhas and not ok else 0)
    elif len(sys.argv) >= 3:
        if not gerar([(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)]):
            sys.exit(1)
    else:
        sys.exit(__doc__)
