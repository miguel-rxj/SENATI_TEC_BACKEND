import { Router } from 'express';
import { registro, login, perfil } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.js';
import { validar } from '../middlewares/validar.js';
import { registroSchema, loginSchema } from '../schemas/index.js';

const router = Router();

router.post('/registro', validar(registroSchema), registro);
router.post('/login', validar(loginSchema), login);
router.get('/perfil', verificarToken, perfil);

export default router;
