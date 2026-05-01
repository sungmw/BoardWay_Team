# 🎲 BoardWay — 보드게임을 즐기는 가장 빠른 길

> 보드게임 카페 매칭 O2O 플랫폼  
> 원하는 장르·장소·시간대의 매치를 탐색하고, 룰 영상을 시청한 뒤, 참여 결제까지 한 번에!

---

## 📌 프로젝트 소개

**BoardWay**는 보드게임을 함께 즐길 사람을 찾고, 보드게임 카페 매치에 참여할 수 있는 모바일 매칭 서비스입니다.

### 주요 기능
- 🔍 **매치 탐색** — 장르 / 장소 / 시간대 필터로 원하는 매치 검색
- 📋 **매치 상세** — 게임 정보, Google Maps 지도, 참여자 매너 점수, 유튜브 룰 영상 확인
- 💳 **참여 결제** — 룰 숙지 인증 후 매치 참여
- 👤 **회원 시스템** — 이메일 기반 회원가입 / 로그인 / 로그아웃

---

## 🛠 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| **Frontend** | React Native (Expo SDK 54) | 모바일 앱 (iOS / Android / Web) |
| **Navigation** | React Navigation v6 (Native Stack) | 스택 기반 화면 전환 |
| **Backend** | Python FastAPI | REST API 서버 |
| **DB** | 인메모리 (Python List/Dict) | 프로토타입 단계 |
| **영상 플레이어** | react-native-youtube-iframe | 유튜브 룰 영상 재생 |
| **지도** | Google Maps Embed (WebView) | 매치 장소 위치 표시 |

---

## 📁 프로젝트 구조

```
BoardWay/
├── backend/
│   ├── main.py                # FastAPI 서버 (전체 API 로직)
│   └── requirements.txt       # Python 의존성
│
└── frontend/
    ├── App.js                 # 앱 엔트리포인트
    ├── app.json               # Expo 설정
    ├── package.json           # Node.js 의존성
    └── src/
        ├── context/
        │   ├── AuthContext.js      # 인증 상태 관리 (로그인/회원가입/로그아웃)
        │   └── MatchContext.js     # 매치 데이터 관리 (조회/참여)
        ├── data/
        │   └── mockData.json       # 목업 데이터 (백업용)
        ├── navigation/
        │   └── AppNavigator.js     # 화면 라우팅 설정
        ├── screens/
        │   ├── IntroScreen.js          # 스플래시/인트로 화면
        │   ├── DiscoveryScreen.js       # 매치 탐색 (메인 화면)
        │   ├── MatchDetailScreen.js     # 매치 상세 + 결제
        │   ├── LoginScreen.js           # 로그인
        │   └── SignUpScreen.js          # 회원가입
        ├── theme/
        │   ├── colors.js        # 컬러 팔레트
        │   └── styles.js        # 공통 스타일
        └── utils/
            └── timeCalculator.js  # 종료 시간 계산 유틸
```

---

## 🖥 화면 흐름

```
IntroScreen (스플래시 2초)
    │
    ▼
DiscoveryScreen (매치 탐색 · 메인)
    │
    ├──→ MatchDetailScreen (매치 상세)
    │        │
    │        ├── 미로그인 → LoginScreen
    │        └── 로그인됨 → 결제 모달 → 참여 완료
    │
    └──→ LoginScreen (로그인)
             │
             └──→ SignUpScreen (회원가입)
```

### 화면별 설명

| 화면 | 설명 |
|------|------|
| **IntroScreen** | 로고 + 슬로건 페이드인 애니메이션 후 2초 뒤 메인으로 자동 이동 |
| **DiscoveryScreen** | 장르·장소·시간대 필터(Bottom Sheet), 매치 카드 리스트, 마감/내 매치 표시 |
| **MatchDetailScreen** | 게임 3종 목록, Google Maps 지도, 타임라인, 참여자 매너 점수, 유튜브 룰 영상, 결제 모달 |
| **LoginScreen** | 이메일 + 비밀번호 입력, 회원가입 링크 |
| **SignUpScreen** | 이메일, 닉네임, 비밀번호, 비밀번호 확인 입력 |

---

## 🔌 API 명세

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/` | 서버 상태 확인 |
| `GET` | `/matches` | 전체 매치 목록 조회 |
| `POST` | `/signup` | 회원가입 (이메일 중복 체크) |
| `POST` | `/login` | 로그인 (이메일 + 비밀번호 매칭) |
| `POST` | `/matches/{match_id}/join` | 매치 참여 (정원 초과 / 중복 참여 검사) |

### 매치 데이터 구조

```json
{
  "id": "m1",
  "games": ["스플랜더", "카탄", "루미큐브"],
  "difficulty": "Easy",
  "tags": ["파티/캐주얼", "초보 환영"],
  "startTime": "19:00",
  "ruleVideoUrls": ["https://youtu.be/..."],
  "location": {
    "venue": "레드버튼",
    "branch": "강남점",
    "address": "서울 강남구 강남대로 432"
  },
  "participants": [
    { "nickname": "보드마스터", "mannerScore": 6, "isMe": false }
  ],
  "maxPlayers": 4
}
```

---

## 🎨 디자인 시스템

| 이름 | 색상 | 용도 |
|------|------|------|
| `primary` | `#1A2A3A` 딥 네이비 | 주요 색상, 신뢰감 |
| `secondary` | `#FFC107` 옐로우 | 포인트 컬러 |
| `background` | `#F5F7FA` 라이트 그레이 | 전체 배경 |
| `surface` | `#FFFFFF` 화이트 | 카드·모달 배경 |
| `text` | `#2C3E50` | 기본 텍스트 |
| `textLight` | `#7F8C8D` | 보조 텍스트 |
| `success` | `#2ECC71` 그린 | 성공 상태 |
| `error` | `#E74C3C` 레드 | 에러 상태 |

---

## 🚀 실행 방법

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

> 서버가 `http://0.0.0.0:8000` 에서 실행됩니다.

### Frontend

```bash
cd frontend
npm install
npx expo start
```

> Expo 개발 서버가 실행되며, iOS/Android 시뮬레이터 또는 Expo Go 앱에서 확인할 수 있습니다.

### ⚠️ API URL 설정

프론트엔드가 백엔드에 연결하려면 `src/context/AuthContext.js`와 `src/context/MatchContext.js`의 `API_URL`을 자신의 로컬 IP로 변경해야 합니다:

```javascript
const API_URL = 'http://<your-local-ip>:8000';
```

---

## 📝 현재 개발 단계

> **프로토타입 / MVP 단계**

| 항목 | 상태 |
|------|------|
| 매치 탐색 & 필터링 | ✅ 구현 완료 |
| 매치 상세 (지도·영상·참여자) | ✅ 구현 완료 |
| 회원가입 / 로그인 | ✅ 구현 완료 |
| 매치 참여 | ✅ 구현 완료 |
| 실제 DB 연동 | ❌ 미구현 (인메모리) |
| JWT 토큰 인증 | ❌ 미구현 (단순 매칭) |
| 비밀번호 해싱 | ❌ 미구현 (평문 저장) |
| 실제 결제 연동 | ❌ 미구현 |
| 매치 생성 기능 | ❌ 미구현 |
| 매너 점수 평가 | ❌ 미구현 (표시만 가능) |
