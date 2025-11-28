import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import vibelabLogo from '../assets/VibeLab.png';
import technoIcon from '../assets/Techno.png';
import rockIcon from '../assets/Rock.png';
import rnbIcon from '../assets/R&B.png';
import popIcon from '../assets/Pop.png';
import latinIcon from '../assets/Latin.png';
import countryIcon from '../assets/Country.png';

const genreIcons = [
    { src: technoIcon, alt: 'Techno' },
    { src: rockIcon, alt: 'Rock' },
    { src: rnbIcon, alt: 'R&B' },
    { src: popIcon, alt: 'Pop' },
    { src: latinIcon, alt: 'Latin' },
    { src: countryIcon, alt: 'Country' },
];

const HomePage = () => (
    <div className="home-page">
        <section className="hero">
            <div className="logo-circle">
                {/* Big white circle at the back */}
                <div className="logo-bg"></div>
                <img src={vibelabLogo} alt="VibeLab Logo" className="hero-logo" />
                <div className="genre-icons">
                    {genreIcons.map((icon, i) => (
                        <img
                            key={icon.alt}
                            src={icon.src}
                            alt={icon.alt}
                            className={`genre-icon genre-icon-${i}`}
                        />
                    ))}
                </div>
            </div>
            <div className="hero-actions">
                <Link to="/spotify">
                    <button className="btn btn-primary hero-btn">
                        <span>Create a </span>
                        <span>Playlist</span>
                    </button>
                </Link>
                <Link to="/signup">
                    <button className="btn btn-orange hero-btn">
                        <span>Make an </span>
                        <span>Account</span>
                    </button>
                </Link>
            </div>
        </section>
    </div>
);

export default HomePage;