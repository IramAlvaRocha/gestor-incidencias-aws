# Clean Architecture en Node (viniendo de .NET)

> Apuntes de teoría para entender el flujo de un proyecto con Clean Architecture en Node/Express + TypeScript.
> Basado en el proyecto `gestor-incidencias-aws/Backend`.

---

## 1. Idea central

Se construye **de adentro hacia afuera**: del núcleo puro (reglas de negocio) hacia el mundo exterior (HTTP, base de datos).

**Regla de oro:** las capas de adentro **NO conocen** a las de afuera.

- `User` (entidad) no sabe que existe Express.
- El caso de uso no sabe si los datos vienen de HTTP ni si se guardan en memoria o en Postgres.

Esto es lo que da el **desacoplamiento**: puedes cambiar la base de datos o el framework HTTP sin tocar la lógica de negocio.

```
┌─────────────────────────────────────────────┐
│  Infrastructure (HTTP, DB, frameworks)        │  ← lo de afuera
│   ┌───────────────────────────────────────┐  │
│   │  Application (casos de uso)             │  │
│   │   ┌───────────────────────────────┐    │  │
│   │   │  Domain (entidades, reglas)     │   │  │  ← el núcleo puro
│   │   └───────────────────────────────┘    │  │
│   └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
        Las flechas de dependencia SIEMPRE apuntan hacia adentro
```

---

## 2. Flujo natural al crear una feature (ej: Usuario)

| # | Paso | Capa | Archivo de ejemplo | Pregunta que responde |
|---|------|------|-----------|----------------------|
| 1 | **Entidad** + factory `crear()` | Domain | `user.entity.ts` | ¿Qué **es** un usuario y qué lo hace válido? |
| 2 | **Errores de dominio** | Domain | `DomainError.ts` | ¿Qué puede salir mal según las **reglas de negocio**? |
| 3 | **Interfaz del repositorio** | Domain | `IUserRepository.ts` | ¿Qué operaciones de persistencia **necesito** (sin decir cómo)? |
| 4 | **Casos de uso** | Application | `RegistrarUsuario.ts` | ¿Qué **hace** la app? (orquesta el flujo) |
| 5 | **Implementación del repo** | Infrastructure | `InMemoryUserRepository.ts` | ¿**Cómo** guardo los datos realmente? |
| 6 | **Controller** | Infrastructure | `user.controller.ts` | ¿Cómo traduzco HTTP ↔ caso de uso? |
| 7 | **Validadores / middlewares** | Infrastructure | `user.schema.ts`, `validate.ts` | ¿Los datos que entran tienen buena forma? |
| 8 | **Router** | Infrastructure | `user.routes.ts` | ¿Qué **URL + método** dispara qué controller? |
| 9 | **Server** | Infrastructure | `server.ts` | ¿Cómo armo la app HTTP completa? |
| 10 | **Main** | Raíz | `main.ts` | ¿Cómo **conecto todo** y enciendo el servidor? |

---

## 3. La parte confusa: `router` vs `server` vs `main`

Los tres "arman" cosas, pero en **niveles distintos de zoom** (como una cámara).

### `router` — zoom cercano (UNA sección de la API)

Solo sabe de **un recurso**. Dice "qué URL + qué método HTTP → qué función del controller". Nada más.

```ts
export const crearUserRouter = (controller: UserController): Router => {
  const router = Router();

  router.post('/', validate(registrarUsuarioSchema), controller.registrar);
  router.get('/', controller.listar);

  return router;
};
```

- **NO** conoce el puerto, ni CORS, ni el prefijo `/api/users`.
- Es un módulo enchufable: dice "un POST a la raíz de *lo que sea que me monten* llama a `registrar`".

### `server` — zoom medio (la APLICACIÓN HTTP completa)

Junta **todos los routers** y aplica lo común a toda la app (middlewares globales, CORS, JSON, prefijos de URL). Aquí el router "genérico" recibe su dirección real `/api/users`.

```ts
export const crearServidor = ({ ticketController, userController }: Controllers): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/tickets', crearTicketRouter(ticketController));
  app.use('/api/users', crearUserRouter(userController)); // aquí user.routes recibe su prefijo

  return app;
};
```

- **Clave:** `server` **NO** hace `app.listen()`. Solo *construye y devuelve* la app configurada.
- Esto es a propósito: sirve para tests (crear el server sin abrir un puerto real).

### `main` — zoom lejano (arranque / composición)

Es el único lugar que **crea las instancias concretas y las conecta** (*Composition Root*), y luego **enciende** el servidor.

```ts
// --- Users ---
const userRepository = new InMemoryUserRepository();                          // decido: usar memoria
const registrarUsuarioUseCase = new RegistrarUsuarioUseCase(userRepository);  // inyecto el repo
const listarUsuariosUseCase = new ListarUsuariosUseCase(userRepository);
const userController = new UserController(registrarUsuarioUseCase, listarUsuariosUseCase);

const app = crearServidor({ ticketController, userController });              // armo la app

app.listen(PORT, () => {                                                      // ENCIENDO (solo aquí)
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
```

### Tabla comparativa

| | ¿Qué decide? | ¿Sabe del puerto? | ¿Crea instancias `new`? | ¿Enciende? |
|---|---|---|---|---|
| `router` | qué URL → qué controller | ❌ | ❌ | ❌ |
| `server` | qué routers + middlewares globales | ❌ | ❌ | ❌ |
| `main` | qué implementación concreta usar | ✅ | ✅ | ✅ (`listen`) |

