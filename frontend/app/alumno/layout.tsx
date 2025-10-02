import type React from "react"
import { AlumnoNav } from "@/components/navigation/alumno-nav"

export default function AlumnoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <AlumnoNav />
      <main>{children}</main>
    </div>
  )
}
