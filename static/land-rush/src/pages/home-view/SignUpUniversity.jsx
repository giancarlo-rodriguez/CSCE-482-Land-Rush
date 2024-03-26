import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making API requests

const SignIn = () => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [universityName, setUniversityName] = useState('');
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
    <form onSubmit={handleSubmit}>
      <h3>Sign Up University</h3>
      <div className="mb-3">
        <label>University Name: </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter University"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
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
      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClose}>
          Close
        </button>
      </div>
    </form>
  );
};

export default SignIn;
