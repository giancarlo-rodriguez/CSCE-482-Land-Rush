import React from 'react';
import img from '../../content/LandRushPoster.jpg'
import document from '../../content/Land_Rush.pdf'

function HomeAboutus() {
  return (
    <div className="container">
      <div style={{ textAlign: 'center' }}>
        <pre style={{ fontSize: '300%', textDecoration: 'underline', fontWeight: 'bold' }}>
          Land Rush Overview and Documentation
        </pre>
      </div>
      <div>
        <img src={img} alt="Land Rush Poster" style={{ width: '100%' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <embed src={document} type="application/pdf" width="100%" height="1120px" />
      </div>
    </div>
  );
}

export default HomeAboutus;
