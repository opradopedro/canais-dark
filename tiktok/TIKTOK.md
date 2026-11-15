# TikTok: como a postagem funciona

O TikTok acompanha o YouTube. Todo vídeo que entra no ar no YouTube vai para a conta do canal no TikTok, pela vidIQ (app já aprovado pelo TikTok, post grátis). Quem posta é a rotina do Claude, 10 minutos depois de cada horário de publicação do YouTube (15/11, pedido do Pedro: TikTok sai junto com o YouTube): 17h10 UTC (Old Tales, meio-dia de NY), 21h10 e 23h10 UTC (So You Built It) e 00h10 UTC (Hora Muerta e Signal Lost). Cron `10 0,17,21,23 * * *` (UTC). Execução sem nada público novo termina sem fazer nada. Se um canal mudar de horário no YouTube, mudar a tarefa também.

## Regras do Pedro (13/11/2026)
- Mesma frequência do YouTube. Série antiga (já no ar em 13/11) nunca vai: está em `postados.json` → `ignorar`.
- (14/11) Só vai para o TikTok o vídeo que está PÚBLICO no YouTube AGORA, e o MESMO arquivo: o controle é pelo ID do vídeo do YouTube (cartoon e ilustrado têm IDs diferentes). O `fila.py` lê o feed público do canal (`feeds/videos.xml`), que não mostra vídeo privado, agendado ou substituído, e confere de novo pelo oEmbed antes de listar.
- (14/11) NUNCA agendar na vidIQ (`publishAt` proibido): post agendado lá não pode ser cancelado. Foi assim que o Wukong CARTOON antigo (CL042) saiu no TikTok em 14/11 07Z depois de ter sido trocado pelo ilustrado (CL059). Publicar sempre na hora; o que ainda não está no ar fica para a próxima execução.
- Máximo 1 vídeo por conta por execução (SYBI: 2). Atrasado sai na execução seguinte.
- Vídeo trocado/substituído no YouTube: se por acaso ainda estiver público, marcar com `python tiktok/fila.py --ignorar <youtubeId> <canal> <motivo>`. Wukong cartoon CL041-CL045 está em `ignorar`.
- Escolhas do TikTok, dadas pelo Pedro, valem para todo post: `privacyLevel` PUBLIC_TO_EVERYONE, `allowComment` true, `musicUsageConfirmed` true (ele aceitou), `isAiGenerated` true. Não perguntar de novo. O Pedro autorizou postar sem aprovação a cada vídeo.
- Sem marca d'água: o vídeo vem do próprio YouTube (download da vidIQ, 1080x1920).
- Radar GTA não vai para o TikTok.
- (15/11) Signal Lost: conta criada pelo Pedro. Só posta vídeo do motor NOVO (roteiro com `"visual": "ilustrado"`); o `fila.py` confere pelo dados.json + arquivo do roteiro (`so_visual`). Ligada na vidIQ em 15/11 (_000YWmW5XJxNaQwk5spdhkLeeujRfv_CCJ4).

## Passo a passo da rotina
1. `git pull origin producao` e `python tiktok/fila.py`. Lista vazia = nada a fazer.
2. Para cada item: `vidiq_video_upload` com `url` = link do YouTube → `vidiq_job_poll` até `completed` (pega `uploadId`).
   Conferir que a duração do vídeo baixado bate com a do YouTube (ffprobe no `videoUrl`).
3. `vidiq_social_post_draft_create` com `text` = `legenda`, `media` = o vídeo, destino TIKTOK com `platformAccountId` = `conta` e as 4 escolhas acima. SEM `publishAt`.
4. `vidiq_social_post_publish` com o `postId` e a `revision`.
5. `python tiktok/fila.py --marcar <youtubeId> <postId> <canal> [codigo]`; no fim, commit e push em producao.
6. Falhou (conta desconectada, `canPublish` false): não marcar; avisar o Pedro na thread "Planejar vídeos longos e TikTok" com o link de reconectar (`vidiq_social_account_connect`, em bloco de código, porque ele não consegue copiar hyperlink).

Post agendado na vidIQ não pode ser cancelado nem mudado (por isso a regra de nunca agendar). Se um vídeo do YouTube for tirado do ar, apagar o do TikTok pelo app.
