"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    } else {
      setIsVerifying(false)
      toast.error('Invalid verification link')
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.verifyEmail(token)
      if (response.message) {
        setIsSuccess(true)
        toast.success(response.message)
        // Logout user if logged in
        await api.logout().catch(() => {})
        setTimeout(() => router.push('/login'), 3000)
      } else {
        toast.error(response.message || 'Verification failed')
      }
    } catch {
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7FAFF" }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="">
              <img src="/images/ws-only.png" alt="Woodward Strategies" className="h-8 w-auto" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Wood Ward</span>
          </Link>
        </div>

        <Card className="border-gray-200 shadow-lg" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isVerifying ? 'Verifying Email...' : isSuccess ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isVerifying ? 'Please wait while we verify your email' : isSuccess ? 'Your email has been successfully verified' : 'Unable to verify your email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            {isVerifying && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E63F3]"></div>
              </div>
            )}
            {isSuccess && (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600">Redirecting to login page...</p>
              </div>
            )}
            {!isVerifying && !isSuccess && (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">The verification link may be invalid or expired.</p>
                <Link href="/login" className="text-[#1E63F3] hover:underline font-medium">
                  Go to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
