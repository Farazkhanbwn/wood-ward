import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.getDashboardStats()
      if (response.success) {
        return response.stats
      }
      return null
    }
  })
}

export function useCallSessions(limit = 100, skip = 0) {
  return useQuery({
    queryKey: ['allSessions', limit, skip],
    queryFn: () => api.getCallSessions(limit, skip)
  })
}

export function useCallSession(id: string) {
  return useQuery({
    queryKey: ['callSession', id],
    queryFn: () => api.getCallSessionById(id),
    enabled: !!id
  })
}

export function useSaveCallSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.saveCallSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['allSessions'] })
    }
  })
}

export function useDeleteCallSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCallSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['allSessions'] })
    }
  })
}
