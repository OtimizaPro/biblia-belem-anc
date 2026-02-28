# Scheduled Dual GPU Translation - Biblia Belem An.C 2025
# Agendado para rodar automaticamente. Inicia Ollama dual GPU e traduz AT.

$ErrorActionPreference = "Continue"
$projectRoot = "v:\Projetos\Ecossistema aculpaedasovelhas\.Bible Belem AnC-2025"
$logFile = "$projectRoot\scripts\scheduled-translate.log"

# Timestamp
"[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Iniciando traducao agendada..." | Out-File -Append $logFile

# 1. Iniciar dual Ollama
"[$(Get-Date -Format 'HH:mm:ss')] Iniciando dual Ollama..." | Out-File -Append $logFile
try {
    & "$projectRoot\scripts\start-dual-ollama.ps1" 2>&1 | Out-File -Append $logFile
    "[$(Get-Date -Format 'HH:mm:ss')] Dual Ollama iniciado com sucesso" | Out-File -Append $logFile
} catch {
    "[$(Get-Date -Format 'HH:mm:ss')] ERRO ao iniciar dual Ollama: $_" | Out-File -Append $logFile
    exit 1
}

# 2. Limpar checkpoint antigo para processar tudo novamente
$checkpointFile = "$projectRoot\scripts\dual-gpu-checkpoint.json"
if (Test-Path $checkpointFile) {
    Remove-Item $checkpointFile -Force
    "[$(Get-Date -Format 'HH:mm:ss')] Checkpoint anterior removido" | Out-File -Append $logFile
}

# 3. Executar traducao dual GPU (AT)
"[$(Get-Date -Format 'HH:mm:ss')] Iniciando traducao AT com dual GPU..." | Out-File -Append $logFile
try {
    Set-Location $projectRoot
    node scripts/dual-gpu-translate.mjs --testament=AT 2>&1 | Out-File -Append $logFile
    "[$(Get-Date -Format 'HH:mm:ss')] Traducao concluida" | Out-File -Append $logFile
} catch {
    "[$(Get-Date -Format 'HH:mm:ss')] ERRO na traducao: $_" | Out-File -Append $logFile
}

# 4. Verificar progresso
"[$(Get-Date -Format 'HH:mm:ss')] Verificando progresso..." | Out-File -Append $logFile
try {
    node scripts/check-progress-at.mjs 2>&1 | Out-File -Append $logFile
} catch {}

"[$(Get-Date -Format 'HH:mm:ss')] Fim da execucao agendada." | Out-File -Append $logFile
