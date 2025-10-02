"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Play, Square, Trash2, Edit, Server, Eye, Network } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const mockSlices = [
  {
    id: "slice-001",
    name: "Network Topology Lab 3",
    topology: "Mesh",
    status: "running",
    vms: 4,
    cluster: "Linux Cluster",
    resources: { cpu: "8 vCPUs", memory: "16 GB", storage: "120 GB" },
    course: "Redes y Comunicaciones 2",
    student: "Carlos Gómez",
    created: "2025-01-15",
  },
  {
    id: "slice-002",
    name: "Database Replication",
    topology: "Ring",
    status: "stopped",
    vms: 3,
    cluster: "OpenStack",
    resources: { cpu: "6 vCPUs", memory: "12 GB", storage: "80 GB" },
    course: "Cloud Computing",
    student: "Samantha Sanchez",
    created: "2025-01-10",
  },
  {
    id: "slice-003",
    name: "Load Balancer Setup",
    topology: "Tree",
    status: "running",
    vms: 5,
    cluster: "Linux Cluster",
    resources: { cpu: "10 vCPUs", memory: "20 GB", storage: "150 GB" },
    course: "Redes y Comunicaciones 2",
    student: "Christian Gonzales",
    created: "2025-01-08",
  },
]

interface SlicesListProps {
  role: "alumno" | "profesor" | "superadmin"
  courseFilter?: string
}

export function SlicesList({ role, courseFilter }: SlicesListProps) {
  const filteredSlices = courseFilter ? mockSlices.filter((s) => s.course === courseFilter) : mockSlices
  const baseUrl = role === "alumno" ? "/alumno/slices" : role === "profesor" ? "/profesor/slices" : "/superadmin/slices"

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredSlices.map((slice) => (
        <Card key={slice.id} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-200 shadow-md hover:border-gray-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg text-gray-800">{slice.name}</CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  {slice.topology} • {slice.vms} VMs
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/${slice.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${baseUrl}/${slice.id}/topology`}>
                      <Network className="w-4 h-4 mr-2" />
                      Ver Topología
                    </Link>
                  </DropdownMenuItem>
                  {role !== "alumno" && (
                    <>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {slice.status === "running" ? (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            Detener
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={
                  slice.status === "running"
                    ? "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50"
                    : "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50"
                }
              >
                {slice.status === "running" ? "● Ejecutando" : "● Detenido"}
              </Badge>
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                <Server className="w-3 h-3 mr-1" />
                {slice.cluster}
              </Badge>
            </div>
            {role !== "alumno" && (
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Curso: </span>
                  <span className="font-medium text-gray-800">{slice.course}</span>
                </div>
                <div>
                  <span className="text-gray-500">Estudiante: </span>
                  <span className="font-medium text-gray-800">{slice.student}</span>
                </div>
              </div>
            )}
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>CPU:</span>
                <span className="font-mono text-gray-700">{slice.resources.cpu}</span>
              </div>
              <div className="flex justify-between">
                <span>Memoria:</span>
                <span className="font-mono text-gray-700">{slice.resources.memory}</span>
              </div>
              <div className="flex justify-between">
                <span>Almacenamiento:</span>
                <span className="font-mono text-gray-700">{slice.resources.storage}</span>
              </div>
            </div>
            <Button asChild className="w-full bg-[#032058] text-white hover:bg-[#032058]/90" variant="secondary">
              <Link href={`${baseUrl}/${slice.id}/topology`}>
                <Network className="w-4 h-4 mr-2" />
                Ver Topología
              </Link>
            </Button>
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-200">Creado: {slice.created}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
