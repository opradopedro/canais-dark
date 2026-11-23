# Robo dos canais no PC do Pedro (Pedro, 16/11: "PC produz, nuvem de reserva").
# Rodar UMA vez no PowerShell COMO ADMINISTRADOR:
#   irm https://raw.githubusercontent.com/opradopedro/canais-dark/producao/pc/instalar.ps1 | iex
# Pode rodar de novo quantas vezes quiser (conserta o que faltar).
#
# O que faz: cria um Linux separado (WSL "canais", em C:\canais-pc) so para os canais, instala FFmpeg/fontes/
# Chromium, liga o PC ao GitHub como "runner" (label canais-pc) e cria uma tarefa do Windows que liga o robo
# sempre que voce entra no PC. Se o PC desligar, o GitHub produz na nuvem como antes (ver .github/workflows/vigia-pc.yml).
# 'Continue': no PowerShell 5 o aviso do wsl.exe no stderr viraria erro fatal com 'Stop' (17/11)
$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'   # download rapido no PowerShell 5
$base = 'https://raw.githubusercontent.com/opradopedro/canais-dark/producao/pc'
$dir = 'C:\canais-pc'
New-Item -ItemType Directory -Force $dir | Out-Null

Write-Host "`n== 1/5 WSL ==" -ForegroundColor Cyan
cmd /c "wsl.exe --status >nul 2>&1"
if ($LASTEXITCODE -ne 0) {
  & wsl.exe --install --no-distribution
  # WSL1 nao precisa de virtualizacao na BIOS; o recurso dele tambem e ligado aqui
  & dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart | Out-Null
  Write-Host "`nWSL instalado. REINICIE o PC e rode este mesmo comando de novo." -ForegroundColor Yellow
  return
}
cmd /c "wsl.exe --update >nul 2>&1"
# Virtualizacao desligada na BIOS (comum em PC de casa): usa WSL1, que roda sem ela.
# com o hipervisor do Windows ligado, Win32_Processor diz False mesmo com a BIOS certa: confere os dois
$virt = (Get-CimInstance Win32_ComputerSystem).HypervisorPresent -or (Get-CimInstance Win32_Processor | Select-Object -First 1).VirtualizationFirmwareEnabled
$versao = if ($virt) { 2 } else { 1 }
Write-Host "virtualizacao na BIOS: $virt -> WSL$versao"

Write-Host "`n== 2/5 Memoria do WSL (6 GB de 8) ==" -ForegroundColor Cyan
$cfg = Join-Path $env:USERPROFILE '.wslconfig'
if (-not (Test-Path $cfg)) {
  "[wsl2]`r`nmemory=6GB`r`nswap=4GB`r`n" | Set-Content -Encoding ascii $cfg
} else { Write-Host "ja existe $cfg (mantido como esta)" }

Write-Host "`n== 3/5 Linux dos canais ==" -ForegroundColor Cyan
$lista = ((& wsl.exe -l -q 2>$null) -join "`n") -replace "`0", ''
if ($lista -notmatch '(?m)^canais\s*$') {
  $tar = Join-Path $dir 'ubuntu.tar.gz'
  Write-Host "baixando Ubuntu 24.04 (~350 MB)..."
  Invoke-WebRequest 'https://cloud-images.ubuntu.com/wsl/releases/24.04/current/ubuntu-noble-wsl-amd64-wsl.rootfs.tar.gz' -OutFile $tar -UseBasicParsing
  if (-not (Test-Path $tar)) { Write-Host "Download do Ubuntu falhou. Tire um print e mande para o Claude." -ForegroundColor Red; return }
  & wsl.exe --import canais (Join-Path $dir 'disco') $tar --version $versao
  if ($LASTEXITCODE -ne 0) { Write-Host "Nao consegui criar o Linux (wsl --import). Tire um print e mande para o Claude." -ForegroundColor Red; return }
  Remove-Item $tar
} else { Write-Host "Linux 'canais' ja existe" }

Write-Host "`n== 4/5 Programas e ligacao com o GitHub (vai pedir um codigo) ==" -ForegroundColor Cyan
& wsl.exe -d canais -u root -- bash -c "command -v curl >/dev/null || (apt-get update -qq && apt-get install -y -qq curl ca-certificates >/dev/null); curl -fsSL $base/dentro-wsl.sh -o /root/dentro-wsl.sh && bash /root/dentro-wsl.sh"
if ($LASTEXITCODE -ne 0) { Write-Host "`nAlgo falhou acima. Tire um print e mande para o Claude." -ForegroundColor Red; return }
cmd /c "wsl.exe --terminate canais >nul 2>&1"   # aplica o wsl.conf (Linux isolado do Windows)
# disco do WSL2 devolve ao Windows o espaco dos videos apagados (sem isso o ext4.vhdx so cresce; Pedro, 23/11)
if ($versao -eq 2) {
  & wsl.exe --manage canais --set-sparse true 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { Write-Host "disco do Linux em modo sparse (encolhe sozinho)" } else { Write-Host "AVISO: nao consegui ligar o modo sparse (WSL antigo?)" -ForegroundColor Yellow }
}

Write-Host "`n== 5/5 Ligar sozinho ao entrar no PC ==" -ForegroundColor Cyan
$acao = New-ScheduledTaskAction -Execute 'conhost.exe' -Argument '--headless wsl.exe -d canais -u root -- bash /opt/canais-pc/ligar.sh'
$gatilho = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$conf = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName 'Canais - robo' -Action $acao -Trigger $gatilho -Settings $conf -Force | Out-Null
Start-ScheduledTask -TaskName 'Canais - robo'
# PC nao dorme na tomada (dormindo ele some do GitHub)
& powercfg /change standby-timeout-ac 0
& powercfg /change hibernate-timeout-ac 0

Start-Sleep 20
Write-Host "`nPRONTO. O robo dos canais esta ligado e liga sozinho quando voce entrar no Windows." -ForegroundColor Green
Write-Host "Se o PC desligar, nada para: o GitHub produz na nuvem ate o PC voltar."
