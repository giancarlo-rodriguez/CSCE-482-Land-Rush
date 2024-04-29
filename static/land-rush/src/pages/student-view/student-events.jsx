import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [plotImageUrl, setPlotImageUrl] = useState('');
  const [orgs, setOrgs] = useState([]);

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
  
      const updatedEvents = response.data.map(event => {
        return { ...event, isRegistered: false };
      });
      
      console.log("Events from backend:", updatedEvents);
  
      const userAttendanceResponse = await axios.post('http://127.0.0.1:8000/which/events/member/attending', {
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
  
      console.log("User attendance response:", userAttendanceResponse.data);

      const attendedEventsIds = userAttendanceResponse.data.map(event => event.event);
      // Update the isRegistered property for the events the user is attending
      const updatedEventsWithAttendance = updatedEvents.map(event => {
        if (attendedEventsIds.includes(event.id)) {
          console.log("Event ID found in attended events:", event);
          return { ...event, isRegistered: true };
        }
        return event;
      });
  
      console.log("Updated events with attendance:", updatedEventsWithAttendance);
  
      setEvents(updatedEventsWithAttendance);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  // const fetchEvents = async (orgId) => {
  //   try {
  //     const token = Cookies.get('token');
  //     const response = await axios.get('http://127.0.0.1:8000/show/event', {
  //       headers: {
  //         Authorization: `Token ${token}`
  //       }
  //     });

  //     const updatedEvents = response.data.map(event => {
        

  //       return { ...event, isRegistered:false };
  //     });
  //     const userAttendanceResponse = await axios.post('http://127.0.0.1:8000/which/events/member/attending', {
  //     }, {
  //       headers: {
  //         Authorization: `Token ${token}`
  //       }
  //     });

  //     const attendedEventsIds = userAttendanceResponse.data.map(event => event.id);

  //     // Update the isRegistered property for the events the user is attending
  //     const updatedEventsWithAttendance = updatedEvents.map(event => {
  //       console.log("event before value", event)
  //       if (attendedEventsIds.includes(event.id)) {
  //         console.log("event changed value")
  //         return { ...event, isRegistered:true };
  //       }
  //       return event;
  //     });
  //     setEvents(updatedEventsWithAttendance);
  //     console.log("updated events from fetch:", updatedEventsWithAttendance)
  //   } catch (error) {
  //     console.error('Error fetching events:', error);
  //   }
  // };

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
    // Render timer logic
  };

  return (
    <div className="org-events-list">
      <select onChange={handleOrgChange} value={orgId || ''}>
        <option value="">Select Organization</option>
        {orgs.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>

      {events.map(event => (
        <div key={event.id} className="event-bar">
          <div className="event-bar-details">
            <span className="event-bar-name">{event.name}</span>
            {renderTimer(event.timestamp, event)}
            {event.isRegistered ? (
              <button className="unregister-button" onClick={() => handleUnregisterEvent(event.id)}>Unregister</button>
            ) : (
              <button className="register-button" onClick={() => handleRegisterEvent(event.id)}>Register</button>
            )}
            <button className="view-plot-button" onClick={() => handleEventClick(event.id)}>View Plot</button>
          </div>
        </div>
      ))}
      {plotImageUrl && <img src={plotImageUrl} alt="Filled Plot" />}
    </div>
  );
};

export default OrgEvents;