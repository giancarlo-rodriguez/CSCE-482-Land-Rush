import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

// Map API
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import SimplePolygonMap from './SimplePolygonMap';

function PlotSelect({ plotID, plotOGName }) {

  const [coordinates, setCoordinates] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token && plotID !== null && plotID !== 0) {
      axios.get('http://127.0.0.1:8000/show/coordinates', {
        params: {
          plot_id: plotID
        },
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

  return (
    <div className="map-container">
      <Wrapper apiKey="AIzaSyBwtGSYhRKGyxWWW3HEYzyoRi6T43147-o" render={renderMap}>
        <SimplePolygonMap 
        lat={30.6187}
        lng={-96.3365}
        coordinates={coordinates}
        plotID={plotID}
        plotOGName={plotOGName}
        />
      </Wrapper>
    </div>
  );
  }

function Tool({ plotID, plotOGName }) {
  return (
    <div className="popup-content">
      <div className="box">
        <PlotSelect plotID={plotID} plotOGName={plotOGName}/>
      </div>
    </div>
  );
}

export default Tool;