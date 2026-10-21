# Diccionario del modelo objetivo

Generado desde model.mjs. No representa tablas ya implementadas. Las restricciones entre filas y las transacciones se especifican en [diseño](../../Apuntes/diseno-sla-datos-autenticacion.md).

## Identidad local y permisos (10 tablas)

### app_user

Perfil local estable; conserva los UUID de User.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `display_name` · varchar(160).
- `email_display` · varchar(254).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

### identity_link

Vincula cuenta local a un emisor; no unir por email.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `user_id` · char(36).
- `issuer` · varchar(255).
- `subject` · varchar(255).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `issuer, subject`.

- FK (user_id) → app_user (id).

### employee

Empleado de la agencia y rol administrativo global.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `user_id` · char(36).
- `agency_role` · varchar(32).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `user_id`.

- FK (user_id) → app_user (id).

### client

Frontera comercial de una instalación con una agencia.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `name` · varchar(160).
- `slug` · varchar(64).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `slug`.

### requester_level

Nivel de servicio, separado del permiso.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `code` · varchar(64).
- `name` · varchar(160).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `client_id, code`.

- FK (client_id) → client (id).

### client_contact

Relación vigente entre usuario y cliente.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `user_id` · char(36).
- `requester_level_id` · char(36) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `client_id, user_id`.

- FK (client_id) → client (id).
- FK (user_id) → app_user (id).
- FK (client_id, requester_level_id) → requester_level (client_id, id).

### project

Proyecto privado; no trasladar entre clientes.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `name` · varchar(160).
- `project_key` · varchar(64).
- `manager_user_id` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `project_key`.

- FK (client_id) → client (id).
- FK (manager_user_id) → app_user (id).

### project_member

Rol y nivel efectivo opcional por proyecto.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `project_id` · char(36).
- `user_id` · char(36).
- `role` · varchar(32).
- `requester_level_id` · char(36) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `valid_from` · datetime(3).
- `valid_until` · datetime(3) · nullable · Límite exclusivo.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `project_id, user_id`.

- FK (client_id) → client (id).
- FK (client_id, project_id) → project (client_id, id).
- FK (user_id) → app_user (id).
- FK (client_id, requester_level_id) → requester_level (client_id, id).

### project_counter

Contador transaccional; nunca COUNT + 1.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `project_id` · char(36).
- `next_number` · bigint.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `project_id`.

- FK (project_id) → project (id).

### invitation

Invitación de un uso; solo hash del token.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `project_id` · char(36).
- `email_normalized` · varchar(254).
- `role` · varchar(32).
- `token_hash` · char(64).
- `expires_at` · datetime(3).
- `accepted_at` · datetime(3) · nullable.
- `revoked_at` · datetime(3) · nullable.
- `invited_by` · char(36).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `token_hash`.

- FK (client_id) → client (id).
- FK (client_id, project_id) → project (client_id, id).
- FK (invited_by) → app_user (id).

## Organización y catálogo (12 tablas)

### area

Área interna de atención.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `code` · varchar(64).
- `name` · varchar(160).
- `owner_user_id` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

- FK (owner_user_id) → app_user (id).

### resolver_group

Cola con propietario y respaldo.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `area_id` · char(36).
- `code` · varchar(64).
- `name` · varchar(160).
- `lead_user_id` · char(36).
- `backup_user_id` · char(36) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

- FK (area_id) → area (id).
- FK (lead_user_id) → app_user (id).
- FK (backup_user_id) → app_user (id).

### group_member

Miembro de grupo; no concede acceso a proyectos.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `group_id` · char(36).
- `user_id` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `group_id, user_id`.

- FK (group_id) → resolver_group (id).
- FK (user_id) → app_user (id).

### project_group

Grupos habilitados para recibir trabajo del proyecto.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `project_id` · char(36).
- `group_id` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `project_id, group_id`.

