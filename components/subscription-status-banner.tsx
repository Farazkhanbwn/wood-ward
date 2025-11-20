"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SubscriptionStatusBanner() {
    const [status, setStatus] = useState<string | null>(null)
    const [plan, setPlan] = useState<string | null>(null)
    const [nextBillingDate, setNextBillingDate] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.user?.subscription) {
                    setStatus(data.user.subscription.status)
                    setPlan(data.user.subscription.plan)
                    setNextBillingDate(data.user.subscription.nextBillingDate)
                }
            })
            .catch(() => {})
    }, [])
    
    // Calculate days remaining for trial
    let daysRemaining = 0
    if (status === 'Trial' && nextBillingDate) {
        const now = new Date()
        const endDate = new Date(nextBillingDate)
        daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    if (status === 'Inactive' || status === 'Pending') {
        return (
            <div className="sticky top-0 left-0 right-0 z-40 bg-red-500 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">
                        Your trial has ended. Upgrade to continue using the platform.
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push('/pricing')}
                >
                    Upgrade Now
                </Button>
            </div>
        )
    }

    if (status === 'Trial') {
        return (
            <div className="sticky top-0 left-0 right-0 z-40 bg-blue-500 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium">
                        🎉 Free Trial: {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => router.push('/pricing')}
                >
                    View Plans
                </Button>
            </div>
        )
    }

    return null
}
