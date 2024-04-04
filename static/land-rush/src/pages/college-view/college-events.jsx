import React, { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';
import Cookies from 'js-cookie';

const CollegeEvents = () => {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventName, setEventName] = useState('');
  const [plotId, setPlotId] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/show/event', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {

        setEvents(response.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
    }
  }, []);

  

  const handleViewClick = (event) => {
    const eventDetailsWindow = window.open('', '_blank', 'width=600,height=400');
    eventDetailsWindow.document.write(
      `<div><h2>${event.name}</h2><p>Plot: ${event.timestamp}</p></div>`
    );
  };

  const handleCreateEvent = () => {
    setShowCreateForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/create/event', {
        event_name: eventName,
        plot_id: plotId
      });
      console.log(response.data);
      setShowCreateForm(false);
      setEventName('');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  

  /* Style 1 */
return (
    <div>
      <button onClick={handleCreateEvent}>Create New Event</button>
      <div className="college-events-list">
        {events.map((event) => (
          <div key={event.id} className="event-bar" onClick={() => handleViewClick(event)}>
            <span className="event-bar-name">{event.name}</span>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div className="create-event-form">
          <form onSubmit={handleSubmit}>
            <label>
              Event Name:
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </label>
            <label>
              Plot ID:
              <input
                type="text"
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                required
              />
            </label>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CollegeEvents;




/* Style 2

  return (
    <div className="college-events-grid">
      <div className="grid-container">
        {events.map((event) => (
          <div key={event.id} className="event-block" onClick={() => handleViewClick(event.imageUrl)}>
            <img src={event.thumbnail} alt="Event Thumbnail" className="event-block-thumbnail" />
            <span className="event-block-name">{event.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

*/