- FK (client_id) → client (id).
- FK (client_id, project_id) → project (client_id, id).
- FK (group_id) → resolver_group (id).

### product

Definición del producto, no su instancia.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `code` · varchar(64).
- `name` · varchar(160).
- `vendor` · varchar(160) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

### client_product

Producto contratado por cliente con vigencia.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `product_id` · char(36).
- `contract_reference` · varchar(160) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `valid_from` · datetime(3).
- `valid_until` · datetime(3) · nullable · Límite exclusivo.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (product_id) → product (id).

### service_category

Agrupación del catálogo de la agencia.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `code` · varchar(64).
- `name` · varchar(160).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

### service

Servicio estable compartido como plantilla.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `category_id` · char(36).
- `code` · varchar(64).
- `name` · varchar(160).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

- FK (category_id) → service_category (id).

### subservice

Identidad estable del subservicio.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `service_id` · char(36).
- `code` · varchar(64).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `service_id, code`.

- FK (service_id) → service (id).

### subservice_version

Versión publicada inmutable del formulario y defaults.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `subservice_id` · char(36).
- `revision` · int.
- `name` · varchar(160).
- `description` · text.
- `request_type` · varchar(32).
- `form_schema` · json · JSON Schema validado; no ejecutar código.
- `default_group_id` · char(36).
- `requires_ci` · boolean.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `published_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `subservice_id, revision`.

- FK (subservice_id) → subservice (id).
- FK (default_group_id) → resolver_group (id).

### service_offering

Oferta y cobertura por proyecto; publicar nueva fila al cambiar contrato.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `project_id` · char(36).
- `subservice_version_id` · char(36).
- `client_product_id` · char(36) · nullable.
- `routing_version_id` · char(36) · nullable.
- `sla_policy_version_id` · char(36) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `valid_from` · datetime(3).
- `valid_until` · datetime(3) · nullable · Límite exclusivo.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (client_id, project_id) → project (client_id, id).
- FK (subservice_version_id) → subservice_version (id).
- FK (client_id, client_product_id) → client_product (client_id, id).
- FK (client_id, routing_version_id) → routing_version (client_id, id).
- FK (client_id, sla_policy_version_id) → sla_policy_version (client_id, id).

### offering_level

Niveles permitidos para esta oferta; filas explícitas, vacío deniega.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `offering_id` · char(36).
- `requester_level_id` · char(36).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `offering_id, requester_level_id`.

- FK (client_id) → client (id).
- FK (client_id, offering_id) → service_offering (client_id, id).
- FK (client_id, requester_level_id) → requester_level (client_id, id).

## CMDB (8 tablas)

### ci_class

Aplicación, base de datos, servidor, integración.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `code` · varchar(64).
- `name` · varchar(160).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

### ci_schema_version

Esquema tipado y clasificación de atributos.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `class_id` · char(36).
- `revision` · int.
- `attribute_schema` · json.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `published_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `class_id, revision`.

- FK (class_id) → ci_class (id).

### configuration_item

Instancia concreta propiedad de un cliente.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ci_key` · varchar(64).
- `name` · varchar(160).
- `schema_version_id` · char(36).
- `client_product_id` · char(36) · nullable.
- `environment` · varchar(32).
- `criticality` · varchar(32).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `attributes` · json.
- `owner_area_id` · char(36).
- `support_group_id` · char(36).
- `technical_owner_user_id` · char(36) · nullable.
- `source_system` · varchar(64).
- `external_id` · varchar(160).
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `client_id, ci_key`; `client_id, source_system, external_id`.

- FK (client_id) → client (id).
- FK (schema_version_id) → ci_schema_version (id).
- FK (client_id, client_product_id) → client_product (client_id, id).
- FK (owner_area_id) → area (id).
- FK (support_group_id) → resolver_group (id).
- FK (technical_owner_user_id) → app_user (id).

### ci_project

CI visible en un proyecto autorizado.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ci_id` · char(36).
- `project_id` · char(36).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `ci_id, project_id`.

