import models
from database import engine, SessionLocal, Base

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

GAMES_DATA = [
    {"id": "g1", "name": "스플랜더", "players": "2-4인", "difficulty": "Easy", "description": "보석을 모아 카드를 사고 점수를 획득하는 최고의 입문용 전략 게임", "ruleUrl": "https://www.youtube.com/embed/3Y-VZ3pCSlw", "image": "http://172.20.10.4:8000/images/g1.png"},
    {"id": "g2", "name": "카탄", "players": "3-4인", "difficulty": "Medium", "description": "무인도에서 자원을 채집하고 거래하며 마을을 건설하는 고전 명작", "ruleUrl": "https://www.youtube.com/embed/37V2ajpMEic", "image": "http://172.20.10.4:8000/images/g2.png"},
    {"id": "g3", "name": "루미큐브", "players": "2-4인", "difficulty": "Easy", "description": "숫자 조합을 통해 손에 든 타일을 가장 먼저 털어내는 지능형 게임", "ruleUrl": "https://www.youtube.com/embed/uHuYRzgzbL8", "image": "http://172.20.10.4:8000/images/g3.png"},
    {"id": "g4", "name": "뱅!", "players": "4-7인", "difficulty": "Medium", "description": "보안관과 무법자의 치열한 대결! 서부 시대를 배경으로 한 마피아 카드 게임", "ruleUrl": "https://www.youtube.com/embed/7-VvKjF_f00", "image": "http://172.20.10.4:8000/images/g4.png"},
    {"id": "g5", "name": "할리갈리", "players": "2-6인", "difficulty": "Easy", "description": "과일 5개가 모이면 종을 쳐라! 순발력 게임의 대명사", "ruleUrl": "https://www.youtube.com/embed/_9J8W1_m89Y", "image": "http://172.20.10.4:8000/images/g5.png"},
    {"id": "g6", "name": "다빈치 코드", "players": "2-4인", "difficulty": "Easy", "description": "상대방의 숫자를 추리해서 모두 맞혀라! 간단하지만 심오한 숫자 추리 게임", "ruleUrl": "https://www.youtube.com/embed/6_rW_iK-mAI", "image": "http://172.20.10.4:8000/images/g6.png"},
    {"id": "g7", "name": "텔레스트레이션", "players": "4-8인", "difficulty": "Easy", "description": "그림으로 말해요! 웃음이 끊이지 않는 최고의 파티 드로잉 게임", "ruleUrl": "https://www.youtube.com/embed/VhN-fT3wLTo", "image": "http://172.20.10.4:8000/images/g7.png"},
    {"id": "g8", "name": "달무티", "players": "4-8인", "difficulty": "Easy", "description": "인생은 불공평합니다! 계급 사회를 풍자한 중독성 강한 카드 게임", "ruleUrl": "https://www.youtube.com/embed/G68eS9-F5iM", "image": "http://172.20.10.4:8000/images/g8.png"},
    {"id": "g9", "name": "아발론", "players": "5-10인", "difficulty": "Medium", "description": "아서 왕의 충신과 모드레드의 하수인! 마피아 게임의 정점", "ruleUrl": "https://www.youtube.com/embed/3-M-Q8v8_1Y", "image": "http://172.20.10.4:8000/images/g9.png"},
    {"id": "g10", "name": "딕싯", "players": "3-6인", "difficulty": "Easy", "description": "한 편의 시 같은 그림 카드로 소통하는 감성적인 스토리텔링 게임", "ruleUrl": "https://www.youtube.com/embed/uHuYRzgzbL8", "image": "http://172.20.10.4:8000/images/g10.png"},
    {"id": "g11", "name": "윙스팬", "players": "1-5인", "difficulty": "Medium", "description": "아름다운 새들을 내 서식지로 불러모으는 힐링 전략 게임", "ruleUrl": "https://www.youtube.com/embed/vVEnrG8rI_s", "image": "http://172.20.10.4:8000/images/g11.png"},
    {"id": "g12", "name": "코드네임", "players": "2-8인", "difficulty": "Easy", "description": "단어 하나로 팀원에게 정답을 알려라! 팀 대항 단어 연상 게임", "ruleUrl": "https://www.youtube.com/embed/fGfG16T7Zic", "image": "http://172.20.10.4:8000/images/g12.png"},
    {"id": "g13", "name": "테라포밍 마스", "players": "1-5인", "difficulty": "Hard", "description": "화성을 인간이 살 수 있는 곳으로! 보드게이머들이 가장 사랑하는 전략 게임", "ruleUrl": "https://www.youtube.com/embed/8-z3yBPlr_E", "image": "http://172.20.10.4:8000/images/g13.png"},
    {"id": "g14", "name": "젠가", "players": "1-10인", "difficulty": "Easy", "description": "블록을 하나씩 빼서 위로 쌓아라! 아슬아슬한 긴장감의 파티 게임", "ruleUrl": "https://www.youtube.com/embed/f84E6hJ2-V0", "image": "http://172.20.10.4:8000/images/g14.png"},
    {"id": "g15", "name": "부루마불", "players": "2-4인", "difficulty": "Easy", "description": "전 세계를 누비며 땅을 사고 건물을 짓는 추억의 국민 보드게임", "ruleUrl": "https://www.youtube.com/embed/f84E6hJ2-V0", "image": "http://172.20.10.4:8000/images/g15.png"},
]

