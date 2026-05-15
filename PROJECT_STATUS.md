# 📊 BoardWay 프로젝트 현황 및 로드맵

이 문서는 BoardWay 프로젝트의 현재 구현 상태, 기술적 당면 과제, 그리고 향후 개발 방향성을 정리한 문서입니다.

---

## 🏗 현재 기술 스택

| 레이어 | 기술 |
| :--- | :--- |
| **클라이언트** | Expo SDK 54 (React Native 0.81 / React 19) — iOS·Android·Web 단일 코드 |
| **백엔드** | FastAPI (Python 3.x) |
| **데이터베이스** | SQLAlchemy + SQLite 기본값, Supabase PostgreSQL 전환 가능 |
| **인증** | JWT Bearer Token (HS256, 7일) + bcrypt + SHA-256 pre-hash |
| **인프라** | 로컬 개발 환경 |

---

## ✅ 현재 구현 완료 사항

- **UI/UX**: 인트로(애니메이션), 로그인, 회원가입, 매칭 탐색(Discovery), 매칭 상세, 마이페이지, 포인트/리뷰/채팅/내매치 화면 (총 14개)
- **상태 관리**: Context API (`AuthContext`, `MatchContext`)
- **백엔드 API**: `/matches` GET·POST·DELETE, `/matches/{id}/join`, `/matches/{id}/leave`, `/my-matches`, `/games`, `/signup`, `/login`, `/me`
- **연동**: Google Maps 임베드 (웹 iframe / 모바일 WebView 자동 분기), 유튜브 룰 영상, 종료 시간 자동 계산

---

## 🔧 2026-05-16 정리 작업 (이번 세션)

### 구조
- `web-frontend/`(Vite) 폴더 폐기. **Expo 단일 코드베이스**로 통합. `npx expo start --web` 으로 브라우저에서 동작.
- 모바일 화면이 웹에서도 그대로 — 코드 한 번 짜면 양쪽 다.

### 백엔드 안전 정리
- `auth_utils.py`: `SECRET_KEY` 환경변수 미설정 시 부팅 실패 (기본값 제거)
- `main.py`: CORS 와일드카드 → `CORS_ORIGINS` 환경변수 화이트리스트
- `schemas.py`: `EmailStr` 적용 (이메일 형식 검증 강화)
- `seed.py`: `--reset` 플래그 + 확인 프롬프트 없이는 DB wipe 안 함
- `requirements.txt`: `email-validator` 추가

### 프론트 정리·웹 호환
- `MatchContext`: `BACKUP_DATA` 폴백 제거 (서버 에러를 가짜 데이터로 가리던 문제), 디버그 `console.log` 정리
- `MatchDetailScreen`: `MapEmbed` / `YoutubeEmbed` wrapper 추가. `Platform.OS === 'web'` 분기로 iframe / 모바일 라이브러리 자동 선택
- 지도 URL을 `maps.google.com/maps?...&output=embed` 로 (X-Frame-Options 차단 회피)
- `MyPageScreen`: dice 아이콘 이름 `dice-{숫자}-outline` → `dice-{영어단어}-outline` (Ionicons 명명 규칙)

---

## 🚨 핵심 문제점 및 개선 필요 사항 (남은 부채)

1. **마이그레이션 부재**: 모델 변경 시 SQLite 수동 삭제 또는 `seed.py --reset` 필요. **Alembic 도입 권장**.
2. **클라이언트 전용 상태**: 포인트·리뷰·호스트·정산 데이터가 AsyncStorage 에만 저장. 로그아웃·기기변경 시 소실. 백엔드 컬럼·엔드포인트 부재.
3. **채팅 미구현**: `ChatListScreen`/`ChatRoomScreen` UI만 존재. WebSocket·메시지 저장·엔드포인트 모두 없음.
4. **모바일 fetch 패턴**: raw `fetch()` + 수동 토큰 부착이 화면마다 반복. 401 처리도 단순 logout 만. 래퍼화 + 토큰 갱신 필요.
5. **시드 매치 날짜 하드코딩**: 2026-05-11~17 고정. 다른 시점에 데모하면 빈 화면.

---

## 🗺 향후 개발 파이프라인

### Phase 1: 기반 다지기 (현재 진행중)
- [x] 로컬 DB 연동 (SQLite)
- [x] Expo Web 통합 (모바일·웹 코드 일원화)
- [x] 보안·검증 기본 정리 (CORS, SECRET_KEY, EmailStr, seed 가드)
- [ ] **다음 작업: Alembic 도입** → DB 모델 변경 안전 추적
- [ ] Supabase PostgreSQL 연결 검증

### Phase 2: 핵심 기능 완성
- [ ] **포인트 시스템 백엔드 이전** — 풀스택 1사이클 학습 과제 (model→crud→endpoint→client)
- [ ] **리뷰 시스템 백엔드 이전** — 같은 패턴
- [ ] **매치 생성 기능** — 사용자가 직접 매치 만들기
- [ ] **실시간 동기화** — WebSocket 또는 폴링

### Phase 3: 서비스 품질
- [ ] **모바일 fetch 래퍼** + 401 토큰 갱신 로직
- [ ] 글로벌 에러 경계 + 로딩 스켈레톤 UI
- [ ] 채팅 실 구현 (또는 UI 비활성화 결정)

### Phase 4: 배포
- [ ] Backend (Railway/Render), Frontend (Expo EAS)
- [ ] 푸시 알림 (Expo Notifications)
- [ ] 위치 서비스 고도화

