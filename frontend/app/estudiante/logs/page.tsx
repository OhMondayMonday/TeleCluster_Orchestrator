import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Download, Filter, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react"

export default function EstudianteLogsPage() {
  const logs = [
    {
      id: 1,
      timestamp: "2025-01-10 14:32:15",
      level: "info",
      vm: "Web Server",
      message: "VM started successfully",
      slice: "Web Application Lab",
    },
    {
      id: 2,
      timestamp: "2025-01-10 14:31:08",
      level: "success",
      vm: "Database",
      message: "Connection established to database",
      slice: "Web Application Lab",
    },
    {
      id: 3,
      timestamp: "2025-01-10 14:28:42",
      level: "warning",
      vm: "Web Server",
      message: "High memory usage detected (85%)",
      slice: "Web Application Lab",
    },
    {
      id: 4,
      timestamp: "2025-01-10 14:25:19",
      level: "error",
      vm: "Load Balancer",
      message: "Failed to connect to backend server",
      slice: "Web Application Lab",
    },
    {
      id: 5,
      timestamp: "2025-01-10 14:20:33",
      level: "info",
      vm: "Firewall",
      message: "Security rules updated",
      slice: "Network Security Project",
    },
    {
      id: 6,
      timestamp: "2025-01-10 14:15:47",
      level: "success",
      vm: "Web Server",
      message: "Deployment completed",
      slice: "Web Application Lab",
    },
    {
      id: 7,
      timestamp: "2025-01-10 14:10:22",
      level: "info",
      vm: "Database",
      message: "Backup initiated",
      slice: "Web Application Lab",
    },
    {
      id: 8,
      timestamp: "2025-01-10 14:05:11",
      level: "warning",
      vm: "Cache Server",
      message: "Cache miss rate above threshold",
      slice: "Web Application Lab",
    },
  ]

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-[#10b981]" />
      default:
        return <Info className="w-4 h-4 text-[#00b4d8]" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Warning</Badge>
      case "success":
        return <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50">Success</Badge>
      default:
        return <Badge className="bg-[#00b4d8]/20 text-[#00b4d8] border-[#00b4d8]/50">Info</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">Monitor and debug your virtual machines</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Real-time activity from all your VMs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Slice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Slices</SelectItem>
                <SelectItem value="web">Web Application Lab</SelectItem>
                <SelectItem value="security">Network Security Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px] rounded-md border border-border/50 p-4">
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="mt-0.5">{getLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getLevelBadge(log.level)}
                      <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="font-mono">{log.vm}</span>
                      <span>•</span>
                      <span>{log.slice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
