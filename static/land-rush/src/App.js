import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Routelist from './Routelist';
import pic from './logo.png';

function App() {
  return (
    <Router>
      <div className="content-container">
        <div className="header">
          <h1>Land Rush</h1>
          <img src={pic} alt="Logo" />
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
