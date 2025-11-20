"use client"

import * as React from "react"
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ConfirmationType = "warning" | "info" | "success" | "danger"

interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    type?: ConfirmationType
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
    loading?: boolean
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onOpenChange,
    title,
    description,
    type = "warning",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    loading = false
}) => {
    const getIcon = () => {
        switch (type) {
            case "warning":
                return <AlertTriangle className="h-6 w-6 text-amber-500" />
            case "info":
                return <Info className="h-6 w-6 text-blue-500" />
            case "success":
                return <CheckCircle className="h-6 w-6 text-green-500" />
            case "danger":
                return <XCircle className="h-6 w-6 text-red-500" />
            default:
                return <AlertTriangle className="h-6 w-6 text-amber-500" />
        }
    }

    const getConfirmButtonVariant = () => {
        switch (type) {
            case "warning":
                return "default"
            case "info":
                return "default"
            case "success":
                return "default"
            case "danger":
                return "destructive"
            default:
                return "default"
        }
    }

    const handleConfirm = () => {
        onConfirm()
        onOpenChange(false)
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        }
        onOpenChange(false)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // When closing (cross button or escape), trigger cancel
            handleCancel()
        } else {
            onOpenChange(newOpen)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <DialogTitle className="text-left">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-left whitespace-pre-line">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={getConfirmButtonVariant()}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { ConfirmationDialog }
