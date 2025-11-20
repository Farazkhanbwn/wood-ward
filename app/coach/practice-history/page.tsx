"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import PracticeHistoryTab from "@/components/coach/PracticeHistoryTab"
import { api } from "@/lib/api"

export default function PracticeHistoryPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: "",
        member: "",
        scenario: "",
        minScore: "",
        maxScore: "",
        includeInactive: false
    })

    const { data: sessionsData, isLoading } = useQuery({
        queryKey: ['teamSessions', filters, currentPage],
        queryFn: () => api.getTeamCallSessions({ ...filters, page: currentPage, limit: 4 })
    })

    const { data: teamMembersData } = useQuery({
        queryKey: ['teamMembers'],
        queryFn: () => api.getTeamMembers()
    })

    const practiceHistory = sessionsData?.sessions?.map((session: any) => ({
        id: session._id,
        member: session.userId?.name || 'Unknown',
        date: new Date(session.createdAt).toISOString().split('T')[0],
        score: session.feedback?.overallScore || 0,
        scenario: session.callType,
        feedback: session.feedback?.improvementPoints?.[0] || 'No feedback available',
        duration: session.duration || 0
    })) || []

    const handleApplyFilter = (newFilters: typeof filters) => {
        setFilters(newFilters)
        setCurrentPage(1) // Reset to page 1 on filter change
    }

    return (
        <PracticeHistoryTab
            practiceHistory={practiceHistory}
            onApplyFilter={handleApplyFilter}
            isLoading={isLoading}
            teamMembers={teamMembersData?.teamMembers || []}
            pagination={sessionsData?.pagination}
            onPageChange={setCurrentPage}
        />
    )
}
