from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from collections import Counter
try:
    from scipy import linalg
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False

app = FastAPI(
    title="Markov Credit Risk API",
    description="API para análisis de riesgo crediticio con Cadenas de Markov",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransicionRequest(BaseModel):
    registros: List[List[str]]


class StressRequest(BaseModel):
    matriz_base: List[List[float]]
    estados: List[str]
    factor_moroso: Optional[float] = 1.2
    factor_incobrable: Optional[float] = 1.3


class PerdidasRequest(BaseModel):
    matriz_transicion: List[List[float]]
    estados: List[str]
    ead: Dict[str, float]
    lgd: Dict[str, float]


def estimar_matriz_transicion(registros: List[List[str]]) -> Dict:
    if not registros or len(registros[0]) != 2:
        raise ValueError("Los registros deben ser pares [origen, destino]")
    
    estados = sorted(set([item for sublist in registros for item in sublist]))
    n_estados = len(estados)
    
    estado_idx = {estado: i for i, estado in enumerate(estados)}
    
    matriz_conteo = np.zeros((n_estados, n_estados))
    
    for origen, destino in registros:
        i = estado_idx[origen]
        j = estado_idx[destino]
        matriz_conteo[i, j] += 1
    
    matriz_transicion = np.zeros((n_estados, n_estados))
    for i in range(n_estados):
        total_fila = matriz_conteo[i].sum()
        if total_fila > 0:
            matriz_transicion[i] = matriz_conteo[i] / total_fila
        else:
            matriz_transicion[i, i] = 1.0
    
    estadisticas = {
        "total_transiciones": len(registros),
        "conteo_por_estado": {
            estado: int(matriz_conteo[estado_idx[estado]].sum())
            for estado in estados
        }
    }
    
    # Calcular propiedades de álgebra lineal
    try:
        propiedades_algebra = calcular_propiedades_algebra_lineal(matriz_transicion)
    except Exception as e:
        print(f"Error calculando propiedades de álgebra: {e}")
        propiedades_algebra = {"error": str(e)}
    
    # Análisis de propiedades de Markov
    try:
        propiedades_markov = analizar_propiedades_markov(matriz_transicion, estados)
    except Exception as e:
        print(f"Error analizando propiedades de Markov: {e}")
        propiedades_markov = {"error": str(e)}
    
    # Clasificación de estados
    try:
        clasificacion_estados = clasificar_estados(matriz_transicion, estados)
    except Exception as e:
        print(f"Error clasificando estados: {e}")
        clasificacion_estados = {"error": str(e)}
    
    return {
        "estados": estados,
        "matriz_transicion": matriz_transicion.tolist(),
        "matriz_conteo": matriz_conteo.astype(int).tolist(),
        "estadisticas": estadisticas,
        "propiedades_algebra": propiedades_algebra,
        "propiedades_markov": propiedades_markov,
        "clasificacion_estados": clasificacion_estados
    }


def calcular_vector_estacionario(matriz_transicion: np.ndarray, tolerancia: float = 1e-10, max_iter: int = 1000) -> Dict:
    T = np.array(matriz_transicion)
    n = T.shape[0]
    
    pi_actual = np.ones(n) / n
    
    for iteracion in range(max_iter):
        pi_siguiente = pi_actual @ T
        
        if np.linalg.norm(pi_siguiente - pi_actual) < tolerancia:
            return {
                "vector_estacionario": pi_siguiente.tolist(),
                "iteraciones": iteracion + 1,
                "convergio": True
            }
        
        pi_actual = pi_siguiente
    
    eigenvalores, eigenvectores = np.linalg.eig(T.T)
    idx = np.argmax(np.real(eigenvalores))
    pi_eigen = np.real(eigenvectores[:, idx])
    pi_eigen = pi_eigen / pi_eigen.sum()
    
    return {
        "vector_estacionario": pi_eigen.tolist(),
        "iteraciones": max_iter,
        "convergio": False,
        "metodo": "autovectores"
    }


def calcular_perdidas_esperadas(
    matriz_transicion: List[List[float]],
    estados: List[str],
    ead: Dict[str, float],
    lgd: Dict[str, float]
) -> Dict:
    T = np.array(matriz_transicion)
    n = len(estados)
    
    estado_default = None
    for estado in ["Incobrable", "Default", "Perdida"]:
        if estado in estados:
            estado_default = estado
            break
    
    if estado_default is None:
        estado_default = estados[-1]
    
    idx_default = estados.index(estado_default)
    
    pd_por_estado = {}
    for i, estado in enumerate(estados):
        pd_por_estado[estado] = float(T[i, idx_default])
    
    perdidas_por_estado = {}
    for estado in estados:
        ead_valor = ead.get(estado, 0.0)
        lgd_valor = lgd.get(estado, 0.0)
        pd_valor = pd_por_estado[estado]
        
        perdidas_por_estado[estado] = {
            "EAD": ead_valor,
            "PD": pd_valor,
            "LGD": lgd_valor,
            "EL": ead_valor * pd_valor * lgd_valor
        }
    
    perdida_total = sum([p["EL"] for p in perdidas_por_estado.values()])
    
    return {
        "perdidas_por_estado": perdidas_por_estado,
        "perdida_total": perdida_total,
        "estado_default": estado_default
    }


def calcular_propiedades_algebra_lineal(matriz: np.ndarray) -> Dict:
    """Calcula propiedades de álgebra lineal de la matriz de transición"""
    T = np.array(matriz)
    n = T.shape[0]
    
    propiedades = {}
    
    # Determinante
    try:
        propiedades["determinante"] = float(np.linalg.det(T))
    except:
        propiedades["determinante"] = None
    
    # Traza
    propiedades["traza"] = float(np.trace(T))
    
    # Valores propios (eigenvalues) y vectores propios (eigenvectors)
    try:
        eigenvalores, eigenvectores = np.linalg.eig(T)
        # Ordenar por valor absoluto descendente
        idx = np.argsort(np.abs(eigenvalores))[::-1]
        eigenvalores = eigenvalores[idx]
        eigenvectores = eigenvectores[:, idx]
        
        propiedades["eigenvalores"] = {
            "valores": eigenvalores.tolist(),
            "valores_reales": np.real(eigenvalores).tolist(),
            "valores_imaginarios": np.imag(eigenvalores).tolist(),
            "modulos": np.abs(eigenvalores).tolist(),
            "dominante": float(eigenvalores[0]) if len(eigenvalores) > 0 else None
        }
        
        propiedades["eigenvectores"] = {
            "vectores": np.real(eigenvectores).tolist(),
            "vector_dominante": np.real(eigenvectores[:, 0]).tolist() if eigenvectores.shape[1] > 0 else None
        }
    except Exception as e:
        propiedades["eigenvalores"] = {"error": str(e)}
        propiedades["eigenvectores"] = {"error": str(e)}
    
    # Rango
    try:
        propiedades["rango"] = int(np.linalg.matrix_rank(T))
    except:
        propiedades["rango"] = None
    
    # Normas
    propiedades["normas"] = {
        "frobenius": float(np.linalg.norm(T, 'fro')),
        "espectral": float(np.linalg.norm(T, 2)) if n > 0 else None,
        "infinito": float(np.linalg.norm(T, np.inf)),
        "uno": float(np.linalg.norm(T, 1))
    }
    
    # Número de condición
    try:
        propiedades["numero_condicion"] = float(np.linalg.cond(T))
    except:
        propiedades["numero_condicion"] = None
    
    # Descomposición SVD
    try:
        U, s, Vt = np.linalg.svd(T)
        propiedades["svd"] = {
            "valores_singulares": s.tolist(),
            "valor_singular_maximo": float(s[0]) if len(s) > 0 else None,
            "valor_singular_minimo": float(s[-1]) if len(s) > 0 else None
        }
    except Exception as e:
        propiedades["svd"] = {"error": str(e)}
    
    # Potencias de la matriz (T^2, T^3, T^5, T^10)
    try:
        T2 = np.linalg.matrix_power(T, 2)
        T3 = np.linalg.matrix_power(T, 3)
        T5 = np.linalg.matrix_power(T, 5)
        T10 = np.linalg.matrix_power(T, 10)
        
        propiedades["potencias"] = {
            "T2": T2.tolist(),
            "T3": T3.tolist(),
            "T5": T5.tolist(),
            "T10": T10.tolist()
        }
    except Exception as e:
        propiedades["potencias"] = {"error": str(e)}
    
    return propiedades


def analizar_propiedades_markov(matriz: np.ndarray, estados: List[str]) -> Dict:
    """Analiza propiedades específicas de cadenas de Markov"""
    T = np.array(matriz)
    n = T.shape[0]
    
    propiedades = {}
    
    # Verificar si es estocástica (cada fila suma 1)
    sumas_filas = T.sum(axis=1)
    propiedades["es_estocastica"] = bool(np.allclose(sumas_filas, 1.0, atol=1e-6))
    propiedades["sumas_filas"] = sumas_filas.tolist()
    propiedades["desviacion_estocastica"] = float(np.max(np.abs(sumas_filas - 1.0)))
    
    # Verificar si es doblemente estocástica (filas y columnas suman 1)
    sumas_columnas = T.sum(axis=0)
    propiedades["es_doblemente_estocastica"] = bool(
        np.allclose(sumas_filas, 1.0, atol=1e-6) and 
        np.allclose(sumas_columnas, 1.0, atol=1e-6)
    )
    
    # Verificar si es irreducible (todos los estados se comunican)
    # Usar el grafo de comunicación
    comunicacion = np.zeros((n, n), dtype=bool)
    T_bool = T > 1e-10  # Considerar transiciones no nulas
    
    # Inicializar: cada estado se comunica consigo mismo
    for i in range(n):
        comunicacion[i, i] = True
    
    # Búsqueda de caminos (algoritmo de Warshall simplificado)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if T_bool[i, k] and T_bool[k, j]:
                    T_bool[i, j] = True
                    comunicacion[i, j] = True
    
    propiedades["es_irreducible"] = bool(np.all(comunicacion))
    propiedades["matriz_comunicacion"] = comunicacion.tolist()
    
    # Verificar periodicidad
    # Un estado es periódico si el máximo común divisor de los tiempos de retorno es > 1
    periodos = []
    for i in range(n):
        tiempos_retorno = []
        # Buscar ciclos simples
        if T[i, i] > 1e-10:
            tiempos_retorno.append(1)
        # Buscar ciclos de longitud 2
        for j in range(n):
            if i != j and T[i, j] > 1e-10 and T[j, i] > 1e-10:
                tiempos_retorno.append(2)
        # Buscar ciclos de longitud 3
        for j in range(n):
            for k in range(n):
                if i != j and j != k and k != i:
                    if T[i, j] > 1e-10 and T[j, k] > 1e-10 and T[k, i] > 1e-10:
                        tiempos_retorno.append(3)
        
        if tiempos_retorno:
            from math import gcd
            from functools import reduce
            periodo = reduce(gcd, tiempos_retorno) if len(tiempos_retorno) > 1 else tiempos_retorno[0]
        else:
            periodo = 0
        periodos.append(periodo)
    
    propiedades["periodos_estados"] = periodos
    propiedades["es_aperiodica"] = bool(all(p == 1 or p == 0 for p in periodos))
    
    # Verificar si es ergódica (irreducible y aperiódica)
    propiedades["es_ergodica"] = propiedades["es_irreducible"] and propiedades["es_aperiodica"]
    
    # Estados absorbentes (probabilidad de quedarse = 1)
    estados_absorbentes = []
    for i in range(n):
        if T[i, i] >= 1.0 - 1e-6:
            estados_absorbentes.append(i)
    propiedades["estados_absorbentes"] = [estados[i] for i in estados_absorbentes]
    propiedades["tiene_estados_absorbentes"] = len(estados_absorbentes) > 0
    
    return propiedades


def clasificar_estados(matriz: np.ndarray, estados: List[str]) -> Dict:
    """Clasifica los estados de la cadena de Markov"""
    T = np.array(matriz)
    n = T.shape[0]
    
    clasificacion = {}
    
    # Estados absorbentes
    absorbentes = []
    for i in range(n):
        if T[i, i] >= 1.0 - 1e-6:
            absorbentes.append({
                "indice": i,
                "estado": estados[i],
                "probabilidad_absorcion": float(T[i, i])
            })
    clasificacion["absorbentes"] = absorbentes
    
    # Estados transitorios (no absorbentes que pueden llegar a absorbentes)
    transitorios = []
    recurrentes = []
    
    # Calcular probabilidades de absorción
    for i in range(n):
        if i not in [a["indice"] for a in absorbentes]:
            # Verificar si puede llegar a un estado absorbente
            puede_absorber = False
            for abs_idx in [a["indice"] for a in absorbentes]:
                # Búsqueda de caminos
                visitados = set()
                cola = [i]
                while cola:
                    actual = cola.pop(0)
                    if actual == abs_idx:
                        puede_absorber = True
                        break
                    if actual in visitados:
                        continue
                    visitados.add(actual)
                    for j in range(n):
                        if T[actual, j] > 1e-10 and j not in visitados:
                            cola.append(j)
            
            if puede_absorber:
                transitorios.append({
                    "indice": i,
                    "estado": estados[i]
                })
            else:
                recurrentes.append({
                    "indice": i,
                    "estado": estados[i]
                })
    
    clasificacion["transitorios"] = transitorios
    clasificacion["recurrentes"] = recurrentes
    
    # Tiempo medio de absorción (para estados transitorios)
    if absorbentes and transitorios:
        try:
            # Construir matriz Q (transitorios a transitorios)
            indices_transitorios = [t["indice"] for t in transitorios]
            Q = T[np.ix_(indices_transitorios, indices_transitorios)]
            I = np.eye(len(indices_transitorios))
            N = np.linalg.inv(I - Q)  # Matriz fundamental
            tiempos_absorcion = N.sum(axis=1)
            
            for idx, t in enumerate(transitorios):
                t["tiempo_medio_absorcion"] = float(tiempos_absorcion[idx])
        except:
            pass
    
    return clasificacion


def aplicar_stress(
    matriz_base: List[List[float]],
    estados: List[str],
    factor_moroso: float = 1.2,
    factor_incobrable: float = 1.3
) -> Dict:
    T = np.array(matriz_base)
    n = len(estados)
    
    idx_moroso = None
    idx_incobrable = None
    
    for i, estado in enumerate(estados):
        if "Moroso" in estado or "moroso" in estado.lower():
            idx_moroso = i
        if "Incobrable" in estado or "incobrable" in estado.lower() or "Default" in estado:
            idx_incobrable = i
    
    T_stress = T.copy()
    
    for i in range(n):
        if idx_moroso is not None:
            T_stress[i, idx_moroso] *= factor_moroso
        if idx_incobrable is not None:
            T_stress[i, idx_incobrable] *= factor_incobrable
        
        suma_fila = T_stress[i].sum()
        if suma_fila > 0:
            T_stress[i] = T_stress[i] / suma_fila
    
    pi_base = calcular_vector_estacionario(T)["vector_estacionario"]
    pi_stress = calcular_vector_estacionario(T_stress)["vector_estacionario"]
    
    return {
        "matriz_stress": T_stress.tolist(),
        "vector_estacionario_base": pi_base,
        "vector_estacionario_stress": pi_stress,
        "cambios": {
            "factor_moroso": factor_moroso,
            "factor_incobrable": factor_incobrable
        }
    }


@app.get("/")
def root():
    return {
        "mensaje": "API de Análisis de Riesgo Crediticio con Cadenas de Markov",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "/matriz": "POST - Estimar matriz de transición",
            "/estacionario": "POST - Calcular vector estacionario",
            "/perdidas": "POST - Calcular pérdidas esperadas",
            "/stress": "POST - Aplicar escenarios de stress"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "Backend funcionando correctamente"
    }


@app.post("/matriz")
def estimar_matriz(request: TransicionRequest):
    try:
        resultado = estimar_matriz_transicion(request.registros)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/estacionario")
def calcular_estacionario(request: Dict):
    try:
        matriz = np.array(request["matriz_transicion"])
        resultado = calcular_vector_estacionario(matriz)
        resultado["estados"] = request.get("estados", [])
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/perdidas")
def calcular_perdidas(request: PerdidasRequest):
    try:
        resultado = calcular_perdidas_esperadas(
            request.matriz_transicion,
            request.estados,
            request.ead,
            request.lgd
        )
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/stress")
def aplicar_stress_scenario(request: StressRequest):
    try:
        resultado = aplicar_stress(
            request.matriz_base,
            request.estados,
            request.factor_moroso,
            request.factor_incobrable
        )
        resultado["estados"] = request.estados
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("Iniciando servidor de Análisis de Riesgo Crediticio")
    print("=" * 50)
    print(f"Servidor disponible en: http://localhost:8000")
    print(f"Documentacion API: http://localhost:8000/docs")
    print(f"Health check: http://localhost:8000/health")
    print("=" * 50)
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

