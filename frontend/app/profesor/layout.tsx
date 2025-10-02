import type React from "react"
import { ProfesorNav } from "@/components/navigation/profesor-nav"

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <ProfesorNav />
      <main>{children}</main>
    </div>
  )
}
