"""
Script de verificación para diagnosticar problemas con el backend
"""

import sys
import subprocess

def verificar_python():
    """Verifica la versión de Python"""
    print("=" * 50)
    print("Verificando Python...")
    print("=" * 50)
    version = sys.version_info
    print(f"Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("ERROR: Se requiere Python 3.8 o superior")
        return False
    else:
        print("OK: Python version correcta")
        return True

def verificar_dependencias():
    """Verifica si las dependencias están instaladas"""
    print("\n" + "=" * 50)
    print("Verificando dependencias...")
    print("=" * 50)
    
    dependencias = [
        'fastapi',
        'uvicorn',
        'numpy',
        'pandas',
        'pydantic'
    ]
    
    faltantes = []
    for dep in dependencias:
        try:
            __import__(dep)
            print(f"OK: {dep} instalado")
        except ImportError:
            print(f"ERROR: {dep} NO instalado")
            faltantes.append(dep)
    
    if faltantes:
        print(f"\nATENCION: Faltan dependencias: {', '.join(faltantes)}")
        print("Ejecuta: pip install -r requirements.txt")
        return False
    else:
        print("\nOK: Todas las dependencias estan instaladas")
        return True

def verificar_puerto():
    """Verifica si el puerto 8000 está disponible"""
    print("\n" + "=" * 50)
    print("Verificando puerto 8000...")
    print("=" * 50)
    
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    resultado = sock.connect_ex(('localhost', 8000))
    sock.close()
    
    if resultado == 0:
        print("ATENCION: El puerto 8000 esta en uso")
        print("   Cierra el proceso que esta usando el puerto o cambia el puerto en main.py")
        return False
    else:
        print("OK: El puerto 8000 esta disponible")
        return True

def main():
    print("\n" + "=" * 50)
    print("DIAGNOSTICO DEL BACKEND")
    print("=" * 50 + "\n")
    
    python_ok = verificar_python()
    deps_ok = verificar_dependencias()
    puerto_ok = verificar_puerto()
    
    print("\n" + "=" * 50)
    print("RESUMEN")
    print("=" * 50)
    
    if python_ok and deps_ok and puerto_ok:
        print("OK: Todo esta correcto. Puedes ejecutar: python main.py")
        return 0
    else:
        print("ERROR: Hay problemas que deben resolverse antes de ejecutar el servidor")
        print("\nPasos recomendados:")
        if not python_ok:
            print("1. Instala Python 3.8 o superior desde python.org")
        if not deps_ok:
            print("2. Instala las dependencias: pip install -r requirements.txt")
        if not puerto_ok:
            print("3. Libera el puerto 8000 o cambia el puerto en main.py")
        return 1

if __name__ == "__main__":
    sys.exit(main())

