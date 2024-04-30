import React from 'react';
import img from '../../content/LandRushPoster.jpg'
import document from '../../content/Land_Rush.pdf'

function HomeAboutus() {
  return (
    <div className="container">
      <div className='instructions-container'>
      <div className='instructions'>
        <h1>OUR MISSION:</h1>
        <h2>“Fair allocation of land with human comfort and accessibility in mind.”</h2>
        <br />
        <h1>WHY?</h1>
        <h2>The current system for student organizations and their members to take part in the tailgating process on-campus is outdated, inefficient, and inaccessible by many.</h2>
        <br />
        <h1>OUR SOLUTION</h1>
        <h2>Land Rush seeks to streamline the process of creating and rushing events through a more fair and organized process which grants equal opportunity to all who participate.</h2>
      </div>
    </div>
      <div style={{ textAlign: 'center' }}>
        <pre style={{ fontSize: '300%', maxWidth: '100%', overflow: 'hidden', textDecoration: 'underline', fontWeight: 'bold' }}>
          Land Rush Overview and Documentation
        </pre>
      </div>
      <div style={{ textAlign: 'center' }}>
        <embed src={document} type="application/pdf" width="100%" height="1120px" />
      </div>
    </div>
  );
}

export default HomeAboutus;
