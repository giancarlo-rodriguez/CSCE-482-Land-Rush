import React, { useState, useEffect } from 'react';
import './style.css';
import axios from 'axios';
import Cookies from 'js-cookie';

/* Style 1 */
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

  

  const handleViewClick = () => {
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
      console.log(response.data); // Log success message or handle response
      setShowCreateForm(false); // Close the create form after successful submission
      setEventName(''); // Clear the event name field
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateEvent}>Create New Event</button>
      <div className="college-events-list">
        {events.map((event) => (
          <div key={event.id} className="event-bar">
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

export default CollegeEvents;