import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const fetchEvents = async (setEvents) => {
  try {
    const token = Cookies.get('token');
    const response = await axios.get('http://127.0.0.1:8000/show/event', {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    const updatedEvents = response.data.map(event => {
      const isRegistered = event.registered;
      return { ...event, isRegistered };
    });

    console.log(updatedEvents);
    setEvents(updatedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState({});
  const [refreshFlag, setRefreshFlag] = useState(false); // Add state variable for refresh

  useEffect(() => {
    fetchEvents(setEvents);
  }, [refreshFlag]); // Refresh events when refreshFlag changes

  const handleRegisterEvent = async (eventId, orgId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/student/register', {
        event_id: eventId,
        organization_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      console.log('Registered for event', eventId);
      setRefreshFlag(prevState => !prevState); // Toggle refresh flag
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const handleUnregisterEvent = async (eventId, orgId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/student/unregister', {
        event_id: eventId,
        organization_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      console.log('Unregistered from event', eventId);
      setRefreshFlag(prevState => !prevState); // Toggle refresh flag
    } catch (error) {
      console.error('Error unregistering from event:', error);
    }
  };

  const handleOrgSelectChange = (e, eventId) => {
    setSelectedOrgIds(prevState => ({
      ...prevState,
      [eventId]: e.target.value
    }));
  };

  const renderTimer = (timestamp, event) => {
    const eventDate = new Date(timestamp);
    eventDate.setHours(eventDate.getHours() + 5);
    const currentDate = new Date();
    const differenceInMs = eventDate.getTime() - currentDate.getTime();
    const daysDiff = Math.floor(differenceInMs / (1000 * 3600 * 24));
  
    const orgId = selectedOrgIds[event.id] || '';
    const isOrgRegistered = event.registered == orgId; // Check if registered org ID matches selected org ID
  
    const handleRegisterClick = () => {
      if (!isOrgRegistered) {
        handleRegisterEvent(event.id, orgId);
      } else {
        handleUnregisterEvent(event.id, orgId);
      }
    };
  
    if (daysDiff >= 2) {
      return (
        <span className="timer">Registration opens at: {eventDate.toLocaleString()}</span>
      );
    } else if (daysDiff >= 1 && daysDiff < 2) {
      const registrationCloseDate = new Date(eventDate.getTime() - (1 * 24 * 60 * 60 * 1000)); // Subtract 1 day in milliseconds
      return (
        <>
          <span className="timer">Registration closes at: {registrationCloseDate.toLocaleString()}</span>
          <div>
            {isOrgRegistered ? (
              <>
                <span>Registered with: {event.registered_orgs.find(org => org.id == orgId)?.name}</span>
                <button onClick={handleRegisterClick}>Unregister</button>
              </>
            ) : (
              <>
                <select value={orgId} onChange={(e) => handleOrgSelectChange(e, event.id)}>
                  <option value="">Select Organization</option>
                  {event.registered_orgs.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
                <button onClick={handleRegisterClick}>Register</button>
              </>
            )}
          </div>
        </>
      );
    } else {
      if (isOrgRegistered) {
        return (
          <>
            <span className="registration-message">Registered with: {event.registered_orgs.find(org => org.id == orgId)?.name}</span>
            <button onClick={handleRegisterClick}>Unregister</button>
          </>
        );
      } else {
        return <span className="registration-message">You didn't register</span>;
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
