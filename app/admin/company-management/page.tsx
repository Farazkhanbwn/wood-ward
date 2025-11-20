"use client"

import { useState, useEffect } from "react"
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "@/hooks/use-companies"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash2, Building2, Search } from "lucide-react"
import { PageHeaderSkeleton, CompanyRowSkeleton } from "@/components/ui/loading-skeletons"
import { Pagination } from "@/components/ui/pagination"
import { useConfirmationContext } from "@/components/admin/confirmation-provider"

type CompanyStatus = "Active" | "Inactive" | "Pending"

interface Company {
    id: string
    name: string
    ownerName: string
    ownerEmail: string
    status: CompanyStatus
}

interface CompanyForm {
    name: string
    ownerName: string
    ownerEmail: string
    status: CompanyStatus
}

export default function CompanyManagementPage() {
    const { confirmDelete } = useConfirmationContext()
    const { data: companiesData, isLoading } = useCompanies()
    const createCompany = useCreateCompany()
    const updateCompany = useUpdateCompany()
    const deleteCompany = useDeleteCompany()

    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [form, setForm] = useState<CompanyForm>({ name: "", ownerName: "", ownerEmail: "", status: "Active" })
    const [errors, setErrors] = useState<Partial<CompanyForm>>({})

    // Search & Pagination
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4

    const formattedCompanies = companiesData?.companies?.map((c: any) => ({
        id: c.id,
        name: c.name,
        ownerName: c.ownerName,
        ownerEmail: c.ownerEmail,
        status: c.status.charAt(0).toUpperCase() + c.status.slice(1) as CompanyStatus
    })) || []

    const validate = (): boolean => {
        const nextErrors: Partial<CompanyForm> = {}
        if (!form.name.trim()) nextErrors.name = "Company name is required"
        if (!form.ownerName.trim()) nextErrors.ownerName = "Owner name is required"
        if (!form.ownerEmail.trim()) nextErrors.ownerEmail = "Owner email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) nextErrors.ownerEmail = "Enter a valid email"
        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    const openAdd = () => {
        setForm({ name: "", ownerName: "", ownerEmail: "", status: "Active" })
        setErrors({})
        setShowAddModal(true)
    }

    const openEdit = (id: string) => {
        const c = formattedCompanies.find((c: Company) => c.id === id)
        if (!c) return
        setEditingId(id)
        setForm({ name: c.name, ownerName: c.ownerName, ownerEmail: c.ownerEmail, status: c.status })
        setErrors({})
        setShowEditModal(true)
    }

    const submitAdd = async () => {
        if (!validate()) return
        createCompany.mutate(form, {
            onSuccess: () => setShowAddModal(false)
        })
    }

    const submitEdit = async () => {
        if (!validate() || !editingId) return
        updateCompany.mutate({ companyId: editingId, data: form }, {
            onSuccess: () => setShowEditModal(false)
        })
    }

    const removeCompany = (id: string) => {
        const c = formattedCompanies.find((x: Company) => x.id === id)
        confirmDelete(c?.name || "this company", () => {
            deleteCompany.mutate(id)
        })
    }

    const statusBadge = (status: CompanyStatus) => {
        const map: Record<CompanyStatus, string> = {
            Active: "bg-green-500/20 text-green-500 border-green-500/30",
            Inactive: "bg-red-500/20 text-red-500 border-red-500/30",
            Pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
        }
        return map[status]
    }

    const setField = (key: keyof CompanyForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value as any }))
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }))
    }

    // Search & Pagination logic
    const filteredCompanies = formattedCompanies.filter((company: Company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

    useEffect(() => {
        setCurrentPage(1)
    }, [formattedCompanies.length, searchQuery])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeaderSkeleton />
                <Card>
                    <CardHeader>
                        <CardTitle className="text-md">Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <CompanyRowSkeleton key={i} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">Company Management</h2>
                    <p className="text-muted-foreground">Manage companies and ownership details</p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                    <Button onClick={openAdd} className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Add Company
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-md">Companies</CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredCompanies.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length} companies
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search Bar */}
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>

                    {filteredCompanies.length === 0 && !searchQuery ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <Building2 className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Get started by adding your first company. You'll be able to manage coaches and track their teams.
                            </p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No companies found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Owner Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCompanies.map((c: Company) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.ownerName}</TableCell>
                                        <TableCell>{c.ownerEmail}</TableCell>
                                        <TableCell>
                                            <Badge className={statusBadge(c.status)}>{c.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(c.id)}>
                                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => removeCompany(c.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {filteredCompanies.length > itemsPerPage && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredCompanies.length}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Add Company Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Company</DialogTitle>
                        <DialogDescription>Enter the company details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input id="companyName" placeholder="Enter company name" value={form.name} onChange={(e) => setField("name", e.target.value)} className={errors.name ? "border-red-500" : ""} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ownerName">Owner Name</Label>
                            <Input id="ownerName" placeholder="Enter owner name" value={form.ownerName} onChange={(e) => setField("ownerName", e.target.value)} className={errors.ownerName ? "border-red-500" : ""} />
                            {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ownerEmail">Owner Email</Label>
                            <Input id="ownerEmail" type="email" placeholder="Enter owner email" value={form.ownerEmail} onChange={(e) => setField("ownerEmail", e.target.value)} className={errors.ownerEmail ? "border-red-500" : ""} />
                            {errors.ownerEmail && <p className="text-sm text-red-500">{errors.ownerEmail}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button onClick={submitAdd}>Add Company</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Company Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Company</DialogTitle>
                        <DialogDescription>Update company details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editCompanyName">Company Name</Label>
                            <Input id="editCompanyName" placeholder="Enter company name" value={form.name} onChange={(e) => setField("name", e.target.value)} className={errors.name ? "border-red-500" : ""} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editOwnerName">Owner Name</Label>
                            <Input id="editOwnerName" placeholder="Enter owner name" value={form.ownerName} onChange={(e) => setField("ownerName", e.target.value)} className={errors.ownerName ? "border-red-500" : ""} />
                            {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editOwnerEmail">Owner Email</Label>
                            <Input id="editOwnerEmail" type="email" placeholder="Enter owner email" value={form.ownerEmail} onChange={(e) => setField("ownerEmail", e.target.value)} className={errors.ownerEmail ? "border-red-500" : ""} />
                            {errors.ownerEmail && <p className="text-sm text-red-500">{errors.ownerEmail}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editStatus">Status</Label>
                            <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button onClick={submitEdit}>Update Company</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}


