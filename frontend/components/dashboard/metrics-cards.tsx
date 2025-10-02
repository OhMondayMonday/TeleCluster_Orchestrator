import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Users, Layers, Activity } from "lucide-react"

const metrics = [
  {
    title: "Total Slices",
    value: "127",
    change: "+12%",
    icon: Layers,
    trend: "up",
    color: "cyan",
  },
  {
    title: "Active Users",
    value: "89",
    change: "+5%",
    icon: Users,
    trend: "up",
    color: "green",
  },
  {
    title: "Cluster Nodes",
    value: "24",
    change: "0%",
    icon: Server,
    trend: "neutral",
    color: "purple",
  },
  {
    title: "CPU Usage",
    value: "67%",
    change: "+8%",
    icon: Activity,
    trend: "up",
    color: "orange",
  },
]

const colorClasses = {
  cyan: "border-[#00b4d8]/50 bg-[#00b4d8]/5",
  green: "border-[#10b981]/50 bg-[#10b981]/5",
  purple: "border-[#7209b7]/50 bg-[#7209b7]/5",
  orange: "border-[#f59e0b]/50 bg-[#f59e0b]/5",
}

const iconColorClasses = {
  cyan: "text-[#00b4d8]",
  green: "text-[#10b981]",
  purple: "text-[#7209b7]",
  orange: "text-[#f59e0b]",
}

const valueColorClasses = {
  cyan: "text-[#00b4d8]",
  green: "text-[#10b981]",
  purple: "text-[#7209b7]",
  orange: "text-[#f59e0b]",
}

export function MetricsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{metric.title}</CardTitle>
              <Icon className={`h-5 w-5 ${iconColorClasses[metric.color as keyof typeof iconColorClasses]}`} />
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${valueColorClasses[metric.color as keyof typeof valueColorClasses]}`}
              >
                {metric.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className={metric.trend === "up" ? "text-[#10b981]" : ""}>{metric.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
