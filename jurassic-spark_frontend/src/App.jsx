
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CreatePlaylistPage from './pages/CreatePlaylistPage';
import MyPlaylists from './pages/MyPlaylists';
import Callback from "./pages/Callback";
import './Master.css';
import PlayListCreator from './components/PlayListCreator';



function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/playlists" element={<CreatePlaylistPage />} />
        <Route path="/my-playlists" element={<MyPlaylists />} />

        {/* ✅ New routes for Spotify testing */}
        <Route
          path="/spotify"
          element={
            <div className="login-page">
              <div className="login-main">
                <div className="login-container">
                  <PlayListCreator />
                </div>
              </div>
            </div>
          }
        />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Router>
  );
}

export default App;
