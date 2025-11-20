import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UseApiQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[]
  queryFn: () => Promise<T>
}

interface UseApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidateKeys?: string[][]
  successMessage?: string
  errorMessage?: string
}

export const useApiQuery = <T>({ queryKey, queryFn, ...options }: UseApiQueryOptions<T>) => {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  })
}

export const useApiMutation = <TData = any, TVariables = any>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  ...options
}: UseApiMutationOptions<TData, TVariables>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context, mutation) => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
      if (successMessage) toast.success(successMessage)
      if (onSuccess) onSuccess(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(errorMessage || error.message || 'An error occurred')
      if (onError) onError(error, variables, context, mutation)
    },
    ...options,
  })
}
