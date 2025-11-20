"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Eye } from "lucide-react"
import { PracticeSessionSkeleton } from "@/components/ui/loading-skeletons"
import { Pagination } from "@/components/ui/pagination"
import FilterHistoryModal from "@/components/coach/FilterHistoryModal"
import FullFeedbackModal from "@/components/coach/FullFeedbackModal"

interface PracticeSession {
    id: number
    member: string
    date: string
    score: number
    scenario: string
    feedback: string
}

interface FilterData {
    dateFrom: string
    dateTo: string
    member: string
    scenario: string
    minScore: string
    maxScore: string
    includeInactive: boolean
}

interface PracticeHistoryTabProps {
    practiceHistory: PracticeSession[]
    onApplyFilter: (filters: FilterData) => void
    isLoading?: boolean
    teamMembers?: any[]
    pagination?: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
    }
    onPageChange?: (page: number) => void
}

export default function PracticeHistoryTab({
    practiceHistory,
    onApplyFilter,
    isLoading = false,
    teamMembers = [],
    pagination,
    onPageChange
}: PracticeHistoryTabProps) {
    const [showFilterHistoryModal, setShowFilterHistoryModal] = useState(false)
    const [showFullFeedbackModal, setShowFullFeedbackModal] = useState(false)
    const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null)

    const applyHistoryFilter = () => {
        setShowFilterHistoryModal(true)
    }

    const viewFullFeedback = (sessionId: number) => {
        const session = practiceHistory.find((s) => s.id === sessionId)
        if (session) {
            setSelectedSession(session)
            setShowFullFeedbackModal(true)
        }
    }

    const handleApplyFilter = (filters: FilterData) => {
        onApplyFilter(filters)
        setShowFilterHistoryModal(false)
    }

    return (
        <>   <FilterHistoryModal
            isOpen={showFilterHistoryModal}
            onClose={() => setShowFilterHistoryModal(false)}
            onApplyFilter={handleApplyFilter}
            teamMembers={teamMembers}
        />

            <FullFeedbackModal
                isOpen={showFullFeedbackModal}
                onClose={() => setShowFullFeedbackModal(false)}
                session={selectedSession}
            />
            <div className="space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300">
                {/* Header - Responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Practice History</h2>
                    <Button
                        variant="outline"
                        onClick={applyHistoryFilter}
                        className="transition-colors bg-transparent w-full sm:w-auto"
                        style={{ borderColor: "#284EA7", color: "#284EA7" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#284EA7"
                            e.currentTarget.style.color = "white"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent"
                            e.currentTarget.style.color = "#284EA7"
                        }}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {/* Practice History Cards - Responsive grid */}
                <div className="space-y-3 sm:space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <PracticeSessionSkeleton key={i} />
                            ))}
                        </div>
                    ) : practiceHistory.length === 0 ? (
                        <Card className="bg-white border-gray-200">
                            <CardContent className="p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <Filter className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practice Sessions Found</h3>
                                <p className="text-sm text-gray-600 mb-4">Your team members haven't completed any call simulations yet.</p>
                                <p className="text-xs text-gray-500">Sessions will appear here once team members complete their practice calls.</p>
                            </CardContent>
                        </Card>
                    ) : practiceHistory.map((session) => (
                        <Card
                            key={session.id}
                            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white border-gray-200"
                        >
                            <CardContent className="p-4 sm:p-6">
                                {/* Mobile Layout - Stacked */}
                                <div className="flex flex-col space-y-4 sm:hidden">
                                    {/* Top row - Member and Score */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 text-base">{session.member}</h3>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{session.score}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                    </div>

                                    {/* Middle row - Scenario and Date */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 w-fit">
                                            {session.scenario}
                                        </Badge>
                                        <span className="text-sm text-gray-500">{session.date}</span>
                                    </div>

                                    {/* Feedback */}
                                    <p className="text-sm text-gray-600 leading-relaxed">{session.feedback}</p>

                                    {/* Action Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewFullFeedback(session.id)}
                                        className="transition-colors w-full"
                                        style={{ borderColor: "#284EA7", color: "#284EA7" }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#284EA7"
                                            e.currentTarget.style.color = "white"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "transparent"
                                            e.currentTarget.style.color = "#284EA7"
                                        }}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Full Feedback
                                    </Button>
                                </div>

                                {/* Desktop Layout - Horizontal */}
                                <div className="hidden sm:flex items-center justify-between">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center space-x-4 flex-wrap gap-2">
                                            <h3 className="font-semibold text-gray-900">{session.member}</h3>
                                            <Badge variant="outline" className="border-blue-200 text-blue-700 shrink-0">
                                                {session.scenario}
                                            </Badge>
                                            <span className="text-sm text-gray-500 shrink-0">{session.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 pr-4">{session.feedback}</p>
                                    </div>

                                    <div className="flex space-x-2 shrink-0">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-900">{session.score}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => viewFullFeedback(session.id)}
                                            className="transition-colors"
                                            style={{ borderColor: "#284EA7", color: "#284EA7" }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "#284EA7"
                                                e.currentTarget.style.color = "white"
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent"
                                                e.currentTarget.style.color = "#284EA7"
                                            }}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Full Feedback
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && onPageChange && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                        totalItems={pagination.totalItems}
                        itemsPerPage={pagination.itemsPerPage}
                    />
                )}
            </div>
        </>
    )
}
