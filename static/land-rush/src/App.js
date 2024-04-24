import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Adminbar from './Adminbar';
import Routelist from './Routelist'


function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        
        <Routelist />
        <Adminbar />
        {/*<AdminBar />*/}
      </div>
    </Router>
  );
}

export default App;
