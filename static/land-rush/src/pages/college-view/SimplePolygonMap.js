import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

const SimplePolygonMap = ({ apiKey, lat, lng, coordinates }) => {
const mapRef = useRef(null);
const [map, setMap] = useState(null);
const [polygon, setPolygon] = useState(null);
const [drawingMode, setDrawingMode] = useState(false);
const [completedShapes, setCompletedShapes] = useState([]);
const [highlightedShapes, setHighlightedShapes] = useState([]);
const [selectedShape, setSelectedShape] = useState(null);
const [currentCoordinatePoints, setCurrentCoordinatePoints] = useState(0);
const [modifyModeActive, setModifyModeActive] = useState(false);
const [drawModeActive, setDrawModeActive] = useState(false);

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

  let mapInstance;

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
    if (mapInstance) {
      mapInstance.setMap(null);
    }
  };
}, [apiKey, lat, lng]);

useEffect(() => {
  console.log("Received coordinates:", coordinates);
  if (map && coordinates.length > 0) {
    const shapeCoordinates = coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));
    console.log("Shape coordinates:", shapeCoordinates);

    const newPolygon = new window.google.maps.Polygon({
      paths: shapeCoordinates,
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map: map,
    });

    setCompletedShapes([newPolygon]);
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

const handleSelectShape = (shape) => {
  setSelectedShape(shape);
  handleHighlightShape(shape);
};

useEffect(() => {
  completedShapes.forEach(shape => {
    const clickListener = shape.addListener('click', () => {
      handleSelectShape(shape);
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  });
}, [completedShapes]);

useEffect(() => {
  const CoordinatesArray = completedShapes.map(shape => {
    const path = shape.getPath().getArray();
    return path.map(Coord => [Coord.lat(), Coord.lng()]);
  });
  if (completedShapes) {
    localStorage.setItem('completedShape', JSON.stringify(CoordinatesArray));
  }

}, [completedShapes]);

const handleHighlightShape = (shape) => {
  if (!drawingMode) {
    if (highlightedShapes.includes(shape)) {
      shape.setOptions({ strokeColor: "black", fillColor: "#284d00" });
      setHighlightedShapes(prevShapes => prevShapes.filter(prevShape => prevShape !== shape));
    } else {
      shape.setOptions({ strokeColor: "red", fillColor: "red" });
      setHighlightedShapes(prevShapes => [...prevShapes, shape]);
      setSelectedShape(shape);
    }
  }
};

const handleAddPoint = () => {
  if (!drawingMode && !selectedShape) {
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

const handleModifyShape = () => {
  if (selectedShape) {
    selectedShape.setEditable(!selectedShape.getEditable());
    if (!selectedShape.getEditable()) {
      selectedShape.setOptions({ strokeColor: "black", fillColor: "#284d00" });
      setSelectedShape(null);
    } else {
      selectedShape.setOptions({ strokeColor: "orange", fillColor: "orange", draggable: true });
      setDrawModeActive(false);
    }
  }
};

const handleDeleteShape = () => {
  setCompletedShapes(prevShapes => prevShapes.filter(shape => !highlightedShapes.includes(shape)));

  highlightedShapes.forEach(shape => {
    shape.setMap(null);
    if (shape === selectedShape) {
      setSelectedShape(null); // Deselect the shape if deleted
    }
  });
  setHighlightedShapes([]);
};

const handleCompleteShape = () => {
  if ((drawModeActive || modifyModeActive) && polygon && polygon.getPath().getLength() > 2) {
    polygon.setOptions({ editable: false, draggable: false, strokeColor: "black", fillColor: "#284d00" });
    setDrawingMode(false);
    setCompletedShapes([...completedShapes, polygon]);
    setPolygon(null);
    setCurrentCoordinatePoints(0);
    setDrawModeActive(false);
    setModifyModeActive(false);
  }
};


const handleCoordinates = () => {
  console.log(completedShapes)
  completedShapes.map(s => {
    let vertices = s.getPath()
    for (let i = 0; i < vertices.getLength(); i++) {
      const xy = vertices.getAt(i);
      console.log(" Coordinate " + i + " lat: " + xy.lat() + ", long: " + xy.lng())
    }
  })

};

const handleCoordinateExport = () => {
  const formattedCoordinates = completedShapes.map(shape => {
    const path = shape.getPath().getArray();
    return path.map(Coord => `${Coord.lat()}, ${Coord.lng()}`).join('\n');
  }).join('\n\n');

  const element = document.createElement('a');
  const file = new Blob([formattedCoordinates], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = 'Coordinates.txt';
  document.body.appendChild(element);
  element.click();
};

const handleSaveImage = () => {
  if (mapRef.current) {
    html2canvas(mapRef.current)
      .then(canvas => {
        const img = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = img;
        link.download = 'map_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error capturing screenshot:', error);
      });
  }
};



return (
  <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div ref={mapRef} style={{ height: '80%', width: '100%' }}></div>
    <div style={{ marginTop: '10px' }}>
      <button onClick={handleAddPoint} disabled={drawModeActive || modifyModeActive}>Draw Shape</button>
      <button onClick={handleModifyShape} disabled={!selectedShape}>Modify Shape</button>
      <button onClick={handleDeleteShape} disabled={!highlightedShapes.length}>Delete Shape</button>
      <button onClick={handleCompleteShape} disabled={!drawModeActive && !modifyModeActive}>Complete Shape</button>
      <button onClick={handleCoordinateExport}>Download Coordinates</button>
      <button onClick={handleSaveImage}>Save Image</button>
    </div>
  </div>
);
};

export default SimplePolygonMap;

