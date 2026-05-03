import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// UPDATE THIS with your actual Render URL after deployment!
const LIVE_URL = 'https://appwmt-production.up.railway.app/api/';
const LOCAL_URL = Platform.OS === 'web' ? 'http://localhost:5050/api/' : 'http://192.168.8.110:5050/api/';

const api = axios.create({
  baseURL: LOCAL_URL, // Use LOCAL_URL for development
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      if (logoutHandler) {
        logoutHandler();
      }
      console.warn('Unauthorized! Token cleared and logged out.');
    }
    return Promise.reject(error);
  }
);

export default api;
