import { describe, it, expect } from "vitest"
import {
  AppError,
  NotFoundError,
  AuthError,
  ValidationError,
  ForbiddenError,
  type ApiErrorResponse,
  type ErrorCode,
} from "@/lib/errors"

describe("AppError", () => {
  it("creates an error with status and code", () => {
    const error = new AppError(404, "NOT_FOUND", "Model not found")
    expect(error.status).toBe(404)
    expect(error.code).toBe("NOT_FOUND")
    expect(error.message).toBe("Model not found")
    expect(error.name).toBe("AppError")
  })

  it("serializes to response format", () => {
    const error = new AppError(400, "VALIDATION_ERROR", "Invalid input", {
      fieldErrors: { email: ["Email is required"] },
    })
    const response: ApiErrorResponse = error.toResponse()
    expect(response.error).toBe("Invalid input")
    expect(response.code).toBe("VALIDATION_ERROR")
    expect(response.fieldErrors).toEqual({ email: ["Email is required"] })
  })

  it("includes upgradeUrl in response when provided", () => {
    const error = AppError.planLimit("Model limit reached", "/upgrade?reason=model_limit")
    const response = error.toResponse()
    expect(response.upgradeUrl).toBe("/upgrade?reason=model_limit")
    expect(response.code).toBe("PLAN_LIMIT_REACHED")
  })

  it("includes details in response when provided", () => {
    const error = new AppError(400, "VALIDATION_ERROR", "Validation failed", {
      details: { name: ["Must be at least 2 characters"] },
    })
    const response = error.toResponse()
    expect(response.details).toEqual({ name: ["Must be at least 2 characters"] })
  })

  it("omits optional fields when not provided", () => {
    const error = new AppError(500, "INTERNAL_ERROR", "Server error")
    const response = error.toResponse()
    expect(response.error).toBe("Server error")
    expect(response.code).toBe("INTERNAL_ERROR")
    expect(response.fieldErrors).toBeUndefined()
    expect(response.details).toBeUndefined()
    expect(response.upgradeUrl).toBeUndefined()
  })
})

describe("AppError static factory methods", () => {
  it("badRequest creates 400 error", () => {
    const error = AppError.badRequest("Invalid input")
    expect(error.status).toBe(400)
    expect(error.code).toBe("VALIDATION_ERROR")
  })

  it("unauthorized creates 401 error", () => {
    const error = AppError.unauthorized()
    expect(error.status).toBe(401)
    expect(error.code).toBe("UNAUTHORIZED")
    expect(error.message).toBe("Authentication required.")
  })

  it("forbidden creates 403 error", () => {
    const error = AppError.forbidden()
    expect(error.status).toBe(403)
    expect(error.code).toBe("FORBIDDEN")
  })

  it("notFound creates 404 error", () => {
    const error = AppError.notFound()
    expect(error.status).toBe(404)
    expect(error.code).toBe("NOT_FOUND")
  })

  it("conflict creates 409 error", () => {
    const error = AppError.conflict()
    expect(error.status).toBe(409)
    expect(error.code).toBe("CONFLICT")
  })

  it("rateLimited creates 429 error", () => {
    const error = AppError.rateLimited()
    expect(error.status).toBe(429)
    expect(error.code).toBe("RATE_LIMITED")
  })

  it("planLimit creates 403 error with plan limit code", () => {
    const error = AppError.planLimit("Upgrade required", "/upgrade")
    expect(error.status).toBe(403)
    expect(error.code).toBe("PLAN_LIMIT_REACHED")
    expect(error.upgradeUrl).toBe("/upgrade")
  })

  it("internal creates 500 error", () => {
    const error = AppError.internal()
    expect(error.status).toBe(500)
    expect(error.code).toBe("INTERNAL_ERROR")
  })
})

describe("NotFoundError", () => {
  it("creates 404 error with resource name", () => {
    const error = new NotFoundError("Model")
    expect(error.status).toBe(404)
    expect(error.code).toBe("NOT_FOUND")
    expect(error.message).toBe("Model not found.")
    expect(error.name).toBe("NotFoundError")
  })

  it("uses default resource name", () => {
    const error = new NotFoundError()
    expect(error.message).toBe("Resource not found.")
  })
})

describe("AuthError", () => {
  it("creates 401 error", () => {
    const error = new AuthError()
    expect(error.status).toBe(401)
    expect(error.code).toBe("UNAUTHORIZED")
    expect(error.name).toBe("AuthError")
  })

  it("accepts custom message", () => {
    const error = new AuthError("Session expired")
    expect(error.message).toBe("Session expired")
  })
})

describe("ValidationError", () => {
  it("creates 400 error with field errors", () => {
    const fieldErrors = {
      email: ["Email is required"],
      password: ["Must be at least 8 characters"],
    }
    const error = new ValidationError("Please fix the errors below", fieldErrors)
    expect(error.status).toBe(400)
    expect(error.code).toBe("VALIDATION_ERROR")
    expect(error.fieldErrors).toEqual(fieldErrors)
    expect(error.name).toBe("ValidationError")
  })

  it("works without field errors", () => {
    const error = new ValidationError()
    expect(error.status).toBe(400)
    expect(error.code).toBe("VALIDATION_ERROR")
    expect(error.fieldErrors).toBeUndefined()
  })
})

describe("ForbiddenError", () => {
  it("creates 403 error", () => {
    const error = new ForbiddenError()
    expect(error.status).toBe(403)
    expect(error.code).toBe("FORBIDDEN")
    expect(error.name).toBe("ForbiddenError")
  })
})

describe("ErrorCode type coverage", () => {
  it("all error codes are valid", () => {
    const codes: ErrorCode[] = [
      "UNAUTHORIZED",
      "FORBIDDEN",
      "NOT_FOUND",
      "VALIDATION_ERROR",
      "CONFLICT",
      "RATE_LIMITED",
      "INTERNAL_ERROR",
      "PAYMENT_REQUIRED",
      "PLAN_LIMIT_REACHED",
      "METHOD_NOT_ALLOWED",
    ]
    expect(codes).toHaveLength(10)
  })

  it("each static factory produces the expected code", () => {
    expect(AppError.unauthorized().code).toBe("UNAUTHORIZED")
    expect(AppError.forbidden().code).toBe("FORBIDDEN")
    expect(AppError.notFound().code).toBe("NOT_FOUND")
    expect(AppError.badRequest().code).toBe("VALIDATION_ERROR")
    expect(AppError.conflict().code).toBe("CONFLICT")
    expect(AppError.rateLimited().code).toBe("RATE_LIMITED")
    expect(AppError.internal().code).toBe("INTERNAL_ERROR")
    expect(AppError.planLimit("test").code).toBe("PLAN_LIMIT_REACHED")
  })
})
