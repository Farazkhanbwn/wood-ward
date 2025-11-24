import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useSessions(userId: string) {
  return useQuery({
    queryKey: ['userSessions', userId],
    queryFn: () => api.getUserSessions(userId),
    enabled: !!userId
  })
}
