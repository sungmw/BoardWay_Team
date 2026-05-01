import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# 환경 변수에서 POSTGRES_URL 가져오기
# 없으면 기본값으로 SQLite 사용 (개발용)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "POSTGRES_URL", 
    "sqlite:///./boardway.db"
)

# PostgreSQL일 경우 추가 인자 불필요, SQLite일 경우 check_same_thread=False 필요
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # psycopg2를 사용하도록 강제 변환 (postgresql:// -> postgresql+psycopg2://)
    if SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
