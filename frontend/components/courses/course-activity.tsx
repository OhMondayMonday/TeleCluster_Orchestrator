"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Plus, Trash2, Edit } from "lucide-react"

const mockActivity = [
  {
    id: "act-001",
    type: "slice_created",
    user: "Carlos Gómez",
    description: "Created slice 'Network Topology Lab 3'",
    timestamp: "2025-01-15 14:30",
  },
  {
    id: "act-002",
    type: "member_added",
    user: "Admin",
    description: "Added student Samantha Sanchez to course",
    timestamp: "2025-01-15 10:15",
  },
  {
    id: "act-003",
    type: "slice_deleted",
    user: "Prof. García",
    description: "Deleted slice 'Test Environment'",
    timestamp: "2025-01-14 16:45",
  },
  {
    id: "act-004",
    type: "slice_modified",
    user: "Christian Gonzales",
    description: "Modified slice 'Router Configuration'",
    timestamp: "2025-01-14 11:20",
  },
  {
    id: "act-005",
    type: "resource_updated",
    user: "Admin",
    description: "Updated course resource limits",
    timestamp: "2025-01-13 09:00",
  },
]

const activityIcons = {
  slice_created: Plus,
  member_added: Plus,
  slice_deleted: Trash2,
  slice_modified: Edit,
  resource_updated: Activity,
}

const activityColors = {
  slice_created: "text-green-500",
  member_added: "text-blue-500",
  slice_deleted: "text-red-500",
  slice_modified: "text-yellow-500",
  resource_updated: "text-purple-500",
}

export function CourseActivity({ courseId }: { courseId: string }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivity.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons]
            const colorClass = activityColors[activity.type as keyof typeof activityColors]

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0"
              >
                <div className={`mt-1 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
