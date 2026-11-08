import { Router } from 'express';
import * as ctrl from '../controllers/pedidos.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import {
  idParam,
  crearPedidoSchema,
  cambiarEstadoSchema,
  listarPedidosQuery,
} from '../schemas/index.js';

const router = Router();

// Todas las rutas de pedidos exigen sesión iniciada
router.use(verificarToken);

// Cualquier usuario autenticado (cliente o admin) puede comprar y ver lo suyo
router.post('/', validar(crearPedidoSchema), ctrl.crear);
router.get('/mis-pedidos', ctrl.misPedidos); // OJO: va ANTES de '/:id'

// Solo admin
router.get('/', soloRol('admin'), validar(listarPedidosQuery, 'query'), ctrl.listar);
router.put(
  '/:id/estado',
  soloRol('admin'),
  validar(idParam, 'params'),
  validar(cambiarEstadoSchema),
  ctrl.cambiarEstado
);

// Dueño o admin (lo decide el controlador)
router.get('/:id', validar(idParam, 'params'), ctrl.obtener);

export default router;
