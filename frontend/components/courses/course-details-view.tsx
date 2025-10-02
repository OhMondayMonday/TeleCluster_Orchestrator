"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Users, Server } from "lucide-react"
import Link from "next/link"
import { CourseMembers } from "./course-members"
import { CourseResources } from "./course-resources"
import { CourseActivity } from "./course-activity"

const mockCourse = {
  id: "course-001",
  code: "TEL-245",
  name: "Redes y Comunicaciones 2",
  schedule: "Lunes y Miércoles 10:00-12:00",
  semester: "2025-1",
  description:
    "Curso avanzado de redes y comunicaciones que cubre protocolos de enrutamiento, switching, y tecnologías de virtualización de red.",
  professors: [
    { id: "prof-001", name: "Dr. Carlos García", email: "carlos.garcia@pucp.edu.pe", slices: 12 },
    { id: "prof-002", name: "Ing. Branko Zambrano", email: "branko.zambrano@pucp.edu.pe", slices: 8 },
  ],
  students: [
    { id: "stu-001", name: "Carlos Gómez", code: "20070429", email: "carlos.gomez@pucp.edu.pe", slices: 3 },
    { id: "stu-002", name: "Samantha Sanchez", code: "20172234", email: "samantha.sanchez@pucp.edu.pe", slices: 2 },
    { id: "stu-003", name: "Christian Gonzales", code: "20182758", email: "christian.gonzales@pucp.edu.pe", slices: 4 },
    { id: "stu-004", name: "Andrés Lujan", code: "20191450", email: "andres.lujan@pucp.edu.pe", slices: 2 },
  ],
  maxResources: { cpu: 200, memory: 400, storage: 2000 },
  usedResources: { cpu: 156, memory: 312, storage: 1560 },
}

export function CourseDetailsView({ courseId }: { courseId: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/superadmin/courses">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-balance">{mockCourse.name}</h1>
            <Badge variant="outline" className="font-mono">
              {mockCourse.code}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {mockCourse.schedule} • {mockCourse.semester}
          </p>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Course
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed">{mockCourse.description}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCourse.professors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockCourse.professors.reduce((acc, p) => acc + p.slices, 0)} slices created
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCourse.students.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockCourse.students.reduce((acc, s) => acc + s.slices, 0)} slices active
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((mockCourse.usedResources.cpu / mockCourse.maxResources.cpu) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockCourse.usedResources.cpu}/{mockCourse.maxResources.cpu} vCPUs used
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <CourseMembers professors={mockCourse.professors} students={mockCourse.students} courseId={courseId} />
        </TabsContent>

        <TabsContent value="resources">
          <CourseResources maxResources={mockCourse.maxResources} usedResources={mockCourse.usedResources} />
        </TabsContent>

        <TabsContent value="activity">
          <CourseActivity courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
