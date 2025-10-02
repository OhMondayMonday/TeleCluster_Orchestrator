import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Layers } from "lucide-react"

const mockCourses = [
  {
    id: "course-001",
    code: "TEL-245",
    name: "Redes y Comunicaciones 2",
    schedule: "Lunes y Miércoles 10:00-12:00",
    students: 28,
    slices: 42,
    semester: "2025-1",
  },
  {
    id: "course-002",
    code: "INF-289",
    name: "Cloud Computing",
    schedule: "Martes y Jueves 14:00-16:00",
    students: 24,
    slices: 35,
    semester: "2025-1",
  },
]

export default function ProfesorCoursesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-800">Mis Cursos</h1>
          <p className="text-gray-600 mt-1">Cursos que estás enseñando este semestre</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {mockCourses.map((course) => (
            <Card key={course.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs border-gray-300 text-gray-600">
                      {course.code}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
                      {course.semester}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-800">{course.name}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">{course.schedule}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Estudiantes</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{course.students}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs">Slices Activos</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{course.slices}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </div>
  )
}
