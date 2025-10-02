import { CourseDetailsView } from "@/components/courses/course-details-view"

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  return <CourseDetailsView courseId={params.id} />
}
