#!/usr/bin/env python3
"""Receita que o Kiro Crew executa nos horarios marcados. NAO GASTA CREDITO.

Isto e uma tarefa do tipo "script": o Crew so executa o passo a passo escrito aqui, sem
pensar e sem chamar modelo de linguagem nenhum. O custo e zero.

Como registrar no Crew (uma vez cada):

  kirocrew cron add "survival" "" --cron "0 2 * * *" --timezone "America/New_York" ^
    --script %USERPROFILE%\\.kiro\\crew\\crons\\rodar_canal.py:run_survival ^
    --no-persistent-session --minimal-context --timeout-secs 3600

  kirocrew cron add "classics" "" --cron "0 4 * * *" --timezone "America/New_York" ^
    --script %USERPROFILE%\\.kiro\\crew\\crons\\rodar_canal.py:run_classics ^
    --no-persistent-session --minimal-context --timeout-secs 3600

Os horarios acima sao de PRODUCAO, nao de publicacao: o programa produz de madrugada e deixa o
video agendado no YouTube para a hora certa (19h NY no survival, meio-dia NY no classics).

Cada execucao produz UMA parte (ver "partes_por_vez" no canal.json), nao a serie inteira. Sao
uns 20 a 25 minutos, e por isso o prazo de 1 hora basta. Produzir uma parte por noite poupa
duas coisas escassas: a cota de voz do Gemini (o plano gratis da ~10 narracoes por dia, somando
todos os canais que usam a mesma chave) e a memoria RAM do PC (8 GB).

Os dois canais produzem em horarios diferentes (2h e 4h) para nao disputarem memoria.

Antes de registrar, copie este arquivo para a pasta de receitas do Crew:
  copy C:\\\\canais-dark\\crew\\rodar_canal.py %USERPROFILE%\\.kiro\\crew\\crons\\
"""
import os
import subprocess
import sys
import tempfile

# Onde esta o repositorio no seu computador. Mude aqui, ou defina a variavel CANAIS_REPO.
REPO_PADRAO = r"C:\canais-dark"

# Como cada canal e produzido. Signal Lost e Old Tales usam o motor-en; os outros, o proprio produce.py.
CANAIS = {
    "signal-lost": {"pasta_var": "SV_VIDEOS", "painel": "sv"},
    "old-tales": {"pasta_var": "CL_VIDEOS", "painel": "cl"},
    "hora-muerta": {"motor_proprio": True, "token": "YT_REFRESH_TOKEN_ES", "pasta_var": "HM_VIDEOS", "painel": "hm"},
    "so-you-built-it": {"motor_proprio": True, "token": "YT_REFRESH_TOKEN_EN", "pasta_var": "YB_VIDEOS", "painel": "yb"},
}

# Memoria livre minima para comecar a produzir, em MB.
# O PC do Pedro tem 8 GB. Fazer um video usa Chromium (desenha as cenas), Whisper (confere a
# legenda) e FFmpeg (junta tudo): o pico passa de 2 GB. Sem essa folga, o Windows mata o
# processo no meio e se perdem 20 minutos de trabalho sem nenhuma explicacao util.
# Melhor nao comecar e dizer por que. Mude com a variavel CANAIS_MIN_RAM_MB.
MIN_RAM_MB = int(os.environ.get("CANAIS_MIN_RAM_MB", "1200"))
# 1200 e nao 2500: com so o Crew aberto o PC fica em ~2 GB livres, e 2500 faria a tarefa nunca rodar.
# Abaixo disso o produce.py ainda espera a memoria liberar e repete a etapa que cair (motor-en/produce.py).


def memoria_livre_mb():
    """Memoria RAM livre em MB. Nao precisa instalar nada. Devolve -1 se nao souber medir."""
    if os.name == "nt":
        try:
            import ctypes

            class MEMORYSTATUSEX(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong),
                            ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                            ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                            ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]

            m = MEMORYSTATUSEX()
            m.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
            return int(m.ullAvailPhys / (1024 * 1024))
        except Exception:
            return -1
    try:
        for linha in open("/proc/meminfo"):
            if linha.startswith("MemAvailable:"):
                return int(linha.split()[1]) // 1024
    except Exception:
        pass
    return -1


