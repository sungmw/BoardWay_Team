# 📊 BoardWay 프로젝트 현황 및 로드맵

이 문서는 BoardWay 프로젝트의 현재 구현 상태와 향후 방향성을 정리한 팀 공유용 문서입니다.
(최종 갱신: 2026-05-16 — 9차 회귀 점검 완료 시점)

---

## 🏗 현재 기술 스택

| 레이어 | 기술 |
| :--- | :--- |
| **클라이언트** | Expo SDK 54 (React Native 0.81 / React 19) — iOS·Android·Web **단일 코드베이스** |
| **백엔드** | FastAPI (Python 3.x, 3.14 까지 검증) |
| **데이터베이스** | SQLAlchemy + SQLite 기본값, Supabase PostgreSQL 전환 가능 |
| **마이그레이션** | Alembic (env.py 가 database.py 의 engine 자동 연결) |
| **인증** | JWT Bearer Token (HS256, 7일) + bcrypt + SHA-256 pre-hash |
| **인프라** | 로컬 개발 환경 |

---

## ✅ 현재 구현 완료 사항

### 화면 (14개)
인트로(애니메이션), 로그인, 회원가입, 매칭 탐색(Discovery), 게임 검색·상세, 매칭 상세, 매칭 결제, 매칭 생성, 내 매치, 마이페이지, 포인트 내역, 채팅 목록·방, 리뷰 작성.

### 백엔드 API
- 매치: `GET/POST /matches`, `GET/DELETE /matches/{id}`, `POST /matches/{id}/join`, `DELETE /matches/{id}/leave`, `GET /my-matches`
- 인증: `POST /signup`, `POST /login`, `GET /me`
- 포인트: `POST /me/points/adjust`, `GET /me/points/history`
- 리뷰: `POST /me/reviews`, `GET /me/reviewed-matches`
- 정산: `POST /matches/{id}/settle`, `GET /me/settled-matches`
- 채팅: `GET /matches/{id}/messages`, `POST /matches/{id}/messages`
- 기타: `GET /games`

### 인프라·구조
- **Expo Web 통합** — 모바일·웹 한 코드 (이전엔 `web-frontend/` Vite 별도, 폐기됨)
- **Alembic 마이그레이션** — 9차까지 8개 리비전 누적 (베이스라인 + 7개)
- **연동**: Google Maps (웹 iframe / 모바일 WebView 자동 분기), 유튜브 룰 영상

---

## 🔧 작업 이력 (2026-05-16, 9차까지)

### 1차 — Expo 통합 + 백엔드 안전 정리
- `web-frontend/` 폐기, Expo 단일 코드베이스 확정
- `SECRET_KEY` 미설정 시 부팅 실패, CORS 화이트리스트, EmailStr, seed wipe 가드
- `MatchContext` 의 `BACKUP_DATA` 폴백 제거 (가짜 데이터로 서버 에러 가리던 문제)

### 2차 — macOS 셋업 + Alembic 도입
- requirements 핀 전부 제거 → fastapi/pydantic/sqlalchemy/bcrypt/psycopg2-binary **코드 0줄 변경**으로 자동 점프 (Python 3.14 호환)
- `alembic/env.py` 가 `database.py` 의 engine + `models.Base.metadata` 자동 연결, 베이스라인 `fd52f693ecd6` 생성. `create_all()` 두 곳 제거 — 스키마 관리 주체는 Alembic
- 프론트 SDK 정합성 정정 (`expo ^54.0.34`, `app.json` 에 `web.bundler="metro"` 명시)

### 3차 — IP 자동감지 + C1 포인트 잔액 서버 이전
- `Constants.expoConfig.hostUri` 에서 Metro 호스트 IP 자동 추출 → 카페·집 옮겨도 `.env` 갱신 불필요
- `User.points` 컬럼 + `POST /me/points/adjust` + 로그인 응답에 잔액 포함
- **Alembic 마이그레이션 사이클 풀스택 첫 검증 완료**

### 4·5차 — C1 포인트 사용 내역 + Alert.alert 함정 해결
- `PointHistory` 테이블 + `GET /me/points/history`, 트랜잭션 INSERT
- `Alert.alert` 가 Expo Web 에서 no-op 라 "버튼 눌러도 아무 일도 안 일어남" 발견 (iOS 에선 정상 → 결정적 단서)
- `utils/dialog.js` 의 `notify`/`confirmAction` 헬퍼로 25곳 일괄 교체. 부수 버그 4건 같이 잡음 (SignUp `await` 누락 등)
- 로그아웃 후 `navigation.reset` 으로 Intro 강제 이동, 마이페이지 비로그인 가드

### 6차 — C2 리뷰 시스템 + 호스트 데이터 + 매너온도 + 매치 생성 + fetch 래퍼
- **(C2) 리뷰**: `Review` 테이블 (rating 1~6), `POST /me/reviews` (한 트랜잭션 N명, 중복 거부)
- **(다) 호스트**: `Match.host_nickname` 서버 이전 — 새로고침해도 👑 유지. 이전 `hostMap` 통째 제거 + `joinMatch(matchId, role)` 시그니처 정리
- **(라) 매너 온도**: `_recompute_manner_score` 가 별점 평균을 받은 사용자에게 자동 반영
- **(마) 매치 생성 UI**: `CreateMatchScreen` + Discovery FAB (비로그인 시 숨김)
- **(바) fetch 래퍼**: `apiFetch(path, { token, json })` 헬퍼로 호출처 일괄 정리, `API_URL` 직접 import 는 한 곳만
- 시드 매치 날짜 동적화 (`_resolve_date`) — 이제 오늘 기준 -5~+1일 자동 분포

