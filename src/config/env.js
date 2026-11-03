// Detiene el servidor con un mensaje claro si falta algo en el .env
const requeridas = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'JWT_SECRET'];
const faltan = requeridas.filter((k) => !process.env[k]);

if (faltan.length) {
  console.error(`\n❌ Faltan variables en el archivo .env: ${faltan.join(', ')}`);
  console.error('   Copia .env.example a .env y completa los valores.\n');
  process.exit(1);
}
