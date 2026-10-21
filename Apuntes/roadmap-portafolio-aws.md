# Del gestor de incidencias a un proyecto de portafolio

Revisión del código local: 19 de octubre de 2026. Orientación confirmada por el usuario: full stack con AWS. Las prioridades son recomendaciones de ingeniería, no estadísticas del mercado laboral.

Alcance: lectura de frontend, backend, rutas, casos de uso, repositorios, esquema y migraciones, configuración y documentación. No se inspeccionó una cuenta AWS ni un despliegue remoto. No hay dependencias locales instaladas ni una suite de pruebas configurada; no se ejecutaron build, pruebas o mediciones. No se modificó la aplicación.

## Diagnóstico

Ya existe una base aprovechable: Vue con TypeScript, Pinia y TanStack Query; API Express con dominio, casos de uso, puertos y adaptadores; Prisma con MySQL; validación Zod; contraseñas hasheadas; cookie HttpOnly; proyectos, miembros, tickets, comentarios y adjuntos con URLs firmadas de S3. Hay repositorios en memoria que pueden facilitar pruebas del dominio.

El mayor salto de valor sería demostrar el ciclo completo: reglas de negocio correctas, pruebas, despliegue reproducible, operación observable y una demo fácil de evaluar. Conservar Vue, Express y MySQL permite dedicar esfuerzo a eso. Cambiar de framework necesita una razón independiente del portafolio.

## Hallazgos que conviene resolver primero

1. **El registro público acepta un rol privilegiado.** `Backend/src/infrastructure/http/routes/user.routes.ts:12` expone el registro sin autenticación; `validators/user.schema.ts:7` admite Admin; `application/use-cases/user/RegisterUser.ts:32` conserva el rol recibido. Asignar Reporter desde el servidor y separar cualquier promoción a una operación autorizada. La existencia del rol no significa que actualmente tenga privilegios aplicados consistentemente.
2. **Autenticación y autorización están incompletamente separadas.** Las rutas de tickets usan autenticación, pero los casos de uso de lectura, asignación, cambio de estado y firma de adjuntos no reciben al solicitante. Por ejemplo, `ChangeStatusTicket.ts:17` cambia el ticket sin verificar membresía. `AssignTicket.ts:24` comprueba al destinatario, no a quien solicita. Establecer permisos por proyecto en todos los accesos, incluidos listados, comentarios y archivos. Ya hay verificaciones útiles al crear tickets, comentar, añadir adjuntos y administrar miembros: extenderlas de forma consistente.
3. **Adjuntos sin una confirmación confiable.** El límite de 5 MB está en `Frontend/src/modules/tickets/composables/useUploadAttachment.ts:28`; el backend no lo impone. `AddTicketAttachment.ts:29` acepta una clave sin comprobar que fue emitida para ese ticket/usuario ni verificar el objeto. Crear registros de subida pendientes, validar propiedad, tamaño y contenido real, confirmar existencia y limpiar objetos huérfanos. Un MIME declarado no demuestra el contenido del archivo. Considerar una política de subida que limite el tamaño, además de verificación posterior.
4. **Numeración susceptible a concurrencia.** `CreateTicket.ts:30` calcula la siguiente clave con un conteo. Dos solicitudes simultáneas pueden generar la misma clave; el índice unique evita duplicados persistidos, pero una operación fallará. Usar un contador atómico por proyecto dentro de una transacción y conservar la restricción unique; tratar conflictos y reintentos. Para actualizaciones simultáneas, considerar un campo version y control optimista.
5. **Una excepción inesperada puede dejar una petición pendiente.** En `Backend/src/infrastructure/http/controllers/ticket.controller.ts:121`, addAttachment solo responde para DomainError; el código de respuesta 500 está después de un return dentro de esa rama. Unificar el manejo de errores y comprobar el fallo de persistencia con una prueba HTTP.
6. **Consultas sin límites y filtros en el navegador.** `PrismaTicketRepository.ts:61` obtiene todos los tickets; `Frontend/src/modules/tickets/views/TicketsListView.vue:45` filtra y ordena lo descargado. Añadir autorización, filtros, orden estable y paginación en servidor. Elegir índices según consultas y EXPLAIN; conservar filtros de UI como controles de consulta.
7. **Poca evidencia reproducible.** No se encontraron tests, workflows de CI, Dockerfile de la aplicación o Terraform en este repositorio. Docker Compose solo levanta MySQL. El README raíz tiene dos líneas y el del frontend es el del template. Esto no demuestra que no exista infraestructura externa; falta documentarla o enlazarla aquí.