### 7차 — 회귀 점검 + PointHistory 날짜 NaN 패치
- Chrome DevTools MCP 로 풀스택 회귀 6/6 통과
- `PointHistoryScreen` 모든 날짜가 `NaN.NaN.NaN` 으로 표시되는 버그 발견·수정. 원인: `Field(alias=...)` 가 응답 키도 `created_at` 으로 바꿔버려 프론트가 `item.date` 읽으면 `undefined`. `validation_alias` (입력 전용) 로 교정

### 8차 — 인증 강화 + 정산 + 채팅 + 작은 정리
- **(다) 인증·권한**: `Match.created_by_user_id` FK + `POST /matches` 토큰 필수 + `DELETE /matches/{id}` 생성자 검증. SQLite ALTER 로 FK 추가 불가 → **`batch_alter_table` 패턴 학습**
- **(가) 호스트 리워드 자동 정산**: `Match.host_settled` + `MatchParticipant.settled`. 매치 종료(date+startTime+2h < now) 검증 후 호스트면 별점 평균 ≥4 시 3,000P 자동 페이백 + PointHistory 자동 기록. `POST /matches/{id}/settle`
- **(나) 채팅 REST 폴링**: `Message` 테이블, `GET /matches/{id}/messages?after_id=N` + `POST`. 프론트 5초 폴링 + 낙관적 append + 권한 검사. WebSocket 은 다음 사이클로 분리
- **(라) 작은 정리**: 매너 점수 round-half-up (`int(avg + 0.5)`) 로 변경 (Python `round()` banker's rounding 회피). `apiFetch` 가 401 만나면 자동 logout 트리거

### 9차 — 회귀 점검 + seed.py 보안 패치
- 8차의 모든 기능 + 7차 시나리오 합쳐 **회귀 점검 11/11 통과**
- 신규 함정 발견: `seed.py --reset` 가 `Message`/`Review`/`PointHistory` 를 안 지워서 신규 가입 시 autoincrement 가 옛 user_id 흡수 → **다른 사용자 포인트 내역 노출 위험**. wipe 순서에 세 테이블 추가하여 영구 해결

---

## 🎯 풀스택 백엔드 이전 — 6사이클 모두 완료

| # | 기능 | 결과 |
|---|---|---|
| C1 | **포인트 시스템** (잔액 + 사용 내역) | 서버 저장, 로그아웃·기기변경 해도 유지 |
| C2 | **리뷰 시스템** (별점 1~6 + 코멘트) | DB 저장 + (reviewer, match) 중복 거부 |
| 호스트 | **방장 정보** | 새로고침해도 👑 유지 |
| 정산 | **호스트 리워드 자동 정산** | 매치 종료 후 별점 평균 ≥4면 3,000P 자동 페이백 |
| 채팅 | **REST 폴링 채팅** | 5초 폴링, 메시지 DB 저장, 권한 검사 |
| 매너온도 | **자동 반영** | 별점 평균 (round-half-up) |

---

## 🗺 향후 개발 파이프라인

### Phase 1: 기반 다지기 ✅
- [x] 로컬 DB 연동 (SQLite)
- [x] Expo Web 통합 (모바일·웹 코드 일원화)
- [x] 보안·검증 기본 정리 (CORS, SECRET_KEY, EmailStr, seed 가드)
- [x] Alembic 도입 — DB 모델 변경 안전 추적
- [ ] Supabase PostgreSQL 연결 검증

### Phase 2: 핵심 기능 완성 ✅
- [x] 포인트 시스템 백엔드 이전 (C1)
- [x] 리뷰 시스템 백엔드 이전 (C2)
- [x] 호스트 데이터 백엔드 이전
- [x] 호스트 리워드 자동 정산
- [x] 매너 온도 자동 반영
- [x] 매치 생성 UI
- [x] 채팅 실 구현 (REST 폴링)

### Phase 3: 기술 부채·아키텍처 (← 현재)
- [ ] **테스트 코드** (pytest + RTL) — 7·9차의 수동 회귀를 자동화
- [ ] **WebSocket 채팅** — 5초 폴링 → 실시간
- [ ] **매치 종료/취소 흐름** — 호스트 취소 시 환불·알림, 종료 시 알림
- [ ] **AuthContext 리듀서화** — useState 6개를 useReducer 로
- [ ] 시드 매치 시각도 동적화 (현재는 날짜만 동적)
- [x] 모바일 fetch 래퍼 + 401 자동 logout (8차에서 완료)
- [ ] 글로벌 에러 경계 + 로딩 스켈레톤 UI

### Phase 4: 배포
- [ ] Backend (Railway/Render), Frontend (Expo EAS)
- [ ] 푸시 알림 (Expo Notifications)
- [ ] 위치 서비스 고도화

---

## 🚨 알려진 남은 부채

1. **테스트 부재** — 매 사이클마다 Chrome DevTools MCP 로 수동 회귀. 자동화 시급
2. **채팅 5초 폴링** — 실시간 아님. WebSocket 업그레이드 예정
3. **매치 취소·환불 흐름 미구현** — 호스트가 매치 취소하면 참가자 결제분 환불 로직 없음
4. **시드 매치 시각 하드코딩** — 날짜는 동적이지만 `startTime` 은 고정 → 종료 직후 30분 검증 매치는 운에 맡김
5. **에러 UI 빈약** — 글로벌 에러 경계, 로딩 스켈레톤 없음
