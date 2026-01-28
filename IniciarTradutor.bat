@echo off
chcp 65001 >nul
title Biblia Tradutor - Ollama + CUDA

echo.
echo ================================================================
echo        BIBLIA BELEM An.C 2025 - TRADUTOR LOCAL
echo        Iniciando Ollama + Interface Web
echo ================================================================
echo.

:: Verificar se Ollama está instalado
where ollama >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Ollama nao encontrado!
    echo        Instale em: https://ollama.com/download/windows
    pause
    exit /b 1
)

:: Verificar se Ollama já está rodando
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Ollama ja esta rodando
) else (
    echo [INFO] Iniciando Ollama...
    start /B "" ollama serve >nul 2>&1

    :: Aguardar Ollama iniciar
    echo Aguardando inicializacao...
    :wait_ollama
    timeout /t 2 /nobreak >nul
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if %ERRORLEVEL% neq 0 goto wait_ollama
    echo [OK] Ollama iniciado com sucesso
)

echo.
echo [INFO] Iniciando interface web...
echo.

:: Iniciar o executável em background
start /B "" "%~dp0tradutor-web\dist\BibliaTradutor.exe"

:: Aguardar servidor iniciar
echo Aguardando servidor web...
:wait_server
timeout /t 1 /nobreak >nul
curl -s http://localhost:3333 >nul 2>&1
if %ERRORLEVEL% neq 0 goto wait_server

echo [OK] Servidor web iniciado
echo.

:: Abrir navegador
echo [INFO] Abrindo navegador...
start "" "http://localhost:3333"

echo.
echo ================================================================
echo   Interface disponivel em: http://localhost:3333
echo
echo   Pressione qualquer tecla para fechar esta janela.
echo   (O tradutor continuara rodando em segundo plano)
echo ================================================================
echo.

pause >nul
