import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt

import models, schemas, crud
from database import get_db
from auth_utils import verify_password, create_access_token, SECRET_KEY, ALGORITHM

# 스키마는 Alembic 으로 관리합니다 (alembic upgrade head). create_all 제거.

app = FastAPI(title="BoardWay API")

# 개발 기본값: Expo Web(8081), Vite(5173), Expo dev(19006), 휴대폰 LAN IP에서의 접근까지 허용
DEFAULT_DEV_ORIGINS = "http://localhost:8081,http://localhost:5173,http://localhost:19006"
_origins_env = os.getenv("CORS_ORIGINS", DEFAULT_DEV_ORIGINS)
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 이미지 디렉토리 경로 절대 경로로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

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

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_details = traceback.format_exc()
    print(error_details)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc), "traceback": error_details},
    )

def format_match(m, db: Session = None):
    try:
        rule_video_urls = m.ruleVideoUrls
        if db and (not rule_video_urls or all(not url for url in rule_video_urls)):
            if m.games:
                def normalize(name):
                    if not name:
                        return ""
                    return "".join(c for c in name if c.isalnum()).lower()
                all_games = db.query(models.Game).all()
                db_game_map = {normalize(g.name): g.ruleUrl for g in all_games}
                rule_video_urls = [db_game_map.get(normalize(game_name), "") for game_name in m.games]
            else:
                rule_video_urls = []

        return {
            "id": m.match_id,
            "games": m.games,
            "difficulty": m.difficulty,
            "tags": m.tags,
            "date": m.date,
            "startTime": m.startTime,
            "ruleVideoUrls": rule_video_urls,
            "location": {
                "venue": m.venue,
                "branch": m.branch,
                "address": m.address
            },
            "maxPlayers": m.maxPlayers,
            "host": m.host_nickname,
            "cancelled": m.cancelled,
            "is_flexible": m.is_flexible,
            "participants": [{"nickname": p.nickname, "mannerScore": p.mannerScore, "isMe": False} for p in m.participants]
        }
    except Exception as e:
        print(f"Error formatting match {getattr(m, 'match_id', m.id)}: {e}")
        return None

def public_url(request: Request, path_or_url: str):
    if not path_or_url:
        return path_or_url
    if path_or_url.startswith(("http://", "https://")):
        return path_or_url
    return str(request.base_url).rstrip("/") + "/" + path_or_url.lstrip("/")

@app.get("/")
def read_root():
    return {"message": "Welcome to BoardWay API Server! (DB Connected)"}

@app.get("/matches")
def get_matches(db: Session = Depends(get_db)):
    matches = crud.get_matches(db)
    formatted = [format_match(m, db) for m in matches]
    return {"matches": [f for f in formatted if f is not None]}

