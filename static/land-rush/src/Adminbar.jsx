import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './App.css';


function Adminbar() {
    const location = useLocation();
  
    let navLinks;
    navLinks = (
      <>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/college">College</Link></li>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/org">Organization</Link></li>
        <li><Link to="/student">Student</Link></li>
      </>
    );
    
    const getOrganizationIdFromPath = (path) => {
        // Example path: "/org/123/info"
        const parts = path.split('/'); // Split path by '/'
        return parts[2]; // Organization ID is the third part of the path
      };
  
    return (
      <nav className="navbar">
        <ul>
          {navLinks}
        </ul>
      </nav>
    );
  }

  export default Adminbar;