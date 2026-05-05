import React, { createContext, useState, useEffect } from 'react';

export const MatchContext = createContext();

// 로컬 테스트 시에는 'http://localhost:8000'
const API_URL = 'http://172.20.10.4:8000';

// 서버 연결 실패 시 보여줄 백업 데이터
const BACKUP_DATA = [
  {
    "id": "m1",
    "games": ["스플랜더", "카탄", "루미큐브"],
    "difficulty": "Easy",
    "tags": ["파티/캐주얼", "초보 환영"],
    "date": "2026-05-06",
    "startTime": "19:00",
    "ruleVideoUrls": ["https://youtu.be/3Y-VZ3pCSlw", "https://youtu.be/37V2ajpMEic", "https://youtu.be/uHuYRzgzbL8"],
    "location": { "venue": "레드버튼", "branch": "강남점", "address": "서울 강남구 강남대로 432" },
    "participants": [{ "nickname": "보드마스터", "mannerScore": 6, "isMe": false }],
    "maxPlayers": 4
  },
  {
    "id": "m2",
    "games": ["테라포밍 마스", "가이아 프로젝트"],
    "difficulty": "Hard",
    "tags": ["전략 집중"],
    "date": "2026-05-07",
    "startTime": "20:00",
    "ruleVideoUrls": ["https://www.youtube.com/watch?v=kYJqD0E4X5Y"],
    "location": { "venue": "홈즈앤루팡", "branch": "홍대점", "address": "서울 마포구 홍익로 25" },
    "participants": [{ "nickname": "전략가", "mannerScore": 5, "isMe": false }],
    "maxPlayers": 4
  }
];

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    console.log('[MatchContext] 서버에서 데이터 가져오기 시도 중...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[MatchContext] 3초 경과: 서버 연결 타임아웃 발생');
      controller.abort();
    }, 3000);

    try {
      const response = await fetch(`${API_URL}/matches`, { signal: controller.signal });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('[MatchContext] 데이터 수신 성공:', data.matches?.length, '개의 매치');
      setMatches(data.matches || BACKUP_DATA);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('[MatchContext] 서버 응답 시간이 너무 길어 백업 데이터를 사용합니다.');
      } else {
        console.log('[MatchContext] 서버 연결 에러 발생:', error.message);
      }
      setMatches(BACKUP_DATA);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      console.log('[MatchContext] 로딩 상태 종료');
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const joinMatch = async (matchId, nickname, mannerScore) => {
    console.log(`[MatchContext] 매치 참여 요청 시작: MatchID=${matchId}, User=${nickname}`);
    try {
      const response = await fetch(`${API_URL}/matches/${matchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, mannerScore }),
      });

      if (response.ok) {
        console.log('[MatchContext] 참여 성공! 데이터를 새로고침합니다.');
        await fetchMatches();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('[MatchContext] 참여 실패:', errorData.detail);
        return { success: false, message: errorData.detail };
      }
    } catch (error) {
      console.error('[MatchContext] 참여 요청 중 네트워크 에러:', error);
      return { success: false, message: '네트워크 통신 오류가 발생했습니다.' };
    }
  };

  return (
    <MatchContext.Provider value={{ matches, joinMatch, loading, fetchMatches }}>
      {children}
    </MatchContext.Provider>
  );
};
