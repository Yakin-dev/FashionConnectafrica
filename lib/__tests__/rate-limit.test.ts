import { describe, it, expect } from "vitest"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    const result = checkRateLimit("127.0.0.1", "auth:login")
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBeGreaterThan(0)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it("allows requests within the limit", () => {
    const ip = "192.168.1.1"
    const route = "auth:login"

    // First 10 requests should be allowed (auth:login has maxRequests: 10)
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit(ip, route)
      expect(result.allowed).toBe(true)
    }
  })

  it("blocks requests exceeding the limit", () => {
    const ip = "10.0.0.1"
    const route = "auth:signup"

    // auth:signup has maxRequests: 5
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, route)
    }

    const result = checkRateLimit(ip, route)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("tracks different routes independently", () => {
    const ip = "172.16.0.1"

    // Exhaust login
    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip, "auth:login")
    }

    // But signup should still work (different route)
    const signupResult = checkRateLimit(ip, "auth:signup")
    expect(signupResult.allowed).toBe(true)
    expect(signupResult.remaining).toBe(4) // maxRequests: 5, one used
  })

  it("tracks different IPs independently", () => {
    const route = "contact:submit"

    // Exhaust IP1
    for (let i = 0; i < 5; i++) {
      checkRateLimit("ip-1", route)
    }
    expect(checkRateLimit("ip-1", route).allowed).toBe(false)

    // IP2 should still be allowed
    expect(checkRateLimit("ip-2", route).allowed).toBe(true)
  })

  it("uses the default config for unknown routes", () => {
    const ip = "192.168.1.100"
    const route = "unknown:route"

    // Default allows 60 requests per minute
    for (let i = 0; i < 60; i++) {
      const result = checkRateLimit(ip, route)
      expect(result.allowed).toBe(true)
    }

    const result = checkRateLimit(ip, route)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})

describe("getClientIp", () => {
  it("extracts IP from cf-connecting-ip header", () => {
    const request = {
      headers: {
        "cf-connecting-ip": "203.0.113.1",
      },
    }
    expect(getClientIp(request as any)).toBe("203.0.113.1")
  })

  it("extracts IP from x-forwarded-for header", () => {
    const request = {
      headers: {
        "x-forwarded-for": "198.51.100.1, 10.0.0.1, 172.16.0.1",
      },
    }
    expect(getClientIp(request as any)).toBe("198.51.100.1")
  })

  it("extracts IP from x-real-ip header", () => {
    const request = {
      headers: {
        "x-real-ip": "192.0.2.1",
      },
    }
    expect(getClientIp(request as any)).toBe("192.0.2.1")
  })

  it("prefers cf-connecting-ip over other headers", () => {
    const request = {
      headers: {
        "cf-connecting-ip": "203.0.113.1",
        "x-forwarded-for": "198.51.100.1",
        "x-real-ip": "192.0.2.1",
      },
    }
    expect(getClientIp(request as any)).toBe("203.0.113.1")
  })

  it("prefers x-forwarded-for over x-real-ip", () => {
    const request = {
      headers: {
        "x-forwarded-for": "198.51.100.1",
        "x-real-ip": "192.0.2.1",
      },
    }
    expect(getClientIp(request as any)).toBe("198.51.100.1")
  })

  it("falls back to 127.0.0.1 when no proxy headers are present", () => {
    const request = { headers: {} }
    expect(getClientIp(request as any)).toBe("127.0.0.1")
  })

  it("works with Headers class", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.1",
    })
    const request = { headers }
    expect(getClientIp(request as any)).toBe("203.0.113.1")
  })
})
