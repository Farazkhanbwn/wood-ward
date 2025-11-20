"use client"

import { createContext, useContext, ReactNode } from "react"
import { useConfirmation } from "@/hooks"

interface ConfirmationContextType {
    showConfirmation: (options: {
        title: string
        description: string
        type?: "warning" | "info" | "success" | "danger"
        confirmText?: string
        cancelText?: string
        onConfirm?: () => void | Promise<void>
        onCancel?: () => void
    }) => void
    hideConfirmation: () => void
    confirmDelete: (itemName: string, onConfirm: () => void | Promise<void>) => void
    confirmLogout: (onConfirm: () => void | Promise<void>) => void
    confirmSave: (onConfirm: () => void | Promise<void>) => void
    confirmAction: (action: string, description: string, onConfirm: () => void | Promise<void>, type?: "warning" | "info" | "success" | "danger") => void
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export const useConfirmationContext = () => {
    const context = useContext(ConfirmationContext)
    if (!context) {
        throw new Error("useConfirmationContext must be used within a ConfirmationProvider")
    }
    return context
}

interface ConfirmationProviderProps {
    children: ReactNode
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
    const confirmation = useConfirmation()

    return (
        <ConfirmationContext.Provider value={confirmation}>
            {children}
            {confirmation.ConfirmationComponent}
        </ConfirmationContext.Provider>
    )
}