## Ruta recomendada, por entregables

### Etapa 1 — Seguridad y reglas de negocio

Implementar política de permisos por proyecto y rol, registro seguro, confirmación de archivos, numeración atómica, manejo uniforme de errores y límites de peticiones de autenticación. Definir transiciones de estado y quién puede ejecutarlas. Revisar cookies, orígenes permitidos y protección CSRF según la topología elegida; CORS no reemplaza autorización.

Terminado cuando las pruebas demuestren que un usuario de otro proyecto no puede listar, leer, modificar, comentar ni descargar sus recursos; un registro público no obtiene Admin; la creación concurrente no produce colisiones sin tratar; y un fallo de base de datos siempre devuelve una respuesta controlada.

Tema de entrevista: diferencia entre identidad, permisos por objeto y permisos por rol; dónde se aplica cada regla y cómo se impide una regresión.

### Etapa 2 — Calidad y experiencia de desarrollo

Usar Vitest para dominio y casos de uso, Supertest para HTTP y Playwright para recorridos completos. Probar Prisma contra MySQL real y aislado mediante contenedores o un servicio de CI. Los repositorios en memoria son útiles para reglas del dominio, pero no verifican restricciones o transacciones SQL. Vue recomienda Vitest en proyectos Vite; las pruebas de navegador cubren la integración del sistema. [Testing en Vue](https://vuejs.org/guide/scaling-up/testing.html), [Playwright](https://playwright.dev/docs/intro).

Añadir ESLint/Prettier, una versión documentada del runtime y gestor de paquetes, instalación con lockfile, datos seed ficticios y arranque local de aplicación y DB. Documentar OpenAPI con cuerpos, cookies, permisos, errores y paginación; derivar tipos de cliente del contrato si aporta mantenimiento real.

En cada PR: instalación reproducible → validación de tipos/lint → pruebas → build → comprobaciones de dependencias e imagen. Priorizar cobertura de fallos y permisos sobre perseguir un porcentaje arbitrario.

Terminado cuando una persona puede clonar, configurar variables de ejemplo, arrancar y ejecutar la suite siguiendo el README; CI bloquea una regresión real. Probar también recarga de una URL protegida, expiración de sesión y cambio de usuario con limpieza de caché de consultas.

Tema de entrevista: qué se prueba en cada nivel y por qué un mock no sustituye una prueba de integración.

### Etapa 3 — AWS reproducible y despliegue seguro

Mantener un monolito modular como primera arquitectura. Propuesta objetivo:

- Frontend compilado en un bucket S3 privado, servido por CloudFront con OAC y HTTPS. Configurar fallback de rutas de la SPA sin convertir errores de API en HTML. [CloudFront OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).
- API empaquetada con Docker, imagen en ECR, ejecución en ECS Fargate detrás de un ALB. Base de datos RDS MySQL privada y Security Groups con accesos acotados. Mantener MySQL evita una migración ajena al objetivo.
- S3 de adjuntos privado, separado del sitio estático; URLs firmadas solo después de verificar permisos. Usar un task role de IAM acotado a recursos concretos para el código de la API. El execution role de ECS cumple otra función. [Roles de tareas ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html).
- Secrets Manager para credenciales de aplicación, configuración por ambiente y conexiones TLS a la DB. La configuración actual fija localhost para CORS y no valida S3_BUCKET_NAME/AWS_REGION junto con las demás variables.
- Terraform para infraestructura, estado remoto protegido y versionado, y bloqueo del estado. El backend S3 actual permite use_lockfile; el bloqueo mediante DynamoDB está deprecado. [Backend S3 de Terraform](https://developer.hashicorp.com/terraform/language/backend/s3).
- GitHub Actions con OIDC y rol restringido al repositorio y ambiente esperado. Evitar credenciales AWS permanentes en los secretos del pipeline. [OIDC con AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).

Añadir health/readiness checks, cierre ordenado, migraciones como tarea de despliegue, etiquetas o digests inmutables, smoke test y rollback de aplicación. Las migraciones deben ser compatibles con la versión anterior cuando se quiera volver a ella. ECS ofrece rollback mediante deployment circuit breaker en despliegues rolling. [ECS circuit breaker](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-circuit-breaker.html).

Esta es una arquitectura objetivo para aprender y demostrar operación, no una estimación de la opción más barata. Dimensionar antes de dejarla encendida: ALB, RDS, NAT/VPC endpoints, IPv4, logs y transferencia pueden pesar incluso con pocas visitas. Para presupuesto limitado, comenzar con una demo contenida en una instancia y documentar la evolución; tiene menor aislamiento/disponibilidad. No asumir free tier. Crear alertas de gasto y un procedimiento de apagado; AWS Budgets no es un tope instantáneo de facturación. [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html).

Terminado cuando puedes recrear un ambiente desde código, desplegar una versión conocida, verificarla y demostrar recuperación de un despliegue defectuoso. Guardar evidencia del pipeline y del plan de infraestructura sin secretos.

Tema de entrevista: recorrido de una petición, red pública/privada, IAM vs Security Groups, credenciales temporales y compatibilidad de migraciones.

### Etapa 4 — Observabilidad y rendimiento medido

Logs JSON con Pino y requestId/traceId, redactando cookies, contraseñas y URLs firmadas. CloudWatch para operación inicial; OpenTelemetry para trazas y métricas del backend, verificando compatibilidad de instrumentaciones con las versiones del proyecto. [OpenTelemetry JavaScript](https://opentelemetry.io/docs/languages/js/).

Medir tráfico, errores 5xx, latencia p95, uso del pool de conexiones y, cuando exista, antigüedad de mensajes de la cola. Añadir alarmas accionables y un runbook breve de diagnóstico. Hacer una prueba k6 sobre un ambiente de ensayo propio, describiendo dataset, mezcla de operaciones, carga, duración y recursos. Medir antes/después de paginación e índices. k6 permite convertir umbrales en criterios de aprobación. [Métricas k6](https://grafana.com/docs/k6/latest/using-k6/metrics/).

Programar backups y practicar una restauración de RDS en un ambiente de ensayo, midiendo cuánto tardó y qué datos se recuperaron. [Backups y restauración de RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html).

Terminado cuando puedes seguir una petición lenta hasta su causa, explicar un resultado de carga reproducible y enseñar una restauración comprobada. No presentar objetivos de latencia o disponibilidad como resultados ya obtenidos.

Tema de entrevista: p95 frente al promedio, cuello de botella de DB, disponibilidad frente a durabilidad y recuperación real frente a tener backups configurados.

### Etapa 5 — Una función de negocio que demuestre nube

Prioridad recomendada: **SLA de incidencias, historial y notificaciones confiables**. Guardar fecha límite, reglas por prioridad, vencimientos, cambios de responsable/estado con actor y fecha, y alertas. Mostrar un dashboard de tickets vencidos y tiempos de resolución con definiciones claras.

Implementar gradualmente: historial y reglas en la aplicación; luego outbox en la misma transacción que el cambio del ticket → publicador → SQS → worker/Lambda → notificación. Incluir eventId, reintentos, consumidor idempotente, dead-letter queue y procedimiento de reintento manual. La outbox aborda el fallo entre guardar el cambio y publicar el evento; no garantiza por sí sola efectos externos exactamente una vez. [Transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

Terminado cuando crear o cambiar un ticket sigue funcionando si el proveedor de notificaciones falla; el trabajo pendiente se recupera y los duplicados tienen un tratamiento definido. Demostrarlo con una interrupción controlada.

Para enriquecer la demo visual: tablero Kanban accesible también por teclado, filtros persistentes en la URL, búsqueda/paginación en servidor, estados de carga/error y accesibilidad de formularios. Si hay colaboración simultánea real, evaluar SSE para avisos unidireccionales y reconexión antes de introducir una solución bidireccional más compleja.

Tema de entrevista: consistencia eventual, entrega al menos una vez, idempotencia y compensaciones cuando una dependencia externa falla.

### Etapa 6 — Diferenciadores opcionales

- **Organizaciones/tenants:** extender membresías de proyecto a organizaciones solo si el caso de negocio lo necesita. Probar aislamiento en API, consultas, S3 y trabajos de fondo. Los roles globales actuales no equivalen a multi-tenancy.
- **Identidad administrada:** evaluar Cognito/OIDC para login federado y MFA si aporta al puesto objetivo. Cambiar el proveedor de identidad no resuelve permisos por proyecto.
- **IA aplicada:** triage sugerido, resumen de comentarios o detección de duplicados con Amazon Bedrock. Empezar por una función acotada, dataset sintético de evaluación, salida validada y aprobación humana. Medir calidad, latencia y costo. La documentación de Bedrock contempla evaluación de recursos/modelos. [Evaluaciones de Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html).
- **RAG**, si se añade búsqueda semántica: aplicar el alcance del proyecto antes de recuperar documentos; tratar textos de tickets como datos no confiables y mostrar fuentes. Evitar acciones automáticas basadas solo en la respuesta del modelo.
- **Kubernetes, Kafka, Redis o microservicios:** incorporarlos cuando exista una necesidad o una vacante específica que quieras demostrar. Un ADR puede explicar por qué un monolito modular y una cola cubren la escala actual.

## Qué mostrar en el portafolio

El README debe incluir problema y usuarios, enlace a demo, capturas, una cuenta de prueba con datos ficticios y permisos limitados, arquitectura, arranque local, pruebas, despliegue, seguridad, costo/limitaciones y siguientes pasos. Incluir tres ADR breves: elección del monolito, almacenamiento de adjuntos y estrategia de despliegue. Documentar cómo se restablece la demo sin afectar datos reales.

Grabar un recorrido de 2–3 minutos: crear incidencia, asignarla, subir evidencia, ver historial/SLA y mostrar la notificación. Añadir una evidencia técnica independiente: pipeline, traza de una petición o recuperación de un fallo. Un video ayuda cuando el ambiente de demostración está apagado.

Ejemplo de bullet de CV, **solo después de implementarlo y verificarlo**:

> Desarrollé y desplegué un gestor de incidencias con Vue y TypeScript sobre AWS, con infraestructura Terraform, CI/CD mediante OIDC, autorización por proyecto, adjuntos privados en S3 y pruebas automatizadas de los flujos críticos.

Segundo bullet, después de medir: describir la carga utilizada y la reducción observada de p95, o el tiempo real de recuperación. Evitar cifras inventadas, usuarios ficticios presentados como reales o afirmar alta disponibilidad sin probarla.

## Elección si solo completas tres mejoras

1. Permisos correctos + pruebas que los demuestren.
2. Demo desplegable desde Terraform y CI/CD con rollback y documentación.
3. SLA/historial/notificaciones con una prueba visible de recuperación ante fallos.

Observabilidad y control de costos acompañan el despliegue desde su primera versión. IA queda después de esta base. Cada tecnología incluida debe responder: qué problema resuelve aquí, qué costo agrega, cómo se verifica y cómo falla.
