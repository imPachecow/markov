@echo off
chcp 65001 >nul
echo ========================================
echo INICIANDO BACKEND - MARKOV CREDIT RISK
echo ========================================
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar Python
python --version
if errorlevel 1 (
    echo.
    echo ERROR: Python no encontrado
    echo Por favor instala Python desde python.org
    pause
    exit /b 1
)

echo.
echo Instalando/verificando dependencias...
pip install fastapi uvicorn numpy pandas python-multipart pydantic --quiet

echo.
echo ========================================
echo INICIANDO SERVIDOR...
echo ========================================
echo.
echo El servidor estara disponible en: http://localhost:8000
echo Presiona Ctrl+C para detener el servidor
echo.

python main.py

pause

