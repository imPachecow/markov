"""
Script de prueba simple para verificar que el servidor puede iniciarse
"""

print("=" * 50)
print("PRUEBA DEL SERVIDOR")
print("=" * 50)

try:
    print("\n1. Importando módulos...")
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    print("   OK: Módulos importados correctamente")
    
    print("\n2. Creando aplicación FastAPI...")
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("   OK: Aplicación creada")
    
    @app.get("/test")
    def test():
        return {"status": "ok", "message": "Servidor funcionando"}
    
    print("\n3. Iniciando servidor de prueba...")
    print("   El servidor se iniciará en http://localhost:8000")
    print("   Presiona Ctrl+C para detener")
    print("\n" + "=" * 50)
    
    uvicorn.run(app, host="127.0.0.1", port=8000)
    
except ImportError as e:
    print(f"\nERROR: Falta un módulo: {e}")
    print("Ejecuta: pip install fastapi uvicorn")
    input("\nPresiona Enter para salir...")
    
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
    input("\nPresiona Enter para salir...")

