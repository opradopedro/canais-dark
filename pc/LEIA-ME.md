# Robô dos canais no PC (PC produz, nuvem de reserva)

Decisão do Pedro em 16/11/2026: a produção dos 4 canais do YouTube (Old Tales, Signal Lost, So You Built It,
Hora Muerta) roda primeiro no PC dele, com o GitHub Actions na nuvem de reserva. O Radar GTA não muda.

## Como funciona
- O PC tem um Linux separado (WSL `canais`, em `C:\canais-pc`) com um runner do GitHub (label `canais-pc`).
- A cada 5 min o PC atualiza a Release `pc-sinal` (`pc/sinal.sh`), só se o runner estiver rodando.
- `canais.yml`, job `onde`: a 1ª tentativa e a repescagem de cada canal vão para o PC **se** houve sinal nos
  últimos 20 min. A 3ª tentativa, a ÚLTIMA, as métricas e os disparos manuais rodam sempre na nuvem.
  Disparo manual `pc:<canal>` força o PC (teste).
- Tentativa no PC nunca fica vermelha (sem e-mail); se falhar, a nuvem tenta nas próximas.
- `vigia-pc.yml` (a cada 10 min): se o PC sumiu com um job esperando por ele, cancela a execução para não
  travar a fila; a próxima tentativa cai na nuvem.
- As fatias do desenho cartoon (10 em paralelo) continuam na nuvem; preparar voz/legenda/capa e
  juntar/conferir/agendar rodam no PC.
- 3 dias de vídeos agendados por canal (PR #27): o PC desligado por 1 ou 2 dias não deixa horário vazio.

## Instalar (uma vez, PowerShell como administrador)
```
irm https://raw.githubusercontent.com/opradopedro/canais-dark/producao/pc/instalar.ps1 | iex
```
Se pedir para reiniciar, reinicie e rode de novo. No meio ele mostra um código: abrir
`https://github.com/login/device` e digitar o código.

## Segurança
O repositório é público: o instalador liga "PR de fora precisa de aprovação" (Settings > Actions) e o Linux
do robô fica sem acesso ao C: e sem rodar programas do Windows. O login do GitHub fica num usuário
separado (`sinal`), que os vídeos não leem.

## Conferir / desligar
- Logs no PC: `wsl -d canais -u root -- tail -50 /var/log/canais-runner.log`
- Desligar o robô: Agendador de Tarefas > "Canais - robo" > Desabilitar (a nuvem assume sozinha).
