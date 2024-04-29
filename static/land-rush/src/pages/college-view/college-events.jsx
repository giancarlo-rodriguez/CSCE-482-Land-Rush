import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import EventDetailsPopup from './college-events-popup';
import './style.css';

const CollegeEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = () => {
      const token = Cookies.get('token');
      if (token) {
        axios.get('http://127.0.0.1:8000/show/event', {
          headers: {
            Authorization: `Token ${token}`
          }
        })
        .then(response => {
          console.log('Events:', response.data);
          setEvents(response.data);
        })
        .catch(error => {
          console.error('Error fetching events:', error);
        });
      }
    };

    fetchEvents();

    // const interval = setInterval(fetchEvents, 100000000000000000000);

    // return () => clearInterval(interval);
  }, []);

  const handleEventClick = (eventID) => {
    setSelectedEvent(eventID);
    const selectedEventData = events.find(event => event.id === eventID);
    console.log('Selected Event Info:', selectedEventData);
  };
  
  const handleCreateNewEvent = () => {
    if (selectedEvent === null) {
      setSelectedEvent(0);
    }
    else {
      setSelectedEvent(null)
      setSelectedEvent(0);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="college-events-container">
      <div className="college-events-sidebar">
        <div
            className={`event-bar-create-new ${selectedEvent === 0 ? 'clicked' : ''}`}
            onClick={handleCreateNewEvent}
          >
          <span className="event-bar-name">Create New Event</span>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="event-search-bar"
        />
        <div className="event-list">
          {filteredEvents.map((event) => (
            <div
              key={event.id} 
              className={`event-bar ${selectedEvent === event.id ? 'clicked' : ''}`} 
              onClick={() => handleEventClick(event.id)}
            >
              <span className="event-bar-name">{event.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="college-events-details">
        {selectedEvent !== null && (
          <EventDetailsPopup eventID={selectedEvent} eventData={filteredEvents.find(event => event.id === selectedEvent)} />
        )}
        {selectedEvent === null && (
          <div className="placeholder">Select or create an event</div>
        )}
      </div>
    </div>
  );
};

export default CollegeEvents;