def maiores_processos(n=4):
    """Nome e MB dos processos que mais usam memoria, para dizer o que fechar."""
    if os.name != "nt":
        return ""
    try:
        ps = ("Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First %d "
              "Name,@{n='MB';e={[int]($_.WorkingSet/1MB)}} | "
              "ForEach-Object { \"$($_.Name) $($_.MB) MB\" }") % n
        r = subprocess.run(["powershell", "-NoProfile", "-Command", ps],
                           capture_output=True, text=True, timeout=30)
        return "; ".join(x.strip() for x in (r.stdout or "").splitlines() if x.strip())
    except Exception:
        return ""


def conferir_memoria():
    """Para antes de comecar se nao houver folga de RAM. Devolve None se estiver tudo bem."""
    livre = memoria_livre_mb()
    if livre < 0 or livre >= MIN_RAM_MB:
        return None
    culpados = maiores_processos()
    msg = (f"NAO RODEI: memoria insuficiente. Livre agora: {livre} MB; "
           f"preciso de pelo menos {MIN_RAM_MB} MB.\n"
           f"Fazer um video usa Chromium, Whisper e FFmpeg ao mesmo tempo. Com menos que isso o "
           f"Windows mata o processo no meio e o trabalho se perde.\n"
           f"O que fazer: feche os navegadores (Opera e Chrome costumam ser os maiores) e rode de novo.")
    if culpados:
        msg += f"\nMaiores agora: {culpados}"
    return msg


def _repo():
    repo = os.environ.get("CANAIS_REPO", REPO_PADRAO)
    if not os.path.isdir(repo):
        raise RuntimeError(
            f"Nao achei o repositorio em {repo}. "
            f"Defina a variavel de ambiente CANAIS_REPO com a pasta certa.")
    if not os.path.isfile(os.path.join(repo, "motor-en", "produce.py")):
        raise RuntimeError(
            f"A pasta {repo} existe, mas nao parece ser o repositorio "
            f"(nao achei motor-en\\produce.py). Se voce baixou um .zip, extraia primeiro.")
    return repo


def _carregar_env(repo):
    """Le o arquivo .env da raiz do repositorio e poe tudo no ambiente.

    Formato: UMA_CHAVE=valor por linha. Linhas que comecam com # sao ignoradas.
    O .env NUNCA deve ir para o GitHub (ja esta no .gitignore).
    """
    caminho = os.environ.get("CANAIS_ENV", os.path.join(repo, ".env"))
    if os.environ.get("CANAIS_SEM_ENV") and not os.path.isfile(caminho):
        # no GitHub Actions as chaves vem do cofre (Secrets), nao de arquivo
        faltam = [k for k in ("GEMINI_API_KEY", "YT_CLIENT_ID", "YT_CLIENT_SECRET",
                              "YT_REFRESH_TOKEN_SURVIVAL", "YT_REFRESH_TOKEN_CLASSICS") if not os.environ.get(k)]
        if faltam:
            raise RuntimeError("Faltam chaves no cofre do GitHub (Settings > Secrets > Actions): " + ", ".join(faltam))
        return
    if not os.path.isfile(caminho):
        raise RuntimeError(
            f"Nao achei o arquivo de chaves em {caminho}. "
            f"Copie o .env.example para .env e preencha as chaves (ver MANUAL-PEDRO.md).")
    for linha in open(caminho, encoding="utf-8"):
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        chave, valor = linha.split("=", 1)
        os.environ[chave.strip()] = valor.strip().strip('"').strip("'")


def _ativo(repo, canal):
    """O GitHub/Crew so produz os canais listados em canais-ativos.txt (evita postar em dobro com outra automacao)."""
    arq = os.path.join(repo, "canais-ativos.txt")
    if not os.path.isfile(arq):
        return True
    ativos = {l.split("#")[0].strip() for l in open(arq, encoding="utf-8")}
    return canal in ativos


TENTATIVAS = int(os.environ.get("CANAIS_TENTATIVAS", "3"))
ORCAMENTO_MIN = int(os.environ.get("CANAIS_ORCAMENTO_MIN", "170"))  # tempo total da execucao (job tem 200 min)


