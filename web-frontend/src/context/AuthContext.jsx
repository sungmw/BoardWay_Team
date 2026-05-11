import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          await fetchUserInfo(storedToken);
        }
      } catch (e) {
        console.error('Failed to load storage data', e);
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const fetchUserInfo = async (authToken) => {
    try {
      // Temporarily set token in headers for this request
      const response = await api.get('/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Fetch user info error:', error);
      await logout();
    }
  };

  const login = async (email, password) => {
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return false;
    }

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      return true;
    } catch (error) {
      console.error('로그인 에러:', error);
      alert(error.response?.data?.detail || '이메일 또는 비밀번호를 확인해주세요.');
      return false;
    }
  };

  const signup = async (email, password, nickname) => {
    if (!email || !password || !nickname) {
      alert('모든 정보를 입력해주세요.');
      return false;
    }

    try {
      await api.post('/signup', { email, password, nickname, mannerScore: 5 });
      alert('회원가입이 완료되었습니다! 로그인 해주세요.');
      return true;
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert(error.response?.data?.detail || '이미 사용 중인 이메일이거나 오류가 발생했습니다.');
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
