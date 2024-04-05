import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const SignUpUniversity = () => {
  const [universityName, setUniversityName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.post("http://127.0.0.1:8000/register/university", {
      universityName: universityName,
      email: email,
      password: password
    }).then((res) => {
      // Set token in cookies upon successful registration
      Cookies.set('token', res.data.token, { expires: 7 });
      // Redirect to dashboard or any desired page
      window.location.href = '/college';
    }).catch((err) => {
      console.error('Error signing up university:', err);
      setError('Error signing up university. Please try again.');
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>University Registration</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>University Name:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter university name"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email address:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default SignUpUniversity;
