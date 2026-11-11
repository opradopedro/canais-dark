#!/usr/bin/env python3
"""Fiscal automatico dos quadros 3D: renderiza 1 quadro a cada 2,5 s de um roteiro e REPROVA se:
  (a) brilho medio do quadro < 45 (numa escala 0-255) -> cena escura demais;
  (b) o ator-alvo ocupa menos de 3% da tela nos planos close/medio/baixo (mede numa passada de silhueta magenta);
  (c) algum objeto bloqueia o raycast camera->cabeca do alvo;
  (d) dois quadros seguidos com diferenca media < 2% (camera parada entre cortes);
  (e) um objeto de cenario (tronco/casa) ocupando > 25% da tela;
  (f) em plano de criatura (baixo/aberto), a silhueta da criatura ocupa < 8% da tela;
  (g) quadro SEM ASSUNTO: ator + criatura + objetos principais (casa, torre, poste...) somados ocupam < 10% da tela;
  (h) AEREO SEGUIDO DE AEREO (dois cortes seguidos em plano aereo);
  (i) mais de 1 AEREO a cada 6 cortes (qualquer janela de 6 cortes seguidos).
  (h) e (i) olham a lista de cortes do video inteiro (window.__cortes) e tambem os quadros amostrados.
Escreve um relatorio (stdout + <base>_relatorio.txt) e uma folha de contato <base>_folha.jpg (6x3 quadros).

Uso: python conferir_quadros.py SV-3d-exemplo.json SV-3d-tempos.json [saida/SV-3d]
Sai com codigo 0 se passar, 1 se reprovar.
"""
import base64, functools, http.server, io, json, os, socket, sys, threading
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
MOTOR3D = os.path.dirname(AQUI)
sys.path.insert(0, os.path.join(os.path.dirname(MOTOR3D), "hora-muerta", "scripts"))
from comum import carregar, resolver

PASSO = 2.5          # 1 quadro a cada 2,5 s
BRILHO_MIN = 45      # media de brilho minima
AREA_MIN = 0.03      # 3% da tela nos planos close/medio/baixo
PLANOS_ATOR = {"close", "medio", "baixo"}
DIF_MIN = 0.02       # (a) 2 quadros seguidos com diferenca media < 2% reprovam (camera parada entre cortes)
OBST_MAX = 0.25      # (b) 1 objeto de cenario (tronco/casa) ocupando > 25% da tela reprova
CRIAT_MIN = 0.08     # (c) em plano de criatura, a silhueta da criatura tem que ocupar > 8%
PLANOS_CRIATURA = {"baixo", "aberto"}
ASSUNTO_MIN = 0.10   # (g) todo plano tem assunto: >= 10% da tela
JANELA_AEREO = 6     # (i) no maximo 1 aereo a cada 6 cortes


def conferir_aereos(cortes):
    """(h) aereo seguido de aereo e (i) mais de 1 aereo em 6 cortes. cortes = lista de planos, 1 por corte."""
    prob = []
    for j in range(1, len(cortes)):
        if cortes[j] == 'aereo' and cortes[j - 1] == 'aereo':
            prob.append(f"aereo seguido de aereo (cortes {j-1} e {j})")
    for j in range(max(1, len(cortes) - JANELA_AEREO + 1)):
        n = cortes[j:j + JANELA_AEREO].count('aereo')
        if n > 1:
            prob.append(f"{n} aereos nos cortes {j}-{j + JANELA_AEREO - 1} (max 1 a cada 6)")
    return prob


class _H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def guess_type(self, path):
        p = str(path).lower()
        if p.endswith(".js") or p.endswith(".mjs"):
            return "application/javascript"
        if p.endswith(".glb"):
            return "model/gltf-binary"
        if p.endswith(".ttf"):
            return "font/ttf"
        return super().guess_type(path)


def _porta():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


