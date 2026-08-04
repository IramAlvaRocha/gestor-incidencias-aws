# Prisma ORM 7: guía de aprendizaje

Guía teórica y práctica para aprender Prisma ORM por categorías. Los ejemplos están pensados para TypeScript, Node.js y arquitectura por repositorios, pero no dependen de una base de datos específica.

> Compatibilidad verificada para este proyecto el 4 de agosto de 2026:
>
> - `prisma`: **7.9.1**
> - `@prisma/client`: **7.9.1**
> - `@prisma/adapter-mariadb`: **7.9.1**
> - `mariadb`: **3.5.3**
> - Node.js: **22.18.0**
> - TypeScript: **7.0.2**
>
> Prisma ORM 7 requiere Node.js 20.19 o superior y TypeScript 5.4 o superior.

---

## Mapa de aprendizaje

1. Fundamentos
2. Instalación y configuración
3. Proveedores de bases de datos
4. Prisma Schema
5. Relaciones
6. Migraciones
7. Prisma Client y driver adapters
8. CRUD y consultas
9. Relaciones en consultas
10. Transacciones
11. Prisma en Clean Architecture
12. Errores y seguridad
13. Testing y herramientas
14. Producción
15. Ruta de estudio

---

## 1. Fundamentos

Prisma ORM está formado por varias piezas:

| Pieza | Responsabilidad |
|---|---|
| Prisma Schema | Describe modelos, campos, relaciones y enums |
| Prisma Migrate | Convierte cambios del schema en migraciones SQL |
| Prisma Client | API tipada para consultar la base desde TypeScript |
| Driver adapter | Conecta Prisma Client con el driver de la base |
| Prisma Studio | Interfaz gráfica para inspeccionar datos |
| Prisma CLI | Ejecuta `generate`, `migrate`, `studio`, etc. |

### Flujo mental

```text
schema.prisma
     │
     ├── prisma migrate ──► archivos SQL ──► base de datos
     │
     └── prisma generate ─► Prisma Client tipado ──► aplicación
```

El schema es la fuente de verdad para la estructura que Prisma conoce. Una migración cambia físicamente la base; `generate` cambia el código tipado del cliente.

### Prisma no es la base de datos

Prisma se conecta a una base existente. El servidor puede venir de:

- Docker
- Una instalación local
- Un servicio administrado
- Un proveedor serverless
- Un archivo local, en el caso de SQLite

---

## 2. Instalación y configuración en Prisma 7

### Paquetes base

```powershell
npm install prisma @prisma/client
```

En muchos equipos se instala `prisma` como dependencia de desarrollo:

```powershell
npm install --save-dev prisma
npm install @prisma/client
```

Mantén `prisma`, `@prisma/client` y el adapter en la misma versión:

```json
{
  "dependencies": {
    "prisma": "7.9.1",
    "@prisma/client": "7.9.1",
    "@prisma/adapter-pg": "7.9.1"
  }
}
```

Con `^7.9.1`, npm puede instalar una versión menor posterior compatible. Si necesitas builds completamente reproducibles, usa versiones exactas y conserva `package-lock.json`.

### Inicialización

```powershell
npx prisma init
```

Puedes indicar el proveedor:

```powershell
npx prisma init --datasource-provider postgresql
npx prisma init --datasource-provider mysql
npx prisma init --datasource-provider sqlite
```

### Generator actual

En Prisma 7 se recomienda `prisma-client`, sin el sufijo `-js`, y requiere un `output` explícito:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

Después:

```powershell
npx prisma generate
```

Importa el cliente desde el directorio generado por tu proyecto:

```ts
import { PrismaClient } from "../generated/prisma/client.js";
```

No copies rutas de otros proyectos sin revisar su `output`.

### `prisma.config.ts`

En Prisma 7 la configuración del CLI vive normalmente aquí:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

El datasource del schema solo declara el proveedor:

```prisma
datasource db {
  provider = "postgresql"
}
```

La URL se obtiene desde `prisma.config.ts`, no es necesario ponerla en el bloque `datasource` para este flujo de Prisma 7.

---

## 3. Proveedores de bases de datos

Prisma puede trabajar con distintas bases. La elección cambia el `provider`, la URL y el adapter.

