import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useSessions = (userId: string) => {
  return useQuery({
    queryKey: ['sessions', userId],
    queryFn: async () => {
      return await api.getUserSessions(userId);
    },
    enabled: !!userId,
  });
};
