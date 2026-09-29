import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompetitions,
  fetchCompetitionDetails,
  registerForCompetition,
  uploadSubmission,
  fetchMySubmission,
  createCompetition,
} from '../api/competitionApi';

const key = (id) => ['competition', id || 'featured'];
const POLL_INTERVAL_MS = 15000;

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: fetchCompetitions,
    staleTime: 5000,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useCompetitionDetails(competitionId) {
  return useQuery({
    queryKey: key(competitionId),
    queryFn: async () => {
      let selectedId = competitionId;
      if (!selectedId) {
        const comps = await fetchCompetitions();
        selectedId = comps[0]?.slug || comps[0]?.id || 'feedants-classical-dance';
      }
      return fetchCompetitionDetails(selectedId);
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useRegister(competitionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => registerForCompetition(competitionId, payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key(competitionId) });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

export function useMySubmission(competitionId) {
  return useQuery({
    queryKey: ['mySubmission', competitionId || 'featured'],
    queryFn: () => fetchMySubmission(competitionId),
    enabled: !!competitionId,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
}

export function useUploadSubmission(competitionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => uploadSubmission(competitionId, payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key(competitionId) });
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['mySubmission', competitionId || 'featured'] });
    },
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createCompetition(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      return data;
    },
  });
}
