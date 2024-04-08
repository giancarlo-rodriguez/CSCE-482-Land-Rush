import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './style.css';

const EventDetailsPopup = ({ event, onSubmit }) => {
  const [eventName, setEventName] = useState(event ? event.name : '');
  const [plotId, setPlotId] = useState(event ? event.plot.id : '');
  const [timestamp, setTimestamp] = useState(event ? event.timestamp : '');


  const handleSubmit = () => {
    onSubmit({ event_name: eventName, plot_id: plotId, timestamp: timestamp });
  };

  return (
    <div className="popup-content">
      <h1>Event Details</h1>
      <div>
        <h2>{event ? event.name : 'New Event'}</h2>
        <p>Plot: {event ? event.plot : ''}</p>
        <p>Start Time: {event ? event.timestamp : ''}</p>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event Name"
        />
        <input
          type="text"
          value={plotId}
          onChange={(e) => setPlotId(e.target.value)}
          placeholder="Plot ID"
        />
        <label htmlFor="timestamp">Timestamp:</label>
        <input
          type="datetime-local"
          id="timestamp"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

const CollegeEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popupWindow, setPopupWindow] = useState(null);

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
    const newPopupWindow = window.open('', '_blank', 'width=600,height=400');
    setPopupWindow(newPopupWindow);
  };

  const handleCreateNewEvent = () => {
    setSelectedEvent(null); // Deselect any previously selected event
    const newPopupWindow = window.open('', '_blank', 'width=600,height=400');
    setPopupWindow(newPopupWindow);
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

  useEffect(() => {
    if (popupWindow) {
      ReactDOM.render(
        <EventDetailsPopup event={selectedEvent} onSubmit={handleFormSubmit} />,
        popupWindow.document.body
      );
    }
  }, [popupWindow, selectedEvent]);

  return (
    <div>
      <div className="college-events-list">
        <div className="event-bar-create-new" onClick={handleCreateNewEvent}>
          <span className="event-bar-create-new-name">Create New Event</span>
        </div>
        {events.map((event) => (
          <div key={event.id} className="event-bar" onClick={() => handleEventClick(event)}>
            <span className="event-bar-name">{event.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollegeEvents;
