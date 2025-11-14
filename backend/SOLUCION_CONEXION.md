# Solución: Backend Desconectado en la Web

## Problema
El servidor está corriendo en CMD pero el frontend muestra "Backend desconectado".

## Solución

### Paso 1: Detén el servidor actual
En la terminal donde está corriendo el servidor:
- Presiona `Ctrl+C` para detenerlo

### Paso 2: Reinicia el servidor con el código actualizado
```bash
python main.py
```

Ahora debería mostrar:
```
Servidor disponible en: http://localhost:8000
```

**IMPORTANTE:** El servidor ahora usa `127.0.0.1` en lugar de `0.0.0.0` para mejor compatibilidad.

### Paso 3: Verifica en el navegador
1. Abre tu navegador
2. Ve a: `http://localhost:8000/`
   - Deberías ver un JSON con información de la API
3. Ve a: `http://localhost:8000/health`
   - Deberías ver: `{"status":"ok","message":"Backend funcionando correctamente"}`

### Paso 4: Recarga el frontend
1. Abre el frontend en tu navegador
2. Presiona `F5` o `Ctrl+R` para recargar
3. El indicador debería cambiar a verde

## Si Aún No Funciona

### Verificar que el servidor está escuchando correctamente:
1. En el navegador, abre: `http://127.0.0.1:8000/`
2. Si funciona con `127.0.0.1` pero no con `localhost`, hay un problema de DNS local

### Verificar CORS:
El backend ya tiene CORS configurado para permitir todas las conexiones. Si hay problemas:
- Abre la consola del navegador (F12)
- Ve a la pestaña "Console" o "Consola"
- Busca errores relacionados con CORS

### Verificar el puerto:
- Asegúrate de que el servidor esté en el puerto 8000
- Verifica que no haya otro proceso usando el puerto

## Comandos Útiles

### Verificar que el servidor responde:
```bash
curl http://localhost:8000/
```

### Verificar el puerto:
```bash
netstat -ano | findstr :8000
```

### Matar un proceso en el puerto 8000 (si está ocupado):
```bash
# Encuentra el PID del proceso
netstat -ano | findstr :8000

# Mata el proceso (reemplaza PID con el número)
taskkill /PID <PID> /F
```

## Estado Esperado

Cuando todo funciona correctamente:
- El servidor muestra: "Uvicorn running on http://127.0.0.1:8000"
- `http://localhost:8000/` muestra un JSON
- `http://localhost:8000/health` muestra `{"status":"ok"}`
- El frontend muestra verde en el indicador
- Puedes procesar datos sin errores

