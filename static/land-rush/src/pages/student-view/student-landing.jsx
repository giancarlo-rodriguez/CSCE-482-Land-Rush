import React from 'react';

function StudentLanding() {
  return (
    <div className='instructions-container'>
      <div className='instructions'>
        <h1>Student Home</h1>
      </div>
      <div className='instructions'>
        <h1>Upcoming Events</h1>
        <h2>Register for and view upcoming events with your organizations.</h2>
        <ul>
          <li>Select an Organization from the Dropdown.</li>
          <li>Click register/unreister on an event to take part with the chosen organization.</li>
          <ul>
            <li>You may unregister and re-register for any event from any organization, however you will always register under the currently selected organization.</li>
          </ul>
          <li>Click view plot to display the land allocation graphic once the algorithm has been run.</li>
          <li>Additional Notes</li>
          <ul>
            <li>You can register for events with an organization of your choosing 7 days before an event up until 2 days prior to the event.</li>
          </ul>
        </ul>
      </div>
      <div className='instructions'>
        <h1>Your Organizations</h1>
        <h2>Create or Join Orgs.</h2>
        <ul>
          <li>Select "Add Organization" to create and name a new organization with you as the administrator.</li>
          <li>Clicking Go to Organization as an Admin brings you to your organization homepage.</li>
          <li>Click Join/Leave to change membership status.</li>
          <li>Clicking Delete Org will erase it from the database.</li>
        </ul>
      </div>
    </div>
  );
}

export default StudentLanding;