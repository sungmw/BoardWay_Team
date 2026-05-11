import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../services/api';

const GameSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get('/games');
      setGames(response.data.games);
    } catch (error) {
      console.error('게임 데이터를 불러오는 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredGame = games[0];

  return (
    <div className="container">
      <div className="mb-6">
        <h2 className="heading-2 text-gradient">보드게임 도감</h2>
        <p className="text-body">다양한 보드게임 정보를 검색해보세요.</p>
      </div>

      <div className="input-group mb-8" style={{ position: 'relative' }}>
        <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: '3rem' }}
          placeholder="찾으시는 보드게임이 있나요?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>Loading...</div>
      ) : (
        <>
          {!searchQuery && featuredGame && (
            <div className="mb-8 animate-fade-in">
              <h3 className="heading-3 mb-4">이번 주의 추천 게임</h3>
              <div 
                className="card glass-panel" 
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate(`/game/${featuredGame.id}`)}
              >
                <div style={{ height: '200px', backgroundColor: '#333', backgroundImage: `url(${featuredGame.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <h2 className="heading-2" style={{ color: 'white', margin: 0 }}>{featuredGame.name}</h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h3 className="heading-3 mb-4">{searchQuery ? '검색 결과' : '전체 게임 도감'}</h3>
          
          {filteredGames.length === 0 ? (
            <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
              <Search size={48} color="var(--text-secondary)" className="mb-4" />
              <p className="text-body">찾으시는 게임이 아직 도감에 없네요!</p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredGames.map(game => (
                <div 
                  key={game.id} 
                  className="card glass-panel flex-center animate-fade-in" 
                  style={{ flexDirection: 'row', gap: '1rem', cursor: 'pointer', padding: '1rem' }}
                  onClick={() => navigate(`/game/${game.id}`)}
                >
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0', left: '0', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', fontWeight: 'bold', borderBottomRightRadius: 'var(--radius-sm)' }}>
                      {game.difficulty}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="heading-3" style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{game.name}</h4>
                    <p className="text-small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      {game.description}
                    </p>
                    <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>👥 {game.players}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameSearch;
