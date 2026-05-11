import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MatchContext } from '../context/MatchContext';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, MapPin, Clock, Users, ShieldCheck, PlayCircle, CheckSquare, Square } from 'lucide-react';

const MatchDetail = () => {
  const { matchId } = useParams();
  const { fetchMatchById, joinMatch } = useContext(MatchContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [ruleChecked, setRuleChecked] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const loadMatch = async () => {
      const data = await fetchMatchById(matchId);
      setMatch(data);
      setLoading(false);
    };
    loadMatch();
  }, [matchId]);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading...</div>;
  if (!match) return <div className="flex-center" style={{ height: '60vh' }}>Match not found.</div>;

  const isAlreadyJoined = user && match.participants.some(p => p.nickname === user.nickname);
  const isFull = match.participants.length >= match.maxPlayers;

  const calculateEndTime = (startTime) => {
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      let endHours = hours + 2;
      return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const extractVideoId = (url) => {
    if (!url) return 'kYJqD0E4X5Y';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
      return urlObj.searchParams.get('v') || 'kYJqD0E4X5Y';
    } catch {
      return 'kYJqD0E4X5Y';
    }
  };

  const handlePayment = async () => {
    if (isJoining) return;
    if (!ruleChecked) {
      alert('룰 영상을 모두 시청하고 체크박스를 확인해주세요.');
      return;
    }
    setIsJoining(true);
    const result = await joinMatch(match.id);
    setIsJoining(false);

    if (result.success) {
      setModalVisible(false);
      navigate('/match-confirm', { state: { match } });
    } else {
      alert(result.message || '오류가 발생했습니다.');
    }
  };

  const mapQuery = encodeURIComponent(`${match.location.venue} ${match.location.branch} ${match.location.address}`);
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="container" style={{ position: 'relative', paddingBottom: '100px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6" style={{ padding: '0.5rem' }}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="grid gap-6">
        {/* Header & Main Info */}
        <div className="card glass-panel animate-fade-in">
          <p className="text-small mb-2">진행 예정 보드게임 ({match.games.length}종)</p>
          {match.games.map((game, i) => (
            <h2 key={game} className="heading-2" style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{i+1}. {game}</h2>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {match.tags.map(tag => <span key={tag} className="badge badge-primary">{tag}</span>)}
          </div>
        </div>

        {/* Location Section */}
        <div className="card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="heading-3 mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
            <MapPin size={24} color="var(--primary)" /> 모이는 장소
          </h3>
          <p className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{match.location.venue} {match.location.branch}</p>
          <p className="text-small mb-4">{match.location.address}</p>
          <div style={{ width: '100%', height: '250px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="heading-3 mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
            <Clock size={24} color="var(--primary)" /> 보드웨이 룸 대여 타임라인
          </h3>
          <div style={{ position: 'relative', paddingLeft: '2rem', marginBottom: '1rem' }}>
            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border-color)' }}></div>
            
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '-2rem', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', zIndex: 2, transform: 'translateX(-1px)' }}></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>{match.startTime}</span>
                <span>매치 시작 및 인사</span>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-2rem', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--secondary)', zIndex: 2, transform: 'translateX(-1px)' }}></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>{calculateEndTime(match.startTime)}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>기본 종료 시간 (2시간)</span>
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <p className="text-small" style={{ color: 'var(--warning)', margin: 0 }}>※ 기본 이용 시간은 2시간입니다. 상호 간의 협의 하에 현장에서 추가 금액을 지불하고 시간을 연장할 수 있습니다.</p>
          </div>
        </div>

        {/* Participants Section */}
        <div className="card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="heading-3 mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
            <Users size={24} color="var(--primary)" /> 현재 참여자 정보 ({match.participants.length}/{match.maxPlayers})
          </h3>
          <div className="grid gap-4">
            {match.participants.map(p => (
              <div key={p.nickname} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{p.nickname}</span>
                    {user && user.nickname === p.nickname && <span style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>(본인)</span>}
                  </div>
                  {p.mannerScore >= 5 && <div style={{ color: 'var(--warning)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={14} /> 굿 매너 유저</div>}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎲</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.mannerScore}/6</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Section */}
        <div className="card glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h3 className="heading-3 mb-2 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
            <PlayCircle size={24} color="var(--primary)" /> 룰 숙지 인증
          </h3>
          <p className="text-small mb-4">가장 바른 즐거움을 위해 아래 게임의 룰을 모두 숙지해주세요.</p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {match.games.map((game, idx) => (
              <button 
                key={game}
                onClick={() => setActiveVideoIndex(idx)}
                className={`btn ${activeVideoIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, minWidth: 'max-content', padding: '0.5rem 1rem' }}
              >
                {game}
              </button>
            ))}
          </div>

          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'black' }}>
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${extractVideoId(match.ruleVideoUrls?.[activeVideoIndex])}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', backgroundColor: 'var(--bg-panel)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-color)', zIndex: 10 }}>
        <div className="container" style={{ padding: 0 }}>
          <button 
            className={`btn btn-block ${isAlreadyJoined || isFull ? 'btn-secondary' : 'btn-primary'}`} 
            style={{ padding: '1rem', fontSize: '1.125rem' }}
            disabled={isAlreadyJoined || isFull}
            onClick={() => {
              if (!user) {
                alert('매칭 신청은 로그인 후 이용 가능합니다.');
                navigate('/login');
              } else {
                setModalVisible(true);
              }
            }}
          >
            {isAlreadyJoined ? "이미 참여 완료된 매치입니다" : isFull ? "모집이 마감되었습니다" : "룸 매치 참여 결제하기"}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {modalVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-color)', padding: '2rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, animation: 'fadeIn 0.3s ease-out' }}>
            <h2 className="heading-2 mb-6">매치 참여 확인</h2>
            
            <div 
              onClick={() => setRuleChecked(!ruleChecked)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: `1px solid ${ruleChecked ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', marginBottom: '2rem', cursor: 'pointer', backgroundColor: ruleChecked ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}
            >
              {ruleChecked ? <CheckSquare size={24} color="var(--primary)" /> : <Square size={24} color="var(--text-secondary)" />}
              <span style={{ fontSize: '1.125rem' }}>3가지 게임의 룰을 모두 숙지했습니다.</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setModalVisible(false)} className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }}>취소</button>
              <button 
                onClick={handlePayment} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '1rem', opacity: (!ruleChecked || isJoining) ? 0.5 : 1 }} 
                disabled={!ruleChecked || isJoining}
              >
                {isJoining ? '처리중...' : '결제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;
