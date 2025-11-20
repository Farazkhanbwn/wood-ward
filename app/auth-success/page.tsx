"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic2, CheckCircle2 } from "lucide-react"

export default function AuthSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push("/login")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7FAFF" }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E63F3] text-white transition-transform group-hover:scale-110">
              <Mic2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Wood Ward</span>
          </Link>
        </div>

        <Card
          className="border-gray-200 shadow-lg"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E7EB",
          }}
        >
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">Success!</CardTitle>
            <CardDescription className="text-gray-600 text-center">
              Your password has been reset successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">You can now log in with your new password</p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full text-white hover:opacity-90 active:opacity-80 focus:opacity-90"
              style={{
                backgroundColor: "#1E63F3",
                color: "#FFFFFF",
              }}
            >
              Go to Login
            </Button>
            <p className="text-xs text-gray-500 text-center">Redirecting automatically in 5 seconds...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
