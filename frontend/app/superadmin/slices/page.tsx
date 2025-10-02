import { SlicesList } from "@/components/slices/slices-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Activity, HardDrive } from "lucide-react"

export default function SuperadminSlicesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-800">Todos los Slices</h1>
          <p className="text-gray-600 mt-1">Monitorea todos los slices en la infraestructura</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Slices</CardTitle>
              <Server className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">24</div>
              <p className="text-xs text-gray-500">En todos los cursos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">VMs Activas</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">87</div>
              <p className="text-xs text-gray-500">Ejecutándose actualmente</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Almacenamiento Usado</CardTitle>
              <HardDrive className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">2.4 TB</div>
              <p className="text-xs text-gray-500">De 5 TB total</p>
            </CardContent>
          </Card>
        </div>

        <SlicesList role="superadmin" />
      </div>
    </div>
  )
}
