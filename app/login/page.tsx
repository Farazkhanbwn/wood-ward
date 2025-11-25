"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      toast.success(message)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Client-side validation
    if (!email || !password) {
      toast.error("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const response = await api.login(email, password)
      
      toast.success("Login successful!")
      // Redirect based on role
      if (response.user.role === 'admin') {
        router.replace('/admin/company-management')
      } else {
        router.replace('/pricing')
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Login failed"
      
      // Handle specific error messages
      if (errorMessage.includes('Too many')) {
        toast.error("Too many login attempts. Please try again after 15 minutes.", {
          duration: 5000,
        })
      } else if (errorMessage.includes('not found')) {
        toast.error("No account found with this email address")
      } else if (errorMessage.includes('password')) {
        toast.error("Incorrect password")
      } else if (errorMessage.includes('verified')) {
        toast.error("Please verify your email before logging in")
      } else if (errorMessage.includes('Invalid credentials')) {
        toast.error("Invalid email or password")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Log in to continue your training and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white hover:opacity-90 active:opacity-80 focus:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#1E63F3",
                  color: "#FFFFFF",
                }}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/forgot-password" className="text-sm text-[#1E63F3] hover:underline">
              Forgot Password?
            </Link>
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#1E63F3] hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
