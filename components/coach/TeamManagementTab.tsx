"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Plus, Eye, Trash2, Users, Search } from "lucide-react"
import AddNewRepModal from "@/components/coach/AddNewRepModal"
import MemberProfileModal from "@/components/coach/MemberProfileModal"

interface TeamMember {
    id: number
    name: string
    email: string
    role: string
    score: number
    status: string
}

interface RepData {
    name: string
    email: string
    phone: string
}

interface TeamManagementTabProps {
    teamMembers: TeamMember[]
    onAddNewRep: (repData: RepData) => void
    onRemoveRep: (memberId: number) => void
}

export default function TeamManagementTab({
    teamMembers,
    onAddNewRep,
    onRemoveRep
}: TeamManagementTabProps) {
    const [showAddRepModal, setShowAddRepModal] = useState(false)
    const [showMemberProfileModal, setShowMemberProfileModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4

    const addNewRep = () => {
        setShowAddRepModal(true)
    }

    const viewMemberProfile = (memberId: number) => {
        const member = teamMembers.find((m) => m.id === memberId)
        if (member) {
            setSelectedMember(member)
            setShowMemberProfileModal(true)
        }
    }

    const handleAddNewRep = (repData: RepData) => {
        onAddNewRep(repData)
        setShowAddRepModal(false)
    }

    // Search & Pagination logic
    const filteredMembers = teamMembers.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [teamMembers.length, searchQuery])

    return (
        <>
            <AddNewRepModal
                isOpen={showAddRepModal}
                onClose={() => setShowAddRepModal(false)}
                onSave={handleAddNewRep}
            />

            <MemberProfileModal
                isOpen={showMemberProfileModal}
                onClose={() => setShowMemberProfileModal(false)}
                member={selectedMember}
            />
            <div className="space-y-6 animate-in fade-in-50 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team Management</h2>
                    <Button
                        onClick={addNewRep}
                        className="transition-transform hover:scale-105 w-full sm:w-auto"
                        style={{ backgroundColor: "#284EA7", color: "white" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#1e3a8a"
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#284EA7"
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Rep
                    </Button>
                </div>

                <Card className="bg-white border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-md">Team Members</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            Showing {filteredMembers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Search Bar */}
                        <div className="relative mb-4 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search team members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>

                        {teamMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-12">
                                <div className="rounded-full bg-blue-50 p-6 mb-4">
                                    <Users className="h-12 w-12 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                                <p className="text-gray-600 max-w-sm">
                                    Start building your sales team by adding your first rep. They'll receive an invitation to join.
                                </p>
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No team members found matching "{searchQuery}"</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {paginatedMembers.map((member) => (
                        <Card
                            key={member.id}
                            className="transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white border-gray-200"
                        >
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col space-y-4 sm:hidden">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-12 w-12 shrink-0">
                                            <AvatarImage
                                                src={`/abstract-geometric-shapes.png?height=48&width=48&query=${member.name} avatar`}
                                            />
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {member.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                                            <p className="text-sm text-gray-600 truncate">{member.email}</p>
                                            <p className="text-sm text-gray-600 truncate">{member.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-gray-900">{member.score}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                        <Badge
                                            variant={member.status === "Active" ? "default" : "secondary"}
                                            className={
                                                member.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                            }
                                        >
                                            {member.status}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => viewMemberProfile(member.id)}
                                            className="transition-colors flex-1 sm:flex-none"
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
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onRemoveRep(member.id)}
                                            className="transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex-1 sm:flex-none"
                                            style={{ borderColor: "#dc2626", color: "#dc2626" }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>

                                <div className="hidden sm:flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <Avatar className="h-12 w-12 shrink-0">
                                            <AvatarImage
                                                src={`/abstract-geometric-shapes.png?height=48&width=48&query=${member.name} avatar`}
                                            />
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {member.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                                            <p className="text-sm text-gray-600 truncate">{member.email}</p>
                                            <p className="text-sm text-gray-600 truncate">{member.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 shrink-0">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">{member.score}</div>
                                            <div className="text-xs text-gray-500">Score</div>
                                        </div>
                                        <Badge
                                            variant={member.status === "Active" ? "default" : "secondary"}
                                            className={
                                                member.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                            }
                                        >
                                            {member.status}
                                        </Badge>
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => viewMemberProfile(member.id)}
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
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRemoveRep(member.id)}
                                                className="transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                                style={{ borderColor: "#dc2626", color: "#dc2626" }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredMembers.length > itemsPerPage && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredMembers.length}
                                itemsPerPage={itemsPerPage}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
