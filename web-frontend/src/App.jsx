import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { MatchProvider } from './context/MatchContext';
import Navbar from './components/Navbar';
import Intro from './pages/Intro';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Discovery from './pages/Discovery';
import GameSearch from './pages/GameSearch';
import GameDetail from './pages/GameDetail';
import MatchDetail from './pages/MatchDetail';
import MatchConfirmation from './pages/MatchConfirmation';
import MyMatches from './pages/MyMatches';

const PrivateRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <MatchProvider>
        <Router>
        <Navbar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/discovery" element={<PrivateRoute><Discovery /></PrivateRoute>} />
            <Route path="/game-search" element={<PrivateRoute><GameSearch /></PrivateRoute>} />
            <Route path="/game/:gameId" element={<PrivateRoute><GameDetail /></PrivateRoute>} />
            <Route path="/match/:matchId" element={<PrivateRoute><MatchDetail /></PrivateRoute>} />
            <Route path="/match-confirm" element={<PrivateRoute><MatchConfirmation /></PrivateRoute>} />
            <Route path="/my-matches" element={<PrivateRoute><MyMatches /></PrivateRoute>} />
          </Routes>
        </main>
        </Router>
      </MatchProvider>
    </AuthProvider>
  );
}

export default App;
