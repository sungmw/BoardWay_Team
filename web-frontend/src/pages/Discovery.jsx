import React, { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchContext } from '../context/MatchContext';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Clock, Filter } from 'lucide-react';

const GENRES = ['전체', '입문', '전략', '파티', '추리', '마피아', '심리전', '힐링'];
const LOCATIONS = ['전체', '강남', '홍대', '신촌', '건대', '잠실', '노원', '수원', '인천', '분당'];
const TIMES = ['전체', '오전 (12시 이전)', '오후 (12~18시)', '저녁 (18시 이후)'];

const Discovery = () => {
  const { matches, loading } = useContext(MatchContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeDate, setActiveDate] = useState(formatDate(new Date()));
  const [activeGenre, setActiveGenre] = useState('전체');
  const [activeLocation, setActiveLocation] = useState('전체');
  const [activeTime, setActiveTime] = useState('전체');

  const dateList = useMemo(() => {
    const list = [];
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        full: formatDate(d),
        date: d.getDate(),
        day: weekDays[d.getDay()],
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  const matchTimeFilter = (startTime, filter) => {
    if (filter === '전체') return true;
    const hour = parseInt(startTime.split(':')[0], 10);
    if (filter === '오전 (12시 이전)') return hour < 12;
    if (filter === '오후 (12~18시)') return hour >= 12 && hour < 18;
    if (filter === '저녁 (18시 이후)') return hour >= 18;
    return true;
  };

  const filteredMatches = matches.filter(match => {
    const passDate = match.date === activeDate;
    const passGenre = activeGenre === '전체' || match.tags.includes(activeGenre);
    const passLocation = activeLocation === '전체' || 
                         match.location.address.includes(activeLocation) || 
                         match.location.branch.includes(activeLocation);
    const passTime = matchTimeFilter(match.startTime, activeTime);
    return passDate && passGenre && passLocation && passTime;
  });

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="heading-2 text-gradient">Discover Matches</h1>
        <p className="text-body">Find the perfect board game group near you.</p>
      </div>

      {/* Date Filter */}
      <div className="date-scroll-container mb-6" style={{ display: 'flex', overflowX: 'auto', gap: '0.75rem', paddingBottom: '1rem' }}>
        {dateList.map(item => (
          <button
            key={item.full}
            onClick={() => setActiveDate(item.full)}
            className={`date-item ${activeDate === item.full ? 'active' : ''}`}
            style={{
              minWidth: '60px', padding: '0.75rem', borderRadius: 'var(--radius-md)',
              backgroundColor: activeDate === item.full ? 'var(--primary)' : 'var(--bg-panel)',
              border: `1px solid ${activeDate === item.full ? 'var(--primary)' : 'var(--border-color)'}`,
              color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '0.75rem', marginBottom: '0.25rem', opacity: 0.8 }}>{item.day}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.date}</span>
            {item.isToday && <div style={{ width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%', marginTop: '4px' }} />}
          </button>
        ))}
      </div>

      {/* Dropdown Filters */}
      <div className="filter-grid mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <div className="input-group">
          <label className="input-label">장르</label>
          <select className="input-field" value={activeGenre} onChange={e => setActiveGenre(e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">장소</label>
          <select className="input-field" value={activeLocation} onChange={e => setActiveLocation(e.target.value)}>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">시간</label>
          <select className="input-field" value={activeTime} onChange={e => setActiveTime(e.target.value)}>
            {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="flex-center" style={{ height: '200px' }}>Loading matches...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
          <Filter size={48} color="var(--text-secondary)" className="mb-4" />
          <h3 className="heading-3">No Matches Found</h3>
          <p className="text-body">Try changing your filters or date to find more matches.</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredMatches.map(match => {
            const isFull = match.participants.length >= match.maxPlayers;
            const isMyMatch = user && match.participants.some(p => p.nickname === user.nickname);

            return (
              <div 
                key={match.id} 
                className={`card glass-panel ${isFull ? 'disabled' : ''}`}
                style={{ position: 'relative', cursor: isFull ? 'default' : 'pointer', opacity: isFull ? 0.7 : 1 }}
                onClick={() => !isFull && navigate(`/match/${match.id}`)}
              >
                {isFull && (
                  <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                    <span className="badge badge-warning">마감</span>
                  </div>
                )}
                {isMyMatch && !isFull && (
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className="badge badge-success">✓ 내 매치</span>
                  </div>
                )}

                <h3 className="heading-3 mb-2" style={{ paddingRight: '60px' }}>{match.games.join(' ➔ ')}</h3>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {match.tags.map(tag => (
                    <span key={tag} className="badge badge-primary">{tag}</span>
                  ))}
                  <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{match.difficulty}</span>
                </div>

                <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <MapPin size={16} />
                    <span>{match.location.venue} {match.location.branch}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Clock size={16} />
                    <span>{match.startTime}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span className="text-small">모집 인원</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{match.participants.length} / {match.maxPlayers} 명</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Discovery;
