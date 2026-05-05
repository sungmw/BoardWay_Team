from sqlalchemy.orm import Session
import models, schemas
from auth_utils import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_nickname(db: Session, nickname: str):
    return db.query(models.User).filter(models.User.nickname == nickname).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        password=get_password_hash(user.password),
        nickname=user.nickname,
        mannerScore=user.mannerScore
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_games(db: Session):
    return db.query(models.Game).all()

def get_matches(db: Session):
    return db.query(models.Match).all()

def get_match_by_match_id(db: Session, match_id: str):
    return db.query(models.Match).filter(models.Match.match_id == match_id).first()

def join_match(db: Session, match_id: str, participant: schemas.ParticipantBase):
    db_match = get_match_by_match_id(db, match_id)
    if not db_match:
        return None
    
    # 중복 참여 검사
    for p in db_match.participants:
        if p.nickname == participant.nickname:
            return "ALREADY_JOINED"
            
    if len(db_match.participants) >= db_match.maxPlayers:
        return "FULL"
        
    db_participant = models.MatchParticipant(
        match_id=db_match.id,
        nickname=participant.nickname,
        mannerScore=participant.mannerScore
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_match)
    return db_match
