# Pulso Backend

REST API para **Pulso**, una app de finanzas personales bilingüe (ES/EN) orientada al registro consciente de gastos, hábitos financieros y metas de ahorro.

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js + TypeScript (`tsx`) |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL (Docker) |
| Autenticación | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validación | Zod |

## Arquitectura

Clean Architecture por módulo:

```
src/modules/<módulo>/
  domain/
    repositories/   # Interfaces + tipos de resultado
  application/
    dtos/           # Schemas Zod + tipos inferidos
    use-cases/      # Una clase por caso de uso
  infrastructure/
    repositories/   # Implementación Prisma
  presentation/
    validators/     # Middleware Zod (422 en error)
    *Controller.ts  # Handlers con arrow functions
    *.routes.ts     # Router con DI manual
```

## Requisitos

- Node.js >= 20
- Docker + Docker Compose

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores (JWT_SECRET, CORS_ORIGIN, etc.)

# 3. Levantar la base de datos
docker compose up -d

# 4. Aplicar migraciones
npm run prisma:migrate

# 5. Iniciar servidor en modo desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@localhost:5433/pulso_db` |
| `JWT_SECRET` | Clave para firmar tokens (min 16 chars) | `super_secret_key` |
| `JWT_EXPIRES_IN` | Expiración del token | `7d` |
| `CORS_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

## Scripts

```bash
npm run dev              # Servidor en modo watch (tsx)
npm run build            # Compilar a dist/
npm run start            # Iniciar desde dist/ (producción)
npm run prisma:migrate   # Crear y aplicar migraciones
npm run prisma:studio    # Abrir Prisma Studio (GUI de DB)
npm run prisma:seed      # Ejecutar seed de datos iniciales
```

## Módulos y rutas

| Módulo | Prefijo | Acceso |
|--------|---------|--------|
| Auth | `/api/v1/auth` | Público |
| Me | `/api/v1/me` | Autenticado |
| Categories | `/api/v1/categories` | GET: autenticado · POST/PATCH/DELETE: admin |
| Transactions | `/api/v1/transactions` | Autenticado |
| Snapshots | `/api/v1/snapshots` | Autenticado |
| Saving Goals | `/api/v1/saving-goals` | Autenticado |
| Habits | `/api/v1/habits` | Autenticado |
| Investment Profiles | `/api/v1/investment-profiles` | Autenticado |
| Roles | `/api/v1/roles` | Admin |
| Permissions | `/api/v1/permissions` | Admin |

Ver [API_REFERENCE.md](./API_REFERENCE.md) para la documentación completa de cada endpoint.

## Autenticación

Todos los endpoints protegidos requieren el token en el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `POST /api/v1/auth/login`. La respuesta incluye el campo `user.role` (`"admin"`, `"user"`, etc. o `null`) para que el frontend pueda tomar decisiones de navegación.

## Roles

| Rol | Acceso |
|-----|--------|
| `super_admin` | Todo |
| `admin` | Roles, categorías (CRUD) |
| `support` | — |
| `user` | Recursos propios |

Para asignar un rol a un usuario desde Prisma Studio:

```bash
npm run prisma:studio
# Tabla "users" → actualizar campo roleId con el id del rol deseado
```

## Base de datos

```bash
# Iniciar
docker compose up -d

# Detener
docker compose down

# Resetear volumen (si hay errores de auth en Postgres)
docker compose down -v
```

La DB corre en el puerto `5433` (local) para evitar conflicto con instalaciones locales de Postgres en el `5432` por defecto.

## Health check

```
GET /health
→ { "status": "ok", "timestamp": "..." }
```
