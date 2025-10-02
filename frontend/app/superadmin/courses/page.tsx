import { CoursesTable } from "@/components/courses/courses-table"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"

export default function SuperadminCoursesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
            <p className="text-gray-600 mt-1">Create and manage courses, assign professors and students</p>
          </div>
          <CreateCourseDialog />
        </div>
        <CoursesTable />
      </div>
    </div>
  )
}
