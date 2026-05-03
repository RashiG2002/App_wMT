import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// UPDATE THIS with your actual Render URL after deployment!
const LIVE_URL = 'https://YOUR_RENDER_BACKEND_URL.onrender.com/api';
const LOCAL_URL = Platform.OS === 'web' ? 'http://localhost:5050/api' : 'http://192.168.8.110:5050/api';

const api = axios.create({
  baseURL: LIVE_URL, // Switch to LOCAL_URL when testing on your own machine
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
