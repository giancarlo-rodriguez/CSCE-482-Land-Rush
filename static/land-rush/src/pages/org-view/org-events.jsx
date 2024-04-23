import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get('http://127.0.0.1:8000/show/event', {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    // Extract orgId from URL
    const pathParts = window.location.pathname.split('/');
    const orgIdFromUrl = parseInt(pathParts[pathParts.length - 2], 10); // Assuming orgId is second-to-last part of the URL
    setOrgId(orgIdFromUrl);

    fetchEvents();
  }, []);

  const handleRegisterEvent = async (eventId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/org/register', {
        event_id: eventId,
        organization_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      console.log('Registered for event');
      // You can perform additional actions here, such as updating state
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const isOrgAlreadyRegistered = (event) => {
    return event.registered_orgs.some(org => org.id === orgId);
  };

  const calculateDaysDifference = (timestamp) => {
    const eventDate = new Date(timestamp);
    const currentDate = new Date();
    const differenceInMs = eventDate.getTime() - currentDate.getTime();
    return Math.floor(differenceInMs / (1000 * 3600 * 24));
  };

  const renderTimer = (timestamp, event) => {
    const daysDiff = calculateDaysDifference(timestamp);
    const eventDate = new Date(timestamp);
    const eventDateLocal = new Date(eventDate.getTime() + eventDate.getTimezoneOffset() * 60000);
    const currentDate = new Date();
    const differenceInMs = eventDateLocal.getTime() - currentDate.getTime();

    if (daysDiff >= 2) {
      const daysLeft = daysDiff - 2;
      const hours = Math.floor((differenceInMs % (1000 * 3600 * 24)) / (1000 * 3600));
      const minutes = Math.ceil((differenceInMs % (1000 * 3600)) / (1000 * 60));
      return (
        <span className="timer">{daysLeft} days, {hours} hours, {minutes} minutes left</span>
      );
    } else if (daysDiff === 1) {
      const hours = Math.floor((differenceInMs % (1000 * 3600 * 24)) / (1000 * 3600));
      const minutes = Math.ceil((differenceInMs % (1000 * 3600)) / (1000 * 60));
      return (
        <>
          <span className="timer">{hours} hours, {minutes} minutes left</span>
          <button className="register-button" onClick={() => handleRegisterEvent(event.id)}>Register</button>
        </>
      );
    } else if (daysDiff === 0 && differenceInMs < 0) {
      return <span className="registration-message">Missed registration</span>;
    } else {
      return <span className="registration-message">Registration has closed</span>;
    }
  };

  return (
    <div className="org-events-list">
      {events.map((event) => (
        <div key={event.id} className="event-bar">
          <img src={event.thumbnail} alt="Event Thumbnail" className="event-bar-thumbnail" />
          <div className="event-bar-details">
            <span className="event-bar-name">{event.name}</span>
            {isOrgAlreadyRegistered(event) ? (
              <span className="registration-message">Already registered for the event</span>
            ) : (
              <>
                {renderTimer(event.timestamp, event)}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrgEvents;
