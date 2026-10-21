# Plan de producto e implementación: agencia con clientes y proyectos privados

Versión 3 del plan · Estado: propuesto, pendiente de implementar.
Escenario confirmado: una agencia administra proyectos de varios clientes. Objetivo profesional: full stack con AWS.
Este documento convierte la revisión de código en requisitos, decisiones iniciales y un backlog verificable. Los valores de límites y las reglas de negocio son propuestas ajustables; no son compromisos comerciales acordados con un cliente real.

Alcance ampliado confirmado: áreas y responsables, niveles de solicitante, productos, catálogo de categorías/servicios/subservicios, cobertura contractual, calendarios laborales y festivos, matriz SLA y CMDB relacionada con productos y servicios. El backlog vigente con orden, dependencias y criterios de aceptación está en [historias-usuario-agencia.md](./historias-usuario-agencia.md).

La revisión de SLA añade pausas por reloj, transferencia con custodia, cambios de presupuesto auditados y autenticación separable. La implementación sigue los incrementos M0–M6 de [diseño de SLA y datos](./diseno-sla-datos-autenticacion.md): empezar con catálogo/calendario mínimos y completar la CMDB después. El [modelo objetivo](../docs/database/README.md) es una referencia, no la primera migración.

## 1. Qué compraría como cliente

Necesitaría registrar solicitudes sin perderlas en correos, conocer responsable y fecha objetivo, aportar información, validar la solución y revisar lo entregado. Esperaría que mis proyectos, archivos y conversaciones fueran privados frente a otros clientes.

Como agencia necesitaría una bandeja de trabajo, clasificación y asignación, notas internas, trazabilidad, prioridades claras, alertas de retrasos y datos para conversar con el cliente sobre el servicio. También necesitaría recuperar errores de operación y saber cuánto cuesta mantener el sistema.

La unidad de aislamiento será **Agencia → Cliente → Proyecto**. Los tickets consumen datos maestros publicados: membresía/nivel, producto, servicio/subservicio, CI, ruta de atención, calendario y política SLA. Una instalación representa inicialmente una agencia. La posibilidad de alojar varias agencias independientes es una extensión posterior.

Principios del producto:
- Cada proyecto pertenece a un único cliente; ninguna selección en la interfaz concede permisos.
- Los empleados trabajan solo en los proyectos a los que están asignados.
- Los contactos del cliente solo acceden a proyectos donde fueron invitados.
- La información interna de la agencia nunca se comparte por defecto.
- Resolver una solicitud y confirmar su cierre son acciones distintas.
- Se conserva la historia cuando se desactiva una cuenta o se archiva un proyecto.
- Las primeras entregas deben completar recorridos reales de principio a fin.

## 2. Alcance y entregas

**Piloto seguro, F0–F5:** clientes/proyectos privados, invitaciones, roles, sesiones, áreas, niveles, productos, catálogo publicado, cobertura, calendarios, CMDB, enrutamiento y políticas SLA; después creación/edición/asignación, flujo de estados, resolución y cierre, conversación pública/notas internas, archivos verificados, historial, búsqueda/paginación, lista/Kanban, portal del cliente y despliegue operativo en AWS.

**Versión operativa, F6–F7:** avisos confiables, preferencias, SLA contractuales, carga de trabajo, reportes/exportaciones y evidencia de rendimiento.

**Extensiones, F8:** múltiples agencias, integraciones, planificación de desarrollo y funciones de IA con evaluación.

Las pruebas, accesibilidad, permisos, observabilidad y documentación acompañan cada entrega. F5 es la puerta de aceptación para exponer el piloto; no se espera a F5 para preparar Docker, CI o la infraestructura.

Fuera de la primera versión: facturación/cobranza, CRM comercial, aplicación móvil nativa, constructor arbitrario de workflows, chat en tiempo real, registro público de empresas y migración a microservicios. La información comercial del contrato puede empezar como referencia y política SLA; no requiere construir un ERP.

## 3. Recorrido real de ejemplo

1. El administrador de la agencia crea Cliente Alfa y su proyecto Portal de proveedores.
2. Asigna un ProjectManager y un Agent; invita al responsable del cliente como ClientManager y a un solicitante como Requester.
3. El solicitante elige el servicio/subservicio permitido y el CI afectado; el sistema obtiene su nivel, valida cobertura, calcula prioridad/SLA y enruta la solicitud.
4. El solicitante crea “No puedo descargar una factura”, agrega pasos, resultado esperado e impacto y recibe una clave estable con fecha de primera respuesta y resolución.
5. El agente inicia trabajo y agrega una nota interna con diagnóstico. El cliente no recibe esa nota, sus adjuntos ni su notificación.
6. Si falta información, el agente pregunta al cliente y cambia a Esperando al cliente.
7. El cliente responde; el ticket vuelve a trabajo activo si conserva responsable válido, o a Pendiente si necesita reasignación.
8. El agente registra la solución y lo marca Resuelto.
9. El solicitante original o ClientManager confirma el cierre. Si persiste el problema, solicita reapertura con motivo.
10. Un usuario de Cliente Beta no puede encontrar el ticket, obtener su URL de archivo, verlo en un reporte ni inferirlo por contadores.

El mismo empleado puede trabajar para Alfa y Beta, pero cada consulta y cambio conserva el contexto del proyecto autorizado.

## 4. Roles y reglas de acceso

El actual User.role global no basta. Separar administración de la agencia, relación con clientes y rol dentro de cada proyecto.

