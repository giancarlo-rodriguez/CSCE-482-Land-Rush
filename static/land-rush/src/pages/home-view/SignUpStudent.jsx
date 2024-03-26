import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making API requests

const SignIn = () => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Fetch data from API when component mounts
    axios.get('your_api_endpoint')
      .then(response => {
        // Assuming the response data is an array of options
        setOptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching options:', error);
      });
  }, []); // Empty dependency array ensures effect only runs once on mount

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can handle form submission here
  };

  const handleClose = () => {
    // Navigate to home page ("/")
    window.location.href = '/';
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Sign Up Student: </h3>
        <div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Last Name: </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Email address: </label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Password: </label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {/* Dropdown for options fetched from API */}
        <div className="mb-3">
          <label>Select University: </label>
          <select
            className="form-control"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="">Select a university</option>
            {options.map(option => (
              <option key={option.id} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Sign Up
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