- FK (client_id) → client (id).
- FK (client_id, ci_id) → configuration_item (client_id, id).
- FK (client_id, project_id) → project (client_id, id).

### ci_relation_type

Dirección y política de ciclos de una dependencia.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `code` · varchar(64).
- `name` · varchar(160).
- `allow_cycles` · boolean.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

### ci_relation

Arista dirigida; prohibir duplicados y autorrelaciones.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `source_ci_id` · char(36).
- `target_ci_id` · char(36).
- `relation_type_id` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `valid_from` · datetime(3).
- `valid_until` · datetime(3) · nullable · Límite exclusivo.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `source_ci_id, target_ci_id, relation_type_id`.

- FK (client_id) → client (id).
- FK (client_id, source_ci_id) → configuration_item (client_id, id).
- FK (client_id, target_ci_id) → configuration_item (client_id, id).
- FK (relation_type_id) → ci_relation_type (id).

### ci_service_link

CI vinculado a servicio o subservicio; validar coherencia entre ambos.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ci_id` · char(36).
- `service_id` · char(36).
- `subservice_id` · char(36) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `valid_from` · datetime(3).
- `valid_until` · datetime(3) · nullable · Límite exclusivo.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (client_id, ci_id) → configuration_item (client_id, id).
- FK (service_id) → service (id).
- FK (subservice_id) → subservice (id).

### offering_ci

Intersección autorizada oferta-proyecto-CI.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `offering_id` · char(36).
- `ci_id` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `offering_id, ci_id`.

- FK (client_id) → client (id).
- FK (client_id, offering_id) → service_offering (client_id, id).
- FK (client_id, ci_id) → configuration_item (client_id, id).

## Calendarios y políticas (12 tablas)

### business_calendar

Identidad del calendario; compartible, sin datos del cliente.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `code` · varchar(64).
- `name` · varchar(160).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code`.

### calendar_version

Reglas congeladas y cobertura de cálculo.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `calendar_id` · char(36).
- `revision` · int.
- `timezone` · varchar(160).
- `tzdb_version` · varchar(64).
- `engine_version` · varchar(64).
- `coverage_start` · date.
- `coverage_end` · date.
- `content_hash` · char(64).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `published_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `calendar_id, revision`.

- FK (calendar_id) → business_calendar (id).

### calendar_week_interval

Intervalos locales [inicio, fin); turnos nocturnos se dividen.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `calendar_version_id` · char(36).
- `weekday_iso` · int.
- `start_minute` · int.
- `end_minute` · int.
- `created_at` · datetime(3) · Instante UTC.

- FK (calendar_version_id) → calendar_version (id).

### calendar_exception

Reemplaza toda la jornada de esa fecha civil; sin intervalos significa cerrado.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `calendar_version_id` · char(36).
- `local_date` · date.
- `name` · varchar(160).
- `recurrence_source` · json · nullable · Regla expandida al publicar.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `calendar_version_id, local_date`.

- FK (calendar_version_id) → calendar_version (id).

### calendar_exception_interval

Ventanas de apertura de la excepción.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `exception_id` · char(36).
- `start_minute` · int.
- `end_minute` · int.
- `created_at` · datetime(3) · Instante UTC.

- FK (exception_id) → calendar_exception (id).

### calendar_work_interval

Ventanas UTC compiladas; reproducibilidad frente a cambios de tzdb.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `calendar_version_id` · char(36).
- `start_at` · datetime(3).
- `end_at` · datetime(3).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `calendar_version_id, start_at`.

- FK (calendar_version_id) → calendar_version (id).

### sla_policy_set

Conjunto contractual de reglas por cliente.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `name` · varchar(160).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).

### sla_policy_version

Publicación atómica de reglas ordenadas y fallback.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `policy_set_id` · char(36).
- `revision` · int.
- `effective_from` · datetime(3).
- `engine_version` · varchar(64).
- `content_hash` · char(64).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `published_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `policy_set_id, revision`.

