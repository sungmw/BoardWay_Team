import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Gamepad2, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo flex-center">
          <Gamepad2 size={28} color="var(--primary)" />
          <span className="text-gradient heading-3 mb-0" style={{ marginLeft: '0.5rem', marginBottom: 0 }}>BoardWay</span>
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/discovery" className="nav-link">Discovery</Link>
              <Link to="/my-matches" className="nav-link">My Matches</Link>
              <div className="user-menu flex-center">
                <span className="text-small" style={{ marginRight: '1rem' }}>{user.nickname}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm flex-center">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
