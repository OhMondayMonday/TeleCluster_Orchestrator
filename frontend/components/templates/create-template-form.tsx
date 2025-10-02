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

export function CreateTemplateForm() {
  const [vmCount, setVmCount] = useState(3)
  const [cpuPerVm, setCpuPerVm] = useState(2)
  const [memoryPerVm, setMemoryPerVm] = useState(4)
  const [storagePerVm, setStoragePerVm] = useState(20)

  return (
    <form className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Basic details about this template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input id="name" placeholder="e.g., Basic Web Server Setup" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this template is for and when to use it..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Topology Configuration
          </CardTitle>
          <CardDescription>Define the network topology</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            Default VM Configuration
          </CardTitle>
          <CardDescription>Set default resources for each VM in this template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">vCPUs per VM</Label>
              <Input
                id="cpu"
                type="number"
                value={cpuPerVm}
                onChange={(e) => setCpuPerVm(Number(e.target.value))}
                min="1"
                max="8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory">Memory (GB)</Label>
              <Input
                id="memory"
                type="number"
                value={memoryPerVm}
                onChange={(e) => setMemoryPerVm(Number(e.target.value))}
                min="1"
                max="32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Storage (GB)</Label>
              <Input
                id="storage"
                type="number"
                value={storagePerVm}
                onChange={(e) => setStoragePerVm(Number(e.target.value))}
                min="10"
                max="200"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium">Total Resources for Template</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total CPU:</span>
                <span className="ml-2 font-mono font-semibold">{vmCount * cpuPerVm} vCPUs</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Memory:</span>
                <span className="ml-2 font-mono font-semibold">{vmCount * memoryPerVm} GB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Storage:</span>
                <span className="ml-2 font-mono font-semibold">{vmCount * storagePerVm} GB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save Template</Button>
      </div>
    </form>
  )
}
