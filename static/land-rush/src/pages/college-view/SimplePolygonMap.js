import React, { useEffect, useRef, useState } from 'react';

 const SimplePolygonMap = ({ apiKey, lat, lng }) => {
   const mapRef = useRef(null);
   const [map, setMap] = useState(null);
   const [polygon, setPolygon] = useState(null);
   const [drawingMode, setDrawingMode] = useState(false);
   const [completedShapes, setCompletedShapes] = useState([]);
   const [highlightedShapes, setHighlightedShapes] = useState([]);
   const [currentCoordDinatePoints, setCurrentCoordDinatePoints] = useState(0)

   useEffect(() => {
    const initMap = () => {
      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: lat, lng: lng },
        mapTypeId: "terrain",
      });
      console.log(localStorage.getItem('completedShape'))
      if (localStorage.getItem('completedShape')) {
        console.log("hey")
        console.log(localStorage.getItem('completedShape'))
        const savedShapes = JSON.parse(localStorage.getItem('completedShape'));
        const newShapes = savedShapes.map(coordinates => {
          const path = coordinates.map(coord => new window.google.maps.LatLng(coord[0], coord[1]));
          return new window.google.maps.Polygon({
            strokeColor: "black",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#284d00",
            fillOpacity: 0.35,
            path: path,
            editable: false,
            draggable: false,
            map: newMap,
          });
        });
        setCompletedShapes(newShapes);
      }
      setMap(newMap);
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&v=weekly&solution_channel=GMP_CCS_simplepolygon_v1`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      initMap();
    }
  }, []);

   
  //adds points to a shape when drawing mode is activated.
  useEffect(() => {
    if (map && drawingMode) {
      const clickListener = map.addListener('click', (event) => {
        const path = polygon.getPath();
        path.push(event.latLng);
      });

      const rightClickListener = map.addListener('rightclick', () => {
        const path = polygon.getPath();
        if (path.getLength() > 0) {
          path.pop(); // Remove the last point from the path
        }
      });

      return () => {
        window.google.maps.event.removeListener(clickListener);
        window.google.maps.event.removeListener(rightClickListener);
      };
    }
  }, [map, polygon, drawingMode]);
 
    //highlights shapes when clicked or unclicked
   useEffect(() => {
     // Add click event listeners to each completed shape
     completedShapes.forEach(shape => {
       const clickListener = shape.addListener('click', () => {
         handleHighlightShape(shape);
       });
       
       return () => {
         window.google.maps.event.removeListener(clickListener);
       };
     });
   }, [completedShapes, highlightedShapes]);
   

   useEffect(() =>
   {
    const coordinatesArray = completedShapes.map(shape => {
     // Extract coordinates from the shape
     const path = shape.getPath().getArray();
     return path.map(coord => [coord.lat(), coord.lng()]);
   });
   if(completedShapes)
   {
    localStorage.setItem('completedShape', JSON.stringify(coordinatesArray));
   }
   
   }, [completedShapes])

   const handleDeleteShape = () => {
     highlightedShapes.forEach(shape => {
       // Remove the highlighted shape from the map
       setCompletedShapes(prevShapes => prevShapes.filter(prevShape => prevShape !== shape));

       shape.setMap(null);
       
       // Remove the highlighted shape from the completedShapes array
     });
     setHighlightedShapes([]);
     // Clear the highlighted shapes array
   };
 
   const handleHighlightShape = (shape) => {
    if (!drawingMode) {
      // Toggle highlighting of shape
      if (highlightedShapes.includes(shape)) {
        // Unhighlight shape
        shape.setOptions({ strokeColor: "black", fillColor: "#284d00" });
        setHighlightedShapes(prevShapes => prevShapes.filter(prevShape => prevShape !== shape));
      } else {
        // Highlight shape
        shape.setOptions({ strokeColor: "red", fillColor: "red" });
        setHighlightedShapes(prevShapes => [...prevShapes, shape]);
      }
    }
  };
   const handleAddPoint = () => {
     if (map && !drawingMode) {
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
       setCurrentCoordDinatePoints(currentCoordDinatePoints + 1);
     }
   };
 
   const handleCompleteShape = () => {
     if (polygon && polygon.getPath().getLength() > 2) {
       polygon.setOptions({ editable: false, draggable: false, strokeColor: "black", fillColor: "#284d00"});
       setDrawingMode(false);
       setCompletedShapes([...completedShapes, polygon]);
       
       setCurrentCoordDinatePoints(0);
     }
     
   };
   
   const handleCoordinates = () => {
     console.log(completedShapes)
     completedShapes.map(s => {
      let vertices = s.getPath()
      for (let i = 0; i < vertices.getLength(); i++) {
        const xy = vertices.getAt(i);
        console.log(" Coordinate " + i +" lat: " + xy.lat() + ", long: " + xy.lng())
      }
     })
     
   }

  
  
   return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div ref={mapRef} style={{ height: '80%', width: '100%' }}></div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleAddPoint} disabled={drawingMode}>Draw Shape</button>
        <button onClick={handleCompleteShape} disabled={!drawingMode && currentCoordDinatePoints > 2}>Complete Shape</button>
        <button onClick={handleDeleteShape} disabled={!highlightedShapes.length}>Delete Shape(s)</button>
        <button onClick={handleCoordinates} >Print Coordinates</button>
      </div>
    </div>
  );
};

export default SimplePolygonMap;
