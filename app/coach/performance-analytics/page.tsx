"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import PerformanceAnalyticsTab from "@/components/coach/PerformanceAnalyticsTab"

export default function PerformanceAnalyticsPage() {
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadTeamMembers()
    }, [])

    const loadTeamMembers = async () => {
        try {
            const response = await api.getTeamMembers()
            if (response.success) {
                const formattedMembers = response.teamMembers.map((member: any) => ({
                    id: member._id,
                    name: member.name,
                    email: member.email,
                    role: "Sales Rep",
                    score: 0,
                    status: member.isEmailVerified ? "Active" : "Pending"
                }))
                setTeamMembers(formattedMembers)
            }
        } catch (error) {
            console.error('Failed to load team members:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg border">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="bg-white p-6 rounded-lg border">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-6" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <PerformanceAnalyticsTab teamMembers={teamMembers} />
    )
}
