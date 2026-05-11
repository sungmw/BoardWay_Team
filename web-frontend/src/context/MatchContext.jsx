import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useContext(AuthContext);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches');
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Fetch matches error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatchById = async (matchId) => {
    try {
      const response = await api.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch match error:', error);
      return matches.find(m => String(m.id) === String(matchId));
    }
  };

  const joinMatch = async (matchId) => {
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    try {
      await api.post(`/matches/${matchId}/join`);
      await fetchMatches();
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        await logout();
        return { success: false, message: '세션이 만료되었습니다. 다시 로그인해주세요.' };
      }
      return { success: false, message: error.response?.data?.detail || '참여에 실패했습니다.' };
    }
  };

  const leaveMatch = async (matchId) => {
    if (!token) return { success: false, message: '로그인이 필요합니다.' };
    try {
      await api.delete(`/matches/${matchId}/leave`);
      await fetchMatches();
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        await logout();
        return { success: false, message: '세션이 만료되었습니다. 다시 로그인해주세요.' };
      }
      return { success: false, message: error.response?.data?.detail || '탈퇴에 실패했습니다.' };
    }
  };

  return (
    <MatchContext.Provider value={{ matches, joinMatch, leaveMatch, loading, fetchMatches, fetchMatchById }}>
      {children}
    </MatchContext.Provider>
  );
};
