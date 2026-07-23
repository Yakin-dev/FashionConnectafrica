import { describe, it, expect } from "vitest"
import { toSlug, makeUniqueSlug, modelSlug, agencySlug } from "@/lib/slug"

describe("toSlug", () => {
  it("converts a simple string to a slug", () => {
    expect(toSlug("Hello World")).toBe("hello-world")
  })

  it("lowercases the input", () => {
    expect(toSlug("FASHION CONNECT")).toBe("fashion-connect")
  })

  it("removes special characters", () => {
    expect(toSlug("John's Portfolio!")).toBe("johns-portfolio")
  })

  it("replaces underscores with hyphens", () => {
    expect(toSlug("hello_world_test")).toBe("hello-world-test")
  })

  it("collapses multiple spaces", () => {
    expect(toSlug("hello   world")).toBe("hello-world")
  })

  it("removes leading and trailing whitespace", () => {
    expect(toSlug("  hello world  ")).toBe("hello-world")
  })

  it("removes leading and trailing hyphens", () => {
    expect(toSlug("-hello-world-")).toBe("hello-world")
  })

  it("handles empty string", () => {
    expect(toSlug("")).toBe("")
  })

  it("handles strings with only special characters", () => {
    expect(toSlug("!!!@@@###")).toBe("")
  })

  it("truncates to maxLength", () => {
    const long = "a".repeat(100)
    const result = toSlug(long, 50)
    expect(result.length).toBeLessThanOrEqual(50)
    expect(result).toBe("a".repeat(50))
  })

  it("removes trailing hyphens after truncation", () => {
    // If truncation cuts at a word that was a hyphen, ensure it's trimmed
    const input = "hello-world-testing-" + "a".repeat(60)
    const result = toSlug(input, 20)
    expect(result).not.toMatch(/-$/)
  })

  it("handles numbers and mixed characters", () => {
    expect(toSlug("Model 2024 Portfolio")).toBe("model-2024-portfolio")
  })

  it("handles unicode characters by stripping them", () => {
    expect(toSlug("Café Résumé")).toBe("caf-rsum")
  })
})

describe("makeUniqueSlug", () => {
  it("appends a suffix to the base slug", () => {
    const slug = makeUniqueSlug("john-doe", "abc1")
    expect(slug).toBe("john-doe-abc1")
  })

  it("generates a random suffix when none is provided", () => {
    const slug = makeUniqueSlug("john-doe")
    // Random suffix is 4 alphanumeric chars from Math.random().toString(36)
    expect(slug).toMatch(/^john-doe-[a-z0-9]{4}$/)
  })

  it("generates different suffixes on subsequent calls", () => {
    const slug1 = makeUniqueSlug("test")
    const slug2 = makeUniqueSlug("test")
    expect(slug1).not.toBe(slug2)
  })
})

describe("modelSlug", () => {
  it("generates a slug from professional name", () => {
    expect(modelSlug("Jean-Paul Mugisha")).toBe("jean-paul-mugisha")
  })

  it("uses userId slice as fallback when name produces empty slug", () => {
    // userId.slice(0, 8) gives first 8 chars
    const slug = modelSlug("!!!@@@###", "user12345678")
    expect(slug).toBe("model-user1234")
  })

  it("uses 'unknown' fallback when both name and userId are missing", () => {
    const slug = modelSlug("!!!@@@###")
    expect(slug).toBe("model-unknown")
  })
})

describe("agencySlug", () => {
  it("generates a slug from agency name", () => {
    expect(agencySlug("Kigali Elite Models")).toBe("kigali-elite-models")
  })

  it("falls back to 'agency' for invalid input", () => {
    expect(agencySlug("!!!@@@###")).toBe("agency")
  })
})
