import { ApiError } from './ApiError.js';

// Traduce los códigos de error de PostgreSQL a respuestas HTTP claras.
const MAPA = {
  '23505': [409, 'Ya existe un registro con ese valor (dato duplicado)'],
  '23503': [409, 'Operación no permitida por una relación entre tablas (la referencia no existe o hay registros asociados)'],
  '23514': [400, 'Un valor no cumple las reglas de la base de datos'],
  '23502': [400, 'Falta un campo obligatorio'],
  '22P02': [400, 'Formato de dato inválido'],
  'PGRST103': [400, 'La página solicitada no existe'],
};

export function lanzarSiError(error) {
  if (!error) return;
  const [status, mensaje] = MAPA[error.code] ?? [500, 'Error de base de datos'];
  if (status === 500) console.error('Supabase:', error);
  throw new ApiError(status, mensaje);
}
