"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Server, Play, Square, RotateCw, Terminal, Settings } from "lucide-react"
import { useState } from "react"

interface Node {
  id: string
  name: string
  type: "vm" | "switch" | "server"
  status: "on" | "off" | "waiting"
  ip?: string
  cpu: number
  memory: number
  disk: number
}

interface Link {
  id: string
  source: string
  target: string
  name: string
}

interface TopologyViewerProps {
  sliceId: string
}

export function TopologyViewer({ sliceId }: TopologyViewerProps) {
  // Mock data - in real app, fetch from API
  const [nodes] = useState<Node[]>([
    { id: "vm1", name: "Web Server", type: "vm", status: "on", ip: "10.60.1.10", cpu: 2, memory: 4, disk: 20 },
    { id: "vm2", name: "Database", type: "server", status: "on", ip: "10.60.1.11", cpu: 4, memory: 8, disk: 50 },
    { id: "vm3", name: "Load Balancer", type: "vm", status: "waiting", ip: "10.60.1.12", cpu: 2, memory: 2, disk: 10 },
    { id: "vm4", name: "Cache Server", type: "vm", status: "off", ip: "10.60.1.13", cpu: 1, memory: 2, disk: 10 },
  ])

  const [links] = useState<Link[]>([
    { id: "link1", source: "vm1", target: "vm2", name: "Enlace 1" },
    { id: "link2", source: "vm1", target: "vm3", name: "Enlace 2" },
    { id: "link3", source: "vm3", target: "vm4", name: "Enlace 3" },
  ])

  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const getStatusColor = (status: Node["status"]) => {
    switch (status) {
      case "on":
        return "text-green-500"
      case "off":
        return "text-red-500"
      case "waiting":
        return "text-gray-400"
    }
  }

  const getStatusBadge = (status: Node["status"]) => {
    switch (status) {
      case "on":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Encendido</Badge>
      case "off":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Apagado</Badge>
      case "waiting":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">Esperando Estado</Badge>
    }
  }

  const getNodeIcon = (type: Node["type"], status: Node["status"]) => {
    const colorClass = getStatusColor(status)
    if (type === "server") {
      return <Server className={`w-12 h-12 ${colorClass}`} />
    }
    return <Monitor className={`w-12 h-12 ${colorClass}`} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Topology Visualization */}
      <Card className="lg:col-span-2 border-border/50">
        <CardHeader>
          <CardTitle>Network Topology</CardTitle>
          <CardDescription>Visual representation of your slice network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/30 rounded-lg p-8 min-h-[500px] relative border border-border/30">
            {/* Simple topology layout */}
            <div className="grid grid-cols-2 gap-8">
              {nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedNode(node)}
                >
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedNode?.id === node.id
                        ? "border-[#F9D65C] bg-[#F9D65C]/10 shadow-lg shadow-[#F9D65C]/20"
                        : "border-border bg-card hover:border-accent"
                    }`}
                  >
                    {getNodeIcon(node.type, node.status)}
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{node.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{node.ip}</p>
                    {getStatusBadge(node.status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Connection lines visualization */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                {links.map((link, index) => (
                  <g key={link.id}>
                    <line
                      x1={`${25 + (index % 2) * 50}%`}
                      y1={`${25 + Math.floor(index / 2) * 50}%`}
                      x2={`${75 - (index % 2) * 50}%`}
                      y2={`${25 + Math.floor(index / 2) * 50}%`}
                      stroke="#A7C7E7"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <text
                      x={`${50}%`}
                      y={`${23 + Math.floor(index / 2) * 50}%`}
                      fill="#A7C7E7"
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {link.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Encendido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Apagado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>Esperando Estado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details Panel */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Node Details</CardTitle>
          <CardDescription>{selectedNode ? "Manage selected node" : "Select a node to view details"}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedNode ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedNode.type === "server" ? "Server" : "Virtual Machine"}
                  </p>
                </div>
                {getStatusBadge(selectedNode.status)}
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="font-mono">{selectedNode.ip}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPU:</span>
                    <span>{selectedNode.cpu} vCPUs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Memory:</span>
                    <span>{selectedNode.memory} GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disk:</span>
                    <span>{selectedNode.disk} GB</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="actions" className="space-y-2">
                {selectedNode.status === "on" && (
                  <>
                    <Button className="w-full" variant="golden">
                      <Terminal className="w-4 h-4 mr-2" />
                      Open Console
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Square className="w-4 h-4 mr-2" />
                      Stop VM
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <RotateCw className="w-4 h-4 mr-2" />
                      Restart VM
                    </Button>
                  </>
                )}
                {selectedNode.status === "off" && (
                  <Button className="w-full" variant="golden">
                    <Play className="w-4 h-4 mr-2" />
                    Start VM
                  </Button>
                )}
                {selectedNode.status === "waiting" && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    VM is initializing. Please wait...
                  </div>
                )}
                <Button className="w-full bg-transparent" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Click on a node to view details and available actions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nodes List */}
      <Card className="lg:col-span-3 border-border/50">
        <CardHeader>
          <CardTitle>All Nodes</CardTitle>
          <CardDescription>Complete list of nodes in this slice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedNode?.id === node.id
                    ? "border-[#F9D65C] bg-[#F9D65C]/5 shadow-md"
                    : "border-border hover:border-accent"
                }`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-start justify-between mb-2">
                  {getNodeIcon(node.type, node.status)}
                  {getStatusBadge(node.status)}
                </div>
                <h4 className="font-semibold">{node.name}</h4>
                <p className="text-xs text-muted-foreground font-mono">{node.ip}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {node.cpu} vCPU • {node.memory}GB RAM • {node.disk}GB Disk
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
