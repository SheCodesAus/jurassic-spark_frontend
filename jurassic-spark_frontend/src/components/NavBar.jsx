import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

import Logo from '../assets/VibeLab_mobile.png';
import NoteIcon from '../assets/Note.png';
import useAuth from '../hooks/useAuth';

const NavBar = () => {

  const { auth, setAuth } = useAuth();
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    // clear tokens from local storage
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("refresh_token");
    //clear auth context
    setAuth({ access_token: null, refresh_token: null });
    //redirect to home
    navigate('/')
  };

  return (
    <nav className="navbar">
      {/* Logo and Title together */}
      <div className="navbar-brand">
        <Link to="/">
          <img src={Logo} alt="VibeLab Logo" className="logo-img" />
        </Link>
        <span className="navbar-title">VibeLab</span>
      </div>

      {/* Hamburger for mobile */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Open menu"
      >
        <img src={NoteIcon} alt="Menu" className="hamburger-img" />
      </button>

      {/* Nav links */}
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/spotify">Create a playlist </Link></li>
        <li><Link to="/my-playlists">My Playlists</Link></li>

        {auth.access_token && auth.refresh_token ? (
          <li>
            <Link to="/" onClick={handleLogout}>Logout</Link>
          </li>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        )}

      </ul>
    </nav>
  );
};

export default NavBar;