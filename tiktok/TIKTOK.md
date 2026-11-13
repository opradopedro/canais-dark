# TikTok: como a postagem funciona

O TikTok acompanha o YouTube. Todo vídeo que entra no ar no YouTube vai para a conta do canal no TikTok, pela vidIQ (app já aprovado pelo TikTok, post grátis). Quem posta é a rotina diária do Claude, às 00h20 UTC (21h20 de Brasília), logo depois dos horários de publicação do Hora Muerta e do So You Built It.

## Regras do Pedro (13/11/2026)
- Mesma frequência do YouTube. Série antiga (já no ar em 13/11) nunca vai: está em `postados.json` → `ignorar`.
- Série que estava rodando: partes atrasadas saem de 8 em 8 horas até alcançar o YouTube (só o Wukong cartoon, CL041-CL045).
- Escolhas do TikTok, dadas pelo Pedro, valem para todo post: `privacyLevel` PUBLIC_TO_EVERYONE, `allowComment` true, `musicUsageConfirmed` true (ele aceitou), `isAiGenerated` true. Não perguntar de novo. O Pedro autorizou postar sem aprovação a cada vídeo.
- Sem marca d'água: o vídeo vem do próprio YouTube (download da vidIQ, 1080x1920).
- Radar GTA não vai para o TikTok. Signal Lost entra quando a conta existir (o Google travou criar e-mail em 13/11): pôr a conta em `CONTAS` no `fila.py` e os códigos já no ar em `ignorar`.

## Passo a passo da rotina
1. `git pull origin producao` e `python tiktok/fila.py`. Lista vazia = nada a fazer.
2. Para cada item: `vidiq_video_upload` com `url` = link do YouTube → `vidiq_job_poll` até `completed` (pega `uploadId`).
3. `vidiq_social_post_draft_create` com `text` = `legenda`, `media` = o vídeo, destino TIKTOK com `platformAccountId` = `conta` e as 4 escolhas acima. Se `agora` for false, pôr `publishAt` = `quando`.
4. `vidiq_social_post_publish` com o `postId` e a `revision`.
5. `python tiktok/fila.py --marcar <codigo> <postId> <quando> <canal>`; no fim, commit e push em producao.
6. Falhou (conta desconectada, `canPublish` false): não marcar; avisar o Pedro na thread "Planejar vídeos longos e TikTok" com o link de reconectar (`vidiq_social_account_connect`, em bloco de código, porque ele não consegue copiar hyperlink).

Post agendado na vidIQ não pode ser cancelado nem mudado. Se um vídeo do YouTube for tirado do ar, apagar o do TikTok pelo app.
