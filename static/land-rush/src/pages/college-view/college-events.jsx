import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import EventDetailsPopup from './college-events-popup';
import './style.css';

const CollegeEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // This state manages the selected event
  const [plots, setPlots] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch plots when component mounts
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
    // Fetch events when component mounts
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
  }, []);

  // Function to handle event click
  const handleEventClick = (eventID) => {
    setSelectedEvent(eventID);
    const selectedEventData = events.find(event => event.id === eventID);
    console.log('Selected Event Info:', selectedEventData);
  };
  
  // Function to handle creating a new event
  const handleCreateNewEvent = () => {
    if (selectedEvent === null) {
      setSelectedEvent(0);
    }
  };

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="college-events-container">
      <div className="college-events-sidebar">
        {/* Create new event bar */}
        <div
            className={`event-bar-create-new ${selectedEvent === 0 ? 'clicked' : ''}`}
            onClick={handleCreateNewEvent}
          >
          <span className="event-bar-name">Create New Event</span>
        </div>
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="event-search-bar"
        />
        {/* Event list */}
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
      {/* Render EventDetailsPopup based on selectedEvent state */}
      <div className="college-events-details">
        {selectedEvent !== null && ( // Render EventDetailsPopup only if selectedEvent is not null
          <EventDetailsPopup eventID={selectedEvent} plots={plots} eventData={filteredEvents.find(event => event.id === selectedEvent)} />
        )}
        {selectedEvent === null && (
          <div className="placeholder">Select or create an event</div>
        )}
      </div>
    </div>
  );
};

export default CollegeEvents;
