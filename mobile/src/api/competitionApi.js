import client from './client';

export async function fetchCompetitionDetails(competitionId) {
  const targetId = competitionId && competitionId !== 'REPLACE_WITH_SEEDED_COMPETITION_ID'
    ? competitionId
    : 'feedants-classical-dance';

  const { data } = await client.get(`/competitions/${targetId}`);
  return data.data || data;
}

export async function registerForCompetition(competitionId, payload = {}) {
  const targetId = competitionId && competitionId !== 'REPLACE_WITH_SEEDED_COMPETITION_ID'
    ? competitionId
    : 'feedants-classical-dance';

  // Real backend endpoint is POST /api/competitions/:id/register
  const { data } = await client.post(`/competitions/${targetId}/register`, payload);
  return data.data || data;
}

export async function uploadSubmission(competitionId, { mediaUrl, mediaType = 'video', title, description, file, fileName, fileSize }) {
  const targetId = competitionId && competitionId !== 'REPLACE_WITH_SEEDED_COMPETITION_ID'
    ? competitionId
    : 'feedants-classical-dance';

  let finalUrl = mediaUrl;

  // If local file is uploaded via FormData
  if (file && (file.uri || file instanceof Blob || typeof File !== 'undefined' && file instanceof File)) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: uploadData } = await client.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (uploadData?.url) {
        finalUrl = uploadData.url;
      }
    } catch (_uploadErr) {
      // Continue with provided mediaUrl if direct upload fails
    }
  }

  const endpoint = `/competitions/${targetId}/submissions`;
  const { data } = await client.post(endpoint, {
    videoUrl: finalUrl || mediaUrl,
    mediaUrl: finalUrl || mediaUrl,
    title: title || 'Classical Dance Performance',
    description: description || '',
    mediaType: mediaType || 'video',
    fileName: fileName || file?.name || 'performance.mp4',
    fileSize: fileSize || file?.size || 0,
    submittedAt: new Date().toISOString(),
  });

  return data.data || data;
}

export async function fetchPreviousWinners(competitionId) {
  const targetId = competitionId || 'feedants-classical-dance';
  const { data } = await client.get(`/competitions/${targetId}/winners`);
  return data.data || data || [];
}

export async function fetchReviews(competitionId) {
  const targetId = competitionId || 'feedants-classical-dance';
  const { data } = await client.get(`/competitions/${targetId}/reviews`);
  return data.data || data || [];
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data || data;
}
