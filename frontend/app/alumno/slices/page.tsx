import { SlicesList } from "@/components/slices/slices-list"

export default function AlumnoSlicesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-800">Mis Slices</h1>
          <p className="text-gray-600 mt-1">Visualiza y gestiona tus topologías de máquinas virtuales asignadas</p>
        </div>
        <SlicesList role="alumno" />
      </div>
    </div>
  )
}
