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
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useState } from "react"

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Enter the course information. You can add professors and students after creating the course.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code *</Label>
              <Input id="code" placeholder="TEL-245" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Input id="semester" placeholder="2025-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Course Name *</Label>
            <Input id="name" placeholder="Redes y Comunicaciones 2" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule *</Label>
            <Input id="schedule" placeholder="Lunes y Miércoles 10:00-12:00" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the course..." rows={3} />
          </div>

          <div className="space-y-3">
            <Label>Maximum Resources</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu" className="text-xs text-muted-foreground">
                  vCPUs
                </Label>
                <Input id="cpu" type="number" placeholder="200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory" className="text-xs text-muted-foreground">
                  Memory (GB)
                </Label>
                <Input id="memory" type="number" placeholder="400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage" className="text-xs text-muted-foreground">
                  Storage (GB)
                </Label>
                <Input id="storage" type="number" placeholder="2000" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create Course</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
