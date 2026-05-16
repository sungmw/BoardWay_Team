import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const MatchContext = createContext();

import { apiFetch } from '../utils/api';

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout } = useContext(AuthContext);

  const fetchMatches = async () => {
    setError(null);
    try {
      const response = await apiFetch('/matches');
      if (!response.ok) throw new Error(`서버 응답 오류 (${response.status})`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (e) {
      setMatches([]);
      setError(e.message || '서버와 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatchById = async (matchId) => {
    try {
      const response = await apiFetch(`/matches/${matchId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // 네트워크 오류는 호출자에서 처리. 여기선 캐시된 매치만 폴백.
    }
    return matches.find(m => m.id === matchId) || null;
  };

  const joinMatch = async (matchId, role = 'participant') => {
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    try {
      const response = await apiFetch(`/matches/${matchId}/join`, {
        method: 'POST',
        token,
        json: { role },
      });

      if (response.ok) {
        await fetchMatches();
        return { success: true };
      } else if (response.status === 401) {
        await logout();
        return { success: false, message: '세션이 만료되었거나 사용자 정보가 없습니다. 다시 로그인해주세요.' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || '참여에 실패했습니다.' };
      }
    } catch (e) {
      return { success: false, message: '서버와 통신할 수 없습니다.' };
    }
  };

  const leaveMatch = async (matchId) => {
    if (!token) return { success: false, message: '로그인이 필요합니다.' };

    try {
      const response = await apiFetch(`/matches/${matchId}/leave`, {
        method: 'DELETE',
        token,
      });

      if (response.ok) {
        await fetchMatches();
        return { success: true };
      } else if (response.status === 401) {
        await logout();
        return { success: false, message: '세션이 만료되었습니다. 다시 로그인해주세요.' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || '탈퇴에 실패했습니다.' };
      }
    } catch (e) {
      return { success: false, message: '서버와 통신할 수 없습니다.' };
    }
  };

  return (
    <MatchContext.Provider value={{ matches, joinMatch, leaveMatch, loading, error, fetchMatches, fetchMatchById }}>
      {children}
    </MatchContext.Provider>
  );
};
