import React from 'react';

// Map API
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import SimplePolygonMap from './SimplePolygonMap';

function PlotSelect() {
  const renderMap = (status) => {
    if (status === Status.LOADING) return <h3>{status} ..</h3>;
    if (status === Status.FAILURE) return <h3>{status} ...</h3>;
    return null;
  };
  
  //lets load in default coordinates for orgs, and unis and zoom
  const lat = 30.6187;
  const lng = -96.3365;

  return (
    <div className="map-container" style={{ width: '100%', height: '100%' }}>
      <Wrapper apiKey="AIzaSyBwtGSYhRKGyxWWW3HEYzyoRi6T43147-o" render={renderMap}>
        <SimplePolygonMap 
        lat={lat}
        lng={lng}
        />
      </Wrapper>
    </div>
  );
}

function Tool() {
  return (
    <div className="popup-content">
      <h1>Plot Selection Tool</h1>
      <div className="box">
        <PlotSelect />
      </div>
    </div>
  );
}

export default Tool;