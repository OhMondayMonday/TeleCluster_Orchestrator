"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { time: "00:00", cpu: 45, memory: 52, network: 38 },
  { time: "04:00", cpu: 38, memory: 48, network: 32 },
  { time: "08:00", cpu: 62, memory: 68, network: 55 },
  { time: "12:00", cpu: 78, memory: 75, network: 72 },
  { time: "16:00", cpu: 85, memory: 82, network: 68 },
  { time: "20:00", cpu: 72, memory: 70, network: 58 },
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
  network: {
    label: "Network",
    color: "#f59e0b",
  },
}

export function SystemHealthChart() {
  return (
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-gray-800">System Health (24h)</CardTitle>
        <CardDescription className="text-gray-600">Resource utilization trends over time</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="time" stroke="rgba(0,0,0,0.7)" fontSize={12} />
              <YAxis stroke="rgba(0,0,0,0.7)" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="network" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
