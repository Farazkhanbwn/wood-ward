"use client"

import { useConfirmationContext } from "@/components/admin/confirmation-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Activity,
    Calendar,
    ChevronDown,
    Edit,
    Eye,
    FileDown,
    FilePlus,
    Mail,
    Phone,
    Search,
    User,
    Users
} from "lucide-react"
import { UserRowSkeleton } from "@/components/ui/loading-skeletons"
import { useState, useEffect } from "react"
import { useUsers } from "@/hooks/use-users"
import { useSessions } from "@/hooks/use-sessions"
import { useUserActivities } from "@/hooks/use-user-activities"
import { formatDistanceToNow, format } from "date-fns"

interface AdminUser {
    _id: string
    name: string
    email: string
    role: string
    subscription?: {
        plan: string
        status: string
    }
    lastLoginAt?: string
    loginCount?: number
    passwordChangedAt?: string
    createdAt: string
}

export default function TeamUserOversightPage() {
    const { showConfirmation } = useConfirmationContext()
    const { data: usersData, isLoading } = useUsers()
    const [showViewModal, setShowViewModal] = useState(false)
    const [viewingUserId, setViewingUserId] = useState<string | null>(null)
    const [showActivityModal, setShowActivityModal] = useState(false)
    const [activityUserId, setActivityUserId] = useState<string | null>(null)

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4

    const users = usersData?.users || []

    const handleViewDashboard = (userId: string) => {
        setViewingUserId(userId)
        setShowViewModal(true)
    }

    const closeViewUserModal = () => {
        setShowViewModal(false)
    }

    const handleViewModalChange = (open: boolean) => {
        setShowViewModal(open)
        if (!open) {
            setTimeout(() => setViewingUserId(null), 300)
        }
    }

    const handleViewActivity = (userId: string) => {
        setActivityUserId(userId)
        setShowActivityModal(true)
    }

    const { data: sessionsData } = useSessions(activityUserId || '')
    const { activities, isLoading: activitiesLoading } = useUserActivities(activityUserId || '')

    const closeActivityModal = () => {
        setShowActivityModal(false)
    }

    const handleActivityModalChange = (open: boolean) => {
        setShowActivityModal(open)
        if (!open) {
            setTimeout(() => setActivityUserId(null), 300)
        }
    }

    const getActivityUser = () => {
        return users.find((u: AdminUser) => u._id === activityUserId)
    }

    // Search & Pagination logic
    const filteredUsers = users.filter((user: AdminUser) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [users.length, searchQuery])

    const getStatusBadge = (status: string) => {
        const variants = {
            Active: "bg-green-500/20 text-green-400 border-green-500/30",
            Inactive: "bg-red-500/20 text-red-400 border-red-500/30",
            Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            Trial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        }
        return variants[status as keyof typeof variants] || variants.Pending
    }

    const getViewingUser = () => {
        return users.find((u: AdminUser) => u._id === viewingUserId)
    }

    const formatRole = (role: string) => {
        if (role === 'coach') return 'Coach'
        if (role === 'sales') return 'User'
        if (role === 'admin') return 'Admin'
        return role
    }

    const getRoleBadgeClass = (role: string) => {
        if (role === 'coach') return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        if (role === 'sales') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        if (role === 'admin') return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        return ''
    }

    const getLastActivity = (lastLoginAt?: string, createdAt?: string) => {
        const dateToUse = lastLoginAt || createdAt
        if (!dateToUse) return 'N/A'
        try {
            return formatDistanceToNow(new Date(dateToUse), { addSuffix: true })
        } catch {
            return 'N/A'
        }
    }

    const exportToPDF = async () => {
        const user = getActivityUser()
        if (!user) return

        const { jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        let yPos = 20

        let totalMinutes = 0
        sessionsData?.sessions?.forEach((s: any) => {
            const start = new Date(s.loginTime).getTime()
            const end = s.logoutTime ? new Date(s.logoutTime).getTime() : (s.isActive ? Date.now() : start)
            totalMinutes += Math.floor((end - start) / 60000)
        })
        const hours = Math.floor(totalMinutes / 60)
        const mins = totalMinutes % 60
        const timeSpent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

        // Title
        doc.setFontSize(20)
        doc.text('User Activity Report', 20, yPos)
        yPos += 15

        // User Information
        doc.setFontSize(16)
        doc.text('User Information', 20, yPos)
        yPos += 10
        doc.setFontSize(10)
        doc.text(`Name: ${user.name}`, 20, yPos)
        yPos += 7
        doc.text(`Email: ${user.email}`, 20, yPos)
        yPos += 7
        doc.text(`Role: ${formatRole(user.role)}`, 20, yPos)
        yPos += 7
        doc.text(`Last Active: ${getLastActivity(user.lastLoginAt, user.createdAt)}`, 20, yPos)
        yPos += 15

        // Activity Statistics
        doc.setFontSize(16)
        doc.text('Activity Statistics', 20, yPos)
        yPos += 10
        doc.setFontSize(10)
        doc.text(`Total Logins: ${user.loginCount || 0}`, 20, yPos)
        yPos += 7
        doc.text(`Time Spent: ${timeSpent}`, 20, yPos)
        yPos += 15

        // Recent Actions
        doc.setFontSize(16)
        doc.text('Recent Actions', 20, yPos)
        yPos += 10
        doc.setFontSize(10)
        
        if (activities && activities.length > 0) {
            activities.forEach((activity: any) => {
                if (yPos > 270) { doc.addPage(); yPos = 20 }
                const text = `${activity.description} - ${formatDistanceToNow(activity.timestamp, { addSuffix: true })}`
                const lines = doc.splitTextToSize(text, 170)
                doc.text(lines, 20, yPos)
                yPos += lines.length * 5 + 3
            })
        } else {
            doc.text('No recent actions', 20, yPos)
        }
        yPos += 10

        // Recent Login History
        if (yPos > 250) { doc.addPage(); yPos = 20 }
        doc.setFontSize(16)
        doc.text('Recent Login History', 20, yPos)
        yPos += 10
        doc.setFontSize(10)
        
        if (sessionsData?.sessions && sessionsData.sessions.length > 0) {
            sessionsData.sessions.slice(0, 5).forEach((s: any) => {
                if (yPos > 270) { doc.addPage(); yPos = 20 }
                const start = new Date(s.loginTime).getTime()
                const end = s.logoutTime ? new Date(s.logoutTime).getTime() : (s.isActive ? Date.now() : start)
                const durationMins = Math.floor((end - start) / 60000)
                const h = Math.floor(durationMins / 60)
                const m = durationMins % 60
                const dur = h > 0 ? `${h}h ${m}m` : `${m}m`
                const text = `${format(new Date(s.loginTime), 'MMM d, h:mm a')} - ${s.browser} on ${s.os} (${dur}) [${s.isActive ? 'Active' : 'Ended'}]`
                const lines = doc.splitTextToSize(text, 170)
                doc.text(lines, 20, yPos)
                yPos += lines.length * 5 + 3
            })
        } else {
            doc.text('No login history available', 20, yPos)
        }

        // Footer
        if (yPos > 250) { doc.addPage(); yPos = 20 }
        yPos += 10
        doc.setFontSize(8)
        doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 20, yPos)

        doc.save(`${user.name.replace(/\s+/g, '_')}_Activity_Report.pdf`)
    }

    const exportToDOCX = async () => {
        const user = getActivityUser()
        if (!user) return

        const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx')
        const fileSaverModule = await import('file-saver')
        const saveAs = fileSaverModule.default || fileSaverModule.saveAs

        let totalMinutes = 0
        sessionsData?.sessions?.forEach((s: any) => {
            const start = new Date(s.loginTime).getTime()
            const end = s.logoutTime ? new Date(s.logoutTime).getTime() : (s.isActive ? Date.now() : start)
            totalMinutes += Math.floor((end - start) / 60000)
        })
        const hours = Math.floor(totalMinutes / 60)
        const mins = totalMinutes % 60
        const timeSpent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

        const children: any[] = [
            new Paragraph({
                text: 'User Activity Report',
                heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'User Information',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ text: `Name: ${user.name}` }),
            new Paragraph({ text: `Email: ${user.email}` }),
            new Paragraph({ text: `Role: ${formatRole(user.role)}` }),
            new Paragraph({ text: `Last Active: ${getLastActivity(user.lastLoginAt, user.createdAt)}` }),
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'Activity Statistics',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({ text: `Total Logins: ${user.loginCount || 0}` }),
            new Paragraph({ text: `Time Spent: ${timeSpent}` }),
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'Recent Actions',
                heading: HeadingLevel.HEADING_2,
            }),
        ]

        if (activities && activities.length > 0) {
            activities.forEach((activity: any) => {
                children.push(
                    new Paragraph({ text: `${activity.description} - ${formatDistanceToNow(activity.timestamp, { addSuffix: true })}` })
                )
            })
        } else {
            children.push(new Paragraph({ text: 'No recent actions' }))
        }

        children.push(
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'Recent Login History',
                heading: HeadingLevel.HEADING_2,
            })
        )

        if (sessionsData?.sessions && sessionsData.sessions.length > 0) {
            sessionsData.sessions.slice(0, 5).forEach((s: any) => {
                const start = new Date(s.loginTime).getTime()
                const end = s.logoutTime ? new Date(s.logoutTime).getTime() : (s.isActive ? Date.now() : start)
                const durationMins = Math.floor((end - start) / 60000)
                const h = Math.floor(durationMins / 60)
                const m = durationMins % 60
                const dur = h > 0 ? `${h}h ${m}m` : `${m}m`
                children.push(
                    new Paragraph({ text: `${format(new Date(s.loginTime), 'MMM d, h:mm a')} - ${s.browser} on ${s.os} (${dur}) [${s.isActive ? 'Active' : 'Ended'}]` })
                )
            })
        } else {
            children.push(new Paragraph({ text: 'No login history available' }))
        }

        children.push(
            new Paragraph({ text: '' }),
            new Paragraph({
                children: [new TextRun({ text: `Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, size: 16, color: '666666' })],
            })
        )

        const doc = new Document({
            sections: [{ children }],
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${user.name.replace(/\s+/g, '_')}_Activity_Report.docx`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Team & User Oversight</h2>
                    <p className="text-muted-foreground">Monitor team activity and manage user roles</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-md">Team Members</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>

                    {isLoading ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <UserRowSkeleton key={index} />
                                ))}
                            </TableBody>
                        </Table>
                    ) : filteredUsers.length === 0 && !searchQuery ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No users found
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.map((user: AdminUser) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {user.name
                                                            .split(" ")
                                                            .map((n: string) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getRoleBadgeClass(user.role)}>{formatRole(user.role)}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{getLastActivity(user.lastLoginAt, user.createdAt)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleViewDashboard(user._id)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View User Details
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleViewActivity(user._id)}>
                                                    Activity
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                    }

                    {/* Pagination */}
                    {filteredUsers.length > itemsPerPage && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </CardContent>
            </Card>

            <Dialog open={showViewModal} onOpenChange={handleViewModalChange}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>Complete information about the selected user</DialogDescription>
                    </DialogHeader>

                    {showViewModal && viewingUserId &&
                        (() => {
                            const user = getViewingUser()
                            if (!user) return null

                            return (
                                <div className="space-y-6 py-4">
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                        <Avatar className="h-12 w-12 md:h-16 md:w-16">
                                            <AvatarFallback className="text-lg">
                                                {user.name
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold">{user.name}</h3>
                                            <p className="text-muted-foreground">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className={getRoleBadgeClass(user.role)}>{formatRole(user.role)}</Badge>
                                                <Badge className={getStatusBadge(user.subscription?.status || 'Pending')}>{user.subscription?.status || 'Pending'}</Badge>
                                                {user.subscription?.plan && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{user.subscription.plan}</Badge>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">User ID</p>
                                                    <p className="text-sm text-muted-foreground">{user._id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Email</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Activity className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Last Activity</p>
                                                    <p className="text-sm text-muted-foreground">{getLastActivity(user.lastLoginAt, user.createdAt)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Account Created</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{user.loginCount || 0}</p>
                                            <p className="text-sm text-muted-foreground">Total Logins</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-muted-foreground">N/A</p>
                                            <p className="text-sm text-muted-foreground">Time Spent</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={closeViewUserModal}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showActivityModal} onOpenChange={handleActivityModalChange}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Activity Details</DialogTitle>
                        <DialogDescription>Comprehensive activity log and usage statistics</DialogDescription>
                    </DialogHeader>

                    {showActivityModal && activityUserId &&
                        (() => {
                            const user = getActivityUser()
                            if (!user) return null

                            return (
                                <div className="space-y-6 py-4">
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                        <Avatar className="h-12 w-12 md:h-16 md:w-16">
                                            <AvatarFallback>
                                                {user.name
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">{user.name}</h3>
                                            <p className="text-muted-foreground">{user.email}</p>
                                            <p className="text-sm text-muted-foreground">Last active: {getLastActivity(user.lastLoginAt, user.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">{user.loginCount || 0}</p>
                                            <p className="text-sm text-muted-foreground">Total Logins</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-muted-foreground">
                                                {(() => {
                                                    if (!sessionsData?.sessions) return 'N/A'
                                                    let totalMinutes = 0
                                                    sessionsData.sessions.forEach((s: any) => {
                                                        const start = new Date(s.loginTime).getTime()
                                                        const end = s.logoutTime ? new Date(s.logoutTime).getTime() : (s.isActive ? Date.now() : start)
                                                        totalMinutes += Math.floor((end - start) / 60000)
                                                    })
                                                    const hours = Math.floor(totalMinutes / 60)
                                                    const mins = totalMinutes % 60
                                                    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                                                })()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Time Spent</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Recent Login History</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                                                    sessionsData.sessions.slice(0, 5).map((session: any) => {
                                                        const start = new Date(session.loginTime).getTime()
                                                        const end = session.logoutTime ? new Date(session.logoutTime).getTime() : (session.isActive ? Date.now() : start)
                                                        const durationMins = Math.floor((end - start) / 60000)
                                                        const hours = Math.floor(durationMins / 60)
                                                        const mins = durationMins % 60
                                                        const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                                                        
                                                        return (
                                                            <div key={session._id} className="flex justify-between items-center p-2 border rounded">
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {format(new Date(session.loginTime), 'MMM d, h:mm a')}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {session.browser} on {session.os} • {duration}
                                                                    </p>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {session.isActive ? 'Active' : 'Ended'}
                                                                </Badge>
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-4">No login history available</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Recent Actions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {activities && activities.length > 0 ? (
                                                    activities.map((activity: any, index: number) => {
                                                        const IconComponent = activity.icon === 'phone' ? Phone : activity.icon === 'file-plus' ? FilePlus : Edit
                                                        const colorClass = activity.color === 'blue' ? 'text-blue-500' : activity.color === 'green' ? 'text-green-500' : 'text-purple-500'
                                                        
                                                        return (
                                                            <div key={index} className="flex items-center gap-3 p-2 border rounded">
                                                                <IconComponent className={`h-4 w-4 ${colorClass}`} />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">{activity.description}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    <p className="text-sm text-muted-foreground text-center py-4">No recent actions</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Device & Location Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">Current Session</p>
                                                    {(() => {
                                                        const activeSession = sessionsData?.sessions?.find((s: any) => s.isActive)
                                                        if (!activeSession) {
                                                            return <p className="text-sm text-muted-foreground">No active session</p>
                                                        }
                                                        const duration = Math.floor((Date.now() - new Date(activeSession.loginTime).getTime()) / 60000)
                                                        const hours = Math.floor(duration / 60)
                                                        const minutes = duration % 60
                                                        return (
                                                            <div className="text-sm text-muted-foreground space-y-1">
                                                                <p>• Device: {activeSession.browser} on {activeSession.os}</p>
                                                                <p>• IP Address: {activeSession.ipAddress || 'Unknown'}</p>
                                                                <p>• Session Duration: {hours > 0 ? `${hours}h ` : ''}{minutes}m</p>
                                                            </div>
                                                        )
                                                    })()}
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">Security Status</p>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p>• Password Last Changed: {user.passwordChangedAt ? formatDistanceToNow(new Date(user.passwordChangedAt), { addSuffix: true }) : 'Never'}</p>
                                                        <p>• Account Status: ✅ Secure</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })()}

                    <div className="flex justify-end gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Export Report
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={exportToPDF}>
                                    <FileDown className="w-4 h-4 mr-2" />
                                    PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={exportToDOCX}>
                                    <FileDown className="w-4 h-4 mr-2" />
                                    DOCX
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" onClick={closeActivityModal}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
