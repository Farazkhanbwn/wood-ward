import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Activity {
  type: string
  description: string
  timestamp: Date
  icon: string
  color: string
}

export function useUserActivities(userId: string) {
  const { data: callSessions } = useQuery({
    queryKey: ['userCallSessions', userId],
    queryFn: () => api.getUserCallSessions(userId, 10, 0),
    enabled: !!userId
  })

  const { data: playbooks } = useQuery({
    queryKey: ['userPlaybooks', userId],
    queryFn: () => api.getUserPlaybooks(userId),
    enabled: !!userId
  })

  // Combine and sort activities
  const activities: Activity[] = []

  if (callSessions?.sessions) {
    callSessions.sessions.forEach((session: any) => {
      activities.push({
        type: 'call',
        description: `Completed ${session.callType.replace(/-/g, ' ')}`,
        timestamp: new Date(session.createdAt),
        icon: 'phone',
        color: 'blue'
      })
    })
  }

  if (playbooks?.playbooks) {
    playbooks.playbooks.forEach((playbook: any) => {
      const isNew = new Date(playbook.createdAt).getTime() === new Date(playbook.updatedAt).getTime()
      activities.push({
        type: 'playbook',
        description: isNew ? `Created playbook "${playbook.title}"` : `Updated playbook "${playbook.title}"`,
        timestamp: new Date(playbook.updatedAt || playbook.createdAt),
        icon: isNew ? 'file-plus' : 'edit',
        color: isNew ? 'green' : 'purple'
      })
    })
  }

  // Sort by timestamp descending
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return {
    activities: activities.slice(0, 6),
    isLoading: !callSessions && !playbooks
  }
}
