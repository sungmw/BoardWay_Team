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

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: str # This is match_id (e.g., "m1")
    participants: List[ParticipantBase] = []

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str
    mannerScore: int = 5

class UserResponse(BaseModel):
    email: EmailStr
    nickname: str
    mannerScore: int
    points: int = 0

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
    date: datetime = Field(..., alias="created_at")

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

class GameBase(BaseModel):
    id: str
    name: str
    players: str
    difficulty: str
    description: str
    ruleUrl: str
    image: str

    class Config:
        from_attributes = True
