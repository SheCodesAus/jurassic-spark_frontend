import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

import Logo from '../assets/VibeLab_mobile.png';
import NoteIcon from '../assets/Note.png';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <li><Link to="/playlists">Create a Playlist</Link></li>
        <li><Link to="/spotify">Playlist with Spotify</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup">Sign Up</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;