- FK (client_id) → client (id).
- FK (client_id, policy_set_id) → sla_policy_set (client_id, id).

### sla_rule

Primera regla coincidente por orden único; condiciones AND tipadas.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `policy_version_id` · char(36).
- `rule_order` · int.
- `name` · varchar(160).
- `conditions` · json.
- `priority` · varchar(32).
- `is_fallback` · boolean.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `policy_version_id, rule_order`.

- FK (client_id) → client (id).
- FK (client_id, policy_version_id) → sla_policy_version (client_id, id).

### sla_target

Objetivo independiente por métrica; duraciones enteras.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `rule_id` · char(36).
- `metric` · varchar(32).
- `target_ms` · bigint.
- `calendar_version_id` · char(36).
- `pause_reasons` · json.
- `max_pause_ms` · bigint · nullable.
- `warning_thresholds` · json.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `rule_id, metric`.

- FK (client_id) → client (id).
- FK (client_id, rule_id) → sla_rule (client_id, id).
- FK (calendar_version_id) → calendar_version (id).

### routing_version

Reglas publicadas de distribución interna.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `name` · varchar(160).
- `revision` · int.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `published_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).

### routing_rule

Asignación a grupo; persona opcional, sin alterar SLA.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `routing_version_id` · char(36).
- `rule_order` · int.
- `conditions` · json.
- `group_id` · char(36).
- `assignee_user_id` · char(36) · nullable.
- `fallback_group_id` · char(36) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `routing_version_id, rule_order`.

- FK (client_id) → client (id).
- FK (client_id, routing_version_id) → routing_version (client_id, id).
- FK (group_id) → resolver_group (id).
- FK (assignee_user_id) → app_user (id).
- FK (fallback_group_id) → resolver_group (id).

## Tickets y colaboración (11 tablas)

### ticket

Solicitud; columnas opcionales permiten incorporación gradual y tickets legacy.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `project_id` · char(36).
- `number` · bigint.
- `ticket_key` · varchar(64).
- `title` · varchar(160).
- `description` · text.
- `type` · varchar(32).
- `priority` · varchar(32).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `visibility` · varchar(32).
- `reporter_user_id` · char(36).
- `created_by` · char(36).
- `offering_id` · char(36) · nullable.
- `requester_level_id` · char(36) · nullable.
- `impact` · varchar(32) · nullable.
- `urgency` · varchar(32) · nullable.
- `classification_snapshot` · json · nullable.
- `current_group_id` · char(36) · nullable.
- `assignee_user_id` · char(36) · nullable.
- `sla_mode` · varchar(32) · ACTIVE, NONE o LEGACY_UNMEASURED; ausencia explícita, nunca SLA cero.
- `resolution_code` · varchar(64) · nullable.
- `resolution_summary` · text · nullable.
- `cancellation_reason` · text · nullable.
- `accepted_at` · datetime(3).
- `resolved_at` · datetime(3) · nullable.
- `closed_at` · datetime(3) · nullable.
- `updated_at` · datetime(3).
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `project_id, number`; `ticket_key`.

- FK (client_id) → client (id).
- FK (client_id, project_id) → project (client_id, id).
- FK (client_id, offering_id) → service_offering (client_id, id).
- FK (client_id, requester_level_id) → requester_level (client_id, id).
- FK (reporter_user_id) → app_user (id).
- FK (created_by) → app_user (id).
- FK (current_group_id) → resolver_group (id).
- FK (assignee_user_id) → app_user (id).

### ticket_ci

CI afectado, principal o secundario; nunca duplicado.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `ci_id` · char(36).
- `is_primary` · boolean.
- `snapshot` · json.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `ticket_id, ci_id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (client_id, ci_id) → configuration_item (client_id, id).

### ticket_comment

Comentario público o nota interna; sin borrado cascada.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `author_user_id` · char(36).
- `visibility` · varchar(32).
- `body` · text.
- `edited_at` · datetime(3) · nullable.
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (author_user_id) → app_user (id).

### attachment

Metadatos y visibilidad; archivo privado en S3.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `comment_id` · char(36) · nullable.
- `uploaded_by` · char(36).
- `object_key` · varchar(512).
- `file_name` · varchar(160).
- `content_type` · varchar(160).
- `size_bytes` · bigint.
- `checksum` · char(64) · nullable.
- `visibility` · varchar(32).
- `scan_status` · varchar(32).
- `verified_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (client_id, comment_id) → ticket_comment (client_id, id).
- FK (uploaded_by) → app_user (id).

### ticket_participant

Participante concede alcance; follower solo notifica.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `user_id` · char(36).
- `kind` · varchar(32).
- `added_by` · char(36).
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `ticket_id, user_id, kind`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (user_id) → app_user (id).
- FK (added_by) → app_user (id).

### ticket_relation

Relación autorizada entre tickets; ciclos según tipo.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `source_ticket_id` · char(36).
- `target_ticket_id` · char(36).
- `kind` · varchar(32).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `source_ticket_id, target_ticket_id, kind`.

- FK (client_id) → client (id).
- FK (client_id, source_ticket_id) → ticket (client_id, id).
- FK (client_id, target_ticket_id) → ticket (client_id, id).

### tag

Etiqueta de proyecto.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `project_id` · char(36).
- `name` · varchar(30).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `project_id, name`.

- FK (client_id) → client (id).
- FK (client_id, project_id) → project (client_id, id).

### ticket_tag

Etiquetas del ticket.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `tag_id` · char(36).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `ticket_id, tag_id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (client_id, tag_id) → tag (client_id, id).

### ticket_event

Hecho inmutable con versión por agregado y proyección pública revisada.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `sequence` · bigint.
- `event_type` · varchar(64).
- `actor_user_id` · char(36) · nullable.
- `occurred_at` · datetime(3).
- `visibility` · varchar(32).
- `payload` · json.
- `request_id` · varchar(64).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `ticket_id, sequence`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (actor_user_id) → app_user (id).

### ticket_assignment

Historia de custodios. La cola actual conserva el ticket durante transferencia.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `group_id` · char(36).
- `assignee_user_id` · char(36) · nullable.
- `started_at` · datetime(3).
- `ended_at` · datetime(3) · nullable.
- `reason` · text.
- `assigned_by` · char(36).
- `routing_rule_id` · char(36) · nullable.
- `created_at` · datetime(3) · Instante UTC.
- `open_ticket_id` · char(36) · nullable · generada · Clave generada: una fila activa por agregado.

Únicos: `client_id, id`; `open_ticket_id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (group_id) → resolver_group (id).
- FK (assignee_user_id) → app_user (id).
- FK (assigned_by) → app_user (id).
- FK (client_id, routing_rule_id) → routing_rule (client_id, id).

### ticket_transfer

Solicitar, aceptar, declinar o cancelar traslado; no es rechazo del ticket.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `from_assignment_id` · char(36).
- `to_group_id` · char(36).
- `requested_by` · char(36).
- `reason` · text.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `decided_by` · char(36) · nullable.
- `decision_reason` · text · nullable.
- `decided_at` · datetime(3) · nullable.
- `review_due_at` · datetime(3).
- `result_assignment_id` · char(36) · nullable.
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.
- `pending_ticket_id` · char(36) · nullable · generada · Clave generada: una fila activa por agregado.

Únicos: `client_id, id`; `pending_ticket_id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (client_id, from_assignment_id) → ticket_assignment (client_id, id).
- FK (client_id, result_assignment_id) → ticket_assignment (client_id, id).
- FK (to_group_id) → resolver_group (id).
- FK (requested_by) → app_user (id).
- FK (decided_by) → app_user (id).