MATCHES_DATA = [
    {
        "id": "m1", "games": ["스플랜더", "카탄", "루미큐브"], "difficulty": "Easy",
        "tags": ["파티/캐주얼", "초보 환영"], "startTime": "19:00", "ruleVideoUrls": [],
        "location": {"venue": "레드버튼", "branch": "강남점", "address": "서울 강남구 강남대로 432"},
        "participants": [{"nickname": "보드마스터", "mannerScore": 6}, {"nickname": "초보자", "mannerScore": 5}],
        "maxPlayers": 4
    },
    {
        "id": "m2", "games": ["테라포밍 마스", "가이아 프로젝트", "브라스 버밍엄"], "difficulty": "Hard",
        "tags": ["전략 집중", "두뇌 풀가동"], "startTime": "20:00", "ruleVideoUrls": [],
        "location": {"venue": "홈즈앤루팡", "branch": "홍대점", "address": "서울 마포구 홍익로 25"},
        "participants": [{"nickname": "전략의신", "mannerScore": 5}, {"nickname": "고수", "mannerScore": 5}],
        "maxPlayers": 4
    },
    {
        "id": "m3", "games": ["아발론", "시크릿 히틀러", "뱅!"], "difficulty": "Medium",
        "tags": ["마피아/블러핑", "초보 환영"], "startTime": "18:30", "ruleVideoUrls": [],
        "location": {"venue": "포퀸스", "branch": "건대점", "address": "서울 광진구 능동로 111"},
        "participants": [{"nickname": "거짓말쟁이", "mannerScore": 4}, {"nickname": "마피아전문", "mannerScore": 5}, {"nickname": "시민", "mannerScore": 6}],
        "maxPlayers": 8
    },
    {
        "id": "m4", "games": ["카탄", "아발론", "루미큐브"], "difficulty": "Medium",
        "tags": ["장르 혼합", "단짠단짠"], "startTime": "19:00", "ruleVideoUrls": [],
        "location": {"venue": "레드버튼", "branch": "서면점", "address": "부산 부산진구 중앙대로 692"},
        "participants": [{"nickname": "카탄러", "mannerScore": 5}],
        "maxPlayers": 5
    },
    {
        "id": "m5", "games": ["패치워크", "세븐 원더스 듀얼", "자이푸르"], "difficulty": "Medium",
        "tags": ["2인 전용", "전략 집중"], "startTime": "21:00", "ruleVideoUrls": [],
        "location": {"venue": "홈즈앤루팡", "branch": "대전점", "address": "대전 서구 둔산로 31"},
        "participants": [{"nickname": "1대1매니아", "mannerScore": 6}],
        "maxPlayers": 2
    },
    {
        "id": "m6", "games": ["할리갈리", "텔레스트레이션", "딕싯"], "difficulty": "Easy",
        "tags": ["파티/캐주얼", "텐션 UP"], "startTime": "18:00", "ruleVideoUrls": [],
        "location": {"venue": "포퀸스", "branch": "홍대점", "address": "서울 마포구 와우산로 100"},
        "participants": [{"nickname": "파티마스터", "mannerScore": 6}, {"nickname": "웃음전도사", "mannerScore": 5}],
        "maxPlayers": 6
    },
    {
        "id": "m7", "games": ["푸에르토리코", "콘코르디아", "테라미스티카"], "difficulty": "Hard",
        "tags": ["전략 집중", "고수 구함"], "startTime": "14:00", "ruleVideoUrls": [],
        "location": {"venue": "레드버튼", "branch": "수원역점", "address": "경기 수원시 팔달구 매산로 1"},
        "participants": [{"nickname": "머리쓰기장인", "mannerScore": 5}, {"nickname": "보드게임덕후", "mannerScore": 4}],
        "maxPlayers": 4
    },
    {
        "id": "m8", "games": ["한밤의 늑대인간", "마피아", "블러드 바운드"], "difficulty": "Medium",
        "tags": ["마피아/블러핑", "연기력 필수"], "startTime": "22:00", "ruleVideoUrls": [],
        "location": {"venue": "홈즈앤루팡", "branch": "동성로점", "address": "대구 중구 동성로 12"},
        "participants": [{"nickname": "포커페이스", "mannerScore": 6}, {"nickname": "시민인척", "mannerScore": 5}],
        "maxPlayers": 10
    },
    {
        "id": "m9", "games": ["티켓 투 라이드", "달무티", "도미니언"], "difficulty": "Easy",
        "tags": ["장르 혼합", "초보 환영"], "startTime": "13:00", "ruleVideoUrls": [],
        "location": {"venue": "포퀸스", "branch": "부평점", "address": "인천 부평구 부평대로 24"},
        "participants": [{"nickname": "카드수집가", "mannerScore": 5}],
        "maxPlayers": 4
    },
]

