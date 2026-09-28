import client from './client';

const unwrap = (data) => data?.data || data;
const idempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function fetchCompetitions() {
  const { data } = await client.get('/competitions');
  return unwrap(data).items || [];
}

export async function fetchCompetitionDetails(competitionId) {
  if (!competitionId) throw new Error('No competition was selected.');

  const { data } = await client.get(`/competitions/${competitionId}`);
  const body = unwrap(data);
  const competition = body.competition || {};
  return {
    ...competition,
    availability: body.availability,
    lifecycle: body.lifecycle,
    viewer: body.viewer,
    action: body.viewer?.primaryAction || body.anonymousAction,
    dates: { ...competition.dates, serverTime: body.serverTime },
    state: body.lifecycle?.phase,
    countdownTargetAt: body.lifecycle?.nextDeadline?.at || null,
    about: competition.tabs?.about || '',
    judgingParameters: competition.tabs?.judgingParameters || [],
    rulesAndEligibility: competition.tabs?.rulesAndEligibility || [],
    disclaimerText: competition.disclaimer || '',
    prizeMoneyInfoVideoUrl: competition.prizeInfoVideoUrl || null,
  };
}

export async function registerForCompetition(competitionId, payload = {}) {
  if (!competitionId) throw new Error('No competition was selected.');
  const { data } = await client.post(`/competitions/${competitionId}/registrations`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey() },
  });
  return unwrap(data);
}

export async function uploadSubmission(competitionId, { mediaUrl, mediaType = 'video', title, description, file, fileName, fileSize }) {
  if (!competitionId) throw new Error('No competition was selected.');
  if (!file && !mediaUrl) throw new Error('Select a submission file before continuing.');

  let finalUrl = mediaUrl;

  // If local file is uploaded via FormData
  if (file && (file.uri || file instanceof Blob || typeof File !== 'undefined' && file instanceof File)) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: uploadData } = await client.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      finalUrl = unwrap(uploadData).url;
    } catch (uploadError) {
      throw uploadError;
    }
  }

  const { data } = await client.post(`/competitions/${competitionId}/submissions`, {
    mediaUrl: finalUrl,
    caption: [title, description].filter(Boolean).join('\n') || undefined,
  });

  return unwrap(data);
}

export async function fetchPreviousWinners(competitionId) {
  const details = await fetchCompetitionDetails(competitionId);
  return details.previousWinners || [];
}

export async function fetchReviews(competitionId) {
  if (!competitionId) return [];
  const { data } = await client.get(`/competitions/${competitionId}/testimonials`);
  return unwrap(data).items || [];
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return unwrap(data);
}

export async function createCompetition(payload) {
  const { data } = await client.post('/competitions', payload);
  return unwrap(data);
}

