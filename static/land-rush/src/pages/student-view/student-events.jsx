import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [isCountdownOver, setIsCountdownOver] = useState(false);

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
    const orgIdFromUrl = parseInt(pathParts[pathParts.length - 2]); // Assuming orgId is second-to-last part of the URL
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

  const renderOrgsDropdown = (orgs) => {
    if (orgs.length === 0) {
      return null; // No orgs registered, so return null
    } else {
      return (
        <select>
          {orgs.map((org, index) => (
            <option key={index} value={org.id}>{org.name}</option>
          ))}
        </select>
      );
    }
  };

  const renderCountdownOrButton = (timestamp, eventId, orgs) => {
    // Convert the timestamp to local time zone
    const eventDate = new Date(timestamp);
    const eventDateLocal = new Date(eventDate.getTime() + eventDate.getTimezoneOffset() * 60000);
    
    // Get the current local date and time
    const currentDate = new Date();
    
    // Calculate the time difference in milliseconds
    const differenceInMs = eventDateLocal.getTime() - currentDate.getTime();
    
    // Convert the time difference to days
    const differenceInDays = differenceInMs / (1000 * 3600 * 24);
    
    const daysLeft = Math.floor(differenceInDays); // Calculate the days left without decimals
    console.log(timestamp);
    console.log(eventId, daysLeft);

    if (daysLeft > 2) {
      // If more than 2 days left, render countdown
      const remainingDays = daysLeft - 2;
      const hours = Math.floor((differenceInMs / (1000 * 3600)) % 24); // Calculate hours
      const minutes = Math.floor((differenceInMs / (1000 * 60)) % 60); // Calculate minutes
      return (
        <span>{remainingDays} days, {hours} hours, {minutes} minutes left</span>
      );
    } else if (daysLeft > 1 && !isCountdownOver) {
      // If between 1 and 2 days left, set the countdown over flag
      setIsCountdownOver(true);
      return (
        <span>1 day left</span>
      );
    } else if (orgs.length === 0 && isCountdownOver) {
      // If no orgs registered and countdown is over, display "No orgs registered"
      return <span>No orgs registered</span>;
    } else {
      // If 2 days or less left and countdown is over, render the register button
      return (
        <button className="register-button" onClick={() => handleRegisterEvent(eventId)}>Register</button>
      );
    }
  };

  return (
    <div className="org-events-list">
      {events.map((event) => (
        <div key={event.id} className="event-bar">
          <img src={event.thumbnail} alt="Event Thumbnail" className="event-bar-thumbnail" />
          <div className="event-bar-details">
            <span className="event-bar-name">{event.name}</span>
            {renderOrgsDropdown(event.registered_orgs)}
          </div>
          <div className="event-bar-register">
            {renderCountdownOrButton(event.timestamp, event.id, event.registered_orgs)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrgEvents;
