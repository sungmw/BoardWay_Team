import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/discovery');
    }
  };

  return (
    <div className="container flex-center" style={{ minHeight: '60vh' }}>
      <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="flex-center mb-6">
          <LogIn size={32} color="var(--primary)" />
        </div>
        <h2 className="heading-2" style={{ textAlign: 'center' }}>Welcome Back</h2>
        <p className="text-body" style={{ textAlign: 'center', marginBottom: '2rem' }}>Login to access your matches</p>

        <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block mt-4" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-small mt-6" style={{ textAlign: 'center' }}>
          Don't have an account? <Link to="/signup" className="text-gradient" style={{ fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
