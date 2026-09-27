import client from './client';

export async function fetchCompetitionDetails(competitionId) {
  if (!competitionId || competitionId === 'REPLACE_WITH_SEEDED_COMPETITION_ID') {
    const { data } = await client.get('/competitions');
    return data.data;
  }
  const { data } = await client.get(`/competitions/${competitionId}`);
  return data.data;
}

export async function registerForCompetition(competitionId, payload = {}) {
  const targetId = competitionId && competitionId !== 'REPLACE_WITH_SEEDED_COMPETITION_ID' ? competitionId : '';
  const endpoint = targetId ? `/competitions/${targetId}/register` : '/competitions/register';
  const { data } = await client.post(endpoint, payload);
  return data.data;
}

export async function uploadSubmission(competitionId, { mediaUrl, mediaType = 'video' }) {
  // Reference implementation posts a JSON body with an already-uploaded
  // media URL (e.g. from a direct-to-S3 pre-signed upload). Swap for a
  // multipart FormData post to the same endpoint if uploading raw files
  // through the API instead -- see backend/src/routes/submissionRoutes.js.
  const { data } = await client.post(`/competitions/${competitionId}/submissions`, {
    mediaUrl,
    mediaType,
  });
  return data.data;
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}
