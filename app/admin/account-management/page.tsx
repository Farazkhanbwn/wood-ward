"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Activity,
    Calendar,
    ChevronDown,
    Edit,
    Eye,
    Mail,
    Plus,
    Search,
    User,
    Users
} from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { UserRowSkeleton } from "@/components/ui/loading-skeletons"
import { useState, useEffect } from "react"
import { useConfirmationContext } from "@/components/admin/confirmation-provider"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users"
import { useCompanies } from "@/hooks/use-companies"
import { toast } from "sonner"

interface AdminUser {
    id: string
    name: string
    email: string
    role: "User" | "Admin" | "Super Admin" | "Coach" | "Sales"
    status: "Active" | "Inactive" | "Pending"
    plan?: "Free" | "Pro" | "Enterprise"
    lastActivity?: string
    companyName?: string
}

interface NewAccountForm {
    fullName: string
    email: string
    userType: "company" | "individual"
    companyId?: string
    role: "User" | "Admin" | "Coach/Team Lead"
    status: "Active" | "Trial" | "Free"
}

interface Company {
    id: string
    name: string
}

interface EditUserForm {
    fullName: string
    email: string
    role: "User" | "Admin" | "Super Admin" | "Coach" | "Sales"
    status: "Active" | "Inactive" | "Pending"
}

const mockUsers: AdminUser[] = [
    {
        id: "1",
        name: "John Smith",
        email: "john@company.com",
        role: "Admin",
        status: "Active",
        plan: "Pro",
        lastActivity: "2 hours ago",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@startup.io",
        role: "User",
        status: "Active",
        plan: "Free",
        lastActivity: "1 day ago",
    },
    {
        id: "3",
        name: "Mike Chen",
        email: "mike@enterprise.com",
        role: "User",
        status: "Pending",
        plan: "Enterprise",
        lastActivity: "3 days ago",
    },
    {
        id: "4",
        name: "Lisa Rodriguez",
        email: "lisa@agency.com",
        role: "Admin",
        status: "Active",
        plan: "Pro",
        lastActivity: "5 hours ago",
    },
    {
        id: "5",
        name: "David Wilson",
        email: "david@freelance.com",
        role: "User",
        status: "Inactive",
        plan: "Free",
        lastActivity: "1 week ago",
    },
]

