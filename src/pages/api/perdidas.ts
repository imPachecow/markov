import type { APIRoute } from 'astro';
import { calcularPerdidasEsperadas } from '../../lib/markov';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { matriz_transicion, estados, ead, lgd } = body;

    if (!matriz_transicion || !estados || !ead || !lgd) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resultado = calcularPerdidasEsperadas(
      matriz_transicion,
      estados,
      ead,
      lgd
    );

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error al calcular las pérdidas' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

