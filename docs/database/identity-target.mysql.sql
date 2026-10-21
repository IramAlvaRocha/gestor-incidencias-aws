-- Arena: ESQUEMA OBJETIVO de referencia. NO es una migración.
-- MySQL 8.4 / InnoDB. Ejecutar SOLO en schema vacío seleccionado por el operador.
-- No incluye CREATE DATABASE, USE, DROP ni INSERT. No ejecutar sobre la base actual.
-- Fuente: model.mjs. Instantes DATETIME(3) UTC; duraciones BIGINT en ms.
SET time_zone = '+00:00';
SET NAMES utf8mb4 COLLATE utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Cuenta del proveedor propio de aprendizaje.
CREATE TABLE `auth_account` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `email_normalized` varchar(254) NOT NULL,
  `email_verified_at` datetime(3) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `token_version` int NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_account_0` (`email_normalized`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Hash Argon2id o algoritmo aprobado; no contraseña reversible.
CREATE TABLE `auth_password` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `account_id` char(36) NOT NULL,
  `encoded_hash` varchar(512) NOT NULL,
  `changed_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_password_0` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Una familia de refresh por sesión/dispositivo.
CREATE TABLE `auth_session` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `account_id` char(36) NOT NULL,
  `client_code` varchar(64) NOT NULL,
  `absolute_expires_at` datetime(3) NOT NULL,
  `idle_expires_at` datetime(3) NOT NULL,
  `revoked_at` datetime(3) NULL,
  `revoke_reason` varchar(64) NULL,
  `last_seen_at` datetime(3) NOT NULL,
  `version` int NOT NULL COMMENT 'Control optimista, incremento atómico',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Token opaco aleatorio; hash en DB; rotación de un solo uso.
CREATE TABLE `auth_refresh_token` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `session_id` char(36) NOT NULL,
  `generation` int NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) NULL,
  `revoked_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_refresh_token_0` (`token_hash`),
  UNIQUE KEY `uq_auth_refresh_token_1` (`session_id`, `generation`),
  CONSTRAINT `ck_auth_refresh_token_0` CHECK (generation >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Verificación de email o recuperación, un uso con expiración.
CREATE TABLE `auth_one_time_token` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `account_id` char(36) NOT NULL,
  `purpose` varchar(64) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `consumed_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_one_time_token_0` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: WebAuthn pública o referencia a secreto cifrado TOTP.
CREATE TABLE `auth_mfa_credential` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `account_id` char(36) NOT NULL,
  `kind` varchar(32) NOT NULL,
  `credential_identifier` varchar(255) NOT NULL,
  `public_data` json NULL,
  `encrypted_secret_ref` varchar(512) NULL,
  `verified_at` datetime(3) NULL,
  `revoked_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_mfa_credential_0` (`credential_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Código de recuperación de un uso, hasheado.
CREATE TABLE `auth_recovery_code` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `account_id` char(36) NOT NULL,
  `code_hash` char(64) NOT NULL,
  `used_at` datetime(3) NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_recovery_code_0` (`code_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Metadata kid; clave privada en KMS o secret store.
CREATE TABLE `auth_signing_key` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `kid` varchar(64) NOT NULL,
  `algorithm` varchar(64) NOT NULL,
  `public_jwk` json NOT NULL,
  `private_key_ref` varchar(512) NOT NULL,
  `active_from` datetime(3) NOT NULL,
  `retire_after` datetime(3) NULL,
  `status` varchar(32) NOT NULL COMMENT 'Enum de dominio validado en servidor',
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_auth_signing_key_0` (`kid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Login, recuperación, reutilización, revocación y cambios MFA.
CREATE TABLE `auth_security_event` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `account_id` char(36) NULL,
  `session_id` char(36) NULL,
  `event_type` varchar(64) NOT NULL,
  `occurred_at` datetime(3) NOT NULL,
  `details_redacted` json NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- Servicio de autenticación opcional: Propaga revocaciones de forma idempotente; no sustituye validación online.
CREATE TABLE `auth_outbox_event` (
  `id` char(36) NOT NULL COMMENT 'Identificador UUID generado por aplicación',
  `event_type` varchar(64) NOT NULL,
  `aggregate_id` char(36) NOT NULL,
  `payload` json NOT NULL,
  `published_at` datetime(3) NULL,
  `attempts` int NOT NULL,
  `created_at` datetime(3) NOT NULL COMMENT 'Instante UTC',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;

-- FK después de crear tablas para permitir dependencias bidireccionales.
ALTER TABLE `auth_password` ADD CONSTRAINT `fk_auth_password_0` FOREIGN KEY (`account_id`) REFERENCES `auth_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_session` ADD CONSTRAINT `fk_auth_session_0` FOREIGN KEY (`account_id`) REFERENCES `auth_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_refresh_token` ADD CONSTRAINT `fk_auth_refresh_token_0` FOREIGN KEY (`session_id`) REFERENCES `auth_session` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_one_time_token` ADD CONSTRAINT `fk_auth_one_time_token_0` FOREIGN KEY (`account_id`) REFERENCES `auth_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_mfa_credential` ADD CONSTRAINT `fk_auth_mfa_credential_0` FOREIGN KEY (`account_id`) REFERENCES `auth_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_recovery_code` ADD CONSTRAINT `fk_auth_recovery_code_0` FOREIGN KEY (`account_id`) REFERENCES `auth_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_security_event` ADD CONSTRAINT `fk_auth_security_event_0` FOREIGN KEY (`account_id`) REFERENCES `auth_account` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `auth_security_event` ADD CONSTRAINT `fk_auth_security_event_1` FOREIGN KEY (`session_id`) REFERENCES `auth_session` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
