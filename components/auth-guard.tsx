"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🛡️ AuthGuard: Starting auth check, allowedRoles:', allowedRoles)
    
    const checkAuth = async () => {
      try {
        console.log('🔐 AuthGuard: Calling verifyAuth API...')
        const response = await api.verifyAuth()
        console.log('📥 AuthGuard: API response:', response)
        
        if (response.user) {
          console.log('👤 AuthGuard: User found, role:', response.user.role)
          
          // Check if user role is allowed
          if (allowedRoles && !allowedRoles.includes(response.user.role)) {
            console.log('❌ AuthGuard: Role not allowed, redirecting to login')
            router.replace('/login')
            return
          }
          
          console.log('✅ AuthGuard: User authorized')
          setIsAuthorized(true)
        } else {
          console.log('❌ AuthGuard: No user, redirecting to login')
          router.replace('/login')
        }
      } catch (error) {
        console.log('⚠️ AuthGuard: Error:', error)
        router.replace('/login')
      } finally {
        console.log('🏁 AuthGuard: Setting loading to false')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, allowedRoles])

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
