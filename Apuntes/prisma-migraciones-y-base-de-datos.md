# Base de datos y migraciones (Prisma + MySQL)

Apuntes del Backend: cómo levantar MySQL, aplicar migraciones y comandos Prisma que conviene dominar.

> Trabaja siempre desde la carpeta `Backend/`.

---

## Arquitectura en dos capas

| Capa | Quién la crea | Qué es |
|------|----------------|--------|
| Motor + base vacía | Docker (`docker compose`) | MySQL corriendo y la DB `minijira` |
| Estructura (tablas, enums, columnas) | Prisma Migrate | Schema aplicado sobre esa DB |

Prisma **no** instala MySQL. Docker (u otro MySQL local) debe estar arriba antes de migrar.

---

## Setup inicial (una vez)

### 1. Variables de entorno

Copia el template y completa `DATABASE_URL`:

```powershell
copy .env.template .env
```

Ejemplo alineado con `docker-compose.yml`:

```env
DATABASE_URL="mysql://root:root@localhost:3306/minijira"
```

### 2. Levantar MySQL

```powershell
docker compose up -d
```

Comprobar:

```powershell
docker compose ps
```

Detener (sin borrar datos del volumen):

```powershell
docker compose down
```

Borrar también el volumen de datos (DB limpia total):

```powershell
docker compose down -v
```

### 3. Primera migración / aplicar schema

```powershell
npx prisma migrate dev --name init
```

Esto:

1. Compara `prisma/schema.prisma` con la DB  
2. Crea SQL en `prisma/migrations/`  
3. **Aplica** ese SQL a `minijira`  
4. Actualiza el historial `_prisma_migrations`

Luego regenera el client (recomendado en Prisma 7):

```powershell
npx prisma generate
```

---

## Comandos Prisma que debes saber

### Migraciones (día a día)

| Comando | Qué hace |
|---------|----------|
| `npx prisma migrate dev` | Crea **y aplica** una migración en desarrollo |
| `npx prisma migrate dev --name nombre_cambio` | Igual, con nombre explícito |
| `npx prisma migrate dev --create-only` | Solo escribe el SQL; **no** toca la DB |
| `npx prisma migrate deploy` | Aplica migraciones pendientes (prod / CI). No crea nuevas |
| `npx prisma migrate status` | Qué migraciones están aplicadas / pendientes |
| `npx prisma migrate reset` | **Borra** la DB, reaplica todas las migraciones (solo local) |

Ejemplos:

```powershell
# Cambiaste el schema (ej. enum InProgress)
npx prisma migrate dev --name rename_ticket_status_in_progress

# Quieres revisar el SQL antes de aplicarlo
npx prisma migrate dev --name mi_cambio --create-only
# editas prisma/migrations/.../migration.sql
npx prisma migrate dev

# Ver estado
npx prisma migrate status

# Empezar de cero en local (¡borra datos!)
npx prisma migrate reset
```

### Schema y client

| Comando | Qué hace |
|---------|----------|
| `npx prisma generate` | Regenera el client en `src/generated/prisma` |
| `npx prisma validate` | Valida que el `schema.prisma` sea correcto |
| `npx prisma format` | Formatea el schema |
| `npx prisma db push` | Empuja el schema sin crear migración (prototipo rápido; no para prod) |
| `npx prisma studio` | UI web para ver/editar datos |

```powershell
npx prisma generate
npx prisma validate
npx prisma studio
```

### Útiles al depurar

```powershell
# Ver qué SQL se aplicaría (diff)
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script

# Marcar una migración fallida como aplicada (recuperación avanzada)
npx prisma migrate resolve --applied NOMBRE_DE_LA_MIGRACION
```

---

## Flujo recomendado al cambiar el schema

1. Edita `prisma/schema.prisma`  
2. Alinea dominio / Zod / repos si hace falta (enums, campos)  
3. `npx prisma migrate dev --name descripcion_corta`  
4. `npx prisma generate` (si el client no quedó al día)  
5. Prueba la app  

### Enums de varias palabras

Usa PascalCase sin espacios en todo el stack (`InProgress`, no `"In Progress"`).

```prisma
enum TicketStatus {
  Open
  InProgress
  Closed
}
```

Si ya existía el valor viejo en MySQL, puede hacer falta SQL manual en la migración (ampliar enum → `UPDATE` datos → dejar solo valores nuevos). En local vacío, a veces es más fácil `migrate reset`.

---

## Dev vs producción

| Entorno | Comando |
|---------|---------|
| Desarrollo | `npx prisma migrate dev` |
| Producción / CI | `npx prisma migrate deploy` |

Nunca uses `migrate dev` ni `migrate reset` en producción.

---

## Archivos clave

```
Backend/
├── docker-compose.yml      # MySQL + DB minijira
├── .env                    # DATABASE_URL (no commitear secretos)
├── .env.template
├── prisma.config.ts        # URL y path de migraciones (Prisma 7)
└── prisma/
    ├── schema.prisma       # Modelo de datos
    └── migrations/         # Historial SQL versionado
```

Client generado (según schema): `src/generated/prisma/`.

---

## Checklist rápido “la DB no conecta”

1. `docker compose ps` → MySQL Up  
2. Puerto `3306` libre / correcto  
3. `DATABASE_URL` apunta a `minijira` con user/pass correctos  
4. `npx prisma migrate status` → migraciones aplicadas  
5. `npx prisma generate` → client al día  

---

## Resumen en una frase

**Docker crea el servidor y la base vacía; `prisma migrate` crea y evoluciona las tablas.**
