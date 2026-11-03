import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

// 1) ¿Viene un token válido?  -> deja el usuario en req.usuario ({ id, rol })
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new ApiError(401, 'Token requerido');

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Token inválido o expirado');
  }
  next();
}

// 2) ¿Su rol tiene permiso?  Uso: soloRol('admin')  o  soloRol('cliente', 'admin')
export const soloRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario?.rol)) {
    throw new ApiError(403, 'No tienes permisos para esta acción');
  }
  next();
};
