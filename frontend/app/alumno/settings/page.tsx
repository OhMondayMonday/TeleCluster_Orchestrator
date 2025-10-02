import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AlumnoSettingsPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-800">Configuración</h1>
          <p className="text-gray-600 mt-1">Gestiona las preferencias de tu cuenta</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Información del Perfil</CardTitle>
              <CardDescription className="text-gray-500">Actualiza tus datos personales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-600">
                  Nombre Completo
                </Label>
                <Input id="name" defaultValue="Carlos Gómez" className="bg-white border-gray-300 text-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-600">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="carlos.gomez@pucp.edu.pe"
                  className="bg-white border-gray-300 text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-id" className="text-gray-600">
                  Código de Estudiante
                </Label>
                <Input
                  id="student-id"
                  defaultValue="20070429"
                  disabled
                  className="bg-gray-100 border-gray-300 text-gray-500"
                />
              </div>
              <Button className="w-full bg-[#032058] text-white hover:bg-[#032058]/90">Guardar Cambios</Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-gray-800">Cambiar Contraseña</CardTitle>
              <CardDescription className="text-gray-500">Actualiza tu contraseña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-600">
                  Contraseña Actual
                </Label>
                <Input id="current-password" type="password" className="bg-white border-gray-300 text-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-600">
                  Nueva Contraseña
                </Label>
                <Input id="new-password" type="password" className="bg-white border-gray-300 text-gray-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-600">
                  Confirmar Nueva Contraseña
                </Label>
                <Input id="confirm-password" type="password" className="bg-white border-gray-300 text-gray-800" />
              </div>
              <Button className="w-full bg-[#032058] text-white hover:bg-[#032058]/90">Actualizar Contraseña</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Preferencias de Notificación</CardTitle>
            <CardDescription className="text-gray-500">Gestiona cómo recibes las notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-800">Notificaciones por Email</Label>
                <p className="text-sm text-gray-500">Recibe actualizaciones sobre tus slices por correo</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-100 bg-white">
                Activar
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-800">Actualizaciones de Estado</Label>
                <p className="text-sm text-gray-500">Recibe notificaciones cuando cambie el estado de los slices</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-100 bg-white">
                Activar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