export default function AccountManagementPage() {
    const { confirmDelete, confirmAction, showConfirmation } = useConfirmationContext()
    const { data: usersData, isLoading } = useUsers()
    const { data: companiesData } = useCompanies()
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()
    
    const users = usersData?.users?.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'coach' ? 'Coach' : u.role === 'sales' ? 'Sales' : 'User',
        status: u.subscription?.status || 'Pending',
        plan: u.subscription?.plan,
        lastActivity: 'N/A',
        companyName: u.companyName || null
    })) || []
    
    const companies = companiesData?.companies?.map((c: any) => ({
        id: c.id,
        name: c.name
    })) || []
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newAccountForm, setNewAccountForm] = useState<NewAccountForm>({
        fullName: "",
        email: "",
        userType: "company",
        companyId: "",
        role: "User",
        status: "Active",
    })
    const [formErrors, setFormErrors] = useState<Partial<NewAccountForm>>({})

    const [showEditModal, setShowEditModal] = useState(false)
    const [editingUserId, setEditingUserId] = useState<string | null>(null)
    const [editUserForm, setEditUserForm] = useState<EditUserForm>({
        fullName: "",
        email: "",
        role: "User",
        status: "Active",
    })
    const [editFormErrors, setEditFormErrors] = useState<Partial<EditUserForm>>({})

    const [showViewModal, setShowViewModal] = useState(false)
    const [viewingUserId, setViewingUserId] = useState<string | null>(null)

    const [showActivityModal, setShowActivityModal] = useState(false)
    const [activityUserId, setActivityUserId] = useState<string | null>(null)

    // Search & Pagination state
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4



    const handleCreateAccount = () => {
        console.log("[v0] Opening create account modal...")
        setShowCreateModal(true)
        setNewAccountForm({
            fullName: "",
            email: "",
            userType: "company",
            companyId: "",
            role: "User",
            status: "Active",
        })
        setFormErrors({})
    }

    const validateForm = (): boolean => {
        const errors: Partial<NewAccountForm> = {}

        if (!newAccountForm.fullName.trim()) {
            errors.fullName = "Full name is required"
        }

        if (!newAccountForm.email.trim()) {
            errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAccountForm.email)) {
            errors.email = "Please enter a valid email address"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleCreateAccountSubmit = async () => {
        if (!validateForm()) return
        
        createUser.mutate({
            name: newAccountForm.fullName,
            email: newAccountForm.email,
            userType: newAccountForm.userType,
            companyId: newAccountForm.companyId,
            role: newAccountForm.role,
            status: newAccountForm.status
        }, {
            onSuccess: () => setShowCreateModal(false)
        })
    }

    const closeCreateAccountModal = () => {
        console.log("[v0] Closing create account modal...")
        setShowCreateModal(false)
        setFormErrors({})
    }

    const updateFormField = (field: keyof NewAccountForm, value: string) => {
        setNewAccountForm((prev) => ({ ...prev, [field]: value }))
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const handleViewDashboard = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)
        console.log(`[v0] Viewing dashboard for user ${userId}`)

        setViewingUserId(userId)
        setShowViewModal(true)
    }

    const closeViewUserModal = () => {
        console.log("[v0] Closing view user modal...")
        setShowViewModal(false)
        setViewingUserId(null)
    }

    const handleEditUser = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)
        if (!user) return

        console.log(`[v0] Opening edit modal for user ${userId}`)

        setEditingUserId(userId)
        setEditUserForm({
            fullName: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        })
        setEditFormErrors({})
        setShowEditModal(true)
    }

    const validateEditForm = (): boolean => {
        const errors: Partial<EditUserForm> = {}

        if (!editUserForm.fullName.trim()) {
            errors.fullName = "Full name is required"
        }

        if (!editUserForm.email.trim()) {
            errors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUserForm.email)) {
            errors.email = "Please enter a valid email address"
        }

        setEditFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleEditUserSubmit = async () => {
        if (!validateEditForm() || !editingUserId) return
        
        updateUser.mutate({
            userId: editingUserId,
            data: {
                name: editUserForm.fullName,
                email: editUserForm.email,
                role: editUserForm.role,
                status: editUserForm.status
            }
        }, {
            onSuccess: () => {
                setShowEditModal(false)
                toast.success(`${editUserForm.fullName}'s account has been updated successfully`)
            }
        })
    }

    const handleDeleteUserConfirmed = (userId: string) => {
        deleteUser.mutate(userId)
    }



    const closeEditUserModal = () => {
        console.log("[v0] Closing edit user modal...")
        setShowEditModal(false)
        setEditFormErrors({})
        setEditingUserId(null)
    }

    const updateEditFormField = (field: keyof EditUserForm, value: string) => {
        setEditUserForm((prev) => ({ ...prev, [field]: value }))
        if (editFormErrors[field]) {
            setEditFormErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const handleDeleteUser = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)
        console.log(`[v0] Attempting to delete user ${userId}`)

        confirmDelete(user?.name || "this user", () => handleDeleteUserConfirmed(userId))
    }

    const handleSuspendUser = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)

        confirmAction(
            "Suspend Account",
            `Are you sure you want to suspend ${user?.name}'s account?\n\nThis will:\n• Block user access immediately\n• Preserve all user data\n• Send suspension notification email\n• Require admin approval to reactivate`,
            () => {
                updateUser.mutate({
                    userId,
                    data: {
                        name: user!.name,
                        email: user!.email,
                        role: user!.role,
                        status: 'Inactive'
                    }
                }, {
                    onSuccess: () => {
                        toast.success(`${user?.name}'s account has been suspended. Suspension email sent to ${user?.email}`)
                    }
                })
            },
            "danger"
        )
    }

    const handleActivateUser = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)

        confirmAction(
            "Activate Account",
            `Are you sure you want to activate ${user?.name}'s account?\n\nThis will:\n• Restore user access immediately\n• Send activation notification email\n• Allow user to login and use the platform`,
            () => {
                updateUser.mutate({
                    userId,
                    data: {
                        name: user!.name,
                        email: user!.email,
                        role: user!.role,
                        status: 'Active'
                    }
                }, {
                    onSuccess: () => {
                        toast.success(`${user?.name}'s account has been activated. Activation email sent to ${user?.email}`)
                    }
                })
            },
            "success"
        )
    }

    const handleViewActivity = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)
        console.log(`[v0] Viewing activity for user ${userId}`)

        setActivityUserId(userId)
        setShowActivityModal(true)
    }

    const closeActivityModal = () => {
        console.log("[v0] Closing activity modal...")
        setShowActivityModal(false)
        setActivityUserId(null)
    }

    const getActivityUser = () => {
        return users.find((u: AdminUser) => u.id === activityUserId)
    }

    const handleResetPassword = (userId: string) => {
        const user = users.find((u: AdminUser) => u.id === userId)

        confirmAction(
            "Reset Password",
            `Reset password for ${user?.name}?`,
            () => {
                toast.success(`Password reset email sent to ${user?.email}`)
            },
            "danger"
        )
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            Active: "bg-green-500/20 text-green-400 border-green-500/30",
            Inactive: "bg-red-500/20 text-red-400 border-red-500/30",
            Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            Trial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            "New User": "bg-blue-500/20 text-blue-400 border-blue-500/30",
        }
        return variants[status as keyof typeof variants] || variants.Pending
    }

    const getViewingUser = () => {
        return users.find((u: AdminUser) => u.id === viewingUserId)
    }

    // Search & Pagination logic
    const filteredUsers = users.filter((user: AdminUser) => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.companyName && user.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    const goToPage = (page: number) => {
        setCurrentPage(page)
    }

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1))
    }

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    // Reset to page 1 when users or search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [users.length, searchQuery])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Account Management</h2>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                    <Button onClick={handleCreateAccount} className="gap-2 w-full sm:w-auto" disabled={createUser.isPending}>
                        <Plus className={`h-4 w-4 ${createUser.isPending ? "animate-spin" : ""}`} />
                        {createUser.isPending ? "Creating..." : "Create New Account"}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-md">User Accounts</CardTitle>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <UserRowSkeleton key={index} />
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                                    </TableCell>
                                </TableRow>
                            ) : paginatedUsers.map((user: AdminUser) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`/.jpg?height=32&width=32&query=${user.name}`} />
                                                <AvatarFallback>
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
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
                                        <div className="font-medium">
                                            {user.companyName || 'Individual'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="z-50">
                                                    <DropdownMenuItem onClick={() => handleEditUser(user.id)}>Edit User</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewActivity(user.id)}>
                                                        View Activity
                                                    </DropdownMenuItem>
                                                    {user.status === "Inactive" ? (
                                                        <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                                                            Activate Account
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                                            Suspend Account
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

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

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Account</DialogTitle>
                        <DialogDescription>Fill in user details to create a new account</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="Enter full name"
                                value={newAccountForm.fullName}
                                onChange={(e) => updateFormField("fullName", e.target.value)}
                                className={formErrors.fullName ? "border-red-500" : ""}
                            />
                            {formErrors.fullName && <p className="text-sm text-red-500">{formErrors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={newAccountForm.email}
                                onChange={(e) => updateFormField("email", e.target.value)}
                                className={formErrors.email ? "border-red-500" : ""}
                            />
                            {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="userType">User Type</Label>
                            <Select value={newAccountForm.userType} onValueChange={(value: "company" | "individual") => updateFormField("userType", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="company">Company User</SelectItem>
                                    <SelectItem value="individual">Individual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newAccountForm.userType === "company" && (
                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Select value={newAccountForm.companyId} onValueChange={(value) => updateFormField("companyId", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company: Company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={newAccountForm.role} onValueChange={(value) => updateFormField("role", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="User">User</SelectItem>
                                    {newAccountForm.userType === "individual" && (
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    )}
                                    <SelectItem value="Coach/Team Lead">Coach/Team Lead</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={newAccountForm.status} onValueChange={(value) => updateFormField("status", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Trial">Trial</SelectItem>
                                    <SelectItem value="Free">Free</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeCreateAccountModal} disabled={createUser.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateAccountSubmit} disabled={createUser.isPending}>
                            {createUser.isPending ? (
                                <>
                                    <Plus className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Account
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information and settings</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editFullName">Full Name</Label>
                            <Input
                                id="editFullName"
                                placeholder="Enter full name"
                                value={editUserForm.fullName}
                                onChange={(e) => updateEditFormField("fullName", e.target.value)}
                                className={editFormErrors.fullName ? "border-red-500" : ""}
                            />
                            {editFormErrors.fullName && <p className="text-sm text-red-500">{editFormErrors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editEmail">Email</Label>
                            <Input
                                id="editEmail"
                                type="email"
                                placeholder="Enter email address"
                                value={editUserForm.email}
                                onChange={(e) => updateEditFormField("email", e.target.value)}
                                className={editFormErrors.email ? "border-red-500" : ""}
                            />
                            {editFormErrors.email && <p className="text-sm text-red-500">{editFormErrors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editRole">Role</Label>
                            <Select value={editUserForm.role} onValueChange={(value) => updateEditFormField("role", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Coach">Coach</SelectItem>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editStatus">Status</Label>
                            <Select value={editUserForm.status} onValueChange={(value) => updateEditFormField("status", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Trial">Trial</SelectItem>
                                    <SelectItem value="Free">Free</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeEditUserModal} disabled={updateUser.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditUserSubmit} disabled={updateUser.isPending}>
                            {updateUser.isPending ? (
                                <>
                                    <Edit className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Update User
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>Complete information about the selected user</DialogDescription>
                    </DialogHeader>

                    {viewingUserId &&
                        (() => {
                            const user = getViewingUser()
                            if (!user) return null

                            return (
                                <div className="space-y-6 py-4">
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={`/.jpg?height=64&width=64&query=${user.name}`} />
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
                                                <Badge variant="outline">{user.role}</Badge>
                                                <Badge className={getStatusBadge(user.status)}>{user.status}</Badge>
                                                {user.plan && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{user.plan}</Badge>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">User ID</p>
                                                    <p className="text-sm text-muted-foreground">{user.id}</p>
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
                                                    <p className="text-sm text-muted-foreground">{user.lastActivity || "Never"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">Account Created</p>
                                                    <p className="text-sm text-muted-foreground">Jan 15, 2024</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">24</p>
                                            <p className="text-sm text-muted-foreground">Total Logins</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">12</p>
                                            <p className="text-sm text-muted-foreground">Projects</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">8.5h</p>
                                            <p className="text-sm text-muted-foreground">Time Spent</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-2 pt-4 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                closeViewUserModal()
                                                handleEditUser(user.id)
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit User
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleResetPassword(user.id)}>
                                            Reset Password
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => showConfirmation({
                                            title: "Send Message",
                                            description: "Send message to user functionality would be implemented here.",
                                            type: "info",
                                            confirmText: "OK",
                                            onConfirm: () => { }
                                        })}>
                                            Send Message
                                        </Button>
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

            <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
                <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>User Activity Details</DialogTitle>
                        <DialogDescription>Comprehensive activity log and usage statistics</DialogDescription>
                    </DialogHeader>

                    {activityUserId &&
                        (() => {
                            const user = getActivityUser()
                            if (!user) return null

                            return (
                                <div className="space-y-4 py-2">
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={`/.jpg?height=48&width=48&query=${user.name}`} />
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
                                            <p className="text-sm text-muted-foreground">Last active: {user.lastActivity}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">47</p>
                                            <p className="text-sm text-muted-foreground">Total Sessions</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">23.5h</p>
                                            <p className="text-sm text-muted-foreground">Time Spent</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">156</p>
                                            <p className="text-sm text-muted-foreground">Actions</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-2xl font-bold text-primary">12</p>
                                            <p className="text-sm text-muted-foreground">Projects</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Recent Login History</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex justify-between items-center p-2 border rounded">
                                                    <div>
                                                        <p className="text-sm font-medium">Today at 2:30 PM</p>
                                                        <p className="text-xs text-muted-foreground">Chrome on Windows 11</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        Active
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 border rounded">
                                                    <div>
                                                        <p className="text-sm font-medium">Yesterday at 9:15 AM</p>
                                                        <p className="text-xs text-muted-foreground">Safari on macOS</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        Ended
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 border rounded">
                                                    <div>
                                                        <p className="text-sm font-medium">Dec 20 at 4:45 PM</p>
                                                        <p className="text-xs text-muted-foreground">Mobile app on iOS</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        Ended
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center p-2 border rounded">
                                                    <div>
                                                        <p className="text-sm font-medium">Dec 19 at 11:20 AM</p>
                                                        <p className="text-xs text-muted-foreground">Chrome on Windows 11</p>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        Ended
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Recent Actions</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex items-center gap-3 p-2 border rounded">
                                                    <Activity className="h-4 w-4 text-blue-500" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Created new project</p>
                                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 border rounded">
                                                    <Edit className="h-4 w-4 text-green-500" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Updated profile settings</p>
                                                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 border rounded">
                                                    <Eye className="h-4 w-4 text-purple-500" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Downloaded 3 reports</p>
                                                        <p className="text-xs text-muted-foreground">1 day ago</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 border rounded">
                                                    <Users className="h-4 w-4 text-orange-500" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Shared 2 documents</p>
                                                        <p className="text-xs text-muted-foreground">2 days ago</p>
                                                    </div>
                                                </div>
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
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p>• Device: Chrome on Windows 11</p>
                                                        <p>• IP Address: 192.168.1.100</p>
                                                        <p>• Location: New York, USA</p>
                                                        <p>• Session Duration: 2h 15m</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium">Security Status</p>
                                                    <div className="text-sm text-muted-foreground space-y-1">
                                                        <p>• Two-Factor Auth: ✅ Enabled</p>
                                                        <p>• Password Last Changed: 30 days ago</p>
                                                        <p>• Suspicious Activity: ❌ None detected</p>
                                                        <p>• Account Status: ✅ Secure</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })()}

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" onClick={() => showConfirmation({
                            title: "Export Report",
                            description: "Exporting activity report... This would generate and download the report.",
                            type: "info",
                            confirmText: "OK",
                            onConfirm: () => { }
                        })}>
                            Export Report
                        </Button>
                        <Button variant="outline" onClick={closeActivityModal}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
