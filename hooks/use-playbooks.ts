import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function usePlaybooks() {
  return useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const response = await api.getPlaybooks()
      if (response.success) {
        return response.playbooks.map((pb: any) => ({
          id: pb._id,
          title: pb.title || 'Untitled Playbook',
          date: pb.createdAt || new Date().toISOString(),
          lastEdited: pb.updatedAt || pb.createdAt || new Date().toISOString(),
          duration: "N/A",
          size: "N/A",
        }))
      }
      return []
    },
    staleTime: 0,
    gcTime: 0,
  })
}

export function usePlaybook(id: string) {
  return useQuery({
    queryKey: ['playbook', id],
    queryFn: () => api.getPlaybookById(id),
    enabled: !!id
  })
}

export function useCreatePlaybook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.createPlaybook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] })
    }
  })
}

export function useUpdatePlaybook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePlaybook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] })
    }
  })
}

export function useDeletePlaybook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePlaybook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] })
    }
  })
}
