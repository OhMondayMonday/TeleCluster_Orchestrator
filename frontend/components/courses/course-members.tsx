"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Mail } from "lucide-react"
import { AddMemberDialog } from "./add-member-dialog"

interface Professor {
  id: string
  name: string
  email: string
  slices: number
}

interface Student {
  id: string
  name: string
  code: string
  email: string
  slices: number
}

interface CourseMembersProps {
  professors: Professor[]
  students: Student[]
  courseId: string
}

export function CourseMembers({ professors, students, courseId }: CourseMembersProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Professors ({professors.length})</CardTitle>
          <AddMemberDialog type="professor" courseId={courseId} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Slices Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((professor) => (
                <TableRow key={professor.id} className="border-border/50">
                  <TableCell className="font-medium">{professor.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {professor.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{professor.slices} slices</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Students ({students.length})</CardTitle>
          <AddMemberDialog type="student" courseId={courseId} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Active Slices</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="border-border/50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {student.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.slices} slices</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
