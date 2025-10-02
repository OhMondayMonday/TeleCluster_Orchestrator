"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { useState } from "react"

interface AddMemberDialogProps {
  type: "professor" | "student"
  courseId: string
}

export function AddMemberDialog({ type, courseId }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add {type === "professor" ? "Professor" : "Student"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {type === "professor" ? "Professor" : "Student"} to Course</DialogTitle>
          <DialogDescription>
            Enter the {type === "professor" ? "professor's" : "student's"} information to add them to this course.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder={type === "professor" ? "Dr. Juan Pérez" : "María García"} />
          </div>
          {type === "student" && (
            <div className="space-y-2">
              <Label htmlFor="code">Student Code</Label>
              <Input id="code" placeholder="20201234" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@pucp.edu.pe" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Add {type === "professor" ? "Professor" : "Student"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