**AgencyAdmin:** administra empleados, clientes, acceso y configuración general. No se crea mediante registro público. La lectura de contenido privado exige pertenencia explícita al proyecto; una concesión de acceso administrativo queda auditada. No puede borrar auditoría desde la aplicación.

**ProjectManager (interno):** gestiona miembros del proyecto, clasificación, prioridad, responsables, transiciones, participantes y archivo. Ve trabajo compartido y trabajo interno del proyecto.

**Agent (interno):** lee los tickets de sus proyectos y sus notas internas; comenta y trabaja los tickets que tiene asignados. Puede tomar uno sin responsable si está Pendiente. No cambia permisos, prioridad definitiva ni asigna el trabajo de otra persona.

**ClientManager (externo):** responsable del cliente invitado al proyecto. Ve todos los tickets de visibilidad Client del proyecto y sus reportes públicos; crea solicitudes, aporta comentarios, valida soluciones y solicita reaperturas. No gestiona roles internos, notas internas o asignaciones.

**Requester (externo):** ve los tickets Client de los que es solicitante o donde es participante explícito; puede crearlos, aportar información y confirmar la solución de los propios. Edita título/descripción propios solo en Nuevo y antes de la primera atención pública. No accede a reportes generales del proyecto.

Reglas obligatorias:
- Manager/Agent requieren relación de empleado activo; ClientManager/Requester requieren contacto activo del cliente del proyecto.
- Estar en ClientMember no da acceso a todos sus proyectos: se exige ProjectMember activo.
- Visibilidad de ticket: Internal (solo equipo interno) o Client (según rol y relación con ese ticket). Un contacto externo solo puede crear Client.
- En V1 no se cambia directamente la visibilidad de un ticket con contenido. Para comunicar trabajo interno, el gestor crea un ticket Client con información revisada y un enlace que no revele contenido oculto.
- ClientManager puede confirmar cualquier solución Client del proyecto; Requester solo la propia. El gestor puede cerrar con motivo si necesita actuar en nombre del cliente.
- Un participante necesita ser miembro activo del proyecto. Agregarlo puede ampliar su acceso y solo lo hace ProjectManager. Un seguidor solo recibe avisos: seguir no concede acceso.
- No retirar al último gestor activo del proyecto ni al último administrador activo de la agencia. Transferir antes la responsabilidad.
- Al quitar a un agente, reasignar o desasignar su trabajo pendiente en una operación consistente; no borrar sus comentarios.
- Al revocar un contacto en un cliente, retirar su acceso a los proyectos de ese cliente; no desactivar otras relaciones legítimas de la misma cuenta.
- Archivar un cliente congela mutaciones en sus proyectos; archivar un proyecto lo deja de consulta para miembros autorizados. Restaurar no reactiva cuentas ni membresías revocadas.
- No mover un proyecto existente entre clientes en V1. Evita traslados accidentales de datos, historial y archivos.

