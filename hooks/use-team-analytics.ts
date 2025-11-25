import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useTeamAnalytics() {
  return useQuery({
    queryKey: ['teamAnalytics'],
    queryFn: async () => {
      const response = await api.getTeamAnalytics()
      if (response.success) {
        return response.analytics
      }
      return null
    }
  })
}
