import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import Tool from './college-plots-tool';
import './style.css';

const CollegePlots = () => {
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toolComponents, setToolComponents] = useState({});



  useEffect(() => {
    const fetchPlots = () => {
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
          console.error('Error fetching plots:', error);
        });
      }
    };
    
    fetchPlots();
  }, []);

  const handlePlotClick = (plotID) => {
    setSelectedPlot(plotID);
  };

  const handleCreateNewPlot = () => {
    setSelectedPlot(0);
  };

  const filteredPlots = plots.filter(plot =>
    plot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderToolComponent = (plotID) => {
    if (plotID === 0 || !toolComponents[plotID]) {
      return (
        <Tool key={plotID} plotID={plotID} plotOGName={plotID === 0 ? 'New Plot' : plots.find(plot => plot.id === plotID).name}/>
      );
    } else {
      return toolComponents[plotID];
    }
  };
  
  return (
    <div className="college-plots-container">
      <div className="college-plots-sidebar">
        <div
          className={`plot-bar-create-new ${selectedPlot === 0 ? 'clicked' : ''}`}
          onClick={handleCreateNewPlot}
        >
          <span className="plot-bar-name">Create New Plot</span>
        </div>
        <input
          type="text"
          placeholder="Search plots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="plot-search-bar"
        />
        <div className="plot-list">
          {filteredPlots.map((plot) => (
            <div
              key={plot.id}
              className={`plot-bar ${selectedPlot === plot.id ? 'clicked' : ''}`}
              onClick={() => handlePlotClick(plot.id)}
            >
              <span className="plot-bar-name">{plot.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="college-plots-content">
        {selectedPlot !== null && renderToolComponent(selectedPlot)}
        {selectedPlot === null && (
          <div className="placeholder">Select or create a plot</div>
        )}
      </div>
    </div>
  );
};

export default CollegePlots;
