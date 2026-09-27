import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, updateCurrentUser } from '../api/userApi';

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateCurrentUser(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    user: query.data || null,
    isLoading: query.isLoading,
    refetch: query.refetch,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
