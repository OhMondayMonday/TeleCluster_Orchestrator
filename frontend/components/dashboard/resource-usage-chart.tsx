"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { cluster: "Linux-1", cpu: 65, memory: 72, storage: 58 },
  { cluster: "Linux-2", cpu: 78, memory: 68, storage: 82 },
  { cluster: "OpenStack-1", cpu: 45, memory: 52, storage: 48 },
  { cluster: "OpenStack-2", cpu: 82, memory: 88, storage: 75 },
]

const chartConfig = {
  cpu: {
    label: "CPU",
    color: "#3b82f6",
  },
  memory: {
    label: "Memory",
    color: "#10b981",
  },
  storage: {
    label: "Storage",
    color: "#f59e0b",
  },
}

export function ResourceUsageChart() {
  return (
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-gray-800">Resource Usage by Cluster</CardTitle>
        <CardDescription className="text-gray-600">Current utilization across all clusters</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="cluster" stroke="rgba(0,0,0,0.7)" fontSize={12} />
              <YAxis stroke="rgba(0,0,0,0.7)" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cpu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="memory" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="storage" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
