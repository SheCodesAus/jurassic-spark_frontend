import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

import Logo from '../assets/VibeLab_mobile.png';
import NoteIcon from '../assets/Note.png';
import useAuth from '../hooks/useAuth';
import UserIcon from '../assets/listening.png';

const NavBar = () => {

  const { auth, setAuth } = useAuth();
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    // clear tokens from local storage
    window.localStorage.removeItem("access_token");
    window.localStorage.removeItem("jwt_token");
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
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src={Logo} alt="VibeLab Logo" className="logo-img" />
          <span className="navbar-title">VibeLab</span>
        </Link>
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
        <li><Link to="/spotify">Create a playlist </Link></li>
        

      {auth.access_token && auth.refresh_token ? (
        <li className="navbar-user-menu">
          <button
            className="user-icon-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-label="Open user menu"
          >
            <img src={UserIcon} alt="User" className="user-icon-img" />
            <span className="user-name">{auth.username || "Account"}</span>
          </button>
          {userMenuOpen && (
            <ul className="user-dropdown">
              <li>
                <Link to="/my-playlists" onClick={() => setUserMenuOpen(false)}>
                  My Playlists
                </Link>
              </li>
              <li>
                <Link to="/user" onClick={() => setUserMenuOpen(false)}>
                My Account
                </Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          )}
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