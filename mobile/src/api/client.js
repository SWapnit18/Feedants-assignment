import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1');

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

if (Platform.OS === 'web') globalThis.__feedantsApiClient = client;

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
      error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default client;
