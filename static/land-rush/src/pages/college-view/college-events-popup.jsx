import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

const EventDetailsPopup = ({ eventID, plots, eventData }) => {
  const isNewEvent = eventID === 0;
  const [eventName, setEventName] = useState('');
  const [plotID, setPlotID] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (eventData) {
      setEventName(eventData.name);
      setPlotID(eventData.plot_id);
      setTimestamp(eventData.timestamp);
    }
  }, [eventData]);

  const handleSubmit = async () => {
    const token = Cookies.get('token');
    if (token) {
      const requestData = {
        event_name: eventName,
        plot_id: plotID,
        timestamp: timestamp
      };
  
      try {
        if (isNewEvent) {
          await axios.post('http://127.0.0.1:8000/create/event', {
            event_name: eventName,
            plot_id: plotID,
            timestamp: timestamp
          }, {
            headers: {
              Authorization: `Token ${token}`
            }
          });
          console.log('Event created successfully');
        } else {
          requestData.event_id = eventID;
          await axios.put(`http://127.0.0.1:8000/create/event`, {
            event_id: eventID,
            event_name: eventName,
            event_plot_id: plotID,
            event_date_string: timestamp
          }, {
            headers: {
              Authorization: `Token ${token}`
            }
          });
          console.log('Event updated successfully');
        }
      } catch (error) {
        console.error('Error:', isNewEvent ? 'creating event' : 'updating event', error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const token = Cookies.get('token');
      if (token) {
        try {
          await axios.delete(`http://127.0.0.1:8000/delete/event/`, {
            headers: {
              Authorization: `Token ${token}`
            }
          });
          console.log('Event deleted successfully');
        } catch (error) {
          console.error('Error deleting event:', error);
        }
      }
    }
  };

  return (
    <div className="event-details-popup">
      <h1>{isNewEvent ? 'Create New Event' : 'Edit Event'}</h1>
      <div>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Event Name"
        />
        <select value={plotID} onChange={(e) => setPlotID(e.target.value)}>
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
        <button onClick={handleSubmit}>{isNewEvent ? 'Create' : 'Save'}</button>
        {!isNewEvent && (
          <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPopup;
