-- Arena: ESQUEMA OBJETIVO de referencia. NO es una migración.
-- MySQL 8.4 / InnoDB. Ejecutar SOLO en schema vacío seleccionado por el operador.
-- No incluye CREATE DATABASE, USE, DROP ni INSERT. No ejecutar sobre la base actual.
-- Fuente: model.mjs. Instantes DATETIME(3) UTC; duraciones BIGINT en ms.
SET time_zone = '+00:00';
SET NAMES utf8mb4 COLLATE utf8mb4_0900_bin;

-- Identidad local y permisos: Perfil local estable; conserva los UUID de User.
CREATE TABLE `app_user` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `display_name` varchar(160) NOT NULL,
  `email_display` varchar(254) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Vincula cuenta local a un emisor; no unir por email.
CREATE TABLE `identity_link` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `user_id` char(36) NOT NULL,
  `issuer` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_identity_link_0` (`issuer`, `subject`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Empleado de la agencia y rol administrativo global.
CREATE TABLE `employee` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `user_id` char(36) NOT NULL,
  `agency_role` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employee_0` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Frontera comercial de una instalación con una agencia.
CREATE TABLE `client` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `name` varchar(160) NOT NULL,
  `slug` varchar(64) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client_0` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Nivel de servicio, separado del permiso.
CREATE TABLE `requester_level` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_requester_level_0` (`client_id`, `id`),
  UNIQUE KEY `uq_requester_level_1` (`client_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Relación vigente entre usuario y cliente.
CREATE TABLE `client_contact` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `requester_level_id` char(36) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client_contact_0` (`client_id`, `id`),
  UNIQUE KEY `uq_client_contact_1` (`client_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Proyecto privado; no trasladar entre clientes.
CREATE TABLE `project` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `project_key` varchar(64) NOT NULL,
  `manager_user_id` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_0` (`client_id`, `id`),
  UNIQUE KEY `uq_project_1` (`project_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Rol y nivel efectivo opcional por proyecto.
CREATE TABLE `project_member` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` varchar(32) NOT NULL,
  `requester_level_id` char(36) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `valid_from` datetime(3) NOT NULL,
  `valid_until` datetime(3) NULL COMMENT 'Límite exclusivo',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_member_0` (`client_id`, `id`),
  UNIQUE KEY `uq_project_member_1` (`project_id`, `user_id`),
  CONSTRAINT `ck_project_member_0` CHECK (valid_until IS NULL OR valid_until > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Contador transaccional; nunca COUNT + 1.
CREATE TABLE `project_counter` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `project_id` char(36) NOT NULL,
  `next_number` bigint NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_counter_0` (`project_id`),
  CONSTRAINT `ck_project_counter_0` CHECK (next_number > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Identidad local y permisos: Invitación de un uso; solo hash del token.
CREATE TABLE `invitation` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `email_normalized` varchar(254) NOT NULL,
  `role` varchar(32) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `accepted_at` datetime(3) NULL,
  `revoked_at` datetime(3) NULL,
  `invited_by` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invitation_0` (`client_id`, `id`),
  UNIQUE KEY `uq_invitation_1` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Área interna de atención.
CREATE TABLE `area` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `owner_user_id` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_area_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Cola con propietario y respaldo.
CREATE TABLE `resolver_group` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `area_id` char(36) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `lead_user_id` char(36) NOT NULL,
  `backup_user_id` char(36) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_resolver_group_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Miembro de grupo; no concede acceso a proyectos.
CREATE TABLE `group_member` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `group_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_group_member_0` (`group_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Grupos habilitados para recibir trabajo del proyecto.
CREATE TABLE `project_group` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `group_id` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_group_0` (`client_id`, `id`),
  UNIQUE KEY `uq_project_group_1` (`project_id`, `group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Definición del producto, no su instancia.
CREATE TABLE `product` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `vendor` varchar(160) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Producto contratado por cliente con vigencia.
CREATE TABLE `client_product` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `contract_reference` varchar(160) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `valid_from` datetime(3) NOT NULL,
  `valid_until` datetime(3) NULL COMMENT 'Límite exclusivo',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_client_product_0` (`client_id`, `id`),
  CONSTRAINT `ck_client_product_0` CHECK (valid_until IS NULL OR valid_until > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Agrupación del catálogo de la agencia.
CREATE TABLE `service_category` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_category_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Servicio estable compartido como plantilla.
CREATE TABLE `service` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `category_id` char(36) NOT NULL,
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Identidad estable del subservicio.
CREATE TABLE `subservice` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `service_id` char(36) NOT NULL,
  `code` varchar(64) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subservice_0` (`service_id`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Versión publicada inmutable del formulario y defaults.
CREATE TABLE `subservice_version` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `subservice_id` char(36) NOT NULL,
  `revision` int NOT NULL,
  `name` varchar(160) NOT NULL,
  `description` text NOT NULL,
  `request_type` varchar(32) NOT NULL,
  `form_schema` json NOT NULL COMMENT 'JSON Schema validado; no ejecutar código',
  `default_group_id` char(36) NOT NULL,
  `requires_ci` boolean NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `published_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subservice_version_0` (`subservice_id`, `revision`),
  CONSTRAINT `ck_subservice_version_0` CHECK (revision > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Oferta y cobertura por proyecto; publicar nueva fila al cambiar contrato.
CREATE TABLE `service_offering` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `subservice_version_id` char(36) NOT NULL,
  `client_product_id` char(36) NULL,
  `routing_version_id` char(36) NULL,
  `sla_policy_version_id` char(36) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `valid_from` datetime(3) NOT NULL,
  `valid_until` datetime(3) NULL COMMENT 'Límite exclusivo',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_offering_0` (`client_id`, `id`),
  CONSTRAINT `ck_service_offering_0` CHECK (valid_until IS NULL OR valid_until > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Organización y catálogo: Niveles permitidos para esta oferta; filas explícitas, vacío deniega.
CREATE TABLE `offering_level` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `offering_id` char(36) NOT NULL,
  `requester_level_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_offering_level_0` (`client_id`, `id`),
  UNIQUE KEY `uq_offering_level_1` (`offering_id`, `requester_level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: Aplicación, base de datos, servidor, integración.
CREATE TABLE `ci_class` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ci_class_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: Esquema tipado y clasificación de atributos.
CREATE TABLE `ci_schema_version` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `class_id` char(36) NOT NULL,
  `revision` int NOT NULL,
  `attribute_schema` json NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `published_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ci_schema_version_0` (`class_id`, `revision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: Instancia concreta propiedad de un cliente.
CREATE TABLE `configuration_item` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ci_key` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `schema_version_id` char(36) NOT NULL,
  `client_product_id` char(36) NULL,
  `environment` varchar(32) NOT NULL,
  `criticality` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `attributes` json NOT NULL,
  `owner_area_id` char(36) NOT NULL,
  `support_group_id` char(36) NOT NULL,
  `technical_owner_user_id` char(36) NULL,
  `source_system` varchar(64) NOT NULL,
  `external_id` varchar(160) NOT NULL,
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_configuration_item_0` (`client_id`, `id`),
  UNIQUE KEY `uq_configuration_item_1` (`client_id`, `ci_key`),
  UNIQUE KEY `uq_configuration_item_2` (`client_id`, `source_system`, `external_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: CI visible en un proyecto autorizado.
CREATE TABLE `ci_project` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ci_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ci_project_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ci_project_1` (`ci_id`, `project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: Dirección y política de ciclos de una dependencia.
CREATE TABLE `ci_relation_type` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `allow_cycles` boolean NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ci_relation_type_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: Arista dirigida; prohibir duplicados y autorrelaciones.
CREATE TABLE `ci_relation` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `source_ci_id` char(36) NOT NULL,
  `target_ci_id` char(36) NOT NULL,
  `relation_type_id` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `valid_from` datetime(3) NOT NULL,
  `valid_until` datetime(3) NULL COMMENT 'Límite exclusivo',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ci_relation_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ci_relation_1` (`source_ci_id`, `target_ci_id`, `relation_type_id`),
  CONSTRAINT `ck_ci_relation_0` CHECK (source_ci_id <> target_ci_id),
  CONSTRAINT `ck_ci_relation_1` CHECK (valid_until IS NULL OR valid_until > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: CI vinculado a servicio o subservicio; validar coherencia entre ambos.
CREATE TABLE `ci_service_link` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ci_id` char(36) NOT NULL,
  `service_id` char(36) NOT NULL,
  `subservice_id` char(36) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `valid_from` datetime(3) NOT NULL,
  `valid_until` datetime(3) NULL COMMENT 'Límite exclusivo',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ci_service_link_0` (`client_id`, `id`),
  CONSTRAINT `ck_ci_service_link_0` CHECK (valid_until IS NULL OR valid_until > valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- CMDB: Intersección autorizada oferta-proyecto-CI.
CREATE TABLE `offering_ci` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `offering_id` char(36) NOT NULL,
  `ci_id` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_offering_ci_0` (`client_id`, `id`),
  UNIQUE KEY `uq_offering_ci_1` (`offering_id`, `ci_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Identidad del calendario; compartible, sin datos del cliente.
CREATE TABLE `business_calendar` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `code` varchar(64) NOT NULL,
  `name` varchar(160) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_business_calendar_0` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Reglas congeladas y cobertura de cálculo.
CREATE TABLE `calendar_version` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `calendar_id` char(36) NOT NULL,
  `revision` int NOT NULL,
  `timezone` varchar(160) NOT NULL,
  `tzdb_version` varchar(64) NOT NULL,
  `engine_version` varchar(64) NOT NULL,
  `coverage_start` date NOT NULL,
  `coverage_end` date NOT NULL,
  `content_hash` char(64) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `published_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calendar_version_0` (`calendar_id`, `revision`),
  CONSTRAINT `ck_calendar_version_0` CHECK (coverage_end > coverage_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Intervalos locales [inicio, fin); turnos nocturnos se dividen.
CREATE TABLE `calendar_week_interval` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `calendar_version_id` char(36) NOT NULL,
  `weekday_iso` int NOT NULL,
  `start_minute` int NOT NULL,
  `end_minute` int NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  CONSTRAINT `ck_calendar_week_interval_0` CHECK (weekday_iso BETWEEN 1 AND 7),
  CONSTRAINT `ck_calendar_week_interval_1` CHECK (start_minute >= 0 AND end_minute <= 1440 AND end_minute > start_minute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Reemplaza toda la jornada de esa fecha civil; sin intervalos significa cerrado.
CREATE TABLE `calendar_exception` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `calendar_version_id` char(36) NOT NULL,
  `local_date` date NOT NULL,
  `name` varchar(160) NOT NULL,
  `recurrence_source` json NULL COMMENT 'Regla expandida al publicar',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calendar_exception_0` (`calendar_version_id`, `local_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Ventanas de apertura de la excepción.
CREATE TABLE `calendar_exception_interval` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `exception_id` char(36) NOT NULL,
  `start_minute` int NOT NULL,
  `end_minute` int NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  CONSTRAINT `ck_calendar_exception_interval_0` CHECK (start_minute >= 0 AND end_minute <= 1440 AND end_minute > start_minute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Ventanas UTC compiladas; reproducibilidad frente a cambios de tzdb.
CREATE TABLE `calendar_work_interval` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `calendar_version_id` char(36) NOT NULL,
  `start_at` datetime(3) NOT NULL,
  `end_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calendar_work_interval_0` (`calendar_version_id`, `start_at`),
  KEY `ix_calendar_work_interval_0` (`calendar_version_id`, `end_at`),
  CONSTRAINT `ck_calendar_work_interval_0` CHECK (end_at > start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Conjunto contractual de reglas por cliente.
CREATE TABLE `sla_policy_set` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_policy_set_0` (`client_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Publicación atómica de reglas ordenadas y fallback.
CREATE TABLE `sla_policy_version` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `policy_set_id` char(36) NOT NULL,
  `revision` int NOT NULL,
  `effective_from` datetime(3) NOT NULL,
  `engine_version` varchar(64) NOT NULL,
  `content_hash` char(64) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `published_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_policy_version_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_policy_version_1` (`policy_set_id`, `revision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Primera regla coincidente por orden único; condiciones AND tipadas.
CREATE TABLE `sla_rule` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `policy_version_id` char(36) NOT NULL,
  `rule_order` int NOT NULL,
  `name` varchar(160) NOT NULL,
  `conditions` json NOT NULL,
  `priority` varchar(32) NOT NULL,
  `is_fallback` boolean NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_rule_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_rule_1` (`policy_version_id`, `rule_order`),
  CONSTRAINT `ck_sla_rule_0` CHECK (rule_order >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Objetivo independiente por métrica; duraciones enteras.
CREATE TABLE `sla_target` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `rule_id` char(36) NOT NULL,
  `metric` varchar(32) NOT NULL,
  `target_ms` bigint NOT NULL,
  `calendar_version_id` char(36) NOT NULL,
  `pause_reasons` json NOT NULL,
  `max_pause_ms` bigint NULL,
  `warning_thresholds` json NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_target_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_target_1` (`rule_id`, `metric`),
  CONSTRAINT `ck_sla_target_0` CHECK (target_ms > 0),
  CONSTRAINT `ck_sla_target_1` CHECK (max_pause_ms IS NULL OR max_pause_ms > 0),
  CONSTRAINT `ck_sla_target_2` CHECK (metric IN ('FIRST_RESPONSE','RESOLUTION'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Reglas publicadas de distribución interna.
CREATE TABLE `routing_version` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `name` varchar(160) NOT NULL,
  `revision` int NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `published_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_routing_version_0` (`client_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Calendarios y políticas: Asignación a grupo; persona opcional, sin alterar SLA.
CREATE TABLE `routing_rule` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `routing_version_id` char(36) NOT NULL,
  `rule_order` int NOT NULL,
  `conditions` json NOT NULL,
  `group_id` char(36) NOT NULL,
  `assignee_user_id` char(36) NULL,
  `fallback_group_id` char(36) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_routing_rule_0` (`client_id`, `id`),
  UNIQUE KEY `uq_routing_rule_1` (`routing_version_id`, `rule_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Solicitud; columnas opcionales permiten incorporación gradual y tickets legacy.
CREATE TABLE `ticket` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `number` bigint NOT NULL,
  `ticket_key` varchar(64) NOT NULL,
  `title` varchar(160) NOT NULL,
  `description` text NOT NULL,
  `type` varchar(32) NOT NULL,
  `priority` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `visibility` varchar(32) NOT NULL,
  `reporter_user_id` char(36) NOT NULL,
  `created_by` char(36) NOT NULL,
  `offering_id` char(36) NULL,
  `requester_level_id` char(36) NULL,
  `impact` varchar(32) NULL,
  `urgency` varchar(32) NULL,
  `classification_snapshot` json NULL,
  `current_group_id` char(36) NULL,
  `assignee_user_id` char(36) NULL,
  `sla_mode` varchar(32) NOT NULL COMMENT 'ACTIVE, NONE o LEGACY_UNMEASURED; ausencia explícita, nunca SLA cero',
  `resolution_code` varchar(64) NULL,
  `resolution_summary` text NULL,
  `cancellation_reason` text NULL,
  `accepted_at` datetime(3) NOT NULL,
  `resolved_at` datetime(3) NULL,
  `closed_at` datetime(3) NULL,
  `updated_at` datetime(3) NOT NULL,
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_1` (`project_id`, `number`),
  UNIQUE KEY `uq_ticket_2` (`ticket_key`),
  KEY `ix_ticket_0` (`client_id`, `project_id`, `status`, `updated_at`),
  KEY `ix_ticket_1` (`assignee_user_id`, `status`),
  CONSTRAINT `ck_ticket_0` CHECK (number > 0),
  CONSTRAINT `ck_ticket_1` CHECK (visibility IN ('CLIENT','INTERNAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: CI afectado, principal o secundario; nunca duplicado.
CREATE TABLE `ticket_ci` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `ci_id` char(36) NOT NULL,
  `is_primary` boolean NOT NULL,
  `snapshot` json NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_ci_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_ci_1` (`ticket_id`, `ci_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Comentario público o nota interna; sin borrado cascada.
CREATE TABLE `ticket_comment` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `author_user_id` char(36) NOT NULL,
  `visibility` varchar(32) NOT NULL,
  `body` text NOT NULL,
  `edited_at` datetime(3) NULL,
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_comment_0` (`client_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Metadatos y visibilidad; archivo privado en S3.
CREATE TABLE `attachment` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `comment_id` char(36) NULL,
  `uploaded_by` char(36) NOT NULL,
  `object_key` varchar(512) NOT NULL,
  `file_name` varchar(160) NOT NULL,
  `content_type` varchar(160) NOT NULL,
  `size_bytes` bigint NOT NULL,
  `checksum` char(64) NULL,
  `visibility` varchar(32) NOT NULL,
  `scan_status` varchar(32) NOT NULL,
  `verified_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attachment_0` (`client_id`, `id`),
  CONSTRAINT `ck_attachment_0` CHECK (size_bytes >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Participante concede alcance; follower solo notifica.
CREATE TABLE `ticket_participant` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `kind` varchar(32) NOT NULL,
  `added_by` char(36) NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_participant_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_participant_1` (`ticket_id`, `user_id`, `kind`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Relación autorizada entre tickets; ciclos según tipo.
CREATE TABLE `ticket_relation` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `source_ticket_id` char(36) NOT NULL,
  `target_ticket_id` char(36) NOT NULL,
  `kind` varchar(32) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_relation_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_relation_1` (`source_ticket_id`, `target_ticket_id`, `kind`),
  CONSTRAINT `ck_ticket_relation_0` CHECK (source_ticket_id <> target_ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Etiqueta de proyecto.
CREATE TABLE `tag` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `name` varchar(30) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tag_0` (`client_id`, `id`),
  UNIQUE KEY `uq_tag_1` (`project_id`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Etiquetas del ticket.
CREATE TABLE `ticket_tag` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `tag_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_tag_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_tag_1` (`ticket_id`, `tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Hecho inmutable con versión por agregado y proyección pública revisada.
CREATE TABLE `ticket_event` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `sequence` bigint NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `actor_user_id` char(36) NULL,
  `occurred_at` datetime(3) NOT NULL,
  `visibility` varchar(32) NOT NULL,
  `payload` json NOT NULL,
  `request_id` varchar(64) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_event_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_event_1` (`ticket_id`, `sequence`),
  KEY `ix_ticket_event_0` (`ticket_id`, `occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Historia de custodios. La cola actual conserva el ticket durante transferencia.
CREATE TABLE `ticket_assignment` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `group_id` char(36) NOT NULL,
  `assignee_user_id` char(36) NULL,
  `started_at` datetime(3) NOT NULL,
  `ended_at` datetime(3) NULL,
  `reason` text NOT NULL,
  `assigned_by` char(36) NOT NULL,
  `routing_rule_id` char(36) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  `open_ticket_id` char(36) GENERATED ALWAYS AS (CASE WHEN ended_at IS NULL THEN ticket_id ELSE NULL END) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_assignment_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_assignment_1` (`open_ticket_id`),
  CONSTRAINT `ck_ticket_assignment_0` CHECK (ended_at IS NULL OR ended_at >= started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Tickets y colaboración: Solicitar, aceptar, declinar o cancelar traslado; no es rechazo del ticket.
CREATE TABLE `ticket_transfer` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `from_assignment_id` char(36) NOT NULL,
  `to_group_id` char(36) NOT NULL,
  `requested_by` char(36) NOT NULL,
  `reason` text NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `decided_by` char(36) NULL,
  `decision_reason` text NULL,
  `decided_at` datetime(3) NULL,
  `review_due_at` datetime(3) NOT NULL,
  `result_assignment_id` char(36) NULL,
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  `pending_ticket_id` char(36) GENERATED ALWAYS AS (CASE WHEN status = 'REQUESTED' THEN ticket_id ELSE NULL END) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_transfer_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_transfer_1` (`pending_ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Ciclo 1 al aceptar; siguientes al reabrir con motivo.
CREATE TABLE `ticket_cycle` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `cycle_number` int NOT NULL,
  `started_at` datetime(3) NOT NULL,
  `ended_at` datetime(3) NULL,
  `outcome` varchar(32) NULL,
  `reason` text NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  `open_ticket_id` char(36) GENERATED ALWAYS AS (CASE WHEN ended_at IS NULL THEN ticket_id ELSE NULL END) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_cycle_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_cycle_1` (`ticket_id`, `cycle_number`),
  UNIQUE KEY `uq_ticket_cycle_2` (`open_ticket_id`),
  CONSTRAINT `ck_ticket_cycle_0` CHECK (cycle_number > 0),
  CONSTRAINT `ck_ticket_cycle_1` CHECK (ended_at IS NULL OR ended_at >= started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Entrada y resultado congelados; también registra overrides y migraciones.
CREATE TABLE `sla_evaluation` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `cycle_id` char(36) NOT NULL,
  `policy_version_id` char(36) NOT NULL,
  `rule_id` char(36) NOT NULL,
  `input_snapshot` json NOT NULL,
  `result_snapshot` json NOT NULL,
  `evaluated_at` datetime(3) NOT NULL,
  `engine_version` varchar(64) NOT NULL,
  `reason` text NOT NULL,
  `actor_user_id` char(36) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_evaluation_0` (`client_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Estado materializado independiente para primera respuesta y resolución.
CREATE TABLE `ticket_sla_clock` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `ticket_id` char(36) NOT NULL,
  `cycle_id` char(36) NOT NULL,
  `metric` varchar(32) NOT NULL,
  `state` varchar(32) NOT NULL,
  `started_at` datetime(3) NOT NULL,
  `consumed_ms` bigint NOT NULL,
  `checkpoint_at` datetime(3) NOT NULL,
  `due_at` datetime(3) NULL COMMENT 'NULL si pausado; fecha calculada si corre',
  `last_due_at` datetime(3) NULL,
  `breached_at` datetime(3) NULL COMMENT 'Primer incumplimiento, irreversible',
  `completed_at` datetime(3) NULL,
  `active_revision_number` int NOT NULL,
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ticket_sla_clock_0` (`client_id`, `id`),
  UNIQUE KEY `uq_ticket_sla_clock_1` (`cycle_id`, `metric`),
  KEY `ix_ticket_sla_clock_0` (`state`, `due_at`),
  CONSTRAINT `ck_ticket_sla_clock_0` CHECK (consumed_ms >= 0),
  CONSTRAINT `ck_ticket_sla_clock_1` CHECK (active_revision_number > 0),
  CONSTRAINT `ck_ticket_sla_clock_2` CHECK (metric IN ('FIRST_RESPONSE','RESOLUTION')),
  CONSTRAINT `ck_ticket_sla_clock_3` CHECK (state IN ('RUNNING','PAUSED','STOPPED','CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Presupuesto y calendario aplicados; crear otra fila al cambiar, no UPDATE.
CREATE TABLE `sla_clock_revision` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `clock_id` char(36) NOT NULL,
  `revision_number` int NOT NULL,
  `evaluation_id` char(36) NOT NULL,
  `target_id` char(36) NOT NULL,
  `calendar_version_id` char(36) NOT NULL,
  `target_ms` bigint NOT NULL,
  `consumed_at_change_ms` bigint NOT NULL,
  `effective_at` datetime(3) NOT NULL,
  `reason` text NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_clock_revision_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_clock_revision_1` (`clock_id`, `revision_number`),
  CONSTRAINT `ck_sla_clock_revision_0` CHECK (target_ms > 0),
  CONSTRAINT `ck_sla_clock_revision_1` CHECK (consumed_at_change_ms >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Pausa autorizada por reloj. Intervalos [start,end); no doble descuento.
CREATE TABLE `sla_pause` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `clock_id` char(36) NOT NULL,
  `started_at` datetime(3) NOT NULL,
  `ended_at` datetime(3) NULL,
  `reason_code` varchar(64) NOT NULL,
  `reason_text` text NOT NULL,
  `trigger_comment_id` char(36) NULL,
  `started_by` char(36) NOT NULL,
  `ended_by` char(36) NULL,
  `auto_resume_at` datetime(3) NULL,
  `review_at` datetime(3) NULL,
  `dedupe_key` varchar(64) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  `open_clock_id` char(36) GENERATED ALWAYS AS (CASE WHEN ended_at IS NULL THEN clock_id ELSE NULL END) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_pause_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_pause_1` (`clock_id`, `dedupe_key`),
  UNIQUE KEY `uq_sla_pause_2` (`open_clock_id`),
  CONSTRAINT `ck_sla_pause_0` CHECK (ended_at IS NULL OR ended_at >= started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Traza del cálculo, checkpoint y vencimiento histórico antes/después.
CREATE TABLE `sla_clock_event` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `clock_id` char(36) NOT NULL,
  `sequence` bigint NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `occurred_at` datetime(3) NOT NULL,
  `delta_consumed_ms` bigint NOT NULL,
  `payload` json NOT NULL,
  `source_event_id` char(36) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_clock_event_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_clock_event_1` (`clock_id`, `sequence`),
  CONSTRAINT `ck_sla_clock_event_0` CHECK (delta_consumed_ms >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- SLA en ejecución: Dedupe de alertas por revisión; workers comprueban versión vigente.
CREATE TABLE `sla_alert` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `clock_id` char(36) NOT NULL,
  `revision_number` int NOT NULL,
  `kind` varchar(64) NOT NULL,
  `scheduled_at` datetime(3) NOT NULL,
  `delivered_at` datetime(3) NULL,
  `cancelled_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sla_alert_0` (`client_id`, `id`),
  UNIQUE KEY `uq_sla_alert_1` (`clock_id`, `revision_number`, `kind`),
  KEY `ix_sla_alert_0` (`scheduled_at`, `delivered_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Evento durable para avisos; no publicar a SQS antes del commit.
CREATE TABLE `outbox_event` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `aggregate_id` char(36) NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `payload` json NOT NULL,
  `available_at` datetime(3) NOT NULL,
  `published_at` datetime(3) NULL,
  `attempts` int NOT NULL,
  `locked_until` datetime(3) NULL,
  `lease_owner` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  KEY `ix_outbox_event_0` (`published_at`, `available_at`),
  CONSTRAINT `ck_outbox_event_0` CHECK (attempts >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Idempotencia por consumidor y evento.
CREATE TABLE `consumer_receipt` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `consumer` varchar(64) NOT NULL,
  `event_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_consumer_receipt_0` (`consumer`, `event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Notificación con referencia; reautorizar al leer y al enviar.
CREATE TABLE `notification` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `recipient_user_id` char(36) NOT NULL,
  `ticket_id` char(36) NULL,
  `source_event_id` char(36) NOT NULL,
  `kind` varchar(64) NOT NULL,
  `read_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notification_0` (`client_id`, `id`),
  UNIQUE KEY `uq_notification_1` (`recipient_user_id`, `source_event_id`, `kind`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Preferencias por canal y clase de evento.
CREATE TABLE `notification_preference` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `user_id` char(36) NOT NULL,
  `channel` varchar(32) NOT NULL,
  `event_type` varchar(64) NOT NULL,
  `enabled` boolean NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notification_preference_0` (`user_id`, `channel`, `event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Intentos de entrega y resultado del proveedor.
CREATE TABLE `notification_delivery` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `notification_id` char(36) NOT NULL,
  `channel` varchar(32) NOT NULL,
  `attempt` int NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `provider_message_id` varchar(160) NULL,
  `sent_at` datetime(3) NULL,
  `last_error_code` varchar(64) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_notification_delivery_0` (`client_id`, `id`),
  UNIQUE KEY `uq_notification_delivery_1` (`notification_id`, `channel`, `attempt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Clave por actor y operación; reautorizar todo replay.
CREATE TABLE `idempotency_record` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `actor_user_id` char(36) NOT NULL,
  `operation` varchar(64) NOT NULL,
  `request_key` varchar(64) NOT NULL,
  `request_hash` char(64) NOT NULL,
  `resource_id` char(36) NULL,
  `status` varchar(32) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_idempotency_record_0` (`actor_user_id`, `operation`, `request_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Auditoría restringida; retención separada y exportación inmutable.
CREATE TABLE `audit_event` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NULL,
  `actor_user_id` char(36) NULL,
  `resource_type` varchar(64) NOT NULL,
  `resource_id` char(36) NULL,
  `action` varchar(64) NOT NULL,
  `request_id` varchar(64) NOT NULL,
  `payload_redacted` json NOT NULL,
  `occurred_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  KEY `ix_audit_event_0` (`client_id`, `occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Operación: Exportación de alcance congelado, permiso revalidado antes de descargar.
CREATE TABLE `export_job` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `client_id` char(36) NOT NULL,
  `requested_by` char(36) NOT NULL,
  `filters` json NOT NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `object_key` varchar(512) NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_export_job_0` (`client_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- FK después de crear tablas para permitir dependencias bidireccionales.
ALTER TABLE `identity_link` ADD CONSTRAINT `fk_identity_link_0` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `employee` ADD CONSTRAINT `fk_employee_0` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `requester_level` ADD CONSTRAINT `fk_requester_level_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `client_contact` ADD CONSTRAINT `fk_client_contact_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `client_contact` ADD CONSTRAINT `fk_client_contact_1` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `client_contact` ADD CONSTRAINT `fk_client_contact_2` FOREIGN KEY (`client_id`, `requester_level_id`) REFERENCES `requester_level` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project` ADD CONSTRAINT `fk_project_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project` ADD CONSTRAINT `fk_project_1` FOREIGN KEY (`manager_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_member` ADD CONSTRAINT `fk_project_member_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_member` ADD CONSTRAINT `fk_project_member_1` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_member` ADD CONSTRAINT `fk_project_member_2` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_member` ADD CONSTRAINT `fk_project_member_3` FOREIGN KEY (`client_id`, `requester_level_id`) REFERENCES `requester_level` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_counter` ADD CONSTRAINT `fk_project_counter_0` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `invitation` ADD CONSTRAINT `fk_invitation_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `invitation` ADD CONSTRAINT `fk_invitation_1` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `invitation` ADD CONSTRAINT `fk_invitation_2` FOREIGN KEY (`invited_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `area` ADD CONSTRAINT `fk_area_0` FOREIGN KEY (`owner_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `resolver_group` ADD CONSTRAINT `fk_resolver_group_0` FOREIGN KEY (`area_id`) REFERENCES `area` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `resolver_group` ADD CONSTRAINT `fk_resolver_group_1` FOREIGN KEY (`lead_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `resolver_group` ADD CONSTRAINT `fk_resolver_group_2` FOREIGN KEY (`backup_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `group_member` ADD CONSTRAINT `fk_group_member_0` FOREIGN KEY (`group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `group_member` ADD CONSTRAINT `fk_group_member_1` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_group` ADD CONSTRAINT `fk_project_group_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_group` ADD CONSTRAINT `fk_project_group_1` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `project_group` ADD CONSTRAINT `fk_project_group_2` FOREIGN KEY (`group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `client_product` ADD CONSTRAINT `fk_client_product_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `client_product` ADD CONSTRAINT `fk_client_product_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service` ADD CONSTRAINT `fk_service_0` FOREIGN KEY (`category_id`) REFERENCES `service_category` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `subservice` ADD CONSTRAINT `fk_subservice_0` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `subservice_version` ADD CONSTRAINT `fk_subservice_version_0` FOREIGN KEY (`subservice_id`) REFERENCES `subservice` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `subservice_version` ADD CONSTRAINT `fk_subservice_version_1` FOREIGN KEY (`default_group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service_offering` ADD CONSTRAINT `fk_service_offering_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service_offering` ADD CONSTRAINT `fk_service_offering_1` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service_offering` ADD CONSTRAINT `fk_service_offering_2` FOREIGN KEY (`subservice_version_id`) REFERENCES `subservice_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service_offering` ADD CONSTRAINT `fk_service_offering_3` FOREIGN KEY (`client_id`, `client_product_id`) REFERENCES `client_product` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service_offering` ADD CONSTRAINT `fk_service_offering_4` FOREIGN KEY (`client_id`, `routing_version_id`) REFERENCES `routing_version` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `service_offering` ADD CONSTRAINT `fk_service_offering_5` FOREIGN KEY (`client_id`, `sla_policy_version_id`) REFERENCES `sla_policy_version` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `offering_level` ADD CONSTRAINT `fk_offering_level_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `offering_level` ADD CONSTRAINT `fk_offering_level_1` FOREIGN KEY (`client_id`, `offering_id`) REFERENCES `service_offering` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `offering_level` ADD CONSTRAINT `fk_offering_level_2` FOREIGN KEY (`client_id`, `requester_level_id`) REFERENCES `requester_level` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_schema_version` ADD CONSTRAINT `fk_ci_schema_version_0` FOREIGN KEY (`class_id`) REFERENCES `ci_class` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `configuration_item` ADD CONSTRAINT `fk_configuration_item_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `configuration_item` ADD CONSTRAINT `fk_configuration_item_1` FOREIGN KEY (`schema_version_id`) REFERENCES `ci_schema_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `configuration_item` ADD CONSTRAINT `fk_configuration_item_2` FOREIGN KEY (`client_id`, `client_product_id`) REFERENCES `client_product` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `configuration_item` ADD CONSTRAINT `fk_configuration_item_3` FOREIGN KEY (`owner_area_id`) REFERENCES `area` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `configuration_item` ADD CONSTRAINT `fk_configuration_item_4` FOREIGN KEY (`support_group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `configuration_item` ADD CONSTRAINT `fk_configuration_item_5` FOREIGN KEY (`technical_owner_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_project` ADD CONSTRAINT `fk_ci_project_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_project` ADD CONSTRAINT `fk_ci_project_1` FOREIGN KEY (`client_id`, `ci_id`) REFERENCES `configuration_item` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_project` ADD CONSTRAINT `fk_ci_project_2` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_relation` ADD CONSTRAINT `fk_ci_relation_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_relation` ADD CONSTRAINT `fk_ci_relation_1` FOREIGN KEY (`client_id`, `source_ci_id`) REFERENCES `configuration_item` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_relation` ADD CONSTRAINT `fk_ci_relation_2` FOREIGN KEY (`client_id`, `target_ci_id`) REFERENCES `configuration_item` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_relation` ADD CONSTRAINT `fk_ci_relation_3` FOREIGN KEY (`relation_type_id`) REFERENCES `ci_relation_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_service_link` ADD CONSTRAINT `fk_ci_service_link_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_service_link` ADD CONSTRAINT `fk_ci_service_link_1` FOREIGN KEY (`client_id`, `ci_id`) REFERENCES `configuration_item` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_service_link` ADD CONSTRAINT `fk_ci_service_link_2` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ci_service_link` ADD CONSTRAINT `fk_ci_service_link_3` FOREIGN KEY (`subservice_id`) REFERENCES `subservice` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `offering_ci` ADD CONSTRAINT `fk_offering_ci_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `offering_ci` ADD CONSTRAINT `fk_offering_ci_1` FOREIGN KEY (`client_id`, `offering_id`) REFERENCES `service_offering` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `offering_ci` ADD CONSTRAINT `fk_offering_ci_2` FOREIGN KEY (`client_id`, `ci_id`) REFERENCES `configuration_item` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `calendar_version` ADD CONSTRAINT `fk_calendar_version_0` FOREIGN KEY (`calendar_id`) REFERENCES `business_calendar` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `calendar_week_interval` ADD CONSTRAINT `fk_calendar_week_interval_0` FOREIGN KEY (`calendar_version_id`) REFERENCES `calendar_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `calendar_exception` ADD CONSTRAINT `fk_calendar_exception_0` FOREIGN KEY (`calendar_version_id`) REFERENCES `calendar_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `calendar_exception_interval` ADD CONSTRAINT `fk_calendar_exception_interval_0` FOREIGN KEY (`exception_id`) REFERENCES `calendar_exception` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `calendar_work_interval` ADD CONSTRAINT `fk_calendar_work_interval_0` FOREIGN KEY (`calendar_version_id`) REFERENCES `calendar_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_policy_set` ADD CONSTRAINT `fk_sla_policy_set_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_policy_version` ADD CONSTRAINT `fk_sla_policy_version_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_policy_version` ADD CONSTRAINT `fk_sla_policy_version_1` FOREIGN KEY (`client_id`, `policy_set_id`) REFERENCES `sla_policy_set` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_rule` ADD CONSTRAINT `fk_sla_rule_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_rule` ADD CONSTRAINT `fk_sla_rule_1` FOREIGN KEY (`client_id`, `policy_version_id`) REFERENCES `sla_policy_version` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_target` ADD CONSTRAINT `fk_sla_target_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_target` ADD CONSTRAINT `fk_sla_target_1` FOREIGN KEY (`client_id`, `rule_id`) REFERENCES `sla_rule` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_target` ADD CONSTRAINT `fk_sla_target_2` FOREIGN KEY (`calendar_version_id`) REFERENCES `calendar_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `routing_version` ADD CONSTRAINT `fk_routing_version_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `routing_rule` ADD CONSTRAINT `fk_routing_rule_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `routing_rule` ADD CONSTRAINT `fk_routing_rule_1` FOREIGN KEY (`client_id`, `routing_version_id`) REFERENCES `routing_version` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `routing_rule` ADD CONSTRAINT `fk_routing_rule_2` FOREIGN KEY (`group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `routing_rule` ADD CONSTRAINT `fk_routing_rule_3` FOREIGN KEY (`assignee_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `routing_rule` ADD CONSTRAINT `fk_routing_rule_4` FOREIGN KEY (`fallback_group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_1` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_2` FOREIGN KEY (`client_id`, `offering_id`) REFERENCES `service_offering` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_3` FOREIGN KEY (`client_id`, `requester_level_id`) REFERENCES `requester_level` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_4` FOREIGN KEY (`reporter_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_5` FOREIGN KEY (`created_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_6` FOREIGN KEY (`current_group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_7` FOREIGN KEY (`assignee_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_ci` ADD CONSTRAINT `fk_ticket_ci_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_ci` ADD CONSTRAINT `fk_ticket_ci_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_ci` ADD CONSTRAINT `fk_ticket_ci_2` FOREIGN KEY (`client_id`, `ci_id`) REFERENCES `configuration_item` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_comment` ADD CONSTRAINT `fk_ticket_comment_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_comment` ADD CONSTRAINT `fk_ticket_comment_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_comment` ADD CONSTRAINT `fk_ticket_comment_2` FOREIGN KEY (`author_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `attachment` ADD CONSTRAINT `fk_attachment_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `attachment` ADD CONSTRAINT `fk_attachment_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `attachment` ADD CONSTRAINT `fk_attachment_2` FOREIGN KEY (`client_id`, `comment_id`) REFERENCES `ticket_comment` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `attachment` ADD CONSTRAINT `fk_attachment_3` FOREIGN KEY (`uploaded_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_participant` ADD CONSTRAINT `fk_ticket_participant_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_participant` ADD CONSTRAINT `fk_ticket_participant_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_participant` ADD CONSTRAINT `fk_ticket_participant_2` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_participant` ADD CONSTRAINT `fk_ticket_participant_3` FOREIGN KEY (`added_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_relation` ADD CONSTRAINT `fk_ticket_relation_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_relation` ADD CONSTRAINT `fk_ticket_relation_1` FOREIGN KEY (`client_id`, `source_ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_relation` ADD CONSTRAINT `fk_ticket_relation_2` FOREIGN KEY (`client_id`, `target_ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `tag` ADD CONSTRAINT `fk_tag_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `tag` ADD CONSTRAINT `fk_tag_1` FOREIGN KEY (`client_id`, `project_id`) REFERENCES `project` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_tag` ADD CONSTRAINT `fk_ticket_tag_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_tag` ADD CONSTRAINT `fk_ticket_tag_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_tag` ADD CONSTRAINT `fk_ticket_tag_2` FOREIGN KEY (`client_id`, `tag_id`) REFERENCES `tag` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_event` ADD CONSTRAINT `fk_ticket_event_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_event` ADD CONSTRAINT `fk_ticket_event_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_event` ADD CONSTRAINT `fk_ticket_event_2` FOREIGN KEY (`actor_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_assignment` ADD CONSTRAINT `fk_ticket_assignment_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_assignment` ADD CONSTRAINT `fk_ticket_assignment_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_assignment` ADD CONSTRAINT `fk_ticket_assignment_2` FOREIGN KEY (`group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_assignment` ADD CONSTRAINT `fk_ticket_assignment_3` FOREIGN KEY (`assignee_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_assignment` ADD CONSTRAINT `fk_ticket_assignment_4` FOREIGN KEY (`assigned_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_assignment` ADD CONSTRAINT `fk_ticket_assignment_5` FOREIGN KEY (`client_id`, `routing_rule_id`) REFERENCES `routing_rule` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_2` FOREIGN KEY (`client_id`, `from_assignment_id`) REFERENCES `ticket_assignment` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_3` FOREIGN KEY (`client_id`, `result_assignment_id`) REFERENCES `ticket_assignment` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_4` FOREIGN KEY (`to_group_id`) REFERENCES `resolver_group` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_5` FOREIGN KEY (`requested_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_transfer` ADD CONSTRAINT `fk_ticket_transfer_6` FOREIGN KEY (`decided_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_cycle` ADD CONSTRAINT `fk_ticket_cycle_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_cycle` ADD CONSTRAINT `fk_ticket_cycle_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_evaluation` ADD CONSTRAINT `fk_sla_evaluation_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_evaluation` ADD CONSTRAINT `fk_sla_evaluation_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_evaluation` ADD CONSTRAINT `fk_sla_evaluation_2` FOREIGN KEY (`client_id`, `cycle_id`) REFERENCES `ticket_cycle` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_evaluation` ADD CONSTRAINT `fk_sla_evaluation_3` FOREIGN KEY (`client_id`, `policy_version_id`) REFERENCES `sla_policy_version` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_evaluation` ADD CONSTRAINT `fk_sla_evaluation_4` FOREIGN KEY (`client_id`, `rule_id`) REFERENCES `sla_rule` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_evaluation` ADD CONSTRAINT `fk_sla_evaluation_5` FOREIGN KEY (`actor_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_sla_clock` ADD CONSTRAINT `fk_ticket_sla_clock_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_sla_clock` ADD CONSTRAINT `fk_ticket_sla_clock_1` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `ticket_sla_clock` ADD CONSTRAINT `fk_ticket_sla_clock_2` FOREIGN KEY (`client_id`, `cycle_id`) REFERENCES `ticket_cycle` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_revision` ADD CONSTRAINT `fk_sla_clock_revision_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_revision` ADD CONSTRAINT `fk_sla_clock_revision_1` FOREIGN KEY (`client_id`, `clock_id`) REFERENCES `ticket_sla_clock` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_revision` ADD CONSTRAINT `fk_sla_clock_revision_2` FOREIGN KEY (`client_id`, `evaluation_id`) REFERENCES `sla_evaluation` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_revision` ADD CONSTRAINT `fk_sla_clock_revision_3` FOREIGN KEY (`client_id`, `target_id`) REFERENCES `sla_target` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_revision` ADD CONSTRAINT `fk_sla_clock_revision_4` FOREIGN KEY (`calendar_version_id`) REFERENCES `calendar_version` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_pause` ADD CONSTRAINT `fk_sla_pause_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_pause` ADD CONSTRAINT `fk_sla_pause_1` FOREIGN KEY (`client_id`, `clock_id`) REFERENCES `ticket_sla_clock` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_pause` ADD CONSTRAINT `fk_sla_pause_2` FOREIGN KEY (`client_id`, `trigger_comment_id`) REFERENCES `ticket_comment` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_pause` ADD CONSTRAINT `fk_sla_pause_3` FOREIGN KEY (`started_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_pause` ADD CONSTRAINT `fk_sla_pause_4` FOREIGN KEY (`ended_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_event` ADD CONSTRAINT `fk_sla_clock_event_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_event` ADD CONSTRAINT `fk_sla_clock_event_1` FOREIGN KEY (`client_id`, `clock_id`) REFERENCES `ticket_sla_clock` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_clock_event` ADD CONSTRAINT `fk_sla_clock_event_2` FOREIGN KEY (`client_id`, `source_event_id`) REFERENCES `ticket_event` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_alert` ADD CONSTRAINT `fk_sla_alert_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `sla_alert` ADD CONSTRAINT `fk_sla_alert_1` FOREIGN KEY (`client_id`, `clock_id`) REFERENCES `ticket_sla_clock` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `notification` ADD CONSTRAINT `fk_notification_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `notification` ADD CONSTRAINT `fk_notification_1` FOREIGN KEY (`recipient_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `notification` ADD CONSTRAINT `fk_notification_2` FOREIGN KEY (`client_id`, `ticket_id`) REFERENCES `ticket` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `notification_preference` ADD CONSTRAINT `fk_notification_preference_0` FOREIGN KEY (`user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `notification_delivery` ADD CONSTRAINT `fk_notification_delivery_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `notification_delivery` ADD CONSTRAINT `fk_notification_delivery_1` FOREIGN KEY (`client_id`, `notification_id`) REFERENCES `notification` (`client_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `idempotency_record` ADD CONSTRAINT `fk_idempotency_record_0` FOREIGN KEY (`actor_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `audit_event` ADD CONSTRAINT `fk_audit_event_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `audit_event` ADD CONSTRAINT `fk_audit_event_1` FOREIGN KEY (`actor_user_id`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `export_job` ADD CONSTRAINT `fk_export_job_0` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `export_job` ADD CONSTRAINT `fk_export_job_1` FOREIGN KEY (`requested_by`) REFERENCES `app_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
