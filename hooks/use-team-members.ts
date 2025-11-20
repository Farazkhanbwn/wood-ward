import { api } from '@/lib/api'
import { useApiQuery, useApiMutation } from './use-api'

export const useTeamMembers = () => {
  return useApiQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const response = await api.getTeamMembers()
      if (!response.success) throw new Error('Failed to fetch team members')
      return response.teamMembers
    },
  })
}

export const useAddRep = () => {
  return useApiMutation({
    mutationFn: (data: { name: string; email: string; phone: string }) =>
      api.addRep(data),
    invalidateKeys: [['teamMembers']],
    successMessage: 'Invitation sent successfully!',
  })
}

export const useRemoveRep = () => {
  return useApiMutation({
    mutationFn: (repId: string) => api.removeRep(repId),
    invalidateKeys: [['teamMembers']],
    successMessage: 'Rep removed successfully',
  })
}
