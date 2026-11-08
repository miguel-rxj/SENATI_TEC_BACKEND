// Detiene el servidor con un mensaje claro si falta algo en el .env
const requeridas = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'JWT_SECRET'];
const faltan = requeridas.filter((k) => !process.env[k]);

if (faltan.length) {
  console.error(`\n❌ Faltan variables en el archivo .env: ${faltan.join(', ')}`);
  console.error('   Copia .env.example a .env y completa los valores.\n');
  process.exit(1);
}

if (process.env.SUPABASE_SECRET_KEY.startsWith('sb_publishable_')) {
  console.error('\n❌ SUPABASE_SECRET_KEY contiene la clave PÚBLICA (sb_publishable_...).');
  console.error('   Usa la Secret key (sb_secret_...) de Settings → API Keys.\n');
  process.exit(1);
}
