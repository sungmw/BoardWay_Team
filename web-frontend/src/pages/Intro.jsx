import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Gamepad2, Users, Search } from 'lucide-react';

const Intro = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/discovery');
    }
  }, [user, navigate]);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div className="animate-fade-in">
        <Gamepad2 size={80} color="var(--primary)" style={{ marginBottom: '2rem' }} />
        <h1 className="heading-1 text-gradient">Welcome to BoardWay</h1>
        <p className="text-body" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Connect with board game enthusiasts, find local matches, and play your favorite games together.
        </p>

        <div className="card-grid mb-8" style={{ textAlign: 'left' }}>
          <div className="card glass-panel">
            <Search size={32} color="var(--primary)" className="mb-4" />
            <h3 className="heading-3">Discover Games</h3>
            <p className="text-small">Explore a vast collection of board games and find details easily.</p>
          </div>
          <div className="card glass-panel">
            <Users size={32} color="var(--secondary)" className="mb-4" />
            <h3 className="heading-3">Find Players</h3>
            <p className="text-small">Join matches or create your own to gather people near you.</p>
          </div>
        </div>

        <div className="flex-center" style={{ gap: '1rem' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Intro;
