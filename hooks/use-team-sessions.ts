import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

interface SessionFilters {
  dateFrom?: string
  dateTo?: string
  member?: string
  scenario?: string
  minScore?: string
  maxScore?: string
  includeInactive?: boolean
  page?: number
  limit?: number
}

export function useTeamSessions(filters: SessionFilters) {
  return useQuery({
    queryKey: ['teamSessions', filters],
    queryFn: () => api.getTeamCallSessions(filters)
  })
}
