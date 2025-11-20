"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AlertOptions {
    title?: string
    message: string
    confirmText?: string
    onConfirm?: () => void
}

interface ConfirmOptions {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
}

interface DialogState {
    type: 'alert' | 'confirm' | null
    options: AlertOptions | ConfirmOptions | null
}

interface DialogContextType {
    showAlert: (options: AlertOptions) => void
    showConfirm: (options: ConfirmOptions) => Promise<boolean>
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: React.ReactNode }) {
    const [dialogState, setDialogState] = useState<DialogState>({
        type: null,
        options: null
    })

    const showAlert = useCallback((options: AlertOptions) => {
        setDialogState({
            type: 'alert',
            options
        })
    }, [])

    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                type: 'confirm',
                options: {
                    ...options,
                    onConfirm: () => {
                        options.onConfirm?.()
                        setDialogState({ type: null, options: null })
                        resolve(true)
                    },
                    onCancel: () => {
                        options.onCancel?.()
                        setDialogState({ type: null, options: null })
                        resolve(false)
                    }
                }
            })
        })
    }, [])

    const closeDialog = useCallback(() => {
        setDialogState({ type: null, options: null })
    }, [])

    const handleAlertConfirm = useCallback(() => {
        dialogState.options?.onConfirm?.()
        closeDialog()
    }, [dialogState.options, closeDialog])

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* Alert Dialog */}
            <Dialog open={dialogState.type === 'alert'} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{dialogState.options?.title || 'Alert'}</DialogTitle>
                        <DialogDescription>
                            {dialogState.options?.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleAlertConfirm} className="w-full sm:w-auto">
                            {dialogState.options?.confirmText || 'OK'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog open={dialogState.type === 'confirm'} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{dialogState.options?.title || 'Confirm'}</DialogTitle>
                        <DialogDescription>
                            {dialogState.options?.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => (dialogState.options as ConfirmOptions)?.onCancel?.()}
                            className="w-full sm:w-auto"
                        >
                            {(dialogState.options as ConfirmOptions)?.cancelText || 'Cancel'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => (dialogState.options as ConfirmOptions)?.onConfirm?.()}
                            className="w-full sm:w-auto"
                        >
                            {(dialogState.options as ConfirmOptions)?.confirmText || 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DialogContext.Provider>
    )
}

export function useDialog() {
    const context = useContext(DialogContext)
    if (context === undefined) {
        throw new Error('useDialog must be used within a DialogProvider')
    }
    return context
}