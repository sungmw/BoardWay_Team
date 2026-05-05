from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    nickname = Column(String, unique=True)
    mannerScore = Column(Integer, default=5)

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(String, unique=True, index=True) # e.g., "g1"
    name = Column(String)
    players = Column(String)
    difficulty = Column(String)
    description = Column(String)
    ruleUrl = Column(String)
    image = Column(String)

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String, unique=True, index=True) # e.g., "m1"
    
    games = Column(JSON) # List of strings
    difficulty = Column(String)
    tags = Column(JSON)
    date = Column(String) # YYYY-MM-DD
    startTime = Column(String)
    ruleVideoUrls = Column(JSON)
    
    # location fields
    venue = Column(String)
    branch = Column(String)
    address = Column(String)
    
    maxPlayers = Column(Integer)

    participants = relationship("MatchParticipant", back_populates="match", cascade="all, delete-orphan")

class MatchParticipant(Base):
    __tablename__ = "match_participants"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    nickname = Column(String)
    mannerScore = Column(Integer)
    
    match = relationship("Match", back_populates="participants")
