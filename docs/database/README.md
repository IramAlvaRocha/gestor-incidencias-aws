# Modelo objetivo de Arena

Propuesta para planear la evolución; no es una migración aplicada. El backend actual conserva su schema Prisma y sus cinco modelos.

Abrir [diagrama.html](./diagrama.html) para ver dominios, filtrar entidades, desplegar columnas y seguir relaciones. [overview.svg](./overview.svg) ofrece una vista general exportable. [diagramas.md](./diagramas.md) y los archivos `erd-*.mmd` contienen el ERD detallado por módulo.

## Archivos

- `arena-target.mysql.sql`: 68 tablas de incidencias, catálogo, CMDB, SLA y operación.
- `identity-target.mysql.sql`: 10 tablas opcionales del servicio propio de autenticación.
- `arena-target.dbml` y `identity-target.dbml`: diagramas editables en una herramienta compatible con DBML.
- `diccionario.md`: campos, tipos, nulabilidad, claves y referencias.
- `schema.json`: representación estructurada del mismo modelo.
- `model.mjs`: fuente única de los archivos generados.
- `generate.mjs`: generador sin dependencias npm.

Regenerar desde la raíz:

```powershell
node docs/database/generate.mjs
```

El generador comprueba nombres, columnas, tipos de FK, claves referenciadas únicas y que no existan FK entre servicios. La comprobación estática pasó. **El DDL no se ha ejecutado en MySQL**: Docker no tenía un daemon disponible durante esta revisión.

También se comprobaron 171 enlaces internos del explorador, sintaxis de su script, unicidad de sus identificadores y XML del SVG. Los documentos enlazados existen y el backlog tiene 49 identificadores únicos. El navegador bloqueó las rutas `file://`, por lo que no se realizó una prueba visual/interactiva del HTML en navegador.

SQL orientado a **MySQL 8.4 / InnoDB**. Seleccionar una base vacía de laboratorio antes de ejecutarlo. No contiene DROP, CREATE DATABASE, USE ni datos reales. El esquema de autenticación debe tener su propia base y usuario de conexión. No necesita otro servidor físico en desarrollo.

## Límites y decisiones

- No copiar este DDL como la próxima migración. Usar la ruta M0–M6 del [diseño](../../Apuntes/diseno-sla-datos-autenticacion.md).
- Los CHECK y FK protegen estructura; reglas de acceso, coherencia entre versiones, vigencias no solapadas y transacciones se detallan en el diseño.
- UUID como CHAR(36) para facilitar lectura y continuidad con el proyecto. Todas las fechas instante son UTC DATETIME(3); fechas civiles del calendario son DATE.
- Duraciones BIGINT en milisegundos. Si llegan como BigInt a Node, serializarlas de forma segura a string o validar rango antes de convertir; JSON.stringify no acepta BigInt directamente.
- `status`, `role`, `type` son vocabularios cerrados de dominio. Los CHECK de estado principales están en SQL; completar todos los enum/validadores al implementar cada módulo.
- JSON solo para formularios/atributos tipados, condiciones validadas y snapshots. Cliente, proyecto, ticket, CI, calendario, versión y actor tienen referencias normales.
- Tablas publicadas y de eventos deben tener escritura restringida por aplicación/rol de DB; el esquema por sí solo no prohíbe UPDATE al propietario.
- Índices generados impiden varias pausas/ciclos/asignaciones abiertas y transferencias pendientes. Revisar compatibilidad con el flujo de migraciones Prisma al implementar.
- No hay FK entre identity y arena. `(issuer, subject)` es una relación lógica con `identity_link`.
- La autenticación opcional ilustra un proveedor propio para aprender; no implementa un servidor OAuth/OIDC completo.
- Las bases comparten el diseño visual, pero credenciales, despliegue y accesos de servicio deben ser independientes.

## Relación con las historias

- US-02–06, ORG-01/02: perfiles, clientes, proyectos, membresías, niveles, áreas y grupos.
- CAT-01–03: productos, contratos y catálogo con ofertas por proyecto.
- CMDB-01–03: clases, esquemas, CIs, dependencias y vínculo con servicios/ofertas.
- CAL-01 y SLA-01/02: calendarios y políticas publicadas.
- US-07–19: tickets, colaboración, actividad, asignaciones y adjuntos.
- XFER-01: transferencia/declinación con custodia.
- SLA-03–05 y US-27: relojes, pausas, revisiones, alertas y worker.
- US-20–22, US-28: consultas y vistas sobre el modelo; no necesitan otra tabla por pantalla.
- US-23–26: operación, outbox, avisos y exportaciones.
- AUTH-01–03: vínculo de identidad y servicio opcional separado.
