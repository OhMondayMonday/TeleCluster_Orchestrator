import { MetricsCards } from "@/components/dashboard/metrics-cards"
import { ResourceUsageChart } from "@/components/dashboard/resource-usage-chart"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { SystemHealthChart } from "@/components/dashboard/system-health-chart"
import { CourseResourcesChart } from "@/components/dashboard/course-resources-chart"

export default function SuperadminDashboardPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance text-gray-800">Panel de Control del Sistema</h1>
          <p className="text-gray-600 mt-1">Resumen de métricas de la plataforma y uso de recursos</p>
        </div>
        <MetricsCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <ResourceUsageChart />
          <SystemHealthChart />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CourseResourcesChart />
          </div>
          <RecentActivityList />
        </div>
      </div>
    </div>
  )
}
