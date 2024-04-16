import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import './App.css';

// admin-view
import AdminLanding from './pages/admin-view/admin-landing';
import AdminColleges from './pages/admin-view/admin-colleges';
import AdminMessages from './pages/admin-view/admin-messages';

// college-view
import CollegeLanding from './pages/college-view/college-landing';
import CollegePlots from './pages/college-view/college-plots';
import CollegeEvents from './pages/college-view/college-events';
import CollegeOrgs from './pages/college-view/college-orgs';
import CollegeInfo from './pages/college-view/college-info';
import CollegeMessages from './pages/college-view/college-messages';

// home-view
import HomeLanding from './pages/home-view/home-landing';
import HomeAboutus from './pages/home-view/home-aboutus';
import HomeRegister from './pages/home-view/home-register';
import HomeSignin from './pages/home-view/home-signin';
import SignUpStudent from './pages/home-view/SignUpStudent'
import SignUpUniversity from './pages/home-view/SignUpUniversity'

// org-view
import OrgLanding from './pages/org-view/org-landing';
import OrgEvents from './pages/org-view/org-events';
import OrgMembers from './pages/org-view/org-members';
import OrgInfo from './pages/org-view/org-info';
import OrgMessages from './pages/org-view/org-messages';

// student-view
import StudentLanding from './pages/student-view/student-landing';
import StudentEvents from './pages/student-view/student-events';
import StudentOrgs from './pages/student-view/student-orgs';
import StudentInfo from './pages/student-view/student-info';

const getOrganizationIdFromPath = (path) => {
  // Example path: "/org/123/info"
  const parts = path.split('/'); // Split path by '/'
  return parts[2]; // Organization ID is the third part of the path
};

function NavBar() {
  const location = useLocation();

  let navLinks;
  if (location.pathname.startsWith('/admin')) {
    navLinks = (
      <>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/admin/colleges">Active Colleges</Link></li>
        <li><Link to="/admin/messages">Messages</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Modify as needed*/}
        </>
    );
  } else if (location.pathname.startsWith('/college')) {
    navLinks = (
      <>
        <li><Link to="/college">College</Link></li>
        <li><Link to="/college/plots">Land Plots</Link></li>
        <li><Link to="/college/events">Events</Link></li>
        <li><Link to="/college/orgs">Organizations</Link></li>
        <li><Link to="/college/info">College Information</Link></li>
        <li><Link to="/college/messages">Messages</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Modify as needed*/}
        </>
    );
  } else if (location.pathname.startsWith('/home') || location.pathname === '/' ) {
    navLinks = (
      <>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/home/aboutus">About Us</Link></li>
        <li><Link to="/home/RegisterStudent">Register Student</Link></li>
        <li><Link to="/home/RegisterUniversity">Register Universtiy</Link></li>  
        <li><Link to="/home/signin">Sign In</Link></li>
      </>
    );
  } else if (location.pathname.startsWith('/org')) {
    // Assuming the organization ID is stored in a variable called 'orgId'
  const orgId = getOrganizationIdFromPath(location.pathname);

  navLinks = (
    <>
      <li><Link to={`/org/${orgId}`}>Organization</Link></li>
      <li><Link to={`/org/${orgId}/events`}>Upcoming Events</Link></li>
      <li><Link to={`/org/${orgId}/members`}>Current Members</Link></li>
      <li><Link to={`/org/${orgId}/info`}>Organization Information</Link></li>
      <li><Link to={`/org/${orgId}/messages`}>Messages</Link></li>
      <li><Link to="/student">Return to Student View</Link></li>
      {/* Modify as needed*/}
    </>
  );
  } else if (location.pathname.startsWith('/student')) {
    navLinks = (
      <>
        <li><Link to="/student">Student</Link></li>
        <li><Link to="/student/events">Upcoming Events</Link></li>
        <li><Link to="/student/orgs">Your Organizations</Link></li>
        <li><Link to="/student/info">Personal Information</Link></li>
        <li><Link to="/home">Signout</Link></li>
        {/* Modify as needed*/}
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

function RouteList() {
  return (
    <Routes>
          {/* Admin */}
          <Route path="/admin" element={<AdminLanding />} />
          <Route path="/admin/colleges" element={<AdminColleges />} />
          <Route path="/admin/messages" element={<AdminMessages />} />

          {/* College */}
          <Route path="/college" element={<CollegeLanding />} />
          <Route path="/college/plots" element={<CollegePlots />} />
          <Route path="/college/events" element={<CollegeEvents />} />
          <Route path="/college/orgs" element={<CollegeOrgs />} />
          <Route path="/college/info" element={<CollegeInfo />} />
          <Route path="/college/messages" element={<CollegeMessages />} />

          {/* Homepage */}
          <Route path="/" element={<HomeLanding />} />
          <Route path="/home" element={<HomeLanding />} />
          <Route path="/home/aboutus" element={<HomeAboutus />} />
          <Route path="/home/RegisterStudent" element={<SignUpStudent />} />
          <Route path="/home/RegisterUniversity" element={<SignUpUniversity />} />
          <Route path="/home/signin" element={<HomeSignin />} />

          {/* Organization */}
          <Route path="/org/:orgId" element={<OrgLanding />} />
          <Route path="/org/:orgId/events" element={<OrgEvents />} />
          <Route path="/org/:orgId/members" element={<OrgMembers />} />
          <Route path="/org/:orgId/info" element={<OrgInfo />} />
          <Route path="/org/:orgId/messages" element={<OrgMessages />} />

          {/* Student */}
          <Route path="/student" element={<StudentLanding />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/orgs" element={<StudentOrgs />} />
          <Route path="/student/info" element={<StudentInfo />} />
          
        </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <NavBar />
        
        <RouteList />

        <AdminBar />
      </div>
    </Router>
  );
}

export default App;
