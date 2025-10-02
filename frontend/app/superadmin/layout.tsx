import type React from "react"
import { SuperadminNav } from "@/components/navigation/superadmin-nav"

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <SuperadminNav />
      <main>{children}</main>
    </div>
  )
}
