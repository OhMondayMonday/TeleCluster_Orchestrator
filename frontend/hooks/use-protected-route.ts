"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

type UserRole = 'superadmin' | 'jefe_practica' | 'alumno'

interface UseProtectedRouteOptions {
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { allowedRoles, redirectTo = '/login' } = options

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      // Si se especificaron roles permitidos, verificar que el usuario tenga uno de esos roles
      if (allowedRoles && allowedRoles.length > 0) {
        if (!user?.role || !allowedRoles.includes(user.role)) {
          // Redirigir al dashboard para que se maneje el routing apropiado
          router.push('/dashboard')
          return
        }
      }
    }
  }, [user, isLoading, isAuthenticated, router, allowedRoles, redirectTo])

  return {
    user,
    isLoading,
    isAuthenticated,
    isAuthorized: isAuthenticated && (!allowedRoles || (user?.role && allowedRoles.includes(user.role)))
  }
}