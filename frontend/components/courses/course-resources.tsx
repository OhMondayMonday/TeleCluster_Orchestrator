"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

interface Resources {
  cpu: number
  memory: number
  storage: number
}

interface CourseResourcesProps {
  maxResources: Resources
  usedResources: Resources
}

export function CourseResources({ maxResources, usedResources }: CourseResourcesProps) {
  const cpuPercent = (usedResources.cpu / maxResources.cpu) * 100
  const memoryPercent = (usedResources.memory / maxResources.memory) * 100
  const storagePercent = (usedResources.storage / maxResources.storage) * 100

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Resource Allocation</CardTitle>
        <Button size="sm" variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Limits
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">CPU (vCPUs)</span>
            <span className="text-muted-foreground">
              {usedResources.cpu} / {maxResources.cpu} ({Math.round(cpuPercent)}%)
            </span>
          </div>
          <Progress value={cpuPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Memory (GB)</span>
            <span className="text-muted-foreground">
              {usedResources.memory} / {maxResources.memory} ({Math.round(memoryPercent)}%)
            </span>
          </div>
          <Progress value={memoryPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Storage (GB)</span>
            <span className="text-muted-foreground">
              {usedResources.storage} / {maxResources.storage} ({Math.round(storagePercent)}%)
            </span>
          </div>
          <Progress value={storagePercent} className="h-2" />
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{Math.round(cpuPercent)}%</div>
              <div className="text-xs text-muted-foreground mt-1">CPU Usage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{Math.round(memoryPercent)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Memory Usage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{Math.round(storagePercent)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Storage Usage</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
