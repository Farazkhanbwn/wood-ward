"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mic2 } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

export function Navigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.verifyAuth()
      if (response.user) {
        setIsLoggedIn(true)
        setUserRole(response.user.role)
      }
    } catch (error) {
      // User not logged in
    }
  }

  const handleDashboardClick = () => {
    const dashboardRoutes: Record<string, string> = {
      admin: '/admin/company-management',
      coach: '/coach/team-management',
      sales: '/sales'
    }
    router.push(dashboardRoutes[userRole] || '/sales')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg animate-slide-down">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="">
              <img
                src="/images/wood-ward-logo.png"
                alt="Woodward Strategies"
                className="h-16 w-auto mt-2"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button onClick={handleDashboardClick} className="bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="border-gray-300 text-gray-900 hover:bg-gray-50 bg-transparent">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-[#1E63F3] hover:bg-[#1E63F3]/90 text-white">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