def _rodar(canal):
    """Tenta produzir ate TENTATIVAS vezes na MESMA execucao (REGRA do Pedro, 11/11: "aumente o numero de
    tentativas"). A voz fica guardada entre as tentativas, entao repetir nao gasta narracao a mais."""
    import time
    inicio = time.time()
    res = ""
    for n in range(1, TENTATIVAS + 1):
        resto = ORCAMENTO_MIN * 60 - (time.time() - inicio)
        if n > 1 and resto < 25 * 60:
            res += f"\n(sem tempo para a tentativa {n}: fica para a proxima execucao do dia)"
            break
        res = _rodar_uma(canal, int(resto))
        if "FALHOU" not in res or "roteiro com erro" in res or "POUCA MEMORIA" in res:
            break
        print(f"[{canal}] tentativa {n} de {TENTATIVAS} falhou; tento de novo em 1 minuto", flush=True)
        print(res[-1500:], flush=True)
        time.sleep(60)
    return res


def _rodar_uma(canal, resto_s=None):
    """Produz e agenda a proxima serie do canal. Devolve um resumo curto em texto."""
    repo = _repo()
    if not _ativo(repo, canal):
        return f"[{canal}] desligado em canais-ativos.txt (outra automacao cuida dele): nada a fazer"
    _carregar_env(repo)
    falta_memoria = conferir_memoria()
    if falta_memoria:
        return f"[{canal}] {falta_memoria}"
    # fiscal: nunca produzir a partir de roteiro quebrado (venha do Kiro ou do Claude)
    fis = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "validar_roteiros.py")], cwd=repo,
                         capture_output=True, text=True, encoding="utf-8", errors="replace")
    erros_canal = [l for l in fis.stdout.splitlines() if "ERRO" in l and (canal + os.sep in l or canal + "/" in l)]
    if erros_canal:
        return f"[{canal}] FALHOU: roteiro com erro, nada foi produzido. Conserte e envie de novo:\n" + "\n".join(erros_canal[:8])
    saida = os.path.join(tempfile.gettempdir(), "canais", canal)
    os.makedirs(saida, exist_ok=True)
    cfg = CANAIS.get(canal, {})
    if cfg.get("motor_proprio"):
        # Hora Muerta e So You Built It: cada um tem o proprio produce.py dentro de <canal>/scripts
        cwd = os.path.join(repo, canal)
        cmd = [sys.executable, os.path.join("scripts", "produce.py"), "--proximo", "--subir", "--saida", saida]
        os.environ["YT_TOKEN_VAR"] = cfg["token"]
        # copia leve de cada video para o painel (o GitHub Actions envia para a Release painel-<codigo do canal>)
        os.environ[cfg["pasta_var"]] = os.path.join(repo, "painel-saida", cfg["painel"])
        os.makedirs(os.environ[cfg["pasta_var"]], exist_ok=True)
    else:
        cwd = repo
        cmd = [sys.executable, os.path.join(repo, "motor-en", "produce.py"),
               os.path.join(repo, canal), "--proximo", "--subir", "--saida", saida]
        if os.environ.get("CANAIS_SEM_ENV") and cfg.get("pasta_var"):  # no GitHub: copia leve para o painel
            os.environ[cfg["pasta_var"]] = os.path.join(repo, "painel-saida", cfg["painel"])
            os.makedirs(os.environ[cfg["pasta_var"]], exist_ok=True)
    if os.environ.get("CANAIS_REPESCAGEM") and canal == "so-you-built-it":
        # repescagem (2a tentativa do dia, canais.yml): so produz o formato que tiver menos de 2 dias agendados
        cmd += ["--fila", "2"]
    limite = int(os.environ.get("CANAIS_TIMEOUT", "3300"))
    if resto_s:
        limite = max(600, min(limite, resto_s - 120))
    try:
        r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                           timeout=limite)
    except subprocess.TimeoutExpired:
        return (f"[{canal}] FALHOU: passou de {limite // 60} minutos (PC lento ou sem memoria). "
                f"O que ja subiu esta salvo; a proxima execucao continua de onde parou.")
    linhas = (r.stdout or "").strip().splitlines()

    # resumo: so o que interessa no relatorio do Crew
    importantes = [x for x in linhas if any(
        m in x for m in ("AGENDADO", "PUBLICADO", "FILA CHEIA", "SEM ROTEIRO", "CANAL ERRADO", "CODIGO ERRADO",
                         "NAO SUBIU", "LEGENDA FORA DA VOZ", "AUDIO COM PROBLEMA", "CHIADO NO FIM", "VOZ FALHOU", "LIMITE DE NARRACOES", "GEMINI FORA DO AR",
                         "canal confirmado", "FUSO NAO ENCONTRADO", "FALTA A VARIAVEL", "POUCA MEMORIA",
                         "FALTA ROTEIRO", "ESTOQUE BAIXO", "SUBSTITUTO", "HORARIO VAZIO"))]
    importantes += estoque(repo, canal, linhas)
    alertar(canal, [x for x in importantes if any(m in x for m in ALERTA) and not folga_na_fila(x)])
    resumo = "\n".join(importantes) or "\n".join(linhas[-8:]) or "(sem saida)"

    if r.returncode == 3:
        # produce.py: video barrado, mas o canal ainda tem video agendado (nada sai do ar). Workflow fica verde
        # (o Pedro nao recebe e-mail de falha), o aviso vai para a issue e a proxima execucao tenta de novo.
        return f"[{canal}] OK COM AVISO: barrado nesta execucao, mas ha video agendado; tento de novo depois\n{resumo}"
    if r.returncode != 0:
        erro = (r.stderr or "").strip().splitlines()
        cauda = "\n".join(erro[-40:])  # o erro de verdade (ex.: JS do render) fica antes do traceback
        # morte por falta de memoria nao deixa mensagem de erro util: avisa o que foi
        agora = memoria_livre_mb()
        pista = ""
        if 0 <= agora < MIN_RAM_MB:
            pista = (f"\nATENCAO: a memoria livre esta em {agora} MB. O processo provavelmente foi "
                     f"morto por falta de memoria. Feche os navegadores e rode de novo.")
        return f"[{canal}] FALHOU (codigo {r.returncode})\n{resumo}\n--- erro ---\n{cauda}{pista}"
    return f"[{canal}] OK (memoria livre: {memoria_livre_mb()} MB)\n{resumo}"


