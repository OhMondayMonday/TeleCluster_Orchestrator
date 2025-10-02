"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2, Users, UserPlus, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

const mockCourses = [
  {
    id: "course-001",
    code: "TEL-245",
    name: "Redes y Comunicaciones 2",
    schedule: "Lunes y Miércoles 10:00-12:00",
    professors: ["Prof. García", "Prof. Zambrano"],
    students: 28,
    maxResources: { cpu: 200, memory: 400, storage: 2000 },
    semester: "2025-1",
  },
  {
    id: "course-002",
    code: "INF-289",
    name: "Cloud Computing",
    schedule: "Martes y Jueves 14:00-16:00",
    professors: ["Prof. Pastor"],
    students: 24,
    maxResources: { cpu: 180, memory: 360, storage: 1800 },
    semester: "2025-1",
  },
  {
    id: "course-003",
    code: "TEL-198",
    name: "Sistemas Distribuidos",
    schedule: "Viernes 08:00-12:00",
    professors: ["Prof. Sologuren", "Prof. Becerra"],
    students: 32,
    maxResources: { cpu: 240, memory: 480, storage: 2400 },
    semester: "2025-1",
  },
]

export function CoursesTable() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Professors</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Max Resources</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCourses.map((course) => (
              <TableRow key={course.id} className="border-border/50">
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {course.code}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{course.schedule}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {course.professors.map((prof, i) => (
                      <span key={i} className="text-sm">
                        {prof}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{course.students}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs space-y-1 font-mono">
                    <div>{course.maxResources.cpu} vCPUs</div>
                    <div>{course.maxResources.memory} GB RAM</div>
                    <div>{course.maxResources.storage} GB Storage</div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/superadmin/courses/${course.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/superadmin/courses/${course.id}`}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Manage Members
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
