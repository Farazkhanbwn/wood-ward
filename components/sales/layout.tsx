"use client"

import { useState } from "react"
import { SidebarNavigation } from "@/components/sales/sidebar-navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { DialogProvider } from "@/hooks"
import { SubscriptionStatusBanner } from "@/components/subscription-status-banner"

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <DialogProvider>
        <div className="flex flex-col h-screen bg-background">
            <SubscriptionStatusBanner />
        <div className="flex flex-1 bg-background relative no-layout-shift">
            {/* Mobile Header - Always visible on mobile */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2"
                >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <h1 className="text-lg font-semibold text-gray-900">Sales Training</h1>
                <div className="w-9" /> {/* Spacer for centering */}
            </div>

            {/* Sidebar - Responsive positioning using Tailwind classes */}
            <div className={`fixed lg:static inset-y-0 left-0 z-60 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <SidebarNavigation onCloseSidebar={() => setSidebarOpen(false)} />
            </div>

            {/* Mobile Overlay - Only visible on mobile when sidebar is open */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-55 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Main Content - Responsive padding using Tailwind classes */}
            <main className="flex-1 overflow-auto pt-16 lg:pt-0 no-layout-shift">
                <div className="min-h-full smooth-transition">{children}</div>
            </main>
        </div>
        </div>
        </DialogProvider>
    )
}