# o que vira aviso para o Pedro (issue no GitHub, canais.yml): problema que pode deixar um dia sem video
ALERTA = ("SEM ROTEIRO", "FALTA ROTEIRO", "ESTOQUE BAIXO", "NAO SUBIU", "HORARIO VAZIO", "VOZ FALHOU", "CANAL ERRADO")
DIAS_DE_ESTOQUE = int(os.environ.get("CANAIS_DIAS_ESTOQUE", "4"))


def folga_na_fila(linha):
    """'NAO SUBIU' com 2 ou mais videos ja agendados nao vira e-mail: nada sai do ar e a proxima execucao (ou a
    repescagem do dia) tenta de novo. Pedido do Pedro (03/11): aviso so quando ha risco de dia sem video.
    Continua no log do Actions. Com 0 ou 1 agendado, avisa (amanha pode ficar vazio)."""
    import re
    m = re.search(r"NAO SUBIU .*Fila ainda tem (\d+) agendado", linha)
    return bool(m) and int(m.group(1)) >= 2


def estoque(repo, canal, linhas):
    """Quantos roteiros ainda nao subiram. Avisa com DIAS_DE_ESTOQUE de antecedencia (o Kiro/Claude/Gemini escrevem)."""
    ja = next((l.split(":", 1)[1] for l in linhas if l.startswith("ja no canal:")), None)
    if ja is None:
        return []
    ja = {x.strip() for x in ja.split(",")}
    import glob, json
    pend = []
    for f in sorted(glob.glob(os.path.join(repo, canal, "stories", "*.json"))):
        try:
            cod = json.load(open(f, encoding="utf-8")).get("codigo")
        except Exception:
            continue
        if cod and cod not in ja:
            pend.append(cod)
    # REGRA do Pedro (11/11): nos canais com motor 3D, o estoque conta so roteiros 3D; os do estilo antigo sao reserva
    if canal in ("hora-muerta", "signal-lost", "old-tales"):
        tres_d = []
        for f in sorted(glob.glob(os.path.join(repo, canal, "stories", "*.json"))):
            try:
                h = json.load(open(f, encoding="utf-8"))
            except Exception:
                continue
            if h.get("visual") == "3d" and h.get("codigo") in pend:
                tres_d.append(h["codigo"])
        reserva = len(pend) - len(tres_d)
        if len(pend) >= DIAS_DE_ESTOQUE:  # com a reserva nao falta video: so informa (a rotina escreve 3D pelo ROTEIROS.md)
            return [f"estoque: {len(tres_d)} roteiro(s) 3D prontos ({', '.join(tres_d) or 'nenhum'}) + {reserva} de reserva no estilo antigo"]
        pend = tres_d
        if reserva:
            linhas_reserva = f" (+{reserva} de reserva no estilo antigo)"
        else:
            linhas_reserva = ""
    else:
        linhas_reserva = ""
    por_dia = 2 if canal == "so-you-built-it" else 1
    if len(pend) >= DIAS_DE_ESTOQUE * por_dia:
        return [f"estoque: {len(pend)} roteiro(s) prontos ({', '.join(pend)}){linhas_reserva}"]
    return [f"ESTOQUE BAIXO {canal}: so {len(pend)} roteiro(s) prontos ({', '.join(pend) or 'nenhum'}){linhas_reserva}, "
            f"menos de {DIAS_DE_ESTOQUE} dias. Escrever a proxima serie seguindo ROTEIROS.md"]


