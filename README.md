# canais-dark

Os canais e páginas do Pedro, um por pasta. As skills de conversa (as que servem para qualquer
assunto) ficam no repositório [claude-skills](https://github.com/opradopedro/claude-skills).

| Pasta | Canal | Onde roda |
|---|---|---|
| `hora-muerta/` | Hora Muerta (YouTube, espanhol, terror) | rotina no Claude |
| `so-you-built-it/` | So You Built It (YouTube, inglês, engenharia) | rotina no Claude |
| `gta6/` | Radar GTA VI BR (@radar.gta6br, Instagram) | rotina no Claude (usa a skill `radar-da-gringa` do claude-skills) |
| `signal-lost/` | Signal Lost (YouTube, inglês, terror de sobrevivência) | GitHub Actions |
| `old-tales/` | Old Tales (YouTube, inglês, "You wake up in 1300") | GitHub Actions |
| `painel/` | Painel com todas as contas, vídeos e ideias | artefato do Claude |

Pastas de apoio:

- `motor-en/`: motor dos dois canais em inglês (voz, legenda, sons gravados, prévia grátis, upload).
  Ele usa as peças de cena de `hora-muerta/scripts/engine.html`.
- `crew/rodar_canal.py`: a "receita" que produz e agenda um vídeo. Roda no GitHub Actions
  (`.github/workflows/canais.yml`) ou no Kiro Crew do PC.
- `metricas/`: views, likes e comentários de cada vídeo, um CSV por canal, atualizado todo dia.

As chaves ficam no cofre do GitHub (Settings → Secrets and variables → Actions) e, no PC, no
arquivo `.env`, que nunca vai para o GitHub.
