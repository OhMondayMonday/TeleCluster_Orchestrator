"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { name: "Redes y Comunicaciones 2", value: 35, color: "#3b82f6" },
  { name: "Cloud Computing", value: 28, color: "#10b981" },
  { name: "Sistemas Distribuidos", value: 22, color: "#f59e0b" },
  { name: "Available", value: 15, color: "#6b7280" },
]

const chartConfig = {
  value: {
    label: "Resources",
  },
}

export function ResourceAllocation() {
  return (
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-gray-800">Resource Allocation by Course</CardTitle>
        <CardDescription className="text-gray-600">Distribution of compute resources across courses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
