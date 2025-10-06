"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Server, Play, Square, RotateCw, Terminal, Settings, Network } from "lucide-react"
import { useState, useRef, useCallback } from "react"

interface Node {
  id: string
  name: string
  type: "vm" | "switch" | "server"
  status: "running" | "stopped" | "pending"
  ip?: string
  cpu: number
  memory: number
  disk: number
  x: number
  y: number
}

interface Link {
  id: string
  source: string
  target: string
  name: string
}

interface InteractiveTopologyViewerProps {
  sliceId: string
}

export function InteractiveTopologyViewer({ sliceId }: InteractiveTopologyViewerProps) {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "vm1",
      name: "Web Server",
      type: "vm",
      status: "running", // Changed from "on" to "running"
      ip: "10.60.1.10",
      cpu: 2,
      memory: 4,
      disk: 20,
      x: 150,
      y: 100,
    },
    {
      id: "vm2",
      name: "Database",
      type: "server",
      status: "running", // Changed from "on" to "running"
      ip: "10.60.1.11",
      cpu: 4,
      memory: 8,
      disk: 50,
      x: 450,
      y: 100,
    },
    {
      id: "vm3",
      name: "Load Balancer",
      type: "vm",
      status: "pending", // Changed from "waiting" to "pending"
      ip: "10.60.1.12",
      cpu: 2,
      memory: 2,
      disk: 10,
      x: 150,
      y: 300,
    },
    {
      id: "vm4",
      name: "Cache Server",
      type: "vm",
      status: "stopped", // Changed from "off" to "stopped"
      ip: "10.60.1.13",
      cpu: 1,
      memory: 2,
      disk: 10,
      x: 450,
      y: 300,
    },
  ])

  const [links] = useState<Link[]>([
    { id: "link1", source: "vm1", target: "vm2", name: "Enlace 1" },
    { id: "link2", source: "vm1", target: "vm3", name: "Enlace 2" },
    { id: "link3", source: "vm3", target: "vm4", name: "Enlace 3" },
    { id: "link4", source: "vm2", target: "vm4", name: "Enlace 4" },
  ])

  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault()
      e.stopPropagation()
      setDraggingNode(nodeId)
      setSelectedNode(nodes.find((n) => n.id === nodeId) || null)
    },
    [nodes],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNode || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = Math.max(50, Math.min(rect.width - 50, e.clientX - rect.left))
      const y = Math.max(50, Math.min(rect.height - 50, e.clientY - rect.top))

      setNodes((prev) => prev.map((node) => (node.id === draggingNode ? { ...node, x, y } : node)))
    },
    [draggingNode],
  )

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null)
  }, [])

  const getStatusColor = (status: Node["status"]) => {
    switch (status) {
      case "running":
        return "#10b981" // Bright green
      case "stopped":
        return "#ef4444" // Red
      case "pending":
        return "#f59e0b" // Orange
    }
  }

  const getStatusBadge = (status: Node["status"]) => {
    switch (status) {
      case "running":
        return <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50 font-semibold">● Ejecutando</Badge>
      case "stopped":
        return <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50 font-semibold">● Detenido</Badge>
      case "pending":
        return <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/50 font-semibold">● Pendiente</Badge>
    }
  }

  const getNodeIcon = (type: Node["type"], status: Node["status"]) => {
    const color = getStatusColor(status)
    if (type === "server") {
      return <Server className="w-8 h-8" style={{ color }} />
    }
    return <Monitor className="w-8 h-8" style={{ color }} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Topology Visualization */}
      <Card className="lg:col-span-2 bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800">Topología de Red Interactiva</CardTitle>
              <CardDescription className="text-gray-600">
                Arrastra los nodos para reorganizar - los enlaces se actualizan automáticamente
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-[#00b4d8]/10 text-[#00b4d8] border-[#00b4d8]/50">
              <Network className="w-3 h-3 mr-1" />
              Arrastrar y Soltar
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/30 rounded-lg border border-border/30 relative overflow-hidden">
            <svg
              ref={svgRef}
              className="w-full h-[500px]"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: draggingNode ? "grabbing" : "default" }}
            >
              <g>
                {links.map((link) => {
                  const sourceNode = nodes.find((n) => n.id === link.source)
                  const targetNode = nodes.find((n) => n.id === link.target)
                  if (!sourceNode || !targetNode) return null

                  const midX = (sourceNode.x + targetNode.x) / 2
                  const midY = (sourceNode.y + targetNode.y) / 2

                  const bothRunning = sourceNode.status === "running" && targetNode.status === "running"
                  const linkColor = bothRunning ? "#10b981" : "#00b4d8"

                  return (
                    <g key={link.id}>
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={linkColor}
                        strokeWidth="3"
                        strokeDasharray={bothRunning ? "0" : "5,5"}
                        className="transition-all duration-75"
                        opacity="0.8"
                      />
                      <circle cx={midX} cy={midY} r="14" fill="#1e4e7b" stroke={linkColor} strokeWidth="2" />
                      <text x={midX} y={midY + 4} fill={linkColor} fontSize="11" fontWeight="bold" textAnchor="middle">
                        {link.name.split(" ")[1]}
                      </text>
                    </g>
                  )
                })}
              </g>

              {nodes.map((node) => {
                const statusColor = getStatusColor(node.status)
                const isSelected = selectedNode?.id === node.id
                const isDragging = draggingNode === node.id

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                    style={{
                      cursor: isDragging ? "grabbing" : "grab",
                      transition: isDragging ? "none" : "all 0.1s",
                    }}
                  >
                    <circle
                      r="38"
                      fill={isSelected ? statusColor : "#1e4e7b"}
                      stroke={statusColor}
                      strokeWidth={isSelected ? "4" : "3"}
                      className="transition-all"
                      opacity={isSelected ? "0.9" : "0.95"}
                    />

                    {isSelected && (
                      <circle
                        r="45"
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="2"
                        opacity="0.4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node icon */}
                    <foreignObject x="-12" y="-12" width="24" height="24">
                      {node.type === "server" ? (
                        <Server className="w-6 h-6" style={{ color: isSelected ? "#ffffff" : statusColor }} />
                      ) : (
                        <Monitor className="w-6 h-6" style={{ color: isSelected ? "#ffffff" : statusColor }} />
                      )}
                    </foreignObject>

                    {/* Node label */}
                    <text
                      y="55"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="700"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {node.name}
                    </text>
                    <text
                      y="70"
                      fill="#a7c7e7"
                      fontSize="11"
                      textAnchor="middle"
                      fontFamily="monospace"
                      className="pointer-events-none"
                    >
                      {node.ip}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-lg shadow-[#10b981]/50"></div>
              <span className="font-medium">Ejecutando</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/50"></div>
              <span className="font-medium">Pendiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-lg shadow-[#ef4444]/50"></div>
              <span className="font-medium">Detenido</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details Panel */}
      <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Detalles del Nodo</CardTitle>
          <CardDescription className="text-gray-600">
            {selectedNode ? "Gestionar nodo seleccionado" : "Selecciona un nodo para ver detalles"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedNode ? (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="actions">Acciones</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{selectedNode.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedNode.type === "server" ? "Servidor" : "Máquina Virtual"}
                  </p>
                </div>
                {getStatusBadge(selectedNode.status)}
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dirección IP:</span>
                    <span className="font-mono text-gray-700">{selectedNode.ip}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">CPU:</span>
                    <span className="text-gray-700">{selectedNode.cpu} vCPUs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Memoria:</span>
                    <span className="text-gray-700">{selectedNode.memory} GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Disco:</span>
                    <span className="text-gray-700">{selectedNode.disk} GB</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="actions" className="space-y-2">
                {selectedNode.status === "running" && (
                  <>
                    <Button className="w-full" variant="cyan">
                      <Terminal className="w-4 h-4 mr-2" />
                      Abrir Consola
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <Square className="w-4 h-4 mr-2" />
                      Detener VM
                    </Button>
                    <Button className="w-full bg-transparent" variant="outline">
                      <RotateCw className="w-4 h-4 mr-2" />
                      Reiniciar VM
                    </Button>
                  </>
                )}
                {selectedNode.status === "stopped" && (
                  <Button className="w-full" variant="success">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar VM
                  </Button>
                )}
                {selectedNode.status === "pending" && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    La VM se está inicializando. Por favor espera...
                  </div>
                )}
                <Button className="w-full bg-transparent" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Haz clic en un nodo para ver detalles y acciones disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nodes List */}
      <Card className="lg:col-span-3 bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Todos los Nodos</CardTitle>
          <CardDescription className="text-gray-600">Lista completa de nodos en este slice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedNode?.id === node.id
                    ? "border-[#00b4d8] bg-[#00b4d8]/5 shadow-md"
                    : "border-gray-200 hover:border-[#06a77d] bg-white shadow-sm hover:shadow-md"
                }`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-start justify-between mb-2">
                  {getNodeIcon(node.type, node.status)}
                  {getStatusBadge(node.status)}
                </div>
                <h4 className="font-semibold text-gray-800">{node.name}</h4>
                <p className="text-xs text-gray-500 font-mono">{node.ip}</p>
                <div className="mt-2 text-xs text-gray-500">
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