def seed_db(force_reset=False):
    db = SessionLocal()

    if force_reset:
        print("기존 데이터를 초기화합니다...")
        db.query(models.MatchParticipant).delete()
        db.query(models.Match).delete()
        db.query(models.Game).delete()
        db.query(models.User).delete()
        db.commit()
        print("초기화 완료.")

    if db.query(models.Game).first():
        print("데이터베이스에 이미 데이터가 존재합니다. 시딩을 건너뜁니다.")
        db.close()
        return

    print("초기 데이터 시딩을 시작합니다...")

    for g in GAMES_DATA:
        db.add(models.Game(
            game_id=g["id"], name=g["name"], players=g["players"],
            difficulty=g["difficulty"], description=g["description"],
            ruleUrl=g["ruleUrl"], image=g["image"]
        ))

    for m in MATCHES_DATA:
        db_match = models.Match(
            match_id=m["id"], games=m["games"], difficulty=m["difficulty"],
            tags=m["tags"], startTime=m["startTime"], ruleVideoUrls=m["ruleVideoUrls"],
            venue=m["location"]["venue"], branch=m["location"]["branch"],
            address=m["location"]["address"], maxPlayers=m["maxPlayers"]
        )
        db.add(db_match)
        db.commit()
        db.refresh(db_match)
        for p in m["participants"]:
            db.add(models.MatchParticipant(
                match_id=db_match.id, nickname=p["nickname"], mannerScore=p["mannerScore"]
            ))

    db.commit()
    print(f"시딩 완료! 게임 {len(GAMES_DATA)}개, 매칭 {len(MATCHES_DATA)}개 추가됨.")
    db.close()

if __name__ == "__main__":
    seed_db(force_reset=True)
