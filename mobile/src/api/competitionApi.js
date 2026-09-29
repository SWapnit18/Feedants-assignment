import client from './client';
import {
  MOCK_COMPETITION,
  MOCK_COMPETITIONS_LIST,
  MOCK_TESTIMONIALS,
} from './mockData';

const unwrap = (data) => data?.data || data;
const idempotencyKey = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** True when the error is a connectivity / server-not-running error */
const isOfflineError = (err) => {
  const code = err?.code || '';
  const msg = (err?.message || '').toLowerCase();
  return (
    code === 'ECONNREFUSED' ||
    code === 'ERR_NETWORK' ||
    code === 'NETWORK_ERROR' ||
    msg.includes('network error') ||
    msg.includes('econnrefused') ||
    msg.includes('failed to fetch') ||
    msg.includes('err_connection_refused') ||
    // axios timeout / no response
    err?.response === undefined
  );
};

export async function fetchCompetitions() {
  try {
    const { data } = await client.get('/competitions');
    return unwrap(data).items || [];
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('[competitionApi] Offline: using mock competitions list');
      return MOCK_COMPETITIONS_LIST;
    }
    throw err;
  }
}

export async function fetchCompetitionDetails(competitionId) {
  if (!competitionId) throw new Error('No competition was selected.');

  try {
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
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('[competitionApi] Offline: using mock competition details');
      return { ...MOCK_COMPETITION };
    }
    throw err;
  }
}

export async function registerForCompetition(competitionId, payload = {}) {
  if (!competitionId) throw new Error('No competition was selected.');
  const { data } = await client.post(`/competitions/${competitionId}/registrations`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey() },
  });
  return unwrap(data);
}

export async function uploadSubmission(competitionId, { mediaUrl, videoUrl, mediaType = 'video', title, description, file, fileName, videoFileName, fileSize }) {
  if (!competitionId) throw new Error('No competition was selected.');
  if (!file && !mediaUrl && !videoUrl) throw new Error('Select a submission file before continuing.');

  let finalUrl = videoUrl || mediaUrl;
  let finalFileName = videoFileName || fileName || (file && file.name) || 'performance_video.mp4';

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
      console.warn('Upload failed (likely Vercel read-only FS). Falling back to local blob URL.', uploadError);
      finalUrl = videoUrl || mediaUrl; // Fallback to local Blob URL so it plays in the current session
    }
  }

  if (typeof window !== 'undefined' && window?.localStorage && finalUrl) {
    try {
      window.localStorage.setItem(`feedants_sub_url_${competitionId}`, finalUrl);
      window.localStorage.setItem('feedants_last_submission_url', finalUrl);
    } catch (e) {}
  }

  const { data } = await client.post(`/competitions/${competitionId}/submissions`, {
    mediaUrl: finalUrl,
    videoUrl: finalUrl,
    videoFileName: finalFileName,
    fileName: finalFileName,
    fileSize,
    title,
    description,
    caption: [title, description].filter(Boolean).join('\n') || undefined,
  });

  return unwrap(data);
}

export async function fetchMySubmission(competitionId) {
  if (!competitionId) return null;
  try {
    const { data } = await client.get(`/competitions/${competitionId}/submissions/me`);
    return unwrap(data)?.submission || null;
  } catch (err) {
    return null;
  }
}

export async function fetchPreviousWinners(competitionId) {
  const details = await fetchCompetitionDetails(competitionId);
  return details.previousWinners || [];
}

export async function fetchReviews(competitionId) {
  if (!competitionId) return [];
  try {
    const { data } = await client.get(`/competitions/${competitionId}/testimonials`);
    return unwrap(data).items || [];
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('[competitionApi] Offline: using mock testimonials');
      return MOCK_TESTIMONIALS;
    }
    throw err;
  }
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return unwrap(data);
}

export async function createCompetition(payload) {
  const { data } = await client.post('/competitions', payload);
  return unwrap(data);
}

