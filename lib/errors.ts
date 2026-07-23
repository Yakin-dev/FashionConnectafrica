/**
 * Typed error classes for standardized API error responses.
 * Every API route should throw or return these for consistent error handling.
 */

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
  fieldErrors?: Record<string, string[]>;
  upgradeUrl?: string;
}

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "PAYMENT_REQUIRED"
  | "PLAN_LIMIT_REACHED"
  | "METHOD_NOT_ALLOWED";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, string[]>;
  public readonly fieldErrors?: Record<string, string[]>;
  public readonly upgradeUrl?: string;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    options?: {
      details?: Record<string, string[]>;
      fieldErrors?: Record<string, string[]>;
      upgradeUrl?: string;
    }
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = options?.details;
    this.fieldErrors = options?.fieldErrors;
    this.upgradeUrl = options?.upgradeUrl;
  }

  toResponse(): ApiErrorResponse {
    return {
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
      ...(this.fieldErrors && { fieldErrors: this.fieldErrors }),
      ...(this.upgradeUrl && { upgradeUrl: this.upgradeUrl }),
    };
  }

  static badRequest(
    message = "Bad request",
    options?: { details?: Record<string, string[]>; fieldErrors?: Record<string, string[]> }
  ) {
    return new AppError(400, "VALIDATION_ERROR", message, options);
  }

  static unauthorized(message = "Authentication required.") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to perform this action.") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found.") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message = "Resource already exists.") {
    return new AppError(409, "CONFLICT", message);
  }

  static rateLimited(message = "Too many requests. Please try again later.") {
    return new AppError(429, "RATE_LIMITED", message);
  }

  static planLimit(reason: string, upgradeUrl?: string) {
    return new AppError(403, "PLAN_LIMIT_REACHED", reason, { upgradeUrl });
  }

  static internal(message = "An unexpected error occurred.") {
    return new AppError(500, "INTERNAL_ERROR", message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(404, "NOT_FOUND", `${resource} not found.`);
    this.name = "NotFoundError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required.") {
    super(401, "UNAUTHORIZED", message);
    this.name = "AuthError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed.",
    fieldErrors?: Record<string, string[]>
  ) {
    super(400, "VALIDATION_ERROR", message, { fieldErrors });
    this.name = "ValidationError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission.") {
    super(403, "FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}
