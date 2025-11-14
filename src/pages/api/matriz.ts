import type { APIRoute } from 'astro';
import { estimarMatrizTransicion } from '../../lib/markov';

export const prerender = false;

function calcularDeterminante(matriz: number[][]): number {
  const n = matriz.length;
  if (n === 1) return matriz[0][0];
  if (n === 2) {
    return matriz[0][0] * matriz[1][1] - matriz[0][1] * matriz[1][0];
  }
  
  let det = 0;
  for (let j = 0; j < n; j++) {
    const menor: number[][] = [];
    for (let i = 1; i < n; i++) {
      menor.push(matriz[i].filter((_, idx) => idx !== j));
    }
    det += matriz[0][j] * Math.pow(-1, j) * calcularDeterminante(menor);
  }
  return det;
}

function calcularTraza(matriz: number[][]): number {
  return matriz.reduce((sum, fila, i) => sum + (fila[i] || 0), 0);
}

function calcularRango(matriz: number[][]): number {
  const n = matriz.length;
  const m = matriz[0].length;
  const copia = matriz.map(fila => [...fila]);
  let rango = 0;
  const minDim = Math.min(n, m);
  
  for (let col = 0; col < minDim; col++) {
    let filaPivote = rango;
    while (filaPivote < n && Math.abs(copia[filaPivote][col]) < 1e-10) {
      filaPivote++;
    }
    
    if (filaPivote < n) {
      if (filaPivote !== rango) {
        [copia[rango], copia[filaPivote]] = [copia[filaPivote], copia[rango]];
      }
      
      const pivote = copia[rango][col];
      for (let i = rango + 1; i < n; i++) {
        const factor = copia[i][col] / pivote;
        for (let j = col; j < m; j++) {
          copia[i][j] -= factor * copia[rango][j];
        }
      }
      rango++;
    }
  }
  
  return rango;
}

function calcularNormaFrobenius(matriz: number[][]): number {
  let sum = 0;
  for (let i = 0; i < matriz.length; i++) {
    for (let j = 0; j < matriz[i].length; j++) {
      sum += matriz[i][j] * matriz[i][j];
    }
  }
  return Math.sqrt(sum);
}

function calcularNormaInfinito(matriz: number[][]): number {
  let max = 0;
  for (let i = 0; i < matriz.length; i++) {
    const sumaFila = matriz[i].reduce((sum, val) => sum + Math.abs(val), 0);
    if (sumaFila > max) max = sumaFila;
  }
  return max;
}

function calcularNormaUno(matriz: number[][]): number {
  let max = 0;
  const n = matriz.length;
  const m = matriz[0].length;
  for (let j = 0; j < m; j++) {
    let sumaCol = 0;
    for (let i = 0; i < n; i++) {
      sumaCol += Math.abs(matriz[i][j]);
    }
    if (sumaCol > max) max = sumaCol;
  }
  return max;
}

