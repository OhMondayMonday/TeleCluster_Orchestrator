"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Square, Trash2, Edit, Terminal, Activity } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

const mockSlice = {
  id: "slice-001",
  name: "Network Topology Lab 3",
  topology: "mesh",
  status: "running",
  cluster: "Linux Cluster",
  createdAt: "2025-01-15 14:30",
  vms: [
    { id: "vm-001", name: "router-1", ip: "10.60.1.10", status: "running", cpu: 2, memory: 4, storage: 20 },
    { id: "vm-002", name: "router-2", ip: "10.60.1.11", status: "running", cpu: 2, memory: 4, storage: 20 },
    { id: "vm-003", name: "switch-1", ip: "10.60.1.12", status: "running", cpu: 1, memory: 2, storage: 10 },
    { id: "vm-004", name: "host-1", ip: "10.60.1.13", status: "running", cpu: 1, memory: 2, storage: 10 },
  ],
  resources: {
    cpu: { used: 6, total: 8 },
    memory: { used: 12, total: 16 },
    storage: { used: 60, total: 100 },
  },
}

export function SliceDetailsView({ sliceId, role }: { sliceId: string; role: string }) {
  const backUrl = role === "alumno" ? "/alumno/slices" : role === "profesor" ? "/profesor/slices" : "/superadmin/slices"
  
  // Estilos específicos para cada rol
  const containerClass = role === "alumno" 
    ? "min-h-screen bg-slate-500 p-6" 
    : "space-y-6"
  
  const titleClass = role === "alumno"
    ? "text-3xl font-bold text-balance text-white"
    : "text-3xl font-bold text-balance"
    
  const subtitleClass = role === "alumno"
    ? "text-white/90 mt-1"
    : "text-muted-foreground mt-1"
    
  const buttonClass = role === "alumno"
    ? "text-white hover:bg-white/10"
    : ""

  const content = (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className={buttonClass}>
          <Link href={backUrl}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className={titleClass}>{mockSlice.name}</h1>
            <Badge variant={mockSlice.status === "running" ? "default" : "secondary"}>{mockSlice.status}</Badge>
          </div>
          <p className={subtitleClass}>
            {mockSlice.topology} topology • {mockSlice.cluster} • Created {mockSlice.createdAt}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Square className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSlice.resources.cpu.used}/{mockSlice.resources.cpu.total} vCPUs
            </div>
            <Progress
              value={(mockSlice.resources.cpu.used / mockSlice.resources.cpu.total) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSlice.resources.memory.used}/{mockSlice.resources.memory.total} GB
            </div>
            <Progress
              value={(mockSlice.resources.memory.used / mockSlice.resources.memory.total) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSlice.resources.storage.used}/{mockSlice.resources.storage.total} GB
            </div>
            <Progress
              value={(mockSlice.resources.storage.used / mockSlice.resources.storage.total) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Virtual Machines ({mockSlice.vms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSlice.vms.map((vm) => (
              <div key={vm.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{vm.name}</h3>
                    <Badge variant={vm.status === "running" ? "default" : "secondary"} className="text-xs">
                      {vm.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{vm.ip}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm space-y-1">
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">{vm.cpu}</span> vCPUs
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">{vm.memory}</span> GB RAM
                    </div>
                    <div className="text-muted-foreground">
                      <span className="font-medium text-foreground">{vm.storage}</span> GB Storage
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Terminal className="w-4 h-4 mr-2" />
                    Console
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Return con wrapper condicional según el rol
  if (role === "alumno") {
    return (
      <div className={containerClass}>
        <div className="container mx-auto max-w-7xl">
          {content}
        </div>
      </div>
    )
  }

  return content
}
