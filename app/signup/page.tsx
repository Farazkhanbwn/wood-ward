"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "sales",
    companyName: "",
    ownerName: "",
    ownerEmail: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [isSuccess, setIsSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Client-side validation
    if (formData.role === 'sales') {
      if (!formData.fullName || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields")
        setIsLoading(false)
        return
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Please enter a valid email address")
        setIsLoading(false)
        return
      }
    } else {
      if (!formData.companyName || !formData.ownerName || !formData.ownerEmail || !formData.password) {
        toast.error("Please fill in all required fields")
        setIsLoading(false)
        return
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
        toast.error("Please enter a valid email address")
        setIsLoading(false)
        return
      }
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.signup(formData)
      
      toast.success(response.message || "Account created successfully!")
      setUserEmail(formData.role === 'sales' ? formData.email : formData.ownerEmail)
      setIsSuccess(true)
    } catch (err: any) {
      const errorMessage = err?.message || "Signup failed"
      
      // Handle specific error messages from backend
      if (errorMessage.includes('already exists')) {
        toast.error("An account with this email already exists")
      } else if (errorMessage.includes('company') && errorMessage.includes('exists')) {
        toast.error("A company with this name or email already exists")
      } else if (errorMessage.includes('password')) {
        toast.error("Password does not meet requirements")
      } else if (errorMessage.includes('email')) {
        toast.error("Please enter a valid email address")
      } else if (errorMessage.includes('required')) {
        toast.error("Please fill in all required fields")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#F7FAFF" }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="">
              <img
                src="/images/ws-only.png"
                alt="Woodward Strategies"
                className="h-8 w-auto"
              />
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
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isSuccess ? "Check Your Email" : "Create Your Account"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isSuccess
                ? "We've sent you a verification link"
                : "Start your free trial and begin your first AI role play"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2">Account Created Successfully!</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We've sent a verification link to <strong>{userEmail}</strong>. Please check your inbox and click the link to verify your email address.
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.resendVerification(userEmail)
                        toast.success(response.message)
                      } catch {
                        toast.error("Failed to resend email")
                      }
                    }}
                    className="text-[#1E63F3] hover:underline font-medium"
                  >
                    resend verification email
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              {formData.role === "sales" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-900">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="border-gray-300 text-gray-900"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#111827",
                        borderColor: "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="border-gray-300 text-gray-900"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#111827",
                        borderColor: "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-900">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="border-gray-300 text-gray-900 pr-10"
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#111827",
                          borderColor: "#D1D5DB",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {formData.role === "coach" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-900">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Acme Inc"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="border-gray-300 text-gray-900"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#111827",
                        borderColor: "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-gray-900">
                      Owner Name
                    </Label>
                    <Input
                      id="ownerName"
                      type="text"
                      placeholder="Jane Smith"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                      className="border-gray-300 text-gray-900"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#111827",
                        borderColor: "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail" className="text-gray-900">
                      Owner Email
                    </Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      placeholder="owner@example.com"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      required
                      className="border-gray-300 text-gray-900"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#111827",
                        borderColor: "#D1D5DB",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPassword" className="text-gray-900">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="companyPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="border-gray-300 text-gray-900 pr-10"
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: "#111827",
                          borderColor: "#D1D5DB",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-900">
                  Role
                </Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger
                    id="role"
                    className="border-gray-300 text-gray-900"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#111827",
                      borderColor: "#D1D5DB",
                    }}
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E5E7EB",
                    }}
                  >
                    <SelectItem value="sales" style={{ color: "#111827" }}>
                      Individual
                    </SelectItem>
                    <SelectItem value="coach" style={{ color: "#111827" }}>
                      Company
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white hover:opacity-90 active:opacity-80 focus:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#1E63F3",
                  color: "#FFFFFF",
                }}
              >
                {isLoading ? "Creating Account..." : "Start Free Trial"}
              </Button>
            </form>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-600 text-center w-full">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1E63F3] hover:underline font-medium">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