def alertar(canal, linhas):
    """Grava o aviso em /tmp/canais-alerta.txt; o canais.yml abre (ou atualiza) uma issue e o GitHub manda e-mail."""
    if not os.environ.get("CANAIS_ULTIMA"):
        # REGRA do Pedro (11/11): e-mail so quando todas as tentativas do dia acabaram e o video nao subiu.
        # Antes disso, video barrado nao vira issue (a proxima execucao do dia tenta de novo); estoque baixo continua.
        linhas = [x for x in linhas if not any(m in x for m in ("NAO SUBIU", "VOZ FALHOU", "HORARIO VAZIO"))]
    # REGRA do Pedro (13/11): as rotinas de roteiro repoem o estoque; e-mail de estoque so quando ZERA.
    import re
    linhas = [x for x in linhas if not (("ESTOQUE BAIXO" in x and not re.search(r"(so |: )0 roteiro", x))
                                        or "FALTA ROTEIRO" in x)]
    if not linhas:
        return
    with open(os.path.join(tempfile.gettempdir(), "canais-alerta.txt"), "a", encoding="utf-8") as f:
        f.write(f"[{canal}]\n" + "\n".join(dict.fromkeys(linhas)) + "\n")


def _entregar(ctx, texto):
    """Avisa o Pedro pelo sininho do Crew (raise Report). Sem ctx (rodando na mao), so imprime."""
    if ctx is None:
        print(texto); return texto
    from kiro_crew.cron_script import Report
    ruim = any(m in texto for m in ("FALHOU", "NAO RODEI", "NAO SUBIU", "VOZ FALHOU", "CANAL ERRADO", "SEM ROTEIRO"))
    raise Report(("⚠️ " if ruim else "✅ ") + texto)


def run_survival(ctx=None, *_a, **_k):
    return _entregar(ctx, _rodar("signal-lost"))


def run_classics(ctx=None, *_a, **_k):
    return _entregar(ctx, _rodar("old-tales"))


def run_hora_muerta(ctx=None, *_a, **_k):
    return _entregar(ctx, _rodar("hora-muerta"))


def run_so_you_built_it(ctx=None, *_a, **_k):
    return _entregar(ctx, _rodar("so-you-built-it"))


def run_metricas(ctx=None, *_a, **_k):
    """Todo dia: guarda views/likes/comentarios dos dois canais em metricas/*.csv. Silencioso se der certo."""
    repo = _repo(); _carregar_env(repo)
    r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "metricas.py")], cwd=repo,
                       capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=500)
    if ctx is None:
        print(r.stdout, r.stderr)
        if r.returncode != 0:
            sys.exit(1)
        return
    if r.returncode != 0:
        from kiro_crew.cron_script import Report
        raise Report("⚠️ metricas falharam:\n" + "\n".join((r.stderr or r.stdout).splitlines()[-6:]))
    from kiro_crew.cron_script import Skip
    raise Skip()


