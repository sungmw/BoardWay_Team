import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

// 로컬 테스트 시에는 'http://localhost:8000' 또는 'http://10.0.2.2:8000' (안드로이드 에뮬레이터)
// 실제 기기 테스트 시에는 서버 컴퓨터의 IP 주소를 입력해야 합니다.
const API_URL = 'http://172.20.10.4:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 앱 시작 시 저장된 토큰 확인
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          // 토큰이 있으면 사용자 정보 가져오기
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
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        // 토큰이 만료되었거나 유효하지 않은 경우
        await logout();
      }
    } catch (error) {
      console.error('Fetch user info error:', error);
    }
  };

  const login = async (email, password) => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userToken = data.access_token;
        const userData = data.user;
        
        setToken(userToken);
        setUser(userData);
        
        await AsyncStorage.setItem('userToken', userToken);
        return true;
      } else {
        Alert.alert('로그인 실패', data.detail || '이메일 또는 비밀번호를 확인해주세요.');
        return false;
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      Alert.alert('에러', '서버와 연결할 수 없습니다.');
      return false;
    }
  };

  const signup = async (email, password, nickname) => {
    if (!email || !password || !nickname) {
      Alert.alert('알림', '모든 정보를 입력해주세요.');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname, mannerScore: 5 }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('가입 완료', '회원가입이 완료되었습니다! 로그인 해주세요.');
        return true;
      } else {
        Alert.alert('가입 실패', data.detail || '이미 사용 중인 이메일이거나 오류가 발생했습니다.');
        return false;
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      Alert.alert('에러', '서버와 연결할 수 없습니다.');
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
