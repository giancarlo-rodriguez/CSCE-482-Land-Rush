import React from 'react';

function OrgLanding() {
  return (
    <div className='instructions-container'>
      <div className='instructions'>
        <h1>Organization Home</h1>
      </div>
      <div className='instructions'>
        <h1>Upcoming Events</h1>
        <h2>Register for and view upcoming events with your organizations.</h2>
        <ul>
          <li>Click register/unreister on an event to allow students to register for an event with your organization.</li>
          <ul>
          </ul>
          <li>Additional Notes</li>
          <ul>
            <li>You can register for events with an organization of your choosing 7 days before an event up until 2 days prior to the event.</li>
          </ul>
        </ul>
      </div>
    </div>
  );
}

export default OrgLanding;