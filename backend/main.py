from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="BoardWay API")

# CORS 설정 (프론트엔드 앱이 접근할 수 있도록 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델 정의
class Participant(BaseModel):
    nickname: str
    mannerScore: int
    isMe: bool = False

class User(BaseModel):
    email: str
    password: str
    nickname: str
    mannerScore: int = 5

class LoginRequest(BaseModel):
    email: str
    password: str

# 인메모리 데이터 (1단계용: 앱의 mockData를 서버 메모리로 이동)
MATCHES_DB = [
    {
      "id": "m1",
      "games": ["스플랜더", "카탄", "루미큐브"],
      "difficulty": "Easy",
      "tags": ["파티/캐주얼", "초보 환영"],
      "startTime": "19:00",
      "ruleVideoUrls": [
        "https://youtu.be/3Y-VZ3pCSlw?si=gPB7LNHmbahFMVK7",
        "https://youtu.be/37V2ajpMEic?si=B2mUR5rC_-J3tPvz",
        "https://youtu.be/uHuYRzgzbL8?si=RTTbhxJHoWiKhtUb"
      ],
      "location": {
        "venue": "레드버튼",
        "branch": "강남점",
        "address": "서울 강남구 강남대로 432"
      },
      "participants": [
        { "nickname": "보드마스터", "mannerScore": 6, "isMe": False },
        { "nickname": "초보자", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 4
    },
    {
      "id": "m2",
      "games": ["테라포밍 마스", "가이아 프로젝트", "브라스 버밍엄"],
      "difficulty": "Hard",
      "tags": ["전략 집중", "두뇌 풀가동"],
      "startTime": "20:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "홈즈앤루팡",
        "branch": "홍대점",
        "address": "서울 마포구 홍익로 25"
      },
      "participants": [
        { "nickname": "전략의신", "mannerScore": 5, "isMe": False },
        { "nickname": "생각하는사람", "mannerScore": 6, "isMe": False },
        { "nickname": "게임러버", "mannerScore": 4, "isMe": False },
        { "nickname": "고수", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 4
    },
    {
      "id": "m3",
      "games": ["아발론", "시크릿 히틀러", "뱅!"],
      "difficulty": "Medium",
      "tags": ["마피아/블러핑", "초보 환영"],
      "startTime": "18:30",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "포퀸스",
        "branch": "건대점",
        "address": "서울 광진구 능동로 111"
      },
      "participants": [
        { "nickname": "거짓말쟁이", "mannerScore": 4, "isMe": False },
        { "nickname": "마피아전문", "mannerScore": 5, "isMe": False },
        { "nickname": "시민", "mannerScore": 6, "isMe": False }
      ],
      "maxPlayers": 8
    },
    {
      "id": "m4",
      "games": ["카탄", "아발론", "루미큐브"],
      "difficulty": "Medium",
      "tags": ["장르 혼합", "단짠단짠"],
      "startTime": "19:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "레드버튼",
        "branch": "서면점",
        "address": "부산 부산진구 중앙대로 692"
      },
      "participants": [
        { "nickname": "카탄러", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 5
    },
    {
      "id": "m5",
      "games": ["패치워크", "세븐 원더스 듀얼", "자이푸르"],
      "difficulty": "Medium",
      "tags": ["2인 전용", "전략 집중"],
      "startTime": "21:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "홈즈앤루팡",
        "branch": "대전점",
        "address": "대전 서구 둔산로 31"
      },
      "participants": [
        { "nickname": "1대1매니아", "mannerScore": 6, "isMe": False }
      ],
      "maxPlayers": 2
    },
    {
      "id": "m6",
      "games": ["할리갈리", "텔레스트레이션", "딕싯"],
      "difficulty": "Easy",
      "tags": ["파티/캐주얼", "텐션 UP"],
      "startTime": "18:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "포퀸스",
        "branch": "홍대점",
        "address": "서울 마포구 와우산로 100"
      },
      "participants": [
        { "nickname": "파티마스터", "mannerScore": 6, "isMe": False },
        { "nickname": "웃음전도사", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 6
    },
    {
      "id": "m7",
      "games": ["푸에르토리코", "콘코르디아", "테라미스티카"],
      "difficulty": "Hard",
      "tags": ["전략 집중", "고수 구함"],
      "startTime": "14:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "레드버튼",
        "branch": "수원역점",
        "address": "경기 수원시 팔달구 매산로 1"
      },
      "participants": [
        { "nickname": "머리쓰기장인", "mannerScore": 5, "isMe": False },
        { "nickname": "보드게임덕후", "mannerScore": 4, "isMe": False }
      ],
      "maxPlayers": 4
    },
    {
      "id": "m8",
      "games": ["한밤의 늑대인간", "마피아", "블러드 바운드"],
      "difficulty": "Medium",
      "tags": ["마피아/블러핑", "연기력 필수"],
      "startTime": "22:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "홈즈앤루팡",
        "branch": "동성로점",
        "address": "대구 중구 동성로 12"
      },
      "participants": [
        { "nickname": "포커페이스", "mannerScore": 6, "isMe": False },
        { "nickname": "시민인척", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 10
    },
    {
      "id": "m9",
      "games": ["티켓 투 라이드", "달무티", "도미니언"],
      "difficulty": "Easy",
      "tags": ["장르 혼합", "초보 환영"],
      "startTime": "13:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "포퀸스",
        "branch": "부평점",
        "address": "인천 부평구 부평대로 24"
      },
      "participants": [
        { "nickname": "카드수집가", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 4
    },
    {
      "id": "m10",
      "games": ["로스트 시티", "워터게이트", "타르기"],
      "difficulty": "Medium",
      "tags": ["2인 전용", "심리전"],
      "startTime": "17:00",
      "ruleVideoUrls": [
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y",
        "https://www.youtube.com/watch?v=kYJqD0E4X5Y"
      ],
      "location": {
        "venue": "레드버튼",
        "branch": "신촌점",
        "address": "서울 서대문구 연세로 15"
      },
      "participants": [
        { "nickname": "듀얼리스트", "mannerScore": 5, "isMe": False }
      ],
      "maxPlayers": 2
    }
]

USERS_DB = [] # 사용자 데이터베이스

@app.get("/")
def read_root():
    return {"message": "Welcome to BoardWay API Server!"}

@app.get("/matches")
def get_matches():
    return {"matches": MATCHES_DB}

@app.post("/signup")
def signup(user: User):
    # 이메일 중복 체크
    if any(u["email"] == user.email for u in USERS_DB):
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")
    
    USERS_DB.append(user.dict())
    return {"message": "회원가입 성공", "user": user}

@app.post("/login")
def login(request: LoginRequest):
    for user in USERS_DB:
        if user["email"] == request.email and user["password"] == request.password:
            return {"message": "로그인 성공", "user": user}
            
    raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")

@app.post("/matches/{match_id}/join")
def join_match(match_id: str, participant: Participant):
    for match in MATCHES_DB:
        if match["id"] == match_id:
            if len(match["participants"]) >= match["maxPlayers"]:
                raise HTTPException(status_code=400, detail="매치가 이미 가득 찼습니다.")
            
            # 중복 참여 검사
            if any(p.get("nickname") == participant.nickname for p in match["participants"]):
                raise HTTPException(status_code=400, detail="이미 참여가 완료된 매치입니다.")
            
            # 사용자 추가
            new_user = participant.dict()
            match["participants"].append(new_user)
            
            return {"message": "참여 완료", "match": match}
            
    raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
