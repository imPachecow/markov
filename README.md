# Frontend - Sistema de Análisis de Riesgo Crediticio

Sistema completo integrado con backend incluido. **Ya no necesitas Python ni ejecutar servidores separados.**

## Inicio Rápido

### Solo un comando:

```bash
npm install
npm run dev
```

¡Eso es todo! El backend está integrado en Astro, así que todo funciona con un solo comando.

## Características

- **Backend integrado** - No necesitas Python ni servidores separados
- **Todo en TypeScript** - Código moderno y tipado
- **Un solo comando** - `npm run dev` y listo
- **Sin configuración** - Funciona inmediatamente

## Estructura

```
markov/
├── src/
│   ├── lib/
│   │   └── markov.ts          # Funciones de cálculo (backend integrado)
│   ├── pages/
│   │   ├── api/               # Endpoints API
│   │   │   ├── matriz.ts
│   │   │   ├── estacionario.ts
│   │   │   ├── perdidas.ts
│   │   │   ├── stress.ts
│   │   │   └── health.ts
│   │   └── index.astro        # Interfaz principal
│   └── layouts/
│       └── Layout.astro
```

## Uso

1. **Instala dependencias** (solo la primera vez):
   ```bash
   npm install
   ```

2. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

3. **Abre tu navegador** en la URL que te muestre (generalmente `http://localhost:4321`)

4. **¡Listo!** Ya puedes usar el sistema completo.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## Notas

- El backend está completamente integrado en TypeScript
- No necesitas Python, FastAPI, ni ningún servidor separado
- Todo funciona con un solo comando: `npm run dev`
- Los cálculos se realizan en el servidor de Astro usando TypeScript

## Solución de Problemas

**Error al instalar dependencias:**
- Asegúrate de tener Node.js 18+ instalado
- Ejecuta: `npm install` de nuevo

**El servidor no inicia:**
- Verifica que el puerto 4321 (o el que Astro asigne) esté disponible
- Cierra otros programas que puedan estar usando el puerto

**Error en los cálculos:**
- Recarga la página (F5)
- Verifica la consola del navegador (F12) para ver errores

---

**¡Disfruta del sistema! Todo funciona con un solo comando.**
