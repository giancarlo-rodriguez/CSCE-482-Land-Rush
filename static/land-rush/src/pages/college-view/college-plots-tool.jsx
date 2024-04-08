import React, {useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Map API
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import SimplePolygonMap from './SimplePolygonMap';

function PlotSelect({ plotID }) {

  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/show/coordinates', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {

        setCoordinates(response.data);
        console.log('Coordinates:', response.data);
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
    }
  }, [plotID]);

  const renderMap = (status) => {
    if (status === Status.LOADING) return <h3>{status} ..</h3>;
    if (status === Status.FAILURE) return <h3>{status} ...</h3>;
    return (
      <SimplePolygonMap coordinates={coordinates} />
    );
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
        coordinates={coordinates}
        />
      </Wrapper>
    </div>
  );
  }

function Tool({ plotID }) {
  return (
    <div className="popup-content">
      <h1>Plot Selection Tool</h1>
      <div className="box">
        <PlotSelect plotID={plotID} />
      </div>
    </div>
  );
}

export default Tool;