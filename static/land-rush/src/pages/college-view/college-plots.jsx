import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Tool from './college-plots-tool';
import axios from 'axios';
import Cookies from 'js-cookie';
import './style.css';


const CollegePlots = () => {
  const [plots, setPlots] = useState([]);

  
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/show/plots', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {

        setPlots(response.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
    }
  }, []);

  const handleViewClick = (plotID) => {
    const windowFeatures = 'width=800,height=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no';

    const popup = window.open('', '_blank', windowFeatures);
    popup.document.write('<html><head><title>Plot Selection Tool</title><style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; } .popup-content { background-color: #f0f0f0; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); } .box { width: 100%; max-width: 600px; height: 600px; overflow: hidden; }</style></head><body><div id="root"></div></body></html>');

    const collegePlotToolElement = React.createElement(Tool, { plotID });
    ReactDOM.render(collegePlotToolElement, popup.document.getElementById('root'));
  };

  return (
    <div className="college-plots-grid">
      <div className="grid-container">
      <div key={-1} className="plot-block plot-block-create-new" onClick={() => handleViewClick()}>
        <span className="plot-block-create-new-name">Create New Plot</span>
      </div>
        {plots.map((plot) => (
          <div key={plot.id} className="plot-block" onClick={() => handleViewClick(plot.id)}>
            <span className="plot-block-name">{plot.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollegePlots;