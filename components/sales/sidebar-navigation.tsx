"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Phone, LogOut, BookOpen, BarChart3 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useConfirmation } from "@/hooks/use-confirmation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/sales" },
  { id: "playbooks", label: "Playbooks", icon: BookOpen, href: "/sales/playbooks" },
  { id: "call-simulation", label: "Call Simulation", icon: Phone, href: "/sales/call-simulation" },
  { id: "performance", label: "My Performance", icon: BarChart3, href: "/sales/performance" },
]

interface SidebarNavigationProps {
  onCloseSidebar?: () => void
}

export function SidebarNavigation({ onCloseSidebar }: SidebarNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { confirmLogout, ConfirmationComponent } = useConfirmation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleNavigation = (href: string) => {
    router.push(href)
    // Close sidebar on mobile after navigation
    onCloseSidebar?.()
  }

  const handleLogout = () => {
    confirmLogout(async () => {
      try {
        setIsLoggingOut(true)
        await api.logout()
        toast.success("Logged out successfully")
        window.location.href = '/login'
      } catch (err) {
        toast.error("Logout failed")
        setIsLoggingOut(false)
      }
    })
    onCloseSidebar?.()
  }
  return (
    <div className="bg-white border-r border-sidebar-border h-screen flex flex-col w-64">
      {/* Header - Hidden on mobile since we have mobile header */}
      <div className="hidden  lg:block p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/images/ws-only.png" alt="Woodward Strategies" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-sidebar-foreground">Sales Training</h1>
        </Link>
      </div>

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/images/ws-only.png" alt="Woodward Strategies" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-sidebar-foreground">Sales Training</h1>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => handleNavigation(tab.href)}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left nav-transition",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                  : "text-sidebar-foreground hover:bg-gray-50 hover:text-gray-900",
                isActive && "hover:bg-blue-50 hover:text-blue-700",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </Button>
          )
        })}
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start gap-3 h-12 text-left nav-transition text-sidebar-foreground hover:bg-gray-50 hover:text-gray-900 mt-4"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </Button>
      </nav>
      {ConfirmationComponent}
    </div>
  )
}