function multiplicarMatrices(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const m = B[0].length;
  const p = B.length;
  const resultado: number[][] = Array(n).fill(0).map(() => Array(m).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < p; k++) {
        resultado[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return resultado;
}

function potenciaMatriz(matriz: number[][], exponente: number): number[][] {
  if (exponente === 0) {
    const n = matriz.length;
    const identidad: number[][] = Array(n).fill(0).map((_, i) => 
      Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
    );
    return identidad;
  }
  if (exponente === 1) return matriz.map(fila => [...fila]);
  
  let resultado = matriz.map(fila => [...fila]);
  for (let i = 1; i < exponente; i++) {
    resultado = multiplicarMatrices(resultado, matriz);
  }
  return resultado;
}

function calcularEigenvalores(matriz: number[][]): { valores: number[], valores_reales: number[], valores_imaginarios: number[], modulos: number[], dominante: number } {
  const n = matriz.length;
  const eigenvalores: number[] = [];
  
  if (n === 1) {
    eigenvalores.push(matriz[0][0]);
  } else if (n === 2) {
    const a = matriz[0][0];
    const b = matriz[0][1];
    const c = matriz[1][0];
    const d = matriz[1][1];
    const traza = a + d;
    const det = a * d - b * c;
    const discriminante = traza * traza - 4 * det;
    
    if (discriminante >= 0) {
      const sqrtDisc = Math.sqrt(discriminante);
      eigenvalores.push((traza + sqrtDisc) / 2);
      eigenvalores.push((traza - sqrtDisc) / 2);
    } else {
      const real = traza / 2;
      const imag = Math.sqrt(-discriminante) / 2;
      eigenvalores.push(real, real);
    }
  } else {
    let vector = Array(n).fill(1 / Math.sqrt(n));
    for (let iter = 0; iter < 100; iter++) {
      const nuevoVector = multiplicarVectorMatriz(vector, matriz);
      const norma = Math.sqrt(nuevoVector.reduce((sum, val) => sum + val * val, 0));
      if (norma < 1e-10) break;
      nuevoVector.forEach((val, i) => vector[i] = val / norma);
    }
    const eigenvalorDominante = multiplicarVectorMatriz(vector, matriz).reduce((sum, val, i) => sum + val * vector[i], 0);
    eigenvalores.push(eigenvalorDominante);
    
    const traza = calcularTraza(matriz);
    const det = calcularDeterminante(matriz);
    if (n === 3) {
      const sumaOtros = traza - eigenvalorDominante;
      const productoOtros = det / eigenvalorDominante;
      const disc = sumaOtros * sumaOtros - 4 * productoOtros;
      if (disc >= 0) {
        const sqrtDisc = Math.sqrt(disc);
        eigenvalores.push((sumaOtros + sqrtDisc) / 2);
        eigenvalores.push((sumaOtros - sqrtDisc) / 2);
      } else {
        const real = sumaOtros / 2;
        eigenvalores.push(real, real);
      }
    } else {
      const resto = (traza - eigenvalorDominante) / (n - 1);
      for (let i = 1; i < n; i++) {
        eigenvalores.push(resto);
      }
    }
  }
  
  const valores_reales = eigenvalores.map(v => typeof v === 'number' ? v : 0);
  const valores_imaginarios = Array(n).fill(0);
  const modulos = valores_reales.map(v => Math.abs(v));
  
  const indices = Array.from({ length: n }, (_, i) => i);
  indices.sort((a, b) => modulos[b] - modulos[a]);
  
  return {
    valores: indices.map(i => valores_reales[i]),
    valores_reales: indices.map(i => valores_reales[i]),
    valores_imaginarios: indices.map(i => valores_imaginarios[i]),
    modulos: indices.map(i => modulos[i]),
    dominante: modulos[indices[0]] || 0
  };
}

function multiplicarVectorMatriz(vector: number[], matriz: number[][]): number[] {
  const n = matriz[0].length;
  const resultado = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < vector.length; i++) {
      resultado[j] += vector[i] * matriz[i][j];
    }
  }
  return resultado;
}

function calcularNumeroCondicion(matriz: number[][]): number {
  try {
    const det = calcularDeterminante(matriz);
    if (Math.abs(det) < 1e-10) return Infinity;
    
    const norma = calcularNormaInfinito(matriz);
    return norma * norma;
  } catch {
    return Infinity;
  }
}

function calcularSVD(matriz: number[][]): { valores_singulares: number[], valor_singular_maximo: number, valor_singular_minimo: number } {
  const n = matriz.length;
  const m = matriz[0].length;
  
  const ATA: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < n; k++) {
        ATA[i][j] += matriz[k][i] * matriz[k][j];
      }
    }
  }
  
  const eigenvalores = calcularEigenvalores(ATA);
  const valoresSingulares = eigenvalores.valores_reales
    .filter(v => v > 0)
    .map(v => Math.sqrt(v))
    .sort((a, b) => b - a);
  
  return {
    valores_singulares: valoresSingulares,
    valor_singular_maximo: valoresSingulares[0] || 0,
    valor_singular_minimo: valoresSingulares[valoresSingulares.length - 1] || 0
  };
}

