"use client"

import { useState, useCallback } from "react"
import { ConfirmationDialog, ConfirmationType } from "@/components/ui/confirmation-dialog"

interface ConfirmationOptions {
    title: string
    description: string
    type?: ConfirmationType
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void | Promise<void>
    onCancel?: () => void
}

interface ConfirmationState {
    open: boolean
    options: ConfirmationOptions | null
    loading: boolean
}

export const useConfirmation = () => {
    const [state, setState] = useState<ConfirmationState>({
        open: false,
        options: null,
        loading: false
    })

    const showConfirmation = useCallback((options: ConfirmationOptions) => {
        setState({
            open: true,
            options,
            loading: false
        })
    }, [])

    const hideConfirmation = useCallback(() => {
        setState(prev => ({
            ...prev,
            open: false,
            loading: false
        }))
    }, [])

    const handleConfirm = useCallback(async () => {
        if (!state.options?.onConfirm) return

        setState(prev => ({ ...prev, loading: true }))

        try {
            await state.options.onConfirm()
        } catch (error) {
            console.error("Confirmation action failed:", error)
        } finally {
            setState(prev => ({ ...prev, loading: false }))
        }
    }, [state.options])

    const handleCancel = useCallback(() => {
        if (state.options?.onCancel) {
            state.options.onCancel()
        }
        hideConfirmation()
    }, [state.options, hideConfirmation])

    // Convenience methods for common confirmation types
    const confirmDelete = useCallback((itemName: string, onConfirm: () => void | Promise<void>) => {
        showConfirmation({
            title: "Delete Item",
            description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
            type: "danger",
            confirmText: "Delete",
            onConfirm
        })
    }, [showConfirmation])

    const confirmLogout = useCallback((onConfirm: () => void | Promise<void>, onCancel?: () => void) => {
        showConfirmation({
            title: "Logout",
            description: "Are you sure you want to logout? You will need to sign in again to access your account.",
            type: "warning",
            confirmText: "Logout",
            onConfirm,
            onCancel
        })
    }, [showConfirmation])

    const confirmSave = useCallback((onConfirm: () => void | Promise<void>) => {
        showConfirmation({
            title: "Save Changes",
            description: "Are you sure you want to save these changes?",
            type: "info",
            confirmText: "Save",
            onConfirm
        })
    }, [showConfirmation])

    const confirmAction = useCallback((action: string, description: string, onConfirm: () => void | Promise<void>, type: ConfirmationType = "warning") => {
        showConfirmation({
            title: action,
            description,
            type,
            confirmText: action,
            onConfirm
        })
    }, [showConfirmation])

    const ConfirmationComponent = state.options ? (
        <ConfirmationDialog
            open={state.open}
            onOpenChange={hideConfirmation}
            title={state.options.title}
            description={state.options.description}
            type={state.options.type}
            confirmText={state.options.confirmText}
            cancelText={state.options.cancelText}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            loading={state.loading}
        />
    ) : null

    return {
        showConfirmation,
        hideConfirmation,
        confirmDelete,
        confirmLogout,
        confirmSave,
        confirmAction,
        ConfirmationComponent
    }
}
