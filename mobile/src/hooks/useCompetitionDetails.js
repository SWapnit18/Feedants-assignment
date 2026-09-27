import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompetitionDetails,
  registerForCompetition,
  uploadSubmission,
} from '../api/competitionApi';

const key = (id) => ['competition', id];

/**
 * Polling interval for the details query. Short enough that "spots left"
 * feels near-live to a user watching the screen as a popular competition
 * fills up, long enough not to hammer the backend. In production this is a
 * good candidate to replace with a WebSocket/SSE push on spotsBooked
 * changes instead of polling, especially at "thousands of concurrent
 * users" scale.
 */
const POLL_INTERVAL_MS = 15000;

export function useCompetitionDetails(competitionId) {
  return useQuery({
    queryKey: key(competitionId),
    queryFn: () => fetchCompetitionDetails(competitionId),
    enabled: !!competitionId,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}

export function useRegister(competitionId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => registerForCompetition(competitionId, payload),
    // Re-fetch details immediately on success/failure so spotsLeft, the
    // action button, and isRegistered all reflect the authoritative
    // server state rather than an optimistic guess (registration touches
    // a shared, contended counter -- optimistic updates here would be
    // actively misleading if the request actually lost the race).
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
