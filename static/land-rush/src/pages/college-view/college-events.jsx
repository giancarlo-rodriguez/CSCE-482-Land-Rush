import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './style.css';

const EventDetailsPopup = ({ event, onSubmit, onDelete, plots }) => {
  const [eventName, setEventName] = useState(event ? event.name : '');
  const [plotId, setPlotId] = useState(event ? event.plot.id : '');
  const [timestamp, setTimestamp] = useState(event ? event.timestamp : '');

  const handlePlotChange = (e) => {
    setPlotId(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit({ event_name: eventName, plot_id: plotId, timestamp: timestamp });
  };

  const handleDelete = () => {
    onDelete(event.id);
  };

  return (
    <div className="event-details-popup">
      <h1>Event Details</h1>
      <div>
        <h2>{event ? event.name : 'New Event'}</h2>
        <p>Plot: {event ? event.plot.name : ''}</p> {/* Display plot name */}
        <p>Start Time: {event ? formatTimestamp(event.timestamp) : ''}</p> {/* Format timestamp */}
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event Name"
        />
        <select value={plotId} onChange={handlePlotChange}>
          <option value="">Select a Plot</option>
          {plots.map((plot) => (
            <option key={plot.id} value={plot.id}>
              {plot.name}
            </option>
          ))}
        </select>
        <label htmlFor="timestamp">Timestamp:</label>
        <input
          type="datetime-local"
          id="timestamp"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
        {event && (
          <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
        )}
      </div>
    </div>
  );
};

// Function to format timestamp
const formatTimestamp = (timestamp) => {
  const formattedDate = new Date(timestamp);
  const formattedDateString = formattedDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  return formattedDateString;
};

const CollegeEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [plots, setPlots] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/show/plots', {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {
        setPlots(response.data);
      })
      .catch(error => {
        console.error('Error fetching plots:', error);
      });
    }
  }, []);

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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCreateNewEvent = () => {
    setSelectedEvent(null); // Deselect any previously selected event
  };

  const handleFormSubmit = (formData) => {
    const token = Cookies.get('token');
    if (token) {
      axios.post('http://127.0.0.1:8000/create/event', {
        event_name: formData.event_name,
        plot_id: formData.plot_id
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      .then(response => {
        console.log('Event created successfully:', response.data);
        // Optionally, you can update the events list or perform any other action upon successful creation
      })
      .catch(error => {
        console.error('Error creating event:', error);
      });
    }
  };

  const handleDeleteEvent = (eventId) => {
    const token = Cookies.get('token');
    if (token) {
      axios.delete('http://127.0.0.1:8000/delete/event', {
        headers: {
          Authorization: `Token ${token}`
        },
        data: {
          event_id: eventId
        }
      })
      .then(response => {
        console.log('Event deleted successfully:', response.data);
        // Optionally, you can update the events list or perform any other action upon successful deletion
      })
      .catch(error => {
        console.error('Error deleting event:', error);
      });
    }
  };

  return (
    <div className="college-events-container">
      <div className="college-events-sidebar">
        <div className="event-bar-create-new" onClick={handleCreateNewEvent}>
          <span className="event-bar-create-new-name">Create New Event</span>
        </div>
        {events.map((event) => (
          <div key={event.id} className={`event-bar ${selectedEvent && selectedEvent.id === event.id ? 'selected' : ''}`} onClick={() => handleEventClick(event)}>
            <span className="event-bar-name">{event.name}</span>
            <div className="event-bar-details">
              <span className="event-bar-plot">
                {plots.find(plot => plot.id === event.plot)?.name || 'Unknown Plot'}
              </span>
              <span className="event-bar-timestamp">{formatTimestamp(event.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="college-events-details">
        {selectedEvent && (
          <EventDetailsPopup event={selectedEvent} onSubmit={handleFormSubmit} onDelete={handleDeleteEvent} plots={plots} />
        )}
      </div>
    </div>
  );
};

export default CollegeEvents;