@app.get("/matches/{match_id}")
def get_match(match_id: str, db: Session = Depends(get_db)):
    match = crud.get_match_by_match_id(db, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    return format_match(match, db)

@app.post("/matches")
def create_match(
    match: schemas.MatchCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_match = crud.create_match(
        db, match, creator_user_id=current_user.id, host_nickname=current_user.nickname
    )

    # 매치 개설 알림 발송
    games_label = ", ".join(new_match.games or ["자율 선택"])
    crud.create_notification(
        db, current_user.id, "match_created",
        "매칭 개설 완료",
        f"[{games_label}] 매칭 개설 및 {12000:,}P 결제가 완료되었습니다. 방장으로서 참여자들을 기다려주세요!",
        match_business_id=new_match.match_id
    )

    return format_match(new_match, db)


@app.delete("/matches/{match_id}")
def delete_match(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_match = crud.get_match_by_match_id(db, match_id)
    if not db_match:
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    # 만든 사람만 삭제 가능. 시드 매치 (created_by_user_id IS NULL) 는 아무도 못 지움.
    if db_match.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="이 매치를 삭제할 권한이 없습니다.")
    db.delete(db_match)
    db.commit()
    return {"message": "삭제 완료"}

@app.post("/matches/{match_id}/join")
def join_match(
    match_id: str,
    payload: schemas.JoinMatchRequest = schemas.JoinMatchRequest(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = crud.join_match(db, match_id, current_user.nickname, payload.role)
    if result == "ALREADY_JOINED":
        raise HTTPException(status_code=400, detail="이미 참여가 완료된 매치입니다.")
    elif result == "FULL":
        raise HTTPException(status_code=400, detail="매치가 이미 가득 찼습니다.")
    elif result == "HOST_TAKEN":
        raise HTTPException(status_code=400, detail="이미 방장이 정해진 매치입니다.")
    elif result is None:
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")

    return {"message": "참여 완료", "host": result.host_nickname}

@app.delete("/matches/{match_id}/leave")
def leave_match(match_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = crud.leave_match(db, match_id, current_user.nickname)
    if result == "MATCH_NOT_FOUND":
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    if result == "NOT_PARTICIPATING":
        raise HTTPException(status_code=400, detail="참여 중인 매치가 아닙니다.")
    if result == "ALREADY_STARTED":
        raise HTTPException(status_code=400, detail="이미 시작된 매치는 취소할 수 없습니다.")
    if result == "CANCELLED":
        raise HTTPException(status_code=400, detail="이미 취소된 매치입니다.")
    return {"message": "참여 취소 완료", "refunded": result["refunded"]}

@app.get("/my-matches")
def get_my_matches(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    matches = crud.get_user_matches(db, current_user.nickname)
    return {"matches": [format_match(m, db) for m in matches]}

@app.get("/games")
def get_games(request: Request, db: Session = Depends(get_db)):
    games = crud.get_games(db)
    result = []
    for g in games:
        result.append({
            "id": g.game_id,
            "name": g.name,
            "players": g.players,
            "difficulty": g.difficulty,
            "description": g.description,
            "ruleUrl": g.ruleUrl,
            "image": public_url(request, g.image)
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
            "mannerScore": user.mannerScore,
            "points": user.points,
            "is_admin": user.is_admin,
        }
    }

@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/me/points/adjust", response_model=schemas.UserResponse)
def adjust_my_points(
    payload: schemas.PointsAdjustRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    updated = crud.add_user_points(
        db, current_user.nickname, payload.delta, payload.description
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    # 일반적인 포인트 충전/사용 시에만 알림 발송 (매칭 결제/참여취소 환불 등은 별도 알림 존재하므로 제외)
    desc = payload.description or ""
    if "참여" not in desc and "환불" not in desc and "취소" not in desc:
        type_ = "point_recharged" if payload.delta > 0 else "point_used"
        title = "포인트 충전 완료" if payload.delta > 0 else "포인트 사용 완료"
        crud.create_notification(
            db, current_user.id, type_,
            title,
            f"{abs(payload.delta):,}P 가 {desc} 처리되었습니다. (현재 보유 포인트: {updated.points:,}P)",
            match_business_id=None
        )

    return updated


@app.get(
    "/me/points/history",
    response_model=List[schemas.PointHistoryItem],
)
def read_my_point_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_user_point_history(db, current_user.id)


@app.post("/me/reviews", response_model=List[schemas.ReviewItem])
def submit_match_reviews(
    payload: schemas.ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = crud.create_match_reviews(
        db, current_user.id, payload.match_id, payload.reviews, payload.comment
    )
    if result is None:
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    if result == "ALREADY_REVIEWED":
        raise HTTPException(status_code=400, detail="이미 리뷰를 남긴 매치입니다.")
    return [
        schemas.ReviewItem(
            id=r.id,
            match_id=payload.match_id,
            reviewee_nickname=r.reviewee_nickname,
            rating=r.rating,
            comment=r.comment,
        )
        for r in result
    ]


@app.get("/me/reviewed-matches", response_model=List[str])
def my_reviewed_match_ids(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_reviewer_match_business_ids(db, current_user.id)


@app.post("/matches/{match_id}/cancel", response_model=schemas.CancelResponse)
def cancel_match_endpoint(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="매치 취소는 운영진만 가능합니다.")
    result = crud.cancel_match(db, match_id)
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    if result == "ALREADY_CANCELLED":
        raise HTTPException(status_code=400, detail="이미 취소된 매치입니다.")
    return schemas.CancelResponse(
        cancelled=True,
        refunded_count=result["refunded_count"],
        refund_amount=result["refund_amount"],
        message=f"매치가 취소되었습니다. 참여자 {result['refunded_count']}명에게 {result['refund_amount']:,}P씩 환불 완료.",
    )


@app.get("/me/notifications", response_model=List[schemas.NotificationItem])
def list_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.list_user_notifications(db, current_user.id)


@app.post("/me/notifications/{notif_id}/read", response_model=schemas.NotificationItem)
def mark_notification_read_endpoint(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = crud.mark_notification_read(db, current_user.id, notif_id)
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
    return result


@app.post("/me/notifications/read-all")
def mark_all_notifications_read_endpoint(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    count = crud.mark_all_notifications_read(db, current_user.id)
    return {"updated": count}


@app.get("/matches/{match_id}/messages", response_model=List[schemas.MessageItem])
def list_match_messages_endpoint(
    match_id: str,
    after_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = crud.list_match_messages(db, match_id, current_user.nickname, after_id)
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    if result == "FORBIDDEN":
        raise HTTPException(status_code=403, detail="이 매치에 참여한 사용자만 채팅을 볼 수 있습니다.")
    return result


@app.post("/matches/{match_id}/messages", response_model=schemas.MessageItem)
def create_match_message_endpoint(
    match_id: str,
    payload: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not payload.content or not payload.content.strip():
        raise HTTPException(status_code=400, detail="메시지 내용이 비어 있습니다.")
    result = crud.create_match_message(db, match_id, current_user, payload.content.strip())
    if result == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="매치를 찾을 수 없습니다.")
    if result == "FORBIDDEN":
        raise HTTPException(status_code=403, detail="이 매치에 참여한 사용자만 채팅을 보낼 수 있습니다.")
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
