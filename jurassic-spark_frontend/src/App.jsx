
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import MyPlaylists from './pages/MyPlaylists';
import Callback from "./pages/Callback";
import './Master.css';
import PlayListCreator from './components/PlayListCreator';
import UserPage from './pages/UserPage';
import SharePage from './pages/SharePage';
import PlaylistDetailsPage from './pages/PlaylistDetailsPage';
import useAuth from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();

  if (!auth?.access_token) {
    return <Navigate to="/login" replace />
  }

  return children;
};


function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/playlists" element={<CreatePlaylistPage />} />
        <Route path="/playlist/:id" element={<PlaylistDetailsPage />} />
        <Route path="/my-playlists" element={<MyPlaylists />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/share/:token" element={<SharePage />} />


        {/* ✅ New routes for Spotify testing */}
        <Route
          path="/spotify"
          element={
            <ProtectedRoute>
              <div className="login-page">
                <div className="login-main">
                  <div className="login-container">
                    <PlayListCreator />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Router>
  );
}

export default App;
