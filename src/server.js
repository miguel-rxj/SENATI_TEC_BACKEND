import 'dotenv/config';      // 1º: carga el .env antes que cualquier otro módulo
import './config/env.js';    // 2º: verifica que no falte ninguna variable
import app from './app.js';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}/api/health`);
});
