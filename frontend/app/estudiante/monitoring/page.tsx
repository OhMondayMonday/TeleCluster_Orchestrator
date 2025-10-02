import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Cpu, HardDrive, MemoryStick, Network, TrendingUp, Clock } from "lucide-react"

export default function EstudianteMonitoringPage() {
  const slices = [
    {
      id: "slice-001",
      name: "Web Application Lab",
      status: "active",
      vms: [
        { name: "Web Server", cpu: 45, memory: 62, disk: 38, network: 125 },
        { name: "Database", cpu: 78, memory: 85, disk: 72, network: 89 },
      ],
    },
    {
      id: "slice-002",
      name: "Network Security Project",
      status: "active",
      vms: [{ name: "Firewall", cpu: 23, memory: 34, disk: 15, network: 234 }],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Resource Monitoring</h1>
        <p className="text-muted-foreground mt-1">Real-time performance metrics for your virtual machines</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#00b4d8]/50 bg-[#00b4d8]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-[#00b4d8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00b4d8]">48.7%</div>
            <Progress value={48.7} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Across all VMs</p>
          </CardContent>
        </Card>

        <Card className="border-[#06a77d]/50 bg-[#06a77d]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-[#06a77d]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#06a77d]">60.3%</div>
            <Progress value={60.3} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">12.1 GB / 20 GB</p>
          </CardContent>
        </Card>

        <Card className="border-[#7209b7]/50 bg-[#7209b7]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-[#7209b7]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#7209b7]">41.7%</div>
            <Progress value={41.7} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">41.7 GB / 100 GB</p>
          </CardContent>
        </Card>

        <Card className="border-[#90e0ef]/50 bg-[#90e0ef]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Traffic</CardTitle>
            <Network className="h-4 w-4 text-[#90e0ef]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#90e0ef]">148 MB/s</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <TrendingUp className="w-3 h-3 mr-1 text-[#10b981]" />
              <span>+12% from last hour</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {slices.map((slice) => (
        <Card key={slice.id} className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{slice.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3" />
                  Last updated: 2 minutes ago
                </CardDescription>
              </div>
              <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50">
                <Activity className="w-3 h-3 mr-1" />
                {slice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={slice.vms[0].name} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${slice.vms.length}, 1fr)` }}>
                {slice.vms.map((vm) => (
                  <TabsTrigger key={vm.name} value={vm.name}>
                    {vm.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {slice.vms.map((vm) => (
                <TabsContent key={vm.name} value={vm.name} className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[#00b4d8]" />
                          CPU Usage
                        </span>
                        <span className="font-mono font-semibold text-[#00b4d8]">{vm.cpu}%</span>
                      </div>
                      <Progress value={vm.cpu} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-[#06a77d]" />
                          Memory Usage
                        </span>
                        <span className="font-mono font-semibold text-[#06a77d]">{vm.memory}%</span>
                      </div>
                      <Progress value={vm.memory} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-[#7209b7]" />
                          Disk Usage
                        </span>
                        <span className="font-mono font-semibold text-[#7209b7]">{vm.disk}%</span>
                      </div>
                      <Progress value={vm.disk} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-[#90e0ef]" />
                          Network I/O
                        </span>
                        <span className="font-mono font-semibold text-[#90e0ef]">{vm.network} MB/s</span>
                      </div>
                      <Progress value={Math.min(vm.network / 3, 100)} className="h-2" />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
