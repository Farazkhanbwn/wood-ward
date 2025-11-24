import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: () => api.getPlatformStats(),
    refetchInterval: 10000,
    staleTime: 0
  })
}

export function useCompanyStats() {
  return useQuery({
    queryKey: ['companyStats'],
    queryFn: () => api.getCompanyStats(),
    refetchInterval: 10000,
    staleTime: 0
  })
}

export function useUserCallSessions(userId: string | null) {
  return useQuery({
    queryKey: ['userSessions', userId],
    queryFn: () => api.getUserCallSessions(userId!, 50, 0),
    enabled: !!userId
  })
}
