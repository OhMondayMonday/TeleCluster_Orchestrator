import { SlicesList } from "@/components/slices/slices-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfesorSlicesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance text-gray-800">Slices de Estudiantes</h1>
            <p className="text-gray-600 mt-1">Visualiza y gestiona slices de tus cursos</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px] bg-white border-gray-300">
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Cursos</SelectItem>
                <SelectItem value="redes">Redes y Comunicaciones 2</SelectItem>
                <SelectItem value="cloud">Cloud Computing</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild className="bg-[#032058] text-white hover:bg-[#032058]/90">
              <Link href="/profesor/slices/create">
                <Plus className="w-4 h-4 mr-2" />
                Crear para Estudiante
              </Link>
            </Button>
          </div>
        </div>
        <SlicesList role="profesor" />
      </div>
    </div>
  )
}
