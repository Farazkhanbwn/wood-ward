"use client"

import { PlaybooksTab } from "@/components/sales/playbooks-tab"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"

interface PlaybookDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default function PlaybookDetailPage({ params }: PlaybookDetailPageProps) {
    const { id } = use(params)
    const router = useRouter()

    const handleNavigation = (tab: string) => {
        if (tab === "call-simulation") {
            router.push("/sales/call-simulation")
        }
    }

    // Load the specific playbook when the component mounts
    useEffect(() => {
        // This will trigger the playbook to be loaded in the PlaybooksTab component
        // The component will handle showing the generated view for the specific playbook
    }, [id])

    return <PlaybooksTab onNavigate={handleNavigation} initialPlaybookId={id} />
}
