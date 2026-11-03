# SENATI TEC - Backend (API REST)

API de la tienda virtual de tecnología. Node.js + Express + Supabase (PostgreSQL).

## Puesta en marcha

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
# edita .env con tus claves de Supabase y un JWT_SECRET propio
npm run dev
```

Comprueba que funciona abriendo http://localhost:3000/api/health

## Probar los endpoints

Abre `pruebas.http` en VS Code con la extensión **REST Client** y pulsa *Send Request*.
También sirve Postman o Thunder Client con las mismas URLs.

## Endpoints y roles

| Método | Ruta | Acceso |
|---|---|---|
| GET | /api/health | público |
| POST | /api/auth/registro, /api/auth/login | público |
| GET | /api/auth/perfil | usuario autenticado |
| GET | /api/categorias, /api/categorias/:id | público |
| POST, PUT, DELETE | /api/categorias | admin |
| GET | /api/productos (?categoria=&q=&pagina=&limite=), /api/productos/:id | público |
| POST, PUT, DELETE | /api/productos | admin |

## Estructura

```
src/
├── config/        env.js, supabase.js
├── controllers/   lógica de cada recurso
├── middlewares/   auth (JWT + roles), validar (Zod), errores
├── routes/        rutas de cada recurso
├── schemas/       reglas de validación (Zod)
├── utils/         ApiError, traducción de errores de PostgreSQL
├── app.js         configuración de Express
└── server.js      arranque
```

## Seguridad

- `.env` nunca se sube a GitHub (ya está en `.gitignore`).
- La Secret key de Supabase solo se usa aquí, en el backend.
