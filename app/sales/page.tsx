"use client"

import { DashboardTab } from "@/components/sales/dashboard-tab"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function HomePage() {
  const router = useRouter()

  const handleNavigation = (tab: string, options?: { startPlaybookCreation?: boolean }) => {
    if (tab === "playbooks" && options?.startPlaybookCreation) {
      router.push("/sales/playbooks/new")
    } else if (tab === "playbooks") {
      router.push("/sales/playbooks")
    } else if (tab === "call-simulation") {
      router.push("/sales/call-simulation")
    } else if (tab === "my-scripts") {
      router.push("/sales/playbooks")
    }
  }

  return (
    <ProtectedRoute>
      <DashboardTab onNavigate={handleNavigation} />
    </ProtectedRoute>
  )
}
