import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await signup(email, password, nickname);
    setIsLoading(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: '70vh' }}>
      <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="flex-center mb-6">
          <UserPlus size={32} color="var(--secondary)" />
        </div>
        <h2 className="heading-2" style={{ textAlign: 'center' }}>Create Account</h2>
        <p className="text-body" style={{ textAlign: 'center', marginBottom: '2rem' }}>Join the BoardWay community</p>

        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label className="input-label">Nickname</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block mt-4" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-small mt-6" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login" className="text-gradient" style={{ fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
