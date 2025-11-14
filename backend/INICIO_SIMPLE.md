# Inicio Simple del Backend

## Método Más Fácil

1. **Abre una terminal** (PowerShell o CMD)

2. **Navega a la carpeta backend:**
   ```bash
   cd C:\Users\Alejandro\Desktop\MARKOV\backend
   ```

3. **Ejecuta el script simple:**
   ```bash
   iniciar.bat
   ```

   O si prefieres hacerlo manual:
   ```bash
   python main.py
   ```

## ¿Qué deberías ver?

Si todo funciona, verás algo como:
```
==================================================
Iniciando servidor de Análisis de Riesgo Crediticio
==================================================
Servidor disponible en: http://localhost:8000
Documentacion API: http://localhost:8000/docs
Health check: http://localhost:8000/health
==================================================
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Verificar que Funciona

1. **Deja la terminal abierta** (el servidor debe seguir corriendo)

2. **Abre tu navegador** y ve a:
   - `http://localhost:8000/health`
   - Deberías ver: `{"status":"ok","message":"Backend funcionando correctamente"}`

3. **Abre el frontend** en otra pestaña del navegador

4. **El indicador en el header debería estar verde**

## Si Hay Errores

### Error: "python no se reconoce"
- Python no está instalado o no está en el PATH
- Instala Python desde: https://www.python.org/downloads/
- Durante la instalación, marca "Add Python to PATH"

### Error: "No module named 'fastapi'"
- Ejecuta: `pip install fastapi uvicorn numpy pandas python-multipart pydantic`

### Error: "Address already in use"
- El puerto 8000 está ocupado
- Cierra otros programas que usen el puerto
- O cambia el puerto en `main.py` (línea 412)

### El servidor se cierra inmediatamente
- Revisa los mensajes de error en la terminal
- Comparte el mensaje de error completo

## Mantener el Servidor Corriendo

**IMPORTANTE:** El servidor debe seguir corriendo mientras uses el frontend.

- **NO cierres la terminal** donde está corriendo el servidor
- Si cierras la terminal, el servidor se detendrá
- Para detener el servidor, presiona `Ctrl+C` en la terminal

## Usar el Frontend

Una vez que el servidor esté corriendo:

1. Abre otra terminal
2. Ve a la carpeta `markov`
3. Ejecuta: `npm run dev`
4. Abre el navegador en la URL que te muestre (generalmente `http://localhost:4321`)

