import { SliceDetailsView } from "@/components/slices/slice-details-view"

export default function SliceDetailsPage({ params }: { params: { id: string } }) {
  return <SliceDetailsView sliceId={params.id} role="alumno" />
}
