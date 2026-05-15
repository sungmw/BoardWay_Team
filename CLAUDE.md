# BoardWay — Claude 작업 가이드

> 보드게임 카페 매칭 O2O 플랫폼. **Expo(모바일+웹) 단일 클라이언트** + FastAPI 백엔드.
> 이 문서는 Claude가 세션 시작 시 프로젝트를 빠르게 파악하기 위한 컨텍스트입니다.

---

## 1. 저장소 구조

```
BoardWay/
├── backend/         FastAPI + SQLAlchemy. SQLite 기본, DATABASE_URL 있으면 PostgreSQL(Supabase).
├── frontend/        Expo SDK 54. iOS/Android/Web 동일 코드 (`npx expo start --web`).
├── README.md
├── PROJECT_STATUS.md
└── CLAUDE.md
```

> 이전엔 `web-frontend/`(Vite) 가 별도로 있었으나 2026-05-16 폐기. Expo Web 으로 통합.

## 2. 실행

```bash
# Backend
cd backend && pip install -r requirements.txt
python seed.py                # 안전 시딩 (이미 있으면 스킵)
python seed.py --reset        # 전체 wipe 후 재시딩 (확인 프롬프트 있음)
python main.py                # 0.0.0.0:8000

# Frontend
cd frontend && npm install
npx expo start                # 모바일 (QR)
npx expo start --web          # 웹 (브라우저)
```

환경변수:
- `backend/.env` — `DATABASE_URL` (선택), `SECRET_KEY` (**필수, 미설정 시 부팅 실패**), `CORS_ORIGINS` (선택, 콤마 구분)
- `frontend/.env` — `EXPO_PUBLIC_API_URL` (실기기 Expo Go에선 PC LAN IP 필수)

## 3. 백엔드 핵심 파일

- `main.py` — FastAPI 라우터. CORS는 `CORS_ORIGINS` 환경변수 화이트리스트(개발 기본값: localhost:8081/5173/19006).
- `models.py` — User / Game / Match / MatchParticipant. `points`, `host`, `chat`, `review` 관련 컬럼은 **없음** (클라이언트에 임시 저장 중).
- `crud.py` — DB CRUD.
- `schemas.py` — Pydantic. `EmailStr` 사용으로 이메일 형식 검증.
- `auth_utils.py` — JWT(HS256, 7일). bcrypt + SHA-256 pre-hash. `SECRET_KEY` 환경변수 필수.
- `database.py` — SQLAlchemy 엔진. `postgresql://` 자동으로 `+psycopg2` 변환.
- `seed.py` — 게임 15종 + 매치 24개 시드. `--reset` 플래그 + 확인 프롬프트 없으면 wipe 안 함.

API: `/matches` GET/POST, `/matches/{id}` GET/DELETE, `/matches/{id}/join` POST, `/matches/{id}/leave` DELETE, `/my-matches`, `/games`, `/signup`, `/login`, `/me`.

## 4. 프론트엔드 (`frontend/`) 핵심

- `App.js` — `SafeAreaProvider > AuthProvider > MatchProvider > NavigationContainer`.
- `src/config.js` — `EXPO_PUBLIC_API_URL` 우선, 없으면 web=localhost / native=10.0.2.2 (Android 에뮬레이터 폴백).
- `src/context/AuthContext.js` — 로그인/가입/토큰. **포인트·리뷰·정산을 AsyncStorage 키별 저장 — 서버 동기화 없음** (클라이언트 전용).
- `src/context/MatchContext.js` — 매치 fetch, 실패 시 빈 배열 + `error` 노출(BACKUP_DATA 폴백 제거됨).
- `src/screens/MatchDetailScreen.js` — 지도/유튜브가 `Platform.OS === 'web'` 분기로 iframe / 모바일 라이브러리 자동 선택. `MapEmbed`, `YoutubeEmbed` wrapper 사용.
- `src/screens/` — 14개: Intro, Login/SignUp, Discovery, GameSearch/GameDetail, MatchDetail, MatchConfirmation, MyMatches, MyPage, PointHistory, ChatList, ChatRoom, MatchReview.
- API 호출은 raw `fetch()` + 수동 `Authorization: Bearer`. 401 핸들러는 단순 logout.

## 5. 알아둘 함정

- **마이그레이션 부재**: 모델 변경 시 SQLite 파일 수동 삭제 또는 `seed.py --reset`. Alembic 미도입.
- **클라이언트 전용 상태**: 포인트/리뷰/호스트/정산이 전부 AsyncStorage. 로그아웃/기기변경 시 소실. 백엔드 컬럼/엔드포인트 없음.
- **채팅**: `ChatListScreen` / `ChatRoomScreen` UI만 있음. WebSocket·메시지 저장·엔드포인트 전부 없음.
- **리뷰**: `MatchReviewScreen` 작성하면 AsyncStorage에만 저장. 서버 전송 안 됨.
- **호환성 코드**: `auth_utils.verify_password` 가 SHA-256 pre-hash와 구방식을 둘 다 시도. 신규 사용자만 있다면 단순화 가능하나 보수적으로 유지.
- **시드 매치 날짜 하드코딩**: 2026-05-11~17 고정. 데모 시점 어긋남 주의.
- **이미지 정적 파일**: `main.py:public_url` 이 `request.base_url` 의존. 리버스 프록시 뒤에서는 호스트 잘못될 수 있음.

## 6. 변경 시 체크리스트

- 모델 수정 → SQLite 삭제 또는 Alembic 도입 우선.
- 인증 변경 → `frontend/src/context/AuthContext.js` 의 fetch 5군데 모두 갱신 (래퍼 없음).
- 새 환경변수 → `.env.example` 2개(backend/frontend) 동기화.
- 보안 설정(`SECRET_KEY`, `CORS_ORIGINS`)은 `.env` 만 수정. 코드 기본값은 안전 우선 유지.
- 웹 호환성 — `react-native-webview`, `react-native-youtube-iframe` 처럼 모바일 전용 라이브러리는 `Platform.OS === 'web'` 분기 + iframe 폴백 패턴 사용.

## 7. 우선순위 백로그

1. Alembic 도입 + `create_all` 제거.
2. 포인트/리뷰/호스트 데이터 서버 이전 (모델·엔드포인트 추가 → 클라이언트 동기화). **풀스택 1사이클 학습 과제**.
3. 채팅 실 구현 또는 UI 비활성화 (현재 placeholder가 사용자 기대 부풀림).
4. 모바일 fetch 래퍼 + 401 토큰 갱신 로직.
5. AuthContext 의 점수/리뷰 관련 5개 useState 가 너무 많음 — 리듀서 또는 분리.
