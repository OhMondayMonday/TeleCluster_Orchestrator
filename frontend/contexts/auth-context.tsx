"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { checkAuth, logout as apiLogout, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/recover-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = async () => {
    try {
      const authResult = await checkAuth()
      if (authResult.authenticated && authResult.user) {
        setUser(authResult.user)
      } else {
        setUser(null)
        // Only redirect if on protected route
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    router.push("/login")
  }

  useEffect(() => {
    refreshUser()
  }, [pathname])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
