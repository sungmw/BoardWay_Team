import { Platform } from 'react-native';

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL =
  envApiUrl ||
  (Platform.OS === 'web' ? 'http://localhost:8000' : 'http://10.0.2.2:8000');
