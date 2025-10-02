"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Network, Server, Plus, Minus } from "lucide-react"
import { useState } from "react"

const topologies = [
  { value: "linear", label: "Linear", description: "VMs connected in a line" },
  { value: "ring", label: "Ring", description: "VMs connected in a circle" },
  { value: "tree", label: "Tree", description: "Hierarchical structure" },
  { value: "mesh", label: "Mesh", description: "Fully connected network" },
  { value: "bus", label: "Bus", description: "All VMs on a single bus" },
]

export function CreateSliceForStudentForm() {
  const [vmCount, setVmCount] = useState(3)

  return (
    <form className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure the slice details and assign to a student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="redes">Redes y Comunicaciones 2</SelectItem>
                  <SelectItem value="cloud">Cloud Computing</SelectItem>
                  <SelectItem value="distribuidos">Sistemas Distribuidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select>
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stu-001">Carlos Gómez (20070429)</SelectItem>
                  <SelectItem value="stu-002">Samantha Sanchez (20172234)</SelectItem>
                  <SelectItem value="stu-003">Christian Gonzales (20182758)</SelectItem>
                  <SelectItem value="stu-004">Andrés Lujan (20191450)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Slice Name *</Label>
            <Input id="name" placeholder="e.g., Network Lab 3 - Routing Protocols" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the slice purpose..." rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Topology Configuration
          </CardTitle>
          <CardDescription>Select the network topology and cluster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topology">Topology *</Label>
              <Select>
                <SelectTrigger id="topology">
                  <SelectValue placeholder="Select topology" />
                </SelectTrigger>
                <SelectContent>
                  {topologies.map((topo) => (
                    <SelectItem key={topo.value} value={topo.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{topo.label}</span>
                        <span className="text-xs text-muted-foreground">{topo.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster">Cluster *</Label>
              <Select>
                <SelectTrigger id="cluster">
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linux">Linux Cluster</SelectItem>
                  <SelectItem value="openstack">OpenStack Cluster</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Number of VMs</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" size="icon" onClick={() => setVmCount(Math.max(1, vmCount - 1))}>
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold">{vmCount}</span>
                <span className="text-sm text-muted-foreground ml-2">virtual machines</span>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setVmCount(Math.min(10, vmCount + 1))}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            VM Configuration
          </CardTitle>
          <CardDescription>Set default resources for each VM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">vCPUs per VM</Label>
              <Input id="cpu" type="number" defaultValue="2" min="1" max="8" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory">Memory (GB)</Label>
              <Input id="memory" type="number" defaultValue="4" min="1" max="32" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Storage (GB)</Label>
              <Input id="storage" type="number" defaultValue="20" min="10" max="200" />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium">Total Resources Required</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total CPU:</span>
                <span className="ml-2 font-mono font-semibold">{vmCount * 2} vCPUs</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Memory:</span>
                <span className="ml-2 font-mono font-semibold">{vmCount * 4} GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Storage:</span>
                <span className="ml-2 font-mono font-semibold">{vmCount * 20} GB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Create Slice</Button>
      </div>
    </form>
  )
}
