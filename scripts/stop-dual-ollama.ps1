# Stop Dual GPU Ollama - Biblia Belem An.C 2025
# Encerra ambas instancias Ollama e libera VRAM
# Pode ser executado pelo agendador de tarefas (BibleBelemStop - diario 07:00)

Write-Host ""
Write-Host "Encerrando instancias Ollama..." -ForegroundColor Yellow

# Parar servico Ollama (requer admin, mas tenta)
try {
    Stop-Service -Name "Ollama" -Force -ErrorAction SilentlyContinue
    Write-Host "  Servico Ollama parado" -ForegroundColor Green
} catch {}

# Encerrar processos ollama e ollama_llama_server
$processes = Get-Process -Name "ollama*" -ErrorAction SilentlyContinue
$llama = Get-Process -Name "*llama_server*" -ErrorAction SilentlyContinue
$all = @()
if ($processes) { $all += $processes }
if ($llama) { $all += $llama }

if ($all.Count -gt 0) {
    $all | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    # Fallback: taskkill via cmd
    taskkill /F /IM ollama.exe 2>$null
    taskkill /F /IM ollama_llama_server.exe 2>$null
    Start-Sleep -Seconds 1
    Write-Host "  OK - $($all.Count) processo(s) encerrado(s)" -ForegroundColor Green
} else {
    Write-Host "  Nenhuma instancia Ollama ativa" -ForegroundColor Yellow
}

# Verificar VRAM liberada
Write-Host ""
Write-Host "Status das GPUs:" -ForegroundColor Cyan
try {
    $gpuInfo = nvidia-smi --query-gpu=index,name,memory.used,memory.total --format=csv,noheader,nounits
    foreach ($line in ($gpuInfo.Trim() -split "`n")) {
        $parts = $line -split ","
        $idx = $parts[0].Trim()
        $name = $parts[1].Trim()
        $used = $parts[2].Trim()
        $total = $parts[3].Trim()
        Write-Host "  GPU $idx : $name | VRAM usada: ${used}/${total} MiB" -ForegroundColor White
    }
} catch {
    Write-Host "  Nao foi possivel verificar GPUs" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Ollama encerrado." -ForegroundColor Green
Write-Host ""
