import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { lanzarSiError } from '../utils/supabaseError.js';

// Nunca devolvemos password_hash al cliente
const CAMPOS_PUBLICOS = 'id, nombre, email, telefono, rol, creado_en';

const firmarToken = (usuario) =>
  jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  });

// POST /api/auth/registro
export async function registro(req, res) {
  const { nombre, email, password, telefono } = req.datos.body;
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('usuarios')
    // El rol se fija aquí, NUNCA se toma del body: todo registro público es "cliente"
    .insert({ nombre, email, password_hash, telefono, rol: 'cliente' })
    .select(CAMPOS_PUBLICOS)
    .single();

  if (error?.code === '23505') throw new ApiError(409, 'Ese email ya está registrado');
  lanzarSiError(error);

  res.status(201).json({ usuario: data, token: firmarToken(data) });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.datos.body;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select(`${CAMPOS_PUBLICOS}, password_hash`)
    .eq('email', email)
    .eq('activo', true)
    .maybeSingle();
  lanzarSiError(error);

  // Mismo mensaje si el email no existe o la clave falla (no revela cuál fue)
  const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
  if (!valido) throw new ApiError(401, 'Email o contraseña incorrectos');

  const { password_hash, ...publico } = usuario;
  res.json({ usuario: publico, token: firmarToken(usuario) });
}

// GET /api/auth/perfil  (requiere token)
export async function perfil(req, res) {
  const { data, error } = await supabase
    .from('usuarios')
    .select(CAMPOS_PUBLICOS)
    .eq('id', req.usuario.id)
    .eq('activo', true)
    .maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Usuario no encontrado');

  res.json(data);
}
