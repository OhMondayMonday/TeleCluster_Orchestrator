import { ResourceClusters } from "@/components/resources/resource-clusters"
import { ResourceAllocation } from "@/components/resources/resource-allocation"

export default function SuperadminResourcesPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Resource Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage cluster resources across the platform</p>
        </div>
        <ResourceClusters />
        <ResourceAllocation />
      </div>
    </div>
  )
}
