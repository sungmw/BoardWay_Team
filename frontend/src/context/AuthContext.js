import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

import { notify } from '../utils/dialog';
import { apiFetch } from '../utils/api';

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
      const response = await apiFetch('/me', { token: authToken });
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
      notify('알림', '이메일과 비밀번호를 입력해주세요.');
      return false;
    }

    try {
      const response = await apiFetch('/login', {
        method: 'POST',
        json: { email, password },
      });

      const data = await response.json();

      if (response.ok) {
        const userToken = data.access_token;
        const userData = data.user;
        
        setToken(userToken);
        setUser(userData); // userData.points 가 useEffect 를 통해 setPoints 자동 반영
        await AsyncStorage.setItem('userToken', userToken);
        return true;
      } else {
        notify('로그인 실패', data.detail || '이메일 또는 비밀번호를 확인해주세요.');
        return false;
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      notify('에러', '서버와 연결할 수 없습니다.');
      return false;
    }
  };

  const signup = async (email, password, nickname) => {
    if (!email || !password || !nickname) {
      notify('알림', '모든 정보를 입력해주세요.');
      return false;
    }

    try {
      const response = await apiFetch('/signup', {
        method: 'POST',
        json: { email, password, nickname, mannerScore: 5 },
      });

      const data = await response.json();

      if (response.ok) {
        notify('가입 완료', '회원가입이 완료되었습니다! 로그인 해주세요.');
        return true;
      } else {
        notify('가입 실패', data.detail || '이미 사용 중인 이메일이거나 오류가 발생했습니다.');
        return false;
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      notify('에러', '서버와 연결할 수 없습니다.');
      return false;
    }
  };

  const [points, setPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [reviewedMatches, setReviewedMatches] = useState([]);
  const [settledMatches, setSettledMatches] = useState([]);

  // 유저가 로그인하거나 변경될 때 해당 유저의 데이터 로드
  useEffect(() => {
    if (user) {
      setPoints(user.points || 0); // 잔액은 서버에서 받은 user.points
      loadUserPointHistory(); // 히스토리도 서버에서
      loadUserReviewData(); // 리뷰 완료 매치 ID 리스트도 서버에서
      loadUserSettlementData(user.email);
    } else {
      setPoints(0);
      setPointHistory([]);
      setReviewedMatches([]);
      setSettledMatches([]);
    }
  }, [user, token]);

  const loadUserPointHistory = async () => {
    if (!token) return;
    try {
      const response = await apiFetch('/me/points/history', { token });
      if (!response.ok) {
        console.error('포인트 히스토리 조회 실패', response.status);
        return;
      }
      const data = await response.json();
      setPointHistory(data);
    } catch (e) {
      console.error('Failed to load point history', e);
    }
  };

  const loadUserReviewData = async () => {
    if (!token) return;
    try {
      const response = await apiFetch('/me/reviewed-matches', { token });
      if (!response.ok) {
        console.error('리뷰 완료 매치 조회 실패', response.status);
        return;
      }
      const data = await response.json();
      setReviewedMatches(data); // 비즈니스 ID 리스트 (예: ["m1", "m3"])
    } catch (e) {
      console.error('Failed to load reviewed matches', e);
    }
  };

  const loadUserSettlementData = async (email) => {
    try {
      const storedSettlements = await AsyncStorage.getItem(`settled_${email}`);
      setSettledMatches(storedSettlements ? JSON.parse(storedSettlements) : []);
    } catch (e) {
      console.error('Failed to load settlement data', e);
    }
  };

  const rechargePoints = async (amount, description = '포인트 충전') => {
    if (!user || !token) return false;

    try {
      const response = await apiFetch('/me/points/adjust', {
        method: 'POST',
        token,
        json: { delta: amount, description },
      });
      if (!response.ok) {
        console.error('포인트 적립 실패', response.status);
        return false;
      }
      const updatedUser = await response.json();
      setUser(updatedUser); // points 는 useEffect 가 갱신
      await loadUserPointHistory();
      return true;
    } catch (e) {
      console.error('Failed to recharge points', e);
      return false;
    }
  };

  const usePoints = async (amount, description) => {
    if (!user || !token) return { success: false, message: '로그인이 필요합니다.' };
    if (points < amount) return { success: false, message: '포인트가 부족합니다.' };

    try {
      const response = await apiFetch('/me/points/adjust', {
        method: 'POST',
        token,
        json: { delta: -amount, description },
      });
      if (!response.ok) {
        return { success: false, message: '서버 오류가 발생했습니다.' };
      }
      const updatedUser = await response.json();
      setUser(updatedUser);
      await loadUserPointHistory();
      return { success: true };
    } catch (e) {
      console.error('Failed to use points', e);
      return { success: false, message: '저장 오류가 발생했습니다.' };
    }
  };

  const submitMatchReviews = async (matchId, reviews, comment = '') => {
    if (!user || !token) return { success: false, message: '로그인이 필요합니다.' };
    try {
      const response = await apiFetch('/me/reviews', {
        method: 'POST',
        token,
        json: { match_id: matchId, comment, reviews },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, message: data.detail || '리뷰 제출에 실패했습니다.' };
      }
      await loadUserReviewData(); // 완료 매치 목록 서버에서 다시
      return { success: true };
    } catch (e) {
      console.error('Failed to submit reviews', e);
      return { success: false, message: '서버와 연결할 수 없습니다.' };
    }
  };

  const settleMatchReward = async (matchId, isHost, matchTitle) => {
    if (!user || settledMatches.includes(matchId)) return { success: false, message: '이미 정산된 매치입니다.' };

    let message = '매너 점수가 정산되었습니다.';
    let rewardGiven = false;

    if (isHost) {
      // 방장 리워드 지급 (3000P)
      const reward = 3000;
      await rechargePoints(reward, `[${matchTitle}] 방장 리워드 페이백`);
      message = `참여자들의 높은 평가로 방장 리워드 ${reward.toLocaleString()}P가 지급되었습니다! ✨`;
      rewardGiven = true;
    }

    const newSettled = [...settledMatches, matchId];
    setSettledMatches(newSettled);
    try {
      await AsyncStorage.setItem(`settled_${user.email}`, JSON.stringify(newSettled));
      return { success: true, message, rewardGiven };
    } catch (e) {
      console.error('Failed to save settlement data', e);
      return { success: false, message: '정산 처리 중 오류가 발생했습니다.' };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setPoints(0);
    setPointHistory([]);
    setReviewedMatches([]);
    setSettledMatches([]);
    await AsyncStorage.removeItem('userToken');
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, signup, logout, 
      points, pointHistory, rechargePoints, usePoints, 
      reviewedMatches, submitMatchReviews,
      settledMatches, settleMatchReward
    }}>
      {children}
    </AuthContext.Provider>
  );
};
