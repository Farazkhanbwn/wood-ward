'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export function useAuthGuard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.replace('/login')
        return
      }

      try {
        await api.verifyAuth()
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('token')
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return { isAuthenticated, isLoading }
}
