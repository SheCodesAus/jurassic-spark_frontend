
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import Callback from "./pages/Callback";
import './Master.css';


import SpotifyLoginButton from './components/SpotifyLoginButton';
import PlaylistCreator from './components/PlaylistCreator';


function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/playlists" element={<CreatePlaylistPage />} />

        {/* ✅ New routes for Spotify testing */}
        <Route
          path="/spotify"
          element={
            <div style={{ padding: '2rem' }}>
              <h1>Spotify Integration</h1>
              <SpotifyLoginButton />
              <PlaylistCreator />
            </div>
          }
        />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Router>
  );
}

export default App;