| Base | Provider | Adapter habitual en Prisma 7 | Driver |
|---|---|---|---|
| PostgreSQL | `postgresql` | `@prisma/adapter-pg` | `pg` |
| CockroachDB | `cockroachdb` | `@prisma/adapter-pg` | `pg` |
| MySQL / MariaDB | `mysql` | `@prisma/adapter-mariadb` | `mariadb` |
| SQLite | `sqlite` | `@prisma/adapter-better-sqlite3` | `better-sqlite3` |
| Turso / LibSQL | `sqlite` | `@prisma/adapter-libsql` | `@libsql/client` |
| SQL Server | `sqlserver` | `@prisma/adapter-mssql` | `mssql` / `node-mssql` |
| Prisma Postgres | `postgresql` | `@prisma/adapter-pg` o `@prisma/adapter-ppg` | según entorno |

### URLs típicas

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/app?schema=public"

# MySQL / MariaDB
DATABASE_URL="mysql://user:password@localhost:3306/app"

# SQLite
DATABASE_URL="file:./dev.db"

# SQL Server
DATABASE_URL="sqlserver://localhost:1433;database=app;user=sa;password=secret;encrypt=true;trustServerCertificate=true"
```

### Importante sobre MongoDB

Prisma ORM 7 no soporta actualmente MongoDB. Para un proyecto MongoDB se debe evaluar la línea Prisma 6 o la alternativa vigente en la documentación oficial; no copies la configuración SQL con adapters a MongoDB.

### Diferencias que debes esperar

- Los tipos nativos no son iguales en todos los proveedores.
- SQLite no soporta todas las capacidades de enums o listas escalares.
- Los enums físicos y los cambios de enum varían entre motores.
- El DDL transaccional cambia según la base.
- Algunas opciones de filtros de texto y sensibilidad a mayúsculas dependen del motor.
- Una migración generada para PostgreSQL no debe ejecutarse en MySQL.

La API de Prisma Client es parecida entre proveedores, pero la base sigue teniendo sus propias reglas.

---

## 4. Prisma Schema

### Modelo básico

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  biography String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Campos opcionales

```prisma
biography String?
```

Esto produce normalmente `string | null` en Prisma Client. No significa `undefined` al leer desde la base.

Si tu dominio exige `string`, decide conscientemente cómo mapear:

```ts
description: row.description ?? ""
```

No ocultes un `null` con `""` si ambos tienen significados distintos para el negocio.

### Atributos frecuentes

| Atributo | Uso |
|---|---|
| `@id` | Clave primaria |
| `@unique` | Restricción única |
| `@default(...)` | Valor por defecto en la base |
| `@updatedAt` | Prisma actualiza el campo al modificar |
| `@relation(...)` | Configura una relación |
| `@map("...")` | Mapea un campo o enum a otro nombre físico |
| `@@index([...])` | Índice compuesto |
| `@@unique([...])` | Restricción única compuesta |
| `@@id([...])` | Clave primaria compuesta |
| `@@map("...")` | Cambia el nombre físico de la tabla |

### IDs

La base puede generarlos:

```prisma
id String @id @default(uuid())
```

O la aplicación puede mandarlos:

```ts
import { randomUUID } from "node:crypto";

const id = randomUUID();
```

En Clean Architecture es válido que la entidad nazca con ID antes de persistirse. El `@default(uuid())` puede quedar como respaldo, pero no es obligatorio si todos los inserts incluyen el ID.

### Enums

```prisma
enum TicketStatus {
  Open
  InProgress
  Closed
}

model Ticket {
  id     String       @id
  status TicketStatus @default(Open)
}
```

Convención recomendada para valores de varias palabras:

```text
InProgress
CodeReview
WaitingForCustomer
```

Usa labels legibles en la UI:

```ts
const labels = {
  InProgress: "In Progress",
  CodeReview: "Code Review",
} as const;
```

Evita `@map("In Progress")` si puedes mantener el mismo identificador en dominio, API, Prisma y base. `@map` es útil cuando integras una base existente o necesitas conservar nombres físicos diferentes.

### Índices

Un índice debe responder a consultas reales:

```prisma
model Ticket {
  id        String       @id
  projectId String
  status    TicketStatus
  createdAt DateTime     @default(now())

  @@index([projectId])
  @@index([projectId, status])
  @@index([createdAt])
}
```

No indexes todos los campos: aceleran lecturas, pero tienen costo al escribir y ocupan espacio.

---

## 5. Relaciones

### Uno a muchos

```prisma
model User {
  id       String  @id @default(uuid())
  projects Project[]
}