function calcularPropiedadesAlgebraLineal(matriz: number[][]): any {
  try {
    const propiedades: any = {};
    
    try {
      propiedades.determinante = calcularDeterminante(matriz);
    } catch {
      propiedades.determinante = null;
    }
    
    propiedades.traza = calcularTraza(matriz);
    
    try {
      const eigen = calcularEigenvalores(matriz);
      propiedades.eigenvalores = eigen;
      propiedades.eigenvectores = {
        vectores: [],
        vector_dominante: null
      };
    } catch (e: any) {
      propiedades.eigenvalores = { error: String(e) };
      propiedades.eigenvectores = { error: String(e) };
    }
    
    try {
      propiedades.rango = calcularRango(matriz);
    } catch {
      propiedades.rango = null;
    }
    
    propiedades.normas = {
      frobenius: calcularNormaFrobenius(matriz),
      espectral: propiedades.eigenvalores?.modulos?.[0] || null,
      infinito: calcularNormaInfinito(matriz),
      uno: calcularNormaUno(matriz)
    };
    
    try {
      propiedades.numero_condicion = calcularNumeroCondicion(matriz);
    } catch {
      propiedades.numero_condicion = null;
    }
    
    try {
      propiedades.svd = calcularSVD(matriz);
    } catch (e: any) {
      propiedades.svd = { error: String(e) };
    }
    
    try {
      propiedades.potencias = {
        T2: potenciaMatriz(matriz, 2),
        T3: potenciaMatriz(matriz, 3),
        T5: potenciaMatriz(matriz, 5),
        T10: potenciaMatriz(matriz, 10)
      };
    } catch (e: any) {
      propiedades.potencias = { error: String(e) };
    }
    
    return propiedades;
  } catch (e: any) {
    return { error: String(e) };
  }
}

function analizarPropiedadesMarkov(matriz: number[][], estados: string[]): any {
  const n = matriz.length;
  const propiedades: any = {};
  
  const sumasFilas = matriz.map(fila => fila.reduce((sum, val) => sum + val, 0));
  propiedades.es_estocastica = sumasFilas.every(sum => Math.abs(sum - 1.0) < 1e-6);
  propiedades.sumas_filas = sumasFilas;
  propiedades.desviacion_estocastica = Math.max(...sumasFilas.map(sum => Math.abs(sum - 1.0)));
  
  const sumasColumnas = Array(n).fill(0).map((_, j) => 
    matriz.reduce((sum, fila) => sum + fila[j], 0)
  );
  propiedades.es_doblemente_estocastica = 
    propiedades.es_estocastica && 
    sumasColumnas.every(sum => Math.abs(sum - 1.0) < 1e-6);
  
  const comunicacion: boolean[][] = Array(n).fill(false).map(() => Array(n).fill(false));
  const T_bool = matriz.map(fila => fila.map(val => val > 1e-10));
  
  for (let i = 0; i < n; i++) {
    comunicacion[i][i] = true;
  }
  
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (T_bool[i][k] && T_bool[k][j]) {
          T_bool[i][j] = true;
          comunicacion[i][j] = true;
        }
      }
    }
  }
  
  propiedades.es_irreducible = comunicacion.every(fila => fila.every(val => val));
  propiedades.matriz_comunicacion = comunicacion;
  
  const periodos: number[] = [];
  for (let i = 0; i < n; i++) {
    const tiemposRetorno: number[] = [];
    if (matriz[i][i] > 1e-10) tiemposRetorno.push(1);
    
    for (let j = 0; j < n; j++) {
      if (i !== j && matriz[i][j] > 1e-10 && matriz[j][i] > 1e-10) {
        tiemposRetorno.push(2);
      }
    }
    
    if (tiemposRetorno.length > 0) {
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const periodo = tiemposRetorno.reduce((a, b) => gcd(a, b));
      periodos.push(periodo);
    } else {
      periodos.push(0);
    }
  }
  
  propiedades.periodos_estados = periodos;
  propiedades.es_aperiodica = periodos.every(p => p === 1 || p === 0);
  propiedades.es_ergodica = propiedades.es_irreducible && propiedades.es_aperiodica;
  
  const estadosAbsorbentes: string[] = [];
  for (let i = 0; i < n; i++) {
    if (matriz[i][i] >= 1.0 - 1e-6) {
      estadosAbsorbentes.push(estados[i]);
    }
  }
  propiedades.estados_absorbentes = estadosAbsorbentes;
  propiedades.tiene_estados_absorbentes = estadosAbsorbentes.length > 0;
  
  return propiedades;
}

