"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { course: "INF-245", allocated: 80, used: 65, available: 15 },
  { course: "INF-281", allocated: 100, used: 88, available: 12 },
  { course: "INF-239", allocated: 60, used: 45, available: 15 },
  { course: "INF-282", allocated: 90, used: 72, available: 18 },
  { course: "INF-226", allocated: 70, used: 58, available: 12 },
]

const chartConfig = {
  used: {
    label: "Used",
    color: "#3b82f6",
  },
  available: {
    label: "Available",
    color: "#10b981",
  },
}

export function CourseResourcesChart() {
  return (
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-gray-800">Course Resource Allocation</CardTitle>
        <CardDescription className="text-gray-600">Resource usage by course (CPU cores)</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="course" stroke="rgba(0,0,0,0.7)" fontSize={12} />
              <YAxis stroke="rgba(0,0,0,0.7)" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="used" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="available" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
