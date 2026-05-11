import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, Clock, ArrowRight } from 'lucide-react';

const MatchConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { match } = location.state || {};

  useEffect(() => {
    if (!match) {
      navigate('/discovery');
    }
  }, [match, navigate]);

  if (!match) return null;

  return (
    <div className="container flex-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel animate-fade-in" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
        <CheckCircle size={80} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 className="heading-1 mb-2" style={{ color: 'var(--success)' }}>결제 완료!</h1>
        <h2 className="heading-3 mb-6">매치 참여가 확정되었습니다</h2>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem' }}>
          <h3 className="heading-3" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{match.games.join(' ➔ ')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={20} color="var(--text-secondary)" style={{ marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 'bold', margin: 0 }}>{match.location.venue} {match.location.branch}</p>
                <p className="text-small" style={{ margin: 0 }}>{match.location.address}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Clock size={20} color="var(--text-secondary)" />
              <span style={{ fontWeight: 'bold' }}>{match.date} {match.startTime}</span>
            </div>
          </div>
        </div>

        <p className="text-body mb-8">
          참여하신 매치 정보는 <strong>'내 매치'</strong> 메뉴에서 언제든 다시 확인할 수 있습니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button onClick={() => navigate('/my-matches')} className="btn btn-primary btn-block" style={{ padding: '1rem' }}>
            <span>내 매치 확인하기</span>
            <ArrowRight size={20} />
          </button>
          <button onClick={() => navigate('/discovery')} className="btn btn-secondary btn-block" style={{ padding: '1rem' }}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchConfirmation;
