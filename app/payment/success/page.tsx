"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { api } from "@/lib/api"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [userRole, setUserRole] = useState<string>('sales')
  const [planName, setPlanName] = useState<string>('your plan')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifyPayment(sessionId)
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      await api.verifyPaymentSession(sessionId)
      const authResponse = await api.verifyAuth()
      if (authResponse.user) {
        setUserRole(authResponse.user.role)
        setPlanName(authResponse.user.subscription?.plan || 'your plan')
      }
      setIsVerifying(false)
    } catch (error) {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your subscription has been activated successfully. You now have access to all {planName} features!
          </p>
          <Button 
            onClick={() => {
              const dashboardRoutes: Record<string, string> = {
                admin: '/admin/company-management',
                coach: '/coach/team-management',
                sales: '/sales'
              }
              router.push(dashboardRoutes[userRole] || '/sales')
            }}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
