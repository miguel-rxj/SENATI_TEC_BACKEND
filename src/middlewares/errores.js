import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Middleware global: TODA respuesta de error sale como { error: "mensaje" }
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado es inválido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
