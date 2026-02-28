# Dual GPU Ollama Setup - Biblia Belem An.C 2025
# Inicia duas instancias Ollama em GPUs separadas para traducao paralela
# GPU 0 (RTX 5060 Ti): porta 11434
# GPU 1 (RTX 4060):    porta 11435

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       DUAL GPU OLLAMA - BIBLIA BELEM An.C 2025               " -ForegroundColor Cyan
Write-Host "       Traducao paralela com 2 GPUs                            " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$MODEL = "qwen2.5:14b"
$PORT0 = 11434
$PORT1 = 11435
$MODELS_DIR = "$env:USERPROFILE\.ollama\models"

# 1. VERIFICAR DRIVERS NVIDIA E GPUS

Write-Host "[1/5] Verificando GPUs NVIDIA..." -ForegroundColor Yellow

$nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if (-not $nvidiaSmi) {
    Write-Host "  X NVIDIA drivers nao encontrados!" -ForegroundColor Red
    exit 1
}

$gpuInfo = nvidia-smi --query-gpu=index,name,memory.total,memory.used --format=csv,noheader,nounits
$gpuLines = $gpuInfo.Trim() -split "`n"

if ($gpuLines.Count -lt 2) {
    Write-Host "  X Apenas $($gpuLines.Count) GPU(s) detectada(s). Necessario 2." -ForegroundColor Red
    Write-Host "  Use scripts/ollama-setup.ps1 para single GPU." -ForegroundColor Yellow
    exit 1
}

foreach ($line in $gpuLines) {
    $parts = $line -split ","
    $idx = $parts[0].Trim()
    $name = $parts[1].Trim()
    $memTotal = $parts[2].Trim()
    $memUsed = $parts[3].Trim()
    $memFree = [int]$memTotal - [int]$memUsed
    Write-Host "  GPU $idx : $name | VRAM: ${memFree}/${memTotal} MiB livre" -ForegroundColor Green
}
Write-Host ""

# 2. VERIFICAR OLLAMA INSTALADO

Write-Host "[2/5] Verificando Ollama..." -ForegroundColor Yellow

$ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaInstalled) {
    Write-Host "  X Ollama nao encontrado. Execute scripts/ollama-setup.ps1 primeiro." -ForegroundColor Red
    exit 1
}
Write-Host "  OK - Ollama instalado" -ForegroundColor Green
Write-Host ""

# 3. PARAR INSTANCIAS EXISTENTES

Write-Host "[3/5] Parando instancias Ollama existentes..." -ForegroundColor Yellow

$existing = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if ($existing) {
    Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  OK - Instancias anteriores encerradas" -ForegroundColor Green
} else {
    Write-Host "  OK - Nenhuma instancia ativa" -ForegroundColor Green
}
Write-Host ""

# 4. INICIAR DUAS INSTANCIAS

Write-Host "[4/5] Iniciando instancias Ollama..." -ForegroundColor Yellow

# Instancia 0: GPU 0, porta 11434
Write-Host "  Iniciando GPU 0 (porta $PORT0)..." -ForegroundColor Cyan
$env0 = @{
    "CUDA_VISIBLE_DEVICES" = "0"
    "OLLAMA_HOST" = "0.0.0.0:$PORT0"
    "OLLAMA_MODELS" = $MODELS_DIR
}
$psi0 = New-Object System.Diagnostics.ProcessStartInfo
$psi0.FileName = (Get-Command ollama).Source
$psi0.Arguments = "serve"
$psi0.UseShellExecute = $false
$psi0.CreateNoWindow = $true
$psi0.EnvironmentVariables["CUDA_VISIBLE_DEVICES"] = "0"
$psi0.EnvironmentVariables["OLLAMA_HOST"] = "0.0.0.0:$PORT0"
$psi0.EnvironmentVariables["OLLAMA_MODELS"] = $MODELS_DIR
$proc0 = [System.Diagnostics.Process]::Start($psi0)
Write-Host "    PID: $($proc0.Id)" -ForegroundColor White

