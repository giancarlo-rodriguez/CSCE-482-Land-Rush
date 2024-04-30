import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Routelist from './Routelist';

function App() {
  return (
    <Router>
      <div className="content-container">
        <div className="header">
          <h1>Land Rush</h1>
          <img src="image.png" alt="Logo" />
        </div>
        <div className="navbar">
          <Navbar />
        </div>
        <div className="main-content">
          <Routelist />
          {/*<AdminBar />*/}
        </div>
      </div>
    </Router>
  );
}

export default App;
