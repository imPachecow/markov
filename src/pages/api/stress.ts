import type { APIRoute } from 'astro';
import { aplicarStress } from '../../lib/markov';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      matriz_base,
      estados,
      factor_moroso = 1.2,
      factor_incobrable = 1.3,
    } = body;

    if (!matriz_base || !estados) {
      return new Response(
        JSON.stringify({ error: 'Se requiere matriz_base y estados' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resultado = aplicarStress(
      matriz_base,
      estados,
      factor_moroso,
      factor_incobrable
    );
    resultado.estados = estados;

    return new Response(JSON.stringify(resultado), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error al aplicar stress' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

