"use client"

import { SidebarNavigation } from "@/components/coach/sidebar-navigation"
import { DesktopNavigation } from "@/components/coach/desktop-navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronDown } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useConfirmation } from "@/hooks"
import { SubscriptionStatusBanner } from "@/components/subscription-status-banner"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { confirmLogout, ConfirmationComponent } = useConfirmation()
    
    const logoutUser = () => {
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

    return (
        <div className="min-h-screen bg-gray-50">
            {ConfirmationComponent}
            <SubscriptionStatusBanner />
            <SidebarNavigation onLogout={logoutUser} />

            {/* Fixed Header */}
            <header className="hidden lg:block fixed top-0 left-0 right-0 z-30 border-b border-gray-200 bg-white shadow-sm">
                <div className="flex h-16 items-center justify-between px-6">
                    <Link href="/" className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity">
                        <img src="/images/ws-only.png" alt="Woodward Strategies" className="h-8 w-auto" />
                        <h1 className="text-xl font-semibold text-gray-900 font-sans">Team Lead Dashboard</h1>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/professional-admin.png" />
                                    <AvatarFallback>AC</AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium">Admin Coach</p>
                                    <p className="text-xs text-gray-500">System Administrator</p>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={logoutUser} className="text-red-600 cursor-pointer">
                                <LogOut className="h-4 w-4 mr-2" />
                                Log out
                            </DropdownMenuItem>
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
                <main className="flex-1 lg:ml-64 pt-28 lg:pt-32 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
