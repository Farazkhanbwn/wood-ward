"use client"

import { useTeamMembers, useAddRep, useRemoveRep } from "@/hooks/use-team-members"
import TeamManagementTab from "@/components/coach/TeamManagementTab"

export default function TeamManagementPage() {
    const { data: teamMembers = [], isLoading } = useTeamMembers()
    const addRep = useAddRep()
    const removeRep = useRemoveRep()

    const formattedMembers = teamMembers.map((member: any) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        role: "Sales Rep",
        score: 0,
        status: member.isEmailVerified ? "Active" : "Pending"
    }))

    const handleAddNewRep = (repData: { name: string; email: string; phone: string }) => {
        addRep.mutate(repData)
    }

    const handleRemoveRep = (memberId: number) => {
        removeRep.mutate(memberId.toString())
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="p-6">
                        <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-4" />
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white p-4 border rounded">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mb-1" />
                                                <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                                            <div className="flex space-x-2">
                                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <TeamManagementTab
            teamMembers={formattedMembers}
            onAddNewRep={handleAddNewRep}
            onRemoveRep={handleRemoveRep}
        />
    )
}
