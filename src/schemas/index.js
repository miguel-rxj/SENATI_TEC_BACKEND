import { z } from 'zod';

// Mensajes de error de Zod en español
z.config(z.locales.es());

// ---------- Comunes ----------
export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

const sinCampos = (obj) => Object.keys(obj).length > 0;
const MSG_VACIO = 'Envía al menos un campo para actualizar';

// ---------- Auth ----------
// Nota: Zod ignora los campos que no están en el esquema, así que si alguien
// envía "rol": "admin" en el registro, simplemente se descarta.
export const registroSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().pipe(z.email('Email inválido')),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede superar 72 caracteres')
    .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra')
    .regex(/\d/, 'La contraseña debe incluir al menos un número'),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?\d{7,15}$/, 'Teléfono inválido (de 7 a 15 dígitos)')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Email inválido')),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// ---------- Categorías ----------
const categoriaBase = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
  descripcion: z.string().trim().max(500).nullable().optional(),
});

export const crearCategoriaSchema = categoriaBase;
export const editarCategoriaSchema = categoriaBase.partial().refine(sinCampos, MSG_VACIO);

// ---------- Productos ----------
// OJO: no usar .default() aquí; con .partial() pisaría datos al editar.
// Los valores por defecto (stock = 0, activo = true) los pone la base de datos.
const productoBase = z.object({
  categoria_id: z.number().int().positive(),
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(150),
  marca: z.string().trim().max(80).nullable().optional(),
  descripcion: z.string().trim().max(2000).nullable().optional(),
  precio: z.number().min(0, 'El precio no puede ser negativo').max(99999999.99),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').optional(),
  imagen_url: z.httpUrl('La imagen debe ser una URL http(s) válida').nullable().optional(),
  activo: z.boolean().optional(),
});

export const crearProductoSchema = productoBase;
export const editarProductoSchema = productoBase.partial().refine(sinCampos, MSG_VACIO);

export const listarProductosQuery = z.object({
  categoria: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(100).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------- Pedidos ----------
// El cliente envía SOLO qué quiere y cuántos. El precio y el total los calcula
// la base de datos, así nadie puede manipularlos desde el navegador.
export const crearPedidoSchema = z.object({
  direccion_envio: z
    .string()
    .trim()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(300, 'La dirección no puede superar 300 caracteres'),
  items: z
    .array(
      z.object({
        producto_id: z.number().int().positive(),
        cantidad: z.number().int().min(1, 'La cantidad mínima es 1').max(99, 'La cantidad máxima es 99'),
      })
    )
    .min(1, 'El pedido debe tener al menos un producto')
    .max(50, 'Un pedido no puede tener más de 50 productos distintos'),
});

// 'pendiente' no es un destino válido: es el estado con el que nace el pedido
export const cambiarEstadoSchema = z.object({
  estado: z.enum(['pagado', 'enviado', 'entregado', 'cancelado'], 'Estado inválido'),
});

export const listarPedidosQuery = z.object({
  estado: z.enum(['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado']).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});
