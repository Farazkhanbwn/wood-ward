"use client"

import { PlaybooksTab } from "@/components/sales/playbooks-tab"
import { useRouter } from "next/navigation"

export default function PlaybooksPage() {
    const router = useRouter()

    const handleNavigation = (tab: string) => {
        if (tab === "call-simulation") {
            router.push("/sales/call-simulation")
        }
    }

    return <PlaybooksTab onNavigate={handleNavigation} />
}
