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
    <div className="college-plots-container">
      <div className="college-plots-sidebar">
        <div
            className={`plot-bar-create-new ${selectedEvent === 0 ? 'clicked' : ''}`}
            onClick={handleCreateNewEvent}
          >
          <span className="plot-bar-name">Create New Event</span>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="plot-search-bar"
        />
        <div className="plot-list">
          {filteredEvents.map((event) => (
            <div
              key={event.id} 
              className={`plot-bar ${selectedEvent === event.id ? 'clicked' : ''}`} 
              onClick={() => handleEventClick(event.id)}
            >
              <span className="plot-bar-name">{event.name}</span>
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
