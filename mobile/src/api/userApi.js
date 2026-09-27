import client from './client';

export async function fetchCurrentUser() {
  const { data } = await client.get('/me');
  return data.user || data;
}

export async function updateCurrentUser(payload) {
  const { data } = await client.put('/me', payload);
  return data.user || data;
}
