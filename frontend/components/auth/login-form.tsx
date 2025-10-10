"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { login } from "@/lib/api"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Call real API
      const response = await login({ email, password })

      if (response.ok && response.data) {
        // Refresh user state in context
        await refreshUser()
        
        // Get user profile to determine role
        const { checkAuth } = await import("@/lib/api")
        const authResult = await checkAuth()

        if (authResult.authenticated && authResult.role) {
          // Route based on actual role from backend
          switch (authResult.role) {
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
              router.push("/alumno/slices")
          }
        }
      } else {
        setError(response.error || "Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error de conexión con el servidor")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@pucp.edu.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/recover-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="bg-secondary/50"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <div className="text-xs text-muted-foreground text-center pt-2">
            <p>Demo accounts:</p>
            <p>admin@pucp.edu.pe • profesor@pucp.edu.pe • alumno@pucp.edu.pe</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
