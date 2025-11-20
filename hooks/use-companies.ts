import { api } from '@/lib/api'
import { useApiQuery, useApiMutation } from './use-api'

export const useCompanies = () => {
  return useApiQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.getCompanies()
      if (!response.success) throw new Error('Failed to fetch companies')
      return response
    },
  })
}

export const useCreateCompany = () => {
  return useApiMutation({
    mutationFn: (data: { name: string; ownerName: string; ownerEmail: string; status: string }) =>
      api.addCompany(data),
    invalidateKeys: [['companies']],
    successMessage: 'Company created successfully! Invitation sent to coach.',
  })
}

export const useUpdateCompany = () => {
  return useApiMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: { name: string; ownerName: string; ownerEmail: string; status: string } }) =>
      api.updateCompany(companyId, data),
    invalidateKeys: [['companies']],
    successMessage: 'Company updated successfully',
  })
}

export const useDeleteCompany = () => {
  return useApiMutation({
    mutationFn: (companyId: string) => api.deleteCompany(companyId),
    invalidateKeys: [['companies']],
    successMessage: 'Company deleted successfully',
  })
}
