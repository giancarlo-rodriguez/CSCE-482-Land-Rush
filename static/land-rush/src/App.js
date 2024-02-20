import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';

import AdminLanding from './pages/admin-view/admin-landing';
import CollegeLanding from './pages/college-view/college-landing';
import HomeLanding from './pages/home-view/home-landing';
import OrgLanding from './pages/org-view/org-landing';
import StudentLanding from './pages/student-view/student-landing';

/*  navbar contents to be replaced
      Home Navbar: Home About_Us Register Sign_In
      College/University Navbar: Land_Plots Events Active_Organizations College_Information Messages Signout
      OrganizationNavbar: Event_Schedule Organization_Members Organization_Information Messages Return_to_Student_View
      Student Navbar: Event_Schedule My_Organizations Student_Information Signout
      
      Admin should be a separate page that is inaccessible without knowing the
      link to the login page. No point handing it to users
      Admin Navbar: Active_Colleges Messages Signout
*/

function NavBar() {
  const location = useLocation();

  // Define navigation links based on the current route
  let navLinks;
  if (location.pathname.startsWith('/home') || location.pathname === '/' ) {
    navLinks = (
      <>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/home/aboutus">About Us</Link></li>
        <li><Link to="/home/register">Register</Link></li>
        <li><Link to="/home/signin">Sign In</Link></li>
      </>
    );
  } else if (location.pathname.startsWith('/college')) {
    navLinks = (
      <>
        <li><Link to="/college">College</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Add more */}
      </>
    );
  } else if (location.pathname.startsWith('/org')) {
    navLinks = (
      <>
        <li><Link to="/org">Organization</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Add more */}
      </>
    );
  } else if (location.pathname.startsWith('/student')) {
    navLinks = (
      <>
        <li><Link to="/student">Student</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Add more */}
      </>
    );
  }
  else if (location.pathname.startsWith('/admin')) {
    navLinks = (
      <>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Add more */}
      </>
    );
  }
  

  return (
    <nav className="navbar">
      <ul>
        {navLinks}
      </ul>
    </nav>
  );
}

function AdminBar() {
  const location = useLocation();

  // Define navigation links based on the current route
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
  

  return (
    <nav className="navbar">
      <ul>
        {navLinks}
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <NavBar />

    
        <Routes>
          <Route path="/" element={<HomeLanding />} />
          <Route path="/home" element={<HomeLanding />} />
          <Route path="/college" element={<CollegeLanding />} />
          <Route path="/org" element={<OrgLanding />} />
          <Route path="/student" element={<StudentLanding />} />
          <Route path="/admin" element={<AdminLanding />} />
        </Routes>

        <AdminBar />
      </div>
    </Router>
  );
}

export default App;
