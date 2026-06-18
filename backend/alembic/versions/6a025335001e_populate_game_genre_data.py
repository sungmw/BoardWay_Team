"""populate_game_genre_data

Revision ID: 6a025335001e
Revises: a2fa425b3a12
Create Date: 2026-06-18 17:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '6a025335001e'
down_revision: Union[str, Sequence[str], None] = 'a2fa425b3a12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# 기존 게임 장르 매핑
GENRE_MAP = [
    ("g1",  "전략 / 엔진 빌딩"),
    ("g2",  "전략 / 협상"),
    ("g3",  "숫자 / 타일"),
    ("g4",  "마피아 / 심리전"),
    ("g5",  "파티 / 순발력"),
    ("g6",  "추리 / 숫자"),
    ("g7",  "파티 / 드로잉"),
    ("g8",  "파티 / 카드"),
    ("g9",  "마피아 / 심리전"),
    ("g10", "파티 / 스토리텔링"),
    ("g11", "전략 / 엔진 빌딩"),
    ("g12", "단어 / 팀 대항"),
    ("g13", "전략 / 헤비게임"),
    ("g14", "파티 / 균형"),
    ("g15", "고전 / 경제"),
]

# 신규 7종 (엑셀 추가)
NEW_GAMES = [
    ("g16", "아줄",          "2-4인",    "보통", "추상 전략 / 타일 배치",  "모로코 타일 예술에서 영감받은 아름다운 타일 배치 전략 게임. 직관적이지만 치열하다",   "https://youtu.be/PLCU5GlgQC4?si=Oevja0OJrXTL51S9", "/images/g16.png"),
    ("g17", "라스베가스",    "2-5인",    "쉬움", "파티 / 주사위",          "주사위를 굴려 카지노를 점령하라! 단순하지만 짜릿한 배팅 주사위 게임",                "https://youtu.be/Bt2escpWj8Q?si=eNi2GByZIfiU9XjS",  "/images/g17.png"),
    ("g18", "스컬킹",        "2-6인",    "보통", "카드 / 트릭 테이킹",     "해적이 되어 트릭을 먹어라! 심리전이 가득한 트릭 테이킹 카드 게임",                  "https://youtu.be/cYB1h4xOonI?si=bSufr76FqM-yVRjv",  "/images/g18.png"),
    ("g19", "클루",          "2-6인",    "보통", "추리 / 블러핑",          "누가, 어디서, 어떻게 살인했나? 고전 추리 보드게임의 대명사",                         "https://youtu.be/7Ium0jpht0g?si=bIxmqJcGL3L6dygf",  "/images/g19.png"),
    ("g20", "레지스탕스 쿠", "2-6인",    "쉬움", "마피아 / 블러핑",        "쿠데타를 일으켜 다른 플레이어를 제거하라! 블러핑의 정점",                            "https://youtu.be/7j7zkNsPiPQ?si=jt4T5cBmvILqs1NG",  "/images/g20.png"),
    ("g21", "패치워크",      "2인 전용", "쉬움", "타일 배치 / 2인 전용",   "퀼트 조각을 맞춰 이불을 완성하라! 2인 최강 타일 배치 퍼즐 게임",                    "https://youtu.be/PJ0BydwalAY?si=0UASKaBlu6CDc9ov",  "/images/g21.png"),
    ("g22", "러브레터",      "2-4인",    "쉬움", "카드 / 심리전",          "단 16장의 카드로 공주에게 편지를 전달하라! 단순하지만 깊이 있는 심리 게임",          "https://youtu.be/QJh1rQortrc?si=UyEwgLJYViNHTtdW",  "/images/g22.png"),
]


def upgrade() -> None:
    conn = op.get_bind()

    # 기존 게임 genre UPDATE
    for game_id, genre in GENRE_MAP:
        conn.execute(
            sa.text("UPDATE games SET genre = :genre WHERE game_id = :game_id"),
            {"genre": genre, "game_id": game_id},
        )

    # 신규 7게임 INSERT (game_id 중복이면 스킵)
    for game_id, name, players, difficulty, genre, description, rule_url, image in NEW_GAMES:
        conn.execute(
            sa.text("""
                INSERT INTO games (game_id, name, players, difficulty, genre, description, "ruleUrl", image)
                SELECT :game_id, :name, :players, :difficulty, :genre, :description, :rule_url, :image
                WHERE NOT EXISTS (SELECT 1 FROM games WHERE game_id = :game_id)
            """),
            {
                "game_id": game_id, "name": name, "players": players,
                "difficulty": difficulty, "genre": genre, "description": description,
                "rule_url": rule_url, "image": image,
            },
        )


def downgrade() -> None:
    conn = op.get_bind()

    # 신규 게임 삭제
    for game_id, *_ in NEW_GAMES:
        conn.execute(
            sa.text("DELETE FROM games WHERE game_id = :game_id"),
            {"game_id": game_id},
        )

    # 장르 NULL로 초기화
    for game_id, _ in GENRE_MAP:
        conn.execute(
            sa.text("UPDATE games SET genre = NULL WHERE game_id = :game_id"),
            {"game_id": game_id},
        )
