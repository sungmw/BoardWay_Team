import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const MatchContext = createContext();

import { API_URL } from '../config';

// ... (BACKUP_DATA stays same)
// 서버 연결 실패 시 보여줄 백업 데이터
const BACKUP_DATA = [
  {
    "id": "m1",
    "games": ["스플랜더", "카탄"],
    "difficulty": "보통",
    "tags": ["입문", "전략"],
    "date": "2026-05-04",
    "startTime": "19:00",
    "ruleVideoUrls": [],
    "location": { "venue": "레드버튼", "branch": "강남점", "address": "서울 강남구" },
    "participants": [{ "nickname": "보드왕", "mannerScore": 6, "isMe": false }],
    "maxPlayers": 4
  },
  {
    "id": "m3",
    "games": ["루미큐브", "다빈치 코드"],
    "difficulty": "쉬움",
    "tags": ["추리", "두뇌"],
    "date": "2026-05-05",
    "startTime": "20:00",
    "ruleVideoUrls": [],
    "location": { "venue": "포퀸스", "branch": "건대점", "address": "서울 광진구" },
    "participants": [{ "nickname": "추리천재", "mannerScore": 5, "isMe": false }],
    "maxPlayers": 4
  },
  {
    "id": "m5",
    "games": ["테라포밍 마스"],
    "difficulty": "매우 어려움",
    "tags": ["전략", "헤비"],
    "date": "2026-05-06",
    "startTime": "18:00",
    "ruleVideoUrls": [],
    "location": { "venue": "홈즈앤루팡", "branch": "잠실점", "address": "서울 송파구" },
    "participants": [{ "nickname": "화성인", "mannerScore": 6, "isMe": false }],
    "maxPlayers": 4
  }
];

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useContext(AuthContext);

  const fetchMatches = async () => {
    // ... (fetchMatches logic remains same)
    console.log('[MatchContext] 서버에서 데이터 가져오기 시도 중...');
    try {
      const response = await fetch(`${API_URL}/matches`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMatches(data.matches || BACKUP_DATA);
    } catch (error) {
      console.log('[MatchContext] 서버 연결 에러 발생:', error.message);
      setMatches(BACKUP_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatchById = async (matchId) => {
    // ... (fetchMatchById logic remains same)
    try {
      const response = await fetch(`${API_URL}/matches/${matchId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Fetch match error:', error);
    }
    return matches.find(m => m.id === matchId) || BACKUP_DATA.find(m => m.id === matchId);
  };

  const [hostMap, setHostMap] = useState({}); // { matchId: hostNickname }

  const joinMatch = async (matchId, nickname, mannerScore, role = 'participant') => {
    if (!token) {
      return { success: false, message: '로그인이 필요합니다.' };
    }

    // 이미 방장이 있는지 확인
    if (role === 'host' && hostMap[matchId]) {
      return { success: false, message: '이미 방장이 정해진 매치입니다.' };
    }

    console.log(`[MatchContext] 매치 참여 요청 시작: MatchID=${matchId}, Role=${role}`);
    try {
      const response = await fetch(`${API_URL}/matches/${matchId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        if (role === 'host') {
          setHostMap(prev => ({ ...prev, [matchId]: nickname }));
        }
        await fetchMatches();
        return { success: true };
      } else if (response.status === 401) {
        // 인증 실패 시 (예: DB 초기화로 사용자가 삭제됨)
        await logout();
        return { success: false, message: '세션이 만료되었거나 사용자 정보가 없습니다. 다시 로그인해주세요.' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || '참여에 실패했습니다.' };
      }
    } catch (error) {
      console.error('[MatchContext] 참여 요청 에러:', error);
      return { success: false, message: '서버와 통신할 수 없습니다.' };
    }
  };

  const leaveMatch = async (matchId) => {
    if (!token) return { success: false, message: '로그인이 필요합니다.' };

    try {
      const response = await fetch(`${API_URL}/matches/${matchId}/leave`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
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
    } catch (error) {
      return { success: false, message: '서버와 통신할 수 없습니다.' };
    }
  };

  return (
    <MatchContext.Provider value={{ matches, joinMatch, leaveMatch, loading, fetchMatches, fetchMatchById, hostMap }}>
      {children}
    </MatchContext.Provider>
  );
};