# Instancia 1: GPU 1, porta 11435
Write-Host "  Iniciando GPU 1 (porta $PORT1)..." -ForegroundColor Cyan
$psi1 = New-Object System.Diagnostics.ProcessStartInfo
$psi1.FileName = (Get-Command ollama).Source
$psi1.Arguments = "serve"
$psi1.UseShellExecute = $false
$psi1.CreateNoWindow = $true
$psi1.EnvironmentVariables["CUDA_VISIBLE_DEVICES"] = "1"
$psi1.EnvironmentVariables["OLLAMA_HOST"] = "0.0.0.0:$PORT1"
$psi1.EnvironmentVariables["OLLAMA_MODELS"] = $MODELS_DIR
$proc1 = [System.Diagnostics.Process]::Start($psi1)
Write-Host "    PID: $($proc1.Id)" -ForegroundColor White

# Aguardar ambas instancias
Write-Host "  Aguardando inicializacao..." -ForegroundColor Cyan
$maxWait = 30

# Health check instancia 0
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$PORT0/api/tags" -Method Get -ErrorAction SilentlyContinue
        break
    } catch {
        Write-Host "." -NoNewline
    }
}
if ($waited -ge $maxWait) {
    Write-Host ""
    Write-Host "  X Timeout ao iniciar instancia GPU 0" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "  OK - GPU 0 rodando em http://localhost:$PORT0" -ForegroundColor Green

# Health check instancia 1
$waited = 0
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$PORT1/api/tags" -Method Get -ErrorAction SilentlyContinue
        break
    } catch {
        Write-Host "." -NoNewline
    }
}
if ($waited -ge $maxWait) {
    Write-Host ""
    Write-Host "  X Timeout ao iniciar instancia GPU 1" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "  OK - GPU 1 rodando em http://localhost:$PORT1" -ForegroundColor Green
Write-Host ""

# 5. VERIFICAR MODELO EM AMBAS

Write-Host "[5/5] Verificando modelo $MODEL..." -ForegroundColor Yellow

foreach ($port in @($PORT0, $PORT1)) {
    $models = Invoke-RestMethod -Uri "http://localhost:$port/api/tags" -Method Get
    $modelNames = $models.models | ForEach-Object { $_.name }
    $found = $modelNames | Where-Object { $_ -like "$MODEL*" }

    if (-not $found) {
        Write-Host "  Baixando $MODEL na porta $port..." -ForegroundColor Cyan
        $pullBody = @{ name = $MODEL } | ConvertTo-Json
        Invoke-RestMethod -Uri "http://localhost:$port/api/pull" -Method Post -Body $pullBody -ContentType "application/json" -TimeoutSec 600
    }
    Write-Host "  OK - Modelo disponivel em :$port" -ForegroundColor Green
}

# CONCLUSAO

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "         DUAL GPU OLLAMA - PRONTO!                             " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Instancia GPU 0: http://localhost:$PORT0 (RTX 5060 Ti)" -ForegroundColor White
Write-Host "  Instancia GPU 1: http://localhost:$PORT1 (RTX 4060)" -ForegroundColor White
Write-Host "  Modelo: $MODEL" -ForegroundColor White
Write-Host ""
Write-Host "  Para traduzir:" -ForegroundColor Cyan
Write-Host "    node scripts/dual-gpu-translate.mjs                  # Todos" -ForegroundColor White
Write-Host "    node scripts/dual-gpu-translate.mjs --testament=NT   # So NT" -ForegroundColor White
Write-Host "    node scripts/dual-gpu-translate.mjs --book=JUD       # Teste rapido" -ForegroundColor White
Write-Host ""
Write-Host "  Para parar:" -ForegroundColor Cyan
Write-Host "    .\scripts\stop-dual-ollama.ps1" -ForegroundColor White
Write-Host ""
