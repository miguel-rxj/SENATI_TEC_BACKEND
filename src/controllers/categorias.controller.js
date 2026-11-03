import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { lanzarSiError } from '../utils/supabaseError.js';

// GET /api/categorias
export async function listar(req, res) {
  const { data, error } = await supabase.from('categorias').select('*').order('nombre');
  lanzarSiError(error);
  res.json(data);
}

// GET /api/categorias/:id
export async function obtener(req, res) {
  const { id } = req.datos.params;
  const { data, error } = await supabase.from('categorias').select('*').eq('id', id).maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Categoría no encontrada');
  res.json(data);
}

// POST /api/categorias  (admin)
export async function crear(req, res) {
  const { data, error } = await supabase
    .from('categorias')
    .insert(req.datos.body)
    .select()
    .single();
  lanzarSiError(error);
  res.status(201).json(data);
}

// PUT /api/categorias/:id  (admin)
export async function actualizar(req, res) {
  const { id } = req.datos.params;
  const { data, error } = await supabase
    .from('categorias')
    .update(req.datos.body)
    .eq('id', id)
    .select()
    .maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Categoría no encontrada');
  res.json(data);
}

// DELETE /api/categorias/:id  (admin)
// Si la categoría tiene productos, la BD lo impide (ON DELETE RESTRICT) -> 409
export async function eliminar(req, res) {
  const { id } = req.datos.params;
  const { data, error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Categoría no encontrada');
  res.json({ mensaje: 'Categoría eliminada', categoria: data });
}
