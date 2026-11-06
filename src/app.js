import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import productosRoutes from './routes/productos.routes.js';
import { notFound, errorHandler } from './middlewares/errores.js';

const app = express();

// Solo el frontend autorizado puede consumir la API desde el navegador
const origenes = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
  
app.use(cors({ origin: origenes }));
app.use(express.json({ limit: '1mb' }));

// Ruta de prueba: si responde, el servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ ok: true, servicio: 'SENATI TEC API', fecha: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);

app.use(notFound);      // siempre después de las rutas
app.use(errorHandler);  // siempre al final

export default app;
