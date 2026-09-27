import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompetitionDetails,
  registerForCompetition,
  uploadSubmission,
} from '../api/competitionApi';

const key = (id) => ['competition', id || 'featured'];
const POLL_INTERVAL_MS = 15000;

export function useCompetitionDetails(competitionId) {
  return useQuery({
    queryKey: key(competitionId),
    queryFn: () => fetchCompetitionDetails(competitionId),
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useRegister(competitionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => registerForCompetition(competitionId, payload),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key(competitionId) }),
  });
}

export function useUploadSubmission(competitionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => uploadSubmission(competitionId, payload),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key(competitionId) }),
  });
}
