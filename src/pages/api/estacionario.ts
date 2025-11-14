import type { APIRoute } from 'astro';
import { calcularVectorEstacionario } from '../../lib/markov';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { matriz_transicion, estados } = body;

    if (!matriz_transicion || !Array.isArray(matriz_transicion)) {
      return new Response(
        JSON.stringify({ error: 'Se requiere una matriz de transición' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resultado = calcularVectorEstacionario(matriz_transicion);
    resultado.estados = estados || [];

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error al calcular el vector estacionario' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