## SLA en ejecución (7 tablas)

### ticket_cycle

Ciclo 1 al aceptar; siguientes al reabrir con motivo.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `cycle_number` · int.
- `started_at` · datetime(3).
- `ended_at` · datetime(3) · nullable.
- `outcome` · varchar(32) · nullable.
- `reason` · text · nullable.
- `created_at` · datetime(3) · Instante UTC.
- `open_ticket_id` · char(36) · nullable · generada · Clave generada: una fila activa por agregado.

Únicos: `client_id, id`; `ticket_id, cycle_number`; `open_ticket_id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).

### sla_evaluation

Entrada y resultado congelados; también registra overrides y migraciones.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `cycle_id` · char(36).
- `policy_version_id` · char(36).
- `rule_id` · char(36).
- `input_snapshot` · json.
- `result_snapshot` · json.
- `evaluated_at` · datetime(3).
- `engine_version` · varchar(64).
- `reason` · text.
- `actor_user_id` · char(36) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (client_id, cycle_id) → ticket_cycle (client_id, id).
- FK (client_id, policy_version_id) → sla_policy_version (client_id, id).
- FK (client_id, rule_id) → sla_rule (client_id, id).
- FK (actor_user_id) → app_user (id).

### ticket_sla_clock

Estado materializado independiente para primera respuesta y resolución.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `ticket_id` · char(36).
- `cycle_id` · char(36).
- `metric` · varchar(32).
- `state` · varchar(32).
- `started_at` · datetime(3).
- `consumed_ms` · bigint.
- `checkpoint_at` · datetime(3).
- `due_at` · datetime(3) · nullable · NULL si pausado; fecha calculada si corre.
- `last_due_at` · datetime(3) · nullable.
- `breached_at` · datetime(3) · nullable · Primer incumplimiento, irreversible.
- `completed_at` · datetime(3) · nullable.
- `active_revision_number` · int.
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `cycle_id, metric`.

- FK (client_id) → client (id).
- FK (client_id, ticket_id) → ticket (client_id, id).
- FK (client_id, cycle_id) → ticket_cycle (client_id, id).

### sla_clock_revision

Presupuesto y calendario aplicados; crear otra fila al cambiar, no UPDATE.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `clock_id` · char(36).
- `revision_number` · int.
- `evaluation_id` · char(36).
- `target_id` · char(36).
- `calendar_version_id` · char(36).
- `target_ms` · bigint.
- `consumed_at_change_ms` · bigint.
- `effective_at` · datetime(3).
- `reason` · text.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `clock_id, revision_number`.

- FK (client_id) → client (id).
- FK (client_id, clock_id) → ticket_sla_clock (client_id, id).
- FK (client_id, evaluation_id) → sla_evaluation (client_id, id).
- FK (client_id, target_id) → sla_target (client_id, id).
- FK (calendar_version_id) → calendar_version (id).

### sla_pause

Pausa autorizada por reloj. Intervalos [start,end); no doble descuento.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `clock_id` · char(36).
- `started_at` · datetime(3).
- `ended_at` · datetime(3) · nullable.
- `reason_code` · varchar(64).
- `reason_text` · text.
- `trigger_comment_id` · char(36) · nullable.
- `started_by` · char(36).
- `ended_by` · char(36) · nullable.
- `auto_resume_at` · datetime(3) · nullable.
- `review_at` · datetime(3) · nullable.
- `dedupe_key` · varchar(64).
- `created_at` · datetime(3) · Instante UTC.
- `open_clock_id` · char(36) · nullable · generada · Clave generada: una fila activa por agregado.

Únicos: `client_id, id`; `clock_id, dedupe_key`; `open_clock_id`.

- FK (client_id) → client (id).
- FK (client_id, clock_id) → ticket_sla_clock (client_id, id).
- FK (client_id, trigger_comment_id) → ticket_comment (client_id, id).
- FK (started_by) → app_user (id).
- FK (ended_by) → app_user (id).

### sla_clock_event

Traza del cálculo, checkpoint y vencimiento histórico antes/después.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `clock_id` · char(36).
- `sequence` · bigint.
- `event_type` · varchar(64).
- `occurred_at` · datetime(3).
- `delta_consumed_ms` · bigint.
- `payload` · json.
- `source_event_id` · char(36) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `clock_id, sequence`.

- FK (client_id) → client (id).
- FK (client_id, clock_id) → ticket_sla_clock (client_id, id).
- FK (client_id, source_event_id) → ticket_event (client_id, id).

### sla_alert

Dedupe de alertas por revisión; workers comprueban versión vigente.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `clock_id` · char(36).
- `revision_number` · int.
- `kind` · varchar(64).
- `scheduled_at` · datetime(3).
- `delivered_at` · datetime(3) · nullable.
- `cancelled_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `clock_id, revision_number, kind`.

