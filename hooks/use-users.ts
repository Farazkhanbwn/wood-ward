import { api } from '@/lib/api'
import { useApiQuery, useApiMutation } from './use-api'

export const useUsers = () => {
  return useApiQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.getAllUsers()
      if (!response.success) throw new Error('Failed to fetch users')
      return response
    },
  })
}

export const useCreateUser = () => {
  return useApiMutation({
    mutationFn: (data: { name: string; email: string; userType: string; companyId?: string; role: string; status: string }) => 
      api.createUser(data),
    invalidateKeys: [['users']],
    successMessage: 'User created successfully',
  })
}

export const useUpdateUser = () => {
  return useApiMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name: string; email: string; role: string; status: string } }) =>
      api.updateUser(userId, data),
    invalidateKeys: [['users']],
  })
}

export const useDeleteUser = () => {
  return useApiMutation({
    mutationFn: (userId: string) => api.deleteUser(userId),
    invalidateKeys: [['users']],
    successMessage: 'User deleted successfully',
  })
}
