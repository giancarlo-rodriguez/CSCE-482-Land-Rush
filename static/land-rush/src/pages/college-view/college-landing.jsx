import React from 'react';

function CollegeLanding() {
  return (
    <div className='instructions-container'>
      <div className='instructions'>
        <h1>University Home</h1>
      </div>
      <div className='instructions'>
        <h1>Land Plots</h1>
        <h2>Create and Modify Plots to use for Events.</h2>
        <ul>
          <li>Select a Plot</li>
          <ul>
            <li>Select "Create New Plot" to begin creating a new plot</li>
            <li>Alternatively, select one of the pre-existing plots from the list shown beneath the search bar to modify or view it.</li>
          </ul>
          <li>Adjusting Coordinate Points</li>
          <ul>
            <li>Click draw/modify points depending on whether you're creating or updating a plot.</li>
            <li>Left-click on the map to add a point connected to the previously placed point.</li>
            <li>Left-click on a transparent middle-point between two points to insert a new one between them.</li>
            <li>Right-click on the map to remove the last point placed from the polygon.</li>
            <li>Move points by dragging them.</li>
            <li>Move the entire plot by dragging any part of it within the highlighted plot.</li>
          </ul>
          <li>Create or Update a Plot</li>
          <ul>
            <li>Clicking Create/Update Plot will finalize the coordinates on the map and update the database.</li>
            <li>Clicking Delete Plot will erase it from the database.</li>
          </ul>
        </ul>
      </div>
      <div className='instructions'>
        <h1>Events</h1>
        <h2>Designate Event Details for your Students.</h2>
        <ul>
          <li>Create or Modify an Event</li>
          <ul>
            <li>Select "Create New Event" to begin creating a new event</li>
            <li>Select one of the pre-existing events from the list shown beneath the search bar to view it.</li>
            <li>Clicking Delete Event will erase it from the database.</li>
          </ul>
          <li>Running the plot algorithm manually.</li>
          <ul>
            <li>Our algorithm automatically fills the plot once registration ends.</li>
            <li>Select Fill Plot to run the algorithm manually with currently registered users.</li>
            <li>Select View Plot once the algorithm has completed to observe the results.</li>
          </ul>
        </ul>
      </div>
      <div className='instructions'>
        <h1>Organizations</h1>
        <h2>View and Remove Organizations within your University.</h2>
        <ul>
        <li>Kick an Organization</li>
          <ul>
            <li>Clicking Delete will erase the associated organization from the database.</li>
          </ul>
        </ul>
      </div>
    </div>
    
  );
}

export default CollegeLanding;
