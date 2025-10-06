import { InteractiveTopologyViewer } from "@/components/topology/interactive-topology-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfesorSliceTopologyPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="text-gray-600 hover:bg-gray-100">
            <Link href="/profesor/slices">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance text-gray-800">Student Slice Topology</h1>
            <p className="text-gray-600 mt-1">Monitor and manage student virtual machine network</p>
          </div>
        </div>
        <InteractiveTopologyViewer sliceId={params.id} />
      </div>
    </div>
  )
}