def run_capas_yb(ctx=None, *_a, **_k):
    """Uma vez (05/11, canal verificado por telefone): poe thumbnail personalizada em todos os Shorts do So You Built It."""
    repo = _repo(); _carregar_env(repo)
    env = dict(os.environ, YT_TOKEN_VAR=CANAIS["so-you-built-it"]["token"])
    r = subprocess.run([sys.executable, os.path.join("scripts", "capa.py"), "--antigas", "--saida",
                        os.path.join(tempfile.gettempdir(), "yb-capas")], cwd=os.path.join(repo, "so-you-built-it"),
                       env=env, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=3000)
    texto = "[capas-yb] " + ("OK" if r.returncode == 0 else "FALHOU") + "\n" + (r.stdout or "")[-3000:] + (r.stderr or "")[-1500:]
    if ctx is None:
        print(texto)
        if r.returncode != 0:
            sys.exit(1)
        return texto
    return _entregar(ctx, texto)


def run(ctx=None, *_a, **_k):
    """Roda os dois canais, um depois do outro. Use se preferir uma tarefa so."""
    return _entregar(ctx, _rodar("signal-lost") + "\n\n" + _rodar("old-tales"))


def run_teste(ctx=None, *_a, **_k):
    """Confere o ambiente SEM publicar e SEM gastar narracao: chaves, canais certos, previa das cenas, sons."""
    repo = _repo(); _carregar_env(repo)
    out, ok = [], True
    for canal in ("signal-lost", "old-tales"):
        r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "yt_upload.py"), "canal", "--canal",
                            os.path.join(repo, canal)], cwd=repo, capture_output=True, text=True, encoding="utf-8", errors="replace")
        ok &= r.returncode == 0
        out.append(f"[{canal}] YouTube: " + (r.stdout.strip().replace("\n", " ") if r.returncode == 0 else "ERRO " + r.stderr.strip()[-300:]))
        hist = sorted(__import__("glob").glob(os.path.join(repo, canal, "stories", "*.json")))
        if hist:
            r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "previa.py"), hist[-1],
                                os.path.join(tempfile.gettempdir(), "previa-teste")], cwd=repo,
                               capture_output=True, text=True, encoding="utf-8", errors="replace")
            ok &= r.returncode == 0
            out.append(f"[{canal}] previa das cenas: " + ("OK" if r.returncode == 0 else "ERRO " + r.stderr.strip()[-300:]))
    # alinhador da legenda (motor-en/sincronia.py): baixa o modelo uma vez (fica no cache) e alinha um audio de teste
    r = subprocess.run([sys.executable, "-c", "import sys, numpy as np; sys.path.insert(0, 'motor-en'); import sincronia as S; "
                        "print(S.alinhar(np.zeros(32000, np.float32), ['ok'], 'en'))"], cwd=repo,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    ok &= r.returncode == 0
    out.append("alinhador da legenda: " + ("OK" if r.returncode == 0 else "ERRO " + r.stderr.strip()[-300:]))
    r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "sons.py")], cwd=repo,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    out.append("sons: " + ("OK" if r.returncode == 0 else "ERRO " + r.stderr.strip()[-200:]))
    # canais com motor proprio: token certo (so leitura) + previa das cenas do ultimo roteiro
    for canal, cfg in CANAIS.items():
        if not cfg.get("motor_proprio"):
            continue
        env = dict(os.environ, YT_TOKEN_VAR=cfg["token"])
        if not env.get(cfg["token"]):
            ok = False; out.append(f"[{canal}] falta a chave {cfg['token']} no cofre"); continue
        acao = "canal" if canal == "so-you-built-it" else "publicados"
        r = subprocess.run([sys.executable, os.path.join("scripts", "yt_upload.py"), acao], cwd=os.path.join(repo, canal),
                           env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
        ok &= r.returncode == 0
        resumo = (r.stdout.strip().replace("\n", " ")[:160]) if r.returncode == 0 else "ERRO " + r.stderr.strip()[-300:]
        out.append(f"[{canal}] YouTube ({acao}): {resumo}")
        hist = sorted(__import__("glob").glob(os.path.join(repo, canal, "stories", "*.json")))
        if hist:
            r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "previa.py"), hist[-1],
                                os.path.join(tempfile.gettempdir(), "previa-teste-" + canal)], cwd=repo,
                               capture_output=True, text=True, encoding="utf-8", errors="replace")
            ok &= r.returncode == 0
            out.append(f"[{canal}] previa das cenas: " + ("OK" if r.returncode == 0 else "ERRO " + r.stderr.strip()[-300:]))
    texto = ("TESTE OK" if ok else "TESTE FALHOU") + "\n" + "\n".join(out)
    if ctx is None:
        print(texto)
        if not ok:
            sys.exit(1)
        return texto
    return _entregar(ctx, texto)


