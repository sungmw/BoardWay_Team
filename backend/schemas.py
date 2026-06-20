from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional
from datetime import datetime

class LocationBase(BaseModel):
    venue: str
    branch: str
    address: str

class ParticipantBase(BaseModel):
    nickname: str
    mannerScore: int
    isMe: bool = False

class MatchBase(BaseModel):
    games: List[str]
    difficulty: str
    tags: List[str]
    date: str
    startTime: str
    ruleVideoUrls: List[str]
    location: LocationBase
    maxPlayers: int
    is_flexible: bool = False

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: str # This is match_id (e.g., "m1")
    participants: List[ParticipantBase] = []

    class Config:
        from_attributes = True

class JoinMatchRequest(BaseModel):
    role: str = "participant"  # "participant" | "host"


class CancelResponse(BaseModel):
    cancelled: bool
    refunded_count: int
    refund_amount: int
    message: str


class NotificationItem(BaseModel):
    id: int
    type: str
    title: str
    body: str
    match_business_id: Optional[str] = None
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str


class MessageItem(BaseModel):
    id: int
    sender_nickname: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str
    mannerScore: int = 5

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    nickname: str
    mannerScore: int
    points: int = 0
    is_admin: bool = False

    class Config:
        from_attributes = True


class PointsAdjustRequest(BaseModel):
    delta: int
    description: str = ""


class ReviewItemIn(BaseModel):
    reviewee_nickname: str
    rating: int = Field(..., ge=1, le=6)


class ReviewCreateRequest(BaseModel):
    match_id: str  # 비즈니스 ID ("m1" 등)
    comment: str = ""
    reviews: List[ReviewItemIn]


class ReviewItem(BaseModel):
    id: int
    match_id: str  # 응답도 비즈니스 ID 로
    reviewee_nickname: str
    rating: int
    comment: str

    class Config:
        from_attributes = True


class PointHistoryItem(BaseModel):
    id: str
    type: str
    amount: int
    description: str
    # ORM 컬럼은 created_at 인데 응답 키는 'date' 로 노출 (프론트 친화).
    # Pydantic v2 의 validation_alias 는 입력 전용 alias — 출력은 필드명 그대로.
    date: datetime = Field(..., validation_alias="created_at")

    @field_validator("id", mode="before")
    @classmethod
    def _coerce_id(cls, v):
        return str(v)

    class Config:
        from_attributes = True
        populate_by_name = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

class PaymentVerifyRequest(BaseModel):
    payment_id: str
    amount: int

class GameBase(BaseModel):
    id: str
    name: str
    players: str
    difficulty: str
    genre: Optional[str] = None
    description: str
    ruleUrl: str
    image: str

    class Config:
        from_attributes = True
