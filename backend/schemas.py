from pydantic import BaseModel
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
    id: str
    games: List[str]
    difficulty: str
    tags: List[str]
    startTime: str
    ruleVideoUrls: List[str]
    location: LocationBase
    maxPlayers: int

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    participants: List[ParticipantBase] = []

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    nickname: str
    mannerScore: int = 5

class UserResponse(BaseModel):
    email: str
    nickname: str
    mannerScore: int

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class GameBase(BaseModel):
    id: str
    name: str
    players: str
    difficulty: str
    description: str
    ruleUrl: str
    image: str

    class Config:
        orm_mode = True
