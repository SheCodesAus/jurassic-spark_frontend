import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import './Master.css';

function App() {
  return (
    <Router>
      <NavBar />
      <HomePage />
    </Router>
  );
}

export default App;