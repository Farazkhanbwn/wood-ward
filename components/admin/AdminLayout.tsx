"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Building2,
    ChevronDown,
    CreditCard,
    Shield,
    Users
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DesktopNavigation } from "./DesktopNavigation"
import { Sidebar } from "./Sidebar"
import { useConfirmationContext } from "./confirmation-provider"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const { confirmLogout } = useConfirmationContext()

    const handleLogout = () => {
        confirmLogout(async () => {
            try {
                await api.logout()
                toast.success("Logged out successfully")
                // Use window.location to force full page reload and clear cache
                window.location.href = '/login'
            } catch (err) {
                toast.error("Logout failed")
            }
        })
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const closeSidebar = () => {
        setSidebarOpen(false)
    }

    const navigationItems = [
        {
            name: "Account Management",
            href: "/account-management",
            icon: Users,
        },
        {
            name: "Subscription & Billing",
            href: "/subscription-billing",
            icon: CreditCard,
        },
        {
            name: "Team & User Oversight",
            href: "/team-user-oversight",
            icon: Shield,
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar onLogout={handleLogout} />

            {/* Fixed Header */}
            <header className="hidden lg:block fixed top-0 left-0 right-0 z-30 border-b border-gray-200 bg-white shadow-sm py-2">
                <div className="flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center justify-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <img
                            src="/images/ws-only.png"
                            alt="Woodward Strategies"
                            className="h-8 w-auto"
                        />
                        <h1 className="text-xl font-semibold text-foreground">Woodward Admin</h1>
                    </Link>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 cursor-pointer">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/admin-interface.png" />
                                    <AvatarFallback>SA</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">Super Admin</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="flex">
                {/* Fixed Sidebar */}
                <aside className="hidden lg:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] border-r border-gray-200 bg-white z-20">
                    <DesktopNavigation />
                </aside>

                {/* Main Content Area with proper margins */}
                <main className="flex-1 lg:ml-64 lg:pt-16 pt-16 p-4 mt-8 lg:p-6 overflow-x-hidden">
                    <div className="max-w-full overflow-x-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
