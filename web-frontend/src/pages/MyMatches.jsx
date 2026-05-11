import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import api from '../services/api';

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyMatches = async () => {
      try {
        const response = await api.get('/my-matches');
        setMatches(response.data.matches);
      } catch (error) {
        console.error('Error fetching my matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMatches();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading...</div>;

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="heading-2 text-gradient">My Matches</h1>
        <p className="text-body">내가 참여 중인 매치 목록입니다.</p>
      </div>

      {matches.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
          <Calendar size={48} color="var(--text-secondary)" className="mb-4" />
          <h3 className="heading-3">참여 중인 매치가 없습니다</h3>
          <p className="text-body mb-6">새로운 매치를 찾아보고 사람들과 보드게임을 즐겨보세요!</p>
          <button onClick={() => navigate('/discovery')} className="btn btn-primary">
            매치 찾아보기
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {matches.map(match => (
            <div 
              key={match.id} 
              className="card glass-panel animate-fade-in"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/match/${match.id}`)}
            >
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <span className="badge badge-success">참여 중</span>
              </div>

              <h3 className="heading-3 mb-2" style={{ paddingRight: '60px' }}>{match.games.join(' ➔ ')}</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="badge badge-primary">{match.date}</span>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>난이도: {match.difficulty}</span>
              </div>

              <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <MapPin size={16} />
                  <span>{match.location.venue} {match.location.branch}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <Clock size={16} />
                  <span>{match.startTime} 시작</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span className="text-small" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>상세 보기</span>
                <ArrowRight size={16} color="var(--primary)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMatches;
