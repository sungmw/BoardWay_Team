import os
import sys
from logging.config import fileConfig

from alembic import context

# backend/ 를 import path 에 추가 (alembic/ 하위에서 실행되므로)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, engine, SQLALCHEMY_DATABASE_URL  # noqa: E402
import models  # noqa: F401, E402  — Base.metadata 에 테이블들 등록되게 함

# Alembic Config 객체 (alembic.ini 의 값들 접근용)
config = context.config

# Python 로깅 설정
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# autogenerate 가 비교할 대상 메타데이터
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """오프라인 모드: SQL 스크립트만 생성 (DB 연결 없이)."""
    context.configure(
        url=SQLALCHEMY_DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """온라인 모드: database.py 의 엔진을 그대로 사용해 실제 DB 에 적용."""
    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
