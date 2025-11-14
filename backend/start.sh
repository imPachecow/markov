#!/bin/bash

echo "========================================"
echo "Iniciando Backend - Markov Credit Risk"
echo "========================================"
echo ""

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
    echo ""
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source venv/bin/activate

# Verificar si las dependencias están instaladas
echo "Verificando dependencias..."
if ! pip show fastapi > /dev/null 2>&1; then
    echo "Instalando dependencias..."
    pip install -r requirements.txt
    echo ""
fi

# Iniciar el servidor
echo ""
echo "========================================"
echo "Iniciando servidor..."
echo "========================================"
echo ""
python main.py

