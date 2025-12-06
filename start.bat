@echo off
REM Script de inicialização do ambiente N2 DevOps para Windows
REM Autor: Equipe N2 DevOps

echo 🚀 Iniciando ambiente N2 DevOps...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker primeiro.
    pause
    exit /b 1
)

REM Verificar se Docker Compose está disponível
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não encontrado. Por favor, instale o Docker Compose.
    pause
    exit /b 1
)

echo ✅ Docker e Docker Compose detectados

REM Subir ambiente
echo 📦 Subindo containers...
docker-compose up -d

REM Aguardar inicialização
echo ⏳ Aguardando inicialização dos serviços...
timeout /t 30 /nobreak >nul

REM Verificar status
echo 🔍 Verificando status dos serviços...
docker-compose ps

echo.
echo 🎉 Ambiente N2 DevOps iniciado com sucesso!
echo.
echo 📋 URLs de acesso:
echo    🌐 Gitea (Git):        http://localhost:3001
echo    🔄 Drone CI (CI/CD):   http://localhost:3002
echo    📦 Registry (Images):  http://localhost:5000
echo    🖥️  Registry UI:       http://localhost:5001
echo    🚀 API Application:    http://localhost:3000
echo.
echo 📚 Próximos passos:
echo    1. Configure o Gitea em: http://localhost:3001
echo    2. Crie o OAuth App para Drone CI
echo    3. Ative o repositório no Drone: http://localhost:3002
echo    4. Faça um push para testar o pipeline
echo.
echo 📖 Veja o README.md para instruções detalhadas
echo.
pause