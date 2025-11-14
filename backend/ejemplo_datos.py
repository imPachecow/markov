"""
Archivo de ejemplo con datos sintéticos para probar el sistema.
Puedes usar estos datos directamente en la interfaz web o en las pruebas de la API.
"""

# Ejemplo 1: Datos históricos de transiciones
# Simula 1000 transiciones mensuales de clientes entre estados

EJEMPLO_REGISTROS = [
    # Clientes que se mantienen sanos (90% de los sanos)
    ["Sano", "Sano"] * 900,
    
    # Clientes que pasan de Sano a Moroso (8% de los sanos)
    ["Sano", "Moroso"] * 80,
    
    # Clientes que pasan directamente de Sano a Incobrable (2% de los sanos)
    ["Sano", "Incobrable"] * 20,
    
    # Clientes morosos que se mantienen morosos (70% de los morosos)
    ["Moroso", "Moroso"] * 70,
    
    # Clientes morosos que pasan a Incobrable (20% de los morosos)
    ["Moroso", "Incobrable"] * 20,
    
    # Clientes morosos que se recuperan (10% de los morosos)
    ["Moroso", "Sano"] * 10,
    
    # Clientes incobrables se mantienen incobrables (estado absorbente)
    ["Incobrable", "Incobrable"] * 100,
]

# Ejemplo 2: Matriz de transición predefinida
EJEMPLO_MATRIZ = [
    [0.90, 0.08, 0.02],  # Desde Sano
    [0.10, 0.70, 0.20],  # Desde Moroso
    [0.00, 0.00, 1.00],  # Desde Incobrable (absorbente)
]

EJEMPLO_ESTADOS = ["Sano", "Moroso", "Incobrable"]

# Ejemplo 3: Parámetros para cálculo de pérdidas
EJEMPLO_EAD = {
    "Sano": 1000.0,      # Exposición promedio de clientes sanos
    "Moroso": 5000.0,    # Exposición promedio de clientes morosos (mayor riesgo)
    "Incobrable": 0.0    # Ya no hay exposición (ya está en default)
}

EJEMPLO_LGD = {
    "Sano": 0.0,         # No hay pérdida si está sano
    "Moroso": 0.3,       # 30% de pérdida si está moroso
    "Incobrable": 0.5    # 50% de pérdida si es incobrable
}

# Ejemplo 4: Factores de stress
EJEMPLO_FACTOR_MOROSO = 1.2        # Aumento del 20% en transiciones a Moroso
EJEMPLO_FACTOR_INCOBRABLE = 1.3    # Aumento del 30% en transiciones a Incobrable


# Función para generar JSON listo para usar en la API
def generar_json_ejemplo():
    """Genera un JSON con todos los ejemplos listos para usar"""
    return {
        "registros": EJEMPLO_REGISTROS,
        "matriz_transicion": EJEMPLO_MATRIZ,
        "estados": EJEMPLO_ESTADOS,
        "ead": EJEMPLO_EAD,
        "lgd": EJEMPLO_LGD,
        "factores_stress": {
            "factor_moroso": EJEMPLO_FACTOR_MOROSO,
            "factor_incobrable": EJEMPLO_FACTOR_INCOBRABLE
        }
    }


if __name__ == "__main__":
    import json
    print("Ejemplo de datos para usar en la API:")
    print(json.dumps(generar_json_ejemplo(), indent=2, ensure_ascii=False))

