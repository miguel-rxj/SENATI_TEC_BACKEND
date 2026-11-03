import { Router } from 'express';
import * as ctrl from '../controllers/categorias.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { idParam, crearCategoriaSchema, editarCategoriaSchema } from '../schemas/index.js';

const router = Router();
const admin = [verificarToken, soloRol('admin')];

// Público
router.get('/', ctrl.listar);
router.get('/:id', validar(idParam, 'params'), ctrl.obtener);

// Solo admin
router.post('/', ...admin, validar(crearCategoriaSchema), ctrl.crear);
router.put('/:id', ...admin, validar(idParam, 'params'), validar(editarCategoriaSchema), ctrl.actualizar);
router.delete('/:id', ...admin, validar(idParam, 'params'), ctrl.eliminar);

export default router;
