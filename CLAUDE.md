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

---

## 8. 사용자(jdh07310@gmail.com)와의 작업 스타일

> 다음 Claude 세션이 자동으로 톤을 잡을 수 있도록.

- **언어**: 한국어. 코드 주석·커밋 메시지·문서 모두 한국어 우선. 기술 용어는 영어 그대로 섞어 사용.
- **배경**: 풀스택을 진행하지만 코드 이해도가 깊지 않음 — 본인이 명시함: "지금까지 우리팀들이 AI한테 전격으로 맡겨서 만들어진거라 이해를 제대로 못하고 여기까지 왔어". 비전공자에 가까운 학습 단계.
- **설명 방식**:
  - 새 개념은 **비유 한 줄 먼저** ("X는 Y 같은 거예요" — 식당, 엑셀, 게시판 등 일상 사물).
  - 코드 같이 읽을 땐 **한 줄씩, 모르는 키워드는 그 자리에서 풀어주기**.
  - 단계 끝나면 (A)/(B)/(C) **선택지 제공** — 사용자가 다음 방향 직접 고르게.
  - "모르겠다" 말할 여지 매번 열기. "부끄러워할 거 없습니다" 같은 한 마디 효과적.
- **모드 전환**: 학습 모드 ↔ 위임 모드를 자유롭게 오감.
  - **학습 모드**: 사용자가 직접 손 움직이고 검사받음. Claude는 명령·코드 알려주고 결과 검사.
  - **위임 모드**: "권한 줄게 다 바꿔봐" 같이 명시적 권한 위임. 다만 **변경 이유를 항상 함께 설명**해야 함 — 본인 명시 요구.
- **결정 사항**:
  - **B안 (Expo Web 통합)** 으로 모바일·웹 단일 코드베이스. `web-frontend/` 폐기 (2026-05-16).
  - **A2 (auth_utils 레거시 verify 제거)** 는 보수적 스킵. 기존 사용자 비번 호환성 안전 우선.
  - 이메일은 **EmailStr 검증 유지** (갈래 1). 학습 단계에서도 정상 형식만 받음.
- **환경**: Windows 11 + Git Bash + 한글 사용자명(`성민욱`) 경로. 명령 작성 시 따옴표 처리 주의. **맥북에서도 작업 예정** (카페 이동).
- **금기**: AI에 통째로 맡겨 이해 없이 진행하는 패턴 회피. 큰 변경 전엔 의도·이유 명시. 인프라/배포 디테일은 즉시 함정 한 줄로 설명.

## 9. 작업 진행 이력 (요약)

- **2026-05-15**: 프로젝트 분석, 무관 PDF(A-GNRI) 정리, 사용자가 비전공 자기 인식 표명 → 학습 가이드 모드 진입. `models.py` (User, ForeignKey, relationship) 비유로 함께 읽음. `crud.py` 4가지 패턴(Read/Create/관계활용/Delete) 짚음.
- **2026-05-16**: 환경 셋업(`.env` 부재로 모바일 무한로딩, DB 비어있어서 매치 0개 — 둘 다 해결). Expo Web 띄우는 데 react-native-web-webview 폴리필 필요. **권한 위임 모드** 진입 후 묶음 A(백엔드 안전 정리) + 묶음 B(프론트 정리·웹 호환 분기) + web-frontend 폐기 일괄 적용. 로그인 인증 동작까지 검증 완료.

## 10. 다음 세션 시작 시

1. `git pull origin main` 후 백엔드/프론트 셋업 (`PROJECT_STATUS.md` 마지막 섹션 참조).
2. 다음 작업 후보:
   - **C3. Alembic 도입** (15~20분, 인프라) — C1의 전제. 사용자 데이터 보존하며 모델 변경 가능.
   - **C1. 포인트 시스템 백엔드 이전** (30~40분, 풀스택 학습) — `models.py` 컬럼 추가 → `crud.py` 함수 → `main.py` 엔드포인트 → `AuthContext.js` API 호출. 4단 사이클 한 번에.
   - **C4. 모바일 fetch 래퍼화** (10~15분, 코드 품질) — 가벼운 정리.
3. 사용자 의향 묻고 시작.
