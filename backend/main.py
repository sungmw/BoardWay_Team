from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt

import models, schemas, crud
from database import engine, get_db
from auth_utils import verify_password, create_access_token, SECRET_KEY, ALGORITHM

# 테이블 생성 (개발 편의상 앱 실행시 자동 생성)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BoardWay API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="images"), name="images")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# 현재 로그인한 사용자 가져오기 dependency
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@app.get("/")
def read_root():
    return {"message": "Welcome to BoardWay API Server! (DB Connected)"}

@app.get("/matches")
def get_matches(db: Session = Depends(get_db)):
    matches = crud.get_matches(db)
    # 프론트엔드 포맷(location 객체)에 맞게 변환
    result = []
    for m in matches:
        m_dict = {
            "id": m.match_id,
            "games": m.games,
            "difficulty": m.difficulty,
            "tags": m.tags,
            "date": m.date,
            "startTime": m.startTime,
            "ruleVideoUrls": m.ruleVideoUrls,
            "location": {
                "venue": m.venue,
                "branch": m.branch,
                "address": m.address
            },
            "maxPlayers": m.maxPlayers,
            "participants": [{"nickname": p.nickname, "mannerScore": p.mannerScore, "isMe": False} for p in m.participants]
        }
        result.append(m_dict)
    return {"matches": result}

@app.get("/games")
def get_games(db: Session = Depends(get_db)):
    games = crud.get_games(db)
    # 프론트엔드 포맷 맞춤
    result = []
    for g in games:
        result.append({
            "id": g.game_id,
            "name": g.name,
            "players": g.players,
            "difficulty": g.difficulty,
            "description": g.description,
            "ruleUrl": g.ruleUrl,
            "image": g.image
        })
    return {"games": result}

@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다.")
    
    db_nickname = crud.get_user_by_nickname(db, nickname=user.nickname)
    if db_nickname:
        raise HTTPException(status_code=400, detail="이미 사용중인 닉네임입니다.")
        
    created_user = crud.create_user(db=db, user=user)
    return {"message": "회원가입 성공", "user": {"email": created_user.email, "nickname": created_user.nickname, "mannerScore": created_user.mannerScore}}

@app.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, request.email)
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "email": user.email, 
            "nickname": user.nickname, 
            "mannerScore": user.mannerScore
        }
    }

@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/matches/{match_id}/join")
def join_match(match_id: str, participant: schemas.ParticipantBase, db: Session = Depends(get_db)):
    result = crud.join_match(db, match_id, participant)
    if result == "ALREADY_JOINED":
        raise HTTPException(status_code=400, detail="이미 참여가 완료된 매치입니다.")
    elif result == "FULL":
        raise HTTPException(status_code=400, detail="매치가 이미 가득 찼습니다.")
    elif result is None:
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
        
    return {"message": "참여 완료"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
