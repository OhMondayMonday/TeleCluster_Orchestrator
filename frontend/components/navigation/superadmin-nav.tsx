"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, BookOpen, Server } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Panel de Control", href: "/superadmin/dashboard", icon: LayoutDashboard },
  { name: "Cursos", href: "/superadmin/courses", icon: BookOpen },
  { name: "Recursos", href: "/superadmin/resources", icon: Server },
]

export function SuperadminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-white/20 bg-[#032058] backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/superadmin/dashboard" className="flex items-center gap-3">
              <Image src="/logo.png" alt="PUCP" width={36} height={36} className="rounded-full" />
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white">PUCP Cloud</div>
                <div className="text-xs text-white/70">Portal de Administración</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/login">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