if __name__ == "__main__":
    qual = sys.argv[1] if len(sys.argv) > 1 else "ambos"
    funcoes = {"survival": run_survival, "signal-lost": run_survival, "classics": run_classics,
               "old-tales": run_classics, "hora-muerta": run_hora_muerta, "so-you-built-it": run_so_you_built_it,
               "metricas": run_metricas, "teste": run_teste, "capas-yb": run_capas_yb}
    if qual.startswith("privado:"):
        # tirar video com defeito do ar: tarefa "privado:<canal>:<id do video>" (workflow_dispatch)
        # varios canais/videos de uma vez: "privado:<canal>:<id>,<id>;<canal>:<id>"
        repo = _repo()
        rc = 0
        for bloco in qual.split(":", 1)[1].split(";"):
            canal, vids = bloco.split(":", 1)
            for vid in vids.split(","):
                r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "yt_upload.py"), "privado", vid,
                                    "--canal", os.path.join(repo, canal)], cwd=repo)
                rc = rc or r.returncode
        sys.exit(rc)
    if qual.startswith("subir:"):
        # video ja pronto (feito fora do Actions, ex.: motor cartoon): tarefa "subir:<canal>:<tag da Release>".
        # A Release tem video.mp4 + upload.json (formato do yt_upload.py, "arquivo": "video.mp4"). Publica na hora.
        _, canal, tag = qual.split(":", 2)
        repo = _repo()
        pasta = os.path.join(tempfile.gettempdir(), "subir-" + tag)
        os.makedirs(pasta, exist_ok=True)
        # 1o: Release com esse tag; se nao houver, pasta <tag>/ no branch "entregas" (sessao do Claude nao cria Release)
        if subprocess.run(["gh", "release", "download", tag, "-D", pasta, "--clobber"], cwd=repo).returncode:
            subprocess.run(["git", "fetch", "--depth", "1", "origin", "entregas"], cwd=repo, check=True)
            for nome in ("video.mp4", "upload.json"):
                with open(os.path.join(pasta, nome), "wb") as f:
                    f.write(subprocess.run(["git", "show", f"FETCH_HEAD:{tag}/{nome}"], cwd=repo, check=True,
                                           capture_output=True).stdout)
        r = subprocess.run([sys.executable, os.path.join(repo, "motor-en", "agendar.py"), os.path.join(repo, canal),
                            os.path.join(pasta, "upload.json"), "agora"], cwd=repo)
        sys.exit(r.returncode)
    texto = funcoes.get(qual, run)() or ""
    # no GitHub Actions, falha vira X vermelho e o GitHub manda e-mail ao Pedro. So falha quando o programa do canal
    # falhou de verdade: video barrado mas trocado pelo substituto nao e falha (vira aviso na issue, ver alertar).
    if any(m in texto for m in ("FALHOU", "NAO RODEI")):
        open(os.path.join(tempfile.gettempdir(), "canais-falhou.txt"), "w").write(texto)  # vai para a Release "logs"
        if os.environ.get("CANAIS_ULTIMA") or qual in ("teste", "metricas", "capas-yb"):
            sys.exit(1)  # ultima chance do dia: X vermelho e e-mail ao Pedro
        print("FALHOU NESTA EXECUCAO, mas ainda ha tentativa hoje: fica verde, sem e-mail (REGRA do Pedro, 11/11)")
