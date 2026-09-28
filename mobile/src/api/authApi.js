import AsyncStorage from '@react-native-async-storage/async-storage';
import client from './client';

const unwrap = (res) => res?.data?.data || res?.data || res;

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

/**
 * Sign In with email and password
 * @param {{ email: string, password: string }} credentials
 */
export async function signIn({ email, password }) {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const response = await client.post('/auth/sign-in', {
    email: email.trim().toLowerCase(),
    password,
  });

  const body = unwrap(response);
  const token = body.token || response?.data?.token;
  const user = body.user || response?.data?.user;

  if (token) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }
  if (user) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  return { token, user };
}

/**
 * Sign Up with full name, email, and password
 * @param {{ name: string, email: string, password: string }} payload
 */
export async function signUp({ name, email, password }) {
  if (!name?.trim()) {
    throw new Error('Full name is required.');
  }
  if (!email?.trim() || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const response = await client.post('/auth/sign-up', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  const body = unwrap(response);
  const token = body.token || response?.data?.token;
  const user = body.user || response?.data?.user;

  if (token) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }
  if (user) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  return { token, user };
}

/**
 * Fast 1-Tap Demo Login
 */
export async function devLogin(email = 'user@feedants.dev') {
  const response = await client.post('/auth/dev-login', {
    email: email.trim().toLowerCase(),
  });

  const body = unwrap(response);
  const token = body.token || response?.data?.token;
  const user = body.user || response?.data?.user;

  if (token) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
  }
  if (user) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  return { token, user };
}

/**
 * Get current session user from local storage
 */
export async function getStoredUser() {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
}

/**
 * Sign out and clear stored tokens
 */
export async function signOut() {
  await AsyncStorage.multiRemove([AUTH_STORAGE_KEYS.TOKEN, AUTH_STORAGE_KEYS.USER]);
}
