# Ollama CUDA Setup Script - Biblia Belem An.C 2025
# Configura Ollama com aceleracao CUDA para traducao biblica

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       OLLAMA CUDA SETUP - BIBLIA BELEM An.C 2025              " -ForegroundColor Cyan
Write-Host "       Traducao literal rigida com IA local                     " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. VERIFICAR DRIVERS NVIDIA

Write-Host "[1/6] Verificando drivers NVIDIA..." -ForegroundColor Yellow

$nvidiaSmi = Get-Command nvidia-smi -ErrorAction SilentlyContinue
if (-not $nvidiaSmi) {
    Write-Host "  X NVIDIA drivers nao encontrados!" -ForegroundColor Red
    Write-Host "  Instale os drivers NVIDIA em: https://www.nvidia.com/drivers" -ForegroundColor Red
    exit 1
}

Write-Host "  OK - Drivers NVIDIA instalados" -ForegroundColor Green

# Exibir informacoes da GPU
Write-Host ""
Write-Host "  Informacoes da GPU:" -ForegroundColor Cyan
$gpuInfo = nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
if ($gpuInfo) {
    $parts = $gpuInfo -split ","
    Write-Host "    GPU:     $($parts[0].Trim())" -ForegroundColor White
    Write-Host "    VRAM:    $($parts[1].Trim())" -ForegroundColor White
    Write-Host "    Driver:  $($parts[2].Trim())" -ForegroundColor White
}
Write-Host ""

# 2. VERIFICAR/INSTALAR OLLAMA

Write-Host "[2/6] Verificando instalacao do Ollama..." -ForegroundColor Yellow

$ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaInstalled) {
    Write-Host "  ! Ollama nao encontrado. Instalando..." -ForegroundColor Yellow

    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Host "  Instalando via winget..." -ForegroundColor Cyan
        winget install Ollama.Ollama --accept-source-agreements --accept-package-agreements
    } else {
        Write-Host "  X winget nao disponivel. Instale manualmente:" -ForegroundColor Red
        Write-Host "    https://ollama.com/download/windows" -ForegroundColor Red
        exit 1
    }

    # Recarregar PATH
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = $machinePath + ";" + $userPath

    $ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue
    if (-not $ollamaInstalled) {
        Write-Host "  X Falha na instalacao. Reinicie o terminal e tente novamente." -ForegroundColor Red
        exit 1
    }
}

Write-Host "  OK - Ollama instalado" -ForegroundColor Green

# 3. INICIAR SERVICO OLLAMA

Write-Host "[3/6] Iniciando servico Ollama..." -ForegroundColor Yellow

$ollamaRunning = $false
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction SilentlyContinue
    $ollamaRunning = $true
} catch {
    $ollamaRunning = $false
}

if (-not $ollamaRunning) {
    Write-Host "  Iniciando Ollama em background..." -ForegroundColor Cyan
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden

    Write-Host "  Aguardando inicializacao..." -ForegroundColor Cyan
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction SilentlyContinue
            break
        } catch {
            Write-Host "." -NoNewline
        }
    }
    Write-Host ""

    if ($waited -ge $maxWait) {
        Write-Host "  X Timeout ao iniciar Ollama" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  OK - Ollama rodando em http://localhost:11434" -ForegroundColor Green

# 4. BAIXAR MODELO RECOMENDADO

Write-Host "[4/6] Verificando modelo qwen2.5:14b..." -ForegroundColor Yellow

$models = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
$modelNames = $models.models | ForEach-Object { $_.name }

$targetModel = "qwen2.5:14b"
$modelFound = $modelNames | Where-Object { $_ -like "$targetModel*" }

if (-not $modelFound) {
    Write-Host "  Baixando $targetModel (pode levar alguns minutos)..." -ForegroundColor Cyan
    Write-Host ""
    ollama pull $targetModel
    Write-Host ""
}

Write-Host "  OK - Modelo $targetModel disponivel" -ForegroundColor Green

# Listar modelos disponiveis
Write-Host ""
Write-Host "  Modelos instalados:" -ForegroundColor Cyan
$models = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
$models.models | ForEach-Object {
    $sizeGB = [math]::Round($_.size / 1GB, 2)
    Write-Host "    - $($_.name) ($sizeGB GB)" -ForegroundColor White
}
Write-Host ""

# 5. VERIFICAR CUDA ATIVO

Write-Host "[5/6] Verificando aceleracao CUDA..." -ForegroundColor Yellow

$testBody = @{
    model = $targetModel
    prompt = "Translate to Portuguese: hello"
    stream = $false
    options = @{
        num_predict = 10
    }
} | ConvertTo-Json

try {
    $gpuBefore = nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits

    $result = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $testBody -ContentType "application/json"

    $gpuAfter = nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits

    if ([int]$gpuAfter -gt [int]$gpuBefore) {
        Write-Host "  OK - CUDA ativo - GPU sendo utilizada" -ForegroundColor Green
    } else {
        Write-Host "  ! CUDA pode nao estar ativo. Verifique os logs do Ollama." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ! Erro ao testar CUDA: $_" -ForegroundColor Yellow
}

# 6. TESTE DE TRADUCAO

Write-Host "[6/6] Testando traducao..." -ForegroundColor Yellow

$testBody2 = @{
    model = $targetModel
    prompt = "Voce e um tradutor de grego koine para portugues. Traduza literalmente: logos, agape. Responda APENAS com JSON."
    stream = $false
    options = @{
        temperature = 0.1
    }
} | ConvertTo-Json -Depth 3

try {
    $result = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $testBody2 -ContentType "application/json"
    Write-Host "  Resultado do teste:" -ForegroundColor Cyan
    Write-Host "  $($result.response)" -ForegroundColor White
    Write-Host ""
    Write-Host "  OK - Teste concluido com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "  X Erro no teste: $_" -ForegroundColor Red
}

# CONCLUSAO

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                SETUP CONCLUIDO COM SUCESSO!                    " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Para traduzir:" -ForegroundColor Cyan
Write-Host "    node scripts/ollama-translate.mjs           # Todos os livros" -ForegroundColor White
Write-Host "    node scripts/ollama-translate.mjs GEN       # Genesis apenas" -ForegroundColor White
Write-Host "    node scripts/ollama-translate.mjs REV       # Apocalipse apenas" -ForegroundColor White
Write-Host ""
Write-Host "  Opcoes:" -ForegroundColor Cyan
Write-Host "    --model=llama3.2:8b    # Usar modelo diferente" -ForegroundColor White
Write-Host "    --batch-size=100       # Ajustar tamanho do batch" -ForegroundColor White
Write-Host ""
Write-Host "  Outros modelos recomendados:" -ForegroundColor Cyan
Write-Host "    ollama pull llama3.2:8b     # Mais rapido, menos VRAM" -ForegroundColor White
Write-Host "    ollama pull mistral:7b      # Alternativa leve" -ForegroundColor White
Write-Host ""
