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

  // Errores lanzados a propósito por las funciones SQL (RAISE EXCEPTION).
  // Sus mensajes ya están escritos para el usuario: "Stock insuficiente para ..."
  if (error.code === 'P0001') throw new ApiError(409, error.message);
  if (error.code === 'P0002') throw new ApiError(404, error.message);

  const [status, mensaje] = MAPA[error.code] ?? [500, 'Error de base de datos'];
  if (status === 500) console.error('Supabase:', error);
  throw new ApiError(status, mensaje);
}
