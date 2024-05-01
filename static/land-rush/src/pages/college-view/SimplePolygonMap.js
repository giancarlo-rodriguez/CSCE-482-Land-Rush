import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import './style.css';

const token = Cookies.get('token');
const SimplePolygonMap = ({ apiKey, lat, lng, coordinates, plotID, plotOGName }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentCoordinatePoints, setCurrentCoordinatePoints] = useState(0);
  const [modifyModeActive, setModifyModeActive] = useState(false);
  const [drawModeActive, setDrawModeActive] = useState(false);
  const [plotName, setPlotName] = useState(plotOGName);
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
        const tempCoords = response.data.map(coord => ({
          lat: parseFloat(coord.latitude),
          lng: parseFloat(coord.longitude)
        }));
        console.log(tempCoords)
        setFetchedCoordinates(tempCoords);
        
        if (tempCoords.length > 2 && map) {
          const polygon = new window.google.maps.Polygon({
            paths: tempCoords,
            strokeColor: "black",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "black",
            fillOpacity: 0.35,
            editable: false,
            draggable: false,
            map: map,
          });
          setPolygon(polygon);
  
          const firstCoord = tempCoords[0];
          map.setCenter(new window.google.maps.LatLng(firstCoord.lat, firstCoord.lng));
          setDrawModeActive(false);
        }
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
    }
  }, [fetchedCoordinates, lat, lng, plotID, token, map]);
  
  useEffect(() => {
    if (map && modifyModeActive) {
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
  }, [map, polygon, modifyModeActive]);

  const handleModifyPlot = () => {
    if (!drawingMode) {
      if (map && polygon) {
        polygon.setEditable(true);
        setModifyModeActive(true);
        setDrawModeActive(false);
        polygon.setOptions({
          strokeColor:"#0000FF",
          fillColor: "#0000FF",
          draggable: true,
        })
      } else {
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
          setModifyModeActive(true);
          setDrawModeActive(true);
        }
      }
    } else if (!drawingMode && polygon) {
      if (map) {
        setDrawingMode(false);
        setCurrentCoordinatePoints(currentCoordinatePoints + 1);
        setModifyModeActive(false);
        setDrawModeActive(false);
      }
    }
  };

  const handleCompletePlot = async () => {
    if ((drawModeActive || modifyModeActive) && polygon && polygon.getPath().getLength() > 2) {
      polygon.setOptions({ editable: false, draggable: false, strokeColor: "black", fillColor: "#284d00" });
      setDrawingMode(false);
      setModifyModeActive(false);
      setDrawModeActive(false);
  
      const coordinatesToSend = polygon.getPath().getArray().map(coord => {
        return [coord.lat(), coord.lng()];
      });
  
      try {
        let response;
        if (plotID === 0) {
          response = await axios.post('http://127.0.0.1:8000/create/plot', {
            coordinates: [coordinatesToSend],
            plot_name: plotName || 'Plot Name'
          }, {
            headers: {
              Authorization: `Token ${token}` 
            }
          });
          handleFeedback("Plot Created Successfully");
          console.log("Post Successful");
          window.location.reload();
        } else if (plotID > 0) {
          response = await axios.put('http://127.0.0.1:8000/create/plot', {
            plot_id: plotID,
            coordinates: [coordinatesToSend],
            plot_name: plotName || 'Plot Name'
          }, {
            headers: {
              Authorization: `Token ${token}` 
            }
          });
          handleFeedback("Plot Updated Successfully");
          console.log("Put Successful");
        }
      } catch (error) {
        handleFeedback('Operation Failed');
        console.error('Error updating plot:', error);
      }
    } else {
      handleFeedback('A plot requires at least 3 points.')
    }
  };
  
  const handleDeletePlot = async () => {
    try {
      const response = await axios.delete('http://127.0.0.1:8000/delete/plot', {
        data: { plot_id: plotID },
        headers: {
          Authorization: `Token ${token}`
        }
      });
      handleFeedback("Plot Deleted Successfully");
      setPolygon(null);
      window.location.reload();
    } catch (error) {
      handleFeedback('Error deleting plot: ' + error.response.data.detail);
      console.error('Error deleting plot:', error);
    }
  };
  

  const handleFeedback = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', marginTop: 0 }}>
      <div style={{ height: '200%', width: '100%', flex: 2 }} ref={mapRef}></div>
      <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>Editing Plot: {plotID === 0 ? "New Plot" : plotOGName}</div>
      <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
        {plotID === 0 ? (
          <button onClick={handleModifyPlot} disabled={drawModeActive || modifyModeActive}>Draw Points</button>
        ) : (
          <button onClick={handleModifyPlot} disabled={drawModeActive || modifyModeActive}>Modify Points</button>
        )}
      </div>
      <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
        <input type="text" value={plotName} onChange={(e) => setPlotName(e.target.value)} placeholder='Update Name'></input>
      </div>
      <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
        {plotID === 0 ? (
          <button onClick={handleCompletePlot} disabled={!drawModeActive && !modifyModeActive}>Create Plot</button>
        ) : (
          <button onClick={handleCompletePlot} disabled={!drawModeActive && !modifyModeActive}>Update Plot</button>
        )}
        {plotID !== 0 && <button onClick={handleDeletePlot}>Delete Plot</button>}
      </div>
      {showFeedback && <div className="feedback-popup">{feedbackMessage}</div>}
    </div>
  );
};

export default SimplePolygonMap;