### ¿Por qué separarlos y no meter todo en `main`?

Por **responsabilidad única**:

- Cambias de memoria a PostgreSQL → tocas **solo `main.ts`** (`new InMemoryUserRepository()` → `new PostgresUserRepository()`).
- Agregas un endpoint nuevo de usuarios → tocas **solo `user.routes.ts`**.
- Agregas un middleware global (ej: logs) → tocas **solo `server.ts`**.

---

## 4. Equivalencias con .NET

| Node (este proyecto) | .NET |
|---|---|
| `main.ts` (Composition Root + `listen`) | `Program.cs` (`WebApplication` + arranque) |
| `new InMemoryUserRepository()` inyectado a mano | `builder.Services.AddScoped<IUserRepository, ...>()` |
| `server.ts` (`cors()`, `json()`, montar routers) | `app.UseCors()`, `app.MapControllers()`, middlewares |
| `router` (endpoints de un recurso) | endpoints agrupados de un `Controller` |
| Entidad + `IRepository` en Domain | Entidades + interfaces en `Domain` |
| Casos de uso en Application | Casos de uso / servicios en `Application` |
| Repo concreto + controllers en Infrastructure | EF Core + Controllers en `Infrastructure` |

> Diferencia clave: en Node aquí haces **inyección de dependencias manual** en `main.ts`, en vez de usar un contenedor DI automático como en .NET.

---

## 5. Ejemplo: seguir un `POST /api/users` de punta a punta

```
Cliente → POST /api/users  { nombre, email, password }
   │
   ▼
[server.ts]   app.use('/api/users', ...) → reconoce el prefijo, entra al router de users
   │
   ▼
[user.routes.ts]  router.post('/') → primero validate(schema), luego controller.registrar
   │
   ▼
[validate.ts]  ¿el body tiene forma válida? (zod)  → si no, corta con 400
   │
   ▼
[user.controller.ts]  registrar() → traduce HTTP: toma req.body, llama al use case
   │
   ▼
[RegistrarUsuario.ts]  execute() → LÓGICA: ¿ya existe el email? hashea password, User.crear(...)
   │                                            │
   │                                            ▼
   │                          [user.entity.ts]  valida email/nombre o lanza error de dominio
   │
   ▼
[InMemoryUserRepository.ts]  save() → guarda de verdad (aquí, en un array)
   │
   ▼
vuelve al controller → res.status(201).json(...)  → responde al cliente
```

Cada capa solo habla con su **vecina inmediata** y **a través de interfaces**, no de clases concretas. Por eso el caso de uso recibe `IUserRepository` y ni se entera si es memoria o base de datos.

---

## 6. Analogía de la vida real: un restaurante

Olvídate del código e imagina un **restaurante**:

| Concepto de código | En el restaurante |
|---|---|
| **Entidad (`User`)** | La **receta oficial**: define ingredientes y reglas ("la pasta lleva al menos 2 huevos"). No sabe nada del comedor ni de los clientes. |
| **Errores de dominio** | Las reglas de "esto no se puede cocinar" ("no hay ese ingrediente", "el email ya existe"). Quejas de la **cocina**, no del mesero. |
| **Interfaz del repositorio** | El **contrato con la despensa**: "necesito poder *guardar* y *traer* ingredientes". No dice si es refri, alacena o almacén externo. |
| **Caso de uso** | El **chef**: recibe la orden, revisa la despensa, sigue la receta, prepara el platillo. *Coordina*. No atiende mesas ni cobra. |
| **Implementación del repo** | La **despensa real** (un refri específico). Mañana la cambias por un almacén gigante (Postgres) y al chef le da igual: el contrato es el mismo. |
| **Controller** | El **mesero**: traduce entre el idioma del cliente (HTTP) y el de la cocina (llamar al chef). Lleva el plato o comunica el error. |
| **Router** | El **menú de una sección** (ej: carta de postres): "si pides *esto*, va con *este* mesero". Solo conoce su sección. |
| **Server** | El **comedor completo montado**: junta todas las secciones y pone reglas generales (horario, CORS, middlewares). Pero **las luces siguen apagadas**. |
| **Main** | El **dueño el día de apertura**: contrata al personal concreto (`new`...), asigna quién trabaja con quién y **abre las puertas** (`app.listen()`). |

**La moraleja:** el chef (caso de uso) y la receta (entidad) no saben ni les importa si el cliente pidió por teléfono, por app o en persona. Por eso puedes cambiar el mesero (HTTP → CLI → cola de mensajes) sin tocar la cocina. Ese es el superpoder de Clean Architecture.

---

## 7. Checklist rápido para una feature nueva

1. [ ] Entidad + factory `crear()` (Domain)
2. [ ] Errores de dominio necesarios (Domain)
3. [ ] Interfaz `IXxxRepository` (Domain)
4. [ ] Casos de uso (Application)
5. [ ] Implementación concreta del repo (Infrastructure)
6. [ ] Controller (Infrastructure)
7. [ ] Schema de validación + middleware (Infrastructure)
8. [ ] Router del recurso (Infrastructure)
9. [ ] Montar el router en `server.ts`
10. [ ] Instanciar y conectar todo en `main.ts`
