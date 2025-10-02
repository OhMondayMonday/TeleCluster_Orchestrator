import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const activities = [
  {
    id: 1,
    type: "slice_created",
    user: "Carlos Gómez",
    action: "created slice",
    target: "Web Server Cluster",
    time: "5 min ago",
    color: "cyan",
  },
  {
    id: 2,
    type: "slice_deleted",
    user: "Samantha Sanchez",
    action: "deleted slice",
    target: "Test Environment",
    time: "12 min ago",
    color: "red",
  },
  {
    id: 3,
    type: "course_created",
    user: "Prof. García",
    action: "created course",
    target: "TEL-245",
    time: "1 hour ago",
    color: "green",
  },
  {
    id: 4,
    type: "slice_created",
    user: "Christian Gonzales",
    action: "created slice",
    target: "Database Topology",
    time: "2 hours ago",
    color: "cyan",
  },
  {
    id: 5,
    type: "user_added",
    user: "Admin",
    action: "added student to",
    target: "Cloud Computing",
    time: "3 hours ago",
    color: "purple",
  },
]

const badgeColors = {
  cyan: "bg-[#00b4d8]/20 text-[#00b4d8] border-[#00b4d8]/50",
  green: "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50",
  red: "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50",
  purple: "bg-[#7209b7]/20 text-[#7209b7] border-[#7209b7]/50",
  orange: "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/50",
}

export function RecentActivityList() {
  return (
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-gray-800">Recent Activity</CardTitle>
        <CardDescription className="text-gray-600">Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-300/50 last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-gray-500">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <Badge className={`text-xs ${badgeColors[activity.color as keyof typeof badgeColors]}`}>
                  {activity.type.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
