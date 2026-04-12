import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData, userToken) => {
    try {
      await AsyncStorage.setItem('token', userToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(userToken);
    } catch (error) {
      console.log('Error saving user:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return { user, token, loading, saveUser, logout };
};

export default useAuth;