model Project {
  id      String @id @default(uuid())
  ownerId String
  owner   User   @relation(fields: [ownerId], references: [id])
}
```

- `ownerId` es la foreign key física.
- `owner` es el campo de relación usado por Prisma.
- `projects` es el lado inverso.

### Relaciones con nombre

Cuando dos modelos tienen más de una relación entre sí, hay que desambiguarlas:

```prisma
model User {
  id              String   @id
  reportedTickets Ticket[] @relation("TicketReporter")
  assignedTickets Ticket[] @relation("TicketAssignee")
}

model Ticket {
  id         String  @id
  reporterId String
  reporter   User    @relation("TicketReporter", fields: [reporterId], references: [id])
  assigneeId String?
  assignee   User?   @relation("TicketAssignee", fields: [assigneeId], references: [id])
}
```

`"TicketReporter"` y `"TicketAssignee"` son nombres lógicos. Deben coincidir en ambos lados.

### Muchos a muchos explícita

Úsala cuando la relación necesita datos propios o control explícito:

```prisma
model User {
  id          String              @id
  memberships ProjectMembership[]
}

model Project {
  id      String              @id
  members ProjectMembership[]
}

model ProjectMembership {
  userId    String
  projectId String
  role      ProjectRole
  joinedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@id([userId, projectId])
  @@index([projectId, role])
}
```

La clave compuesta evita que el mismo usuario se agregue dos veces al mismo proyecto.

### Acciones referenciales

```prisma
ticket Ticket @relation(
  fields: [ticketId],
  references: [id],
  onDelete: Cascade
)
```

Opciones comunes:

- `Cascade`: borrar padre borra hijos.
- `Restrict`: impide borrar si hay hijos.
- `SetNull`: deja la FK en `null`; la FK debe ser opcional.
- `NoAction`: delega el comportamiento al motor.

Elige según la regla de negocio, no por comodidad.

---

## 6. Migraciones

### Desarrollo

```powershell
npx prisma migrate dev --name add_ticket_status
```

En bases relacionales:

1. Compara schema e historial.
2. Genera SQL en `prisma/migrations`.
3. Aplica la migración a la base de desarrollo.
4. Registra el resultado en `_prisma_migrations`.

En Prisma 7, ejecuta `generate` explícitamente cuando necesites asegurar que el cliente esté actualizado:

```powershell
npx prisma generate
```

### Revisar SQL antes de aplicarlo

```powershell
npx prisma migrate dev --name add_ticket_status --create-only
```

Después revisa:

```text
prisma/migrations/<timestamp>_add_ticket_status/migration.sql
```

Y aplica:

```powershell
npx prisma migrate dev
```

### Producción

```powershell
npx prisma migrate deploy
```

`migrate deploy` aplica migraciones existentes; no crea migraciones nuevas ni detecta cambios de intención en el schema.

### Otros comandos

```powershell
# Estado
npx prisma migrate status

# Borrar la base de desarrollo y reaplicar todo
npx prisma migrate reset

# Ver diferencias como SQL
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script

# Validar schema
npx prisma validate

# Formatear schema
npx prisma format
```

### `db push` vs migraciones

```powershell
npx prisma db push
```

`db push` sincroniza el schema sin crear historial SQL. Es útil para prototipos y pruebas desechables.

Usa migraciones cuando:

- El proyecto se comparte.
- Necesitas historial.
- Hay entornos de staging/producción.
- Debes revisar cambios destructivos.
- Otros desarrolladores deben reproducir la estructura.

### Regla de seguridad

| Comando | Desarrollo | Producción |
|---|---:|---:|
| `migrate dev` | Sí | No |
| `migrate reset` | Solo si puedes perder datos | Nunca |
| `db push` | Prototipos | No como estrategia normal |
| `migrate deploy` | Opcional | Sí |

Hay más detalle en `Apuntes/prisma-migraciones-y-base-de-datos.md`.

---

## 7. Prisma Client y driver adapters

### PostgreSQL

```powershell
npm install @prisma/adapter-pg pg
```

```ts
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
```

### MySQL / MariaDB

```powershell
npm install @prisma/adapter-mariadb mariadb
```

```ts
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
```

### SQLite

```powershell
npm install @prisma/adapter-better-sqlite3 better-sqlite3
```

```ts
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });
```

### Singleton en desarrollo

Los procesos con hot reload pueden crear múltiples clientes:

```ts
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Esto evita agotar conexiones durante recargas. No convierte las consultas en un singleton global de negocio; solo reutiliza el cliente de infraestructura.

---

## 8. CRUD y consultas

Supongamos:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

### Crear

```ts
const user = await prisma.user.create({
  data: {
    email: "ada@example.com",
    name: "Ada",
  },
});
```

