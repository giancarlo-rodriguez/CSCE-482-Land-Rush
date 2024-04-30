import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';

const EventDetailsPopup = ({ eventID, eventData }) => {
  const isNewEvent = eventID === 0;
  const [eventName, setEventName] = useState('');
  const [plotID, setPlotID] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [plots, setPlots] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false); // New state for loading indicator
  const [plotImageUrl, setPlotImageUrl] = useState('');
  const [showPlotImage, setShowPlotImage] = useState(false);


  useEffect(() => {
    if (eventData && !isNewEvent) {
      setEventName(eventData.name);
      setPlotID(eventData.plot_id);
      setTimestamp(eventData.timestamp);
    }
  }, [eventData, isNewEvent]);

  useEffect(() => {
    setShowPlotImage(false);
  }, [eventID, eventData]);

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
          handleFeedback("Event Deleted Successfully");
          window.location.reload();
        } catch (error) {
          console.error('Error deleting event:', error);
        }
      }
    }
  };
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
          handleFeedback("Event Created Successfully");

        } else {
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
          handleFeedback("Event Updated Successfully");
          window.location.reload();
        }
      } catch (error) {
        console.error('Error:', isNewEvent ? 'creating event' : 'updating event', error);
      }
    }
  };
  const fillPlot = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        setLoading(true);
        await axios.post(`http://127.0.0.1:8000/fill-plot`, {
          event_id: eventID 
        }, {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        setLoading(false);
        console.log('Plot filled successfully');
        handleFeedback("Plot filled successfully");
        window.location.reload();
      } catch (error) {
        setLoading(false);
        console.error('Error filling plot:', error);
        handleFeedback("Plot not filled.");
      }
    }
  };

  const handleFeedback = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const handleEventClick = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.post('http://127.0.0.1:8000/get-filled-plot', {
        event_id: eventID
      }, {
        headers: {
          Authorization: `Token ${token}`
        },
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      setPlotImageUrl(imageUrl);
      setShowPlotImage(true);
    } catch (error) {
      console.error('Error fetching plot image:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return `${hours}:${minutes}${ampm} ${month}/${day}/${date.getFullYear()}`;
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
            <p><strong>Timestamp:</strong> {formatTimestamp(timestamp)}</p>
            <button onClick={fillPlot} style={{ color: 'green' }}>
              {loading ? "Filling..." : "Fill Plot"}
            </button>
            <button onClick={handleEventClick}>View Plot</button>
            <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
          </>
        )}
        {showPlotImage && eventID > 0 && (
        <div className="plot-image-container">
          <img src={plotImageUrl} alt="Filled Plot" />
        </div>
      )}
      </div>
    </div>
  );
};

export default EventDetailsPopup;
