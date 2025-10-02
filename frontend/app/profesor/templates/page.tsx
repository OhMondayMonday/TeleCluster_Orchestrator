import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Copy, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

const mockTemplates = [
  {
    id: "template-001",
    name: "Servidor Web Básico",
    topology: "Lineal",
    vms: 3,
    description: "Configuración simple de servidor web con balanceador de carga y dos servidores backend",
    resources: { cpu: 6, memory: 12, storage: 60 },
  },
  {
    id: "template-002",
    name: "Cluster de Base de Datos",
    topology: "Anillo",
    vms: 4,
    description: "Base de datos distribuida con replicación para alta disponibilidad",
    resources: { cpu: 8, memory: 16, storage: 120 },
  },
  {
    id: "template-003",
    name: "Arquitectura de Microservicios",
    topology: "Malla",
    vms: 6,
    description: "Configuración completa de microservicios con service mesh y API gateway",
    resources: { cpu: 12, memory: 24, storage: 180 },
  },
]

export default function ProfesorTemplatesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance text-gray-800">Plantillas de Topología</h1>
            <p className="text-gray-600 mt-1">Crea y gestiona plantillas reutilizables para tus cursos</p>
          </div>
          <Button asChild className="bg-[#032058] text-white hover:bg-[#032058]/90">
            <Link href="/profesor/templates/create">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Link>
          </Button>
        </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-800">{template.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 text-gray-500">
                    {template.topology} • {template.vms} VMs
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Plantilla
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">CPU Total:</span>
                  <span className="font-mono text-gray-700">{template.resources.cpu} vCPUs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Memoria Total:</span>
                  <span className="font-mono text-gray-700">{template.resources.memory} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Almacenamiento Total:</span>
                  <span className="font-mono text-gray-700">{template.resources.storage} GB</span>
                </div>
              </div>
              <Button className="w-full bg-[#032058] text-white hover:bg-[#032058]/90" variant="secondary">
                <Copy className="w-4 h-4 mr-2" />
                Usar Plantilla
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  )
}
