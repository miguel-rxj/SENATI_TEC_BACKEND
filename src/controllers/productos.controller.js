import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { lanzarSiError } from '../utils/supabaseError.js';

// Trae también el nombre de la categoría (JOIN automático por la clave foránea)
const CON_CATEGORIA = '*, categorias(id, nombre)';

// GET /api/productos?categoria=1&q=lenovo&pagina=1&limite=20
export async function listar(req, res) {
  const { categoria, q, pagina, limite } = req.datos.query;
  const desde = (pagina - 1) * limite;

  let consulta = supabase
    .from('productos')
    .select(CON_CATEGORIA, { count: 'exact' })
    .eq('activo', true)
    .order('nombre')
    .range(desde, desde + limite - 1);

  if (categoria) consulta = consulta.eq('categoria_id', categoria);

  if (q) {
    // Quitamos caracteres que tienen significado especial en los filtros de PostgREST
    const texto = q.replace(/[,()%*\\]/g, ' ').trim();
    if (texto) consulta = consulta.or(`nombre.ilike.%${texto}%,marca.ilike.%${texto}%`);
  }

  const { data, count, error } = await consulta;
  lanzarSiError(error);

  res.json({
    datos: data,
    total: count,
    pagina,
    limite,
    paginas: Math.ceil(count / limite),
  });
}

// GET /api/productos/:id
export async function obtener(req, res) {
  const { id } = req.datos.params;
  const { data, error } = await supabase
    .from('productos')
    .select(CON_CATEGORIA)
    .eq('id', id)
    .eq('activo', true)
    .maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Producto no encontrado');
  res.json(data);
}

// POST /api/productos  (admin)
export async function crear(req, res) {
  const { data, error } = await supabase
    .from('productos')
    .insert(req.datos.body)
    .select(CON_CATEGORIA)
    .single();
  lanzarSiError(error); // categoria_id inexistente -> 409
  res.status(201).json(data);
}

// PUT /api/productos/:id  (admin)  -> acepta cambios parciales
export async function actualizar(req, res) {
  const { id } = req.datos.params;
  const { data, error } = await supabase
    .from('productos')
    .update(req.datos.body)
    .eq('id', id)
    .select(CON_CATEGORIA)
    .maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Producto no encontrado');
  res.json(data);
}

// DELETE /api/productos/:id  (admin)
// Borrado lógico: se desactiva para no romper pedidos históricos.
// Para reactivarlo: PUT con { "activo": true }
export async function eliminar(req, res) {
  const { id } = req.datos.params;
  const { data, error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  lanzarSiError(error);
  if (!data) throw new ApiError(404, 'Producto no encontrado');
  res.json({ mensaje: 'Producto desactivado', id: data.id });
}
