"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, Users, History, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarNavigationProps {
    onLogout?: () => void
}

const tabs = [
    { id: "performance-analytics", label: "Performance Analytics", icon: BarChart3, href: "/coach/performance-analytics" },
    { id: "team-management", label: "Team Management", icon: Users, href: "/coach/team-management" },
    { id: "practice-history", label: "Practice History", icon: History, href: "/coach/practice-history" }
]

export function SidebarNavigation({ onLogout }: SidebarNavigationProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const handleLogout = () => {
        if (onLogout) {
            onLogout()
        }
        // Close mobile menu when logout is clicked
        setIsMobileMenuOpen(false)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <>
            {/* Mobile Header with Hamburger Menu - Fixed */}
            <div className="lg:hidden fixed top-0 left-0 right-0 border-b border-gray-200 bg-white shadow-sm z-40">
                <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMobileMenu}
                            className="p-2 hover:bg-gray-100"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                        <h1 className="text-lg font-semibold text-gray-900">Team Lead Dashboard</h1>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="/professional-coach-profile.png" />
                                    <AvatarFallback>AC</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div
                className={cn(
                    "lg:hidden bg-white border-r border-gray-200 h-screen flex flex-col w-64 fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center gap-3 py-6 px-3 border-b border-gray-200">
                    <img src="/images/ws-only.png" alt="Woodward Strategies" className="h-8 w-auto" />

                    <h1 className="text-xl font-bold text-gray-900">Team Lead Dashboard</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = pathname === tab.href

                        return (
                            <Link key={tab.id} href={tab.href}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3 h-12 text-left transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                                        isActive && "hover:bg-blue-50 hover:text-blue-700",
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
