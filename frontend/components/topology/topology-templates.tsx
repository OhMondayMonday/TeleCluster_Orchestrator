"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Network, GitBranch, Share2, Grid3x3, Workflow, Minus } from "lucide-react"

interface TopologyTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  nodes: number
  topology: string
  color: string
}

const templates: TopologyTemplate[] = [
  {
    id: "linear",
    name: "Linear Topology",
    description: "Nodes connected in a straight line, ideal for simple sequential processing",
    icon: <Minus className="w-8 h-8" />,
    nodes: 4,
    topology: "Linear",
    color: "cyan",
  },
  {
    id: "ring",
    name: "Ring Topology",
    description: "Circular connection where each node connects to two neighbors",
    icon: <Network className="w-8 h-8" />,
    nodes: 5,
    topology: "Ring",
    color: "teal",
  },
  {
    id: "star",
    name: "Star Topology",
    description: "Central hub with all nodes connected to it, perfect for centralized control",
    icon: <Share2 className="w-8 h-8" />,
    nodes: 6,
    topology: "Star",
    color: "purple",
  },
  {
    id: "tree",
    name: "Tree Topology",
    description: "Hierarchical structure with root and branches, great for organizational networks",
    icon: <GitBranch className="w-8 h-8" />,
    nodes: 7,
    topology: "Tree",
    color: "cyan",
  },
  {
    id: "mesh",
    name: "Mesh Topology",
    description: "Fully connected network where every node connects to every other node",
    icon: <Grid3x3 className="w-8 h-8" />,
    nodes: 5,
    topology: "Mesh",
    color: "teal",
  },
  {
    id: "bus",
    name: "Bus Topology",
    description: "All nodes connected to a single backbone cable, simple and cost-effective",
    icon: <Workflow className="w-8 h-8" />,
    nodes: 5,
    topology: "Bus",
    color: "purple",
  },
]

interface TopologyTemplatesProps {
  onSelectTemplate: (templateId: string) => void
}

export function TopologyTemplates({ onSelectTemplate }: TopologyTemplatesProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "cyan":
        return "border-[#00b4d8] bg-[#00b4d8]/10 text-[#00b4d8] hover:bg-[#00b4d8]/20"
      case "teal":
        return "border-[#06a77d] bg-[#06a77d]/10 text-[#06a77d] hover:bg-[#06a77d]/20"
      case "purple":
        return "border-[#7209b7] bg-[#7209b7]/10 text-[#7209b7] hover:bg-[#7209b7]/20"
      default:
        return "border-border bg-card"
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Predefined Topology Templates</CardTitle>
        <CardDescription>Start with a common network topology pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${getColorClasses(template.color)}`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-background/50">{template.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {template.nodes} nodes
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectTemplate(template.id)
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
