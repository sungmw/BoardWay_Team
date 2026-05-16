from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    nickname = Column(String, unique=True)
    mannerScore = Column(Integer, default=5)
    points = Column(Integer, default=0, nullable=False)

    point_history = relationship(
        "PointHistory",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="PointHistory.created_at.desc()",
    )

    reviews_given = relationship(
        "Review",
        back_populates="reviewer",
        cascade="all, delete-orphan",
        order_by="Review.created_at.desc()",
    )


class PointHistory(Base):
    __tablename__ = "point_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False)  # '충전' | '사용'
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="point_history")

class Review(Base):
    __tablename__ = "reviews"

    # (reviewer × reviewee_nickname × match) 단위로 row 한 개.
    # 한 매치에 참여자 N명이면 reviewer 가 N-1 개 row INSERT (자기 자신 제외).
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    reviewee_nickname = Column(String, nullable=False, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)  # 1~6
    comment = Column(String, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    reviewer = relationship("User", back_populates="reviews_given")


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
