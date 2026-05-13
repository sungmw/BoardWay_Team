# 📊 BoardWay 프로젝트 현황 및 로드맵

이 문서는 BoardWay 프로젝트의 현재 구현 상태, 기술적 당면 과제, 그리고 향후 개발 방향성을 정리한 문서입니다.

---

## 🏗 현재 기술 스택

| 레이어 | 기술 |
| :--- | :--- |
| **프론트엔드** | React Native + Expo (SDK 54) |
| **백엔드** | FastAPI (Python 3.x) |
| **데이터베이스** | SQLAlchemy + SQLite 기본값, Supabase PostgreSQL 전환 가능 |
| **인증** | JWT Bearer Token + bcrypt 비밀번호 해싱 |
| **인프라** | 로컬 개발 환경 |

---

## ✅ 현재 구현 완료 사항

- **UI/UX:** 인트로(애니메이션), 로그인, 회원가입, 매칭 탐색(Discovery), 매칭 상세 화면
- **상태 관리:** Context API (`AuthContext`, `MatchContext`)를 통한 전역 상태 관리
- **백엔드 API:** `/matches`, `/matches/{id}`, `/matches/{id}/join`, `/matches/{id}/leave`, `/my-matches`, `/games`, `/signup`, `/login`, `/me` 엔드포인트 기초 설계
- **기능:** Google Maps WebView 연동, 유튜브 룰 영상 플레이어, 종료 시간 자동 계산 로직

---

## 🚨 핵심 문제점 및 개선 필요 사항

1. **마이그레이션 체계 부재:** 현재는 앱 실행 시 `create_all`로 테이블을 만들기 때문에 Alembic 같은 스키마 변경 관리가 필요함
2. **Supabase 연결 검증 필요:** `DATABASE_URL` 기반 PostgreSQL 전환 구조는 있으나 실제 Supabase 프로젝트 연결 테스트가 남아 있음
3. **토큰/보안 운영 설정:** 개발용 `SECRET_KEY` 기본값 제거, 토큰 만료/갱신 정책 정리 필요
4. **기능 미비:** 사용자의 매치 생성 기능, 실시간 인원 반영, 실제 결제 연동 등 미구현

---

## 🗺 향후 개발 파이프라인 (Roadmap)

### Phase 1: 기반 다지기 (최우선)
- [x] **로컬 DB 연동:** SQLite 기반 개발 DB 구축
- [ ] **운영 DB 연결:** Supabase(PostgreSQL) `DATABASE_URL` 연결 및 시딩 검증
- [ ] **API 고도화:** 프론트엔드-백엔드 간 실제 데이터 통신 안정화

### Phase 2: 핵심 기능 완성
- [ ] **매치 생성:** 사용자가 직접 장소, 시간, 게임을 설정하여 매치를 만드는 기능 추가
- [ ] **실시간 동기화:** WebSocket 또는 실시간 DB를 활용한 참여 인원 실시간 업데이트
- [ ] **환경변수 관리:** `.env` 도입으로 백엔드 주소 및 API 키 관리

### Phase 3: 서비스 품질 향상
- [ ] **배포:** Backend(Railway/Render), Frontend(Expo Application) 배포 준비
- [ ] **에러 핸들링:** 글로벌 에러 경계(Error Boundary) 및 로딩 스켈레톤 UI 적용
- [ ] **유효성 검사:** 입력 폼 검증 로직 강화 (이메일 형식, 비밀번호 규칙 등)

### Phase 4: 완성도 및 사용자 경험(UX)
- [ ] **푸시 알림:** 매칭 확정 및 참여자 발생 시 알림 (Expo Notifications)
- [ ] **위치 서비스:** 카카오맵/구글맵 API 고도화 (현재 위치 기반 검색)
- [ ] **커뮤니케이션:** 매칭된 인원 전용 채팅방 기능

---

## 🏃 지금 당장 할 일 (Action Items)

1. **로컬 DB 확인:** `backend/.env.example` 기준으로 SQLite 개발 DB 생성 및 `python seed.py` 실행
2. **Supabase 연결:** Supabase PostgreSQL 연결 문자열을 `DATABASE_URL`에 넣고 같은 API가 동작하는지 확인
3. **마이그레이션 도입:** Alembic으로 테이블 생성/변경 이력을 관리
