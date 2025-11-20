"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Users, History } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
    { id: "performance-analytics", label: "Performance Analytics", icon: BarChart3, href: "/coach/performance-analytics" },
    { id: "team-management", label: "Team Management", icon: Users, href: "/coach/team-management" },
    { id: "practice-history", label: "Practice History", icon: History, href: "/coach/practice-history" }
]

export function DesktopNavigation() {
    const pathname = usePathname()

    return (
        <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = pathname === tab.href

                return (
                    <Link key={tab.id} href={tab.href}>
                        <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                                "w-full justify-start transition-all duration-200 hover:translate-x-1",
                                isActive
                                    ? "bg-blue-50 hover:bg-blue-100 text-blue-600 border-0"
                                    : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <Icon className="mr-3 h-4 w-4" />
                            {tab.label}
                        </Button>
                    </Link>
                )
            })}
        </nav>
    )
}
