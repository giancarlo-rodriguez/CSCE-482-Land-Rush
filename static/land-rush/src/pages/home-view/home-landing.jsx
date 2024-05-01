import React from 'react';

function HomeLanding() {
  return (
    <div className='instructions-container'>
      <div className='instructions'>
        <h1>Welcome to Land Rush!</h1>
        <h4>A web-application developed by Chandler Stanchfield, Wyatt Griffin, Gian Rodriguez, Sasan Lotfi, and Justin Kline.</h4>
      </div>
      <div className='instructions'>
        <h1>Our Application</h1>
        <h3>This site demonstrates the primary use-case for our dynamic land-allocation algorithm, tailgating.</h3>
        <h3>Through the app, universities may sign up, designate land plots, and create timed events.</h3>
        <h3>Students can register with their universities and create organizations.</h3>
        <h3> Organizations and their members may register for events at certain times.</h3>
        <h3>These registration times are averaged for each organization when registration closes to create a queue, which is then sent to our algorithm to designate 
          sections of land, maximizing space efficiency using a minimum requirement of seven square feet per person; a minimum determined based on human-comfort and 
          safety analysis conducted prior to development.</h3> 
        <h3>For a more detailed breakdown of this algorithm, please visit our About Us section in the navigation bar to view our design document in full detail, which
          breaks down the full development methodology, process, and our findings.</h3>
      </div>
      <div className='instructions'>
        <h1>Getting Started</h1>
        <p>
          <strong>Students and Organization Leaders:</strong> Register as a student via the Register Student link in the top navigation bar.
        </p>
        <p>
          <strong>Universities:</strong> Register as a new college or university via the Register University link in the top navigation bar. 
        </p>
        <p>
          <strong>Existing Users:</strong> Register as a new college or university via the Register University link in the top navigation bar. 
        </p>
        <p>
        </p>
      </div>
    </div>
  );
}
  
  
export default HomeLanding;
