# Instrucciones para Ejecutar el Backend

Si tienes problemas ejecutando `main.py`, sigue estos pasos:

## Paso 1: Verificar Python

Abre una terminal y ejecuta:
```bash
python --version
```

Debe mostrar Python 3.8 o superior. Si no:
- Descarga Python desde: https://www.python.org/downloads/
- Durante la instalación, marca la opción "Add Python to PATH"

## Paso 2: Crear Entorno Virtual

```bash
cd backend
python -m venv venv
```

## Paso 3: Activar Entorno Virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

Deberías ver `(venv)` al inicio de tu prompt.

## Paso 4: Instalar Dependencias

```bash
pip install -r requirements.txt
```

Si hay errores, intenta:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## Paso 5: Verificar Instalación

Ejecuta el script de diagnóstico:
```bash
python verificar.py
```

Este script te dirá si hay algún problema.

## Paso 6: Ejecutar el Servidor

**Opción A: Usar el script automático**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**Opción B: Ejecutar manualmente**
```bash
python main.py
```

## Problemas Comunes

### Error: "python no se reconoce como comando"
- Python no está en el PATH
- Usa `py` en lugar de `python` (Windows)
- O reinstala Python marcando "Add to PATH"

### Error: "No module named 'fastapi'"
- El entorno virtual no está activado
- Las dependencias no están instaladas
- Ejecuta: `pip install -r requirements.txt`

### Error: "Address already in use"
- El puerto 8000 está en uso
- Cierra otros programas que usen el puerto
- O cambia el puerto en `main.py` (línea 412)

### Error: "Permission denied"
- En Linux/Mac, puede necesitar permisos
- Usa: `chmod +x start.sh`

## Verificar que Funciona

1. Deberías ver mensajes como:
   ```
   ==================================================
   Iniciando servidor de Análisis de Riesgo Crediticio
   ==================================================
   Servidor disponible en: http://localhost:8000
   ```

2. Abre en tu navegador: `http://localhost:8000/health`
   - Deberías ver: `{"status":"ok","message":"Backend funcionando correctamente"}`

3. Si ves el mensaje anterior, el backend está funcionando correctamente.

## Obtener Ayuda

Si sigues teniendo problemas:
1. Ejecuta `python verificar.py` y comparte el resultado
2. Comparte el mensaje de error completo
3. Verifica que Python y pip estén correctamente instalados

