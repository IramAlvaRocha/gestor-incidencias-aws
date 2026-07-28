import type { Response } from "express";
import { DomainError } from "../../../domain/errors/DomainError.js";
import { TicketNotFoundError } from "../../../domain/errors/TicketError.js";
import {
  AssigneeNotInProjectError,
  DuplicateKeyError,
  MemberAlreadyExistsError,
  MemberNotInProject,
  NotAuthorizedError,
  ProjectNotFoundError,
  UserNotFoundError,
} from "../../../domain/errors/ProjectError.js";
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from "../../../domain/errors/UserError.js";

/**
 * Maps domain/application errors to HTTP responses.
 *
 * 401 Unauthorized  — missing/invalid auth or bad credentials
 * 403 Forbidden     — authenticated, but not allowed
 * 404 Not Found     — resource does not exist
 * 409 Conflict      — state conflict (duplicates)
 * 400 Bad Request   — invalid input / business rule on payload
 * 500 Internal      — unexpected failures
 */
export const handleControllerError = (
  res: Response,
  error: unknown,
  internalMessage: string,
) => {
  if (error instanceof InvalidCredentialsError) {
    return res.status(401).json({ error: error.message });
  }

  if (error instanceof NotAuthorizedError || error instanceof MemberNotInProject) {
    return res.status(403).json({ error: error.message });
  }

  if (
    error instanceof TicketNotFoundError ||
    error instanceof ProjectNotFoundError ||
    error instanceof UserNotFoundError
  ) {
    return res.status(404).json({ error: error.message });
  }

  if (
    error instanceof DuplicateKeyError ||
    error instanceof EmailAlreadyRegisteredError ||
    error instanceof MemberAlreadyExistsError
  ) {
    return res.status(409).json({ error: error.message });
  }

  if (error instanceof AssigneeNotInProjectError || error instanceof DomainError) {
    return res.status(400).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: internalMessage });
};
