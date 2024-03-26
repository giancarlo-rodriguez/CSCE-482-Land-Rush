import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";


const HomeSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if email and password match the expected values
    if (email === 'admin@gmail.com' && password === 'admin') {
      // Authentication successful
      console.log('Login successful');
      // Redirect to dashboard or perform any necessary action
      navigate('/org');

      // For now, let's just clear the form fields
      setEmail('');
      setPassword('');
      setError('');
    } else {
      // Authentication failed
      setError('Invalid email or password');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label>Email address:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
};

export default HomeSignIn;
