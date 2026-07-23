"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
  status: string
  onboardingCompleted: boolean
  onboardingStep: number
  avatarUrl: string | null
  firstName: string | null
  lastName: string | null
} | null

type AuthContextValue = {
  user: AuthUser
  isLoading: boolean
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  signOut: async () => {},
})

/**
 * Ensure the CSRF token cookie exists by calling the CSRF endpoint.
 * This is a fire-and-forget call — the cookie is set server-side.
 */
async function ensureCsrfToken() {
  try {
    await fetch("/api/auth/csrf")
  } catch {
    // CSRF token is non-critical for page rendering
  }
}

/**
 * Intercept global fetch to automatically include CSRF token
 * on mutation requests (POST, PATCH, DELETE, PUT).
 */
function setupCsrfInterceptor() {
  if (typeof window === "undefined") return

  const originalFetch = window.fetch

  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const method = (init?.method || "GET").toUpperCase()

    // Only add CSRF header for state-changing methods to API routes
    if (["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
      if (url.includes("/api/") && !url.includes("/api/auth/")) {
        const csrfCookie = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)
        const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie[1]) : null
        if (csrfToken) {
          init = {
            ...init,
            headers: {
              ...init?.headers,
              "x-csrf-token": csrfToken,
            },
          }
        }
      }
    }

    return originalFetch.call(window, input, init)
  } as typeof fetch
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      const currentUser = data.user ?? null
      setUser(currentUser)

      // Ensure CSRF token exists for authenticated users
      if (currentUser) {
        ensureCsrfToken()
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Proceed even if the request fails
    }
    setUser(null)
    window.location.href = "/"
  }, [])

  useEffect(() => {
    // Set up CSRF interceptor once on mount
    setupCsrfInterceptor()
    refreshUser()
  }, [refreshUser])

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
