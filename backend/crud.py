import uuid
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

def create_match(db: Session, match: schemas.MatchCreate):
    """
    Admin or System creates matches based on venue availability.
    """
    new_match_id = f"m-{str(uuid.uuid4())[:8]}"
    db_match = models.Match(
        match_id=new_match_id,
        games=match.games,
        difficulty=match.difficulty,
        tags=match.tags,
        date=match.date,
        startTime=match.startTime,
        ruleVideoUrls=match.ruleVideoUrls,
        venue=match.location.venue,
        branch=match.location.branch,
        address=match.location.address,
        maxPlayers=match.maxPlayers
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def join_match(db: Session, match_id: str, participant_nickname: str):
    db_match = get_match_by_match_id(db, match_id)
    if not db_match:
        return None
    
    # 중복 참여 검사
    for p in db_match.participants:
        if p.nickname == participant_nickname:
            return "ALREADY_JOINED"
            
    if len(db_match.participants) >= db_match.maxPlayers:
        return "FULL"
        
    user = get_user_by_nickname(db, participant_nickname)
    db_participant = models.MatchParticipant(
        match_id=db_match.id,
        nickname=participant_nickname,
        mannerScore=user.mannerScore if user else 5
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_match)
    return db_match

def leave_match(db: Session, match_id: str, nickname: str):
    db_match = get_match_by_match_id(db, match_id)
    if not db_match:
        return "MATCH_NOT_FOUND"
    
    participant = db.query(models.MatchParticipant).filter(
        models.MatchParticipant.match_id == db_match.id,
        models.MatchParticipant.nickname == nickname
    ).first()
    
    if not participant:
        return "NOT_PARTICIPATING"
    
    db.delete(participant)
    db.commit()
    return "SUCCESS"

def get_user_matches(db: Session, nickname: str):
    # Matches user is participating in
    participating_match_ids = db.query(models.MatchParticipant.match_id).filter(
        models.MatchParticipant.nickname == nickname
    ).all()
    participating_match_ids = [m[0] for m in participating_match_ids]

    participating_matches = db.query(models.Match).filter(models.Match.id.in_(participating_match_ids)).all()
    return participating_matches

def add_user_points(db: Session, nickname: str, delta: int, description: str = ""):
    """포인트 가감 + 거래내역 INSERT 를 한 트랜잭션으로.

    delta 양수 = 적립('충전'), 음수 = 차감('사용').
    amount 는 절댓값으로 저장(부호는 type 으로 판별).
    """
    if delta == 0:
        return get_user_by_nickname(db, nickname)

    user = get_user_by_nickname(db, nickname)
    if not user:
        return None

    user.points = (user.points or 0) + delta

    history = models.PointHistory(
        user_id=user.id,
        type="충전" if delta > 0 else "사용",
        amount=abs(delta),
        description=description or "",
    )
    db.add(history)

    db.commit()
    db.refresh(user)
    return user


def create_match_reviews(db: Session, reviewer_id: int, match_business_id: str, items, comment: str = ""):
    """한 매치에 대한 참여자별 리뷰 N개를 한 트랜잭션으로 INSERT.

    Returns:
        - None: 매치 못 찾음
        - "ALREADY_REVIEWED": 이 사용자가 이 매치에 이미 리뷰함
        - List[Review]: 성공 시 INSERT 된 Review row 들
    """
    match = get_match_by_match_id(db, match_business_id)
    if not match:
        return None

    existing = db.query(models.Review).filter(
        models.Review.reviewer_id == reviewer_id,
        models.Review.match_id == match.id,
    ).first()
    if existing:
        return "ALREADY_REVIEWED"

    created = []
    for item in items:
        # 자기 자신 리뷰는 건너뜀 (방어적 — 프론트에서 이미 필터링하지만)
        row = models.Review(
            reviewer_id=reviewer_id,
            reviewee_nickname=item.reviewee_nickname,
            match_id=match.id,
            rating=item.rating,
            comment=comment,
        )
        db.add(row)
        created.append(row)
    db.commit()
    for row in created:
        db.refresh(row)
    return created


def get_reviewer_match_business_ids(db: Session, reviewer_id: int):
    """이 사용자가 리뷰 완료한 매치들의 비즈니스 ID(예: 'm1') 리스트."""
    rows = (
        db.query(models.Match.match_id)
        .join(models.Review, models.Review.match_id == models.Match.id)
        .filter(models.Review.reviewer_id == reviewer_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]


def get_user_point_history(db: Session, user_id: int):
    """최신순 거래내역."""
    return (
        db.query(models.PointHistory)
        .filter(models.PointHistory.user_id == user_id)
        .order_by(models.PointHistory.created_at.desc(), models.PointHistory.id.desc())
        .all()
    )