function clasificarEstados(matriz: number[][], estados: string[]): any {
  const n = matriz.length;
  const clasificacion: any = {
    absorbentes: [],
    transitorios: [],
    recurrentes: []
  };
  
  for (let i = 0; i < n; i++) {
    if (matriz[i][i] >= 1.0 - 1e-6) {
      clasificacion.absorbentes.push({
        indice: i,
        estado: estados[i],
        probabilidad_absorcion: matriz[i][i]
      });
    }
  }
  
  const indicesAbsorbentes = new Set(clasificacion.absorbentes.map((a: any) => a.indice));
  
  for (let i = 0; i < n; i++) {
    if (!indicesAbsorbentes.has(i)) {
      let puedeAbsorber = false;
      const visitados = new Set<number>();
      const cola = [i];
      
      while (cola.length > 0) {
        const actual = cola.shift()!;
        if (indicesAbsorbentes.has(actual)) {
          puedeAbsorber = true;
          break;
        }
        if (visitados.has(actual)) continue;
        visitados.add(actual);
        
        for (let j = 0; j < n; j++) {
          if (matriz[actual][j] > 1e-10 && !visitados.has(j)) {
            cola.push(j);
          }
        }
      }
      
      if (puedeAbsorber) {
        clasificacion.transitorios.push({
          indice: i,
          estado: estados[i]
        });
      } else {
        clasificacion.recurrentes.push({
          indice: i,
          estado: estados[i]
        });
      }
    }
  }
  
  if (clasificacion.absorbentes.length > 0 && clasificacion.transitorios.length > 0) {
    try {
      const indicesTransitorios = clasificacion.transitorios.map((t: any) => t.indice);
      const Q: number[][] = indicesTransitorios.map((i: number) => 
        indicesTransitorios.map((j: number) => matriz[i][j])
      );
      const I: number[][] = Q.map((_, i) => 
        Q.map((_, j) => i === j ? 1 : 0)
      );
      
      const N = Q.map((fila, i) => 
        fila.map((val, j) => i === j ? 1 - val : -val)
      );
      
      const tiempos = N.map(fila => 
        fila.reduce((sum, val) => sum + Math.abs(val), 0)
      );
      
      clasificacion.transitorios.forEach((t: any, idx: number) => {
        t.tiempo_medio_absorcion = tiempos[idx] || 0;
      });
    } catch (e) {
    }
  }
  
  return clasificacion;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let registros: string[][] = [];
    
    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData();
        const registrosJson = formData.get('registros');
        
        if (registrosJson) {
          const jsonString = typeof registrosJson === 'string' ? registrosJson : registrosJson.toString();
          registros = JSON.parse(jsonString);
        }
      } catch (formError: any) {
        return new Response(
          JSON.stringify({ error: `Error al leer FormData: ${formError.message}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      try {
        const body = await request.json();
        registros = body.registros || [];
      } catch (jsonError) {
        try {
          const bodyText = await request.text();
          if (bodyText && bodyText.length > 0) {
            const parsed = JSON.parse(bodyText);
            registros = parsed.registros || [];
          }
        } catch (textError: any) {
          return new Response(
            JSON.stringify({ error: `No se pudo leer el body: ${textError.message}` }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    if (!registros || !Array.isArray(registros)) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un array de registros' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (registros.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El array de registros está vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const registroInvalido = registros.find((r: any) => !Array.isArray(r) || r.length !== 2);
    if (registroInvalido) {
      return new Response(
        JSON.stringify({ error: `Registro inválido encontrado: ${JSON.stringify(registroInvalido)}. Cada registro debe ser un array [origen, destino]` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resultado = estimarMatrizTransicion(registros);
    
    let propiedades_algebra;
    try {
      propiedades_algebra = calcularPropiedadesAlgebraLineal(resultado.matriz_transicion);
    } catch (e: any) {
      propiedades_algebra = { error: String(e) };
    }
    
    let propiedades_markov;
    try {
      propiedades_markov = analizarPropiedadesMarkov(resultado.matriz_transicion, resultado.estados);
    } catch (e: any) {
      propiedades_markov = { error: String(e) };
    }
    
    let clasificacion_estados;
    try {
      clasificacion_estados = clasificarEstados(resultado.matriz_transicion, resultado.estados);
    } catch (e: any) {
      clasificacion_estados = { error: String(e) };
    }
    
    const resultadoCompleto = {
      ...resultado,
      propiedades_algebra,
      propiedades_markov,
      clasificacion_estados
    };

    return new Response(JSON.stringify(resultadoCompleto), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error al procesar la solicitud' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