### Buscar por campo único

```ts
const user = await prisma.user.findUnique({
  where: { email: "ada@example.com" },
});
```

Retorna `User | null`.

```ts
const user = await prisma.user.findUniqueOrThrow({
  where: { email: "ada@example.com" },
});
```

Lanza una excepción si no existe.

### Buscar varios

```ts
const users = await prisma.user.findMany({
  where: {
    email: { endsWith: "@example.com" },
  },
  orderBy: { createdAt: "desc" },
  take: 20,
});
```

Retorna un arreglo; si no encuentra, retorna `[]`.

### Actualizar

```ts
const updated = await prisma.user.update({
  where: { id },
  data: { name: "Ada Lovelace" },
});
```

### Eliminar

```ts
await prisma.user.delete({
  where: { id },
});
```

### `select` vs `include`

`select` elige campos:

```ts
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
  },
});
```

`include` agrega relaciones:

```ts
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    members: true,
    tickets: true,
  },
});
```

Evita pedir relaciones o columnas que no usarás.

### Filtros

```ts
const tickets = await prisma.ticket.findMany({
  where: {
    projectId,
    status: { in: ["Open", "InProgress"] },
    title: { contains: search },
  },
  orderBy: { createdAt: "desc" },
});
```

Operadores frecuentes:

- `equals`
- `in`, `notIn`
- `lt`, `lte`, `gt`, `gte`
- `contains`, `startsWith`, `endsWith`
- `not`
- `AND`, `OR`, `NOT`

### Paginación por offset

```ts
const page = 2;
const pageSize = 20;

const rows = await prisma.ticket.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: "desc" },
});
```

Simple, pero los offsets grandes pueden ser costosos.

### Paginación por cursor

```ts
const rows = await prisma.ticket.findMany({
  take: 20,
  cursor: cursorId ? { id: cursorId } : undefined,
  skip: cursorId ? 1 : 0,
  orderBy: { id: "asc" },
});
```

Es preferible para listas grandes y feeds.

### Conteo

```ts
const total = await prisma.ticket.count({
  where: { projectId },
});
```

---

## 9. Relaciones en consultas

### Lectura con relaciones

```ts
const projects = await prisma.project.findMany({
  include: {
    owner: true,
    members: {
      include: { user: true },
    },
  },
});
```

El tipo retornado incluye exactamente lo solicitado.

### Escritura anidada

```ts
const project = await prisma.project.create({
  data: {
    id: projectId,
    name: "Issue Tracker",
    key: "ISSUE",
    ownerId,
    members: {
      create: [
        { userId: ownerId },
      ],
    },
  },
  include: { members: true },
});
```

La escritura anidada permite crear el padre y sus relaciones como una sola operación lógica.

### Conectar un registro existente

```ts
await prisma.ticket.update({
  where: { id: ticketId },
  data: {
    assignee: {
      connect: { id: userId },
    },
  },
});
```

También puedes actualizar directamente la FK:

```ts
data: { assigneeId: userId }
```

Elige un estilo consistente.

### Filtros por relaciones

```ts
const projects = await prisma.project.findMany({
  where: {
    members: {
      some: { userId },
    },
  },
});
```

Para relaciones múltiples:

- `some`: al menos uno coincide.
- `every`: todos coinciden.
- `none`: ninguno coincide.

Para relaciones de uno:

- `is`
- `isNot`

---

## 10. Transacciones

### Operaciones independientes

```ts
const [users, ticketCount] = await prisma.$transaction([
  prisma.user.findMany(),
  prisma.ticket.count(),
]);
```

### Transacción interactiva

```ts
const result = await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({
    data: {
      id: projectId,
      name,
      key,
      ownerId,
    },
  });

  await tx.projectMember.create({
    data: {
      projectId: project.id,
      userId: ownerId,
    },
  });

  return project;
});
```

Usa una transacción cuando varias escrituras deban completarse todas o ninguna.

No mantengas transacciones abiertas mientras:

- llamas servicios HTTP externos;
- esperas interacción de usuario;
- haces trabajo pesado no relacionado con la DB.

La implementación de transacciones y DDL varía por proveedor. Revisa las capacidades de tu motor, especialmente para migraciones.

---

## 11. Prisma en Clean Architecture

### Regla de dependencias

```text
Domain
  ↑
Application
  ↑
Infrastructure (Prisma)
```

El dominio no importa `PrismaClient` ni tipos generados por Prisma.

### Puerto del dominio

