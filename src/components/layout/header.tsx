"use client"

import { signOut, useSession } from "next-auth/react"
import { Bell, Menu, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role || "ASSISTANT"

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-r-0">
            {/* Mobile navigation could go here. Reusing sidebar logic is best. */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
              <span className="text-xl font-bold text-white tracking-tight">SchoolAdmin</span>
            </div>
            <div className="p-4">
              <Link href={role === "ADMIN" ? "/admin/dashboard" : "/assistant/dashboard"} className="text-slate-300 block py-2">
                Dashboard
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
          {pathname.split("/").slice(2).join(" ").toUpperCase() || "DASHBOARD"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}>
            <UserCircle className="w-8 h-8 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs font-semibold mt-1 text-blue-600">
                    {role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
