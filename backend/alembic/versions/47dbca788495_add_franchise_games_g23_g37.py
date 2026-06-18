"""add_franchise_games_g23_g37

Revision ID: 47dbca788495
Revises: 6a025335001e
Create Date: 2026-06-18 19:16:03.607083

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '47dbca788495'
down_revision: Union[str, Sequence[str], None] = '6a025335001e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_GAMES = [
    ("g23", "바퀴벌레 포커 로얄", "2-6인",  "쉬움",  "마피아 / 블러핑",
     "카드를 내밀며 거짓말을 해라! 누가 가장 많이 속을까? 블러핑 파티 게임의 고전",
     "", "/images/g23.png"),
    ("g24", "도블",              "2-8인",  "쉬움",  "파티 / 스피드",
     "두 카드 사이의 공통 그림을 가장 빨리 외쳐라! 모든 연령대가 즐기는 스피드 게임",
     "", "/images/g24.png"),
    ("g25", "우노",              "2-10인", "쉬움",  "카드 / 파티",
     "손에 쥔 카드를 먼저 다 내면 UNO! 전 세계가 사랑하는 국민 카드 게임",
     "", "/images/g25.png"),
    ("g26", "노땡스",            "3-7인",  "쉬움",  "카드 / 심리전",
     "숫자 카드를 거부하면 칩을 받는다. 카드를 가장 적게 모아라! 간단하지만 깊은 심리전",
     "", "/images/g26.png"),
    ("g27", "사보타지",          "3-10인", "보통",  "마피아 / 협력",
     "광부들이 금을 캐는 동안 방해꾼이 몰래 훼방을 놓는다! 내 편과 적을 찾아라",
     "", "/images/g27.png"),
    ("g28", "익스플로딩 키튼",   "2-5인",  "쉬움",  "카드 / 파티",
     "폭발하는 고양이 카드를 피하라! 전략과 운이 어우러진 초간단 카드 생존 게임",
     "", "/images/g28.png"),
    ("g29", "스시고",            "2-5인",  "쉬움",  "카드 / 전략",
     "회전 초밥처럼 카드를 돌리며 최고의 메뉴를 완성하라! 빠르고 귀여운 드래프팅 게임",
     "", "/images/g29.png"),
    ("g30", "카르카손",          "2-5인",  "보통",  "전략 / 타일 배치",
     "타일을 하나씩 놓아 중세 도시를 만들어라! 초보자도 쉽게 배우는 전략 타일 게임",
     "", "/images/g30.png"),
    ("g31", "킹오브도쿄",        "2-6인",  "보통",  "전략 / 주사위",
     "도쿄를 차지한 괴물 왕이 돼라! 주사위를 굴려 공격하고 에너지를 모으는 전략 게임",
     "", "/images/g31.png"),
    ("g32", "팬데믹",            "2-4인",  "보통",  "전략 / 협력",
     "전 세계에 퍼진 바이러스를 막아라! 팀원과 함께하는 협력 전략 게임의 명작",
     "", "/images/g32.png"),
    ("g33", "블러프",            "2-6인",  "쉬움",  "마피아 / 주사위",
     "주사위를 굴리고 눈 수를 선언하라! 상대방의 거짓말을 잡아내는 블러핑 게임",
     "", "/images/g33.png"),
    ("g34", "보난자",            "2-7인",  "쉬움",  "카드 / 협상",
     "콩 농사꾼이 돼서 거래로 부자가 돼라! 협상과 전략이 넘치는 콩 카드 게임",
     "", "/images/g34.png"),
    ("g35", "티켓 투 라이드",    "2-5인",  "보통",  "전략 / 노선",
     "기차 노선을 연결하라! 지도 위에서 펼치는 스마트한 전략 보드게임",
     "", "/images/g35.png"),
    ("g36", "7원더스",           "3-7인",  "보통",  "전략 / 드래프팅",
     "고대 7대 불가사의 중 하나를 이끌어라! 카드 드래프팅으로 문명을 발전시키는 전략 게임",
     "", "/images/g36.png"),
    ("g37", "우봉고",            "2-4인",  "쉬움",  "파티 / 퍼즐",
     "주어진 퍼즐 조각을 가장 빨리 맞춰라! 머리를 쓰는 스피드 퍼즐 게임",
     "", "/images/g37.png"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for game_id, name, players, difficulty, genre, description, rule_url, image in NEW_GAMES:
        conn.execute(
            sa.text("""
                INSERT INTO games (game_id, name, players, difficulty, genre, description, "ruleUrl", image)
                SELECT :game_id, :name, :players, :difficulty, :genre, :description, :rule_url, :image
                WHERE NOT EXISTS (SELECT 1 FROM games WHERE game_id = :game_id)
            """),
            {"game_id": game_id, "name": name, "players": players,
             "difficulty": difficulty, "genre": genre, "description": description,
             "rule_url": rule_url, "image": image},
        )


def downgrade() -> None:
    conn = op.get_bind()
    for game_id, *_ in NEW_GAMES:
        conn.execute(
            sa.text("DELETE FROM games WHERE game_id = :game_id"),
            {"game_id": game_id},
        )
