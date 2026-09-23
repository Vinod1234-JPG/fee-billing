"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  GraduationCap,
  IndianRupee,
  Bus,
  FileText,
  Settings,
  ClipboardList
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role || "ASSISTANT"

  const adminNav = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Assistants", href: "/admin/assistants", icon: UserSquare2 },
    { name: "Fees", href: "/admin/fees", icon: IndianRupee },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const assistantNav: any[] = []

  const navItems = role === "ADMIN" ? adminNav : assistantNav
  
  if (role === "ASSISTANT") {
    return null
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <span className="text-xl font-bold text-white tracking-tight">SchoolAdmin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
