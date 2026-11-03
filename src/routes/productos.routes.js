import { Router } from 'express';
import * as ctrl from '../controllers/productos.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import {
  idParam,
  listarProductosQuery,
  crearProductoSchema,
  editarProductoSchema,
} from '../schemas/index.js';

const router = Router();
const admin = [verificarToken, soloRol('admin')];

// Público
router.get('/', validar(listarProductosQuery, 'query'), ctrl.listar);
router.get('/:id', validar(idParam, 'params'), ctrl.obtener);

// Solo admin
router.post('/', ...admin, validar(crearProductoSchema), ctrl.crear);
router.put('/:id', ...admin, validar(idParam, 'params'), validar(editarProductoSchema), ctrl.actualizar);
router.delete('/:id', ...admin, validar(idParam, 'params'), ctrl.eliminar);

export default router;
