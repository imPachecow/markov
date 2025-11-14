export interface Transicion {
  origen: string;
  destino: string;
}

export interface MatrizResultado {
  estados: string[];
  matriz_transicion: number[][];
  matriz_conteo: number[][];
  estadisticas: {
    total_transiciones: number;
    conteo_por_estado: Record<string, number>;
  };
}

export interface VectorEstacionario {
  vector_estacionario: number[];
  iteraciones: number;
  convergio: boolean;
  metodo?: string;
}

export interface PerdidasResultado {
  perdidas_por_estado: Record<string, {
    EAD: number;
    PD: number;
    LGD: number;
    EL: number;
  }>;
  perdida_total: number;
  estado_default: string;
}

export interface StressResultado {
  matriz_stress: number[][];
  vector_estacionario_base: number[];
  vector_estacionario_stress: number[];
  cambios: {
    factor_moroso: number;
    factor_incobrable: number;
  };
}

export function estimarMatrizTransicion(registros: string[][]): MatrizResultado {
  if (!registros || registros.length === 0 || registros[0].length !== 2) {
    throw new Error("Los registros deben ser pares [origen, destino]");
  }

  const estadosSet = new Set<string>();
  registros.forEach(([origen, destino]) => {
    estadosSet.add(origen);
    estadosSet.add(destino);
  });
  const estados = Array.from(estadosSet).sort();
  const nEstados = estados.length;

  const estadoIdx: Record<string, number> = {};
  estados.forEach((estado, i) => {
    estadoIdx[estado] = i;
  });

  const matrizConteo: number[][] = Array(nEstados)
    .fill(0)
    .map(() => Array(nEstados).fill(0));

  registros.forEach(([origen, destino]) => {
    const i = estadoIdx[origen];
    const j = estadoIdx[destino];
    matrizConteo[i][j] += 1;
  });

  const matrizTransicion: number[][] = Array(nEstados)
    .fill(0)
    .map(() => Array(nEstados).fill(0));

  for (let i = 0; i < nEstados; i++) {
    const totalFila = matrizConteo[i].reduce((sum, val) => sum + val, 0);
    if (totalFila > 0) {
      for (let j = 0; j < nEstados; j++) {
        matrizTransicion[i][j] = matrizConteo[i][j] / totalFila;
      }
    } else {
      matrizTransicion[i][i] = 1.0;
    }
  }

  const conteoPorEstado: Record<string, number> = {};
  estados.forEach((estado) => {
    const idx = estadoIdx[estado];
    conteoPorEstado[estado] = matrizConteo[idx].reduce((sum, val) => sum + val, 0);
  });

  return {
    estados,
    matriz_transicion: matrizTransicion,
    matriz_conteo: matrizConteo,
    estadisticas: {
      total_transiciones: registros.length,
      conteo_por_estado: conteoPorEstado,
    },
  };
}

export function calcularVectorEstacionario(
  matrizTransicion: number[][],
  tolerancia: number = 1e-10,
  maxIter: number = 1000
): VectorEstacionario {
  const n = matrizTransicion.length;
  let piActual = Array(n).fill(1 / n);

  for (let iteracion = 0; iteracion < maxIter; iteracion++) {
    const piSiguiente = multiplicarVectorMatriz(piActual, matrizTransicion);
    const diferencia = calcularNorma(restarVectores(piSiguiente, piActual));
    if (diferencia < tolerancia) {
      return {
        vector_estacionario: piSiguiente,
        iteraciones: iteracion + 1,
        convergio: true,
      };
    }

    piActual = piSiguiente;
  }

  const suma = piActual.reduce((sum, val) => sum + val, 0);
  const piNormalizado = piActual.map((val) => val / suma);

  return {
    vector_estacionario: piNormalizado,
    iteraciones: maxIter,
    convergio: false,
    metodo: "normalizacion",
  };
}

export function calcularPerdidasEsperadas(
  matrizTransicion: number[][],
  estados: string[],
  ead: Record<string, number>,
  lgd: Record<string, number>
): PerdidasResultado {
  const n = estados.length;

  let estadoDefault: string | null = null;
  for (const estado of ["Incobrable", "Default", "Perdida"]) {
    if (estados.includes(estado)) {
      estadoDefault = estado;
      break;
    }
  }

  if (!estadoDefault) {
    estadoDefault = estados[estados.length - 1];
  }

  const idxDefault = estados.indexOf(estadoDefault);

  const pdPorEstado: Record<string, number> = {};
  estados.forEach((estado, i) => {
    pdPorEstado[estado] = matrizTransicion[i][idxDefault];
  });

  const perdidasPorEstado: Record<string, {
    EAD: number;
    PD: number;
    LGD: number;
    EL: number;
  }> = {};

  estados.forEach((estado) => {
    const eadValor = ead[estado] || 0;
    const lgdValor = lgd[estado] || 0;
    const pdValor = pdPorEstado[estado] || 0;

    perdidasPorEstado[estado] = {
      EAD: eadValor,
      PD: pdValor,
      LGD: lgdValor,
      EL: eadValor * pdValor * lgdValor,
    };
  });

  const perdidaTotal = Object.values(perdidasPorEstado).reduce(
    (sum, p) => sum + p.EL,
    0
  );

  return {
    perdidas_por_estado: perdidasPorEstado,
    perdida_total: perdidaTotal,
    estado_default: estadoDefault,
  };
}

export function aplicarStress(
  matrizBase: number[][],
  estados: string[],
  factorMoroso: number = 1.2,
  factorIncobrable: number = 1.3
): StressResultado {
  const n = estados.length;
  const matrizStress = matrizBase.map((fila) => [...fila]);

  let idxMoroso: number | null = null;
  let idxIncobrable: number | null = null;

  estados.forEach((estado, i) => {
    if (estado.toLowerCase().includes("moroso")) {
      idxMoroso = i;
    }
    if (
      estado.toLowerCase().includes("incobrable") ||
      estado.toLowerCase().includes("default")
    ) {
      idxIncobrable = i;
    }
  });

  for (let i = 0; i < n; i++) {
    if (idxMoroso !== null) {
      matrizStress[i][idxMoroso] *= factorMoroso;
    }
    if (idxIncobrable !== null) {
      matrizStress[i][idxIncobrable] *= factorIncobrable;
    }

    const sumaFila = matrizStress[i].reduce((sum, val) => sum + val, 0);
    if (sumaFila > 0) {
      matrizStress[i] = matrizStress[i].map((val) => val / sumaFila);
    }
  }

  const piBase = calcularVectorEstacionario(matrizBase).vector_estacionario;
  const piStress = calcularVectorEstacionario(matrizStress).vector_estacionario;

  return {
    matriz_stress: matrizStress,
    vector_estacionario_base: piBase,
    vector_estacionario_stress: piStress,
    cambios: {
      factor_moroso: factorMoroso,
      factor_incobrable: factorIncobrable,
    },
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

function restarVectores(a: number[], b: number[]): number[] {
  return a.map((val, i) => val - b[i]);
}

function calcularNorma(vector: number[]): number {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

