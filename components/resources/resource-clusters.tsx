import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Cpu, HardDrive, MemoryStick } from "lucide-react"

const clusters = [
  {
    id: "linux-1",
    name: "Linux Cluster 1",
    type: "Linux",
    status: "online",
    nodes: 4,
    resources: {
      cpu: { used: 65, total: 100 },
      memory: { used: 72, total: 100 },
      storage: { used: 580, total: 1000 },
    },
  },
  {
    id: "linux-2",
    name: "Linux Cluster 2",
    type: "Linux",
    status: "online",
    nodes: 4,
    resources: {
      cpu: { used: 78, total: 100 },
      memory: { used: 68, total: 100 },
      storage: { used: 820, total: 1000 },
    },
  },
  {
    id: "openstack-1",
    name: "OpenStack Cluster 1",
    type: "OpenStack",
    status: "online",
    nodes: 8,
    resources: {
      cpu: { used: 45, total: 100 },
      memory: { used: 52, total: 100 },
      storage: { used: 480, total: 1000 },
    },
  },
  {
    id: "openstack-2",
    name: "OpenStack Cluster 2",
    type: "OpenStack",
    status: "online",
    nodes: 8,
    resources: {
      cpu: { used: 82, total: 100 },
      memory: { used: 88, total: 100 },
      storage: { used: 750, total: 1000 },
    },
  },
]

export function ResourceClusters() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {clusters.map((cluster) => (
        <Card key={cluster.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                  <Server className="w-5 h-5" />
                  {cluster.name}
                </CardTitle>
                <CardDescription className="text-xs text-gray-600">
                  {cluster.nodes} nodes • {cluster.type}
                </CardDescription>
              </div>
              <Badge
                variant={cluster.status === "online" ? "default" : "secondary"}
                className={cluster.status === "online" ? "bg-green-500 text-white" : ""}
              >
                {cluster.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Cpu className="w-4 h-4" />
                    <span>CPU</span>
                  </div>
                  <span className="font-mono text-xs text-gray-800">
                    {cluster.resources.cpu.used}% / {cluster.resources.cpu.total}%
                  </span>
                </div>
                <Progress value={cluster.resources.cpu.used} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MemoryStick className="w-4 h-4" />
                    <span>Memory</span>
                  </div>
                  <span className="font-mono text-xs text-gray-800">
                    {cluster.resources.memory.used}% / {cluster.resources.memory.total}%
                  </span>
                </div>
                <Progress value={cluster.resources.memory.used} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <HardDrive className="w-4 h-4" />
                    <span>Storage</span>
                  </div>
                  <span className="font-mono text-xs text-gray-800">
                    {cluster.resources.storage.used} GB / {cluster.resources.storage.total} GB
                  </span>
                </div>
                <Progress
                  value={(cluster.resources.storage.used / cluster.resources.storage.total) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
