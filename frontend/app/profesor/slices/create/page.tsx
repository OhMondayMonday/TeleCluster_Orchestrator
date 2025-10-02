import { CreateSliceForStudentForm } from "@/components/slices/create-slice-for-student-form"

export default function ProfesorCreateSlicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Create Slice for Student</h1>
        <p className="text-muted-foreground mt-1">Deploy a new VM topology for a student in your course</p>
      </div>
      <CreateSliceForStudentForm />
    </div>
  )
}
