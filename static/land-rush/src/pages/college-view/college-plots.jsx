import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Tool from './college-plots-tool';
import './style.css';

// Temp Images
import image1 from './images/image1.png';
import image2 from './images/image2.png';
import image3 from './images/image3.png';
import image4 from './images/image4.png';

// Temp Plots
import plot1 from './plots/plot1.txt';
import plot2 from './plots/plot2.txt';
import plot3 from './plots/plot3.txt';
import plot4 from './plots/plot4.txt';

const CollegePlots = () => {

const [plots, setPlots] = useState([
  {
    id: 1,
    name: "Plot 1",
    thumbnail: image1,
    imageUrl: "https://imgs.search.brave.com/5KP1g4TaDjdb0wASmntfMGKX-ZxIeU08zfj_hkYxfn0/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NzI1OTAyODUwMzAt/MGFlNmE0NzE1Njcx/P3E9ODAmdz0xMDAw/JmF1dG89Zm9ybWF0/JmZpdD1jcm9wJml4/bGliPXJiLTQuMC4z/Jml4aWQ9TTN3eE1q/QTNmREI4TUh4elpX/RnlZMmg4TVRCOGZH/TjFkR1VsTWpCallY/UjhaVzU4TUh4OE1I/eDhmREE9.jpeg",
    coordinatesFile: plot1
  },
  {
    id: 2,
    name: "Plot 2",
    thumbnail: image2,
    imageUrl: "https://imgs.search.brave.com/eNk_PmcqeDF-kF7TA47SoKV-jOZCYBI9ytISmhr8TlI/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9jbG9zZS11cC1j/YXQtbG9va2luZy11/cF8xMDQ4OTQ0LTIy/NzYxODEuanBnP3Np/emU9NjI2JmV4dD1q/cGc",
    coordinatesFile: plot2
  },
  {
    id: 3,
    name: "Plot 3",
    thumbnail: image3,
    imageUrl: "https://imgs.search.brave.com/V0f3NaWI0Y9yM80Xs8LU6aUuPrcc7hUefUabri9zBQ8/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNS8w/My8yNy8xMy8xNi9t/YWluZS1jb29uLTY5/NDczMF82NDAuanBn",
    coordinatesFile: plot3
  },
  {
    id: 4,
    name: "Plot 4",
    thumbnail: image4,
    imageUrl: "https://imgs.search.brave.com/pDyqTZP3nyICYpYNux5jPQ0FpiLxxKBYd81thAAumLo/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNjE0/NjA2NjY0L3Bob3Rv/L3BvcnRyYWl0LW9m/LWEtZnJpZ2h0ZW5l/ZC1jYXQtY2xvc2V1/cC1icmVlZC1zY290/dGlzaC1mb2xkLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1G/SXdvWTB1OEFpNGNO/Z2t2RXB2elVYMDBB/bTJkakdJRldoM2tN/SmVJNFlvPQ",
    coordinatesFile: plot4
  },
]);

const handleViewClick = (coordinatesFile) => {
  const windowFeatures = 'width=800,height=800,menubar=no,location=no,resizable=no,scrollbars=no,status=no';

  const popup = window.open('', '_blank', windowFeatures);
  popup.document.write('<html><head><title>Plot Selection Tool</title><style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; } .popup-content { background-color: #f0f0f0; padding: 20px; border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); } .box { width: 100%; max-width: 600px; height: 600px; overflow: hidden; }</style></head><body><div id="root"></div></body></html>');

  const collegePlotToolElement = React.createElement(Tool, { coordinatesFile });
  ReactDOM.render(collegePlotToolElement, popup.document.getElementById('root'));
};

return (
  <div className="college-plots-grid">
    <div className="grid-container">
      {plots.map((plot) => (
        <div key={plot.id} className="plot-block" onClick={() => handleViewClick(plot.coordinatesFile)}>
          <img src={plot.thumbnail} alt="Plot Thumbnail" className="plot-block-thumbnail" />
          <span className="plot-block-name">{plot.name}</span>
        </div>
      ))}
    </div>
  </div>
);
};

export default CollegePlots;