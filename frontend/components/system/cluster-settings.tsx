"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Server, Cpu, MemoryStick, HardDrive, Plus, Edit, Power } from "lucide-react"

const clusters = [
  {
    id: "cluster-001",
    name: "Linux Cluster 1",
    type: "Linux/KVM",
    nodes: 4,
    status: "online",
    autoScale: true,
    resources: {
      totalCPU: 128,
      totalMemory: 512,
      totalStorage: 4096,
      reservedCPU: 83,
      reservedMemory: 368,
      reservedStorage: 2380,
    },
    limits: {
      maxVMsPerUser: 10,
      maxCPUPerVM: 16,
      maxMemoryPerVM: 64,
      maxStoragePerVM: 500,
    },
  },
  {
    id: "cluster-002",
    name: "OpenStack Cluster 1",
    type: "OpenStack",
    nodes: 8,
    status: "online",
    autoScale: false,
    resources: {
      totalCPU: 256,
      totalMemory: 1024,
      totalStorage: 8192,
      reservedCPU: 115,
      reservedMemory: 537,
      reservedStorage: 3932,
    },
    limits: {
      maxVMsPerUser: 15,
      maxCPUPerVM: 32,
      maxMemoryPerVM: 128,
      maxStoragePerVM: 1000,
    },
  },
]

export function ClusterSettings() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clusters</CardTitle>
            <Server className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">4</div>
            <p className="text-xs text-gray-500 mt-1">2 online, 2 maintenance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Nodes</CardTitle>
            <Server className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">24</div>
            <p className="text-xs text-gray-500 mt-1">Physical compute nodes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total CPU</CardTitle>
            <Cpu className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">768</div>
            <p className="text-xs text-gray-500 mt-1">vCPU cores available</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Memory</CardTitle>
            <MemoryStick className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">3 TB</div>
            <p className="text-xs text-gray-500 mt-1">RAM available</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Cluster Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Cluster Configuration</h3>
          <p className="text-sm text-gray-600">Manage compute clusters and resource limits</p>
        </div>
        <Button className="bg-[#032058] text-white hover:bg-[#032058]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Cluster
        </Button>
      </div>

      {/* Clusters List */}
      <div className="space-y-6">
        {clusters.map((cluster) => (
          <Card key={cluster.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Server className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-gray-800">{cluster.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Power className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        {cluster.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">{cluster.nodes} compute nodes</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                  <Edit className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Resource Usage */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Resource Allocation</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Cpu className="w-4 h-4" />
                        <span>CPU</span>
                      </div>
                      <span className="font-mono text-xs text-gray-800">
                        {cluster.resources.reservedCPU} / {cluster.resources.totalCPU} vCPUs
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#032058] transition-all"
                        style={{ width: `${(cluster.resources.reservedCPU / cluster.resources.totalCPU) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MemoryStick className="w-4 h-4" />
                        <span>Memory</span>
                      </div>
                      <span className="font-mono text-xs text-gray-800">
                        {cluster.resources.reservedMemory} / {cluster.resources.totalMemory} GB
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10b981] transition-all"
                        style={{ width: `${(cluster.resources.reservedMemory / cluster.resources.totalMemory) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <HardDrive className="w-4 h-4" />
                        <span>Storage</span>
                      </div>
                      <span className="font-mono text-xs text-gray-800">
                        {cluster.resources.reservedStorage} / {cluster.resources.totalStorage} GB
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f59e0b] transition-all"
                        style={{ width: `${(cluster.resources.reservedStorage / cluster.resources.totalStorage) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Limits Configuration */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Resource Limits per VM</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-xs">Max VMs per User</Label>
                    <Input
                      value={cluster.limits.maxVMsPerUser}
                      type="number"
                      className="border-gray-300 bg-gray-50"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-xs">Max CPU (vCPUs)</Label>
                    <Input
                      value={cluster.limits.maxCPUPerVM}
                      type="number"
                      className="border-gray-300 bg-gray-50"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-xs">Max Memory (GB)</Label>
                    <Input
                      value={cluster.limits.maxMemoryPerVM}
                      type="number"
                      className="border-gray-300 bg-gray-50"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-xs">Max Storage (GB)</Label>
                    <Input
                      value={cluster.limits.maxStoragePerVM}
                      type="number"
                      className="border-gray-300 bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Auto-scaling */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Auto-scaling</p>
                  <p className="text-xs text-gray-600 mt-1">Automatically adjust resources based on demand</p>
                </div>
                <Switch checked={cluster.autoScale} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
