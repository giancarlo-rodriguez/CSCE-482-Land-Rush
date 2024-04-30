import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [plotImageUrl, setPlotImageUrl] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState({});

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://127.0.0.1:8000/show/user/orgs', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      setOrgs(response.data);
      console.log("intial fetch:", response.data)
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };


  const handleOrgChange = (event) => {
    const selectedOrgId = parseInt(event.target.value, 10);
    setOrgId(selectedOrgId);

    // Update the isRegistered property for all events based on the selected organization
    const updatedEvents = events.map(event => {
      const isRegisteredForOrg = event.registered_orgs.some(org => org.id === selectedOrgId);
      return { ...event, isRegisteredForOrg };
    });

    setEvents(updatedEvents);
  };
  useEffect(() => {
    if (orgId !== null) {
      fetchEvents(orgId);
    }
  }, [orgId]);

  const fetchEvents = async (orgId) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get('http://127.0.0.1:8000/show/event', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
  
      const userAttendanceResponse = await axios.post('http://127.0.0.1:8000/which/events/member/attending', {
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
  
      const attendedEventsIds = userAttendanceResponse.data.map(event => event.event);
      
  
      const updatedEvents = response.data.map(event => {
        const isRegistered = attendedEventsIds.includes(event.id);
        return { ...event, isRegistered };
      });
  
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/student/register', {
        event_id: eventId,
        org_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      // Update the isRegistered property of the event
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return { ...event, isRegistered: true };
        }
        return event;
      });
      setEvents(updatedEvents);
      console.log("register for event", updatedEvents)
    } catch (error) {
      if (error)
        console.error('Error registering for event:', error);
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      const token = Cookies.get('token');
      await axios.post('http://127.0.0.1:8000/event/student/unregister', {
        event_id: eventId,
        org_id: orgId
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      // Update the isRegistered property of the event
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          return { ...event, isRegistered: false };
        }
        return event;
      });
      setEvents(updatedEvents);
      console.log("unregister:", updatedEvents)
    } catch (error) {
      console.error('Error unregistering from event:', error);
    }
  };

  const handleEventClick = async (eventId) => {
    try {
      const token = Cookies.get('token');
      const response = await axios.post('http://127.0.0.1:8000/get-filled-plot', {
        event_id: eventId
      }, {
        headers: {
          Authorization: `Token ${token}`
        },
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      setPlotImageUrl(imageUrl);
    } catch (error) {
      console.error('Error fetching plot image:', error);
    }
  };

  const renderTimer = (timestamp, event) => {
    const eventDate = new Date(timestamp);
    const currentDate = new Date();
    
    // Calculate registration opening date
    const registrationOpenDate = new Date(eventDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    // Calculate registration closing date
    const registrationCloseDate = new Date(eventDate.getTime() - (1 * 24 * 60 * 60 * 1000));
  
    const isRegistrationOpen = currentDate.getTime() >= registrationOpenDate.getTime();
    const isRegistrationClosed = currentDate.getTime() >= registrationCloseDate.getTime();
  
    const remainingTime = registrationCloseDate.getTime() - currentDate.getTime();
    const daysDiff = Math.floor(remainingTime / (1000 * 3600 * 24));
    const hoursDiff = Math.floor((remainingTime % (1000 * 3600 * 24)) / (1000 * 3600));
    const minutesDiff = Math.floor((remainingTime % (1000 * 3600)) / (1000 * 60));
    const secondsDiff = Math.floor((remainingTime % (1000 * 60)) / 1000);
  
    const handleRegisterClick = async () => {
      if (!event.isRegistered) {
        await handleRegisterEvent(event.id);
      } else {
        await handleUnregisterEvent(event.id);
      }
    };
  
    if (!isRegistrationOpen && !isRegistrationClosed) {
      return (
        <span className="timer">
          Registration Opens In: {daysDiff}:{hoursDiff}:{minutesDiff}:{secondsDiff}
        </span>
      );
    } else if (isRegistrationOpen && !isRegistrationClosed && !event.isRegistered) {
      return (
        <span className="timer">
          Registration Closes In: {daysDiff}:{hoursDiff}:{minutesDiff}:{secondsDiff}
          <button className='events-button' onClick={handleRegisterClick}>Register</button>
        </span>
      );
    } else if (isRegistrationOpen && !isRegistrationClosed && event.isRegistered) {
      return (
        <span className="timer">
          Registration Locks In: {daysDiff}:{hoursDiff}:{minutesDiff}:{secondsDiff}
          <button className='events-button' onClick={handleRegisterClick}>Unregister</button>
          <button className='events-button' onClick={() => handleEventClick(event.id)}>View Plot</button>
          {plotImageUrl && <img src={plotImageUrl} alt="Filled Plot" />}
        </span>
      );
    } else if (event.isRegistered) {
      return (
        <span className="registration-message">
          You registered successfully.
          <button className='events-button' onClick={() => handleEventClick(event.id)}>View Plot</button>
          {plotImageUrl && <img src={plotImageUrl} alt="Filled Plot" />}
        </span>
      );
    } else {
      return <span className="registration-message">You didn't register.</span>;
    }
  };
  
  

  return (
    <div className="org-events-list">
      <select className="org-dropdown" onChange={handleOrgChange} value={orgId || ''}>
        <option value="">Select Organization</option>
        {orgs.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>

      {events
        .filter(event => event.registered_orgs.some(org => org.id === orgId))
        .map(event => (
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