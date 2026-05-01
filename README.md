# 🎲 BoardWay — 보드게임을 즐기는 가장 빠른 길

> **보드게임 카페 매칭 O2O 플랫폼**  
> "보드게임을 즐기는 가장 빠른 길"이라는 컨셉으로, 원하는 장르·장소·시간대의 매치를 탐색하고, 룰 영상을 시청한 뒤 참여 결제(API 호출)까지 한 번에 해결하는 모바일 서비스입니다.

---

## 📌 주요 기능

1.  🔍 **매치 탐색** — 장르 / 장소 / 시간대 필터(Bottom Sheet)로 원하는 매치 검색
2.  📋 **매치 상세** — 게임 정보(3종), Google Maps 지도, 참여자 타임라인 & 매너 점수, 유튜브 룰 영상 확인
3.  💳 **참여 결제** — 룰 숙지 확인 후 매치 참여 (실제 결제는 구현되지 않았으며, 참여 API 호출로 대체)
4.  👤 **회원 시스템** — 이메일 기반 회원가입 / 로그인 / 로그아웃 상태 관리

---

## 🛠 기술 스택

| 구분 | 기술 | 비고 |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo SDK 54) | iOS / Android / Web 대응 |
| **Navigation** | React Navigation v6 | Native Stack 기반 화면 전환 |
| **Backend** | Python FastAPI | REST API 기반 백엔드 |
| **DB** | In-memory (Python List/Dict) | 프로토타입용 10개 매치 하드코딩 |
| **지도** | Google Maps Embed (WebView) | 장소 위치 정보 시각화 |
| **영상** | react-native-youtube-iframe | 유튜브 룰 설명 영상 재생 |

---

## 📁 프로젝트 구조

```text
BoardWay/
├── backend/
│   ├── main.py                # FastAPI 서버 (전체 API 로직 & 데이터)
│   └── requirements.txt       # 백엔드 의존성 (fastapi, uvicorn 등)
│
└── frontend/
    ├── App.js                 # 앱 엔트리포인트 (Provider 설정)
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.js      # 로그인/가입/로그아웃 상태 관리
    │   │   └── MatchContext.js     # 매치 데이터 로딩 및 참여 처리
    │   ├── navigation/
    │   │   └── AppNavigator.js     # 전체 화면 라우팅 정의
    │   ├── screens/
    │   │   ├── IntroScreen.js          # 스플래시 & 슬로건 애니메이션
    │   │   ├── DiscoveryScreen.js       # 매칭 리스트 & 필터링 (메인)
    │   │   ├── MatchDetailScreen.js     # 매치 상세 정보 & 참여 결제
    │   │   ├── LoginScreen.js           # 이메일 로그인
    │   │   └── SignUpScreen.js          # 이메일/닉네임 회원가입
    │   ├── theme/
    │   │   ├── colors.js        # 브랜드 컬러 팔레트
    │   │   └── styles.js        # 공통 스타일 정의
    │   └── utils/
    │       └── timeCalculator.js  # 종료 시간(시작+2h) 자동 계산 유틸
```

---

## 🖥 화면 흐름 (Flow)

```text
[IntroScreen] (2초 자동 전환)
      │
      ▼
[DiscoveryScreen] (메인) ───▶ [MatchDetailScreen] (상세)
      │                            │
      │                     (로그인 체크)
      │                            │
      │                     ├── 미로그인 → [LoginScreen]
      └─────────────────────┴── 로그인됨 → 참여 결제 모달
                                      │
                                [SignUpScreen] (회원가입)
```

---

## 🔌 API 명세 (Backend)

| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/matches` | 전체 매치 목록 조회 |
| `POST` | `/signup` | 회원가입 (이메일 중복 체크 포함) |
| `POST` | `/login` | 로그인 (이메일 & 비밀번호 검증) |
| `POST` | `/matches/{id}/join` | 매치 참여 (정원 및 중복 참여 체크) |

---

## 🎨 디자인 시스템 (Theme)

- **Primary**: `#1A2A3A` (딥 네이비 - 신뢰와 전문성)
- **Secondary**: `#FFC107` (옐로우 - 포인트 컬러, 활기)
- **Background**: `#F5F7FA` (라이트 그레이 - 시각적 편안함)
- **Status**: Success(`#2ECC71`), Error(`#E74C3C`)

---

## 🚀 시작하기

### 1. Backend 실행
```bash
cd backend
pip install -r requirements.txt
python main.py
```
> 서버는 기본적으로 `http://0.0.0.0:8000`에서 실행됩니다.

### 2. Frontend 실행
```bash
cd frontend
npm install
npx expo start
```

### ⚠️ 주의사항 (API URL)
프론트엔드(`AuthContext.js`, `MatchContext.js`)의 `API_URL` 상수를 현재 실행 중인 로컬 IP 주소로 수정해야 모바일 기기(Expo Go)에서 서버와 통신이 가능합니다.

---

## 📝 개발 현황 (MVP)

- [x] 매치 탐색 및 필터링 UI/UX
- [x] 상세 페이지 (지도, 유튜브, 참여자 리스트)
- [x] Context API 기반 전역 상태 관리
- [x] FastAPI 연동 (로그인/가입/참여)
- [ ] 실제 데이터베이스 연동 (PostgreSQL 등)
- [ ] JWT 및 보안 인증 강화
- [ ] 실제 결제 게이트웨이 연동
- [ ] 사용자 프로필 및 매너 점수 평가 시스템
