import React, { useState } from 'react';
import '../org-view/style.css';
import image1 from "../org-view/image.png";

/* Style 1 */
const OrgEvents = () => {

  const [events, setEvents] = useState([
    {
      id: 1,
      name: "Event 1",
      thumbnail: image1,
      imageUrl: "https://imgs.search.brave.com/5KP1g4TaDjdb0wASmntfMGKX-ZxIeU08zfj_hkYxfn0/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/NzI1OTAyODUwMzAt/MGFlNmE0NzE1Njcx/P3E9ODAmdz0xMDAw/JmF1dG89Zm9ybWF0/JmZpdD1jcm9wJml4/bGliPXJiLTQuMC4z/Jml4aWQ9TTN3eE1q/QTNmREI4TUh4elpX/RnlZMmg4TVRCOGZH/TjFkR1VsTWpCallY/UjhaVzU4TUh4OE1I/eDhmREE9.jpeg"
    },
    {
      id: 2,
      name: "Event 2",
      thumbnail: image1,
      imageUrl: "https://imgs.search.brave.com/eNk_PmcqeDF-kF7TA47SoKV-jOZCYBI9ytISmhr8TlI/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9jbG9zZS11cC1j/YXQtbG9va2luZy11/cF8xMDQ4OTQ0LTIy/NzYxODEuanBnP3Np/emU9NjI2JmV4dD1q/cGc"
    },
    {
      id: 3,
      name: "Event 3",
      thumbnail: image1,
      imageUrl: "https://imgs.search.brave.com/V0f3NaWI0Y9yM80Xs8LU6aUuPrcc7hUefUabri9zBQ8/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNS8w/My8yNy8xMy8xNi9t/YWluZS1jb29uLTY5/NDczMF82NDAuanBn"
    },
    {
      id: 4,
      name: "Event 4",
      thumbnail: image1,
      imageUrl: "https://imgs.search.brave.com/pDyqTZP3nyICYpYNux5jPQ0FpiLxxKBYd81thAAumLo/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNjE0/NjA2NjY0L3Bob3Rv/L3BvcnRyYWl0LW9m/LWEtZnJpZ2h0ZW5l/ZC1jYXQtY2xvc2V1/cC1icmVlZC1zY290/dGlzaC1mb2xkLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1G/SXdvWTB1OEFpNGNO/Z2t2RXB2elVYMDBB/bTJkakdJRldoM2tN/SmVJNFlvPQ"
    },
    {
      id: 5,
      name: "Event 5",
      thumbnail: image1,
      imageUrl: "https://imgs.search.brave.com/j8vkizer6cnEASg3XQpIu4vMEVdqgvS5iCPWUNIvEAQ/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE2/MDgwMzIzNjQ4OTUt/MGRhNjdhZjM2Y2Qy/P3E9ODAmdz0xMDAw/JmF1dG89Zm9ybWF0/JmZpdD1jcm9wJml4/bGliPXJiLTQuMC4z/Jml4aWQ9TTN3eE1q/QTNmREI4TUh4bGVI/QnNiM0psTFdabFpX/UjhNVEY4Zkh4bGJu/d3dmSHg4Zkh3PQ.jpeg"
    }
  ]);

  const handleViewClick = (imageUrl) => {
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const windowWidth = 800;
    const windowHeight = 600;
    const left = (screenWidth - windowWidth) / 2;
    const top = (screenHeight - windowHeight) / 2;
    const windowOptions = `width=${windowWidth},height=${windowHeight},top=${top},left=${left}`;

    window.open(imageUrl, '_blank', windowOptions);
  };

  return (
    <div className="org-events-list">
      {events.map((event) => (
        <div key={event.id} className="event-bar">
          <img src={event.thumbnail} alt="Event Thumbnail" className="event-bar-thumbnail" />
          <div className="event-bar-details">
            <span className="event-bar-name">{event.name}</span>
            <button className="view-button" onClick={() => handleViewClick(event.imageUrl)}>View</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrgEvents;
