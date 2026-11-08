import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { lanzarSiError } from '../utils/supabaseError.js';

// Pedido + sus líneas (con nombre e imagen del producto)
const CON_DETALLE =
  '*, detalle_pedido(id, producto_id, cantidad, precio_unitario, productos(id, nombre, imagen_url))';
// Lo mismo + datos del cliente (para el admin)
const CON_CLIENTE = `${CON_DETALLE}, usuarios(id, nombre, email, telefono)`;

async function buscarPedido(id, campos) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(campos)
    .eq('id', id)
    .order('id', { referencedTable: 'detalle_pedido' })
    .maybeSingle();
  lanzarSiError(error);
  return data;
}

// POST /api/pedidos  (cliente autenticado)
// Body: { direccion_envio, items: [{ producto_id, cantidad }] }
// Todo el trabajo (validar stock, guardar, descontar) ocurre en UNA transacción SQL.
export async function crear(req, res) {
  const { direccion_envio, items } = req.datos.body;

  const { data: pedidoId, error } = await supabase.rpc('crear_pedido', {
    p_usuario_id: req.usuario.id, // sale del token, NUNCA del body
    p_direccion: direccion_envio,
    p_items: items,
  });
  lanzarSiError(error); // sin stock / producto no disponible -> 409 con mensaje claro

  res.status(201).json(await buscarPedido(pedidoId, CON_DETALLE));
}

// GET /api/pedidos/mis-pedidos  (cualquier usuario autenticado: solo ve los suyos)
export async function misPedidos(req, res) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(CON_DETALLE)
    .eq('usuario_id', req.usuario.id)
    .order('creado_en', { ascending: false })
    .order('id', { referencedTable: 'detalle_pedido' });
  lanzarSiError(error);
  res.json(data);
}

// GET /api/pedidos?estado=pendiente&pagina=1&limite=20  (admin)
export async function listar(req, res) {
  const { estado, pagina, limite } = req.datos.query;
  const desde = (pagina - 1) * limite;

  let consulta = supabase
    .from('pedidos')
    .select(CON_CLIENTE, { count: 'exact' })
    .order('creado_en', { ascending: false })
    .order('id', { referencedTable: 'detalle_pedido' })
    .range(desde, desde + limite - 1);

  if (estado) consulta = consulta.eq('estado', estado);

  const { data, count, error } = await consulta;
  lanzarSiError(error);

  res.json({ datos: data, total: count, pagina, limite, paginas: Math.ceil(count / limite) });
}

// GET /api/pedidos/:id  (el dueño del pedido o un admin)
export async function obtener(req, res) {
  const pedido = await buscarPedido(req.datos.params.id, CON_CLIENTE);

  // Si el pedido es de otra persona respondemos 404 (no revelamos que existe)
  const esDueno = pedido?.usuario_id === req.usuario.id;
  if (!pedido || (req.usuario.rol !== 'admin' && !esDueno)) {
    throw new ApiError(404, 'Pedido no encontrado');
  }
  res.json(pedido);
}

// PUT /api/pedidos/:id/estado  (admin)   Body: { estado }
// Flujo: pendiente -> pagado -> enviado -> entregado   (cancelado devuelve el stock)
export async function cambiarEstado(req, res) {
  const { id } = req.datos.params;
  const { estado } = req.datos.body;

  const { error } = await supabase.rpc('cambiar_estado_pedido', {
    p_pedido_id: id,
    p_estado: estado,
  });
  lanzarSiError(error); // pedido inexistente -> 404 | transición inválida -> 409

  res.json(await buscarPedido(id, CON_CLIENTE));
}