Implementar una política única por recurso/acción, denegación por defecto y pruebas negativas de cada ruta. La UI refleja permisos, pero la API decide. Referencia: [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## 5. Ciclo de vida del ticket

Flujo principal: **Nuevo → Pendiente → En progreso → Resuelto → Cerrado**.
Ramas: **En progreso ↔ Esperando al cliente** y **Cancelado** con motivo.

Transiciones y condiciones:
- Nuevo → Pendiente: ProjectManager clasifica; prioridad y tipo confirmados. Puede seguir sin asignar.
- Pendiente → En progreso: Agent asignado o ProjectManager; exige responsable activo. Tomar trabajo sin asignar debe ser atómico.
- En progreso → Esperando al cliente: Agent asignado/Manager; exige una pregunta pública y un ticket Client. La espera no es un estado para esconder trabajo detenido internamente.
- Esperando al cliente → En progreso: respuesta pública del contacto autorizado con responsable todavía activo. Si no hay responsable válido, pasa a Pendiente; conserva historia de la espera.
- En progreso → Resuelto: Agent asignado/Manager; exige código y explicación de resolución. Adjuntos opcionales.
- Resuelto → Cerrado: solicitante original con rol Requester, ClientManager o ProjectManager con motivo. Los tickets Internal los confirma ProjectManager.
- Resuelto → En progreso/Pendiente: el solicitante original con rol Requester o ClientManager puede reabrir durante una ventana inicial propuesta de 7 días con motivo; Manager puede hacerlo fuera de la ventana. Elegir estado según exista responsable.
- Cerrado → Pendiente: solo ProjectManager con motivo; un cliente fuera de la ventana presenta una solicitud relacionada.
- Nuevo → Cancelado: solicitante original o ProjectManager. Pendiente/En progreso/Esperando al cliente → Cancelado: ProjectManager, con motivo.
- Cancelado no se reactiva en V1; se crea un ticket relacionado.
- Cerrado y Cancelado son de consulta: no admiten nuevos comentarios, archivos ni edición de campos. Reabrir es la excepción explícita. Resuelto sí admite comentarios y validación.
- Todo estado activo puede marcarse bloqueado mediante motivo y dependencia dentro del alcance autorizado. “Bloqueado” es un atributo; no agrega otra columna obligatoria ni pausa SLA por sí solo.
- Un proyecto/cliente archivado impide todas estas transiciones.

Códigos de resolución iniciales: solucionado, respondido, alternativa temporal, duplicado, no reproducible, no procede. Duplicado exige referencia autorizada; no procede exige explicación. No confundir estado con resolución.

No permitir saltos arbitrarios mediante un PATCH genérico. La API devuelve acciones disponibles y condiciones; arrastrar una tarjeta invoca la misma transición validada.

## 6. Campos y validaciones propuestas

La API valida estructura, reglas de negocio y relaciones. El frontend repite validaciones para ayudar al usuario; no es la barrera de seguridad. La DB impone unicidad, relaciones y restricciones posibles. Referencia: [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

**Cliente:** nombre 2–120 caracteres; slug normalizado único en la agencia; estado Active/Paused/Archived; contactos y política de servicio. Los identificadores internos los genera el servidor.

**Proyecto:** nombre 3–100; clave mayúscula de 2–10 letras, estable; descripción opcional hasta 2,000; cliente obligatorio y no editable en V1; gestor activo. Mantener clave global única en la instalación aprovecha el modelo actual.

**Ticket:** título 3–160; descripción 20–10,000 después de trim; tipo permitido (Bug, Task, Story, Improvement y Request); impacto/urgencia declarados por cliente y prioridad confirmada por gestor. Descripción en columna de texto y límites equivalentes en API/UI.

**Plantillas:** Bug pide pasos, resultado esperado/actual y entorno; Request pide necesidad y resultado esperado; Task/Story piden criterios de aceptación. No exigir versiones o pasos de reproducción a una solicitud administrativa.

**Datos del servidor:** id, clientId derivado del proyecto, key/number, reporterId, actor, fechas, estado inicial y version no se aceptan como campos libres de creación. Rechazar campos desconocidos cuando prevenga asignación masiva accidental.

**Alta en nombre del cliente:** comando reservado a ProjectManager que valida al solicitante como contacto y miembro del mismo proyecto; reporterId identifica al solicitante y createdById al actor que registró. Un externo no puede elegir a otro solicitante. Ambos quedan auditados.

**Responsable:** empleado activo, miembro Agent/Manager del mismo proyecto. Desasignar se permite solo con regla explícita; no dejar En progreso sin responsable.

**Prioridad:** Low/Medium/High/Critical como propuesta inicial. El cliente informa impacto y urgencia, pero no se autoconcede un SLA crítico. Los cambios requieren permiso y quedan registrados.

**Fechas:** ISO válido; guardar instantes UTC y presentar zona del proyecto. Una fecha objetivo de un ticket nuevo no precede a su creación; cualquier ajuste posterior que deje trabajo vencido requiere motivo del gestor. dueAt acordado y vencimiento calculado por SLA son conceptos diferentes.

**Comentarios:** 1–5,000 caracteres no vacíos después de trim; Public/Internal; externos solo Public. Propuesta: autor puede corregir el suyo durante 15 minutos si el proyecto está activo; guardar versión previa protegida. Moderación posterior por gestor con motivo y borrado lógico. No aceptar HTML arbitrario; si se incorpora Markdown, sanitizar y restringir enlaces.

**Etiquetas:** hasta 10 por ticket y 30 caracteres por etiqueta; catálogo de proyecto. Relaciones entre tickets autorizados, sin autorreferencias; dependencias sin ciclos cuando se implementen.

**Listados:** filtros permitidos, enums/UUID/fechas validados, tamaño de página predeterminado 25 y máximo 100; orden estable con id como desempate; rango de reporte acotado. Aplicar alcance de permisos antes de paginar y calcular contadores.

**Ediciones concurrentes:** exigir version; si la versión ya cambió, devolver 409 con información autorizada para recargar y revisar. No sobrescribir campos silenciosamente. Para crear, usar una clave de idempotencia acotada al actor/proyecto y un hash del cuerpo; misma clave con otro cuerpo produce conflicto.

## 7. Seguridad de cuentas, sesiones y archivos

### Cuentas y sesiones

- Alta inicial de administrador por procedimiento confiable; acceso ordinario por invitación. Tokens de invitación/recuperación aleatorios, hasheados en DB, con uso único y vencimiento.
- Mantener el JWT existente al principio, añadiendo sid y una sesión revocable en DB. Verificar estado de usuario, sesión y permisos actuales en cada petición; no confiar en roles antiguos del token.
- Logout, cambio de contraseña y desactivación revocan sesiones en servidor. Expiración absoluta/inactividad configurables; el reloj y la cookie no extienden permisos por sí solos.
- Esperar la comprobación de sesión antes de decidir la ruta del frontend. Limpiar TanStack Query al salir/cambiar de cuenta; claves de caché con identidad/contexto.
- Cookie HttpOnly/Secure en producción, SameSite apropiado para el despliegue y protección CSRF de operaciones con cookie. Control de Origin y token CSRF según diseño; CORS no sustituye estos controles.
- Limitar login, recuperación, invitaciones, comentarios, búsquedas y creación de URLs de subida; límites consistentes entre réplicas y errores genéricos que eviten enumerar cuentas.
- Migrar el hasher a Argon2id si se mantiene autenticación propia, verificando hashes bcrypt existentes y actualizándolos tras login correcto. Evitar truncar contraseñas; respetar el límite de bcrypt durante la transición. MFA para administradores antes de habilitar uso con información real sensible; login federado administrado es una alternativa posterior a la base.
- Headers de seguridad/CSP, HTTPS, dependencias analizadas, secretos fuera de Git y logs. No almacenar contraseñas, cookies ni URLs firmadas en auditoría.

Referencias: [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

### Adjuntos

Límites iniciales de negocio: 5 MiB por archivo, 10 archivos activos por ticket y cuota de pendientes por usuario. Tipos iniciales PNG/JPEG/PDF; preservar archivos GIF existentes para revisión de migración. Los límites son configurables y se reservan antes de autorizar subidas concurrentes.

Attachment reemplaza el JSON de claves: dueño, ticket, visibilidad, nombre original, tamaño, tipo detectado, clave/version de almacenamiento y estado.
Flujo: Pending → Quarantined → Ready o Rejected. Solo Ready puede descargarse.

El servidor autoriza una subida pendiente a una clave aleatoria de cuarentena, impone tamaño, verifica objeto/contenido y análisis de malware. Después copia la versión exacta verificada a una clave final que el cliente no puede sobrescribir. Una URL todavía válida no debe permitir cambiar el archivo ya aprobado. Fallo del análisis mantiene cuarentena.

Confirmar por attachmentId, no por una clave arbitraria del bucket. Revalidar permisos en confirmación/descarga; adjuntos de nota interna conservan ese alcance. Usar nombres de descarga seguros. Limpiar pendientes/huérfanos con TTL y registrar borrado lógico; eliminación física reintentable.

Una URL firmada ya emitida conserva su validez hasta vencer; proponer TTL corto de 60 segundos. Si el cliente requiere revocación inmediata, servir descargas a través de un punto que vuelva a autorizar cada petición. Referencia: [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## 8. Notificaciones, SLA y reportes

**Eventos de aviso:** asignación, comentario público, mención autorizada, solicitud de información, resolución, reapertura y SLA próximo a vencer/incumplido. Notas internas solo notifican a empleados autorizados.

Destinatarios: participantes/seguidores autorizados, solicitante y responsable según evento. Revalidar acceso al enviar; correo con contenido mínimo y enlace autenticado. No enviar al propio actor por defecto. Preferencias por canal, evitando duplicados innecesarios.

Guardar evento y cambio de negocio en la misma transacción cuando se incorpore outbox. Publicador → SQS → worker con eventId, backoff, visibilidad de fallos y dead-letter queue. Deduplicar por evento/destinatario/canal; no prometer entrega externa exactamente una vez si el proveedor no permite garantizarla. Fuente: [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

**SLA:** habilitado para Bug/Request cuando el contrato lo define; tareas/historias pueden usar fechas objetivo sin SLA. Dos relojes: primera respuesta pública humana del equipo y resolución. Mensajes automáticos/notas internas no cuentan como primera respuesta.

Calendario por proyecto con zona horaria, horario laboral y festivos; también puede configurarse 24×7. No fijar cifras comerciales sin acordarlas. La espera de información puede pausar resolución según contrato; nunca borrar un incumplimiento pasado. Guardar versión de política y explicar cualquier recálculo por prioridad. Resolver detiene el ciclo; reabrir crea un ciclo trazable sin alterar el histórico. Cierre no equivale a fecha de resolución.

Reportes con definiciones:
- Pendientes operativos: Nuevo/Pendiente/En progreso/Esperando al cliente; Resuelto pendiente de validación se muestra separado.
- Vencidos: ciclos SLA activos cuyo deadline contractual ya pasó; distinguir de fecha objetivo vencida.
- Primera respuesta: tiempo laboral desde creación hasta primera respuesta pública humana del equipo.
- Resolución: tiempo del ciclo conforme a calendario/pausas; mostrar aparte tiempo transcurrido total cuando sea útil.
- Cumplimiento: ciclos elegibles completados dentro del SLA / ciclos elegibles completados del periodo; mostrar pendientes vencidos aparte para no ocultarlos.
- Reaperturas: número de eventos y tickets distintos, etiquetados separadamente.
- Carga: tickets activos asignados por agente; no interpretarla por sí sola como productividad.
- Tickets por cliente/proyecto/tipo/prioridad; clientes solo reciben su alcance público.

Exportación CSV solo para Manager y ClientManager dentro de su alcance, con límite y neutralización de fórmulas. Exportaciones grandes mediante job, expiración y nueva autorización para descarga. Reportes y caché nunca agregan primero datos privados para filtrarlos después.

## 9. Modelo de datos propuesto y migración

Mantener Prisma/MySQL. Añadir modelos según la fase:
- Client: frontera comercial de aislamiento, estado y referencias de servicio.
- AgencyMember / ClientMember: empleados y contactos activos; una cuenta puede tener relaciones independientes.
- Project: clientId obligatorio, estado, gestor, zona horaria y contador lastTicketNumber.
- ProjectMember: rol, estado y fechas; unique(projectId,userId).
- Invitation y Session: alcance/rol o sesión, vencimiento, consumo/revocación; hashes de secretos.
- Ticket: createdById para autor del registro y reporterId para solicitante; number, version, visibility, prioridad, clasificación, fechas objetivo/resolución/cierre, motivo/resolución y bloqueo. unique(projectId,number), además de key única.
- TicketParticipant / TicketWatcher: acceso explícito frente a preferencias de avisos.
- Comment: visibilidad, version/editedAt, borrado lógico y revisiones autorizadas.
- Attachment: estado de verificación, metadatos, propietario, alcance y referencia al objeto exacto.
- TicketActivity y AuditEvent: cambios funcionales y acciones de seguridad, con actor, alcance y requestId. Proyección pública revisada; no exponer historial interno.
- Label / TicketLabel / TicketRelation: clasificación y relaciones.
- F6: OutboxEvent, Notification, DeliveryAttempt y NotificationPreference.
- F7: SlaPolicy versionada, BusinessCalendar, SlaCycle y periodos de pausa.
- IdempotencyRecord con clave, actor, alcance, hash de solicitud, resultado y TTL.

Migración por expandir → completar datos → verificar → restringir → retirar campos antiguos:
1. Backup y ensayo en DB aislada.
2. Añadir estructuras inicialmente compatibles. Los proyectos actuales no tienen cliente: asignarlos con un mapeo revisado. Mientras no esté clasificado, el proyecto no admite acceso externo.
3. Revisar cuentas Admin históricas antes de conceder AgencyAdmin; el registro actual podía solicitar ese rol. No heredar privilegios automáticamente.
4. Migrar Open → Nuevo, InProgress → En progreso y Closed → Cerrado. Marcar resolución histórica desconocida; no inventar tiempos o confirmaciones.
5. Calcular contador desde el mayor sufijo válido por proyecto, no desde count; revisar claves atípicas antes de imponer restricciones.
6. Convertir JSON de adjuntos a filas de verificación pendiente y comprobar propiedad/existencia antes de habilitar descargas.
7. Backfill de membresías con privilegio mínimo y revisión de gestores; externos nunca se vuelven agentes por un rol global.
8. Impedir borrados de usuario que eliminen comentarios en cascada. Desactivar/pseudonimizar cuando corresponda a la política acordada, conservando relaciones históricas necesarias.
9. Activar restricciones y nueva API/UI; retirar compatibilidad solo tras comprobar los datos.
10. Reversión de aplicación solo mientras el esquema sea compatible; restauración documentada para fallos de migración. No ejecutar migraciones destructivas como parte rutinaria del arranque de cada réplica.

## 10. Cambios de código y contratos

Conservar el monolito modular y las capas actuales. El plan no exige cambiar de framework.

- Domain: reglas de estados, roles/capacidades, prioridad y resolución; entidades sin Express/Prisma. Reloj inyectable para probar vencimientos.
- Application: ActorContext confiable, políticas de acceso, comandos explícitos, casos de lectura paginados y límites de transacción. Mutación, auditoría y posteriormente outbox deben confirmar juntas.
- Repositories: sustituir getAll sin alcance por búsquedas autorizadas; comandos para añadir/quitar miembros y actualizar campos/version. El update actual de proyectos solo agrega miembros y no sirve como operación de reemplazo.
- Infrastructure: adaptadores Prisma/S3/hash/sesión, manejo central de errores, logger, validadores de entorno y jobs.
- Frontend: módulos clients/projects/tickets/members/notifications/reports, DTOs públicos y manejo tipado de errores. No importar modelos privados del backend.
- UI: portal del cliente y bandeja interna comparten componentes, pero reciben respuestas según permisos. allowedActions guía controles; no sustituye validación del backend.
- API: catálogo OpenAPI coherente; mantener versión compatible durante migración. Acciones de asignar/transicionar/resolver/reabrir separadas del PATCH de título/descripción. El servidor deriva clientId al cargar el proyecto.
- Respuestas: code, message, fieldErrors cuando proceda y requestId. 401 sesión, 403 acción prohibida en recurso visible, 404 inexistente/no visible, 409 conflicto, 422 validación, 413 tamaño y 429 límite.
- Listado de usuarios: devolver solo contactos/empleados elegibles y visibles para la operación, no un directorio global con correos.
- DB: columnas Text para contenidos, índices según filtros reales, SQL parametrizado y traducción de errores de unicidad. Medir antes de añadir cachés.
- Infraestructura: Docker reproducible, Terraform, GitHub Actions/OIDC, S3/CloudFront, ECS/ECR, RDS privada, IAM, secretos y logs. Presupuestar red/ALB/RDS y programar retención; no asumir free tier.

Archivos iniciales de intervención:
- Backend/src/infrastructure/http/routes/user.routes.ts y validators/user.schema.ts: registro y privilegios.
- Backend/src/application/use-cases/tickets/* y project/*: actor, autorización y reglas.
- Backend/src/infrastructure/http/controllers/ticket.controller.ts: errores y comandos.
- Backend/src/infrastructure/repositories/PrismaTicketRepository.ts y PrismaProjectRepository.ts: alcance, concurrencia y cambios específicos.
- Backend/prisma/schema.prisma y migraciones: relaciones, historial y restricciones.
- Backend/src/infrastructure/storage/S3StorageService.ts: cuarentena y objetos verificados.
- Frontend/src/router/index.ts, App.vue y auth: inicialización de sesión.
- Frontend/src/modules/tickets/* y proyectos: formularios, vistas, acciones y consultas.

## 11. Backlog ordenado

Esta sección conserva la primera agrupación por fases como contexto. Para implementar, usar el backlog vigente de [historias-usuario-agencia.md](./historias-usuario-agencia.md) y los cortes M0–M6: configuración mínima primero; catálogo, CMDB y reglas avanzadas después de un flujo funcional de tickets con SLA.

Cada elemento es trabajo pendiente, no una función ya terminada. Dividirlo en PRs pequeños sin separar de sus pruebas los cambios de permisos o de integridad.

### F0 — Base reproducible y correcciones urgentes

Entrega: Preparación. Depende de: Ninguna.
Objetivo: Poder ejecutar y comprobar el sistema sin mantener los fallos conocidos.

- [ ] **BASE-01 — Arranque y CI mínimos**

  Trabajo: Fijar runtime y gestor de paquetes; instalación con lockfile; seed ficticio; comandos lint/typecheck/test/build y CI de PR con MySQL aislado.

  Aceptación: Un checkout limpio arranca con instrucciones y CI ejecuta al menos un recorrido HTTP con DB real.

- [ ] **SEC-01 — Cerrar registro y accesos actuales**

  Trabajo: Retirar role del registro público; actor obligatorio en casos de uso; comprobar membresía en tickets, proyectos, usuarios, comentarios y firma de URLs.

  Aceptación: Una cuenta sin membresía no obtiene datos ni modifica recursos al cambiar identificadores; el registro nunca crea Admin.

- [ ] **FIX-01 — Responder siempre y validar entradas**

  Trabajo: Corregir catch de addAttachment; manejo uniforme de errores; validar body, params y query; límites de payload; variables de entorno completas.

  Aceptación: Un fallo inyectado de persistencia devuelve un error controlado, requestId y ninguna información interna.

### F1 — Clientes, identidad y permisos

Entrega: Piloto. Depende de: F0.
Objetivo: Aislar clientes y proyectos desde la primera versión.

- [ ] **CLI-01 — Clientes y proyectos privados**

  Trabajo: Crear Client y ClientMember para contactos, AgencyMember para empleados y Project.clientId obligatorio; alta/pausa/archivo del cliente y proyectos con membresía explícita.

  Aceptación: Dos clientes y dos proyectos del mismo cliente permanecen aislados en API, archivos, búsquedas, reportes, caché y trabajos de fondo; clientId enviado no concede acceso.

- [ ] **IAM-01 — Roles internos y del cliente**

  Trabajo: ProjectManager y Agent para empleados; ClientManager y Requester para contactos del cliente; visibilidad Internal/Client y políticas de campos y acciones.

  Aceptación: Un contacto externo no obtiene un rol interno; clientes solo reciben tickets Client de su alcance y nunca notas internas o metadatos derivados.

- [ ] **IAM-02 — Invitaciones y ciclo de usuarios**

  Trabajo: Invitar a empleados/contactos al cliente y proyecto correctos con token de un uso; retirar miembros; transferir responsabilidad y reasignar pendientes.

  Aceptación: No se elimina al último gestor activo; una invitación usada/caducada falla; retirar un miembro revoca acceso y conserva autorías.

- [ ] **IAM-03 — Sesiones y recuperación de acceso**

  Trabajo: Sesión revocable ligada al JWT mediante sid; controles servidor de estado y expiración; recuperación por token hasheado de un uso; MFA administrativo, CSRF, rate limit y cierre de sesión.

  Aceptación: Logout, cambio de contraseña o desactivación invalidan sesiones en servidor; recarga de ruta protegida y cambio de cuenta funcionan sin datos de la sesión previa.

### F2 — Proyectos y ciclo completo de tickets

Entrega: Piloto. Depende de: F1.
Objetivo: Que un equipo pueda registrar, clasificar, trabajar y cerrar una solicitud.

- [ ] **PRJ-01 — Administrar y archivar proyectos**

  Trabajo: Editar proyecto dentro de su cliente; clave estable; miembros y responsables; archivar/restaurar con motivo. No mover proyectos entre clientes en V1.

  Aceptación: Un proyecto archivado sigue consultable por usuarios autorizados, pero rechaza nuevas mutaciones; no se pierde historia.

- [ ] **TKT-01 — Crear, editar y asignar con reglas**

  Trabajo: Completar campos, etiquetas y plantillas por tipo; asignar/desasignar; responsable activo del proyecto; validaciones y permisos por campo.

  Aceptación: Requester solo edita campos permitidos propios en Nuevo antes de atención; Agent trabaja tickets asignados; ProjectManager controla prioridad y responsable; ClientManager ve lo compartido del proyecto.

- [ ] **TKT-02 — Transiciones y resoluciones**

  Trabajo: Máquina de estados y allowedActions; motivos de espera/cancelación/reapertura, resolución y validación por el cliente o ProjectManager. Tickets internos los valida el gestor.

  Aceptación: Las transiciones válidas producen historial; una transición inválida falla aunque se invoque directamente la API.

- [ ] **DATA-01 — Concurrencia e historial atómico**

  Trabajo: Contador por proyecto transaccional; version para control optimista; comandos específicos; auditoría junto a la mutación; idempotencia de creación.

  Aceptación: Dos ediciones con la misma version no se pisan; solicitudes simultáneas generan claves únicas; repetir una creación con la misma clave de idempotencia devuelve el mismo resultado.

### F3 — Colaboración y archivos seguros

Entrega: Piloto. Depende de: F2.
Objetivo: Compartir contexto y evidencias sin filtrar información.

- [ ] **COL-01 — Conversación pública y notas internas**

  Trabajo: Comentarios con visibilidad; edición propia por ventana definida; borrado lógico con motivo; menciones limitadas a personas autorizadas.

  Aceptación: ClientManager/Requester no reciben tickets Internal, notas internas ni adjuntos, snippets, eventos o contadores que los revelen.

- [ ] **COL-02 — Participantes, seguidores e historial**

  Trabajo: Separar participantes con acceso de seguidores que reciben avisos; actividad visible según rol; etiquetas y enlaces duplicado/relacionado.

  Aceptación: Un seguidor necesita acceso previo; un participante externo debe ser contacto activo del mismo cliente y miembro del proyecto; enlaces ocultos no revelan datos.

- [ ] **FILE-01 — Ciclo de subida y descarga**

  Trabajo: Attachment relacional; subida pendiente a cuarentena; cuotas; verificación y análisis; copia de versión verificada a clave final; descarga autorizada y limpieza.

  Aceptación: Un objeto de otro ticket, sobredimensionado, alterado tras la validación o pendiente de análisis no queda disponible; no se duplican adjuntos al reintentar.

### F4 — Experiencia diaria y primera entrega usable

Entrega: Piloto. Depende de: F3.
Objetivo: Encontrar y atender trabajo rápidamente en escritorio y móvil.

- [ ] **UX-01 — Bandejas, búsqueda y paginación**

  Trabajo: Portal del cliente separado de bandeja de agencia; mis solicitudes, trabajo asignado y pendientes; búsqueda/paginación en servidor y filtros por cliente/proyecto en URL.

  Aceptación: El servidor pagina con límite máximo, las cuentas reciben solo su alcance y los enlaces conservan los filtros tras recargar.

- [ ] **UX-02 — Kanban y detalle del ticket**

  Trabajo: Lista y tablero sobre la misma API; drag and drop con alternativa de teclado; panel de acciones permitidas; cronología y errores recuperables.

  Aceptación: Mover una tarjeta aplica exactamente las mismas reglas que el detalle; un 409 muestra conflicto y no descarta silenciosamente el trabajo.

- [ ] **UX-03 — Accesibilidad y contrato**

  Trabajo: Errores por campo, foco, labels, estados vacíos/espera, confirmaciones; OpenAPI y DTOs de respuesta; sincronizar tipos sin exponer modelos de DB.

  Aceptación: El recorrido crear → asignar → comentar → resolver → cerrar funciona por teclado y en móvil; pruebas de navegador cubren estados de error.

### F5 — Despliegue y operación del piloto

Entrega: Piloto en AWS. Depende de: F4; preparar Docker y Terraform desde F0.
Objetivo: Entregar un sistema reproducible y recuperable.

- [ ] **OPS-01 — Infraestructura y entrega**

  Trabajo: Docker/ECR, Terraform, S3/CloudFront, ECS/ALB, RDS privada, IAM, secretos y OIDC; migraciones controladas y rollback de aplicación.

  Aceptación: Un ambiente se crea desde código; smoke test confirma la entrega; versión anterior y esquema compatible permiten recuperar un despliegue.

- [ ] **OPS-02 — Operación básica y recuperación**

  Trabajo: Health/readiness, SIGTERM, logs redactados con requestId, métricas/alertas, backups y prueba de restauración; presupuestos y apagado.

  Aceptación: Hay evidencia de restauración, diagnóstico de un fallo y costo estimado con supuestos; no se anuncian cifras de disponibilidad no medidas.

- [ ] **QA-01 — Aceptación con usuarios de ejemplo**

  Trabajo: Dos clientes y varios proyectos privados, cuentas de cada rol, datos ficticios y demo guiada; verificar aislamiento, sesiones, archivos, concurrencia y consultas.

  Aceptación: El guion de aceptación completo pasa y no quedan accesos cruzados ni solicitudes que terminen sin respuesta.

### F6 — Notificaciones confiables

Entrega: Versión operativa. Depende de: F5; base de auditoría de DATA-01.
Objetivo: Avisar cambios sin bloquear ni perder operaciones.

- [ ] **NTF-01 — Bandeja y preferencias**

  Trabajo: Avisos por asignación, comentario público, mención y resolución; leído/no leído; preferencias y destinatarios autorizados.

  Aceptación: Los avisos no filtran proyectos o notas internas y los cambios de permisos se revalidan antes del envío.

- [ ] **NTF-02 — Outbox, cola y procesamiento**

  Trabajo: Evento en la transacción; publicador reintentable; SQS y worker; deduplicación por evento/destinatario/canal; backoff y dead-letter queue.

  Aceptación: Con el proveedor caído el ticket se guarda y el evento permanece pendiente; al recuperarse se procesa y el manejo de posibles duplicados está probado.

### F7 — SLA, carga de trabajo y reportes

Entrega: Versión operativa. Depende de: F6; historial confiable desde F2.
Objetivo: Detectar retrasos y medir el servicio con definiciones verificables.

- [ ] **SLA-01 — Políticas y relojes de SLA**

  Trabajo: SLA según contrato del cliente/proyecto, respuesta y resolución; calendario/zona; pausas; versión de política; ciclos de reapertura y alertas.

  Aceptación: Reloj de prueba cubre fin de semana, festivos, cambios de horario, espera y reapertura; cambiar prioridad no borra incumplimientos.

- [ ] **REP-01 — Dashboard y exportación acotada**

  Trabajo: Pendientes, vencidos, antigüedad, carga por agente, resolución y reaperturas; filtros de fechas; CSV autorizado y seguro.

  Aceptación: Cada indicador coincide con fixtures calculados; se aplica el alcance antes de agregar o exportar; CSV neutraliza fórmulas.

- [ ] **PERF-01 — Medir y optimizar**

  Trabajo: Dataset representativo, k6 en ensayo, EXPLAIN e índices; trazas OpenTelemetry; límites del pool y tiempos de espera.

  Aceptación: Se publica carga, duración, recursos, p95 y errores antes/después; objetivos se distinguen de resultados reales.

### F8 — Extensiones según uso observado

Entrega: Opcional. Depende de: Piloto y necesidad validada.
Objetivo: Expandir el producto sin cargar la primera entrega.

- [ ] **EXT-01 — Varias agencias como SaaS**

  Trabajo: Solo si se decide vender el sistema a otras agencias: añadir Organization y una nueva frontera de aislamiento por encima de Client.

  Aceptación: Migrar la agencia inicial y probar aislamiento completo entre organizaciones antes de habilitar onboarding multiagencia.

- [ ] **EXT-02 — Integraciones y automatizaciones**

  Trabajo: API tokens acotados, webhooks firmados y reintentables, enlace a commits/PRs y reglas simples; validar destinos de red.

  Aceptación: Token revocado deja de funcionar, webhook repetido no aplica efectos duplicados y destinos privados no permitidos son rechazados.

- [ ] **EXT-03 — Planificación y conocimiento**

  Trabajo: Sprints/versiones, subtareas/dependencias sin ciclos, artículos de resolución y plantillas adicionales según feedback.

  Aceptación: Cada extensión tiene un caso de uso observado y permisos coherentes con el proyecto.

- [ ] **EXT-04 — IA evaluada y supervisada**

  Trabajo: Resumen o triage sugerido, fuentes y aislamiento si hay RAG, conjunto de evaluación y límites de costo.

  Aceptación: Se mide calidad y latencia; la IA no cambia estado, prioridad o permisos sin una acción humana autorizada.


## 12. Estrategia de pruebas y puertas de aceptación

Pruebas de dominio/casos de uso: políticas por actor/recurso/estado; transiciones; contador; plazos con reloj controlado. Pruebas HTTP: contrato, cookies/CSRF, errores y consultas. Integración con MySQL real: unicidad, transacciones, rollback y carreras. S3: prueba contractual del adaptador y ensayo acotado del flujo real; un mock no demuestra políticas del bucket. Playwright: recorridos de agencia y cliente, teclado y móvil.

La matriz de pruebas varía cliente A/B, proyecto A1/A2, empleado/contacto, rol, membresía activa/revocada, ticket propio/ajeno, Internal/Client, nota Public/Internal y estado activo/archivado.

Escenarios de aceptación prioritarios:
1. Cliente Alfa no encuentra datos de Beta por ID, búsquedas, exportaciones, contadores o archivos.
2. Un contacto de Alfa en proyecto A1 no accede a A2 sin invitación.
3. Un cliente no puede pedir role=ProjectManager ni hacerse pasar por otro actor en el cuerpo.
4. Una nota interna no aparece en cronología pública, correos, resultados o descargas.
5. Retirar un miembro revoca la siguiente petición API; las URLs firmadas previas se comportan según su TTL documentado.
6. Dos agentes intentan tomar el mismo ticket: solo uno lo consigue; el otro recibe conflicto.
7. Dos ediciones sobre la misma version no se sobrescriben.
8. Un reintento de creación/confirmación no duplica ticket o adjunto.
9. MIME falso, objeto ajeno, exceso de tamaño/cuota o análisis fallido no producen un archivo Ready.
10. El agente resuelve con evidencia; el cliente confirma o reabre con motivo.
11. Una caída de correo mantiene el evento pendiente y no revierte el ticket.
12. Repriorizar/reabrir no elimina incumplimientos de SLA anteriores.
13. Archivar impide nuevas mutaciones y conserva consulta autorizada.
14. Logout/cambio de cuenta vacían sesión y caché visible, sin mostrar datos de la persona anterior.
15. Una falla de DB/S3 produce respuesta controlada o estado reintentable.
16. Un despliegue defectuoso y una restauración de backup se ensayan en un ambiente aislado.

Definición de terminado de cada historia: migración compatible cuando corresponda, validaciones y permisos, estados de UI, pruebas de éxito/fallo/acceso denegado, OpenAPI/README actualizados, logs seguros y CI correcto. No fijar una cobertura porcentual como sustituto de estos escenarios.

## 13. Operación y presentación del producto

Antes del piloto en AWS: HTTPS, MFA administrativo acordado, roles mínimos, límites de abuso, logs redactados, alarmas básicas, readiness, cierre ordenado, backup/restore ensayado, política de retención acordada, seed ficticio y acceso de demo acotado.

S3/CloudFront para frontend, ECS para API y RDS privada son un objetivo de infraestructura, no una afirmación de lo que hoy está desplegado. GitHub Actions usa OIDC; Terraform tiene estado protegido y bloqueo. Documentar costo, recursos permanentes, región, tamaños y frecuencia de uso antes de mantener ambientes encendidos.

Mantener runbooks de despliegue, migración, rollback, restauración, revocación de acceso, archivo de cliente y reintento de mensajes fallidos. La auditoría de negocio vive aparte de logs de diagnóstico y no puede editarse desde la API ordinaria; esto no equivale a almacenamiento físicamente inmutable frente a administradores de DB.

La demo final usa dos clientes ficticios, proyectos y roles distintos; muestra una incidencia completa, una nota interna invisible para el cliente, un intento de acceso cruzado rechazado y una notificación recuperada tras un fallo. README con arquitectura, decisiones, instrucciones y límites reales. Métricas de rendimiento y recuperación solo después de medirlas.

## 14. Primer lote de implementación recomendado

Completar BASE-01, SEC-01 y FIX-01, después CLI-01 e IAM-01. Aplicar la ruta M0–M6: contador/permisos, clientes, catálogo/calendario mínimos, ticket con SLA, pausas/transferencias y después CMDB/matriz avanzadas. Mantener los tickets anteriores como legacy sin inventar tiempos históricos.

Este documento define una dirección de trabajo propuesta; no representa implementación ni despliegue realizados. Las recomendaciones anteriores de portafolio permanecen en Apuntes/roadmap-portafolio-aws.md.
