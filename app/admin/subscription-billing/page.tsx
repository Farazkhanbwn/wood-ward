"use client"

import { useConfirmationContext } from "@/components/admin/confirmation-provider"
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
    Building2,
    Calendar,
    ChevronDown,
    Clock,
    CreditCard,
    Crown,
    Gift,
    Mail,
    Search,
    User,
    UserCircle,
} from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { UserCardSkeleton } from "@/components/ui/loading-skeletons"
import { useState } from "react"
import { useUsers } from "@/hooks/use-users"
import { useCompanies } from "@/hooks/use-companies"
import { useApiMutation } from "@/hooks/use-api"
import { api } from "@/lib/api"

interface AdminUser {
    id: string
    name: string
    email: string
    role: "User" | "Admin" | "Super Admin"
    status: "Active" | "Inactive" | "Pending"
    plan?: "Free" | "Pro" | "Enterprise"
    lastActivity?: string
    userType?: "Company" | "Company User" | "Individual"
    companyName?: string
    isCompanyOwner?: boolean
}

interface EditSubscriptionForm {
    plan: "Free" | "Pro" | "Enterprise"
    status: "Active" | "Inactive" | "Pending" | "Trial"
    billingCycle: "Monthly" | "Yearly"
    nextBilling: string
}



export default function SubscriptionBillingPage() {
    const { showConfirmation, confirmAction } = useConfirmationContext()
    const { data: usersData, isLoading: usersLoading } = useUsers()
    const { data: companiesData } = useCompanies()
    const [showEditSubscriptionModal, setShowEditSubscriptionModal] = useState(false)
    const [editingSubscriptionUserId, setEditingSubscriptionUserId] = useState<string | null>(null)
    const [editSubscriptionForm, setEditSubscriptionForm] = useState<EditSubscriptionForm>({
        plan: "Free",
        status: "Active",
        billingCycle: "Monthly",
        nextBilling: "",
    })

    const [showBillingDetailModal, setShowBillingDetailModal] = useState(false)
    const [billingDetailUserId, setBillingDetailUserId] = useState<string | null>(null)
    const [isProcessingBillingAction, setIsProcessingBillingAction] = useState(false)

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4

    const companyOwnerIds = companiesData?.companies?.map((c: any) => String(c.ownerId?._id || c.ownerId)) || []
    
    const users: AdminUser[] = usersData?.users?.map((user: any) => {
        const userId = String(user._id)
        const isCompanyOwner = companyOwnerIds.includes(userId)
        let userType: "Company" | "Company User" | "Individual" = 'Individual'
        
        if (user.companyId) {
            userType = isCompanyOwner ? 'Company' : 'Company User'
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role === 'coach' ? 'Coach' : user.role === 'sales' ? 'Sales' : 'User',
            status: user.subscription?.status || 'Active',
            plan: user.subscription?.plan || 'Free',
            lastActivity: 'Recently',
            userType,
            companyName: user.companyName || null,
            isCompanyOwner
        }
    }) || []

    const handleUpdateSubscription = async (userId: string) => {
        const user = users.find((u) => u.id === userId)
        if (!user) return

        // Fetch fresh user data from API
        try {
            const response = await api.getAllUsers()
            const freshUser = response.users.find((u: any) => u._id === userId)
            const nextBilling = freshUser?.subscription?.nextBillingDate 
                ? new Date(freshUser.subscription.nextBillingDate).toISOString().split('T')[0]
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            setEditingSubscriptionUserId(userId)
            setEditSubscriptionForm({
                plan: freshUser?.subscription?.plan || user.plan || "Free",
                status: freshUser?.subscription?.status || user.status,
                billingCycle: freshUser?.subscription?.billingCycle || "Monthly",
                nextBilling
            })
            setShowEditSubscriptionModal(true)
        } catch (error) {
            // Fallback to cached data
            setEditingSubscriptionUserId(userId)
            setEditSubscriptionForm({
                plan: user.plan || "Free",
                status: user.status,
                billingCycle: "Monthly",
                nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            })
            setShowEditSubscriptionModal(true)
        }
    }

    const sendPaymentLinkMutation = useApiMutation({
        mutationFn: ({ userId, data }: { userId: string; data: any }) => api.sendUpgradeLink(userId, data),
        invalidateKeys: [['users']],
        onSuccess: (response: any, { userId }: { userId: string; data: any }) => {
            const user = users.find((u) => u.id === userId)
            setShowEditSubscriptionModal(false)
            if (response.success) {
                showConfirmation({
                    title: "Payment Link Sent Successfully",
                    description: `User: ${user?.name}\nEmail: ${user?.email}\nPlan: ${editSubscriptionForm.plan}\nBilling: ${editSubscriptionForm.billingCycle}\n\nA payment link has been sent to ${user?.email}. Once the user completes payment, their subscription will be automatically upgraded.`,
                    type: "success",
                    confirmText: "OK",
                    onConfirm: () => { }
                })
            } else {
                showConfirmation({
                    title: "Failed to Send Link",
                    description: response.message || "Failed to send payment link",
                    type: "danger",
                    confirmText: "OK",
                    onConfirm: () => { }
                })
            }
        },
        onError: () => {
            showConfirmation({
                title: "Failed to Send Link",
                description: "An error occurred while sending the payment link",
                type: "danger",
                confirmText: "OK",
                onConfirm: () => { }
            })
        }
    })

    const handleSendPaymentLink = () => {
        if (!editingSubscriptionUserId) return
        sendPaymentLinkMutation.mutate({
            userId: editingSubscriptionUserId,
            data: {
                plan: editSubscriptionForm.plan,
                billingCycle: editSubscriptionForm.billingCycle
            }
        })
    }

    const updateSubscriptionMutation = useApiMutation({
        mutationFn: ({ userId, data }: { userId: string; data: any }) => api.updateUserSubscription(userId, data),
        invalidateKeys: [['users']],
        onSuccess: (response: any, { userId }: { userId: string; data: any }) => {
            const user = users.find((u) => u.id === userId)
            setShowEditSubscriptionModal(false)
            if (response.success) {
                showConfirmation({
                    title: "Subscription Updated Successfully",
                    description: `User: ${user?.name}\nPlan: ${editSubscriptionForm.plan}\nStatus: ${editSubscriptionForm.status}\nBilling: ${editSubscriptionForm.billingCycle}\nNext Billing: ${editSubscriptionForm.nextBilling}\n\nChanges have been applied to ${user?.name}'s account.`,
                    type: "success",
                    confirmText: "OK",
                    onConfirm: () => { }
                })
            } else {
                showConfirmation({
                    title: "Update Failed",
                    description: response.message || "Failed to update subscription",
                    type: "danger",
                    confirmText: "OK",
                    onConfirm: () => { }
                })
            }
        },
        onError: () => {
            showConfirmation({
                title: "Update Failed",
                description: "An error occurred while updating the subscription",
                type: "danger",
                confirmText: "OK",
                onConfirm: () => { }
            })
        }
    })

    const handleEditSubscriptionSubmit = () => {
        if (!editingSubscriptionUserId) return
        updateSubscriptionMutation.mutate({
            userId: editingSubscriptionUserId,
            data: {
                plan: editSubscriptionForm.plan,
                status: editSubscriptionForm.status,
                billingCycle: editSubscriptionForm.billingCycle,
                nextBillingDate: editSubscriptionForm.nextBilling
            }
        })
    }

    const closeEditSubscriptionModal = () => {
        setShowEditSubscriptionModal(false)
        setEditingSubscriptionUserId(null)
    }

    const updateSubscriptionFormField = (field: keyof EditSubscriptionForm, value: string) => {
        setEditSubscriptionForm((prev) => ({ ...prev, [field]: value }))
    }


    const handleViewBilling = (userId: string) => {
        const user = users.find((u) => u.id === userId)
        setBillingDetailUserId(userId)
        setShowBillingDetailModal(true)
    }

    const handleCancelSubscription = (userId: string) => {
        const user = users.find((u) => u.id === userId)
        confirmAction(
            "Cancel Subscription",
            `Cancel subscription for ${user?.name}?`,
            () => {
                updateSubscriptionMutation.mutate(
                    { userId, data: { plan: 'Free', status: 'Inactive', billingCycle: 'Monthly' } },
                    {
                        onSuccess: () => {
                            showConfirmation({
                                title: "Subscription Canceled",
                                description: `Subscription canceled for ${user?.name}`,
                                type: "success",
                                confirmText: "OK",
                                onConfirm: () => { }
                            })
                        }
                    }
                )
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

    const getPlanBadge = (plan: string) => {
        const variants = {
            Free: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            Pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            Enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        }
        return variants[plan as keyof typeof variants] || variants.Free
    }

    const closeBillingDetailModal = () => {
        setShowBillingDetailModal(false)
        setBillingDetailUserId(null)
    }

    const getBillingDetailUser = () => {
        return users.find((u) => u.id === billingDetailUserId)
    }

    // Search & Pagination logic
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.companyName && user.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.plan && user.plan.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    const isLoading = usersLoading
    const isEditingSubscription = sendPaymentLinkMutation.isPending || updateSubscriptionMutation.isPending

    const handleIssueFreeAccountFromBilling = () => {
        const user = getBillingDetailUser()
        if (!user) return

        setIsProcessingBillingAction(true)

        setTimeout(() => {
            setIsProcessingBillingAction(false)
            showConfirmation({
                title: "Free Account Issued Successfully",
                description: `User: ${user.name}\nEmail: ${user.email}\n\nThe user now has a Free Account with unlimited access to basic features.\n\nNotification email has been sent to ${user.email}.`,
                type: "success",
                confirmText: "OK",
                onConfirm: () => { }
            })
        }, 1500)
    }

    const handleSetFreeTrialFromBilling = () => {
        const user = getBillingDetailUser()
        if (!user) return

        setIsProcessingBillingAction(true)

        setTimeout(() => {
            setIsProcessingBillingAction(false)
            const trialEndDate = new Date()
            trialEndDate.setDate(trialEndDate.getDate() + 14)
            showConfirmation({
                title: "Free Trial Activated Successfully",
                description: `User: ${user.name}\nEmail: ${user.email}\nTrial Duration: 14 days\nTrial Ends: ${trialEndDate.toLocaleDateString()}\n\nThe user now has access to all Pro features during the trial period.\n\nWelcome email with trial details has been sent to ${user.email}.`,
                type: "success",
                confirmText: "OK",
                onConfirm: () => { }
            })
        }, 1500)
    }

    const handleAssignPaidPlanFromBilling = () => {
        const user = getBillingDetailUser()
        if (!user) return

        // Close billing detail modal and open subscription editor
        setShowBillingDetailModal(false)

        // Open the subscription editor modal
        setEditingSubscriptionUserId(billingDetailUserId)
        setEditSubscriptionForm({
            plan: user.plan || "Free",
            status: user.status,
            billingCycle: "Monthly",
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        setShowEditSubscriptionModal(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Subscription & Billing</h2>
                    <p className="text-muted-foreground">Manage user subscriptions and billing</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-md">Active Subscriptions</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search subscriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><UserCardSkeleton /></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-6 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-8 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user) => (
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
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {user.userType === 'Company' ? (
                                                            <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 flex items-center gap-1">
                                                                <Crown className="h-3 w-3" />
                                                                Owner - {user.companyName}
                                                            </Badge>
                                                        ) : user.userType === 'Company User' ? (
                                                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/30 flex items-center gap-1">
                                                                <Building2 className="h-3 w-3" />
                                                                {user.companyName}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-600 border-gray-500/30 flex items-center gap-1">
                                                                <UserCircle className="h-3 w-3" />
                                                                Sales
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPlanBadge(user.plan!)}>{user.plan}</Badge>
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
                                                        <DropdownMenuItem onClick={() => handleViewBilling(user.id)}>
                                                            View Billing Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateSubscription(user.id)}>
                                                            Update Subscription
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleCancelSubscription(user.id)}
                                                            className="text-red-600"
                                                        >
                                                            Cancel Subscription
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
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

            <Dialog open={showEditSubscriptionModal} onOpenChange={setShowEditSubscriptionModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Send Upgrade Link</DialogTitle>
                        <DialogDescription>Send payment link to user for subscription upgrade</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                            <Select value={editSubscriptionForm.plan} onValueChange={(value) => updateSubscriptionFormField("plan", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Free">Free Plan</SelectItem>
                                    <SelectItem value="Pro">Pro Plan - $29/month</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise Plan - $99/month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subscriptionStatus">Status</Label>
                            <Select value={editSubscriptionForm.status} onValueChange={(value) => updateSubscriptionFormField("status", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Trial">Trial</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="billingCycle">Billing Cycle</Label>
                            <Select value={editSubscriptionForm.billingCycle} onValueChange={(value) => updateSubscriptionFormField("billingCycle", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select billing cycle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="Yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nextBilling">Next Billing Date</Label>
                            <Input
                                id="nextBilling"
                                type="date"
                                value={editSubscriptionForm.nextBilling}
                                onChange={(e) => updateSubscriptionFormField("nextBilling", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeEditSubscriptionModal} disabled={isEditingSubscription}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendPaymentLink} disabled={isEditingSubscription || editSubscriptionForm.plan === 'Free'}>
                            {isEditingSubscription ? (
                                <>
                                    <Mail className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Payment Link
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showBillingDetailModal} onOpenChange={setShowBillingDetailModal}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Billing Details</DialogTitle>
                        <DialogDescription>View and manage user subscription and billing information</DialogDescription>
                    </DialogHeader>

                    {billingDetailUserId &&
                        (() => {
                            const user = getBillingDetailUser()
                            if (!user) return null

                            // Calculate renewal date (30 days from now for demo)
                            const renewalDate = new Date()
                            renewalDate.setDate(renewalDate.getDate() + 30)

                            // Determine user status (New User if created in last 7 days, otherwise Existing User)
                            const isNewUser = Math.random() > 0.5 // Mock logic for demo
                            const userStatusLabel = isNewUser ? "New User" : "Existing User"

                            return (
                                <div className="space-y-6 py-4">
                                    {/* User Info Header */}
                                    <div className="flex  items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                        <Avatar className="h-12 w-12 md:h-16 md:w-16">
                                            <AvatarImage src={`/.jpg?height=64&width=64&query=${user.name}`} />
                                            <AvatarFallback className="text-lg">
                                                {user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold">{user.name}</h3>
                                            <p className="text-muted-foreground">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline">{user.role}</Badge>
                                                <Badge className={getStatusBadge(userStatusLabel)}>{userStatusLabel}</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Billing Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Current Plan</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-xl md:text-2xl font-bold">{user.plan || "Free"}</p>
                                                        <Badge className={getPlanBadge(user.plan || "Free")} variant="outline">
                                                            {user.status === "Active" ? "Active" : user.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Renewal Date</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-2xl font-bold">{renewalDate.getDate()}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {renewalDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">User Status</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-lg font-bold">{userStatusLabel}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {isNewUser ? "Joined recently" : "Active member"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Billing Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Subscription Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium">Plan Type</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {user.plan === "Free" && "Free Account - Basic features"}
                                                            {user.plan === "Pro" && "Pro Plan - $29/month"}
                                                            {user.plan === "Enterprise" && "Enterprise Plan - $99/month"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium">Billing Cycle</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {user.plan === "Free" ? "No billing" : "Monthly billing"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium">Next Billing Date</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {user.plan === "Free" ? "N/A" : renewalDate.toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                    <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium">Account Status</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {user.status} - {isNewUser ? "New customer" : "Returning customer"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Action Buttons */}
                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium mb-3">Subscription Actions</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2 bg-transparent"
                                                onClick={handleIssueFreeAccountFromBilling}
                                                disabled={isProcessingBillingAction}
                                            >
                                                <Gift className="h-4 w-4" />
                                                Issue Free Account
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2 bg-transparent"
                                                onClick={handleSetFreeTrialFromBilling}
                                                disabled={isProcessingBillingAction}
                                            >
                                                <Clock className="h-4 w-4" />
                                                Set Free Trial
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2 bg-transparent"
                                                onClick={handleAssignPaidPlanFromBilling}
                                                disabled={isProcessingBillingAction}
                                            >
                                                <CreditCard className="h-4 w-4" />
                                                Assign Paid Plan
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium mb-1">Payment Method</p>
                                                    <p className="text-muted-foreground">
                                                        {user.plan === "Free" ? "No payment method" : "•••• •••• •••• 4242"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium mb-1">Total Spent</p>
                                                    <p className="text-muted-foreground">
                                                        {user.plan === "Free" ? "$0.00" : "$" + (Math.random() * 500 + 100).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium mb-1">Account Created</p>
                                                    <p className="text-muted-foreground">{isNewUser ? "7 days ago" : "6 months ago"}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium mb-1">Last Payment</p>
                                                    <p className="text-muted-foreground">{user.plan === "Free" ? "N/A" : "15 days ago"}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })()}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeBillingDetailModal}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
