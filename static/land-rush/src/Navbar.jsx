import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './App.css';

const getOrganizationIdFromPath = (path) => {
    const parts = path.split('/');
    return parts[2];
};

function Navbar() {
const location = useLocation();

let navLinks;
if (location.pathname.startsWith('/admin')) {
    navLinks = (
    <>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/admin/colleges">Active Colleges</Link></li>
        {/* <li><Link to="/admin/messages">Messages</Link></li> */}
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
        { /* <li><Link to="/college/info">College Information</Link></li>
        <li><Link to="/college/messages">Messages</Link></li> */}
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
        <li><Link to="/home/RegisterUniversity">Register University</Link></li>  
        <li><Link to="/home/signin">Sign In</Link></li>
    </>
    );
} else if (location.pathname.startsWith('/org')) {
    const orgId = getOrganizationIdFromPath(location.pathname);

    navLinks = (
        <>
        <li><Link to={`/org/${orgId}`}>Organization</Link></li>
        <li><Link to={`/org/${orgId}/events`}>Upcoming Events</Link></li>
        <li><Link to={`/org/${orgId}/members`}>Current Members</Link></li>
        { /* <li><Link to={`/org/${orgId}/info`}>Organization Information</Link></li>
        <li><Link to={`/org/${orgId}/messages`}>Messages</Link></li> */ }
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
        { /* <li><Link to="/student/info">Personal Information</Link></li> */ }
        <li><Link to="/home">Signout</Link></li>
        {/* Modify as needed*/}
        </>
    );
}


return (
    <nav className="navbar">
        <ul>{navLinks}</ul>
    </nav>
);}

export default Navbar;