```ts
export interface IProjectRepository {
  save(project: Project): Promise<Project>;
  getById(id: string): Promise<Project | null>;
  findByKey(key: string): Promise<Project | null>;
}
```

### Adapter Prisma

```ts
type ProjectRow = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  members: { userId: string }[];
};

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: ProjectRow): Project {
    return Project.reconstruct({
      id: row.id,
      name: row.name,
      key: row.key,
      description: row.description ?? "",
      ownerId: row.ownerId,
      members: row.members.map((member) => member.userId),
      createdAt: row.createdAt,
    });
  }
}
```

### Por qué mapear

Los modelos Prisma representan persistencia. Las entidades representan negocio.

Pueden diferir en:

- `null` vs valor requerido.
- enums.
- relaciones normalizadas vs arreglos de IDs.
- JSON.
- nombres físicos.
- tipos de fechas o decimales.

El mapper evita acoplar el dominio a esos detalles.

### `create` vs `reconstruct`

Una entidad puede separar:

```ts
Project.create(input)
```

Para crear una entidad nueva y validar reglas.

```ts
Project.reconstruct(persistedData)
```

Para reconstruir una entidad que ya fue validada y persistida.

No omitas toda validación al reconstruir si datos corruptos podrían violar invariantes críticas.

### Tipar resultados con relaciones

Puedes escribir un tipo manual pequeño:

```ts
type ProjectRow = {
  id: string;
  members: { userId: string }[];
  // ...
};
```

O derivarlo del tipo generado con payloads de Prisma cuando necesites precisión:

```ts
import type { Prisma } from "../generated/prisma/client.js";

const projectWithMembers = {
  include: { members: true },
} satisfies Prisma.ProjectDefaultArgs;

type ProjectRow =
  Prisma.ProjectGetPayload<typeof projectWithMembers>;
```

Luego reutiliza la misma forma en la consulta:

```ts
const row = await prisma.project.findUnique({
  where: { id },
  ...projectWithMembers,
});
```

Esto reduce errores cuando cambia el schema.

---

## 12. Errores y seguridad

### Errores de Prisma

No expongas errores internos al cliente HTTP. Tradúcelos en infraestructura.

Ejemplo conceptual:

```ts
try {
  await prisma.user.create({ data });
} catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new EmailAlreadyRegisteredError(data.email);
  }

  throw error;
}
```

Los códigos concretos deben confirmarse con la versión instalada y el caso real.

### Raw SQL

Prefiere la API tipada. Si necesitas SQL:

```ts
const rows = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${email}
`;
```

El tagged template parametriza valores.

Evita:

```ts
const query = `SELECT * FROM User WHERE email = '${email}'`;
await prisma.$queryRawUnsafe(query);
```

La concatenación de input permite SQL injection.

Si usas APIs `Unsafe`, pasa parámetros por separado y entiende la sintaxis del driver.

### Secretos

- No commitees `.env`.
- Mantén `.env.template` sin credenciales reales.
- Usa variables del entorno de despliegue en producción.
- No imprimas `DATABASE_URL` en logs.

---

## 13. Testing y herramientas

### Validar y generar

```powershell
npx prisma validate
npx prisma format
npx prisma generate
npm run build
```

### Prisma Studio

```powershell
npx prisma studio
```

Úsalo para inspeccionar datos, no como sustituto de migraciones ni seeds.

### Tests de repositorio

Los tests de dominio y casos de uso pueden usar repositorios in-memory.

Los tests del adapter Prisma deben usar una base real de pruebas:

```text
Unit tests:
  Domain + use cases + InMemoryRepository

Integration tests:
  PrismaRepository + database de test
```

Opciones:

- Contenedor efímero con Testcontainers.
- Base separada para tests.
- SQLite solo si sus diferencias con producción no afectan el caso.

Nunca ejecutes `migrate reset` contra una URL que pueda apuntar a producción.

### Seeds

Configura el comando en `prisma.config.ts`:

```ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Ejecuta explícitamente:

```powershell
npx prisma db seed
```

En Prisma 7 no debes asumir que `migrate dev` o `migrate reset` ejecutarán el seed automáticamente.

---

## 14. Producción

### Pipeline mínimo

```powershell
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
npm start
```

El orden exacto puede depender del despliegue. Lo importante:

- Las migraciones están versionadas.
- `migrate deploy` se ejecuta una sola vez por despliegue.
- La app no empieza a depender del schema nuevo antes de aplicarlo.
- Hay backup para cambios riesgosos.

