import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCAL_URL = 'http://localhost:5000/api';
const VERCEL_URL = 'https://backend-9oaqzhrxg-swapnit18s-projects.vercel.app/api';

// Prefer local backend during development/web runs to avoid CORS/Vercel auth walls
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? LOCAL_URL : VERCEL_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_e) {
    // Ignore storage read errors
  }
  return config;
});

// Normalise error shape so screens can just read `error.message`.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default client;
