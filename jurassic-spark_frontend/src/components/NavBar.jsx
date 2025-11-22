import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

import Logo from '../assets/VibeLab_mobile.png';      // first logo (mobile)
import NoteIcon from '../assets/Note.png';            // hamburger icon

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Mobile Logo */}
      <div className="navbar-logo">
        <img src={Logo} alt="VibeLab Logo" className="logo-img" />
      </div>

      {/* Desktop Title */}
      <div className="navbar-title">
        VibeLab
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
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Sign Up</Link></li>
        <li><Link to="/playlists">Create a Playlist</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;