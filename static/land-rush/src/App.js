import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

import AdminLanding from './pages/admin-view/admin-landing';
import CollegeLanding from './pages/college-view/college-landing';
import HomeLanding from './pages/home-view/home-landing';
import OrgLanding from './pages/org-view/org-landing';
import StudentLanding from './pages/student-view/student-landing';

/*  navbar contents to be replaced with homepage nav
      Home About_Us Register Sign_In
*/

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar">
          <ul>
            <li><Link to="/admin">Admin</Link></li>
            <li><Link to="/college">College/University</Link></li>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/org">Organization</Link></li>
            <li><Link to="/student">Student</Link></li>
          </ul>
        </nav>
    
        <Routes>
          <Route path="/" exact element={<HomeLanding />} />
          <Route path="/admin" element={<AdminLanding />} />
          <Route path="/college" element={<CollegeLanding />} />
          <Route path="/home" element={<HomeLanding />} />
          <Route path="/org" element={<OrgLanding />} />
          <Route path="/student" element={<StudentLanding />} />
        </Routes>
      </div>
    </Router>
  );
}
  
  
export default App;
