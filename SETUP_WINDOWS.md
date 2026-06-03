# TPV Windows — Estado actual y problema a resolver

## Stack
- NestJS + Prisma + PostgreSQL 16 (backend, puerto 3000)
- React + Vite (frontend, puerto 8080)
- El proyecto está clonado de GitHub en local

## Lo que ya está hecho
- PostgreSQL 16 instalado, usuario `postgres`, password `postgres`
- Base de datos `tpv` creada e importada desde dump del Mac
- Node.js + pnpm instalados
- `backend/.env` creado con:
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tpv"
  DIRECT_URL="postgresql://postgres:postgres@localhost:5432/tpv"
  JWT_SECRET="tpv-corpus-secret-change-in-prod"
  JWT_EXPIRES_IN="8h"
  CORS_ORIGIN="http://localhost:5173,http://localhost:8080,http://localhost:4173"
  PORT=3000
  ```
- `npx prisma generate` ejecutado en backend
- `pnpm build` ejecutado en backend
- `pnpm install` + `pnpm build` ejecutados en frontend
- `frontend/.env.production` apunta a `http://localhost:3000`

## Problema actual
El frontend carga (`http://localhost:8080`) pero no devuelve datos de la BBDD.
`http://localhost:3000/` responde `{"status":"OK"}` — el backend arranca bien.
Las llamadas a endpoints como `/auth/usuarios` o `/productos` no devuelven datos.
Sospechamos que hay un problema con PostgreSQL — posiblemente las tablas están vacías o el schema no se importó bien.

## Lo que hay que investigar y arreglar

### 1. Verificar que las tablas tienen datos
En psql o pgAdmin ejecutar:
```sql
SELECT count(*) FROM public."Usuario";
SELECT count(*) FROM public."Producto";
SELECT count(*) FROM public."Venta";
```
Si devuelven 0 o error, el import falló.

### 2. Si las tablas están vacías, reimportar el dump
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d tpv -f "ruta\al\tpv_windows.sql"
```

### 3. Verificar que Prisma conecta bien
Desde la carpeta `backend`:
```powershell
npx prisma db pull
```
Debe mostrar los modelos sin error.

### 4. Arrancar el sistema completo
Terminal 1 (backend):
```powershell
cd backend
node dist/src/main
```
Terminal 2 (frontend):
```powershell
cd frontend
pnpm preview --port 8080
```

### 5. Las tablas usan nombres en PascalCase con comillas
El schema de Prisma y el dump usan `"Usuario"`, `"Venta"`, `"Producto"` etc. (con mayúscula y entre comillas). Asegúrate de usarlas en cualquier query manual.

## Notas
- Los tickets de impresora son imágenes PNG en `backend/assets/tickets/`
- La IP de la impresora se configura en el frontend desde la página Config
- El `.env` NO está en el repo (hay que crearlo manualmente en cada máquina)