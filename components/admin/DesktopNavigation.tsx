"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Users, History, CreditCard, Shield, Building2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
    { id: "company-management", label: "Company Management", icon: Building2, href: "/admin/company-management" },
    { id: "account-management", label: "Account Management", icon: Users, href: "/admin/account-management" },
    { id: "subscription-billing", label: "Subscription & Billing", icon: CreditCard, href: "/admin/subscription-billing" },
    { id: "team-user-oversight", label: "Team & User Oversight", icon: Shield, href: "/admin/team-user-oversight" },
    { id: "analytics", label: "Platform Analytics", icon: BarChart3, href: "/admin/analytics" }
]

export function DesktopNavigation() {
    const pathname = usePathname()

    return (
        <nav className="mt-4 py-4 px-2 space-y-2">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = pathname === tab.href

                return (
                    <Link key={tab.id} href={tab.href} className="cursor-pointer">
                        <Button
                            variant={isActive ? "default" : "ghost"}
                            size="lg"
                            className={cn(
                                "w-full justify-start transition-all duration-200 hover:translate-x-1 h-12 mb-2",
                                isActive
                                    ? "bg-blue-50 hover:bg-blue-100 text-blue-600 border-0"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </Button>
                    </Link>
                )
            })}
        </nav>
    )
}