### Cambios compatibles

Para cambios grandes, usa expand-and-contract:

1. Agrega nueva columna opcional.
2. Despliega código que escriba ambos formatos.
3. Migra datos.
4. Cambia lecturas al formato nuevo.
5. Haz obligatorio el nuevo campo si corresponde.
6. Elimina el campo viejo en otro despliegue.

Evita renombrar o eliminar campos críticos en un único paso si hay varias instancias de la aplicación corriendo.

---

## 15. Ruta de estudio recomendada

### Nivel 1 — Base

- Entender Prisma Schema.
- Configurar provider, URL y adapter.
- Ejecutar `generate`.
- Crear una migración.
- Aprender CRUD básico.

Ejercicio:

1. Crea `User` y `Project`.
2. Migra.
3. Crea un usuario.
4. Busca por email.
5. Crea un proyecto relacionado.

### Nivel 2 — Uso diario

- Relaciones 1-N y N-N.
- `select`, `include`, filtros.
- Paginación.
- Restricciones e índices.
- Repositorios y mappers.

Ejercicio:

1. Lista proyectos de un usuario.
2. Incluye miembros.
3. Pagina tickets.
4. Filtra por status.
5. Reconstruye entidades de dominio.

### Nivel 3 — Seguridad de datos

- Transacciones.
- Migraciones revisadas.
- Errores conocidos.
- Tests de integración.
- Seeds.

Ejercicio:

1. Crea proyecto y owner membership en una transacción.
2. Fuerza un error y verifica rollback.
3. Prueba una restricción única.
4. Ejecuta migraciones sobre una DB de test vacía.

### Nivel 4 — Producción

- `migrate deploy`.
- Expand-and-contract.
- Índices basados en consultas.
- Observabilidad y pool de conexiones.
- Backups y rollback operativo.

---

## Checklist de dominio Prisma

### Instalación

- [ ] Sé distinguir CLI, Client, adapter y driver.
- [ ] Sé verificar versiones con `npx prisma version`.
- [ ] Mantengo paquetes Prisma en versiones compatibles.

### Schema

- [ ] Entiendo campos opcionales y `null`.
- [ ] Sé modelar IDs, uniques, defaults e índices.
- [ ] Sé modelar 1-N y N-N.
- [ ] Sé cuándo nombrar una relación.
- [ ] Sé usar enums sin mezclar valores de UI.

### Migraciones

- [ ] Sé usar `migrate dev`, `--create-only` y `deploy`.
- [ ] Sé que `reset` borra datos.
- [ ] Reviso SQL para cambios destructivos.
- [ ] No edito migraciones ya aplicadas/compartidas sin estrategia.

### Client

- [ ] Sé crear el adapter correcto para el provider.
- [ ] Sé regenerar el client.
- [ ] Manejo `findUnique` como nullable.
- [ ] Uso `select`/`include` conscientemente.
- [ ] Sé usar transacciones.

### Arquitectura

- [ ] El dominio no importa Prisma.
- [ ] Los repositorios Prisma implementan puertos del dominio.
- [ ] Mapeo filas Prisma a entidades.
- [ ] Traduzco errores Prisma a errores de aplicación/dominio.

---

## Comandos de referencia

```powershell
# Información
npx prisma version
npx prisma debug

# Schema / Client
npx prisma validate
npx prisma format
npx prisma generate

# Desarrollo
npx prisma migrate dev --name nombre
npx prisma migrate dev --name nombre --create-only
npx prisma migrate status
npx prisma studio
npx prisma db seed

# Destructivo: solo DB de desarrollo
npx prisma migrate reset

# Producción
npx prisma migrate deploy

# Prototipo sin historial
npx prisma db push
```

---

## Fuentes y compatibilidad

Esta guía se contrastó con documentación oficial de Prisma consultada mediante Context7:

- [Prisma ORM: add to existing project](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction)
- [Prisma Schema overview](https://www.prisma.io/docs/orm/prisma-schema/overview)
- [Data modeling](https://www.prisma.io/docs/orm/core-concepts/data-modeling)
- [Prisma Client API](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
- [Supported databases](https://www.prisma.io/docs/orm/core-concepts/supported-databases)

La documentación recuperada es para Prisma ORM 7. El proyecto usa 7.9.1 y se verificó con el CLI instalado. Ante una actualización de versión:

```powershell
npx prisma version
npm list prisma @prisma/client
```

Después revisa changelog y documentación antes de cambiar generator, adapters, migraciones o forma de construir `PrismaClient`.
