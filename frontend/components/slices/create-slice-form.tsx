"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export function CreateSliceForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    topology: "",
    cluster: "",
    vms: "3",
    cpu: "2",
    memory: "4",
    storage: "20",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock creation
    router.push("/alumno/slices")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
          <CardDescription>Define the basic parameters of your slice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Slice Name</Label>
            <Input
              id="name"
              placeholder="e.g., Web Server Cluster"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-secondary/50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="topology">Topology</Label>
              <Select
                value={formData.topology}
                onValueChange={(value) => setFormData({ ...formData, topology: value })}
              >
                <SelectTrigger id="topology" className="bg-secondary/50">
                  <SelectValue placeholder="Select topology" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="ring">Ring</SelectItem>
                  <SelectItem value="tree">Tree</SelectItem>
                  <SelectItem value="mesh">Mesh</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster">Target Cluster</Label>
              <Select value={formData.cluster} onValueChange={(value) => setFormData({ ...formData, cluster: value })}>
                <SelectTrigger id="cluster" className="bg-secondary/50">
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linux">Linux Cluster</SelectItem>
                  <SelectItem value="openstack">OpenStack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vms">Number of VMs</Label>
            <Input
              id="vms"
              type="number"
              min="1"
              max="10"
              value={formData.vms}
              onChange={(e) => setFormData({ ...formData, vms: e.target.value })}
              required
              className="bg-secondary/50"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>Configure resources per VM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cpu">vCPUs</Label>
              <Input
                id="cpu"
                type="number"
                min="1"
                max="8"
                value={formData.cpu}
                onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                required
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memory">Memory (GB)</Label>
              <Input
                id="memory"
                type="number"
                min="1"
                max="32"
                value={formData.memory}
                onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                required
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Storage (GB)</Label>
              <Input
                id="storage"
                type="number"
                min="10"
                max="500"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                required
                className="bg-secondary/50"
              />
            </div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg space-y-2 text-sm">
            <div className="font-medium">Total Resources:</div>
            <div className="grid grid-cols-3 gap-4 text-muted-foreground">
              <div>
                <div className="font-mono text-foreground">{Number(formData.cpu) * Number(formData.vms)}</div>
                <div className="text-xs">vCPUs</div>
              </div>
              <div>
                <div className="font-mono text-foreground">{Number(formData.memory) * Number(formData.vms)} GB</div>
                <div className="text-xs">Memory</div>
              </div>
              <div>
                <div className="font-mono text-foreground">{Number(formData.storage) * Number(formData.vms)} GB</div>
                <div className="text-xs">Storage</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit">Create Slice</Button>
      </div>
    </form>
  )
}
