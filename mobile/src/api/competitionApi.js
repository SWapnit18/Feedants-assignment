import client from './client';

export async function fetchCompetitionDetails(competitionId) {
  try {
    if (!competitionId || competitionId === 'REPLACE_WITH_SEEDED_COMPETITION_ID') {
      const { data } = await client.get('/competitions');
      return data.data;
    }
    const { data } = await client.get(`/competitions/${competitionId}`);
    return data.data;
  } catch (err) {
    // Graceful fallback to primary competition
    const { data } = await client.get('/competitions');
    return data.data;
  }
}

export async function registerForCompetition(competitionId, payload = {}) {
  try {
    const targetId =
      competitionId && competitionId !== 'REPLACE_WITH_SEEDED_COMPETITION_ID'
        ? competitionId
        : '';
    const endpoint = targetId ? `/competitions/${targetId}/register` : '/competitions/register';
    const { data } = await client.post(endpoint, payload);
    return data.data;
  } catch (err) {
    const { data } = await client.post('/competitions/register', payload);
    return data.data;
  }
}

export async function uploadSubmission(competitionId, { mediaUrl, mediaType = 'video', title, description }) {
  try {
    const targetId =
      competitionId && competitionId !== 'REPLACE_WITH_SEEDED_COMPETITION_ID'
        ? competitionId
        : '';
    const endpoint = targetId ? `/competitions/${targetId}/submissions` : '/competitions/submissions';
    const { data } = await client.post(endpoint, {
      mediaUrl,
      mediaType,
      title,
      description,
    });
    return data.data;
  } catch (err) {
    const { data } = await client.post('/competitions/submissions', {
      mediaUrl,
      mediaType,
      title,
      description,
    });
    return data.data;
  }
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}
