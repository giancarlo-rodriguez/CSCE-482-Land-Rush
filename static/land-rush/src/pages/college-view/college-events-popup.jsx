import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

const EventDetailsPopup = ({ eventID, eventData }) => {
  const isNewEvent = eventID === 0;
  const [eventName, setEventName] = useState('');
  const [plotID, setPlotID] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [plots, setPlots] = useState([]);


  useEffect(() => {
    if (eventData && !isNewEvent) {
      setEventName(eventData.name);
      setPlotID(eventData.plot_id);
      setTimestamp(eventData.timestamp);
    }
  }, [eventData, isNewEvent]);

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
    // Axios interceptor for logging responses
    const responseLogger = axios.interceptors.response.use(
      (response) => {
        console.log('Response:', response);
        return response;
      },
      (error) => {
        console.error('Error response:', error);
        throw error;
      }
    );

    return () => {
      // Remove the interceptor when component unmounts
      axios.interceptors.response.eject(responseLogger);
    };
  }, []);

  const handleSubmit = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        if (isNewEvent) {
          await axios.post('http://127.0.0.1:8000/create/event', {
            event_name: eventName,
            plot_id: plotID,
            event_date: timestamp
          }, {
            headers: {
              Authorization: `Token ${token}`
            }
          });
          console.log('Event created successfully');
<<<<<<< Updated upstream
=======
        } else {
          requestData.event_id = eventID;
          await axios.put(`http://127.0.0.1:8000/create/event`, {
            event_name: eventName,
            plot_id: plotID,
            event_date: timestamp
          }, {
            headers: {
              Authorization: `Token ${token}`
            }
          });
          console.log(eventID);
          console.log(eventName);
          console.log(plotID);
          console.log(timestamp);
          console.log('Event updated successfully');
>>>>>>> Stashed changes
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
          await axios.delete(`http://127.0.0.1:8000/delete/event`, {
            headers: {
              Authorization: `Token ${token}`
            },
            params: { event_id: eventID }
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
      <h1>{isNewEvent ? 'Create New Event' : 'Event Details'}</h1>
      <div>
        {isNewEvent && (
          <>
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
            <button onClick={handleSubmit}>Create</button>
          </>
        )}
        {!isNewEvent && (
          <>
            <p><strong>Event Name:</strong> {eventName}</p>
            <p><strong>Plot:</strong> {plots.find(plot => plot.id === plotID)?.name}</p>
            <p><strong>Timestamp:</strong> {timestamp}</p>
            <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPopup;
