import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import './style.css';

// Define fetchEvents function
const fetchEvents = async (orgId, setEvents) => {
  try {
    const token = Cookies.get('token');
    const response = await axios.get('http://127.0.0.1:8000/show/event', {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    // Assuming the API response contains an array of events
    const updatedEvents = response.data.map(event => {
      const isRegistered = event.registered_orgs.some(org => org.id === orgId);
      return { ...event, isRegistered }; // Add isRegistered property to event object
    });

    console.log(updatedEvents); // Check if isRegistered property is added
    setEvents(updatedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const orgIdFromUrl = parseInt(pathParts[pathParts.length - 2], 10);
    setOrgId(orgIdFromUrl);
  }, []);

  useEffect(() => {
    if (orgId !== null) {
      fetchEvents(orgId, setEvents);
    }
  }, [orgId]);

  const handleRegisterEvent = async (eventId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/org/register', {
        event_id: eventId,
        org_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      console.log('Registered for event');
      // Refetch events after registration
      fetchEvents(orgId, setEvents);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/org/unregister', {
        event_id: eventId,
        org_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      console.log('Unregistered from event');
      // Refetch events after unregistration
      fetchEvents(orgId, setEvents);
    } catch (error) {
      console.error('Error unregistering from event:', error);
    }
  };

  // const handleEventClick = (eventId) => {
  //   const screenWidth = window.screen.availWidth;
  //   const screenHeight = window.screen.availHeight;
  //   const windowWidth = 800;
  //   const windowHeight = 600;
  //   const left = (screenWidth - windowWidth) / 2;
  //   const top = (screenHeight - windowHeight) / 2;
  //   const windowOptions = `width=${windowWidth},height=${windowHeight},top=${top},left=${left}`;

  //   fetch('http://127.0.0.1:8000/get-filled-plot', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Token ${Cookies.get('token')}`
  //     },
  //     body: JSON.stringify({ event_id: eventId }),
  //   })
  //   .then(response => response.blob())
  //   .then(blob => {
  //     const url = URL.createObjectURL(blob);
  //     window.open(url, '_blank', windowOptions);
  //   })
  //   .catch(error => console.error('Error:', error));
  // };

  // Remaining code...

  const renderTimer = (timestamp, event) => {
    const eventDate = new Date(timestamp);
    eventDate.setHours(eventDate.getHours() + 5);
    const registrationCloseDate = new Date(eventDate.getTime() - (2 * 24 * 60 * 60 * 1000)); // Subtract 2 days in milliseconds
    const currentDate = new Date();
    const differenceInMs = registrationCloseDate.getTime() - currentDate.getTime();
    const daysDiff = Math.floor(differenceInMs / (1000 * 3600 * 24));

    const handleRegisterClick = () => {
      handleRegisterEvent(event.id);
    };

    const handleUnregisterClick = () => {
      handleUnregisterEvent(event.id);
    };
    
    if (daysDiff >= 0) {
      const eventDateString = registrationCloseDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      return (
        <>
          <span className="timer">Registration closes at: {eventDateString}</span>
          {event.isRegistered ? (
            <button className="events-button" onClick={handleUnregisterClick}>Unregister</button>
          ) : (
            <button className="events-button" onClick={handleRegisterClick}>Register</button>
          )}
        </>
      );
    } else {
      if (event.isRegistered) {
        return <span className="registration-message">Registered for the event</span>;
      } else {
        return <span className="registration-message">Registration has closed</span>;
      }
    }
  };

  return (
    <div className="org-events-list">
      {events.map((event) => (
        <div key={event.id} className="event-bar">
          <div className="event-bar-details">
            <span className="event-bar-name">{event.name}</span>
            {renderTimer(event.timestamp, event)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrgEvents;