def conferir(historia, tempos, base_saida):
    estado = resolver(carregar(historia), json.load(open(tempos)))
    dur = estado["dur"]
    pontos = [round(k * PASSO, 2) for k in range(int(dur / PASSO) + 1)]
    porta = _porta()
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", porta), functools.partial(_H, directory=MOTOR3D))
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    GRAB = "t => { render(t); return document.getElementById('c').toDataURL('image/jpeg',0.9).split(',')[1]; }"
    quadros, linhas, falhas = [], [], []
    arr_ant = None
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1080, "height": 1920})
        pg.goto(f"http://127.0.0.1:{porta}/engine.html")
        pg.wait_for_function("() => typeof window.setup === 'function'", timeout=30000)
        pg.evaluate("h => setup(h)", estado)
        pg.wait_for_function("() => window.pronto === true", timeout=120000)
        cortes = pg.evaluate("() => window.__cortes || []")
        for f in conferir_aereos(cortes):
            falhas.append("cortes: " + f)
        corte_ant = None
        for t in pontos:
            pg.evaluate("t => window.prepararQuadro(t)", t)
            # 1) quadro normal (para a folha de contato e o brilho)
            img_b64 = pg.evaluate(GRAB, t)
            info = pg.evaluate("() => window.__ultimoQuadro")
            im = Image.open(io.BytesIO(base64.b64decode(img_b64))).convert("RGB")
            arr = np.asarray(im, dtype=np.float32)
            brilho = float(arr.mean())
            # 2) passada de silhueta: mede a area do alvo (magenta) na tela
            pg.evaluate("() => window.__silhueta(true)")
            sil_b64 = pg.evaluate("t => { render(t); return window.__cru(0.92); }", t)
            pg.evaluate("() => window.__silhueta(false)")
            sil = np.asarray(Image.open(io.BytesIO(base64.b64decode(sil_b64))).convert("RGB"), dtype=np.int16)
            magenta = (sil[:, :, 0] > 150) & (sil[:, :, 1] < 90) & (sil[:, :, 2] > 150)
            ciano = (sil[:, :, 1] > 150) & (sil[:, :, 2] > 150) & (sil[:, :, 0] < sil[:, :, 1] - 40)  # o tone mapping clareia o ciano (R ~160)
            area = float(magenta.mean())
            assunto = float((magenta | ciano).mean())
            # 3) passada de obstaculos: cada tronco/casa com cor unica; mede a maior fracao de uma so cor
            pg.evaluate("() => window.__obstaculoCobertura()")
            obs_b64 = pg.evaluate("() => window.__cru(0.92)")
            obs = np.asarray(Image.open(io.BytesIO(base64.b64decode(obs_b64))).convert("RGB"), dtype=np.uint8)
            nao_preto = obs.max(axis=2) > 40
            maior_obst = 0.0
            if nao_preto.any():
                # quantiza as cores e conta a mais frequente (= maior objeto na tela)
                q = (obs[nao_preto] // 32).astype(np.int32)
                chaves = q[:, 0] * 64 + q[:, 1] * 8 + q[:, 2]
                _, cont = np.unique(chaves, return_counts=True)
                maior_obst = float(cont.max()) / (obs.shape[0] * obs.shape[1])

            plano = (info or {}).get("plano", "?")
            ehator = (info or {}).get("alvoEhAtor", False)
            bloq = (info or {}).get("bloqueado", False)
            tem_criatura = (info or {}).get("temCriatura", False)
            prob = []
            if brilho < BRILHO_MIN:
                prob.append(f"escuro({brilho:.0f})")
            if ehator and plano in PLANOS_ATOR and area < AREA_MIN:
                prob.append(f"ator {area*100:.1f}%<3% [{plano}]")
            if bloq:
                prob.append("bloqueado")
            # (b) objeto de cenario grande demais
            if maior_obst > OBST_MAX:
                prob.append(f"obstaculo {maior_obst*100:.0f}%>25%")
            # (c) plano de criatura: a criatura (alvo, nao-ator) tem que ocupar > 8%
            if tem_criatura and not ehator and plano in PLANOS_CRIATURA and area < CRIAT_MIN:
                prob.append(f"criatura {area*100:.1f}%<8% [{plano}]")
            # (g) todo plano tem assunto
            if assunto < ASSUNTO_MIN:
                prob.append(f"sem assunto ({assunto*100:.0f}%<10%)")
            # (a) quadro quase igual ao anterior
            if arr_ant is not None:
                dif = float(np.abs(arr - arr_ant).mean()) / 255.0
                if dif < DIF_MIN:
                    prob.append(f"parado(dif {dif*100:.1f}%<2%)")
            arr_ant = arr
            # (h) nos quadros amostrados: corte novo em aereo logo depois de um corte aereo
            corte = (info or {}).get("corte")
            if corte_ant and corte is not None and corte != corte_ant[0] and plano == 'aereo' and corte_ant[1] == 'aereo' \
                    and corte == corte_ant[0] + 1:
                prob.append("aereo seguido de aereo")
            corte_ant = (corte, plano) if corte is not None else None
            if prob:
                falhas.append(f"t={t:5.1f}s {plano}: " + ", ".join(prob))
            linhas.append(f"t={t:5.1f}s plano={plano:7s} brilho={brilho:5.1f} alvo={area*100:4.1f}% "
                          f"obst={maior_obst*100:4.0f}% assunto={assunto*100:3.0f}% {'OK' if not prob else 'FALHA: ' + ', '.join(prob)}")
            quadros.append(im)
        b.close()
    srv.shutdown()

    _folha(quadros, base_saida + "_folha.jpg")
    ok = not falhas
    rel = ["FISCAL " + ("OK" if ok else "REPROVADO") + f"  ({os.path.basename(historia)})",
           f"quadros: {len(quadros)} | falhas: {len(falhas)}",
           "cortes: " + " ".join(c[:2] for c in cortes) + f"  (aereos: {cortes.count('aereo')})", ""] + linhas
    if falhas:
        rel += ["", "--- FALHAS ---"] + falhas
    txt = "\n".join(rel)
    open(base_saida + "_relatorio.txt", "w", encoding="utf-8").write(txt)
    print(txt)
    return ok


def _folha(quadros, caminho, cols=6, linhas=3, larg=300):
    """Folha de contato cols x linhas (quadros pequenos)."""
    alt = int(larg * 1920 / 1080)
    folha = Image.new("RGB", (cols * larg, linhas * alt), (20, 20, 24))
    n = min(len(quadros), cols * linhas)
    # escolhe n quadros espalhados
    idx = [round(i * (len(quadros) - 1) / max(1, n - 1)) for i in range(n)] if len(quadros) > n else list(range(len(quadros)))
    for k, i in enumerate(idx):
        mini = quadros[i].resize((larg, alt))
        folha.paste(mini, ((k % cols) * larg, (k // cols) * alt))
    folha.save(caminho, quality=88)


def main():
    if len(sys.argv) < 3:
        sys.exit("uso: conferir_quadros.py historia.json tempos.json [base_saida]")
    historia, tempos = sys.argv[1], sys.argv[2]
    base = sys.argv[3] if len(sys.argv) > 3 else os.path.join(AQUI, "saida", os.path.splitext(os.path.basename(historia))[0])
    os.makedirs(os.path.dirname(base), exist_ok=True)
    ok = conferir(historia, tempos, base)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
