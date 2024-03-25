import React, {useEffect, useState } from 'react';

// Map API
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import SimplePolygonMap from './SimplePolygonMap';

function PlotSelect({ coordinatesFile }) {

const [coordinates, setCoordinates] = useState([]);

const renderMap = (status) => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return (
    <SimplePolygonMap coordinates={coordinates} />
  );
};

useEffect(() => {
  const fetchCoordinates = async () => {
    try {
        const response = await fetch(coordinatesFile);
        const text = await response.text();
        const lines = text.split('\n');
        const coords = lines.map(line => {
            const [lat, lng] = line.split(',').map(parseFloat);
            return { lat, lng };
        });
        console.log("Coordinates:", coords);
        setCoordinates(coords);
    } catch (error) {
        console.error("Error fetching coordinates:", error);
    }
};

  fetchCoordinates();
}, [coordinatesFile]);

//lets load in default coordinates for orgs, and unis and zoom
const lat = 30.6187;
const lng = -96.3365;

return (
  <div className="map-container" style={{ width: '100%', height: '100%' }}>
    <Wrapper apiKey="AIzaSyBwtGSYhRKGyxWWW3HEYzyoRi6T43147-o" render={renderMap}>
      <SimplePolygonMap 
      lat={lat}
      lng={lng}
      coordinates={coordinates}
      />
    </Wrapper>
  </div>
);
}

function Tool({ coordinatesFile }) {
return (
  <div className="popup-content">
    <h1>Plot Selection Tool</h1>
    <div className="box">
      <PlotSelect coordinatesFile={coordinatesFile} />
    </div>
  </div>
);
}

export default Tool;