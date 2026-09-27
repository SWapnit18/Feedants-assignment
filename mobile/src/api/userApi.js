import client from './client';

export async function fetchCurrentUser() {
  try {
    const { data } = await client.get('/auth/me');
    return data.data || data.user || data;
  } catch (err) {
    // Return null if unauthenticated or network error so UI handles it gracefully
    return null;
  }
}

export async function updateCurrentUser(payload) {
  const { data } = await client.put('/auth/me', payload);
  return data.data || data.user || data;
}
