import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap, ExternalLink } from 'lucide-react';
import api from '../services/api';

const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await api.get('/games');
        const foundGame = response.data.games.find(g => String(g.id) === String(gameId));
        setGame(foundGame);
      } catch (error) {
        console.error('Error fetching game:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [gameId]);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading...</div>;
  if (!game) return <div className="flex-center" style={{ height: '60vh' }}>Game not found.</div>;

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6" style={{ padding: '0.5rem' }}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="card glass-panel animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '300px', backgroundColor: '#333', backgroundImage: `url(${game.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        </div>

        <div style={{ padding: '2rem' }}>
          <div className="mb-6">
            <span className="badge badge-primary mb-2">{game.difficulty} 난이도</span>
            <h1 className="heading-1">{game.name}</h1>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Users size={24} color="var(--primary)" />
              <span style={{ fontSize: '1.125rem' }}>{game.players}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Zap size={24} color="var(--warning)" />
              <span style={{ fontSize: '1.125rem' }}>{game.difficulty}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="heading-3">게임 설명</h3>
            <p className="text-body" style={{ fontSize: '1.125rem', lineHeight: 1.8 }}>
              {game.description}
            </p>
          </div>

          {game.ruleUrl && (
            <a href={game.ruleUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              <ExternalLink size={20} />
              <span>룰 영상 보기</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
