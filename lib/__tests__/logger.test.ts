import { describe, it, expect, beforeEach, vi } from "vitest"
import { logger, generateRequestId } from "@/lib/logger"

describe("generateRequestId", () => {
  it("generates a string starting with req-", () => {
    const id = generateRequestId()
    expect(id).toMatch(/^req-/)
  })

  it("generates unique IDs on consecutive calls", () => {
    const id1 = generateRequestId()
    const id2 = generateRequestId()
    expect(id1).not.toBe(id2)
  })
})

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("logger.info logs to console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    logger.info("test message")
    expect(spy).toHaveBeenCalledOnce()
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("INFO")
    expect(callArg).toContain("test message")
  })

  it("logger.error logs to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    logger.error("error message")
    expect(spy).toHaveBeenCalledOnce()
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("ERROR")
    expect(callArg).toContain("error message")
  })

  it("logger.warn logs to console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {})
    logger.warn("warn message")
    expect(spy).toHaveBeenCalledOnce()
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("WARN")
    expect(callArg).toContain("warn message")
  })

  it("logger.debug logs to console.debug", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {})
    logger.debug("debug message")
    expect(spy).toHaveBeenCalledOnce()
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("DEBUG")
    expect(callArg).toContain("debug message")
  })

  it("includes requestId when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    logger.info("test", { requestId: "req-abc-123" })
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("[req-abc-123]")
  })

  it("includes error details when provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const testError = new Error("Something failed")
    logger.error("operation failed", { error: testError })
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("Something failed")
  })

  it("includes duration when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    logger.info("slow operation", { duration: 1500 })
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("(1500ms)")
  })

  it("includes data when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    logger.info("with data", { data: { userId: "123", action: "login" } })
    const callArg = spy.mock.calls[0][0] as string
    expect(callArg).toContain("INFO")
    expect(callArg).toContain("with data")
  })
})
