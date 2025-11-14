@echo off
echo ========================================
echo Iniciando Backend - Markov Credit Risk
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor, instala Python 3.8 o superior desde python.org
    pause
    exit /b 1
)

echo Python encontrado:
python --version
echo.

REM Verificar si el entorno virtual existe
if not exist "venv\Scripts\activate.bat" (
    echo Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: No se pudo crear el entorno virtual
        pause
        exit /b 1
    )
    echo.
)

REM Activar entorno virtual
echo Activando entorno virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: No se pudo activar el entorno virtual
    pause
    exit /b 1
)

REM Verificar si las dependencias están instaladas
echo Verificando dependencias...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias
        echo Intenta ejecutar manualmente: pip install -r requirements.txt
        pause
        exit /b 1
    )
    echo.
)

REM Ejecutar script de verificación
echo Ejecutando verificaciones...
python verificar.py
if errorlevel 1 (
    echo.
    echo Hay problemas que deben resolverse antes de continuar.
    pause
    exit /b 1
)

REM Iniciar el servidor
echo.
echo ========================================
echo Iniciando servidor...
echo ========================================
echo.
python main.py

if errorlevel 1 (
    echo.
    echo ERROR: El servidor no pudo iniciarse
    echo Revisa los mensajes de error arriba
    pause
    exit /b 1
)

pause

