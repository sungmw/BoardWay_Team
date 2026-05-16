from pydantic import BaseModel, EmailStr
from typing import List, Optional

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
