"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Curso {
  curso_id: number
  codigo_curso: string
  nombre_curso: string
  ciclo: string
  horario?: string
  rol_en_curso: 'alumno' | 'jefe_practica'
}

interface User {
  id: number
  nombres: string
  apellidos: string
  codigo: string
  email: string
  role: 'superadmin' | 'jefe_practica' | 'alumno'
  cursos: Curso[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    if (savedToken) {
      setToken(savedToken)
      // TODO: Aquí podrías verificar el token con el servidor usando /api/auth/me
      // Por ahora, aceptamos el token guardado
      verifyToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          // Token inválido, limpiar
          localStorage.removeItem('authToken')
          setToken(null)
        }
      } else {
        // Token inválido, limpiar
        localStorage.removeItem('authToken')
        setToken(null)
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      // En caso de error, mantener el token pero no establecer usuario
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.user && data.token) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('authToken', data.token)
        
        return {
          success: true,
          message: data.message || '¡Bienvenido!'
        }
      } else {
        return {
          success: false,
          message: data.message || 'Credenciales inválidas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? `Error de conexión: ${error.message}` : 'Error de conexión'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}