- FK (client_id) → client (id).
- FK (client_id, clock_id) → ticket_sla_clock (client_id, id).

## Operación (8 tablas)

### outbox_event

Evento durable para avisos; no publicar a SQS antes del commit.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `aggregate_id` · char(36).
- `event_type` · varchar(64).
- `payload` · json.
- `available_at` · datetime(3).
- `published_at` · datetime(3) · nullable.
- `attempts` · int.
- `locked_until` · datetime(3) · nullable.
- `lease_owner` · varchar(64) · nullable.
- `created_at` · datetime(3) · Instante UTC.

### consumer_receipt

Idempotencia por consumidor y evento.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `consumer` · varchar(64).
- `event_id` · char(36).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `consumer, event_id`.

### notification

Notificación con referencia; reautorizar al leer y al enviar.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `recipient_user_id` · char(36).
- `ticket_id` · char(36) · nullable.
- `source_event_id` · char(36).
- `kind` · varchar(64).
- `read_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `recipient_user_id, source_event_id, kind`.

- FK (client_id) → client (id).
- FK (recipient_user_id) → app_user (id).
- FK (client_id, ticket_id) → ticket (client_id, id).

### notification_preference

Preferencias por canal y clase de evento.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `user_id` · char(36).
- `channel` · varchar(32).
- `event_type` · varchar(64).
- `enabled` · boolean.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `user_id, channel, event_type`.

- FK (user_id) → app_user (id).

### notification_delivery

Intentos de entrega y resultado del proveedor.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `notification_id` · char(36).
- `channel` · varchar(32).
- `attempt` · int.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `provider_message_id` · varchar(160) · nullable.
- `sent_at` · datetime(3) · nullable.
- `last_error_code` · varchar(64) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`; `notification_id, channel, attempt`.

- FK (client_id) → client (id).
- FK (client_id, notification_id) → notification (client_id, id).

### idempotency_record

Clave por actor y operación; reautorizar todo replay.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `actor_user_id` · char(36).
- `operation` · varchar(64).
- `request_key` · varchar(64).
- `request_hash` · char(64).
- `resource_id` · char(36) · nullable.
- `status` · varchar(32).
- `expires_at` · datetime(3).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `actor_user_id, operation, request_key`.

- FK (actor_user_id) → app_user (id).

### audit_event

Auditoría restringida; retención separada y exportación inmutable.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36) · nullable.
- `actor_user_id` · char(36) · nullable.
- `resource_type` · varchar(64).
- `resource_id` · char(36) · nullable.
- `action` · varchar(64).
- `request_id` · varchar(64).
- `payload_redacted` · json.
- `occurred_at` · datetime(3).
- `created_at` · datetime(3) · Instante UTC.

- FK (client_id) → client (id).
- FK (actor_user_id) → app_user (id).

### export_job

Exportación de alcance congelado, permiso revalidado antes de descargar.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `client_id` · char(36).
- `requested_by` · char(36).
- `filters` · json.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `object_key` · varchar(512) · nullable.
- `expires_at` · datetime(3).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `client_id, id`.

