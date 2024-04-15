import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import Cookies from 'js-cookie';
import './style.css';

const token = Cookies.get('token');
const SimplePolygonMap = ({ apiKey, lat, lng, coordinates, plotID }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [completedPlots, setCompletedPlots] = useState([]);
  const [highlightedPlots, setHighlightedPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [currentCoordinatePoints, setCurrentCoordinatePoints] = useState(0);
  const [modifyModeActive, setModifyModeActive] = useState(false);
  const [drawModeActive, setDrawModeActive] = useState(false);
  const [plotName, setPlotName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [fetchedCoordinates, setFetchedCoordinates] = useState([]);

  useEffect(() => {
    const initMap = () => {
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: lat, lng: lng },
        mapTypeId: "terrain",
      });

      setMap(newMap);
      return newMap;
    };

    let mapInstance = null;

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly&solution_channel=GMP_CCS_simplepolygon_v1`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      mapInstance = initMap();
    }

    return () => {
      if (mapInstance && typeof mapInstance.setMap === 'function') {
        mapInstance.setMap(null);
      }
    };
  }, [apiKey, lat, lng]);

  useEffect(() => {
    if (map && fetchedCoordinates.length > 0) {
      const newPolygons = fetchedCoordinates.map(coordSet => {
        const plotCoordinates = [{
          lat: parseFloat(coordSet.latitude),
          lng: parseFloat(coordSet.longitude)
        }];
        const newPolygon = new window.google.maps.Polygon({
          paths: plotCoordinates,
          strokeColor: "#0000FF",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0000FF",
          fillOpacity: 0.35,
          map: map,
        });
        return newPolygon;
      });
  
      setCompletedPlots([...completedPlots, ...newPolygons]);
    }
  }, [map, fetchedCoordinates]);

  useEffect(() => {
    if (fetchedCoordinates.length === 0 && lat && lng) {
      axios.get('http://127.0.0.1:8000/show/coordinates', {
        params: {
          plot_id: plotID
        },
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {
        setFetchedCoordinates(response.data);
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
    }
  }, [fetchedCoordinates, lat, lng, plotID, token]);

  useEffect(() => {
    if (map && coordinates.length > 0) {
      const plotCoordinates = coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));

      const newPolygon = new window.google.maps.Polygon({
        paths: plotCoordinates,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
        fillOpacity: 0.35,
        map: map,
      });

      setCompletedPlots([newPolygon]);
    }
  }, [map, coordinates, lat, lng]);

  useEffect(() => {
    if (map && drawingMode) {
      const clickListener = map.addListener('click', (event) => {
        const path = polygon.getPath();
        path.push(event.latLng);
      });

      const rightClickListener = map.addListener('rightclick', () => {
        const path = polygon.getPath();
        if (path.getLength() > 0) {
          path.pop();
        }
      });

      return () => {
        window.google.maps.event.removeListener(clickListener);
        window.google.maps.event.removeListener(rightClickListener);
      };
    }
  }, [map, polygon, drawingMode]);

  const handleSelectPlot = (plot) => {
    setSelectedPlot(plot);
    handleHighlightPlot(plot);
  };

  useEffect(() => {
    completedPlots.forEach(plot => {
      const clickListener = plot.addListener('click', () => {
        handleSelectPlot(plot);
      });

      return () => {
        window.google.maps.event.removeListener(clickListener);
      };
    });
  }, [completedPlots]);

  useEffect(() => {
    const CoordinatesArray = completedPlots.map(plot => {
      const path = plot.getPath().getArray();
      return path.map(Coord => [Coord.lat(), Coord.lng()]);
    });
    if (completedPlots) {
      localStorage.setItem('completedPlot', JSON.stringify(CoordinatesArray));
    }

  }, [completedPlots]);

  const handleHighlightPlot = (plot) => {
    if (!drawingMode) {
      if (highlightedPlots.includes(plot)) {
        plot.setOptions({ strokeColor: "black", fillColor: "#284d00" });
        setHighlightedPlots(prevPlots => prevPlots.filter(prevPlot => prevPlot !== plot));
      } else {
        plot.setOptions({ strokeColor: "red", fillColor: "red" });
        setHighlightedPlots(prevPlots => [...prevPlots, plot]);
        setSelectedPlot(plot);
      }
    }
  };

  const handleAddPoint = () => {
    if (!drawingMode && !selectedPlot) {
      if (map) {
        const newPolygon = new window.google.maps.Polygon({
          strokeColor: "#0000FF",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0000FF",
          fillOpacity: 0.35,
          editable: true,
          draggable: true,
          map: map,
        });
        setPolygon(newPolygon);
        setDrawingMode(true);
        setCurrentCoordinatePoints(currentCoordinatePoints + 1);
        setModifyModeActive(false);
        setDrawModeActive(true);
      }
    }
  };

  const handleModifyPlot = () => {
    if (selectedPlot) {
      selectedPlot.setEditable(!selectedPlot.getEditable());
      if (!selectedPlot.getEditable()) {
        selectedPlot.setOptions({ strokeColor: "black", fillColor: "#284d00" });
        setSelectedPlot(null);
      } else {
        selectedPlot.setOptions({ strokeColor: "orange", fillColor: "orange", draggable: true });
        setDrawModeActive(false);
      }
    }
  };

  const handleResetPlot = () => {
    setCompletedPlots(prevPlots => prevPlots.filter(plot => !highlightedPlots.includes(plot)));

    highlightedPlots.forEach(plot => {
      plot.setMap(null);
      if (plot === selectedPlot) {
        setSelectedPlot(null);
      }
    });
    setHighlightedPlots([]);
  };

  const handleCompletePlot = async () => {
    if ((drawModeActive || modifyModeActive) && polygon && polygon.getPath().getLength() > 2) {
      polygon.setOptions({ editable: false, draggable: false, strokeColor: "black", fillColor: "#284d00" });
      setDrawingMode(false);
      setCompletedPlots([...completedPlots, polygon]);
      setPolygon(null);
      setCurrentCoordinatePoints(0);
      setDrawModeActive(false);
      setModifyModeActive(false);

      if (plotID === 0) {
        const updatedCompletedPlots = [...completedPlots, polygon];
        setCompletedPlots(updatedCompletedPlots);
  
        const coordinatesToSend = updatedCompletedPlots.map(plot => {
          return plot.getPath().getArray().map(coord => {
            return [coord.lat(), coord.lng()];
          });
        });
  
        try {
          const response = await axios.post('http://127.0.0.1:8000/create/plot', {
            coordinates: coordinatesToSend,
            plot_name: plotName || 'Plot Name'
          }, {
            headers: {
              Authorization: `Token ${token}` 
            }
          });
          handleFeedback('Plot created successfully!');
        } catch (error) {
          handleFeedback('Error creating plot');
          console.error('Error creating plot:', error);
        }
      } else if (plotID > 0) {
        const updatedCompletedPlots = [...completedPlots, polygon];
        setCompletedPlots(updatedCompletedPlots);
  
        const coordinatesToSend = updatedCompletedPlots.map(plot => {
          return plot.getPath().getArray().map(coord => {
            return [coord.lat(), coord.lng()];
          });
        });
        try {
          const response = await axios.put('http://127.0.0.1:8000/create/plot', {
            plot_id: plotID,
            coordinates: coordinatesToSend,
            plot_name: plotName || 'Plot Name'
          }, {
            headers: {
              Authorization: `Token ${token}` 
            }
          });
          handleFeedback('Plot updated successfully!');
        } catch (error) {
          handleFeedback('Error updating plot');
          console.error('Error updating plot:', error);
        }
      } else {
        handleFeedback('Error: plotID');
      }
    }
  };

  const handleFeedback = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };


return (
  <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '80%', width: '100%' }} ref={mapRef}></div>
    <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
      <button onClick={handleAddPoint} disabled={drawModeActive || modifyModeActive}>Add Points</button>
      <button onClick={handleModifyPlot} disabled={!selectedPlot}>Modify Shape</button>
      <button onClick={handleResetPlot} disabled={!highlightedPlots.length}>Reset</button>
    </div>
    <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
      <input type="text" value={plotName} onChange={(e) => setPlotName(e.target.value)} placeholder='Update Name'></input>
    </div>
    <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
      <button onClick={handleCompletePlot} disabled={!drawModeActive && !modifyModeActive}>Update</button>
    </div>
    {showFeedback && <div className="feedback-popup">{feedbackMessage}</div>}
  </div>
);
};

export default SimplePolygonMap;
