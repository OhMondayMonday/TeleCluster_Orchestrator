"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have the required role, redirect to their dashboard
      switch (user.role) {
        case "superadmin":
          router.push("/superadmin/dashboard")
          break
        case "profesor":
          router.push("/profesor/slices")
          break
        case "alumno":
          router.push("/alumno/slices")
          break
        default:
          router.push("/login")
      }
    }
  }, [user, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
