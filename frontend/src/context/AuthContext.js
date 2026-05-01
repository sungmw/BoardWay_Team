import React, { createContext, useState } from 'react';
import { Alert } from 'react-native';

export const AuthContext = createContext();

const API_URL = 'http://192.168.219.124:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null이면 비로그인, 객체면 로그인 상태

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
        setUser(data.user);
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

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
