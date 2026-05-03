import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUserToken(res.data.token);
      setUserData(res.data.user);
      await AsyncStorage.setItem('userToken', res.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(res.data.user));
    } catch (e) {
      console.error(e);
      alert('Login failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  const register = async (username, email, password) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      const loginRes = await api.post('/auth/login', { email, password });
      setUserToken(loginRes.data.token);
      setUserData(loginRes.data.user);
      await AsyncStorage.setItem('userToken', loginRes.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(loginRes.data.user));
    } catch (e) {
      console.error(e.response?.data || e.message);
      alert(`Registration failed: ${e.response?.data?.error || e.message}`);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserData(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setIsLoading(false);
  };

  const updateProfile = async (username, email) => {
    try {
      const res = await api.put('/auth/me', { username, email });
      setUserData(res.data);
      await AsyncStorage.setItem('userData', JSON.stringify(res.data));
      return res.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      let data = await AsyncStorage.getItem('userData');
      
      if (token) {
        setUserToken(token);
        if (data) {
          setUserData(JSON.parse(data));
        } else {
          // Fallback fetch if data missing
          const res = await api.get('/auth/me');
          setUserData(res.data);
          await AsyncStorage.setItem('userData', JSON.stringify(res.data));
        }
      }
    } catch (e) {
      console.log(`isLogged in error ${e}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    import('../api/axios').then(({ setLogoutHandler }) => {
      setLogoutHandler(logout);
    });
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, updateProfile, isLoading, userToken, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
