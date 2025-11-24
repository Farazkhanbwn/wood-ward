"use client"

import { useState } from "react"
import PracticeHistoryTab from "@/components/coach/PracticeHistoryTab"
import { useTeamSessions } from "@/hooks/use-team-sessions"
import { useTeamMembers } from "@/hooks/use-team-members"

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

    const { data: sessionsData, isLoading } = useTeamSessions({ ...filters, page: currentPage, limit: 4 })
    const { data: teamMembersData } = useTeamMembers()

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
