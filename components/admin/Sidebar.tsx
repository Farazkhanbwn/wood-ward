"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { BarChart3, Users, History, LogOut, Menu, X, ChevronDown, Shield, CreditCard, Building2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useConfirmationContext } from "./confirmation-provider"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface SidebarProps {
    onLogout?: () => void
}

const tabs = [
    { id: "company-management", label: "Company Management", icon: Building2, href: "/admin/company-management" },
    { id: "account-management", label: "Account Management", icon: Users, href: "/admin/account-management" },
    { id: "subscription-billing", label: "Subscription & Billing", icon: CreditCard, href: "/admin/subscription-billing" },
    { id: "team-user-oversight", label: "Team & User Oversight", icon: Shield, href: "/admin/team-user-oversight" }
]
export function Sidebar({ onLogout }: SidebarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()
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
            setIsMobileMenuOpen(false)
        })
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
                    </div>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
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
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div
                className={cn(
                    "lg:hidden bg-white border-r border-gray-200 h-screen flex flex-col w-64 fixed top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/ws-only.png"
                            alt="Woodward Strategies"
                            className="h-8 w-auto"
                        />
                        <h1 className="text-xl font-bold text-gray-900">Admin Hub</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = pathname === tab.href

                        return (
                            <Link key={tab.id} href={tab.href} onClick={() => setIsMobileMenuOpen(false)} className="cursor-pointer">
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className={cn(
                                        "p-3 w-full justify-start gap-3 h-12 text-left transition-all duration-200 mb-2",
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