- FK (client_id) → client (id).
- FK (requested_by) → app_user (id).

## Servicio de autenticación opcional (10 tablas)

### auth_account

Cuenta del proveedor propio de aprendizaje.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `email_normalized` · varchar(254).
- `email_verified_at` · datetime(3) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `token_version` · int.
- `updated_at` · datetime(3).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `email_normalized`.

### auth_password

Hash Argon2id o algoritmo aprobado; no contraseña reversible.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `account_id` · char(36).
- `encoded_hash` · varchar(512).
- `changed_at` · datetime(3).
- `created_at` · datetime(3) · Instante UTC.

Únicos: `account_id`.

- FK (account_id) → auth_account (id).

### auth_session

Una familia de refresh por sesión/dispositivo.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `account_id` · char(36).
- `client_code` · varchar(64).
- `absolute_expires_at` · datetime(3).
- `idle_expires_at` · datetime(3).
- `revoked_at` · datetime(3) · nullable.
- `revoke_reason` · varchar(64) · nullable.
- `last_seen_at` · datetime(3).
- `version` · int · Control optimista, incremento atómico.
- `created_at` · datetime(3) · Instante UTC.

- FK (account_id) → auth_account (id).

### auth_refresh_token

Token opaco aleatorio; hash en DB; rotación de un solo uso.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `session_id` · char(36).
- `generation` · int.
- `token_hash` · char(64).
- `expires_at` · datetime(3).
- `used_at` · datetime(3) · nullable.
- `revoked_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `token_hash`; `session_id, generation`.

- FK (session_id) → auth_session (id).

### auth_one_time_token

Verificación de email o recuperación, un uso con expiración.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `account_id` · char(36).
- `purpose` · varchar(64).
- `token_hash` · char(64).
- `expires_at` · datetime(3).
- `consumed_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `token_hash`.

- FK (account_id) → auth_account (id).

### auth_mfa_credential

WebAuthn pública o referencia a secreto cifrado TOTP.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `account_id` · char(36).
- `kind` · varchar(32).
- `credential_identifier` · varchar(255).
- `public_data` · json · nullable.
- `encrypted_secret_ref` · varchar(512) · nullable.
- `verified_at` · datetime(3) · nullable.
- `revoked_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `credential_identifier`.

- FK (account_id) → auth_account (id).

### auth_recovery_code

Código de recuperación de un uso, hasheado.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `account_id` · char(36).
- `code_hash` · char(64).
- `used_at` · datetime(3) · nullable.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `code_hash`.

- FK (account_id) → auth_account (id).

### auth_signing_key

Metadata kid; clave privada en KMS o secret store.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `kid` · varchar(64).
- `algorithm` · varchar(64).
- `public_jwk` · json.
- `private_key_ref` · varchar(512).
- `active_from` · datetime(3).
- `retire_after` · datetime(3) · nullable.
- `status` · varchar(32) · Enum de dominio validado en servidor.
- `created_at` · datetime(3) · Instante UTC.

Únicos: `kid`.

### auth_security_event

Login, recuperación, reutilización, revocación y cambios MFA.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `account_id` · char(36) · nullable.
- `session_id` · char(36) · nullable.
- `event_type` · varchar(64).
- `occurred_at` · datetime(3).
- `details_redacted` · json.
- `created_at` · datetime(3) · Instante UTC.

- FK (account_id) → auth_account (id).
- FK (session_id) → auth_session (id).

### auth_outbox_event

Propaga revocaciones de forma idempotente; no sustituye validación online.

- `id` · char(36) · Identificador UUID generado por aplicación.
- `event_type` · varchar(64).
- `aggregate_id` · char(36).
- `payload` · json.
- `published_at` · datetime(3) · nullable.
- `attempts` · int.
- `created_at` · datetime(3) · Instante UTC.

